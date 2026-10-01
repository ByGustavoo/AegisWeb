/// <reference types="vite/client" />

interface ConfiguracaoExecucaoAegis {
  readonly versao?: string;
  readonly dataLancamento?: string;
}

interface Window {
  __AEGIS_CONFIG__?: ConfiguracaoExecucaoAegis;
}

declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}
