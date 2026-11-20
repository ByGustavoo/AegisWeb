import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Eye, EyeOff, FileDown, FileUp, PencilLine, Plus, Printer, Trash2, Undo2 } from 'lucide-react';
import { EditorConta } from '@/componentes/impressao/EditorConta';
import { ImportarSenhas } from '@/componentes/impressao/ImportarSenhas';
import {
  ID_LISTA_NOMES_CAMPO,
  idAdicionarCampo,
  idNomeCampo,
  idTituloConta,
  idValorCampo,
} from '@/componentes/impressao/idsImpressao';
import { PainelPrevia } from '@/componentes/impressao/PainelPrevia';
import { CabecalhoPagina } from '@/componentes/layout/CabecalhoPagina';
import { Botao, CabecalhoPainel, EstadoMensagem, Interruptor, Painel } from '@/componentes/ui';
import { descreverFinalidade, FINALIDADE_PADRAO } from '@/configuracoes/finalidades';
import {
  NOMES_CAMPO_SUGERIDOS,
  SEGUNDOS_PARA_AVISO_IMPORTACAO,
  SEGUNDOS_PARA_DESFAZER_REMOCAO,
  TAMANHO_MAXIMO_TITULO_DOCUMENTO,
  TITULO_DOCUMENTO_PADRAO,
} from '@/configuracoes/impressao';
import { useDocumentoImpresso } from '@/ganchos/useDocumentoImpresso';
import { useTituloDocumento } from '@/ganchos/useTituloDocumento';
import type { CampoCredencial, ContaImportada } from '@/modelos/impressao';
import { useFolhaImpressao } from '@/provedores/ProvedorFolhaImpressao';
import type { RemocaoDesfazivel } from '@/provedores/ProvedorFolhaImpressao';
import { useNotificacoes } from '@/provedores/ProvedorNotificacoes';
import { nomeDoArquivo } from '@/regras/impressao/arquivo';
import { chaveDaConta } from '@/regras/impressao/importacaoCsv';
import { gerarSenha } from '@/regras/geradorSenha';
import { CLASSE_CASCATA, comIndice } from '@/utilitarios/cascata';
import { juntarClasses } from '@/utilitarios/juntarClasses';
import estilos from './PaginaImpressao.module.css';

type Vista = 'EDITAR' | 'PREVIA';

const ID_TITULO_DOCUMENTO = 'titulo-do-documento';
const ID_PREVIA = 'previa-do-pdf';
const ID_APAGAR_TUDO = 'apagar-folha';
const ID_ADICIONAR_CONTA = 'adicionar-conta';

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
    return titulo ? `Conta “${titulo}” excluída` : 'Conta sem nome excluída';
  }
  const nome = remocao.campo.nome.trim();
  return nome ? `Campo “${nome}” removido` : 'Campo sem nome removido';
}

function descreverImportacao(total: number): string {
  return total === 1 ? '1 conta entrou na folha' : `${total} contas entraram na folha`;
}

