import { redirect } from "next/navigation";

// The landing page is now the site home (/). Keep /lp working for any old
// links/ads by redirecting to the homepage.
export default function LegacyLandingRedirect() {
  redirect("/");
}
