import type { ForcaCalculada, NivelForca } from '@/modelos/senha';

export const TENTATIVAS_POR_SEGUNDO = 1e10;

const LIMITES_NIVEL: { ate: number; nivel: NivelForca }[] = [
  { ate: 28, nivel: 1 },
  { ate: 40, nivel: 2 },
  { ate: 60, nivel: 3 },
  { ate: 80, nivel: 4 },
];

const SEGUNDOS = {
  minuto: 60,
  hora: 3600,
  dia: 86_400,
  mes: 2_629_800,
  ano: 31_557_600,
} as const;

const IDADE_DO_UNIVERSO_EM_ANOS = 1.38e10;

export function nivelPorEntropia(bits: number): NivelForca {
  return LIMITES_NIVEL.find((limite) => bits < limite.ate)?.nivel ?? 5;
}

function plural(quantidade: number, singular: string, pluralForma: string): string {
  return `${quantidade} ${quantidade === 1 ? singular : pluralForma}`;
}

export function tempoParaQuebrar(bits: number): string {
  const segundos = Math.pow(2, bits - 1) / TENTATIVAS_POR_SEGUNDO;

  if (segundos < 1) return 'Menos de um segundo';
  if (segundos < SEGUNDOS.minuto) return plural(Math.round(segundos), 'segundo', 'segundos');
  if (segundos < SEGUNDOS.hora) return plural(Math.round(segundos / SEGUNDOS.minuto), 'minuto', 'minutos');
  if (segundos < SEGUNDOS.dia) return plural(Math.round(segundos / SEGUNDOS.hora), 'hora', 'horas');
  if (segundos < SEGUNDOS.mes) return plural(Math.round(segundos / SEGUNDOS.dia), 'dia', 'dias');
  if (segundos < SEGUNDOS.ano) return plural(Math.round(segundos / SEGUNDOS.mes), 'mês', 'meses');

  const anos = segundos / SEGUNDOS.ano;
  if (anos < 1_000) return plural(Math.round(anos), 'ano', 'anos');
  if (anos < 1e6) return 'Milhares de anos';
  if (anos < 1e9) return 'Milhões de anos';
  if (anos < IDADE_DO_UNIVERSO_EM_ANOS) return 'Bilhões de anos';
  return 'Mais que a idade do universo';
}

export function calcularForca(entropiaBits: number): ForcaCalculada {
  return {
    nivel: nivelPorEntropia(entropiaBits),
    entropiaBits,
    tempoEstimadoQuebra: tempoParaQuebrar(entropiaBits),
  };
}
