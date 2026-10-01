import { useId } from 'react';
import { juntarClasses } from '@/utilitarios/juntarClasses';
import estilos from './Interruptor.module.css';

export interface InterruptorProps {
  rotulo: string;
  descricao?: string;
  amostra?: string;
  ligado: boolean;
  aoMudar: (ligado: boolean) => void;
  bloqueado?: boolean;
  motivoBloqueio?: string;
  className?: string;
}

export function Interruptor({
  rotulo,
  descricao,
  amostra,
  ligado,
  aoMudar,
  bloqueado = false,
  motivoBloqueio,
  className,
}: InterruptorProps) {
  const id = useId();
  const idDescricao = `${id}-descricao`;
  const textoApoio = bloqueado && motivoBloqueio ? motivoBloqueio : descricao;

  return (
    <div className={juntarClasses(estilos.linha, className)}>
      <span className={estilos.textos}>
        <span className={estilos.linhaRotulo}>
          <label htmlFor={id} className={estilos.rotulo}>
            {rotulo}
          </label>
          {amostra ? (
            <span className={`${estilos.amostra} mono`} aria-hidden="true">
              {amostra}
            </span>
          ) : null}
        </span>
        {textoApoio ? (
          <span id={idDescricao} className={estilos.descricao}>
            {textoApoio}
          </span>
        ) : null}
      </span>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={ligado}
        aria-disabled={bloqueado || undefined}
        aria-describedby={textoApoio ? idDescricao : undefined}
        className={juntarClasses(estilos.interruptor, ligado && estilos.ligado, bloqueado && estilos.bloqueado)}
        onClick={() => {
          if (!bloqueado) aoMudar(!ligado);
        }}
      >
        <span className={estilos.botao} aria-hidden="true" />
      </button>
    </div>
  );
}
