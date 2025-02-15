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
    .eq('user_id', user.id)
    .single()

  if (error || !document) {
    console.error('Document not found or unauthorized:', error)
    notFound()
  }

  // Get the signed URL for the document
  const { data, error: signedUrlError } = await supabase
    .storage
    .from('documents')
    .createSignedUrl(document.file_path, 3600)

  if (signedUrlError || !data?.signedUrl) {
    console.error('Failed to get signed URL:', signedUrlError)
    notFound()
  }

  // Fetch user's profile data
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('Error fetching user profile:', profileError)
  }

  // Format profile data into a knowledge base string
  const knowledgeBase = profile ? [
    `First Name: ${profile.first_name || ''}`,
    `Last Name: ${profile.last_name || ''}`,
    `Birthday: ${profile.birthday || ''}`,
    `Phone Number: ${profile.phone_number || ''}`,
    `Address: ${profile.address || ''}`,
    // Add custom fields if they exist
    ...Object.entries(profile.custom_fields || {}).map(([key, value]) => `${key}: ${value}`)
  ].join('\n') : ''

  console.log("Knowledge Base: ", knowledgeBase)

  return (
    <div className="min-w-screen h-full">
      <PDFViewer
        url={data.signedUrl}
        knowledgeBase={knowledgeBase}
      />
    </div>
  )
} 