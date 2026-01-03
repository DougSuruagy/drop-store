---
description: Criar loja virtual de dropshipping (Next.js + Express + PostgreSQL via Supabase, PagSeguro, Tailwind)
---

# 📋 Visão geral
Este workflow descreve **todas as etapas** necessárias para montar, lançar e escalar uma loja de dropshipping sem investimento inicial, usando:
- **Frontend:** Next.js (React) com **Tailwind CSS** para UI premium e SSR para SEO.
- **Backend:** Express.js com JWT, integração PagSeguro e PostgreSQL (Supabase).
- **Infra:** Vercel (frontend), Railway/Render (backend), Supabase (BD).
- **CI/CD:** GitHub Actions.
- **Monetização inicial:** CPC/Ads + links de afiliados.

> Cada passo que envolve um comando de terminal está precedido por `// turbo`. Quando o workflow for executado, esses passos podem ser auto‑executados com `SafeToAutoRun: true`.

---
## 1️⃣ Preparação do repositório
1. Crie um novo repositório Git (público ou privado) e clone‑o na sua máquina:
   ```bash
   git init
   git remote add origin <URL‑do‑seu‑repo>
   ```
2. Crie duas pastas no raiz do projeto:
   - `frontend/` – onde ficará o Next.js.
   - `backend/`  – onde ficará o Express.

---
## 2️⃣ Definição das tecnologias (já escolhidas)
- **Banco de dados:** PostgreSQL via Supabase (URL em `DATABASE_URL`).
- **Gateway de pagamento:** PagSeguro (chave `PAGSEGURO_TOKEN`).
- **Estilização:** Tailwind CSS (incluído no scaffold do Next.js).
- **Cache/Filas:** Redis (opcional) e RabbitMQ/Kafka (para jobs de importação).
- **Observabilidade:** Winston + Prometheus + Grafana.

---
## 3️⃣ Scaffold das aplicações
### 3.1 Frontend – Next.js + Tailwind
// turbo
```bash
npx -y create-next-app@latest ./frontend --typescript --eslint --tailwind
```

### 3.2 Backend – Express
// turbo
```bash
mkdir backend && cd backend && npm init -y
```
// turbo
```bash
cd backend && npm install express cors dotenv jsonwebtoken bcryptjs pg knex
```
// turbo
```bash
cd backend && npm install -D nodemon
```

> **Obs.:** Os comandos acima criam a estrutura básica, instalando as dependências necessárias para JWT, conexão PostgreSQL (`pg` + `knex`) e variáveis de ambiente.

---
## 4️⃣ Configuração de variáveis de ambiente
Crie um `.env` em **frontend** e **backend**:
- `frontend/.env.local`
  ```env
  NEXT_PUBLIC_API_URL=http://localhost:5000/api
  ```
- `backend/.env`
  ```env
  PORT=5000
  DATABASE_URL=<URL‑Supabase>
  JWT_SECRET=<string‑segura>
  PAGSEGURO_TOKEN=<token‑PagSeguro>
  ```

---
## 5️⃣ Migrations (Knex) – Modelagem do banco
// turbo
```bash
cd backend && npx knex init
```
// turbo
```bash
cd backend && npx knex migrate:make init_schema
```
> Preencha `backend/migrations/<timestamp>_init_schema.js` com as tabelas `users`, `products`, `suppliers`, `orders`, `order_items`, `payments`, `shipments`, `returns`.

---
## 6️⃣ Implementação dos endpoints REST
Crie a estrutura de rotas em `backend/src/routes/`:
- `auth.js` – `/auth/register`, `/auth/login`
- `products.js` – `/products`, `/products/:id`
- `cart.js` – `/cart`
- `checkout.js` – `/checkout`
- `webhooks.js` – `/webhooks/payment`
- `orders.js` – `/orders/:id`, `/orders/:id/cancel`
- `shipments.js` – `/shipments/:id`
- `returns.js` – `/returns`

---
## 7️⃣ Frontend – Páginas essenciais
Em `frontend/pages/` crie:
- `index.tsx` – Home com banner e grid de produtos.
- `product/[id].tsx` – Detalhe do produto.
- `cart.tsx` – Resumo do carrinho.
- `checkout.tsx` – Formulário de endereço + integração PagSeguro.
- `account.tsx` – Histórico de pedidos.
- `blog/index.tsx` – Blog SEO.
- `vip.tsx` – Área VIP (para assinantes).

---
## 8️⃣ Integração PagSeguro (checkout)
1. No backend, crie um serviço `paymentService.js` que gera a URL de pagamento PagSeguro.
2. No frontend, ao submeter o checkout, redirecione o usuário para a URL retornada.
3. Configure o webhook `/webhooks/payment` para receber notificações de status e atualizar o pedido.

---
## 9️⃣ CI/CD – GitHub Actions
Crie dois workflows em `.github/workflows/`:
- `frontend.yml` – `npm run build && npx vercel --prod` (ou Vercel CLI).
- `backend.yml` – Build Docker (ou `npm run start`) e deploy no Railway/Render.

---
## 🔟 Jobs de automação (cron)
1. **Importação de catálogos** – script `jobs/importCatalog.js` que roda diariamente (usando `node-cron`).
2. **Precificação dinâmica** – script `jobs/priceAdjust.js` que recalcula margens com base na concorrência.
3. **Monitoramento de concorrência** – script `jobs/priceMonitor.js` (scraping ou APIs).

---
## 📈 Lançamento da MVP
1. Deploy do frontend (Vercel) e backend (Railway).
2. Popule a tabela `products` com os 10 itens iniciais (capinhas, carregadores, etc.).
3. Ative anúncios CPC/Ads (Google AdSense) e links de afiliados nas páginas de produto.
4. Comece a divulgar nas redes sociais (Instagram, TikTok, YouTube Shorts) e grupos de nicho.
5. Monitore métricas (visitas, taxa de conversão, receita) via Supabase + Grafana.

---
## 🛠️ Próximas evoluções (após a MVP)
- Área VIP com assinatura mensal.
- Marketplace interno para terceiros.
- Programa de fidelidade e pontos.
- Venda de relatórios de tendências (dados agregados).
- White‑label da plataforma.

---
## ✅ Checklist rápido
- [ ] Workflow criado (este documento).
- [ ] Tecnologias definidas (PostgreSQL Supabase, PagSeguro, Tailwind).
- [ ] Scaffold das apps concluído.
- [ ] Variáveis de ambiente configuradas.
- [ ] Migrations e modelo de BD prontos.
- [ ] Endpoints API implementados.
- [ ] Páginas Next.js básicas prontas.
- [ ] CI/CD configurado.
- [ ] MVP lançada e tráfego orgânico iniciado.

---
**Pronto!** Siga o checklist passo a passo e você terá a loja online sem custo inicial, pronta para gerar receita nos primeiros meses.
