# Changelog

Todas as mudanças notáveis deste projeto ficam registradas aqui. O formato segue a ideia do Keep a Changelog, com versionamento semântico.

## [0.2.0] - 2026-11-17

### Alterado

- Conteúdo alinhado ao currículo de novembro de 2026, com foco em IA: apresentação, bio, frases do hero, chips e dicas.
- Stack reorganizada em sete grupos, com os novos `ai` (IA e LLMs) e `automation` (automação). Spring Boot e MySQL saíram, porque o currículo novo não os lista.
- Curbside atualizado com os dados do currículo (quatro países, coleta no OpenStreetMap e no Overture Maps, auditoria de segurança).
- Experiência: "Auxiliar Administrativo de Engenharia" passa a constar na Teles Hidráulica, com 02/2025 a 09/2025, como no currículo novo.
- LinkedIn com o novo endereço.
- Currículo público atualizado, sem telefone e sem data de nascimento.

### Adicionado

- Projeto "Automação de candidaturas com LLMs", com capa própria e página de detalhe em `/portfolio/automacao-candidaturas-llm`.

## [0.1.0] - 2026-10-22

### Adicionado

- Página inicial com as seções Início, Sobre, Portfólio e Contato.
- Páginas de detalhe em `/portfolio/<slug>` para os projetos curbside, enz-softwares, tszr15, msx-baterias e g7-padel-crm.
- Conteúdo em arquivos JSON na pasta `content/`, validado com Zod.
- Cartão 3D (lanyard) com Three.js, React Three Fiber e Rapier. Quando não é possível usar o 3D, o site mostra a versão estática.
- Entrada animada com Motion, com redução de movimento quando o usuário pede.
- Formulário de contato em `/api/contact`, com Resend, campo honeypot, limite de envios e checagem de origem.
- Comentários pré-moderados em `/api/comments`, desligados por padrão (`COMMENTS_ENABLED`), com Neon Postgres e Drizzle. Inclui a migração inicial e o script `drizzle/roles.sql`.
- Cabeçalhos de segurança em `next.config.ts`: Content-Security-Policy, HSTS, X-Frame-Options e outros.
- SEO: metadados, Open Graph, sitemap, robots e JSON-LD `Person` na página inicial.
- Testes: Vitest (13 arquivos, 97 testes), Playwright para smoke, acessibilidade (axe) e orçamentos de performance.
- Script `scripts/prepare-images.mjs` para gerar foto e capas em WebP.
- Currículo em PDF em `public/cv/`.
- README e documentação de pipeline em `docs/pipeline/`.

### Notas

- Não há certificados publicados nesta versão.
- O perfil ainda não tem frase de efeito (`motto`).
- Os relatórios de performance e QA de 2026-10-22 (`docs/pipeline/06-budgets.md` e `docs/pipeline/07-qa-*.md`) apontam itens acima do limite, principalmente TBT no desktop e no mobile com CPU 4x, e o LCP mobile simulado pelo Lighthouse. Os detalhes estão no README.
