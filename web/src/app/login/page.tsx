import type { Metadata } from "next";
import { LoginForm } from "@/components/login/LoginForm";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = { title: "Acceso empleados" };

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-paper bg-[linear-gradient(#E9E6E0_1px,transparent_1px),linear-gradient(90deg,#E9E6E0_1px,transparent_1px)] bg-[size:40px_40px] px-5 py-8">
      <div className="w-full max-w-[420px]">
        <div className="mb-6 flex justify-center">
          <Logo height={44} priority />
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
