import { useMemo } from 'react';
import type { Observacao } from '@/modelos/analise';
import { juntarClasses } from '@/utilitarios/juntarClasses';
import estilos from './MapaSenha.module.css';

const CARACTERE_OCULTO = '•';

interface Pedaco {
  chave: string;
  texto: string;
  idObservacao: string | null;
}

export interface MapaSenhaProps {
  senha: string;
  pontosFracos: readonly Observacao[];
  visivel: boolean;
  idDestacado: string | null;
}

function dividir(caracteres: readonly string[], pontosFracos: readonly Observacao[]): Pedaco[] {
  const trechos = pontosFracos
    .filter((ponto): ponto is Observacao & { trecho: NonNullable<Observacao['trecho']> } => Boolean(ponto.trecho))
    .sort((a, b) => a.trecho.inicio - b.trecho.inicio);
  const pedacos: Pedaco[] = [];
  let posicao = 0;

  for (const { id, trecho } of trechos) {
    if (trecho.inicio < posicao) continue;
    if (trecho.inicio > posicao) {
      pedacos.push({ chave: `livre-${posicao}`, texto: caracteres.slice(posicao, trecho.inicio).join(''), idObservacao: null });
    }
    pedacos.push({ chave: id, texto: caracteres.slice(trecho.inicio, trecho.fim + 1).join(''), idObservacao: id });
    posicao = trecho.fim + 1;
  }
  if (posicao < caracteres.length) {
    pedacos.push({ chave: `livre-${posicao}`, texto: caracteres.slice(posicao).join(''), idObservacao: null });
  }
  return pedacos;
}

export function MapaSenha({ senha, pontosFracos, visivel, idDestacado }: MapaSenhaProps) {
  const caracteres = useMemo(() => Array.from(senha), [senha]);
  const pedacos = useMemo(() => dividir(caracteres, pontosFracos), [caracteres, pontosFracos]);
  const temTrechos = pedacos.some((pedaco) => pedaco.idObservacao);

  return (
    <div className={estilos.mapa}>
      <p className={estilos.rotulo}>
        Mapa da senha
        <span className={estilos.legenda}>
          {temTrechos ? 'Os trechos marcados são previsíveis.' : 'Nenhum trecho previsível encontrado.'}
        </span>
      </p>
      <div className={juntarClasses(estilos.caracteres, 'mono')} aria-hidden="true" translate="no">
        {pedacos.map((pedaco) => {
          const texto = visivel ? pedaco.texto : CARACTERE_OCULTO.repeat(Array.from(pedaco.texto).length);
          if (!pedaco.idObservacao) {
            return (
              <span key={pedaco.chave} className={estilos.livre}>
                {texto}
              </span>
            );
          }
          return (
            <mark
              key={pedaco.chave}
              className={juntarClasses(estilos.fraco, idDestacado === pedaco.idObservacao && estilos.destacado)}
            >
              {texto}
            </mark>
          );
        })}
      </div>
    </div>
  );
}
