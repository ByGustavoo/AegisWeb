import type { NomeIcone } from '@/modelos/impressao';

export interface ComandoVetor {
  op: 'm' | 'l' | 'c' | 'h';
  c: number[];
}

const CONSTANTE_CIRCULO = 0.5523;

const m = (x: number, y: number): ComandoVetor => ({ op: 'm', c: [x, y] });
const l = (x: number, y: number): ComandoVetor => ({ op: 'l', c: [x, y] });
const c = (...pontos: number[]): ComandoVetor => ({ op: 'c', c: pontos });
const h: ComandoVetor = { op: 'h', c: [] };

function circulo(cx: number, cy: number, raio: number): ComandoVetor[] {
  const k = CONSTANTE_CIRCULO * raio;
  return [
    m(cx + raio, cy),
    c(cx + raio, cy + k, cx + k, cy + raio, cx, cy + raio),
    c(cx - k, cy + raio, cx - raio, cy + k, cx - raio, cy),
    c(cx - raio, cy - k, cx - k, cy - raio, cx, cy - raio),
    c(cx + k, cy - raio, cx + raio, cy - k, cx + raio, cy),
    h,
  ];
}

export const TAMANHO_BASE_ICONE = 24;

export const ICONES_VETORIAIS: Record<NomeIcone, ComandoVetor[]> = {
  EMAIL: [m(3, 6), l(21, 6), l(21, 18), l(3, 18), h, m(3, 7), l(12, 13), l(21, 7)],
  SENHA: [...circulo(7.5, 15.5, 4.5), m(10.7, 12.3), l(20, 3), m(16, 7), l(19, 10), m(13.5, 9.5), l(15.5, 11.5)],
  USUARIO: [...circulo(12, 8, 4), m(4, 21), c(4, 16.5, 8, 14, 12, 14), c(16, 14, 20, 16.5, 20, 21)],
  CODIGO: [
    m(12, 3),
    l(19, 6),
    l(19, 11),
    c(19, 16, 16, 19.5, 12, 21),
    c(8, 19.5, 5, 16, 5, 11),
    l(5, 6),
    h,
    m(9, 12),
    l(11, 14),
    l(15, 10),
  ],
  TELEFONE: [m(7, 3), l(17, 3), l(17, 21), l(7, 21), h, m(11, 18), l(13, 18)],
  BANCO: [
    m(3, 9),
    l(12, 4),
    l(21, 9),
    h,
    m(6, 11),
    l(6, 18),
    m(10, 11),
    l(10, 18),
    m(14, 11),
    l(14, 18),
    m(18, 11),
    l(18, 18),
    m(3, 21),
    l(21, 21),
  ],
  NOTA: [m(6, 3), l(15, 3), l(19, 7), l(19, 21), l(6, 21), h, m(15, 3), l(15, 7), l(19, 7), m(9, 11), l(16, 11), m(9, 15), l(16, 15), m(9, 18), l(13, 18)],
  SITE: [...circulo(12, 12, 9), m(3, 12), l(21, 12), m(12, 3), c(15.5, 6, 15.5, 18, 12, 21), c(8.5, 18, 8.5, 6, 12, 3)],
  CAMPO: [m(12, 6), l(18, 12), l(12, 18), l(6, 12), h],
};

function transformar(comandos: ComandoVetor[], x: number, y: number, escala: number) {
  return comandos.map(({ op, c: pontos }) => ({
    op,
    c: pontos.map((valor, indice) => (indice % 2 === 0 ? x + valor * escala : y + valor * escala)),
  }));
}

export function iconeNaPagina(nome: NomeIcone, x: number, y: number, tamanho: number): ComandoVetor[] {
  return transformar(ICONES_VETORIAIS[nome], x, y, tamanho / TAMANHO_BASE_ICONE);
}

export function caminhoSvg(comandos: ComandoVetor[]): string {
  return comandos
    .map(({ op, c: pontos }) => (op === 'h' ? 'Z' : `${op.toUpperCase()}${pontos.map((valor) => valor.toFixed(2)).join(' ')}`))
    .join(' ');
}
