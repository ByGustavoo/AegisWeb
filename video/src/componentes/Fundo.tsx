import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { curvaEntradaSaida, progresso } from '../animacao';
import { abertura, cenas, DURACAO_TOTAL, ordemCenas } from '../linhaDoTempo';
import type { NomeCena } from '../linhaDoTempo';
import { cores } from '../tema';

const CAMINHO_ESCUDO = 'M16 6.4 23.6 9.2v6.3c0 4.7-3.1 8.2-7.6 10.1-4.5-1.9-7.6-5.4-7.6-10.1V9.2z';

const marcos = [...ordemCenas.map((nome) => cenas[nome].inicio), DURACAO_TOTAL];

const ajustesPorCena: Record<NomeCena, { x: number; y: number; brilho: number; escudos: number }> = {
  abertura: { x: 50, y: 46, brilho: 0.55, escudos: 1 },
  problema: { x: 50, y: 60, brilho: 0.35, escudos: 0.45 },
  gerador: { x: 72, y: 50, brilho: 0.42, escudos: 0.3 },
  tipos: { x: 40, y: 55, brilho: 0.38, escudos: 0.25 },
  finalidades: { x: 72, y: 48, brilho: 0.42, escudos: 0.3 },
  copiar: { x: 70, y: 55, brilho: 0.4, escudos: 0.3 },
  analisador: { x: 30, y: 48, brilho: 0.42, escudos: 0.3 },
  melhorar: { x: 60, y: 60, brilho: 0.38, escudos: 0.25 },
  privacidade: { x: 50, y: 46, brilho: 0.5, escudos: 0.85 },
  encerramento: { x: 50, y: 44, brilho: 0.65, escudos: 1 },
};

function valoresPorMarcos(campo: 'x' | 'y' | 'brilho' | 'escudos'): number[] {
  const valores = ordemCenas.map((nome) => ajustesPorCena[nome][campo]);
  return [...valores, valores[valores.length - 1] ?? 0];
}

function porMarcos(quadro: number, valores: number[]): number {
  return interpolate(quadro, marcos, valores, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: curvaEntradaSaida,
  });
}

export function Fundo() {
  const quadro = useCurrentFrame();
  const brilhoX = porMarcos(quadro, valoresPorMarcos('x'));
  const brilhoY = porMarcos(quadro, valoresPorMarcos('y'));
  const brilhoForca = porMarcos(quadro, valoresPorMarcos('brilho'));
  const presencaEscudos = porMarcos(quadro, valoresPorMarcos('escudos'));
  const escalaEscudos = interpolate(quadro, [0, DURACAO_TOTAL], [1, 1.12]);

  return (
    <AbsoluteFill style={{ background: cores.fundo, overflow: 'hidden' }}>
      <AbsoluteFill
        style={{
          backgroundImage:
            'linear-gradient(rgba(232, 236, 238, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(232, 236, 238, 0.035) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          backgroundPosition: `${quadro * 0.25}px ${quadro * 0.4}px`,
          maskImage: 'radial-gradient(ellipse 70% 65% at 50% 50%, black 20%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 65% at 50% 50%, black 20%, transparent 75%)',
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle 720px at ${brilhoX}% ${brilhoY}%, rgba(79, 209, 182, ${0.16 * brilhoForca}), transparent 70%)`,
        }}
      />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        {[0, 1, 2].map((indice) => {
          const entrada = progresso(quadro, abertura.escudosFundo + indice * 6, 40);
          const tamanho = 620 + indice * 260;
          return (
            <svg
              key={indice}
              width={tamanho}
              height={tamanho * 1.25}
              viewBox="8 6 16 20"
              style={{
                position: 'absolute',
                overflow: 'visible',
                opacity: entrada * presencaEscudos * (0.9 - indice * 0.22),
                transform: `scale(${(0.7 + 0.3 * entrada) * escalaEscudos})`,
              }}
            >
              <path
                d={CAMINHO_ESCUDO}
                fill="none"
                stroke={cores.linhaEscudo}
                strokeWidth={1.5}
                vectorEffect="non-scaling-stroke"
                strokeLinejoin="round"
              />
            </svg>
          );
        })}
      </AbsoluteFill>
      <AbsoluteFill
        style={{ background: 'radial-gradient(ellipse 85% 80% at 50% 50%, transparent 55%, rgba(0, 0, 0, 0.55) 100%)' }}
      />
    </AbsoluteFill>
  );
}
