import Hero from "@/components/hero";
import PDFViewer from "@/components/pdf-viewer/PDFViewer";
import ConnectSupabaseSteps from "@/components/tutorial/connect-supabase-steps";
import SignUpUserSteps from "@/components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";

export default async function Home() {
  return (
    <div className="w-full min-w-[1000px] h-screen">
      <PDFViewer url="/MIA_Gesuchsform_Aufrechterhaltung_Niederlassungsbew_05_2021 (1).pdf" />
    </div>
  );
}
