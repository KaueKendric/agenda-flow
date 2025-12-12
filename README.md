# 🗓️ AgendaFlow

Sistema completo de agendamentos para salões de beleza e barbearias, desenvolvido com Node.js + Fastify + Prisma no backend e React + Vite no frontend.

![Status](https://img.shields.io/badge/Status-Em%20Produção-success)
![Node](https://img.shields.io/badge/Node.js-20+-green)
![React](https://img.shields.io/badge/React-18+-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-blue)

## 📌 Visão Geral

O **AgendaFlow** é um sistema de agendamentos voltado para salões e barbearias, com autenticação JWT, gestão de agendamentos, profissionais, clientes e serviços, além de integração de email via Nodemailer.

## 🧰 Stack

### Backend
- Node.js 20+
- Fastify
- TypeScript
- Prisma ORM
- PostgreSQL (local via Docker / produção via Neon)
- JWT (@fastify/jwt)
- Zod (validação)
- Nodemailer (emails)

### Frontend
- React 18+
- TypeScript
- Vite
- TailwindCSS
- shadcn/ui
- React Router
- Axios

## 📁 Estrutura do Projeto (monorepo)

agenda-flow/
├── backend/
└── frontend/

text

## ✅ Pré-requisitos

- Node.js 20+
- Docker + Docker Compose
- Git

## 🐳 Rodar Localmente (com Docker Compose)

### 1) Clonar o repositório

git clone https://github.com/<seu-usuario>/agenda-flow.git
cd agenda-flow

text

---

## 🗄️ Backend + Banco (Docker)

### 2) Configurar variáveis do backend

cd backend
cp .env.example .env

text

Edite `backend/.env` (exemplo):

PostgreSQL Local (Docker)
POSTGRES_USER=agendaflow
POSTGRES_PASSWORD=senha_super_secreta_123
POSTGRES_DB=agendaflow

Prisma
DATABASE_URL=postgresql://agendaflow:senha_super_secreta_123@localhost:5432/agendaflow

API
PORT=3333
HOST=0.0.0.0
FRONTEND_URL=http://localhost:5173
NODE_ENV=development

JWT
JWT_SECRET=seu_jwt_secret_local_super_secreto

Email (opcional local)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app
EMAIL_FROM=AgendaFlow seu-email@gmail.com

text

### 3) Subir o PostgreSQL via Docker Compose

Ainda dentro de `backend/`:

docker-compose up -d

text

Verificar container:

docker ps

text

### 4) Instalar dependências e preparar o banco

npm install
npx prisma generate
npx prisma migrate dev
npm run seed

text

(Opcional) abrir o Prisma Studio:

npx prisma studio

text

### 5) Rodar o backend

npm run dev

text

Backend disponível em:
- API: `http://localhost:3333`
- Health: `http://localhost:3333/health`
- Docs: `http://localhost:3333/docs`

---

## 🌐 Frontend (Vite)

### 6) Configurar variáveis do frontend

Em outro terminal:

cd ../frontend
cp .env.example .env

text

Edite `frontend/.env`:

VITE_API_URL=http://localhost:3333/api

text

### 7) Instalar dependências e rodar o frontend

npm install
npm run dev

text

Frontend disponível em:
- `http://localhost:5173`

---

## 🔑 Credenciais (após seed)

- Admin: `admin@agendaflow.com` / `Admin@123456`
- Profissional: `joao@agendaflow.com` / `Prof@123456`
- Profissional: `maria@agendaflow.com` / `Prof@123456`

## 🧪 Scripts úteis

### Backend
npm run dev
npm run build
npm start
npm run seed
npx prisma studio
npx prisma migrate dev

text

### Frontend
npm run dev
npm run build
npm run preview

text

## 🧹 Docker (atalhos)

Dentro de `backend/`:

docker-compose down # parar
docker-compose down -v # parar e apagar dados
docker logs -f agendaflow_db # logs do banco

text

## 👤 Autor

**Kaue Kendric Loureiro da Costa**