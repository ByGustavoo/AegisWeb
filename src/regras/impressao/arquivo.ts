import { TITULO_DOCUMENTO_PADRAO } from '@/configuracoes/impressao';

const TAMANHO_MAXIMO_NOME = 150;
const CARACTERES_PROIBIDOS = /[\\/:*?"<>|\u0000-\u001F\u007F]/gu;

export function nomeDoArquivo(titulo: string): string {
  const nome = Array.from(titulo.replace(CARACTERES_PROIBIDOS, '').replace(/\s+/gu, ' ').trim())
    .slice(0, TAMANHO_MAXIMO_NOME)
    .join('')
    .replace(/[\s.]+$/u, '');
  return `${nome || TITULO_DOCUMENTO_PADRAO}.pdf`;
}
