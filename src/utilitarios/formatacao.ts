const formatoData = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

export function formatarDataLonga(instante: string | null): string | null {
  if (!instante) return null;
  const data = new Date(instante);
  return Number.isNaN(data.getTime()) ? null : formatoData.format(data);
}

export function formatarVersao(versao: string | null): string {
  if (!versao) return 'Desenvolvimento';
  return /^\d/.test(versao) ? `v${versao}` : versao;
}