export default function PaginaImpressao() {
  useTituloDocumento('Imprimir credenciais');
  const folhaImpressao = useFolhaImpressao();
  const { folha, remocao, esquecerRemocao, retirarContaEncaminhada } = folhaImpressao;
  const { documento, fase, montarAgora } = useDocumentoImpresso(folha);
  const { notificar, dispensar, dispensarTodas } = useNotificacoes();
  const [valoresOcultos, setValoresOcultos] = useState(false);
  const [vista, setVista] = useState<Vista>('EDITAR');
  const [confirmandoApagar, setConfirmandoApagar] = useState(false);
  const [gerandoPdf, setGerandoPdf] = useState(false);
  const [anuncio, setAnuncio] = useState('');
  const [importando, setImportando] = useState(false);
  const contaParaFocar = useRef<string | null>(null);
  const avisoRemocao = useRef<string | null>(null);

  const totalContas = folha.contas.length;
  const chavesNaFolha = useMemo(() => new Set(folha.contas.map(chaveDaConta)), [folha.contas]);

  useEffect(() => {
    const encaminhada = retirarContaEncaminhada();
    if (!encaminhada) return;
    setAnuncio('A senha entrou numa conta nova no fim da folha. Dê um nome a ela.');
    focar(idTituloConta(encaminhada), 'center');
  }, [retirarContaEncaminhada]);

  const desfazerRemocao = (alvo: RemocaoDesfazivel) => {
    folhaImpressao.desfazerRemocao();
    focar(alvo.tipo === 'CONTA' ? idTituloConta(alvo.conta.id) : idNomeCampo(alvo.campo.id));
  };
  const desfazerRemocaoAtual = useRef(desfazerRemocao);
  desfazerRemocaoAtual.current = desfazerRemocao;

  useEffect(() => {
    if (avisoRemocao.current) {
      dispensar(avisoRemocao.current);
      avisoRemocao.current = null;
    }
    if (!remocao) return;
    avisoRemocao.current = notificar({
      titulo: descreverRemocao(remocao),
      variante: 'INFO',
      duracao: SEGUNDOS_PARA_DESFAZER_REMOCAO * 1000,
      acao: { rotulo: 'Desfazer', icone: Undo2, aoAcionar: () => desfazerRemocaoAtual.current(remocao) },
      aoSair: () => esquecerRemocao(remocao),
    });
  }, [dispensar, esquecerRemocao, notificar, remocao]);

  const adicionarConta = () => {
    const conta = folhaImpressao.adicionarConta();
    setConfirmandoApagar(false);
    focar(idTituloConta(conta.id), 'center');
  };

  const abrirImportacao = () => {
    dispensarTodas();
    esquecerRemocao();
    setImportando(true);
  };

  const desfazerImportacao = (ids: string[]) => {
    folhaImpressao.desfazerImportacao(ids);
    setAnuncio(ids.length === 1 ? 'A conta importada saiu da folha.' : 'As contas importadas saíram da folha.');
    focar(ID_ADICIONAR_CONTA);
  };

  const importarContas = (contas: ContaImportada[]) => {
    const novas = folhaImpressao.importarContas(contas.map(({ titulo, campos }) => ({ titulo, campos })));
    const ids = novas.map((conta) => conta.id);
    esquecerRemocao();
    setConfirmandoApagar(false);
    setVista('EDITAR');
    setImportando(false);
    contaParaFocar.current = ids[0] ?? null;
    notificar({
      titulo: descreverImportacao(novas.length),
      descricao: 'Apague o arquivo .csv do computador, pois ele guarda as senhas sem proteção.',
      variante: 'SUCESSO',
      duracao: SEGUNDOS_PARA_AVISO_IMPORTACAO * 1000,
      acao: { rotulo: 'Desfazer', icone: Undo2, aoAcionar: () => desfazerImportacao(ids) },
    });
  };

  const focarContaImportada = useCallback(() => {
    const id = contaParaFocar.current;
    contaParaFocar.current = null;
    if (!id) return false;
    focar(idTituloConta(id), 'center');
    return true;
  }, []);

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
    focar(vizinha ? idTituloConta(vizinha.id) : ID_ADICIONAR_CONTA);
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

  const apagarTudo = () => {
    folhaImpressao.apagarTudo();
    dispensarTodas();
    setConfirmandoApagar(false);
    setAnuncio('A folha foi apagada.');
    focar(ID_ADICIONAR_CONTA);
  };

  const baixar = async () => {
    const atual = montarAgora();
    if (!atual || atual.paginas.length === 0) return;
    setGerandoPdf(true);
    try {
      const { gerarPdf } = await import('@/componentes/impressao/gerarPdf');
      const conteudo = await gerarPdf(atual);
      const arquivo = nomeDoArquivo(atual.titulo);
      baixarArquivo(conteudo, arquivo);
      notificar({
        titulo: 'PDF baixado',
        descricao: `${arquivo} está na pasta de downloads. Guarde em local seguro e apague depois de imprimir.`,
        variante: 'SUCESSO',
      });
    } catch {
      notificar({
        titulo: 'Não foi possível gerar o PDF',
        descricao: 'As fontes do documento não carregaram. Confira a conexão e tente de novo.',
        variante: 'ERRO',
      });
    } finally {
      setGerandoPdf(false);
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
              <Botao variante="secundario" icone={FileUp} onClick={abrirImportacao}>
                Importar do navegador
              </Botao>
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
                className="botao-fechar"
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
                descricao="Cada conta vira um cartão no PDF. Adicione uma por uma ou traga de uma vez as senhas salvas no navegador, pelo arquivo .csv da exportação."
                acao={
                  <div className={estilos.acoesVazio}>
                    <Botao id={ID_ADICIONAR_CONTA} icone={Plus} onClick={adicionarConta}>
                      Adicionar conta
                    </Botao>
                    <Botao variante="secundario" icone={FileUp} onClick={abrirImportacao}>
                      Importar do navegador
                    </Botao>
                  </div>
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
                <Botao id={ID_ADICIONAR_CONTA} variante="secundario" tamanho="lg" icone={Plus} larguraTotal onClick={adicionarConta}>
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
          gerando={gerandoPdf}
          aoBaixar={() => void baixar()}
        />
      </div>

      <datalist id={ID_LISTA_NOMES_CAMPO}>
        {NOMES_CAMPO_SUGERIDOS.map((nome) => (
          <option key={nome} value={nome} />
        ))}
      </datalist>

      <ImportarSenhas
        aberto={importando}
        aoFechar={() => setImportando(false)}
        chavesNaFolha={chavesNaFolha}
        aoImportar={importarContas}
        assumirFocoAoFechar={focarContaImportada}
      />

      <p className="visualmente-oculto" aria-live="polite">
        {anuncio}
      </p>
    </>
  );
}
