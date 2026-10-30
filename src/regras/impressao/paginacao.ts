import {
  CORES_IMPRESSAO,
  ESPACAMENTO_COMPACTO,
  ESPACAMENTO_NORMAL,
  ESTILOS_TEXTO,
  GEOMETRIA_DOCUMENTO,
  LEGENDA_CARACTERES,
  LEGENDA_CORES,
  PAGINA_A4,
  PALETA_CONTAS,
  PROPORCAO_ALTURA_MAIUSCULA,
  TEXTOS_DOCUMENTO,
  TITULO_DOCUMENTO_PADRAO,
} from '@/configuracoes/impressao';
import type { EspacamentoCartao, ItemLegenda } from '@/configuracoes/impressao';
import type {
  ContaImpressa,
  CorImpressao,
  DocumentoImpresso,
  ElementoPagina,
  EstiloTexto,
  FolhaCredenciais,
  LinhaValor,
  MedirTexto,
  NomeIcone,
  PaginaImpressa,
} from '@/modelos/impressao';
import { iconeDoCampo } from './iconeDoCampo';
import { quebrarEmLinhas, quebrarTexto } from './quebraLinhas';
import { selecionarContas } from './selecao';

interface CampoMedido {
  linhasRotulo: string[];
  linhasValor: LinhaValor[] | null;
  icone: NomeIcone | null;
}

interface ContaMedida {
  linhasTitulo: string[];
  campos: CampoMedido[];
  inicial: string;
  cor: CorImpressao;
}

interface CartaoPlanejado {
  conta: ContaMedida;
  campos: CampoMedido[];
  continuacao: boolean;
  continua: boolean;
  pagina: number;
  coluna: number;
  y: number;
  altura: number;
}

interface AreaColuna {
  topo: number;
  altura: number;
}

interface Contexto {
  medir: MedirTexto;
  espacamento: EspacamentoCartao;
  larguraColuna: number;
  larguraInterna: number;
  larguraTexto: number;
  larguraValor: number;
  areaPrimeiraPagina: AreaColuna;
  areaDemaisPaginas: AreaColuna;
}

interface CabecalhoMedido {
  linhasTitulo: string[];
  titulo: string;
  alturaFaixaPrimeira: number;
  alturaFaixaDemais: number;
}

export interface EntradaDocumento {
  folha: FolhaCredenciais;
  medir: MedirTexto;
  data: Date;
  permitirCompactar?: boolean;
}

const {
  margem,
  colunas,
  espacoEntreColunas,
  folgaMedicao,
  cabecalho,
  cabecalhoCompacto,
  rodape,
  diametroInicial,
  espacoInicialTitulo,
  icone,
} = GEOMETRIA_DOCUMENTO;
const RECUO_ICONE = icone.tamanho + icone.espacoRotulo;
const LARGURA_CONTEUDO = PAGINA_A4.largura - margem * 2;
const ALTURA_CAIXA_LEGENDA =
  rodape.legendaPaddingY * 2 + ESTILOS_TEXTO.RODAPE.entrelinha * 2 + rodape.espacoEntreLinhas;
const ALTURA_RODAPE =
  rodape.espacoAcima + ALTURA_CAIXA_LEGENDA + rodape.espacoLegendaAviso + ESTILOS_TEXTO.RODAPE.entrelinha;

function entrelinha(estilo: EstiloTexto): number {
  return ESTILOS_TEXTO[estilo].entrelinha;
}

export function linhaDeBase(topo: number, estilo: EstiloTexto): number {
  const { entrelinha: altura, tamanho } = ESTILOS_TEXTO[estilo];
  return topo + altura / 2 + (PROPORCAO_ALTURA_MAIUSCULA * tamanho) / 2;
}

function textoNoEstilo(texto: string, estilo: EstiloTexto): string {
  return ESTILOS_TEXTO[estilo].caixaAlta ? texto.toLocaleUpperCase('pt-BR') : texto;
}

function medidorDoEstilo(medir: MedirTexto, estilo: EstiloTexto) {
  return (texto: string) => medir(texto, estilo);
}

function encurtar(texto: string, largura: number, medir: (texto: string) => number): string {
  if (medir(texto) <= largura) return texto;
  const caracteres = Array.from(texto);
  while (caracteres.length > 1 && medir(`${caracteres.join('').trimEnd()}…`) > largura) caracteres.pop();
  return `${caracteres.join('').trimEnd()}…`;
}

function alturaCampo(campo: CampoMedido, espacamento: EspacamentoCartao): number {
  const rotulo = campo.linhasRotulo.length * entrelinha('ROTULO');
  const separacao = campo.linhasRotulo.length > 0 ? espacamento.rotuloParaValor : 0;
  const valor = campo.linhasValor
    ? campo.linhasValor.length * entrelinha('VALOR') + espacamento.caixaValorPaddingY * 2
    : GEOMETRIA_DOCUMENTO.alturaLinhaParaPreencher;
  return rotulo + separacao + valor;
}

