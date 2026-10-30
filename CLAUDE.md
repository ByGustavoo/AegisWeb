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
jsPDF 4 (PDF of the Imprimir page), Vitest. Same stack and folder conventions as `D:\Projetos\OrbitWeb`.

## Structure
| Path | Holds |
|---|---|
| `src/estilos/` | `tokens.css` (scale), `temas.css` (colors per theme), `global.css` |
| `src/componentes/layout/` | `MenuLateral` (sidebar, from 768px), `Cabecalho` (top bar with the content corner), `BarraAbas` (mobile only) |
| `src/componentes/ui/` | Design system; export everything through `index.ts` |
| `src/componentes/senha/` | `VisorSenha` (per-character-class coloring) and `MedidorForca` |
| `src/componentes/gerador/` | Generator UI: `VisorGerador`, `EscolhaFinalidade`, `OpcoesGerador`, `HistoricoSessao` |
| `src/componentes/impressao/` | Print sheet UI: `EditorConta`, `LinhaCampo`, `PainelPrevia` + `PaginaPrevia` (SVG pages), `gerarPdf` (jsPDF, lazy-loaded on download), `medidorNavegador` (canvas text widths), `desenhoValor` (value coloring, zero slash and footer lock shared by SVG and PDF), `vetores` (field icons as path commands drawn by both renderers), `idsImpressao` |
| `src/regras/impressao/` | Print engine: `selecao` (what goes to the PDF), `quebraLinhas`, `paginacao` (`montarDocumento` turns the sheet into positioned elements per A4 page, including the ornaments: account colors, side bars, icons, header dots and the bottom-left dot corner that skips the cards), `iconeDoCampo` (field name to icon), `arquivo` (file name) |
| `src/assets/fontes/` | Static Geist / Geist Mono TTFs embedded in the PDF, copied unchanged from the `geist` 1.8.2 package |
| `src/ganchos/useGerador.ts` | All generator state: options per type, purpose, generated values and strength |
| `src/dados/palavras.ts` | Passphrase word list (1,008 words, a-z, 4-8 letters; a test enforces it) |
| `src/dados/dicionarios.ts` | Generated analyzer lists (common passwords, pt/en words, names) as space-separated strings. Do not edit by hand; see Gotchas |
| `src/regras/analise/` | Analyzer engine: `correspondencias` (pattern matchers), `estimativa` (zxcvbn-style minimum-guesses decomposition), `analisarSenha` (score, strong/weak points, recommendations with simulation), `dicionarios` (lazy load, cached) |
| `src/componentes/analisador/` | Analyzer UI: `MapaSenha`, `PlacarSeguranca`, `ListaObservacoes`, `ListaRecomendacoes` |
| `src/configuracoes/` | `ambiente`, `aplicacao`, `navegacao`, `geracao` (types, defaults), `finalidades` (purpose presets, tips, minimum lengths), `analise` (examples, auto-clear time), `impressao` (PDF geometry, text styles, paper palette, field shortcuts), `privacidade` (trust seals and the Configurações privacy copy, one source for both), `forca` (5 strength levels) |
| `src/componentes/comum/` | `MarcaAegis`, `NomeAegis` (the brand name split into letters, used by the sidebar and the mobile header), `DescricaoAegis` ("Segurança de senhas" under that name, split into words), `SelosPrivacidade` (the trust row in the Gerador and Analisador password panels) |
| `src/regras/` | Pure logic with tests: `aleatorio` (unbiased crypto sampling), `geradorSenha`, `fraseSenha`, `pin`, `forca`, `caracteres`, and the analyzer under `analise/` |
| `src/provedores/` | `ProvedorTema`, `ProvedorAreaTransferencia` (copy + 30 s clear, app-level so it survives navigation), `ProvedorHistoricoSessao`, `ProvedorSenhaParaAnalise` and `ProvedorFolhaImpressao` (the print sheet, undo of the last removal, `beforeunload` warning; all in-memory only) |
| `src/rotas/caminhos.ts` | Every route, query param and anchor name |
| `docker/` | nginx config, security headers snippet, entrypoint that writes `config.js` |
| `video/` | Separate Remotion package for the presentation video (own `package.json`, outside the app build, CI and Docker context). `src/linhaDoTempo.ts` holds every frame cue; `scripts/gerarAudio.ts` arranges the synthesized soundtrack (150 BPM; every scene start and accent sits on the 12-frame beat grid) on top of the DSP in `scripts/sintese.ts` |

## Commands
| Purpose | Command |
|---|---|
| Install | `npm install` |
| Run (dev) | `npm run dev` (port 5175, after PrismaWeb on 5173 and OrbitWeb on 5174) |
| Test | `npm test` |
| Typecheck | `npm run typecheck` |
| Build | `npm run build` |
| Preview | `npm run preview` (port 4175) |
| Presentation video | `npm install --prefix video`, then `npm run render --prefix video` (writes the 3840×2160 `video/out/aegis-apresentacao.mp4`: the 1920×1080 composition rendered at `--scale=2`); `npm run gif --prefix video` rebuilds the README GIF `video/apresentacao.gif` (800px, 12 fps, kept under 10 MB) from that render; `npm run estudio --prefix video` opens Remotion Studio |

