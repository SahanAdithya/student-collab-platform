// app/projects/[id]/page.tsx
import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Briefcase, Clock, DollarSign, ArrowLeft, Send, Mail, MessageSquare, FileText } from "lucide-react";
import Link from "next/link";
import { sendEmail } from "../../../utils/mail";

// Initialize Supabase client for server-side operations (uses service role key if available to bypass RLS)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    // 1. Clerk async auth check
    const { userId } = await auth();
    if (!userId) redirect("/");

    // 2. Await route parameters in Next 16
    const { id } = await params;

    // Fetch the specific project
    const { data: project, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !project) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#07070a] text-gray-200">
                <Briefcase className="h-10 w-10 text-gray-600 mb-3" />
                <h2 className="text-lg font-bold">Project not found</h2>
                <Link href="/projects" className="mt-4 text-sm text-indigo-400 hover:text-indigo-300">
                    Return to Catalog
                </Link>
            </div>
        );
    }

    // Fetch if current user has any application for this project
    const { data: userApps } = await supabase
        .from("applications")
        .select("*")
        .eq("project_id", id)
        .eq("applicant_id", userId);

    const hasApplied = !!(userApps && userApps.length > 0);
    const isAcceptedCollaborator = !!(userApps && userApps.some(app => app.status === "accepted"));
    const isOwner = project.client_id === userId;
    const canJoinChat = isOwner || isAcceptedCollaborator;

    // Server Action to handle applying
    async function submitApplication(formData: FormData) {
        "use server";

        const message = formData.get("message") as string;
        const contact_email = formData.get("contact_email") as string;

        // Ensure the user exists in profiles (acting as a student here)
        await supabase.from("profiles").upsert({
            id: userId,
            role: 'student'
        }, { onConflict: 'id' });

        // Submit the application
        const { error } = await supabase.from("applications").insert({
            project_id: id,
            applicant_id: userId,
            message,
            contact_email,
        });

        if (error) {
            console.error("Application error:", error);
            return;
        }

        // Auto-send email notification to the client if they have set a contact email
        if (project && project.contact_email) {
            try {
                const subject = `New Application for your project: ${project.title}`;
                const text = `Hello!

A student has just submitted a proposal to collaborate on your project: "${project.title}".

--------------------------------------------------
PROPOSAL MESSAGE:
"${message}"
--------------------------------------------------

CONTACT THE APPLICANT:
You can reach the applicant directly by replying to this email, or writing to their contact email:
👉 ${contact_email}

Best regards,
The CollabHub Team`;

                await sendEmail({
                    to: project.contact_email,
                    subject,
                    text,
                });
            } catch (err) {
                console.error("Failed to send automatic application email notification:", err);
            }
        }

        // Auto-send submission confirmation to the applicant
        if (contact_email) {
            try {
                const subject = `Application Submitted: ${project.title}`;
                const text = `Hello!

Your proposal to collaborate on the project "${project.title}" has been successfully recorded.

--------------------------------------------------
YOUR PROPOSAL:
"${message}"
--------------------------------------------------

What happens next?
The project owner will review your application. If it matches their needs, they will contact you directly at your contact email:
👉 ${contact_email}

Best regards,
The CollabHub Team`;

                await sendEmail({
                    to: contact_email,
                    subject,
                    text,
                });
            } catch (err) {
                console.error("Failed to send applicant submission confirmation email:", err);
            }
        }

        // Redirect to dashboard on success
        redirect("/dashboard");
    }

    return (
        <div className="min-h-screen flex flex-col bg-transparent text-gray-100 font-sans relative overflow-hidden">

            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-indigo-500/5 blur-[150px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-30" />

            {/* Main Content Area */}
            <main className="relative z-10 mx-auto w-full max-w-4xl flex-1 p-6 md:p-12 mt-8">

                <Link 
                    href="/projects" 
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-900 bg-gray-950/40 px-4 py-2 text-xs font-semibold text-gray-400 transition-all hover:bg-gray-900/60 hover:text-white hover:border-gray-800 backdrop-blur-sm mb-8"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to Catalog
                </Link>

                {/* Project Header Card */}
                <div className="glass-card rounded-2xl p-8 mb-8">
                    <div className="mb-4 flex items-center gap-3">
                        <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-400 border border-indigo-500/20">
                            Open Request
                        </span>
                        <span className="flex items-center text-xs text-gray-500">
                            <Clock className="mr-1.5 h-4 w-4" />
                            Posted {new Date(project.created_at).toLocaleDateString()}
                        </span>
                    </div>

                    <h1 className="text-3xl font-extrabold text-white mb-6 leading-tight">{project.title}</h1>

                    <div className="flex flex-wrap gap-3">
                        <div className="inline-flex items-center gap-2 text-emerald-400 font-semibold bg-emerald-500/5 border border-emerald-500/10 rounded-xl px-4 py-2.5 backdrop-blur-sm text-sm">
                            <DollarSign className="h-4.5 w-4.5" />
                            {project.budget || "Unpaid / Portfolio Work"}
                        </div>

                        {project.contact_email && (
                            <a
                                href={`mailto:${project.contact_email}`}
                                className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-semibold bg-indigo-500/5 border border-indigo-500/10 hover:border-indigo-500/30 rounded-xl px-4 py-2.5 backdrop-blur-sm text-sm transition-all"
                            >
                                <Mail className="h-4.5 w-4.5" />
                                {project.contact_email}
                            </a>
                        )}

                        {canJoinChat && (
                            <Link
                                href={`/projects/${project.id}/chat`}
                                className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-semibold bg-purple-500/5 border border-purple-500/10 hover:border-purple-500/30 rounded-xl px-4 py-2.5 backdrop-blur-sm text-sm transition-all"
                            >
                                <MessageSquare className="h-4.5 w-4.5" />
                                Open Workspace Chat
                            </Link>
                        )}
                    </div>
                </div>

                {/* Project Description Scope */}
                <div className="glass-card rounded-2xl p-8 mb-8">
                    <h2 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2 border-b border-gray-900 pb-3">
                        <Briefcase className="h-5 w-5 text-purple-400" />
                        Project Scope
                    </h2>
                    <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                        {project.description}
                    </div>
                </div>

                {/* Project Specifications Card (if exists) */}
                {project.specification_url && (
                    <div className="glass-card rounded-2xl p-8 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 shadow-inner">
                                <FileText className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-200">Project Specifications</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Technical requirements, scopes, and reference diagrams.</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
                            <a
                                href={project.specification_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto text-center rounded-xl bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/20 hover:border-indigo-500/40 px-5 py-3 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-all cursor-pointer"
                            >
                                View PDF Online
                            </a>
                            <a
                                href={project.specification_url}
                                download
                                className="w-full sm:w-auto text-center rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 px-5 py-3 text-xs font-bold text-gray-300 hover:text-white transition-all cursor-pointer"
                            >
                                Download PDF
                            </a>
                        </div>
                    </div>
                )}

                {/* Application Submission Form or Application Status Callout */}
                {!isOwner && (
                    hasApplied ? (
                        <div className="glass-card rounded-2xl p-8 border border-indigo-500/10">
                            <h2 className="text-xl font-bold text-white mb-2">Proposal Status</h2>
                            {isAcceptedCollaborator ? (
                                <div className="mt-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-sm font-semibold flex items-center gap-2.5">
                                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                                    Your application has been accepted! You are now an active collaborator.
                                </div>
                            ) : (
                                <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-400 text-sm font-semibold flex items-center gap-2.5">
                                    <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
                                    Your application is currently pending review by the project owner.
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="glass-card rounded-2xl p-8">
                            <h2 className="text-xl font-bold text-white mb-2">Submit a Proposal</h2>
                            <p className="text-xs text-gray-400 mb-6">Introduce yourself, detail your skill set, and explain why you are the right fit for this project.</p>

                            <form action={submitApplication} className="space-y-5">
                                <div>
                                    <label htmlFor="contact_email" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Your Contact Email</label>
                                    <input
                                        type="email"
                                        name="contact_email"
                                        id="contact_email"
                                        required
                                        className="w-full rounded-xl border border-gray-900 bg-gray-900/10 p-4 text-sm text-gray-100 placeholder-gray-600 focus:border-indigo-500/50 focus:ring-0 focus:outline-none transition-all"
                                        placeholder="e.g., yourname@university.edu"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Proposal Message</label>
                                    <textarea
                                        name="message"
                                        id="message"
                                        required
                                        rows={5}
                                        placeholder="Hi Sahan! I have active experience building e-commerce frontends with React and custom CSS layouts, and would love to collaborate..."
                                        className="w-full rounded-xl border border-gray-900 bg-gray-900/10 p-4 text-sm text-gray-100 placeholder-gray-600 focus:border-indigo-500/50 focus:ring-0 focus:outline-none focus:bg-gray-900/20 transition-all resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="group flex w-full md:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-8 py-3.5 text-sm font-bold text-white transition-all hover:shadow-[0_4px_15px_rgba(99,102,241,0.3)] cursor-pointer"
                                >
                                    <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                    Send Application
                                </button>
                            </form>
                        </div>
                    )
                )}

            </main>
        </div>
    );
}