import type { LucideIcon } from 'lucide-react';
import { ArchiveX, ClipboardX, CloudOff, Cpu, ShieldCheck } from 'lucide-react';
import { NOME_APLICACAO } from './aplicacao';
import { SEGUNDOS_PARA_LIMPAR_AREA_TRANSFERENCIA } from './geracao';

export interface SeloPrivacidade {
  icone: LucideIcon;
  rotulo: string;
}

export interface CompromissoPrivacidade extends SeloPrivacidade {
  descricao: string;
}

const PROCESSADO_LOCALMENTE: SeloPrivacidade = { icone: Cpu, rotulo: 'Processado localmente' };
const NENHUMA_SENHA_ARMAZENADA: SeloPrivacidade = { icone: ArchiveX, rotulo: 'Nenhuma senha armazenada' };
const NAO_SAI_DO_APARELHO: SeloPrivacidade = { icone: CloudOff, rotulo: 'Sua senha não sai do aparelho' };

export const selosPrivacidade: SeloPrivacidade[] = [PROCESSADO_LOCALMENTE, NENHUMA_SENHA_ARMAZENADA, NAO_SAI_DO_APARELHO];

export const compromissosPrivacidade: CompromissoPrivacidade[] = [
  {
    ...PROCESSADO_LOCALMENTE,
    descricao: `As senhas são geradas e analisadas por este navegador. O ${NOME_APLICACAO} não tem um servidor que possa recebê-las.`,
  },
  {
    ...NENHUMA_SENHA_ARMAZENADA,
    descricao:
      'As senhas ficam só na memória desta aba e somem quando você a fecha ou recarrega. O navegador guarda apenas o tema e o estado do menu lateral.',
  },
  {
    ...NAO_SAI_DO_APARELHO,
    descricao:
      'Nenhuma senha passa pela rede. A verificação de vazamentos ainda não está disponível; quando chegar, será opcional e enviará só os 5 primeiros caracteres do hash SHA-1 da senha.',
  },
  {
    icone: ClipboardX,
    rotulo: 'Área de transferência limpa',
    descricao: `Ao copiar, a senha é apagada da área de transferência depois de ${SEGUNDOS_PARA_LIMPAR_AREA_TRANSFERENCIA} segundos. Se você fechar a aba antes disso, ela continua lá até você copiar outra coisa.`,
  },
  {
    icone: ShieldCheck,
    rotulo: 'Sem rastreamento',
    descricao: 'Sem cookies, sem ferramentas de análise e sem fontes ou scripts carregados de terceiros.',
  },
];