No linter or formatter is configured. Before calling a task done, run `npm run typecheck` and `npm test`.

## Conventions
* All identifiers, types, fields, files and folders in Portuguese (`TipoGeracao`, `NivelForca`, `quantidadePalavras`); enum-like values in UPPER_CASE (`'FRASE_SENHA'`).
* No comments in source, CSS, config or HTML. The only exceptions are `.env.example` and `/// <reference>`.
* No hex colors in components: colors come from `temas.css` tokens. The only hex outside it is the theme preview miniature in `SecaoAparencia.module.css`, which must show both themes at once. The PDF paper palette is RGB tuples in `configuracoes/impressao.ts` (`CORES_IMPRESSAO`), used by both the SVG preview and the PDF, because paper is white in either theme.
* `import.meta.env` and `window.__AEGIS_CONFIG__` are read only in `src/configuracoes/ambiente.ts`.
* Routes and query param names only from `src/rotas/caminhos.ts`.
* New interface work goes through the `elite-web-experience` skill and is verified in Chrome.

## Security rules (from REQUISITOS.md)
* Randomness only via `crypto.getRandomValues`, never `Math.random`.
* Passwords are never persisted (`localStorage`, `sessionStorage`, URL, console). The only stored values are `aegis:tema`, `aegis:menu-recolhido` and the welcome flag in `sessionStorage`.
* The only allowed external request is the opt-in Have I Been Pwned range query, sending only the first 5 chars of the SHA-1 hash. The CSP in `docker/seguranca.conf` allows exactly that host; adding any other external origin is a product decision.
* No inline scripts: the CSP is `script-src 'self'`. The pre-render theme script lives in `public/tema-inicial.js` for that reason.

