# Agri Terminal v2.4

Frontend + API para visualizar dados de commodities usando tabelas já carregadas no Supabase:
- `public.agro_prices`
- `public.agro_metrics_analysis`

## Rodar localmente

1. Instale dependências:
```bash
npm install
```

2. Copie variáveis:
```bash
cp .env.example .env.local
```

3. Preencha no `.env.local`:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

4. Inicie:
```bash
npm run dev
```

App e API local:
- `http://localhost:3000`
- Endpoints: `/api/market-data`, `/api/analysis/:symbol`, `/api/historical/:symbol`

## Integração Supabase + GitHub + Vercel

### GitHub
Configure secrets do repositório:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Vercel
Configure as mesmas variáveis em `Project Settings > Environment Variables`.

Rotas serverless para produção já estão em:
- `api/market-data.ts`
- `api/analysis/[symbol].ts`
- `api/historical/[symbol].ts`

Essas rotas usam a mesma lógica de leitura do Supabase de `lib/supabase-data.ts`.
