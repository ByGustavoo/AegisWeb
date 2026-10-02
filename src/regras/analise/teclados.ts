export interface Tecla {
  linha: number;
  coluna: number;
  alterada: boolean;
}

export interface Teclado {
  nome: 'QWERTY' | 'NUMERICO';
  teclas: ReadonlyMap<string, Tecla>;
  direcao: (de: Tecla, para: Tecla) => string | null;
  posicoesIniciais: number;
  grauMedio: number;
}

const LINHAS_QWERTY: { base: string; alterada: string; deslocamento: number }[] = [
  { base: '`1234567890-=', alterada: '~!@#$%^&*()_+', deslocamento: 0 },
  { base: 'qwertyuiop[]', alterada: 'QWERTYUIOP{}', deslocamento: 0.5 },
  { base: "asdfghjkl;'", alterada: 'ASDFGHJKL:"', deslocamento: 0.75 },
  { base: 'zxcvbnm,./', alterada: 'ZXCVBNM<>?', deslocamento: 1.25 },
];

const LINHAS_NUMERICO = [' /*-', '789+', '456', '123', '0.'];

const DISTANCIA_MAXIMA_ENTRE_LINHAS = 0.75;

function calcularGrauMedio(teclas: ReadonlyMap<string, Tecla>, direcao: Teclado['direcao']): number {
  const unicas = [...teclas.values()].filter((tecla) => !tecla.alterada);
  const vizinhos = unicas.map((tecla) => unicas.filter((outra) => direcao(tecla, outra) !== null).length);
  return vizinhos.reduce((soma, grau) => soma + grau, 0) / unicas.length;
}

function criarQwerty(): Teclado {
  const teclas = new Map<string, Tecla>();
  const deslocamentos = LINHAS_QWERTY.map((linha) => linha.deslocamento);

  LINHAS_QWERTY.forEach(({ base, alterada }, linha) => {
    [...base].forEach((caractere, coluna) => teclas.set(caractere, { linha, coluna, alterada: false }));
    [...alterada].forEach((caractere, coluna) => teclas.set(caractere, { linha, coluna, alterada: true }));
  });

  const direcao = (de: Tecla, para: Tecla): string | null => {
    const passoLinha = para.linha - de.linha;
    if (passoLinha === 0) {
      const passoColuna = para.coluna - de.coluna;
      return Math.abs(passoColuna) === 1 ? `0:${passoColuna}` : null;
    }
    if (Math.abs(passoLinha) !== 1) return null;
    const x = (tecla: Tecla) => tecla.coluna + (deslocamentos[tecla.linha] ?? 0);
    const distancia = x(para) - x(de);
    if (Math.abs(distancia) > DISTANCIA_MAXIMA_ENTRE_LINHAS) return null;
    return `${passoLinha}:${distancia < 0 ? -1 : 1}`;
  };

  return {
    nome: 'QWERTY',
    teclas,
    direcao,
    posicoesIniciais: LINHAS_QWERTY.reduce((soma, linha) => soma + linha.base.length, 0),
    grauMedio: calcularGrauMedio(teclas, direcao),
  };
}

function criarNumerico(): Teclado {
  const teclas = new Map<string, Tecla>();
  LINHAS_NUMERICO.forEach((texto, linha) => {
    [...texto].forEach((caractere, coluna) => {
      if (caractere !== ' ') teclas.set(caractere, { linha, coluna, alterada: false });
    });
  });

  const direcao = (de: Tecla, para: Tecla): string | null => {
    const passoLinha = para.linha - de.linha;
    const passoColuna = para.coluna - de.coluna;
    if (Math.abs(passoLinha) > 1 || Math.abs(passoColuna) > 1) return null;
    if (passoLinha === 0 && passoColuna === 0) return null;
    return `${passoLinha}:${passoColuna}`;
  };

  return {
    nome: 'NUMERICO',
    teclas,
    direcao,
    posicoesIniciais: teclas.size,
    grauMedio: calcularGrauMedio(teclas, direcao),
  };
}

export const TECLADOS: readonly Teclado[] = [criarQwerty(), criarNumerico()];
