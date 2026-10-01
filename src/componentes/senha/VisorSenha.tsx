import { useMemo } from 'react';
import type { ClasseCaractere } from '@/modelos/senha';
import { segmentarPorClasse } from '@/regras/caracteres';
import { juntarClasses } from '@/utilitarios/juntarClasses';
import estilos from './VisorSenha.module.css';

const classesPorTipo: Record<ClasseCaractere, string | undefined> = {
  LETRA: estilos.letra,
  NUMERO: estilos.numero,
  SIMBOLO: estilos.simbolo,
  ESPACO: estilos.espaco,
};

export interface VisorSenhaProps {
  valor: string;
  tamanho?: 'normal' | 'grande';
  esmaecido?: boolean;
  quebraLivre?: boolean;
  className?: string;
}

export function VisorSenha({
  valor,
  tamanho = 'grande',
  esmaecido = false,
  quebraLivre = true,
  className,
}: VisorSenhaProps) {
  const segmentos = useMemo(() => segmentarPorClasse(valor), [valor]);

  return (
    <span
      className={juntarClasses(
        estilos.visor,
        estilos[tamanho],
        esmaecido && estilos.esmaecido,
        quebraLivre && estilos.quebraLivre,
        'mono',
        className,
      )}
      translate="no"
    >
      {segmentos.map((segmento, indice) => (
        <span key={`${indice}-${segmento.texto}`} className={classesPorTipo[segmento.classe]}>
          {segmento.texto}
        </span>
      ))}
    </span>
  );
}

const itensLegenda: { classe: ClasseCaractere; rotulo: string; amostra: string }[] = [
  { classe: 'LETRA', rotulo: 'Letras', amostra: 'Aa' },
  { classe: 'NUMERO', rotulo: 'Números', amostra: '09' },
  { classe: 'SIMBOLO', rotulo: 'Símbolos', amostra: '#$' },
];

export function LegendaCaracteres({ className }: { className?: string }) {
  return (
    <ul className={juntarClasses(estilos.legenda, className)} aria-label="Cores dos caracteres">
      {itensLegenda.map((item) => (
        <li key={item.classe} className={estilos.itemLegenda}>
          <span className={juntarClasses(estilos.amostra, classesPorTipo[item.classe], 'mono')} aria-hidden="true">
            {item.amostra}
          </span>
          {item.rotulo}
        </li>
      ))}
    </ul>
  );
}
