'use client';

import { uploadDocument } from "@/app/actions";
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

export default function UploadForm() {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<number>(0);
  
  const handleUpload = async (formData: FormData) => {
    try {
      setIsUploading(true)
      setError(null)
      setProgress(0)
      
      const result = await uploadDocument(formData)
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      setProgress(100)
      router.push(`/document/${result.documentId}`)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form action={handleUpload} className="flex flex-col gap-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <div>
        <label 
          htmlFor="document" 
          className="block text-sm font-medium text-foreground mb-2"
        >
          Select PDF Document (max 10MB)
        </label>
        <input
          id="document"
          name="document"
          type="file"
          accept="application/pdf"
          required
          className="w-full px-4 py-2 border rounded-md bg-background"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && file.size > MAX_FILE_SIZE) {
              setError('File size exceeds 10MB limit');
              e.target.value = '';
            } else {
              setError(null);
            }
          }}
        />
      </div>
      
      <button
        type="submit"
        disabled={isUploading}
        className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? 'Uploading...' : 'Upload Document'}
      </button>
    </form>
  );
} 