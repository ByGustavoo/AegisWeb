import type { LucideIcon } from 'lucide-react';
import { KeyRound, ScanSearch, Settings } from 'lucide-react';
import { caminhos } from '@/rotas/caminhos';

export interface ItemNavegacao {
  rotulo: string;
  icone: LucideIcon;
  destino: string;
}

export const navegacaoFerramentas: ItemNavegacao[] = [
  { rotulo: 'Gerar', icone: KeyRound, destino: caminhos.gerar },
  { rotulo: 'Analisar', icone: ScanSearch, destino: caminhos.analisar },
];

export const navegacaoConfiguracoes: ItemNavegacao = {
  rotulo: 'Configurações',
  icone: Settings,
  destino: caminhos.configuracoes,
};

export const navegacaoCompleta: ItemNavegacao[] = [...navegacaoFerramentas, navegacaoConfiguracoes];
