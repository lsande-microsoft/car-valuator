// Prevent static pre-rendering — ClerkProvider in the root layout requires
// NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY at runtime, not at build time.
export const dynamic = "force-dynamic";

import ValuatorClient from "@/app/components/ValuatorClient";

export default function Home() {
  return <ValuatorClient />;
}