function alturaTituloCartao(conta: ContaMedida, continuacao: boolean): number {
  return conta.linhasTitulo.length * entrelinha('TITULO_CONTA') + (continuacao ? entrelinha('AVISO_CARTAO') : 0);
}

function alturaFaixaCartao(conta: ContaMedida, continuacao: boolean, espacamento: EspacamentoCartao): number {
  return espacamento.faixaPaddingY * 2 + Math.max(diametroInicial, alturaTituloCartao(conta, continuacao));
}

function alturaCartao(
  conta: ContaMedida,
  campos: CampoMedido[],
  continuacao: boolean,
  continua: boolean,
  espacamento: EspacamentoCartao,
): number {
  const corpo =
    campos.reduce((soma, campo) => soma + alturaCampo(campo, espacamento), 0) +
    Math.max(0, campos.length - 1) * espacamento.entreCampos;
  const final = continua ? espacamento.entreCampos + entrelinha('AVISO_CARTAO') : 0;
  return (
    alturaFaixaCartao(conta, continuacao, espacamento) + espacamento.corpoPaddingTopo + corpo + final + espacamento.paddingBase
  );
}

function dividirCampoGrande(campo: CampoMedido, alturaMaxima: number, contexto: Contexto): CampoMedido[] {
  const { espacamento, larguraTexto, medir } = contexto;
  if (!campo.linhasValor || alturaCampo(campo, espacamento) <= alturaMaxima) return [campo];

  const rotuloOriginal = campo.linhasRotulo.join(' ');
  const rotuloContinuacao = rotuloOriginal
    ? quebrarEmLinhas(
        textoNoEstilo(`${rotuloOriginal}${TEXTOS_DOCUMENTO.sufixoParteCampo}`, 'ROTULO'),
        larguraTexto - RECUO_ICONE,
        medidorDoEstilo(medir, 'ROTULO'),
      )
    : [];

  const partes: CampoMedido[] = [];
  let restantes = campo.linhasValor;
  while (restantes.length > 0) {
    const linhasRotulo = partes.length === 0 ? campo.linhasRotulo : rotuloContinuacao;
    const alturaRotulo =
      linhasRotulo.length * entrelinha('ROTULO') + (linhasRotulo.length > 0 ? espacamento.rotuloParaValor : 0);
    const alturaLivre = alturaMaxima - alturaRotulo - espacamento.caixaValorPaddingY * 2;
    const linhasPorParte = Math.max(1, Math.floor(alturaLivre / entrelinha('VALOR')));
    partes.push({ linhasRotulo, linhasValor: restantes.slice(0, linhasPorParte), icone: campo.icone });
    restantes = restantes.slice(linhasPorParte);
  }
  return partes;
}

function inicialDaConta(titulo: string): string {
  const letra = Array.from(titulo).find((caractere) => /[\p{L}\p{N}]/u.test(caractere));
  return textoNoEstilo(letra ?? '#', 'INICIAL');
}

function medirConta(conta: ContaImpressa, contexto: Contexto, posicao: number): ContaMedida {
  const { medir, larguraInterna, larguraTexto, larguraValor, espacamento, areaPrimeiraPagina, areaDemaisPaginas } =
    contexto;
  const larguraTitulo = (larguraInterna - diametroInicial - espacoInicialTitulo) * folgaMedicao;
  const linhasTitulo = quebrarEmLinhas(conta.titulo, larguraTitulo, medidorDoEstilo(medir, 'TITULO_CONTA'));
  const campos = conta.campos.map<CampoMedido>((campo) => ({
    linhasRotulo: campo.rotulo
      ? quebrarEmLinhas(
          textoNoEstilo(campo.rotulo, 'ROTULO'),
          larguraTexto - RECUO_ICONE,
          medidorDoEstilo(medir, 'ROTULO'),
        )
      : [],
    linhasValor: campo.valor === null ? null : quebrarTexto(campo.valor, larguraValor, medidorDoEstilo(medir, 'VALOR')),
    icone: campo.rotulo ? iconeDoCampo(campo.rotulo) : null,
  }));

  const cor = PALETA_CONTAS[posicao % PALETA_CONTAS.length] ?? CORES_IMPRESSAO.destaque;
  const medida: ContaMedida = { linhasTitulo, campos, inicial: inicialDaConta(conta.titulo), cor };
  const alturaColunaMinima = Math.min(areaPrimeiraPagina.altura, areaDemaisPaginas.altura);
  const alturaMaximaCampo = alturaColunaMinima - alturaCartao(medida, [], true, true, espacamento);
  return { ...medida, campos: campos.flatMap((campo) => dividirCampoGrande(campo, alturaMaximaCampo, contexto)) };
}

function alturaTextoCabecalho(linhasTitulo: string[]): number {
  return linhasTitulo.length * entrelinha('TITULO_DOCUMENTO') + cabecalho.espacoMetaTitulo + entrelinha('META');
}

const ALTURA_TEXTO_MARCA = entrelinha('NOME_MARCA') + entrelinha('SLOGAN');

