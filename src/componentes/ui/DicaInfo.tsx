import { useEffect, useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Info, X } from 'lucide-react';
import { juntarClasses } from '@/utilitarios/juntarClasses';
import estilos from './DicaInfo.module.css';

export interface DicaInfoProps {
  rotulo: string;
  titulo: string;
  children: ReactNode;
  alinhamento?: 'inicio' | 'fim';
  className?: string;
}

export function DicaInfo({ rotulo, titulo, children, alinhamento = 'fim', className }: DicaInfoProps) {
  const [aberta, setAberta] = useState(false);
  const raiz = useRef<HTMLSpanElement>(null);
  const botao = useRef<HTMLButtonElement>(null);
  const id = useId();
  const idTitulo = `${id}-titulo`;

  useEffect(() => {
    if (!aberta) return undefined;

    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key !== 'Escape') return;
      setAberta(false);
      botao.current?.focus();
    };
    const aoTocarFora = (evento: PointerEvent) => {
      if (evento.target instanceof Node && !raiz.current?.contains(evento.target)) setAberta(false);
    };

    document.addEventListener('keydown', aoTeclar);
    document.addEventListener('pointerdown', aoTocarFora);
    return () => {
      document.removeEventListener('keydown', aoTeclar);
      document.removeEventListener('pointerdown', aoTocarFora);
    };
  }, [aberta]);

  return (
    <span ref={raiz} className={juntarClasses(estilos.dica, className)}>
      <button
        ref={botao}
        type="button"
        className={juntarClasses(estilos.botao, aberta && estilos.ativo)}
        aria-label={rotulo}
        aria-expanded={aberta}
        aria-controls={id}
        title={rotulo}
        onClick={() => setAberta(!aberta)}
      >
        <Info size={14} strokeWidth={2.25} aria-hidden="true" />
      </button>
      <span
        id={id}
        role="region"
        aria-labelledby={idTitulo}
        className={juntarClasses(estilos.balao, estilos[alinhamento])}
        hidden={!aberta}
      >
        <span className={estilos.topo}>
          <strong id={idTitulo} className={estilos.titulo}>
            {titulo}
          </strong>
          <button
            type="button"
            className={estilos.fechar}
            aria-label="Fechar explicação"
            onClick={() => {
              setAberta(false);
              botao.current?.focus();
            }}
          >
            <X size={14} strokeWidth={2.25} aria-hidden="true" />
          </button>
        </span>
        <span className={estilos.conteudo}>{children}</span>
      </span>
    </span>
  );
}
