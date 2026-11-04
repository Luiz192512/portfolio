# 08 Release: revisão final (Opus)

Data: 2026-10-22. Revisão somente leitura. Nada foi commitado, enviado ou publicado. Único arquivo escrito: este.

## Veredito

**READY WITH CAVEATS**

O código está pronto para um primeiro deploy na Vercel: build, lint, typecheck, testes e `npm audit` passam, a superfície de segurança das APIs está correta e não há rastro do dono do site de referência nem telefone publicado. As ressalvas são de configuração (variáveis obrigatórias, banco) e de performance mobile, além de alguns itens de QA ainda abertos.

## Verificações executadas (saída real)

| Comando | Resultado |
|---|---|
| `npm run lint` | 0 erros, 1 warning: `e2e/a11y.spec.ts:33` `'slug' is assigned a value but never used` |
| `npm run typecheck` | passou, sem saída |
| `npm test` | 13 arquivos, 97 testes passaram (Vitest 5.0.5, Node 25.8.2). Aviso do Vite sobre `vitest.config.ts` em ESM carregado como CommonJS |
| `npm run build` | EXIT 0. Next 16.4.2 (Turbopack). `/` estático, `/portfolio/[slug]` SSG com 5 páginas, `/api/contact` e `/api/comments` dinâmicos, `robots.txt`, `sitemap.xml`, `opengraph-image`, `icon.svg` |
| `npm audit --omit=dev` | `found 0 vulnerabilities` |

## 1. Proveniência e privacidade

- Busca em todo o projeto (sem `node_modules`, `.next`, `.git`) por `rifqi`, `Rifqi`, `Aliya`, `rifqi.dev`, `portofolio-rho-sand`: só aparece em `prompts/portfolio-motion-threejs-pipeline.v3.md` (linhas 13 e 33), que é o prompt do pipeline documentando a origem e a proibição de copiar. Nenhuma ocorrência em `src/`, `content/`, `public/`, README ou CHANGELOG. PASS.
- Telefone e WhatsApp (`(44)`, `98817`, `wa.me`, `tel:`): só em testes que verificam a recusa (`reader.test.ts`, `jsonld.test.ts`, `contact.test.ts`), na regra `isNotPhoneLink` e em docs. O `(44)` do DESIGN.md é um tamanho em px. PASS.
- Segredos: nenhum `sk_`, `re_` real, `npg_`, `postgres://` com credencial ou API key. Únicos valores: `postgres://placeholder` em `route.test.ts:65` e `'test-placeholder'` em `resend.test.ts:15`. `.env.example` só tem chaves vazias. `ls` confirma que não existe nenhum `.env*` além de `.env.example`. `drizzle/roles.sql` usa o placeholder `<set-a-strong-password-here>`. PASS.
- Metadados de imagem (sharp): `photo-480.webp`, `card-photo-512.webp` e as 5 capas em `public/projects/*/cover.webp` sem EXIF, XMP, IPTC ou ICC. `assets/photo.jpg` também sem EXIF/XMP. PASS.
- CV `public/cv/luiz-gustavo-enz-cv.pdf` (idêntico a `assets/cv/CV_Luiz_Gustavo_PT_publico.pdf`): `pdftotext` sem telefone, sem endereço de rua, sem CEP. Contém cidade (Maringá, PR), e-mail pessoal, LinkedIn, GitHub e site. As únicas menções a WhatsApp descrevem um recurso do projeto MSX. Metadados do PDF: só título e datas, sem autor ou software. PASS (o e-mail no CV é escolha do dono; ver P2).
- `scripts/prepare-images.mjs` linhas 18 a 22 têm caminhos absolutos da máquina (`C:/Users/forti/...`, incluindo pastas `clientes/arthur` e `clientes/G7-padle`). Aceitável em repositório privado; remover antes de tornar público.

### Git

- Branch `main`, HEAD `af778d9`. O remoto `origin` é `https://github.com/Luiz192512/portfolio.git` (privado) e o `main` remoto aponta para o mesmo `af778d9`. Todo o trabalho das fases 2 a 8 está não commitado.
- Já ignorados pelo `.gitignore`: `node_modules/`, `.next/`, `.env*` (exceto `.env.example`), `*.tsbuildinfo` (cobre `tsconfig.tsbuildinfo`), `playwright-report/`, `test-results/`, `coverage/`, `.vercel/`.
- Não ignorados e que pedem decisão antes do primeiro commit:
  - `assets/` (foto original e CV original). Sem metadados e o CV é igual ao publicado, então o risco é baixo; recomendo ignorar `assets/` ou commitar conscientemente.
  - `next-env.d.ts`: o padrão do Next é ignorá-lo (é regenerado).
  - `AGENTS.md`: o próprio arquivo diz que o `next dev` o recria; commitar mantém a árvore limpa. Contém travessões no texto gerado pelo Next (não é texto nosso).
