import { cores } from '../tema';

interface MarcaAnimadaProps {
  tamanho: number;
  tracoEscudo: number;
  tracoChevron: number;
}

export function MarcaAnimada({ tamanho, tracoEscudo, tracoChevron }: MarcaAnimadaProps) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 32 32" style={{ display: 'block', overflow: 'visible' }}>
      <rect width="32" height="32" rx="9" fill={cores.marcaFundo} />
      <path
        d="M16 6.4 23.6 9.2v6.3c0 4.7-3.1 8.2-7.6 10.1-4.5-1.9-7.6-5.4-7.6-10.1V9.2z"
        fill="none"
        stroke={cores.marcaTraco}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - tracoEscudo}
        opacity={tracoEscudo > 0 ? 1 : 0}
      />
      <path
        d="M12.7 19.2 16 12.4l3.3 6.8"
        fill="none"
        stroke={cores.marcaTraco}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - tracoChevron}
        opacity={tracoChevron > 0 ? 1 : 0}
      />
    </svg>
  );
}
