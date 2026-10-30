import type { ReactNode } from 'react';
import { CLASSE_CASCATA, comIndice } from '@/utilitarios/cascata';
import { juntarClasses } from '@/utilitarios/juntarClasses';
import estilos from './CabecalhoPagina.module.css';

export interface CabecalhoPaginaProps {
  titulo: string;
  descricao?: ReactNode;
  sobretitulo?: string;
  acoes?: ReactNode;
  descricaoLivre?: boolean;
}

export function CabecalhoPagina({ titulo, descricao, sobretitulo, acoes, descricaoLivre = false }: CabecalhoPaginaProps) {
  return (
    <div className={estilos.cabecalhoPagina}>
      <div className={estilos.textos}>
        {sobretitulo ? (
          <p className={juntarClasses(estilos.sobretitulo, CLASSE_CASCATA)} style={comIndice(0)}>
            {sobretitulo}
          </p>
        ) : null}
        <h1 className={juntarClasses(estilos.titulo, CLASSE_CASCATA)} style={comIndice(1)}>
          {titulo}
        </h1>
        {descricao ? (
          <p
            className={juntarClasses(estilos.descricao, descricaoLivre && estilos.descricaoLivre, CLASSE_CASCATA)}
            style={comIndice(2)}
          >
            {descricao}
          </p>
        ) : null}
      </div>
      {acoes ? (
        <div className={juntarClasses(estilos.acoes, CLASSE_CASCATA)} style={comIndice(2)}>
          {acoes}
        </div>
      ) : null}
    </div>
  );
}
