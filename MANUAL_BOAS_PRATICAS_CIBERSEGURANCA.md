# Manual de Boas Praticas de Ciberseguranca

## Objetivo
Este manual define praticas minimas para reduzir risco de vazamento de dados dos usuarios da plataforma.

## 1. Dados e classificacao
- Classificar dados em: publicos, internos, sensiveis e criticos.
- Tratar como sensivel: usuario, email, senha, tokens, logs de sessao e preferencias.
- Coletar apenas o minimo necessario para operacao do produto.

## 2. Senhas e autenticacao
- Nunca armazenar senha em texto puro.
- Armazenar hash com algoritmo forte e salt unico por usuario (exemplo: `argon2id` ou `bcrypt` com custo alto).
- Exigir politica minima de senha e bloquear senhas fracas.
- Implementar limite de tentativas de login e atraso progressivo contra brute force.
- Implementar MFA para administradores.

## 3. Sessao e tokens
- Usar tokens de curta duracao e refresh token com rotacao.
- Marcar cookies de sessao como `HttpOnly`, `Secure` e `SameSite=Strict`.
- Invalidar sessao em logout e em troca de senha.
- Nunca expor tokens em URL ou logs.

## 4. Controle de acesso
- Aplicar RBAC por plano (`free`, `premium`, `admin`) no backend e nao apenas no frontend.
- Validar permissao em toda rota protegida, inclusive leitura.
- Principio do menor privilegio para servicos e operadores.

## 5. API e backend
- Validar e sanitizar toda entrada.
- Aplicar rate limit por IP e por usuario.
- Padronizar respostas de erro sem vazar stack trace.
- Registrar auditoria de acoes sensiveis (login, alteracao de plano, exportacao de dados).

## 6. Banco e armazenamento
- Ativar criptografia em repouso no provedor.
- Separar ambientes `dev`, `staging`, `prod` com chaves distintas.
- Configurar politicas RLS para restringir dados por usuario.
- Evitar uso de `service_role` no cliente.

## 7. Segredos e configuracao
- Guardar segredos apenas em cofre de secrets.
- Nunca commitar `.env` com credenciais reais.
- Rotacionar chaves periodicamente e imediatamente apos suspeita de incidente.

## 8. Frontend
- Nunca confiar no frontend para autorizacao final.
- Aplicar CSP, `X-Frame-Options`, `X-Content-Type-Options` e `Referrer-Policy`.
- Evitar armazenamento de dados sensiveis em `localStorage`.

## 9. Logs e monitoramento
- Mascarar PII e segredos em logs.
- Definir alertas de seguranca: pico de falhas de login, exportacoes anormais, acessos fora de padrao.
- Guardar trilha de auditoria com retencao definida.

## 10. Backup e resposta a incidente
- Backup criptografado e teste regular de restauracao.
- Plano de resposta com dono, SLA e comunicacao.
- Em incidente: conter, investigar, corrigir, notificar e revisar controles.

## 11. Conformidade e governanca
- Definir base legal para tratamento de dados (LGPD).
- Permitir exclusao e portabilidade quando aplicavel.
- Revisao trimestral de acessos e politicas.

## Checklist rapido de deploy seguro
- [ ] Rotas premium validadas no backend.
- [ ] RLS ativa nas tabelas de usuario.
- [ ] Senhas com hash forte e salt.
- [ ] Rate limit e protecao brute force ativos.
- [ ] Headers de seguranca ativos.
- [ ] Logs sem PII sensivel.
- [ ] Segredos fora do repositorio.
