import { NOME_APLICACAO, SLOGAN_APLICACAO } from '@/configuracoes/aplicacao';

export function definirTituloDocumento(titulo: string): void {
  const proximo = titulo ? `${titulo} · ${NOME_APLICACAO}` : `${NOME_APLICACAO} · ${SLOGAN_APLICACAO}`;
  if (document.title !== proximo) document.title = proximo;
}
