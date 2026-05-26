import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SignInPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#07070a] text-gray-100 font-sans p-6 overflow-hidden">
      
      {/* Background Glow effects */}
      <div className="absolute top-[-10%] left-[-10%] h-[400px] w-[400px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[400px] w-[400px] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-30" />

      {/* Return home link */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 rounded-lg border border-gray-900 bg-gray-950/40 px-4 py-2 text-xs font-semibold text-gray-400 transition-all hover:bg-gray-900/60 hover:text-white hover:border-gray-800 backdrop-blur-sm"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Home
      </Link>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center justify-center">
        
        {/* Logo or Title Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Access your student collaborative workspace
          </p>
        </div>

        {/* Clerk Sign In component */}
        <div className="shadow-[0_0_50px_rgba(99,102,241,0.05)] rounded-2xl overflow-hidden border border-gray-900 bg-gray-950/30 backdrop-blur-md">
          <SignIn 
            appearance={{
              elements: {
                cardBox: "shadow-none border-none bg-transparent",
                card: "bg-transparent shadow-none",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "border border-gray-800 bg-gray-900/20 text-gray-300 hover:bg-gray-800/40 transition-colors",
                socialButtonsBlockButtonText: "text-gray-300 font-semibold",
                dividerLine: "bg-gray-800",
                dividerText: "text-gray-500",
                formFieldLabel: "text-gray-400 font-medium",
                formFieldInput: "border border-gray-800 bg-gray-900/10 text-gray-200 focus:border-indigo-500/50 focus:ring-0",
                formButtonPrimary: "bg-gradient-to-br from-indigo-600 to-purple-600 hover:shadow-[0_4px_15px_rgba(99,102,241,0.3)] transition-all",
                footerActionText: "text-gray-500",
                footerActionLink: "text-indigo-400 hover:text-indigo-300 transition-colors font-semibold",
                identityPreviewText: "text-gray-300",
                identityPreviewEditButtonIcon: "text-indigo-400"
              }
            }}
          />
        </div>

      </div>
    </main>
  );
}
