import { describe, expect, it } from 'vitest';
import { classificarCaractere, segmentarPorClasse } from './caracteres';

describe('classificarCaractere', () => {
  it('reconhece letras, inclusive acentuadas', () => {
    expect(classificarCaractere('a')).toBe('LETRA');
    expect(classificarCaractere('Z')).toBe('LETRA');
    expect(classificarCaractere('ç')).toBe('LETRA');
    expect(classificarCaractere('É')).toBe('LETRA');
  });

  it('reconhece números', () => {
    expect(classificarCaractere('0')).toBe('NUMERO');
    expect(classificarCaractere('9')).toBe('NUMERO');
  });

  it('trata pontuação e símbolos como símbolo', () => {
    expect(classificarCaractere('#')).toBe('SIMBOLO');
    expect(classificarCaractere('-')).toBe('SIMBOLO');
    expect(classificarCaractere('€')).toBe('SIMBOLO');
  });

  it('reconhece espaços', () => {
    expect(classificarCaractere(' ')).toBe('ESPACO');
  });
});

describe('segmentarPorClasse', () => {
  it('agrupa caracteres vizinhos da mesma classe', () => {
    expect(segmentarPorClasse('ab12#!c')).toEqual([
      { classe: 'LETRA', texto: 'ab' },
      { classe: 'NUMERO', texto: '12' },
      { classe: 'SIMBOLO', texto: '#!' },
      { classe: 'LETRA', texto: 'c' },
    ]);
  });

  it('não quebra emojis formados por pares substitutos', () => {
    const segmentos = segmentarPorClasse('a🔒b');
    expect(segmentos.map((segmento) => segmento.texto).join('')).toBe('a🔒b');
    expect(segmentos[1]).toEqual({ classe: 'SIMBOLO', texto: '🔒' });
  });

  it('devolve lista vazia para texto vazio', () => {
    expect(segmentarPorClasse('')).toEqual([]);
  });
});
