import { Fragment } from 'react';
import type { CSSProperties } from 'react';
import { DESCRICAO_APLICACAO } from '@/configuracoes/aplicacao';
import { juntarClasses } from '@/utilitarios/juntarClasses';
import estilos from './DescricaoAegis.module.css';

const PALAVRAS_DA_DESCRICAO = DESCRICAO_APLICACAO.split(' ');

export function DescricaoAegis({ className }: { className?: string }) {
  return (
    <span className={juntarClasses(estilos.descricao, className)}>
      {PALAVRAS_DA_DESCRICAO.map((palavra, indice) => (
        <Fragment key={`${palavra}-${indice}`}>
          <span className={estilos.palavra} style={{ '--i': indice } as CSSProperties}>
            {palavra}
          </span>
          {indice < PALAVRAS_DA_DESCRICAO.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </span>
  );
}
