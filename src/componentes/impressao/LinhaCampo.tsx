import { useLayoutEffect, useRef } from 'react';
import { ArrowDown, ArrowUp, WandSparkles, X } from 'lucide-react';
import { BotaoIcone } from '@/componentes/ui';
import { useFocoAoMover } from '@/ganchos/useFocoAoMover';
import type { CampoCredencial } from '@/modelos/impressao';
import { juntarClasses } from '@/utilitarios/juntarClasses';
import { ID_LISTA_NOMES_CAMPO, idNomeCampo, idValorCampo } from './idsImpressao';
import estilos from './LinhaCampo.module.css';

interface LinhaCampoProps {
  campo: CampoCredencial;
  posicao: number;
  total: number;
  nomeConta: string;
  valoresOcultos: boolean;
  aoAlterar: (alteracao: Partial<Pick<CampoCredencial, 'nome' | 'valor'>>) => void;
  aoMover: (deslocamento: number) => void;
  aoRemover: () => void;
  aoGerarSenha: () => void;
}

export function LinhaCampo({
  campo,
  posicao,
  total,
  nomeConta,
  valoresOcultos,
  aoAlterar,
  aoMover,
  aoRemover,
  aoGerarSenha,
}: LinhaCampoProps) {
  const valor = useRef<HTMLTextAreaElement>(null);
  const { acima, abaixo, mover } = useFocoAoMover(aoMover);
  const descricao = campo.nome.trim() || `campo ${posicao}`;

  useLayoutEffect(() => {
    const elemento = valor.current;
    if (!elemento || CSS.supports('field-sizing', 'content')) return;
    elemento.style.height = 'auto';
    elemento.style.height = `${elemento.scrollHeight + 2}px`;
  }, [campo.valor, valoresOcultos]);

  return (
    <li className={estilos.campo}>
      <input
        id={idNomeCampo(campo.id)}
        className={estilos.nome}
        type="text"
        value={campo.nome}
        onChange={(evento) => aoAlterar({ nome: evento.target.value })}
        placeholder="Nome do campo"
        aria-label={`Nome do campo ${posicao} de ${nomeConta}`}
        list={ID_LISTA_NOMES_CAMPO}
        autoComplete="off"
        autoCapitalize="sentences"
        spellCheck={false}
        data-1p-ignore=""
        data-lpignore="true"
        data-bwignore=""
      />

      <div className={estilos.molduraValor}>
        <textarea
          ref={valor}
          id={idValorCampo(campo.id)}
          className={juntarClasses(estilos.valor, 'mono', valoresOcultos && estilos.oculto)}
          rows={1}
          value={campo.valor}
          onChange={(evento) => aoAlterar({ valor: evento.target.value })}
          placeholder="Valor"
          aria-label={`Valor de ${descricao}, em ${nomeConta}`}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          translate="no"
          data-1p-ignore=""
          data-lpignore="true"
          data-bwignore=""
        />
        {campo.valor === '' ? (
          <BotaoIcone
            icone={WandSparkles}
            rotulo={`Gerar uma senha forte para ${descricao}`}
            tamanho="sm"
            className={estilos.gerar}
            onClick={aoGerarSenha}
          />
        ) : null}
      </div>

      <div className={estilos.acoes}>
        <BotaoIcone
          ref={acima}
          icone={ArrowUp}
          rotulo={`Mover ${descricao} para cima`}
          tamanho="sm"
          disabled={posicao === 1}
          onClick={() => mover(-1)}
        />
        <BotaoIcone
          ref={abaixo}
          icone={ArrowDown}
          rotulo={`Mover ${descricao} para baixo`}
          tamanho="sm"
          disabled={posicao === total}
          onClick={() => mover(1)}
        />
        <BotaoIcone icone={X} rotulo={`Remover ${descricao}`} tamanho="sm" onClick={aoRemover} />
      </div>
    </li>
  );
}
