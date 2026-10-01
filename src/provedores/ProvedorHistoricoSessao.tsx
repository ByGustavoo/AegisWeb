import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { TAMANHO_HISTORICO_SESSAO } from '@/configuracoes/geracao';
import type { SenhaGerada, TipoGeracao } from '@/modelos/senha';

interface ValorContextoHistoricoSessao {
  senhas: SenhaGerada[];
  registrar: (valor: string, tipo: TipoGeracao) => void;
  remover: (id: string) => void;
  limpar: () => void;
}

const ContextoHistoricoSessao = createContext<ValorContextoHistoricoSessao | null>(null);

export function ProvedorHistoricoSessao({ children }: { children: ReactNode }) {
  const [senhas, setSenhas] = useState<SenhaGerada[]>([]);

  const registrar = useCallback((valor: string, tipo: TipoGeracao) => {
    setSenhas((atuais) => {
      if (atuais[0]?.valor === valor) return atuais;
      const nova: SenhaGerada = { id: crypto.randomUUID(), valor, tipo, geradaEm: new Date().toISOString() };
      return [nova, ...atuais.filter((senha) => senha.valor !== valor)].slice(0, TAMANHO_HISTORICO_SESSAO);
    });
  }, []);

  const remover = useCallback((id: string) => {
    setSenhas((atuais) => atuais.filter((senha) => senha.id !== id));
  }, []);

  const limpar = useCallback(() => setSenhas([]), []);

  const valor = useMemo(() => ({ senhas, registrar, remover, limpar }), [senhas, registrar, remover, limpar]);

  return <ContextoHistoricoSessao.Provider value={valor}>{children}</ContextoHistoricoSessao.Provider>;
}

export function useHistoricoSessao(): ValorContextoHistoricoSessao {
  const contexto = useContext(ContextoHistoricoSessao);
  if (!contexto) throw new Error('useHistoricoSessao precisa estar dentro de <ProvedorHistoricoSessao>.');
  return contexto;
}
