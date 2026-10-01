<div align="center"> <br>
  <img align="center" alt="aegis-react" height="150" width="150" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" />
</div>

<br>

<div align="center">
  <strong>Aegis</strong> é um gerador e analisador de senhas: <em>senhas fortes, sem sair do seu aparelho</em>. Cria senhas, frases-senha e PINs e mostra quanto uma senha resiste a um ataque, com tudo acontecendo no navegador. Não tem backend, não grava senhas e não carrega nada de terceiros.
</div>

<br> <br>

## 🚀 Ferramentas Utilizadas

* ⚡ Vite 5

* 🧪 Vitest

* ⚛️ React 18

* 🎨 HTML e CSS

* 🖼️ Lucide React

* 🔷 TypeScript 5

* 🧭 React Router 6

* 🔤 Geist e Geist Mono

<br>

## 📌 Status do Projeto

**Fase 1 — Base do projeto: concluída.** Estrutura, identidade visual, tema claro e escuro, header,
barra de abas no celular, tela de boas-vindas e as páginas do Gerador, do Analisador e de
Configurações preparadas para receber as funcionalidades. A geração e a análise entram nas fases 2
e 3. Decisões e escopo de cada fase em [`REQUISITOS.md`](REQUISITOS.md).

<br>

## ✨ Funcionalidades

🔹 **Prontas**

* **Gerador:** abas Senha, Frase-senha e PIN (com o tipo na URL, `?tipo=frase`), visor com prévia, opções previstas e histórico da sessão.

* **Analisador:** campo de senha com mostrar e ocultar, medidor de força em 5 níveis, métricas previstas e o painel opcional de vazamentos.

* **Configurações:** tema claro, escuro ou automático; seção Privacidade com o que acontece com as senhas; versão e data de lançamento.

* **Tela de boas-vindas** uma vez por sessão, com a marca e o nome deslizando até o menu na entrada do app, e página de não encontrada.

* **Vitrine** de tokens e componentes em `/componentes`, só em desenvolvimento.

🔹 **Próximas fases**

* **Geração** com `crypto.getRandomValues`, cópia com limpeza da área de transferência e histórico das últimas 10 senhas, só em memória.

* **Análise** de força, entropia, tempo estimado para quebrar, padrões e sugestões, e verificação de vazamento por k-anonimato.

<br>

## ⚙️ Pré-requisitos

* Node.js 18 ou superior

<br>

## 📦 Instalação

```bash
# Instala as dependências do projeto
$ npm install
```

<br>

## ▶️ Como Executar

```bash
# Sobe o servidor de desenvolvimento em http://localhost:5177
$ npm run dev
```

<br>

## 📜 Scripts Disponíveis

🔹 dev
```bash
# Servidor de desenvolvimento com HMR
$ npm run dev
```

🔹 build
```bash
# Checagem de tipos e build de produção em dist/
$ npm run build
```

🔹 preview
```bash
# Serve o build de produção em http://localhost:4177
$ npm run preview
```

🔹 typecheck
```bash
# Apenas a checagem de tipos
$ npm run typecheck
```

🔹 test
```bash
# Testes das regras puras
$ npm run test
```

<br>

## 🔐 Variáveis de Ambiente

O Aegis não tem backend e não precisa de nenhuma variável para rodar em desenvolvimento.

| Variável | Descrição |
|---|---|
| `AEGIS_PORTA` | Porta publicada pelo `docker-compose-aegisweb.yml` (padrão `9035`) |
| `AEGIS_VERSION` | Versão exibida em Configurações, definida pelo container a partir do build |
| `AEGIS_RELEASE_DATE` | Data de lançamento exibida em Configurações, definida pelo container |

<br>

## 🐳 Docker

A imagem compila o projeto e o serve com nginx na porta 8080. Ao subir, o container grava
`config.js` com a versão e a data de lançamento.

🔹 Imagem local
```bash
# Constrói a imagem
$ docker build -t aegisweb:local --build-arg VERSION=1.0.0 .

# Sobe o container em http://localhost:9035
$ docker run --rm -p 9035:8080 aegisweb:local
```

