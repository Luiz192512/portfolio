# Fase 7: QA de performance, SEO e links

Data: 2026-10-22. Escopo: `/` e `/portfolio/tszr15` servidos por `next start -p 3122` a partir do build existente em `.next` (BUILD_ID `C47i97PNb3BqqA5kDLW7l`, gerado 11:36). Nenhum build novo, nenhum `npm install`, nenhuma alteração de código. Referência de expectativas: `docs/pipeline/02-architecture.md`, seção 8.3.

Classificação: blocker (impede publicação), major (corrigir antes de publicar), minor (melhoria).

## Ambiente

- Lighthouse 12.8.2 via `npx` (cache do npx, sem instalação no projeto), Chrome 154.0.8037.57 do cache do Puppeteer (`CHROME_PATH`).
- Mobile com throttling padrão do Lighthouse, desktop com `--preset=desktop`. 3 execuções por página e preset.
- Uma execução desktop de `/portfolio/tszr15` falhou com `NO_NAVSTART` (erro de trace do Chrome) e foi refeita. Os 3 valores usados são de execuções válidas.
- Porta 3122: servidor de produção iniciado para esta fase e parado ao final. Sem LISTENING na porta, somente TIME_WAIT. A porta 3123 é de outro processo (PID 46636), não foi tocada.

## Lighthouse (medianas de 3 execuções)

| Página / preset | Perf | Acess. | Boas práticas | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| `/` mobile | 91 (83, 91, 92) | 97 | 100 | 69 | 3,36 s (3,31 a 3,38) | 0,00012 | 122 ms (78 a 370) |
| `/portfolio/tszr15` mobile | 95 (95, 95, 95) | 100 | 100 | 69 | 2,81 s (2,78 a 2,90) | 0 | 70 ms (68 a 88) |
| `/` desktop | 100 (100, 100, 100) | 97 | 100 | 69 | 698 ms (665 a 699) | 0,00002 | 0 ms (0 a 2) |
| `/portfolio/tszr15` desktop | 100 (100, 100, 100) | 100 | 100 | 69 | 550 ms (528 a 589) | 0 | 0 ms |

Spread: o host é ruidoso. Perf mobile da home varia 9 pontos e o LCP mobile varia cerca de 0,1 s entre execuções. Os valores de TBT mobile da home variam de 78 a 370 ms, então a mediana é indicativa.

Causas do SEO 69 (igual em todas as páginas): a auditoria `is-crawlable` falha porque `robots.txt` responde `Disallow: /`. Isso é o comportamento esperado fora de `VERCEL_ENV=production` (ver PASS de robots). Em produção o SEO deve subir para perto de 100. Não é defeito da página, mas a nota local não deve ser usada como medida de SEO.

Causa da acessibilidade 97 na home: `<p aria-label="Full Stack Júnior">` (aria-prohibited-attr). Ver minor 3.

Causa do LCP mobile da home: o elemento de LCP é um parágrafo com animação de entrada (`data-entry="paragraph"`), o que atrasa a renderização. Ver major 1.

## Verificações HTTP

- `title`: home `Luiz Gustavo Enz | Desenvolvedor Full Stack`; detalhe `TSZR15 Store | Luiz Gustavo Enz`. PASS.
- `meta description`: presente nas duas páginas, em pt-BR, sem truncamento visível. PASS.
- `canonical`: presente, mas aponta para `http://localhost:3000` (ver major 1). FAIL no build local.
- Open Graph: `og:title`, `og:description`, `og:image` (1200x630), `og:locale pt_BR`, `og:type website` na home. PASS na home.
- Open Graph do detalhe: `og:type` ausente (a seção 8.3 pede `article`). Ver minor 2.
- Twitter: `twitter:card summary_large_image`, título, descrição e imagem presentes nas duas páginas. PASS.
- `html lang="pt-BR"` nas duas páginas. PASS.
- `/sitemap.xml`: lista `/` e 5 páginas de projeto (`curbside`, `enz-softwares`, `tszr15`, `msx-baterias`, `g7-padel-crm`). PASS na estrutura. Os `<loc>` usam `localhost:3000` (major 1).
- `/robots.txt`: `User-agent: *` e `Disallow: /`, sem linha de sitemap. PASS como comportamento de não produção. Confirmar em produção que retorna `Allow` e o sitemap.
- `/opengraph-image`: HTTP 200, `image/png`, 50 189 bytes, 1200 x 630. PASS.
- JSON-LD `Person` (somente na home): um único bloco `application/ld+json`, JSON válido, com `@context`, `@type`, `name`, `alternateName`, `jobTitle`, `url`, `image`, `knowsAbout`, `sameAs` (LinkedIn e GitHub). Sem telefone (nenhum número, `tel:` ou `wa.me`) e sem e-mail. PASS para a regra de não expor telefone. Os campos `email`, `address` e `worksFor` pedidos na seção 8.3 não estão presentes (minor 4).
- Cabeçalhos (home e detalhe): `Content-Security-Policy` com `default-src 'self'`, `frame-ancestors 'none'`, `object-src 'none'`. `X-Content-Type-Options: nosniff`. `Referrer-Policy: strict-origin-when-cross-origin`. `X-Frame-Options: DENY`. `Strict-Transport-Security` com 2 anos. Sem `X-Powered-By`. PASS.
- Observação de CSP (minor 5): `script-src` e `style-src` usam `'unsafe-inline'`.
- Assets referenciados no HTML (`/cv/...pdf`, `/icon.svg`, páginas de projeto, âncoras): todos HTTP 200. PASS.

