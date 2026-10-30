import type { LinhaValor } from '@/modelos/impressao';

const TOKENS = /\s+|\S+/gu;

function quebrarParagrafo(paragrafo: string, largura: number, medir: (texto: string) => number): LinhaValor[] {
  const linhas: LinhaValor[] = [];
  let atual = '';

  const fechar = (espacoNaQuebra: boolean) => {
    linhas.push({ texto: atual.replace(/\s+$/u, ''), espacoNaQuebra });
    atual = '';
  };

  for (const token of paragrafo.match(TOKENS) ?? []) {
    const candidato = atual + token;
    if (medir(candidato) <= largura) {
      atual = candidato;
      continue;
    }

    if (/^\s/u.test(token)) {
      if (atual) fechar(true);
      continue;
    }

    if (atual.trim()) fechar(/\s$/u.test(atual));
    else atual = '';

    if (medir(token) <= largura) {
      atual = token;
      continue;
    }

    for (const caractere of Array.from(token)) {
      if (atual && medir(atual + caractere) > largura) fechar(false);
      atual += caractere;
    }
  }

  linhas.push({ texto: atual.replace(/\s+$/u, ''), espacoNaQuebra: false });
  return linhas;
}

export function quebrarTexto(texto: string, largura: number, medir: (texto: string) => number): LinhaValor[] {
  return texto.split('\n').flatMap((paragrafo) => quebrarParagrafo(paragrafo, largura, medir));
}

export function quebrarEmLinhas(texto: string, largura: number, medir: (texto: string) => number): string[] {
  return quebrarTexto(texto, largura, medir).map((linha) => linha.texto);
}
