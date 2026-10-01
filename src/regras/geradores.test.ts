import { describe, expect, it } from 'vitest';
import { PALAVRAS } from '@/dados/palavras';
import type { OpcoesFraseSenha, OpcoesSenha } from '@/modelos/senha';
import { embaralhar, inteiroAleatorio } from './aleatorio';
import { calcularForca, nivelPorEntropia, tempoParaQuebrar } from './forca';
import { entropiaFraseSenha, gerarFraseSenha } from './fraseSenha';
import { CARACTERES_AMBIGUOS, CONJUNTOS_CARACTERES, entropiaSenha, gerarSenha } from './geradorSenha';
import { entropiaPin, gerarPin, pinEhObvio } from './pin';

const TODAS_AS_CLASSES: OpcoesSenha = {
  tamanho: 16,
  usarMaiusculas: true,
  usarMinusculas: true,
  usarNumeros: true,
  usarSimbolos: true,
  evitarAmbiguos: false,
};

const REPETICOES = 300;

function repetir<T>(vezes: number, gerar: () => T): T[] {
  return Array.from({ length: vezes }, gerar);
}

describe('inteiroAleatorio', () => {
  it('fica sempre dentro do intervalo pedido', () => {
    const valores = repetir(2000, () => inteiroAleatorio(7));
    expect(valores.every((valor) => Number.isInteger(valor) && valor >= 0 && valor < 7)).toBe(true);
    expect(new Set(valores).size).toBe(7);
  });

  it('distribui os valores sem viés grosseiro', () => {
    const contagem = new Array<number>(4).fill(0);
    repetir(8000, () => inteiroAleatorio(4)).forEach((valor) => {
      contagem[valor] = (contagem[valor] ?? 0) + 1;
    });
    contagem.forEach((quantidade) => {
      expect(quantidade).toBeGreaterThan(1700);
      expect(quantidade).toBeLessThan(2300);
    });
  });

  it('recusa limites inválidos', () => {
    expect(() => inteiroAleatorio(0)).toThrow(RangeError);
    expect(() => inteiroAleatorio(2.5)).toThrow(RangeError);
  });
});

describe('embaralhar', () => {
  it('mantém os mesmos itens sem alterar a lista original', () => {
    const original = ['a', 'b', 'c', 'd', 'e'];
    const resultado = embaralhar(original);
    expect([...resultado].sort()).toEqual(original);
    expect(original).toEqual(['a', 'b', 'c', 'd', 'e']);
  });
});

describe('gerarSenha', () => {
  it('respeita o tamanho pedido', () => {
    [8, 16, 33, 64].forEach((tamanho) => {
      expect(gerarSenha({ ...TODAS_AS_CLASSES, tamanho })).toHaveLength(tamanho);
    });
  });

  it('sempre inclui ao menos um caractere de cada tipo marcado', () => {
    repetir(REPETICOES, () => gerarSenha({ ...TODAS_AS_CLASSES, tamanho: 8 })).forEach((senha) => {
      expect(senha).toMatch(/[A-Z]/);
      expect(senha).toMatch(/[a-z]/);
      expect(senha).toMatch(/[0-9]/);
      expect([...senha].some((caractere) => CONJUNTOS_CARACTERES.simbolos.includes(caractere))).toBe(true);
    });
  });

  it('usa só os tipos marcados', () => {
    repetir(REPETICOES, () =>
      gerarSenha({ ...TODAS_AS_CLASSES, usarMaiusculas: false, usarSimbolos: false }),
    ).forEach((senha) => {
      expect(senha).toMatch(/^[a-z0-9]+$/);
    });
  });

  it('deixa de fora os caracteres ambíguos quando pedido', () => {
    repetir(REPETICOES, () => gerarSenha({ ...TODAS_AS_CLASSES, tamanho: 64, evitarAmbiguos: true })).forEach(
      (senha) => {
        expect([...senha].some((caractere) => CARACTERES_AMBIGUOS.includes(caractere))).toBe(false);
      },
    );
  });

  it('não repete senhas', () => {
    const senhas = repetir(REPETICOES, () => gerarSenha(TODAS_AS_CLASSES));
    expect(new Set(senhas).size).toBe(REPETICOES);
  });

  it('recusa uma configuração sem nenhum tipo de caractere', () => {
    expect(() =>
      gerarSenha({
        ...TODAS_AS_CLASSES,
        usarMaiusculas: false,
        usarMinusculas: false,
        usarNumeros: false,
        usarSimbolos: false,
      }),
    ).toThrow();
  });

  it('calcula a entropia pelo tamanho do alfabeto', () => {
    const soNumeros = { ...TODAS_AS_CLASSES, usarMaiusculas: false, usarMinusculas: false, usarSimbolos: false };
    expect(entropiaSenha({ ...soNumeros, tamanho: 10 })).toBeCloseTo(10 * Math.log2(10));
  });
});

