import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { HistoricoSessao } from '@/componentes/gerador/HistoricoSessao';
import { OpcoesFrase, OpcoesPinNumerico, OpcoesSenhaAleatoria } from '@/componentes/gerador/OpcoesGerador';
import type { AvisoVisor } from '@/componentes/gerador/VisorGerador';
import { VisorGerador } from '@/componentes/gerador/VisorGerador';
import { CabecalhoPagina } from '@/componentes/layout/CabecalhoPagina';
import { Abas, CabecalhoPainel, idAba, idPainelAbas, Painel } from '@/componentes/ui';
import type { OpcaoAba } from '@/componentes/ui';
import { descreverFinalidade } from '@/configuracoes/finalidades';
import { AVISO_PIN, OPCOES_FRASE_PADRAO, tiposGeracao } from '@/configuracoes/geracao';
import type { EstadoFinalidade } from '@/ganchos/useGerador';
import { useGerador } from '@/ganchos/useGerador';
import { useTituloDocumento } from '@/ganchos/useTituloDocumento';
import type { ForcaCalculada, OpcoesFraseSenha, OpcoesSenha, TipoGeracao } from '@/modelos/senha';
import { useAreaTransferencia } from '@/provedores/ProvedorAreaTransferencia';
import { useHistoricoSessao } from '@/provedores/ProvedorHistoricoSessao';
import { useSenhaParaAnalise } from '@/provedores/ProvedorSenhaParaAnalise';
import { caminhos, parametros } from '@/rotas/caminhos';
import estilos from './PaginaGerador.module.css';

const ID_ABAS = 'tipo-geracao';
const TAMANHO_MAXIMO_WPA2 = 63;
const NIVEL_MINIMO_ACEITAVEL = 3;

const [tipoPadrao] = tiposGeracao;

const opcoesAbas: OpcaoAba<string>[] = tiposGeracao.map(({ parametro, rotulo }) => ({ valor: parametro, rotulo }));

function avisoDoVisor(
  tipo: TipoGeracao,
  finalidade: EstadoFinalidade,
  opcoesSenha: OpcoesSenha,
  opcoesFrase: OpcoesFraseSenha,
  forca: ForcaCalculada,
): AvisoVisor | null {
  if (tipo === 'PIN') return { tom: 'info', texto: AVISO_PIN };

  if (tipo === 'FRASE_SENHA') {
    if (opcoesFrase.quantidadePalavras < OPCOES_FRASE_PADRAO.quantidadePalavras) {
      return {
        tom: 'aviso',
        texto: `Com menos de ${OPCOES_FRASE_PADRAO.quantidadePalavras} palavras a frase fica mais fácil de adivinhar.`,
      };
    }
    return null;
  }

  const { rotulo, tamanhoMinimoRecomendado, finalidade: tipoFinalidade } = descreverFinalidade(finalidade.base);
  if (opcoesSenha.tamanho < tamanhoMinimoRecomendado) {
    return {
      tom: 'aviso',
      texto: `Abaixo do recomendado para ${rotulo}: use pelo menos ${tamanhoMinimoRecomendado} caracteres.`,
    };
  }
  if (tipoFinalidade === 'WIFI' && opcoesSenha.tamanho > TAMANHO_MAXIMO_WPA2) {
    return { tom: 'aviso', texto: `Redes Wi-Fi com WPA2 aceitam no máximo ${TAMANHO_MAXIMO_WPA2} caracteres.` };
  }
  if (forca.nivel < NIVEL_MINIMO_ACEITAVEL) {
    return { tom: 'aviso', texto: 'Senha fraca: aumente o tamanho ou ligue mais tipos de caractere.' };
  }
  return null;
}