## Links externos (`content/*.json`)

Fixtures (`content/__fixtures__/`) foram excluídas: contêm `example.com`, `alpha.example.com`, `github.com/teste` e similares, que não são publicados.

| URL | Arquivo | Status final | Observação |
|---|---|---|---|
| https://linkedin.com/in/luiz-gustavo-lorencone-enz | profile.json | 200 | PASS |
| https://github.com/Luiz192512 | profile.json | 200 | PASS |
| https://instagram.com/enz.softwares | profile.json | 200 (redireciona para www) | PASS |
| https://enzsoftwares.com | profile.json, projects/enz-softwares.json | 200 (redireciona para barra final) | PASS |
| https://g7-padel-crm.vercel.app | projects/g7-padel-crm.json | 200 | PASS |
| https://bateriasmsx.com.br | projects/msx-baterias.json | 200 (HEAD e GET) | PASS. Status do MSX: `https://bateriasmsx.com.br` responde 200 OK, text/html |
| https://github.com/Luiz192512/TSZR15 | projects/tszr15.json | 200 | PASS, repositório público (404 seria privado) |

Nenhum 404 e nenhum repositório privado entre os links publicados.

## CV e imagens

- `public/cv/luiz-gustavo-enz-cv.pdf`: PDF 1.4, 1 página, 141 642 bytes. Abre sem erro com `pdftotext`. PASS.
- Telefone no CV: nenhum número de telefone encontrado. As menções a "WhatsApp" são descrições de projeto. Contato no CV é só e-mail, LinkedIn, GitHub e site. PASS.
- Imagens referenciadas no conteúdo publicado, todas existentes:
  - `/images/photo-480.webp`: 9 490 bytes. PASS.
  - `/lanyard/card-photo-512.webp`: 10 178 bytes. PASS.
  - `/projects/curbside/cover.webp`: 7 260 bytes. PASS.
  - `/projects/enz-softwares/cover.webp`: 13 706 bytes. PASS.
  - `/projects/g7-padel-crm/cover.webp`: 19 144 bytes. PASS.
  - `/projects/msx-baterias/cover.webp`: 24 426 bytes. PASS.
  - `/projects/tszr15/cover.webp`: 40 846 bytes. PASS.
- Referências `/images/foto.webp`, `/cv/teste.pdf` e `/projects/alpha|beta|broken` existem só em fixtures, não no conteúdo publicado.

## Issues

### Major

1. Base URL de SEO em `localhost:3000` no build. `siteUrl()` cai no default `http://localhost:3000` quando `NEXT_PUBLIC_SITE_URL` não está definida (não há `.env` local, só `.env.example`). Efeito: `canonical`, `og:image`, `twitter:image`, JSON-LD `url`/`image` e todos os `<loc>` do sitemap apontam para localhost. Evidência: `curl` em `/`, `/portfolio/tszr15` e `/sitemap.xml`. Ação: confirmar que `NEXT_PUBLIC_SITE_URL` está definida no ambiente de build de produção antes do deploy, e refazer o build após definir.
2. LCP mobile da home acima de 2,5 s. Mediana de 3,36 s (LCP em parágrafo `data-entry="paragraph"`, com animação de entrada). Perf mobile da home 91 (83 a 92). Ação sugerida na fase de performance: não atrasar o texto de LCP pela animação de entrada, ou ajustar o LCP para o elemento de hero. Também há 76 KiB de JS não usado na home mobile.

### Minor

1. Detalhe de projeto sem `og:type`. A seção 8.3 pede `article`. Evidência: `grep og:type` em `/portfolio/tszr15` retorna zero linhas.
2. JSON-LD sem `email`, `address` e `worksFor` que a seção 8.3 lista. Telefone continua fora, então a regra de privacidade passa. Confirmar se a omissão de e-mail é intencional.
3. `aria-label` em `<p>` (`Full Stack Júnior`, aria-prohibited-attr), acessibilidade 97 na home. Ação: remover o `aria-label` ou dar um role válido.
4. Diagnóstico de robots: `Disallow: /` fora de produção. Comportamento correto, mas o SEO local fica em 69. Confirmar `Allow` em produção.
5. CSP com `'unsafe-inline'` em `script-src` e `style-src`. Aceitável para Next, registrar como ponto de atenção de segurança.

## PASS

- PASS: title e meta description das duas páginas.
- PASS: html lang pt-BR nas duas páginas.
- PASS: Open Graph e Twitter na home; Twitter no detalhe.
- PASS: sitemap lista `/` e os 5 projetos (estrutura).
- PASS: robots presente (comportamento de não produção).
- PASS: opengraph-image 200, PNG 1200 x 630.
- PASS: JSON-LD Person é JSON válido e não contém telefone nem e-mail.
- PASS: cabeçalhos de segurança (CSP, nosniff, Referrer-Policy, X-Frame-Options, HSTS) e ausência de X-Powered-By.
- PASS: links externos publicados, sem 404 e sem repositório privado. MSX 200.
- PASS: CV abre e não contém telefone.
- PASS: todas as imagens de conteúdo existem; tamanhos entre 7 KB e 41 KB.
- PASS: CLS abaixo de 0,001 em todas as execuções (limite "bom" é 0,1). TBT mediano abaixo de 130 ms em todas as páginas; uma execução mobile da home chegou a 370 ms (ver tabela).
- PASS: Lighthouse Boas práticas 100 em todas as páginas e presets.
