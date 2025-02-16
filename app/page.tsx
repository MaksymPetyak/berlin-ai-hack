import { PlusIcon } from "lucide-react";
import Link from "next/link";
import Image from 'next/image';
import { createClient } from "@/utils/supabase/server";
import UploadForm from "@/components/upload-form";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex-1 w-full flex flex-col gap-8 max-w-5xl mx-auto px-5">
      {/* Hero Section */}
      <div className="grid md:grid-cols-2 items-center gap-4 py-4">
        {/* Left side: Text */}
        <div className="flex flex-col justify-center text-center md:text-left">
          <h1 className="text-3xl font-bold mb-2">Welcome to Formzilla</h1>
          <p className="text-lg text-foreground/80">Make your paperwork go poof✨</p>
        </div>
        
        {/* Right side: Image */}
        <div className="flex justify-center items-center">
          <Image
            src="/Overworked-Employee-3--Streamline-Milano.png"
            alt="Overworked Employee"
            width={200}
            height={200}
            className="object-contain"
            priority
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <div className="grid md:grid-cols-2 h-full">
          {/* Left side: Upload Zone */}
          <div className="p-8 border-r">
            {user ? (
              <UploadForm />
            ) : (
              <div className="h-full border border-dashed border-foreground/20 rounded-lg flex items-center justify-center hover:border-foreground/40 transition-colors">
                <Link href="/sign-in" className="w-full h-full flex items-center justify-center">
                  <label className="cursor-pointer flex flex-col items-center justify-center gap-4 p-12">
                    <div className="border rounded-lg p-4">
                      <PlusIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-medium">Drop your PDF here</p>
                      <p className="text-sm text-foreground/60 mt-1">or click to browse</p>
                    </div>
                  </label>
                </Link>
              </div>
            )}
          </div>

          {/* Right side: Getting Started Steps */}
          <div className="p-8">
            <h2 className="font-bold text-2xl mb-8">How it works</h2>
            <ol className="flex flex-col gap-6">
              <li className="flex gap-4 items-start">
                <div className="flex-none bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">1</div>
                <div>
                  <h3 className="font-semibold mb-2">Sign up / Login</h3>
                  <p className="text-foreground/80">Create your account or sign in to get started</p>
                </div>
              </li>
              <li className="flex gap-4 items-start">
                <div className="flex-none bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">2</div>
                <div>
                  <h3 className="font-semibold mb-2">Set up your profile</h3>
                  <p className="text-foreground/80">Add your personal information to streamline future forms</p>
                </div>
              </li>
              <li className="flex gap-4 items-start">
                <div className="flex-none bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">3</div>
                <div>
                  <h3 className="font-semibold mb-2">Upload your document</h3>
                  <p className="text-foreground/80">Upload any bureaucratic document you need help with</p>
                </div>
              </li>
              <li className="flex gap-4 items-start">
                <div className="flex-none bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">4</div>
                <div>
                  <h3 className="font-semibold mb-2">Magic ✨</h3>
                  <p className="text-foreground/80">Let us handle the paperwork for you</p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
