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

**Fase 3 — Analisador: concluída.** Análise local de senhas com nota de 0 a 100, pontos fortes e fracos e
recomendações. A verificação de vazamentos entra na fase 4. Decisões e escopo de cada fase em
[`REQUISITOS.md`](REQUISITOS.md). As listas de senhas e palavras comuns têm origem e licença em
[`LICENCAS-DE-TERCEIROS.md`](LICENCAS-DE-TERCEIROS.md).

<br>

## ✨ Funcionalidades

🔹 **Prontas**

* **Gerador de senha:** sorteio com `crypto.getRandomValues`, sem viés; tamanho de 8 a 64; maiúsculas, minúsculas, números e símbolos; exclusão de caracteres ambíguos.

* **Geração inteligente:** finalidades Uso geral, Banco, E-mail, Trabalho, Games e Wi-Fi, cada uma com a configuração recomendada, uma dica e um aviso quando a configuração fica abaixo do recomendado.

* **Frase-senha e PIN:** frase com 4 a 10 palavras de uma lista própria em português, separador, número e símbolo opcionais e uma dica de quando preferir a frase à senha aleatória; PIN de 4 a 12 dígitos, sem sequências nem repetições óbvias.

* **Visor:** senha com cores por tipo de caractere, mostrar e ocultar, força em 5 níveis, entropia e tempo estimado para quebrar.

* **Copiar com limpeza:** a área de transferência é limpa 30 s depois (ou no próximo clique ou tecla, quando o navegador exige um gesto), com "Limpar agora". Se o navegador não deixar copiar, o app avisa em vermelho e deixa a senha selecionada para a cópia manual, nunca mostra "Copiada".

* **Histórico da sessão:** as últimas 10 senhas copiadas, só em memória, com copiar, remover e limpar.

* **Analisar esta senha:** abre o Analisador já preenchido, sem passar a senha pela URL.

* **Analisar senha:** análise feita só no navegador, enquanto a pessoa digita, com nota de 0 a 100 no medidor de 5 níveis, tempo estimado para quebrar e entropia estimada.

* **Padrões detectados:** senhas comuns, palavras em português e inglês, nomes, letras trocadas (`s3nh@`), palavras invertidas, sequências, teclas vizinhas, repetições, datas, anos, frases curtas e formatos previsíveis como "Palavra + números + símbolo".

* **Mapa da senha:** os trechos previsíveis aparecem marcados na própria senha, e com a senha oculta nada dela é citado.

* **Pontos fortes, pontos fracos e recomendações:** cada recomendação mostra a nota que a senha teria ("E se…"), com atalho para gerar uma senha forte.

* **Privacidade evidente:** selos "Processado localmente", "Nenhuma senha armazenada" e "Sua senha não sai do aparelho" no Gerador e no Analisador, com link para os detalhes; exemplos clicáveis e limpeza da senha ao sair, no botão Limpar ou depois de 2 minutos sem uso.

* **Configurações:** tema claro, escuro ou automático; seção Privacidade com o que acontece com as senhas; versão e data de lançamento.

* **Tela de boas-vindas** uma vez por sessão, com a marca deslizando até o menu na entrada do app, e página de não encontrada.

* **Vitrine** de tokens e componentes em `/componentes`, só em desenvolvimento.

🔹 **Próximas fases**

* **Verificação de vazamento** por k-anonimato (Have I Been Pwned), opcional e acionada pela pessoa.

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
# Sobe o servidor de desenvolvimento em http://localhost:5175
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
# Serve o build de produção em http://localhost:4175
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
| `AEGIS_PORTA` | Porta publicada pelo `docker-compose-aegisweb.yml` (padrão `5175`) |
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

# Sobe o container em http://localhost:5175
$ docker run --rm -p 5175:8080 aegisweb:local
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

* 📲 **Tablet (até 1023px):** o menu fica recolhido, só com ícones. As colunas do Gerador e do Analisador empilham pela largura real da área de conteúdo (container queries), então também empilham em 1024px com o menu aberto.

* 📱 **Celular (até 767px):** barra de abas fixa embaixo, com Gerar, Analisar e Configurações.

* 👆 **Toque:** alvos de 44px em telas de toque e campos de senha com mais de 16px.

* 🎬 **Movimento:** `prefers-reduced-motion` respeitado globalmente.

<br>

## 📁 Estrutura

```
src
├── componentes
│   ├── analisador      # Mapa da senha, placar, pontos e recomendações
│   ├── boasVindas      # Tela de boas-vindas e transição para o app
│   ├── gerador         # Visor, finalidades, opções e histórico da sessão
│   ├── comum           # MarcaAegis e SelosPrivacidade
│   ├── configuracoes   # Seções Aparência, Privacidade e Sobre
│   ├── layout          # MenuLateral, Cabecalho, BarraAbas, BotaoTema, CabecalhoPagina
│   ├── senha           # VisorSenha e MedidorForca
│   └── ui              # Design system: botões, painéis, abas, campo de senha, estados
├── configuracoes       # Ambiente, aplicação, navegação, finalidades, geração, análise, privacidade e níveis de força
├── dados               # Palavras da frase-senha e listas de senhas, palavras e nomes comuns
├── estilos             # tokens.css, temas.css e global.css
├── ganchos             # Gerador, analisador, limpeza por inatividade, título e preferências
├── layouts             # LayoutAplicacao
├── modelos             # Tipos do domínio de senhas
├── paginas             # Uma página por rota
├── provedores          # Tema, área de transferência, histórico da sessão e encaminhamento à análise
├── regras              # Sorteio, geradores, força, caracteres e motor de análise, com testes
├── rotas               # Caminhos e tabela de rotas
└── utilitarios         # Formatação, título e classes
```

<br>

## 🗺️ Próximas Etapas

* 🔍 **Fase 4 — Vazamentos:** verificação opcional por k-anonimato no Analisador.

<br>

## 🖥️ Desenvolvedor

### 🔵 LinkedIn: [Gustavo Correa](https://www.linkedin.com/in/gustavo-chauar-correa-946168269/)
