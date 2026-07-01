import { redirect } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";
import { getOrSyncCurrentUser, AuthError } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let user;
  try {
    user = await getOrSyncCurrentUser();
  } catch (err) {
    if (err instanceof AuthError) {
      return <AccessDenied message={err.message} />;
    }
    throw err;
  }

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userName={user.name} role={user.role} />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-[1400px] p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

function AccessDenied({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 p-4 text-center">
      <h1 className="text-xl font-bold text-slate-900">無法存取</h1>
      <p className="max-w-md text-sm text-slate-600">{message}</p>
      <SignOutButton redirectUrl="/login">
        <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700">
          登出並重新登入
        </button>
      </SignOutButton>
    </div>
  );
}
