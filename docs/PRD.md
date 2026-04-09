# PRD — Metrik
**Versão:** 1.0  
**Status:** Rascunho  
**Última atualização:** Abril 2026

---

## 1. Visão Geral

**Metrik** é um SaaS white-label de dashboards de performance para agências de marketing digital. A agência contrata o Metrik, personaliza a plataforma com sua identidade visual, e entrega para cada cliente um painel de acesso com os dados de campanhas em tempo real — sem que o cliente precise acessar o Meta Ads, Google Ads ou GA4 diretamente.

### Proposta de valor
- Para a **agência**: elimina horas de trabalho manual com relatórios, profissionaliza a entrega e cria um diferencial competitivo.
- Para o **cliente da agência**: visibilidade clara e em tempo real das campanhas, sem precisar entender as plataformas de mídia.

---

## 2. O Problema

Agências de marketing digital de todos os portes enfrentam os mesmos gargalos operacionais:

1. **Relatórios manuais e demorados** — montar um relatório mensal de performance exige exportar dados do Meta Ads, Google Ads e GA4, consolidar em planilha ou PowerPoint, e formatar para o cliente. Isso consome de 2 a 6 horas por cliente por mês.

2. **Falta de visibilidade do cliente** — clientes frequentemente acionam a agência para pedir "como estão as campanhas?", gerando trabalho operacional desnecessário.

3. **Imagem pouco profissional** — enviar prints de tela ou PDFs formatados à mão passa uma imagem amadora, especialmente comparado a agências que usam ferramentas proprietárias.

4. **Dificuldade de retenção** — clientes que não veem valor percebido com clareza cancelam mais facilmente. Um dashboard de fácil leitura justifica o investimento na agência.

---

## 3. Solução

O Metrik resolve esses problemas com uma plataforma de três camadas:

```
[Metrik Platform]
       ↓
[Agência] — personaliza marca, conecta clientes, define acessos
       ↓
[Cliente da agência] — visualiza seus dados em um painel com a marca da agência
```

A agência acessa o painel administrativo do Metrik, conecta as contas de mídia dos seus clientes via OAuth, e cada cliente recebe um link com dashboard personalizado. Zero relatório manual.

---

## 4. Usuários e Perfis

### 4.1 Agência (Admin)
- **Quem é:** Dono de agência, gestor de tráfego, diretor de atendimento
- **Nível técnico:** Básico a intermediário — não é desenvolvedor
- **O que faz no Metrik:**
  - Configura white-label (logo, cores, domínio)
  - Cadastra clientes
  - Conecta contas de Meta Ads, Google Ads e GA4 de cada cliente
  - Define quais métricas cada cliente visualiza
  - Gerencia assinatura e plano
- **Dor principal:** Tempo gasto em relatórios manuais

### 4.2 Cliente da Agência (Viewer)
- **Quem é:** Dono de empresa, gerente de marketing do cliente
- **Nível técnico:** Baixo — não entende de plataformas de mídia
- **O que faz no Metrik:**
  - Acessa o dashboard com a marca da agência
  - Visualiza métricas de performance das campanhas
  - Exporta relatório em PDF se quiser
- **Dor principal:** Não saber o que está acontecendo com seu dinheiro investido em mídia

---

## 5. Escopo do MVP (v1.0)

### ✅ Incluído no MVP

#### Autenticação e Multi-tenancy
- Cadastro e login de agências (email + senha, Google OAuth)
- Cada agência é um tenant isolado
- Convite de clientes por email com link de acesso único
- Dois perfis: `agency_admin` e `client_viewer`

#### White-label
- Upload de logo da agência
- Paleta de cores customizável (cor primária, secundária, fundo)
- Nome personalizado exibido na plataforma
- Suporte a domínio customizado (ex: `dashboard.minhaagencia.com.br`) via CNAME

#### Integrações (OAuth)
- **Meta Ads** — campanhas, conjuntos de anúncios, métricas de performance
- **Google Ads** — campanhas, grupos de anúncio, métricas de performance
- **Google Analytics 4** — sessões, usuários, conversões, origem de tráfego

