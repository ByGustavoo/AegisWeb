import { jsPDF } from 'jspdf';
import urlGeistMedio from '@/assets/fontes/Geist-Medium.ttf?url';
import urlGeistRegular from '@/assets/fontes/Geist-Regular.ttf?url';
import urlGeistForte from '@/assets/fontes/Geist-SemiBold.ttf?url';
import urlGeistMono from '@/assets/fontes/GeistMono-Medium.ttf?url';
import { NOME_APLICACAO } from '@/configuracoes/aplicacao';
import { CORES_IMPRESSAO, ESTILOS_TEXTO, FONTES_IMPRESSAO, GEOMETRIA_DOCUMENTO } from '@/configuracoes/impressao';
import type { AlinhamentoTexto, CorImpressao, DocumentoImpresso, ElementoPagina, FonteImpressao } from '@/modelos/impressao';
import { CADEADO, corDoCaractere, geometriaDoCadeado, geometriaDoTracoDoZero, segmentosDoValor } from './desenhoValor';
import { iconeNaPagina, TAMANHO_BASE_ICONE } from './vetores';
import type { ComandoVetor } from './vetores';

const ARQUIVOS_DAS_FONTES: Record<FonteImpressao, string> = {
  GEIST_REGULAR: urlGeistRegular,
  GEIST_MEDIO: urlGeistMedio,
  GEIST_FORTE: urlGeistForte,
  GEIST_MONO: urlGeistMono,
};

const TAMANHO_DO_BLOCO_BASE64 = 0x8000;

let fontesCarregadas: Promise<[FonteImpressao, string][]> | null = null;

async function carregarEmBase64(url: string): Promise<string> {
  const resposta = await fetch(url);
  if (!resposta.ok) throw new Error('Uma fonte do PDF não carregou.');
  const bytes = new Uint8Array(await resposta.arrayBuffer());
  let binario = '';
  for (let inicio = 0; inicio < bytes.length; inicio += TAMANHO_DO_BLOCO_BASE64) {
    binario += String.fromCharCode(...bytes.subarray(inicio, inicio + TAMANHO_DO_BLOCO_BASE64));
  }
  return btoa(binario);
}

function carregarFontes(): Promise<[FonteImpressao, string][]> {
  fontesCarregadas ??= Promise.all(
    (Object.entries(ARQUIVOS_DAS_FONTES) as [FonteImpressao, string][]).map(
      async ([fonte, url]) => [fonte, await carregarEmBase64(url)] as [FonteImpressao, string],
    ),
  ).catch((erro: unknown) => {
    fontesCarregadas = null;
    throw erro;
  });
  return fontesCarregadas;
}

function usarFonte(pdf: jsPDF, fonte: FonteImpressao, tamanho: number): void {
  pdf.setFont(FONTES_IMPRESSAO[fonte].nomePdf, 'normal');
  pdf.setFontSize(tamanho);
}

function corDoTexto(pdf: jsPDF, [vermelho, verde, azul]: CorImpressao): void {
  pdf.setTextColor(vermelho, verde, azul);
}

function corDoTraco(pdf: jsPDF, [vermelho, verde, azul]: CorImpressao, espessura: number): void {
  pdf.setDrawColor(vermelho, verde, azul);
  pdf.setLineWidth(espessura);
}

const ALINHAMENTO_PDF: Record<AlinhamentoTexto, 'left' | 'center' | 'right'> = {
  INICIO: 'left',
  MEIO: 'center',
  FIM: 'right',
};

function corDoPreenchimento(pdf: jsPDF, [vermelho, verde, azul]: CorImpressao): void {
  pdf.setFillColor(vermelho, verde, azul);
}

function tracarVetor(pdf: jsPDF, comandos: ComandoVetor[], cor: CorImpressao, espessura: number): void {
  corDoTraco(pdf, cor, espessura);
  pdf.setLineCap('round');
  pdf.setLineJoin('round');
  pdf.path(comandos);
  pdf.stroke();
  pdf.setLineCap('butt');
  pdf.setLineJoin('miter');
}

function desenharCadeado(pdf: jsPDF, x: number, linhaDeBase: number, cor: CorImpressao): void {
  const { corpo, arco } = geometriaDoCadeado(x, linhaDeBase);
  corDoPreenchimento(pdf, cor);
  pdf.roundedRect(corpo.x, corpo.y, corpo.largura, corpo.altura, corpo.raio, corpo.raio, 'F');
  corDoTraco(pdf, cor, CADEADO.espessura);
  pdf.lines(
    [
      [0, -CADEADO.arcoAltura],
      [0, -CADEADO.arcoCurva, CADEADO.arcoLargura, -CADEADO.arcoCurva, CADEADO.arcoLargura, 0],
      [0, CADEADO.arcoAltura],
    ],
    arco.x,
    arco.y,
    [1, 1],
    'S',
    false,
  );
}

