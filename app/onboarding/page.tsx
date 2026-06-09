"use client";

import { useUser } from "@clerk/nextjs";
import { User as UserIcon, Info, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "../../utils/supabase/client";

const supabase = createClient();

export default function OnboardingPage() {
    const { isLoaded, isSignedIn, user } = useUser();
    const router = useRouter();

    // Form inputs
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [birthday, setBirthday] = useState("");
    const [gender, setGender] = useState("");

    // UI States
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // Fetch existing profile to see if already onboarded
    useEffect(() => {
        if (!isLoaded) return;
        if (!isSignedIn || !user) {
            router.push("/");
            return;
        }

        const checkExistingProfile = async () => {
            try {
                const { data } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .single();

                // If profile is fully completed, redirect to dashboard
                if (data && data.first_name && data.last_name && data.birthday && data.gender) {
                    router.push("/dashboard");
                    return;
                }

                // Otherwise, pre-populate inputs with Clerk data if available
                setFirstName(user.firstName || "");
                setLastName(user.lastName || "");
                if (data) {
                    setBirthday(data.birthday || "");
                    setGender(data.gender || "");
                }
            } catch (err) {
                console.error("Error pre-populating profile:", err);
            } finally {
                setLoading(false);
            }
        };

        checkExistingProfile();
    }, [isLoaded, isSignedIn, user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSubmitting(true);
        setErrorMsg("");

        try {
            // Upsert details into Supabase
            const { error } = await supabase
                .from("profiles")
                .upsert({
                    id: user.id,
                    first_name: firstName,
                    last_name: lastName,
                    birthday,
                    gender,
                    role: "student" // Default role
                }, { onConflict: "id" });

            if (error) {
                console.error("Supabase upsert error:", error);
                // Handle missing column or other DB issues
                if (error.message.includes("birthday") || error.message.includes("gender")) {
                    setErrorMsg("Your Supabase database table 'profiles' is missing columns. Please verify that you ran the SQL script to add first_name, last_name, birthday, and gender.");
                } else {
                    setErrorMsg(error.message || "Failed to update profile. Please try again.");
                }
                setSubmitting(false);
                return;
            }

            // Redirect to dashboard on success
            router.push("/dashboard");
        } catch (err: unknown) {
            console.error("Form submit error:", err);
            setErrorMsg((err as Error).message || "An unexpected error occurred. Please try again.");
            setSubmitting(false);
        }
    };

    if (loading || !isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#07070a] text-gray-100">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest animate-pulse">Initializing Portal...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-transparent text-gray-100 font-sans relative overflow-hidden items-center justify-center p-4">
            
            {/* Ambient Background Glows */}
            <div className="absolute top-[-15%] left-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-[130px] pointer-events-none" />
            <div className="absolute bottom-[-15%] right-[-10%] h-[600px] w-[600px] rounded-full bg-purple-500/10 blur-[130px] pointer-events-none" />

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-30" />

            {/* Glassmorphic Profile Setup Container */}
            <div className="relative z-10 w-full max-w-xl glass-card p-8 md:p-10 rounded-3xl">
                
                {/* Header */}
                <div className="text-center mb-8 border-b border-gray-900 pb-6">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-[0_4px_15px_rgba(99,102,241,0.25)]">
                        <UserIcon className="h-7 w-7" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Complete Your Profile</h2>
                    <p className="text-xs text-gray-500 mt-2 font-medium">Please enter your setup credentials to unlock the collaborative hub.</p>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                    <div className="mb-6 flex gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
                        <ShieldAlert className="h-5 w-5 flex-shrink-0" />
                        <div>
                            <span className="font-bold">Setup Error:</span> {errorMsg}
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">First Name</label>
                            <input
                                type="text"
                                required
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full rounded-xl border border-gray-900 bg-gray-950 px-4 py-3.5 text-sm text-gray-100 placeholder-gray-600 focus:border-indigo-500/50 focus:ring-0 focus:outline-none transition-all"
                                placeholder="e.g., Sahan"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Last Name</label>
                            <input
                                type="text"
                                required
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full rounded-xl border border-gray-900 bg-gray-950 px-4 py-3.5 text-sm text-gray-100 placeholder-gray-600 focus:border-indigo-500/50 focus:ring-0 focus:outline-none transition-all"
                                placeholder="e.g., Adithya"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Birthday</label>
                        <div className="relative">
                            <input
                                type="date"
                                required
                                value={birthday}
                                onChange={(e) => setBirthday(e.target.value)}
                                className="w-full rounded-xl border border-gray-900 bg-gray-950 px-4 py-3.5 text-sm text-gray-100 focus:border-indigo-500/50 focus:ring-0 focus:outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Gender Identity</label>
                        <select
                            required
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="w-full rounded-xl border border-gray-900 bg-gray-950 px-4 py-3.5 text-sm text-gray-100 focus:border-indigo-500/50 focus:ring-0 focus:outline-none transition-all cursor-pointer"
                        >
                            <option value="" disabled className="bg-[#07070a] text-gray-500">Select your gender</option>
                            <option value="male" className="bg-[#07070a] text-gray-100">Male</option>
                            <option value="female" className="bg-[#07070a] text-gray-100">Female</option>
                            <option value="non-binary" className="bg-[#07070a] text-gray-100">Non-Binary</option>
                            <option value="other" className="bg-[#07070a] text-gray-100">Prefer not to say</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 py-4 text-sm font-bold text-white transition-all hover:shadow-[0_4px_15px_rgba(99,102,241,0.3)] disabled:opacity-50 cursor-pointer mt-2"
                    >
                        {submitting ? (
                            <>
                                <div className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                Saving Profile...
                            </>
                        ) : (
                            "Complete Profile Setup"
                        )}
                    </button>
                </form>

                {/* Footer Disclaimer */}
                <p className="text-[10px] text-gray-600 text-center mt-6 flex items-center justify-center gap-1.5 leading-relaxed max-w-xs mx-auto">
                    <Info className="h-3.5 w-3.5 flex-shrink-0 text-gray-600" />
                    All profile information is stored securely in encrypted databases and conforms to data policy standards.
                </p>

            </div>
        </div>
    );
}
