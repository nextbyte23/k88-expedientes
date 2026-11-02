# K88 — Centro Integral Odontológico y Especialidades Médicas

Sistema de control de expedientes clínicos para clínica dental y médica.

## Funcionalidades

- **6 roles**: Administrador, Recepción, Odontólogo, Médico General, Especialista, Coordinador Médico
- **Odontograma interactivo** SVG (32 dientes, numeración universal)
- **Notas de evolución NOM-004** con signos vitales
- **Recetas médicas** con medicamentos dinámicos
- **Expedientes clínicos SOAP** (general/especialista) y **expedientes dentales** con odontograma
- **Corrección con auditoría**: cada cambio queda en un log interno (no aparece en impresiones)
- **Pagos combinados** (1 o 2 métodos: efectivo + transferencia + tarjeta)
- **Cargos extra**: médicos los agregan, recepción los cobra
- **Facturación** con RFC, razón social, CFDI, IVA
- **Cierre de caja diario** con totales por método, pacientes atendidos y total cobrado
- **Impresión con branding de la clínica** (logo, nombre, dirección, teléfono, RFC)
- **Historial compartido del paciente**: todos los médicos ven el mismo historial
- **Mi perfil**: cada usuario cambia su contraseña; médicos editan sus datos profesionales
- **Modo claro/oscuro** y responsive móvil

## Stack técnico

- **Framework**: Next.js 16 (App Router) + TypeScript
- **UI**: Tailwind CSS 4 + shadcn/ui + Lucide icons
- **Base de datos**: Prisma ORM (SQLite para dev, **Turso** para producción)
- **Estado**: Zustand (cliente) + TanStack Query (servidor)
- **Auth**: cookies HttpOnly + bcryptjs (sin NextAuth)
- **Impresión**: CSS print + render HTML en runtime

