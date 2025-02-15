import Hero from "@/components/hero";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Home() {
  return (
    <>
      <Hero />
      <main className="flex-1 flex flex-col gap-6 px-4">
        <h2 className="font-medium text-xl mb-4">How it works</h2>
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
        
        <div className="flex justify-center mt-8">
          <Button asChild size="lg" className="px-8">
            <Link href="/sign-in">Get Started</Link>
          </Button>
        </div>
      </main>
    </>
  );
}
