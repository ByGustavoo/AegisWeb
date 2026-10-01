import { useEffect } from 'react';
import { definirTituloDocumento } from '@/utilitarios/tituloDocumento';

export function useTituloDocumento(titulo: string): void {
  useEffect(() => {
    definirTituloDocumento(titulo);
  }, [titulo]);
}
