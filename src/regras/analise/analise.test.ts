import { beforeAll, describe, expect, it } from 'vitest';
import { finalidades } from '@/configuracoes/finalidades';
import { OPCOES_FRASE_PADRAO } from '@/configuracoes/geracao';
import type { Dicionarios, TipoPadrao } from '@/modelos/analise';
import { calcularForca } from '@/regras/forca';
import { entropiaFraseSenha, gerarFraseSenha } from '@/regras/fraseSenha';
import { entropiaSenha, gerarSenha } from '@/regras/geradorSenha';
import { analisarSenha, nivelPorNota, notaPorEntropia, preencher, TAMANHO_MAXIMO_ANALISE } from './analisarSenha';
import { encontrarCorrespondencias } from './correspondencias';
import { carregarDicionarios, criarDicionarios } from './dicionarios';
import { estimar } from './estimativa';

const ANO = 2026;
const VAZIOS = criarDicionarios({});
let dicionarios: Dicionarios;

beforeAll(async () => {
  dicionarios = await carregarDicionarios();
});

function tipos(senha: string, fontes: Dicionarios = VAZIOS): TipoPadrao[] {
  return estimar(senha, fontes, ANO).sequencia.map((item) => item.tipo);
}

describe('nota e nível', () => {
  it('converte a entropia em nota com os mesmos cortes do gerador', () => {
    expect(notaPorEntropia(0)).toBe(0);
    expect(notaPorEntropia(27.99)).toBe(19);
    expect(notaPorEntropia(28)).toBe(20);
    expect(notaPorEntropia(40)).toBe(40);
    expect(notaPorEntropia(60)).toBe(60);
    expect(notaPorEntropia(80)).toBe(80);
    expect(notaPorEntropia(500)).toBe(100);
  });

  it('divide a nota em 5 faixas de 20 pontos', () => {
    expect(nivelPorNota(0)).toBe(1);
    expect(nivelPorNota(19)).toBe(1);
    expect(nivelPorNota(20)).toBe(2);
    expect(nivelPorNota(59)).toBe(3);
    expect(nivelPorNota(79)).toBe(4);
    expect(nivelPorNota(80)).toBe(5);
    expect(nivelPorNota(100)).toBe(5);
  });
});

describe('padrões', () => {
  it('acha sequências de letras e números, nos dois sentidos', () => {
    expect(tipos('abcdef')).toEqual(['SEQUENCIA']);
    expect(tipos('97531')).toEqual(['SEQUENCIA']);
  });

  it('acha teclas vizinhas no teclado e no teclado numérico', () => {
    expect(tipos('qwerfdsa')).toEqual(['TECLADO']);
    const contexto = { dicionarios: VAZIOS, anoReferencia: ANO, estimarBase: () => 1 };
    const numerico = encontrarCorrespondencias(Array.from('74123'), contexto).filter((item) => item.tipo === 'TECLADO');
    expect(numerico.map((item) => item.trecho)).toContain('74123');
  });

  it('acha repetições de um caractere e de um trecho', () => {
    const [caractere] = estimar('aaaaaa', VAZIOS, ANO).sequencia;
    expect(caractere).toMatchObject({ tipo: 'REPETICAO', base: 'a', repeticoes: 6 });
    const [bloco] = estimar('xk7xk7xk7', VAZIOS, ANO).sequencia;
    expect(bloco).toMatchObject({ tipo: 'REPETICAO', base: 'xk7', repeticoes: 3 });
  });

  it('acha datas com e sem separador e anos soltos', () => {
    expect(tipos('10/05/1990')).toEqual(['DATA']);
    expect(tipos('100590')).toEqual(['DATA']);
    expect(tipos('2024')).toEqual(['ANO']);
  });

  it('acha palavras, nomes e senhas comuns, inclusive trocadas e invertidas', () => {
    const fontes = criarDicionarios({ PALAVRAS_PORTUGUES: ['casa', 'janela'], NOMES: ['maria'], SENHAS_COMUNS: ['senha'] });
    expect(tipos('janela', fontes)).toEqual(['PALAVRA']);
    expect(tipos('maria', fontes)).toEqual(['NOME']);
    expect(tipos('senha', fontes)).toEqual(['SENHA_COMUM']);

    const [trocada] = estimar('j4n3l4', fontes, ANO).sequencia;
    expect(trocada).toMatchObject({ tipo: 'PALAVRA', palavra: 'janela', trocada: true });
    const [invertida] = estimar('alenaj', fontes, ANO).sequencia;
    expect(invertida).toMatchObject({ tipo: 'PALAVRA', palavra: 'janela', invertida: true });
  });

  it('reconhece palavras com acento e maiúsculas', () => {
    const fontes = criarDicionarios({ PALAVRAS_PORTUGUES: ['coracao'] });
    const [palavra] = estimar('Coração', fontes, ANO).sequencia;
    expect(palavra).toMatchObject({ tipo: 'PALAVRA', palavra: 'coracao', maiusculas: 'PRIMEIRA' });
  });

  it('trata palavras separadas como uma frase, com ou sem final', () => {
    const fontes = criarDicionarios({ PALAVRAS_PORTUGUES: ['eu', 'amo', 'minha', 'mae', 'casa', 'bola'] });
    expect(estimar('eu amo minha mae', fontes, ANO).sequencia[0]).toMatchObject({ tipo: 'FRASE', quantidadePalavras: 4 });
    expect(estimar('Casa-Bola-Minha-42', fontes, ANO).sequencia[0]).toMatchObject({ tipo: 'FRASE', quantidadePalavras: 3 });
    expect(estimar('CasaBolaMinha', fontes, ANO).sequencia[0]).toMatchObject({ tipo: 'FRASE', quantidadePalavras: 3 });
  });

  it('não vê padrão em caracteres sem relação', () => {
    expect(tipos('x7#Kq9!mZ2')).toEqual(['ALEATORIO']);
  });

  it('não vê padrão no preenchimento usado nas simulações', () => {
    const todas = ['minusculas', 'maiusculas', 'numeros', 'simbolos'] as const;
    for (const classe of ['minusculas', 'maiusculas', 'simbolos'] as const) {
      const analise = analisarSenha(preencher(20, [classe]), dicionarios, ANO);
      expect(analise?.pontosFracos.filter((item) => item.id.startsWith('padrao'))).toEqual([]);
    }
    const misturado = analisarSenha(preencher(24, [...todas]), dicionarios, ANO);
    expect(misturado?.pontosFracos).toEqual([]);
  });
});

