import type { CSSProperties } from 'react';
import { ArrowRight, PartyPopper, WandSparkles } from 'lucide-react';
import { Botao } from '@/componentes/ui';
import { niveisForca } from '@/configuracoes/forca';
import type { Recomendacao } from '@/modelos/analise';
import { nivelPorNota } from '@/regras/analise/analisarSenha';
import { juntarClasses } from '@/utilitarios/juntarClasses';
import estilos from './ListaRecomendacoes.module.css';

export interface ListaRecomendacoesProps {
  recomendacoes: readonly Recomendacao[];
  notaAtual: number;
  visivel: boolean;
  aoGerar: () => void;
}

function estiloNivel(nota: number): CSSProperties {
  const { cor } = niveisForca[nivelPorNota(nota)];
  return { '--cor-simulada': cor } as CSSProperties;
}

export function ListaRecomendacoes({ recomendacoes, notaAtual, visivel, aoGerar }: ListaRecomendacoesProps) {
  return (
    <div className={estilos.conteudo}>
      {recomendacoes.length === 0 ? (
        <div className={estilos.semRecomendacoes}>
          <PartyPopper size={20} strokeWidth={1.75} className={estilos.iconeSem} aria-hidden="true" />
          <p>
            <strong>Nada urgente para melhorar.</strong> Ela já resiste bem aos ataques que testamos.
          </p>
        </div>
      ) : (
        <ol className={estilos.lista}>
          {recomendacoes.map((recomendacao, indice) => {
            const ganho = recomendacao.notaSimulada - notaAtual;
            return (
              <li key={recomendacao.id} className={estilos.item} style={estiloNivel(recomendacao.notaSimulada)}>
                <span className={juntarClasses(estilos.ordem, 'mono')} aria-hidden="true">
                  {indice + 1}
                </span>
                <div className={estilos.textos}>
                  <p className={estilos.titulo}>{visivel ? recomendacao.titulo : (recomendacao.tituloOculto ?? recomendacao.titulo)}</p>
                  <p className={estilos.detalhe}>{recomendacao.detalhe}</p>
                </div>
                <div className={estilos.simulacao}>
                  <span className={estilos.rotuloSimulacao}>E se…</span>
                  <span className={juntarClasses(estilos.notas, 'mono')}>
                    <span className={estilos.notaAtual}>{notaAtual}</span>
                    <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
                    <span className={estilos.notaSimulada}>{recomendacao.notaSimulada}</span>
                  </span>
                  <span className="visualmente-oculto">
                    {`A nota iria de ${notaAtual} para ${recomendacao.notaSimulada}, ${ganho} pontos a mais.`}
                  </span>
                  <span className={estilos.trilho} aria-hidden="true">
                    <span className={estilos.barraSimulada} style={{ width: `${recomendacao.notaSimulada}%` }} />
                    <span className={estilos.barraAtual} style={{ width: `${notaAtual}%` }} />
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <div className={estilos.rodape}>
        <Botao variante={recomendacoes.length > 0 ? 'primario' : 'secundario'} icone={WandSparkles} onClick={aoGerar}>
          Gerar uma senha forte
        </Botao>
        <p className={estilos.lembrete}>
          Mesmo forte, use esta senha em um só lugar e ative a verificação em duas etapas onde puder.
        </p>
      </div>
    </div>
  );
}
