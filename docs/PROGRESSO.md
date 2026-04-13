# PROGRESSO.md — Metrik

Registro do que foi implementado por fase. Atualizado ao final de cada fase.

---

## Fase 1 — Foundation ✅

**Concluída em:** Abril 2026

### O que foi entregue
- Setup Next.js 14 + Supabase + Prisma + TypeScript strict
- Schema do banco: `Agency`, `WhiteLabelConfig`, `User`, `Client`, `Integration`, `Waitlist`
- Autenticação com Supabase Auth (email/senha + Google OAuth)
- Middleware de proteção de rotas com verificação de perfil (`agency_admin` / `client_viewer`)
- Painel da agência: dashboard, listagem de clientes, detalhe do cliente
- Modal de criação de cliente
- Layout do dashboard com sidebar
- Landing page: Hero, Problem, Solution, Features, Pricing, FAQ, Footer
- Navbar e Footer com logo SVG Metrik (glow no hero)
- Páginas de autenticação: login, cadastro, onboarding, convite

---

## Fase 2 — Integrações ✅

**Concluída em:** Abril 2026

### O que foi entregue

#### Utilitários base
- `lib/utils/crypto.ts` — `encrypt()` / `decrypt()` AES-256-GCM (já existia da Fase 1)
- `prisma/schema.prisma` — model `IntegrationDataCache` adicionado com índices em `integrationId` e `expiresAt`
- `npx prisma db push` executado — tabela criada no Supabase

#### Meta Ads (OAuth + dados)
- `lib/integrations/meta/auth.ts` — `getMetaAuthUrl()` + `handleMetaCallback()`
- `lib/integrations/meta/data.ts` — `getMetaMetrics()` com cache de 4h
- `app/api/integrations/meta/connect/route.ts`
- `app/api/integrations/meta/callback/route.ts`
- Métricas: spend, impressions, clicks, ctr, cpc, conversions, cost_per_conversion, purchase_roas
- Agrupado por campanha

#### Google Ads (OAuth + dados)
- `lib/integrations/google-ads/auth.ts` — `getGoogleAdsAuthUrl()` + `handleGoogleAdsCallback()`
- `lib/integrations/google-ads/data.ts` — `getGoogleAdsMetrics()` com cache de 4h
- `app/api/integrations/google-ads/connect/route.ts`
- `app/api/integrations/google-ads/callback/route.ts`
- Métricas: cost_micros (→ BRL), impressions, clicks, ctr, average_cpc, conversions, cost_per_conversion, roas
- Agrupado por campanha, Customer ID da conta direta

#### Google Analytics 4 (OAuth + dados)
- `lib/integrations/ga4/auth.ts` — `getGA4AuthUrl()` + `handleGA4Callback()`
- `lib/integrations/ga4/data.ts` — `getGA4Metrics()` com cache de 4h
- `app/api/integrations/ga4/connect/route.ts`
- `app/api/integrations/ga4/callback/route.ts`
- Métricas: sessions, users, newUsers, conversions, totalRevenue, bounceRate
- Dimensão: sessionSource

#### Refresh automático de tokens
- `lib/integrations/refresh.ts` — `refreshMetaToken()` + `refreshGoogleToken()`
- `app/api/cron/refresh-tokens/route.ts` — protegido por `CRON_SECRET`, roda a cada 6h
- `vercel.json` — cron configurado: `0 */6 * * *`
- Se refresh falhar: status atualizado para `EXPIRED`

#### UI atualizada
- `app/(dashboard)/dashboard/clientes/[id]/page.tsx` — botões de conectar/reconectar por plataforma, badges de status (verde/âmbar/vermelho), data de última sync, feedback de callback OAuth via query params

### Variáveis de ambiente necessárias nesta fase
| Variável | Status |
|---|---|
| `META_APP_ID` | ✅ Configurada |
| `META_APP_SECRET` | ✅ Configurada |
| `GOOGLE_CLIENT_ID` | ✅ Configurada |
| `GOOGLE_CLIENT_SECRET` | ✅ Configurada |
| `ENCRYPTION_KEY` | ✅ Configurada |
| `CRON_SECRET` | ⚠️ **Pendente** — adicionar no `.env` e na Vercel antes do deploy |
| `GOOGLE_ADS_DEVELOPER_TOKEN` | ⚠️ **Pendente** — necessário para Google Ads API |

### Pendências antes do deploy
1. Adicionar `CRON_SECRET` no `.env` e nas variáveis de ambiente da Vercel
2. Obter e configurar `GOOGLE_ADS_DEVELOPER_TOKEN` (solicitado no Google Ads API Center)
3. Configurar Redirect URIs nos apps OAuth:
   - Meta: `{APP_URL}/api/integrations/meta/callback`
   - Google: `{APP_URL}/api/integrations/google-ads/callback` e `{APP_URL}/api/integrations/ga4/callback`

---

## Fase 3 — Dashboard ✅

**Concluída em:** Abril 2026

### O que foi entregue

