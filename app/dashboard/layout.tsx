import { getServerSession } from "@/lib/auth/client-utils";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  // Check if user is authenticated
  if (!session || !session.user) {
    redirect("/auth/signin?callbackUrl=/dashboard");
  }

  return <>{children}</>;
}