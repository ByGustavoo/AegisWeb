import type { NivelForca } from './senha';

export type OrigemDicionario = 'SENHAS_COMUNS' | 'PALAVRAS_PORTUGUES' | 'PALAVRAS_INGLES' | 'NOMES' | 'PALAVRAS_AEGIS';

export type TipoPadrao =
  | 'SENHA_COMUM'
  | 'PALAVRA'
  | 'NOME'
  | 'FRASE'
  | 'SEQUENCIA'
  | 'TECLADO'
  | 'REPETICAO'
  | 'DATA'
  | 'ANO'
  | 'ALEATORIO';

export type UsoMaiusculas = 'NENHUMA' | 'PRIMEIRA' | 'ULTIMA' | 'TODAS' | 'MISTA';

export interface Correspondencia {
  tipo: TipoPadrao;
  inicio: number;
  fim: number;
  trecho: string;
  tentativas: number;
  palavra?: string;
  posicao?: number;
  origem?: OrigemDicionario;
  invertida?: boolean;
  trocada?: boolean;
  maiusculas?: UsoMaiusculas;
  repeticoes?: number;
  base?: string;
  quantidadePalavras?: number;
}

export type TomObservacao = 'FORTE' | 'FRACO';

export interface Observacao {
  id: string;
  tom: TomObservacao;
  titulo: string;
  tituloOculto?: string;
  detalhe: string;
  trecho?: { inicio: number; fim: number };
}

export interface Recomendacao {
  id: string;
  titulo: string;
  tituloOculto?: string;
  detalhe: string;
  notaSimulada: number;
}

export interface AnaliseSenha {
  nota: number;
  nivel: NivelForca;
  entropiaBits: number;
  tempoEstimadoQuebra: string;
  tamanho: number;
  truncada: boolean;
  sequencia: Correspondencia[];
  pontosFortes: Observacao[];
  pontosFracos: Observacao[];
  recomendacoes: Recomendacao[];
}

export type Dicionarios = Record<OrigemDicionario, ReadonlyMap<string, number>>;
