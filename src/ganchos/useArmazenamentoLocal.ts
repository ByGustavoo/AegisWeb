import { useCallback, useState } from 'react';
import { gravarArmazenamentoLocal, lerArmazenamentoLocal } from './armazenamentoLocal';

export function useArmazenamentoLocal<T>(chave: string, valorPadrao: T) {
  const [valor, setValor] = useState<T>(() => lerArmazenamentoLocal(chave, valorPadrao));

  const atualizar = useCallback(
    (proximo: T) => {
      setValor(proximo);
      gravarArmazenamentoLocal(chave, proximo);
    },
    [chave],
  );

  return [valor, atualizar] as const;
}
