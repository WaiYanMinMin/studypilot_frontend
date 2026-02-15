import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { ProfilePageClient } from "@/components/profile/ProfilePageClient";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((item) => `${item.name}=${item.value}`)
    .join("; ");
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.APP_BASE_URL || "";
  const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
    headers: cookieHeader ? { cookie: cookieHeader } : {},
    cache: "no-store",
  });
  if (!response.ok) {
    redirect("/signin?callbackUrl=/profile");
  }
  const body = (await response.json()) as {
    user: { id: string; fullName: string; email: string } | null;
  };
  if (!body.user) {
    redirect("/signin?callbackUrl=/profile");
  }

  return <ProfilePageClient />;
}
