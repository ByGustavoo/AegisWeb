import { CabecalhoPainel, Painel } from '@/componentes/ui';
import { ambiente } from '@/configuracoes/ambiente';
import { CLASSE_CASCATA, comIndice } from '@/utilitarios/cascata';
import { formatarDataLonga, formatarVersao } from '@/utilitarios/formatacao';
import type { SecaoConfiguracaoProps } from './SecaoAparencia';
import estilos from './SecaoVersoes.module.css';

export function SecaoVersoes({ idTitulo, indiceCascata }: SecaoConfiguracaoProps) {
  const data = ambiente.dataLancamento ? formatarDataLonga(ambiente.dataLancamento) : null;

  return (
    <Painel aria-labelledby={idTitulo} className={CLASSE_CASCATA} style={comIndice(indiceCascata)}>
      <CabecalhoPainel titulo={<span id={idTitulo}>Versões</span>} />
      <dl className={estilos.lista}>
        <div className={estilos.linha}>
          <dt>Web</dt>
          <dd className={estilos.valor}>
            {ambiente.versao ? (
              <span className={estilos.numero}>{formatarVersao(ambiente.versao)}</span>
            ) : (
              <span className={estilos.secundario}>Versão de desenvolvimento</span>
            )}
          </dd>
        </div>
        <div className={estilos.linha}>
          <dt>Lançada em</dt>
          <dd className={estilos.valor}>
            {data ?? (
              <span className={estilos.secundario}>{ambiente.versao ? 'Data não informada' : 'Ainda não publicada'}</span>
            )}
          </dd>
        </div>
      </dl>
    </Painel>
  );
}
