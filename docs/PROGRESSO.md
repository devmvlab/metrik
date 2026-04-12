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

### Próximo: Fase 4 — Monetização
- Stripe + planos (Starter/Pro/Agency)
- Trial de 7 dias
- Emails transacionais (boas-vindas, trial expirando, pagamento)
- Tela de billing + upgrade
