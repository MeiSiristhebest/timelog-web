
import Link from "next/link";
import { RegisterForm } from "./register-form";
import { routes } from "@/lib/routes";

export default function RegisterPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      {/* Background with warm Heritage vibes */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,var(--glass),transparent_40%)]" />
      
      <div className="panel ambient-ring w-full max-w-md p-8 md:p-10 z-10 animate-slide-up animate-fade-in">
        <div className="mb-8">
          <p className="eyebrow tracking-[0.2em]">Family Console Access</p>
          <h1 className="display mt-4 text-4xl text-ink leading-tight">
            Begin Your Family Archive
          </h1>
          <p className="mt-4 text-sm text-muted leading-relaxed">
            Create an account to start listening, responding, and connecting with your family heritage.
          </p>
        </div>

        <RegisterForm />

        <div className="mt-10 pt-8 border-t border-line text-center">
          <p className="text-sm text-muted mb-4">Already part of the family?</p>
          <Link
            href={routes.login}
            className="text-accent underline-offset-4 hover:underline font-medium transition-all"
          >
            Sign in to Your Archive
          </Link>
        </div>
      </div>
    </main>
  );
}
