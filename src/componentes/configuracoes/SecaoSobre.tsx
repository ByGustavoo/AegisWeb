import { CabecalhoPainel, Painel } from '@/componentes/ui';
import { ambiente } from '@/configuracoes/ambiente';
import { NOME_APLICACAO } from '@/configuracoes/aplicacao';
import { formatarDataLonga, formatarVersao } from '@/utilitarios/formatacao';
import { juntarClasses } from '@/utilitarios/juntarClasses';
import type { SecaoConfiguracaoProps } from './SecaoAparencia';
import estilos from './SecaoSobre.module.css';

export function SecaoSobre({ idTitulo }: SecaoConfiguracaoProps) {
  const versao = formatarVersao(ambiente.versao);
  const lancamento = formatarDataLonga(ambiente.dataLancamento);

  return (
    <Painel aria-labelledby={idTitulo}>
      <CabecalhoPainel titulo={<span id={idTitulo}>Sobre</span>} />
      <dl className={estilos.lista}>
        <div className={estilos.linha}>
          <dt>Versão do {NOME_APLICACAO}</dt>
          <dd className={juntarClasses(estilos.valor, ambiente.versao && 'mono')}>{versao}</dd>
        </div>
        <div className={estilos.linha}>
          <dt>Lançamento</dt>
          <dd className={estilos.valor}>{lancamento ?? 'Versão local, ainda não publicada'}</dd>
        </div>
      </dl>
    </Painel>
  );
}
