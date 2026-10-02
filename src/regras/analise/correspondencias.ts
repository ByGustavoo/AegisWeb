import type { Correspondencia, Dicionarios, OrigemDicionario, TipoPadrao, UsoMaiusculas } from '@/modelos/analise';
import { combinacoes, somaCombinacoes } from './matematica';
import { TECLADOS } from './teclados';
import type { Teclado } from './teclados';

export interface ContextoAnalise {
  dicionarios: Dicionarios;
  anoReferencia: number;
  estimarBase: (texto: string) => number;
}

const TAMANHO_MINIMO_PALAVRA = 4;
const TAMANHO_MINIMO_PALAVRA_ISOLADA = 2;
const TAMANHO_MAXIMO_PALAVRA = 32;
const TAMANHO_MAXIMO_TROCA = 16;
const LIMITE_VARIANTES_TROCA = 64;
const DELTA_MAXIMO_SEQUENCIA = 5;
const TAMANHO_MINIMO_SEQUENCIA = 3;
const TAMANHO_MINIMO_TECLADO = 3;
const TAMANHO_MINIMO_REPETICAO = 3;
const ESPACO_MINIMO_ANOS = 20;
const DIAS_NO_ANO = 365;
const ANO_MINIMO_DATA = 1000;
const ANO_MAXIMO_DATA = 2050;
const ANO_MINIMO_RECENTE = 1900;
const ANOS_A_FRENTE = 20;
const PALAVRAS_MINIMAS_FRASE = 3;
const SEPARADORES_POSSIVEIS = 10;
const SIMBOLOS_POSSIVEIS = 33;
const TAMANHO_MAXIMO_FINAL_FRASE = 4;

const ORDEM_DICIONARIOS: OrigemDicionario[] = [
  'SENHAS_COMUNS',
  'PALAVRAS_AEGIS',
  'PALAVRAS_PORTUGUES',
  'PALAVRAS_INGLES',
  'NOMES',
];

const TROCAS: Readonly<Record<string, readonly string[]>> = {
  '4': ['a'],
  '@': ['a'],
  '8': ['b'],
  '(': ['c'],
  '{': ['c'],
  '[': ['c'],
  '<': ['c'],
  '3': ['e'],
  '6': ['g'],
  '9': ['g'],
  '1': ['i', 'l'],
  '!': ['i'],
  '|': ['i', 'l'],
  '7': ['l', 't'],
  '0': ['o'],
  $: ['s'],
  '5': ['s'],
  '+': ['t'],
  '%': ['x'],
  '2': ['z'],
};

const INICIOS_OBVIOS = new Set(['a', 'A', 'z', 'Z', '0', '1', '9']);

const SPLITS_DATA: Readonly<Record<number, readonly [number, number][]>> = {
  4: [
    [1, 2],
    [2, 3],
  ],
  5: [
    [1, 3],
    [2, 3],
  ],
  6: [
    [1, 2],
    [2, 4],
    [4, 5],
  ],
  7: [
    [1, 3],
    [2, 3],
    [4, 5],
    [4, 6],
  ],
  8: [
    [2, 4],
    [4, 6],
  ],
};

export function normalizarCaractere(caractere: string): string {
  const semAcento = caractere.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
  return semAcento.length === 1 ? semAcento : caractere.toLowerCase();
}

function ehMaiuscula(caractere: string): boolean {
  return caractere !== caractere.toLowerCase() && caractere === caractere.toUpperCase();
}

function ehMinuscula(caractere: string): boolean {
  return caractere !== caractere.toUpperCase() && caractere === caractere.toLowerCase();
}

function ehLetra(caractere: string | undefined): boolean {
  return caractere !== undefined && /^\p{L}$/u.test(caractere);
}

function palavraIsolada(caracteres: readonly string[], inicio: number, fim: number): boolean {
  for (let i = inicio; i <= fim; i += 1) {
    if (!ehLetra(caracteres[i])) return false;
  }
  const antes = caracteres[inicio - 1];
  const depois = caracteres[fim + 1];
  const primeiro = caracteres[inicio] ?? '';
  const ultimo = caracteres[fim] ?? '';
  const limiteAntes = !ehLetra(antes) || (ehMinuscula(antes ?? '') && ehMaiuscula(primeiro));
  const limiteDepois = !ehLetra(depois) || (ehMinuscula(ultimo) && ehMaiuscula(depois ?? ''));
  return limiteAntes && limiteDepois;
}

