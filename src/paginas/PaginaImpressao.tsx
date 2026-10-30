import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Eye, EyeOff, FileDown, PencilLine, Plus, Printer, Trash2, Undo2 } from 'lucide-react';
import { EditorConta } from '@/componentes/impressao/EditorConta';
import {
  ID_LISTA_NOMES_CAMPO,
  idAdicionarCampo,
  idNomeCampo,
  idTituloConta,
  idValorCampo,
} from '@/componentes/impressao/idsImpressao';
import { PainelPrevia } from '@/componentes/impressao/PainelPrevia';
import type { EstadoDownload } from '@/componentes/impressao/PainelPrevia';
import { CabecalhoPagina } from '@/componentes/layout/CabecalhoPagina';
import { Botao, CabecalhoPainel, EstadoMensagem, Interruptor, Painel } from '@/componentes/ui';
import { descreverFinalidade, FINALIDADE_PADRAO } from '@/configuracoes/finalidades';
import {
  NOMES_CAMPO_SUGERIDOS,
  SEGUNDOS_PARA_DESFAZER_REMOCAO,
  TAMANHO_MAXIMO_TITULO_DOCUMENTO,
  TITULO_DOCUMENTO_PADRAO,
} from '@/configuracoes/impressao';
import { useDocumentoImpresso } from '@/ganchos/useDocumentoImpresso';
import { useTituloDocumento } from '@/ganchos/useTituloDocumento';
import type { CampoCredencial } from '@/modelos/impressao';
import { useFolhaImpressao } from '@/provedores/ProvedorFolhaImpressao';
import type { RemocaoDesfazivel } from '@/provedores/ProvedorFolhaImpressao';
import { nomeDoArquivo } from '@/regras/impressao/arquivo';
import { gerarSenha } from '@/regras/geradorSenha';
import { CLASSE_CASCATA, comIndice } from '@/utilitarios/cascata';
import { juntarClasses } from '@/utilitarios/juntarClasses';
import estilos from './PaginaImpressao.module.css';

type Vista = 'EDITAR' | 'PREVIA';

const ID_TITULO_DOCUMENTO = 'titulo-do-documento';
const ID_PREVIA = 'previa-do-pdf';
const ID_APAGAR_TUDO = 'apagar-folha';

function focar(id: string, bloco: ScrollLogicalPosition = 'nearest'): void {
  window.requestAnimationFrame(() => {
    const elemento = document.getElementById(id);
    elemento?.focus({ preventScroll: true });
    const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    elemento?.scrollIntoView({ block: bloco, behavior: suave ? 'smooth' : 'auto' });
  });
}

function baixarArquivo(conteudo: Blob, nome: string): void {
  const endereco = URL.createObjectURL(conteudo);
  const link = document.createElement('a');
  link.href = endereco;
  link.download = nome;
  link.rel = 'noopener';
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(endereco), 1000);
}

function descreverRemocao(remocao: RemocaoDesfazivel): string {
  if (remocao.tipo === 'CONTA') {
    const titulo = remocao.conta.titulo.trim();
    return titulo ? `Conta “${titulo}” excluída.` : 'Conta sem nome excluída.';
  }
  const nome = remocao.campo.nome.trim();
  return nome ? `Campo “${nome}” removido.` : 'Campo sem nome removido.';
}

