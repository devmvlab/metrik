# Metrik — Contexto para Claude Code

## O que é este projeto
SaaS white-label de dashboards de performance para agências de marketing digital.
Agências contratam o Metrik, personalizam com sua marca, e entregam dashboards
aos seus clientes com dados de Meta Ads, Google Ads e GA4 em tempo real.

Leia /docs/PRD.md antes de qualquer implementação de feature nova.
Leia /docs/STACK.md para decisões técnicas e justificativas.

---

## Stack principal
- Next.js 14 (App Router) — NUNCA usar Pages Router
- TypeScript strict mode — SEMPRE
- Tailwind CSS + shadcn/ui — padrão de UI
- Prisma ORM + PostgreSQL via Supabase
- Supabase Auth — autenticação e multi-tenancy
- Stripe — billing e assinaturas
- Resend + React Email — emails transacionais
- Recharts — gráficos e visualizações
- Vercel — deploy

---

## Arquitetura multi-tenant (CRÍTICO)

Cada agência é um tenant isolado. Estas regras são invioláveis:

- O `agency_id` vem SEMPRE do contexto de autenticação (JWT/session), NUNCA do body da request ou de query params
- Toda query no banco DEVE incluir filtro por `agency_id`
- Row Level Security (RLS) está ativado no Supabase — nunca desativar
- Clientes (viewers) só enxergam dados da agência que os convidou
- Tokens de OAuth de integrações são armazenados encriptados (AES-256)

Exemplo correto:
```typescript
// CORRETO — agency_id vem da session
const { agency_id } = await getSession()
const clients = await db.client.findMany({ where: { agency_id } })

// ERRADO — agency_id vem da request
const { agency_id } = req.body // NUNCA fazer isso
```

---

## Perfis de usuário

- `agency_admin` — acesso total ao painel da agência
- `client_viewer` — acesso somente ao dashboard do próprio cliente

Verificar perfil em toda rota protegida via middleware em `/middleware.ts`.
Autenticação é centralizada no middleware — não duplicar checks nas páginas.

---

## Estrutura de pastas

```
/app
  /(marketing)        → landing page, páginas públicas
  /(auth)             → login, cadastro, convite
  /(dashboard)        → painel da agência (agency_admin)
  /(client)           → dashboard do cliente (client_viewer)
  /api                → API routes e webhooks
/components
  /ui                 → componentes shadcn/ui (não editar)
  /charts             → componentes de gráfico (Recharts)
  /dashboard          → componentes específicos do dashboard
  /marketing          → componentes da landing page
/lib
  /auth               → helpers de autenticação
  /db                 → client Prisma e queries reutilizáveis
  /integrations       → Meta Ads, Google Ads, GA4 clients
  /billing            → helpers Stripe
  /email              → templates e funções de envio
  /utils              → funções utilitárias gerais
/prisma
  schema.prisma       → schema do banco
  /migrations         → migrations geradas pelo Prisma
/docs
  PRD.md              → requisitos completos do produto
  STACK.md            → decisões de arquitetura
  /decisions          → ADRs (Architecture Decision Records)
/emails               → templates React Email
```

---

## Comandos do projeto

```bash
npm run dev           # servidor de desenvolvimento
npm run build         # build de produção
npm run lint          # lint com ESLint
npm run test          # testes com Vitest
npm run db:push       # aplicar schema no banco (desenvolvimento)
npm run db:migrate    # gerar e aplicar migration (produção)
npm run db:studio     # Prisma Studio — visualizar banco
npm run db:seed       # popular banco com dados de teste
npm run email:dev     # preview de emails no browser
```

---

## Regras absolutas

- NUNCA commitar arquivos .env, secrets, tokens ou API keys
- NUNCA expor dados de um tenant para outro
- SEMPRE criar branch nova para cada feature: `git checkout -b feature/nome-da-feature`
- SEMPRE escrever TypeScript — zero arquivos .js no projeto
- SEMPRE usar Server Actions ou API Routes para mutações — nunca chamar o banco direto do client component
- NUNCA armazenar tokens de OAuth em plaintext — usar encrypt/decrypt de /lib/utils/crypto.ts
- Commits separados por arquivo com mensagens descritivas
- SEMPRE rodar `npm run lint` antes de abrir PR

