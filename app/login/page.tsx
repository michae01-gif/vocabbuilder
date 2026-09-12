import LoginForm from "@/components/login-form";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="rise mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-8">
      <div className="text-center">
        <div className="mascot-bob text-6xl">🦉</div>
        <h1 className="mt-4 font-[var(--font-lora)] text-4xl font-bold">WordForge</h1>
        <p className="mt-2 text-sm text-zinc-500">Forge your vocabulary. Grow your word garden.</p>
      </div>
      <LoginForm />
    </div>
  );
}
