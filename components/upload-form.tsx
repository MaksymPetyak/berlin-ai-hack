'use client';

import { uploadDocument } from "@/app/actions";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

export default function UploadForm() {
  return (
    <form action={uploadDocument} className="flex flex-col gap-4">
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
              alert('File size exceeds 10MB limit');
              e.target.value = '';
            }
          }}
        />
      </div>
      
      <button
        type="submit"
        className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition"
      >
        Upload Document
      </button>
    </form>
  );
} 