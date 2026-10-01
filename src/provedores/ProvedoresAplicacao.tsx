import type { ReactNode } from 'react';
import { ProvedorAreaTransferencia } from './ProvedorAreaTransferencia';
import { ProvedorHistoricoSessao } from './ProvedorHistoricoSessao';
import { ProvedorSenhaParaAnalise } from './ProvedorSenhaParaAnalise';
import { ProvedorTema } from './ProvedorTema';

export function ProvedoresAplicacao({ children }: { children: ReactNode }) {
  return (
    <ProvedorTema>
      <ProvedorAreaTransferencia>
        <ProvedorHistoricoSessao>
          <ProvedorSenhaParaAnalise>{children}</ProvedorSenhaParaAnalise>
        </ProvedorHistoricoSessao>
      </ProvedorAreaTransferencia>
    </ProvedorTema>
  );
}
