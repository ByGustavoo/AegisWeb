import { useEffect, useState } from 'react';

const CONSULTA = '(prefers-reduced-motion: reduce)';

export function useMovimentoReduzido(): boolean {
  const [reduzido, setReduzido] = useState(() => window.matchMedia(CONSULTA).matches);

  useEffect(() => {
    const lista = window.matchMedia(CONSULTA);
    const atualizar = (evento: MediaQueryListEvent) => setReduzido(evento.matches);
    lista.addEventListener('change', atualizar);
    return () => lista.removeEventListener('change', atualizar);
  }, []);

  return reduzido;
}
