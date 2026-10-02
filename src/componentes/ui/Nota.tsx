import type { HTMLAttributes, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Lightbulb } from 'lucide-react';
import { juntarClasses } from '@/utilitarios/juntarClasses';
import estilos from './Nota.module.css';

interface NotaProps extends HTMLAttributes<HTMLParagraphElement> {
  icone?: LucideIcon;
  children: ReactNode;
}

export function Nota({ icone: Icone = Lightbulb, children, className, ...resto }: NotaProps) {
  return (
    <p className={juntarClasses(estilos.nota, className)} {...resto}>
      <Icone size={16} strokeWidth={2} aria-hidden="true" className={estilos.icone} />
      <span>{children}</span>
    </p>
  );
}
