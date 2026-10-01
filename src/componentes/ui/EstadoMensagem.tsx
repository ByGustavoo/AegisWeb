import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { juntarClasses } from '@/utilitarios/juntarClasses';
import estilos from './EstadoMensagem.module.css';

export interface EstadoMensagemProps {
  icone: LucideIcon;
  titulo: string;
  descricao?: ReactNode;
  acao?: ReactNode;
  compacto?: boolean;
  nivelTitulo?: 2 | 3 | 'p';
  className?: string;
}

export function EstadoMensagem({
  icone: Icone,
  titulo,
  descricao,
  acao,
  compacto = false,
  nivelTitulo = 'p',
  className,
}: EstadoMensagemProps) {
  const Titulo = nivelTitulo === 'p' ? 'p' : nivelTitulo === 2 ? 'h2' : 'h3';

  return (
    <div className={juntarClasses(estilos.estado, compacto && estilos.compacto, className)}>
      <span className={estilos.icone} aria-hidden="true">
        <Icone size={compacto ? 18 : 20} strokeWidth={1.75} />
      </span>
      <Titulo className={estilos.titulo}>{titulo}</Titulo>
      {descricao ? <p className={estilos.descricao}>{descricao}</p> : null}
      {acao ? <div className={estilos.acao}>{acao}</div> : null}
    </div>
  );
}