export default function PaginaImpressao() {
  useTituloDocumento('Imprimir credenciais');
  const folhaImpressao = useFolhaImpressao();
  const { folha, remocao, esquecerRemocao, retirarContaEncaminhada } = folhaImpressao;
  const { documento, fase, montarAgora } = useDocumentoImpresso(folha);
  const [valoresOcultos, setValoresOcultos] = useState(false);
  const [vista, setVista] = useState<Vista>('EDITAR');
  const [confirmandoApagar, setConfirmandoApagar] = useState(false);
  const [download, setDownload] = useState<EstadoDownload>({ fase: 'OCIOSO' });
  const [anuncio, setAnuncio] = useState('');

  const totalContas = folha.contas.length;

  useEffect(() => {
    const encaminhada = retirarContaEncaminhada();
    if (!encaminhada) return;
    setAnuncio('A senha entrou numa conta nova no fim da folha. Dê um nome a ela.');
    focar(idTituloConta(encaminhada), 'center');
  }, [retirarContaEncaminhada]);

  useEffect(() => {
    if (!remocao) return undefined;
    const temporizador = window.setTimeout(esquecerRemocao, SEGUNDOS_PARA_DESFAZER_REMOCAO * 1000);
    return () => window.clearTimeout(temporizador);
  }, [esquecerRemocao, remocao]);

  useEffect(() => {
    setDownload((atual) => (atual.fase === 'BAIXADO' || atual.fase === 'FALHOU' ? { fase: 'OCIOSO' } : atual));
  }, [folha]);

  const adicionarConta = () => {
    const conta = folhaImpressao.adicionarConta();
    setConfirmandoApagar(false);
    focar(idTituloConta(conta.id), 'center');
  };

  const adicionarCampo = (contaId: string, nome?: string) => {
    const campo = folhaImpressao.adicionarCampo(contaId, nome);
    focar(nome ? idValorCampo(campo.id) : idNomeCampo(campo.id));
  };

  const moverConta = (contaId: string, deslocamento: number) => {
    const indice = folha.contas.findIndex((conta) => conta.id === contaId);
    const conta = folha.contas[indice];
    const destino = indice + deslocamento;
    if (!conta || destino < 0 || destino >= totalContas) return;
    folhaImpressao.moverConta(contaId, deslocamento);
    setAnuncio(`${conta.titulo.trim() || 'Conta sem nome'} agora é a conta ${destino + 1} de ${totalContas}.`);
  };

  const moverCampo = (contaId: string, campoId: string, deslocamento: number) => {
    const campos = folha.contas.find((conta) => conta.id === contaId)?.campos ?? [];
    const indice = campos.findIndex((campo) => campo.id === campoId);
    const campo = campos[indice];
    const destino = indice + deslocamento;
    if (!campo || destino < 0 || destino >= campos.length) return;
    folhaImpressao.moverCampo(contaId, campoId, deslocamento);
    setAnuncio(`${campo.nome.trim() || 'Campo sem nome'} agora é o campo ${destino + 1} de ${campos.length}.`);
  };

  const removerConta = (contaId: string) => {
    const indice = folha.contas.findIndex((conta) => conta.id === contaId);
    const vizinha = folha.contas[indice + 1] ?? folha.contas[indice - 1];
    folhaImpressao.removerConta(contaId);
    focar(vizinha ? idTituloConta(vizinha.id) : 'adicionar-conta');
  };

  const removerCampo = (contaId: string, campoId: string) => {
    const campos = folha.contas.find((conta) => conta.id === contaId)?.campos ?? [];
    const indice = campos.findIndex((campo) => campo.id === campoId);
    const vizinho = campos[indice + 1] ?? campos[indice - 1];
    folhaImpressao.removerCampo(contaId, campoId);
    focar(vizinho ? idNomeCampo(vizinho.id) : idAdicionarCampo(contaId));
  };

  const gerarSenhaNoCampo = (contaId: string, campo: CampoCredencial) => {
    const valor = gerarSenha(descreverFinalidade(FINALIDADE_PADRAO).opcoes);
    folhaImpressao.alterarCampo(contaId, campo.id, { valor, ...(campo.nome.trim() ? {} : { nome: 'Senha' }) });
    setAnuncio('Senha forte gerada no campo.');
    focar(idValorCampo(campo.id));
  };

  const desfazer = useCallback(() => {
    if (!remocao) return;
    folhaImpressao.desfazerRemocao();
    focar(remocao.tipo === 'CONTA' ? idTituloConta(remocao.conta.id) : idNomeCampo(remocao.campo.id));
  }, [folhaImpressao, remocao]);

  const apagarTudo = () => {
    folhaImpressao.apagarTudo();
    setConfirmandoApagar(false);
    setDownload({ fase: 'OCIOSO' });
    setAnuncio('A folha foi apagada.');
    focar('adicionar-conta');
  };

  const baixar = async () => {
    const atual = montarAgora();
    if (!atual || atual.paginas.length === 0) return;
    setDownload({ fase: 'GERANDO' });
    try {
      const { gerarPdf } = await import('@/componentes/impressao/gerarPdf');
      const conteudo = await gerarPdf(atual);
      const arquivo = nomeDoArquivo(atual.titulo);
      baixarArquivo(conteudo, arquivo);
      setDownload({ fase: 'BAIXADO', arquivo });
    } catch {
      setDownload({ fase: 'FALHOU' });
    }
  };

  const mostrarPrevia = () => {
    setVista('PREVIA');
    focar(ID_PREVIA);
  };

  return (
    <>
      <CabecalhoPagina
        sobretitulo="Impressão"
        titulo="Imprimir credenciais"
        descricao="Organize suas contas numa folha A4 e baixe o PDF para guardar no papel. Tudo é montado neste navegador."
        descricaoLivre
        acoes={
          totalContas > 0 ? (
            <>
              <Botao
                variante="secundario"
                icone={valoresOcultos ? Eye : EyeOff}
                aria-pressed={valoresOcultos}
                onClick={() => setValoresOcultos(!valoresOcultos)}
              >
                {valoresOcultos ? 'Mostrar valores' : 'Ocultar valores'}
              </Botao>
              <Botao
                id={ID_APAGAR_TUDO}
                variante="terciario"
                icone={Trash2}
                aria-expanded={confirmandoApagar}
                onClick={() => setConfirmandoApagar(!confirmandoApagar)}
              >
                Apagar tudo
              </Botao>
            </>
          ) : null
        }
      />

      {confirmandoApagar ? (
        <div className={estilos.confirmar} role="group" aria-labelledby="pergunta-apagar">
          <p id="pergunta-apagar" className={estilos.pergunta}>
            <strong>Apagar a folha inteira?</strong>{' '}
            {totalContas === 1 ? 'A conta e os campos dela somem' : `As ${totalContas} contas e todos os campos somem`} desta
            aba. Um PDF já baixado continua no seu computador.
          </p>
          <div className={estilos.botoesConfirmar}>
            <Botao variante="perigo" icone={Trash2} onClick={apagarTudo}>
              Apagar tudo
            </Botao>
            <Botao
              variante="secundario"
              autoFocus
              onClick={() => {
                setConfirmandoApagar(false);
                focar(ID_APAGAR_TUDO);
              }}
            >
              Cancelar
            </Botao>
          </div>
        </div>
      ) : null}

      <div className={juntarClasses(estilos.alternarVista, CLASSE_CASCATA)} style={comIndice(3)} role="group" aria-label="Mostrar">
        <button
          type="button"
          className={juntarClasses(estilos.opcaoVista, vista === 'EDITAR' && estilos.vistaAtiva)}
          aria-pressed={vista === 'EDITAR'}
          onClick={() => setVista('EDITAR')}
        >
          <PencilLine size={16} strokeWidth={2} aria-hidden="true" />
          Editar
        </button>
        <button
          type="button"
          className={juntarClasses(estilos.opcaoVista, vista === 'PREVIA' && estilos.vistaAtiva)}
          aria-pressed={vista === 'PREVIA'}
          onClick={() => setVista('PREVIA')}
        >
          <FileDown size={16} strokeWidth={2} aria-hidden="true" />
          Prévia e PDF
        </button>
      </div>

      <div className={estilos.grade} data-vista={vista}>
        <div className={estilos.editor}>
          <Painel
            aria-labelledby="titulo-documento-painel"
            className={juntarClasses(estilos.documento, CLASSE_CASCATA)}
            style={comIndice(3)}
          >
            <CabecalhoPainel titulo={<span id="titulo-documento-painel">Documento</span>} />
            <div className={estilos.opcoesDocumento}>
              <div className={estilos.campoTitulo}>
                <label htmlFor={ID_TITULO_DOCUMENTO} className={estilos.rotulo}>
                  Título no topo do PDF
                </label>
                <input
                  id={ID_TITULO_DOCUMENTO}
                  className={estilos.entrada}
                  type="text"
                  value={folha.titulo}
                  onChange={(evento) => folhaImpressao.definirTitulo(evento.target.value)}
                  placeholder={TITULO_DOCUMENTO_PADRAO}
                  maxLength={TAMANHO_MAXIMO_TITULO_DOCUMENTO}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
              <Interruptor
                rotulo="Linhas para preencher à mão"
                descricao="Campos com nome e sem valor saem no PDF como uma linha em branco, para completar com caneta."
                ligado={folha.linhasParaPreencher}
                aoMudar={folhaImpressao.definirLinhasParaPreencher}
              />
            </div>
          </Painel>

          {totalContas === 0 ? (
            <Painel tom="suave" className={CLASSE_CASCATA} style={comIndice(4)}>
              <EstadoMensagem
                icone={Printer}
                nivelTitulo={2}
                titulo="Nenhuma conta na folha ainda"
                descricao="Cada conta vira um cartão no PDF. Dê um nome, como Conta Google, e adicione só os campos de que precisa: e-mail, senha, código de recuperação ou o que quiser."
                acao={
                  <Botao id="adicionar-conta" icone={Plus} onClick={adicionarConta}>
                    Adicionar conta
                  </Botao>
                }
              />
            </Painel>
          ) : (
            <>
              <ol className={juntarClasses(estilos.contas, CLASSE_CASCATA)} style={comIndice(4)} aria-label="Contas da folha">
                {folha.contas.map((conta, indice) => (
                  <EditorConta
                    key={conta.id}
                    conta={conta}
                    posicao={indice + 1}
                    total={totalContas}
                    linhasParaPreencher={folha.linhasParaPreencher}
                    valoresOcultos={valoresOcultos}
                    aoRenomear={(titulo) => folhaImpressao.renomearConta(conta.id, titulo)}
                    aoMover={(deslocamento) => moverConta(conta.id, deslocamento)}
                    aoRemover={() => removerConta(conta.id)}
                    aoAdicionarCampo={(nome) => adicionarCampo(conta.id, nome)}
                    aoAlterarCampo={(campoId, alteracao) => folhaImpressao.alterarCampo(conta.id, campoId, alteracao)}
                    aoMoverCampo={(campoId, deslocamento) => moverCampo(conta.id, campoId, deslocamento)}
                    aoRemoverCampo={(campoId) => removerCampo(conta.id, campoId)}
                    aoGerarSenha={(campo) => gerarSenhaNoCampo(conta.id, campo)}
                  />
                ))}
              </ol>
              <div className={juntarClasses(estilos.fimEditor, CLASSE_CASCATA)} style={comIndice(5)}>
                <Botao id="adicionar-conta" variante="secundario" tamanho="lg" icone={Plus} larguraTotal onClick={adicionarConta}>
                  Adicionar conta
                </Botao>
                <Botao
                  className={estilos.irParaPrevia}
                  tamanho="lg"
                  icone={FileDown}
                  larguraTotal
                  onClick={mostrarPrevia}
                >
                  Ver prévia e baixar o PDF
                </Botao>
              </div>
            </>
          )}
        </div>

        <PainelPrevia
          id={ID_PREVIA}
          className={juntarClasses(estilos.previa, CLASSE_CASCATA)}
          style={comIndice(4)}
          documento={documento}
          fase={fase}
          valoresOcultos={valoresOcultos}
          download={download}
          aoBaixar={() => void baixar()}
        />
      </div>

      <datalist id={ID_LISTA_NOMES_CAMPO}>
        {NOMES_CAMPO_SUGERIDOS.map((nome) => (
          <option key={nome} value={nome} />
        ))}
      </datalist>

      {remocao
        ? createPortal(
            <div className={estilos.desfazer} role="status">
              <span>{descreverRemocao(remocao)}</span>
              <Botao variante="terciario" tamanho="sm" icone={Undo2} className={estilos.botaoDesfazer} onClick={desfazer}>
                Desfazer
              </Botao>
            </div>,
            document.body,
          )
        : null}

      <p className="visualmente-oculto" aria-live="polite">
        {anuncio}
      </p>
    </>
  );
}
