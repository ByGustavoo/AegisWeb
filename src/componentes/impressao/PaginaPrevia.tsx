import { CORES_IMPRESSAO, ESTILOS_TEXTO, FONTES_IMPRESSAO, GEOMETRIA_DOCUMENTO } from '@/configuracoes/impressao';
import type { AlinhamentoTexto, ElementoPagina, EstiloTexto, PaginaImpressa } from '@/modelos/impressao';
import { CADEADO, corDoCaractere, geometriaDoCadeado, geometriaDoTracoDoZero, rgb, segmentosDoValor } from './desenhoValor';
import { caminhoSvg, iconeNaPagina, TAMANHO_BASE_ICONE } from './vetores';
import estilos from './PaginaPrevia.module.css';

interface PaginaPreviaProps {
  pagina: PaginaImpressa;
  largura: number;
  altura: number;
  rotulo: string;
  valoresOcultos: boolean;
}

const ANCORA_SVG: Record<AlinhamentoTexto, 'start' | 'middle' | 'end'> = {
  INICIO: 'start',
  MEIO: 'middle',
  FIM: 'end',
};

function caminhoComTopoArredondado(x: number, y: number, largura: number, altura: number, raio: number): string {
  return [
    `M${x} ${y + altura}`,
    `V${y + raio}`,
    `A${raio} ${raio} 0 0 1 ${x + raio} ${y}`,
    `H${x + largura - raio}`,
    `A${raio} ${raio} 0 0 1 ${x + largura} ${y + raio}`,
    `V${y + altura}`,
    'Z',
  ].join(' ');
}

function atributosDaFonte(estilo: EstiloTexto) {
  const { fonte, tamanho, espacamentoLetras } = ESTILOS_TEXTO[estilo];
  const { familiaNavegador, peso, monoespacada } = FONTES_IMPRESSAO[fonte];
  return {
    fontFamily: `"${familiaNavegador}", ${monoespacada ? 'monospace' : 'sans-serif'}`,
    fontWeight: peso,
    fontSize: tamanho,
    letterSpacing: espacamentoLetras || undefined,
  };
}

function ElementoPrevia({ elemento, valoresOcultos }: { elemento: ElementoPagina; valoresOcultos: boolean }) {
  switch (elemento.tipo) {
    case 'TEXTO':
      return (
        <text
          x={elemento.x}
          y={elemento.y}
          fill={rgb(elemento.cor ?? ESTILOS_TEXTO[elemento.estilo].cor)}
          textAnchor={ANCORA_SVG[elemento.alinhamento ?? 'INICIO']}
          {...atributosDaFonte(elemento.estilo)}
        >
          {elemento.texto}
        </text>
      );
    case 'VALOR': {
      const fonte = atributosDaFonte(elemento.estilo);
      const ocultar = valoresOcultos && elemento.estilo === 'VALOR';
      if (ocultar) {
        return (
          <text x={elemento.x} y={elemento.y} fill={rgb(CORES_IMPRESSAO.terciario)} {...fonte}>
            {'•'.repeat(Array.from(elemento.linha.texto).length)}
          </text>
        );
      }
      const { tamanho } = ESTILOS_TEXTO[elemento.estilo];
      return (
        <g>
          {segmentosDoValor(elemento.linha, elemento.avanco).map((segmento) => (
            <text
              key={segmento.deslocamento}
              x={elemento.x + segmento.deslocamento}
              y={elemento.y}
              fill={rgb(segmento.cor)}
              {...fonte}
            >
              {segmento.texto}
            </text>
          ))}
          {Array.from(elemento.linha.texto).map((caractere, indice) => {
            if (caractere !== '0') return null;
            const traco = geometriaDoTracoDoZero(elemento.x + indice * elemento.avanco, elemento.y, elemento.avanco, tamanho);
            return (
              <line
                key={indice}
                x1={traco.x1}
                y1={traco.y1}
                x2={traco.x2}
                y2={traco.y2}
                stroke={rgb(corDoCaractere('0'))}
                strokeWidth={traco.espessura}
                strokeLinecap="round"
              />
            );
          })}
        </g>
      );
    }
    case 'RETANGULO': {
      const { x, y, largura, altura, raio, preenchimento, borda, espessura = 0.6, cantos = 'TODOS' } = elemento;
      const pintura = {
        fill: preenchimento ? rgb(preenchimento) : 'none',
        stroke: borda ? rgb(borda) : undefined,
        strokeWidth: borda ? espessura : undefined,
      };
      if (cantos === 'TOPO') return <path d={caminhoComTopoArredondado(x, y, largura, altura, raio)} {...pintura} />;
      return <rect x={x} y={y} width={largura} height={altura} rx={raio} {...pintura} />;
    }
    case 'POLIGONO':
      return <polygon points={elemento.pontos.map((ponto) => ponto.join(',')).join(' ')} fill={rgb(elemento.preenchimento)} />;
    case 'ICONE':
      return (
        <path
          d={caminhoSvg(iconeNaPagina(elemento.nome, elemento.x, elemento.y, elemento.tamanho))}
          fill="none"
          stroke={rgb(elemento.cor)}
          strokeWidth={(GEOMETRIA_DOCUMENTO.icone.espessura * elemento.tamanho) / TAMANHO_BASE_ICONE}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    case 'CIRCULO':
      return <circle cx={elemento.x} cy={elemento.y} r={elemento.raio} fill={rgb(elemento.preenchimento)} />;
    case 'CADEADO': {
      const { corpo, arco } = geometriaDoCadeado(elemento.x, elemento.y);
      return (
        <g>
          <rect x={corpo.x} y={corpo.y} width={corpo.largura} height={corpo.altura} rx={corpo.raio} fill={rgb(elemento.cor)} />
          <path
            d={`M${arco.x} ${arco.y} v${-CADEADO.arcoAltura} c0 ${-CADEADO.arcoCurva} ${CADEADO.arcoLargura} ${-CADEADO.arcoCurva} ${CADEADO.arcoLargura} 0 v${CADEADO.arcoAltura}`}
            fill="none"
            stroke={rgb(elemento.cor)}
            strokeWidth={CADEADO.espessura}
          />
        </g>
      );
    }
    case 'LINHA':
      return (
        <line
          x1={elemento.x1}
          y1={elemento.y1}
          x2={elemento.x2}
          y2={elemento.y2}
          stroke={rgb(elemento.cor)}
          strokeWidth={elemento.espessura}
        />
      );
    case 'MARCA':
      return (
        <g transform={`translate(${elemento.x} ${elemento.y}) scale(${elemento.tamanho / 32})`}>
          <rect width="32" height="32" rx="9" fill={rgb(CORES_IMPRESSAO.destaque)} />
          <g fill="none" stroke={rgb(CORES_IMPRESSAO.marcaTraco)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 6.4 23.6 9.2v6.3c0 4.7-3.1 8.2-7.6 10.1-4.5-1.9-7.6-5.4-7.6-10.1V9.2z" />
            <path d="M12.7 19.2 16 12.4l3.3 6.8" />
          </g>
        </g>
      );
    default:
      return null;
  }
}

export function PaginaPrevia({ pagina, largura, altura, rotulo, valoresOcultos }: PaginaPreviaProps) {
  return (
    <svg className={estilos.pagina} viewBox={`0 0 ${largura} ${altura}`} role="img" aria-label={rotulo}>
      <rect width={largura} height={altura} fill={rgb(CORES_IMPRESSAO.papel)} />
      {pagina.elementos.map((elemento, indice) => (
        <ElementoPrevia key={indice} elemento={elemento} valoresOcultos={valoresOcultos} />
      ))}
    </svg>
  );
}
