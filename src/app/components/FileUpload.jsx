'use client'
import { useState } from 'react'
import { Upload, FileCode } from 'lucide-react'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'

export default function FileUpload({ onUploadStart, onAnalysisStart, onComplete }) {
  const [file, setFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0])
    }
  }

const handleUpload = async () => {
  if (!file) return;
  
  onUploadStart();
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
    if (!uploadRes.ok) throw new Error('Upload failed');
    
    onAnalysisStart();
    const summaryRes = await fetch('/api/summary');
    if (!summaryRes.ok) throw new Error('Analysis failed');
    
    const summary = await summaryRes.json();
    onComplete(summary);
  } catch (error) {
    console.error('Error:', error);
    alert(`Error: ${error.message}`);
  }
};

return (
    <Card className="p-8">
      <div 
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
        }`}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          if (e.dataTransfer.files?.[0]) {
            setFile(e.dataTransfer.files[0])
          }
        }}
      >
        <input 
          type="file" 
          id="file-upload" 
          className="hidden" 
          accept=".zip" 
          onChange={handleFileChange}
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Upload className="text-blue-600" size={24} />
          </div>
          <p className="text-lg font-semibold mb-2">
            {isDragging ? 'Drop your ZIP file here' : 'Upload your project ZIP file'}
          </p>
          <p className="text-gray-500">Supports .zip files up to 50MB</p>
        </label>
      </div>

      {file && (
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileCode className="text-blue-600" />
            <span className="font-medium">{file.name}</span>
          </div>
          <Button onClick={handleUpload}>
            Analyze Codebase
          </Button>
        </div>
      )}
    </Card>
  )
}