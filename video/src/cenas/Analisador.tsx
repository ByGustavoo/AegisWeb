import { ShieldX } from 'lucide-react';
import { interpolate, useCurrentFrame } from 'remotion';
import { misturar, mola, progresso } from '../animacao';
import { Cartao } from '../componentes/Cartao';
import { CenaDividida } from '../componentes/CenaDividida';
import { analisador, cenas, quadroTecla, SENHA_ANALISADA } from '../linhaDoTempo';
import { cores, fontes } from '../tema';

const TAMANHO_MAPA = 60;
const LARGURA_CARACTERE = TAMANHO_MAPA * 0.6;
const vermelho = cores.forca[0];
const laranja = cores.forca[1];

const padroes = [
  { texto: 'brasil', rotulo: 'senha muito usada', inicio: analisador.padraoPalavra },
  { texto: '2024', rotulo: 'parece um ano', inicio: analisador.padraoAno },
];

function caminhoOndulado(largura: number): string {
  const passo = 7;
  const quantidade = Math.floor(largura / (passo * 2));
  let caminho = `M0 5 q ${passo / 2} -5 ${passo} 0`;
  for (let indice = 1; indice < quantidade * 2; indice += 1) caminho += ` t ${passo} 0`;
  return caminho;
}

export function Analisador() {
  const quadro = useCurrentFrame();
  const digitados = SENHA_ANALISADA.split('').filter((_, indice) => quadro >= quadroTecla(indice)).length;
  const digitando = digitados > 0 && digitados < SENHA_ANALISADA.length;
  const cursorVisivel = digitando || Math.floor(quadro / 9) % 2 === 0;
  const placar = mola(quadro, analisador.placar, 120, 16);
  const nota = Math.round(interpolate(quadro, [analisador.placar + 4, analisador.impacto], [0, analisador.nota], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const decaimentoImpacto = 1 - progresso(quadro, analisador.impacto, 14, (t) => t);
  const tremor = quadro >= analisador.impacto ? Math.sin((quadro - analisador.impacto) * 2.6) * 14 * decaimentoImpacto : 0;
  const flash = quadro >= analisador.impacto ? decaimentoImpacto : 0;
  const tempoQuebrar = progresso(quadro, analisador.tempoQuebrar, 14);
  const barra = progresso(quadro, analisador.impacto - 4, 10);

  return (
    <CenaDividida
      duracao={cenas.analisador.duracao}
      ladoTexto="direita"
      sobretitulo="ANALISADOR"
      titulo="Veja quanto a sua senha"
      tituloDestaque="resiste."
      subtitulo="Digite qualquer senha. O Aegis procura palavras, nomes, datas, sequências e repetições, e estima o tempo para quebrá-la."
      inicioTitulo={analisador.titulo}
      inicioCartao={analisador.cartao}
      larguraTexto={620}
    >
      <Cartao estilo={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <span style={{ fontFamily: fontes.texto, fontSize: 24, fontWeight: 600, color: cores.texto }}>Senha para analisar</span>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              height: 92,
              padding: '0 30px',
              borderRadius: 18,
              background: cores.fundo,
              border: `2px solid ${cores.destaque}`,
              boxShadow: '0 0 0 6px rgba(79, 209, 182, 0.22)',
              fontFamily: fontes.mono,
              fontSize: 44,
              color: cores.texto,
            }}
          >
            {SENHA_ANALISADA.slice(0, digitados)}
            <span style={{ width: 3, height: 50, marginLeft: 3, background: cores.texto, opacity: cursorVisivel ? 1 : 0 }} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontFamily: fontes.texto }}>
            <span style={{ fontSize: 24, fontWeight: 600, color: cores.texto }}>Mapa da senha</span>
            <span style={{ fontSize: 20, color: cores.textoTerciario }}>Os trechos marcados são previsíveis.</span>
          </div>
          <div
            style={{
              display: 'flex',
              gap: 18,
              height: 180,
              padding: '30px 30px 0',
              borderRadius: 18,
              background: cores.superficieSuave,
              border: `1.5px solid ${cores.borda}`,
            }}
          >
            {padroes.map((padrao) => {
              const largura = padrao.texto.length * LARGURA_CARACTERE;
              const deslocamento = SENHA_ANALISADA.indexOf(padrao.texto);
              const caracteresVisiveis = Math.min(Math.max(digitados - deslocamento, 0), padrao.texto.length);
              const traco = progresso(quadro, padrao.inicio, 12);
              const etiqueta = mola(quadro, padrao.inicio + 6, 180, 14);
              return (
                <div key={padrao.texto} style={{ display: 'flex', flexDirection: 'column', gap: 6, opacity: caracteresVisiveis > 0 ? 1 : 0 }}>
                  <span
                    style={{
                      fontFamily: fontes.mono,
                      fontSize: TAMANHO_MAPA,
                      lineHeight: 1.1,
                      color: cores.texto,
                      padding: '0 4px',
                      borderRadius: 8,
                      background: `rgba(255, 160, 92, ${0.14 * traco})`,
                    }}
                  >
                    {padrao.texto.slice(0, caracteresVisiveis)}
                    <span style={{ opacity: 0 }}>{padrao.texto.slice(caracteresVisiveis)}</span>
                  </span>
                  <svg width={largura + 8} height={12} style={{ overflow: 'visible' }}>
                    <path
                      d={caminhoOndulado(largura + 8)}
                      fill="none"
                      stroke={laranja}
                      strokeWidth={3}
                      strokeLinecap="round"
                      pathLength={1}
                      strokeDasharray={1}
                      strokeDashoffset={1 - traco}
                    />
                  </svg>
                  <span
                    style={{
                      alignSelf: 'flex-start',
                      marginTop: 8,
                      padding: '6px 14px',
                      borderRadius: 10,
                      background: cores.forcaSuave[1],
                      color: laranja,
                      fontFamily: fontes.texto,
                      fontSize: 21,
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      opacity: etiqueta,
                      transform: `translateY(${misturar(-10, 0, etiqueta)}px) scale(${misturar(0.8, 1, etiqueta)})`,
                      transformOrigin: 'left top',
                    }}
                  >
                    {padrao.rotulo}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 44,
            padding: '30px 36px',
            borderRadius: 20,
            background: cores.forcaSuave[0],
            border: `1.5px solid rgba(255, 118, 102, ${0.25 + 0.5 * flash})`,
            boxShadow: `0 0 ${60 * flash}px rgba(255, 118, 102, ${0.35 * flash})`,
            opacity: placar,
            transform: `translateY(${misturar(30, 0, placar)}px) translateX(${tremor}px)`,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontFamily: fontes.mono, fontSize: 18, letterSpacing: '0.14em', color: cores.textoSecundario }}>NOTA DE SEGURANÇA</span>
            <span style={{ fontFamily: fontes.texto, color: vermelho, display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 104, fontWeight: 650, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{nota}</span>
              <span style={{ fontSize: 30, color: cores.textoSecundario }}>/100</span>
            </span>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: fontes.texto, fontSize: 30, fontWeight: 600, color: vermelho }}>
                <ShieldX size={32} strokeWidth={2.2} />
                Muito fraca
              </span>
              <span style={{ fontFamily: fontes.mono, fontSize: 22, color: cores.textoSecundario }}>1/5</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {[0, 1, 2, 3, 4].map((indice) => (
                <div key={indice} style={{ flex: 1, height: 12, borderRadius: 6, background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
                  {indice === 0 ? <div style={{ width: `${barra * 100}%`, height: '100%', background: vermelho, borderRadius: 6 }} /> : null}
                </div>
              ))}
            </div>
            <span
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                opacity: tempoQuebrar,
                transform: `translateY(${misturar(8, 0, tempoQuebrar)}px)`,
              }}
            >
              <span style={{ fontFamily: fontes.texto, fontSize: 20, color: cores.textoSecundario }}>Tempo para quebrar</span>
              <span style={{ fontFamily: fontes.mono, fontSize: 28, fontWeight: 600, color: cores.texto }}>Menos de um segundo</span>
            </span>
          </div>
        </div>
      </Cartao>
    </CenaDividida>
  );
}
