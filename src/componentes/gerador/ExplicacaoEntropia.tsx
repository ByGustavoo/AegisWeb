import { DicaInfo } from '@/componentes/ui';
import estilos from './ExplicacaoEntropia.module.css';

const LIMITE_NUMERO_POR_EXTENSO = 1e12;
const BITS_FORA_DE_ALCANCE = 80;

const formatoCompacto = new Intl.NumberFormat('pt-BR', { notation: 'compact', compactDisplay: 'long', maximumFractionDigits: 1 });

function Combinacoes({ bits }: { bits: number }) {
  const total = Math.pow(2, bits);
  if (total < LIMITE_NUMERO_POR_EXTENSO) {
    const texto = formatoCompacto.format(total);
    return (
      <>
        <strong>{texto}</strong>
        {/(ão|ões)$/.test(texto) ? ' de' : ''}
      </>
    );
  }
  return (
    <strong>
      10<sup>{Math.round(bits * Math.log10(2))}</sup>
    </strong>
  );
}

export function ExplicacaoEntropia({ bits, className }: { bits: number; className?: string }) {
  const arredondado = Math.round(bits);

  return (
    <DicaInfo rotulo="O que é entropia?" titulo="O que é entropia?" className={className}>
      <span>
        É a medida de quanto a senha é imprevisível, em bits. Cada bit a mais dobra as combinações que um ataque
        precisa testar.
      </span>
      <span className={estilos.destaque}>
        Esta senha tem <strong>{arredondado} bits</strong>: cerca de <Combinacoes bits={arredondado} /> combinações.
      </span>
      <span>
        Ela cresce com o tamanho e com os tipos de caractere. A partir de {BITS_FORA_DE_ALCANCE} bits, a senha fica fora
        do alcance de ataques práticos.
      </span>
    </DicaInfo>
  );
}
