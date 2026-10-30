import { ArrowDown, ArrowUp, Info, Plus, Trash2 } from 'lucide-react';
import { BotaoIcone, Painel } from '@/componentes/ui';
import { ATALHOS_CAMPO } from '@/configuracoes/impressao';
import { useFocoAoMover } from '@/ganchos/useFocoAoMover';
import type { CampoCredencial, ContaCredencial } from '@/modelos/impressao';
import { contaVaiParaImpressao } from '@/regras/impressao/selecao';
import { idAdicionarCampo, idTituloConta } from './idsImpressao';
import { LinhaCampo } from './LinhaCampo';
import estilos from './EditorConta.module.css';

interface EditorContaProps {
  conta: ContaCredencial;
  posicao: number;
  total: number;
  linhasParaPreencher: boolean;
  valoresOcultos: boolean;
  aoRenomear: (titulo: string) => void;
  aoMover: (deslocamento: number) => void;
  aoRemover: () => void;
  aoAdicionarCampo: (nome?: string) => void;
  aoAlterarCampo: (campoId: string, alteracao: Partial<Pick<CampoCredencial, 'nome' | 'valor'>>) => void;
  aoMoverCampo: (campoId: string, deslocamento: number) => void;
  aoRemoverCampo: (campoId: string) => void;
  aoGerarSenha: (campo: CampoCredencial) => void;
}

function motivoForaDoPdf(conta: ContaCredencial, linhasParaPreencher: boolean): string {
  if (conta.campos.length === 0) return 'Fora do PDF: adicione um campo com valor.';
  if (linhasParaPreencher) return 'Fora do PDF: preencha um valor ou dê nome a um campo para completar à mão.';
  return 'Fora do PDF: nenhum campo tem valor ainda.';
}

export function EditorConta({
  conta,
  posicao,
  total,
  linhasParaPreencher,
  valoresOcultos,
  aoRenomear,
  aoMover,
  aoRemover,
  aoAdicionarCampo,
  aoAlterarCampo,
  aoMoverCampo,
  aoRemoverCampo,
  aoGerarSenha,
}: EditorContaProps) {
  const nomeConta = conta.titulo.trim() || `conta ${posicao}`;
  const vaiParaPdf = contaVaiParaImpressao(conta, linhasParaPreencher);
  const { acima, abaixo, mover } = useFocoAoMover(aoMover);

  return (
    <Painel como="li" className={estilos.conta} aria-label={`Conta ${posicao} de ${total}: ${nomeConta}`}>
      <div className={estilos.topo}>
        <span className={`${estilos.numero} mono`} aria-hidden="true">
          {String(posicao).padStart(2, '0')}
        </span>
        <div className={estilos.campoTitulo}>
          <input
            id={idTituloConta(conta.id)}
            className={estilos.titulo}
            type="text"
            value={conta.titulo}
            onChange={(evento) => aoRenomear(evento.target.value)}
            placeholder="Nome da conta, como Conta Google"
            aria-label={`Nome da conta ${posicao}`}
            autoComplete="off"
            spellCheck={false}
            data-1p-ignore=""
            data-lpignore="true"
            data-bwignore=""
          />
        </div>
        <div className={estilos.acoesConta}>
          <BotaoIcone
            ref={acima}
            icone={ArrowUp}
            rotulo={`Mover ${nomeConta} para cima`}
            disabled={posicao === 1}
            onClick={() => mover(-1)}
          />
          <BotaoIcone
            ref={abaixo}
            icone={ArrowDown}
            rotulo={`Mover ${nomeConta} para baixo`}
            disabled={posicao === total}
            onClick={() => mover(1)}
          />
          <BotaoIcone icone={Trash2} rotulo={`Excluir ${nomeConta}`} onClick={aoRemover} />
        </div>
      </div>

      {conta.campos.length > 0 ? (
        <>
          <div className={estilos.colunas} aria-hidden="true">
            <span>Nome do campo</span>
            <span>Valor</span>
          </div>
          <ol className={estilos.campos}>
            {conta.campos.map((campo, indice) => (
              <LinhaCampo
                key={campo.id}
                campo={campo}
                posicao={indice + 1}
                total={conta.campos.length}
                nomeConta={nomeConta}
                valoresOcultos={valoresOcultos}
                aoAlterar={(alteracao) => aoAlterarCampo(campo.id, alteracao)}
                aoMover={(deslocamento) => aoMoverCampo(campo.id, deslocamento)}
                aoRemover={() => aoRemoverCampo(campo.id)}
                aoGerarSenha={() => aoGerarSenha(campo)}
              />
            ))}
          </ol>
        </>
      ) : null}

      <div className={estilos.adicionar} role="group" aria-label={`Adicionar campo em ${nomeConta}`}>
        {ATALHOS_CAMPO.map((nome) => (
          <button key={nome} type="button" className={estilos.atalho} onClick={() => aoAdicionarCampo(nome)}>
            <Plus size={14} strokeWidth={2.25} aria-hidden="true" />
            {nome}
          </button>
        ))}
        <button
          id={idAdicionarCampo(conta.id)}
          type="button"
          className={`${estilos.atalho} ${estilos.atalhoLivre}`}
          onClick={() => aoAdicionarCampo()}
        >
          <Plus size={14} strokeWidth={2.25} aria-hidden="true" />
          Outro campo
        </button>
      </div>

      {vaiParaPdf ? null : (
        <p className={estilos.foraDoPdf}>
          <Info size={14} strokeWidth={2} aria-hidden="true" />
          {motivoForaDoPdf(conta, linhasParaPreencher)}
        </p>
      )}
    </Painel>
  );
}
