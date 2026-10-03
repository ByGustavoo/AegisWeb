export const cores = {
  fundo: '#0b0e10',
  superficie: '#13171a',
  superficieSuave: '#1a1f23',
  borda: '#242a2f',
  bordaForte: '#353c43',
  texto: '#e8ecee',
  textoSecundario: '#a4adb4',
  textoTerciario: '#88919a',
  destaque: '#4fd1b6',
  destaqueForte: '#7adfc9',
  destaqueSuave: '#10272a',
  destaqueContraste: '#04201b',
  marcaFundo: '#12806e',
  marcaTraco: '#ffffff',
  numero: '#7fb0ff',
  simbolo: '#c9a2ff',
  forca: ['#ff7666', '#ffa05c', '#efc152', '#8fd46a', '#4fd1b6'],
  forcaSuave: ['#37191a', '#33210f', '#2e2512', '#182a12', '#10272a'],
  forcaVazia: '#262c31',
  linhaEscudo: '#353c43',
} as const;

export const fontes = {
  texto: "'Geist', system-ui, sans-serif",
  mono: "'Geist Mono', ui-monospace, monospace",
} as const;

export const rotulosForca = ['Muito fraca', 'Fraca', 'Razoável', 'Forte', 'Muito forte'] as const;
