import { Fragment, useCallback, useId, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { ArrowRight, KeyRound, ScanSearch, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { MarcaAegis } from '@/componentes/comum/MarcaAegis';
import { Botao } from '@/componentes/ui';
import { NOME_APLICACAO, SLOGAN_APLICACAO } from '@/configuracoes/aplicacao';
import { useMovimentoReduzido } from '@/ganchos/useMovimentoReduzido';
import { useTituloDocumento } from '@/ganchos/useTituloDocumento';
import { juntarClasses } from '@/utilitarios/juntarClasses';
import { transicionarParaAplicacao } from './transicaoBoasVindas';
import estilos from './TelaBoasVindas.module.css';

const DURACAO_DESPEDIDA_MS = 760;

const LETRAS_DO_NOME = [...NOME_APLICACAO];
const PALAVRAS_DO_TITULO = SLOGAN_APLICACAO.split(' ');

const ATRASO_ENTRADA_MS = {
  descricao: 1000,
  primeiroRecurso: 1100,
  passoRecurso: 140,
  acoes: 1560,
};

interface Recurso {
  icone: LucideIcon;
  titulo: string;
  descricao: string;
  efeito: 'girar' | 'escanear' | 'proteger';
}

const recursos: Recurso[] = [
  {
    icone: KeyRound,
    titulo: 'Gere',
    descricao: 'Senhas, frases-senha e PINs com aleatoriedade criptográfica.',
    efeito: 'girar',
  },
  {
    icone: ScanSearch,
    titulo: 'Analise',
    descricao: 'Veja a força, o tempo estimado para quebrar e o que melhorar.',
    efeito: 'escanear',
  },
  {
    icone: ShieldCheck,
    titulo: 'Sem deixar rastro',
    descricao: 'Nada é enviado nem gravado. Nem mesmo o histórico.',
    efeito: 'proteger',
  },
];

const TOTAL_BLOCOS = recursos.length + 2;

const CENTRO = { x: 600, y: 400 };
const ESCALAS_ESCUDO = [126, 184, 242, 300];
const ESCALA_TRILHA_SINAL = 184;
const CENTRO_VERTICAL_DO_ESCUDO = 0.09;

function caminhoDoEscudo(escala: number): string {
  const ponto = (x: number, y: number) =>
    `${(CENTRO.x + x * escala).toFixed(1)} ${(CENTRO.y + (y - CENTRO_VERTICAL_DO_ESCUDO) * escala).toFixed(1)}`;
  return [
    `M ${ponto(0, -1.12)}`,
    `L ${ponto(0.96, -0.76)}`,
    `L ${ponto(0.96, 0.04)}`,
    `C ${ponto(0.96, 0.66)} ${ponto(0.56, 1.06)} ${ponto(0, 1.3)}`,
    `C ${ponto(-0.56, 1.06)} ${ponto(-0.96, 0.66)} ${ponto(-0.96, 0.04)}`,
    `L ${ponto(-0.96, -0.76)}`,
    'Z',
  ].join(' ');
}

function bloco(atrasoEntradaMs: number, ordemSaida: number): CSSProperties {
  return { '--atraso': `${atrasoEntradaMs}ms`, '--ordem-saida': ordemSaida } as CSSProperties;
}

function comIndice(indice: number): CSSProperties {
  return { '--i': indice } as CSSProperties;
}

export function TelaBoasVindas({ aoComecar }: { aoComecar: () => void }) {
  const [saindo, setSaindo] = useState(false);
  const movimentoReduzido = useMovimentoReduzido();
  const idBase = useId().replace(/:/g, '');
  const simboloRef = useRef<HTMLSpanElement>(null);
  const nomeRef = useRef<HTMLSpanElement>(null);
  const letrasRef = useRef<(HTMLSpanElement | null)[]>([]);
  useTituloDocumento('');

  const medirDistanciaAteOLogo = useCallback(() => {
    const simbolo = simboloRef.current?.getBoundingClientRect();
    const nome = nomeRef.current?.getBoundingClientRect();
    if (!simbolo || !nome) return;
    const centroDoLogo = simbolo.left + simbolo.width / 2;
    letrasRef.current.forEach((letra) => {
      if (!letra) return;
      const centroDaLetra = nome.left + letra.offsetLeft + letra.offsetWidth / 2;
      letra.style.setProperty('--dx', `${(centroDoLogo - centroDaLetra).toFixed(1)}px`);
    });
  }, []);

  useLayoutEffect(() => {
    medirDistanciaAteOLogo();
    void document.fonts.ready.then(medirDistanciaAteOLogo);
    window.addEventListener('resize', medirDistanciaAteOLogo);
    return () => window.removeEventListener('resize', medirDistanciaAteOLogo);
  }, [medirDistanciaAteOLogo]);

  const comecar = () => {
    if (saindo) return;
    if (movimentoReduzido) {
      aoComecar();
      return;
    }
    medirDistanciaAteOLogo();
    setSaindo(true);
    void import('@/paginas/PaginaGerador');
    window.setTimeout(() => transicionarParaAplicacao(aoComecar), DURACAO_DESPEDIDA_MS);
  };

  return (
    <main
      className={juntarClasses(estilos.tela, saindo && estilos.saindo)}
      aria-labelledby="titulo-boas-vindas"
      aria-busy={saindo || undefined}
    >
      <div className={estilos.escudos} aria-hidden="true">
        <div className={estilos.palcoEscudos}>
          <svg className={estilos.linhas} viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid meet">
            {ESCALAS_ESCUDO.map((escala, indice) => (
              <path
                key={escala}
                d={caminhoDoEscudo(escala)}
                pathLength={1}
                className={estilos.linhaEscudo}
                style={comIndice(indice)}
              />
            ))}
          </svg>
          {movimentoReduzido ? null : (
            <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid meet">
              <path id={`${idBase}-trilha`} d={caminhoDoEscudo(ESCALA_TRILHA_SINAL)} fill="none" />
              <g className={estilos.sinal}>
                <circle r={7} className={estilos.haloSinal} />
                <circle r={3.5} className={estilos.nucleoSinal} />
                <animateMotion dur="18s" repeatCount="indefinite" rotate="0" calcMode="linear">
                  <mpath href={`#${idBase}-trilha`} />
                </animateMotion>
              </g>
            </svg>
          )}
        </div>
      </div>

      <div className={estilos.conteudo}>
        <div className={estilos.marca}>
          <span ref={simboloRef} className={juntarClasses(estilos.simbolo, 'marca-em-transicao')}>
            <MarcaAegis tamanho={48} animarEntrada={!movimentoReduzido} />
          </span>
          <span ref={nomeRef} className={estilos.nome}>
            <span className="visualmente-oculto">{NOME_APLICACAO}</span>
            {LETRAS_DO_NOME.map((letra, indice) => (
              <span
                key={`${letra}-${indice}`}
                ref={(elemento) => {
                  letrasRef.current[indice] = elemento;
                }}
                className={estilos.letra}
                style={comIndice(indice)}
                aria-hidden="true"
              >
                {letra}
              </span>
            ))}
          </span>
        </div>

        <h1 id="titulo-boas-vindas" className={estilos.titulo}>
          {PALAVRAS_DO_TITULO.map((palavra, indice) => (
            <Fragment key={`${palavra}-${indice}`}>
              <span className={estilos.palavra}>
                <span className={estilos.palavraInterna} style={comIndice(indice)}>
                  {palavra}
                </span>
              </span>
              {indice < PALAVRAS_DO_TITULO.length - 1 ? ' ' : null}
            </Fragment>
          ))}
        </h1>

        <p
          className={juntarClasses(estilos.descricao, estilos.entra, estilos.etapa)}
          style={bloco(ATRASO_ENTRADA_MS.descricao, TOTAL_BLOCOS)}
        >
          Crie senhas difíceis de adivinhar e descubra quanto as suas resistem a um ataque. Tudo acontece aqui, no
          seu navegador.
        </p>

        <ul className={estilos.recursos}>
          {recursos.map(({ icone: Icone, titulo, descricao, efeito }, indice) => (
            <li
              key={titulo}
              className={juntarClasses(estilos.recurso, estilos.entra, estilos.etapa)}
              data-efeito={efeito}
              style={bloco(
                ATRASO_ENTRADA_MS.primeiroRecurso + indice * ATRASO_ENTRADA_MS.passoRecurso,
                TOTAL_BLOCOS - 1 - indice,
              )}
            >
              <span className={estilos.iconeRecurso} aria-hidden="true">
                <Icone size={18} strokeWidth={2} />
              </span>
              <span className={estilos.brilhoRecurso} aria-hidden="true" />
              <span className={estilos.textosRecurso}>
                <span className={estilos.tituloRecurso}>{titulo}</span>
                <span className={estilos.descricaoRecurso}>{descricao}</span>
              </span>
            </li>
          ))}
        </ul>

        <div
          className={juntarClasses(estilos.acoes, estilos.entra, estilos.etapa)}
          style={bloco(ATRASO_ENTRADA_MS.acoes, 0)}
        >
          <Botao tamanho="lg" iconeDireita={ArrowRight} onClick={comecar} className={estilos.comecar}>
            Começar
          </Botao>
        </div>
      </div>
    </main>
  );
}