#### Camada de dados
- `lib/dashboard/periods.ts` — presets de período (7d, 15d, 30d, mês atual, mês anterior) + `getDateRange()` + `parsePeriod()`
- `lib/integrations/meta/daily.ts` — dados diários do Meta Ads (spend + conversões por dia) com cache separado
- `lib/integrations/google-ads/daily.ts` — dados diários do Google Ads com cache separado
- `lib/integrations/ga4/daily.ts` — dados diários do GA4 (sessions por dia) com cache separado
- `lib/dashboard/aggregator.ts` — `getDashboardData()`: agrega campanhas + série diária + breakdown por plataforma
- `prisma/schema.prisma` — campo `dataType` adicionado ao `IntegrationDataCache` para separar `campaigns` de `daily`

#### UI do cliente
- `app/(client)/layout.tsx` — layout white-label: logo + cor primária da agência via CSS variable
- `app/(client)/dashboard/page.tsx` — Server Component: 8 cards de métricas, 2 gráficos, tabela de campanhas
- `components/dashboard/MetricCard.tsx` — card de métrica com ícone
- `components/dashboard/PeriodSelector.tsx` — seletor de período via URL search params
- `components/dashboard/CampaignTable.tsx` — tabela de campanhas com badge de plataforma e ROAS colorido
- `components/dashboard/PrintButton.tsx` — botão "Exportar PDF" via `window.print()`
- `components/charts/InvestmentLineChart.tsx` — gráfico de linha: investimento vs. conversões por dia (Recharts)
- `components/charts/PlatformBarChart.tsx` — gráfico de barras: investimento vs. conversões por plataforma (Recharts)

#### API
- `app/api/dashboard/data/route.ts` — `GET /api/dashboard/data?clientId=...&period=30d` — para o admin visualizar dashboard de qualquer cliente

#### Exportação PDF
- CSS `@media print` em `globals.css` — A4 landscape, cores exatas, sem sombras, quebras de página controladas

### Decisão arquitetural tomada
- Rota do cliente: `/client/dashboard` (sem slug na URL — tenant resolvido pelo JWT)
- Custom domain será adicionado no middleware como overlay futuro (zero mudança de rota)

### Variáveis de ambiente corrigidas nesta fase
| Variável | Status |
|---|---|
| `ENCRYPTION_KEY` | ✅ Configurada (estava vazia — causava erro ao conectar integrações) |

---

## Fase 4 — Monetização (em andamento)

### Etapa 1 — Guardrails de plano ✅

**Concluída em:** Abril 2026

#### O que foi entregue
- `lib/billing/plans.ts` — `PLAN_LIMITS`, `PLAN_LABELS`, `PLAN_PRICES`, `getPlanLimit()`, `isAtPlanLimit()`
- `lib/db/agencies.ts` — `getAgencyWithPlanUsage()` (agency + contagem de clientes em paralelo)
- `app/api/clients/route.ts` — verifica limite do plano antes de criar cliente (HTTP 403 + `code: PLAN_LIMIT_REACHED`)
- `middleware.ts` — propaga `x-pathname` via header para Server Components lerem sem Prisma no Edge
- `app/(dashboard)/layout.tsx` — verifica expiração do trial e redireciona para `/dashboard/billing`
- `app/(dashboard)/dashboard/clientes/page.tsx` — barra de uso do plano (verde → âmbar → vermelho) com link de upgrade
- `app/(dashboard)/dashboard/clientes/NewClientModal.tsx` — estado de limite atingido com CTA para billing
- `components/dashboard/Sidebar.tsx` — link "Plano & Billing" na navegação
- `app/(dashboard)/dashboard/billing/page.tsx` — página de billing com status de trial, barra de uso e cards de planos

#### Decisão arquitetural
- Trial check no `DashboardLayout` (Server Component), não no middleware — Prisma não roda em Edge Runtime

---

### Etapa 2 — Integração Stripe ✅

**Concluída em:** Abril 2026

#### O que foi entregue

##### Schema e client
- `prisma/schema.prisma` — campos `stripeSubscriptionId` e `stripeSubscriptionStatus` adicionados ao model `Agency`
- `npx prisma db push` executado — colunas criadas no Supabase
- `lib/billing/stripe.ts` — Stripe client singleton (API version `2026-03-25.dahlia`)
- `lib/billing/plans.ts` — `getStripePriceId(plan)` e `getPlanByPriceId(priceId)` para mapear planos ↔ Price IDs do Stripe
- `lib/db/agencies.ts` — `getAgencyByStripeCustomerId()` para lookup nos webhooks

##### API routes
- `app/api/billing/checkout/route.ts` — cria Stripe Checkout Session em modo `subscription`; reusa customer existente se houver; aceita `{ plan }` no body
- `app/api/billing/portal/route.ts` — cria Stripe Customer Portal Session para autoatendimento (cancelar, trocar cartão, mudar plano)
- `app/api/webhooks/stripe/route.ts` — handler de eventos com validação de assinatura:
  - `checkout.session.completed` → salva `stripeCustomerId`, `stripeSubscriptionId`, `plan`, `status`
  - `customer.subscription.updated` → atualiza `plan` (via price ID) e `stripeSubscriptionStatus`
  - `customer.subscription.deleted` → reseta para `STARTER`, limpa subscriptionId, status `canceled`
  - `invoice.payment_failed` → status `past_due` (preparado para trigger de email na Etapa 4)

