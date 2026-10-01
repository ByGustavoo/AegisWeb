import { inteiroAleatorio } from './aleatorio';

export const LIMITES_TAMANHO_PIN = { minimo: 4, maximo: 12 } as const;

function todosIguais(digitos: number[]): boolean {
  return digitos.every((digito) => digito === digitos[0]);
}

function emSequencia(digitos: number[]): boolean {
  const passos = digitos.slice(1).map((digito, indice) => digito - (digitos[indice] ?? 0));
  return passos.every((passo) => passo === 1) || passos.every((passo) => passo === -1);
}

export function pinEhObvio(pin: string): boolean {
  const digitos = [...pin].map(Number);
  return todosIguais(digitos) || emSequencia(digitos);
}

export function gerarPin(tamanho: number): string {
  let pin = '';
  do {
    pin = Array.from({ length: tamanho }, () => String(inteiroAleatorio(10))).join('');
  } while (pinEhObvio(pin));
  return pin;
}

export function entropiaPin(tamanho: number): number {
  return tamanho * Math.log2(10);
}
