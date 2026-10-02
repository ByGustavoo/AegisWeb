import { PALAVRAS } from '@/dados/palavras';
import type { AnaliseSenha, Correspondencia, Dicionarios, Observacao, Recomendacao } from '@/modelos/analise';
import type { NivelForca } from '@/modelos/senha';
import { tempoParaQuebrar } from '@/regras/forca';
import { estimar } from './estimativa';

export const TAMANHO_MAXIMO_ANALISE = 128;
export const TAMANHO_RECOMENDADO = 16;
const TAMANHO_BOM = 12;
const TAMANHO_MINIMO = 8;
const TAMANHO_FRASE_LONGA = 20;
const PALAVRAS_FRASE_FORTE = 5;
const POSICAO_TOPO_SENHAS = 100;
const GANHO_MINIMO_RECOMENDACAO = 3;
const MAXIMO_RECOMENDACOES = 4;
const MAXIMO_TROCAS_SUGERIDAS = 3;
const NOTA_PARA_SUGERIR_FRASE = 60;

const PONTOS_NOTA: readonly [number, number][] = [
  [0, 0],
  [28, 20],
  [40, 40],
  [60, 60],
  [80, 80],
  [120, 100],
];

type Classe = 'minusculas' | 'maiusculas' | 'numeros' | 'simbolos';

const CLASSES: { classe: Classe; teste: RegExp; nome: string; preenchimento: string }[] = [
  { classe: 'minusculas', teste: /^\p{Ll}$/u, nome: 'letras minúsculas', preenchimento: 'xnztcvgmskzcxgmbszcnvpbjrfqdpzjx' },
  { classe: 'maiusculas', teste: /^\p{Lu}$/u, nome: 'letras maiúsculas', preenchimento: 'GVBMFNDZPJTMGRKBWNXFVHRJWBTCSZJX' },
  { classe: 'numeros', teste: /^\p{Nd}$/u, nome: 'números', preenchimento: '74958372847293825937493725847392' },
  { classe: 'simbolos', teste: /^[^\p{L}\p{Nd}\s]$/u, nome: 'símbolos', preenchimento: '=!&#+?&!=*#+&!?+#*!&=#*?&+%*?!+#' },
];

const TAMANHO_PADRAO_CURTO = 3;
const NOTA_MUITO_FORTE = 80;

const PADROES_FRACOS = new Set<Correspondencia['tipo']>([
  'SENHA_COMUM',
  'PALAVRA',
  'NOME',
  'SEQUENCIA',
  'TECLADO',
  'REPETICAO',
  'DATA',
  'ANO',
]);

function padraoRelevante(item: Correspondencia, nota: number): boolean {
  if (!PADROES_FRACOS.has(item.tipo)) return false;
  return item.fim - item.inicio + 1 > TAMANHO_PADRAO_CURTO || nota < NOTA_MUITO_FORTE;
}

export function notaPorEntropia(bits: number): number {
  if (bits <= 0) return 0;
  for (let i = 1; i < PONTOS_NOTA.length; i += 1) {
    const [bitsAnterior, notaAnterior] = PONTOS_NOTA[i - 1] ?? [0, 0];
    const [bitsAtual, notaAtual] = PONTOS_NOTA[i] ?? [0, 0];
    if (bits < bitsAtual) {
      return Math.floor(notaAnterior + ((bits - bitsAnterior) / (bitsAtual - bitsAnterior)) * (notaAtual - notaAnterior));
    }
  }
  return 100;
}

export function nivelPorNota(nota: number): NivelForca {
  return Math.min(5, Math.floor(nota / 20) + 1) as NivelForca;
}

function classesPresentes(caracteres: readonly string[]): Classe[] {
  return CLASSES.filter(({ teste }) => caracteres.some((caractere) => teste.test(caractere))).map(({ classe }) => classe);
}

function nomeDaClasse(classe: Classe): string {
  return CLASSES.find((item) => item.classe === classe)?.nome ?? classe;
}

function listarNomes(nomes: string[]): string {
  if (nomes.length <= 1) return nomes.join('');
  return `${nomes.slice(0, -1).join(', ')} e ${nomes[nomes.length - 1]}`;
}

