import { useId, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { juntarClasses } from '@/utilitarios/juntarClasses';
import estilos from './CampoSenha.module.css';

export interface CampoSenhaProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange' | 'autoComplete'> {
  rotulo: string;
  descricao?: string;
  valor: string;
  aoMudar: (valor: string) => void;
}

export function CampoSenha({ rotulo, descricao, valor, aoMudar, id, className, ...resto }: CampoSenhaProps) {
  const idGerado = useId();
  const idCampo = id ?? idGerado;
  const idDescricao = `${idCampo}-descricao`;
  const [visivel, setVisivel] = useState(false);
  const rotuloAlternar = visivel ? 'Ocultar senha' : 'Mostrar senha';

  return (
    <div className={juntarClasses(estilos.campo, className)}>
      <label htmlFor={idCampo} className={estilos.rotulo}>
        {rotulo}
      </label>
      <div className={estilos.moldura}>
        <input
          id={idCampo}
          type={visivel ? 'text' : 'password'}
          value={valor}
          onChange={(evento) => aoMudar(evento.target.value)}
          className={juntarClasses(estilos.entrada, 'mono')}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          data-1p-ignore=""
          data-lpignore="true"
          data-bwignore=""
          aria-describedby={descricao ? idDescricao : undefined}
          {...resto}
        />
        <button
          type="button"
          className={estilos.alternar}
          onClick={() => setVisivel(!visivel)}
          aria-label={rotuloAlternar}
          aria-pressed={visivel}
          aria-controls={idCampo}
          title={rotuloAlternar}
        >
          {visivel ? <EyeOff size={18} strokeWidth={2} aria-hidden="true" /> : <Eye size={18} strokeWidth={2} aria-hidden="true" />}
        </button>
      </div>
      {descricao ? (
        <p id={idDescricao} className={estilos.descricao}>
          {descricao}
        </p>
      ) : null}
    </div>
  );
}
