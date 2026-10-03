import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { estiloTransicaoCena, misturar, mola, progresso } from '../animacao';
import { Sobretitulo } from '../componentes/Sobretitulo';
import { TextoRevelado } from '../componentes/TextoRevelado';
import { cenas, problema, SENHAS_COMUNS } from '../linhaDoTempo';
import { cores, fontes } from '../tema';

const vermelho = cores.forca[0];

export function Problema() {
  const quadro = useCurrentFrame();
  const conclusao = progresso(quadro, problema.conclusao, 18);

  return (
    <AbsoluteFill
      style={{
        ...estiloTransicaoCena(quadro, cenas.problema.duracao),
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 40,
      }}
    >
      <Sobretitulo texto="O PROBLEMA" inicio={problema.titulo} />
      <TextoRevelado
        inicio={problema.titulo + 4}
        intervalo={2}
        trechos={[{ texto: 'As senhas mais comuns caem em' }, { texto: 'menos de um segundo.', cor: vermelho }]}
        estilo={{
          maxWidth: 1400,
          fontFamily: fontes.texto,
          fontSize: 88,
          fontWeight: 620,
          letterSpacing: '-0.035em',
          lineHeight: 1.05,
          color: cores.texto,
          textAlign: 'center',
        }}
      />
      <div style={{ display: 'flex', gap: 32, marginTop: 28 }}>
        {SENHAS_COMUNS.map(({ senha, nota }, indice) => {
          const entrada = mola(quadro, problema.senhas[indice] ?? 0, 160, 15);
          const risco = progresso(quadro, problema.riscos[indice] ?? 0, 8);
          const selo = mola(quadro, (problema.riscos[indice] ?? 0) + 4, 200, 13);
          return (
            <div
              key={senha}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 20,
                padding: '30px 40px',
                minWidth: 330,
                borderRadius: 24,
                background: cores.superficie,
                border: `1.5px solid ${risco > 0 ? `rgba(255, 118, 102, ${0.2 + 0.3 * risco})` : cores.borda}`,
                opacity: entrada,
                transform: `translateY(${misturar(50, 0, entrada)}px) scale(${misturar(0.9, 1, entrada)})`,
                boxShadow: '0 30px 60px -30px rgba(0, 0, 0, 0.8)',
              }}
            >
              <span style={{ position: 'relative', fontFamily: fontes.mono, fontSize: 56, color: risco > 0.5 ? cores.textoSecundario : cores.texto }}>
                {senha}
                <span
                  style={{
                    position: 'absolute',
                    left: -8,
                    right: -8,
                    top: '54%',
                    height: 5,
                    borderRadius: 3,
                    background: vermelho,
                    transform: `scaleX(${risco})`,
                    transformOrigin: 'left center',
                  }}
                />
              </span>
              <span
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 10,
                  padding: '8px 18px',
                  borderRadius: 12,
                  background: cores.forcaSuave[0],
                  fontFamily: fontes.texto,
                  fontSize: 24,
                  fontWeight: 600,
                  color: vermelho,
                  opacity: selo,
                  transform: `scale(${misturar(0.6, 1, selo)})`,
                }}
              >
                Nota {nota}/100
              </span>
            </div>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 12,
          fontFamily: fontes.texto,
          fontSize: 34,
          color: cores.textoSecundario,
          opacity: conclusao,
          transform: `translateY(${misturar(14, 0, conclusao)}px)`,
        }}
      >
        O Aegis cria senhas fortes e mostra quanto as suas resistem.
      </div>
    </AbsoluteFill>
  );
}
