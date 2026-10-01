import { useId } from 'react';
import { Lightbulb } from 'lucide-react';
import { Selo } from '@/componentes/ui';
import { descreverFinalidade, finalidades } from '@/configuracoes/finalidades';
import type { EstadoFinalidade } from '@/ganchos/useGerador';
import type { Finalidade } from '@/modelos/senha';
import { juntarClasses } from '@/utilitarios/juntarClasses';
import estilos from './EscolhaFinalidade.module.css';

interface EscolhaFinalidadeProps {
  estado: EstadoFinalidade;
  aoEscolher: (finalidade: Finalidade) => void;
}

export function EscolhaFinalidade({ estado, aoEscolher }: EscolhaFinalidadeProps) {
  const nome = useId();
  const { dica, rotulo } = descreverFinalidade(estado.base);

  return (
    <fieldset className={estilos.grupo} aria-describedby={`${nome}-dica`}>
      <legend className={estilos.legenda}>
        <span>Para que é a senha?</span>
        {estado.personalizada ? (
          <Selo tom="info" titulo="Você ajustou as opções recomendadas">
            Personalizado
          </Selo>
        ) : null}
      </legend>

      <div className={estilos.opcoes}>
        {finalidades.map(({ finalidade, rotulo: rotuloOpcao, icone: Icone }) => {
          const selecionada = estado.base === finalidade && !estado.personalizada;
          const base = estado.base === finalidade && estado.personalizada;
          return (
            <label
              key={finalidade}
              className={juntarClasses(estilos.opcao, selecionada && estilos.selecionada, base && estilos.base)}
            >
              <input
                type="radio"
                name={nome}
                value={finalidade}
                checked={estado.base === finalidade}
                onChange={() => aoEscolher(finalidade)}
                onClick={() => {
                  if (estado.base === finalidade && estado.personalizada) aoEscolher(finalidade);
                }}
                className={estilos.entrada}
              />
              <Icone size={18} strokeWidth={2} aria-hidden="true" className={estilos.icone} />
              <span className={estilos.rotulo}>{rotuloOpcao}</span>
            </label>
          );
        })}
      </div>

      <p id={`${nome}-dica`} className={estilos.dica} aria-live="polite">
        <Lightbulb size={16} strokeWidth={2} aria-hidden="true" className={estilos.iconeDica} />
        <span>
          {estado.personalizada ? (
            <>
              Baseado em <strong>{rotulo}</strong>, com ajustes seus. Toque em {rotulo} para voltar ao recomendado.
            </>
          ) : (
            dica
          )}
        </span>
      </p>
    </fieldset>
  );
}
