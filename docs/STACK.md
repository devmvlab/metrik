# STACK.md — Decisões Técnicas do Metrik

Este documento registra cada decisão de stack com justificativa.
Antes de substituir qualquer tecnologia, leia o motivo da escolha aqui.

---

## Frontend

### Next.js 14 (App Router)
**Escolha:** Next.js 14 com App Router  
**Alternativas consideradas:** Remix, Vite + React SPA  
**Motivo:**
- Server Components reduzem bundle size e melhoram performance
- SSR nativo é essencial para SEO da landing page
- App Router tem suporte a layouts aninhados — perfeito para a separação agency/client
- Server Actions simplificam mutações sem precisar de API routes separadas
- Ecosystem maduro, excelente integração com Vercel (deploy zero-config)

### Tailwind CSS
**Escolha:** Tailwind CSS  
**Alternativas consideradas:** CSS Modules, Styled Components, Emotion  
**Motivo:**
- Velocidade de desenvolvimento muito superior
- Consistência visual sem esforço (design tokens embutidos)
- Excelente integração com shadcn/ui
- Purge automático — zero CSS morto em produção

### shadcn/ui
**Escolha:** shadcn/ui  
**Alternativas consideradas:** MUI, Chakra UI, Mantine, Radix diretamente  
**Motivo:**
- Componentes acessíveis (Radix UI por baixo) sem overhead de tema
- Código vive no seu projeto — customização total sem overrides
- Sem conflito com Tailwind
- Visual limpo e profissional por padrão — ideal para SaaS

### Recharts
**Escolha:** Recharts  
**Alternativas consideradas:** Chart.js, Victory, Tremor  
**Motivo:**
- API declarativa em React — muito mais fácil de integrar
- Leve e customizável
- Suporte nativo a responsividade
- Tremor foi considerado mas tem opiniões demais de estilo

---

## Backend

### Next.js API Routes + Server Actions
**Escolha:** Sem servidor separado no MVP  
**Alternativas consideradas:** Express separado, NestJS, Fastify  
**Motivo:**
- Elimina um serviço inteiro de infraestrutura no MVP
- Server Actions cobrem 80% dos casos de mutação
- API Routes para webhooks (Stripe, OAuth callbacks) e endpoints públicos
- Quando necessário escalar para microsserviços, é simples extrair

### Prisma ORM
**Escolha:** Prisma  
**Alternativas consideradas:** Drizzle, Kysely, Supabase client direto  
**Motivo:**
- Type-safety completa — erros de query em tempo de compilação
- Migrations automáticas e rastreáveis via Git
- Prisma Studio para inspecionar dados em desenvolvimento
- Drizzle é mais performático mas tem DX inferior para times pequenos

---

## Banco de dados

### PostgreSQL via Supabase
**Escolha:** Supabase  
**Alternativas consideradas:** PlanetScale (MySQL), Neon, Railway Postgres  
**Motivo:**
- Row Level Security (RLS) nativo do Postgres — perfeito para multi-tenancy
- Supabase Auth + Storage incluídos — elimina serviços adicionais
- Tier gratuito generoso para começar
- Storage integrado para logos das agências (white-label)
- Realtime nativo para v2
- Fácil migrar para Postgres próprio se necessário

### Estratégia de multi-tenancy
**Escolha:** Shared database, shared schema com `agency_id` em todas as tabelas  
**Alternativas consideradas:** Schema por tenant, banco por tenant  
**Motivo:**
- Schema por tenant: complexidade operacional alta no MVP
- Banco por tenant: custo proibitivo para começar
- Shared schema com RLS do Supabase garante isolamento com baixa complexidade
- Suficiente até centenas de agências — revisar na v3

---

## Autenticação

### Supabase Auth
**Escolha:** Supabase Auth  
**Alternativas consideradas:** NextAuth.js, Auth.js, Clerk, Firebase Auth  
**Motivo:**
- Já integrado com o banco — sem join manual entre users e dados
- JWT com claims customizáveis (agency_id, role)
- Google OAuth pronto para usar
- Clerk seria mais fácil de implementar mas adiciona custo e dependência externa
- NextAuth funciona mas requer mais configuração manual para multi-tenancy

