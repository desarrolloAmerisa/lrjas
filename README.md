# LRJAS — Lugar de Reunión de Jóvenes Adultos Solteros

Aplicación web para gestión de registros y asistencias de participantes en actividades y eventos.

## Stack

- **Frontend:** React, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, React Hook Form, Zod
- **Backend:** NestJS, TypeScript, Prisma, PostgreSQL, JWT

## Inicio rápido con Docker

```bash
docker compose up -d
```

Servicios:

| Servicio   | URL                      |
|-----------|--------------------------|
| Frontend  | http://localhost:5173    |
| Backend   | http://localhost:3001/api |
| PostgreSQL| localhost:5432           |

## Credenciales de administrador

- **Email:** admin@lrjas.com
- **Contraseña:** admin123

## Desarrollo local (sin Docker)

### Backend

```bash
cd backend
cp .env.example .env   # o usar .env existente
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Módulos

1. **Registro de participantes** — Formulario dinámico con campos personalizables
2. **Código personal** — Generación automática de código único (000-999)
3. **QR personal** — Credencial visual descargable
4. **Check-in** — Escaneo QR y código manual
5. **Dashboard** — KPIs y gráficas
6. **Gestión de participantes** — Tabla con búsqueda, filtros y paginación
7. **Configuración de formularios** — Constructor de campos checkbox
8. **Historial de asistencias** — Por participante con fecha, hora y método

## Estructura

```
lrjas/
├── docker-compose.yml
├── backend/
│   ├── prisma/
│   └── src/modules/
└── frontend/
    └── src/
        ├── components/
        ├── pages/
        ├── services/
        └── types/
```
