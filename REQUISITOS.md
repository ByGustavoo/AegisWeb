# Requisitos do Aegis

Decisões da descoberta de produto (1 de outubro de 2026). Elas são requisitos: não mudam nas fases
seguintes sem nova aprovação.

## Produto

Ferramenta pessoal, sem login, para criar senhas fortes e entender se uma senha existente é segura.
Responde a três perguntas: "me dá uma senha boa agora", "essa senha é forte?" e "por que ela é fraca,
e como melhoro?". A interface transmite confiança silenciosa: sóbria, precisa, sem alarmismo, com a
privacidade visível.

## Decisões

| # | Tema | Decisão |
|---|---|---|
| Q1 | Onde a senha é processada | 100% no navegador, sem backend. A senha nunca sai do aparelho. |
| Q2 | Nome | **Aegis**. Repositório `AegisWeb`, prefixo de armazenamento `aegis:`. |
| Q3 | Verificação de vazamento | Have I Been Pwned por k-anonimato, **opcional e acionada pela pessoa a cada análise**, com aviso do que é enviado (só os 5 primeiros caracteres do hash SHA-1). |
| Q4 | Histórico de senhas geradas | Só na memória da sessão: as últimas 10, apagáveis, somem ao recarregar. Nunca gravado no navegador. |
| Q5 | Tipos de geração | Senha aleatória, frase-senha e PIN. |
| Q6 | Tela inicial | Tela de boas-vindas (uma vez por sessão, como no Orbit), seguida do Gerador. |
| Q7 | Tema | Claro e escuro, seguindo o sistema, com botão para trocar. |
| Q8 | Navegação no celular | Barra de abas fixa embaixo. A alternativa com menu hambúrguer foi vista e descartada. |
| Q8b | Navegação no desktop e tablet | Menu lateral recolhível no modelo do OrbitWeb e do PrismaWeb, com header no topo e canto arredondado na área de conteúdo. No tablet, o menu fica sempre recolhido. (Pedido em 1 de outubro de 2026, depois da fase 1.) |
| Q9 | Publicação | Dockerfile, nginx, compose e workflows no modelo do OrbitWeb, com cabeçalhos de segurança e CSP restritiva. |

## Regras

* **Aleatoriedade:** toda geração usa `crypto.getRandomValues`, nunca `Math.random`.
* **Nada sai do aparelho**, exceto a verificação de vazamento quando pedida, e nela só o prefixo do hash.
* **Nada é gravado**, exceto as preferências de tema (`aegis:tema`) e de menu recolhido (`aegis:menu-recolhido`) e a marca de boas-vindas vista na sessão (`sessionStorage`).
* **Campos de senha** não têm `autocomplete`, correção ortográfica nem registro em console.
* **Força** em 5 níveis (Muito fraca, Fraca, Razoável, Forte, Muito forte), sempre comunicada por cor, ícone e texto juntos.
* **Sem dependências externas em tempo de execução:** fontes e ícones vêm do próprio pacote; sem analytics, sem cookies.
* **Idioma:** apenas pt-BR.

## Sugestões

| # | Sugestão | Situação |
|---|---|---|
| 1 | Vitrine de componentes em `/componentes`, só em desenvolvimento | Aprovada, implementada na fase 1 |
| 2 | Selo "Processado localmente" no header | Aprovada **só em Configurações**: virou a seção Privacidade |
| 3 | Limpar a área de transferência 30 segundos depois de copiar | Aprovada, entra com o gerador |
| 4 | Funcionar offline / instalável (PWA) | Recusada |
| 5 | Atalhos de teclado (`G` gerar, `C` copiar) | Não aprovada |

## Fases

| Fase | Escopo | Situação |
|---|---|---|
| 1 | Estrutura, layout, identidade visual, tipografia, cores, header e navegação, responsividade, páginas preparadas | Concluída |
| 2 | Gerador: senha, frase-senha e PIN, opções, copiar com limpeza da área de transferência, histórico da sessão | A fazer |
| 3 | Analisador: força, entropia, tempo estimado, padrões, sugestões e verificação de vazamento | A fazer |
