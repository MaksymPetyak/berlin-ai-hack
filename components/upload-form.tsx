'use client';

import { uploadDocument } from "@/app/actions";
import { useRouter } from 'next/navigation'
import { useState, useRef } from 'react'
import { PlusIcon } from "lucide-react";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

export default function UploadForm() {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<number>(0);
  const formRef = useRef<HTMLFormElement>(null);
  
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
    <form ref={formRef} action={handleUpload} className="h-full">
      {error && (
        <div className="absolute top-4 left-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <div className="h-full border border-dashed border-foreground/20 rounded-lg flex items-center justify-center hover:border-foreground/40 transition-colors">
        <input
          type="file"
          id="document"
          name="document"
          className="hidden"
          accept=".pdf"
          required
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && file.size > MAX_FILE_SIZE) {
              setError('File size exceeds 10MB limit');
              e.target.value = '';
            } else {
              setError(null);
              // Auto-submit the form when a valid file is selected
              formRef.current?.requestSubmit();
            }
          }}
        />
        <label
          htmlFor="document"
          className="cursor-pointer flex flex-col items-center gap-4 p-12"
        >
          <div className="border rounded-lg p-4">
            <PlusIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="font-medium">
              {isUploading ? 'Uploading...' : 'Drop your PDF here'}
            </p>
            <p className="text-sm text-foreground/60 mt-1">
              {isUploading ? `${progress}%` : 'or click to browse'}
            </p>
          </div>
        </label>
      </div>
    </form>
  );
} 