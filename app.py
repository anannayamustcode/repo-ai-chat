import os
import uuid
import zipfile
import logging
import json
import time
from pathlib import Path
from datetime import datetime, timedelta
from functools import wraps

from flask import Flask, request, jsonify
from flask_cors import CORS
import chromadb
from chromadb.config import Settings
from dotenv import load_dotenv
import requests

# Load environment variables
load_dotenv()

# Configuration
UPLOAD_DIR = "uploads"
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
ALLOWED_EXTENSIONS = {".js", ".jsx", ".ts", ".tsx", ".py", ".html", ".css", ".json"}
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Flask App with CORS
app = Flask(__name__)
CORS(app, resources={
    r"/*": {"origins": ["http://localhost:3000"]}
})

# ChromaDB Setup
chroma_client = chromadb.PersistentClient(path="chroma_db")
collection = chroma_client.get_or_create_collection(
    name="code_chunks",
    metadata={"hnsw:space": "cosine"}
)

# Rate limiting storage
request_times = {}

def rate_limit(max_per_minute):
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            ip = request.remote_addr
            now = datetime.now()
            
            # Initialize if first request
            if ip not in request_times:
                request_times[ip] = []
            
            # Remove old requests
            request_times[ip] = [
                t for t in request_times[ip] 
                if now - t < timedelta(minutes=1)
            ]
            
            # Check limit
            if len(request_times[ip]) >= max_per_minute:
                return jsonify({"error": "Rate limit exceeded"}), 429
                
            request_times[ip].append(now)
            return f(*args, **kwargs)
        return wrapped
    return decorator

def get_embedding(text: str) -> list:
    """Get text embedding with error handling"""
    if not text.strip():
        return [0.0] * 768
        
    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/embeddings",
            headers={
                "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:5000",
                "X-Title": "Code Analyzer"
            },
            json={
                "model": "mistralai/mistral-embed",
                "input": text
            },
            timeout=30
        )
        response.raise_for_status()
        return response.json()["data"][0]["embedding"]
    except Exception as e:
        logger.error(f"Embedding error: {str(e)}")
        raise
    
def chunk_code(content: str, chunk_size: int = 800) -> list[str]:
    """Split code into chunks with line awareness"""
    lines = content.split('\n')
    chunks = []
    current_chunk = []
    current_length = 0

    for line in lines:
        line_length = len(line) + 1  # +1 for newline
        if current_length + line_length > chunk_size and current_chunk:
            chunks.append('\n'.join(current_chunk))
            current_chunk = []
            current_length = 0
        current_chunk.append(line)
        current_length += line_length

    if current_chunk:
        chunks.append('\n'.join(current_chunk))
    return chunks


def process_repo(repo_path: str, session_id: str):
    """Process files with better error handling"""
    chunks_processed = 0
    for root, dirs, files in os.walk(repo_path):
        # Skip unwanted directories
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        
        for filename in files:
            filepath = Path(root) / filename
            if filepath.suffix.lower() not in ALLOWED_EXTENSIONS:
                continue

            try:
                # Skip large files
                if os.path.getsize(filepath) > 1 * 1024 * 1024:
                    continue

                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                    chunks = chunk_code(content)
                    
                    for idx, chunk in enumerate(chunks):
                        try:
                            embed = get_embedding(chunk)
                            collection.add(
                                documents=[chunk],
                                embeddings=[embed],
                                metadatas=[{
                                    "file": filename,
                                    "path": str(filepath.relative_to(repo_path)),
                                    "chunk_index": idx,
                                    "session_id": session_id
                                }],
                                ids=[f"{session_id}_{idx}"]
                            )
                            chunks_processed += 1
                            time.sleep(0.2)  # Rate limit
                        except Exception as e:
                            logger.error(f"Chunk error: {str(e)}")
                            continue
            except Exception as e:
                logger.error(f"File error: {str(e)}")
                continue
    return chunks_processed

@app.route('/upload', methods=['POST'])
@rate_limit(max_per_minute=10)
def upload_repo():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
        
    file = request.files['file']
    if not file or file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    if not file.filename.endswith('.zip'):
        return jsonify({"error": "Only ZIP files allowed"}), 400

    try:
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        if file_size > MAX_FILE_SIZE:
            return jsonify({"error": "File too large"}), 413

        session_id = str(uuid.uuid4())
        repo_path = os.path.join(UPLOAD_DIR, session_id)
        os.makedirs(repo_path, exist_ok=True)
        
        with zipfile.ZipFile(file, 'r') as zip_ref:
            zip_ref.extractall(repo_path)
        
        chunks = process_repo(repo_path, session_id)
        return jsonify({
            "message": "Upload processed",
            "session_id": session_id,
            "chunks_processed": chunks
        })
    except Exception as e:
        logger.error(f"Upload failed: {str(e)}")
        return jsonify({"error": "Upload failed"}), 500

