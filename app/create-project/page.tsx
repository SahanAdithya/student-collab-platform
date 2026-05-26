// app/create-project/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Briefcase, ArrowLeft, Send } from "lucide-react";
import Link from "next/link";

// Initialize Supabase client for server-side operations (uses service role key if available to bypass RLS)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function CreateProjectPage() {
    // 1. Check if the user is logged in via Clerk (await required in Next 16)
    const { userId } = await auth();
    if (!userId) redirect("/");

    // 2. Define the Server Action to handle the form submission
    async function submitProject(formData: FormData) {
        "use server"; // This tells Next.js to run this securely on the server

        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const budget = formData.get("budget") as string;

        // First, ensure the user exists in our Supabase profiles table
        // (In a production app, we'd do this via a Clerk Webhook, but this works for our MVP!)
        await supabase.from("profiles").upsert({
            id: userId,
            role: 'client' // Assuming anyone posting a project is acting as a client
        }, { onConflict: 'id' });

        // Insert the new project
        const { error } = await supabase.from("projects").insert({
            client_id: userId,
            title,
            description,
            budget,
        });

        if (error) {
            console.error("Error creating project:", error);
            return;
        }

        // Redirect back to the dashboard after posting
        redirect("/dashboard");
    }

    return (
        <div className="min-h-screen bg-[#07070a] text-gray-100 font-sans py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex items-center justify-center">
            
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-30" />

            {/* Return Link */}
            <Link
                href="/dashboard"
                className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 rounded-lg border border-gray-900 bg-gray-950/40 px-4 py-2 text-xs font-semibold text-gray-400 transition-all hover:bg-gray-900/60 hover:text-white hover:border-gray-800 backdrop-blur-sm"
            >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Dashboard
            </Link>

            <div className="relative z-10 w-full max-w-2xl bg-gray-950/20 p-8 rounded-2xl border border-gray-900 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
                
                {/* Header */}
                <div className="flex items-center gap-3.5 mb-6 border-b border-gray-900 pb-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-md">
                        <Briefcase className="h-5.5 w-5.5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Post a New Project</h1>
                        <p className="text-xs text-gray-500 mt-1">Share your project scope. High-caliber students will collaborate to bring it to life.</p>
                    </div>
                </div>

                {/* Form */}
                <form action={submitProject} className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Project Title</label>
                        <input
                            type="text"
                            name="title"
                            id="title"
                            required
                            className="w-full rounded-xl border border-gray-900 bg-gray-900/10 px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:border-indigo-500/50 focus:ring-0 focus:outline-none focus:bg-gray-900/20 transition-all"
                            placeholder="e.g., E-commerce Website Frontend"
                        />
                    </div>

                    <div>
                        <label htmlFor="budget" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Estimated Budget / Reward</label>
                        <input
                            type="text"
                            name="budget"
                            id="budget"
                            className="w-full rounded-xl border border-gray-900 bg-gray-900/10 px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:border-indigo-500/50 focus:ring-0 focus:outline-none focus:bg-gray-900/20 transition-all"
                            placeholder="e.g., stipend of $250, course credit, or Unpaid"
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Project Description & Requirements</label>
                        <textarea
                            name="description"
                            id="description"
                            rows={5}
                            required
                            className="w-full rounded-xl border border-gray-900 bg-gray-900/10 px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:border-indigo-500/50 focus:ring-0 focus:outline-none focus:bg-gray-900/20 transition-all resize-none"
                            placeholder="Explain the technical stack needed, functional requirements, and what the final deliverable looks like..."
                        />
                    </div>

                    <button
                        type="submit"
                        className="group w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 py-4 text-sm font-semibold text-white transition-all hover:shadow-[0_4px_20px_rgba(99,102,241,0.3)] cursor-pointer"
                    >
                        <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        Publish Project
                    </button>
                </form>
            </div>
        </div>
    );
}