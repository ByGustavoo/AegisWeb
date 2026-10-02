import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eraser, GlobeLock, Lock, RotateCcw, ScanSearch, TimerReset } from 'lucide-react';
import { FaixaPrivacidade } from '@/componentes/analisador/FaixaPrivacidade';
import { ListaObservacoes } from '@/componentes/analisador/ListaObservacoes';
import { ListaRecomendacoes } from '@/componentes/analisador/ListaRecomendacoes';
import { MapaSenha } from '@/componentes/analisador/MapaSenha';
import { PlacarSeguranca } from '@/componentes/analisador/PlacarSeguranca';
import { CabecalhoPagina } from '@/componentes/layout/CabecalhoPagina';
import { Botao, CabecalhoPainel, CampoSenha, EstadoMensagem, IndicadorGiratorio, Painel, Selo } from '@/componentes/ui';
import { EXEMPLOS_SENHA, MILISSEGUNDOS_PARA_APAGAR_SENHA, MINUTOS_PARA_APAGAR_SENHA } from '@/configuracoes/analise';
import { niveisForca } from '@/configuracoes/forca';
import { useAnalisador } from '@/ganchos/useAnalisador';
import { useLimpezaPorInatividade } from '@/ganchos/useLimpezaPorInatividade';
import { useTituloDocumento } from '@/ganchos/useTituloDocumento';
import { useSenhaParaAnalise } from '@/provedores/ProvedorSenhaParaAnalise';
import { caminhos } from '@/rotas/caminhos';
import estilos from './PaginaAnalisador.module.css';

const ID_CAMPO = 'senha-para-analisar';
const ATRASO_ANUNCIO_MS = 900;

