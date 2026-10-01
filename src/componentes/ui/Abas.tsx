import { useRef } from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';
import { juntarClasses } from '@/utilitarios/juntarClasses';
import estilos from './Abas.module.css';

export interface OpcaoAba<T extends string> {
  valor: T;
  rotulo: string;
}

export interface AbasProps<T extends string> {
  idBase: string;
  rotulo: string;
  opcoes: OpcaoAba<T>[];
  valor: T;
  aoMudar: (valor: T) => void;
  className?: string;
}

export function idAba(idBase: string, valor: string): string {
  return `${idBase}-aba-${valor}`;
}

export function idPainelAbas(idBase: string): string {
  return `${idBase}-painel`;
}

export function Abas<T extends string>({ idBase, rotulo, opcoes, valor, aoMudar, className }: AbasProps<T>) {
  const botoesRef = useRef<(HTMLButtonElement | null)[]>([]);
  const indiceAtivo = Math.max(
    0,
    opcoes.findIndex((opcao) => opcao.valor === valor),
  );

  const selecionar = (indice: number) => {
    const total = opcoes.length;
    const proximo = (indice + total) % total;
    const opcao = opcoes[proximo];
    if (!opcao) return;
    aoMudar(opcao.valor);
    botoesRef.current[proximo]?.focus();
  };

  const aoTeclar = (evento: KeyboardEvent<HTMLDivElement>) => {
    const acoes: Record<string, () => void> = {
      ArrowRight: () => selecionar(indiceAtivo + 1),
      ArrowLeft: () => selecionar(indiceAtivo - 1),
      Home: () => selecionar(0),
      End: () => selecionar(opcoes.length - 1),
    };
    const acao = acoes[evento.key];
    if (!acao) return;
    evento.preventDefault();
    acao();
  };

  const estilo = { '--total': opcoes.length, '--indice': indiceAtivo } as CSSProperties;

  return (
    <div
      role="tablist"
      aria-label={rotulo}
      className={juntarClasses(estilos.abas, className)}
      style={estilo}
      onKeyDown={aoTeclar}
    >
      <span className={estilos.indicador} aria-hidden="true" />
      {opcoes.map((opcao, indice) => {
        const ativa = indice === indiceAtivo;
        return (
          <button
            key={opcao.valor}
            ref={(elemento) => {
              botoesRef.current[indice] = elemento;
            }}
            type="button"
            role="tab"
            id={idAba(idBase, opcao.valor)}
            aria-selected={ativa}
            aria-controls={idPainelAbas(idBase)}
            tabIndex={ativa ? 0 : -1}
            className={juntarClasses(estilos.aba, ativa && estilos.ativa)}
            onClick={() => aoMudar(opcao.valor)}
          >
            {opcao.rotulo}
          </button>
        );
      })}
    </div>
  );
}
