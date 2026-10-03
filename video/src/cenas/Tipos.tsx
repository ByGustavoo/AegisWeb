import { Hash, KeyRound, Text } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { estiloTransicaoCena, misturar, mola, progresso } from '../animacao';
import { corDoCaractere, Medidor } from '../componentes/Interface';
import { Sobretitulo } from '../componentes/Sobretitulo';
import { TextoRevelado } from '../componentes/TextoRevelado';
import { cenas, FRASE_SENHA, PIN, SENHA_GERADA, tipos } from '../linhaDoTempo';
import { cores, fontes } from '../tema';

interface LinhaTipo {
  icone: LucideIcon;
  rotulo: string;
  descricao: string;
  valor: string;
  tamanhoValor: number;
  nivel: number | null;
  resumo: string;
}

const linhas: LinhaTipo[] = [
  {
    icone: KeyRound,
    rotulo: 'Senha',
    descricao: 'Caracteres aleatórios. A melhor escolha para guardar num gerenciador de senhas.',
    valor: SENHA_GERADA,
    tamanhoValor: 46,
    nivel: 5,
    resumo: 'Muito forte · 100 bits',
  },
  {
    icone: Text,
    rotulo: 'Frase-senha',
    descricao: 'Palavras sorteadas, fáceis de digitar e de lembrar. Boa para a senha mestra.',
    valor: FRASE_SENHA,
    tamanhoValor: 34,
    nivel: 4,
    resumo: 'Forte · 66 bits · 150 anos para quebrar',
  },
  {
    icone: Hash,
    rotulo: 'PIN',
    descricao: 'Só números, para cartões, celulares e cofres. Sequências e repetições ficam de fora.',
    valor: PIN,
    tamanhoValor: 46,
    nivel: null,
    resumo: 'A proteção vem do bloqueio após algumas tentativas erradas',
  },
];

export function Tipos() {
  const quadro = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        ...estiloTransicaoCena(quadro, cenas.tipos.duracao),
        padding: '0 140px',
        justifyContent: 'center',
        gap: 36,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Sobretitulo texto="FORMATOS" inicio={tipos.titulo} />
        <TextoRevelado
          inicio={tipos.titulo + 4}
          intervalo={2}
          trechos={[{ texto: 'Três formatos,' }, { texto: 'um para cada situação.', cor: cores.destaque }]}
          estilo={{ fontFamily: fontes.texto, fontSize: 72, fontWeight: 620, letterSpacing: '-0.035em', lineHeight: 1.05, color: cores.texto }}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {linhas.map((linha, indice) => {
          const inicio = tipos.linhas[indice] ?? 0;
          const entrada = mola(quadro, inicio, 120, 17);
          const caracteres = Math.floor(Math.max(0, quadro - inicio - 4) / tipos.intervaloCaracteres);
          const medidor = progresso(quadro, inicio + 10, 20);
          const cor = linha.nivel ? cores.forca[linha.nivel - 1] ?? cores.destaque : cores.textoSecundario;
          const Icone = linha.icone;
          return (
            <div
              key={linha.rotulo}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 40,
                padding: '26px 36px',
                borderRadius: 24,
                background: cores.superficie,
                border: `1.5px solid ${cores.borda}`,
                opacity: entrada,
                transform: `translateX(${misturar(-60, 0, entrada)}px)`,
                boxShadow: '0 30px 60px -36px rgba(0, 0, 0, 0.8)',
              }}
            >
              <span style={{ display: 'flex', padding: 16, borderRadius: 16, background: cores.destaqueSuave, color: cores.destaque }}>
                <Icone size={36} strokeWidth={2} />
              </span>
              <div style={{ width: 470, display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                <span style={{ fontFamily: fontes.texto, fontSize: 32, fontWeight: 620, color: cores.texto }}>{linha.rotulo}</span>
                <span style={{ fontFamily: fontes.texto, fontSize: 21, lineHeight: 1.4, color: cores.textoSecundario }}>{linha.descricao}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <span style={{ fontFamily: fontes.mono, fontSize: linha.tamanhoValor, fontWeight: 500, whiteSpace: 'pre', lineHeight: 1.2 }}>
                  {linha.valor.split('').map((caractere, posicao) => (
                    <span key={posicao} style={{ color: corDoCaractere(caractere), opacity: posicao < caracteres ? 1 : 0 }}>
                      {caractere}
                    </span>
                  ))}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, opacity: medidor }}>
                  {linha.nivel ? (
                    <div style={{ width: 260 }}>
                      <Medidor
                        altura={10}
                        cor={cor}
                        preenchimentos={[0, 1, 2, 3, 4].map((segmento) => (segmento < (linha.nivel ?? 0) ? progresso(quadro, inicio + 10 + segmento * 3, 8) : 0))}
                      />
                    </div>
                  ) : null}
                  <span style={{ fontFamily: fontes.texto, fontSize: 22, fontWeight: linha.nivel ? 600 : 400, color: cor }}>{linha.resumo}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}