export default function PaginaGerador() {
  useTituloDocumento('Gerar senha');
  const [busca, definirBusca] = useSearchParams();
  const navegar = useNavigate();
  const gerador = useGerador();
  const { estado: estadoCopia, copiar, limparAgora } = useAreaTransferencia();
  const { senhas, registrar, remover, limpar } = useHistoricoSessao();
  const { encaminhar } = useSenhaParaAnalise();
  const [visivel, setVisivel] = useState(true);
  const [anuncio, setAnuncio] = useState('');
  const [valorCopiado, setValorCopiado] = useState<string | null>(null);

  const parametroAtual = busca.get(parametros.tipoGeracao);
  const descricaoTipo = tiposGeracao.find((item) => item.parametro === parametroAtual) ?? tipoPadrao;
  const parametroTipo = descricaoTipo?.parametro ?? 'senha';
  const tipo = descricaoTipo?.tipo ?? 'SENHA';
  const valor = gerador.valores[tipo];
  const forca = gerador.forcas[tipo];
  const { gerarNovamente } = gerador;

  const mudarTipo = (parametro: string) => {
    definirBusca(
      (atual) => {
        const proxima = new URLSearchParams(atual);
        if (parametro === tipoPadrao?.parametro) proxima.delete(parametros.tipoGeracao);
        else proxima.set(parametros.tipoGeracao, parametro);
        return proxima;
      },
      { replace: true },
    );
  };

  const gerarOutra = useCallback(() => {
    registrar(valor, tipo);
    gerarNovamente(tipo);
    setAnuncio((atual) => (atual === 'Nova senha gerada.' ? 'Outra senha gerada.' : 'Nova senha gerada.'));
  }, [gerarNovamente, registrar, tipo, valor]);

  const copiarAtual = async () => {
    const copiou = await copiar(valor);
    if (!copiou) return;
    setValorCopiado(valor);
    registrar(valor, tipo);
  };

  const analisarAtual = () => {
    encaminhar(valor);
    navegar(caminhos.analisar);
  };

  useEffect(() => {
    const aoTeclar = (evento: KeyboardEvent) => {
      if ((evento.ctrlKey || evento.metaKey) && evento.key === 'Enter') {
        evento.preventDefault();
        gerarOutra();
      }
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [gerarOutra]);

  const aviso = avisoDoVisor(tipo, gerador.finalidade, gerador.opcoesSenha, gerador.opcoesFrase, forca);

  return (
    <>
      <CabecalhoPagina
        sobretitulo="Gerador"
        titulo="Gerar senha"
        descricao="Escolha o tipo e ajuste as opções. Tudo é criado no seu navegador, com aleatoriedade criptográfica."
        acoes={
          <Abas idBase={ID_ABAS} rotulo="Tipo de senha" opcoes={opcoesAbas} valor={parametroTipo} aoMudar={mudarTipo} />
        }
      />

      <div role="tabpanel" id={idPainelAbas(ID_ABAS)} aria-labelledby={idAba(ID_ABAS, parametroTipo)} className={estilos.grade}>
        <Painel className={estilos.visor} aria-label="Senha gerada">
          <VisorGerador
            valor={valor}
            visivel={visivel}
            forca={forca}
            descricaoTipo={descricaoTipo?.descricao ?? ''}
            quebraLivre={tipo !== 'FRASE_SENHA'}
            mostrarLegenda={tipo !== 'PIN'}
            aviso={aviso}
            estadoCopia={estadoCopia}
            copiadaAgora={estadoCopia.fase === 'COPIADA' && valorCopiado === valor}
            aoLimparAgora={limparAgora}
            aoAlternarVisivel={() => setVisivel(!visivel)}
            aoCopiar={() => void copiarAtual()}
            aoGerar={gerarOutra}
            aoAnalisar={analisarAtual}
          />
        </Painel>

        <Painel className={estilos.opcoes} aria-labelledby="titulo-opcoes">
          <CabecalhoPainel titulo={<span id="titulo-opcoes">Opções</span>} />
          {tipo === 'SENHA' ? (
            <OpcoesSenhaAleatoria
              finalidade={gerador.finalidade}
              opcoes={gerador.opcoesSenha}
              aoEscolherFinalidade={gerador.escolherFinalidade}
              aoAjustar={gerador.ajustarSenha}
            />
          ) : null}
          {tipo === 'FRASE_SENHA' ? <OpcoesFrase opcoes={gerador.opcoesFrase} aoAjustar={gerador.ajustarFrase} /> : null}
          {tipo === 'PIN' ? <OpcoesPinNumerico opcoes={gerador.opcoesPin} aoAjustar={gerador.ajustarPin} /> : null}
        </Painel>

        <div className={estilos.historico}>
          <HistoricoSessao
            senhas={senhas}
            visivel={visivel}
            aoCopiar={(senha) => {
              void copiar(senha.valor).then((copiou) => {
                if (copiou) setValorCopiado(senha.valor);
              });
            }}
            aoRemover={remover}
            aoLimpar={limpar}
          />
        </div>
      </div>

      <p className="visualmente-oculto" aria-live="polite">
        {anuncio}
      </p>
    </>
  );
}
