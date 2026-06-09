"use client";

import { useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { createClient } from "../../../../utils/supabase/client";
import { MessageSquare, ArrowLeft, Send, ShieldAlert, Clock, User as UserIcon } from "lucide-react";

const supabase = createClient();

interface Message {
    id: string;
    project_id: string;
    sender_id: string;
    sender_name: string;
    content: string;
    created_at: string;
}

export default function ProjectChatPage() {
    const { isLoaded, isSignedIn, user } = useUser();
    const params = useParams();
    const router = useRouter();
    const id = typeof params.id === "string" ? params.id : "";

    // Data State
    const [project, setProject] = useState<Record<string, unknown> | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    // Form / UI State
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);

    const messageEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of conversation
    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Check credentials and load project details on mount
    useEffect(() => {
        if (!isLoaded || !isSignedIn || !user || !id) return;

        const checkAuthAndLoad = async () => {
            try {
                // 1. Fetch project details
                const { data: projData, error: projErr } = await supabase
                    .from("projects")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (projErr || !projData) {
                    setIsAuthorized(false);
                    setLoading(false);
                    return;
                }

                setProject(projData);

                // 2. Access Gate: Authorize if user is the Owner (client_id)
                if (projData.client_id === user.id) {
                    setIsAuthorized(true);
                } else {
                    // Check if current user has an ACCEPTED application for this project
                    const { data: appData } = await supabase
                        .from("applications")
                        .select("*")
                        .eq("project_id", id)
                        .eq("applicant_id", user.id)
                        .eq("status", "accepted")
                        .limit(1);

                    if (appData && appData.length > 0) {
                        setIsAuthorized(true);
                    } else {
                        setIsAuthorized(false);
                    }
                }

                // 3. Fetch historical messages
                const { data: msgData } = await supabase
                    .from("messages")
                    .select("*")
                    .eq("project_id", id)
                    .order("created_at", { ascending: true });

                if (msgData) {
                    setMessages(msgData);
                }

            } catch (err) {
                console.error("Auth / Load Error inside Chat Page:", err);
                setIsAuthorized(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuthAndLoad();
    }, [isLoaded, isSignedIn, user, id]);

    // Open Realtime subscription channel
    useEffect(() => {
        if (!id || !user || !isAuthorized) return;

        const channel = supabase
            .channel(`realtime_chat_room_${id}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `project_id=eq.${id}`,
                },
                (payload) => {
                    const newMsg = payload.new as Message;
                    // Append only if it doesn't already exist in state (handles race conditions with inserts)
                    setMessages((current) => {
                        if (current.some((m) => m.id === newMsg.id)) return current;
                        return [...current, newMsg];
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [id, user, isAuthorized]);

    // Send Message handler
    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const content = input.trim();
        if (!content || !user || !id || sending) return;

        setSending(true);
        setInput("");

        try {
            const senderName = user.firstName || user.username || "Collaborator";

            const { error } = await supabase.from("messages").insert({
                project_id: id,
                sender_id: user.id,
                sender_name: senderName,
                content,
            });

            if (error) {
                console.error("Error inserting message:", error);
            }
        } catch (err) {
            console.error("Failed to send message:", err);
        } finally {
            setSending(false);
        }
    };

    // Rendering loading spinner
    if (loading || !isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#07070a] text-gray-100 font-sans">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest animate-pulse">Initializing Secure Channel...</p>
                </div>
            </div>
        );
    }

    // Access Denied Security Screen
    if (isAuthorized === false) {
        return (
            <div className="min-h-screen flex flex-col bg-transparent text-gray-100 font-sans relative overflow-hidden items-center justify-center p-6">
                <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-red-500/5 blur-[120px] pointer-events-none" />
                <div className="relative z-10 w-full max-w-md glass-card p-8 rounded-2xl text-center shadow-lg border border-red-500/25">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20">
                        <ShieldAlert className="h-7 w-7" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-red-400">Access Denied</h1>
                    <p className="text-xs text-gray-500 mt-2.5 leading-relaxed">
                        You do not have credentials to enter this chat room. Access is strictly limited to the project owner and the accepted collaborator.
                    </p>
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="w-full mt-6 flex items-center justify-center gap-2 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 py-3 text-xs font-bold text-gray-300 transition-all hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" /> Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // Chat Interface
    return (
        <div className="min-h-screen flex flex-col bg-transparent text-gray-100 font-sans relative overflow-hidden">
            {/* Top Header */}
            <header className="relative z-10 flex items-center justify-between border-b border-gray-900 bg-gray-950/20 px-6 py-4 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-800 bg-gray-950/40 text-gray-400 hover:text-white hover:border-gray-700 transition-all"
                    >
                        <ArrowLeft className="h-4.5 w-4.5" />
                    </button>
                    <div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Workspace Chat</div>
                        <h1 className="text-sm font-extrabold text-gray-200 mt-0.5 line-clamp-1">{project?.title}</h1>
                    </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 rounded-full px-3.5 py-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></div>
                    Realtime Channel Connected
                </div>
            </header>

            {/* Conversation Feed */}
            <main className="relative z-10 flex-1 mx-auto w-full max-w-4xl flex flex-col justify-between p-4 md:p-6 overflow-hidden">
                <div className="flex-1 glass-card rounded-2xl p-4 overflow-y-auto mb-4 flex flex-col space-y-4 max-h-[calc(100vh-200px)] custom-scrollbar">
                    {messages && messages.length > 0 ? (
                        messages.map((msg) => {
                            const isMe = msg.sender_id === user?.id;
                            return (
                                <div
                                    key={msg.id}
                                    className={`flex flex-col max-w-[75%] ${isMe ? "self-end items-end" : "self-start items-start"}`}
                                >
                                    {/* Sender Details */}
                                    <div className="text-[10px] text-gray-500 mb-1 flex items-center gap-1.5 px-1 font-semibold">
                                        {!isMe && <UserIcon className="h-3 w-3 text-indigo-400" />}
                                        {msg.sender_name}
                                        <span>•</span>
                                        <Clock className="h-3 w-3" />
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>

                                    {/* Chat Balloon */}
                                    <div
                                        className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                                            isMe
                                                ? "bg-gradient-to-br from-indigo-600/60 to-purple-600/60 border border-indigo-500/20 text-white rounded-tr-none shadow-md shadow-indigo-500/5"
                                                : "bg-gray-900/40 border border-gray-800 text-gray-200 rounded-tl-none"
                                        }`}
                                    >
                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-24">
                            <div className="h-12 w-12 rounded-xl bg-gray-900/40 border border-gray-800 flex items-center justify-center text-gray-500 mb-4 shadow-inner">
                                <MessageSquare className="h-5 w-5" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-300">Start the Collaboration</h3>
                            <p className="text-xs text-gray-500 max-w-xs mt-1">Welcome! Send a message below to kick off your team coordination.</p>
                        </div>
                    )}
                    <div ref={messageEndRef} />
                </div>

                {/* Conversation Input Form */}
                <form onSubmit={handleSend} className="flex gap-3 relative z-20">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 rounded-xl border border-gray-800 bg-gray-950/40 px-4 py-3.5 text-sm text-gray-100 placeholder-gray-600 focus:border-indigo-500/50 focus:ring-0 focus:outline-none transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || sending}
                        className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white transition-all hover:shadow-[0_4px_15px_rgba(99,102,241,0.25)] disabled:opacity-40 cursor-pointer flex-shrink-0"
                    >
                        <Send className="h-4.5 w-4.5" />
                    </button>
                </form>
            </main>
        </div>
    );
}
