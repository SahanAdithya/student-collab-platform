import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50 text-gray-900">
      <h1 className="text-4xl font-bold mb-4">Student Collab Platform</h1>
      <p className="text-lg text-gray-600 mb-8">The connection engine is live.</p>

      <Link
        href="/login"
        className="rounded-md bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition-colors"
      >
        Get Started
      </Link>
    </main>
  );
}