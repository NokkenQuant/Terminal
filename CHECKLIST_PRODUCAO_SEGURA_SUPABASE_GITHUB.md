# Checklist e Manual de Implementacao Segura (Supabase + GitHub)

Baseado em: `MANUAL_BOAS_PRATICAS_CIBERSEGURANCA.md`

## Objetivo
Colocar o modelo atual em producao com protecao de dados sensiveis, reduzindo risco de vazamento em autenticacao, banco, repositorio, CI/CD e operacao.

---

## 1) Checklist executivo (go/no-go)

## Dados e arquitetura
- [ ] Dados de usuario classificados (PII, autenticacao, telemetria, negocio).
- [ ] Mapeamento de onde cada dado e criado, trafegado e armazenado.
- [ ] Minimizacao de dados aplicada (sem coleta desnecessaria).

## Supabase
- [ ] Auth no Supabase habilitado (sem login em localStorage para producao).
- [ ] RLS ativada em todas as tabelas com dados de usuario.
- [ ] Politicas RLS testadas para `SELECT`, `INSERT`, `UPDATE`, `DELETE`.
- [ ] Tabelas separadas por dominio: `profiles`, `watchlists`, `price_alerts`, `subscriptions`.
- [ ] Chave `service_role` nunca exposta no frontend.
- [ ] Segredos apenas no painel de secrets da plataforma.

## GitHub e CI/CD
- [ ] Branch protection habilitada na `main`.
- [ ] PR obrigatorio com review de seguranca.
- [ ] Secret scanning e Dependabot ativos.
- [ ] SAST/CodeQL ativo no repositório.
- [ ] Bloqueio de commit de `.env`/credenciais (pre-commit + gitignore).

## Aplicacao
- [ ] Sessao segura (cookies `HttpOnly`, `Secure`, `SameSite=Strict`) ou token seguro server-side.
- [ ] Rate limit para login e rotas sensiveis.
- [ ] Validacao de entrada no backend.
- [ ] Logs sem senha/token/PII sensivel.
- [ ] Headers de seguranca ativos (CSP, HSTS, X-Content-Type-Options, Referrer-Policy).

## Operacao
- [ ] Backup e restauracao testados.
- [ ] Monitoramento e alertas de anomalia ativos.
- [ ] Runbook de incidente publicado e testado.
- [ ] Rotacao de segredos definida (periodica + emergencial).

---

## 2) Manual passo a passo (producao)

## Passo 1 - Preparar ambientes
1. Criar ambientes separados: `dev`, `staging`, `prod`.
2. Criar projeto Supabase por ambiente (ou separar por schema com governanca forte).
3. Criar variaveis de ambiente por ambiente no provedor de deploy.
4. Garantir que `SUPABASE_SERVICE_ROLE_KEY` exista somente no backend/edge functions.

## Passo 2 - Migrar autenticacao para Supabase Auth
1. Habilitar Supabase Auth (email/senha e, se aplicavel, OAuth).
2. Remover dependencia de autenticacao local para producao.
3. Mapear usuario autenticado para tabela `profiles` usando `auth.uid()`.
4. Exigir verificacao de email para reduzir fraude.
5. Implementar reset de senha e invalidacao de sessao em troca de senha.

## Passo 3 - Modelar tabelas seguras
Criar tabelas:
- `profiles` (id = `auth.users.id`, full_name, email, age, sex, city, state, country, created_at)
- `watchlists` (id, user_id, asset_code, created_at)
- `price_alerts` (id, user_id, asset_code, target_price, direction, expires_at, active, created_at)
- `subscriptions` (id, user_id, plan, status, renewal_date, gateway_customer_id, created_at)

Boas praticas:
1. PK em UUID.
2. `user_id` com FK para `auth.users(id)`.
3. Indices: `(user_id)`, `(user_id, asset_code)`, `(active, expires_at)`.
4. Uniques para evitar duplicidade indevida (ex: mesma watchlist repetida).

## Passo 4 - Ativar RLS e politicas
1. `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`.
2. Politica padrao para leitura/escrita do proprio usuario:
   - `USING (auth.uid() = user_id)`
   - `WITH CHECK (auth.uid() = user_id)`
3. Criar politicas separadas por operacao (`select`, `insert`, `update`, `delete`).
4. Testar com usuario A tentando acessar dados de usuario B (deve falhar).

## Passo 5 - Backend seguro para operacoes sensiveis
1. Implementar endpoints server-side para:
   - criacao/edicao de perfil
   - criacao de alerta
   - operacoes de assinatura/pagamento
