import type { LucideIcon } from 'lucide-react';
import { Cpu, Eraser, GlobeLock, ShieldCheck } from 'lucide-react';
import { CabecalhoPainel, Painel } from '@/componentes/ui';
import { NOME_APLICACAO } from '@/configuracoes/aplicacao';
import type { SecaoConfiguracaoProps } from './SecaoAparencia';
import estilos from './SecaoPrivacidade.module.css';

interface Compromisso {
  icone: LucideIcon;
  titulo: string;
  descricao: string;
}

const compromissos: Compromisso[] = [
  {
    icone: Cpu,
    titulo: 'Tudo acontece no seu navegador',
    descricao: `As senhas são geradas e analisadas neste aparelho. O ${NOME_APLICACAO} nem tem um servidor que possa recebê-las.`,
  },
  {
    icone: Eraser,
    titulo: 'Nada fica gravado',
    descricao:
      'As senhas geradas ficam só na memória desta aba e somem quando você a fecha ou recarrega. Neste navegador ficam salvas apenas as suas preferências de aparência.',
  },
  {
    icone: GlobeLock,
    titulo: 'Vazamentos, só quando você pedir',
    descricao:
      'A verificação de vazamento é opcional. Quando você pedir, apenas os 5 primeiros caracteres do hash SHA-1 da senha vão para o Have I Been Pwned. A senha nunca sai daqui.',
  },
  {
    icone: ShieldCheck,
    titulo: 'Sem rastreamento',
    descricao: 'Sem cookies, sem ferramentas de análise e sem fontes ou scripts carregados de terceiros.',
  },
];

export function SecaoPrivacidade({ idTitulo }: SecaoConfiguracaoProps) {
  return (
    <Painel aria-labelledby={idTitulo}>
      <CabecalhoPainel
        titulo={<span id={idTitulo}>Privacidade</span>}
        descricao="O que acontece com as senhas que passam por aqui."
      />
      <ul className={estilos.lista}>
        {compromissos.map(({ icone: Icone, titulo, descricao }) => (
          <li key={titulo} className={estilos.item}>
            <span className={estilos.icone} aria-hidden="true">
              <Icone size={18} strokeWidth={2} />
            </span>
            <span className={estilos.textos}>
              <span className={estilos.titulo}>{titulo}</span>
              <span className={estilos.descricao}>{descricao}</span>
            </span>
          </li>
        ))}
      </ul>
    </Painel>
  );
}
