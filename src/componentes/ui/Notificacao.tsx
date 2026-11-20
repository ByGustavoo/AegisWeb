import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { CSSProperties, FocusEvent, MouseEvent, PointerEvent, ReactNode } from 'react';
import { Check, Info, TriangleAlert, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { DISTANCIA_DESLIZE_DISPENSA_PX } from '@/configuracoes/notificacoes';
import type { VarianteNotificacao } from '@/configuracoes/notificacoes';
import { focarConteudoPrincipal } from '@/utilitarios/foco';
import { juntarClasses } from '@/utilitarios/juntarClasses';
import estilos from './Notificacao.module.css';

export interface AcaoNotificacao {
  rotulo: string;
  icone?: LucideIcon;
  aoAcionar: () => void;
}

export interface MensagemNotificacao {
  id: string;
  titulo: string;
  descricao?: string;
  variante: VarianteNotificacao;
  duracao: number;
  versao: number;
  saindo: boolean;
  acao?: AcaoNotificacao;
}

const ICONE_POR_VARIANTE: Record<VarianteNotificacao, LucideIcon> = {
  SUCESSO: Check,
  ERRO: X,
  AVISO: TriangleAlert,
  INFO: Info,
};

const ROTULO_POR_VARIANTE: Record<VarianteNotificacao, string> = {
  SUCESSO: 'Sucesso',
  ERRO: 'Erro',
  AVISO: 'Atenção',
  INFO: 'Informação',
};

const CLASSE_POR_VARIANTE: Record<VarianteNotificacao, string | undefined> = {
  SUCESSO: estilos.sucesso,
  ERRO: estilos.erro,
  AVISO: estilos.aviso,
  INFO: undefined,
};

interface ItemNotificacaoProps {
  notificacao: MensagemNotificacao;
  pausado: boolean;
  aoDispensar: (id: string) => void;
  aoAcionar: (id: string) => void;
}

export function ItemNotificacao({ notificacao, pausado, aoDispensar, aoAcionar }: ItemNotificacaoProps) {
  const { id, titulo, descricao, variante, duracao, versao, saindo, acao } = notificacao;
  const Icone = ICONE_POR_VARIANTE[variante];
  const IconeAcao = acao?.icone;
  const [pressionado, setPressionado] = useState(false);
  const [deslize, setDeslize] = useState(0);
  const restante = useRef(duracao);
  const origemToque = useRef<number | null>(null);
  const parado = pausado || pressionado || saindo;

  useEffect(() => {
    restante.current = duracao;
  }, [versao, duracao]);

  useEffect(() => {
    if (parado) return undefined;
    const inicio = performance.now();
    const temporizador = window.setTimeout(() => aoDispensar(id), Math.max(restante.current, 0));
    return () => {
      window.clearTimeout(temporizador);
      restante.current -= performance.now() - inicio;
    };
  }, [parado, versao, id, aoDispensar]);

  const aoPressionar = (evento: PointerEvent<HTMLDivElement>) => {
    if (evento.pointerType === 'mouse' || saindo) return;
    if ((evento.target as HTMLElement).closest('button')) return;
    origemToque.current = evento.clientX;
    evento.currentTarget.setPointerCapture(evento.pointerId);
    setPressionado(true);
  };

  const aoMover = (evento: PointerEvent<HTMLDivElement>) => {
    if (origemToque.current === null) return;
    setDeslize(Math.max(0, evento.clientX - origemToque.current));
  };

  const aoSoltar = () => {
    if (origemToque.current === null) return;
    origemToque.current = null;
    setPressionado(false);
    if (deslize >= DISTANCIA_DESLIZE_DISPENSA_PX) {
      aoDispensar(id);
      return;
    }
    setDeslize(0);
  };

  const focarVizinho = (botao: HTMLButtonElement) => {
    const lista = botao.closest('ol');
    const vizinhos = [...(lista?.querySelectorAll<HTMLButtonElement>('[data-fechar-notificacao]') ?? [])].filter(
      (outro) => !outro.closest(`[data-notificacao="${id}"]`) && !outro.closest('[data-saindo]'),
    );
    const proximo = vizinhos[vizinhos.length - 1];
    if (proximo) proximo.focus();
    else if (lista?.contains(document.activeElement)) focarConteudoPrincipal();
  };

  const fechar = (evento: MouseEvent<HTMLButtonElement>) => {
    focarVizinho(evento.currentTarget);
    aoDispensar(id);
  };

  const acionar = (evento: MouseEvent<HTMLButtonElement>) => {
    focarVizinho(evento.currentTarget);
    aoAcionar(id);
  };

  const estiloItem = {
    '--deslize': `${deslize}px`,
    '--deslize-fracao': Math.min(deslize / (DISTANCIA_DESLIZE_DISPENSA_PX * 4), 0.5),
  } as CSSProperties;

  return (
    <li
      className={juntarClasses(estilos.item, saindo && estilos.saindo)}
      style={estiloItem}
      data-notificacao={id}
      data-saindo={saindo || undefined}
    >
      <div className={estilos.recorte}>
        <div
          className={juntarClasses(
            estilos.notificacao,
            CLASSE_POR_VARIANTE[variante],
            parado && estilos.pausada,
            deslize > 0 && estilos.arrastando,
          )}
          role={variante === 'ERRO' ? 'alert' : 'status'}
          aria-atomic="true"
          onPointerDown={aoPressionar}
          onPointerMove={aoMover}
          onPointerUp={aoSoltar}
          onPointerCancel={aoSoltar}
        >
          <span className={estilos.selo} aria-hidden="true">
            <Icone size={14} strokeWidth={2.5} />
          </span>
          <div className={estilos.textos}>
            <p className={estilos.titulo}>
              <span className="visualmente-oculto">{ROTULO_POR_VARIANTE[variante]}: </span>
              {titulo}
            </p>
            {descricao ? <p className={estilos.descricao}>{descricao}</p> : null}
            {acao ? (
              <button
                type="button"
                className={estilos.acao}
                onClick={acionar}
                tabIndex={saindo ? -1 : undefined}
              >
                {IconeAcao ? <IconeAcao size={14} strokeWidth={2.25} aria-hidden="true" /> : null}
                {acao.rotulo}
              </button>
            ) : null}
          </div>
          <button
            type="button"
            className={juntarClasses(estilos.fechar, 'botao-fechar')}
            onClick={fechar}
            aria-label="Fechar notificação"
            tabIndex={saindo ? -1 : undefined}
            data-fechar-notificacao
          >
            <X size={16} strokeWidth={2} aria-hidden="true" />
          </button>
          <span
            key={versao}
            className={juntarClasses(estilos.progresso, parado && estilos.progressoPausado)}
            style={{ animationDuration: `${duracao}ms` }}
            aria-hidden="true"
          />
        </div>
      </div>
    </li>
  );
}

interface AreaNotificacoesProps {
  children: ReactNode;
  quantidade: number;
  aoPausar: (pausado: boolean) => void;
}

export function AreaNotificacoes({ children, quantidade, aoPausar }: AreaNotificacoesProps) {
  const area = useRef<HTMLElement>(null);
  const [comMouse, setComMouse] = useState(false);
  const [comFoco, setComFoco] = useState(false);
  const [oculta, setOculta] = useState(() => document.visibilityState === 'hidden');

  useEffect(() => {
    const atualizar = () => setOculta(document.visibilityState === 'hidden');
    document.addEventListener('visibilitychange', atualizar);
    return () => document.removeEventListener('visibilitychange', atualizar);
  }, []);

  useEffect(() => {
    if (quantidade === 0) setComMouse(false);
    setComFoco(Boolean(area.current?.contains(document.activeElement)));
  }, [quantidade]);

  const pausado = comMouse || comFoco || oculta;

  useEffect(() => {
    aoPausar(pausado);
  }, [pausado, aoPausar]);

  const aoSairDoFoco = (evento: FocusEvent<HTMLElement>) => {
    if (!evento.currentTarget.contains(evento.relatedTarget as Node | null)) setComFoco(false);
  };

  return createPortal(
    <section
      ref={area}
      className={estilos.area}
      aria-label="Notificações"
      onPointerEnter={(evento) => evento.pointerType === 'mouse' && setComMouse(true)}
      onPointerLeave={(evento) => evento.pointerType === 'mouse' && setComMouse(false)}
      onFocus={() => setComFoco(true)}
      onBlur={aoSairDoFoco}
    >
      <ol className={estilos.lista} aria-live="polite" aria-relevant="additions">
        {children}
      </ol>
    </section>,
    document.body,
  );
}
