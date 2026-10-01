import type { LucideIcon } from 'lucide-react';
import { ShieldAlert, ShieldCheck, ShieldHalf, ShieldMinus, ShieldX } from 'lucide-react';
import type { NivelForca } from '@/modelos/senha';

export interface DescricaoNivelForca {
  nivel: NivelForca;
  rotulo: string;
  resumo: string;
  icone: LucideIcon;
  cor: string;
  corSuave: string;
}

export const niveisForca: Record<NivelForca, DescricaoNivelForca> = {
  1: {
    nivel: 1,
    rotulo: 'Muito fraca',
    resumo: 'Cai em segundos num ataque comum.',
    icone: ShieldX,
    cor: 'var(--forca-1)',
    corSuave: 'var(--forca-1-suave)',
  },
  2: {
    nivel: 2,
    rotulo: 'Fraca',
    resumo: 'Resiste pouco: horas ou dias.',
    icone: ShieldAlert,
    cor: 'var(--forca-2)',
    corSuave: 'var(--forca-2-suave)',
  },
  3: {
    nivel: 3,
    rotulo: 'Razoável',
    resumo: 'Aguenta ataques online, mas não um vazamento.',
    icone: ShieldMinus,
    cor: 'var(--forca-3)',
    corSuave: 'var(--forca-3-suave)',
  },
  4: {
    nivel: 4,
    rotulo: 'Forte',
    resumo: 'Boa para a maioria das contas.',
    icone: ShieldHalf,
    cor: 'var(--forca-4)',
    corSuave: 'var(--forca-4-suave)',
  },
  5: {
    nivel: 5,
    rotulo: 'Muito forte',
    resumo: 'Fora do alcance de ataques práticos.',
    icone: ShieldCheck,
    cor: 'var(--forca-5)',
    corSuave: 'var(--forca-5-suave)',
  },
};

export const NIVEIS_FORCA: NivelForca[] = [1, 2, 3, 4, 5];
