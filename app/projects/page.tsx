// app/projects/page.tsx
import { createClient } from "@supabase/supabase-js";
import { Briefcase, Clock, DollarSign, ArrowRight, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import SearchInput from "./SearchInput";

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// We want Next.js to dynamically render this page so new projects appear immediately
export const dynamic = "force-dynamic";

export default async function ProjectsCatalog({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>
}) {
    // Await the Next.js 16 search parameters
    const { q } = await searchParams;
    const searchQuery = typeof q === "string" ? q.trim() : "";

    // Build the Supabase query builder
    let dbQuery = supabase
        .from("projects")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false });

    // Apply filters if search term exists
    if (searchQuery) {
        dbQuery = dbQuery.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }

    const { data: projects, error } = await dbQuery;

    if (error) {
        console.error("Error fetching projects:", error);
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#07070a] text-gray-100 font-sans relative overflow-hidden">

            {/* Ambient Background Glows */}
            <div className="absolute top-[-20%] left-[20%] h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-5%] h-[600px] w-[600px] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

            {/* Top Navigation */}
            <nav className="relative z-10 flex items-center justify-between border-b border-gray-900 bg-gray-950/20 px-6 py-4 backdrop-blur-md">
                <Link href="/dashboard" className="flex items-center gap-2.5 text-xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-md">
                        <LayoutDashboard className="h-4.5 w-4.5" />
                    </div>
                    CollabHub
                </Link>
                <UserButton
                    appearance={{
                        elements: {
                            userButtonAvatarBox: "h-9 w-9 border border-gray-800 hover:border-indigo-500/50 transition-colors shadow-sm"
                        }
                    }}
                />
            </nav>

            {/* Main Content Area */}
            <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 p-6 md:p-8">

                {/* Header Section */}
                <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-white">Project Catalog</h1>
                        <p className="mt-2 text-sm text-gray-400">Discover active collaboration requests and build your portfolio.</p>
                    </div>
                    <SearchInput />
                </div>

                {/* Project Grid */}
                {projects && projects.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project) => (
                            <div key={project.id} className="group flex flex-col justify-between rounded-2xl border border-gray-900 bg-gray-950/20 p-6 backdrop-blur-sm transition-all hover:border-indigo-500/50 hover:bg-gray-950/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-indigo-500/10">
                                <div>
                                    <div className="mb-4 flex items-center justify-between">
                                        <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-400 border border-indigo-500/20">
                                            Open Request
                                        </span>
                                        <span className="flex items-center text-xs text-gray-500">
                                            <Clock className="mr-1 h-3.5 w-3.5" />
                                            {new Date(project.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="mb-2 text-lg font-bold text-gray-100 line-clamp-1">{project.title}</h3>
                                    <p className="mb-6 text-sm text-gray-400 line-clamp-3 leading-relaxed">
                                        {project.description}
                                    </p>
                                </div>

                                <div className="mt-auto border-t border-gray-900/50 pt-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center text-sm font-medium text-emerald-400">
                                            <DollarSign className="mr-1 h-4 w-4" />
                                            {project.budget || "Unpaid / Portfolio"}
                                        </div>
                                        {/* Updated Button to Link */}
                                        <Link
                                            href={`/projects/${project.id}`}
                                            className="flex items-center text-sm font-medium text-gray-300 transition-colors group-hover:text-indigo-400"
                                        >
                                            View & Apply <ArrowRight className="ml-1 h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-800 bg-gray-950/10 py-24 text-center">
                        <div className="mb-4 rounded-full bg-gray-900/50 p-4 shadow-inner">
                            <Briefcase className="h-8 w-8 text-gray-500" />
                        </div>
                        <h3 className="mb-1 text-lg font-semibold text-gray-200">No projects available</h3>
                        <p className="text-sm text-gray-500">Check back later or post a new request yourself.</p>
                    </div>
                )}

            </main>
        </div>
    );
}