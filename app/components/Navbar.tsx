import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-base font-semibold text-gray-900 hover:text-blue-600 transition-colors">
          Car Valuator
        </Link>

        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton mode="redirect">
              <button className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="redirect">
              <button className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors">
                Sign up
              </button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
