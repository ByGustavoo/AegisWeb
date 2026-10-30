# Requisitos do Aegis

Decisões da descoberta de produto (1 de outubro de 2026). Elas são requisitos: não mudam nas fases
seguintes sem nova aprovação.

## Produto

Ferramenta pessoal, sem login, para criar senhas fortes e entender se uma senha existente é segura.
Responde a três perguntas: "me dá uma senha boa agora", "essa senha é forte?" e "por que ela é fraca,
e como melhoro?". Desde a fase 5 responde também a "como guardo minhas contas no papel, organizadas e
legíveis?". A interface transmite confiança silenciosa: sóbria, precisa, sem alarmismo, com a
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
| G7 | Símbolo na frase-senha | Opção "Incluir um símbolo", desligada por padrão: um de `! @ # $ % & * ?` no fim, colado ao número (`Cacto-Tigre-Lua-47!`). O nome da aba continua "Frase-senha"; a dica cita "passphrase" uma vez. (Pedido em 2 de outubro de 2026.) |

## Regras do gerador

* **Sorteio sem viés:** amostragem por rejeição sobre `crypto.getRandomValues`.
* **Tipos garantidos:** a senha sempre tem ao menos um caractere de cada tipo ligado; o último tipo ligado não pode ser desligado.
* **Ambíguos:** `O 0 o I l 1 | S 5 B 8`.
* **Tamanhos:** senha de 8 a 64; frase de 4 a 10 palavras (padrão 6, com número de dois dígitos no fim e, se pedido, um símbolo depois dele); PIN de 4 a 12 dígitos (padrão 6), sem repetições como 0000 nem sequências como 1234 ou 9876.
* **Força:** pela entropia do sorteio (tamanho × log₂ do alfabeto). Níveis: abaixo de 28 bits muito fraca, até 40 fraca, até 60 razoável, até 80 forte, e muito forte a partir de 80. O tempo para quebrar considera um ataque offline a 10¹⁰ tentativas por segundo, na média de metade das combinações.
* **Personalizado:** mudar qualquer opção depois de escolher uma finalidade marca "Personalizado"; tocar na finalidade de novo volta ao recomendado.
* **Avisos:** abaixo do tamanho mínimo da finalidade (Uso geral 12, Banco 10, E-mail 16, Trabalho 14, Games 12, Wi-Fi 16), Wi-Fi acima de 63 caracteres, senha fraca e frase com menos de 6 palavras. O PIN sempre mostra que a proteção vem do bloqueio após tentativas erradas.
* **Histórico da sessão:** guarda só a senha copiada, sem repetir, até 10. "Gerar outra" e mudar uma opção não registram (ver P2).
* **Analisar esta senha:** leva a senha ao Analisador só pela memória do app, nunca pela URL.
* **Atalho:** `Ctrl+Enter` gera outra.

## Decisões da fase 3 (analisador)

| # | Tema | Decisão |
|---|---|---|
| A1 | Motor de análise | Próprio, no estilo do zxcvbn: divide a senha nos padrões encontrados e estima quantas tentativas um ataque precisaria. Explicações escritas em português. |
| A2 | Listas | 10 mil senhas comuns (lista global do zxcvbn-ts com uma lista curada de senhas brasileiras intercalada no topo), 8 mil palavras em português, 4 mil em inglês e 3,5 mil nomes, mais a lista de palavras da frase-senha. Cerca de 90 KB compactados, baixados só ao abrir o Analisador. |
| A3 | Vazamentos (HIBP) | Fica para uma fase própria. Nesta fase nada sai do aparelho, sem exceção; o painel aparece como "Em breve". |
| A4 | Faixas da nota | 0–19 Muito fraca, 20–39 Fraca, 40–59 Razoável, 60–79 Forte, 80–100 Muito forte, usando o mesmo medidor de 5 níveis do Gerador. |
| A5 | Quando analisar | Enquanto a pessoa digita, sem botão. |
| A6 | Mapa da senha | Os trechos previsíveis aparecem marcados na própria senha, respeitando o ocultar. |
| A7 | Privacidade evidente | Substituída por P1: os selos de privacidade ficam no painel da senha, iguais aos do Gerador. A faixa do topo e o selo "Só neste aparelho" saíram por repetir a mesma mensagem. |

## Decisões da etapa de privacidade e confiança