## Gotchas
* Chrome only lets a page write to the clipboard right after a click or key press. A timer-only `writeText` stays pending forever, so `ProvedorAreaTransferencia` races every write against a 2 s timeout and, when there is no user activation at 30 s, clears on the next `pointerdown`/`pointerup`/`keydown` in the app that actually grants user activation (a lone Shift or a touch `pointerdown` does not, so those are skipped and the listener keeps waiting). Do not "simplify" this back to a plain timer.
* Never call `navigator.clipboard.readText()` while testing: it opens a permission prompt that blocks every later clipboard write in that tab. Verify clearing by pasting with `Ctrl+V` into the Analisador field instead.
* The analyzer score is calibrated against the generator: `notaPorEntropia` maps 28/40/60/80 bits to 20/40/60/80 points, and a test checks that generated passwords and passphrases get the generator's level within one. Changing the bruteforce cardinality, the score curve or the dictionaries can break that test on purpose.
* `src/dados/dicionarios.ts` was generated from `@zxcvbn-ts/language-common` 4.1.3, `language-pt-br` 4.1.1 and `language-en` 4.1.1 (MIT; the pt-BR and en word lists derive from OpenSubtitles, ODC-BY) plus a curated list of Brazilian passwords interleaved at the top. The notices live in `LICENCAS-DE-TERCEIROS.md`; keep it in sync if the file is regenerated.
* Analyzer titles quote parts of the password. Every observation and recommendation that quotes one also has a `tituloOculto`, used while the password is hidden.
* Generated passwords must never reach the URL, `localStorage`, `sessionStorage` or `history.state`; pass them between pages through `ProvedorSenhaParaAnalise` (to the Analisador) or `ProvedorFolhaImpressao.encaminharSenha` (to Imprimir).
* Chrome windows narrower than 500px are not possible; check 320 and 375 widths by loading the app in iframes.
* The welcome screen shows once per browser session (`aegis:boas-vindas-vista` in `sessionStorage`); a new tab shows it again.
* `/componentes` exists only in development (`ambiente.desenvolvimento`).
* The Imprimir preview and the PDF come from the same `montarDocumento` output, so line breaks and page breaks are identical. Text is measured with a canvas in the app's own Geist fonts with kerning off (`medidorNavegador`), and the preview SVG also disables kerning and ligatures; jsPDF does not kern either. Wrap widths keep a 1.5% margin (`folgaMedicao`). Changing a size, spacing or font in `ESTILOS_TEXTO` / `GEOMETRIA_DOCUMENTO` changes both at once; keep `impressao.test.ts` green.
* jsPDF cannot apply OpenType features, so the slashed zero of Geist Mono (`slashed-zero` in CSS) is not available in the PDF. `geometriaDoTracoDoZero` draws the slash by hand in both the PDF and the preview.
* The PDF fonts are static TTFs vendored in `src/assets/fontes/`. Do not add the `geist` npm package to get them: it has a peer dependency on Next.js. jsPDF subsets them, so a one-page PDF is around 60 KB.
* `jspdf` is in `optimizeDeps.include`. Without it, Vite discovers it on the first download, re-optimizes the deps mid-session and the next hot update loads a second copy of React ("Invalid hook call").
* `ProvedorFolhaImpressao` registers `beforeunload` while the sheet has data, so reloading the tab during a browser test opens a "Leave site?" dialog. Clear the sheet with "Apagar tudo" first.
* The `*` route (`PaginaNaoEncontrada`) is the only one outside `LayoutAplicacao`, with its own `Suspense`. It keeps `main#conteudo` with an `h1`, and `marca-em-transicao` / `nome-em-transicao` on its brand, because the welcome transition waits for that `h1` and lands the mark and the name there. The hero speaks the product's vocabulary: three cells roll characters (colored by `classificarCaractere`) until they stop on `404`. While any cell shows something other than `404`, the meter reads as the generator would for a random password: level 5 from `niveisForca` ("Muito forte", `5/5`, full track). Once the last cell lands, the track empties pill by pill, the counter rolls down to `0/5` and the label switches to "Sem correspondência"; when the cells leave `404` it fills back up. The lit pills are one overlay revealed by `clip-path` in `steps(5)`, so the same keyframes fill left to right and empty right to left. Each wheel is `attempts + digit + first attempt again`, so the loop restarts without a jump; `--indice-do-codigo` is where the digit sits, and the wheel's resting transform already shows it, which is what reduced motion displays. The attempts are drawn again on every cycle through `regras/aleatorio` (never `Math.random`), two per character class, and the swap is scheduled for the middle of the cycle (`MOMENTO_DA_TROCA_NO_CICLO`), while every wheel is parked on its digit and the other characters are out of sight. All of the hero's loops share `--ciclo`, so the percentages in `girar`, `preencher`, `contar`, `mostrarForca`, `mostrarVeredito` and `negar` are one timeline: change one, check the others. The requested path is rendered with `VisorSenha`.
* The welcome-to-app transition flies the mark to the app brand through `view-transition-name` (`marca-em-transicao` in `global.css`). The name does not morph: the welcome letters retreat behind the mark, and the app name (`nome-em-transicao`, its own group so the page fade does not move it) brings its letters out from behind the mark as it lands, driven by the `nome-chegando` root class that `transicaoBoasVindas` adds on `ready` and removes when those letter animations finish. The description below the name (`descricao-em-transicao`, also its own group with no animation of its own) follows right after the letters, word by word, from behind the mark. Only one rendered element may carry each name: the sidebar brand and the mobile header brand share them because one of the two is always `display: none`.
* Content width is `--largura-conteudo` (1440px) on every route, Configurações included. Configurações follows the PrismaWeb layout: Aparência next to Versões (20rem), stacked below a 1200px `conteudo` container, and Privacidade below in 3, 2 or 1 columns. The theme options are horizontal (miniature beside the text, one column below a 600px `aparencia` container) so Aparência and Versões keep the same height side by side. Versões has two rows, Web (`1.4.0`, "Versão de desenvolvimento" without `config.js` values) and Lançada em (`28 de Outubro de 2026`, "Ainda não publicada" locally); there is no API row. Gerar and Analisar widen their panels through `--respiro-painel` on their grid; other pages keep the default panel padding.
* Layouts that depend on the space actually available use container queries, not viewport media queries, because the expanded sidebar takes 248px: `conteudo` (`.limite` in `LayoutAplicacao`, stacks the Gerar and Analisar grids below 920px and the Configurações top row below 1200px), `visor` (strength row and legend in `VisorGerador`), `placar` (`PlacarSeguranca`) and `finalidade` (`EscolhaFinalidade`). Keep viewport media queries for things tied to the device, like the mobile tab bar and touch sizes.
* The favicon is `public/aegis.svg`, not `icone.svg`: the sibling projects (ArgusWeb, OrbitWeb, OryntWeb) all serve `/icone.svg` and take each other's dev ports when one is busy, so Chrome showed another project's cached icon on the Aegis tab.
* Each route enters as one cascade: the global `item-em-cascata` class plus `comIndice(n)` from `utilitarios/cascata` (`--indice` × `--passo-cascata-pagina`). Opacity (`aegis-revelar`, `--curva-revelar`) and the rise (`aegis-assentar`, `--curva-assentar`, longer) are separate animations so the panel is already visible while it settles; if the rise ends before the fade, it reads as a plain fade. `CabecalhoPagina` uses 0–2 (overline, title, description and actions) with a shorter rise; page panels start at 3, in reading order; the 404 uses the same class. `EsqueletoPagina` only fades in after `--espera-esqueleto`, so a fast route load never flashes it. Panels that mount later on user input (Analisador's Pontos and Como melhorar) stay out of it, or they would rise with a page-entry delay while the person types.
* The sidebar's first item is centered on the page overline (the `sobretitulo`, like "GERADOR") through `--respiro-topo-conteudo` and `--altura-sobretitulo`; changing `CabecalhoPagina` sizes or the top padding breaks that alignment.