export function usoMaiusculas(caracteres: readonly string[]): UsoMaiusculas {
  const maiusculas = caracteres.filter(ehMaiuscula).length;
  const minusculas = caracteres.filter(ehMinuscula).length;
  if (maiusculas === 0) return 'NENHUMA';
  if (minusculas === 0) return 'TODAS';
  const primeira = caracteres[0] ?? '';
  const ultima = caracteres[caracteres.length - 1] ?? '';
  if (maiusculas === 1 && ehMaiuscula(primeira)) return 'PRIMEIRA';
  if (maiusculas === 1 && ehMaiuscula(ultima)) return 'ULTIMA';
  return 'MISTA';
}

function variacoesMaiusculas(caracteres: readonly string[]): number {
  const uso = usoMaiusculas(caracteres);
  if (uso === 'NENHUMA') return 1;
  if (uso !== 'MISTA') return 2;
  const maiusculas = caracteres.filter(ehMaiuscula).length;
  const minusculas = caracteres.filter(ehMinuscula).length;
  return somaCombinacoes(maiusculas + minusculas, Math.min(maiusculas, minusculas));
}

function variacoesTroca(trecho: readonly string[], trocas: ReadonlyMap<string, string>): number {
  let variacoes = 1;
  trocas.forEach((letra, simbolo) => {
    const trocados = trecho.filter((caractere) => caractere === simbolo).length;
    const originais = trecho.filter((caractere) => normalizarCaractere(caractere) === letra).length;
    variacoes *= trocados === 0 || originais === 0 ? 2 : somaCombinacoes(trocados + originais, Math.min(trocados, originais));
  });
  return variacoes;
}

function tipoPorOrigem(origem: OrigemDicionario): TipoPadrao {
  if (origem === 'SENHAS_COMUNS') return 'SENHA_COMUM';
  if (origem === 'NOMES') return 'NOME';
  return 'PALAVRA';
}

function procurarNosDicionarios(
  texto: string,
  dicionarios: Dicionarios,
  somentePalavras: boolean,
): { origem: OrigemDicionario; posicao: number } | null {
  let melhor: { origem: OrigemDicionario; posicao: number } | null = null;
  for (const origem of ORDEM_DICIONARIOS) {
    if (somentePalavras && origem === 'SENHAS_COMUNS') continue;
    const posicao = dicionarios[origem].get(texto);
    if (posicao !== undefined && (!melhor || posicao < melhor.posicao)) melhor = { origem, posicao };
  }
  return melhor;
}

function variantesComTroca(normalizados: readonly string[]): { texto: string; trocas: Map<string, string> }[] {
  if (normalizados.some((caractere) => !TROCAS[caractere] && !/^[a-z]$/.test(caractere))) return [];
  const simbolos = [...new Set(normalizados.filter((caractere) => TROCAS[caractere]))];
  if (simbolos.length === 0) return [];

  let mapas: Map<string, string>[] = [new Map()];
  for (const simbolo of simbolos) {
    const proximos: Map<string, string>[] = [];
    for (const mapa of mapas) {
      for (const letra of TROCAS[simbolo] ?? []) proximos.push(new Map(mapa).set(simbolo, letra));
    }
    if (proximos.length > LIMITE_VARIANTES_TROCA) return [];
    mapas = proximos;
  }

  return mapas.map((trocas) => ({ texto: normalizados.map((caractere) => trocas.get(caractere) ?? caractere).join(''), trocas }));
}

