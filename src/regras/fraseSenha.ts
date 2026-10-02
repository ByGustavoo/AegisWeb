import { PALAVRAS } from '@/dados/palavras';
import type { OpcoesFraseSenha } from '@/modelos/senha';
import { escolher, inteiroAleatorio } from './aleatorio';

export const LIMITES_PALAVRAS = { minimo: 4, maximo: 10 } as const;

const NUMERO_MINIMO = 10;
const QUANTIDADE_NUMEROS = 90;
export const SIMBOLOS_FRASE = '!@#$%&*?';

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

  const frase = partes.join(opcoes.separador);
  return opcoes.incluirSimbolo ? frase + escolher([...SIMBOLOS_FRASE]) : frase;
}

export function entropiaFraseSenha(opcoes: OpcoesFraseSenha, totalPalavras: number = PALAVRAS.length): number {
  const bitsPalavras = opcoes.quantidadePalavras * Math.log2(totalPalavras);
  const bitsNumero = opcoes.incluirNumero ? Math.log2(QUANTIDADE_NUMEROS) : 0;
  const bitsSimbolo = opcoes.incluirSimbolo ? Math.log2(SIMBOLOS_FRASE.length) : 0;
  return bitsPalavras + bitsNumero + bitsSimbolo;
}
