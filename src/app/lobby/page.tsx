import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LobbyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-12">
      <Link href="/" className="text-sm text-fuchsia-300">← Inicio</Link>
      <section className="neon-card mt-8 rounded-3xl p-7">
        <p className="text-xs font-bold uppercase tracking-[.25em] text-fuchsia-300">Zona de jugadores</p>
        <h1 className="mt-2 text-4xl font-black">Partidas</h1>
        <p className="mt-4 leading-7 text-zinc-300">Tu sesión está activa. El siguiente paso es conectar aquí los botones para crear una sala o unirte con un código.</p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-fuchsia-400/30 bg-fuchsia-500/10 p-5">
            <h2 className="text-xl font-bold">Crear sala</h2><p className="mt-2 text-sm text-zinc-400">Serás anfitrión y podrás iniciar las rondas.</p>
            <span className="mt-4 inline-block text-xs text-fuchsia-200">Próximo módulo</span>
          </div>
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-5">
            <h2 className="text-xl font-bold">Unirse a sala</h2><p className="mt-2 text-sm text-zinc-400">Ingresa el código que te compartió tu amigo.</p>
            <span className="mt-4 inline-block text-xs text-rose-200">Próximo módulo</span>
          </div>
        </div>
      </section>
    </main>
  );
}
