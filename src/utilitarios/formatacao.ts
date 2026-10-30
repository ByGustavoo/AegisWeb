const formatoData = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

function capitalizar(texto: string): string {
  return texto.charAt(0).toLocaleUpperCase('pt-BR') + texto.slice(1);
}

export function formatarDataLonga(instante: string): string | null {
  const data = new Date(instante);
  if (Number.isNaN(data.getTime())) return null;
  return formatoData
    .formatToParts(data)
    .map((parte) => (parte.type === 'month' ? capitalizar(parte.value) : parte.value))
    .join('');
}

export function formatarVersao(versao: string): string {
  return versao.replace(/^v(?=\d)/i, '');
}