##### UI atualizada
- `components/billing/CheckoutButton.tsx` — client component com loading state; redireciona para checkout ou portal (se já tem assinatura)
- `components/billing/ManageSubscriptionButton.tsx` — client component para abrir portal Stripe
- `app/(dashboard)/dashboard/billing/page.tsx` — botões de upgrade funcionais, banner de `past_due`, feedback de retorno do checkout (`?checkout=success|canceled`)
- `app/(dashboard)/layout.tsx` — trial check atualizado: respeita `stripeSubscriptionStatus === 'active' | 'trialing'`

#### Variáveis de ambiente necessárias (adicionar no `.env` e na Vercel)
| Variável | Descrição |
|---|---|
| `STRIPE_SECRET_KEY` | Chave secreta do Stripe Dashboard |
| `STRIPE_WEBHOOK_SECRET` | Gerado com `stripe listen --forward-to` (dev) ou no Dashboard (prod) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Chave pública (ainda não usada, mas configurar agora) |
| `STRIPE_PRICE_ID_STARTER` | Price ID do plano Starter no Stripe |
| `STRIPE_PRICE_ID_PRO` | Price ID do plano Pro no Stripe |
| `STRIPE_PRICE_ID_AGENCY` | Price ID do plano Agency no Stripe |

#### Setup necessário no Stripe Dashboard
1. Criar 3 produtos (Starter, Pro, Agency) com preços recorrentes mensais
2. Copiar os Price IDs para as variáveis de ambiente acima
3. Configurar o webhook endpoint: `{APP_URL}/api/webhooks/stripe`
   - Eventos a escutar: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
4. Configurar o Customer Portal no Stripe Dashboard (Billing → Customer portal)

#### Teste local com Stripe CLI
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

### Etapa 3 — Emails transacionais ✅

**Concluída em:** Abril 2026

#### O que foi entregue

##### Templates de email (React Email)
- `emails/WelcomeEmail.tsx` — boas-vindas ao criar a agência (7 dias de trial, link para o painel)
- `emails/TrialExpiringEmail.tsx` — aviso 3 dias antes do trial encerrar (link para billing)
- `emails/PaymentFailedEmail.tsx` — falha no pagamento (link para gerenciar assinatura)
- `emails/IntegrationExpiredEmail.tsx` — token OAuth expirado (link para reconectar integração)
- `emails/ClientInviteEmail.tsx` — já existia ✅

##### Funções de envio centralizadas
- `lib/email/index.ts` — `sendWelcomeEmail()`, `sendTrialExpiringEmail()`, `sendPaymentFailedEmail()`, `sendIntegrationExpiredEmail()`
  - Helper `getResend()` — retorna null silenciosamente se `RESEND_API_KEY` não configurada (não quebra em dev)
  - Helper `formatDate()` — formata datas em pt-BR
  - `PLATFORM_LABELS` — mapeia `META_ADS` → `'Meta Ads'`, etc.
  - FROM: `Metrik <onboarding@resend.dev>` (trocar para domínio verificado em produção)

##### Cron de trial reminder
- `app/api/cron/trial-reminder/route.ts` — dispara `TrialExpiringEmail` para agências cujo trial encerra entre 2.5 e 3.5 dias a partir de agora (janela de ±12h garante disparo único)
  - Filtra apenas agências sem `stripeCustomerId` (ainda não assinaram)
- `vercel.json` — cron adicionado: `0 9 * * *` (9h UTC diariamente)

##### Pontos de disparo integrados
- `lib/auth/actions.ts` — `signUp()` e `completeGoogleSignup()` disparam `sendWelcomeEmail()` (fire-and-forget com `void`)
- `app/api/webhooks/stripe/route.ts` — `handleInvoicePaymentFailed()` dispara `sendPaymentFailedEmail()` após marcar `past_due`
- `lib/integrations/refresh.ts` — `refreshMetaToken()` e `refreshGoogleToken()` agora retornam `Promise<boolean>` (true = sucesso, false = expirou)
- `app/api/cron/refresh-tokens/route.ts` — detecta `false` no retorno do refresh, busca admin da agência via join (integration → client → agency → users) e dispara `sendIntegrationExpiredEmail()`; contador `failed` agora incrementa corretamente

#### Variável de ambiente necessária
| Variável | Descrição |
|---|---|
| `RESEND_API_KEY` | Chave da API do Resend (resend.com) |

#### Setup necessário no Resend
1. Criar conta em resend.com
2. Gerar API Key e adicionar em `RESEND_API_KEY` no `.env` e na Vercel
3. Em produção: verificar domínio (ex: `metrik.com.br`) e trocar o `FROM` em `lib/email/index.ts`
