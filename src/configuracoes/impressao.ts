import type { CorImpressao, EstiloTexto, FonteImpressao } from '@/modelos/impressao';
import type { TipoGeracao } from '@/modelos/senha';
import { NOME_APLICACAO, SLOGAN_APLICACAO } from './aplicacao';

export const TITULO_DOCUMENTO_PADRAO = 'Minhas credenciais';
export const TAMANHO_MAXIMO_TITULO_DOCUMENTO = 80;

export const ATALHOS_CAMPO = ['E-mail', 'Usuário', 'Senha', 'Código de recuperação', 'Observação'] as const;

export const NOMES_CAMPO_SUGERIDOS = [
  'E-mail',
  'Usuário',
  'Senha',
  'PIN',
  'Telefone',
  'Agência',
  'Conta',
  'Código de acesso',
  'Código de recuperação',
  'Palavra-chave',
  'Pergunta de segurança',
  'Resposta de segurança',
  'Site',
  'Observação',
];

export const NOME_CAMPO_POR_TIPO_GERADO: Record<TipoGeracao, string> = {
  SENHA: 'Senha',
  FRASE_SENHA: 'Senha',
  PIN: 'PIN',
};

export const SEGUNDOS_PARA_DESFAZER_REMOCAO = 8;

export const CORES_IMPRESSAO = {
  papel: [255, 255, 255],
  texto: [17, 22, 26],
  secundario: [74, 83, 92],
  terciario: [93, 102, 112],
  borda: [199, 205, 210],
  divisoria: [225, 229, 232],
  destaque: [11, 107, 93],
  faixaCabecalho: [233, 244, 241],
  faixaCartao: [245, 247, 248],
  caixaValor: [246, 247, 248],
  bordaCaixaValor: [232, 235, 238],
  pontosFaixa: [196, 222, 214],
  pontosCanto: [150, 199, 185],
  numero: [29, 95, 204],
  simbolo: [138, 63, 192],
  linhaParaPreencher: [130, 139, 148],
  marcaTraco: [255, 255, 255],
} as const satisfies Record<string, CorImpressao>;

export const PALETA_CONTAS: CorImpressao[] = [
  [11, 107, 93],
  [29, 95, 204],
  [124, 58, 178],
  [166, 96, 0],
  [192, 64, 46],
  [74, 83, 92],
];

export interface DescricaoFonteImpressao {
  familiaNavegador: string;
  peso: number;
  nomePdf: string;
  monoespacada: boolean;
}

export const FONTES_IMPRESSAO: Record<FonteImpressao, DescricaoFonteImpressao> = {
  GEIST_REGULAR: { familiaNavegador: 'Geist Variable', peso: 400, nomePdf: 'GeistRegular', monoespacada: false },
  GEIST_MEDIO: { familiaNavegador: 'Geist Variable', peso: 500, nomePdf: 'GeistMedium', monoespacada: false },
  GEIST_FORTE: { familiaNavegador: 'Geist Variable', peso: 600, nomePdf: 'GeistSemiBold', monoespacada: false },
  GEIST_MONO: { familiaNavegador: 'Geist Mono Variable', peso: 500, nomePdf: 'GeistMonoMedium', monoespacada: true },
};

export interface DescricaoEstiloTexto {
  fonte: FonteImpressao;
  tamanho: number;
  entrelinha: number;
  espacamentoLetras: number;
  caixaAlta: boolean;
  cor: CorImpressao;
}

export const ESTILOS_TEXTO: Record<EstiloTexto, DescricaoEstiloTexto> = {
  TITULO_DOCUMENTO: {
    fonte: 'GEIST_FORTE',
    tamanho: 16,
    entrelinha: 19,
    espacamentoLetras: 0,
    caixaAlta: false,
    cor: CORES_IMPRESSAO.texto,
  },
  META: { fonte: 'GEIST_REGULAR', tamanho: 8.5, entrelinha: 11, espacamentoLetras: 0, caixaAlta: false, cor: CORES_IMPRESSAO.secundario },
  TITULO_PAGINA: {
    fonte: 'GEIST_MEDIO',
    tamanho: 8.5,
    entrelinha: 11,
    espacamentoLetras: 0,
    caixaAlta: false,
    cor: CORES_IMPRESSAO.secundario,
  },
  TITULO_CONTA: {
    fonte: 'GEIST_FORTE',
    tamanho: 10.5,
    entrelinha: 13.5,
    espacamentoLetras: 0,
    caixaAlta: false,
    cor: CORES_IMPRESSAO.texto,
  },
  AVISO_CARTAO: {
    fonte: 'GEIST_REGULAR',
    tamanho: 7.5,
    entrelinha: 10,
    espacamentoLetras: 0,
    caixaAlta: false,
    cor: CORES_IMPRESSAO.terciario,
  },
  ROTULO: {
    fonte: 'GEIST_MEDIO',
    tamanho: 7.5,
    entrelinha: 9.5,
    espacamentoLetras: 0.45,
    caixaAlta: true,
    cor: CORES_IMPRESSAO.secundario,
  },
  VALOR: { fonte: 'GEIST_MONO', tamanho: 10, entrelinha: 13.5, espacamentoLetras: 0, caixaAlta: false, cor: CORES_IMPRESSAO.texto },
  ROTULO_LEGENDA: {
    fonte: 'GEIST_MEDIO',
    tamanho: 7.5,
    entrelinha: 10,
    espacamentoLetras: 0,
    caixaAlta: false,
    cor: CORES_IMPRESSAO.secundario,
  },
  RODAPE: { fonte: 'GEIST_REGULAR', tamanho: 7.5, entrelinha: 10, espacamentoLetras: 0, caixaAlta: false, cor: CORES_IMPRESSAO.terciario },
  AMOSTRA_RODAPE: {
    fonte: 'GEIST_MONO',
    tamanho: 8,
    entrelinha: 10,
    espacamentoLetras: 0,
    caixaAlta: false,
    cor: CORES_IMPRESSAO.texto,
  },
  NOME_MARCA: {
    fonte: 'GEIST_FORTE',
    tamanho: 13,
    entrelinha: 15,
    espacamentoLetras: 0,
    caixaAlta: false,
    cor: CORES_IMPRESSAO.texto,
  },
  NOME_MARCA_COMPACTO: {
    fonte: 'GEIST_FORTE',
    tamanho: 9.5,
    entrelinha: 11,
    espacamentoLetras: 0,
    caixaAlta: false,
    cor: CORES_IMPRESSAO.texto,
  },
  SLOGAN: { fonte: 'GEIST_REGULAR', tamanho: 7.5, entrelinha: 9.5, espacamentoLetras: 0, caixaAlta: false, cor: CORES_IMPRESSAO.secundario },
  INICIAL: { fonte: 'GEIST_FORTE', tamanho: 8.5, entrelinha: 10, espacamentoLetras: 0, caixaAlta: true, cor: CORES_IMPRESSAO.papel },
};

