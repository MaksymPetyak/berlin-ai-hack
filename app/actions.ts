"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { CustomField } from "@/lib/types";


export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link.",
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/protected");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

export const createArticle = async (formData: FormData) => {
  const supabase = await createClient();
  const title = formData.get('title');
  const content = formData.get('content');
  
  const { data, error } = await supabase
    .from('articles')
    .insert([{ title, content }]);
};

export const createKnowledgeEntry = async (formData: FormData) => {
  const supabase = await createClient();
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return encodedRedirect("error", "/sign-in", "Must be logged in");
  }

  const { data, error } = await supabase
    .from('knowledge_entries')
    .insert([{ 
      title, 
      content,
      user_id: user.id 
    }]);

  if (error) {
    return encodedRedirect("error", "/knowledge", error.message);
  }

  return encodedRedirect("success", "/knowledge", "Entry created successfully");
};

export const updateUserProfile = async (formData: FormData) => {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.log("No user found");
    return encodedRedirect("error", "/sign-in", "Must be logged in");
  }

  // Get custom fields
  const customKeys = formData.getAll('custom_keys[]');
  const customValues = formData.getAll('custom_values[]');
  
  // Create custom fields object
  const customFields = customKeys.reduce((acc, key, index) => {
    if (key && customValues[index]) {
      const value = customValues[index]?.toString() || '';
      // Attempt to convert to number if possible
      const numValue = Number(value);
      acc[key.toString()] = !isNaN(numValue) ? numValue : value;
    }
    return acc;
  }, {} as Record<string, string | number>);

  const profileData = { 
    id: user.id,
    first_name: formData.get('first_name') as string,
    last_name: formData.get('last_name') as string,
    birthday: formData.get('birthday') as string,
    phone_number: formData.get('phone_number') as string,
    address: formData.get('address') as string,
    custom_fields: customFields,
    updated_at: new Date().toISOString()
  };

  console.log("Attempting to save profile:", profileData);

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert(profileData);

  if (error) {
    console.error("Supabase error:", error);
    return encodedRedirect("error", "/protected/profile", error.message);
  }

  console.log("Profile updated successfully:", data);
  return encodedRedirect("success", "/protected/profile", "Profile updated successfully");
};

// We need to make sure uploadDocument returns this shape:
type UploadResult = {
  documentId?: string;
  error?: string;
}

export async function uploadDocument(formData: FormData): Promise<UploadResult> {
  // Add type definition for better error handling
  interface UploadResult {
    documentId?: string;
    error?: string;
  }

  const supabase = await createClient();
  
  // Add error handling for file type
  const file = formData.get('document') as File;
  if (!file || !file.type.includes('pdf')) {
    return { error: "Only PDF files are allowed" };
  }

  // Add size check on server side too
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_FILE_SIZE) {
    return { error: "File size exceeds 10MB limit" };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to upload documents" };
  }

  // Convert the file to ArrayBuffer for upload
  const arrayBuffer = await file.arrayBuffer();
  const fileBuffer = new Uint8Array(arrayBuffer);

  // Generate a unique filename
  const timestamp = Date.now();
  const fileName = `${user.id}-${timestamp}-${file.name}`;

  // Upload file to Supabase Storage
  const { data, error } = await supabase
    .storage
    .from('documents')
    .upload(fileName, fileBuffer, {
      contentType: file.type
    });

  if (error) {
    return { error: "Failed to upload document" };
  }

  // Save document metadata to database
  const { data: documentData, error: dbError } = await supabase
    .from('documents')
    .insert({
      user_id: user.id,
      file_name: file.name,
      file_path: data.path,
      file_size: file.size,
    })
    .select()
    .single();

  if (dbError) {
    // If database insert fails, try to delete the uploaded file
    await supabase.storage.from('documents').remove([data.path]);
    return { error: "Failed to save document metadata" };
  }

  revalidatePath('/documents');
  return { documentId: documentData.id };
}

export async function deleteDocument(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return encodedRedirect("error", "/documents", "You must be logged in to delete documents");
  }

  const filePath = formData.get('filePath') as string;
  
  // First, check if the document exists and get its ID
  const { data: existingDoc, error: fetchError } = await supabase
    .from('documents')
    .select('id, file_path')
    .eq('file_path', filePath)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !existingDoc) {
    console.error('No document found:', { filePath, error: fetchError });
    return encodedRedirect("error", "/documents", "Document not found");
  }

  // Delete using the document ID instead of file_path
  const { data: deletedData, error: dbError } = await supabase
    .from('documents')
    .delete()
    .eq('id', existingDoc.id)  // Use ID for more reliable deletion
    .select();

  console.log('Database deletion result:', {
    deletedData,
    error: dbError,
    documentId: existingDoc.id
  });

  if (dbError) {
    console.error('Database deletion error:', dbError);
    return encodedRedirect("error", "/documents", "Failed to delete document metadata");
  }

  // Only delete from storage if database deletion was successful
  if (deletedData && deletedData.length > 0) {
    const { error: storageError } = await supabase
      .storage
      .from('documents')
      .remove([filePath]);

    if (storageError) {
      console.error('Storage deletion error:', storageError);
      // Consider recreating the database record if storage deletion fails
    }
  }

  revalidatePath('/documents');
  return encodedRedirect("success", "/documents", "Document deleted successfully");
}

export async function getUserProfile() {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return null;
    }

    // Get profile data including custom fields
    const { data: profile, error } = await supabase
        .from('user_profiles')
        .select(`
            id,
            first_name,
            last_name,
            email,
            phone_number,
            address,
            birthday,
            custom_fields,
            updated_at,
            created_at
        `)
        .eq('id', user.id)
        .single();

    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }

    // Process custom fields to ensure they match the CustomField interface
    const processedCustomFields = Object.entries(profile.custom_fields || {}).reduce((acc, [key, field]) => {
        const fieldObject = field as { id?: string; label?: string; type?: any; value?: string };
        if (typeof fieldObject === 'object' && fieldObject !== null) {
            acc[key] = {
                // @ts-ignore
                id: fieldObject.id || key,
                label: fieldObject.label || key,
                type: fieldObject.type || 'text',
                value: fieldObject.value || ''
            };
        }
        return acc;
    }, {} as Record<string, CustomField>);

    return {
        ...profile,
        email: user.email,
        custom_fields: processedCustomFields
    };
}