| # | Tema | Decisão |
|---|---|---|
| P1 | Selos de confiança | "Processado localmente", "Nenhuma senha armazenada" e "Sua senha não sai do aparelho" numa linha discreta no painel da senha do Gerador e do Analisador, com o link "Como funciona?" para a seção Privacidade de Configurações. O cabeçalho do app continua sem selo (sugestão 2). |
| P2 | Histórico da sessão | Guarda só as senhas copiadas. Uma senha trocada por "Gerar outra" sem ser copiada não fica na memória. |
| P3 | Histórico ao sair do Gerador | Continua até fechar ou recarregar a aba, como em Q4. |
| P4 | Transparência | A seção Privacidade usa os mesmos títulos dos selos, diz que a verificação de vazamentos ainda não existe e avisa que, se a aba for fechada antes dos 30 segundos, a senha copiada continua na área de transferência. (Pedido em 2 de outubro de 2026.) |

## Regras do analisador

* **Padrões detectados:** senhas comuns, palavras (português e inglês, com e sem acento), nomes, letras trocadas por números ou símbolos (`s3nh@`), palavras invertidas, sequências (`abc`, `9753`), teclas vizinhas (QWERTY e teclado numérico), repetições (`aaa`, `abcabc`), datas e anos, frases de palavras comuns com ou sem final curto, e os formatos "Palavra + números + símbolo" e "maiúscula só no começo".
* **Nota:** pela estimativa de tentativas, em bits, com os mesmos cortes do Gerador (28, 40, 60 e 80 bits valem 20, 40, 60 e 80 pontos; 120 bits ou mais valem 100). Assim, uma senha gerada recebe no Analisador o mesmo nível do Gerador, com tolerância de um nível.
* **Tempo para quebrar:** o mesmo cenário do Gerador, 10¹⁰ tentativas por segundo.
* **Pontos fortes e fracos:** comprimento, variedade de caracteres, cada padrão encontrado e as combinações previsíveis. Trechos de 3 caracteres só contam em senhas abaixo de 80 pontos, para não apontar coincidências em senhas aleatórias.
* **Recomendações:** até 4, em ordem da nota que a senha teria ("E se…"). A simulação troca o trecho por caracteres aleatórios ou acrescenta caracteres no fim, e só mostra o que sobe a nota em pelo menos 3 pontos.
* **Senha oculta:** com a senha oculta, o mapa mostra pontos e os títulos não citam trechos dela.
* **Limite:** analisa os primeiros 128 caracteres.
* **Limpeza:** a senha some ao sair da página, no botão Limpar e depois de 2 minutos sem uso.
* **Leitor de tela:** anuncia só a nota e o nível, nunca a senha.

## Decisões da fase 5 (impressão)

Pedido em 29 de outubro de 2026: organizar contas e credenciais numa página e gerar um PDF A4 pronto para
imprimir.

| # | Tema | Decisão |
|---|---|---|
| I1 | Onde fica | Item "Imprimir" no menu lateral e na barra de abas (quarta aba no celular), rota `/imprimir`. |
| I2 | Onde os dados vivem | Só na memória da aba, num provedor do app: continuam ao trocar de tela e somem ao recarregar ou fechar. Com dados na folha, o navegador avisa antes de recarregar ou fechar. |
| I3 | Limpeza | Sem limpeza por inatividade. Botão "Apagar tudo" com confirmação. |
| I4 | Conta nova | Começa com um campo vazio. Atalhos E-mail, Usuário, Senha, Código de recuperação e Observação, e sugestões de nome enquanto a pessoa digita. Nenhum campo é obrigatório. |
| I5 | Layout do PDF | A4 em duas colunas de cartões, preenchidas como um jornal. Cada conta fica inteira numa coluna; a que não cabe se divide com o título repetido e "Continuação". |
| I6 | Valores no PDF | Geist Mono, com números e símbolos coloridos como no visor e o zero cortado. |
| I7 | Ocultar | Botão "Ocultar valores" para a tela toda: os valores viram pontos no editor e na prévia. O PDF sai sempre completo. |
| I8 | Senha no PDF | Não. A criptografia disponível no navegador é fraca (RC4) e daria uma segurança falsa; o app avisa que o arquivo não tem proteção. |

## Regras da impressão

