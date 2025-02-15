'use client';

import { createClient } from "@/utils/supabase/client";
import { deleteDocument } from "@/app/actions";
import { useEffect, useState } from "react";

interface Document {
  id: string;
  file_name: string;
  file_path: string;
  created_at: string;
  user_id: string;
}

interface DocumentListProps {
  initialDocuments: Document[];
  userId: string;
}

const DocumentList = ({ initialDocuments, userId }: DocumentListProps) => {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [formattedDates, setFormattedDates] = useState<{[key: string]: string}>({});
  const supabase = createClient();

  useEffect(() => {
    // Format dates on the client side to avoid hydration mismatch
    const dates = documents.reduce((acc, doc) => ({
      ...acc,
      [doc.id]: new Date(doc.created_at).toLocaleDateString()
    }), {});
    setFormattedDates(dates);
  }, [documents]);

  useEffect(() => {
    // Subscribe to changes in the documents table
    const channel = supabase
      .channel('document-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'documents',
          filter: `user_id=eq.${userId}`
        },
        async () => {
          // Fetch the latest documents when any change occurs
          const { data: updatedDocuments } = await supabase
            .from('documents')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
          
          if (updatedDocuments) {
            setDocuments(updatedDocuments);
          }
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-6">Your Documents</h2>
      <div className="space-y-4">
        {documents.map((doc) => (
          <div 
            key={doc.id} 
            className="p-6 border rounded-xl bg-background hover:bg-muted/50 transition"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex flex-col min-w-0">
                <span 
                  className="text-lg font-medium truncate"
                  title={doc.file_name}
                >
                  {doc.file_name}
                </span>
                <span className="text-sm text-muted-foreground mt-1">
                  {formattedDates[doc.id] || ''}
                </span>
              </div>
              <div className="flex gap-3 shrink-0">
                <a
                  href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents/${doc.file_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition whitespace-nowrap"
                >
                  Download
                </a>
                
                <form 
                  action={deleteDocument}
                  className="inline-block"
                >
                  <input type="hidden" name="filePath" value={doc.file_path} />
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition"
                    onClick={(e) => {
                      if (!confirm('Are you sure you want to delete this document?')) {
                        e.preventDefault();
                      }
                    }}
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentList; 