- Seguros para commit: `src/`, `content/`, `public/`, `drizzle/`, `e2e/`, `scripts/`, configs, `package-lock.json`, `README.md`, `CHANGELOG.md`, `.env.example`, `docs/pipeline/*`, `prompts/`.

## 2. Revisão de segurança

| Área | Achado | Status |
|---|---|---|
| SQL injection | Todo acesso usa Drizzle query builder ou template `sql` parametrizado (`rate-limit.ts:60`). O único SQL "montado" é o texto do e-mail de moderação com o `id` UUID gerado pelo banco (`resend.ts:47`), nunca executado pelo app. | PASS |
| XSS | Comentários são texto puro sanitizado (`sanitize.ts`: controles, bidi, zero-width) e renderizados como nó de texto React. Único `dangerouslySetInnerHTML` é o JSON-LD, que escapa `<`, `>` e `&` (`jsonld.tsx:41`). E-mails são só `text`, sem HTML; assunto passa por `sanitizeHeaderText` (sem CR/LF). | PASS |
| CSRF / origem | `isAllowedOrigin` exige header `Origin` igual a `NEXT_PUBLIC_SITE_URL`, `VERCEL_URL` ou `VERCEL_BRANCH_URL`; exige `application/json` (bloqueia form POST cross-site simples). | PASS, ver P0-1 e P2-1 |
| Tamanho | Limite por `content-length` e pelo tamanho real do corpo (8 KB contato, 4 KB comentários). | PASS |
| Rate limit | Contato: 3/10 min e 10/24 h por IP, fail open, memória se não houver DB. Comentários: 3/10 min, 10/24 h por IP e 50/24 h global, fail closed. IP nunca armazenado, só `sha256(salt:ip)`. | PASS, ver P1-1 |
| Pré-moderação | INSERT sempre `pending`; GET filtra `status = 'approved'`, limite 50. O role do app não tem UPDATE/DELETE em `comments`. CHECK impede `pinned` sem `approved`. | PASS |
| Vazamento de erro | Respostas só com códigos (`bad_request`, `rate_limited`, `send_failed`...). Logs só com códigos e `error.name`, nunca corpo, e-mail, IP ou env. | PASS |
| Segredos no cliente | `env.ts`, `db/client.ts`, `email/resend.ts` importam `server-only`. Só `NEXT_PUBLIC_SITE_URL` é pública. | PASS |
| `roles.sql` | `portfolio_app`: USAGE no schema e no tipo, SELECT/INSERT em `comments`, CRUD em `rate_limits`. Menor privilégio correto. Migração roda com o role dono só localmente. | PASS |
| Headers | CSP idêntica à seção 8.2 da arquitetura: tudo `'self'`, `'wasm-unsafe-eval'` para o Rapier, `'unsafe-eval'` só em dev, `img-src data: blob:`, `worker-src blob:`, `object-src 'none'`, `frame-ancestors 'none'`. Nenhum CDN externo é usado (o drei nem é importado, então não há carga de gstatic/githack). HSTS 2 anos, nosniff, DENY, Referrer-Policy, Permissions-Policy, COOP. `poweredByHeader: false`. | PASS, `'unsafe-inline'` documentado (P2-4) |
| Dependências | `npm audit --omit=dev`: 0 vulnerabilidades. | PASS |

## 3. Correção contra arquitetura e DESIGN

- Entrada animada: `data-entry` em `layout.tsx`, `EntryItem.tsx`, `Reveal.tsx`, `HeroSection.tsx`, `ChipList.tsx`. Implementada.
- Abas: `Tabs.tsx`, `PortfolioSection.tsx`, `CertificateGrid.tsx` (estado vazio, `content/certificates/` só com `.gitkeep`). Implementadas.
- Rota de detalhe: `/portfolio/[slug]` com `generateStaticParams`, 5 slugs no build.
- SEO: metadata, OG image 1200x630, sitemap, robots condicionado a `VERCEL_ENV`, JSON-LD `Person` sem telefone. Faltam `og:type = article` no detalhe e `email`/`address`/`worksFor` no JSON-LD (ver P1-3, P2-6).
- Itens da revisão 06 e QA 07 conferidos no código atual:
  - Corrigidos: P0-1 (coluna `w-full min-w-0`), P0-3 (`flipY = false`), P0-4 (`toneMapped = false`), a11y M1 (Typewriter agora usa `sr-only` com `aria-hidden` na parte animada), a11y M2 (wrap de Tab no `MobileMenu.tsx:80`).
  - Ainda presente: P0-5 da revisão 06 (queda do crachá): `Band.tsx:36` a `49` e `315` mantêm `DROP = 6`. DESIGN.md linha 313 ainda descreve a queda, então pode ter sido decisão deliberada, mas não há evidência de que o recorte pelo topo da caixa foi verificado. Ver P1-4.

