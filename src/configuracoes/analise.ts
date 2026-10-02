import type { LucideIcon } from 'lucide-react';
import { ArchiveX, CloudOff, TimerReset } from 'lucide-react';

export const MINUTOS_PARA_APAGAR_SENHA = 2;

export const MILISSEGUNDOS_PARA_APAGAR_SENHA = MINUTOS_PARA_APAGAR_SENHA * 60_000;

export const EXEMPLOS_SENHA: readonly string[] = ['Cachorro@2025', 's3nh@123', 'Maria1990!', 'qwerty123'];

export interface GarantiaPrivacidade {
  icone: LucideIcon;
  titulo: string;
  descricao: string;
}

export const garantiasPrivacidade: GarantiaPrivacidade[] = [
  {
    icone: CloudOff,
    titulo: 'Nada é enviado',
    descricao: 'A análise roda no seu navegador. A senha não passa pela rede.',
  },
  {
    icone: ArchiveX,
    titulo: 'Nada é guardado',
    descricao: 'Nem no servidor, nem no histórico, na URL ou no armazenamento do navegador.',
  },
  {
    icone: TimerReset,
    titulo: 'Some sozinha',
    descricao: `Apagada ao sair da página ou depois de ${MINUTOS_PARA_APAGAR_SENHA} minutos sem uso.`,
  },
];
