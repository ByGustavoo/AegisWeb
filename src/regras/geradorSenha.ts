import type { OpcoesSenha } from '@/modelos/senha';
import { embaralhar, escolher } from './aleatorio';

export const CONJUNTOS_CARACTERES = {
  maiusculas: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  minusculas: 'abcdefghijklmnopqrstuvwxyz',
  numeros: '0123456789',
  simbolos: '!@#$%&*-_+=?.:;',
} as const;

export const CARACTERES_AMBIGUOS = 'O0oIl1|S5B8';

export const LIMITES_TAMANHO_SENHA = { minimo: 8, maximo: 64 } as const;

function semAmbiguos(conjunto: string): string {
  return [...conjunto].filter((caractere) => !CARACTERES_AMBIGUOS.includes(caractere)).join('');
}

export function alfabetosSelecionados(opcoes: OpcoesSenha): string[] {
  const candidatos: [boolean, string][] = [
    [opcoes.usarMaiusculas, CONJUNTOS_CARACTERES.maiusculas],
    [opcoes.usarMinusculas, CONJUNTOS_CARACTERES.minusculas],
    [opcoes.usarNumeros, CONJUNTOS_CARACTERES.numeros],
    [opcoes.usarSimbolos, CONJUNTOS_CARACTERES.simbolos],
  ];
  const selecionados = candidatos.filter(([usar]) => usar).map(([, conjunto]) => conjunto);

  return opcoes.evitarAmbiguos ? selecionados.map(semAmbiguos) : selecionados;
}

export function contarTiposSelecionados(opcoes: OpcoesSenha): number {
  return [opcoes.usarMaiusculas, opcoes.usarMinusculas, opcoes.usarNumeros, opcoes.usarSimbolos].filter(Boolean).length;
}

export function gerarSenha(opcoes: OpcoesSenha): string {
  const alfabetos = alfabetosSelecionados(opcoes);
  if (alfabetos.length === 0) throw new Error('Escolha pelo menos um tipo de caractere.');
  if (opcoes.tamanho < alfabetos.length) throw new Error('O tamanho é menor que a quantidade de tipos escolhidos.');

  const todos = [...alfabetos.join('')];
  const obrigatorios = alfabetos.map((alfabeto) => escolher([...alfabeto]));
  const restantes = Array.from({ length: opcoes.tamanho - obrigatorios.length }, () => escolher(todos));

  return embaralhar([...obrigatorios, ...restantes]).join('');
}

export function entropiaSenha(opcoes: OpcoesSenha): number {
  const tamanhoAlfabeto = alfabetosSelecionados(opcoes).join('').length;
  if (tamanhoAlfabeto === 0) return 0;
  return opcoes.tamanho * Math.log2(tamanhoAlfabeto);
}
