import { ESTILOS_TEXTO, FONTES_IMPRESSAO } from '@/configuracoes/impressao';
import type { MedirTexto } from '@/modelos/impressao';

const TAMANHO_DE_MEDICAO = 100;
const AMOSTRA_DE_CARREGAMENTO = 'AaÁçÕé0@#';
const LIMITE_DO_CACHE = 4000;

let medidor: Promise<MedirTexto> | null = null;

function fonteCanvas(familia: string, peso: number): string {
  return `${peso} ${TAMANHO_DE_MEDICAO}px "${familia}"`;
}

async function criarMedidor(): Promise<MedirTexto> {
  const fontes = Object.values(FONTES_IMPRESSAO);
  await Promise.all(
    fontes.map(({ familiaNavegador, peso }) => document.fonts.load(fonteCanvas(familiaNavegador, peso), AMOSTRA_DE_CARREGAMENTO)),
  );

  const contexto = document.createElement('canvas').getContext('2d');
  if (!contexto) throw new Error('O navegador não ofereceu um canvas para medir o texto.');
  if ('fontKerning' in contexto) contexto.fontKerning = 'none';

  const avancoMono = new Map<string, number>();
  const cache = new Map<string, number>();

  const medirNaFonte = (texto: string, familia: string, peso: number) => {
    contexto.font = fonteCanvas(familia, peso);
    return contexto.measureText(texto).width / TAMANHO_DE_MEDICAO;
  };

  return (texto, estilo) => {
    const { fonte, tamanho, espacamentoLetras } = ESTILOS_TEXTO[estilo];
    const { familiaNavegador, peso, monoespacada } = FONTES_IMPRESSAO[fonte];
    const caracteres = Array.from(texto).length;
    const espacamento = caracteres * espacamentoLetras;

    if (monoespacada) {
      let avanco = avancoMono.get(familiaNavegador);
      if (avanco === undefined) {
        avanco = medirNaFonte('0', familiaNavegador, peso);
        avancoMono.set(familiaNavegador, avanco);
      }
      return caracteres * avanco * tamanho + espacamento;
    }

    const chave = `${estilo}\u0000${texto}`;
    const guardada = cache.get(chave);
    if (guardada !== undefined) return guardada;
    if (cache.size > LIMITE_DO_CACHE) cache.clear();
    const largura = medirNaFonte(texto, familiaNavegador, peso) * tamanho + espacamento;
    cache.set(chave, largura);
    return largura;
  };
}

export function obterMedidorNavegador(): Promise<MedirTexto> {
  medidor ??= criarMedidor().catch((erro: unknown) => {
    medidor = null;
    throw erro;
  });
  return medidor;
}
