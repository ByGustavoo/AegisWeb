import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { SEGUNDOS_PARA_LIMPAR_AREA_TRANSFERENCIA } from '@/configuracoes/geracao';

export type EstadoAreaTransferencia =
  | { fase: 'OCIOSA' }
  | { fase: 'COPIADA'; segundosRestantes: number }
  | { fase: 'AGUARDANDO_INTERACAO' }
  | { fase: 'LIMPA' }
  | { fase: 'NAO_LIMPOU' }
  | { fase: 'FALHOU' };

interface ValorContextoAreaTransferencia {
  estado: EstadoAreaTransferencia;
  copiar: (texto: string) => Promise<boolean>;
  limparAgora: () => void;
}

const ContextoAreaTransferencia = createContext<ValorContextoAreaTransferencia | null>(null);

const INTERVALO_CONTAGEM_MS = 1000;
const TEMPO_AVISO_LIMPEZA_MS = 4000;
const TEMPO_LIMITE_ESCRITA_MS = 2000;
const EVENTOS_DE_INTERACAO = ['pointerdown', 'pointerup', 'keydown'] as const;

function escreverComLimite(texto: string): Promise<void> {
  if (!navigator.clipboard?.writeText) {
    return Promise.reject(new Error('Este navegador não deixa a página escrever na área de transferência.'));
  }
  return Promise.race([
    navigator.clipboard.writeText(texto),
    new Promise<never>((_, rejeitar) => {
      window.setTimeout(() => rejeitar(new Error('A área de transferência não respondeu.')), TEMPO_LIMITE_ESCRITA_MS);
    }),
  ]);
}

function podeEscreverAgora(): boolean {
  const ativacao = navigator.userActivation;
  return document.hasFocus() && (ativacao ? ativacao.isActive : true);
}

export function ProvedorAreaTransferencia({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoAreaTransferencia>({ fase: 'OCIOSA' });
  const contagem = useRef(0);
  const avisoLimpeza = useRef(0);
  const limpezaNaInteracao = useRef<(() => void) | null>(null);

  const removerEsperaPorInteracao = useCallback(() => {
    const ouvinte = limpezaNaInteracao.current;
    if (!ouvinte) return;
    EVENTOS_DE_INTERACAO.forEach((evento) => window.removeEventListener(evento, ouvinte, true));
    limpezaNaInteracao.current = null;
  }, []);

  const pararTudo = useCallback(() => {
    window.clearInterval(contagem.current);
    window.clearTimeout(avisoLimpeza.current);
    removerEsperaPorInteracao();
  }, [removerEsperaPorInteracao]);

  const limparAgora = useCallback(() => {
    pararTudo();
    escreverComLimite('').then(
      () => {
        setEstado({ fase: 'LIMPA' });
        avisoLimpeza.current = window.setTimeout(() => setEstado({ fase: 'OCIOSA' }), TEMPO_AVISO_LIMPEZA_MS);
      },
      () => setEstado({ fase: 'NAO_LIMPOU' }),
    );
  }, [pararTudo]);

  const limparQuandoPuder = useCallback(() => {
    if (podeEscreverAgora()) {
      limparAgora();
      return;
    }
    setEstado({ fase: 'AGUARDANDO_INTERACAO' });
    const aoInteragir = () => {
      if (navigator.userActivation && !navigator.userActivation.isActive) return;
      limparAgora();
    };
    limpezaNaInteracao.current = aoInteragir;
    EVENTOS_DE_INTERACAO.forEach((evento) => window.addEventListener(evento, aoInteragir, true));
  }, [limparAgora]);

  const copiar = useCallback(
    async (texto: string) => {
      pararTudo();
      try {
        await escreverComLimite(texto);
      } catch {
        setEstado({ fase: 'FALHOU' });
        return false;
      }

      let restantes = SEGUNDOS_PARA_LIMPAR_AREA_TRANSFERENCIA;
      setEstado({ fase: 'COPIADA', segundosRestantes: restantes });
      contagem.current = window.setInterval(() => {
        restantes -= 1;
        if (restantes > 0) {
          setEstado({ fase: 'COPIADA', segundosRestantes: restantes });
          return;
        }
        window.clearInterval(contagem.current);
        limparQuandoPuder();
      }, INTERVALO_CONTAGEM_MS);
      return true;
    },
    [limparQuandoPuder, pararTudo],
  );

  useEffect(() => pararTudo, [pararTudo]);

  const valor = useMemo(() => ({ estado, copiar, limparAgora }), [estado, copiar, limparAgora]);

  return <ContextoAreaTransferencia.Provider value={valor}>{children}</ContextoAreaTransferencia.Provider>;
}

export function useAreaTransferencia(): ValorContextoAreaTransferencia {
  const contexto = useContext(ContextoAreaTransferencia);
  if (!contexto) throw new Error('useAreaTransferencia precisa estar dentro de <ProvedorAreaTransferencia>.');
  return contexto;
}
