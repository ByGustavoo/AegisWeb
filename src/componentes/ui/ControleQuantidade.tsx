import { useEffect, useId, useState } from 'react';
import type { CSSProperties } from 'react';
import estilos from './ControleQuantidade.module.css';

export interface ControleQuantidadeProps {
  rotulo: string;
  unidade: string;
  valor: number;
  minimo: number;
  maximo: number;
  aoMudar: (valor: number) => void;
}

function limitar(valor: number, minimo: number, maximo: number): number {
  return Math.min(maximo, Math.max(minimo, Math.round(valor)));
}

export function ControleQuantidade({ rotulo, unidade, valor, minimo, maximo, aoMudar }: ControleQuantidadeProps) {
  const id = useId();
  const idCampo = `${id}-campo`;
  const idAjuste = `${id}-ajuste`;
  const [rascunho, setRascunho] = useState(String(valor));
  const [ajuste, setAjuste] = useState('');

  useEffect(() => {
    setRascunho(String(valor));
  }, [valor]);

  const confirmarRascunho = () => {
    const numero = Number(rascunho);
    if (rascunho.trim() === '' || Number.isNaN(numero)) {
      setRascunho(String(valor));
      return;
    }
    const limitado = limitar(numero, minimo, maximo);
    setAjuste(limitado === numero ? '' : `Use de ${minimo} a ${maximo} ${unidade}. Ajustado para ${limitado}.`);
    setRascunho(String(limitado));
    if (limitado !== valor) aoMudar(limitado);
  };

  const progresso = ((valor - minimo) / (maximo - minimo)) * 100;

  return (
    <div className={estilos.controle}>
      <div className={estilos.topo}>
        <label htmlFor={id} className={estilos.rotulo}>
          {rotulo}
        </label>
        <span className={estilos.campoNumero}>
          <label htmlFor={idCampo} className="visualmente-oculto">
            {`${rotulo} em ${unidade}`}
          </label>
          <input
            id={idCampo}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className={`${estilos.numero} mono`}
            value={rascunho}
            aria-describedby={ajuste ? idAjuste : undefined}
            onChange={(evento) => {
              setRascunho(evento.target.value.replace(/\D/g, '').slice(0, 3));
              setAjuste('');
            }}
            onBlur={confirmarRascunho}
            onKeyDown={(evento) => {
              if (evento.key === 'Enter') confirmarRascunho();
            }}
          />
          <span className={estilos.unidade} aria-hidden="true">
            {unidade}
          </span>
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={minimo}
        max={maximo}
        step={1}
        value={valor}
        aria-valuetext={`${valor} ${unidade}`}
        className={estilos.deslizante}
        style={{ '--progresso': `${progresso}%` } as CSSProperties}
        onChange={(evento) => {
          setAjuste('');
          aoMudar(Number(evento.target.value));
        }}
      />
      <p id={idAjuste} className={estilos.ajuste} role="status">
        {ajuste}
      </p>
    </div>
  );
}