@app.route('/ask', methods=['POST'])
@rate_limit(max_per_minute=20)
def ask_question():
    data = request.get_json()
    if not data or 'question' not in data:
        return jsonify({"error": "No question provided"}), 400
        
    try:
        question = data['question'].strip()
        if not question:
            return jsonify({"error": "Empty question"}), 400
            
        question_embed = get_embedding(question)
        results = collection.query(
            query_embeddings=[question_embed],
            n_results=5,
            include=["documents", "metadatas"]
        )
        
        if not results['documents']:
            return jsonify({"error": "No relevant code found"}), 404
            
        context = "\n\n".join([
            f"From {meta['path']}:\n{text}"
            for text, meta in zip(results['documents'][0], results['metadatas'][0])
        ])
        
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
                "Content-Type": "application/json"
            },
            json={
                "model": "openai/gpt-3.5-turbo",
                "messages": [{
                    "role": "user",
                    "content": f"Answer this about the codebase:\n{question}\n\nCode Context:\n{context}"
                }],
                "temperature": 0.3
            }
        )
        response.raise_for_status()
        answer = response.json()["choices"][0]["message"]["content"]
        return jsonify({"answer": answer})
    except Exception as e:
        logger.error(f"Question failed: {str(e)}")
        return jsonify({"error": "Question processing failed"}), 500

