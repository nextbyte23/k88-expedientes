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
- **Base de datos**: Prisma ORM + **PostgreSQL (Supabase)**
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

## 🚀 Despliegue en Vercel + Supabase (recomendado)

### Paso 1: Crea el proyecto en Supabase (5 minutos)

1. Regístrate en https://supabase.com (con GitHub)
2. Clic en **"New project"**:
   - **Name**: `k88-clinica`
   - **Database Password**: elige una contraseña fuerte y **guárdala** (la necesitarás)
   - **Region**: `Southeast Asia (Singapore)` o `East US` — la más cercana a Tapachula
3. Espera ~2 minutos mientras Supabase crea el proyecto
4. Ve a **Project Settings → Database → Connection string**
5. Verás dos URLs:
   - **Transaction** (port `6543`) — para `DATABASE_URL` (con pooling, ideal para serverless)
   - **Session** (port `5432`) — para `DIRECT_URL` (para migraciones)
6. En cada URL, sustituye `[YOUR-PASSWORD]` por la contraseña que elegiste
7. Copia ambas URLs completas

Ejemplo (con valores ficticios):
```
DATABASE_URL=postgresql://postgres.abc123xy:MiPassFuerte2025@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.abc123xy:MiPassFuerte2025@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

### Paso 2: Sube el código a GitHub

1. Descarga y descomprime el ZIP en una carpeta local (ej. `k88-expedientes`)
2. Entra a https://github.com/new y crea un repo (ej. `k88-expedientes`)
3. Sube los archivos:
   - **Opción web**: arrastra los archivos en github.com (sin `git init`)
   - **Opción Git CLI**:
     ```bash
     cd k88-expedientes
     git init
     git add .
     git commit -m "Sistema K88 expedientes clínicos"
     git branch -M main
     git remote add origin https://github.com/<tu-usuario>/k88-expedientes.git
     git push -u origin main
     ```

### Paso 3: Crea el schema y carga datos en Supabase

En tu computadora local, dentro de la carpeta del proyecto:

```bash
# Instala dependencias (necesitas Node 18+ o Bun)
bun install
# o: npm install

# Crea un archivo .env con las dos URLs de Supabase
# (copia de .env.example y sustituye los valores)

# Crea las tablas en Supabase
bun run db:push
# o: npm run db:push

# Carga datos demo (usuarios K88 + pacientes + citas + pagos)
bun run db:seed
bun run db:setup-k88
```

### Paso 4: Conecta Vercel a GitHub

1. Ve a https://vercel.com → "Add New Project"
2. Importa el repo `k88-expedientes`
3. Vercel detecta Next.js automáticamente
4. En **Environment Variables**, agrega:
   - `DATABASE_URL` = (la URL con `:6543` y `?pgbouncer=true`)
   - `DIRECT_URL` = (la URL con `:5432`, sin pgbouncer)
5. Clic en **Deploy** → en 2-3 minutos está listo

### Paso 5: Verifica

- Entra a la URL de Vercel (ej. `https://k88-expedientes.vercel.app`)
- Debe cargar la pantalla de login con "K88"
- Entra con `admin@k88.mx` / `demo1234`
- Verás el dashboard con los datos de la clínica K88

---

## 🟧 Alternativa: Despliegue en Netlify

1. Sube el código a GitHub (igual que el paso 2)
2. https://netlify.com → "Add new site → Import an existing project"
3. Selecciona el repo — Netlify detecta Next.js
4. Environment variables:
   - `DATABASE_URL` = (URL con `:6543` y `?pgbouncer=true`)
   - `DIRECT_URL` = (URL con `:5432`)
5. Deploy

---

## 💻 Desarrollo local

### Requisitos
- Node.js 18+ (recomendado 20+) o Bun
- Una cuenta de Supabase (usa la misma de producción o crea un proyecto dev separado)

### Setup

```bash
# 1. Instala dependencias
bun install
# o: npm install

# 2. Crea .env con las URLs de Supabase (copia de .env.example)
#    DATABASE_URL=postgresql://...
#    DIRECT_URL=postgresql://...

# 3. Crea las tablas
bun run db:push

# 4. Carga datos demo
bun run db:seed
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
  schema.prisma       # Modelo de datos (PostgreSQL, 16 tablas)
  seed.ts             # Datos demo iniciales
  setup-k88.ts        # Script de configuración para K88

src/
  app/
    api/              # 20+ rutas REST con control de roles
    page.tsx          # Página única (SPA con Zustand)
    layout.tsx
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
    db.ts             # Prisma client (PostgreSQL)
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

## 💾 Backups

**Desde Supabase** (web):
- Ve a tu proyecto → **Database → Table Editor** → exportar a CSV
- O **Database → Backups** para snapshots automáticos diarios (plan free)

**Con pg_dump** (CLI):
```bash
pg_dump "postgresql://postgres.[ref]:[pwd]@aws-0-[region].pooler.supabase.com:5432/postgres" \
  --format=plain --no-owner --no-acl > backup.sql
```

**Restaurar**:
```bash
psql "postgresql://postgres.[ref]:[pwd]@aws-0-[region].pooler.supabase.com:5432/postgres" \
  < backup.sql
```

---

## ❓ Preguntas frecuentes

**¿Por qué Supabase y no SQLite directo en Vercel?**
Vercel y Netlify son serverless — no tienen filesystem persistente. SQLite guarda datos en un archivo local que se pierde entre invocaciones. Supabase ofrece PostgreSQL gestionado con free tier generoso (500MB, pausado tras 1 semana de inactividad).

**¿Cuánto cuesta Supabase?**
Plan free: 500MB de almacenamiento, 2 proyectos, pausado tras 1 semana sin actividad (se reactiva con un clic). Plan Pro ($25/mes): 8GB, sin pausa, ideal para producción clínica.

**¿Puedo usar Neon o Railway en vez de Supabase?**
Sí. Solo cambia las URLs en `.env` — el código funciona igual porque usa Prisma + PostgreSQL estándar.

**¿Puedo agregar más médicos o pacientes después?**
Sí, desde el panel de admin o recepción. No necesitas modificar el código.

---

## 📞 Soporte

Para dudas sobre el sistema o personalizaciones, contacta al desarrollador.
