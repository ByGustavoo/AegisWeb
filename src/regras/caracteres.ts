import type { ClasseCaractere } from '@/modelos/senha';

export interface SegmentoCaracteres {
  classe: ClasseCaractere;
  texto: string;
}

export function classificarCaractere(caractere: string): ClasseCaractere {
  if (/\s/u.test(caractere)) return 'ESPACO';
  if (/\p{Nd}/u.test(caractere)) return 'NUMERO';
  if (/\p{L}/u.test(caractere)) return 'LETRA';
  return 'SIMBOLO';
}

export function segmentarPorClasse(valor: string): SegmentoCaracteres[] {
  const segmentos: SegmentoCaracteres[] = [];

  for (const caractere of valor) {
    const classe = classificarCaractere(caractere);
    const ultimo = segmentos[segmentos.length - 1];
    if (ultimo && ultimo.classe === classe) ultimo.texto += caractere;
    else segmentos.push({ classe, texto: caractere });
  }

  return segmentos;
}
