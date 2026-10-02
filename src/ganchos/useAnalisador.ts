import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import type { AnaliseSenha, Dicionarios } from '@/modelos/analise';
import { analisarSenha } from '@/regras/analise/analisarSenha';
import { carregarDicionarios } from '@/regras/analise/dicionarios';

type EstadoDicionarios = { fase: 'CARREGANDO' } | { fase: 'PRONTO'; dicionarios: Dicionarios } | { fase: 'FALHOU' };

export interface ResultadoAnalisador {
  fase: EstadoDicionarios['fase'];
  analise: AnaliseSenha | null;
  tentarDeNovo: () => void;
}

export function useAnalisador(senha: string): ResultadoAnalisador {
  const [estado, setEstado] = useState<EstadoDicionarios>({ fase: 'CARREGANDO' });
  const [tentativa, setTentativa] = useState(0);
  const senhaAdiada = useDeferredValue(senha);
  const anoReferencia = useMemo(() => new Date().getFullYear(), []);

  useEffect(() => {
    let ativo = true;
    setEstado({ fase: 'CARREGANDO' });
    carregarDicionarios().then(
      (dicionarios) => {
        if (ativo) setEstado({ fase: 'PRONTO', dicionarios });
      },
      () => {
        if (ativo) setEstado({ fase: 'FALHOU' });
      },
    );
    return () => {
      ativo = false;
    };
  }, [tentativa]);

  const analise = useMemo(
    () => (estado.fase === 'PRONTO' ? analisarSenha(senhaAdiada, estado.dicionarios, anoReferencia) : null),
    [estado, senhaAdiada, anoReferencia],
  );

  const tentarDeNovo = useCallback(() => setTentativa((atual) => atual + 1), []);

  return { fase: estado.fase, analise, tentarDeNovo };
}
