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

## Decisões da fase 2 (gerador)

| # | Tema | Decisão |
|---|---|---|
| G1 | Modalidades | Senha, frase-senha e PIN, todas nesta fase. A frase-senha usa uma lista própria de 1.008 palavras em português, de 4 a 8 letras, sem acento. |
| G2 | Finalidade | Só ajusta as opções da aba Senha; nunca troca de aba sozinha. |
| G3 | Lembrar opções | Não: toda visita começa em "Uso geral". |
| G4 | Configurações por finalidade | Uso geral 16 (todos os tipos); Banco 12 (sem símbolos, sem ambíguos); E-mail 20 (todos os tipos); Trabalho 16 (todos os tipos, sem ambíguos); Games 16 (sem símbolos, sem ambíguos); Wi-Fi 20 (sem símbolos, sem ambíguos). |
| G5 | Visibilidade | A senha começa visível, com botão para ocultar (que também mascara o histórico). |
| G6 | Limpeza da área de transferência | Contador de 30 s. O navegador só deixa escrever na área de transferência logo depois de um clique ou tecla; se não houver esse gesto aos 30 s, a limpeza acontece no próximo clique ou tecla em qualquer lugar do app. Há um botão "Limpar agora" durante a contagem. |

## Regras do gerador

* **Sorteio sem viés:** amostragem por rejeição sobre `crypto.getRandomValues`.
* **Tipos garantidos:** a senha sempre tem ao menos um caractere de cada tipo ligado; o último tipo ligado não pode ser desligado.
* **Ambíguos:** `O 0 o I l 1 | S 5 B 8`.
* **Tamanhos:** senha de 8 a 64; frase de 4 a 10 palavras (padrão 6, com número de dois dígitos no fim); PIN de 4 a 12 dígitos (padrão 6), sem repetições como 0000 nem sequências como 1234 ou 9876.
* **Força:** pela entropia do sorteio (tamanho × log₂ do alfabeto). Níveis: abaixo de 28 bits muito fraca, até 40 fraca, até 60 razoável, até 80 forte, e muito forte a partir de 80. O tempo para quebrar considera um ataque offline a 10¹⁰ tentativas por segundo, na média de metade das combinações.
* **Personalizado:** mudar qualquer opção depois de escolher uma finalidade marca "Personalizado"; tocar na finalidade de novo volta ao recomendado.
* **Avisos:** abaixo do tamanho mínimo da finalidade (Uso geral 12, Banco 10, E-mail 16, Trabalho 14, Games 12, Wi-Fi 16), Wi-Fi acima de 63 caracteres, senha fraca e frase com menos de 6 palavras. O PIN sempre mostra que a proteção vem do bloqueio após tentativas erradas.
* **Histórico da sessão:** guarda a senha quando ela é copiada ou trocada por "Gerar outra", sem repetir, até 10. Mudar uma opção não registra.
* **Analisar esta senha:** leva a senha ao Analisador só pela memória do app, nunca pela URL.
* **Atalho:** `Ctrl+Enter` gera outra.

## Regras

* **Aleatoriedade:** toda geração usa `crypto.getRandomValues`, nunca `Math.random`.
* **Nada sai do aparelho**, exceto a verificação de vazamento quando pedida, e nela só o prefixo do hash.
* **Nada é gravado** (as senhas vivem só na memória da aba), exceto as preferências de tema (`aegis:tema`) e de menu recolhido (`aegis:menu-recolhido`) e a marca de boas-vindas vista na sessão (`sessionStorage`).
* **Campos de senha** não têm `autocomplete`, correção ortográfica nem registro em console.
* **Força** em 5 níveis (Muito fraca, Fraca, Razoável, Forte, Muito forte), sempre comunicada por cor, ícone e texto juntos.
* **Sem dependências externas em tempo de execução:** fontes e ícones vêm do próprio pacote; sem analytics, sem cookies.
* **Idioma:** apenas pt-BR.

## Sugestões

| # | Sugestão | Situação |
|---|---|---|
| 1 | Vitrine de componentes em `/componentes`, só em desenvolvimento | Aprovada, implementada na fase 1 |
| 2 | Selo "Processado localmente" no header | Aprovada **só em Configurações**: virou a seção Privacidade |
| 3 | Limpar a área de transferência 30 segundos depois de copiar | Aprovada, implementada na fase 2 (ver G6) |
| 6 | Dica explicando cada finalidade | Aprovada, implementada na fase 2 |
| 7 | Aviso quando a configuração fica abaixo do recomendado | Aprovada, implementada na fase 2 |
| 8 | Botão "Analisar esta senha" | Aprovada, implementada na fase 2 |
| 4 | Funcionar offline / instalável (PWA) | Recusada |
| 5 | Atalhos de teclado (`G` gerar, `C` copiar) | Não aprovada |

## Fases

| Fase | Escopo | Situação |
|---|---|---|
| 1 | Estrutura, layout, identidade visual, tipografia, cores, header e navegação, responsividade, páginas preparadas | Concluída |
| 2 | Gerador: senha, frase-senha e PIN, finalidades, opções, força, copiar com limpeza da área de transferência, histórico da sessão | Concluída |
| 3 | Analisador: força, entropia, tempo estimado, padrões, sugestões e verificação de vazamento | A fazer |