export function preencher(tamanho: number, classes: readonly Classe[], deslocamento = 0): string {
  const usadas = classes.length > 0 ? classes : (['minusculas'] as Classe[]);
  const contadores = new Map<Classe, number>();
  let resultado = '';
  for (let i = 0; i < tamanho; i += 1) {
    const classe = usadas[(i + deslocamento) % usadas.length] ?? 'minusculas';
    const fonte = CLASSES.find((item) => item.classe === classe)?.preenchimento ?? '';
    const posicao = contadores.get(classe) ?? 0;
    resultado += fonte[(posicao + deslocamento) % fonte.length] ?? '';
    contadores.set(classe, posicao + 1);
  }
  return resultado;
}

const TAMANHO_MAXIMO_CITACAO = 16;

function aspas(texto: string): string {
  const caracteres = Array.from(texto);
  const curto = caracteres.length > TAMANHO_MAXIMO_CITACAO ? `${caracteres.slice(0, TAMANHO_MAXIMO_CITACAO - 1).join('')}…` : texto;
  return `“${curto}”`;
}

type ObservacaoDePadrao = Omit<Observacao, 'id' | 'tom'>;

function observacaoDoPadrao(correspondencia: Correspondencia, total: number): ObservacaoDePadrao | null {
  const { tipo, trecho, palavra = '', posicao = 0, inicio, fim } = correspondencia;
  const inteira = inicio === 0 && fim === total - 1;
  const montar = (titulo: string, tituloOculto: string, detalhe: string): ObservacaoDePadrao => ({
    titulo,
    tituloOculto,
    detalhe,
    trecho: { inicio, fim },
  });

  if (correspondencia.trocada && palavra) {
    return montar(
      `${aspas(trecho)} é ${aspas(palavra)} com letras trocadas`,
      'Uma palavra comum com letras trocadas',
      'Trocar letras por números ou símbolos (a → @, e → 3) não engana: os ataques testam essas trocas.',
    );
  }
  if (correspondencia.invertida && palavra) {
    return montar(
      `${aspas(trecho)} é ${aspas([...palavra].reverse().join(''))} de trás para frente`,
      'Uma palavra comum de trás para frente',
      'Palavras invertidas também estão entre os primeiros palpites.',
    );
  }

  switch (tipo) {
    case 'SENHA_COMUM': {
      if (inteira) {
        const titulo = posicao <= POSICAO_TOPO_SENHAS ? 'Está entre as 100 senhas mais usadas' : 'Está entre as senhas mais usadas';
        return montar(titulo, titulo, 'Listas de senhas vazadas são a primeira coisa que um ataque testa.');
      }
      const numerica = /^\p{Nd}+$/u.test(trecho);
      return montar(
        numerica ? `${aspas(trecho)} é um número muito usado em senhas` : `${aspas(trecho)} é uma senha muito usada`,
        numerica ? 'Um número muito usado em senhas' : 'Uma senha muito usada',
        'Os ataques combinam senhas vazadas com outros pedaços, como números e símbolos.',
      );
    }
    case 'PALAVRA':
      return montar(
        `${aspas(trecho)} é uma palavra comum`,
        'Uma palavra comum',
        'Palavras de dicionário são testadas antes de qualquer combinação aleatória.',
      );
    case 'NOME':
      return montar(
        `${aspas(trecho)} é um nome comum`,
        'Um nome comum',
        'Nomes de pessoas, inclusive de quem você conhece, estão nas listas de ataque.',
      );
    case 'SEQUENCIA':
      return montar(
        `${aspas(trecho)} é uma sequência`,
        'Uma sequência, como abc ou 123',
        'Sequências como abc e 123 estão entre os primeiros palpites.',
      );
    case 'TECLADO':
      return montar(
        `${aspas(trecho)} segue teclas vizinhas`,
        'Teclas vizinhas, como qwerty',
        'Padrões de teclado, como qwerty e asdf, são tão previsíveis quanto palavras.',
      );
    case 'REPETICAO':
      return montar(
        [...(correspondencia.base ?? '')].length === 1
          ? `${aspas(trecho)} repete o mesmo caractere`
          : `${aspas(trecho)} repete ${aspas(correspondencia.base ?? '')}`,
        'Uma repetição',
        'Repetir caracteres ou trechos quase não aumenta a dificuldade.',
      );
    case 'DATA':
      return montar(
        `${aspas(trecho)} parece uma data`,
        'Uma data',
        'Aniversários e datas especiais são fáceis de adivinhar ou de achar nas redes sociais.',
      );
    case 'ANO':
      return montar(
        `${aspas(trecho)} parece um ano`,
        'Um ano',
        'Anos recentes e de nascimento estão entre os finais mais testados.',
      );
    default:
      return null;
  }
}

