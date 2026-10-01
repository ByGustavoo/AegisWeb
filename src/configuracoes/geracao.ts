import type { TipoGeracao } from '@/modelos/senha';

export interface OpcaoPrevista {
  rotulo: string;
  controle: 'deslizante' | 'interruptor' | 'selecao';
}

export interface DescricaoTipoGeracao {
  tipo: TipoGeracao;
  parametro: string;
  rotulo: string;
  descricao: string;
  exemplo: string;
  opcoesPrevistas: OpcaoPrevista[];
}

export const tiposGeracao: DescricaoTipoGeracao[] = [
  {
    tipo: 'SENHA',
    parametro: 'senha',
    rotulo: 'Senha',
    descricao: 'Caracteres aleatórios. A melhor escolha para guardar num gerenciador de senhas.',
    exemplo: 'k7#Qm-vR2p!xLw9$eTa4',
    opcoesPrevistas: [
      { rotulo: 'Tamanho', controle: 'deslizante' },
      { rotulo: 'Letras maiúsculas', controle: 'interruptor' },
      { rotulo: 'Letras minúsculas', controle: 'interruptor' },
      { rotulo: 'Números', controle: 'interruptor' },
      { rotulo: 'Símbolos', controle: 'interruptor' },
      { rotulo: 'Evitar caracteres parecidos', controle: 'interruptor' },
    ],
  },
  {
    tipo: 'FRASE_SENHA',
    parametro: 'frase',
    rotulo: 'Frase-senha',
    descricao: 'Palavras sorteadas, fáceis de digitar e de lembrar. Boa para a senha mestra.',
    exemplo: 'Neblina-Trilho-Cobalto-Farol-42',
    opcoesPrevistas: [
      { rotulo: 'Quantidade de palavras', controle: 'deslizante' },
      { rotulo: 'Separador', controle: 'selecao' },
      { rotulo: 'Iniciais maiúsculas', controle: 'interruptor' },
      { rotulo: 'Incluir um número', controle: 'interruptor' },
    ],
  },
  {
    tipo: 'PIN',
    parametro: 'pin',
    rotulo: 'PIN',
    descricao: 'Só números, para cartões, celulares e cofres.',
    exemplo: '480271',
    opcoesPrevistas: [{ rotulo: 'Quantidade de dígitos', controle: 'deslizante' }],
  },
];

export const TAMANHO_HISTORICO_SESSAO = 10;
