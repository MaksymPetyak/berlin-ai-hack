import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <h2 className="font-bold text-2xl mb-8">Getting Started</h2>
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
  );
}
