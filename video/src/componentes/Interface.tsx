import type { CSSProperties, ReactNode } from 'react';
import { misturar } from '../animacao';
import { cores, fontes } from '../tema';

export function corDoCaractere(caractere: string): string {
  if (/[0-9]/.test(caractere)) return cores.numero;
  if (/[A-Za-zÀ-ÿ]/.test(caractere)) return cores.texto;
  return cores.simbolo;
}

export function SenhaColorida({ valor, estilo }: { valor: string; estilo?: CSSProperties }) {
  return (
    <span style={{ fontFamily: fontes.mono, whiteSpace: 'pre', ...estilo }}>
      {valor.split('').map((caractere, indice) => (
        <span key={indice} style={{ color: corDoCaractere(caractere) }}>
          {caractere}
        </span>
      ))}
    </span>
  );
}

interface MedidorProps {
  preenchimentos: number[];
  cor: string;
  altura?: number;
}

export function Medidor({ preenchimentos, cor, altura = 12 }: MedidorProps) {
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      {preenchimentos.map((preenchimento, indice) => (
        <div key={indice} style={{ flex: 1, height: altura, borderRadius: altura / 2, background: cores.forcaVazia, overflow: 'hidden' }}>
          <div style={{ width: `${preenchimento * 100}%`, height: '100%', borderRadius: altura / 2, background: cor }} />
        </div>
      ))}
    </div>
  );
}

export function Interruptor({ ligado }: { ligado: number }) {
  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-block',
        width: 64,
        height: 36,
        borderRadius: 18,
        background: `color-mix(in srgb, ${cores.destaque} ${ligado * 100}%, ${cores.forcaVazia})`,
        border: `1.5px solid color-mix(in srgb, ${cores.destaque} ${ligado * 100}%, ${cores.bordaForte})`,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 4,
          left: misturar(4, 31, ligado),
          width: 25,
          height: 25,
          borderRadius: '50%',
          background: ligado > 0.5 ? cores.destaqueContraste : cores.textoSecundario,
        }}
      />
    </span>
  );
}

interface BotaoProps {
  children: ReactNode;
  principal?: boolean;
  escala?: number;
  estilo?: CSSProperties;
}

export function Botao({ children, principal = false, escala = 1, estilo }: BotaoProps) {
  return (
    <span
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: '18px 32px',
        borderRadius: 16,
        fontFamily: fontes.texto,
        fontSize: 26,
        fontWeight: 600,
        background: principal ? cores.destaque : 'transparent',
        color: principal ? cores.destaqueContraste : cores.texto,
        border: principal ? 'none' : `1.5px solid ${cores.bordaForte}`,
        boxShadow: principal ? '0 12px 30px -12px rgba(79, 209, 182, 0.6)' : undefined,
        transform: `scale(${escala})`,
        ...estilo,
      }}
    >
      {children}
    </span>
  );
}

export function Aviso({ children, icone }: { children: ReactNode; icone: ReactNode }) {
  return (
    <span
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '16px 26px',
        borderRadius: 999,
        background: cores.superficieSuave,
        border: `1.5px solid ${cores.bordaForte}`,
        fontFamily: fontes.texto,
        fontSize: 24,
        color: cores.texto,
        boxShadow: '0 20px 40px -20px rgba(0, 0, 0, 0.8)',
      }}
    >
      {icone}
      {children}
    </span>
  );
}

export function pressao(quadro: number, clique: number): number {
  if (quadro < clique || quadro > clique + 6) return 1;
  return 1 - 0.06 * Math.sin((Math.PI * (quadro - clique)) / 6);
}
