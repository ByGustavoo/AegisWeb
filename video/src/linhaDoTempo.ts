export const QUADROS_POR_SEGUNDO = 30;
export const LARGURA = 1920;
export const ALTURA = 1080;
export const QUADROS_POR_BATIDA = 12;
export const SOBREPOSICAO = 12;

const inicios = {
  abertura: 0,
  problema: 72,
  gerador: 192,
  tipos: 336,
  finalidades: 480,
  copiar: 624,
  analisador: 744,
  melhorar: 888,
  privacidade: 1032,
  encerramento: 1152,
} as const;

export const DURACAO_TOTAL = 1272;

export type NomeCena = keyof typeof inicios;

const ordem = Object.keys(inicios) as NomeCena[];

export const cenas = Object.fromEntries(
  ordem.map((nome, indice) => {
    const proxima = ordem[indice + 1];
    const fim = proxima ? inicios[proxima] + SOBREPOSICAO : DURACAO_TOTAL;
    return [nome, { inicio: inicios[nome], duracao: fim - inicios[nome] }];
  }),
) as Record<NomeCena, { inicio: number; duracao: number }>;

export const ordemCenas = ordem;

export const abertura = {
  escudosFundo: 0,
  marca: 6,
  tracoEscudo: 14,
  tracoChevron: 34,
  brilho: 44,
  nome: 44,
  intervaloLetras: 3,
  legenda: 58,
} as const;

export const SENHAS_COMUNS = [
  { senha: '123456', nota: 0 },
  { senha: 'senha123', nota: 2 },
  { senha: 'brasil2024', nota: 9 },
] as const;

export const problema = {
  titulo: 4,
  senhas: [22, 34, 46],
  riscos: [36, 48, 60],
  conclusao: 76,
} as const;

export const SENHA_GERADA = 'u-97XYIEp@VL4&Ut';
export const SENHA_REGERADA = 'h7#Qm2Kx!pW9vR&e';

export const gerador = {
  titulo: 6,
  cartao: 10,
  inicioSorteio: 22,
  intervaloSorteio: 2.5,
  inicioMedidor: 26,
  intervaloMedidor: 7,
  tempoQuebrar: 64,
  cliqueGerarOutra: 96,
  inicioSorteio2: 100,
  intervaloSorteio2: 1.5,
} as const;

export const FRASE_SENHA = 'Lobo-Escolher-Lima-Parque-Coisa-Cebola-46';
export const PIN = '445508';

export const tipos = {
  titulo: 4,
  linhas: [24, 48, 72],
  intervaloCaracteres: 0.7,
} as const;

export const finalidades = {
  titulo: 4,
  cartao: 10,
  selecoes: [
    { finalidade: 'GERAL', quadro: 0 },
    { finalidade: 'BANCO', quadro: 48 },
    { finalidade: 'WIFI', quadro: 96 },
  ],
} as const;

export const copiar = {
  titulo: 4,
  cartao: 10,
  clique: 24,
  aviso: 28,
  historico: [48, 58, 68],
} as const;

export const SENHA_ANALISADA = 'brasil2024';

export const analisador = {
  titulo: 6,
  cartao: 8,
  inicioDigitacao: 16,
  intervaloDigitacao: 2,
  padraoPalavra: 44,
  padraoAno: 52,
  placar: 56,
  nota: 9,
  impacto: 72,
  tempoQuebrar: 78,
} as const;

export const melhorar = {
  titulo: 4,
  pontosFracos: [18, 24, 30, 36, 42],
  recomendacoes: [36, 48, 60],
  duracaoSimulacao: 18,
} as const;

export const privacidade = {
  titulo: 4,
  selos: [20, 25, 30, 35, 40],
  rodape: 56,
} as const;

export const encerramento = {
  marca: 12,
  nome: 20,
  slogan: 30,
  fechoSlogan: 48,
} as const;

export function quadroSorteio(indice: number): number {
  return gerador.inicioSorteio + indice * gerador.intervaloSorteio;
}

export function quadroSorteio2(indice: number): number {
  return gerador.inicioSorteio2 + indice * gerador.intervaloSorteio2;
}

export function quadroSegmentoMedidor(indice: number): number {
  return gerador.inicioMedidor + indice * gerador.intervaloMedidor;
}

export function quadroTecla(indice: number): number {
  return analisador.inicioDigitacao + indice * analisador.intervaloDigitacao;
}
