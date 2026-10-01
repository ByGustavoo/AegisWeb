import { useId } from 'react';
import { juntarClasses } from '@/utilitarios/juntarClasses';
import estilos from './GrupoOpcoes.module.css';

export interface OpcaoGrupo<T extends string> {
  valor: T;
  rotulo: string;
  amostra?: string;
}

export interface GrupoOpcoesProps<T extends string> {
  legenda: string;
  opcoes: OpcaoGrupo<T>[];
  valor: T;
  aoMudar: (valor: T) => void;
}

export function GrupoOpcoes<T extends string>({ legenda, opcoes, valor, aoMudar }: GrupoOpcoesProps<T>) {
  const nome = useId();

  return (
    <fieldset className={estilos.grupo}>
      <legend className={estilos.legenda}>{legenda}</legend>
      <div className={estilos.opcoes} style={{ gridTemplateColumns: `repeat(${opcoes.length}, minmax(0, 1fr))` }}>
        {opcoes.map((opcao) => {
          const selecionada = opcao.valor === valor;
          return (
            <label key={opcao.valor} className={juntarClasses(estilos.opcao, selecionada && estilos.selecionada)}>
              <input
                type="radio"
                name={nome}
                value={opcao.valor}
                checked={selecionada}
                onChange={() => aoMudar(opcao.valor)}
                className={estilos.entrada}
              />
              {opcao.amostra ? (
                <span className={`${estilos.amostra} mono`} aria-hidden="true">
                  {opcao.amostra}
                </span>
              ) : null}
              <span className={estilos.rotulo}>{opcao.rotulo}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