🔹 Compose
```bash
# Sobe a imagem publicada
$ docker compose -f docker-compose-aegisweb.yml up -d
```

<br>

* **CSP restritiva** em [`docker/seguranca.conf`](docker/seguranca.conf): scripts, estilos e fontes só da própria origem, e conexões só com a própria origem e com `api.pwnedpasswords.com`.

* **Outros cabeçalhos:** `Referrer-Policy: no-referrer`, `X-Frame-Options: DENY`, `Cross-Origin-Opener-Policy`, `Permissions-Policy` e `X-Content-Type-Options`.

* **Sem script inline:** o tema é aplicado antes do React montar por `public/tema-inicial.js`, para caber na CSP.

<br>

## 🤖 Integração Contínua

| Workflow | Gatilho | O que faz |
|---|---|---|
| `ci.yml` | Pull request para `main` | Testes, build e build da imagem |
| `release.yml` | PR mesclado em `main` ou execução manual | Calcula a versão, publica a imagem no Docker Hub e cria a tag e a release |

<br>

## 🌗 Identidade Visual

* 🎨 **Cores** em `src/estilos/temas.css`, sob `[data-tema='claro']` e `[data-tema='escuro']`: grafite neutro e um único verde-petróleo de destaque.

* 🔤 **Tipografia:** Geist na interface e Geist Mono nas senhas, para cada caractere ocupar a mesma largura e ser lido sem ambiguidade.

* 🔢 **Caracteres por tipo:** no visor, letras, números e símbolos têm cores diferentes.

* 🛡️ **Força** em 5 níveis com cor, ícone e texto juntos, nunca só cor.

* ♿ **Contraste:** todo texto passa de 4.5:1 nos dois temas.

<br>

## 📱 Responsividade

* 🖥️ **Desktop:** menu lateral recolhível, no modelo do OrbitWeb e do PrismaWeb, com a preferência salva no navegador. O header e o menu formam uma moldura, e a área de conteúdo tem o canto superior esquerdo arredondado.

* 📲 **Tablet (até 1023px):** o menu fica recolhido, só com ícones, e as colunas das páginas empilham.

* 📱 **Celular (até 767px):** barra de abas fixa embaixo, com Gerar, Analisar e Configurações.

* 👆 **Toque:** alvos de 44px em telas de toque e campos de senha com mais de 16px.

* 🎬 **Movimento:** `prefers-reduced-motion` respeitado globalmente.

<br>

## 📁 Estrutura

```
src
├── componentes
│   ├── boasVindas      # Tela de boas-vindas e transição para o app
│   ├── comum           # MarcaAegis
│   ├── configuracoes   # Seções Aparência, Privacidade e Sobre
│   ├── layout          # MenuLateral, Cabecalho, BarraAbas, BotaoTema, CabecalhoPagina
│   ├── senha           # VisorSenha e MedidorForca
│   └── ui              # Design system: botões, painéis, abas, campo de senha, estados
├── configuracoes       # Ambiente, aplicação, navegação, tipos de geração e níveis de força
├── estilos             # tokens.css, temas.css e global.css
├── ganchos             # Título do documento, armazenamento local, movimento reduzido
├── layouts             # LayoutAplicacao
├── modelos             # Tipos do domínio de senhas
├── paginas             # Uma página por rota
├── provedores          # Tema e histórico da sessão
├── regras              # Regras puras, com testes
├── rotas               # Caminhos e tabela de rotas
└── utilitarios         # Formatação, título e classes
```

<br>

## 🗺️ Próximas Etapas

* 🔑 **Fase 2 — Gerador:** geração das três modalidades, opções, cópia e histórico da sessão.

* 🔍 **Fase 3 — Analisador:** avaliação de força, padrões, sugestões e verificação de vazamento.

<br>

## 🖥️ Desenvolvedor

### 🔵 LinkedIn: [Gustavo Correa](https://www.linkedin.com/in/gustavo-chauar-correa-946168269/)