function observarComprimento(tamanho: number): Observacao {
  if (tamanho < TAMANHO_MINIMO) {
    return {
      id: 'comprimento',
      tom: 'FRACO',
      titulo: `Muito curta: ${tamanho} ${tamanho === 1 ? 'caractere' : 'caracteres'}`,
      detalhe: 'Com menos de 8 caracteres, qualquer combinação cai em pouco tempo.',
    };
  }
  if (tamanho < TAMANHO_BOM) {
    return {
      id: 'comprimento',
      tom: 'FRACO',
      titulo: `Curta: ${tamanho} caracteres`,
      detalhe: 'Use pelo menos 12. Para e-mail e banco, 16 ou mais.',
    };
  }
  if (tamanho < TAMANHO_RECOMENDADO) {
    return {
      id: 'comprimento',
      tom: 'FORTE',
      titulo: `Bom comprimento: ${tamanho} caracteres`,
      detalhe: 'Acima do mínimo recomendado. Com 16 ou mais, fica ainda melhor.',
    };
  }
  return {
    id: 'comprimento',
    tom: 'FORTE',
    titulo: `Comprimento longo: ${tamanho} caracteres`,
    detalhe: 'Cada caractere a mais multiplica o trabalho de um ataque.',
  };
}

function observarVariedade(classes: Classe[], dispensaVariedade: boolean): Observacao | null {
  if (classes.length >= 3) {
    return {
      id: 'variedade',
      tom: 'FORTE',
      titulo: classes.length === 4 ? 'Usa os 4 tipos de caractere' : 'Mistura 3 tipos de caractere',
      detalhe: `${listarNomes(classes.map(nomeDaClasse))}.`.replace(/^./, (letra) => letra.toUpperCase()),
    };
  }
  if (dispensaVariedade) return null;
  const soLetras = classes.includes('minusculas') && classes.includes('maiusculas');
  const nomes = soLetras
    ? ['letras', ...classes.filter((classe) => classe !== 'minusculas' && classe !== 'maiusculas').map(nomeDaClasse)]
    : classes.map(nomeDaClasse);
  return {
    id: 'variedade',
    tom: 'FRACO',
    titulo: `Só ${listarNomes(nomes)}`,
    detalhe: 'Cada tipo de caractere a mais aumenta as combinações que um ataque precisa testar.',
  };
}

function observarCombinacoes(caracteres: readonly string[], sequencia: Correspondencia[]): Observacao[] {
  const observacoes: Observacao[] = [];
  const texto = caracteres.join('');

  const formato = /^\p{L}{3,}\p{Nd}+([^\p{L}\p{Nd}]{0,2})$/u.exec(texto);
  if (formato && caracteres.length < TAMANHO_FRASE_LONGA) {
    observacoes.push({
      id: 'formato-previsivel',
      tom: 'FRACO',
      titulo: formato[1] ? 'Formato Palavra + números + símbolo' : 'Formato Palavra + números',
      detalhe: 'É o formato mais comum que existe, e os ataques testam palavras com finais assim primeiro.',
    });
  }

  const maiusculas = caracteres.filter((caractere) => /^\p{Lu}$/u.test(caractere)).length;
  const minusculas = caracteres.filter((caractere) => /^\p{Ll}$/u.test(caractere)).length;
  if (maiusculas === 1 && minusculas > 0 && /^\p{Lu}$/u.test(caracteres[0] ?? '') && sequencia.some((item) => PADROES_FRACOS.has(item.tipo))) {
    observacoes.push({
      id: 'maiuscula-inicial',
      tom: 'FRACO',
      titulo: 'Maiúscula só no começo',
      detalhe: 'É o primeiro jeito que um ataque tenta. Espalhe as maiúsculas pela senha.',
    });
  }

  return observacoes;
}