#### Dashboard do Cliente
- Seletor de período (últimos 7, 15, 30 dias, mês atual, mês anterior, customizado)
- Visão consolidada (todas as plataformas somadas)
- Cards de métricas principais: Investimento, Impressões, Cliques, CTR, CPC, Conversões, CPA, ROAS
- Gráfico de linha: evolução do investimento vs. conversões no período
- Gráfico de barras: comparativo por plataforma
- Tabela de campanhas ativas com métricas por linha
- Exportação de relatório em PDF com logo da agência

#### Painel da Agência
- Listagem de todos os clientes com status de conexão das integrações
- Adicionar / remover clientes
- Ver dashboard de qualquer cliente como se fosse o cliente
- Gerenciar integrações por cliente

#### Billing
- Planos por número de clientes conectados:
  - **Starter:** até 5 clientes — R$ 197/mês
  - **Pro:** até 15 clientes — R$ 397/mês
  - **Agency:** até 40 clientes — R$ 697/mês
- Pagamento via Stripe (cartão de crédito)
- Trial de 7 dias sem cartão
- Tela de upgrade quando limite de clientes é atingido
- Cancelamento self-service

#### Landing Page (pré-produto)
- Hero com headline + CTA de lista de espera
- Seção de problema / solução
- Features principais com ícones
- Pricing com os 3 planos
- FAQ
- Captura de email (tabela `waitlist` no Supabase)

---

### ❌ Fora do MVP (roadmap v2+)

| Feature | Motivo do adiamento |
|---|---|
| TikTok Ads | API mais complexa, menor demanda inicial |
| LinkedIn Ads | Nicho B2B, validar após MVP |
| Alertas automáticos (queda de ROAS, etc.) | Complexidade de notificações em tempo real |
| Metas e comparativos de período | Requer histórico de dados acumulado |
| App mobile | Web responsivo cobre o MVP |
| Comentários/anotações no dashboard | Feature de engajamento, não essencial no início |
| Multi-usuário por agência | Maioria das agências pequenas tem 1 admin |
| API pública | Após validação do produto core |

---

## 6. Arquitetura e Stack

### Stack Tecnológico

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Frontend | Next.js 14 (App Router) | SSR nativo, bom SEO para landing, ecosystem maduro |
| UI | Tailwind CSS + shadcn/ui | Velocidade de desenvolvimento, componentes acessíveis |
| Gráficos | Recharts | Simples, customizável, React-native |
| Backend | Next.js API Routes + Server Actions | Evita serviço separado no MVP |
| ORM | Prisma | Type-safe, migrations automatizadas |
| Banco de dados | PostgreSQL via Supabase | Gratuito até escalar, Row Level Security nativo |
| Autenticação | Supabase Auth | Multi-tenant fácil, OAuth providers incluídos |
| Billing | Stripe | Padrão de mercado, SDK excelente |
| Email | Resend + React Email | Templates em React, boa deliverability |
| Deploy | Vercel | Zero config, preview deployments por PR |
| Domínios white-label | Vercel Edge + CNAME | Domínios customizados sem infra adicional |

### Modelo de Dados (simplificado)

```
Agency (tenant)
  ├── id, name, slug
  ├── white_label_config (logo_url, primary_color, custom_domain)
  ├── plan, stripe_customer_id, trial_ends_at
  └── created_at

User
  ├── id, email, name
  ├── agency_id (FK)
  ├── role: 'agency_admin' | 'client_viewer'
  └── client_id (FK, nullable — só para viewers)

Client
  ├── id, name, agency_id (FK)
  ├── status: 'active' | 'inactive'
  └── created_at

Integration
  ├── id, client_id (FK)
  ├── platform: 'meta_ads' | 'google_ads' | 'ga4'
  ├── access_token, refresh_token (encrypted)
  ├── account_id (id da conta na plataforma)
  └── status: 'connected' | 'expired' | 'error'

Waitlist
  ├── id, email, agency_name (optional)
  └── created_at
```

### Segurança Multi-tenant (regra crítica)
- Todo `tenant_id` / `agency_id` vem **sempre** do contexto de autenticação (JWT), nunca do body da request
- Row Level Security (RLS) ativado no Supabase para todas as tabelas
- Tokens de integração armazenados encriptados (AES-256)
- Clientes só visualizam dados da agência que os convidou

---

## 7. User Flows Principais

