"use client";

import { useUser } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "../utils/supabase/client";

const supabase = createClient();

const PUBLIC_PATHS = ["/", "/sign-in", "/sign-up", "/onboarding"];

export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
    const { isLoaded, isSignedIn, user } = useUser();
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoaded) return;

        // If it's a public path or the onboarding path itself, do not guard
        const isPublic = PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(path + "/"));
        if (isPublic) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLoading(false);
            return;
        }

        // If the user is not logged in, let clerkMiddleware (proxy.ts) handle the redirect
        if (!isSignedIn || !user) {
            setLoading(false);
            return;
        }

        // Check if the user's profile is fully setup in Supabase
        const checkProfile = async () => {
            try {
                const { data, error } = await supabase
                    .from("profiles")
                    .select("first_name, last_name, birthday, gender")
                    .eq("id", user.id)
                    .single();

                // If error, or row missing, or any required detail is blank, they must onboard!
                if (error || !data || !data.first_name || !data.last_name || !data.birthday || !data.gender) {
                    router.push("/onboarding");
                } else {
                    setLoading(false);
                }
            } catch (err) {
                console.error("Error checking profile:", err);
                setLoading(false);
            }
        };

        checkProfile();
    }, [isLoaded, isSignedIn, user, pathname, router]);

    // Render a high-end glassmorphic loading spinner while verifying profile status
    const isPublic = PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(path + "/"));
    if (loading && !isPublic) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#07070a] text-gray-100">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest animate-pulse">Verifying Credentials...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
