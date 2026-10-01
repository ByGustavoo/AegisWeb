# Aegis

## What this is
Frontend of a password generator and analyzer that runs entirely in the browser. Single user, no
login, no backend. Product decisions live in `REQUISITOS.md` and are requirements: do not change
them without the user's approval.

## Type
web/frontend - release: branch + PR to `main` (`ci.yml` runs on the PR, `release.yml` publishes the Docker image when the PR is merged)

## Stack
React 18, TypeScript 5 (`strict`, `noUncheckedIndexedAccess`), Vite 5, React Router 6 (v7 future
flags on), CSS Modules with custom properties, lucide-react, Geist / Geist Mono via `@fontsource-variable`,
Vitest. Same stack and folder conventions as `D:\Projetos\OrbitWeb`.

## Structure
| Path | Holds |
|---|---|
| `src/estilos/` | `tokens.css` (scale), `temas.css` (colors per theme), `global.css` |
| `src/componentes/layout/` | `MenuLateral` (sidebar, from 768px), `Cabecalho` (top bar with the content corner), `BarraAbas` (mobile only) |
| `src/componentes/ui/` | Design system; export everything through `index.ts` |
| `src/componentes/senha/` | `VisorSenha` (per-character-class coloring) and `MedidorForca` |
| `src/configuracoes/` | `ambiente`, `aplicacao`, `navegacao`, `geracao` (types of generation), `forca` (5 strength levels) |
| `src/regras/` | Pure logic with `*.test.ts` next to it |
| `src/provedores/` | `ProvedorTema`, `ProvedorHistoricoSessao` (in-memory only) |
| `src/rotas/caminhos.ts` | Every route and query param name |
| `docker/` | nginx config, security headers snippet, entrypoint that writes `config.js` |

## Commands
| Purpose | Command |
|---|---|
| Install | `npm install` |
| Run (dev) | `npm run dev` (port 5177; 5173 is used by other projects) |
| Test | `npm test` |
| Typecheck | `npm run typecheck` |
| Build | `npm run build` |
| Preview | `npm run preview` (port 4177) |

No linter or formatter is configured. Before calling a task done, run `npm run typecheck` and `npm test`.

## Conventions
* All identifiers, types, fields, files and folders in Portuguese (`TipoGeracao`, `NivelForca`, `quantidadePalavras`); enum-like values in UPPER_CASE (`'FRASE_SENHA'`).
* No comments in source, CSS, config or HTML. The only exceptions are `.env.example` and `/// <reference>`.
* No hex colors in components: colors come from `temas.css` tokens. The only hex outside it is the theme preview miniature in `SecaoAparencia.module.css`, which must show both themes at once.
* `import.meta.env` and `window.__AEGIS_CONFIG__` are read only in `src/configuracoes/ambiente.ts`.
* Routes and query param names only from `src/rotas/caminhos.ts`.
* New interface work goes through the `elite-web-experience` skill and is verified in Chrome.

## Security rules (from REQUISITOS.md)
* Randomness only via `crypto.getRandomValues`, never `Math.random`.
* Passwords are never persisted (`localStorage`, `sessionStorage`, URL, console). The only stored values are `aegis:tema`, `aegis:menu-recolhido` and the welcome flag in `sessionStorage`.
* The only allowed external request is the opt-in Have I Been Pwned range query, sending only the first 5 chars of the SHA-1 hash. The CSP in `docker/seguranca.conf` allows exactly that host; adding any other external origin is a product decision.
* No inline scripts: the CSP is `script-src 'self'`. The pre-render theme script lives in `public/tema-inicial.js` for that reason.

## Gotchas
* Chrome windows narrower than 500px are not possible; check 320 and 375 widths by loading the app in iframes.
* The welcome screen shows once per browser session (`aegis:boas-vindas-vista` in `sessionStorage`); a new tab shows it again.
* `/componentes` exists only in development (`ambiente.desenvolvimento`).
* The welcome-to-app transition morphs the mark and the name through `view-transition-name` (`marca-em-transicao`, `nome-em-transicao` in `global.css`). Only one rendered element may carry each name: the sidebar brand and the mobile header brand share them because one of the two is always `display: none`.
* The sidebar's first item is aligned with the page `h1` through `--altura-sobretitulo` and `--altura-titulo-pagina`; changing `CabecalhoPagina` sizes breaks that alignment.
