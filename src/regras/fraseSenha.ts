import { PALAVRAS } from '@/dados/palavras';
import type { OpcoesFraseSenha } from '@/modelos/senha';
import { escolher, inteiroAleatorio } from './aleatorio';

export const LIMITES_PALAVRAS = { minimo: 4, maximo: 10 } as const;

const NUMERO_MINIMO = 10;
const QUANTIDADE_NUMEROS = 90;

function capitalizar(palavra: string): string {
  return palavra.charAt(0).toUpperCase() + palavra.slice(1);
}

export function gerarFraseSenha(opcoes: OpcoesFraseSenha, palavras: readonly string[] = PALAVRAS): string {
  const sorteadas = Array.from({ length: opcoes.quantidadePalavras }, () => {
    const palavra = escolher(palavras);
    return opcoes.iniciaisMaiusculas ? capitalizar(palavra) : palavra;
  });

  const partes = opcoes.incluirNumero
    ? [...sorteadas, String(NUMERO_MINIMO + inteiroAleatorio(QUANTIDADE_NUMEROS))]
    : sorteadas;

  return partes.join(opcoes.separador);
}

export function entropiaFraseSenha(opcoes: OpcoesFraseSenha, totalPalavras: number = PALAVRAS.length): number {
  const bitsPalavras = opcoes.quantidadePalavras * Math.log2(totalPalavras);
  return opcoes.incluirNumero ? bitsPalavras + Math.log2(QUANTIDADE_NUMEROS) : bitsPalavras;
}
