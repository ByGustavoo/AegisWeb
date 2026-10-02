import type { Dicionarios, OrigemDicionario } from '@/modelos/analise';

export type FontesDicionarios = Partial<Record<OrigemDicionario, readonly string[]>>;

const ORIGENS: OrigemDicionario[] = ['SENHAS_COMUNS', 'PALAVRAS_PORTUGUES', 'PALAVRAS_INGLES', 'NOMES', 'PALAVRAS_AEGIS'];

function porPosicao(palavras: readonly string[]): Map<string, number> {
  const mapa = new Map<string, number>();
  palavras.forEach((palavra, indice) => {
    if (!mapa.has(palavra)) mapa.set(palavra, indice + 1);
  });
  return mapa;
}

function uniforme(palavras: readonly string[]): Map<string, number> {
  return new Map(palavras.map((palavra) => [palavra, palavras.length]));
}

export function criarDicionarios(fontes: FontesDicionarios): Dicionarios {
  const dicionarios = {} as Record<OrigemDicionario, ReadonlyMap<string, number>>;
  for (const origem of ORIGENS) {
    const palavras = fontes[origem] ?? [];
    dicionarios[origem] = origem === 'PALAVRAS_AEGIS' ? uniforme(palavras) : porPosicao(palavras);
  }
  return dicionarios;
}

let carregamento: Promise<Dicionarios> | null = null;

export function carregarDicionarios(): Promise<Dicionarios> {
  carregamento ??= montarDicionarios().catch((erro: unknown) => {
    carregamento = null;
    throw erro;
  });
  return carregamento;
}

async function montarDicionarios(): Promise<Dicionarios> {
  const [listas, { PALAVRAS }] = await Promise.all([import('@/dados/dicionarios'), import('@/dados/palavras')]);
  const separar = (texto: string) => texto.split(' ');
  return criarDicionarios({
    SENHAS_COMUNS: separar(listas.SENHAS_COMUNS),
    PALAVRAS_PORTUGUES: separar(listas.PALAVRAS_PORTUGUES),
    PALAVRAS_INGLES: separar(listas.PALAVRAS_INGLES),
    NOMES: separar(listas.NOMES),
    PALAVRAS_AEGIS: PALAVRAS,
  });
}