describe('gerarFraseSenha', () => {
  const opcoes: OpcoesFraseSenha = {
    quantidadePalavras: 6,
    separador: '-',
    iniciaisMaiusculas: true,
    incluirNumero: true,
  };

  it('junta as palavras com o separador e termina com um número de dois dígitos', () => {
    repetir(REPETICOES, () => gerarFraseSenha(opcoes)).forEach((frase) => {
      const partes = frase.split('-');
      expect(partes).toHaveLength(7);
      expect(partes.at(-1)).toMatch(/^[1-9][0-9]$/);
      partes.slice(0, -1).forEach((palavra) => {
        expect(palavra).toMatch(/^[A-Z][a-z]+$/);
        expect(PALAVRAS).toContain(palavra.toLowerCase());
      });
    });
  });

  it('respeita as opções de capitalização, número e separador', () => {
    const frase = gerarFraseSenha({ quantidadePalavras: 4, separador: ' ', iniciaisMaiusculas: false, incluirNumero: false });
    const partes = frase.split(' ');
    expect(partes).toHaveLength(4);
    partes.forEach((palavra) => expect(palavra).toMatch(/^[a-z]+$/));
  });

  it('soma a entropia das palavras e do número', () => {
    expect(entropiaFraseSenha({ ...opcoes, incluirNumero: false }, 1024)).toBeCloseTo(60);
    expect(entropiaFraseSenha(opcoes, 1024)).toBeCloseTo(60 + Math.log2(90));
  });
});

describe('lista de palavras', () => {
  it('tem só palavras de 4 a 8 letras, sem acento e sem repetição', () => {
    expect(PALAVRAS.length).toBeGreaterThanOrEqual(1000);
    PALAVRAS.forEach((palavra) => expect(palavra).toMatch(/^[a-z]{4,8}$/));
    expect(new Set(PALAVRAS).size).toBe(PALAVRAS.length);
  });
});

describe('gerarPin', () => {
  it('gera só dígitos, no tamanho pedido', () => {
    [4, 6, 12].forEach((tamanho) => {
      expect(gerarPin(tamanho)).toMatch(new RegExp(`^[0-9]{${tamanho}}$`));
    });
  });

  it('nunca entrega um PIN óbvio', () => {
    repetir(REPETICOES, () => gerarPin(4)).forEach((pin) => expect(pinEhObvio(pin)).toBe(false));
  });

  it('reconhece repetições e sequências', () => {
    expect(pinEhObvio('0000')).toBe(true);
    expect(pinEhObvio('1234')).toBe(true);
    expect(pinEhObvio('9876')).toBe(true);
    expect(pinEhObvio('4829')).toBe(false);
  });

  it('calcula a entropia por dígito', () => {
    expect(entropiaPin(6)).toBeCloseTo(6 * Math.log2(10));
  });
});

describe('força', () => {
  it('classifica a entropia nos cinco níveis', () => {
    expect(nivelPorEntropia(20)).toBe(1);
    expect(nivelPorEntropia(30)).toBe(2);
    expect(nivelPorEntropia(50)).toBe(3);
    expect(nivelPorEntropia(70)).toBe(4);
    expect(nivelPorEntropia(100)).toBe(5);
  });

  it('descreve o tempo para quebrar em português', () => {
    expect(tempoParaQuebrar(10)).toBe('Menos de um segundo');
    expect(tempoParaQuebrar(40)).toBe('55 segundos');
    expect(tempoParaQuebrar(60)).toBe('2 anos');
    expect(tempoParaQuebrar(200)).toBe('Mais que a idade do universo');
  });

  it('reúne nível, entropia e tempo', () => {
    expect(calcularForca(103)).toEqual({
      nivel: 5,
      entropiaBits: 103,
      tempoEstimadoQuebra: 'Mais que a idade do universo',
    });
  });
});