function larguraAssinatura(medir: MedirTexto): number {
  const larguraTexto = Math.max(medir(TEXTOS_DOCUMENTO.nomeMarca, 'NOME_MARCA'), medir(TEXTOS_DOCUMENTO.slogan, 'SLOGAN'));
  return cabecalho.marca + cabecalho.espacoMarcaNome + larguraTexto;
}

function larguraAssinaturaCompacta(medir: MedirTexto): number {
  return cabecalhoCompacto.marca + cabecalhoCompacto.espacoMarcaNome + medir(TEXTOS_DOCUMENTO.nomeMarca, 'NOME_MARCA_COMPACTO');
}

function medirCabecalho(titulo: string, medir: MedirTexto): CabecalhoMedido {
  const larguraTitulo =
    LARGURA_CONTEUDO - cabecalho.respiro * 2 - larguraAssinatura(medir) - cabecalho.espacoTituloMarca;
  const linhasTitulo = quebrarEmLinhas(titulo, larguraTitulo * folgaMedicao, medidorDoEstilo(medir, 'TITULO_DOCUMENTO'));
  return {
    linhasTitulo,
    titulo,
    alturaFaixaPrimeira:
      cabecalho.respiro * 2 + Math.max(cabecalho.marca, ALTURA_TEXTO_MARCA, alturaTextoCabecalho(linhasTitulo)),
    alturaFaixaDemais:
      cabecalhoCompacto.respiro * 2 +
      Math.max(cabecalhoCompacto.marca, entrelinha('TITULO_PAGINA'), entrelinha('NOME_MARCA_COMPACTO')),
  };
}

function areaDaColuna(alturaCabecalho: number): AreaColuna {
  const topo = margem + alturaCabecalho;
  return { topo, altura: PAGINA_A4.altura - margem - ALTURA_RODAPE - topo };
}

function planejarCartoes(contas: ContaMedida[], contexto: Contexto): CartaoPlanejado[] {
  const { espacamento, areaPrimeiraPagina, areaDemaisPaginas } = contexto;
  const cartoes: CartaoPlanejado[] = [];
  const alturaDaPagina = (pagina: number) => (pagina === 0 ? areaPrimeiraPagina : areaDemaisPaginas).altura;
  let pagina = 0;
  let coluna = 0;
  let usado = 0;

  const avancarColuna = () => {
    usado = 0;
    if (coluna < colunas - 1) {
      coluna += 1;
      return;
    }
    coluna = 0;
    pagina += 1;
  };

  const colocar = (conta: ContaMedida, campos: CampoMedido[], continuacao: boolean, continua: boolean) => {
    const y = usado > 0 ? usado + espacamento.entreCartoes : 0;
    const altura = alturaCartao(conta, campos, continuacao, continua, espacamento);
    cartoes.push({ conta, campos, continuacao, continua, pagina, coluna, y, altura });
    usado = y + altura;
  };

  for (const conta of contas) {
    let restantes = conta.campos;
    let continuacao = false;

    while (restantes.length > 0) {
      const colunaVazia = usado === 0;
      const disponivel = alturaDaPagina(pagina) - usado - (colunaVazia ? 0 : espacamento.entreCartoes);
      if (alturaCartao(conta, restantes, continuacao, false, espacamento) <= disponivel) {
        colocar(conta, restantes, continuacao, false);
        break;
      }

      let cabem = 0;
      while (
        cabem < restantes.length - 1 &&
        alturaCartao(conta, restantes.slice(0, cabem + 1), continuacao, true, espacamento) <= disponivel
      ) {
        cabem += 1;
      }

      const alturaColunaSeguinte = alturaDaPagina(coluna < colunas - 1 ? pagina : pagina + 1);
      const cabeEmColunaVazia = alturaCartao(conta, restantes, continuacao, false, espacamento) <= alturaColunaSeguinte;
      const sobraGrande = disponivel >= alturaDaPagina(pagina) * GEOMETRIA_DOCUMENTO.limiarDivisaoParaEvitarVazio;
      const dividir = cabeEmColunaVazia
        ? sobraGrande && cabem >= 2 && restantes.length - cabem >= 2
        : cabem >= (colunaVazia ? 1 : 2);
      const forcar = colunaVazia && cabem === 0 && !cabeEmColunaVazia;

      if (dividir || forcar) {
        const quantidade = Math.max(1, cabem);
        colocar(conta, restantes.slice(0, quantidade), continuacao, true);
        restantes = restantes.slice(quantidade);
        continuacao = true;
      }
      avancarColuna();
    }
  }

  return cartoes;
}