function correspondenciasDeDicionario(caracteres: readonly string[], dicionarios: Dicionarios): Correspondencia[] {
  const total = caracteres.length;
  const normalizados = caracteres.map(normalizarCaractere);
  const encontradas: Correspondencia[] = [];

  for (let inicio = 0; inicio < total; inicio += 1) {
    const fimMaximo = Math.min(total - 1, inicio + TAMANHO_MAXIMO_PALAVRA - 1);
    for (let fim = inicio + TAMANHO_MINIMO_PALAVRA_ISOLADA - 1; fim <= fimMaximo; fim += 1) {
      const tamanho = fim - inicio + 1;
      const senhaInteira = inicio === 0 && fim === total - 1;
      if (tamanho < TAMANHO_MINIMO_PALAVRA && !senhaInteira && !palavraIsolada(caracteres, inicio, fim)) continue;

      const trecho = caracteres.slice(inicio, fim + 1);
      const normalizado = normalizados.slice(inicio, fim + 1);
      const texto = normalizado.join('');
      const maiusculas = variacoesMaiusculas(trecho);
      let melhor: Correspondencia | null = null;

      const considerar = (candidata: Correspondencia) => {
        if (!melhor || candidata.tentativas < melhor.tentativas) melhor = candidata;
      };

      const direta = procurarNosDicionarios(texto, dicionarios, false);
      if (direta) {
        considerar({
          tipo: tipoPorOrigem(direta.origem),
          inicio,
          fim,
          trecho: trecho.join(''),
          tentativas: direta.posicao * maiusculas,
          palavra: texto,
          posicao: direta.posicao,
          origem: direta.origem,
          maiusculas: usoMaiusculas(trecho),
        });
      }

      const invertido = [...normalizado].reverse().join('');
      if (tamanho >= TAMANHO_MINIMO_PALAVRA && invertido !== texto) {
        const reversa = procurarNosDicionarios(invertido, dicionarios, false);
        if (reversa) {
          considerar({
            tipo: tipoPorOrigem(reversa.origem),
            inicio,
            fim,
            trecho: trecho.join(''),
            tentativas: reversa.posicao * maiusculas * 2,
            palavra: invertido,
            posicao: reversa.posicao,
            origem: reversa.origem,
            invertida: true,
            maiusculas: usoMaiusculas(trecho),
          });
        }
      }

      if (tamanho >= TAMANHO_MINIMO_PALAVRA && tamanho <= TAMANHO_MAXIMO_TROCA) {
        for (const variante of variantesComTroca(normalizado)) {
          const trocada = procurarNosDicionarios(variante.texto, dicionarios, true);
          if (!trocada) continue;
          considerar({
            tipo: tipoPorOrigem(trocada.origem),
            inicio,
            fim,
            trecho: trecho.join(''),
            tentativas: trocada.posicao * maiusculas * variacoesTroca(normalizado, variante.trocas),
            palavra: variante.texto,
            posicao: trocada.posicao,
            origem: trocada.origem,
            trocada: true,
            maiusculas: usoMaiusculas(trecho),
          });
        }
      }

      if (melhor) encontradas.push(melhor);
    }
  }

  return encontradas;
}

function classeSequencia(caractere: string): 'MINUSCULA' | 'MAIUSCULA' | 'DIGITO' | null {
  if (/^[a-z]$/.test(caractere)) return 'MINUSCULA';
  if (/^[A-Z]$/.test(caractere)) return 'MAIUSCULA';
  if (/^[0-9]$/.test(caractere)) return 'DIGITO';
  return null;
}

function tentativasSequencia(trecho: readonly string[], crescente: boolean): number {
  const primeiro = trecho[0] ?? '';
  let base = 26;
  if (INICIOS_OBVIOS.has(primeiro)) base = 4;
  else if (/^[0-9]$/.test(primeiro)) base = 10;
  return base * (crescente ? 1 : 2) * trecho.length;
}

function correspondenciasDeSequencia(caracteres: readonly string[]): Correspondencia[] {
  const encontradas: Correspondencia[] = [];
  const codigo = (posicao: number) => (caracteres[posicao] ?? '').codePointAt(0) ?? 0;
  let inicio = 0;

  while (inicio < caracteres.length - 1) {
    const classe = classeSequencia(caracteres[inicio] ?? '');
    const delta = codigo(inicio + 1) - codigo(inicio);
    const valida =
      classe !== null &&
      classeSequencia(caracteres[inicio + 1] ?? '') === classe &&
      delta !== 0 &&
      Math.abs(delta) <= DELTA_MAXIMO_SEQUENCIA;

    if (!valida) {
      inicio += 1;
      continue;
    }

    let fim = inicio + 1;
    while (
      fim + 1 < caracteres.length &&
      classeSequencia(caracteres[fim + 1] ?? '') === classe &&
      codigo(fim + 1) - codigo(fim) === delta
    ) {
      fim += 1;
    }

    if (fim - inicio + 1 >= TAMANHO_MINIMO_SEQUENCIA) {
      const trecho = caracteres.slice(inicio, fim + 1);
      encontradas.push({
        tipo: 'SEQUENCIA',
        inicio,
        fim,
        trecho: trecho.join(''),
        tentativas: tentativasSequencia(trecho, delta > 0),
      });
    }
    inicio = fim;
  }

  return encontradas;
}

