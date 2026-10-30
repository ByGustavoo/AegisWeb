export interface CampoCredencial {
  id: string;
  nome: string;
  valor: string;
}

export interface ContaCredencial {
  id: string;
  titulo: string;
  campos: CampoCredencial[];
}

export interface FolhaCredenciais {
  titulo: string;
  contas: ContaCredencial[];
  linhasParaPreencher: boolean;
}

export interface CampoImpresso {
  rotulo: string;
  valor: string | null;
}

export interface ContaImpressa {
  titulo: string;
  campos: CampoImpresso[];
}

export type EstiloTexto =
  | 'TITULO_DOCUMENTO'
  | 'META'
  | 'TITULO_PAGINA'
  | 'TITULO_CONTA'
  | 'AVISO_CARTAO'
  | 'ROTULO'
  | 'VALOR'
  | 'RODAPE'
  | 'ROTULO_LEGENDA'
  | 'AMOSTRA_RODAPE'
  | 'INICIAL'
  | 'NOME_MARCA'
  | 'NOME_MARCA_COMPACTO'
  | 'SLOGAN';

export type NomeIcone = 'EMAIL' | 'SENHA' | 'USUARIO' | 'CODIGO' | 'TELEFONE' | 'BANCO' | 'NOTA' | 'SITE' | 'CAMPO';

export type AlinhamentoTexto = 'INICIO' | 'MEIO' | 'FIM';

export type CantosArredondados = 'TODOS' | 'TOPO';

export type FonteImpressao = 'GEIST_REGULAR' | 'GEIST_MEDIO' | 'GEIST_FORTE' | 'GEIST_MONO';

export type CorImpressao = readonly [number, number, number];

export type MedirTexto = (texto: string, estilo: EstiloTexto) => number;

export interface LinhaValor {
  texto: string;
  espacoNaQuebra: boolean;
}

export type ElementoPagina =
  | {
      tipo: 'TEXTO';
      x: number;
      y: number;
      texto: string;
      estilo: EstiloTexto;
      cor?: CorImpressao;
      alinhamento?: AlinhamentoTexto;
    }
  | {
      tipo: 'VALOR';
      x: number;
      y: number;
      linha: LinhaValor;
      avanco: number;
      estilo: EstiloTexto;
    }
  | {
      tipo: 'RETANGULO';
      x: number;
      y: number;
      largura: number;
      altura: number;
      raio: number;
      preenchimento?: CorImpressao;
      borda?: CorImpressao;
      espessura?: number;
      cantos?: CantosArredondados;
    }
  | { tipo: 'CIRCULO'; x: number; y: number; raio: number; preenchimento: CorImpressao }
  | { tipo: 'POLIGONO'; pontos: [number, number][]; preenchimento: CorImpressao }
  | { tipo: 'ICONE'; x: number; y: number; tamanho: number; nome: NomeIcone; cor: CorImpressao }
  | { tipo: 'CADEADO'; x: number; y: number; cor: CorImpressao }
  | { tipo: 'LINHA'; x1: number; y1: number; x2: number; y2: number; cor: CorImpressao; espessura: number }
  | { tipo: 'MARCA'; x: number; y: number; tamanho: number };

export interface PaginaImpressa {
  elementos: ElementoPagina[];
}

export interface DocumentoImpresso {
  largura: number;
  altura: number;
  titulo: string;
  totalContas: number;
  paginas: PaginaImpressa[];
}
