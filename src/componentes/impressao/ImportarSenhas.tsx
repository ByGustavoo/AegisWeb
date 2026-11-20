import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { ChevronRight, FileUp, FileWarning, KeyRound, Lock, Search, SearchX, X } from 'lucide-react';
import { Botao, BotaoIcone, CaixaMarcacao, EstadoMensagem, Modal, Nota, Selo } from '@/componentes/ui';
import {
  NOME_ORIGEM_EXPORTACAO,
  ORIGENS_EXPORTACAO,
  TAMANHO_MAXIMO_ARQUIVO_IMPORTACAO,
} from '@/configuracoes/impressao';
import type { ContaImportada, MotivoFalhaImportacao, ResultadoImportacao } from '@/modelos/impressao';
import { interpretarExportacao } from '@/regras/impressao/importacaoCsv';
import { juntarClasses } from '@/utilitarios/juntarClasses';
import estilos from './ImportarSenhas.module.css';

type Leitura = Extract<ResultadoImportacao, { tipo: 'LIDO' }>;

interface ImportarSenhasProps {
  aberto: boolean;
  aoFechar: () => void;
  chavesNaFolha: ReadonlySet<string>;
  aoImportar: (contas: ContaImportada[]) => void;
  assumirFocoAoFechar?: () => boolean;
}

const ESPERA_PARA_ESQUECER_MS = 250;
const ALTURA_MINIMA_LISTA_PX = 144;
const TAMANHO_MAXIMO_EM_MB = Math.round(TAMANHO_MAXIMO_ARQUIVO_IMPORTACAO / (1024 * 1024));

const FALHAS: Record<MotivoFalhaImportacao, { titulo: string; descricao: string }> = {
  NAO_E_CSV: {
    titulo: 'Este arquivo não é um .csv',
    descricao: 'Os navegadores exportam as senhas num arquivo .csv. Escolha o arquivo baixado na exportação.',
  },
  GRANDE_DEMAIS: {
    titulo: `O arquivo passa de ${TAMANHO_MAXIMO_EM_MB} MB`,
    descricao: 'Uma exportação de senhas costuma ter poucos KB. Confira se escolheu o arquivo certo.',
  },
  VAZIO: {
    titulo: 'O arquivo está vazio',
    descricao: 'Exporte as senhas de novo no navegador e escolha o arquivo baixado.',
  },
  SEM_COLUNA_SENHA: {
    titulo: 'Este .csv não parece uma exportação de senhas',
    descricao: 'Nenhuma coluna se chama password ou senha. Escolha o arquivo que o navegador gerou ao exportar as senhas.',
  },
  SEM_CONTAS: {
    titulo: 'Nenhuma conta no arquivo',
    descricao: 'O arquivo tem o cabeçalho, mas nenhuma linha com usuário ou senha.',
  },
  ILEGIVEL: {
    titulo: 'Não foi possível ler o arquivo',
    descricao: 'Ele pode ter sido movido ou estar aberto em outro programa. Escolha o arquivo de novo.',
  },
};

function normalizarBusca(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLocaleLowerCase('pt-BR');
}

function contas(total: number): string {
  return total === 1 ? '1 conta' : `${total} contas`;
}