export function notaDe(senha: string, dicionarios: Dicionarios, anoReferencia: number): number {
  const caracteres = Array.from(senha).slice(0, TAMANHO_MAXIMO_ANALISE);
  return notaPorEntropia(Math.log2(estimar(caracteres.join(''), dicionarios, anoReferencia).tentativas));
}

let notaFraseExemplo: number | null = null;

function fraseExemplo(): string {
  const indices = [37, 211, 403, 589, 766, 941];
  const palavras = indices.map((indice) => PALAVRAS[indice % PALAVRAS.length] ?? 'senha');
  return `${palavras.map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1)).join('-')}-42`;
}

function recomendar(
  caracteres: readonly string[],
  nota: number,
  sequencia: Correspondencia[],
  dicionarios: Dicionarios,
  anoReferencia: number,
): Recomendacao[] {
  const candidatas: Recomendacao[] = [];
  const classes = classesPresentes(caracteres);
  const simular = (texto: string) => notaDe(texto, dicionarios, anoReferencia);

  sequencia
    .filter((item) => padraoRelevante(item, nota))
    .slice(0, MAXIMO_TROCAS_SUGERIDAS)
    .forEach((item, ordem) => {
      const tamanho = item.fim - item.inicio + 1;
      const novo = [
        ...caracteres.slice(0, item.inicio),
        ...preencher(tamanho, classes, ordem),
        ...caracteres.slice(item.fim + 1),
      ].join('');
      const titulos: Partial<Record<Correspondencia['tipo'], [string, string]>> = {
        SEQUENCIA: [`Quebre a sequência ${aspas(item.trecho)}`, 'Quebre a sequência'],
        TECLADO: [`Quebre o padrão ${aspas(item.trecho)}`, 'Quebre o padrão de teclado'],
        REPETICAO: [`Evite repetir ${aspas(item.base ?? item.trecho)}`, 'Evite a repetição'],
        DATA: [`Tire a data ${aspas(item.trecho)}`, 'Tire a data'],
        ANO: [`Tire o ano ${aspas(item.trecho)}`, 'Tire o ano'],
        NOME: [`Troque ${aspas(item.trecho)}`, 'Troque o nome'],
      };
      const [titulo, tituloOculto] = titulos[item.tipo] ?? [`Troque ${aspas(item.trecho)}`, 'Troque a palavra previsível'];
      candidatas.push({
        id: `trocar-${item.inicio}`,
        titulo,
        tituloOculto,
        detalhe: 'Use caracteres aleatórios no lugar, sem ligação com você.',
        notaSimulada: simular(novo),
      });
    });

  if (caracteres.length < TAMANHO_RECOMENDADO) {
    const faltam = TAMANHO_RECOMENDADO - caracteres.length;
    candidatas.push({
      id: 'aumentar',
      titulo: `Aumente para ${TAMANHO_RECOMENDADO} caracteres`,
      detalhe: `Acrescente ${faltam} ${faltam === 1 ? 'caractere aleatório' : 'caracteres aleatórios'}, de preferência no meio.`,
      notaSimulada: simular(caracteres.join('') + preencher(faltam, classes, 1)),
    });
  }

  const faltantes = CLASSES.map(({ classe }) => classe).filter((classe) => !classes.includes(classe));
  if (faltantes.length > 0 && caracteres.length < TAMANHO_FRASE_LONGA) {
    const novo = caracteres.join('') + preencher(faltantes.length, faltantes, 2);
    candidatas.push({
      id: 'incluir-tipos',
      titulo: `Inclua ${listarNomes(faltantes.map(nomeDaClasse))}`,
      detalhe: 'Espalhe pelo meio da senha, não só no começo ou no fim.',
      notaSimulada: simular(novo),
    });
  }

  if (nota < NOTA_PARA_SUGERIR_FRASE) {
    notaFraseExemplo ??= simular(fraseExemplo());
    candidatas.push({
      id: 'frase-senha',
      titulo: 'Use uma frase-senha',
      detalhe: 'Seis palavras sorteadas são fáceis de lembrar e difíceis de adivinhar. O gerador cria uma para você.',
      notaSimulada: notaFraseExemplo,
    });
  }

  return candidatas
    .filter((candidata) => candidata.notaSimulada - nota >= GANHO_MINIMO_RECOMENDACAO)
    .sort((a, b) => b.notaSimulada - a.notaSimulada)
    .slice(0, MAXIMO_RECOMENDACOES);
}

