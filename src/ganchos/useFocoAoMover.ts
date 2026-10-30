import { useRef } from 'react';

export function useFocoAoMover(aoMover: (deslocamento: number) => void) {
  const acima = useRef<HTMLButtonElement>(null);
  const abaixo = useRef<HTMLButtonElement>(null);

  const mover = (deslocamento: number) => {
    aoMover(deslocamento);
    window.requestAnimationFrame(() => {
      const [preferido, alternativo] = deslocamento < 0 ? [acima, abaixo] : [abaixo, acima];
      const alvo = preferido.current && !preferido.current.disabled ? preferido.current : alternativo.current;
      alvo?.focus();
    });
  };

  return { acima, abaixo, mover };
}