---

## Padrões de código

### Nomenclatura
- Componentes React: PascalCase (`DashboardCard.tsx`)
- Funções e variáveis: camelCase (`getClientById`)
- Arquivos de rota Next.js: kebab-case (`/app/dashboard/client-list/page.tsx`)
- Constantes: UPPER_SNAKE_CASE (`MAX_CLIENTS_STARTER = 5`)
- Tipos e interfaces: PascalCase com prefixo descritivo (`type ClientWithIntegrations`)

### Componentes
- Preferir Server Components por padrão
- Usar Client Components ('use client') apenas quando necessário (interatividade, hooks)
- Props tipadas com TypeScript — sem `any`
- Componentes de UI sempre em /components — nunca inline em páginas

### API Routes e Server Actions
- Validar input com Zod em toda rota
- Retornar erros padronizados: `{ error: string, code: string }`
- Autenticar antes de qualquer lógica de negócio

### Banco de dados
- Queries complexas em /lib/db — não espalhadas nas páginas
- Usar transações Prisma para operações que envolvem múltiplas tabelas
- Index em todos os campos de foreign key e campos usados em WHERE frequente

---

## Integrações externas

### Meta Ads
- SDK: `facebook-nodejs-business-sdk`
- Escopos OAuth: `ads_read`, `ads_management`
- Rate limit: respeitar limites da API, usar cache de 4h
- Dados em cache na tabela `integration_data_cache`

### Google Ads
- SDK: `google-ads-api`
- Escopos OAuth: `https://www.googleapis.com/auth/adwords`
- Usar Customer ID da conta, não da conta MCC

### Google Analytics 4
- SDK: `@googleapis/analyticsdata`
- Escopos OAuth: `https://www.googleapis.com/auth/analytics.readonly`
- Property ID da GA4 (não o UA antigo)

---

## White-label

Configuração white-label por agência:
- Logo: URL do Supabase Storage (`/storage/v1/object/public/logos/{agency_id}`)
- Cores: CSS variables injetadas via `AgencyThemeProvider`
- Domínio customizado: resolvido via middleware verificando o header `host`

```typescript
// middleware.ts — resolver tenant por domínio customizado
const host = req.headers.get('host')
const agency = await getAgencyByCustomDomain(host)
// ou via slug: app.metrik.com.br/[slug]
```

---

## Billing (Stripe)

- Planos: `starter` (5 clientes, R$197), `pro` (15 clientes, R$397), `agency` (40 clientes, R$697)
- Trial: 7 dias sem cartão
- Webhooks Stripe em `/api/webhooks/stripe` — sempre validar assinatura
- Nunca confiar no redirect do checkout — confirmar pagamento sempre pelo webhook
- Cancelamento self-service disponível no painel de billing

---

## Emails transacionais (Resend)

Templates em /emails com React Email:
- `WelcomeEmail` — boas-vindas ao cadastrar
- `ClientInviteEmail` — convite para cliente acessar dashboard
- `TrialExpiringEmail` — 3 dias antes do trial acabar
- `PaymentFailedEmail` — falha no pagamento
- `IntegrationExpiredEmail` — token OAuth expirado, precisa reconectar

---

## Variáveis de ambiente necessárias

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Banco de dados
DATABASE_URL=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Integrações
META_APP_ID=
META_APP_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Resend
RESEND_API_KEY=

# Encriptação de tokens
ENCRYPTION_KEY=

# App
NEXT_PUBLIC_APP_URL=
```

---

## O que NÃO fazer

- Não usar Pages Router (`/pages`) — somente App Router
- Não instalar bibliotecas de UI alternativas ao shadcn/ui sem discutir
- Não armazenar estado global com Redux — usar Zustand se necessário
- Não usar `fetch` direto para chamar APIs internas — usar Server Actions
- Não criar endpoints sem validação Zod
- Não fazer queries ao banco em Client Components
- Não criar migrações manualmente — sempre via `prisma migrate dev`
- Não adicionar lógica de negócio em componentes de UI
