import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Simple env parser
const envPath = path.resolve(process.cwd(), ".env.local");
const envFile = fs.readFileSync(envPath, "utf-8");
const env: Record<string, string> = {};
envFile.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
        const parts = trimmed.split("=");
        const key = parts[0].trim();
        const value = parts.slice(1).join("=").trim();
        env[key] = value;
    }
});

const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
    const { data, error } = await supabase
        .from("projects")
        .select("id, title, specification_url");

    if (error) {
        console.error("Error fetching projects:", error);
    } else {
        console.log("All projects in database:", data);
    }
}

run();
