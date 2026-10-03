import { Check, ClipboardCheck, Copy, History } from 'lucide-react';
import { useCurrentFrame } from 'remotion';
import { misturar, mola } from '../animacao';
import { Cartao } from '../componentes/Cartao';
import { CenaDividida } from '../componentes/CenaDividida';
import { Aviso, Botao, pressao, SenhaColorida } from '../componentes/Interface';
import { cenas, copiar, FRASE_SENHA, QUADROS_POR_SEGUNDO, SENHA_GERADA, SENHA_REGERADA } from '../linhaDoTempo';
import { cores, fontes } from '../tema';

const historico = [
  { senha: SENHA_REGERADA, tipo: 'Senha', hora: '14:32' },
  { senha: FRASE_SENHA, tipo: 'Frase-senha', hora: '14:30' },
  { senha: SENHA_GERADA, tipo: 'Senha', hora: '14:27' },
];
const SEGUNDOS_PARA_LIMPAR = 30;

export function Copiar() {
  const quadro = useCurrentFrame();
  const copiada = quadro >= copiar.clique;
  const aviso = mola(quadro, copiar.aviso, 160, 18);
  const segundosRestantes = Math.max(SEGUNDOS_PARA_LIMPAR - Math.floor(Math.max(quadro - copiar.aviso, 0) / QUADROS_POR_SEGUNDO), 0);

  return (
    <CenaDividida
      duracao={cenas.copiar.duracao}
      ladoTexto="esquerda"
      sobretitulo="CÓPIA SEGURA"
      titulo="Copie sem"
      tituloDestaque="deixar rastro."
      subtitulo="A área de transferência é limpa sozinha depois de 30 segundos. O histórico da sessão vive só na memória da aba."
      inicioTitulo={copiar.titulo}
      inicioCartao={copiar.cartao}
      complemento={
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: 28,
            opacity: aviso,
            transform: `translateY(${misturar(30, 0, aviso)}px) scale(${misturar(0.94, 1, aviso)})`,
          }}
        >
          <Aviso icone={<ClipboardCheck size={26} color={cores.destaque} strokeWidth={2.2} />}>
            Senha copiada. A área de transferência será limpa em{' '}
            <strong style={{ fontFamily: fontes.mono, color: cores.destaque, minWidth: 64, display: 'inline-block' }}>{segundosRestantes} s</strong>
          </Aviso>
        </div>
      }
    >
      <Cartao estilo={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
          <SenhaColorida valor={SENHA_REGERADA} estilo={{ fontSize: 54, fontWeight: 500, letterSpacing: '0.02em' }} />
          <Botao principal escala={pressao(quadro, copiar.clique)} estilo={{ minWidth: 200 }}>
            {copiada ? <Check size={28} strokeWidth={2.6} /> : <Copy size={28} strokeWidth={2.2} />}
            {copiada ? 'Copiada' : 'Copiar'}
          </Botao>
        </div>

        <div style={{ height: 1.5, background: cores.borda }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: fontes.texto, fontSize: 30, fontWeight: 600, color: cores.texto }}>
            <History size={28} strokeWidth={2} color={cores.textoSecundario} />
            Nesta sessão
          </span>
          <span style={{ fontFamily: fontes.texto, fontSize: 21, lineHeight: 1.4, color: cores.textoSecundario }}>
            As últimas 10 senhas que você copiou ficam aqui até fechar ou recarregar a aba. Nada é gravado.
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {historico.map(({ senha, tipo, hora }, indice) => {
            const entrada = mola(quadro, copiar.historico[indice] ?? 0, 150, 17);
            return (
              <div
                key={senha}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  height: 68,
                  padding: '0 20px',
                  borderRadius: 14,
                  background: cores.superficieSuave,
                  border: `1.5px solid ${indice === 0 && copiada ? 'rgba(79, 209, 182, 0.45)' : cores.borda}`,
                  opacity: entrada,
                  transform: `translateY(${misturar(-24, 0, entrada)}px)`,
                }}
              >
                <SenhaColorida valor={senha} estilo={{ fontSize: senha.length > 20 ? 21 : 28, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }} />
                <span style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, fontFamily: fontes.texto, fontSize: 18, color: cores.textoTerciario }}>
                  <span style={{ padding: '4px 10px', borderRadius: 8, background: cores.fundo, color: cores.textoSecundario, fontSize: 16, whiteSpace: 'nowrap' }}>{tipo}</span>
                  <span style={{ fontFamily: fontes.mono }}>{hora}</span>
                  <Copy size={22} strokeWidth={2} color={cores.textoSecundario} />
                </span>
              </div>
            );
          })}
        </div>
      </Cartao>
    </CenaDividida>
  );
}
