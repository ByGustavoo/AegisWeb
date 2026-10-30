import { CORES_IMPRESSAO } from '@/configuracoes/impressao';
import type { CorImpressao, LinhaValor } from '@/modelos/impressao';
import { classificarCaractere, segmentarPorClasse } from '@/regras/caracteres';

export const MARCA_ESPACO_NA_QUEBRA = '·';

export interface SegmentoDesenhado {
  texto: string;
  cor: CorImpressao;
  deslocamento: number;
}

export function corDoCaractere(caractere: string): CorImpressao {
  const classe = classificarCaractere(caractere);
  if (classe === 'NUMERO') return CORES_IMPRESSAO.numero;
  if (classe === 'SIMBOLO') return CORES_IMPRESSAO.simbolo;
  return CORES_IMPRESSAO.texto;
}

export function segmentosDoValor(linha: LinhaValor, avanco: number): SegmentoDesenhado[] {
  let posicao = 0;
  const segmentos = segmentarPorClasse(linha.texto).map((segmento) => {
    const desenhado = {
      texto: segmento.texto,
      cor: corDoCaractere(Array.from(segmento.texto)[0] ?? ''),
      deslocamento: posicao * avanco,
    };
    posicao += Array.from(segmento.texto).length;
    return desenhado;
  });
  if (linha.espacoNaQuebra) {
    segmentos.push({ texto: MARCA_ESPACO_NA_QUEBRA, cor: CORES_IMPRESSAO.terciario, deslocamento: posicao * avanco });
  }
  return segmentos.filter((segmento) => segmento.texto.trim().length > 0);
}

export function geometriaDoTracoDoZero(x: number, linhaDeBase: number, avanco: number, tamanho: number) {
  return {
    x1: x + avanco * 0.34,
    y1: linhaDeBase - tamanho * 0.13,
    x2: x + avanco * 0.66,
    y2: linhaDeBase - tamanho * 0.6,
    espessura: tamanho * 0.07,
  };
}

export function rgb([vermelho, verde, azul]: CorImpressao): string {
  return `rgb(${vermelho} ${verde} ${azul})`;
}

export const CADEADO = {
  largura: 5.6,
  altura: 4.4,
  raio: 0.9,
  arcoRecuo: 1.3,
  arcoLargura: 3,
  arcoAltura: 1.4,
  arcoCurva: 1.9,
  espessura: 0.8,
} as const;

export function geometriaDoCadeado(x: number, linhaDeBase: number) {
  const topoCorpo = linhaDeBase - CADEADO.altura + 0.4;
  return {
    corpo: { x, y: topoCorpo, largura: CADEADO.largura, altura: CADEADO.altura, raio: CADEADO.raio },
    arco: { x: x + CADEADO.arcoRecuo, y: topoCorpo },
  };
}
