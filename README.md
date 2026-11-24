# SIN FILTRO — Starter

Base inicial de la plataforma web multijugador de preguntas incómodas.

## Incluye
- Next.js App Router + TypeScript + Tailwind CSS.
- Diseño inicial neon morado/rosa/rojo.
- Registro e inicio de sesión con Supabase Auth.
- Cliente Supabase para navegador y servidor.
- Middleware para refrescar cookies de autenticación.
- Pantalla de lobby inicial.
- Esquema SQL inicial para perfiles, salas, miembros, preguntas, rondas, respuestas y votaciones.
- Políticas RLS iniciales y tablas seleccionadas en Realtime.

## Requisitos
- Node.js 20.9 o superior.
- Proyecto Supabase.
- npm.

## Instalación

```bash
npm install
cp .env.example .env.local
```

Edita `.env.local` con la URL y la clave publicable (anon/public) de tu proyecto Supabase.

En Supabase:
1. Abre SQL Editor.
2. Ejecuta `supabase/schema.sql`.
3. En Authentication > URL Configuration, configura el Site URL para tu entorno local (`http://localhost:3000`) y las URLs de redirección necesarias.
4. Decide si quieres exigir confirmación de correo en Authentication > Providers > Email.

Luego ejecuta:

```bash
npm run dev
```

Abre http://localhost:3000.

## Importante sobre seguridad y estado del proyecto

Este paquete es un **starter**, no una plataforma terminada. La pantalla de login/registro está conectada a Supabase cuando se configuran las variables. Las acciones de crear/unirse a salas, la votación en tiempo real, turnos y puntuación todavía deben implementarse.

El SQL es una base de trabajo que requiere revisión y pruebas antes de producción. En particular:
- La unión a salas debe hacerse mediante una función RPC transaccional que valide el código y el estado de la sala; no se debe confiar en un `room_id` enviado por el cliente.
- Las operaciones que cambian el estado de una partida (crear rondas, avanzar nivel, cerrar partida y aplicar resultados de votaciones) deben validarse en servidor o funciones SQL con permisos mínimos.
- Añadir límites de frecuencia, protección contra abuso y validación de apodos/códigos.
- Revisar y endurecer las políticas RLS. No exponer nunca la `service_role` key al navegador.
- Si se activa confirmación de correo, el usuario deberá verificarlo antes de poder iniciar sesión según la configuración del proyecto.

## Próxima etapa recomendada
Implementar RPC seguras para crear sala, unirse con código, votar y cerrar votaciones; luego conectar el lobby con Supabase Realtime.
