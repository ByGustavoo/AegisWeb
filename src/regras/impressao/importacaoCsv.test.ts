import { describe, expect, it } from 'vitest';
import { chaveDaConta, interpretarExportacao, lerCsv, siteDoEndereco, tituloDaConta } from './importacaoCsv';

const CHROME = [
  'name,url,username,password,note',
  'github.com,https://github.com/login,ana@exemplo.com,S3nh@#1,',
  'netflix.com,https://www.netflix.com/br/login,ana,"vírgula, e ""aspas""","linha 1',
  'linha 2"',
  'Banco,android://hash@br.com.banco/,12345,987654,',
].join('\r\n');

const FIREFOX = [
  '"url","username","password","httpRealm","formActionOrigin","guid","timeCreated","timePasswordChanged","timeLastUsed"',
  '"https://www.mozilla.org","ana","abc123",,"https://www.mozilla.org","{1}","1","1","1"',
].join('\n');

const SAFARI = [
  'Title,URL,Username,Password,Notes,OTPAuth',
  'apple.com (ana@exemplo.com),https://apple.com/,ana@exemplo.com,Maca!42,Conta principal,otpauth://totp/x?secret=ABC',
].join('\n');

function dados(texto: string) {
  const resultado = interpretarExportacao(texto);
  if (resultado.tipo !== 'LIDO') throw new Error(`Esperava LIDO, veio ${resultado.motivo}`);
  return resultado;
}

describe('lerCsv', () => {
  it('lê aspas, aspas dobradas, vírgulas e quebras de linha dentro da célula', () => {
    expect(lerCsv('a,b\r\n"x, y","diz ""oi""\nfim"\n')).toEqual([
      ['a', 'b'],
      ['x, y', 'diz "oi"\nfim'],
    ]);
  });

  it('ignora o BOM, linhas em branco e aceita ponto e vírgula quando o cabeçalho usa', () => {
    expect(lerCsv(`${String.fromCharCode(0xfeff)}nome;senha\n\nconta;123`)).toEqual([
      ['nome', 'senha'],
      ['conta', '123'],
    ]);
  });
});

describe('interpretarExportacao', () => {
  it('lê a exportação do Chrome em ordem alfabética, com os campos da folha', () => {
    const resultado = dados(CHROME);
    expect(resultado.origem).toBe('CHROMIUM');
    expect(resultado.contas.map((conta) => conta.titulo)).toEqual(['Banco', 'github.com', 'netflix.com']);
    const [banco, github, netflix] = resultado.contas;
    expect(github?.campos).toEqual([
      { nome: 'E-mail', valor: 'ana@exemplo.com' },
      { nome: 'Senha', valor: 'S3nh@#1' },
      { nome: 'Site', valor: 'https://github.com' },
    ]);
    expect(netflix?.campos).toEqual([
      { nome: 'Usuário', valor: 'ana' },
      { nome: 'Senha', valor: 'vírgula, e "aspas"' },
      { nome: 'Site', valor: 'https://www.netflix.com' },
      { nome: 'Observação', valor: 'linha 1\nlinha 2' },
    ]);
    expect(banco?.campos.map((campo) => campo.nome)).toEqual(['Usuário', 'Senha']);
  });

  it('lê a exportação do Firefox, tirando o título do endereço', () => {
    const resultado = dados(FIREFOX);
    expect(resultado.origem).toBe('FIREFOX');
    expect(resultado.contas[0]?.titulo).toBe('mozilla.org');
    expect(resultado.contas[0]?.campos.map((campo) => campo.nome)).toEqual(['Usuário', 'Senha', 'Site']);
  });

  it('lê a exportação do Safari sem levar o código de dois fatores', () => {
    const resultado = dados(SAFARI);
    expect(resultado.origem).toBe('SAFARI');
    expect(resultado.comCodigoDoisFatores).toBe(1);
    const [conta] = resultado.contas;
    expect(conta?.titulo).toBe('apple.com');
    expect(conta?.campos.some((campo) => campo.valor.startsWith('otpauth'))).toBe(false);
    expect(conta?.campos.at(-1)).toEqual({ nome: 'Observação', valor: 'Conta principal' });
  });

  it('pula linhas repetidas e linhas sem usuário nem senha', () => {
    const resultado = dados(['name,url,username,password', 'a.com,https://a.com,ana,1', 'a.com,https://a.com,ana,1', 'b.com,https://b.com,,'].join('\n'));
    expect(resultado.contas).toHaveLength(1);
    expect(resultado.repetidasNoArquivo).toBe(1);
  });

  it('recusa arquivos vazios, sem coluna de senha ou sem nenhuma conta', () => {
    expect(interpretarExportacao('')).toEqual({ tipo: 'FALHOU', motivo: 'VAZIO' });
    expect(interpretarExportacao('nome,idade\nana,30')).toEqual({ tipo: 'FALHOU', motivo: 'SEM_COLUNA_SENHA' });
    expect(interpretarExportacao('name,url,username,password\n')).toEqual({ tipo: 'FALHOU', motivo: 'SEM_CONTAS' });
  });

  it('aceita o formato de gerenciadores com login_uri e login_password', () => {
    const resultado = dados('name,login_uri,login_username,login_password,notes\nConta,https://x.com,ana,1,');
    expect(resultado.origem).toBe('OUTRA');
    expect(resultado.contas[0]?.campos).toHaveLength(3);
  });
});

describe('auxiliares', () => {
  it('reduz o endereço à origem e descarta endereços de aplicativo', () => {
    expect(siteDoEndereco('https://accounts.google.com/signin?x=1')).toBe('https://accounts.google.com');
    expect(siteDoEndereco('android://abc@com.app/')).toBe('');
    expect(siteDoEndereco('intranet.local')).toBe('intranet.local');
  });

  it('usa o nome quando existe e o host sem www quando não', () => {
    expect(tituloDaConta('', 'https://www.exemplo.com.br/entrar', 'ana')).toBe('exemplo.com.br');
    expect(tituloDaConta('https://x.com', 'https://x.com', '')).toBe('x.com');
    expect(tituloDaConta('Meu banco', '', '')).toBe('Meu banco');
  });

  it('dá a mesma chave para a mesma conta, sem depender da ordem dos campos ou da caixa do título', () => {
    const a = chaveDaConta({ titulo: 'GitHub', campos: [{ nome: 'Senha', valor: '1' }, { nome: 'Usuário', valor: 'ana' }] });
    const b = chaveDaConta({ titulo: 'github ', campos: [{ nome: 'Usuário', valor: 'ana' }, { nome: 'Senha', valor: '1' }] });
    expect(a).toBe(b);
  });
});
