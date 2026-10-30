import type { ReactNode } from 'react';
import { ProvedorAreaTransferencia } from './ProvedorAreaTransferencia';
import { ProvedorFolhaImpressao } from './ProvedorFolhaImpressao';
import { ProvedorHistoricoSessao } from './ProvedorHistoricoSessao';
import { ProvedorSenhaParaAnalise } from './ProvedorSenhaParaAnalise';
import { ProvedorTema } from './ProvedorTema';

export function ProvedoresAplicacao({ children }: { children: ReactNode }) {
  return (
    <ProvedorTema>
      <ProvedorAreaTransferencia>
        <ProvedorHistoricoSessao>
          <ProvedorSenhaParaAnalise>
            <ProvedorFolhaImpressao>{children}</ProvedorFolhaImpressao>
          </ProvedorSenhaParaAnalise>
        </ProvedorHistoricoSessao>
      </ProvedorAreaTransferencia>
    </ProvedorTema>
  );
}
