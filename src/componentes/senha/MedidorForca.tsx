import type { CSSProperties } from 'react';
import { CircleDashed } from 'lucide-react';
import { NIVEIS_FORCA, niveisForca } from '@/configuracoes/forca';
import type { NivelForca } from '@/modelos/senha';
import { juntarClasses } from '@/utilitarios/juntarClasses';
import estilos from './MedidorForca.module.css';

export interface MedidorForcaProps {
  nivel: NivelForca | null;
  mostrarResumo?: boolean;
  className?: string;
}

export function MedidorForca({ nivel, mostrarResumo = true, className }: MedidorForcaProps) {
  const descricao = nivel ? niveisForca[nivel] : null;
  const Icone = descricao?.icone ?? CircleDashed;
  const rotulo = descricao?.rotulo ?? 'Sem análise';
  const estilo = descricao
    ? ({ '--cor-nivel': descricao.cor, '--cor-nivel-suave': descricao.corSuave } as CSSProperties)
    : undefined;

  return (
    <div className={juntarClasses(estilos.medidor, !descricao && estilos.vazio, className)} style={estilo}>
      <div className={estilos.topo}>
        <span className={estilos.rotulo}>
          <Icone size={18} strokeWidth={2} aria-hidden="true" />
          {rotulo}
        </span>
        {nivel ? (
          <span className={juntarClasses(estilos.nota, 'mono')} aria-hidden="true">
            {nivel}/5
          </span>
        ) : null}
      </div>
      <div
        className={estilos.trilho}
        role="meter"
        aria-label="Força da senha"
        aria-valuemin={0}
        aria-valuemax={5}
        aria-valuenow={nivel ?? 0}
        aria-valuetext={rotulo}
      >
        {NIVEIS_FORCA.map((posicao) => (
          <span
            key={posicao}
            className={juntarClasses(estilos.segmento, nivel !== null && posicao <= nivel && estilos.preenchido)}
          />
        ))}
      </div>
      {mostrarResumo && descricao ? <p className={estilos.resumo}>{descricao.resumo}</p> : null}
    </div>
  );
}
