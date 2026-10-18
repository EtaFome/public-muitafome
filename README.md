<div align="center">

<img src="assets/logo.png" alt="Muita Fome" width="120" />

# Muita Fome

**Peça comida de restaurantes e lanchonetes perto de você — e gerencie seu estabelecimento em tempo real.**

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React Native](https://img.shields.io/badge/React%20Native-Expo-000020?logo=expo&logoColor=white)](https://expo.dev)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=next.js&logoColor=white)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Socket.io](https://img.shields.io/badge/Socket.io-realtime-010101?logo=socket.io&logoColor=white)](https://socket.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## O que é o Muita Fome

Muita Fome é uma plataforma de pedidos de comida no modelo **marketplace** — como o iFood —
conectando **clientes** que querem pedir comida a **restaurantes, lanchonetes e outros
estabelecimentos** que gerenciam seu cardápio, pedidos e fila de preparo em tempo real.

A plataforma tem duas frentes:

- 📱 **App do cliente** (mobile) — busca estabelecimentos, monta o pedido, acompanha o
  status ao vivo, avalia depois de receber.
- 💻 **Painel do estabelecimento** (web) — cardápio, fila de pedidos, aceitar/recusar,
  cupons, configurações da loja — tudo em tempo real, sem precisar dar F5.

Novos estabelecimentos se cadastram sozinhos e entram no ar automaticamente assim que a
assinatura mensal é confirmada — sem depender de um time comercial para aprovar cadastro.

## Funcionalidades

**Cliente (app mobile)**
- Busca e filtro de estabelecimentos por nome/categoria, com indicação de loja aberta/fechada
- Cardápio com categorias, itens, opções/variações (ex: tamanho, adicionais) e preço por escolha
- Carrinho, endereço de entrega e cupom de desconto (percentual ou valor fixo)
- Pagamento direto para a loja na entrega ou na retirada: dinheiro (com troco), cartão na maquininha ou PIX
- Retirada no balcão, sem taxa de entrega, nas lojas que aceitam
- Acompanhamento do pedido em tempo real (recebido → em preparo → saiu para entrega → concluído)
- Histórico de pedidos com "pedir de novo"
- Avaliação (nota + comentário) depois do pedido concluído
- Notificações push nas mudanças de status

**Estabelecimento (painel web)**
- Cadastro e assinatura mensal (ativação automática da loja ao confirmar pagamento)
- Fila de pedidos em tempo real, separada por categoria (Recebido, Em preparo, Saiu para
  entrega, Concluído)
- Aceitar ou recusar pedido com motivo; cancelamento com motivo dos dois lados
- Pedido pago na entrega/retirada chega na fila na hora, com o que cobrar e o troco; pedido pago pelo app só chega depois que o pagamento é confirmado
- Retirada no balcão opcional (liga em Configurações)
- Gestão de cardápio (categorias, itens, disponibilidade, opções/variações)
- Cupons de desconto e taxa de entrega configurável
- Abrir/fechar a loja manualmente (cliente não consegue pedir de loja fechada)

## Como funciona (tempo real)

```
Cliente monta o pedido  ──▶  Pagamento confirmado (webhook)  ──▶  Pedido entra na fila da loja
                                                                          │
                                                                    Socket.io
                                                                          │
        Cliente acompanha status ◀── loja aceita/recusa/avança status ◀──┘
```

O backend expõe REST + WebSocket (Socket.io): assim que a loja aceita, recusa ou avança
um pedido, tanto o cliente quanto o painel da loja recebem a atualização instantaneamente,
sem precisar recarregar a página ou o app.

## Stack técnica

| Camada | Tecnologia |
|---|---|
| App do cliente | React Native + Expo + TypeScript |
| Painel do estabelecimento | Next.js + TypeScript |
| API | Node.js + Express + TypeScript |
| Banco de dados | PostgreSQL + Prisma ORM |
| Tempo real | Socket.io |
| Autenticação | JWT |
| Notificações | Expo Push Notifications |

## Como rodar localmente

Pré-requisitos: Node 20+ e Docker.

```bash
# 1. Banco (na pasta raiz, onde está o docker-compose.yml)
docker compose up -d

# 2. API (muitafome-api) — copie .env.example para .env e gere o JWT_ACCESS_SECRET
npm install && npx prisma migrate deploy && npm run dev      # http://localhost:3333

# 3. Painel (muitafome-web-enterprise)
npm install && npm run dev                                   # http://localhost:3000

# 4. Cliente web (muitafome-web-client) — alternativa ao app, sem loja de apps
npm install && npm run dev                                   # http://localhost:3001

# 5. App (muitafome-mobile-client)
npm install && npm start                                     # Expo Go, emulador ou web

# 6. Site público (public-muitafome): HTML estático, abra index.html ou sirva a pasta (testes: npm install && npm run test:e2e)
#    index.html (escolha) → para-estabelecimentos.html (contratação) | para-clientes.html (app)
```

## Fluxo de trabalho (branches)

Todos os repositórios seguem o mesmo fluxo:

```
feature/minha-mudanca ──PR──▶ dev (homologação) ──PR──▶ main (produção)
                               CI roda tudo           CI roda de novo
```

- **`dev`:** branch padrão. Toda mudança entra aqui por PR, e o CI roda os testes a cada push e PR.
- **`main`:** o que está em produção. Só recebe PR vindo da `dev`, depois de o CI passar.
- **Versões da API:** cada merge na `main` da API (CI verde) vira uma versão (`feat:` → 1.3.0, `fix:` → 1.2.1) com imagem em `ghcr.io/etafome/muitafome-api`. Os frontends não dependem das branches da API: o E2E de cada um sobe a imagem da versão do arquivo `api-version`. Para um front usar algo novo, a API sai primeiro e o front sobe o `api-version`.
- **Compatibilidade da API:** mudanças aditivas e com valor padrão, para front antigo continuar funcionando; remover ou renomear campo leva duas versões (marca como obsoleto, depois remove).
- **Proteção da `main`:** ligada neste repositório, que é público. Nos privados, a regra é de processo: o plano gratuito do GitHub não protege branch de repositório privado; com o plano Team dá para travar.

## Testes

| Repositório | Unitários (`npm test` / `npm run test:unit`) | E2E (`npm run test:e2e`) |
|---|---|---|
| API | 48 (regras de negócio e segurança, sem banco) + 77 de integração com Postgres real | — |
| Painel | 15 (máscaras, erros, horário, status) | 15 cenários: pedido ao vivo, cardápio completo, cupons, configurações, senha, equipe, horário, administração, retirada paga na hora, segurança, LGPD |
| Cliente web | 11 (carrinho, cupom, navegação, máscaras) | 13 cenários, no celular e no desktop, incluindo pagamento na entrega, retirada e 12 páginas sem rolagem lateral em 360 px |
| App | 8 (carrinho, cupom, erros) | 8 cenários no build web do app, incluindo pagamento na entrega e retirada |
| Site público | — | 7 cenários, no celular e no desktop: caminhos da página inicial, links quebrados, responsividade, páginas legais |

Cada repositório tem no README a tabela "arquivo → o que cobre". O CI de todos roda em PR e em push na `dev` e na `main`.

## LGPD

- Consentimento registrado no cadastro (data + versão dos termos).
- Titular vê, corrige, exporta (JSON) e exclui os próprios dados pelo app e pelo painel.
- Exclusão anonimiza a pessoa e mantém os pedidos só pelo prazo fiscal.
- Sessões revogadas ao trocar a senha ou excluir a conta.
- Rotas públicas não expõem CPF/CNPJ, PIX nem dados de clientes; avaliações mostram só o primeiro nome.
- [Política de Privacidade](privacidade.html) e [Termos de Uso](termos.html).

## Operação

- **Administração:** `npm run make-admin -- email@exemplo.com` (na API) promove uma conta existente; ao entrar no painel ela vai para `/admin` (métricas, suspender lojas, moderar avaliações).
- **Equipe:** o dono adiciona funcionários em *Equipe*; eles atendem pedidos sem acesso a cardápio, cupons, dados fiscais e equipe.
- **Horário e área de entrega:** em *Configurações*. Endereços são geocodificados pelo OpenStreetMap (Nominatim); a lista do app esconde lojas que não entregam no endereço do cliente.
- **Manutenção automática:** pedido não pago em 30 min é cancelado e devolve o uso do cupom.
- **Deploy num servidor:** `muitafome-api/deploy/docker-compose.prod.yml` sobe Postgres, Redis, API, painel e site com HTTPS automático (Caddy) e backup diário do banco (14 dias). Imagens Docker da API e do painel nos próprios repositórios.
- **Logs:** em produção, uma linha JSON por requisição com `X-Request-Id`; `/health` confere o banco.
- **Publicar o app:** `eas.json` já tem os perfis `development`, `preview` (APK interno) e `production`. Rode `eas build -p android --profile production` e `eas submit`.

### Antes de lançar

- [ ] Definir o preço da assinatura em `para-estabelecimentos.html` (hoje `R$ [VALOR]`).
- [ ] Preencher os campos `[ENTRE COLCHETES]` de `privacidade.html` e `termos.html` (razão social, CNPJ, encarregado, gateway, nuvem) e pedir revisão jurídica.
- [ ] Integrar o gateway de pagamento (checkout, assinatura, estorno) e trocar o segredo do webhook pela verificação de assinatura do provedor.
- [ ] Contratar o servidor/nuvem, apontar o DNS e preencher `deploy/.env.prod`.
- [ ] Contas Apple Developer e Google Play, `eas init` (projectId) e credenciais de push (APNs/FCM); trocar as URLs de `eas.json` pelos domínios reais.
- [ ] Opcional: Sentry (ou similar) para alertas de erro; storage S3/R2 quando o volume de imagens pesar no banco.

## Documentação

Veja [`ARCHITECTURE.md`](ARCHITECTURE.md) para uma visão geral da arquitetura.

## Roadmap

Próximos passos planejados:

- Integração com gateway de pagamento

## Licença

Distribuído sob a licença MIT. Veja em [`LICENSE`](LICENSE) para mais detalhes.
