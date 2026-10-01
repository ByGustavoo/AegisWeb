import type { CSSProperties } from 'react';
import { juntarClasses } from '@/utilitarios/juntarClasses';
import estilos from './Esqueleto.module.css';

export interface EsqueletoProps {
  largura?: string;
  altura?: string;
  arredondado?: boolean;
  animado?: boolean;
  className?: string;
}

export function Esqueleto({
  largura = '100%',
  altura = '1rem',
  arredondado = false,
  animado = true,
  className,
}: EsqueletoProps) {
  const estilo = { '--largura': largura, '--altura': altura } as CSSProperties;
  return (
    <span
      className={juntarClasses(estilos.esqueleto, arredondado && estilos.arredondado, !animado && estilos.estatico, className)}
      style={estilo}
      aria-hidden="true"
    />
  );
}

export function EsqueletoPagina({ rotulo }: { rotulo: string }) {
  return (
    <div className={estilos.pagina} role="status" aria-label={rotulo}>
      <Esqueleto largura="14rem" altura="2rem" />
      <Esqueleto largura="24rem" altura="1rem" />
      <Esqueleto altura="10rem" className={estilos.bloco} />
    </div>
  );
}
