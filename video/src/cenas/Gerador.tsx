import { Copy, RefreshCw, ShieldCheck } from 'lucide-react';
import { random, useCurrentFrame } from 'remotion';
import { misturar, progresso } from '../animacao';
import { Cartao } from '../componentes/Cartao';
import { CenaDividida } from '../componentes/CenaDividida';
import { Botao, corDoCaractere, Medidor, pressao } from '../componentes/Interface';
import { cenas, gerador, quadroSegmentoMedidor, quadroSorteio, quadroSorteio2, SENHA_GERADA, SENHA_REGERADA } from '../linhaDoTempo';
import { cores, fontes, rotulosForca } from '../tema';

const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789!@#$%&*-_+=?';
const ABAS = ['Senha', 'Frase-senha', 'PIN'];

function caractereSorteado(semente: string, quadro: number, reserva: string): string {
  return ALFABETO[Math.floor(random(`${semente}-${Math.floor(quadro / 2)}`) * ALFABETO.length)] ?? reserva;
}

export function Gerador() {
  const quadro = useCurrentFrame();
  const segundaRodada = quadro >= gerador.inicioSorteio2 - 2;
  const segmentosCheios = [0, 1, 2, 3, 4].filter((indice) => quadro >= quadroSegmentoMedidor(indice)).length;
  const nivel = Math.max(segmentosCheios, 1);
  const corNivel = cores.forca[nivel - 1] ?? cores.destaque;
  const entropia = Math.round(100 * progresso(quadro, gerador.inicioMedidor, quadroSegmentoMedidor(4) - gerador.inicioMedidor + 2));
  const tempoQuebrar = progresso(quadro, gerador.tempoQuebrar, 14);

  return (
    <CenaDividida
      duracao={cenas.gerador.duracao}
      ladoTexto="esquerda"
      sobretitulo="GERADOR"
      titulo="Senhas que"
      tituloDestaque="ninguém adivinha."
      subtitulo="Cada caractere é sorteado com a aleatoriedade criptográfica do navegador, sem padrões e sem viés."
      inicioTitulo={gerador.titulo}
      inicioCartao={gerador.cartao}
    >
      <Cartao estilo={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: fontes.texto, fontSize: 32, fontWeight: 600, color: cores.texto }}>Sua senha</span>
          <div style={{ display: 'flex', padding: 6, borderRadius: 16, background: cores.superficieSuave, border: `1.5px solid ${cores.borda}` }}>
            {ABAS.map((aba, indice) => (
              <span
                key={aba}
                style={{
                  padding: '10px 24px',
                  borderRadius: 11,
                  fontFamily: fontes.texto,
                  fontSize: 22,
                  fontWeight: indice === 0 ? 600 : 500,
                  color: indice === 0 ? cores.texto : cores.textoSecundario,
                  background: indice === 0 ? cores.fundo : 'transparent',
                }}
              >
                {aba}
              </span>
            ))}
          </div>
        </div>

        <div
          style={{
            padding: '34px 40px',
            borderRadius: 20,
            background: cores.superficieSuave,
            border: `1.5px solid ${cores.borda}`,
            fontFamily: fontes.mono,
            fontSize: 72,
            fontWeight: 500,
            letterSpacing: '0.02em',
            lineHeight: 1.2,
            whiteSpace: 'pre',
          }}
        >
          {(segundaRodada ? SENHA_REGERADA : SENHA_GERADA).split('').map((caractere, indice) => {
            const pousoQuadro = segundaRodada ? quadroSorteio2(indice) : quadroSorteio(indice);
            const definido = quadro >= pousoQuadro;
            const pouso = progresso(quadro, pousoQuadro, 8);
            const visivelAntes = segundaRodada || quadro >= gerador.cartao + 6;
            return (
              <span
                key={indice}
                style={{
                  display: 'inline-block',
                  color: definido ? corDoCaractere(caractere) : cores.textoTerciario,
                  opacity: definido ? 1 : visivelAntes ? 0.45 : 0,
                  transform: definido ? `translateY(${misturar(-10, 0, pouso)}px)` : undefined,
                  textShadow: definido && pouso < 1 ? `0 0 ${24 * (1 - pouso)}px ${cores.destaque}` : undefined,
                }}
              >
                {definido ? caractere : caractereSorteado(`${segundaRodada ? 'b' : 'a'}-${indice}`, quadro, caractere)}
              </span>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: fontes.texto }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 28, fontWeight: 600, color: corNivel }}>
              <ShieldCheck size={30} strokeWidth={2.2} />
              {segmentosCheios === 0 ? 'Calculando…' : rotulosForca[nivel - 1]}
            </span>
            <span style={{ fontFamily: fontes.mono, fontSize: 24, color: cores.textoSecundario }}>{segmentosCheios}/5</span>
          </div>
          <Medidor cor={corNivel} preenchimentos={[0, 1, 2, 3, 4].map((indice) => progresso(quadro, quadroSegmentoMedidor(indice), 8))} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontFamily: fontes.texto }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 20, color: cores.textoTerciario }}>Entropia</span>
            <span style={{ fontFamily: fontes.mono, fontSize: 30, fontWeight: 600, color: cores.texto }}>{entropia} bits</span>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              alignItems: 'flex-end',
              opacity: tempoQuebrar,
              transform: `translateY(${misturar(10, 0, tempoQuebrar)}px)`,
            }}
          >
            <span style={{ fontSize: 20, color: cores.textoTerciario }}>Tempo para quebrar</span>
            <span style={{ fontSize: 30, fontWeight: 600, color: cores.texto }}>Mais que a idade do universo</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <Botao principal estilo={{ minWidth: 200 }}>
            <Copy size={28} strokeWidth={2.2} />
            Copiar
          </Botao>
          <Botao escala={pressao(quadro, gerador.cliqueGerarOutra)}>
            <RefreshCw
              size={26}
              strokeWidth={2.2}
              style={{ transform: `rotate(${progresso(quadro, gerador.cliqueGerarOutra, 20) * 360}deg)` }}
            />
            Gerar outra
          </Botao>
        </div>
      </Cartao>
    </CenaDividida>
  );
}
