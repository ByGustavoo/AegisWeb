export type TipoGeracao = 'SENHA' | 'FRASE_SENHA' | 'PIN';

export type ClasseCaractere = 'LETRA' | 'NUMERO' | 'SIMBOLO' | 'ESPACO';

export type NivelForca = 1 | 2 | 3 | 4 | 5;

export interface OpcoesSenha {
  tamanho: number;
  usarMaiusculas: boolean;
  usarMinusculas: boolean;
  usarNumeros: boolean;
  usarSimbolos: boolean;
  evitarAmbiguos: boolean;
}

export interface OpcoesFraseSenha {
  quantidadePalavras: number;
  separador: string;
  iniciaisMaiusculas: boolean;
  incluirNumero: boolean;
}

export interface OpcoesPin {
  tamanho: number;
}

export interface SenhaGerada {
  id: string;
  valor: string;
  tipo: TipoGeracao;
  geradaEm: string;
}

export interface PadraoEncontrado {
  tipo: string;
  trecho: string;
  descricao: string;
}

export interface AnaliseSenha {
  nivel: NivelForca;
  entropiaBits: number;
  tempoEstimadoQuebra: string;
  padroes: PadraoEncontrado[];
  sugestoes: string[];
}
