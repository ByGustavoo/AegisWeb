import type { CSSProperties } from 'react';
import { NOME_APLICACAO } from '@/configuracoes/aplicacao';
import { juntarClasses } from '@/utilitarios/juntarClasses';
import estilos from './NomeAegis.module.css';

const LETRAS_DO_NOME = [...NOME_APLICACAO];

export function NomeAegis({ className }: { className?: string }) {
  return (
    <span className={juntarClasses(estilos.nome, className)} aria-hidden="true">
      {LETRAS_DO_NOME.map((letra, indice) => (
        <span key={`${letra}-${indice}`} className={estilos.letra} style={{ '--i': indice } as CSSProperties}>
          {letra}
        </span>
      ))}
    </span>
  );
}