describe('analisarSenha', () => {
  it('não analisa uma senha vazia', () => {
    expect(analisarSenha('', dicionarios, ANO)).toBeNull();
  });

  it('dá nota mínima para as senhas mais usadas', () => {
    for (const senha of ['123456', 'senha', 'qwerty123', 'flamengo', 'corinthians']) {
      const analise = analisarSenha(senha, dicionarios, ANO);
      expect(analise?.nivel).toBe(1);
      expect(analise?.pontosFracos.some((item) => item.titulo.includes('senhas mais usadas'))).toBe(true);
    }
  });

  it('explica cada parte previsível de uma senha comum', () => {
    const analise = analisarSenha('Flamengo@2024', dicionarios, ANO);
    const titulos = analise?.pontosFracos.map((item) => item.titulo) ?? [];
    expect(titulos).toContain('“Flamengo” é uma senha muito usada');
    expect(titulos).toContain('“2024” parece um ano');
    expect(titulos).toContain('Maiúscula só no começo');
    expect(analise?.pontosFortes.map((item) => item.id)).toContain('variedade');
  });

  it('marca o trecho de cada padrão encontrado', () => {
    const analise = analisarSenha('s3nh@123', dicionarios, ANO);
    const trocada = analise?.pontosFracos.find((item) => item.titulo.includes('letras trocadas'));
    expect(trocada?.trecho).toEqual({ inicio: 0, fim: 4 });
  });

  it('elogia uma senha aleatória longa', () => {
    const analise = analisarSenha('xK9#mQ2$vL7@pR4!', dicionarios, ANO);
    expect(analise?.nivel).toBe(5);
    expect(analise?.pontosFracos).toEqual([]);
    expect(analise?.pontosFortes.map((item) => item.id)).toEqual(['comprimento', 'variedade', 'sem-padroes']);
    expect(analise?.recomendacoes).toEqual([]);
  });

  it('recomenda o que mais sobe a nota primeiro e só o que ajuda', () => {
    const analise = analisarSenha('Flamengo@2024', dicionarios, ANO);
    const recomendacoes = analise?.recomendacoes ?? [];
    expect(recomendacoes.length).toBeGreaterThan(0);
    expect(recomendacoes.map((item) => item.id)).toContain('frase-senha');
    recomendacoes.forEach((item) => expect(item.notaSimulada).toBeGreaterThan(analise?.nota ?? 0));
    const notas = recomendacoes.map((item) => item.notaSimulada);
    expect(notas).toEqual([...notas].sort((a, b) => b - a));
  });

  it(`analisa só os primeiros ${TAMANHO_MAXIMO_ANALISE} caracteres`, () => {
    const analise = analisarSenha('aB3$'.repeat(60), dicionarios, ANO);
    expect(analise?.tamanho).toBe(240);
    expect(analise?.truncada).toBe(true);
  });

  it('concorda com o gerador sobre senhas aleatórias', () => {
    for (const { opcoes } of finalidades) {
      const nivelGerador = calcularForca(entropiaSenha(opcoes)).nivel;
      for (let i = 0; i < 20; i += 1) {
        const analise = analisarSenha(gerarSenha(opcoes), dicionarios, ANO);
        expect(Math.abs((analise?.nivel ?? 0) - nivelGerador)).toBeLessThanOrEqual(1);
      }
    }
  });

  it('concorda com o gerador sobre frases-senha', () => {
    const nivelGerador = calcularForca(entropiaFraseSenha(OPCOES_FRASE_PADRAO)).nivel;
    for (let i = 0; i < 20; i += 1) {
      const analise = analisarSenha(gerarFraseSenha(OPCOES_FRASE_PADRAO), dicionarios, ANO);
      expect(Math.abs((analise?.nivel ?? 0) - nivelGerador)).toBeLessThanOrEqual(1);
      expect(analise?.pontosFortes.map((item) => item.id)).toContain('frase');
    }
  });
});
