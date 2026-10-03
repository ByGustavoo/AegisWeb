import type { ComponentType } from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { Abertura } from './cenas/Abertura';
import { Analisador } from './cenas/Analisador';
import { Copiar } from './cenas/Copiar';
import { Encerramento } from './cenas/Encerramento';
import { Finalidades } from './cenas/Finalidades';
import { Gerador } from './cenas/Gerador';
import { Melhorar } from './cenas/Melhorar';
import { Privacidade } from './cenas/Privacidade';
import { Problema } from './cenas/Problema';
import { Tipos } from './cenas/Tipos';
import { Fundo } from './componentes/Fundo';
import { cenas, ordemCenas } from './linhaDoTempo';
import type { NomeCena } from './linhaDoTempo';

export const ARQUIVO_TRILHA = 'audio/trilha.wav';

const componentesCena: Record<NomeCena, ComponentType> = {
  abertura: Abertura,
  problema: Problema,
  gerador: Gerador,
  tipos: Tipos,
  finalidades: Finalidades,
  copiar: Copiar,
  analisador: Analisador,
  melhorar: Melhorar,
  privacidade: Privacidade,
  encerramento: Encerramento,
};

export function Apresentacao() {
  return (
    <AbsoluteFill>
      <Fundo />
      {ordemCenas.map((nome) => {
        const Cena = componentesCena[nome];
        return (
          <Sequence key={nome} from={cenas[nome].inicio} durationInFrames={cenas[nome].duracao} name={nome}>
            <Cena />
          </Sequence>
        );
      })}
      <Audio src={staticFile(ARQUIVO_TRILHA)} />
    </AbsoluteFill>
  );
}
