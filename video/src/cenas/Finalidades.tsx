import { Briefcase, Gamepad2, Landmark, Lightbulb, Mail, Sparkles, Wifi } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useCurrentFrame } from 'remotion';
import { misturar, progresso } from '../animacao';
import { Cartao } from '../componentes/Cartao';
import { CenaDividida } from '../componentes/CenaDividida';
import { corDoCaractere, Interruptor, Medidor } from '../componentes/Interface';
import { cenas, finalidades } from '../linhaDoTempo';
import { cores, fontes, rotulosForca } from '../tema';

type Finalidade = 'GERAL' | 'BANCO' | 'EMAIL' | 'TRABALHO' | 'GAMES' | 'WIFI';

const opcoesFinalidade: { finalidade: Finalidade; rotulo: string; icone: LucideIcon }[] = [
  { finalidade: 'GERAL', rotulo: 'Uso geral', icone: Sparkles },
  { finalidade: 'BANCO', rotulo: 'Banco', icone: Landmark },
  { finalidade: 'EMAIL', rotulo: 'E-mail', icone: Mail },
  { finalidade: 'TRABALHO', rotulo: 'Trabalho', icone: Briefcase },
  { finalidade: 'GAMES', rotulo: 'Games', icone: Gamepad2 },
  { finalidade: 'WIFI', rotulo: 'Wi-Fi', icone: Wifi },
];

interface Predefinicao {
  tamanho: number;
  interruptores: [number, number, number, number, number];
  dica: string;
  exemplo: string;
  nivel: number;
  bits: number;
}

const predefinicoes: Partial<Record<Finalidade, Predefinicao>> = {
  GERAL: {
    tamanho: 16,
    interruptores: [1, 1, 1, 1, 0],
    dica: 'Equilíbrio entre força e compatibilidade. Serve para a maioria dos sites.',
    exemplo: 'u-97XYIEp@VL4&Ut',
    nivel: 5,
    bits: 100,
  },
  BANCO: {
    tamanho: 12,
    interruptores: [1, 1, 1, 0, 1],
    dica: 'Muitos bancos recusam símbolos e limitam o tamanho. Confira a regra do seu.',
    exemplo: 'Tq7hKa3WmEx9',
    nivel: 4,
    bits: 68,
  },
  WIFI: {
    tamanho: 20,
    interruptores: [1, 1, 1, 0, 1],
    dica: 'Fácil de digitar na TV e no celular. O WPA2 aceita de 8 a 63 caracteres.',
    exemplo: 'Rk4eTz9mWq7HcXa2nPdJ',
    nivel: 5,
    bits: 114,
  },
};

const rotulosInterruptores = ['Letras maiúsculas', 'Letras minúsculas', 'Números', 'Símbolos', 'Excluir ambíguos'];
const TAMANHO_MINIMO = 8;
const TAMANHO_MAXIMO = 64;

function predefinicaoDe(finalidade: Finalidade): Predefinicao {
  const encontrada = predefinicoes[finalidade];
  if (!encontrada) throw new Error(`Sem predefinição para ${finalidade}`);
  return encontrada;
}

