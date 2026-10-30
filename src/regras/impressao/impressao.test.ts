import { describe, expect, it } from 'vitest';
import {
  CORES_IMPRESSAO,
  ESTILOS_TEXTO,
  GEOMETRIA_DOCUMENTO,
  PAGINA_A4,
  PALETA_CONTAS,
  TEXTOS_DOCUMENTO,
} from '@/configuracoes/impressao';
import type {
  CampoCredencial,
  ContaCredencial,
  DocumentoImpresso,
  ElementoPagina,
  FolhaCredenciais,
  MedirTexto,
} from '@/modelos/impressao';
import { nomeDoArquivo } from './arquivo';
import { iconeDoCampo } from './iconeDoCampo';
import { montarDocumento } from './paginacao';
import { quebrarTexto } from './quebraLinhas';
import { folhaTemDados, selecionarContas } from './selecao';

const medir: MedirTexto = (texto, estilo) => {
  const { fonte, tamanho, espacamentoLetras } = ESTILOS_TEXTO[estilo];
  const proporcao = fonte === 'GEIST_MONO' ? 0.6 : 0.56;
  const caracteres = Array.from(texto).length;
  return caracteres * tamanho * proporcao + caracteres * espacamentoLetras;
};

const DATA = new Date(2026, 9, 29);
const LARGURA_COLUNA = (PAGINA_A4.largura - GEOMETRIA_DOCUMENTO.margem * 2 - GEOMETRIA_DOCUMENTO.espacoEntreColunas) / 2;

let proximoId = 0;
const id = () => {
  proximoId += 1;
  return `id-${proximoId}`;
};

function campo(nome: string, valor: string): CampoCredencial {
  return { id: id(), nome, valor };
}

function conta(titulo: string, campos: [string, string][]): ContaCredencial {
  return { id: id(), titulo, campos: campos.map(([nome, valor]) => campo(nome, valor)) };
}

function folha(contas: ContaCredencial[], extras: Partial<FolhaCredenciais> = {}): FolhaCredenciais {
  return { titulo: '', contas, linhasParaPreencher: false, ...extras };
}

function textos(elementos: ElementoPagina[], estilo: string): string[] {
  return elementos.flatMap((elemento) => (elemento.tipo === 'TEXTO' && elemento.estilo === estilo ? [elemento.texto] : []));
}

function valores(elementos: ElementoPagina[]): string[] {
  return elementos.flatMap((elemento) =>
    elemento.tipo === 'VALOR' && elemento.estilo === 'VALOR' ? [elemento.linha.texto] : [],
  );
}

function cartoes(documento: DocumentoImpresso) {
  return documento.paginas.flatMap((pagina, numero) =>
    pagina.elementos.flatMap((elemento) =>
      elemento.tipo === 'RETANGULO' && elemento.borda === CORES_IMPRESSAO.borda ? [{ ...elemento, pagina: numero }] : [],
    ),
  );
}

function titulosEmOrdemDeLeitura(documento: DocumentoImpresso): string[] {
  return documento.paginas.flatMap((pagina) =>
    pagina.elementos
      .flatMap((elemento) => (elemento.tipo === 'TEXTO' && elemento.estilo === 'TITULO_CONTA' ? [elemento] : []))
      .sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x))
      .map((elemento) => elemento.texto),
  );
}

function senhaLonga(tamanho: number): string {
  const base = 'aB3$xY7!kL0@mN5#';
  return Array.from({ length: tamanho }, (_, indice) => base[indice % base.length]).join('');
}

function montar(entrada: FolhaCredenciais) {
  return montarDocumento({ folha: entrada, medir, data: DATA });
}

