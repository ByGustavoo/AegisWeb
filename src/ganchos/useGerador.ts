import { useCallback, useMemo, useState } from 'react';
import { descreverFinalidade, FINALIDADE_PADRAO, opcoesIguais } from '@/configuracoes/finalidades';
import { OPCOES_FRASE_PADRAO, OPCOES_PIN_PADRAO } from '@/configuracoes/geracao';
import type {
  Finalidade,
  ForcaCalculada,
  OpcoesFraseSenha,
  OpcoesPin,
  OpcoesSenha,
  TipoGeracao,
} from '@/modelos/senha';
import { calcularForca } from '@/regras/forca';
import { entropiaFraseSenha, gerarFraseSenha } from '@/regras/fraseSenha';
import { contarTiposSelecionados, entropiaSenha, gerarSenha } from '@/regras/geradorSenha';
import { entropiaPin, gerarPin } from '@/regras/pin';

type ValoresGerados = Record<TipoGeracao, string>;

export interface EstadoFinalidade {
  base: Finalidade;
  personalizada: boolean;
}

function gerarValor(
  tipo: TipoGeracao,
  opcoes: { senha: OpcoesSenha; frase: OpcoesFraseSenha; pin: OpcoesPin },
): string {
  if (tipo === 'SENHA') return gerarSenha(opcoes.senha);
  if (tipo === 'FRASE_SENHA') return gerarFraseSenha(opcoes.frase);
  return gerarPin(opcoes.pin.tamanho);
}

export function useGerador() {
  const [finalidade, setFinalidade] = useState<EstadoFinalidade>({ base: FINALIDADE_PADRAO, personalizada: false });
  const [opcoesSenha, setOpcoesSenha] = useState<OpcoesSenha>(() => descreverFinalidade(FINALIDADE_PADRAO).opcoes);
  const [opcoesFrase, setOpcoesFrase] = useState<OpcoesFraseSenha>(OPCOES_FRASE_PADRAO);
  const [opcoesPin, setOpcoesPin] = useState<OpcoesPin>(OPCOES_PIN_PADRAO);
  const [valores, setValores] = useState<ValoresGerados>(() => {
    const iniciais = { senha: descreverFinalidade(FINALIDADE_PADRAO).opcoes, frase: OPCOES_FRASE_PADRAO, pin: OPCOES_PIN_PADRAO };
    return {
      SENHA: gerarValor('SENHA', iniciais),
      FRASE_SENHA: gerarValor('FRASE_SENHA', iniciais),
      PIN: gerarValor('PIN', iniciais),
    };
  });

  const definirValor = useCallback((tipo: TipoGeracao, valor: string) => {
    setValores((atuais) => ({ ...atuais, [tipo]: valor }));
  }, []);

  const gerarNovamente = useCallback(
    (tipo: TipoGeracao) => {
      definirValor(tipo, gerarValor(tipo, { senha: opcoesSenha, frase: opcoesFrase, pin: opcoesPin }));
    },
    [definirValor, opcoesFrase, opcoesPin, opcoesSenha],
  );

  const escolherFinalidade = useCallback(
    (escolhida: Finalidade) => {
      const { opcoes } = descreverFinalidade(escolhida);
      setFinalidade({ base: escolhida, personalizada: false });
      setOpcoesSenha(opcoes);
      definirValor('SENHA', gerarSenha(opcoes));
    },
    [definirValor],
  );

  const ajustarSenha = useCallback(
    (alteracao: Partial<OpcoesSenha>) => {
      const proximas = { ...opcoesSenha, ...alteracao };
      if (contarTiposSelecionados(proximas) === 0) return;
      setOpcoesSenha(proximas);
      setFinalidade((atual) => ({
        ...atual,
        personalizada: !opcoesIguais(proximas, descreverFinalidade(atual.base).opcoes),
      }));
      definirValor('SENHA', gerarSenha(proximas));
    },
    [definirValor, opcoesSenha],
  );

  const ajustarFrase = useCallback(
    (alteracao: Partial<OpcoesFraseSenha>) => {
      const proximas = { ...opcoesFrase, ...alteracao };
      setOpcoesFrase(proximas);
      definirValor('FRASE_SENHA', gerarFraseSenha(proximas));
    },
    [definirValor, opcoesFrase],
  );

  const ajustarPin = useCallback(
    (alteracao: Partial<OpcoesPin>) => {
      const proximas = { ...opcoesPin, ...alteracao };
      setOpcoesPin(proximas);
      definirValor('PIN', gerarPin(proximas.tamanho));
    },
    [definirValor, opcoesPin],
  );

  const forcas = useMemo<Record<TipoGeracao, ForcaCalculada>>(
    () => ({
      SENHA: calcularForca(entropiaSenha(opcoesSenha)),
      FRASE_SENHA: calcularForca(entropiaFraseSenha(opcoesFrase)),
      PIN: calcularForca(entropiaPin(opcoesPin.tamanho)),
    }),
    [opcoesFrase, opcoesPin.tamanho, opcoesSenha],
  );

  return {
    valores,
    forcas,
    finalidade,
    opcoesSenha,
    opcoesFrase,
    opcoesPin,
    gerarNovamente,
    escolherFinalidade,
    ajustarSenha,
    ajustarFrase,
    ajustarPin,
  };
}
