import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AreaNotificacoes, ItemNotificacao } from '@/componentes/ui/Notificacao';
import type { AcaoNotificacao, MensagemNotificacao } from '@/componentes/ui/Notificacao';
import {
  CARACTERES_LEITURA_BASE_NOTIFICACAO,
  DURACAO_BASE_NOTIFICACAO_MS,
  DURACAO_MAXIMA_NOTIFICACAO_MS,
  DURACAO_SAIDA_NOTIFICACAO_MS,
  MS_POR_CARACTERE_EXTRA_NOTIFICACAO,
  NOTIFICACOES_VISIVEIS_MAXIMO,
} from '@/configuracoes/notificacoes';
import type { VarianteNotificacao } from '@/configuracoes/notificacoes';

export interface EntradaNotificacao {
  titulo: string;
  descricao?: string;
  variante?: VarianteNotificacao;
  duracao?: number;
  acao?: AcaoNotificacao;
  aoSair?: () => void;
}

interface ValorContextoNotificacoes {
  notificar: (notificacao: EntradaNotificacao) => string;
  dispensar: (id: string) => void;
  dispensarTodas: () => void;
}

const ContextoNotificacoes = createContext<ValorContextoNotificacoes | null>(null);

function calcularDuracao(variante: VarianteNotificacao, titulo: string, descricao?: string): number {
  const caracteres = titulo.length + (descricao?.length ?? 0);
  const extra = Math.max(0, caracteres - CARACTERES_LEITURA_BASE_NOTIFICACAO) * MS_POR_CARACTERE_EXTRA_NOTIFICACAO;
  return Math.min(DURACAO_BASE_NOTIFICACAO_MS[variante] + extra, DURACAO_MAXIMA_NOTIFICACAO_MS);
}

export function ProvedorNotificacoes({ children }: { children: ReactNode }) {
  const [notificacoes, setNotificacoes] = useState<MensagemNotificacao[]>([]);
  const [pausado, setPausado] = useState(false);
  const remocoes = useRef(new Map<string, number>());
  const aoSair = useRef(new Map<string, () => void>());

  useEffect(() => {
    notificacoes.forEach((item) => {
      if (!item.saindo || remocoes.current.has(item.id)) return;
      const temporizador = window.setTimeout(() => {
        remocoes.current.delete(item.id);
        setNotificacoes((atual) => atual.filter((outra) => outra.id !== item.id));
      }, DURACAO_SAIDA_NOTIFICACAO_MS);
      remocoes.current.set(item.id, temporizador);
    });
  }, [notificacoes]);

  useEffect(() => {
    const pendentes = remocoes.current;
    return () => {
      pendentes.forEach((temporizador) => window.clearTimeout(temporizador));
      pendentes.clear();
    };
  }, []);

  const avisarSaida = useCallback((ids: Iterable<string>) => {
    for (const id of ids) {
      const callback = aoSair.current.get(id);
      aoSair.current.delete(id);
      callback?.();
    }
  }, []);

  const marcarSaida = useCallback(
    (lista: MensagemNotificacao[], ids: Set<string>) => {
      avisarSaida(ids);
      return lista.map((item) => (ids.has(item.id) && !item.saindo ? { ...item, saindo: true } : item));
    },
    [avisarSaida],
  );

  const dispensar = useCallback(
    (id: string) => {
      avisarSaida([id]);
      setNotificacoes((atual) => atual.map((item) => (item.id === id && !item.saindo ? { ...item, saindo: true } : item)));
    },
    [avisarSaida],
  );

  const dispensarTodas = useCallback(() => {
    avisarSaida([...aoSair.current.keys()]);
    setNotificacoes((atual) => atual.map((item) => (item.saindo ? item : { ...item, saindo: true })));
  }, [avisarSaida]);

  const acionar = useCallback(
    (id: string) => {
      const acao = notificacoes.find((item) => item.id === id)?.acao;
      aoSair.current.delete(id);
      acao?.aoAcionar();
      dispensar(id);
    },
    [dispensar, notificacoes],
  );

  const notificar = useCallback(
    ({ titulo, descricao, variante = 'INFO', duracao, acao, aoSair: callbackSaida }: EntradaNotificacao) => {
      const id = crypto.randomUUID();
      const nova: MensagemNotificacao = {
        id,
        titulo,
        variante,
        duracao: duracao ?? calcularDuracao(variante, titulo, descricao),
        versao: 0,
        saindo: false,
        ...(descricao ? { descricao } : {}),
        ...(acao ? { acao } : {}),
      };
      if (callbackSaida) aoSair.current.set(id, callbackSaida);
      setNotificacoes((atual) => {
        const ativas = atual.filter((item) => !item.saindo);
        const excedentes = ativas.slice(0, Math.max(0, ativas.length + 1 - NOTIFICACOES_VISIVEIS_MAXIMO));
        return [...marcarSaida(atual, new Set(excedentes.map((item) => item.id))), nova];
      });
      return id;
    },
    [marcarSaida],
  );

  const valor = useMemo<ValorContextoNotificacoes>(
    () => ({ notificar, dispensar, dispensarTodas }),
    [notificar, dispensar, dispensarTodas],
  );

  return (
    <ContextoNotificacoes.Provider value={valor}>
      {children}
      <AreaNotificacoes quantidade={notificacoes.length} aoPausar={setPausado}>
        {notificacoes.map((item) => (
          <ItemNotificacao
            key={item.id}
            notificacao={item}
            pausado={pausado}
            aoDispensar={dispensar}
            aoAcionar={acionar}
          />
        ))}
      </AreaNotificacoes>
    </ContextoNotificacoes.Provider>
  );
}

export function useNotificacoes(): ValorContextoNotificacoes {
  const contexto = useContext(ContextoNotificacoes);
  if (!contexto) throw new Error('useNotificacoes precisa estar dentro de <ProvedorNotificacoes>.');
  return contexto;
}