describe('selecionarContas', () => {
  it('ignora campos sem valor e contas sem nenhum valor', () => {
    const contas = selecionarContas(
      folha([
        conta('Google', [
          ['E-mail', 'eu@gmail.com'],
          ['Senha', '   '],
          ['', ''],
        ]),
        conta('Vazia', [['Senha', '']]),
        conta('', [['PIN', '4821']]),
      ]),
    );
    expect(contas).toEqual([
      { titulo: 'Google', campos: [{ rotulo: 'E-mail', valor: 'eu@gmail.com' }] },
      { titulo: TEXTOS_DOCUMENTO.semTitulo, campos: [{ rotulo: 'PIN', valor: '4821' }] },
    ]);
  });

  it('com linhas para preencher, mantém campos nomeados e vazios como linha em branco', () => {
    const contas = selecionarContas(
      folha([conta('Banco', [['Agência', '0001'], ['Senha', ''], ['', '']])], { linhasParaPreencher: true }),
    );
    expect(contas[0]?.campos).toEqual([
      { rotulo: 'Agência', valor: '0001' },
      { rotulo: 'Senha', valor: null },
    ]);
  });

  it('troca tabulações por espaço e descarta caracteres de controle', () => {
    const [primeira] = selecionarContas(folha([conta('Nota', [['Observação', 'a\tb\u0007c\r\nd']])]));
    expect(primeira?.campos[0]?.valor).toBe('a bc\nd');
  });

  it('reconhece quando a folha tem algo digitado', () => {
    expect(folhaTemDados(folha([conta('', [['', '']])]))).toBe(false);
    expect(folhaTemDados(folha([conta('', [['Senha', '']])]))).toBe(true);
  });
});

describe('quebrarTexto', () => {
  const medirMono = (texto: string) => Array.from(texto).length * 6;

  it('quebra palavras longas em qualquer caractere', () => {
    const linhas = quebrarTexto(senhaLonga(50), 120, medirMono);
    expect(linhas.map((linha) => linha.texto.length)).toEqual([20, 20, 10]);
    expect(linhas.every((linha) => !linha.espacoNaQuebra)).toBe(true);
    expect(linhas.map((linha) => linha.texto).join('')).toBe(senhaLonga(50));
  });

  it('quebra em espaços e marca onde o espaço sumiu', () => {
    const linhas = quebrarTexto('Cacto Tigre Lua Mesa 47', 72, medirMono);
    expect(linhas).toEqual([
      { texto: 'Cacto Tigre', espacoNaQuebra: true },
      { texto: 'Lua Mesa 47', espacoNaQuebra: false },
    ]);
  });

  it('mantém as quebras de linha digitadas', () => {
    expect(quebrarTexto('linha 1\n\nlinha 3', 300, medirMono).map((linha) => linha.texto)).toEqual([
      'linha 1',
      '',
      'linha 3',
    ]);
  });
});

