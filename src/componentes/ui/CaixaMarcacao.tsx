import { useEffect, useRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { Check, Minus } from 'lucide-react';
import { juntarClasses } from '@/utilitarios/juntarClasses';
import estilos from './CaixaMarcacao.module.css';

interface CaixaMarcacaoProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'children'> {
  marcada: boolean;
  parcial?: boolean;
  aoMudar: (marcada: boolean) => void;
  descricao?: ReactNode;
  complemento?: ReactNode;
  children: ReactNode;
}

export function CaixaMarcacao({
  marcada,
  parcial = false,
  aoMudar,
  descricao,
  complemento,
  disabled,
  className,
  children,
  ...resto
}: CaixaMarcacaoProps) {
  const entrada = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (entrada.current) entrada.current.indeterminate = parcial;
  }, [parcial, marcada]);

  return (
    <label className={juntarClasses(estilos.caixa, disabled && estilos.desabilitada, className)}>
      <span className={estilos.controle}>
        <input
          ref={entrada}
          type="checkbox"
          className={estilos.entrada}
          checked={marcada}
          disabled={disabled}
          onChange={(evento) => aoMudar(evento.target.checked)}
          {...resto}
        />
        <span className={estilos.marca} aria-hidden="true">
          <Check className={estilos.iconeMarcada} size={13} strokeWidth={3} />
          <Minus className={estilos.iconeParcial} size={13} strokeWidth={3} />
        </span>
      </span>
      <span className={estilos.textos}>
        <span className={estilos.rotulo}>{children}</span>
        {descricao ? <span className={estilos.descricao}>{descricao}</span> : null}
      </span>
      {complemento ? <span className={estilos.complemento}>{complemento}</span> : null}
    </label>
  );
}
