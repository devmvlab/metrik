-- =============================================================================
-- METRIK — Auth Hook + Row Level Security
-- =============================================================================
--
-- COMO APLICAR:
--
-- 1. Acesse o Supabase Dashboard → SQL Editor
-- 2. Cole TODO o conteúdo deste arquivo e execute (Run)
-- 3. Registre o Auth Hook:
--    → Authentication → Hooks → "Customize Access Token (JWT)"
--    → Type: PostgreSQL function
--    → Schema: public
--    → Function: custom_access_token_hook
-- 4. Salve. O hook passa a injetar agency_id e role em todos os JWTs novos.
--    Tokens existentes precisam ser renovados (re-login ou refresh).
--
-- NOTAS:
--   - As políticas RLS abaixo usam (auth.jwt() ->> 'agency_id') que só funciona
--     após o Auth Hook estar registrado e o usuário ter feito re-login.
--   - Prisma conecta com o usuário postgres (superuser) → bypassa RLS.
--     As políticas protegem acesso direto via Supabase JS client / Postgrest.
--   - O Prisma já filtra por agency_id na camada de código. RLS é a segunda
--     camada de defesa.
--
-- =============================================================================


-- =============================================================================
-- PARTE 1: Auth Hook — injeta agency_id e role no JWT
-- =============================================================================

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claims        jsonb;
  v_agency_id   text;
  v_role        text;
  v_client_id   text;
BEGIN
  claims := event -> 'claims';

  -- Busca os dados do usuário na tabela public.users
  SELECT
    agency_id,
    role::text,
    client_id
  INTO v_agency_id, v_role, v_client_id
  FROM public.users
  WHERE id = (event ->> 'user_id');

  -- Injeta os claims customizados se o usuário existir no banco
  IF v_agency_id IS NOT NULL THEN
    claims := jsonb_set(claims, '{agency_id}', to_jsonb(v_agency_id));
    claims := jsonb_set(claims, '{role}',      to_jsonb(v_role));

    IF v_client_id IS NOT NULL THEN
      claims := jsonb_set(claims, '{client_id}', to_jsonb(v_client_id));
    END IF;
  END IF;

  RETURN jsonb_set(event, '{claims}', claims);
END;
$$;

-- Permissão para o Supabase Auth invocar a função
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;

-- Revoga execução pública (função deve ser chamada apenas pelo Supabase Auth)
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM PUBLIC;


-- =============================================================================
-- PARTE 2: Row Level Security
-- =============================================================================

-- Ativa RLS em todas as tabelas do schema público
ALTER TABLE public.agencies          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.white_label_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist          ENABLE ROW LEVEL SECURITY;


-- -----------------------------------------------------------------------------
-- agencies: cada usuário só vê a própria agência
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "agencies_own_tenant" ON public.agencies;
CREATE POLICY "agencies_own_tenant" ON public.agencies
  FOR ALL
  USING (id = (auth.jwt() ->> 'agency_id'));


-- -----------------------------------------------------------------------------
-- white_label_configs: vinculado à agência do usuário
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "white_label_own_tenant" ON public.white_label_configs;
CREATE POLICY "white_label_own_tenant" ON public.white_label_configs
  FOR ALL
  USING (agency_id = (auth.jwt() ->> 'agency_id'));


-- -----------------------------------------------------------------------------
-- users: usuários só veem outros usuários da mesma agência
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "users_own_tenant" ON public.users;
CREATE POLICY "users_own_tenant" ON public.users
  FOR ALL
  USING (agency_id = (auth.jwt() ->> 'agency_id'));


-- -----------------------------------------------------------------------------
-- clients: usuários só veem clientes da própria agência
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "clients_own_tenant" ON public.clients;
CREATE POLICY "clients_own_tenant" ON public.clients
  FOR ALL
  USING (agency_id = (auth.jwt() ->> 'agency_id'));


-- -----------------------------------------------------------------------------
-- integrations: via client_id da própria agência
-- client_viewer só enxerga a integração do próprio cliente
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "integrations_own_tenant" ON public.integrations;
CREATE POLICY "integrations_own_tenant" ON public.integrations
  FOR ALL
  USING (
    client_id IN (
      SELECT id FROM public.clients
      WHERE agency_id = (auth.jwt() ->> 'agency_id')
    )
  );


-- -----------------------------------------------------------------------------
-- waitlist: apenas a service role pode acessar diretamente
-- (dados de waitlist não são expostos via Supabase JS client)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "waitlist_deny_authenticated" ON public.waitlist;
CREATE POLICY "waitlist_deny_authenticated" ON public.waitlist
  FOR ALL
  USING (false);
-- A service role bypassa o RLS automaticamente — o acesso continua funcionando
-- via Prisma (conecta como postgres/superuser) e via Server Actions com admin client.
