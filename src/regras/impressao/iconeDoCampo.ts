import type { NomeIcone } from '@/modelos/impressao';

const REGRAS: [RegExp, NomeIcone][] = [
  [/e-?mail|correio/u, 'EMAIL'],
  [/codigo|recupera|backup|2fa|seguranca|pergunta|resposta|token|verifica/u, 'CODIGO'],
  [/senha|password|\bpass\b|\bpin\b|frase|chave/u, 'SENHA'],
  [/telefone|celular|whats|\bfone\b/u, 'TELEFONE'],
  [/usuario|login|\buser|apelido|\bnome\b/u, 'USUARIO'],
  [/agencia|conta|banco|cartao|\bcpf\b|\bcnpj\b/u, 'BANCO'],
  [/observa|nota|anota|\bobs\b|lembrete|dica/u, 'NOTA'],
  [/site|url|link|endereco|dominio|rede|wi-?fi|servidor|\bip\b/u, 'SITE'],
];

export function iconeDoCampo(nome: string): NomeIcone {
  const normalizado = nome
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLocaleLowerCase('pt-BR');
  return REGRAS.find(([padrao]) => padrao.test(normalizado))?.[1] ?? 'CAMPO';
}
