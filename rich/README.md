# Draft Premier League 2026/27

App de draft con matriz por equipo, setpieces, "Mi Equipo" y sincronización en vivo entre todos los que abran el link (vía Supabase Realtime).

## 1. Crear el proyecto en Supabase (gratis)

1. Andá a https://supabase.com → **New project**.
2. Elegí nombre, contraseña de base de datos y región (cualquiera cercana está bien).
3. Cuando el proyecto esté listo, andá a **SQL Editor** → **New query**.
4. Pegá TODO el contenido del archivo `supabase-setup.sql` (incluido en esta carpeta) y hacé clic en **Run**.
   - Esto crea las tablas `draft_status` y `custom_players`, habilita las políticas de acceso público, y activa Realtime.
5. Andá a **Project Settings → API**. Ahí vas a ver dos datos que necesitás:
   - **Project URL** → va en `VITE_SUPABASE_URL`
   - **anon public key** → va en `VITE_SUPABASE_ANON_KEY`

## 2. Probarlo en tu computadora (opcional pero recomendado)

Necesitás [Node.js](https://nodejs.org) instalado. Después:

```bash
cd draft-pl-2026-27
cp .env.example .env
```

Editá `.env` y pegá tu URL y tu anon key de Supabase. Después:

```bash
npm install
npm run dev
```

Abrí la URL que te muestra (normalmente `http://localhost:5173`). Probá marcar un jugador como "Mío" y abrí la misma URL en otra pestaña — debería sincronizarse solo.

## 3. Subir a Vercel

**Opción A — con GitHub (recomendada):**
1. Subí esta carpeta como un repo nuevo a GitHub (podés arrastrar los archivos en github.com/new si no usás git desde la terminal).
2. Andá a https://vercel.com → **Add New → Project** → importá ese repo.
3. Vercel detecta automáticamente que es un proyecto Vite. No cambies nada del build.
4. Antes de darle "Deploy", abrí **Environment Variables** y agregá:
   - `VITE_SUPABASE_URL` = tu Project URL de Supabase
   - `VITE_SUPABASE_ANON_KEY` = tu anon key de Supabase
5. Deploy. En un minuto te da una URL tipo `draft-pl-2026-27.vercel.app` — ese es el link para compartir con todo el grupo.

**Opción B — sin GitHub, con la CLI de Vercel:**
```bash
npm install -g vercel
cd draft-pl-2026-27
vercel
```
Seguí las preguntas (creá cuenta si no tenés). Cuando pregunte por variables de entorno, o después desde el dashboard de Vercel, agregá `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` igual que en la Opción A, y volvé a correr `vercel --prod`.

## Notas

- **El ranking/preferencia personal NO se comparte** entre usuarios a propósito — vive en el navegador de cada uno (`localStorage`), para que cada participante del draft pueda ordenar según su propio criterio sin pisar el de los demás.
- **El estado (Mío / Rival / Lesionado) y los jugadores agregados SÍ se comparten** entre todos los que tengan el link, en tiempo real, sin necesidad de login. Cualquiera con la URL puede editar — pensado para un grupo cerrado de amigos. Si en el futuro querés restringir quién puede escribir, se puede agregar autenticación de Supabase y ajustar las políticas del archivo `supabase-setup.sql`.
- Los datos de los planteles están hardcodeados en `src/App.jsx`, tal como figuran en el PDF original. Para corregir o agregar jugadores de forma permanente (no solo desde el formulario "+ Agregar jugador"), se edita directamente ese archivo.
