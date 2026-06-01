// app/manage/[id]/page.tsx
import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CheckCircle, XCircle, ArrowLeft, FileText, User as UserIcon, Trash2, Mail } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { sendEmail } from "../../../utils/mail";

// Initialize Supabase client for server-side operations (uses service role key if available to bypass RLS)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function ManageProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { userId } = await auth();
    if (!userId) redirect("/");

    const { id } = await params;

    // 1. Fetch the project and ensure the current user is the owner
    const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

    if (projectError || !project) {
        return <div className="p-12 text-center text-white">Project not found.</div>;
    }

    if (project.client_id !== userId) {
        return <div className="p-12 text-center text-red-500">Unauthorized: You do not own this project.</div>;
    }

    // 2. Fetch all applications for this project
    const { data: applications } = await supabase
        .from("applications")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: false });

    // 3. SERVER ACTION: Accept an application
    async function acceptApplication(formData: FormData) {
        "use server";
        const applicationId = formData.get("applicationId") as string;
        const projectId = id;

        // Fetch all current applications to get contact emails before updating
        const { data: allApplications } = await supabase
            .from("applications")
            .select("*")
            .eq("project_id", projectId);

        // Mark selected application as accepted
        await supabase.from("applications").update({ status: "accepted" }).eq("id", applicationId);

        // Mark the project as in-progress
        await supabase.from("projects").update({ status: "in-progress" }).eq("id", projectId);

        // Auto-reject all other pending applications
        await supabase.from("applications").update({ status: "rejected" }).eq("project_id", projectId).eq("status", "pending");

        // Send out status email alerts
        if (allApplications && allApplications.length > 0) {
            for (const app of allApplications) {
                if (app.id === applicationId) {
                    // Send Acceptance Congratulatory email to selected candidate
                    if (app.contact_email) {
                        try {
                            const subject = `Congratulations! Your proposal for "${project.title}" has been accepted!`;
                            const text = `Hello!

We are excited to inform you that your proposal to collaborate on the project "${project.title}" has been ACCEPTED by the project owner!

You can now start collaborating together. The project owner will contact you shortly at this email address to coordinate.

Best regards,
The CollabHub Team`;

                            await sendEmail({
                                to: app.contact_email,
                                subject,
                                text,
                            });
                        } catch (err) {
                            console.error("Failed to send applicant acceptance email:", err);
                        }
                    }
                } else if (app.status === "pending") {
                    // Send Project Closed notification to rejected candidates
                    if (app.contact_email) {
                        try {
                            const subject = `Update on your proposal for "${project.title}"`;
                            const text = `Hello,

Thank you for your interest in collaborating on the project "${project.title}".

We wanted to let you know that the project owner has selected another collaborator for this role, and the project is now closed.

We encourage you to explore the other active requests in the Project Catalog! There are always exciting opportunities waiting for your skills.

Best regards,
The CollabHub Team`;

                            await sendEmail({
                                to: app.contact_email,
                                subject,
                                text,
                            });
                        } catch (err) {
                            console.error("Failed to send applicant rejection email:", err);
                        }
                    }
                }
            }
        }

        revalidatePath(`/manage/${projectId}`);
    }

    // 4. SERVER ACTION: Reject an application
    async function rejectApplication(formData: FormData) {
        "use server";
        const applicationId = formData.get("applicationId") as string;
        await supabase.from("applications").update({ status: "rejected" }).eq("id", applicationId);
        revalidatePath(`/manage/${id}`);
    }

    // 5. SERVER ACTION: Delete the project
    async function deleteProject() {
        "use server";

        // Delete all associated applications first to maintain DB integrity
        await supabase.from("applications").delete().eq("project_id", id);

        // Delete the project
        const { error } = await supabase.from("projects").delete().eq("id", id);

        if (error) {
            console.error("Error deleting project:", error);
            return;
        }

        redirect("/dashboard");
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#07070a] text-gray-100 font-sans relative overflow-hidden">

            {/* Ambient Glow */}
            <div className="absolute top-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[150px] pointer-events-none" />

            <main className="relative z-10 mx-auto w-full max-w-4xl flex-1 p-6 md:p-12 mt-4">

                <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-indigo-400 transition-colors mb-8">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>

                {/* Header */}
                <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-gray-900 pb-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white mb-2">Manage Applications</h1>
                        <p className="text-gray-400">Reviewing proposals for: <span className="font-semibold text-indigo-400">{project.title}</span></p>

                        <div className="mt-4 inline-flex items-center rounded-full bg-gray-900/80 px-3 py-1 text-xs font-semibold border border-gray-800">
                            Project Status:
                            <span className={`ml-2 ${project.status === 'open' ? 'text-emerald-400' : 'text-indigo-400'}`}>
                                {project.status.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <form action={deleteProject}>
                        <button
                            type="submit"
                            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-red-950/20 text-red-400 border border-red-500/20 hover:bg-red-900/20 hover:border-red-500/40 px-5 py-3 text-sm font-bold transition-all shadow-[0_0_20px_rgba(239,68,68,0.02)] cursor-pointer"
                        >
                            <Trash2 className="h-4 w-4" /> Delete Project
                        </button>
                    </form>
                </div>

                {/* Applications Feed */}
                <div className="space-y-6">
                    {applications && applications.length > 0 ? (
                        applications.map((app) => (
                            <div key={app.id} className="rounded-2xl border border-gray-900 bg-gray-950/40 p-6 backdrop-blur-sm transition-all hover:border-gray-800">
                                <div className="flex flex-col md:flex-row gap-6 justify-between">

                                    {/* Applicant Info & Message */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 border border-gray-800 text-gray-400">
                                                <UserIcon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-200 flex flex-wrap items-center gap-2">
                                                    Applicant ID: {app.applicant_id.slice(-6)}
                                                    {app.contact_email && (
                                                        <a
                                                            href={`mailto:${app.contact_email}`}
                                                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10 hover:text-indigo-300 border border-indigo-500/10 hover:border-indigo-500/30 rounded-md px-2 py-0.5 transition-all"
                                                        >
                                                            <Mail className="h-3 w-3" />
                                                            {app.contact_email}
                                                        </a>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500">Applied {new Date(app.created_at).toLocaleDateString()}</div>
                                            </div>
                                        </div>

                                        <div className="rounded-xl bg-gray-900/50 p-4 border border-gray-800/50">
                                            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                                <FileText className="h-4 w-4" />
                                                Proposal
                                            </div>
                                            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                                                {app.message}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Buttons & Status */}
                                    <div className="flex flex-col justify-center items-end min-w-[140px] border-t md:border-t-0 md:border-l border-gray-900/50 pt-4 md:pt-0 md:pl-6">
                                        {app.status === "pending" && project.status === "open" ? (
                                            <div className="flex flex-col gap-3 w-full">
                                                <form action={acceptApplication}>
                                                    <input type="hidden" name="applicationId" value={app.id} />
                                                    <button type="submit" className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 px-4 py-2.5 text-sm font-bold transition-all hover:bg-emerald-600/30 hover:border-emerald-500/50">
                                                        <CheckCircle className="h-4 w-4" /> Accept
                                                    </button>
                                                </form>

                                                <form action={rejectApplication}>
                                                    <input type="hidden" name="applicationId" value={app.id} />
                                                    <button type="submit" className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-600/10 text-red-400 border border-red-500/20 px-4 py-2.5 text-sm font-bold transition-all hover:bg-red-600/20 hover:border-red-500/40">
                                                        <XCircle className="h-4 w-4" /> Reject
                                                    </button>
                                                </form>
                                            </div>
                                        ) : (
                                            <div className="w-full flex items-center justify-center py-3 rounded-xl border border-gray-800 bg-gray-900/50">
                                                {app.status === "accepted" && <span className="text-emerald-400 font-bold text-sm flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Accepted</span>}
                                                {app.status === "rejected" && <span className="text-gray-500 font-bold text-sm flex items-center gap-2"><XCircle className="h-4 w-4" /> Rejected</span>}
                                                {app.status === "pending" && project.status !== "open" && <span className="text-gray-500 font-bold text-sm">Closed</span>}
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="rounded-2xl border border-dashed border-gray-800 bg-gray-950/20 py-16 text-center">
                            <p className="text-gray-400">No applications received yet.</p>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}