### README

Os quatro pontos levantados já estão corretos no README atual: npm e `package-lock.json` (linha 70, com nota sobre pnpm nos docs), script `npm run images` (linha 105), card de certificado sem `image`/`url` (linhas 275 e 468), `gallery` não renderizado (linhas 217 e 469). As contagens (13 arquivos, 97 testes, Node 25.8.2) batem com a execução de hoje. README e CHANGELOG sem travessão nem meia-risca. **Nenhuma correção obrigatória.** Sugestão opcional: citar no README que o lint tem 1 warning conhecido em `e2e/a11y.spec.ts:33`.

## Lista de correções

### P0 (antes do deploy, configuração, sem código)

- **P0-1** Definir `NEXT_PUBLIC_SITE_URL` em Production **antes** do build. Sem ela, canonical, sitemap, OG e JSON-LD apontam para `http://localhost:3000` (QA 07 perf/SEO, major 1) e o `/api/contact` só aceita a URL única do deployment (`VERCEL_URL`), devolvendo 403 em quem acessa pelo alias de produção. Arquivos: `src/lib/site.ts`, `src/lib/security/request.ts`.

### P1 (corrigir logo após o primeiro deploy)

- **P1-1** Definir `DATABASE_URL` e `RATE_LIMIT_SALT` mesmo com comentários desligados. Sem DB, o contato usa limitador em memória por instância serverless (fácil de contornar, risco de abuso da cota do Resend) e um sal fixo do código (`api/contact/route.ts:58`).
- **P1-2** LCP mobile Lighthouse simulado 3,36 s (alvo 2,5 s), LCP é o parágrafo com `data-entry="paragraph"`. Não animar a opacidade do elemento de LCP. Arquivos: `src/components/sections/hero/HeroSection.tsx`, `src/components/motion/EntryItem.tsx`.
- **P1-3** `og:type` `article` no detalhe: `src/app/portfolio/[slug]/page.tsx:23` (`openGraph: { type: 'article', ... }`).
- **P1-4** Confirmar visualmente a queda do crachá (revisão 06 P0-5) ou aplicar a correção proposta: `src/components/three/Band.tsx:36` a `49`, `315`.
- **P1-5** TBT/INP mobile com CPU 4x acima do limite (revisão 06: TBT 1256 ms, INP 448 ms; README: TBT após toque 1340 ms). Itens P1-1 a P1-7 da revisão 06 (carregar 3D por toque no mobile, pausar quando em repouso, tirar o probe WebGL da hidratação, zod fora do cliente) continuam válidos. Arquivos: `src/components/three/LanyardSlot.tsx`, `LanyardScene.tsx`, `use-lanyard-eligibility.ts`, `ContactForm.tsx`, `CommentForm.tsx`.

### P2 (opcional)

- **P2-1** Lista de origens: incluir `VERCEL_PROJECT_PRODUCTION_URL` (como já faz `site.ts`) e alinhar o fallback de localhost com `siteUrl()`. Se houver `www` e apex, redirecionar um para o outro (só uma origem é aceita). `src/lib/security/request.ts:14`.
- **P2-2** `getClientIp` usa o primeiro item de `x-forwarded-for`. Na Vercel isso é confiável (a plataforma sobrescreve o header), mas preferir `x-real-ip` ou `x-vercel-forwarded-for` deixa o código independente de plataforma. `src/lib/security/rate-limit.ts:45`.
- **P2-3** Remover `@react-three/drei` (não é importado em `src/`) e o `optimizePackageImports` correspondente em `next.config.ts`.
- **P2-4** CSP com `'unsafe-inline'` em `script-src`: aceito pela arquitetura 8.2 (sem nonces para manter páginas estáticas). Reavaliar se algum script de terceiro for adicionado.
- **P2-5** `.gitignore`: adicionar `next-env.d.ts` e decidir sobre `assets/`.
- **P2-6** JSON-LD sem `email`, `address`, `worksFor` (arquitetura 8.3). Mais privado do jeito atual; confirmar a intenção e ajustar a arquitetura ou o código.
- **P2-7** Limpar caminhos absolutos de `scripts/prepare-images.mjs` antes de tornar o repositório público. O mesmo vale para `prompts/` (cita o site de referência), se a intenção for não expor a origem.
- **P2-8** Warning de lint `e2e/a11y.spec.ts:33`; aviso do Vite (renomear `vitest.config.ts` para `.mts` ou ajustar).
- **P2-9** Minors abertos do QA 07: nome acessível duplicado na aba Stack, dois botões "Fechar menu" com o menu aberto, mensagem de mínimo exibida com campo vazio, contrastes marcados para revisão manual.

