import type { CSSProperties } from 'react';
import { MedidorForca } from '@/componentes/senha/MedidorForca';
import { niveisForca } from '@/configuracoes/forca';
import type { AnaliseSenha } from '@/modelos/analise';
import { TAMANHO_MAXIMO_ANALISE } from '@/regras/analise/analisarSenha';
import { juntarClasses } from '@/utilitarios/juntarClasses';
import estilos from './PlacarSeguranca.module.css';

export interface PlacarSegurancaProps {
  analise: AnaliseSenha | null;
}

function contarPadroes(analise: AnaliseSenha): number {
  return analise.pontosFracos.filter((ponto) => ponto.trecho).length;
}

export function PlacarSeguranca({ analise }: PlacarSegurancaProps) {
  const descricao = analise ? niveisForca[analise.nivel] : null;
  const estilo = descricao ? ({ '--cor-nivel': descricao.cor, '--cor-nivel-suave': descricao.corSuave } as CSSProperties) : undefined;
  const padroes = analise ? contarPadroes(analise) : 0;

  const metricas = [
    {
      rotulo: 'Tempo para quebrar',
      detalhe: 'Num ataque a senhas vazadas, com 10 bilhões de palpites por segundo.',
      valor: analise?.tempoEstimadoQuebra,
    },
    {
      rotulo: 'Entropia estimada',
      detalhe: 'Quantos palpites, em bits, um ataque precisaria.',
      valor: analise ? `${Math.round(analise.entropiaBits)} bits` : undefined,
    },
    {
      rotulo: 'Padrões previsíveis',
      detalhe: 'Palavras, nomes, sequências, datas e repetições.',
      valor: analise ? (padroes === 0 ? 'Nenhum' : String(padroes)) : undefined,
    },
  ];

  return (
    <div className={estilos.placar} style={estilo}>
      <div className={juntarClasses(estilos.topo, !analise && estilos.vazio)}>
        <p className={estilos.nota}>
          <span className={estilos.rotuloNota}>Nota de segurança</span>
          <span className={estilos.valorNota}>
            <span className={juntarClasses(estilos.numero, 'mono')}>{analise ? analise.nota : '—'}</span>
            <span className={estilos.total}>/100</span>
          </span>
        </p>
        <MedidorForca nivel={analise?.nivel ?? null} className={estilos.medidor} />
      </div>

      <dl className={estilos.metricas}>
        {metricas.map((metrica) => (
          <div key={metrica.rotulo} className={estilos.metrica}>
            <dt className={estilos.rotuloMetrica}>{metrica.rotulo}</dt>
            <dd className={juntarClasses(estilos.valorMetrica, metrica.valor && estilos.preenchida)}>
              {metrica.valor ?? (
                <>
                  <span aria-hidden="true">—</span>
                  <span className="visualmente-oculto">Sem análise</span>
                </>
              )}
            </dd>
            <dd className={estilos.detalheMetrica}>{metrica.detalhe}</dd>
          </div>
        ))}
      </dl>

      {analise?.truncada ? (
        <p className={estilos.avisoTruncada}>
          A análise considera os primeiros {TAMANHO_MAXIMO_ANALISE} caracteres. Os outros só deixam a senha mais forte.
        </p>
      ) : null}
    </div>
  );
}
