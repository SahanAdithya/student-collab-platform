import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { ArrowRight, Compass, Users, Code, Zap } from "lucide-react";

export default async function Home() {
  const user = await currentUser();

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#07070a] text-gray-100 font-sans p-6">
      
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-40" />

      {/* Landing Content Wrapper */}
      <div className="relative z-10 mx-auto max-w-4xl text-center flex flex-col items-center">
        
        {/* Dynamic Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/5 px-4 py-1.5 text-xs font-semibold text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.07)] backdrop-blur-md mb-8 hover:border-indigo-400/40 transition-colors">
          <Zap className="h-3.5 w-3.5 fill-indigo-400/20 text-indigo-400" />
          The Student Connection Engine is Live
        </div>

        {/* Title / Hero */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-b from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
          Collab<span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Hub</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-xl mb-12 leading-relaxed">
          The ultimate workspace for students to form teams, build high-impact projects, and collaborate with peers worldwide.
        </p>

        {/* Clerk Auth-Driven Dynamic Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-20 justify-center">
          
          {user ? (
            <div className="flex flex-col items-center gap-4">
              <span className="text-sm text-gray-400">
                Welcome back, <span className="font-semibold text-indigo-300">{user.firstName || user.emailAddresses[0].emailAddress.split('@')[0]}</span>!
              </span>
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-[0_4px_20px_rgba(99,102,241,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_4px_25px_rgba(99,102,241,0.45)]"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
              <Link
                href="/sign-in"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-[0_4px_20px_rgba(99,102,241,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_4px_25px_rgba(99,102,241,0.45)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-800 bg-gray-950/40 px-8 py-4 text-base font-semibold text-gray-300 transition-all hover:bg-gray-900/60 hover:text-white hover:border-gray-700 backdrop-blur-sm"
              >
                Sign Up
              </Link>
            </div>
          )}

        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          
          <div className="rounded-2xl border border-gray-900 bg-gray-950/20 p-6 backdrop-blur-sm hover:border-gray-800/80 hover:bg-gray-900/10 transition-all">
            <div className="mb-4 inline-flex rounded-lg bg-indigo-500/10 p-2.5 text-indigo-400 border border-indigo-500/10">
              <Compass className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-gray-200 mb-2">Explore Projects</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Find open collaboration requests, hackathon teams, and hobbyist projects seeking your unique skill sets.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-900 bg-gray-950/20 p-6 backdrop-blur-sm hover:border-gray-800/80 hover:bg-gray-900/10 transition-all">
            <div className="mb-4 inline-flex rounded-lg bg-purple-500/10 p-2.5 text-purple-400 border border-purple-500/10">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-gray-200 mb-2">Build Teams</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Invite programmers, designers, and project managers to combine forces and co-create high-quality applications.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-900 bg-gray-950/20 p-6 backdrop-blur-sm hover:border-gray-800/80 hover:bg-gray-900/10 transition-all">
            <div className="mb-4 inline-flex rounded-lg bg-pink-500/10 p-2.5 text-pink-400 border border-pink-500/10">
              <Code className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-gray-200 mb-2">Learn & Grow</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Accelerate your learning through hands-on practice, peer reviews, and real-world project builds.
            </p>
          </div>

        </div>

      </div>
    </main>
  );
}