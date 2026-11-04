# Portfólio de Luiz Gustavo Enz

Site pessoal e portfólio de **Luiz Gustavo Lorençone Enz**, desenvolvedor full stack júnior em Maringá, PR. A página inicial tem as seções Início, Sobre, Portfólio e Contato. Cada projeto tem uma página de detalhe em `/portfolio/<slug>`. O conteúdo fica em arquivos JSON validados, sem CMS.

- **Versão:** 0.1.0 (`package.json`)
- **Status:** o repositório não define URL de produção. `NEXT_PUBLIC_SITE_URL` precisa ser preenchida no deploy (veja [Deploy na Vercel](#deploy-na-vercel)).
- **Licença:** não definida. O repositório é privado (`"private": true`) e não tem arquivo `LICENSE`.

## Índice

- [Stack](#stack)
- [Entrada animada e cartão 3D](#entrada-animada-e-cartão-3d)
- [Pré-requisitos](#pré-requisitos)
- [Instalação rápida](#instalação-rápida)
- [Comandos](#comandos)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Editar o conteúdo](#editar-o-conteúdo)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Banco de dados (Neon)](#banco-de-dados-neon)
- [E-mail (Resend)](#e-mail-resend)
- [Moderação de comentários](#moderação-de-comentários)
- [Deploy na Vercel](#deploy-na-vercel)
- [Qualidade e limitações conhecidas](#qualidade-e-limitações-conhecidas)
- [Privacidade](#privacidade)
- [Solução de problemas](#solução-de-problemas)
- [Contribuição](#contribuição)
- [Documentação de design e arquitetura](#documentação-de-design-e-arquitetura)

## Stack

| Área | Tecnologia | Versão fixada |
|---|---|---|
| Framework | Next.js (App Router) | 16.4.2 |
| UI | React e React DOM | 19.3.0 |
| Estilo | Tailwind CSS | 4.3.3 |
| Animação | Motion (`motion/react`) | 14.5.0 |
| 3D | Three.js, React Three Fiber, drei, @react-three/rapier, meshline | 0.186.1, 9.8.2, 10.7.9, 2.2.0, 3.3.1 |
| Validação | Zod | 4.6.7 |
| Banco de dados | Drizzle ORM com driver HTTP do Neon | 0.45.4, @neondatabase/serverless 1.2.0 |
| E-mail | Resend | 6.34.1 |
| Linguagem | TypeScript | 5.9.3 |
| Testes | Vitest, Playwright, @axe-core/playwright | 5.0.5, 1.64.1, 4.13.0 |

As páginas `/` e `/portfolio/<slug>` são geradas em build (estáticas). Só as rotas `/api/*` rodam no servidor, no runtime Node.js.

## Entrada animada e cartão 3D

**Entrada animada.** Os textos e chips do hero entram em sequência com Motion. Com `prefers-reduced-motion` ativo, a entrada usa apenas opacidade, sem movimento.

**Cartão 3D (lanyard).** A cena usa Three.js com Rapier. O comportamento depende do dispositivo:

| Situação | Comportamento |
|---|---|
| Desktop | Carrega a cena sozinho quando o navegador fica ocioso (`requestIdleCallback` com limite de 800 ms). Sem suporte, a cena carrega após 200 ms. |
| Mobile (toque grosso ou largura menor que 768 px) | Mostra o cartão estático e um botão transparente por cima. A cena carrega só com toque, Enter ou Espaço. |

O cartão cai para a versão estática (imagem, sem 3D) quando ocorre qualquer uma destas situações:

- `prefers-reduced-motion` ativo.
- `navigator.connection.saveData` ativo, ou `prefers-reduced-data` ativo.
- `navigator.hardwareConcurrency` igual a 2 ou menos, ou `navigator.deviceMemory` igual a 2 ou menos.
- WebGL indisponível, ou apenas com renderização por software (a checagem usa `failIfMajorPerformanceCaveat`).
- Erro durante a renderização da cena (um error boundary mostra a versão estática).

O código lê o sinal `Save-Data` do navegador (`navigator.connection.saveData`), não o cabeçalho HTTP.

## Pré-requisitos

- **Node.js 22 ou 24.** O `package.json` declara `engines.node` como `>=20.9`, mas o Vitest 5.0.5 declara `^22.12`, `^24` ou `>=26`. Com Node 20 ou 25, o npm pode mostrar aviso `EBADENGINE` (veja `docs/pipeline/03-scaffold.md`). Os testes unitários passaram localmente no Node 25.8.2, mas use 22 ou 24.
- **npm**, que acompanha o Node. O lockfile é `package-lock.json`. Os documentos de pipeline citam pnpm, mas o repositório usa npm.
- **Git.**
- **Opcional:** conta no Neon (comentários) e no Resend (formulário de contato). Sem elas, o site roda, mas `/api/contact` responde 503 e a seção de comentários fica oculta.
- **Opcional, para `npm run e2e` e `npm run budgets`:** navegador do Playwright. Use `npx playwright install chromium` (comando padrão do Playwright; a sintaxe foi conferida com `npx playwright install --help`).

## Instalação rápida

```bash
# 1. Entre na pasta do repositório
cd <pasta-do-repositorio>

# 2. Instale as dependências a partir do package-lock.json
npm ci

# 3. Suba o servidor de desenvolvimento
npm run dev
```

Abra `http://localhost:3000`. Sem variáveis de ambiente, o site roda normalmente. O formulário de contato responde 503 e os comentários ficam ocultos até você configurar as variáveis.

## Comandos

Todos os comandos abaixo existem no `package.json`.

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento do Next.js (`next dev`). |
| `npm run build` | Gera o build de produção (`next build`) e valida o conteúdo. |
| `npm start` | Serve o build gerado (`next start`). Rode `npm run build` antes. |
| `npm run lint` | ESLint em todo o repositório (`eslint .`). |
| `npm run typecheck` | Checagem de tipos sem gerar arquivos (`tsc --noEmit`). |
| `npm test` | Testes unitários com Vitest (`vitest run`). |
| `npm run e2e` | Testes Playwright da pasta `e2e/` (projetos desktop 1440x900 e mobile 390x844). |
| `npm run budgets` | Roda `e2e/budgets.spec.ts` e **reescreve** `docs/pipeline/06-budgets.md`. |
| `npm run format` | Formata o repositório inteiro com Prettier (`prettier --write .`). |
| `npm run images` | Gera a foto e as capas em WebP (`node scripts/prepare-images.mjs`). Veja [Foto](#foto) e [Projetos](#projetos). |
| `npm run db:generate` | Gera SQL de migração a partir de `src/lib/db/schema.ts`. Não precisa de conexão. |
| `npm run db:migrate` | Aplica as migrações no banco com `DATABASE_MIGRATION_URL`. |

Notas sobre os testes:

- `npm run e2e` inicia `npm run build && npm run start` na porta 3000 (`playwright.config.ts`). Fora do CI, reaproveita um servidor que já esteja rodando.
- Os testes de contato precisam de `NEXT_PUBLIC_SITE_URL` com a mesma origem do teste. Sem ela, o POST do formulário recebe 403.
- Para apontar para outro servidor, defina `PLAYWRIGHT_BASE_URL`.

PowerShell (Windows):

```powershell
$env:NEXT_PUBLIC_SITE_URL = "http://localhost:3000"
npm run e2e
```

Bash:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000 npm run e2e
```

## Estrutura do projeto

```text
content/            Conteúdo do site em JSON, validado com Zod
  profile.json      Perfil, textos, foto, CV e links
  experience.json   Experiência profissional
  stack.json        Tecnologias agrupadas por categoria
  projects/         Um JSON por projeto (o nome do arquivo é o slug)
  certificates/     Um JSON por certificado (vazio nesta versão)
public/             Arquivos estáticos servidos na raiz (foto, capas, CV)
src/app/            Rotas do App Router: página inicial, detalhe, API, SEO
src/components/     Interface: seções, cartão 3D, animações, comentários
src/lib/            Leitura de conteúdo, variáveis de ambiente, banco, e-mail, segurança
  copy.ts           Textos fixos da interface em pt-BR
drizzle/            Migração SQL inicial (0000_init.sql) e roles.sql
e2e/                Testes Playwright (smoke, acessibilidade e orçamentos)
scripts/            prepare-images.mjs
assets/             Foto de origem (assets/photo.jpg)
docs/pipeline/      Design, arquitetura e relatórios de QA
```

## Editar o conteúdo

Edite os arquivos em `content/`. Cada arquivo é validado pelos schemas de `src/lib/content/schemas.ts` quando é lido. Um erro aponta o arquivo e o campo, por exemplo `content/projects/<slug>.json: order: ...`. `npm run build` valida todo o conteúdo de uma vez.

Os schemas são estritos (`.strict()`): chave desconhecida gera erro.

### Perfil (`content/profile.json`)

| Campo | Regra |
|---|---|
| `name`, `shortName` | Texto. `name` é o nome completo. `shortName` é o nome curto. |
| `nameLines` | Exatamente 3 textos, as linhas do nome no hero. |
| `role`, `roleShort` | Cargo completo e versão curta. |
| `location` | Fixo em `"Maringá, PR"`. O schema aceita só esse valor. |
| `available` | `true` ou `false`. |
| `heroIntro` | Até 320 caracteres. |
| `bio` | Até 600 caracteres. |
| `motto` | Opcional, até 120 caracteres. Hoje está ausente. A seção Sobre mostra a frase só quando o campo existe. |
| `typewriterPhrases` | De 1 a 5 frases, até 40 caracteres cada. |
| `heroChips` | De 1 a 4 itens, até 24 caracteres cada. |
| `hints` | De 0 a 3 dicas, até 60 caracteres cada. |
| `photo` | `{ "src", "alt", "fit" }`. `src` começa com `/images/`. `alt` tem de 5 a 160 caracteres. |
| `cvPath` | Caminho `/cv/<arquivo>.pdf`. Veja [CV](#cv). |
| `connect` | 1 ou mais itens. `kind` aceita `linkedin`, `github`, `instagram`, `site` ou `email`. `url` usa `https://`, e `email` usa `mailto:`. Com `personal: true`, o link entra em `sameAs` do JSON-LD (e-mail não entra). |

Para adicionar a frase de efeito, inclua `motto` logo depois de `bio`:

```json
"bio": "Texto da bio.",
"motto": "Sua frase aqui.",
```

### Experiência (`content/experience.json`)

Lista de objetos com estes campos:

```json
{
  "role": "Fundador",
  "org": "Nome da empresa",
  "start": "2025",
  "end": null,
  "short": "Nome curto"
}
```

- `start` e `end` aceitam `AAAA` ou `AAAA-MM`. Use `end: null` para o cargo atual.
- `short` tem até 24 caracteres.

### Stack (`content/stack.json`)

Objeto com `items`. Cada item tem `name` (até 40 caracteres), `monogram` (de 1 a 3 caracteres) e `category`. As categorias aceitas são `languages`, `frontend-mobile`, `backend`, `data` e `tools`. Categorias sem itens não aparecem.

```json
{ "name": "TypeScript", "monogram": "TS", "category": "languages" }
```

### Projetos

Cada projeto é um arquivo em `content/projects/<slug>.json`. O slug é o nome do arquivo sem `.json`, em letras minúsculas, números e hífen (por exemplo, `meu-projeto`).

| Campo | Regra |
|---|---|
| `title` | Até 60 caracteres. |
| `kind` | Até 32 caracteres. Rótulo de categoria, por exemplo `PRODUTO PRÓPRIO`. |
| `summary` | De 40 a 260 caracteres. |
| `metaDescription` | Opcional, até 160 caracteres. |
| `cover` | `{ "src", "alt", "fit" }`. `src` deve ser `/projects/<slug>/cover.webp`. `alt` tem de 5 a 160 caracteres. `fit` aceita `cover` (padrão) ou `contain`. |
| `gallery` | Opcional, até 8 imagens no mesmo formato de `cover`. O schema aceita, mas nenhum componente renderiza a galeria hoje. |
| `tech` | De 1 a 16 textos, até 32 caracteres cada. |
| `features` | De 1 a 10 textos, de 3 a 140 caracteres cada. |
| `link` | Um de: `{ "status": "live", "url": "https://..." }`, `{ "status": "private-tool" }` ou `{ "status": "none" }`. |
| `repoUrl` | Opcional. Precisa começar com `https://github.com/`. |
| `featured` | `true` ou `false` (padrão `false`). Projetos em destaque aparecem antes. |
| `order` | Inteiro maior ou igual a 0. Deve ser único entre os projetos. |

Exemplo (valores de substituição, não use como dados reais):

```json
{
  "title": "Nome do projeto",
  "kind": "PRODUTO PRÓPRIO",
  "summary": "Resumo do projeto com entre 40 e 260 caracteres, em português.",
  "cover": {
    "src": "/projects/nome-do-projeto/cover.webp",
    "alt": "Capa do Nome do projeto",
    "fit": "cover"
  },
  "tech": ["Next.js", "TypeScript"],
  "features": ["Primeiro recurso", "Segundo recurso"],
  "link": { "status": "none" },
  "featured": false,
  "order": 6
}
```

Passo a passo:

1. Crie `content/projects/<slug>.json` com os campos acima.
2. Coloque a capa em `public/projects/<slug>/cover.webp`.
3. Use um `order` que ainda não exista. Hoje os valores usados são 1 a 5.
4. Rode `npm run dev` e confira `/#portfolio` e `/portfolio/<slug>`.
5. Para incluir o projeto nos testes, adicione-o às listas fixas `PROJECTS` em `e2e/helpers/smoke.ts` e `ROUTES` em `e2e/helpers/probes.ts`. Essas listas não são lidas do conteúdo.

Sobre gerar a capa: `scripts/prepare-images.mjs` redimensiona para largura máxima de 1600 px, converte para WebP com qualidade 80 e remove metadados. O script, porém, conhece só as cinco capas atuais, com caminhos de origem absolutos da máquina do autor. Para um projeto novo, adicione uma entrada em `COVERS` (com `slug` e `src`) ou gere o WebP manualmente com as mesmas medidas.

### Certificados

Cada certificado é um arquivo em `content/certificates/<slug>.json`. O slug vem do nome do arquivo, com as mesmas regras dos projetos.

| Campo | Regra |
|---|---|
| `title` | Até 80 caracteres. |
| `issuer` | Até 60 caracteres. |
| `date` | Formato `AAAA-MM`. |
| `image` | Opcional, `{ "src", "alt", "fit" }`, com as mesmas regras de `cover`. |
| `url` | Opcional, precisa usar `https://`. |

```json
{
  "title": "Nome do curso",
  "issuer": "Nome da instituição",
  "date": "2025-06"
}
```

Os certificados aparecem na aba Certificados, ordenados por data (mais recente primeiro), e entram na contagem da seção Sobre. Hoje o diretório só tem `.gitkeep`, então a aba mostra o estado vazio. O card mostra emissor, título e data. Os campos `image` e `url` são validados, mas o card atual não os exibe.

### Foto

1. Substitua `assets/photo.jpg` por uma foto **quadrada**. O script recusa imagem que não seja quadrada.
2. Rode `npm run images`. O script gera:
   - `public/images/photo-480.webp`, usado por `profile.photo.src` na seção Sobre e no JSON-LD.
   - `public/lanyard/card-photo-512.webp`, usado pelo cartão 3D. Esse caminho é fixo no código, não vem do `profile.json`.
3. Se o texto alternativo mudar, atualize `profile.photo.alt` (de 5 a 160 caracteres). O alt do cartão 3D fica em `src/lib/copy.ts` (`copy.hero.photoAlt`).

Fora da máquina do autor, o script termina com `Missing source file` ao chegar nas capas. A foto já foi gravada nesse ponto, porque é processada antes.

### CV

1. Confirme manualmente que o PDF não tem telefone nem endereço. O schema não verifica o conteúdo do PDF. O CV atual foi conferido com `pdftotext`: sem telefone, com e-mail, LinkedIn, GitHub, site e a cidade (Maringá, PR).
2. Copie o arquivo para `public/cv/`. O nome deve usar só letras minúsculas, números, ponto, hífen, sublinhado e barra (regra `^/[a-z0-9/_.-]+$`).
3. Atualize `profile.cvPath` com o novo caminho, por exemplo `"/cv/seu-cv.pdf"`. O valor precisa terminar em `.pdf`.

O botão de download na seção Sobre usa `cvPath`.

## Variáveis de ambiente

Crie um `.env.local` na raiz para desenvolvimento local. O `.gitignore` ignora `.env*`, exceto `.env.example`. Copie o modelo com `Copy-Item .env.example .env.local` (PowerShell) ou `cp .env.example .env.local` (Bash), e preencha os valores. **Nunca faça commit de valores reais.**

| Variável | Obrigatória | Onde é lida | Função |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Sim em produção | Build e servidor | Origem canônica do site: canonical, sitemap, metadados e JSON-LD. Também está na lista de origens aceitas por `/api/contact` e `/api/comments`. Use o formato `https://seu-dominio`. Como o nome começa com `NEXT_PUBLIC_`, a variável fica fixada no build: mude e faça novo deploy. |
| `RESEND_API_KEY` | Para o contato | Servidor (segredo) | Chave do Resend com permissão só de envio. Se `RESEND_API_KEY`, `CONTACT_TO_EMAIL` ou `CONTACT_FROM_EMAIL` estiver vazia, `/api/contact` responde 503 com `not_configured`. |
| `CONTACT_TO_EMAIL` | Para o contato | Servidor | Endereço que recebe as mensagens do formulário e os avisos de moderação. |
| `CONTACT_FROM_EMAIL` | Para o contato | Servidor | Remetente no formato `Nome <endereco@dominio>`. Veja [E-mail (Resend)](#e-mail-resend). |
| `DATABASE_URL` | Para comentários | Servidor (segredo) | Connection string do role `portfolio_app`, com host de pooling. Sem ela, `/api/comments` responde 404 e o contato usa limite de envios em memória, por instância. |
| `DATABASE_MIGRATION_URL` | Só para migrações | Local | Connection string do role dono, lida por `drizzle.config.ts`. **Nunca defina na Vercel.** |
| `RATE_LIMIT_SALT` | Para comentários | Servidor (segredo) | Sal do hash de IP usado pelos limites. O código exige pelo menos 16 caracteres. A documentação recomenda 32 bytes aleatórios em base64url. Sem ela, `POST /api/comments` responde 503. O contato, sem o sal, usa um sal fixo do código, o que enfraquece o hash. Defina sempre. |
| `COMMENTS_ENABLED` | Não (padrão desligado) | Servidor e build | Só o valor `true` mostra o painel de comentários e habilita `/api/comments`. Qualquer outro valor deixa a seção oculta e a API responde 404. A página é gerada no build: mude o valor e faça novo deploy. |
| `COMMENTS_IMAGES_ENABLED` | Não | Reservada | Sem efeito na versão atual. |
| `BLOB_READ_WRITE_TOKEN` | Não | Reservada | Não é lida pelo código atual. Fica reservada para imagens em comentários, fora da versão 0.1.0. |

Variáveis que a própria Vercel define. Não defina manualmente:

- `VERCEL_ENV`: com valor `production`, o `robots.txt` libera a indexação e publica o sitemap. Fora disso, bloqueia tudo.
- `VERCEL_URL` e `VERCEL_BRANCH_URL`: entram na lista de origens aceitas pelo formulário.
- `VERCEL_PROJECT_PRODUCTION_URL`: origem canônica de reserva, usada quando `NEXT_PUBLIC_SITE_URL` não está definida.

Para gerar o sal (comando da documentação do projeto, em `docs/pipeline/02-architecture.md`, seção 13):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Guarde o resultado no `.env.local` e na Vercel. Não o registre em nenhum arquivo versionado.

## Banco de dados (Neon)

O Neon guarda os comentários e o limite de envios persistente. A migração inicial (`drizzle/0000_init.sql`) cria o tipo `comment_status`, as tabelas `comments` e `rate_limits` e o índice `comments_public_idx`.

1. Crie um projeto no Neon. A região planejada é `aws-sa-east-1` (`docs/pipeline/02-architecture.md`, seção 13).
2. Copie a connection string do role dono (owner). Defina-a só na sessão local, porque `drizzle.config.ts` lê `process.env.DATABASE_MIGRATION_URL` diretamente:

   ```powershell
   $env:DATABASE_MIGRATION_URL = "<connection string do role dono>"
   npm run db:migrate
   ```

   Em Bash, use `export DATABASE_MIGRATION_URL="<connection string do role dono>"` antes de `npm run db:migrate`.

3. Execute a migração **antes** do passo seguinte, porque o `roles.sql` concede acesso ao tipo e às tabelas criados pela migração.
4. Abra `drizzle/roles.sql` no SQL Editor do Neon. Troque o placeholder `<set-a-strong-password-here>` por uma senha gerada no console do Neon, não no arquivo. Execute o script **uma vez**. Não salve a senha no repositório.

   O role `portfolio_app` pode:
   - `SELECT` e `INSERT` em `comments`.
   - `SELECT`, `INSERT`, `UPDATE` e `DELETE` em `rate_limits`.

   Ele **não** pode aprovar, fixar, ocultar ou apagar comentários.

5. Monte a connection string do `portfolio_app` com o host de pooling e use como `DATABASE_URL` (local e na Vercel, somente em Production).

Para mudanças futuras no schema, altere `src/lib/db/schema.ts`, rode `npm run db:generate` e aplique com `npm run db:migrate`.

## E-mail (Resend)

O formulário de contato envia uma mensagem somente em texto, sem HTML, com o e-mail do visitante em `replyTo`. A mensagem **não** é gravada no banco.

1. Crie uma conta no Resend com o e-mail que vai receber as mensagens (o valor de `CONTACT_TO_EMAIL`).
2. Crie uma API key com permissão somente de envio.
3. Defina `RESEND_API_KEY` no `.env.local` e na Vercel.
4. Defina `CONTACT_FROM_EMAIL`:
   - **Sem domínio verificado:** use `Portfolio <onboarding@resend.dev>`, valor previsto em `docs/pipeline/02-architecture.md` (seção 8.1). Segundo o mesmo plano (seção 13), esse remetente entrega só ao e-mail dono da conta Resend.
   - **Com domínio verificado (opcional):** adicione os registros DNS que o Resend indicar no provedor do domínio, e use um remetente desse domínio.
5. Teste em `/#contato` com `npm run dev`. Envio válido responde `200` com `{ "ok": true }`. O limite é de 3 envios a cada 10 minutos por IP, então testes repetidos recebem `429`.

## Moderação de comentários

Os comentários são **pré-moderados**. Todo comentário novo é gravado com `status = 'pending'` e só aparece no site depois de aprovado. Regras da versão atual:

- Só texto puro, renderizado como texto React. Não há HTML, markdown nem links clicáveis.
- Nome: de 1 a 40 caracteres, com letras, números, espaços e os sinais `.`, `'`, `_` e `-`.
- Comentário: de 1 a 500 caracteres.
- Limites: 3 comentários a cada 10 minutos por IP, 10 a cada 24 horas por IP e 50 a cada 24 horas no total.
- Bots: campo `website` preenchido ou envio em menos de 3 segundos recebem `202` e nada é gravado.
- Não há painel administrativo. A moderação é feita por SQL no SQL Editor do Neon, com o role dono.

Quando um comentário é enviado, a API envia um aviso ao `CONTACT_TO_EMAIL`, se as variáveis do Resend estiverem completas. O aviso traz o `id` e os comandos prontos. Use-os no SQL Editor do Neon:

```sql
-- aprovar
UPDATE comments SET status = 'approved', moderated_at = now() WHERE id = '<uuid>';

-- fixar no topo (o comentário precisa estar aprovado; o banco recusa o contrário)
UPDATE comments SET pinned = true WHERE id = '<uuid>';

-- ocultar
UPDATE comments SET status = 'hidden', pinned = false, moderated_at = now() WHERE id = '<uuid>';
```

A lista pública (`GET /api/comments`) tem cache de 60 segundos. Uma aprovação aparece em cerca de 1 minuto, sem novo deploy.

## Deploy na Vercel

O `vercel.json` define a região `gru1` (São Paulo).

1. Importe o repositório Git no Vercel.
2. Em Production, defina as variáveis:
   - `NEXT_PUBLIC_SITE_URL`: a URL pública do site, no formato `https://seu-dominio`.
   - `RESEND_API_KEY`, `CONTACT_TO_EMAIL` e `CONTACT_FROM_EMAIL`.
   - `DATABASE_URL` (role `portfolio_app`) e `RATE_LIMIT_SALT`.
   - `COMMENTS_ENABLED=true`, depois que o banco e o `roles.sql` estiverem prontos.
3. **Não** defina `DATABASE_MIGRATION_URL` na Vercel.
4. Em Preview, deixe `COMMENTS_ENABLED` desligado (ou sem valor).
5. Faça o deploy. O script de build é `npm run build`.
6. Confira em produção:
   - `/robots.txt` deve ter `Allow` e a linha `Sitemap`.
   - `/sitemap.xml` deve listar a URL de produção.
   - `/api/comments` deve responder 200 com `COMMENTS_ENABLED=true` e `DATABASE_URL` definida.

Como `NEXT_PUBLIC_SITE_URL` e `COMMENTS_ENABLED` são fixados no build, qualquer mudança nelas exige novo deploy.

## Qualidade e limitações conhecidas

Os números abaixo vêm dos relatórios de `docs/pipeline/`, medidos em 2026-10-22. Não foram reexecutados para este README, exceto as verificações de código indicadas.

### Verificações do repositório

- `npm run lint`: passou.
- `npm run typecheck`: passou.
- `npm test`: 13 arquivos e 97 testes passaram (Node 25.8.2).
- Smoke E2E (`e2e/smoke.spec.ts`, relatado em `07-qa-e2e.md`): 29 passaram, 0 falharam, 3 pulados por design.

### Orçamentos de performance

Medidos com Playwright em Chromium headless, com renderização por software (SwiftShader), em máquina Windows compartilhada. A variação entre execuções é alta: o TBT do carregamento desktop foi de 54 ms a 760 ms em execuções seguidas. Os dados vêm de `docs/pipeline/06-budgets.md`.

| Métrica | Limite | Desktop | Mobile |
|---|---|---|---|
| LCP | 2.500 ms | 1.760 ms (mediana) | 1.632 ms (mediana). Com CPU 4x: 3.212 ms |
| TBT no carregamento (proxy de INP) | 200 ms | 623 ms (mediana). **Acima do limite** | 0 ms (mediana). Com CPU 4x: 562 ms. **Acima com CPU 4x** |
| TBT após o toque (até 3 s após a cena ficar pronta) | 200 ms | Não se aplica | 341 ms. Com CPU 4x: 1.340 ms. **Acima do limite** |
| Frame time com arraste do mouse (p95) | 25 ms | 33,3 ms. **Acima do limite** | 16,7 ms |
| JS inicial de `/` (gzip) | 215 KB | 207,2 KB | 207,2 KB |
| Cena 3D sem Rapier (gzip) | 350 KB | 254,8 KB | 249,3 KB |

O Rapier (WASM) tem 810,0 KB em gzip. Ele é carregado depois do evento `load` no desktop e depois do toque no mobile. Esse valor é informativo.

Na mesma medição, a linha de entrada `h1`, `hints` e `scroll` do desktop saiu do limite de 150 ms. No mobile, todas as linhas passaram.

### Lighthouse

Lighthouse 12.8.2, mediana de 3 execuções, de `docs/pipeline/07-qa-perf-seo.md`:

| Página | Perf | Acessibilidade | Boas práticas | SEO | LCP | TBT |
|---|---|---|---|---|---|---|
| `/` mobile | 91 | 97 | 100 | 69 | 3,36 s | 122 ms |
| `/portfolio/tszr15` mobile | 95 | 100 | 100 | 69 | 2,81 s | 70 ms |
| `/` desktop | 100 | 97 | 100 | 69 | 698 ms | 0 ms |
| `/portfolio/tszr15` desktop | 100 | 100 | 100 | 69 | 550 ms | 0 ms |

Pontos a considerar:

- O LCP mobile da home, simulado pelo Lighthouse (com throttling), fica em cerca de 3,3 s, acima de 2,5 s. Na medição do Playwright, sem throttling, o mesmo elemento fica em 1,6 s. As duas medições usam metodologias diferentes.
- O TBT mobile da home variou de 78 ms a 370 ms entre as execuções. A mediana é indicativa.
- O SEO em 69 foi atribuído ao `robots.txt`, que bloqueia tudo fora de produção. Confirme a pontuação em produção.
- Se `NEXT_PUBLIC_SITE_URL` não estiver definida no build, canonical, Open Graph, JSON-LD e sitemap apontam para `http://localhost:3000`.

### Acessibilidade

O relatório de 2026-10-22 (`07-qa-a11y.md`) não tinha blocker. Ele apontava dois itens major:

- **M1:** `aria-label` em um `<p>` do hero (`Typewriter.tsx`). Não encontrado no código atual, por busca.
- **M2:** foco que escapava do menu mobile. O código atual tem tratamento de Tab e Shift+Tab no `MobileMenu.tsx`.

Não reexecutei o axe. Continuam pendentes as conferências manuais de contraste: título do hero com gradiente, legenda sob o cartão no desktop, cartão sobreposto ao texto no mobile e links do menu aberto.

### Limitações da versão 0.1.0

- **Certificados:** o card mostra emissor, título e data. `image` e `url` são validados, mas não são exibidos.
- **Galeria de projetos:** o campo `gallery` existe no schema, mas nenhum componente o renderiza.
- **Frase de efeito (`motto`):** ausente no perfil atual.
- **Cartão 3D no mobile:** carrega só com toque. Isso é decisão de projeto (`docs/pipeline/02-architecture.md`, seção 14).
- **Comentários:** só texto, pré-moderados, sem painel de administração e sem imagens.
- **CSP:** `script-src` e `style-src` usam `'unsafe-inline'`. É decisão documentada, porque o Next.js sem nonces usa scripts inline (`docs/pipeline/02-architecture.md`, seção 8.2).
- **Scripts de imagem:** os caminhos de origem das capas são absolutos e específicos da máquina do autor.
- **`npm run budgets`:** sobrescreve `docs/pipeline/06-budgets.md`.
- **Playwright:** os projetos de teste usam só Chromium.
- **CI:** não há pasta `.github` no repositório, então não há workflow de CI.

## Privacidade

- **Nenhum telefone ou endereço é publicado pelo site.** O schema recusa links `tel:`, `wa.me` e qualquer URL com `whatsapp` nos campos de URL (`connect`, links de projeto e certificado). A regra não vale para texto livre: um telefone digitado em `bio` não seria bloqueado.
- **Localização:** o site mostra só a cidade (`Maringá, PR`).
- **CV:** o PDF atual, verificado com `pdftotext`, não tem telefone nem endereço.
- **IP:** o contato e os comentários guardam apenas um hash (SHA-256 com sal) do IP, nunca o IP. Os logs registram só códigos e nomes de erro, nunca o corpo da mensagem, o e-mail, o IP ou valores de ambiente.
- **Contato:** a mensagem vai por e-mail via Resend e não é gravada no banco.
- **Comentários:** ficam gravados com nome, texto, hash do IP, datas e status.

## Solução de problemas

| Sintoma | Causa (verificada no código) | Solução |
|---|---|---|
| `/api/contact` responde 403 | O cabeçalho `Origin` não está na lista de origens aceitas. | Defina `NEXT_PUBLIC_SITE_URL` com a origem exata (esquema, host e porta) e rode novo build. Em desenvolvimento, `http://localhost:3000` já é aceito. |
| `/api/contact` responde 503 `not_configured` | Falta `RESEND_API_KEY`, `CONTACT_TO_EMAIL` ou `CONTACT_FROM_EMAIL`. | Defina as três variáveis. |
| `/api/contact` responde 429 | Mais de 3 envios em 10 minutos, ou mais de 10 em 24 horas, para o mesmo IP. | Aguarde o tempo indicado em `Retry-After`. |
| `/api/comments` responde 404 | `COMMENTS_ENABLED` diferente de `true`, ou `DATABASE_URL` vazia. | Defina as duas e faça novo deploy. |
| `POST /api/comments` responde 503 | `RATE_LIMIT_SALT` ausente ou com menos de 16 caracteres. Também responde 503 `unavailable` quando o banco falha no limite de envios. | Defina o sal. Confira a conexão com o role `portfolio_app`. |
| Erro de build citando `content/...` | Algum campo está fora do schema. | Corrija o campo indicado na mensagem. |
| `npm run images` termina com `Missing source file` | As capas usam caminhos de origem que só existem na máquina do autor. | A foto já foi gerada. Para as capas, veja [Projetos](#projetos). |
| `npm run db:migrate` sem conexão | `DATABASE_MIGRATION_URL` não está definida na sessão. | Defina a variável no mesmo terminal antes do comando. |
| Aviso `EBADENGINE` no npm | Node fora de 22 ou 24. | Use Node 22 ou 24. |
| SEO e links canônicos com `localhost` | `NEXT_PUBLIC_SITE_URL` vazia no build. | Defina a variável e refaça o build. |
| `npm run e2e` falha nos testes de contato com 403 | `NEXT_PUBLIC_SITE_URL` não corresponde à origem do teste. | Defina a variável com a mesma origem (veja [Comandos](#comandos)). |

Por que o cartão 3D não carrega sozinho no celular? Por decisão de projeto. No mobile, a cena carrega ao toque (veja [Entrada animada e cartão 3D](#entrada-animada-e-cartão-3d)).

## Contribuição

Este é um repositório pessoal. Não há `CONTRIBUTING.md`, pasta de templates de issue ou PR, nem CI.

- Antes de enviar mudanças, rode `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` e `npm run e2e`.
- O histórico usa prefixos como `docs:`, `design:` e `chore:`.
- Nos textos do projeto, evite travessões. A convenção está em `docs/pipeline/02-architecture.md`.
- O arquivo `AGENTS.md` traz instruções para agentes de IA. Ele diz que a versão do Next.js deste projeto tem mudanças e pede a leitura de `node_modules/next/dist/docs/` antes de alterar código.

## Documentação de design e arquitetura

Os documentos da fase de pipeline estão em [`docs/pipeline/`](docs/pipeline/):

- [`00-brief.md`](docs/pipeline/00-brief.md): briefing.
- [`DESIGN.md`](docs/pipeline/DESIGN.md): contrato de design (tokens, copy e motion).
- [`design-direction.md`](docs/pipeline/design-direction.md): direção de design.
- [`02-architecture.md`](docs/pipeline/02-architecture.md): arquitetura, dados, segurança e orçamentos.
- [`03-scaffold.md`](docs/pipeline/03-scaffold.md): versões fixadas e notas de Node e npm.
- [`06-budgets.md`](docs/pipeline/06-budgets.md): medição dos orçamentos de performance.
- [`06-review.md`](docs/pipeline/06-review.md): revisão da fase 6.
- [`07-qa-perf-seo.md`](docs/pipeline/07-qa-perf-seo.md), [`07-qa-a11y.md`](docs/pipeline/07-qa-a11y.md) e [`07-qa-e2e.md`](docs/pipeline/07-qa-e2e.md): relatórios de QA.