function desenharMarca(pdf: jsPDF, x: number, y: number, tamanho: number): void {
  const escala = tamanho / 32;
  const [vermelho, verde, azul] = CORES_IMPRESSAO.destaque;
  pdf.setFillColor(vermelho, verde, azul);
  pdf.roundedRect(x, y, tamanho, tamanho, 9 * escala, 9 * escala, 'F');
  corDoTraco(pdf, CORES_IMPRESSAO.marcaTraco, 2 * escala);
  pdf.setLineCap('round');
  pdf.setLineJoin('round');
  pdf.lines(
    [
      [7.6, 2.8],
      [0, 6.3],
      [0, 4.7, -3.1, 8.2, -7.6, 10.1],
      [-4.5, -1.9, -7.6, -5.4, -7.6, -10.1],
      [0, -6.3],
    ],
    x + 16 * escala,
    y + 6.4 * escala,
    [escala, escala],
    'S',
    true,
  );
  pdf.lines(
    [
      [3.3, -6.8],
      [3.3, 6.8],
    ],
    x + 12.7 * escala,
    y + 19.2 * escala,
    [escala, escala],
    'S',
    false,
  );
  pdf.setLineCap('butt');
  pdf.setLineJoin('miter');
}

function desenharElemento(pdf: jsPDF, elemento: ElementoPagina): void {
  switch (elemento.tipo) {
    case 'TEXTO': {
      const estilo = ESTILOS_TEXTO[elemento.estilo];
      usarFonte(pdf, estilo.fonte, estilo.tamanho);
      corDoTexto(pdf, elemento.cor ?? estilo.cor);
      pdf.setCharSpace(estilo.espacamentoLetras);
      pdf.text(elemento.texto, elemento.x, elemento.y, {
        align: ALINHAMENTO_PDF[elemento.alinhamento ?? 'INICIO'],
        baseline: 'alphabetic',
      });
      pdf.setCharSpace(0);
      return;
    }
    case 'VALOR': {
      const estilo = ESTILOS_TEXTO[elemento.estilo];
      usarFonte(pdf, estilo.fonte, estilo.tamanho);
      segmentosDoValor(elemento.linha, elemento.avanco).forEach((segmento) => {
        corDoTexto(pdf, segmento.cor);
        pdf.text(segmento.texto, elemento.x + segmento.deslocamento, elemento.y, { baseline: 'alphabetic' });
      });
      Array.from(elemento.linha.texto).forEach((caractere, indice) => {
        if (caractere !== '0') return;
        const traco = geometriaDoTracoDoZero(elemento.x + indice * elemento.avanco, elemento.y, elemento.avanco, estilo.tamanho);
        corDoTraco(pdf, corDoCaractere('0'), traco.espessura);
        pdf.setLineCap('round');
        pdf.line(traco.x1, traco.y1, traco.x2, traco.y2);
        pdf.setLineCap('butt');
      });
      return;
    }
    case 'RETANGULO': {
      const { x, y, largura, altura, raio, preenchimento, borda, espessura = 0.6, cantos = 'TODOS' } = elemento;
      if (preenchimento) {
        corDoPreenchimento(pdf, preenchimento);
        pdf.roundedRect(x, y, largura, altura, raio, raio, 'F');
        if (cantos === 'TOPO') pdf.rect(x, y + altura / 2, largura, altura / 2, 'F');
      }
      if (borda) {
        corDoTraco(pdf, borda, espessura);
        pdf.roundedRect(x, y, largura, altura, raio, raio, 'S');
      }
      return;
    }
    case 'CIRCULO':
      corDoPreenchimento(pdf, elemento.preenchimento);
      pdf.circle(elemento.x, elemento.y, elemento.raio, 'F');
      return;
    case 'CADEADO':
      desenharCadeado(pdf, elemento.x, elemento.y, elemento.cor);
      return;
    case 'POLIGONO': {
      const [primeiro, ...demais] = elemento.pontos;
      if (!primeiro) return;
      corDoPreenchimento(pdf, elemento.preenchimento);
      pdf.path([
        { op: 'm', c: primeiro },
        ...demais.map((ponto) => ({ op: 'l', c: ponto })),
        { op: 'h', c: [] },
      ]);
      pdf.fill();
      return;
    }
    case 'ICONE':
      tracarVetor(
        pdf,
        iconeNaPagina(elemento.nome, elemento.x, elemento.y, elemento.tamanho),
        elemento.cor,
        (GEOMETRIA_DOCUMENTO.icone.espessura * elemento.tamanho) / TAMANHO_BASE_ICONE,
      );
      return;
    case 'LINHA':
      corDoTraco(pdf, elemento.cor, elemento.espessura);
      pdf.line(elemento.x1, elemento.y1, elemento.x2, elemento.y2);
      return;
    case 'MARCA':
      desenharMarca(pdf, elemento.x, elemento.y, elemento.tamanho);
      return;
    default:
      elemento satisfies never;
  }
}

export async function gerarPdf(documento: DocumentoImpresso): Promise<Blob> {
  const fontes = await carregarFontes();
  const pdf = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait', compress: true, putOnlyUsedFonts: true });

  fontes.forEach(([fonte, base64]) => {
    const { nomePdf } = FONTES_IMPRESSAO[fonte];
    pdf.addFileToVFS(`${nomePdf}.ttf`, base64);
    pdf.addFont(`${nomePdf}.ttf`, nomePdf, 'normal');
  });

  pdf.setProperties({ title: documento.titulo, subject: 'Credenciais para guardar no papel', creator: NOME_APLICACAO });

  documento.paginas.forEach((pagina, indice) => {
    if (indice > 0) pdf.addPage('a4', 'portrait');
    pagina.elementos.forEach((elemento) => desenharElemento(pdf, elemento));
  });

  return pdf.output('blob');
}
