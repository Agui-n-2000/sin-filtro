import Link from "next/link";
import { Flame, Users, Shield, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/sign-out-button";

export default async function Home() {
  let user = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch { /* La pantalla informativa también funciona antes de configurar Supabase. */ }

  return (
    <main className="min-h-screen overflow-hidden px-5 py-8">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0%,rgba(147,51,234,.22),transparent_48%),radial-gradient(ellipse_at_100%_80%,rgba(225,29,72,.12),transparent_38%)]" />
      <nav className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="text-xl font-black tracking-[.2em] text-fuchsia-300">SIN FILTRO<span className="text-rose-400">.</span></Link>
        <div className="flex items-center gap-3 text-sm text-zinc-300">
          {user ? <><span className="hidden sm:inline">{user.email}</span><SignOutButton /></> : <Link href="/login" className="rounded-full border border-fuchsia-400/40 px-4 py-2 hover:bg-fuchsia-400/10">Iniciar sesión</Link>}
        </div>
      </nav>

      <section className="mx-auto flex max-w-5xl flex-col items-center py-24 text-center sm:py-32">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-fuchsia-400/30 bg-fuchsia-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[.22em] text-fuchsia-200">
          <Sparkles size={14}/> 100 preguntas · 5 niveles · Cero filtros
        </div>
        <h1 className="neon-text text-6xl font-black tracking-[-.07em] sm:text-8xl">SIN <span className="bg-gradient-to-r from-fuchsia-300 via-pink-400 to-rose-500 bg-clip-text text-transparent">FILTRO</span></h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-300">El juego donde la amistad se pone a prueba.<br/>¿Te atreves a responder?</p>

        <div className="neon-card mt-12 w-full max-w-md rounded-3xl p-6 text-left">
          {user ? (
            <>
              <p className="text-sm text-zinc-400">Sesión iniciada</p>
              <h2 className="mt-1 text-2xl font-bold">¡Que comience el caos!</h2>
              <p className="mt-2 text-sm text-zinc-400">La autenticación está lista. El siguiente módulo conectará la creación y entrada a salas.</p>
              <Link href="/lobby" className="neon-button mt-6 block rounded-xl px-5 py-4 text-center font-bold">IR A LAS PARTIDAS <Flame className="ml-2 inline" size={18}/></Link>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold">Entra al juego</h2>
              <p className="mt-2 text-sm text-zinc-400">Necesitas una cuenta para crear o unirte a una sala.</p>
              <Link href="/login" className="neon-button mt-6 block rounded-xl px-5 py-4 text-center font-bold">CREAR CUENTA / INGRESAR <Flame className="ml-2 inline" size={18}/></Link>
            </>
          )}
          <p className="mt-4 text-center text-xs text-zinc-500">Juego privado entre amigos · Tú decides qué responder</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 pb-16 sm:grid-cols-3">
        {[
          {icon:Users,title:"Salas privadas",desc:"Invita a tus amigos con un código único."},
          {icon:Flame,title:"Cinco niveles",desc:"De calentando motores a zona de peligro."},
          {icon:Shield,title:"Decisiones grupales",desc:"Voten las rondas especiales en equipo."},
        ].map((item) => <article key={item.title} className="neon-card rounded-2xl p-5"><item.icon className="mb-4 text-fuchsia-300" size={24}/><h3 className="font-bold">{item.title}</h3><p className="mt-2 text-sm leading-6 text-zinc-400">{item.desc}</p></article>)}
      </section>
      <footer className="pb-6 text-center text-xs text-zinc-600">SIN FILTRO © 2026 · Pregunta. Confiesa. Sobrevive.</footer>
    </main>
  );
}
