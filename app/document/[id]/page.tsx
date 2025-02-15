import { createClient } from '@/utils/supabase/server'
import { PDFViewer } from '@/components/pdf-viewer/PDFViewer'
import { notFound, redirect } from 'next/navigation'

interface DocumentPageProps {
  params: {
    id: string
  }
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  const supabase = await createClient()

  // Add auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/sign-in')
  }

  // Add user ownership check
  const { data: document, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id) // Only allow viewing own documents
    .single()

  if (error || !document) {
    console.error('Document not found or unauthorized:', error)
    notFound()
  }

  // Get the signed URL for the document
  const { data, error: signedUrlError } = await supabase
    .storage
    .from('documents')
    .createSignedUrl(document.file_path, 3600) // Changed from storage_path to file_path

  if (signedUrlError || !data?.signedUrl) {
    console.error('Failed to get signed URL:', signedUrlError)
    notFound()
  }

  return (
    <main className="h-screen w-screen flex">
      <div className="w-full h-full p-4">
        <div className="relative bg-white rounded-lg shadow-lg overflow-hidden w-full h-full">
          <PDFViewer 
            url={data.signedUrl}
          />
        </div>
      </div>
    </main>
  )
} 