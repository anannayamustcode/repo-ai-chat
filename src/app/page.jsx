'use client'
import { useState } from 'react'
import { Brain, Upload, MessageCircle, BarChart3, Lightbulb, Code, Zap } from 'lucide-react'
import FileUpload from './components/FileUpload'
// import { Button } from '@/components/ui/button'
// import { Card } from '@/components/ui/card'
// import { cn } from "../../src/app/lib/utils";
import { Button } from "../app/components/ui/button";
import { Card } from "../app/components/ui/card";
import { Badge } from "./components/ui/badge";


export default function CodeAnalyzer() {
  const [activeTab, setActiveTab] = useState('upload')
  const [status, setStatus] = useState('idle') // 'idle' | 'uploading' | 'analyzing' | 'complete'
  const [analysis, setAnalysis] = useState(null)
  const [chat, setChat] = useState([])
  const [question, setQuestion] = useState('')

  const handleAnalysisComplete = (data) => {
    setAnalysis(data)
    setStatus('complete')
    setActiveTab('summary')
  }

  const handleAsk = async () => {
    if (!question.trim()) return
    
    // Add user question to chat
    setChat(prev => [...prev, { type: 'user', content: question }])
    
    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      })
      
      const { answer } = await response.json()
      setChat(prev => [...prev, { type: 'ai', content: answer }])
    } catch (error) {
      setChat(prev => [...prev, { 
        type: 'ai', 
        content: 'Sorry, I encountered an error' 
      }])
    }
    
    setQuestion('')
  }

  return (
    <div className="container mx-auto py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Brain className="text-blue-600" /> Codebase AI Analyzer
        </h1>
        <p className="text-gray-600 mt-2">
          Upload your code and get instant AI-powered analysis
        </p>
      </header>

      {/* Navigation Tabs */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-gray-100 p-1 rounded-lg">
          <Button 
            variant={activeTab === 'upload' ? 'default' : 'ghost'} 
            onClick={() => setActiveTab('upload')}
            className="flex items-center gap-2"
          >
            <Upload size={16} /> Upload
          </Button>
          
          {status === 'complete' && (
            <>
              <Button 
                variant={activeTab === 'summary' ? 'default' : 'ghost'} 
                onClick={() => setActiveTab('summary')}
                className="flex items-center gap-2"
              >
                <BarChart3 size={16} /> Summary
              </Button>
              <Button 
                variant={activeTab === 'chat' ? 'default' : 'ghost'} 
                onClick={() => setActiveTab('chat')}
                className="flex items-center gap-2"
              >
                <MessageCircle size={16} /> AI Chat
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-4xl mx-auto">
        {activeTab === 'upload' && (
          <FileUpload 
            onUploadStart={() => setStatus('uploading')}
            onAnalysisStart={() => setStatus('analyzing')}
            onComplete={handleAnalysisComplete}
          />
        )}

        {activeTab === 'summary' && analysis && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="text-blue-600" /> Project Overview
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-1">Project Name</h3>
                  <p>{analysis.projectName || 'Untitled Project'}</p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">Technologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.technologies?.map(tech => (
                      <span key={tech} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {tech}
                      </span>
                    )) || <span className="text-gray-500">None detected</span>}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Code className="text-blue-600" /> Code Statistics
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-1">Files</h3>
                  <p>{analysis.fileCount || 'N/A'}</p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">Lines of Code</h3>
                  <p>{analysis.linesOfCode?.toLocaleString() || 'N/A'}</p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">Code Quality</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-green-500 h-2.5 rounded-full" 
                        style={{ width: `${(analysis.codeQuality || 0) * 10}%` }}
                      />
                    </div>
                    <span className="font-bold">{analysis.codeQuality || 0}/10</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Lightbulb className="text-blue-600" /> Architecture
              </h2>
              <p className="whitespace-pre-line">
                {analysis.architecture || 'No architecture information available'}
              </p>
            </Card>
          </div>
        )}

        {activeTab === 'chat' && (
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <MessageCircle className="text-blue-600" /> Ask About Your Code
            </h2>
            
            <div className="h-96 overflow-y-auto mb-4 border rounded-lg p-4 bg-gray-50">
              {chat.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <MessageCircle size={48} className="opacity-30 mb-4" />
                  <p>Ask me anything about your codebase!</p>
                  <p className="text-sm mt-2">Example: "Explain the main components"</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {chat.map((message, i) => (
                    <div 
                      key={i} 
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-3xl rounded-lg px-4 py-2 ${
                        message.type === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200'
                      }`}>
                        <p>{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                placeholder="Ask about your code..."
                className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
              <Button onClick={handleAsk}>
                <Zap size={16} className="mr-2" /> Ask
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

// "use client";

// import { useState, useEffect, useCallback } from "react";
// import { Upload, FileCode, Brain, MessageCircle, Download, Github, Zap, Search, BarChart3, CheckCircle, AlertCircle, Code, Layers, Shield, Lightbulb } from "lucide-react";
// import { cn } from "../../src/app/lib/utils";
// import { Button } from "../app/components/ui/button";
// import { Card } from "../app/components/ui/card";
// import { Badge } from "./components/ui/badge";

// // API Service
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// const api = {
//   upload: async (file) => {
//     const formData = new FormData();
//     formData.append("file", file);
//     const res = await fetch(`${API_BASE_URL}/upload`, {
//       method: "POST",
//       body: formData,
//     });
//     return handleResponse(res);
//   },
//   analyze: async () => {
//     const res = await fetch(`${API_BASE_URL}/summary`);
//     return handleResponse(res);
//   },
//   ask: async (question) => {
//     const res = await fetch(`${API_BASE_URL}/ask`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ question }),
//     });
//     return handleResponse(res);
//   },
// };

// async function handleResponse(response) {
//   if (!response.ok) {
//     const error = await response.text();
//     throw new Error(error || "Request failed");
//   }
//   return response.json();
// }

// // Components
// function UploadArea({ onUpload, uploadMethod, setUploadMethod, githubUrl, setGithubUrl }) {
//   const [isDragging, setIsDragging] = useState(false);

//   const handleDragOver = (e) => {
//     e.preventDefault();
//     setIsDragging(true);
//   };

//   const handleDragLeave = () => setIsDragging(false);

//   const handleDrop = (e) => {
//     e.preventDefault();
//     setIsDragging(false);
//     const files = Array.from(e.dataTransfer.files);
//     if (files.length > 0 && files[0].name.endsWith(".zip")) {
//       onUpload(files);
//     }
//   };

//   const handleFileChange = (e) => {
//     const files = Array.from(e.target.files);
//     if (files.length > 0) onUpload(files);
//   };

//   return (
//     <Card className="p-8">
//       <div className="flex items-center justify-center space-x-8 mb-8">
//         <button
//           onClick={() => setUploadMethod("zip")}
//           className={cn(
//             "flex items-center space-x-3 px-6 py-3 rounded-2xl font-medium transition-all",
//             uploadMethod === "zip"
//               ? "bg-blue-100 text-blue-700 border-2 border-blue-300"
//               : "text-gray-600 hover:text-gray-900"
//           )}
//         >
//           <Upload className="h-5 w-5" />
//           <span>Upload ZIP File</span>
//         </button>
        
//         <div className="w-px h-8 bg-gray-300"></div>
        
//         <button
//           onClick={() => setUploadMethod("github")}
//           className={cn(
//             "flex items-center space-x-3 px-6 py-3 rounded-2xl font-medium transition-all",
//             uploadMethod === "github"
//               ? "bg-blue-100 text-blue-700 border-2 border-blue-300"
//               : "text-gray-600 hover:text-gray-900"
//           )}
//         >
//           <Github className="h-5 w-5" />
//           <span>Import from GitHub</span>
//         </button>
//       </div>

//       {uploadMethod === "zip" ? (
//         <div
//           onDragOver={handleDragOver}
//           onDragLeave={handleDragLeave}
//           onDrop={handleDrop}
//           className={cn(
//             "border-3 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer bg-gradient-to-br from-blue-50 to-purple-50",
//             isDragging ? "border-blue-500 bg-blue-100" : "border-blue-300 hover:border-blue-400"
//           )}
//         >
//           <input
//             type="file"
//             accept=".zip"
//             onChange={handleFileChange}
//             className="hidden"
//             id="file-upload"
//           />
//           <label htmlFor="file-upload" className="cursor-pointer">
//             <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
//               <Upload className="h-8 w-8 text-white" />
//             </div>
//             <p className="text-lg font-semibold text-gray-700 mb-2">
//               {isDragging ? "Drop your ZIP file here" : "Upload your project ZIP file"}
//             </p>
//             <p className="text-gray-500">
//               Supports .zip files up to 50MB
//             </p>
//           </label>
//         </div>
//       ) : (
//         <div className="space-y-4">
//           <input
//             type="url"
//             placeholder="https://github.com/username/repository"
//             value={githubUrl}
//             onChange={(e) => setGithubUrl(e.target.value)}
//             className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           />
//           <p className="text-sm text-gray-500 text-center">
//             We'll analyze the latest commit on the main branch
//           </p>
//         </div>
//       )}
//     </Card>
//   );
// }

// function AnalysisResults({ data, activeTab, setActiveTab, chatHistory, question, setQuestion, handleAskQuestion }) {
//   const tabs = [
//     { id: "summary", label: "Summary", icon: BarChart3 },
//     { id: "flow", label: "Code Flow", icon: Layers },
//     { id: "suggestions", label: "Suggestions", icon: Lightbulb },
//     { id: "chat", label: "AI Chat", icon: MessageCircle }
//   ];

//   return (
//     <>
//       <div className="mb-8">
//         <div className="flex items-center justify-between mb-6">
//           <div>
//             <h2 className="text-3xl font-bold text-gray-900">Analysis Complete</h2>
//             <p className="text-gray-600">Your codebase has been successfully analyzed</p>
//           </div>
//           <div className="flex space-x-3">
//             <Button variant="outline" size="sm">
//               <Download className="h-4 w-4 mr-2" />
//               Export Report
//             </Button>
//           </div>
//         </div>

//         <div className="flex space-x-2 mb-6 bg-gray-100 p-1 rounded-2xl w-fit">
//           {tabs.map((tab) => (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id)}
//               className={cn(
//                 "flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all",
//                 activeTab === tab.id
//                   ? "bg-white text-blue-600 shadow-sm"
//                   : "text-gray-600 hover:text-gray-900"
//               )}
//             >
//               <tab.icon className="h-4 w-4" />
//               <span>{tab.label}</span>
//             </button>
//           ))}
//         </div>
//       </div>

//       {activeTab === "summary" && (
//         <div className="grid lg:grid-cols-3 gap-6">
//           <Card className="lg:col-span-2 p-6">
//             <h3 className="text-xl font-semibold mb-4">Project Overview</h3>
//             <div className="space-y-4">
//               <div>
//                 <h4 className="font-medium text-gray-900 mb-2">Project Name</h4>
//                 <p className="text-gray-700">{data?.projectName || "Not available"}</p>
//               </div>
//               <div>
//                 <h4 className="font-medium text-gray-900 mb-2">Description</h4>
//                 <p className="text-gray-700">{data?.description || "No description available"}</p>
//               </div>
//               <div>
//                 <h4 className="font-medium text-gray-900 mb-2">Technologies Used</h4>
//                 <div className="flex flex-wrap gap-2">
//                   {data?.technologies?.map((tech, index) => (
//                     <Badge key={index}>{tech}</Badge>
//                   )) || <span className="text-gray-500">No technologies detected</span>}
//                 </div>
//               </div>
//             </div>
//           </Card>

//           <div className="space-y-6">
//             <Card className="p-6">
//               <h3 className="text-lg font-semibold mb-4">Stats</h3>
//               <div className="space-y-4">
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Files</span>
//                   <span className="font-semibold">{data?.fileCount || "N/A"}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Lines of Code</span>
//                   <span className="font-semibold">{data?.linesOfCode?.toLocaleString() || "N/A"}</span>
//                 </div>
//               </div>
//             </Card>

//             <Card className="p-6">
//               <h3 className="text-lg font-semibold mb-4">Code Quality</h3>
//               <div className="flex items-center space-x-3">
//                 <div className="flex-1 bg-gray-200 rounded-full h-3">
//                   <div 
//                     className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full"
//                     style={{ width: `${(data?.codeQuality || 0) * 10}%` }}
//                   ></div>
//                 </div>
//                 <span className="font-bold text-lg">{data?.codeQuality || 0}/10</span>
//               </div>
//               <p className="text-sm text-gray-600 mt-2">
//                 {data?.codeQuality >= 7 ? "High quality" : data?.codeQuality >= 4 ? "Moderate quality" : "Needs improvement"}
//               </p>
//             </Card>
//           </div>
//         </div>
//       )}

//       {activeTab === "chat" && (
//         <Card className="p-6">
//           <h3 className="text-xl font-semibold mb-4">Ask Questions About Your Code</h3>
          
//           <div className="h-96 overflow-y-auto mb-4 border border-gray-200 rounded-xl p-4 bg-gray-50">
//             {chatHistory.length === 0 ? (
//               <div className="text-center text-gray-500 py-12">
//                 <MessageCircle className="h-8 w-8 mx-auto mb-3 opacity-50" />
//                 <p>Ask me anything about your codebase!</p>
//                 <p className="text-sm mt-1">Try: "How does authentication work?" or "Explain the main components"</p>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {chatHistory.map((message, index) => (
//                   <div key={index} className={cn(
//                     "flex",
//                     message.type === "user" ? "justify-end" : "justify-start"
//                   )}>
//                     <div className={cn(
//                       "max-w-3xl px-4 py-3 rounded-2xl",
//                       message.type === "user" 
//                         ? "bg-blue-600 text-white" 
//                         : "bg-white border border-gray-200"
//                     )}>
//                       <p className="whitespace-pre-wrap">{message.content}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           <div className="flex space-x-3">
//             <input
//               type="text"
//               placeholder="Ask about your codebase..."
//               value={question}
//               onChange={(e) => setQuestion(e.target.value)}
//               onKeyPress={(e) => e.key === "Enter" && handleAskQuestion()}
//               className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//             <Button onClick={handleAskQuestion} disabled={!question.trim()}>
//               <Search className="h-4 w-4 mr-2" />
//               Ask
//             </Button>
//           </div>
//         </Card>
//       )}
//     </>
//   );
// }

// export default function CodebaseAnalyzer() {
//   const [files, setFiles] = useState([]);
//   const [status, setStatus] = useState("idle"); // 'idle', 'uploading', 'analyzing', 'complete', 'error'
//   const [error, setError] = useState("");
//   const [analysisData, setAnalysisData] = useState(null);
//   const [activeTab, setActiveTab] = useState("summary");
//   const [question, setQuestion] = useState("");
//   const [chatHistory, setChatHistory] = useState([]);
//   const [uploadMethod, setUploadMethod] = useState("zip");
//   const [githubUrl, setGithubUrl] = useState("");

//   const handleFileUpload = useCallback((acceptedFiles) => {
//     if (acceptedFiles.length > 0 && acceptedFiles[0].name.endsWith(".zip")) {
//       setFiles(acceptedFiles);
//       setError("");
//     } else {
//       setError("Please upload a valid ZIP file");
//     }
//   }, []);

//   const handleAnalyze = async () => {
//     if ((uploadMethod === "zip" && files.length === 0) || 
//         (uploadMethod === "github" && !githubUrl)) {
//       setError("Please provide a codebase to analyze");
//       return;
//     }

//     try {
//       setStatus("uploading");
//       setError("");
      
//       if (uploadMethod === "zip") {
//         await api.upload(files[0]);
//       } else {
//         throw new Error("GitHub import not implemented yet");
//       }

//       setStatus("analyzing");
//       const summary = await api.analyze();
//       setAnalysisData(summary);
//       setStatus("complete");
//     } catch (err) {
//       setError(err.message || "Analysis failed");
//       setStatus("error");
//     }
//   };

//   const handleAskQuestion = async () => {
//     if (!question.trim()) return;
    
//     const newQuestion = { type: "user", content: question };
//     setChatHistory(prev => [...prev, newQuestion]);
//     setQuestion("");
    
//     try {
//       const response = await api.ask(question);
//       const aiResponse = { type: "ai", content: response.answer };
//       setChatHistory(prev => [...prev, aiResponse]);
//     } catch (err) {
//       const errorResponse = { type: "ai", content: "Error: " + (err.message || "Could not get answer") };
//       setChatHistory(prev => [...prev, errorResponse]);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
//       <header className="border-b border-white/20 backdrop-blur-md bg-white/80 sticky top-0 z-50">
//         <div className="max-w-7xl mx-auto px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
//                 <Brain className="h-6 w-6 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                   CodebaseAI
//                 </h1>
//                 <p className="text-sm text-gray-600">Understand any codebase with AI</p>
//               </div>
//             </div>
//             <div className="flex items-center space-x-4">
//               <Badge variant="success">
//                 <Zap className="h-3 w-3 mr-1" />
//                 Free Beta
//               </Badge>
//               <Button variant="outline" size="sm">
//                 <Github className="h-4 w-4 mr-2" />
//                 Star on GitHub
//               </Button>
//             </div>
//           </div>
//         </div>
//       </header>

//       <main className="max-w-7xl mx-auto px-6 py-8">
//         {status !== "complete" ? (
//           <>
//             <div className="text-center mb-12">
//               <h2 className="text-5xl font-bold text-gray-900 mb-4">
//                 Understand Any Codebase
//                 <span className="block text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-2">
//                   in Seconds with AI
//                 </span>
//               </h2>
//               <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
//                 Upload your project and get smart summaries, code flow analysis, 
//                 tech stack detection, and AI-powered Q&A.
//               </p>
//             </div>

//             <UploadArea 
//               onUpload={handleFileUpload}
//               uploadMethod={uploadMethod}
//               setUploadMethod={setUploadMethod}
//               githubUrl={githubUrl}
//               setGithubUrl={setGithubUrl}
//             />

//             <div className="text-center mb-12">
//               <Button 
//                 onClick={handleAnalyze}
//                 size="lg"
//                 disabled={status !== "idle" || 
//                   (uploadMethod === "zip" && files.length === 0) || 
//                   (uploadMethod === "github" && !githubUrl)}
//                 className="px-12 py-4 text-lg"
//               >
//                 {status === "uploading" ? (
//                   <>
//                     <Upload className="h-5 w-5 mr-3 animate-spin" />
//                     Uploading...
//                   </>
//                 ) : status === "analyzing" ? (
//                   <>
//                     <Brain className="h-5 w-5 mr-3 animate-pulse" />
//                     Analyzing...
//                   </>
//                 ) : (
//                   <>
//                     <Zap className="h-5 w-5 mr-3" />
//                     Analyze Codebase
//                   </>
//                 )}
//               </Button>

//               {error && (
//                 <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
//                   <div className="flex items-center">
//                     <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
//                     <p className="text-red-700">{error}</p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </>
//         ) : (
//           <AnalysisResults 
//             data={analysisData}
//             activeTab={activeTab}
//             setActiveTab={setActiveTab}
//             chatHistory={chatHistory}
//             question={question}
//             setQuestion={setQuestion}
//             handleAskQuestion={handleAskQuestion}
//           />
//         )}
//       </main>

//       <footer className="border-t border-gray-200 mt-16 py-8">
//         <div className="max-w-7xl mx-auto px-6 text-center text-gray-600">
//           <p>CodebaseAI - Understand any codebase with AI</p>
//         </div>
//       </footer>
//     </div>
//   );
// }

// // "use client";

// // import { useState, useCallback } from "react";
// // import { Upload, FileCode, Brain, MessageCircle, Download, Github, Zap, Search, BarChart3, CheckCircle, AlertCircle, Code, Layers, Shield, Lightbulb } from "lucide-react";

// // // Utility function for combining class names
// // function cn(...args) {
// //   return args.filter(Boolean).join(" ");
// // }

// // // Button component
// // function Button({ className, variant = "default", size = "default", disabled, children, ...props }) {
// //   const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
// //   const variants = {
// //     default: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl focus:ring-blue-500",
// //     secondary: "bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300",
// //     outline: "border-2 border-blue-500 text-blue-600 hover:bg-blue-50",
// //     ghost: "hover:bg-gray-100 text-gray-700"
// //   };
  
// //   const sizes = {
// //     sm: "px-3 py-1.5 text-sm rounded-lg",
// //     default: "px-6 py-3 text-sm rounded-xl",
// //     lg: "px-8 py-4 text-base rounded-2xl"
// //   };

// //   return (
// //     <button
// //       className={cn(baseStyles, variants[variant], sizes[size], className)}
// //       disabled={disabled}
// //       {...props}
// //     >
// //       {children}
// //     </button>
// //   );
// // }

// // // Card component
// // function Card({ className, children, ...props }) {
// //   return (
// //     <div
// //       className={cn("rounded-3xl bg-white shadow-xl border border-gray-100 backdrop-blur-sm", className)}
// //       {...props}
// //     >
// //       {children}
// //     </div>
// //   );
// // }

// // // Badge component
// // function Badge({ className, variant = "default", children }) {
// //   const variants = {
// //     default: "bg-blue-100 text-blue-800",
// //     success: "bg-green-100 text-green-800",
// //     warning: "bg-yellow-100 text-yellow-800",
// //     error: "bg-red-100 text-red-800"
// //   };
  
// //   return (
// //     <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-xs font-medium", variants[variant], className)}>
// //       {children}
// //     </span>
// //   );
// // }

// // export default function Home() {
// //   const [files, setFiles] = useState([]);
// //   const [uploading, setUploading] = useState(false);
// //   const [analyzing, setAnalyzing] = useState(false);
// //   const [analysisComplete, setAnalysisComplete] = useState(false);
// //   const [response, setResponse] = useState(null);
// //   const [error, setError] = useState("");
// //   const [activeTab, setActiveTab] = useState("summary");
// //   const [question, setQuestion] = useState("");
// //   const [chatHistory, setChatHistory] = useState([]);
// //   const [uploadMethod, setUploadMethod] = useState("zip"); // "zip" or "github"
// //   const [githubUrl, setGithubUrl] = useState("");

// //   // Analysis state from backend
// //   const [analysisData, setAnalysisData] = useState(null);

// //   const handleFileUpload = useCallback((acceptedFiles) => {
// //     setFiles(acceptedFiles);
// //     setResponse(null);
// //     setError("");
// //     setAnalysisComplete(false);
// //   }, []);

// //   const handleDragOver = (e) => {
// //     e.preventDefault();
// //   };

// //   const handleDrop = (e) => {
// //     e.preventDefault();
// //     const droppedFiles = Array.from(e.dataTransfer.files);
// //     handleFileUpload(droppedFiles);
// //   };

// //   const handleAnalyze = async () => {
// //     if ((uploadMethod === "zip" && files.length === 0) || (uploadMethod === "github" && !githubUrl)) {
// //       setError("Please provide a codebase to analyze");
// //       return;
// //     }

// //     setUploading(true);
// //     setError("");
// //     setAnalysisData(null);

// //     try {
// //       if (uploadMethod === "zip") {
// //         const formData = new FormData();
// //         formData.append("file", files[0]);
// //         const uploadRes = await fetch("http://localhost:5000/upload", {
// //           method: "POST",
// //           body: formData
// //         });
// //         if (!uploadRes.ok) throw new Error("Upload failed");
// //       } else {
// //         setError("GitHub import not implemented yet");
// //         setUploading(false);
// //         return;
// //       }
// //       setUploading(false);
// //       setAnalyzing(true);
// //       // Get summary from backend
// //       const summaryRes = await fetch("http://localhost:5000/summary");
// //       if (!summaryRes.ok) throw new Error("Failed to get summary");
// //       const summaryData = await summaryRes.json();
// //       setAnalysisData(summaryData);
// //       setResponse(summaryData); // for legacy code compatibility
// //       setAnalysisComplete(true);
// //     } catch (err) {
// //       setError(err.message || "Analysis failed");
// //       setUploading(false);
// //       setAnalyzing(false);
// //     }
// //     setAnalyzing(false);
// //   };

// //   const handleAskQuestion = async () => {
// //     if (!question.trim()) return;
// //     const newQuestion = { type: "user", content: question };
// //     setChatHistory(prev => [...prev, newQuestion]);
// //     try {
// //       const askRes = await fetch("http://localhost:5000/ask", {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({ question })
// //       });
// //       if (!askRes.ok) throw new Error("Failed to get answer");
// //       const askData = await askRes.json();
// //       const aiResponse = {
// //         type: "ai",
// //         content: askData.answer
// //       };
// //       setChatHistory(prev => [...prev, aiResponse]);
// //     } catch (err) {
// //       setChatHistory(prev => [...prev, { type: "ai", content: "Error: " + (err.message || "Could not get answer") }]);
// //     }
// //     setQuestion("");
// //   };

// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
// //       {/* Header */}
// //       <header className="border-b border-white/20 backdrop-blur-md bg-white/80 sticky top-0 z-50">
// //         <div className="max-w-7xl mx-auto px-6 py-4">
// //           <div className="flex items-center justify-between">
// //             <div className="flex items-center space-x-3">
// //               <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
// //                 <Brain className="h-6 w-6 text-white" />
// //               </div>
// //               <div>
// //                 <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
// //                   CodebaseAI
// //                 </h1>
// //                 <p className="text-sm text-gray-600">Understand any codebase with AI</p>
// //               </div>
// //             </div>
// //             <div className="flex items-center space-x-4">
// //               <Badge variant="success">
// //                 <Zap className="h-3 w-3 mr-1" />
// //                 Free Beta
// //               </Badge>
// //               <Button variant="outline" size="sm">
// //                 <Github className="h-4 w-4 mr-2" />
// //                 Star on GitHub
// //               </Button>
// //             </div>
// //           </div>
// //         </div>
// //       </header>

// //       <main className="max-w-7xl mx-auto px-6 py-8">
// //         {!analysisComplete ? (
// //           <>
// //             {/* Hero Section */}
// //             <div className="text-center mb-12">
// //               <h2 className="text-5xl font-bold text-gray-900 mb-4">
// //                 Understand Any Codebase
// //                 <span className="block text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-2">
// //                   in Seconds with AI
// //                 </span>
// //               </h2>
// //               <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
// //                 Upload your project and get smart summaries, code flow analysis, tech stack detection, 
// //                 and AI-powered Q&A. Perfect for developers joining new teams or exploring open source projects.
// //               </p>
// //             </div>

// //             {/* Upload Methods */}
// //             <Card className="mb-8 p-8">
// //               <div className="flex items-center justify-center space-x-8 mb-8">
// //                 <button
// //                   onClick={() => setUploadMethod("zip")}
// //                   className={cn(
// //                     "flex items-center space-x-3 px-6 py-3 rounded-2xl font-medium transition-all",
// //                     uploadMethod === "zip" 
// //                       ? "bg-blue-100 text-blue-700 border-2 border-blue-300" 
// //                       : "text-gray-600 hover:text-gray-900"
// //                   )}
// //                 >
// //                   <Upload className="h-5 w-5" />
// //                   <span>Upload ZIP File</span>
// //                 </button>
// //                 <div className="w-px h-8 bg-gray-300"></div>
// //                 <button
// //                   onClick={() => setUploadMethod("github")}
// //                   className={cn(
// //                     "flex items-center space-x-3 px-6 py-3 rounded-2xl font-medium transition-all",
// //                     uploadMethod === "github" 
// //                       ? "bg-blue-100 text-blue-700 border-2 border-blue-300" 
// //                       : "text-gray-600 hover:text-gray-900"
// //                   )}
// //                 >
// //                   <Github className="h-5 w-5" />
// //                   <span>Import from GitHub</span>
// //                 </button>
// //               </div>

// //               {uploadMethod === "zip" ? (
// //                 <div
// //                   onDragOver={handleDragOver}
// //                   onDrop={handleDrop}
// //                   className="border-3 border-dashed border-blue-300 rounded-3xl p-12 text-center hover:border-blue-400 transition-all cursor-pointer bg-gradient-to-br from-blue-50 to-purple-50"
// //                 >
// //                   <input
// //                     type="file"
// //                     accept=".zip"
// //                     onChange={(e) => handleFileUpload(Array.from(e.target.files))}
// //                     className="hidden"
// //                     id="file-upload"
// //                   />
// //                   <label htmlFor="file-upload" className="cursor-pointer">
// //                     <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
// //                       <Upload className="h-8 w-8 text-white" />
// //                     </div>
// //                     <p className="text-lg font-semibold text-gray-700 mb-2">
// //                       Drop your project ZIP file here
// //                     </p>
// //                     <p className="text-gray-500">
// //                       Or click to browse files • Supports .zip files up to 50MB
// //                     </p>
// //                   </label>

// //                   {files.length > 0 && (
// //                     <div className="mt-6 p-4 bg-white rounded-2xl border border-gray-200 inline-block">
// //                       <div className="flex items-center space-x-3">
// //                         <FileCode className="h-5 w-5 text-blue-600" />
// //                         <span className="font-medium text-gray-900">{files[0].name}</span>
// //                         <Badge variant="success">Ready</Badge>
// //                       </div>
// //                     </div>
// //                   )}
// //                 </div>
// //               ) : (
// //                 <div className="space-y-4">
// //                   <div className="flex space-x-4">
// //                     <div className="flex-1">
// //                       <input
// //                         type="url"
// //                         placeholder="https://github.com/username/repository"
// //                         value={githubUrl}
// //                         onChange={(e) => setGithubUrl(e.target.value)}
// //                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// //                       />
// //                     </div>
// //                   </div>
// //                   <p className="text-sm text-gray-500 text-center">
// //                     We'll clone the repository and analyze the latest commit on the main branch
// //                   </p>
// //                 </div>
// //               )}
// //             </Card>

// //             {/* Analyze Button */}
// //             <div className="text-center mb-12">
// //               <Button 
// //                 onClick={handleAnalyze}
// //                 size="lg"
// //                 disabled={uploading || analyzing || (uploadMethod === "zip" && files.length === 0) || (uploadMethod === "github" && !githubUrl)}
// //                 className="px-12 py-4 text-lg"
// //               >
// //                 {uploading ? (
// //                   <>
// //                     <Upload className="h-5 w-5 mr-3 animate-spin" />
// //                     Uploading...
// //                   </>
// //                 ) : analyzing ? (
// //                   <>
// //                     <Brain className="h-5 w-5 mr-3 animate-pulse" />
// //                     Analyzing Codebase...
// //                   </>
// //                 ) : (
// //                   <>
// //                     <Zap className="h-5 w-5 mr-3" />
// //                     Analyze Codebase
// //                   </>
// //                 )}
// //               </Button>

// //               {error && (
// //                 <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
// //                   <div className="flex items-center">
// //                     <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
// //                     <p className="text-red-700">{error}</p>
// //                   </div>
// //                 </div>
// //               )}
// //             </div>

// //             {/* Features Preview */}
// //             <div className="grid md:grid-cols-3 gap-8 mb-12">
// //               <Card className="p-6 text-center hover:shadow-2xl transition-all duration-300">
// //                 <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
// //                   <BarChart3 className="h-6 w-6 text-blue-600" />
// //                 </div>
// //                 <h3 className="text-lg font-semibold mb-2">Smart Analysis</h3>
// //                 <p className="text-gray-600">Get comprehensive insights about your codebase structure and quality</p>
// //               </Card>

// //               <Card className="p-6 text-center hover:shadow-2xl transition-all duration-300">
// //                 <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
// //                   <MessageCircle className="h-6 w-6 text-purple-600" />
// //                 </div>
// //                 <h3 className="text-lg font-semibold mb-2">AI Q&A</h3>
// //                 <p className="text-gray-600">Ask questions about your code and get intelligent, context-aware answers</p>
// //               </Card>

// //               <Card className="p-6 text-center hover:shadow-2xl transition-all duration-300">
// //                 <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
// //                   <Lightbulb className="h-6 w-6 text-green-600" />
// //                 </div>
// //                 <h3 className="text-lg font-semibold mb-2">Improvement Tips</h3>
// //                 <p className="text-gray-600">Receive actionable suggestions to enhance your code quality and performance</p>
// //               </Card>
// //             </div>
// //           </>
// //         ) : (
// //           <>
// //             {/* Analysis Results */}
// //             <div className="mb-8">
// //               <div className="flex items-center justify-between mb-6">
// //                 <div>
// //                   <h2 className="text-3xl font-bold text-gray-900">Analysis Complete</h2>
// //                   <p className="text-gray-600">Your codebase has been successfully analyzed</p>
// //                 </div>
// //                 <div className="flex space-x-3">
// //                   <Button variant="outline" size="sm">
// //                     <Download className="h-4 w-4 mr-2" />
// //                     Export Report
// //                   </Button>
// //                   <Button size="sm" onClick={() => {setAnalysisComplete(false); setResponse(null);}}>
// //                     Analyze New Project
// //                   </Button>
// //                 </div>
// //               </div>

// //               {/* Tab Navigation */}
// //               <div className="flex space-x-2 mb-6 bg-gray-100 p-1 rounded-2xl w-fit">
// //                 {[
// //                   { id: "summary", label: "Summary", icon: BarChart3 },
// //                   { id: "flow", label: "Code Flow", icon: Layers },
// //                   { id: "suggestions", label: "Suggestions", icon: Lightbulb },
// //                   { id: "chat", label: "AI Chat", icon: MessageCircle }
// //                 ].map((tab) => (
// //                   <button
// //                     key={tab.id}
// //                     onClick={() => setActiveTab(tab.id)}
// //                     className={cn(
// //                       "flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all",
// //                       activeTab === tab.id
// //                         ? "bg-white text-blue-600 shadow-sm"
// //                         : "text-gray-600 hover:text-gray-900"
// //                     )}
// //                   >
// //                     <tab.icon className="h-4 w-4" />
// //                     <span>{tab.label}</span>
// //                   </button>
// //                 ))}
// //               </div>
// //             </div>

// //             {/* Tab Content */}
// //             {activeTab === "summary" && (
// //               <div className="grid lg:grid-cols-3 gap-6">
// //                 <Card className="lg:col-span-2 p-6">
// //                   <h3 className="text-xl font-semibold mb-4">Project Overview</h3>
// //                   <div className="space-y-4">
// //                     <div>
// //                       <h4 className="font-medium text-gray-900 mb-2">Project Name</h4>
// //                       <p className="text-gray-700">{response.summary.projectName}</p>
// //                     </div>
// //                     <div>
// //                       <h4 className="font-medium text-gray-900 mb-2">Description</h4>
// //                       <p className="text-gray-700">{response.summary.description}</p>
// //                     </div>
// //                     <div>
// //                       <h4 className="font-medium text-gray-900 mb-2">Technologies Used</h4>
// //                       <div className="flex flex-wrap gap-2">
// //                         {response.summary.technologies.map((tech, index) => (
// //                           <Badge key={index}>{tech}</Badge>
// //                         ))}
// //                       </div>
// //                     </div>
// //                   </div>
// //                 </Card>

// //                 <div className="space-y-6">
// //                   <Card className="p-6">
// //                     <h3 className="text-lg font-semibold mb-4">Stats</h3>
// //                     <div className="space-y-4">
// //                       <div className="flex justify-between">
// //                         <span className="text-gray-600">Files</span>
// //                         <span className="font-semibold">{response.summary.fileCount}</span>
// //                       </div>
// //                       <div className="flex justify-between">
// //                         <span className="text-gray-600">Lines of Code</span>
// //                         <span className="font-semibold">{response.summary.linesOfCode.toLocaleString()}</span>
// //                       </div>
// //                     </div>
// //                   </Card>

// //                   <Card className="p-6">
// //                     <h3 className="text-lg font-semibold mb-4">Code Quality</h3>
// //                     <div className="flex items-center space-x-3">
// //                       <div className="flex-1 bg-gray-200 rounded-full h-3">
// //                         <div 
// //                           className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full"
// //                           style={{ width: `${response.summary.codeQuality * 10}%` }}
// //                         ></div>
// //                       </div>
// //                       <span className="font-bold text-lg">{response.summary.codeQuality}/10</span>
// //                     </div>
// //                     <p className="text-sm text-gray-600 mt-2">Above average code quality</p>
// //                   </Card>
// //                 </div>
// //               </div>
// //             )}

// //             {activeTab === "flow" && (
// //               <Card className="p-6">
// //                 <h3 className="text-xl font-semibold mb-4">Code Architecture & Flow</h3>
// //                 <div className="space-y-6">
// //                   <div>
// //                     <h4 className="font-medium text-gray-900 mb-2">Entry Point</h4>
// //                     <p className="text-gray-700 font-mono bg-gray-100 px-3 py-1 rounded-lg inline-block">
// //                       {response.codeFlow.entryPoint}
// //                     </p>
// //                   </div>
                  
// //                   <div>
// //                     <h4 className="font-medium text-gray-900 mb-3">Main Components</h4>
// //                     <div className="grid md:grid-cols-2 gap-4">
// //                       {response.codeFlow.mainComponents.map((component, index) => (
// //                         <div key={index} className="border border-gray-200 rounded-xl p-4">
// //                           <div className="flex items-center space-x-2 mb-2">
// //                             <Code className="h-4 w-4 text-blue-600" />
// //                             <span className="font-medium">{component.name}</span>
// //                           </div>
// //                           <p className="text-sm text-gray-600">{component.purpose}</p>
// //                         </div>
// //                       ))}
// //                     </div>
// //                   </div>

// //                   <div>
// //                     <h4 className="font-medium text-gray-900 mb-2">Architecture Pattern</h4>
// //                     <p className="text-gray-700">{response.codeFlow.architecture}</p>
// //                   </div>
// //                 </div>
// //               </Card>
// //             )}

// //             {activeTab === "suggestions" && (
// //               <Card className="p-6">
// //                 <h3 className="text-xl font-semibold mb-4">Improvement Suggestions</h3>
// //                 <div className="space-y-4">
// //                   {response.suggestions.map((suggestion, index) => (
// //                     <div key={index} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
// //                       <div className="flex items-start space-x-3">
// //                         <div className={cn(
// //                           "p-2 rounded-lg",
// //                           suggestion.type === "security" && "bg-red-100",
// //                           suggestion.type === "performance" && "bg-yellow-100",
// //                           suggestion.type === "code-quality" && "bg-blue-100"
// //                         )}>
// //                           {suggestion.type === "security" && <Shield className="h-4 w-4 text-red-600" />}
// //                           {suggestion.type === "performance" && <Zap className="h-4 w-4 text-yellow-600" />}
// //                           {suggestion.type === "code-quality" && <Code className="h-4 w-4 text-blue-600" />}
// //                         </div>
// //                         <div className="flex-1">
// //                           <div className="flex items-center space-x-2 mb-1">
// //                             <span className="font-medium capitalize">{suggestion.type}</span>
// //                             <Badge variant={suggestion.priority === "high" ? "error" : suggestion.priority === "medium" ? "warning" : "default"}>
// //                               {suggestion.priority} priority
// //                             </Badge>
// //                           </div>
// //                           <p className="text-gray-700">{suggestion.message}</p>
// //                         </div>
// //                       </div>
// //                     </div>
// //                   ))}
// //                 </div>
// //               </Card>
// //             )}

// //             {activeTab === "chat" && (
// //               <Card className="p-6">
// //                 <h3 className="text-xl font-semibold mb-4">Ask Questions About Your Code</h3>
                
// //                 {/* Chat History */}
// //                 <div className="h-96 overflow-y-auto mb-4 border border-gray-200 rounded-xl p-4 bg-gray-50">
// //                   {chatHistory.length === 0 ? (
// //                     <div className="text-center text-gray-500 py-12">
// //                       <MessageCircle className="h-8 w-8 mx-auto mb-3 opacity-50" />
// //                       <p>Ask me anything about your codebase!</p>
// //                       <p className="text-sm mt-1">Try: "How does authentication work?" or "What's the main data flow?"</p>
// //                     </div>
// //                   ) : (
// //                     <div className="space-y-4">
// //                       {chatHistory.map((message, index) => (
// //                         <div key={index} className={cn(
// //                           "flex",
// //                           message.type === "user" ? "justify-end" : "justify-start"
// //                         )}>
// //                           <div className={cn(
// //                             "max-w-3xl px-4 py-3 rounded-2xl",
// //                             message.type === "user" 
// //                               ? "bg-blue-600 text-white" 
// //                               : "bg-white border border-gray-200"
// //                           )}>
// //                             <p className="whitespace-pre-wrap">{message.content}</p>
// //                           </div>
// //                         </div>
// //                       ))}
// //                     </div>
// //                   )}
// //                 </div>

// //                 {/* Chat Input */}
// //                 <div className="flex space-x-3">
// //                   <input
// //                     type="text"
// //                     placeholder="Ask about your codebase..."
// //                     value={question}
// //                     onChange={(e) => setQuestion(e.target.value)}
// //                     onKeyPress={(e) => e.key === "Enter" && handleAskQuestion()}
// //                     className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// //                   />
// //                   <Button onClick={handleAskQuestion} disabled={!question.trim()}>
// //                     <Search className="h-4 w-4 mr-2" />
// //                     Ask
// //                   </Button>
// //                 </div>
// //               </Card>
// //             )}
// //           </>
// //         )}
// //       </main>

// //       {/* Footer */}
// //       <footer className="border-t border-gray-200 mt-16 py-8">
// //         <div className="max-w-7xl mx-auto px-6 text-center text-gray-600">
// //           <p>Built while being incredibly sleep deprieved</p>
// //         </div>
// //       </footer>
// //     </div>
// //   );
// // }


// // // "use client";

// // // // Utility function for combining class names
// // // function cn(...args) {
// // //   return args.filter(Boolean).join(" ");
// // // }

// // // // Button component
// // // function Button({ className, disabled, ...props }) {
// // //   return (
// // //     <button
// // //       className={cn(
// // //         "inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-2 text-white text-sm font-medium shadow hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed",
// // //         className
// // //       )}
// // //       disabled={disabled}
// // //       {...props}
// // //     />
// // //   );
// // // }

// // // // Card component
// // // function Card({ className, ...props }) {
// // //   return (
// // //     <div
// // //       className={cn("rounded-2xl bg-white shadow-sm border border-gray-200", className)}
// // //       {...props}
// // //     />
// // //   );
// // // }

// // // // CardContent component
// // // function CardContent({ className, ...props }) {
// // //   return (
// // //     <div className={cn("p-4", className)} {...props} />
// // //   );
// // // }

// // // import { useState, useCallback } from "react";
// // // import { useDropzone } from "react-dropzone";
// // // import axios from "axios";

// // // export default function Home() {
// // //   const [files, setFiles] = useState([]);
// // //   const [uploading, setUploading] = useState(false);
// // //   const [response, setResponse] = useState(null);
// // //   const [error, setError] = useState("");

// // //   const onDrop = useCallback((acceptedFiles) => {
// // //     setFiles(acceptedFiles);
// // //     setResponse(null);
// // //     setError("");
// // //   }, []);

// // //   const { getRootProps, getInputProps, isDragActive } = useDropzone({
// // //     onDrop,
// // //     accept: { "application/zip": [".zip"] },
// // //     multiple: false,
// // //   });

// // //   const handleUpload = async () => {
// // //     if (files.length === 0) return;

// // //     setUploading(true);
// // //     setError("");
// // //     setResponse(null);

// // //     const formData = new FormData();
// // //     formData.append("repo", files[0]);

// // //     try {
// // //       const res = await axios.post("http://localhost:5000/upload", formData, {
// // //         headers: { "Content-Type": "multipart/form-data" },
// // //       });
// // //       setResponse(res.data);
// // //     } catch (err) {
// // //       setError("Upload failed. Check your backend.");
// // //     } finally {
// // //       setUploading(false);
// // //     }
// // //   };

// // //   return (
// // //     <main className="min-h-screen bg-gray-100 p-6">
// // //       <div className="max-w-3xl mx-auto space-y-6">
// // //         <h1 className="text-3xl font-bold text-center">🧠 AI Codebase Analyzer</h1>

// // //         <Card>
// // //           <CardContent className="p-6">
// // //             <div
// // //               {...getRootProps()}
// // //               className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
// // //                 isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"
// // //               }`}
// // //             >
// // //               <input {...getInputProps()} />
// // //               {isDragActive ? (
// // //                 <p>Drop the ZIP file here...</p>
// // //               ) : (
// // //                 <p>Drag & drop your project ZIP here, or click to browse</p>
// // //               )}
// // //             </div>

// // //             {files.length > 0 && (
// // //               <div className="mt-4 text-sm text-gray-700">
// // //                 <strong>Uploaded:</strong> {files[0].name}
// // //               </div>
// // //             )}

// // //             <Button
// // //               onClick={handleUpload}
// // //               className="mt-4"
// // //               disabled={uploading || files.length === 0}
// // //             >
// // //               {uploading ? "Uploading..." : "Analyze Codebase"}
// // //             </Button>

// // //             {error && <p className="text-red-600 mt-4">{error}</p>}
// // //           </CardContent>
// // //         </Card>

// // //         {response && (
// // //           <Card>
// // //             <CardContent className="p-6 space-y-4">
// // //               <h2 className="text-xl font-semibold">🔍 Analysis Result</h2>
// // //               <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md text-sm">
// // //                 {JSON.stringify(response, null, 2)}
// // //               </pre>
// // //             </CardContent>
// // //           </Card>
// // //         )}
// // //       </div>
// // //     </main>
// // //   );
// // // }
