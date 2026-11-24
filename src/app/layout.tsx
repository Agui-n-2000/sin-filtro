import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIN FILTRO — El juego donde la amistad se pone a prueba",
  description: "Crea una sala, invita a tus amigos y atrévete a responder.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