export const PROPORCAO_ALTURA_MAIUSCULA = 0.71;

export const PAGINA_A4 = { largura: 595.28, altura: 841.89 } as const;

export const GEOMETRIA_DOCUMENTO = {
  margem: 42.52,
  colunas: 2,
  espacoEntreColunas: 14,
  folgaMedicao: 0.985,
  cabecalho: { marca: 26, espacoMarcaNome: 8, respiro: 14, espacoMetaTitulo: 2, espacoTituloMarca: 24, espacoAbaixo: 14, raio: 7 },
  cabecalhoCompacto: { marca: 14, espacoMarcaNome: 5, respiro: 7, espacoTituloMarca: 16, espacoAbaixo: 12, raio: 5 },
  rodape: {
    espacoAcima: 12,
    legendaPaddingX: 9,
    legendaPaddingY: 5,
    espacoEntreLinhas: 3,
    colunaRotulo: 10,
    etiquetaPaddingX: 2.5,
    etiquetaAltura: 9.5,
    espacoEtiquetaTexto: 3.5,
    espacoSeparador: 5,
    espacoLegendaAviso: 7,
    larguraCadeado: 9,
    raioLegenda: 4,
    raioEtiqueta: 2,
  },
  raioCartao: 5,
  larguraBarraConta: 3,
  icone: { tamanho: 8, espacoRotulo: 3.5, espessura: 2 },
  pontosFaixa: { passo: 7, raio: 0.8, inicio: 0.3 },
  pontosCanto: { alcance: 230, folgaCartao: 4, curva: 1.15 },
  raioCaixaValor: 3,
  diametroInicial: 16,
  espacoInicialTitulo: 7,
  espessuraBorda: 0.6,
  espessuraDivisoria: 0.5,
  alturaLinhaParaPreencher: 18,
  limiarDivisaoParaEvitarVazio: 0.4,
} as const;

export interface EspacamentoCartao {
  entreCartoes: number;
  paddingX: number;
  faixaPaddingY: number;
  corpoPaddingTopo: number;
  paddingBase: number;
  entreCampos: number;
  rotuloParaValor: number;
  caixaValorPaddingX: number;
  caixaValorPaddingY: number;
}

export const ESPACAMENTO_NORMAL: EspacamentoCartao = {
  entreCartoes: 10,
  paddingX: 10,
  faixaPaddingY: 7,
  corpoPaddingTopo: 9,
  paddingBase: 10,
  entreCampos: 7,
  rotuloParaValor: 3,
  caixaValorPaddingX: 6,
  caixaValorPaddingY: 3,
};

export const ESPACAMENTO_COMPACTO: EspacamentoCartao = {
  entreCartoes: 7,
  paddingX: 9,
  faixaPaddingY: 5.5,
  corpoPaddingTopo: 7,
  paddingBase: 8,
  entreCampos: 5,
  rotuloParaValor: 2.5,
  caixaValorPaddingX: 5,
  caixaValorPaddingY: 2,
};

export const TEXTOS_DOCUMENTO = {
  semTitulo: 'Sem título',
  continuacao: 'Continuação',
  continuaNaColuna: 'Continua na próxima coluna',
  continuaNaPagina: 'Continua na próxima página',
  sufixoParteCampo: ' (continuação)',
  confidencial: 'Confidencial - Guarde em local seguro e destrua quando não precisar mais.',
  geradoEm: 'Gerado em',
  nomeMarca: NOME_APLICACAO,
  slogan: SLOGAN_APLICACAO,
  rotuloLegenda: 'Caracteres parecidos',
  rotuloCores: 'Cores',
  separadorLegenda: '-',
} as const;

export interface ItemLegenda {
  amostra: string;
  descricao: string;
}

export const LEGENDA_CARACTERES: ItemLegenda[] = [
  { amostra: '0', descricao: 'zero' },
  { amostra: 'O', descricao: 'letra O' },
  { amostra: '1', descricao: 'um' },
  { amostra: 'l', descricao: 'L minúsculo' },
  { amostra: 'I', descricao: 'i maiúsculo' },
  { amostra: '', descricao: 'espaço na quebra de linha' },
];

export const LEGENDA_CORES: ItemLegenda[] = [
  { amostra: '123', descricao: 'números' },
  { amostra: '#@', descricao: 'símbolos' },
];
