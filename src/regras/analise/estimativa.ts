import type { Correspondencia, Dicionarios } from '@/modelos/analise';
import { encontrarCorrespondencias } from './correspondencias';
import type { ContextoAnalise } from './correspondencias';
import { fatorial } from './matematica';

const TENTATIVAS_ANTES_DE_CRESCER_SEQUENCIA = 10_000;
const MINIMO_TRECHO_DE_UM_CARACTERE = 10;
const MINIMO_TRECHO_LONGO = 50;

const TAMANHO_CLASSES = {
  minusculas: 26,
  maiusculas: 26,
  numeros: 10,
  simbolos: 33,
  outros: 100,
} as const;

export interface Estimativa {
  tentativas: number;
  sequencia: Correspondencia[];
}

interface No {
  quantidade: number;
  produto: number;
  total: number;
  correspondencia: Correspondencia;
  anterior: No | null;
}

export function cardinalidade(caracteres: readonly string[]): number {
  let total = 0;
  if (caracteres.some((caractere) => /^[a-z]$/.test(caractere))) total += TAMANHO_CLASSES.minusculas;
  if (caracteres.some((caractere) => /^[A-Z]$/.test(caractere))) total += TAMANHO_CLASSES.maiusculas;
  if (caracteres.some((caractere) => /^[0-9]$/.test(caractere))) total += TAMANHO_CLASSES.numeros;
  if (caracteres.some((caractere) => /^[ -/:-@[-`{-~]$/.test(caractere))) total += TAMANHO_CLASSES.simbolos;
  if (caracteres.some((caractere) => !/^[ -~]$/.test(caractere))) total += TAMANHO_CLASSES.outros;
  return Math.max(total, TAMANHO_CLASSES.numeros);
}

function limitar(valor: number): number {
  return Number.isFinite(valor) ? valor : Number.MAX_VALUE;
}

export function estimar(senha: string, dicionarios: Dicionarios, anoReferencia: number): Estimativa {
  const caracteres = Array.from(senha);
  const total = caracteres.length;
  if (total === 0) return { tentativas: 1, sequencia: [] };

  const contexto: ContextoAnalise = {
    dicionarios,
    anoReferencia,
    estimarBase: (base) => estimar(base, dicionarios, anoReferencia).tentativas,
  };

  const tamanhoAlfabeto = cardinalidade(caracteres);
  const minimoPara = (tamanho: number) =>
    tamanho === total ? 1 : tamanho === 1 ? MINIMO_TRECHO_DE_UM_CARACTERE : MINIMO_TRECHO_LONGO;

  const porFim: Correspondencia[][] = Array.from({ length: total }, () => []);
  for (const correspondencia of encontrarCorrespondencias(caracteres, contexto)) {
    const tamanho = correspondencia.fim - correspondencia.inicio + 1;
    porFim[correspondencia.fim]?.push({
      ...correspondencia,
      tentativas: limitar(Math.max(correspondencia.tentativas, minimoPara(tamanho))),
    });
  }

  const forcaBruta = (inicio: number, fim: number): Correspondencia => {
    const tamanho = fim - inicio + 1;
    return {
      tipo: 'ALEATORIO',
      inicio,
      fim,
      trecho: caracteres.slice(inicio, fim + 1).join(''),
      tentativas: limitar(Math.max(Math.pow(tamanhoAlfabeto, tamanho), minimoPara(tamanho) + 1)),
    };
  };

  const otimo: Map<number, No>[] = Array.from({ length: total }, () => new Map());

  const atualizar = (correspondencia: Correspondencia, anterior: No | null) => {
    const quantidade = anterior ? anterior.quantidade + 1 : 1;
    const produto = limitar(correspondencia.tentativas * (anterior ? anterior.produto : 1));
    const soma = limitar(fatorial(quantidade) * produto + Math.pow(TENTATIVAS_ANTES_DE_CRESCER_SEQUENCIA, quantidade - 1));
    const nos = otimo[correspondencia.fim];
    if (!nos) return;
    for (const [outraQuantidade, outro] of nos) {
      if (outraQuantidade <= quantidade && outro.total <= soma) return;
    }
    nos.set(quantidade, { quantidade, produto, total: soma, correspondencia, anterior });
  };

  for (let fim = 0; fim < total; fim += 1) {
    for (const correspondencia of porFim[fim] ?? []) {
      if (correspondencia.inicio === 0) {
        atualizar(correspondencia, null);
        continue;
      }
      for (const anterior of otimo[correspondencia.inicio - 1]?.values() ?? []) atualizar(correspondencia, anterior);
    }

    atualizar(forcaBruta(0, fim), null);
    for (let inicio = 1; inicio <= fim; inicio += 1) {
      const correspondencia = forcaBruta(inicio, fim);
      for (const anterior of otimo[inicio - 1]?.values() ?? []) {
        if (anterior.correspondencia.tipo === 'ALEATORIO') continue;
        atualizar(correspondencia, anterior);
      }
    }
  }

  let melhor: No | null = null;
  for (const no of otimo[total - 1]?.values() ?? []) {
    if (!melhor || no.total < melhor.total) melhor = no;
  }

  const sequencia: Correspondencia[] = [];
  for (let no = melhor; no; no = no.anterior) sequencia.unshift(no.correspondencia);

  return { tentativas: Math.max(melhor?.total ?? 1, 1), sequencia };
}