function tentativasTeclado(teclado: Teclado, tamanho: number, voltas: number, alteradas: number): number {
  let tentativas = 0;
  for (let i = 2; i <= tamanho; i += 1) {
    const voltasPossiveis = Math.min(voltas, i - 1);
    for (let j = 1; j <= voltasPossiveis; j += 1) {
      tentativas += combinacoes(i - 1, j - 1) * teclado.posicoesIniciais * Math.pow(teclado.grauMedio, j);
    }
  }
  const normais = tamanho - alteradas;
  if (alteradas > 0) {
    tentativas *= normais === 0 ? 2 : somaCombinacoes(alteradas + normais, Math.min(alteradas, normais));
  }
  return tentativas;
}

function correspondenciasDeTeclado(caracteres: readonly string[]): Correspondencia[] {
  const encontradas: Correspondencia[] = [];

  for (const teclado of TECLADOS) {
    let inicio = 0;
    while (inicio < caracteres.length) {
      const primeira = teclado.teclas.get(caracteres[inicio] ?? '');
      if (!primeira) {
        inicio += 1;
        continue;
      }
      let fim = inicio;
      let voltas = 0;
      let ultimaDirecao: string | null = null;
      let alteradas = primeira.alterada ? 1 : 0;

      while (fim + 1 < caracteres.length) {
        const atual = teclado.teclas.get(caracteres[fim] ?? '');
        const proxima = teclado.teclas.get(caracteres[fim + 1] ?? '');
        if (!atual || !proxima) break;
        const direcao = teclado.direcao(atual, proxima);
        if (!direcao) break;
        if (direcao !== ultimaDirecao) {
          voltas += 1;
          ultimaDirecao = direcao;
        }
        if (proxima.alterada) alteradas += 1;
        fim += 1;
      }

      const tamanho = fim - inicio + 1;
      if (tamanho >= TAMANHO_MINIMO_TECLADO) {
        encontradas.push({
          tipo: 'TECLADO',
          inicio,
          fim,
          trecho: caracteres.slice(inicio, fim + 1).join(''),
          tentativas: tentativasTeclado(teclado, tamanho, voltas, alteradas),
        });
        inicio = fim;
      } else {
        inicio += 1;
      }
    }
  }

  return encontradas;
}

function iguais(caracteres: readonly string[], a: number, b: number, tamanho: number): boolean {
  for (let i = 0; i < tamanho; i += 1) {
    if (caracteres[a + i] !== caracteres[b + i]) return false;
  }
  return true;
}

function correspondenciasDeRepeticao(caracteres: readonly string[], contexto: ContextoAnalise): Correspondencia[] {
  const encontradas: Correspondencia[] = [];
  let inicio = 0;

  while (inicio < caracteres.length) {
    let melhor: { periodo: number; repeticoes: number } | null = null;
    for (let periodo = 1; inicio + periodo * 2 <= caracteres.length; periodo += 1) {
      let repeticoes = 1;
      while (
        inicio + periodo * (repeticoes + 1) <= caracteres.length &&
        iguais(caracteres, inicio, inicio + periodo * repeticoes, periodo)
      ) {
        repeticoes += 1;
      }
      if (repeticoes < 2) continue;
      const cobertura = periodo * repeticoes;
      if (!melhor || cobertura > melhor.periodo * melhor.repeticoes) melhor = { periodo, repeticoes };
    }

    if (!melhor || melhor.periodo * melhor.repeticoes < TAMANHO_MINIMO_REPETICAO) {
      inicio += 1;
      continue;
    }

    const fim = inicio + melhor.periodo * melhor.repeticoes - 1;
    const base = caracteres.slice(inicio, inicio + melhor.periodo).join('');
    encontradas.push({
      tipo: 'REPETICAO',
      inicio,
      fim,
      trecho: caracteres.slice(inicio, fim + 1).join(''),
      tentativas: contexto.estimarBase(base) * melhor.repeticoes,
      base,
      repeticoes: melhor.repeticoes,
    });
    inicio = fim + 1;
  }

  return encontradas;
}

