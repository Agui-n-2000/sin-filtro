"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();
  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  }
  return <button onClick={signOut} className="rounded-full border border-zinc-700 px-4 py-2 hover:border-rose-400 hover:text-rose-300">Salir</button>;
}