function equilibrarUltimaPagina(cartoes: CartaoPlanejado[], contexto: Contexto): void {
  const ultima = cartoes.reduce((maior, cartao) => Math.max(maior, cartao.pagina), 0);
  const daUltima = cartoes.filter((cartao) => cartao.pagina === ultima);
  if (daUltima.length < 2 || daUltima.some((cartao) => cartao.continua)) return;

  const { entreCartoes } = contexto.espacamento;
  const alturaColuna = (ultima === 0 ? contexto.areaPrimeiraPagina : contexto.areaDemaisPaginas).altura;
  const alturaDoGrupo = (grupo: CartaoPlanejado[]) =>
    grupo.reduce((soma, cartao) => soma + cartao.altura, 0) + Math.max(0, grupo.length - 1) * entreCartoes;

  let melhorDivisao = -1;
  let melhorAltura = Number.POSITIVE_INFINITY;
  for (let divisao = 1; divisao <= daUltima.length; divisao += 1) {
    const esquerda = alturaDoGrupo(daUltima.slice(0, divisao));
    const direita = alturaDoGrupo(daUltima.slice(divisao));
    if (esquerda > alturaColuna || direita > alturaColuna) continue;
    const maior = Math.max(esquerda, direita);
    const empate = maior === melhorAltura && esquerda >= direita;
    if (maior < melhorAltura || empate) {
      melhorAltura = maior;
      melhorDivisao = divisao;
    }
  }
  if (melhorDivisao < 0) return;

  const posicionar = (grupo: CartaoPlanejado[], coluna: number) => {
    let y = 0;
    grupo.forEach((cartao) => {
      cartao.coluna = coluna;
      cartao.y = y;
      y += cartao.altura + entreCartoes;
    });
  };
  posicionar(daUltima.slice(0, melhorDivisao), 0);
  posicionar(daUltima.slice(melhorDivisao), 1);
}

function barraLateral(x: number, y: number, altura: number): [number, number][] {
  const { raioCartao: raio, larguraBarraConta: largura } = GEOMETRIA_DOCUMENTO;
  const passos = 6;
  const arco = (px: number) => Math.sqrt(Math.max(0, raio * raio - (x + raio - px) ** 2));
  const topo = Array.from({ length: passos + 1 }, (_, indice): [number, number] => {
    const px = x + largura - (largura * indice) / passos;
    return [px, y + raio - arco(px)];
  });
  const base = Array.from({ length: passos + 1 }, (_, indice): [number, number] => {
    const px = x + (largura * indice) / passos;
    return [px, y + altura - raio + arco(px)];
  });
  return [...topo, ...base];
}