## Cuentas demo (después de correr el seed)

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@k88.mx` | `demo1234` |
| Recepción | `recepcion@k88.mx` | `demo1234` |
| Odontólogo 1 | `odontologo1@k88.mx` | `demo1234` |
| Odontólogo 2 | `odontologo2@k88.mx` | `demo1234` |
| Odontólogo 3 | `odontologo3@k88.mx` | `demo1234` |
| Odontólogo 4 | `odontologo4@k88.mx` | `demo1234` |
| Médico General 1 | `medico1@k88.mx` | `demo1234` |
| Médico General 2 | `medico2@k88.mx` | `demo1234` |
| Coordinador Médico | `coordinador@k88.mx` | `demo1234` |

---

## 🚀 Despliegue en Vercel (recomendado)

### Paso 1: Sube el código a GitHub

1. Crea un repositorio nuevo en GitHub (ej. `k88-expedientes`)
2. Sube todos los archivos del ZIP a ese repo (puedes arrastrarlos en github.com)
3. Verifica que el `.gitignore` excluye `node_modules`, `.next`, `.env`, `db/*.db`

### Paso 2: Crea la base de datos en Turso (gratis)

1. Regístrate en https://turso.tech (con GitHub)
2. Crea una base de datos:
   - **Name**: `k88-clinica`
   - **Location**: `nrt` (Tokio) o `iad` (USA Este) — elige el más cercano a tus usuarios
3. Anota estos dos valores:
   - **URL**: aparece como `libsql://k88-clinica-<usuario>.turso.io`
   - **Auth Token**: genera uno en "Settings → Tokens"

### Paso 3: Crea el schema en la base de datos de Turso

En tu computadora local, instala Turso CLI y corre:

```bash
# Instala Turso CLI (una sola vez)
curl -sSfL https://get.tur.so/install.sh | bash

# Inicia sesión
turso auth login

# Crea la base de datos (si no la creaste desde la web)
turso db create k88-clinica

# Obtén la URL y el token
turso db show k88-clinica --url
turso db tokens create k88-clinica
```

Después, crea un archivo `.env` temporal con esos valores y sube el schema:

```bash
# En tu .env local:
DATABASE_URL=libsql://k88-clinica-<usuario>.turso.io
DATABASE_AUTH_TOKEN=<tu-token>

# Crea las tablas en Turso
bun run db:push

# (Opcional) Carga datos demo
bun run db:seed
bun run db:setup-k88
```

### Paso 4: Conecta Vercel a GitHub

1. Ve a https://vercel.com y regístrate (con GitHub)
2. Clic en **"Add New Project"**
3. Importa el repositorio `k88-expedientes`
4. Vercel detecta Next.js automáticamente — no necesitas cambiar settings
5. En **"Environment Variables"**, agrega:
   - `DATABASE_URL` = `libsql://k88-clinica-<usuario>.turso.io`
   - `DATABASE_AUTH_TOKEN` = `<tu-token>`
6. Clic en **"Deploy"**

En ~2 minutos tendrás tu app en `https://k88-expedientes.vercel.app` (URL real depende del nombre del repo).

### Paso 5: Verifica

- Entra a la URL de Vercel
- Debe cargar la pantalla de login con "K88"
- Entra con `admin@k88.mx` / `demo1234` (si corriste el seed) o con cualquier cuenta que hayas configurado

---

## 🟧 Alternativa: Despliegue en Netlify

1. Sube el código a GitHub (igual que paso 1 de Vercel)
2. Ve a https://netlify.com → "Add new site → Import an existing project"
3. Selecciona el repo
4. Build settings (Netlify detecta Next.js automáticamente):
   - **Build command**: `npm run build` (o deja el default)
   - **Publish directory**: `.next`
5. Environment variables:
   - `DATABASE_URL` = `libsql://...`
   - `DATABASE_AUTH_TOKEN` = `<token>`
6. Deploy

---

## 💻 Desarrollo local

### Requisitos
- Node.js 18+ (recomendado 20+) o Bun
- Una terminal

### Setup

```bash
# 1. Instala dependencias
bun install
# o: npm install

# 2. Crea la base de datos local SQLite
bun run db:push
# o: npm run db:push

# 3. Carga datos demo (6 usuarios + 3 pacientes + citas/pagos)
bun run db:seed

# 4. Configura las cuentas K88 (renombra correos a @k88.mx)
bun run db:setup-k88

# 5. Inicia el servidor de desarrollo
bun run dev
# o: npm run dev
```

Abre http://localhost:3000 y entra con cualquiera de las cuentas demo.

---

## 📁 Estructura del proyecto

```
prisma/
  schema.prisma       # Modelo de datos (16 tablas)
  seed.ts             # Datos demo iniciales
  setup-k88.ts        # Script de configuración para K88

src/
  app/
    api/              # 20+ rutas REST con control de roles
    page.tsx          # Página única (SPA con Zustand)
    layout.tsx        # Layout raíz
  components/
    appointments/     # Citas
    billing/          # Facturación
    cash-close/       # Cierre de caja
    clinic/           # Configuración clínica
    dental/           # Odontograma + expediente dental
    extra-charges/    # Cargos extra
    medical/          # Expediente clínico SOAP
    notes/            # Notas evolución + correcciones
    patients/         # Pacientes + detalle
    payments/         # Pagos combinados
    prescriptions/    # Recetas
    print/            # Layout de impresión con branding
    users/            # Gestión de usuarios
    ui/               # Componentes shadcn/ui
    app-shell.tsx     # Layout con sidebar por rol
    dashboard.tsx     # Dashboard por rol
    login.tsx
    my-profile.tsx
    providers.tsx
  lib/
    auth.ts           # Cookies + bcryptjs + sesiones
    api.ts            # Helpers de respuesta
    db.ts             # Prisma client (SQLite/Turso)
    format.ts         # Formato MX (moneda, fechas, etiquetas)
    roles.ts          # Constantes de roles
    use-api.ts        # Hooks de TanStack Query
  store/
    app-store.ts      # Zustand (vista actual, usuario, clínica)
```

---

## 🔒 Seguridad

- Las contraseñas se guardan con bcryptjs (hash + salt)
- Las sesiones usan cookies HttpOnly (no accesibles por JS)
- Cada endpoint valida el rol del usuario con `requireRole()`
- Los médicos solo pueden editar sus propios expedientes
- Las correcciones a expedientes quedan en auditoría interna (no visibles al imprimir)

**Para producción**, cambia las contraseñas `demo1234` desde "Mi perfil" o desde el panel de admin.

---

## ❓ Preguntas frecuentes

**¿Puedo usar PostgreSQL en vez de Turso?**
Sí. Cambia `provider = "sqlite"` a `provider = "postgresql"` en `prisma/schema.prisma`, instala `@prisma/adapter-pg` o usa el cliente estándar, y actualiza `DATABASE_URL` a una URL de PostgreSQL (Neon, Supabase, etc.). El resto del código funciona igual.

**¿Por qué Turso y no SQLite directo en Vercel?**
Vercel y Netlify son serverless — no tienen filesystem persistente. SQLite guarda datos en un archivo local que se pierde entre invocaciones. Turso es SQLite sobre la red, así que conserva los datos.

**¿Cuánto cuesta Turso?**
El plan free incluye: 500 bases de datos, 9GB totales, 1 billón de lecturas/mes — más que suficiente para una clínica pequeña.

**¿Puedo agregar más médicos o pacientes después?**
Sí, desde el panel de admin o recepción. No necesitas modificar el código.

**¿Cómo hago backup de los datos?**
Turso: `turso db dump k88-clinica > backup.sql`
Local: copia el archivo `db/local.db`

---

## 📞 Soporte

Para dudas sobre el sistema o personalizaciones, contacta al desarrollador.
