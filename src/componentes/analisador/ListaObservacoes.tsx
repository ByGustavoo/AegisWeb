import { CircleAlert, CircleCheck } from 'lucide-react';
import type { Observacao, TomObservacao } from '@/modelos/analise';
import { juntarClasses } from '@/utilitarios/juntarClasses';
import estilos from './ListaObservacoes.module.css';

export interface ListaObservacoesProps {
  id: string;
  titulo: string;
  tom: TomObservacao;
  itens: readonly Observacao[];
  vazio: string;
  visivel: boolean;
  aoDestacar?: (id: string | null) => void;
}

export function ListaObservacoes({ id, titulo, tom, itens, vazio, visivel, aoDestacar }: ListaObservacoesProps) {
  const Icone = tom === 'FORTE' ? CircleCheck : CircleAlert;

  return (
    <section className={juntarClasses(estilos.bloco, tom === 'FORTE' ? estilos.forte : estilos.fraco)} aria-labelledby={id}>
      <h3 id={id} className={estilos.titulo}>
        <Icone size={18} strokeWidth={2} className={estilos.iconeTitulo} aria-hidden="true" />
        {titulo}
        <span className={juntarClasses(estilos.contagem, 'mono')}>{itens.length}</span>
      </h3>

      {itens.length === 0 ? (
        <p className={estilos.vazio}>{vazio}</p>
      ) : (
        <ul className={estilos.lista}>
          {itens.map((item) => {
            const destacavel = Boolean(item.trecho && aoDestacar);
            return (
              <li
                key={item.id}
                className={juntarClasses(estilos.item, destacavel && estilos.destacavel)}
                onPointerEnter={destacavel ? () => aoDestacar?.(item.id) : undefined}
                onPointerLeave={destacavel ? () => aoDestacar?.(null) : undefined}
              >
                <span className={estilos.marcador} aria-hidden="true" />
                <div className={estilos.textos}>
                  <p className={estilos.tituloItem}>{visivel ? item.titulo : (item.tituloOculto ?? item.titulo)}</p>
                  <p className={estilos.detalhe}>{item.detalhe}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
