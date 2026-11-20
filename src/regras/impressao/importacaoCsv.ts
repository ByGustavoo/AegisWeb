import { NOMES_CAMPO_IMPORTADO, NOMES_COLUNA_IMPORTACAO } from '@/configuracoes/impressao';
import type { ColunaImportacao } from '@/configuracoes/impressao';
import type {
  CampoNovo,
  ContaImportada,
  ContaNova,
  OrigemExportacao,
  ResultadoImportacao,
} from '@/modelos/impressao';

const PADRAO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
const PADRAO_ESQUEMA = /^[a-z][a-z0-9+.-]*:\/\//iu;

export function lerCsv(texto: string): string[][] {
  const conteudo = texto.replace(/^﻿/u, '').replace(/\r\n?/gu, '\n');
  const primeiraLinha = conteudo.slice(0, conteudo.search(/\n|$/u));
  const separador = !primeiraLinha.includes(',') && primeiraLinha.includes(';') ? ';' : ',';
  const linhas: string[][] = [];
  let linha: string[] = [];
  let celula = '';
  let entreAspas = false;
  let indice = 0;

  const fecharCelula = () => {
    linha.push(celula);
    celula = '';
  };
  const fecharLinha = () => {
    fecharCelula();
    if (linha.some((valor) => valor !== '')) linhas.push(linha);
    linha = [];
  };

  while (indice < conteudo.length) {
    const caractere = conteudo[indice];
    if (entreAspas) {
      if (caractere === '"' && conteudo[indice + 1] === '"') {
        celula += '"';
        indice += 2;
        continue;
      }
      if (caractere === '"') entreAspas = false;
      else celula += caractere;
      indice += 1;
      continue;
    }
    if (caractere === '"') entreAspas = true;
    else if (caractere === separador) fecharCelula();
    else if (caractere === '\n') fecharLinha();
    else celula += caractere;
    indice += 1;
  }
  if (celula !== '' || linha.length > 0) fecharLinha();
  return linhas;
}

function normalizarNomeColuna(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim()
    .toLocaleLowerCase('pt-BR');
}

function mapearColunas(cabecalho: string[]): Partial<Record<ColunaImportacao, number>> {
  const nomes = cabecalho.map(normalizarNomeColuna);
  const mapa: Partial<Record<ColunaImportacao, number>> = {};
  for (const [coluna, apelidos] of Object.entries(NOMES_COLUNA_IMPORTACAO) as [ColunaImportacao, string[]][]) {
    const posicao = apelidos.map((apelido) => nomes.indexOf(apelido)).find((indice) => indice >= 0);
    if (posicao !== undefined) mapa[coluna] = posicao;
  }
  return mapa;
}

function detectarOrigem(cabecalho: string[]): OrigemExportacao {
  const nomes = new Set(cabecalho.map(normalizarNomeColuna));
  if (nomes.has('httprealm') || nomes.has('formactionorigin') || nomes.has('guid')) return 'FIREFOX';
  if (nomes.has('otpauth') || (nomes.has('title') && nomes.has('notes'))) return 'SAFARI';
  if (nomes.has('name') && nomes.has('url') && nomes.has('username')) return 'CHROMIUM';
  return 'OUTRA';
}

function lerEndereco(endereco: string): URL | null {
  if (!PADRAO_ESQUEMA.test(endereco)) return null;
  try {
    return new URL(endereco);
  } catch {
    return null;
  }
}

function hostLegivel(endereco: URL | null): string {
  return endereco?.hostname.replace(/^www\./iu, '') ?? '';
}

export function siteDoEndereco(bruto: string): string {
  const texto = bruto.trim();
  if (!texto) return '';
  const endereco = lerEndereco(texto);
  if (!endereco) return PADRAO_ESQUEMA.test(texto) ? '' : texto;
  if (endereco.protocol !== 'http:' && endereco.protocol !== 'https:') return '';
  return endereco.origin;
}

