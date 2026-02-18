// Force dynamic so this page is never statically pre-rendered at build time.
// ClerkProvider in the root layout requires NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
// to be present at runtime, which is not available during static generation.
export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="mt-3 text-lg text-gray-500">Page not found.</p>
        <a
          href="/"
          className="mt-6 inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          Go home
        </a>
      </div>
    </div>
  );
}