describe('montarDocumento', () => {
  it('não gera páginas sem contas preenchidas', () => {
    expect(montar(folha([conta('Vazia', [['Senha', '']])])).paginas).toHaveLength(0);
  });

  it('conta com usuário e senha cabe num cartão só, com rótulos e valores', () => {
    const documento = montar(folha([conta('Instagram', [['Usuário', 'meu_usuario'], ['Senha', 'MinhaSenha456']])]));
    expect(documento.paginas).toHaveLength(1);
    const [pagina] = documento.paginas;
    expect(textos(pagina?.elementos ?? [], 'TITULO_CONTA')).toEqual(['Instagram']);
    expect(textos(pagina?.elementos ?? [], 'ROTULO')).toEqual(['USUÁRIO', 'SENHA']);
    expect(valores(pagina?.elementos ?? [])).toEqual(['meu_usuario', 'MinhaSenha456']);
    expect(textos(pagina?.elementos ?? [], 'RODAPE')).toContain('Página 1 de 1');
  });

  it('marca cada cartão com a inicial da conta, sem contar os campos', () => {
    const documento = montar(folha([conta('Instagram', [['Usuário', 'meu_usuario'], ['Senha', 'MinhaSenha456']])]));
    const elementos = documento.paginas[0]?.elementos ?? [];
    expect(elementos.some((elemento) => elemento.tipo === 'TEXTO' && /campos?$/u.test(elemento.texto))).toBe(false);
    expect(textos(elementos, 'INICIAL')).toEqual(['I']);
  });

  it('assina o cabeçalho com a marca e o nome do Aegis em todas as páginas', () => {
    const contas = Array.from({ length: 40 }, (_, indice) => conta(`Conta ${indice + 1}`, [['Senha', senhaLonga(20)]]));
    const [primeira, segunda] = montar(folha(contas)).paginas.map((pagina) => pagina.elementos);
    expect(textos(primeira ?? [], 'NOME_MARCA')).toEqual(['Aegis']);
    expect(textos(primeira ?? [], 'SLOGAN')).toEqual(['Senhas fortes, sem sair do seu aparelho.']);
    expect(textos(segunda ?? [], 'NOME_MARCA_COMPACTO')).toEqual(['Aegis']);
    expect(primeira?.filter((elemento) => elemento.tipo === 'MARCA')).toHaveLength(1);
    expect(segunda?.filter((elemento) => elemento.tipo === 'MARCA')).toHaveLength(1);
  });

  it('preserva acentos e caracteres especiais em títulos, nomes e valores', () => {
    const documento = montar(
      folha([conta('Previdência & Ações — São Paulo', [['Código de recuperação', 'ÇÃO-ñ-ü-€-ß-Ω']])]),
    );
    const elementos = documento.paginas[0]?.elementos ?? [];
    expect(textos(elementos, 'TITULO_CONTA').join(' ')).toBe('Previdência & Ações — São Paulo');
    expect(textos(elementos, 'ROTULO')).toEqual(['CÓDIGO DE RECUPERAÇÃO']);
    expect(valores(elementos)).toEqual(['ÇÃO-ñ-ü-€-ß-Ω']);
  });

  it('quebra valores longos sem passar da largura do cartão', () => {
    const documento = montar(folha([conta('Servidor', [['Chave', senhaLonga(200)]])]));
    const elementos = documento.paginas[0]?.elementos ?? [];
    const linhas = elementos.flatMap((elemento) => (elemento.tipo === 'VALOR' && elemento.estilo === 'VALOR' ? [elemento] : []));
    expect(linhas.length).toBeGreaterThan(4);
    expect(linhas.map((linha) => linha.linha.texto).join('')).toBe(senhaLonga(200));
    const limite = GEOMETRIA_DOCUMENTO.margem + LARGURA_COLUNA;
    linhas.forEach((linha) => {
      expect(linha.x + medir(linha.linha.texto, 'VALOR')).toBeLessThanOrEqual(limite);
    });
  });

  it('distribui muitas contas por várias páginas sem dividir nenhuma e na ordem digitada', () => {
    const contas = Array.from({ length: 60 }, (_, indice) =>
      conta(`Conta ${indice + 1}`, [
        ['Usuário', `usuario${indice}`],
        ['Senha', senhaLonga(16 + (indice % 3) * 20)],
        ...(indice % 4 === 0 ? ([['Observação', 'Conta compartilhada com a família']] as [string, string][]) : []),
      ]),
    );
    const documento = montar(folha(contas));
    expect(documento.paginas.length).toBeGreaterThan(1);
    expect(titulosEmOrdemDeLeitura(documento)).toEqual(contas.map((item) => item.titulo));
    expect(documento.paginas.flatMap((pagina) => textos(pagina.elementos, 'AVISO_CARTAO'))).toEqual([]);
  });

  it('mantém todo o conteúdo dentro da área imprimível', () => {
    const contas = Array.from({ length: 40 }, (_, indice) =>
      conta(`Conta ${indice + 1}`, Array.from({ length: 1 + (indice % 7) }, (_, posicao) => [`Campo ${posicao}`, senhaLonga(30)])),
    );
    const documento = montar(folha(contas));
    const { margem } = GEOMETRIA_DOCUMENTO;
    const pontos = (elemento: ElementoPagina): [number, number][] => {
      if (elemento.tipo === 'LINHA') return [[elemento.x1, elemento.y1], [elemento.x2, elemento.y2]];
      if (elemento.tipo === 'POLIGONO') return elemento.pontos;
      return [[elemento.x, elemento.y]];
    };
    const pontoDoCanto = (elemento: ElementoPagina) =>
      elemento.tipo === 'CIRCULO' && !PALETA_CONTAS.includes(elemento.preenchimento);
    documento.paginas.forEach((pagina) => {
      pagina.elementos.forEach((elemento) => {
        if (pontoDoCanto(elemento)) return;
        pontos(elemento).forEach(([x, y]) => {
          expect(y).toBeGreaterThanOrEqual(margem);
          expect(y).toBeLessThanOrEqual(PAGINA_A4.altura - margem);
          expect(x).toBeGreaterThanOrEqual(margem);
          expect(x).toBeLessThanOrEqual(PAGINA_A4.largura - margem);
        });
      });
    });
    cartoes(documento).forEach((cartao) => {
      expect(cartao.y + cartao.altura).toBeLessThanOrEqual(PAGINA_A4.altura - margem);
    });
  });

  it('organiza a legenda do rodapé em duas linhas, com itens separados por hífen e dentro da página', () => {
    const elementos = montar(folha([conta('Banco', [['Senha', senhaLonga(12)]])])).paginas[0]?.elementos ?? [];
    expect(textos(elementos, 'ROTULO_LEGENDA')).toEqual(['Caracteres parecidos', 'Cores']);
    const separadores = elementos.filter((elemento) => elemento.tipo === 'TEXTO' && elemento.texto === '-');
    expect(separadores).toHaveLength(5 + 1);
    elementos.forEach((elemento) => {
      if (elemento.tipo !== 'TEXTO' || elemento.alinhamento === 'FIM' || elemento.alinhamento === 'MEIO') return;
      expect(elemento.x + medir(elemento.texto, elemento.estilo)).toBeLessThanOrEqual(
        PAGINA_A4.largura - GEOMETRIA_DOCUMENTO.margem,
      );
    });
  });

  it('desenha os pontos do canto inferior esquerdo sem passar por baixo dos cartões', () => {
    const contas = Array.from({ length: 30 }, (_, indice) =>
      conta(`Conta ${indice + 1}`, [['Senha', senhaLonga(20)], ['Usuário', `usuario${indice}`]]),
    );
    const documento = montar(folha(contas));
    documento.paginas.forEach((pagina) => {
      const cartoesDaPagina = pagina.elementos.flatMap((elemento) =>
        elemento.tipo === 'RETANGULO' && elemento.borda === CORES_IMPRESSAO.borda ? [elemento] : [],
      );
      const pontosDoCanto = pagina.elementos.flatMap((elemento) =>
        elemento.tipo === 'CIRCULO' && elemento.y > PAGINA_A4.altura / 2 && !PALETA_CONTAS.includes(elemento.preenchimento)
          ? [elemento]
          : [],
      );
      expect(pontosDoCanto.length).toBeGreaterThan(0);
      pontosDoCanto.forEach((ponto) => {
        expect(ponto.x).toBeLessThan(PAGINA_A4.largura / 2);
        const sobreCartao = cartoesDaPagina.some(
          (cartao) =>
            ponto.x >= cartao.x && ponto.x <= cartao.x + cartao.largura && ponto.y >= cartao.y && ponto.y <= cartao.y + cartao.altura,
        );
        expect(sobreCartao).toBe(false);
      });
    });
  });

  it('divide uma conta extensa, repete o título e avisa onde continua', () => {
    const extensa = conta(
      'Sistema corporativo',
      Array.from({ length: 70 }, (_, indice) => [`Código ${indice + 1}`, senhaLonga(24)]),
    );
    const documento = montar(folha([extensa]));
    const todos = documento.paginas.flatMap((pagina) => pagina.elementos);
    const titulos = textos(todos, 'TITULO_CONTA');
    expect(titulos.length).toBeGreaterThan(1);
    expect(new Set(titulos)).toEqual(new Set(['Sistema corporativo']));
    expect(textos(todos, 'AVISO_CARTAO').filter((texto) => texto === TEXTOS_DOCUMENTO.continuacao)).toHaveLength(
      titulos.length - 1,
    );
    expect(textos(todos, 'ROTULO')).toEqual(extensa.campos.map((item) => item.nome.toLocaleUpperCase('pt-BR')));
  });

  it('nunca separa o nome de um campo do seu valor', () => {
    const extensa = conta(
      'Muitos campos',
      Array.from({ length: 50 }, (_, indice) => [`Campo ${indice + 1}`, senhaLonga(10 + (indice % 5) * 15)]),
    );
    const documento = montar(folha([extensa]));
    documento.paginas.forEach((pagina) => {
      const ordem = pagina.elementos
        .filter((elemento) => elemento.tipo === 'TEXTO' || elemento.tipo === 'VALOR')
        .flatMap((elemento) => {
          if (elemento.tipo === 'TEXTO' && elemento.estilo === 'ROTULO') return ['R'];
          if (elemento.tipo === 'VALOR' && elemento.estilo === 'VALOR') return ['V'];
          return [];
        })
        .join('');
      expect(ordem).not.toMatch(/R$/);
      expect(ordem).not.toMatch(/^V/);
    });
  });

  it('divide um valor gigante em partes, repetindo o nome do campo', () => {
    const documento = montar(folha([conta('Notas', [['Observação', 'texto '.repeat(1500)]])]));
    const todos = documento.paginas.flatMap((pagina) => pagina.elementos);
    const rotulos = textos(todos, 'ROTULO');
    expect(rotulos.length).toBeGreaterThan(1);
    expect(rotulos[0]).toBe('OBSERVAÇÃO');
    expect(rotulos.slice(1).every((rotulo) => rotulo === 'OBSERVAÇÃO (CONTINUAÇÃO)')).toBe(true);
  });

  it('equilibra as colunas da última página', () => {
    const contas = Array.from({ length: 6 }, (_, indice) => conta(`Conta ${indice + 1}`, [['Senha', senhaLonga(20)]]));
    const documento = montar(folha(contas));
    const xs = new Set(cartoes(documento).map((cartao) => cartao.x));
    expect(xs.size).toBe(2);
  });

  it('põe duas contas de alturas diferentes lado a lado', () => {
    const documento = montar(
      folha([
        conta('Curta', [['Senha', senhaLonga(12)]]),
        conta('Longa', [
          ['Agência', '0001'],
          ['Conta', '12345-6'],
          ['Senha', senhaLonga(12)],
          ['Observação', 'Gerente: Ana, ramal 4021.'],
        ]),
      ]),
    );
    const [primeira, segunda] = cartoes(documento);
    expect(primeira?.y).toBe(segunda?.y);
    expect(primeira?.x).toBeLessThan(segunda?.x ?? 0);
  });

  it('usa espaçamento compacto só quando isso economiza páginas', () => {
    const paginas = (quantidade: number, permitirCompactar: boolean) => {
      const contas = Array.from({ length: quantidade }, (_, indice) =>
        conta(`Conta ${indice + 1}`, [['Senha', senhaLonga(20)]]),
      );
      return montarDocumento({ folha: folha(contas), medir, data: DATA, permitirCompactar }).paginas.length;
    };
    const quantidades = Array.from({ length: 70 }, (_, indice) => indice + 10);
    quantidades.forEach((quantidade) => {
      expect(paginas(quantidade, true)).toBeLessThanOrEqual(paginas(quantidade, false));
    });
    expect(quantidades.some((quantidade) => paginas(quantidade, true) < paginas(quantidade, false))).toBe(true);
  });

  it('desenha uma linha para preencher à mão nos campos vazios quando pedido', () => {
    const documento = montar(folha([conta('Banco', [['Senha', '']])], { linhasParaPreencher: true }));
    const elementos = documento.paginas[0]?.elementos ?? [];
    expect(textos(elementos, 'ROTULO')).toEqual(['SENHA']);
    expect(valores(elementos)).toEqual([]);
    expect(
      elementos.filter((elemento) => elemento.tipo === 'LINHA' && elemento.cor === CORES_IMPRESSAO.linhaParaPreencher),
    ).toHaveLength(1);
  });
});

