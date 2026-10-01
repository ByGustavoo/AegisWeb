import type { LucideIcon } from 'lucide-react';
import { Briefcase, Gamepad2, Landmark, Mail, Sparkles, Wifi } from 'lucide-react';
import type { Finalidade, OpcoesSenha } from '@/modelos/senha';

export interface DescricaoFinalidade {
  finalidade: Finalidade;
  rotulo: string;
  icone: LucideIcon;
  opcoes: OpcoesSenha;
  dica: string;
  tamanhoMinimoRecomendado: number;
}

export const finalidades: DescricaoFinalidade[] = [
  {
    finalidade: 'GERAL',
    rotulo: 'Uso geral',
    icone: Sparkles,
    opcoes: {
      tamanho: 16,
      usarMaiusculas: true,
      usarMinusculas: true,
      usarNumeros: true,
      usarSimbolos: true,
      evitarAmbiguos: false,
    },
    dica: 'Equilíbrio entre força e compatibilidade. Serve para a maioria dos sites.',
    tamanhoMinimoRecomendado: 12,
  },
  {
    finalidade: 'BANCO',
    rotulo: 'Banco',
    icone: Landmark,
    opcoes: {
      tamanho: 12,
      usarMaiusculas: true,
      usarMinusculas: true,
      usarNumeros: true,
      usarSimbolos: false,
      evitarAmbiguos: true,
    },
    dica: 'Muitos bancos recusam símbolos e limitam o tamanho. Confira a regra do seu.',
    tamanhoMinimoRecomendado: 10,
  },
  {
    finalidade: 'EMAIL',
    rotulo: 'E-mail',
    icone: Mail,
    opcoes: {
      tamanho: 20,
      usarMaiusculas: true,
      usarMinusculas: true,
      usarNumeros: true,
      usarSimbolos: true,
      evitarAmbiguos: false,
    },
    dica: 'O e-mail recupera todas as outras contas. Use a senha mais forte que puder.',
    tamanhoMinimoRecomendado: 16,
  },
  {
    finalidade: 'TRABALHO',
    rotulo: 'Trabalho',
    icone: Briefcase,
    opcoes: {
      tamanho: 16,
      usarMaiusculas: true,
      usarMinusculas: true,
      usarNumeros: true,
      usarSimbolos: true,
      evitarAmbiguos: true,
    },
    dica: 'Atende às políticas de empresas, que costumam exigir os quatro tipos.',
    tamanhoMinimoRecomendado: 14,
  },
  {
    finalidade: 'GAMES',
    rotulo: 'Games',
    icone: Gamepad2,
    opcoes: {
      tamanho: 16,
      usarMaiusculas: true,
      usarMinusculas: true,
      usarNumeros: true,
      usarSimbolos: false,
      evitarAmbiguos: true,
    },
    dica: 'Fácil de digitar no controle: sem símbolos e sem letras que se confundem.',
    tamanhoMinimoRecomendado: 12,
  },
  {
    finalidade: 'WIFI',
    rotulo: 'Wi-Fi',
    icone: Wifi,
    opcoes: {
      tamanho: 20,
      usarMaiusculas: true,
      usarMinusculas: true,
      usarNumeros: true,
      usarSimbolos: false,
      evitarAmbiguos: true,
    },
    dica: 'Fácil de digitar na TV e no celular. O WPA2 aceita de 8 a 63 caracteres.',
    tamanhoMinimoRecomendado: 16,
  },
];

export const FINALIDADE_PADRAO: Finalidade = 'GERAL';

export function descreverFinalidade(finalidade: Finalidade): DescricaoFinalidade {
  const encontrada = finalidades.find((item) => item.finalidade === finalidade) ?? finalidades[0];
  if (!encontrada) throw new Error('Nenhuma finalidade configurada.');
  return encontrada;
}

export function opcoesIguais(a: OpcoesSenha, b: OpcoesSenha): boolean {
  return (
    a.tamanho === b.tamanho &&
    a.usarMaiusculas === b.usarMaiusculas &&
    a.usarMinusculas === b.usarMinusculas &&
    a.usarNumeros === b.usarNumeros &&
    a.usarSimbolos === b.usarSimbolos &&
    a.evitarAmbiguos === b.evitarAmbiguos
  );
}
