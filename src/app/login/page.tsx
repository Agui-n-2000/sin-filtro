"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setMessage("");
    try {
      const supabase = createClient();
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { nickname: nickname.trim() } },
        });
        if (error) throw error;
        setMessage("Cuenta creada. Si la confirmación por correo está activada en Supabase, revisa tu bandeja para verificarla.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo completar la operación.");
    } finally { setBusy(false); }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0%,rgba(147,51,234,.2),transparent_50%)]"/>
      <section className="neon-card w-full max-w-md rounded-3xl p-7 sm:p-9">
        <Link href="/" className="text-sm text-fuchsia-300 hover:text-fuchsia-200">← Volver al inicio</Link>
        <p className="mt-8 text-xs font-bold uppercase tracking-[.25em] text-rose-300">Tu acceso al caos</p>
        <h1 className="mt-2 text-4xl font-black">{mode === "signup" ? "Crear cuenta" : "Bienvenido"}</h1>
        <p className="mt-3 text-sm text-zinc-400">Regístrate para jugar con tu grupo.</p>
        <div className="mt-6 grid grid-cols-2 rounded-xl bg-black/30 p-1 text-sm">
          <button onClick={() => {setMode("signup");setMessage("");}} className={`rounded-lg py-2 ${mode==="signup"?"bg-fuchsia-700 text-white":"text-zinc-400"}`}>Registrarme</button>
          <button onClick={() => {setMode("login");setMessage("");}} className={`rounded-lg py-2 ${mode==="login"?"bg-fuchsia-700 text-white":"text-zinc-400"}`}>Iniciar sesión</button>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === "signup" && <label className="block text-sm text-zinc-300">Apodo<input className="field mt-2" required minLength={2} maxLength={24} value={nickname} onChange={e=>setNickname(e.target.value)} placeholder="Tu nombre de jugador"/></label>}
          <label className="block text-sm text-zinc-300">Correo electrónico<input className="field mt-2" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@correo.com"/></label>
          <label className="block text-sm text-zinc-300">Contraseña<input className="field mt-2" type="password" autoComplete={mode==="signup"?"new-password":"current-password"} required minLength={6} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mínimo 6 caracteres"/></label>
          <button disabled={busy} className="neon-button w-full rounded-xl py-4 font-bold disabled:opacity-50">{busy?"Procesando...":mode==="signup"?"CREAR MI CUENTA":"ENTRAR AL JUEGO"}</button>
        </form>
        {message && <p role="status" className="mt-4 rounded-xl border border-fuchsia-400/20 bg-fuchsia-400/10 p-3 text-sm text-fuchsia-100">{message}</p>}
        <p className="mt-6 text-center text-xs leading-5 text-zinc-500">Usaremos tu cuenta para identificar tus partidas. No compartas tu contraseña con nadie.</p>
      </section>
    </main>
  );
}