* **Campos livres:** cada campo tem nome e valor livres e independentes; contas e campos podem ser adicionados, editados, removidos e reordenados.
* **O que vai para o PDF:** só campos com valor. Uma conta sem nenhum valor fica de fora, e o editor diz por quê. Conta sem título sai como "Sem título"; campo sem nome sai só com o valor.
* **Linhas para preencher à mão:** opção desligada por padrão. Ligada, um campo com nome e sem valor sai como uma linha em branco.
* **Paginação:** uma conta nunca se divide se couber inteira numa coluna; o nome de um campo nunca fica separado do valor; uma conta pode ser dividida para não deixar mais de 40% de uma coluna em branco; a última página distribui as contas entre as duas colunas; se um espaçamento mais justo economizar uma página, ele é usado. A fonte nunca diminui para caber.
* **Valores longos:** quebram em espaços quando há; senhas e códigos sem espaço quebram em qualquer caractere. Quando a quebra cai num espaço, um ponto (`·`) marca o espaço no fim da linha. Um valor maior que uma coluna se divide repetindo o nome do campo com "(continuação)".
* **Documento:** na primeira página, uma faixa verde-clara com a assinatura do Aegis à esquerda (logo, nome e slogan) e o título escolhido (padrão "Minhas credenciais") e a data à direita; nas demais, uma faixa compacta com a assinatura compacta (logo e nome) à esquerda e o título à direita. Cada conta é um cartão com faixa de título (inicial da conta num círculo e nome) e cada valor numa caixa clara. Enfeites: cada conta tem uma cor de uma paleta de 6 tons, usada no círculo, numa barra na lateral do cartão e nos ícones; cada campo tem um ícone escolhido pelo nome (e-mail, senha, usuário, código, telefone, banco, nota, site ou um neutro); a faixa do cabeçalho tem textura de pontos, que se repete no canto inferior esquerdo de cada página, sumindo em curva e sem passar por baixo dos cartões. Rodapé com uma caixa de legenda em duas linhas ("Caracteres parecidos" e "Cores", cada amostra numa etiqueta e os itens separados por hífen), e abaixo dela um cadeado com o aviso de confidencialidade e "Página X de Y". Margens de 15 mm.
* **Prévia:** desenhada a partir do mesmo cálculo que monta o PDF, enquanto a pessoa digita.
* **Nome do arquivo:** exatamente o título do documento, com acentos, espaços e maiúsculas, mais `.pdf` (padrão "Minhas credenciais.pdf"). Só saem os caracteres que o sistema não aceita em nome de arquivo (`\ / : * ? " < > |`).
* **Gerador:** o botão Imprimir leva a senha gerada a uma conta nova no fim da folha, pela memória do app. Cada campo vazio tem um botão para gerar uma senha forte (configuração Uso geral).
* **Desfazer:** remover uma conta ou um campo com dados mostra "Desfazer" por 8 segundos.
* **Privacidade:** o PDF é montado no navegador e salvo direto no aparelho; nenhum valor vai para a rede, o console, a URL, o `history.state` ou o armazenamento do navegador. A seção Privacidade de Configurações explica isso.

## Regras

* **Aleatoriedade:** toda geração usa `crypto.getRandomValues`, nunca `Math.random`.
* **Nada sai do aparelho**, exceto a verificação de vazamento quando pedida (fase 4), e nela só o prefixo do hash.
* **Nada é gravado** (as senhas e a folha de impressão vivem só na memória da aba; o PDF só existe quando a pessoa baixa), exceto as preferências de tema (`aegis:tema`) e de menu recolhido (`aegis:menu-recolhido`) e a marca de boas-vindas vista na sessão (`sessionStorage`).
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
| 9 | Botão "Gerar uma senha forte" no resultado da análise | Aprovada, implementada na fase 3 |
| 10 | Simulação "E se…" com a nota que cada recomendação daria | Aprovada, implementada na fase 3 |
| 11 | Apagar a senha do Analisador depois de 2 minutos sem uso | Aprovada, implementada na fase 3 |
| 12 | Exemplos clicáveis de senha fraca no Analisador | Aprovada, implementada na fase 3 |
| 13 | Botão para gerar uma senha forte num campo vazio da folha de impressão | Aprovada, implementada na fase 5 |
| 14 | Botão Imprimir no Gerador, levando a senha para uma conta nova da folha | Aprovada, implementada na fase 5 |
| 15 | Opção de imprimir campos vazios como linha para preencher à mão | Aprovada, implementada na fase 5 |
| 16 | Legenda de caracteres parecidos no rodapé do PDF | Aprovada, implementada na fase 5 |
| 17 | Importar o CSV exportado pelo gerenciador de senhas do navegador | Não aprovada |
| 4 | Funcionar offline / instalável (PWA) | Recusada |
| 5 | Atalhos de teclado (`G` gerar, `C` copiar) | Não aprovada |

## Fases

| Fase | Escopo | Situação |
|---|---|---|
| 1 | Estrutura, layout, identidade visual, tipografia, cores, header e navegação, responsividade, páginas preparadas | Concluída |
| 2 | Gerador: senha, frase-senha e PIN, finalidades, opções, força, copiar com limpeza da área de transferência, histórico da sessão | Concluída |
| 3 | Analisador: nota de 0 a 100, nível, tempo estimado, padrões, pontos fortes e fracos, recomendações com simulação | Concluída |
| 4 | Verificação de vazamento (HIBP), opcional | A fazer |
| 5 | Impressão: folha de credenciais com campos livres, prévia A4 e PDF gerado no navegador | Concluída |
