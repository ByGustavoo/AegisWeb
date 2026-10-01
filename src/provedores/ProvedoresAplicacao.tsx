import type { ReactNode } from 'react';
import { ProvedorHistoricoSessao } from './ProvedorHistoricoSessao';
import { ProvedorTema } from './ProvedorTema';

export function ProvedoresAplicacao({ children }: { children: ReactNode }) {
  return (
    <ProvedorTema>
      <ProvedorHistoricoSessao>{children}</ProvedorHistoricoSessao>
    </ProvedorTema>
  );
}