export function ImportarSenhas({
  aberto,
  aoFechar,
  chavesNaFolha,
  aoImportar,
  assumirFocoAoFechar,
}: ImportarSenhasProps) {
  const [leitura, setLeitura] = useState<Leitura | null>(null);
  const [falha, setFalha] = useState<MotivoFalhaImportacao | null>(null);
  const [lendo, setLendo] = useState(false);
  const [arrastando, setArrastando] = useState(false);
  const [selecionadas, setSelecionadas] = useState<ReadonlySet<string>>(new Set());
  const [busca, setBusca] = useState('');
  const entrada = useRef<HTMLInputElement>(null);
  const campoBusca = useRef<HTMLInputElement>(null);
  const botaoEscolher = useRef<HTMLButtonElement>(null);
  const lista = useRef<HTMLDivElement>(null);
  const idBase = useId();
  const idBusca = `${idBase}-busca`;

  useEffect(() => {
    if (aberto) return undefined;
    const temporizador = window.setTimeout(() => {
      setLeitura(null);
      setFalha(null);
      setSelecionadas(new Set());
      setBusca('');
      setArrastando(false);
    }, ESPERA_PARA_ESQUECER_MS);
    return () => window.clearTimeout(temporizador);
  }, [aberto]);

  const travarAlturaDaLista = useCallback(() => {
    const elemento = lista.current;
    if (!elemento) return;
    elemento.style.minHeight = '';
    const altura = Math.min(elemento.scrollHeight, Math.max(elemento.offsetHeight, ALTURA_MINIMA_LISTA_PX));
    elemento.style.minHeight = `${altura}px`;
  }, []);

  useLayoutEffect(() => {
    if (!leitura) return undefined;
    travarAlturaDaLista();
    window.addEventListener('resize', travarAlturaDaLista);
    return () => window.removeEventListener('resize', travarAlturaDaLista);
  }, [leitura, travarAlturaDaLista]);

  useEffect(() => {
    if (!aberto) return undefined;
    const impedirAbrirArquivo = (evento: globalThis.DragEvent) => evento.preventDefault();
    window.addEventListener('dragover', impedirAbrirArquivo);
    window.addEventListener('drop', impedirAbrirArquivo);
    return () => {
      window.removeEventListener('dragover', impedirAbrirArquivo);
      window.removeEventListener('drop', impedirAbrirArquivo);
    };
  }, [aberto]);

  const lerArquivo = async (arquivo: File) => {
    setFalha(null);
    const recusar = (motivo: MotivoFalhaImportacao) => {
      setLeitura(null);
      setFalha(motivo);
      window.requestAnimationFrame(() => botaoEscolher.current?.focus());
    };
    if (!/\.csv$/iu.test(arquivo.name)) return recusar('NAO_E_CSV');
    if (arquivo.size > TAMANHO_MAXIMO_ARQUIVO_IMPORTACAO) return recusar('GRANDE_DEMAIS');
    setLendo(true);
    try {
      const resultado = interpretarExportacao(await arquivo.text());
      if (resultado.tipo === 'FALHOU') return recusar(resultado.motivo);
      setLeitura(resultado);
      setSelecionadas(new Set(resultado.contas.filter((conta) => !chavesNaFolha.has(conta.chave)).map((conta) => conta.chave)));
      setBusca('');
      window.requestAnimationFrame(() => campoBusca.current?.focus());
    } catch {
      recusar('ILEGIVEL');
    } finally {
      setLendo(false);
    }
  };

  const aoEscolher = (evento: ChangeEvent<HTMLInputElement>) => {
    const arquivo = evento.target.files?.[0];
    evento.target.value = '';
    if (arquivo) void lerArquivo(arquivo);
  };

  const aoSoltar = (evento: DragEvent<HTMLDivElement>) => {
    evento.preventDefault();
    setArrastando(false);
    const arquivo = evento.dataTransfer.files[0];
    if (arquivo) void lerArquivo(arquivo);
  };

  const aoSairDaArea = (evento: DragEvent<HTMLDivElement>) => {
    if (evento.relatedTarget instanceof Node && evento.currentTarget.contains(evento.relatedTarget)) return;
    setArrastando(false);
  };

  const escolherArquivo = () => entrada.current?.click();

  const termo = normalizarBusca(busca.trim());
  const todasContas = leitura?.contas ?? [];
  const visiveis = termo
    ? todasContas.filter((conta) => normalizarBusca(`${conta.titulo} ${conta.usuario}`).includes(termo))
    : todasContas;
  const disponiveisVisiveis = visiveis.filter((conta) => !chavesNaFolha.has(conta.chave));
  const marcadasVisiveis = disponiveisVisiveis.filter((conta) => selecionadas.has(conta.chave)).length;
  const paraImportar = todasContas.filter((conta) => selecionadas.has(conta.chave) && !chavesNaFolha.has(conta.chave));
  const jaNaFolha = todasContas.length - todasContas.filter((conta) => !chavesNaFolha.has(conta.chave)).length;

  const alternar = (chave: string, marcar: boolean) => {
    setSelecionadas((atual) => {
      const proxima = new Set(atual);
      if (marcar) proxima.add(chave);
      else proxima.delete(chave);
      return proxima;
    });
  };

  const alternarVisiveis = (marcar: boolean) => {
    setSelecionadas((atual) => {
      const proxima = new Set(atual);
      for (const conta of disponiveisVisiveis) {
        if (marcar) proxima.add(conta.chave);
        else proxima.delete(conta.chave);
      }
      return proxima;
    });
  };

  const importar = () => {
    if (paraImportar.length === 0) return;
    aoImportar(paraImportar);
  };

  const observacoesLeitura = leitura
    ? [
        leitura.repetidasNoArquivo > 0
          ? `${contas(leitura.repetidasNoArquivo)} ${leitura.repetidasNoArquivo === 1 ? 'aparecia' : 'apareciam'} duas vezes no arquivo e ${leitura.repetidasNoArquivo === 1 ? 'entra' : 'entram'} uma vez só.`
          : null,
        jaNaFolha > 0
          ? `${contas(jaNaFolha)} já ${jaNaFolha === 1 ? 'está' : 'estão'} na folha e não ${jaNaFolha === 1 ? 'entra' : 'entram'} de novo.`
          : null,
      ].filter((texto): texto is string => texto !== null)
    : [];

  const rotuloMarcarTodas = termo ? 'Marcar as encontradas' : 'Marcar todas';

  return (
    <Modal
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Importar senhas do navegador"
      descricao={
        leitura
          ? 'Escolha as contas que vão para a folha. Elas entram no fim, em ordem alfabética.'
          : 'Use o arquivo .csv que o navegador gera ao exportar as senhas salvas.'
      }
      tamanho="md"
      fecharAoClicarFora={false}
      assumirFocoAoFechar={assumirFocoAoFechar}
      classeConteudo={leitura ? estilos.conteudoRevisao : undefined}
      rodape={
        leitura ? (
          <div className={estilos.rodapeRevisao}>
            <Botao variante="terciario" icone={FileUp} className={estilos.outroArquivo} onClick={escolherArquivo}>
              Trocar arquivo
            </Botao>
            <Botao variante="secundario" className={estilos.cancelar} onClick={aoFechar}>
              Cancelar
            </Botao>
            <Botao
              icone={KeyRound}
              className={estilos.confirmar}
              disabled={paraImportar.length === 0}
              onClick={importar}
            >
              {paraImportar.length === 0 ? 'Importar contas' : `Importar ${contas(paraImportar.length)}`}
            </Botao>
          </div>
        ) : (
          <Botao variante="secundario" onClick={aoFechar}>
            Cancelar
          </Botao>
        )
      }
    >
      <input
        ref={entrada}
        type="file"
        accept=".csv,text/csv"
        className="visualmente-oculto"
        tabIndex={-1}
        aria-hidden="true"
        onChange={aoEscolher}
      />

      {leitura ? (
        <div className={estilos.revisao}>
          <div className={estilos.resumo}>
            <p className={estilos.contagem}>
              <strong>{contas(todasContas.length)}</strong> no arquivo
            </p>
            <Selo tom="destaque">{NOME_ORIGEM_EXPORTACAO[leitura.origem]}</Selo>
          </div>
          {observacoesLeitura.length > 0 ? (
            <ul className={estilos.observacoes}>
              {observacoesLeitura.map((texto) => (
                <li key={texto}>{texto}</li>
              ))}
            </ul>
          ) : null}
          {leitura.comCodigoDoisFatores > 0 ? (
            <Nota icone={Lock}>
              {leitura.comCodigoDoisFatores === 1 ? 'Uma conta tinha' : `${leitura.comCodigoDoisFatores} contas tinham`} o
              código de verificação em duas etapas no arquivo. Ele não vai para a folha, porque impresso ao lado da senha a
              segunda etapa deixa de proteger.
            </Nota>
          ) : null}

          <div className={estilos.selecao}>
            <div className={estilos.busca}>
              <label htmlFor={idBusca} className="visualmente-oculto">
                Buscar por site ou usuário
              </label>
              <Search size={16} strokeWidth={2} aria-hidden="true" className={estilos.iconeBusca} />
              <input
                ref={campoBusca}
                id={idBusca}
                type="search"
                className={estilos.entradaBusca}
                value={busca}
                onChange={(evento) => setBusca(evento.target.value)}
                onKeyDown={(evento) => {
                  if (evento.key === 'Escape' && busca) {
                    evento.stopPropagation();
                    setBusca('');
                  }
                }}
                placeholder="Buscar por site ou usuário"
                autoComplete="off"
                spellCheck={false}
              />
              {busca ? (
                <BotaoIcone
                  icone={X}
                  rotulo="Limpar a busca"
                  tamanho="sm"
                  mostrarDica={false}
                  className={juntarClasses(estilos.limparBusca, 'botao-fechar')}
                  onClick={() => {
                    setBusca('');
                    campoBusca.current?.focus();
                  }}
                />
              ) : null}
            </div>
            <CaixaMarcacao
              className={estilos.marcarTodas}
              marcada={disponiveisVisiveis.length > 0 && marcadasVisiveis === disponiveisVisiveis.length}
              parcial={marcadasVisiveis > 0 && marcadasVisiveis < disponiveisVisiveis.length}
              disabled={disponiveisVisiveis.length === 0}
              aoMudar={alternarVisiveis}
              complemento={
                <span className={estilos.marcadas} aria-live="polite">
                  {paraImportar.length} de {todasContas.length - jaNaFolha} marcadas
                </span>
              }
            >
              {rotuloMarcarTodas}
            </CaixaMarcacao>

            <div ref={lista} className={estilos.lista}>
              {visiveis.length > 0 ? (
                <ul aria-label="Contas do arquivo">
                  {visiveis.map((conta) => {
                    const naFolha = chavesNaFolha.has(conta.chave);
                    return (
                      <li key={conta.chave} className={estilos.item}>
                        <CaixaMarcacao
                          marcada={!naFolha && selecionadas.has(conta.chave)}
                          disabled={naFolha}
                          aoMudar={(marcar) => alternar(conta.chave, marcar)}
                          descricao={conta.usuario || 'Sem usuário'}
                          complemento={naFolha ? <Selo>Já na folha</Selo> : null}
                        >
                          {conta.titulo}
                        </CaixaMarcacao>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <EstadoMensagem
                  compacto
                  className={estilos.semResultado}
                  icone={SearchX}
                  titulo="Nenhuma conta encontrada"
                  descricao={`Nenhum site ou usuário do arquivo contém “${busca.trim()}”.`}
                  acao={
                    <Botao variante="secundario" tamanho="sm" onClick={() => setBusca('')}>
                      Limpar a busca
                    </Botao>
                  }
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className={estilos.escolha}>
          <div
            className={juntarClasses(estilos.area, arrastando && estilos.arrastando, falha && estilos.comFalha)}
            onDragEnter={(evento) => {
              evento.preventDefault();
              setArrastando(true);
            }}
            onDragOver={(evento) => {
              evento.preventDefault();
              evento.dataTransfer.dropEffect = 'copy';
            }}
            onDragLeave={aoSairDaArea}
            onDrop={aoSoltar}
          >
            <span className={estilos.iconeArea} aria-hidden="true">
              <FileUp size={22} strokeWidth={1.75} />
            </span>
            <p className={estilos.tituloArea}>
              {arrastando ? (
                'Solte o arquivo para ler'
              ) : (
                <>
                  <span className={estilos.textoArrastar}>Arraste o arquivo .csv aqui</span>
                  <span className={estilos.textoToque}>Escolha o arquivo .csv exportado</span>
                </>
              )}
            </p>
            <p className={juntarClasses(estilos.descricaoArea, estilos.textoArrastar)}>ou</p>
            <Botao ref={botaoEscolher} variante="secundario" icone={FileUp} carregando={lendo} onClick={escolherArquivo}>
              {lendo ? 'Lendo o arquivo' : 'Escolher arquivo'}
            </Botao>
          </div>

          {falha ? (
            <div className={estilos.falha} role="alert">
              <FileWarning size={18} strokeWidth={2} aria-hidden="true" className={estilos.iconeFalha} />
              <p>
                <strong>{FALHAS[falha].titulo}.</strong> {FALHAS[falha].descricao}
              </p>
            </div>
          ) : null}

          <section className={estilos.comoExportar} aria-labelledby={`${idBase}-como`}>
            <h3 id={`${idBase}-como`} className={estilos.tituloComo}>
              Como exportar
            </h3>
            <ul className={estilos.navegadores}>
              {Object.values(ORIGENS_EXPORTACAO).map(({ nome, caminho }) => (
                <li key={nome} className={estilos.navegador}>
                  <span className={estilos.nomeNavegador}>{nome}</span>
                  <span className={estilos.caminho}>
                    {caminho.map((passo, indice) => (
                      <span key={passo} className={estilos.passo}>
                        {indice > 0 ? (
                          <>
                            <ChevronRight size={12} strokeWidth={2.25} aria-hidden="true" />
                            <span className="visualmente-oculto">, depois </span>
                          </>
                        ) : null}
                        <span className={estilos.textoPasso}>{passo}</span>
                      </span>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <Nota icone={Lock}>
            O arquivo é lido só neste navegador, nada é enviado nem guardado. Ele tem todas as suas senhas sem proteção, então
            apague-o do computador depois de importar!
          </Nota>
        </div>
      )}
    </Modal>
  );
}