function desenharCartao(
  cartao: CartaoPlanejado,
  proximo: CartaoPlanejado | undefined,
  contexto: Contexto,
  elementos: ElementoPagina[],
): void {
  const { espacamento, larguraColuna, medir } = contexto;
  const { conta } = cartao;
  const area = cartao.pagina === 0 ? contexto.areaPrimeiraPagina : contexto.areaDemaisPaginas;
  const x = margem + cartao.coluna * (larguraColuna + espacoEntreColunas);
  const y = area.topo + cartao.y;
  const xTexto = x + espacamento.paddingX;
  const xFim = x + larguraColuna - espacamento.paddingX;
  const avanco = medir('0', 'VALOR');
  const { raioCartao, espessuraBorda, espessuraDivisoria } = GEOMETRIA_DOCUMENTO;
  const alturaFaixa = alturaFaixaCartao(conta, cartao.continuacao, espacamento);

  elementos.push({
    tipo: 'RETANGULO',
    x,
    y,
    largura: larguraColuna,
    altura: alturaFaixa,
    raio: raioCartao,
    preenchimento: CORES_IMPRESSAO.faixaCartao,
    cantos: 'TOPO',
  });
  elementos.push({
    tipo: 'LINHA',
    x1: x,
    y1: y + alturaFaixa,
    x2: x + larguraColuna,
    y2: y + alturaFaixa,
    cor: CORES_IMPRESSAO.divisoria,
    espessura: espessuraDivisoria,
  });
  elementos.push({ tipo: 'POLIGONO', pontos: barraLateral(x, y, cartao.altura), preenchimento: conta.cor });
  elementos.push({
    tipo: 'RETANGULO',
    x,
    y,
    largura: larguraColuna,
    altura: cartao.altura,
    raio: raioCartao,
    borda: CORES_IMPRESSAO.borda,
    espessura: espessuraBorda,
  });

  const blocoTitulo = alturaTituloCartao(conta, cartao.continuacao);
  const topoFaixa = y + espacamento.faixaPaddingY;
  const tituloCabeNaInicial = blocoTitulo <= diametroInicial;
  let cursor = tituloCabeNaInicial ? topoFaixa + (diametroInicial - blocoTitulo) / 2 : topoFaixa;
  const centroInicial = tituloCabeNaInicial ? topoFaixa + diametroInicial / 2 : topoFaixa + entrelinha('TITULO_CONTA') / 2;
  const xInicial = xTexto + diametroInicial / 2;
  const xTitulo = xTexto + diametroInicial + espacoInicialTitulo;

  elementos.push({
    tipo: 'CIRCULO',
    x: xInicial,
    y: centroInicial,
    raio: diametroInicial / 2,
    preenchimento: conta.cor,
  });
  elementos.push({
    tipo: 'TEXTO',
    x: xInicial,
    y: centroInicial + (PROPORCAO_ALTURA_MAIUSCULA * ESTILOS_TEXTO.INICIAL.tamanho) / 2,
    texto: conta.inicial,
    estilo: 'INICIAL',
    alinhamento: 'MEIO',
  });
  conta.linhasTitulo.forEach((linha) => {
    elementos.push({ tipo: 'TEXTO', x: xTitulo, y: linhaDeBase(cursor, 'TITULO_CONTA'), texto: linha, estilo: 'TITULO_CONTA' });
    cursor += entrelinha('TITULO_CONTA');
  });
  if (cartao.continuacao) {
    elementos.push({
      tipo: 'TEXTO',
      x: xTitulo,
      y: linhaDeBase(cursor, 'AVISO_CARTAO'),
      texto: TEXTOS_DOCUMENTO.continuacao,
      estilo: 'AVISO_CARTAO',
    });
  }

  cursor = y + alturaFaixa + espacamento.corpoPaddingTopo;
  cartao.campos.forEach((campo, indice) => {
    if (indice > 0) cursor += espacamento.entreCampos;
    if (campo.icone) {
      elementos.push({
        tipo: 'ICONE',
        x: xTexto,
        y: cursor + (entrelinha('ROTULO') - icone.tamanho) / 2,
        tamanho: icone.tamanho,
        nome: campo.icone,
        cor: conta.cor,
      });
    }
    campo.linhasRotulo.forEach((linha) => {
      elementos.push({
        tipo: 'TEXTO',
        x: xTexto + RECUO_ICONE,
        y: linhaDeBase(cursor, 'ROTULO'),
        texto: linha,
        estilo: 'ROTULO',
      });
      cursor += entrelinha('ROTULO');
    });
    if (campo.linhasRotulo.length > 0) cursor += espacamento.rotuloParaValor;

    if (!campo.linhasValor) {
      const alturaLinha = GEOMETRIA_DOCUMENTO.alturaLinhaParaPreencher;
      elementos.push({
        tipo: 'LINHA',
        x1: xTexto,
        y1: cursor + alturaLinha - 2,
        x2: xFim,
        y2: cursor + alturaLinha - 2,
        cor: CORES_IMPRESSAO.linhaParaPreencher,
        espessura: espessuraDivisoria,
      });
      cursor += alturaLinha;
      return;
    }

    const alturaCaixa = campo.linhasValor.length * entrelinha('VALOR') + espacamento.caixaValorPaddingY * 2;
    elementos.push({
      tipo: 'RETANGULO',
      x: xTexto,
      y: cursor,
      largura: xFim - xTexto,
      altura: alturaCaixa,
      raio: GEOMETRIA_DOCUMENTO.raioCaixaValor,
      preenchimento: CORES_IMPRESSAO.caixaValor,
      borda: CORES_IMPRESSAO.bordaCaixaValor,
      espessura: espessuraDivisoria,
    });
    let topoLinha = cursor + espacamento.caixaValorPaddingY;
    campo.linhasValor.forEach((linha) => {
      elementos.push({
        tipo: 'VALOR',
        x: xTexto + espacamento.caixaValorPaddingX,
        y: linhaDeBase(topoLinha, 'VALOR'),
        linha,
        avanco,
        estilo: 'VALOR',
      });
      topoLinha += entrelinha('VALOR');
    });
    cursor += alturaCaixa;
  });

  if (cartao.continua) {
    cursor += espacamento.entreCampos;
    const naMesmaPagina = proximo !== undefined && proximo.pagina === cartao.pagina;
    elementos.push({
      tipo: 'TEXTO',
      x: xFim,
      y: linhaDeBase(cursor, 'AVISO_CARTAO'),
      texto: naMesmaPagina ? TEXTOS_DOCUMENTO.continuaNaColuna : TEXTOS_DOCUMENTO.continuaNaPagina,
      estilo: 'AVISO_CARTAO',
      alinhamento: 'FIM',
    });
  }
}

function formatarData(data: Date): string {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(data);
}

function misturar(de: CorImpressao, para: CorImpressao, quanto: number): CorImpressao {
  return [0, 1, 2].map((canal) => Math.round((de[canal] ?? 0) + ((para[canal] ?? 0) - (de[canal] ?? 0)) * quanto)) as unknown as CorImpressao;
}

function desenharPontosDaFaixa(altura: number, elementos: ElementoPagina[]): void {
  const { passo, raio, inicio } = GEOMETRIA_DOCUMENTO.pontosFaixa;
  const xInicial = margem + LARGURA_CONTEUDO * inicio;
  const extensao = margem + LARGURA_CONTEUDO - xInicial;
  for (let y = margem + passo / 2; y <= margem + altura - passo / 2; y += passo) {
    for (let x = xInicial; x <= margem + LARGURA_CONTEUDO - passo / 2; x += passo) {
      const intensidade = Math.sin(Math.PI * ((x - xInicial) / extensao)) ** 1.5;
      if (intensidade < 0.1) continue;
      elementos.push({
        tipo: 'CIRCULO',
        x,
        y,
        raio,
        preenchimento: misturar(CORES_IMPRESSAO.faixaCabecalho, CORES_IMPRESSAO.pontosFaixa, intensidade),
      });
    }
  }
}

