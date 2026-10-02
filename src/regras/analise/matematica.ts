export function combinacoes(n: number, k: number): number {
  if (k > n || k < 0) return 0;
  if (k === 0) return 1;
  let resultado = 1;
  for (let i = 1; i <= k; i += 1) {
    resultado = (resultado * (n - k + i)) / i;
  }
  return resultado;
}

export function fatorial(n: number): number {
  let resultado = 1;
  for (let i = 2; i <= n; i += 1) resultado *= i;
  return resultado;
}

export function somaCombinacoes(total: number, ate: number): number {
  let soma = 0;
  for (let i = 1; i <= ate; i += 1) soma += combinacoes(total, i);
  return soma;
}