function paraAnoCompleto(ano: number): number {
  if (ano > 99) return ano;
  return ano > 50 ? 1900 + ano : 2000 + ano;
}

function diaEMes(a: number, b: number): boolean {
  return (a >= 1 && a <= 31 && b >= 1 && b <= 12) || (b >= 1 && b <= 31 && a >= 1 && a <= 12);
}

function anoDaData(numeros: readonly [number, number, number]): number | null {
  const [primeiro, segundo, terceiro] = numeros;
  let acima31 = 0;
  let acima12 = 0;
  let abaixo1 = 0;
  for (const numero of numeros) {
    if ((numero > 99 && numero < ANO_MINIMO_DATA) || numero > ANO_MAXIMO_DATA) return null;
    if (numero > 31) acima31 += 1;
    if (numero > 12) acima12 += 1;
    if (numero <= 0) abaixo1 += 1;
  }
  if (segundo > 31 || segundo <= 0) return null;
  if (acima31 >= 2 || acima12 === 3 || abaixo1 >= 2) return null;

  const divisoes: [number, number, number][] = [
    [terceiro, primeiro, segundo],
    [primeiro, segundo, terceiro],
  ];
  for (const [ano, a, b] of divisoes) {
    if (ano >= ANO_MINIMO_DATA && ano <= ANO_MAXIMO_DATA) return diaEMes(a, b) ? ano : null;
  }
  for (const [ano, a, b] of divisoes) {
    if (diaEMes(a, b)) return paraAnoCompleto(ano);
  }
  return null;
}

function tentativasData(ano: number, anoReferencia: number, comSeparador: boolean): number {
  const espacoAnos = Math.max(Math.abs(ano - anoReferencia), ESPACO_MINIMO_ANOS);
  return espacoAnos * DIAS_NO_ANO * (comSeparador ? 4 : 1);
}

function correspondenciasDeData(caracteres: readonly string[], anoReferencia: number): Correspondencia[] {
  const encontradas: Correspondencia[] = [];
  const texto = caracteres.join('');
  const asciiSimples = texto.length === caracteres.length;

  for (let inicio = 0; inicio < caracteres.length; inicio += 1) {
    for (let tamanho = 4; tamanho <= 10 && inicio + tamanho <= caracteres.length; tamanho += 1) {
      const fim = inicio + tamanho - 1;
      const trecho = caracteres.slice(inicio, fim + 1).join('');

      if (/^\d+$/.test(trecho) && tamanho <= 8) {
        if (tamanho === 4) {
          const ano = Number(trecho);
          if (ano >= ANO_MINIMO_RECENTE && ano <= anoReferencia + ANOS_A_FRENTE) {
            encontradas.push({
              tipo: 'ANO',
              inicio,
              fim,
              trecho,
              tentativas: Math.max(Math.abs(ano - anoReferencia), ESPACO_MINIMO_ANOS),
            });
          }
        }
        let melhorAno: number | null = null;
        for (const [k, l] of SPLITS_DATA[tamanho] ?? []) {
          const ano = anoDaData([Number(trecho.slice(0, k)), Number(trecho.slice(k, l)), Number(trecho.slice(l))]);
          if (ano === null) continue;
          if (melhorAno === null || Math.abs(ano - anoReferencia) < Math.abs(melhorAno - anoReferencia)) melhorAno = ano;
        }
        if (melhorAno !== null) {
          encontradas.push({ tipo: 'DATA', inicio, fim, trecho, tentativas: tentativasData(melhorAno, anoReferencia, false) });
        }
        continue;
      }

      if (!asciiSimples || tamanho < 6) continue;
      const comSeparador = /^(\d{1,4})([\s/\\_.-])(\d{1,2})\2(\d{1,4})$/.exec(trecho);
      if (!comSeparador) continue;
      const ano = anoDaData([Number(comSeparador[1]), Number(comSeparador[3]), Number(comSeparador[4])]);
      if (ano !== null) {
        encontradas.push({ tipo: 'DATA', inicio, fim, trecho, tentativas: tentativasData(ano, anoReferencia, true) });
      }
    }
  }

  return encontradas.filter(
    (data) =>
      !encontradas.some(
        (outra) =>
          outra !== data &&
          outra.tipo === 'DATA' &&
          data.tipo === 'DATA' &&
          outra.inicio <= data.inicio &&
          outra.fim >= data.fim &&
          outra.fim - outra.inicio > data.fim - data.inicio,
      ),
  );
}

