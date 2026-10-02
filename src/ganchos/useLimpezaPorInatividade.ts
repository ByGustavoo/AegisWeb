import { useEffect, useRef } from 'react';

const EVENTOS_DE_USO = ['pointerdown', 'keydown', 'input', 'wheel', 'touchstart'] as const;

export function useLimpezaPorInatividade(ativo: boolean, milissegundos: number, aoExpirar: () => void) {
  const expirar = useRef(aoExpirar);

  useEffect(() => {
    expirar.current = aoExpirar;
  }, [aoExpirar]);

  useEffect(() => {
    if (!ativo) return undefined;

    let temporizador = window.setTimeout(() => expirar.current(), milissegundos);
    const reiniciar = () => {
      window.clearTimeout(temporizador);
      temporizador = window.setTimeout(() => expirar.current(), milissegundos);
    };

    EVENTOS_DE_USO.forEach((evento) => window.addEventListener(evento, reiniciar, { capture: true, passive: true }));
    return () => {
      window.clearTimeout(temporizador);
      EVENTOS_DE_USO.forEach((evento) => window.removeEventListener(evento, reiniciar, { capture: true }));
    };
  }, [ativo, milissegundos]);
}
