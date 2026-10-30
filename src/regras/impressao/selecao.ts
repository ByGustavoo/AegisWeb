import { TEXTOS_DOCUMENTO } from '@/configuracoes/impressao';
import type { CampoCredencial, CampoImpresso, ContaCredencial, ContaImpressa, FolhaCredenciais } from '@/modelos/impressao';

export function temConteudo(texto: string): boolean {
  return texto.trim().length > 0;
}

const CARACTERES_DE_CONTROLE = /[\u0000-\u0008\u000B-\u001F\u007F]/gu;

function prepararTexto(texto: string): string {
  return texto.normalize('NFC').replace(/\r\n?/g, '\n').replace(/\t/g, ' ').replace(CARACTERES_DE_CONTROLE, '');
}

function prepararValor(valor: string): string {
  return prepararTexto(valor).replace(/\n+$/u, '');
}

function campoParaImprimir(campo: CampoCredencial, linhasParaPreencher: boolean): CampoImpresso | null {
  const rotulo = prepararTexto(campo.nome).trim().replace(/\s+/gu, ' ');
  if (temConteudo(campo.valor)) return { rotulo, valor: prepararValor(campo.valor) };
  if (linhasParaPreencher && rotulo) return { rotulo, valor: null };
  return null;
}

export function contaVaiParaImpressao(conta: ContaCredencial, linhasParaPreencher: boolean): boolean {
  return conta.campos.some((campo) => campoParaImprimir(campo, linhasParaPreencher) !== null);
}

export function selecionarContas(folha: FolhaCredenciais): ContaImpressa[] {
  return folha.contas.flatMap((conta) => {
    const campos = conta.campos
      .map((campo) => campoParaImprimir(campo, folha.linhasParaPreencher))
      .filter((campo): campo is CampoImpresso => campo !== null);
    if (campos.length === 0) return [];
    const titulo = prepararTexto(conta.titulo).trim().replace(/\s+/gu, ' ');
    return [{ titulo: titulo || TEXTOS_DOCUMENTO.semTitulo, campos }];
  });
}

export function contaTemDados(conta: ContaCredencial): boolean {
  return temConteudo(conta.titulo) || conta.campos.some((campo) => temConteudo(campo.nome) || temConteudo(campo.valor));
}

export function folhaTemDados(folha: FolhaCredenciais): boolean {
  return temConteudo(folha.titulo) || folha.contas.some(contaTemDados);
}