2. Nunca aceitar `user_id` vindo do cliente sem validacao de sessao.
3. Resolver usuario pela sessao JWT.
4. Validar payload com schema (zod/yup/joi).
5. Sanitizar strings e normalizar campos.

## Passo 6 - Sessao e transporte
1. Usar HTTPS obrigatorio.
2. Cookies de sessao com `HttpOnly`, `Secure`, `SameSite=Strict`.
3. Definir expiracao curta para access token e renovacao segura.
4. Revogar sessao em logout.

## Passo 7 - Segredos e configuracao
1. Criar `.env.example` sem credenciais reais.
2. Manter `.env` no `.gitignore`.
3. Configurar segredos no GitHub Actions/host (nunca no repo).
4. Rotacionar `SUPABASE_SERVICE_ROLE_KEY` se houver suspeita de exposicao.

## Passo 8 - GitHub hardening
1. Habilitar `Branch protection` na `main`:
   - PR obrigatorio
   - 1-2 approvals
   - status checks obrigatorios
2. Habilitar:
   - Dependabot alerts + updates
   - Secret scanning
   - CodeQL
3. Criar workflow CI:
   - lint
   - testes
   - SAST
   - bloqueio de merge em falha
4. Adotar Conventional Commits e changelog para rastreabilidade.

## Passo 9 - Observabilidade e auditoria
1. Logar eventos de seguranca:
   - login sucesso/falha
   - alteracao de senha
   - criacao/edicao/exclusao de alerta
2. Nao logar senha, token, CPF, email completo em texto aberto.
3. Criar alertas operacionais:
   - pico de falhas de login
   - aumento anormal de requests
   - tentativas de acesso negadas por RLS

## Passo 10 - Backup, restore e incidente
1. Ativar backup automatico no Supabase.
2. Testar restauracao em staging mensalmente.
3. Definir runbook de incidente:
   - deteccao
   - contencao
   - erradicacao
   - recuperacao
   - post-mortem
4. Definir SLA de resposta e dono por etapa.

## Passo 11 - LGPD e compliance minima
1. Definir base legal e politica de privacidade.
2. Implementar fluxo de:
   - exportacao de dados do usuario
   - exclusao de conta/dados
3. Definir prazo de retencao e descarte.

---

## 3) Checklist tecnico de migracao do modelo atual

## Autenticacao
- [ ] Remover contas e sessoes em `localStorage` no modo producao.
- [ ] Integrar Supabase Auth no frontend.
- [ ] Trocar `registerFreeAccount` local por API/Edge Function.

## Perfil
- [ ] Persistir `full_name`, `email`, `age`, `sex`, `phone`, `city`, `state`, `country` no Supabase.
- [ ] Validacao de campos no backend.

## Watchlist
- [ ] Persistir watchlist por `user_id`.
- [ ] Garantir unique por (`user_id`, `asset_code`).

## Alertas
- [ ] Persistir `target_price`, `direction`, `expires_at`, `active`.
- [ ] Job para desativar alertas expirados.
- [ ] Log de disparo de alerta (auditoria).

## Plano premium
- [ ] Controle de acesso no backend (nao apenas UI).
- [ ] Tabela `subscriptions` integrada a gateway de pagamento.
- [ ] Webhook validado por assinatura (HMAC do provedor).

---

## 4) Testes de seguranca antes de ir para producao
- [ ] Teste de autorizacao horizontal (IDOR).
- [ ] Teste de brute force em login.
- [ ] Teste de SQLi/XSS em campos de entrada.
- [ ] Teste de revogacao de sessao.
- [ ] Teste de restauracao de backup.
- [ ] Teste de regressao em politicas RLS.

---

## 5) Riscos comuns e mitigacao
- Risco: chave `service_role` no frontend.
  - Mitigacao: usar somente backend/edge; rotacionar se exposta.
- Risco: RLS mal configurada.
  - Mitigacao: testes automatizados de politica por perfil.
- Risco: segredos commitados.
  - Mitigacao: secret scanning + pre-commit + rotacao imediata.
- Risco: logs com PII.
  - Mitigacao: mascaramento e politica de logging.

---

## 6) Entrega minima para go-live seguro
- [ ] Supabase Auth + RLS completo.
- [ ] GitHub hardening completo.
- [ ] Segredos fora do repositorio.
- [ ] Backup/restore testado.
- [ ] Monitoramento/alertas ativos.
- [ ] Runbook de incidente aprovado.
