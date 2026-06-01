"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useTransition, useState, useEffect } from "react";

export default function SearchInput() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    // Sync input local state with the actual URL query parameter
    const [value, setValue] = useState(searchParams.get("q") || "");

    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set("q", value);
            } else {
                params.delete("q");
            }

            startTransition(() => {
                router.replace(`${pathname}?${params.toString()}`);
            });
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [value, pathname, router, searchParams]);

    return (
        <div className="relative">
            <Search className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${isPending ? 'text-indigo-400 animate-pulse' : 'text-gray-500'}`} />
            <input
                type="text"
                placeholder="Search projects..."
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full md:w-64 rounded-xl border border-gray-800 bg-gray-950/50 py-2.5 pl-10 pr-4 text-sm text-gray-200 placeholder-gray-500 backdrop-blur-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
            />
        </div>
    );
}
