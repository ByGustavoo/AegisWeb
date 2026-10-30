import type { CSSProperties } from 'react';

export const CLASSE_CASCATA = 'item-em-cascata';

export function comIndice(indice: number): CSSProperties {
  return { '--indice': indice } as CSSProperties;
}
