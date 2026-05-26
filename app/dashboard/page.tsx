// app/dashboard/page.tsx
"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { LayoutDashboard, Briefcase, User as UserIcon, Calendar, Settings, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
    const { isLoaded, isSignedIn, user } = useUser();

    if (!isLoaded) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#07070a] text-gray-100">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
            </div>
        );
    }

    if (!isSignedIn) {
        return null; // Will be handled by middleware redirection
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#07070a] text-gray-100 font-sans relative overflow-hidden">
            
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
                                Welcome Back, {user.firstName || user.username || "Collaborator"}!
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
                    <div className="lg:col-span-2 rounded-2xl border border-gray-900 bg-gray-950/10 p-6 backdrop-blur-sm hover:border-gray-800/80 transition-all flex flex-col justify-between">
                        <div>
                            <div className="mb-6 flex items-center gap-2 border-b border-gray-900 pb-4">
                                <Briefcase className="h-5 w-5 text-indigo-400" />
                                <h2 className="text-lg font-bold text-gray-200">Active Collaborations</h2>
                            </div>
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="h-12 w-12 rounded-xl bg-gray-900/40 border border-gray-800 flex items-center justify-center text-gray-400 mb-4 shadow-inner">
                                    <Briefcase className="h-5 w-5" />
                                </div>
                                <p className="text-sm font-semibold text-gray-300">No active projects yet</p>
                                <p className="text-xs text-gray-500 max-w-xs mt-1">Ready to start? Discover active requests from fellow students or construct a new proposal.</p>
                            </div>
                        </div>
                        <button className="w-full mt-6 rounded-xl bg-gradient-to-br from-indigo-600/80 to-purple-600/80 hover:from-indigo-600 hover:to-purple-600 py-3 text-sm font-semibold text-white transition-all hover:shadow-[0_4px_15px_rgba(99,102,241,0.25)]">
                            Browse Project Catalog
                        </button>
                    </div>

                    {/* Right Column: User Profile Panel */}
                    <div className="rounded-2xl border border-gray-900 bg-gray-950/10 p-6 backdrop-blur-sm hover:border-gray-800/80 transition-all flex flex-col justify-between">
                        <div>
                            <div className="mb-6 flex items-center gap-2 border-b border-gray-900 pb-4">
                                <UserIcon className="h-5 w-5 text-purple-400" />
                                <h2 className="text-lg font-bold text-gray-200">Student Profile</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3.5 border-b border-gray-900/50 pb-4">
                                    <img 
                                        src={user.imageUrl} 
                                        alt="Profile" 
                                        className="h-12 w-12 rounded-full border border-gray-800"
                                    />
                                    <div>
                                        <div className="text-sm font-bold text-gray-200">
                                            {user.fullName || user.username || "Student Profile"}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            @{user.username || "anonymous"}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3.5 pt-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">Account Type</span>
                                        <span className="font-semibold text-gray-300">Standard Student</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">Platform Status</span>
                                        <span className="font-semibold text-emerald-400">Verified</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">Project Role</span>
                                        <span className="font-semibold text-gray-300">Software Architect</span>
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