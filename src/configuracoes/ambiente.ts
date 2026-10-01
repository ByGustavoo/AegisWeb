const configuracaoExecucao = typeof window === 'undefined' ? undefined : window.__AEGIS_CONFIG__;

export const ambiente = {
  versao: configuracaoExecucao?.versao || null,
  dataLancamento: configuracaoExecucao?.dataLancamento || null,
  desenvolvimento: import.meta.env.DEV,
} as const;