### Flow 1 — Onboarding da Agência
```
Acessa landing page
→ Clica "Começar grátis"
→ Cria conta (email ou Google)
→ Preenche nome da agência
→ Tela de boas-vindas com checklist:
   [✓] Conta criada
   [ ] Personalizar white-label
   [ ] Adicionar primeiro cliente
   [ ] Conectar primeira integração
→ Cada item do checklist leva ao flow correspondente
```

### Flow 2 — Adicionar Cliente + Conectar Integração
```
Painel da agência → "Novo cliente"
→ Nome do cliente + email
→ Sistema envia convite por email
→ Agência vai para "Configurar integrações" do cliente
→ Clica "Conectar Meta Ads" → OAuth popup
→ Autoriza acesso → token salvo encriptado
→ Status muda para "Conectado"
→ Dashboard do cliente disponível imediatamente
```

### Flow 3 — Acesso do Cliente
```
Recebe email de convite
→ Clica no link → define senha
→ Acessa dashboard com marca da agência
→ Vê métricas do período padrão (últimos 30 dias)
→ Pode trocar período, explorar gráficos, exportar PDF
```

---

## 8. Métricas de Sucesso do MVP

| Métrica | Meta em 90 dias |
|---|---|
| Agências cadastradas no trial | 50 |
| Taxa de conversão trial → pago | 30% |
| Clientes conectados por agência (média) | 4 |
| NPS das agências | > 40 |
| Churn mensal | < 5% |

---

## 9. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| API do Meta Ads com restrições de acesso | Média | Alto | Solicitar acesso antecipado, testar com conta própria |
| Agências não completam onboarding | Alta | Alto | Checklist guiado + email sequence de onboarding |
| Tokens OAuth expirando silenciosamente | Média | Alto | Job de refresh automático + alerta de reconexão |
| Concorrência com ferramentas consolidadas (Reportei, AgencyAnalytics) | Alta | Médio | Focar em UX superior e preço acessível para BR |
| Limite de rate da API das plataformas | Baixa | Médio | Cache de dados (atualização a cada 4h no MVP) |

---

## 10. Fases de Desenvolvimento

### Fase 0 — Validação (Semana 1-2)
- [ ] Landing page no ar com captura de emails
- [ ] Entrevistas com 10 agências da lista de espera
- [ ] Validar disposição de pagamento e preço

### Fase 1 — Foundation (Semana 2-4)
- [ ] Setup do projeto (Next.js + Supabase + Prisma)
- [ ] Autenticação + multi-tenancy
- [ ] Painel básico da agência
- [ ] White-label (logo + cores)
- [ ] Cadastro de clientes

### Fase 2 — Integrações (Semana 4-7)
- [ ] OAuth Meta Ads + busca de dados
- [ ] OAuth Google Ads + busca de dados
- [ ] OAuth GA4 + busca de dados
- [ ] Cache e sincronização de dados

### Fase 3 — Dashboard (Semana 7-9)
- [ ] Dashboard do cliente com cards e gráficos
- [ ] Filtro de período
- [ ] Exportação PDF
- [ ] Domínio customizado (CNAME)

### Fase 4 — Monetização (Semana 9-11)
- [ ] Integração Stripe + planos
- [ ] Trial de 14 dias
- [ ] Emails transacionais (boas-vindas, trial expirando, pagamento)
- [ ] Tela de billing + upgrade

### Fase 5 — Beta (Semana 11-14)
- [ ] Beta fechado com 5-10 agências reais
- [ ] Coleta de feedback intensiva
- [ ] Correções e ajustes
- [ ] Lançamento público

---

## 11. Decisões em Aberto

| Decisão | Opções | Prazo para decidir |
|---|---|---|
| Atualização de dados em tempo real ou batch? | Realtime (webhooks) vs. polling a cada 4h | Antes da Fase 2 |
| Suporte a múltiplos admins por agência? | Sim (aumenta complexidade) vs. Não no MVP | Antes da Fase 1 |
| Armazenar dados históricos ou buscar sempre na API? | Storage próprio (custo) vs. API sempre (lentidão) | Antes da Fase 2 |
| Moeda dos planos | BRL apenas vs. BRL + USD desde o início | Antes da Fase 4 |

---

*Este documento é vivo e deve ser atualizado a cada decisão tomada durante o desenvolvimento.*
