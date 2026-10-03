import { CircleAlert, Sparkles } from 'lucide-react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { estiloTransicaoCena, misturar, mola, progresso } from '../animacao';
import { Sobretitulo } from '../componentes/Sobretitulo';
import { TextoRevelado } from '../componentes/TextoRevelado';
import { analisador, cenas, melhorar } from '../linhaDoTempo';
import { cores, fontes } from '../tema';

const pontosFracos = [
  { titulo: 'Curta: 10 caracteres', detalhe: 'Use pelo menos 12. Para e-mail e banco, 16 ou mais.' },
  { titulo: '“brasil” é uma senha muito usada', detalhe: 'Os ataques combinam senhas vazadas com outros pedaços.' },
  { titulo: '“2024” parece um ano', detalhe: 'Anos recentes e de nascimento estão entre os finais mais testados.' },
  { titulo: 'Formato Palavra + números', detalhe: 'É o formato mais comum que existe, e o primeiro a ser testado.' },
  { titulo: 'Só letras minúsculas e números', detalhe: 'Cada tipo de caractere a mais aumenta as combinações a testar.' },
];

const recomendacoes = [
  { titulo: 'Use uma frase-senha', detalhe: 'Seis palavras sorteadas: fáceis de lembrar, difíceis de adivinhar.', nota: 70 },
  { titulo: 'Aumente para 16 caracteres', detalhe: 'Acrescente 6 caracteres aleatórios, de preferência no meio.', nota: 44 },
  { titulo: 'Troque “brasil”', detalhe: 'Use caracteres aleatórios no lugar, sem ligação com você.', nota: 36 },
];

function corDaNota(nota: number): string {
  return cores.forca[Math.min(4, Math.floor(nota / 20))] ?? cores.destaque;
}

const estiloPainel = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 20,
  padding: 40,
  borderRadius: 28,
  background: cores.superficie,
  border: `1.5px solid ${cores.borda}`,
  boxShadow: '0 40px 80px -30px rgba(0, 0, 0, 0.75)',
};

export function Melhorar() {
  const quadro = useCurrentFrame();
  const painelFraco = mola(quadro, melhorar.pontosFracos[0] - 6, 100, 18);
  const painelMelhorar = mola(quadro, melhorar.recomendacoes[0] - 6, 100, 18);

  return (
    <AbsoluteFill
      style={{
        ...estiloTransicaoCena(quadro, cenas.melhorar.duracao),
        padding: '0 140px',
        justifyContent: 'center',
        gap: 44,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Sobretitulo texto="RECOMENDAÇÕES" inicio={melhorar.titulo} />
        <TextoRevelado
          inicio={melhorar.titulo + 4}
          intervalo={2}
          trechos={[{ texto: 'Não para na nota:' }, { texto: 'mostra como melhorar.', cor: cores.destaque }]}
          estilo={{ fontFamily: fontes.texto, fontSize: 72, fontWeight: 620, letterSpacing: '-0.035em', lineHeight: 1.05, color: cores.texto }}
        />
      </div>

      <div style={{ display: 'flex', gap: 32, alignItems: 'stretch' }}>
        <div style={{ ...estiloPainel, opacity: painelFraco, transform: `translateY(${misturar(60, 0, painelFraco)}px)` }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 14, fontFamily: fontes.texto, fontSize: 30, fontWeight: 600, color: cores.texto }}>
            <CircleAlert size={30} color={cores.forca[1]} strokeWidth={2.2} />
            Pontos fracos
            <span style={{ padding: '2px 12px', borderRadius: 999, background: cores.superficieSuave, fontFamily: fontes.mono, fontSize: 20, color: cores.textoSecundario }}>5</span>
          </span>
          {pontosFracos.map((ponto, indice) => {
            const entrada = progresso(quadro, melhorar.pontosFracos[indice] ?? 0, 14);
            return (
              <div
                key={ponto.titulo}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  paddingLeft: 20,
                  borderLeft: `4px solid ${cores.forca[1]}`,
                  opacity: entrada,
                  transform: `translateX(${misturar(-20, 0, entrada)}px)`,
                }}
              >
                <span style={{ fontFamily: fontes.texto, fontSize: 25, fontWeight: 600, color: cores.texto }}>{ponto.titulo}</span>
                <span style={{ fontFamily: fontes.texto, fontSize: 20, color: cores.textoSecundario }}>{ponto.detalhe}</span>
              </div>
            );
          })}
        </div>

        <div style={{ ...estiloPainel, flex: 1.15, opacity: painelMelhorar, transform: `translateY(${misturar(60, 0, painelMelhorar)}px)` }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 14, fontFamily: fontes.texto, fontSize: 30, fontWeight: 600, color: cores.texto }}>
            <Sparkles size={30} color={cores.destaque} strokeWidth={2.2} />
            Como melhorar
          </span>
          {recomendacoes.map((recomendacao, indice) => {
            const inicio = melhorar.recomendacoes[indice] ?? 0;
            const entrada = mola(quadro, inicio, 150, 17);
            const nota = Math.round(
              interpolate(quadro, [inicio + 6, inicio + 6 + melhorar.duracaoSimulacao], [analisador.nota, recomendacao.nota], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
            );
            const cor = corDaNota(nota);
            return (
              <div
                key={recomendacao.titulo}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 22,
                  padding: '18px 22px',
                  borderRadius: 18,
                  background: cores.superficieSuave,
                  border: `1.5px solid ${cores.borda}`,
                  opacity: entrada,
                  transform: `translateY(${misturar(24, 0, entrada)}px)`,
                }}
              >
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: cores.destaqueSuave,
                    color: cores.destaque,
                    fontFamily: fontes.mono,
                    fontSize: 20,
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  {indice + 1}
                </span>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontFamily: fontes.texto, fontSize: 25, fontWeight: 600, color: cores.texto }}>{recomendacao.titulo}</span>
                  <span style={{ fontFamily: fontes.texto, fontSize: 19, color: cores.textoSecundario }}>{recomendacao.detalhe}</span>
                  <div style={{ height: 8, borderRadius: 4, background: cores.forcaVazia, marginTop: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${nota}%`, height: '100%', borderRadius: 4, background: cor }} />
                  </div>
                </div>
                <span style={{ display: 'flex', alignItems: 'baseline', gap: 10, fontFamily: fontes.mono, fontSize: 22, color: cores.textoTerciario, flexShrink: 0 }}>
                  {analisador.nota} →
                  <span style={{ fontSize: 40, fontWeight: 600, color: cor, minWidth: 52, textAlign: 'right' }}>{nota}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
}