describe('iconeDoCampo', () => {
  it('escolhe o ícone pelo nome do campo, sem diferenciar acentos e maiúsculas', () => {
    expect(iconeDoCampo('E-mail')).toBe('EMAIL');
    expect(iconeDoCampo('Senha do aplicativo')).toBe('SENHA');
    expect(iconeDoCampo('CÓDIGO DE RECUPERAÇÃO')).toBe('CODIGO');
    expect(iconeDoCampo('Usuário')).toBe('USUARIO');
    expect(iconeDoCampo('Agência')).toBe('BANCO');
    expect(iconeDoCampo('Celular')).toBe('TELEFONE');
    expect(iconeDoCampo('Observação')).toBe('NOTA');
    expect(iconeDoCampo('Rede Wi-Fi')).toBe('SITE');
    expect(iconeDoCampo('Cor favorita')).toBe('CAMPO');
  });
});

describe('nomeDoArquivo', () => {
  it('usa exatamente o título, com acentos, espaços e maiúsculas', () => {
    expect(nomeDoArquivo('Credenciais da família Souza')).toBe('Credenciais da família Souza.pdf');
    expect(nomeDoArquivo('Contas & Senhas — 2026')).toBe('Contas & Senhas — 2026.pdf');
  });

  it('tira só os caracteres que o sistema não aceita em nome de arquivo', () => {
    expect(nomeDoArquivo('Contas: casa/trabalho?')).toBe('Contas casatrabalho.pdf');
    expect(nomeDoArquivo('Pasta\\Senhas "2026"')).toBe('PastaSenhas 2026.pdf');
    expect(nomeDoArquivo('Backup...  ')).toBe('Backup.pdf');
  });

  it('usa o título padrão quando não sobra nada do título', () => {
    expect(nomeDoArquivo('<>:?')).toBe('Minhas credenciais.pdf');
  });
});
