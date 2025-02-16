import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import DocumentList from "@/components/document-list";
import UploadForm from "@/components/upload-form";

export default async function DocumentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // This query runs on every page load/refresh
  const { data: documents } = user ? await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false }) : { data: null };

  return (
    <div className="flex-1 w-full flex flex-col gap-6 items-center">
      <div className="w-full max-w-xl flex flex-col gap-6">
        <h1 className="text-2xl font-semibold">Document Library</h1>
        
        <div className="bg-muted p-6 rounded-lg">
          {user ? (
            <UploadForm />
          ) : (
            <div className="text-center">
              <p className="mb-4">Please sign in to view your documents</p>
              <Link
                href="/sign-in"
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Document List */}
        {documents && documents.length > 0 && user && (
          <DocumentList 
            initialDocuments={documents} 
            userId={user.id}
          />
        )}
      </div>
    </div>
  );
} 