export function tituloDaConta(nome: string, endereco: string, usuario: string): string {
  let titulo = nome.trim();
  const sufixoUsuario = usuario ? ` (${usuario})` : '';
  if (sufixoUsuario && titulo.endsWith(sufixoUsuario)) titulo = titulo.slice(0, -sufixoUsuario.length).trim();
  if (titulo && !PADRAO_ESQUEMA.test(titulo)) return titulo;
  const host = hostLegivel(lerEndereco(endereco.trim()));
  if (host) return host;
  return titulo || endereco.trim();
}

function normalizarParaChave(texto: string): string {
  return texto.normalize('NFC').trim().toLocaleLowerCase('pt-BR');
}

export function chaveDaConta(conta: ContaNova): string {
  const valores = conta.campos
    .map((campo) => campo.valor.normalize('NFC').trim())
    .filter((valor) => valor !== '')
    .sort();
  return [normalizarParaChave(conta.titulo), ...valores].join('\u0000');
}

function camposDaConta(usuario: string, senha: string, site: string, observacao: string): CampoNovo[] {
  const campos: CampoNovo[] = [];
  if (usuario) {
    campos.push({ nome: PADRAO_EMAIL.test(usuario) ? NOMES_CAMPO_IMPORTADO.email : NOMES_CAMPO_IMPORTADO.usuario, valor: usuario });
  }
  if (senha) campos.push({ nome: NOMES_CAMPO_IMPORTADO.senha, valor: senha });
  if (site) campos.push({ nome: NOMES_CAMPO_IMPORTADO.site, valor: site });
  if (observacao) campos.push({ nome: NOMES_CAMPO_IMPORTADO.observacao, valor: observacao });
  return campos;
}

const comparador = new Intl.Collator('pt-BR', { sensitivity: 'base', numeric: true });

export function compararContasImportadas(a: ContaImportada, b: ContaImportada): number {
  return comparador.compare(a.titulo, b.titulo) || comparador.compare(a.usuario, b.usuario);
}

export function interpretarExportacao(texto: string): ResultadoImportacao {
  const linhas = lerCsv(texto);
  const [cabecalho, ...registros] = linhas;
  if (!cabecalho) return { tipo: 'FALHOU', motivo: 'VAZIO' };

  const colunas = mapearColunas(cabecalho);
  if (colunas.SENHA === undefined) return { tipo: 'FALHOU', motivo: 'SEM_COLUNA_SENHA' };

  const ler = (registro: string[], coluna: ColunaImportacao) => {
    const posicao = colunas[coluna];
    return posicao === undefined ? '' : (registro[posicao] ?? '');
  };

  const vistas = new Set<string>();
  const contas: ContaImportada[] = [];
  let repetidasNoArquivo = 0;
  let comCodigoDoisFatores = 0;

  for (const registro of registros) {
    const usuario = ler(registro, 'USUARIO').trim();
    const senha = ler(registro, 'SENHA');
    if (!usuario && !senha.trim()) continue;
    const endereco = ler(registro, 'SITE');
    const titulo = tituloDaConta(ler(registro, 'TITULO'), endereco, usuario);
    const campos = camposDaConta(usuario, senha, siteDoEndereco(endereco), ler(registro, 'OBSERVACAO').trim());
    const chave = chaveDaConta({ titulo, campos });
    if (vistas.has(chave)) {
      repetidasNoArquivo += 1;
      continue;
    }
    vistas.add(chave);
    if (ler(registro, 'CODIGO_DOIS_FATORES').trim()) comCodigoDoisFatores += 1;
    contas.push({ chave, titulo, usuario, campos });
  }

  if (contas.length === 0) return { tipo: 'FALHOU', motivo: 'SEM_CONTAS' };
  contas.sort(compararContasImportadas);
  return { tipo: 'LIDO', origem: detectarOrigem(cabecalho), contas, repetidasNoArquivo, comCodigoDoisFatores };
}