export default function PaginaAnalisador() {
  useTituloDocumento('Analisar senha');
  const navegar = useNavigate();
  const { retirar } = useSenhaParaAnalise();
  const [senha, setSenha] = useState('');
  const [visivel, setVisivel] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [destacado, setDestacado] = useState<string | null>(null);
  const [anuncio, setAnuncio] = useState('');
  const { fase, analise, tentarDeNovo } = useAnalisador(senha);

  const preenchida = senha.length > 0;
  const analiseAtual = preenchida ? analise : null;

  useEffect(() => {
    const encaminhada = retirar();
    if (encaminhada) setSenha(encaminhada);
  }, [retirar]);

  useEffect(() => {
    if (!analiseAtual) {
      setAnuncio('');
      return undefined;
    }
    const { nota, nivel } = analiseAtual;
    const temporizador = window.setTimeout(
      () => setAnuncio(`Nota ${nota} de 100: ${niveisForca[nivel].rotulo}.`),
      ATRASO_ANUNCIO_MS,
    );
    return () => window.clearTimeout(temporizador);
  }, [analiseAtual]);

  const mudarSenha = (valor: string) => {
    setSenha(valor);
    setAviso(null);
  };

  const limpar = () => {
    setSenha('');
    setDestacado(null);
    document.getElementById(ID_CAMPO)?.focus();
  };

  const apagarPorInatividade = useCallback(() => {
    setSenha('');
    setDestacado(null);
    setAviso(`A senha foi apagada depois de ${MINUTOS_PARA_APAGAR_SENHA} minutos sem uso.`);
  }, []);

  useLimpezaPorInatividade(preenchida, MILISSEGUNDOS_PARA_APAGAR_SENHA, apagarPorInatividade);

  const usarExemplo = (exemplo: string) => {
    mudarSenha(exemplo);
    setVisivel(true);
    document.getElementById(ID_CAMPO)?.focus();
  };

  return (
    <>
      <CabecalhoPagina
        sobretitulo="Analisador"
        titulo="Analisar senha"
        descricao="Veja quanto uma senha resiste a um ataque e o que melhorar nela. Tudo é calculado neste navegador."
      />

      <FaixaPrivacidade />

      <div className={estilos.grade}>
        <Painel className={estilos.entrada} aria-labelledby="titulo-entrada">
          <CabecalhoPainel
            titulo={<span id="titulo-entrada">Sua senha</span>}
            acao={
              <Selo tom="sucesso" icone={Lock}>
                Só neste aparelho
              </Selo>
            }
          />
          <CampoSenha
            id={ID_CAMPO}
            rotulo="Senha para analisar"
            descricao="Analisada enquanto você digita. Nada é enviado nem guardado."
            valor={senha}
            aoMudar={mudarSenha}
            visivel={visivel}
            aoAlternarVisivel={setVisivel}
            placeholder="Digite ou cole aqui"
          />

          {aviso ? (
            <p className={estilos.aviso} role="status">
              <TimerReset size={16} strokeWidth={2} aria-hidden="true" />
              {aviso}
            </p>
          ) : null}

          {preenchida ? (
            <>
              <MapaSenha
                senha={senha}
                pontosFracos={analiseAtual?.pontosFracos ?? []}
                visivel={visivel}
                idDestacado={destacado}
              />
              <div className={estilos.acoesEntrada}>
                <Botao variante="secundario" tamanho="sm" icone={Eraser} onClick={limpar}>
                  Limpar
                </Botao>
              </div>
            </>
          ) : (
            <div className={estilos.exemplos}>
              <p className={estilos.rotuloExemplos}>Quer ver como funciona? Teste um exemplo:</p>
              <ul className={estilos.listaExemplos}>
                {EXEMPLOS_SENHA.map((exemplo) => (
                  <li key={exemplo}>
                    <button type="button" className={`${estilos.exemplo} mono`} onClick={() => usarExemplo(exemplo)}>
                      {exemplo}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Painel>

        <Painel className={estilos.resultado} aria-labelledby="titulo-resultado">
          <CabecalhoPainel titulo={<span id="titulo-resultado">Resultado</span>} />
          {fase === 'FALHOU' ? (
            <EstadoMensagem
              compacto
              icone={ScanSearch}
              titulo="Não foi possível preparar a análise"
              descricao="As listas de senhas e palavras comuns não carregaram. Nada foi enviado."
              acao={
                <Botao variante="secundario" tamanho="sm" icone={RotateCcw} onClick={tentarDeNovo}>
                  Tentar de novo
                </Botao>
              }
            />
          ) : (
            <>
              <PlacarSeguranca analise={analiseAtual} />
              {!preenchida ? (
                <EstadoMensagem
                  compacto
                  icone={ScanSearch}
                  titulo="Digite uma senha para ver a análise"
                  descricao="A nota, os pontos fortes e fracos e as recomendações aparecem aqui enquanto você digita."
                />
              ) : null}
              {preenchida && fase === 'CARREGANDO' ? (
                <p className={estilos.preparando} role="status">
                  <IndicadorGiratorio tamanho={16} />
                  Preparando a análise…
                </p>
              ) : null}
            </>
          )}
        </Painel>

        {analiseAtual ? (
          <>
            <Painel className={estilos.pontos} aria-label="Pontos fortes e fracos">
              <div className={estilos.colunasPontos}>
                <ListaObservacoes
                  id="titulo-pontos-fracos"
                  titulo="Pontos fracos"
                  tom="FRACO"
                  itens={analiseAtual.pontosFracos}
                  vazio="Nenhum ponto fraco encontrado."
                  visivel={visivel}
                  aoDestacar={setDestacado}
                />
                <ListaObservacoes
                  id="titulo-pontos-fortes"
                  titulo="Pontos fortes"
                  tom="FORTE"
                  itens={analiseAtual.pontosFortes}
                  vazio="Ainda nenhum. As recomendações abaixo ajudam."
                  visivel={visivel}
                />
              </div>
            </Painel>

            <Painel className={estilos.melhorar} aria-labelledby="titulo-melhorar">
              <CabecalhoPainel
                titulo={<span id="titulo-melhorar">Como melhorar</span>}
                descricao="Em ordem de impacto. Cada sugestão mostra a nota que a senha teria."
              />
              <ListaRecomendacoes
                recomendacoes={analiseAtual.recomendacoes}
                notaAtual={analiseAtual.nota}
                visivel={visivel}
                aoGerar={() => navegar(caminhos.gerar)}
              />
            </Painel>
          </>
        ) : null}

        <Painel tom="suave" className={estilos.vazamento} aria-labelledby="titulo-vazamento">
          <CabecalhoPainel
            nivel={2}
            titulo={<span id="titulo-vazamento">Vazamentos conhecidos</span>}
            acao={<Selo>Em breve</Selo>}
          />
          <div className={estilos.textoVazamento}>
            <span className={estilos.iconeVazamento} aria-hidden="true">
              <GlobeLock size={18} strokeWidth={2} />
            </span>
            <p>
              Conferir se a senha já apareceu em vazamentos públicos. Só os 5 primeiros caracteres do hash dela serão
              enviados, e só quando você pedir.
            </p>
          </div>
        </Painel>
      </div>

      <p className="visualmente-oculto" aria-live="polite">
        {anuncio}
      </p>
    </>
  );
}
