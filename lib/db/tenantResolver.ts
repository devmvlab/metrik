import { createClient } from '@supabase/supabase-js'

export type AgencyContext = {
  id: string
  name: string
  slug: string
  plan: 'STARTER' | 'PRO' | 'AGENCY'
  logoUrl: string | null
  primaryColor: string | null
  secondaryColor: string | null
}

function createEdgeClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}

export async function getAgencyContextBySlug(slug: string): Promise<AgencyContext | null> {
  const supabase = createEdgeClient()
  const { data, error } = await supabase
    .from('agencies')
    .select('id, name, slug, plan, white_label_configs(logo_url, primary_color, secondary_color)')
    .eq('slug', slug)
    .single()

  if (error || !data) return null

  type WL = { logo_url: string | null; primary_color: string | null; secondary_color: string | null }
  const raw = data.white_label_configs as unknown as WL | WL[] | null
  const wl = Array.isArray(raw) ? raw[0] : raw

  return {
    id: data.id as string,
    name: data.name as string,
    slug: data.slug as string,
    plan: data.plan as AgencyContext['plan'],
    logoUrl: wl?.logo_url ?? null,
    primaryColor: wl?.primary_color ?? null,
    secondaryColor: wl?.secondary_color ?? null,
  }
}

export async function getAgencyContextByCustomDomain(domain: string): Promise<AgencyContext | null> {
  const supabase = createEdgeClient()
  const { data, error } = await supabase
    .from('white_label_configs')
    .select('logo_url, primary_color, secondary_color, agencies(id, name, slug, plan)')
    .eq('custom_domain', domain)
    .single()

  if (error || !data) return null

  type AgRow = { id: string; name: string; slug: string; plan: string }
  const raw = data.agencies as unknown as AgRow | AgRow[] | null
  const ag = Array.isArray(raw) ? raw[0] : raw
  if (!ag) return null

  return {
    id: ag.id,
    name: ag.name,
    slug: ag.slug,
    plan: ag.plan as AgencyContext['plan'],
    logoUrl: (data.logo_url as string | null) ?? null,
    primaryColor: (data.primary_color as string | null) ?? null,
    secondaryColor: (data.secondary_color as string | null) ?? null,
  }
}

/**
 * Resolve o contexto da agência a partir do host da request.
 * Retorna null para o domínio principal e ambientes locais.
 * Usado no middleware (Edge Runtime) — não usa Prisma.
 */
export async function resolveAgencyFromHost(host: string): Promise<AgencyContext | null> {
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'app.metrikapp.com.br'
  const cleanHost = host.split(':')[0] // remove porta (dev)

  // Subdomínio Metrik: {slug}.app.metrikapp.com.br
  if (cleanHost.endsWith(`.${appDomain}`)) {
    const slug = cleanHost.slice(0, -(appDomain.length + 1))
    if (slug) return getAgencyContextBySlug(slug)
    return null
  }

  // Domínio principal, localhost e IPs privados — sem resolução
  if (
    cleanHost === appDomain ||
    cleanHost === 'localhost' ||
    /^127\./.test(cleanHost) ||
    /^192\.168\./.test(cleanHost) ||
    /^::1$/.test(cleanHost) ||
    /^10\./.test(cleanHost)
  ) {
    return null
  }

  // Domínio próprio da agência: dashboard.minhaagencia.com
  return getAgencyContextByCustomDomain(cleanHost)
}