export function Finalidades() {
  const quadro = useCurrentFrame();
  const indiceAtual = finalidades.selecoes.reduce((atual, selecao, indice) => (quadro >= selecao.quadro ? indice : atual), 0);
  const atual = finalidades.selecoes[indiceAtual] ?? finalidades.selecoes[0];
  const anterior = finalidades.selecoes[Math.max(indiceAtual - 1, 0)] ?? atual;
  const transicao = indiceAtual === 0 ? 1 : progresso(quadro, atual.quadro, 12);
  const de = predefinicaoDe(anterior.finalidade);
  const para = predefinicaoDe(atual.finalidade);
  const tamanho = Math.round(misturar(de.tamanho, para.tamanho, transicao));
  const trocaTexto = indiceAtual === 0 ? 1 : progresso(quadro, atual.quadro + 2, 10);
  const cliqueEscala = indiceAtual === 0 ? 1 : 1 - 0.05 * Math.sin(Math.PI * progresso(quadro, atual.quadro, 6, (t) => t));
  const corNivel = cores.forca[para.nivel - 1] ?? cores.destaque;

  return (
    <CenaDividida
      duracao={cenas.finalidades.duracao}
      ladoTexto="esquerda"
      sobretitulo="FINALIDADES"
      titulo="Pronta para"
      tituloDestaque="cada uso."
      subtitulo="Escolha para que é a senha e o Aegis ajusta tamanho e caracteres. Banco sem símbolos, Wi-Fi fácil de digitar na TV, e-mail com o máximo de força."
      inicioTitulo={finalidades.titulo}
      inicioCartao={finalidades.cartao}
    >
      <Cartao estilo={{ display: 'flex', flexDirection: 'column', gap: 26, padding: 40 }}>
        <span style={{ fontFamily: fontes.texto, fontSize: 26, fontWeight: 600, color: cores.texto }}>Para que é a senha?</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: -8 }}>
          {opcoesFinalidade.map(({ finalidade, rotulo, icone: Icone }) => {
            const selecionada = finalidade === atual.finalidade;
            return (
              <span
                key={finalidade}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  height: 64,
                  borderRadius: 14,
                  fontFamily: fontes.texto,
                  fontSize: 23,
                  fontWeight: selecionada ? 600 : 500,
                  color: selecionada ? cores.destaque : cores.textoSecundario,
                  background: selecionada ? cores.destaqueSuave : 'transparent',
                  border: `2px solid ${selecionada ? cores.destaque : cores.borda}`,
                  transform: selecionada ? `scale(${cliqueEscala})` : undefined,
                  boxShadow: selecionada ? `0 0 0 ${misturar(10, 0, transicao)}px rgba(79, 209, 182, ${0.25 * (1 - transicao)})` : undefined,
                }}
              >
                <Icone size={24} strokeWidth={2} />
                {rotulo}
              </span>
            );
          })}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '16px 20px',
            borderRadius: 14,
            background: cores.superficieSuave,
            fontFamily: fontes.texto,
            fontSize: 22,
            color: cores.textoSecundario,
          }}
        >
          <Lightbulb size={24} color={cores.forca[2]} strokeWidth={2} style={{ flexShrink: 0 }} />
          <span style={{ opacity: trocaTexto, transform: `translateY(${misturar(8, 0, trocaTexto)}px)` }}>{para.dica}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, padding: '18px 24px', borderRadius: 16, border: `1.5px solid ${cores.borda}` }}>
          <span style={{ fontFamily: fontes.mono, fontSize: 36, fontWeight: 500, whiteSpace: 'pre', opacity: trocaTexto }}>
            {para.exemplo.split('').map((caractere, indice) => (
              <span key={indice} style={{ color: corDoCaractere(caractere) }}>
                {caractere}
              </span>
            ))}
          </span>
          <div style={{ width: 200, display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
            <span style={{ fontFamily: fontes.texto, fontSize: 20, fontWeight: 600, color: corNivel, textAlign: 'right' }}>
              {rotulosForca[para.nivel - 1]} · {para.bits} bits
            </span>
            <Medidor altura={8} cor={corNivel} preenchimentos={[0, 1, 2, 3, 4].map((indice) => (indice < para.nivel ? 1 : 0))} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: fontes.texto }}>
            <span style={{ fontSize: 24, fontWeight: 600, color: cores.texto }}>Tamanho</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 20, color: cores.textoTerciario }}>
              <span
                style={{
                  minWidth: 64,
                  padding: '6px 12px',
                  borderRadius: 10,
                  border: `1.5px solid ${cores.bordaForte}`,
                  fontFamily: fontes.mono,
                  fontSize: 24,
                  color: cores.texto,
                  textAlign: 'center',
                }}
              >
                {tamanho}
              </span>
              caracteres
            </span>
          </div>
          <div style={{ position: 'relative', height: 24, display: 'flex', alignItems: 'center' }}>
            <div style={{ position: 'absolute', left: 0, right: 0, height: 8, borderRadius: 4, background: cores.forcaVazia }} />
            <div
              style={{
                position: 'absolute',
                left: 0,
                width: `${((misturar(de.tamanho, para.tamanho, transicao) - TAMANHO_MINIMO) / (TAMANHO_MAXIMO - TAMANHO_MINIMO)) * 100}%`,
                height: 8,
                borderRadius: 4,
                background: cores.destaque,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: `calc(${((misturar(de.tamanho, para.tamanho, transicao) - TAMANHO_MINIMO) / (TAMANHO_MAXIMO - TAMANHO_MINIMO)) * 100}% - 12px)`,
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: cores.fundo,
                border: `4px solid ${cores.destaque}`,
              }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 40px' }}>
          {rotulosInterruptores.map((rotulo, indice) => (
            <div key={rotulo} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: fontes.texto, fontSize: 22, color: cores.texto }}>
              {rotulo}
              <Interruptor ligado={misturar(de.interruptores[indice] ?? 0, para.interruptores[indice] ?? 0, transicao)} />
            </div>
          ))}
        </div>
      </Cartao>
    </CenaDividida>
  );
}
