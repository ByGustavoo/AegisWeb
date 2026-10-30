import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { obterMedidorNavegador } from '@/componentes/impressao/medidorNavegador';
import type { DocumentoImpresso, FolhaCredenciais, MedirTexto } from '@/modelos/impressao';
import { montarDocumento } from '@/regras/impressao/paginacao';

export type FaseDocumento = 'PREPARANDO' | 'PRONTO' | 'FALHOU';

export function useDocumentoImpresso(folha: FolhaCredenciais) {
  const [medir, setMedir] = useState<MedirTexto | null>(null);
  const [falhou, setFalhou] = useState(false);
  const [data] = useState(() => new Date());
  const folhaAdiada = useDeferredValue(folha);

  useEffect(() => {
    let ativo = true;
    obterMedidorNavegador()
      .then((medidor) => {
        if (ativo) setMedir(() => medidor);
      })
      .catch(() => {
        if (ativo) setFalhou(true);
      });
    return () => {
      ativo = false;
    };
  }, []);

  const documento = useMemo<DocumentoImpresso | null>(
    () => (medir ? montarDocumento({ folha: folhaAdiada, medir, data }) : null),
    [data, folhaAdiada, medir],
  );

  const montarAgora = useCallback(
    (): DocumentoImpresso | null => (medir ? montarDocumento({ folha, medir, data }) : null),
    [data, folha, medir],
  );

  const fase: FaseDocumento = falhou ? 'FALHOU' : documento ? 'PRONTO' : 'PREPARANDO';
  return { documento, fase, montarAgora };
}