---

## Billing

### Stripe
**Escolha:** Stripe  
**Alternativas consideradas:** Paddle, Lemon Squeezy, Pagar.me  
**Motivo:**
- Padrão absoluto para SaaS — documentação excelente
- SDK TypeScript de alta qualidade
- Webhooks confiáveis e fáceis de testar (Stripe CLI)
- Suporte a BRL nativo
- Lemon Squeezy foi considerado pela simplicidade mas menor controle
- Paddle cobra % sobre receita — desvantagem em escala

---

## Email

### Resend + React Email
**Escolha:** Resend  
**Alternativas consideradas:** SendGrid, Postmark, AWS SES  
**Motivo:**
- React Email permite escrever templates em JSX — mesma linguagem do projeto
- Resend tem excelente deliverability e tier gratuito generoso (3k emails/mês)
- API simples e SDK TypeScript nativo
- Preview em browser durante desenvolvimento

---

## Deploy e Infra

### Vercel
**Escolha:** Vercel  
**Alternativas consideradas:** Railway, Render, AWS, Fly.io  
**Motivo:**
- Zero configuração para Next.js — é o mesmo time
- Preview deployments automáticos por PR — essencial para revisão
- Edge Network global sem configuração
- Domínios customizados com SSL automático — necessário para white-label
- Custo razoável até escalar (revisar plano quando > 100 agências)

### Supabase Storage
**Escolha:** Supabase Storage para logos  
**Alternativas consideradas:** AWS S3, Cloudinary, Uploadthing  
**Motivo:**
- Já estamos no Supabase — sem serviço adicional
- CDN automático para assets públicos
- Suficiente para logos e assets estáticos do MVP

---

## Segurança

### Encriptação de tokens OAuth
**Escolha:** AES-256-GCM via biblioteca nativa do Node.js (`crypto`)  
**Motivo:**
- Tokens de Meta Ads, Google Ads e GA4 são dados sensíveis
- Encriptação simétrica com chave de ambiente — simples e eficaz
- Implementação em `/lib/utils/crypto.ts`

```typescript
// Interface esperada
export function encrypt(text: string): string
export function decrypt(text: string): string
```

---

## Bibliotecas principais

```json
{
  "dependencies": {
    "next": "14.x",
    "react": "18.x",
    "typescript": "5.x",
    "@prisma/client": "latest",
    "@supabase/supabase-js": "latest",
    "@supabase/ssr": "latest",
    "stripe": "latest",
    "resend": "latest",
    "@react-email/components": "latest",
    "recharts": "latest",
    "zod": "latest",
    "tailwindcss": "3.x",
    "facebook-nodejs-business-sdk": "latest",
    "google-ads-api": "latest",
    "@googleapis/analyticsdata": "latest",
    "date-fns": "latest",
    "lucide-react": "latest"
  },
  "devDependencies": {
    "prisma": "latest",
    "vitest": "latest",
    "@testing-library/react": "latest",
    "eslint": "latest",
    "prettier": "latest"
  }
}
```

---

## Limites e pontos de revisão

| Limite | Threshold para revisar |
|---|---|
| Shared schema multi-tenancy | > 500 agências ou problemas de performance |
| Vercel como backend | > 10k requests/min ou custos > $500/mês |
| Cache de 4h para dados de integração | Se agências reclamarem de dados desatualizados |
| Single admin por agência | Quando > 30% das agências pedirem multi-usuário |
| Next.js como backend único | Quando surgir necessidade de jobs em background complexos |

---

## Decisões em aberto

| Decisão | Opções | Impacto |
|---|---|---|
| Realtime vs. polling para dados | Supabase Realtime vs. polling 4h | Performance vs. complexidade |
| Histórico de dados | Armazenar no próprio banco vs. sempre buscar na API | Custo vs. velocidade |
| Moeda dos planos | BRL apenas vs. BRL + USD | Alcance de mercado |
| Background jobs | Vercel Cron vs. serviço separado (Trigger.dev) | Escala vs. simplicidade |