function desenharPontosDoCanto(cartoesDaPagina: CartaoPlanejado[], contexto: Contexto, elementos: ElementoPagina[]): void {
  const { passo, raio } = GEOMETRIA_DOCUMENTO.pontosFaixa;
  const { alcance, folgaCartao, curva } = GEOMETRIA_DOCUMENTO.pontosCanto;
  const area = cartoesDaPagina[0]?.pagina === 0 ? contexto.areaPrimeiraPagina : contexto.areaDemaisPaginas;
  const retangulos = cartoesDaPagina.map((cartao) => {
    const x = margem + cartao.coluna * (contexto.larguraColuna + espacoEntreColunas);
    const y = area.topo + cartao.y;
    return { esquerda: x - folgaCartao, direita: x + contexto.larguraColuna + folgaCartao, topo: y - folgaCartao, base: y + cartao.altura + folgaCartao };
  });
  const sobreCartao = (x: number, y: number) =>
    retangulos.some(({ esquerda, direita, topo, base }) => x >= esquerda && x <= direita && y >= topo && y <= base);

  for (let y = PAGINA_A4.altura - passo / 2; y >= PAGINA_A4.altura - alcance; y -= passo) {
    for (let x = passo / 2; x <= alcance; x += passo) {
      const distancia = Math.hypot(x, PAGINA_A4.altura - y);
      const intensidade = Math.max(0, 1 - distancia / alcance) ** curva;
      if (intensidade < 0.06 || sobreCartao(x, y)) continue;
      elementos.push({
        tipo: 'CIRCULO',
        x,
        y,
        raio,
        preenchimento: misturar(CORES_IMPRESSAO.papel, CORES_IMPRESSAO.pontosCanto, intensidade),
      });
    }
  }
}

function desenharFaixa(altura: number, raio: number, elementos: ElementoPagina[]): void {
  elementos.push({
    tipo: 'RETANGULO',
    x: margem,
    y: margem,
    largura: LARGURA_CONTEUDO,
    altura,
    raio,
    preenchimento: CORES_IMPRESSAO.faixaCabecalho,
  });
  desenharPontosDaFaixa(altura, elementos);
}


function desenharAssinatura(altura: number, elementos: ElementoPagina[]): void {
  const x = margem + cabecalho.respiro;
  const xTexto = x + cabecalho.marca + cabecalho.espacoMarcaNome;
  const topoTexto = margem + (altura - ALTURA_TEXTO_MARCA) / 2;
  elementos.push({ tipo: 'MARCA', x, y: margem + (altura - cabecalho.marca) / 2, tamanho: cabecalho.marca });
  elementos.push({
    tipo: 'TEXTO',
    x: xTexto,
    y: linhaDeBase(topoTexto, 'NOME_MARCA'),
    texto: TEXTOS_DOCUMENTO.nomeMarca,
    estilo: 'NOME_MARCA',
  });
  elementos.push({
    tipo: 'TEXTO',
    x: xTexto,
    y: linhaDeBase(topoTexto + entrelinha('NOME_MARCA'), 'SLOGAN'),
    texto: TEXTOS_DOCUMENTO.slogan,
    estilo: 'SLOGAN',
  });
}

function desenharAssinaturaCompacta(altura: number, elementos: ElementoPagina[]): void {
  const x = margem + cabecalhoCompacto.respiro;
  elementos.push({
    tipo: 'MARCA',
    x,
    y: margem + (altura - cabecalhoCompacto.marca) / 2,
    tamanho: cabecalhoCompacto.marca,
  });
  elementos.push({
    tipo: 'TEXTO',
    x: x + cabecalhoCompacto.marca + cabecalhoCompacto.espacoMarcaNome,
    y: linhaDeBase(margem + (altura - entrelinha('NOME_MARCA_COMPACTO')) / 2, 'NOME_MARCA_COMPACTO'),
    texto: TEXTOS_DOCUMENTO.nomeMarca,
    estilo: 'NOME_MARCA_COMPACTO',
  });
}

