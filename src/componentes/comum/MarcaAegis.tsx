import { juntarClasses } from '@/utilitarios/juntarClasses';
import estilos from './MarcaAegis.module.css';

interface MarcaAegisProps {
  tamanho?: number;
  animarEntrada?: boolean;
}

export function MarcaAegis({ tamanho = 32, animarEntrada = false }: MarcaAegisProps) {
  return (
    <svg
      className={juntarClasses(estilos.marca, animarEntrada && estilos.entrando)}
      width={tamanho}
      height={tamanho}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="32" height="32" rx="9" className={estilos.fundo} />
      <path
        d="M16 6.4 23.6 9.2v6.3c0 4.7-3.1 8.2-7.6 10.1-4.5-1.9-7.6-5.4-7.6-10.1V9.2z"
        className={estilos.escudo}
        pathLength={1}
      />
      <path d="M12.7 19.2 16 12.4l3.3 6.8" className={estilos.chevron} pathLength={1} />
    </svg>
  );
}
