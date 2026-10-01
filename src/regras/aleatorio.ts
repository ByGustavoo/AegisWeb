const TAMANHO_UINT32 = 0x1_0000_0000;

export function inteiroAleatorio(maximoExclusivo: number): number {
  if (!Number.isInteger(maximoExclusivo) || maximoExclusivo <= 0 || maximoExclusivo > TAMANHO_UINT32) {
    throw new RangeError(`O limite do sorteio precisa ser um inteiro entre 1 e ${TAMANHO_UINT32}.`);
  }

  const limiteSemVies = TAMANHO_UINT32 - (TAMANHO_UINT32 % maximoExclusivo);
  const amostra = new Uint32Array(1);
  let valor = TAMANHO_UINT32;

  while (valor >= limiteSemVies) {
    crypto.getRandomValues(amostra);
    valor = amostra[0] ?? TAMANHO_UINT32;
  }

  return valor % maximoExclusivo;
}

export function escolher<T>(itens: readonly T[]): T {
  const item = itens[inteiroAleatorio(itens.length)];
  if (item === undefined) throw new RangeError('Não é possível escolher de uma lista vazia.');
  return item;
}

export function embaralhar<T>(itens: readonly T[]): T[] {
  const resultado = [...itens];
  for (let indice = resultado.length - 1; indice > 0; indice -= 1) {
    const outro = inteiroAleatorio(indice + 1);
    const atual = resultado[indice] as T;
    resultado[indice] = resultado[outro] as T;
    resultado[outro] = atual;
  }
  return resultado;
}