function desenharCabecalho(
  numeroPagina: number,
  medido: CabecalhoMedido,
  data: string,
  medir: MedirTexto,
  elementos: ElementoPagina[],
): void {
  if (numeroPagina === 0) {
    const altura = medido.alturaFaixaPrimeira;
    desenharFaixa(altura, cabecalho.raio, elementos);

    const xTexto = PAGINA_A4.largura - margem - cabecalho.respiro;
    let cursor = margem + (altura - alturaTextoCabecalho(medido.linhasTitulo)) / 2;
    medido.linhasTitulo.forEach((linha) => {
      elementos.push({
        tipo: 'TEXTO',
        x: xTexto,
        y: linhaDeBase(cursor, 'TITULO_DOCUMENTO'),
        texto: linha,
        estilo: 'TITULO_DOCUMENTO',
        alinhamento: 'FIM',
      });
      cursor += entrelinha('TITULO_DOCUMENTO');
    });
    cursor += cabecalho.espacoMetaTitulo;
    elementos.push({
      tipo: 'TEXTO',
      x: xTexto,
      y: linhaDeBase(cursor, 'META'),
      texto: `${TEXTOS_DOCUMENTO.geradoEm} ${data}`,
      estilo: 'META',
      alinhamento: 'FIM',
    });
    desenharAssinatura(altura, elementos);
    return;
  }

  const altura = medido.alturaFaixaDemais;
  const xTexto = PAGINA_A4.largura - margem - cabecalhoCompacto.respiro;
  const inicioTitulo =
    margem + cabecalhoCompacto.respiro + larguraAssinaturaCompacta(medir) + cabecalhoCompacto.espacoTituloMarca;
  const titulo = encurtar(medido.titulo, (xTexto - inicioTitulo) * folgaMedicao, medidorDoEstilo(medir, 'TITULO_PAGINA'));
  desenharFaixa(altura, cabecalhoCompacto.raio, elementos);
  elementos.push({
    tipo: 'TEXTO',
    x: xTexto,
    y: linhaDeBase(margem + (altura - entrelinha('TITULO_PAGINA')) / 2, 'TITULO_PAGINA'),
    texto: titulo,
    estilo: 'TITULO_PAGINA',
    alinhamento: 'FIM',
  });
  desenharAssinaturaCompacta(altura, elementos);
}

function desenharLegenda(
  itens: ItemLegenda[],
  xInicial: number,
  topoLinha: number,
  medir: MedirTexto,
  elementos: ElementoPagina[],
): void {
  const avanco = medir('0', 'AMOSTRA_RODAPE');
  const base = linhaDeBase(topoLinha, 'RODAPE');
  const topoEtiqueta = topoLinha + (entrelinha('RODAPE') - rodape.etiquetaAltura) / 2;
  let x = xInicial;
  itens.forEach((item, indice) => {
    if (indice > 0) {
      x += rodape.espacoSeparador;
      elementos.push({
        tipo: 'TEXTO',
        x,
        y: base,
        texto: TEXTOS_DOCUMENTO.separadorLegenda,
        estilo: 'RODAPE',
      });
      x += medir(TEXTOS_DOCUMENTO.separadorLegenda, 'RODAPE') + rodape.espacoSeparador;
    }
    const larguraEtiqueta = Math.max(1, Array.from(item.amostra).length) * avanco + rodape.etiquetaPaddingX * 2;
    elementos.push({
      tipo: 'RETANGULO',
      x,
      y: topoEtiqueta,
      largura: larguraEtiqueta,
      altura: rodape.etiquetaAltura,
      raio: rodape.raioEtiqueta,
      preenchimento: CORES_IMPRESSAO.papel,
      borda: CORES_IMPRESSAO.bordaCaixaValor,
      espessura: GEOMETRIA_DOCUMENTO.espessuraDivisoria,
    });
    elementos.push({
      tipo: 'VALOR',
      x: x + rodape.etiquetaPaddingX,
      y: linhaDeBase(topoLinha, 'AMOSTRA_RODAPE'),
      linha: { texto: item.amostra, espacoNaQuebra: item.amostra === '' },
      avanco,
      estilo: 'AMOSTRA_RODAPE',
    });
    x += larguraEtiqueta + rodape.espacoEtiquetaTexto;
    elementos.push({ tipo: 'TEXTO', x, y: base, texto: item.descricao, estilo: 'RODAPE' });
    x += medir(item.descricao, 'RODAPE');
  });
}

