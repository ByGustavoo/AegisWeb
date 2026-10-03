import { ArchiveX, ClipboardX, CloudOff, Cpu, ShieldCheck } from 'lucide-react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { estiloTransicaoCena, misturar, mola, progresso } from '../animacao';
import { Sobretitulo } from '../componentes/Sobretitulo';
import { TextoRevelado } from '../componentes/TextoRevelado';
import { cenas, privacidade } from '../linhaDoTempo';
import { cores, fontes } from '../tema';

const selos = [
  { icone: Cpu, rotulo: 'Processado localmente' },
  { icone: ArchiveX, rotulo: 'Nenhuma senha armazenada' },
  { icone: CloudOff, rotulo: 'Sua senha não sai do aparelho' },
  { icone: ClipboardX, rotulo: 'Área de transferência limpa' },
  { icone: ShieldCheck, rotulo: 'Sem rastreamento' },
];

export function Privacidade() {
  const quadro = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        ...estiloTransicaoCena(quadro, cenas.privacidade.duracao),
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 40,
      }}
    >
      <Sobretitulo texto="PRIVACIDADE" inicio={privacidade.titulo} />
      <TextoRevelado
        inicio={privacidade.titulo + 2}
        intervalo={2}
        trechos={[{ texto: 'Tudo acontece' }, { texto: 'no seu navegador.', cor: cores.destaque }]}
        estilo={{
          fontFamily: fontes.texto,
          fontSize: 104,
          fontWeight: 620,
          letterSpacing: '-0.04em',
          lineHeight: 1.04,
          color: cores.texto,
          textAlign: 'center',
        }}
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 24, maxWidth: 1500, marginTop: 24 }}>
        {selos.map(({ icone: Icone, rotulo }, indice) => {
          const entrada = mola(quadro, privacidade.selos[indice] ?? 0, 170, 15);
          return (
            <span
              key={rotulo}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '20px 30px',
                borderRadius: 999,
                background: cores.superficie,
                border: `1.5px solid ${cores.borda}`,
                fontFamily: fontes.texto,
                fontSize: 28,
                fontWeight: 500,
                color: cores.texto,
                opacity: entrada,
                transform: `translateY(${misturar(40, 0, entrada)}px) scale(${misturar(0.85, 1, entrada)})`,
                boxShadow: '0 24px 48px -24px rgba(0, 0, 0, 0.8)',
              }}
            >
              <span
                style={{
                  display: 'flex',
                  padding: 10,
                  borderRadius: 12,
                  background: cores.destaqueSuave,
                  color: cores.destaque,
                }}
              >
                <Icone size={28} strokeWidth={2.2} />
              </span>
              {rotulo}
            </span>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 16,
          maxWidth: 1200,
          fontFamily: fontes.texto,
          fontSize: 30,
          lineHeight: 1.45,
          textAlign: 'center',
          color: cores.textoSecundario,
          opacity: progresso(quadro, privacidade.rodape, 18),
        }}
      >
        Sem cadastro, sem cookies e sem servidor que possa receber suas senhas. Nada é enviado nem gravado.
      </div>
    </AbsoluteFill>
  );
}