## Checklist de deploy na Vercel (nada disso foi executado)

O usuário faz à mão:

1. **Commit e push** (o agente não faz): revisar o P2-5, commitar no `main` ou numa branch e enviar para `github.com/Luiz192512/portfolio` (privado, já é o `origin`). Não há push feito por esta fase.
2. **Neon** (região `aws-sa-east-1`):
   1. Criar o projeto e copiar a connection string do role dono.
   2. Localmente, só na sessão: `$env:DATABASE_MIGRATION_URL = "<owner>"` e `npm run db:migrate`.
   3. No SQL Editor, rodar `drizzle/roles.sql` uma vez, trocando o placeholder por uma senha gerada no console (nunca no arquivo).
   4. Montar a connection string do `portfolio_app` com host de pooling.
3. **Resend**: verificar o domínio de envio (SPF/DKIM), criar uma API key com permissão só de envio.
4. **Vercel, projeto**: importar o repositório; região `gru1` já vem do `vercel.json`; build `npm run build`.
5. **Vercel, variáveis em Production** (Settings, Environment Variables):
   - `NEXT_PUBLIC_SITE_URL` = `https://<domínio final>` (obrigatória, P0-1).
   - `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` (formato `Nome <endereco@dominio-verificado>`).
   - `DATABASE_URL` (role `portfolio_app`) e `RATE_LIMIT_SALT` (32 bytes base64url, gerar com `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`).
   - `COMMENTS_ENABLED=true` só depois da migração e do `roles.sql`. Em Preview, deixar vazio.
   - **Nunca** definir `DATABASE_MIGRATION_URL` na Vercel. `COMMENTS_IMAGES_ENABLED` e `BLOB_READ_WRITE_TOKEN` não são lidos.
6. **Domínio**: adicionar o domínio na Vercel, configurar DNS, escolher apex ou `www` com redirecionamento do outro, e só então fazer o build final (as duas variáveis `NEXT_PUBLIC_SITE_URL` e `COMMENTS_ENABLED` são fixadas no build; mudar exige redeploy).
7. **Conferir em produção**: `/robots.txt` com `Allow` e `Sitemap`; `/sitemap.xml` com o domínio real; canonical e `og:image` com o domínio real; headers (CSP, HSTS) via DevTools; envio real no formulário de contato (200, e-mail recebido, `Reply-To` correto); `/api/comments` 200 com comentários ligados; enviar um comentário, aprovar via SQL do e-mail e ver aparecer em cerca de 1 minuto.
8. **Depois**: Search Console com o sitemap; Lighthouse em aparelho real.

## Riscos residuais (honestos)

- LCP mobile simulado no Lighthouse 3,3 s, acima de 2,5 s (P1-2).
- Custo de hidratação e 3D no mobile: TBT e INP acima do orçamento com CPU 4x; first-load JS da home cerca de 241 KB gzip contra o orçamento original de 180 KB (re-baseado na revisão 06). Medições feitas com SwiftShader em máquina compartilhada, com alta variância; o resultado em GPU real pode ser melhor ou pior.
- Sem teste com leitor de tela real (NVDA, VoiceOver, TalkBack); só axe e verificação manual de foco.
- Sem teste em aparelho físico (iOS Safari, Android Chrome médio); arrasto do crachá e fallback estático não validados em toque real.
- Contato não testado ponta a ponta com Resend real; comentários não testados contra Neon real (só mocks em Vitest).
- Limitador do contato é fail open por design: se o banco cair, o contato aceita envios sem limite persistente.
- Moderação é manual via SQL; sem painel e sem alerta além do e-mail.
- `'unsafe-inline'` na CSP.
