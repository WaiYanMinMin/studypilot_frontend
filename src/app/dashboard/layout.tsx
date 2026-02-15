import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import type { ReactNode } from "react";

export default async function DashboardLayout({
  children
}: Readonly<{ children: ReactNode }>) {
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
    redirect("/signin?callbackUrl=/dashboard/select");
  }
  const body = (await response.json()) as {
    user: { id: string; fullName: string; email: string } | null;
  };
  if (!body.user) {
    redirect("/signin?callbackUrl=/dashboard/select");
  }

  return children;
}