export function analisarSenha(senha: string, dicionarios: Dicionarios, anoReferencia: number): AnaliseSenha | null {
  const todos = Array.from(senha);
  if (todos.length === 0) return null;

  const caracteres = todos.slice(0, TAMANHO_MAXIMO_ANALISE);
  const { tentativas, sequencia } = estimar(caracteres.join(''), dicionarios, anoReferencia);
  const entropiaBits = Math.log2(tentativas);
  const nota = notaPorEntropia(entropiaBits);
  const classes = classesPresentes(caracteres);
  const frase = sequencia.find((item) => item.tipo === 'FRASE');
  const fraseLonga = (frase?.quantidadePalavras ?? 0) >= PALAVRAS_FRASE_FORTE;

  const pontosFracos: Observacao[] = [];
  const pontosFortes: Observacao[] = [];
  const titulos = new Set<string>();

  for (const item of sequencia) {
    if (!padraoRelevante(item, nota)) continue;
    const observacao = observacaoDoPadrao(item, caracteres.length);
    if (!observacao || titulos.has(observacao.titulo)) continue;
    titulos.add(observacao.titulo);
    pontosFracos.push({ id: `padrao-${item.inicio}-${item.fim}`, tom: 'FRACO', ...observacao });
  }

  if (frase) {
    const palavras = frase.quantidadePalavras ?? 0;
    (fraseLonga ? pontosFortes : pontosFracos).push({
      id: 'frase',
      tom: fraseLonga ? 'FORTE' : 'FRACO',
      titulo: fraseLonga ? `Frase-senha com ${palavras} palavras` : `Frase com só ${palavras} palavras`,
      detalhe: fraseLonga
        ? 'Várias palavras sem relação entre si resistem bem, desde que tenham sido sorteadas.'
        : 'Com poucas palavras, a frase fica fácil de adivinhar. Use 6 ou mais.',
      ...(fraseLonga ? {} : { trecho: { inicio: frase.inicio, fim: frase.fim } }),
    });
  }

  pontosFracos.push(...observarCombinacoes(caracteres, sequencia));

  const comprimento = observarComprimento(caracteres.length);
  (comprimento.tom === 'FORTE' ? pontosFortes : pontosFracos).unshift(comprimento);

  const variedade = observarVariedade(classes, fraseLonga || caracteres.length >= TAMANHO_FRASE_LONGA || nota >= NOTA_MUITO_FORTE);
  if (variedade) (variedade.tom === 'FORTE' ? pontosFortes : pontosFracos).push(variedade);

  const temPadrao = sequencia.some((item) => padraoRelevante(item, nota));
  if (!temPadrao && !frase && caracteres.length >= TAMANHO_MINIMO) {
    pontosFortes.push({
      id: 'sem-padroes',
      tom: 'FORTE',
      titulo: 'Nenhum padrão previsível',
      detalhe: 'Não achamos palavras comuns, nomes, sequências, datas nem repetições.',
    });
  }

  const comum = sequencia.some((item) => item.tipo === 'SENHA_COMUM');
  if (!comum && caracteres.length >= TAMANHO_MINIMO && temPadrao) {
    pontosFortes.push({
      id: 'nao-comum',
      tom: 'FORTE',
      titulo: 'Não está entre as senhas mais usadas',
      detalhe: 'Ela não aparece na lista de senhas vazadas que usamos na análise.',
    });
  }

  return {
    nota,
    nivel: nivelPorNota(nota),
    entropiaBits,
    tempoEstimadoQuebra: tempoParaQuebrar(entropiaBits),
    tamanho: todos.length,
    truncada: todos.length > TAMANHO_MAXIMO_ANALISE,
    sequencia,
    pontosFortes,
    pontosFracos,
    recomendacoes: recomendar(caracteres, nota, sequencia, dicionarios, anoReferencia),
  };
}