function desenharRodape(numeroPagina: number, totalPaginas: number, medir: MedirTexto, elementos: ElementoPagina[]): void {
  const direita = PAGINA_A4.largura - margem;
  const topoCaixa = PAGINA_A4.altura - margem - (ALTURA_RODAPE - rodape.espacoAcima);
  elementos.push({
    tipo: 'RETANGULO',
    x: margem,
    y: topoCaixa,
    largura: LARGURA_CONTEUDO,
    altura: ALTURA_CAIXA_LEGENDA,
    raio: rodape.raioLegenda,
    preenchimento: CORES_IMPRESSAO.faixaCartao,
    borda: CORES_IMPRESSAO.bordaCaixaValor,
    espessura: GEOMETRIA_DOCUMENTO.espessuraDivisoria,
  });

  const xRotulo = margem + rodape.legendaPaddingX;
  const xItens =
    xRotulo +
    Math.max(
      medir(TEXTOS_DOCUMENTO.rotuloLegenda, 'ROTULO_LEGENDA'),
      medir(TEXTOS_DOCUMENTO.rotuloCores, 'ROTULO_LEGENDA'),
    ) +
    rodape.colunaRotulo;
  const linhas: [string, ItemLegenda[]][] = [
    [TEXTOS_DOCUMENTO.rotuloLegenda, LEGENDA_CARACTERES],
    [TEXTOS_DOCUMENTO.rotuloCores, LEGENDA_CORES],
  ];
  linhas.forEach(([rotulo, itens], indice) => {
    const topoLinha = topoCaixa + rodape.legendaPaddingY + indice * (entrelinha('RODAPE') + rodape.espacoEntreLinhas);
    elementos.push({
      tipo: 'TEXTO',
      x: xRotulo,
      y: linhaDeBase(topoLinha, 'ROTULO_LEGENDA'),
      texto: rotulo,
      estilo: 'ROTULO_LEGENDA',
    });
    desenharLegenda(itens, xItens, topoLinha, medir, elementos);
  });

  const baseFinal = linhaDeBase(topoCaixa + ALTURA_CAIXA_LEGENDA + rodape.espacoLegendaAviso, 'RODAPE');
  elementos.push({ tipo: 'CADEADO', x: margem, y: baseFinal, cor: CORES_IMPRESSAO.terciario });
  elementos.push({
    tipo: 'TEXTO',
    x: margem + rodape.larguraCadeado,
    y: baseFinal,
    texto: TEXTOS_DOCUMENTO.confidencial,
    estilo: 'RODAPE',
  });
  elementos.push({
    tipo: 'TEXTO',
    x: direita,
    y: baseFinal,
    texto: `Página ${numeroPagina + 1} de ${totalPaginas}`,
    estilo: 'RODAPE',
    alinhamento: 'FIM',
  });
}

function criarContexto(medir: MedirTexto, espacamento: EspacamentoCartao, cabecalhoMedido: CabecalhoMedido): Contexto {
  const larguraColuna = (LARGURA_CONTEUDO - espacoEntreColunas * (colunas - 1)) / colunas;
  const larguraInterna = larguraColuna - espacamento.paddingX * 2;
  return {
    medir,
    espacamento,
    larguraColuna,
    larguraInterna,
    larguraTexto: larguraInterna * folgaMedicao,
    larguraValor: (larguraInterna - espacamento.caixaValorPaddingX * 2) * folgaMedicao,
    areaPrimeiraPagina: areaDaColuna(cabecalhoMedido.alturaFaixaPrimeira + cabecalho.espacoAbaixo),
    areaDemaisPaginas: areaDaColuna(cabecalhoMedido.alturaFaixaDemais + cabecalhoCompacto.espacoAbaixo),
  };
}

function planejar(contas: ContaImpressa[], contexto: Contexto): CartaoPlanejado[] {
  const cartoes = planejarCartoes(
    contas.map((conta, posicao) => medirConta(conta, contexto, posicao)),
    contexto,
  );
  equilibrarUltimaPagina(cartoes, contexto);
  return cartoes;
}

function totalDePaginas(cartoes: CartaoPlanejado[]): number {
  return cartoes.reduce((maior, cartao) => Math.max(maior, cartao.pagina + 1), 0);
}

export function montarDocumento({ folha, medir, data, permitirCompactar = true }: EntradaDocumento): DocumentoImpresso {
  const contas = selecionarContas(folha);
  const titulo = folha.titulo.trim().replace(/\s+/gu, ' ') || TITULO_DOCUMENTO_PADRAO;
  const documentoVazio: DocumentoImpresso = {
    largura: PAGINA_A4.largura,
    altura: PAGINA_A4.altura,
    titulo,
    totalContas: contas.length,
    paginas: [],
  };
  if (contas.length === 0) return documentoVazio;

  const cabecalhoMedido = medirCabecalho(titulo, medir);
  let contexto = criarContexto(medir, ESPACAMENTO_NORMAL, cabecalhoMedido);
  let cartoes = planejar(contas, contexto);

  if (permitirCompactar && totalDePaginas(cartoes) > 1) {
    const contextoCompacto = criarContexto(medir, ESPACAMENTO_COMPACTO, cabecalhoMedido);
    const cartoesCompactos = planejar(contas, contextoCompacto);
    if (totalDePaginas(cartoesCompactos) < totalDePaginas(cartoes)) {
      contexto = contextoCompacto;
      cartoes = cartoesCompactos;
    }
  }

  const total = totalDePaginas(cartoes);
  const dataFormatada = formatarData(data);
  const paginas: PaginaImpressa[] = Array.from({ length: total }, (_, numero) => {
    const elementos: ElementoPagina[] = [];
    desenharPontosDoCanto(
      cartoes.filter((cartao) => cartao.pagina === numero),
      contexto,
      elementos,
    );
    desenharCabecalho(numero, cabecalhoMedido, dataFormatada, medir, elementos);
    cartoes.forEach((cartao, indice) => {
      if (cartao.pagina === numero) desenharCartao(cartao, cartoes[indice + 1], contexto, elementos);
    });
    desenharRodape(numero, total, medir, elementos);
    return { elementos };
  });

  return { ...documentoVazio, paginas };
}
