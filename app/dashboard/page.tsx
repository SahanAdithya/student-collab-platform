// app/dashboard/page.tsx
"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { LayoutDashboard, Briefcase, User as UserIcon, Calendar, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { createClient } from "../../utils/supabase/client";

// Initialize Supabase Client
const supabase = createClient();

export default function DashboardPage() {
    const { isLoaded, isSignedIn, user } = useUser();

    // Profile State
    const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);

    // Collaborations State
    const [myProjects, setMyProjects] = useState<Record<string, unknown>[]>([]);
    const [myApplications, setMyApplications] = useState<Record<string, unknown>[]>([]);
    const [collabsLoading, setCollabsLoading] = useState(true);

    // Fetch user's profile and active collaborations on mount
    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                // 1. Fetch profile
                const { data: profileData, error: profileError } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .single();

                if (!profileError && profileData) {
                    setProfile(profileData);
                }

                // 2. Fetch projects posted by the user
                const { data: projectsData, error: projectsError } = await supabase
                    .from("projects")
                    .select("*")
                    .eq("client_id", user.id)
                    .order("created_at", { ascending: false });

                if (!projectsError && projectsData) {
                    setMyProjects(projectsData);
                }

                // 3. Fetch applications submitted by the user (with joined project details)
                const { data: appsData, error: appsError } = await supabase
                    .from("applications")
                    .select(`
                        *,
                        project:projects (
                            title,
                            status,
                            budget
                        )
                    `)
                    .eq("applicant_id", user.id)
                    .order("created_at", { ascending: false });

                if (!appsError && appsData) {
                    setMyApplications(appsData);
                }

            } catch (err) {
                console.error("Error fetching dashboard data:", err);
            } finally {
                setProfileLoading(false);
                setCollabsLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (!isLoaded || profileLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#07070a] text-gray-100">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
            </div>
        );
    }

    if (!isSignedIn || !user) {
        return null; // Guarded by OnboardingGuard & clerkMiddleware
    }

    // Render Full Dashboard once profile exists
    return (
        <div className="min-h-screen flex flex-col bg-transparent text-gray-100 font-sans relative overflow-hidden">

            {/* Ambient Background Glows */}
            <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

            {/* Top Navigation */}
            <nav className="relative z-10 flex items-center justify-between border-b border-gray-900 bg-gray-950/20 px-6 py-4 backdrop-blur-md">
                <div className="flex items-center gap-2.5 text-xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-md">
                        <LayoutDashboard className="h-4.5 w-4.5" />
                    </div>
                    CollabHub
                </div>

                <div className="flex items-center gap-4">
                    <UserButton
                        appearance={{
                            elements: {
                                userButtonAvatarBox: "h-9 w-9 border border-gray-800 hover:border-indigo-500/50 transition-colors shadow-sm"
                            }
                        }}
                    />
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 p-6 md:p-8">

                {/* Hero Greeting Panel */}
                <div className="mb-10 rounded-2xl border border-gray-900 bg-gradient-to-r from-gray-950/40 via-gray-950/20 to-transparent p-6 md:p-8 backdrop-blur-sm shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                Welcome Back, {profile?.first_name || user.firstName || "Collaborator"}!
                            </h1>
                            <p className="mt-1.5 text-sm text-gray-500 flex items-center gap-1.5">
                                <ShieldCheck className="h-4 w-4 text-emerald-400/80" />
                                Secured via Clerk Auth • {user.primaryEmailAddress?.emailAddress}
                            </p>
                        </div>
                        <div className="flex items-center gap-3 self-start md:self-auto text-xs text-gray-400 border border-gray-800 bg-gray-950/40 rounded-xl px-4 py-2.5 backdrop-blur-sm">
                            <Calendar className="h-4 w-4 text-indigo-400" />
                            Joined {new Date(user.createdAt!).toLocaleDateString("en-US", { month: "short", year: "numeric", day: "numeric" })}
                        </div>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                    {/* Left & Middle Column: Projects Panel */}
                    <div className="lg:col-span-2 glass-card rounded-2xl p-6 flex flex-col justify-between">
                        <div>
                            <div className="mb-6 flex items-center gap-2 border-b border-gray-900 pb-4">
                                <Briefcase className="h-5 w-5 text-indigo-400" />
                                <h2 className="text-lg font-bold text-gray-200">Active Collaborations</h2>
                            </div>
                            {collabsLoading ? (
                                <div className="flex justify-center items-center py-12">
                                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
                                </div>
                            ) : myProjects.length > 0 || myApplications.length > 0 ? (
                                <div className="space-y-6 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                                    {/* Projects posted by user */}
                                    {myProjects.length > 0 && (
                                        <div className="space-y-3">
                                            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Your Posted Projects</h3>
                                            {myProjects.map((proj) => (
                                                <div key={proj.id} className="flex items-center justify-between p-3.5 rounded-xl border border-gray-900 bg-gray-950/20 backdrop-blur-sm hover:border-gray-800 transition-all">
                                                    <div>
                                                        <h4 className="text-sm font-bold text-gray-200">{proj.title}</h4>
                                                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                                            <span className="text-emerald-400 font-medium">{proj.budget || "Portfolio Work"}</span>
                                                            <span>•</span>
                                                            <span className={proj.status === 'open' ? 'text-indigo-400 capitalize' : 'text-purple-400 capitalize'}>{proj.status}</span>
                                                        </div>
                                                    </div>
                                                    <Link
                                                        href={`/manage/${proj.id}`}
                                                        className="text-xs font-semibold text-indigo-400 border border-indigo-500/20 hover:border-indigo-500/40 bg-indigo-500/5 hover:bg-indigo-500/10 rounded-lg px-3 py-1.5 transition-all"
                                                    >
                                                        Manage
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Applications submitted by user */}
                                    {myApplications.length > 0 && (
                                        <div className="space-y-3 pt-2">
                                            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Your Submitted Proposals</h3>
                                            {myApplications.map((app) => (
                                                <div key={app.id} className="flex items-center justify-between p-3.5 rounded-xl border border-gray-900 bg-gray-950/20 backdrop-blur-sm hover:border-gray-800 transition-all">
                                                    <div>
                                                        <h4 className="text-sm font-bold text-gray-200">{app.project?.title || "Unknown Project"}</h4>
                                                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                                            <span className="text-emerald-400 font-medium">{app.project?.budget || "Portfolio Work"}</span>
                                                            <span>•</span>
                                                            <span>Applied {new Date(app.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {app.status === "accepted" ? (
                                                            <>
                                                                <Link
                                                                    href={`/projects/${app.project_id}`}
                                                                    className="text-xs font-semibold text-indigo-400 border border-indigo-500/20 hover:border-indigo-500/40 bg-indigo-500/5 hover:bg-indigo-500/10 rounded-lg px-3 py-1.5 transition-all cursor-pointer"
                                                                >
                                                                    View Project
                                                                </Link>
                                                                <Link
                                                                    href={`/projects/${app.project_id}/chat`}
                                                                    className="text-xs font-semibold text-purple-400 border border-purple-500/20 hover:border-purple-500/40 bg-purple-500/5 hover:bg-purple-500/10 rounded-lg px-3 py-1.5 transition-all cursor-pointer"
                                                                >
                                                                    Open Chat
                                                                </Link>
                                                                <span className="inline-flex items-center rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400 border border-emerald-500/25">
                                                                    Accepted
                                                                </span>
                                                            </>
                                                        ) : app.status === "rejected" ? (
                                                            <>
                                                                <Link
                                                                    href={`/projects/${app.project_id}`}
                                                                    className="text-xs font-semibold text-gray-500 border border-gray-800 hover:border-gray-700 bg-gray-950/20 hover:bg-gray-900/40 rounded-lg px-3 py-1.5 transition-all cursor-pointer"
                                                                >
                                                                    View
                                                                </Link>
                                                                <span className="inline-flex items-center rounded-lg bg-gray-900/80 px-2.5 py-1 text-[10px] font-bold text-gray-500 border border-gray-800">
                                                                    Closed
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Link
                                                                    href={`/projects/${app.project_id}`}
                                                                    className="text-xs font-semibold text-indigo-400 border border-indigo-500/20 hover:border-indigo-500/40 bg-indigo-500/5 hover:bg-indigo-500/10 rounded-lg px-3 py-1.5 transition-all cursor-pointer"
                                                                >
                                                                    View
                                                                </Link>
                                                                <span className="inline-flex items-center rounded-lg bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold text-amber-400 border border-amber-500/25">
                                                                    Pending
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="h-12 w-12 rounded-xl bg-gray-900/40 border border-gray-800 flex items-center justify-center text-gray-400 mb-4 shadow-inner">
                                        <Briefcase className="h-5 w-5" />
                                    </div>
                                    <p className="text-sm font-semibold text-gray-300">No active projects yet</p>
                                    <p className="text-xs text-gray-500 max-w-xs mt-1">Ready to start? Discover active requests from fellow students or construct a new proposal.</p>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 flex flex-col sm:flex-row gap-3">
                            <Link
                                href="/projects"
                                className="flex-1 block text-center rounded-xl bg-gradient-to-br from-indigo-600/80 to-purple-600/80 hover:from-indigo-600 hover:to-purple-600 py-3 text-sm font-semibold text-white transition-all hover:shadow-[0_4px_15px_rgba(99,102,241,0.25)]"
                            >
                                Browse Project Catalog
                            </Link>
                            <Link
                                href="/create-project"
                                className="flex-1 block text-center rounded-xl border border-gray-700 bg-gray-900/50 hover:bg-gray-800 py-3 text-sm font-semibold text-gray-300 transition-all"
                            >
                                Post a New Project
                            </Link>
                        </div>
                    </div>

                    {/* Right Column: User Profile Panel */}
                    <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
                        <div>
                            <div className="mb-6 flex items-center gap-2 border-b border-gray-900 pb-4">
                                <UserIcon className="h-5 w-5 text-purple-400" />
                                <h2 className="text-lg font-bold text-gray-200">Verified Profile</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3.5 border-b border-gray-900/50 pb-4">
                                    <Image
                                        src={user.imageUrl}
                                        alt="Profile"
                                        width={48}
                                        height={48}
                                        className="h-12 w-12 rounded-full border border-gray-800"
                                    />
                                    <div>
                                        <div className="text-sm font-bold text-gray-200">
                                            {profile?.first_name} {profile?.last_name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            @{user.username || "anonymous"}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3.5 pt-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">Birthday</span>
                                        <span className="font-semibold text-gray-300">
                                            {profile?.birthday ? new Date(profile.birthday).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Not Set"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">Gender Identity</span>
                                        <span className="font-semibold capitalize text-gray-300">
                                            {profile?.gender || "Not Set"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">Account Type</span>
                                        <span className="font-semibold text-gray-300">Standard Student</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">Platform Status</span>
                                        <span className="font-semibold text-emerald-400">Verified</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                // Direct them to Clerk profile manager natively
                                const btn = document.querySelector('button[aria-label="Open user button"]') as HTMLButtonElement;
                                if (btn) btn.click();
                            }}
                            className="w-full mt-6 rounded-xl border border-gray-800 bg-gray-950/30 py-3 text-sm font-semibold text-gray-300 transition-all hover:bg-gray-900/50 hover:text-white hover:border-gray-700"
                        >
                            Manage Profile Info
                        </button>
                    </div>

                </div>
            </main>
        </div>
    );
}