function menorPosicaoDePalavra(palavra: string, dicionarios: Dicionarios): number | null {
  const encontrada = procurarNosDicionarios(palavra, dicionarios, true);
  if (encontrada) return encontrada.posicao;
  return dicionarios.SENHAS_COMUNS.get(palavra) ?? null;
}

function tentativasDaFrase(corpoBruto: string, dicionarios: Dicionarios): { tentativas: number; palavras: number } | null {
  const primeiroSeparador = /[^\p{L}]/u.exec(corpoBruto)?.[0];
  const corpo =
    primeiroSeparador && corpoBruto.endsWith(primeiroSeparador) ? corpoBruto.slice(0, -primeiroSeparador.length) : corpoBruto;

  let partes: string[];
  let tentativas = 1;
  if (primeiroSeparador) {
    if ([...corpo].some((caractere) => !/\p{L}/u.test(caractere) && caractere !== primeiroSeparador)) return null;
    partes = corpo.split(primeiroSeparador);
    tentativas = SEPARADORES_POSSIVEIS;
  } else {
    partes = corpo.split(/(?=\p{Lu})/u);
    if (partes.some((parte) => !/^\p{Lu}/u.test(parte))) return null;
  }

  if (partes.length < PALAVRAS_MINIMAS_FRASE || partes.some((parte) => [...parte].length < 2)) return null;

  for (const parte of partes) {
    const posicao = menorPosicaoDePalavra([...parte].map(normalizarCaractere).join(''), dicionarios);
    if (posicao === null) return null;
    tentativas *= posicao;
  }

  const usos = partes.map((parte) => usoMaiusculas([...parte]));
  if (!usos.every((uso) => uso === usos[0])) tentativas *= Math.pow(2, partes.length);
  else if (usos[0] !== 'NENHUMA') tentativas *= 2;

  return { tentativas, palavras: partes.length };
}

function tentativasDoFinal(final: readonly string[]): number {
  if (final.length === 0) return 1;
  let alfabeto = 0;
  if (final.some((caractere) => /^\p{Nd}$/u.test(caractere))) alfabeto += 10;
  if (final.some((caractere) => /^\p{Ll}$/u.test(caractere))) alfabeto += 26;
  if (final.some((caractere) => /^\p{Lu}$/u.test(caractere))) alfabeto += 26;
  if (final.some((caractere) => !/^[\p{L}\p{Nd}]$/u.test(caractere))) alfabeto += SIMBOLOS_POSSIVEIS;
  return Math.pow(alfabeto, final.length);
}

function correspondenciaDeFrase(caracteres: readonly string[], dicionarios: Dicionarios): Correspondencia | null {
  let melhor: { tentativas: number; palavras: number } | null = null;

  for (let tamanhoFinal = 0; tamanhoFinal <= TAMANHO_MAXIMO_FINAL_FRASE && tamanhoFinal < caracteres.length; tamanhoFinal += 1) {
    const corte = caracteres.length - tamanhoFinal;
    const frase = tentativasDaFrase(caracteres.slice(0, corte).join(''), dicionarios);
    if (!frase) continue;
    const tentativas = frase.tentativas * tentativasDoFinal(caracteres.slice(corte));
    if (!melhor || tentativas < melhor.tentativas) melhor = { tentativas, palavras: frase.palavras };
  }

  if (!melhor) return null;
  return {
    tipo: 'FRASE',
    inicio: 0,
    fim: caracteres.length - 1,
    trecho: caracteres.join(''),
    tentativas: Math.max(melhor.tentativas, 1),
    quantidadePalavras: melhor.palavras,
  };
}

export function encontrarCorrespondencias(caracteres: readonly string[], contexto: ContextoAnalise): Correspondencia[] {
  const frase = correspondenciaDeFrase(caracteres, contexto.dicionarios);
  return [
    ...correspondenciasDeDicionario(caracteres, contexto.dicionarios),
    ...correspondenciasDeSequencia(caracteres),
    ...correspondenciasDeTeclado(caracteres),
    ...correspondenciasDeRepeticao(caracteres, contexto),
    ...correspondenciasDeData(caracteres, contexto.anoReferencia),
    ...(frase ? [frase] : []),
  ];
}
