// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../utils/supabase/client";
import { LogOut, LayoutDashboard, Briefcase, User as UserIcon } from "lucide-react";

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    // Protect the route: Check if user is logged in
    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.replace("/login");
            } else {
                setUser(session.user);
            }
            setLoading(false);
        };
        checkUser();
    }, [router, supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Top Navigation */}
            <nav className="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
                <div className="flex items-center gap-2 text-xl font-bold text-gray-900">
                    <LayoutDashboard className="h-6 w-6 text-indigo-600" />
                    CollabHub
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-red-600"
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </button>
            </nav>

            {/* Main Content Area */}
            <main className="mx-auto w-full max-w-7xl flex-1 p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
                    <p className="mt-1 text-gray-500">Logged in as: {user?.email}</p>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                    {/* Projects Panel */}
                    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-4">
                            <Briefcase className="h-5 w-5 text-indigo-500" />
                            <h2 className="text-lg font-semibold text-gray-900">Active Projects</h2>
                        </div>
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <p className="text-sm text-gray-500">No active projects yet.</p>
                            <button className="mt-4 rounded-md bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100">
                                Browse Projects
                            </button>
                        </div>
                    </div>

                    {/* Profile Panel */}
                    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-4">
                            <UserIcon className="h-5 w-5 text-indigo-500" />
                            <h2 className="text-lg font-semibold text-gray-900">Your Profile</h2>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Status</span>
                                <span className="font-medium text-green-600">Active</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Role</span>
                                <span className="font-medium capitalize text-gray-900">Student</span>
                            </div>
                            <button className="mt-4 w-full rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                Edit Profile
                            </button>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}