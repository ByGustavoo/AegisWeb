import { createContext, useCallback, useContext, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';

interface ValorContextoSenhaParaAnalise {
  encaminhar: (senha: string) => void;
  retirar: () => string | null;
}

const ContextoSenhaParaAnalise = createContext<ValorContextoSenhaParaAnalise | null>(null);

export function ProvedorSenhaParaAnalise({ children }: { children: ReactNode }) {
  const senhaEncaminhada = useRef<string | null>(null);

  const encaminhar = useCallback((senha: string) => {
    senhaEncaminhada.current = senha;
  }, []);

  const retirar = useCallback(() => {
    const senha = senhaEncaminhada.current;
    senhaEncaminhada.current = null;
    return senha;
  }, []);

  const valor = useMemo(() => ({ encaminhar, retirar }), [encaminhar, retirar]);

  return <ContextoSenhaParaAnalise.Provider value={valor}>{children}</ContextoSenhaParaAnalise.Provider>;
}

export function useSenhaParaAnalise(): ValorContextoSenhaParaAnalise {
  const contexto = useContext(ContextoSenhaParaAnalise);
  if (!contexto) throw new Error('useSenhaParaAnalise precisa estar dentro de <ProvedorSenhaParaAnalise>.');
  return contexto;
}
