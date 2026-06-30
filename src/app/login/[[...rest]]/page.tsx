import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignIn } from "@clerk/nextjs";

export default async function LoginPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold">M122 營收管理平台</h1>
          <p className="text-sm text-slate-300">Project Revenue Management Platform</p>
          <p className="mt-3 text-xs text-slate-400">請使用公司 Microsoft 帳號登入</p>
        </div>
        <div className="flex justify-center">
          <SignIn
            routing="path"
            path="/login"
            forceRedirectUrl="/dashboard"
            fallbackRedirectUrl="/dashboard"
          />
        </div>
      </div>
    </div>
  );
}