@app.route('/summary', methods=['GET'])
@rate_limit(max_per_minute=15)
def get_summary():
    try:
        results = collection.get(limit=20)
        if not results['documents']:
            return jsonify({"error": "No code available"}), 404
            
        context = "\n".join(results['documents'][:5])  # Use first 5 chunks
        
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
                "Content-Type": "application/json"
            },
            json={
                "model": "openai/gpt-3.5-turbo",
                "messages": [{
                    "role": "user",
                    "content": f"Summarize this code:\n{context}\nRespond in JSON with: projectName, technologies, codeQuality, architecture"
                }],
                "response_format": {"type": "json_object"}
            }
        )
        response.raise_for_status()
        return jsonify(response.json()["choices"][0]["message"]["content"])
    except Exception as e:
        logger.error(f"Summary failed: {str(e)}")
        return jsonify({"error": "Summary failed"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
    
    # import os
# import uuid
# import zipfile
# import logging
# import json
# import time
# from pathlib import Path
# from datetime import datetime
# from functools import wraps

# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import chromadb
# from chromadb.config import Settings
# from dotenv import load_dotenv
# import requests

# # Configuration
# load_dotenv()
# UPLOAD_DIR = "uploads"
# MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
# ALLOWED_EXTENSIONS = {".js", ".jsx", ".ts", ".tsx", ".py", ".html", ".css", ".json"}
# os.makedirs(UPLOAD_DIR, exist_ok=True)

# # Logging
# logging.basicConfig(
#     level=logging.INFO,
#     format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
# )
# logger = logging.getLogger(__name__)

# # Flask App
# app = Flask(__name__)
# CORS(app)

# # ChromaDB Setup with persistence
# chroma_client = chromadb.PersistentClient(path="chroma_db")
# collection = chroma_client.get_or_create_collection(
#     name="code_chunks",
#     metadata={"hnsw:space": "cosine"}
# )

# # Rate limiting decorator
# def rate_limit(max_per_minute):
#     def decorator(f):
#         requests = []
        
#         @wraps(f)
#         def wrapped(*args, **kwargs):
#             now = datetime.now()
#             requests.append(now)
#             requests[:] = [req for req in requests if (now - req).seconds < 60]
            
#             if len(requests) > max_per_minute:
#                 return jsonify({"error": "Rate limit exceeded"}), 429
#             return f(*args, **kwargs)
#         return wrapped
#     return decorator

# # Helper Functions
# def get_embedding(text: str) -> list:
#     """Get text embedding from OpenRouter"""
#     if not text.strip():
#         return [0.0] * 768  # Return empty embedding for empty text
    
#     try:
#         response = requests.post(
#             "https://openrouter.ai/api/v1/embeddings",
#             headers={
#                 "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
#                 "Content-Type": "application/json",
#                 "HTTP-Referer": "http://localhost:5000",  # Required by OpenRouter
#                 "X-Title": "Code Analyzer"  # Required by OpenRouter
#             },
#             json={
#                 "model": "mistralai/mistral-embed",  # OpenRouter's embedding model
#                 "input": text
#             },
#             timeout=30
#         )
#         response.raise_for_status()
#         return response.json()["data"][0]["embedding"]
#     except Exception as e:
#         logger.error(f"Embedding error: {str(e)}")
#         raise RuntimeError(f"Failed to get embedding: {str(e)}")

# def chunk_code(content: str, chunk_size: int = 800) -> list[str]:
#     """Split code into chunks with line awareness"""
#     lines = content.split('\n')
#     chunks = []
#     current_chunk = []
#     current_length = 0

#     for line in lines:
#         line_length = len(line) + 1  # +1 for newline
#         if current_length + line_length > chunk_size and current_chunk:
#             chunks.append('\n'.join(current_chunk))
#             current_chunk = []
#             current_length = 0
#         current_chunk.append(line)
#         current_length += line_length

#     if current_chunk:
#         chunks.append('\n'.join(current_chunk))
#     return chunks

# def process_repo(repo_path: str, session_id: str):
#     """Process all code files in the repository, skipping node_modules and large files"""
#     chunks_processed = 0
#     for root, dirs, files in os.walk(repo_path):
#         # Skip node_modules and other common dependency directories
#         if 'node_modules' in dirs:
#             dirs.remove('node_modules')
#         if 'venv' in dirs:
#             dirs.remove('venv')
#         if '.git' in dirs:
#             dirs.remove('.git')

#         for filename in files:
#             filepath = Path(root) / filename
#             if filepath.suffix.lower() not in ALLOWED_EXTENSIONS:
#                 continue

#             try:
#                 # Skip large files (>1MB)
#                 if os.path.getsize(filepath) > 1 * 1024 * 1024:
#                     logger.info(f"Skipping large file: {filepath}")
#                     continue

#                 with open(filepath, 'r', encoding='utf-8') as f:
#                     content = f.read()
#                     chunks = chunk_code(content)
                    
#                     for idx, chunk in enumerate(chunks):
#                         chunk_id = f"{session_id}_{filepath.name}_{idx}"
#                         try:
#                             embed = get_embedding(chunk)
#                             time.sleep(0.2)  # Rate limiting
#                             collection.add(
#                                 documents=[chunk],
#                                 embeddings=[embed],
#                                 metadatas=[{
#                                     "file": filename,
#                                     "path": str(filepath.relative_to(repo_path)),
#                                     "chunk_index": idx,
#                                     "session_id": session_id
#                                 }],
#                                 ids=[chunk_id]
#                             )
#                             chunks_processed += 1
#                         except Exception as e:
#                             logger.error(f"Failed to process chunk {idx} of {filepath}: {str(e)}")
#                             continue
#             except Exception as e:
#                 logger.error(f"Error processing {filepath}: {str(e)}")
#                 continue
#     return chunks_processed

# # API Endpoints
# @app.route('/upload', methods=['POST'])
# @rate_limit(max_per_minute=5)
# def upload_repo():
#     """Handle repository upload and processing"""
#     if 'file' not in request.files:
#         return jsonify({"error": "No file provided"}), 400
    
#     file = request.files['file']
#     if file.filename == '':
#         return jsonify({"error": "No selected file"}), 400
    
#     if not file.filename.endswith('.zip'):
#         return jsonify({"error": "Only ZIP files allowed"}), 400
    
#     # Check file size
#     file.seek(0, os.SEEK_END)
#     file_size = file.tell()
#     file.seek(0)
#     if file_size > MAX_FILE_SIZE:
#         return jsonify({"error": "File too large"}), 413
    
#     session_id = str(uuid.uuid4())
#     repo_path = os.path.join(UPLOAD_DIR, session_id)
#     os.makedirs(repo_path, exist_ok=True)
    
#     try:
#         with zipfile.ZipFile(file, 'r') as zip_ref:
#             zip_ref.extractall(repo_path)
        
#         chunks_processed = process_repo(repo_path, session_id)
#         return jsonify({
#             "message": "Upload processed successfully",
#             "session_id": session_id,
#             "chunks_processed": chunks_processed
#         })
#     except Exception as e:
#         logger.error(f"Upload error: {str(e)}")
#         return jsonify({"error": str(e)}), 500
#     finally:
#         file.close()

# @app.route('/ask', methods=['POST'])
# @rate_limit(max_per_minute=10)
# def ask_question():
#     """Answer questions about the codebase"""
#     data = request.get_json()
#     if not data or 'question' not in data:
#         return jsonify({"error": "No question provided"}), 400
    
#     try:
#         question = data['question'].strip()
#         if not question:
#             return jsonify({"error": "Question cannot be empty"}), 400
            
#         question_embed = get_embedding(question)
        
#         # Get relevant code chunks
#         results = collection.query(
#             query_embeddings=[question_embed],
#             n_results=5,
#             include=["documents", "metadatas"]
#         )
        
#         if not results['documents'] or not results['metadatas']:
#             return jsonify({"error": "No relevant code found"}), 404
        
#         # Format context
#         context = "\n\n---\n\n".join([
#             f"File: {meta['path']}\n{text}"
#             for text, meta in zip(results['documents'][0], results['metadatas'][0])
#         ])
        
#         prompt = f'''You are an expert software engineer analyzing a codebase. Answer the question below using ONLY the provided code context.

# Question: {question}

# Code Context:
# {context}

# Provide a detailed technical answer. If you don't know, say "I couldn't find relevant code to answer this."'''
        
#         # Get answer from LLM
#         response = requests.post(
#             "https://openrouter.ai/api/v1/chat/completions",
#             headers={
#                 "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
#                 "Content-Type": "application/json",
#                 "HTTP-Referer": "http://localhost:5000",
#                 "X-Title": "Code Analyzer"
#             },
#             json={
#                 "model": "openai/gpt-3.5-turbo",
#                 "messages": [{"role": "user", "content": prompt}],
#                 "temperature": 0.3,
#                 "max_tokens": 1000
#             },
#             timeout=60
#         )
#         response.raise_for_status()
        
#         answer = response.json()["choices"][0]["message"]["content"]
#         return jsonify({"answer": answer})
#     except Exception as e:
#         logger.error(f"Question error: {str(e)}")
#         return jsonify({"error": "Failed to process question"}), 500

# @app.route('/summary', methods=['GET'])
# @rate_limit(max_per_minute=3)
# def get_summary():
#     """Generate codebase summary"""
#     try:
#         # Get all documents (with limit)
#         results = collection.get(limit=20)
        
#         if not results['documents']:
#             return jsonify({"error": "No code available for analysis"}), 404
            
#         context = "\n".join(results['documents'])
        
#         prompt = f'''Analyze this codebase and provide a JSON response with:
# 1. projectName (string)
# 2. technologies (array of strings)
# 3. codeQuality (number 1-10)
# 4. architecture (string)
# 5. components (array of strings)

# Code Samples:
# {context}

# Respond ONLY with valid JSON matching this structure:
# {{
#   "projectName": string,
#   "technologies": string[],
#   "codeQuality": number,
#   "architecture": string,
#   "components": string[]
# }}'''
        
#         response = requests.post(
#             "https://openrouter.ai/api/v1/chat/completions",
#             headers={
#                 "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
#                 "Content-Type": "application/json",
#                 "HTTP-Referer": "http://localhost:5000",
#                 "X-Title": "Code Analyzer"
#             },
#             json={
#                 "model": "openai/gpt-3.5-turbo",
#                 "messages": [{"role": "user", "content": prompt}],
#                 "response_format": {"type": "json_object"},
#                 "temperature": 0.2
#             },
#             timeout=60
#         )
#         response.raise_for_status()
        
#         summary = response.json()["choices"][0]["message"]["content"]
#         return jsonify(json.loads(summary))
#     except Exception as e:
#         logger.error(f"Summary error: {str(e)}")
#         return jsonify({"error": "Failed to generate summary"}), 500

# @app.route('/status', methods=['GET'])
# def status():
#     """Health check endpoint"""
#     return jsonify({"status": "ok", "message": "Code analyzer is running"})

# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=5000, debug=True)
    
    
# # import os
# # import uuid
# # import zipfile
# # import logging
# # from pathlib import Path
# # from datetime import datetime
# # from functools import wraps

# # from flask import Flask, request, jsonify
# # from flask_cors import CORS
# # import chromadb
# # from chromadb.config import Settings
# # from dotenv import load_dotenv
# # import requests

# # # Configuration
# # load_dotenv()
# # UPLOAD_DIR = "uploads"
# # MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
# # ALLOWED_EXTENSIONS = {".js", ".jsx", ".ts", ".tsx", ".py", ".html", ".css", ".json"}
# # os.makedirs(UPLOAD_DIR, exist_ok=True)

# # # Logging
# # logging.basicConfig(
# #     level=logging.INFO,
# #     format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
# # )
# # logger = logging.getLogger(__name__)

# # # Flask App
# # app = Flask(__name__)
# # CORS(app)


# # # ChromaDB Setup with persistence
# # chroma_client = chromadb.PersistentClient(path="chroma_db")
# # collection = chroma_client.get_or_create_collection(
# #     name="code_chunks",
# #     metadata={"hnsw:space": "cosine"}  # Use cosine similarity
# # )


# # # chroma_client = chromadb.Client(Settings(
# # #     chroma_db_impl="duckdb+parquet",
# # #     persist_directory="chroma_db"
# # # ))
# # # collection = chroma_client.get_or_create_collection(
# # #     name="code_chunks",
# # #     embedding_function=None  # We'll use our own
# # # )

# # # Rate limiting decorator
# # def rate_limit(max_per_minute):
# #     def decorator(f):
# #         requests = []
        
# #         @wraps(f)
# #         def wrapped(*args, **kwargs):
# #             now = datetime.now()
# #             requests.append(now)
# #             requests[:] = [req for req in requests if (now - req).seconds < 60]
            
# #             if len(requests) > max_per_minute:
# #                 return jsonify({"error": "Rate limit exceeded"}), 429
# #             return f(*args, **kwargs)
# #         return wrapped
# #     return decorator

# # # Helper Functions
# # def get_embedding(text: str) -> list:
# #     """Get text embedding from OpenRouter"""
# #     if not text.strip():
# #         return [0.0] * 768  # Return empty embedding for empty text
    
# #     try:
# #         response = requests.post(
# #             "https://openrouter.ai/api/v1/embeddings",
# #             headers={
# #                 "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
# #                 "Content-Type": "application/json"
# #             },
# #             json={
# #                 "model": "text-embedding-ada-002",
# #                 "input": text
# #             },
# #             timeout=30
# #         )
# #         response.raise_for_status()
# #         return response.json()["data"][0]["embedding"]
# #     except Exception as e:
# #         logger.error(f"Embedding error: {str(e)}")
# #         raise RuntimeError(f"Failed to get embedding: {str(e)}")
    
    
    
# # def chunk_code(content: str, chunk_size: int = 800) -> list[str]:
# #     """Split code into chunks with line awareness"""
# #     lines = content.split('\n')
# #     chunks = []
# #     current_chunk = []
# #     current_length = 0

# #     for line in lines:
# #         line_length = len(line) + 1  # +1 for newline
# #         if current_length + line_length > chunk_size and current_chunk:
# #             chunks.append('\n'.join(current_chunk))
# #             current_chunk = []
# #             current_length = 0
# #         current_chunk.append(line)
# #         current_length += line_length

# #     if current_chunk:
# #         chunks.append('\n'.join(current_chunk))
# #     return chunks

# # def process_repo(repo_path: str, session_id: str):
# #     """Process all code files in the repository"""
# #     chunks_processed = 0
# #     for root, _, files in os.walk(repo_path):
# #         for filename in files:
# #             filepath = Path(root) / filename
# #             if filepath.suffix.lower() not in ALLOWED_EXTENSIONS:
# #                 continue

# #             try:
# #                 with open(filepath, 'r', encoding='utf-8') as f:
# #                     content = f.read()
# #                     chunks = chunk_code(content)
                    
# #                     for idx, chunk in enumerate(chunks):
# #                         chunk_id = f"{session_id}_{filepath.name}_{idx}"
# #                         embed = get_embedding(chunk)
# #                         collection.add(
# #                             documents=[chunk],
# #                             embeddings=[embed],
# #                             metadatas=[{
# #                                 "file": filename,
# #                                 "path": str(filepath.relative_to(repo_path)),
# #                                 "chunk_index": idx,
# #                                 "session_id": session_id
# #                             }],
# #                             ids=[chunk_id]
# #                         )
# #                     chunks_processed += len(chunks)
# #             except Exception as e:
# #                 logger.error(f"Error processing {filepath}: {str(e)}")
# #                 continue
# #     return chunks_processed

# # # API Endpoints
# # @app.route('/upload', methods=['POST'])
# # @rate_limit(max_per_minute=5)
# # def upload_repo():
# #     """Handle repository upload and processing"""
# #     if 'file' not in request.files:
# #         return jsonify({"error": "No file provided"}), 400
    
# #     file = request.files['file']
# #     if file.filename == '':
# #         return jsonify({"error": "No selected file"}), 400
    
# #     if not file.filename.endswith('.zip'):
# #         return jsonify({"error": "Only ZIP files allowed"}), 400
    
# #     # Check file size
# #     file.seek(0, os.SEEK_END)
# #     file_size = file.tell()
# #     file.seek(0)
# #     if file_size > MAX_FILE_SIZE:
# #         return jsonify({"error": "File too large"}), 413
    
# #     session_id = str(uuid.uuid4())
# #     repo_path = os.path.join(UPLOAD_DIR, session_id)
# #     os.makedirs(repo_path, exist_ok=True)
    
# #     try:
# #         with zipfile.ZipFile(file, 'r') as zip_ref:
# #             zip_ref.extractall(repo_path)
        
# #         chunks_processed = process_repo(repo_path, session_id)
# #         return jsonify({
# #             "message": "Upload processed successfully",
# #             "session_id": session_id,
# #             "chunks_processed": chunks_processed
# #         })
# #     except Exception as e:
# #         logger.error(f"Upload error: {str(e)}")
# #         return jsonify({"error": str(e)}), 500
# #     finally:
# #         file.close()

# # # @app.route('/ask', methods=['POST'])
# # # @rate_limit(max_per_minute=10)
# # # def ask_question():
# # #     """Answer questions about the codebase"""
# # #     data = request.get_json()
# # #     if not data or 'question' not in data:
# # #         return jsonify({"error": "No question provided"}), 400
    
# # #     try:
# # #         question = data['question']
# # #         question_embed = get_embedding(question)
        
# # #         results = collection.query(
# # #             query_embeddings=[question_embed],
# # #             n_results=5,
# # #             include=["documents", "metadatas"]
# # #         )
        
# # #         context = "\n\n---\n\n".join([
# # #             f"File: {meta['path']}\n{text}"
# # #             for text, meta in zip(results['documents'][0], results['metadatas'][0])
# # #         ])
        
# # #         prompt = f"""You are an expert software engineer. Answer this question:
        
# # #         Question: {question}
        
# # #         Code Context:
# # #         {context}
        
# # #         Provide a detailed technical answer:"""
        
# # #         response = requests.post(
# # #             "https://openrouter.ai/api/v1/chat/completions",
# # #             headers={"Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}"},
# # #             json={
# # #                 "model": "mistralai/mistral-7b-instruct",
# # #                 "messages": [{"role": "user", "content": prompt}],
# # #                 "max_tokens": 1000
# # #             },
# # #             timeout=60
# # #         )
# # #         response.raise_for_status()
        
# # #         answer = response.json()["choices"][0]["message"]["content"]
# # #         return jsonify({"answer": answer})
# # #     except Exception as e:
# # #         logger.error(f"Question error: {str(e)}")
# # #         return jsonify({"error": str(e)}), 500
# # @app.route('/ask', methods=['POST'])
# # @rate_limit(max_per_minute=10)
# # def ask_question():
# #     """Answer questions about the codebase"""
# #     data = request.get_json()
# #     if not data or 'question' not in data:
# #         return jsonify({"error": "No question provided"}), 400
    
# #     try:
# #         question = data['question'].strip()
# #         if not question:
# #             return jsonify({"error": "Question cannot be empty"}), 400
            
# #         question_embed = get_embedding(question)
        
# #         # Get relevant code chunks
# #         results = collection.query(
# #             query_embeddings=[question_embed],
# #             n_results=5,
# #             include=["documents", "metadatas"]
# #         )
        
# #         if not results['documents'] or not results['metadatas']:
# #             return jsonify({"error": "No relevant code found"}), 404
        
# #         # Format context
# #         context = "\n\n---\n\n".join([
# #             f"File: {meta['path']}\n{text}"
# #             for text, meta in zip(results['documents'][0], results['metadatas'][0])
# #         ])
        
# #         prompt = f"""You are an expert software engineer analyzing a codebase. Answer the question below using ONLY the provided code context.

# # Question: {question}

# # Code Context:
# # {context}

# # Provide a detailed technical answer. If you don't know, say "I couldn't find relevant code to answer this.""""
        
# #         # Get answer from LLM
# #         response = requests.post(
# #             "https://openrouter.ai/api/v1/chat/completions",
# #             headers={
# #                 "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
# #                 "Content-Type": "application/json"
# #             },
# #             json={
# #                 "model": "openai/gpt-3.5-turbo",  # More reliable than Mistral for this
# #                 "messages": [{"role": "user", "content": prompt}],
# #                 "temperature": 0.3,
# #                 "max_tokens": 1000
# #             },
# #             timeout=60
# #         )
# #         response.raise_for_status()
        
# #         answer = response.json()["choices"][0]["message"]["content"]
# #         return jsonify({"answer": answer})
# #     except Exception as e:
# #         logger.error(f"Question error: {str(e)}")
# #         return jsonify({"error": "Failed to process question"}), 500
        
        
        
# # # @app.route('/summary', methods=['GET'])
# # # @rate_limit(max_per_minute=3)
# # # def get_summary():
# # #     """Generate codebase summary"""
# # #     try:
# # #         results = collection.get(include=["documents"])
# # #         context = "\n".join(results['documents'][:20])  # First 20 chunks
        
# # #         prompt = f"""Analyze this codebase and provide:
# # #         1. Project name
# # #         2. Main technologies used
# # #         3. Code quality assessment (1-10)
# # #         4. Architecture overview
# # #         5. Key components
        
# # #         Code Samples:
# # #         {context}
        
# # #         Respond in JSON format with these keys:
# # #         projectName, technologies, codeQuality, architecture, components"""
        
# # #         response = requests.post(
# # #             "https://openrouter.ai/api/v1/chat/completions",
# # #             headers={"Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}"},
# # #             json={
# # #                 "model": "mistralai/mistral-7b-instruct",
# # #                 "messages": [{"role": "user", "content": prompt}],
# # #                 "response_format": {"type": "json_object"}
# # #             },
# # #             timeout=60
# # #         )
# # #         response.raise_for_status()
        
# # #         summary = response.json()["choices"][0]["message"]["content"]
# # #         return jsonify(summary)
# # #     except Exception as e:
# # #         logger.error(f"Summary error: {str(e)}")
# # #         return jsonify({"error": str(e)}), 500
# # @app.route('/summary', methods=['GET'])
# # @rate_limit(max_per_minute=3)
# # def get_summary():
# #     """Generate codebase summary"""
# #     try:
# #         # Get all documents (with limit)
# #         results = collection.get(limit=20)
        
# #         if not results['documents']:
# #             return jsonify({"error": "No code available for analysis"}), 404
            
# #         context = "\n".join(results['documents'])
        
# #         prompt = f"""Analyze this codebase and provide a JSON response with:
# # 1. projectName (string)
# # 2. technologies (array of strings)
# # 3. codeQuality (number 1-10)
# # 4. architecture (string)
# # 5. components (array of strings)

# # Code Samples:
# # {context}

# # Respond ONLY with valid JSON matching this structure:
# # {{
# #   "projectName": string,
# #   "technologies": string[],
# #   "codeQuality": number,
# #   "architecture": string,
# #   "components": string[]
# # }}"""
        
# #         response = requests.post(
# #             "https://openrouter.ai/api/v1/chat/completions",
# #             headers={
# #                 "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
# #                 "Content-Type": "application/json"
# #             },
# #             json={
# #                 "model": "openai/gpt-3.5-turbo",
# #                 "messages": [{"role": "user", "content": prompt}],
# #                 "response_format": {"type": "json_object"},
# #                 "temperature": 0.2
# #             },
# #             timeout=60
# #         )
# #         response.raise_for_status()
        
# #         summary = response.json()["choices"][0]["message"]["content"]
# #         return jsonify(json.loads(summary))  # Parse to ensure valid JSON
# #     except Exception as e:
# #         logger.error(f"Summary error: {str(e)}")
# #         return jsonify({"error": "Failed to generate summary"}), 500
    
# # @app.route('/cleanup', methods=['POST'])
# # def cleanup():
# #     """Cleanup old uploads (admin endpoint)"""
# #     # Implementation omitted for brevity
# #     return jsonify({"message": "Cleanup complete"})

# # if __name__ == '__main__':
# #     app.run(host='0.0.0.0', port=5000, debug=True)
    
# #     # from flask import Flask, request, jsonify
# # # from flask_cors import CORS
# # # import zipfile, os, uuid, shutil
# # # import chromadb
# # # from chromadb.utils import embedding_functions
# # # from dotenv import load_dotenv
# # # import requests

# # # load_dotenv()

# # # app = Flask(__name__)
# # # CORS(app)

# # # UPLOAD_DIR = "uploads"
# # # if not os.path.exists(UPLOAD_DIR):
# # #     os.makedirs(UPLOAD_DIR)

# # # # Initialize ChromaDB
# # # chroma_client = chromadb.Client()
# # # collection = chroma_client.create_collection(name="code_chunks")

# # # # Embedding function (OpenRouter or fallback)
# # # def get_embedding(text):
# # #     response = requests.post(
# # #         "https://openrouter.ai/api/v1/embeddings",
# # #         headers={"Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}"},
# # #         json={
# # #             "model": "mistral-embed",
# # #             "input": text
# # #         }
# # #     )
# # #     return response.json()["data"][0]["embedding"]

# # # # Code file extensions to scan
# # # CODE_EXTENSIONS = [".js", ".jsx", ".ts", ".tsx", ".py", ".html", ".css", ".json"]

# # # # Chunking logic
# # # def chunk_code(content, chunk_size=800):
# # #     lines = content.split("\n")
# # #     chunks = []
# # #     for i in range(0, len(lines), chunk_size):
# # #         chunk = "\n".join(lines[i:i+chunk_size])
# # #         chunks.append(chunk)
# # #     return chunks

# # # @app.route("/upload", methods=["POST"])
# # # def upload_repo():
# # #     if "file" not in request.files:
# # #         return jsonify({"error": "No file provided"}), 400

# # #     file = request.files["file"]
# # #     file_id = str(uuid.uuid4())
# # #     repo_path = os.path.join(UPLOAD_DIR, file_id)

# # #     os.makedirs(repo_path, exist_ok=True)

# # #     with zipfile.ZipFile(file, "r") as zip_ref:
# # #         zip_ref.extractall(repo_path)

# # #     all_chunks = []

# # #     for root, _, files in os.walk(repo_path):
# # #         for fname in files:
# # #             if any(fname.endswith(ext) for ext in CODE_EXTENSIONS):
# # #                 full_path = os.path.join(root, fname)
# # #                 try:
# # #                     with open(full_path, "r", encoding="utf-8") as f:
# # #                         content = f.read()
# # #                         chunks = chunk_code(content)
# # #                         for idx, chunk in enumerate(chunks):
# # #                             chunk_id = str(uuid.uuid4())
# # #                             metadata = {
# # #                                 "file": fname,
# # #                                 "path": os.path.relpath(full_path, repo_path),
# # #                                 "chunk_index": idx,
# # #                             }
# # #                             embed = get_embedding(chunk)
# # #                             collection.add(
# # #                                 documents=[chunk],
# # #                                 embeddings=[embed],
# # #                                 metadatas=[metadata],
# # #                                 ids=[chunk_id]
# # #                             )
# # #                             all_chunks.append(chunk)
# # #                 except Exception as e:
# # #                     print(f"Skipped {full_path} due to error: {e}")

# # #     return jsonify({"message": f"Uploaded and processed {len(all_chunks)} chunks"}), 200

# # # @app.route("/ask", methods=["POST"])
# # # def ask_question():
# # #     data = request.get_json()
# # #     question = data.get("question")

# # #     question_embed = get_embedding(question)

# # #     results = collection.query(
# # #         query_embeddings=[question_embed],
# # #         n_results=5
# # #     )

# # #     relevant_chunks = results["documents"][0]
# # #     context = "\n\n---\n\n".join(relevant_chunks)

# # #     prompt = f"""You are an expert software engineer. Answer the following question using the code context below.

# # #     Question: {question}

# # #     Context:
# # #     {context}

# # #     Give a clear, technical answer:"""

# # #     response = requests.post(
# # #         "https://openrouter.ai/api/v1/chat/completions",
# # #         headers={"Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}"},
# # #         json={
# # #             "model": "mistral:instruct",
# # #             "messages": [
# # #                 {"role": "user", "content": prompt}
# # #             ]
# # #         }
# # #     )

# # #     answer = response.json()["choices"][0]["message"]["content"]
# # #     return jsonify({"answer": answer})

# # # @app.route("/summary", methods=["GET"])
# # # def summarize():
# # #     chunks = collection.get()["documents"]
# # #     context = "\n\n".join(chunks[:20])  # Use top 20 chunks max

# # #     prompt = f"""You are a code reviewer. Summarize the codebase, list key technologies used, and rate code quality.

# # #     Codebase:
# # #     {context}
# # #     """

# # #     response = requests.post(
# # #         "https://openrouter.ai/api/v1/chat/completions",
# # #         headers={"Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}"},
# # #         json={
# # #             "model": "mistral:instruct",
# # #             "messages": [{"role": "user", "content": prompt}]
# # #         }
# # #     )

# # #     summary = response.json()["choices"][0]["message"]["content"]
# # #     return jsonify({"summary": summary})

# # # if __name__ == "__main__":
# # #     app.run(debug=True)


# # # # from flask import Flask, request, jsonify
# # # # from flask_cors import CORS
# # # # import os, zipfile, uuid, shutil
# # # # import chromadb
# # # # from chromadb.config import Settings
# # # # from openai import OpenAI
# # # # import requests
# # # # import mimetypes

# # # # UPLOAD_FOLDER = "uploads"
# # # # CHUNK_FOLDER = "chunks"

# # # # # 🔧 Setup app
# # # # app = Flask(__name__)
# # # # CORS(app)
# # # # os.makedirs(UPLOAD_FOLDER, exist_ok=True)
# # # # os.makedirs(CHUNK_FOLDER, exist_ok=True)

# # # # # 🔗 Setup ChromaDB
# # # # client = chromadb.Client(Settings(chroma_db_impl="chromadb.db", persist_directory="./chroma_storage"))
# # # # collection = client.get_or_create_collection("code_chunks")

# # # # # 🌐 OpenRouter setup
# # # # OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")
# # # # EMBEDDING_MODEL = "mistral/mistral-embed"  # you can also use openai-compatible ones
# # # # CHAT_MODEL = "mistral/mistral-7b-instruct"

# # # # # 🧠 Embedding helper
# # # # def embed_text(text):
# # # #     res = requests.post(
# # # #         "https://openrouter.ai/api/v1/embeddings",
# # # #         headers={"Authorization": f"Bearer {OPENROUTER_API_KEY}"},
# # # #         json={"model": EMBEDDING_MODEL, "input": text}
# # # #     )
# # # #     return res.json()["data"][0]["embedding"]

# # # # # 📦 Upload & extract ZIP
# # # # @app.route("/upload", methods=["POST"])
# # # # def upload():
# # # #     file = request.files.get("file")
# # # #     if not file or not file.filename.endswith(".zip"):
# # # #         return jsonify({"error": "Please upload a .zip file"}), 400

# # # #     session_id = str(uuid.uuid4())
# # # #     extract_path = os.path.join(UPLOAD_FOLDER, session_id)
# # # #     os.makedirs(extract_path, exist_ok=True)

# # # #     zip_path = os.path.join(UPLOAD_FOLDER, f"{session_id}.zip")
# # # #     file.save(zip_path)

# # # #     with zipfile.ZipFile(zip_path, "r") as zip_ref:
# # # #         zip_ref.extractall(extract_path)

# # # #     os.remove(zip_path)

# # # #     all_chunks = parse_and_chunk_code(extract_path, session_id)
# # # #     return jsonify({"status": "uploaded", "chunks": len(all_chunks)})

# # # # # 🧠 Summary of codebase
# # # # @app.route("/summary", methods=["GET"])
# # # # def summary():
# # # #     all_chunks = collection.get(include=["documents"])["documents"]
# # # #     context = "\n".join(all_chunks)

# # # #     messages = [
# # # #         {"role": "system", "content": "You are a senior software engineer reviewing code."},
# # # #         {"role": "user", "content": f"Summarize the codebase, list tech used, and rate quality:\n{context}"}
# # # #     ]

# # # #     reply = chat_with_model(messages)
# # # #     return jsonify({"summary": reply})

# # # # # ❓ Q&A over code
# # # # @app.route("/ask", methods=["POST"])
# # # # def ask():
# # # #     data = request.get_json()
# # # #     question = data.get("question", "")
# # # #     question_embedding = embed_text(question)

# # # #     results = collection.query(query_embeddings=[question_embedding], n_results=5)
# # # #     context_chunks = [doc for doc in results["documents"][0]]

# # # #     context = "\n".join(context_chunks)

# # # #     messages = [
# # # #         {"role": "system", "content": "You are an expert developer answering questions from code."},
# # # #         {"role": "user", "content": f"Answer the question: {question}\nBased on this code:\n{context}"}
# # # #     ]

# # # #     reply = chat_with_model(messages)
# # # #     return jsonify({"answer": reply})

# # # # # 🤖 Chat helper
# # # # def chat_with_model(messages):
# # # #     res = requests.post(
# # # #         "https://openrouter.ai/api/v1/chat/completions",
# # # #         headers={"Authorization": f"Bearer {OPENROUTER_API_KEY}"},
# # # #         json={
# # # #             "model": CHAT_MODEL,
# # # #             "messages": messages,
# # # #             "max_tokens": 1000
# # # #         }
# # # #     )
# # # #     return res.json()["choices"][0]["message"]["content"]

# # # # # 🧹 Clean file types + chunk
# # # # def parse_and_chunk_code(folder_path, session_id):
# # # #     valid_ext = [".js", ".ts", ".py", ".html", ".css", ".jsx", ".tsx", ".json"]
# # # #     chunks = []

# # # #     for root, _, files in os.walk(folder_path):
# # # #         for file in files:
# # # #             filepath = os.path.join(root, file)
# # # #             ext = os.path.splitext(file)[1]
# # # #             if ext.lower() not in valid_ext:
# # # #                 continue

# # # #             with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
# # # #                 content = f.read()

# # # #             filename = os.path.relpath(filepath, folder_path)
# # # #             file_chunks = split_into_chunks(content, 800)
# # # #             for i, chunk in enumerate(file_chunks):
# # # #                 chunk_id = f"{session_id}_{filename}_{i}"
# # # #                 embedding = embed_text(chunk)
# # # #                 collection.add(documents=[chunk], embeddings=[embedding], ids=[chunk_id])
# # # #                 chunks.append(chunk)
    
# # # #     return chunks

# # # # # 📖 Split long code into chunks
# # # # def split_into_chunks(text, max_tokens):
# # # #     lines = text.split("\n")
# # # #     chunks, current_chunk = [], []

# # # #     for line in lines:
# # # #         current_chunk.append(line)
# # # #         if len("\n".join(current_chunk)) > max_tokens:
# # # #             chunks.append("\n".join(current_chunk))
# # # #             current_chunk = []
    
# # # #     if current_chunk:
# # # #         chunks.append("\n".join(current_chunk))

# # # #     return chunks

# # # # # 🏁 Run app
# # # # if __name__ == "__main__":
# # # #     app.run(debug=True)
# # # # # app.py - Flask application for codebase analysis and Q&A
# # # # # This app allows users to upload a ZIP file of code, extracts it, chunks the code