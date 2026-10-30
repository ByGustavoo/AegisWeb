export const ID_LISTA_NOMES_CAMPO = 'nomes-de-campo-sugeridos';

export function idTituloConta(contaId: string): string {
  return `conta-${contaId}-titulo`;
}

export function idAdicionarCampo(contaId: string): string {
  return `conta-${contaId}-adicionar`;
}

export function idNomeCampo(campoId: string): string {
  return `campo-${campoId}-nome`;
}

export function idValorCampo(campoId: string): string {
  return `campo-${campoId}-valor`;
}
