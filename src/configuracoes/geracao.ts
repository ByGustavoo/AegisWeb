import type { OpcoesFraseSenha, OpcoesPin, SeparadorFrase, TipoGeracao } from '@/modelos/senha';

export interface DescricaoTipoGeracao {
  tipo: TipoGeracao;
  parametro: string;
  rotulo: string;
  descricao: string;
}

export const tiposGeracao: DescricaoTipoGeracao[] = [
  {
    tipo: 'SENHA',
    parametro: 'senha',
    rotulo: 'Senha',
    descricao: 'Caracteres aleatórios. A melhor escolha para guardar num gerenciador de senhas.',
  },
  {
    tipo: 'FRASE_SENHA',
    parametro: 'frase',
    rotulo: 'Frase-senha',
    descricao: 'Palavras sorteadas, fáceis de digitar e de lembrar. Boa para a senha mestra.',
  },
  {
    tipo: 'PIN',
    parametro: 'pin',
    rotulo: 'PIN',
    descricao: 'Só números, para cartões, celulares e cofres. Sequências e repetições ficam de fora.',
  },
];

export const OPCOES_FRASE_PADRAO: OpcoesFraseSenha = {
  quantidadePalavras: 6,
  separador: '-',
  iniciaisMaiusculas: true,
  incluirNumero: true,
  incluirSimbolo: false,
};

export const OPCOES_PIN_PADRAO: OpcoesPin = { tamanho: 6 };

export const separadoresFrase: { valor: SeparadorFrase; rotulo: string; amostra: string }[] = [
  { valor: '-', rotulo: 'Hífen', amostra: '-' },
  { valor: '.', rotulo: 'Ponto', amostra: '.' },
  { valor: '_', rotulo: 'Sublinhado', amostra: '_' },
  { valor: ' ', rotulo: 'Espaço', amostra: '␣' },
];

export const TAMANHO_HISTORICO_SESSAO = 10;

export const SEGUNDOS_PARA_LIMPAR_AREA_TRANSFERENCIA = 30;

export const AVISO_PIN = 'PINs são curtos por natureza: a proteção vem do bloqueio após algumas tentativas erradas.';
