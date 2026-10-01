import { useSearchParams } from 'react-router-dom';
import { Copy, History, RefreshCw } from 'lucide-react';
import { CabecalhoPagina } from '@/componentes/layout/CabecalhoPagina';
import { LegendaCaracteres, VisorSenha } from '@/componentes/senha/VisorSenha';
import { Abas, Botao, CabecalhoPainel, Esqueleto, idAba, idPainelAbas, Painel, Selo } from '@/componentes/ui';
import type { OpcaoAba } from '@/componentes/ui';
import type { OpcaoPrevista } from '@/configuracoes/geracao';
import { TAMANHO_HISTORICO_SESSAO, tiposGeracao } from '@/configuracoes/geracao';
import { useTituloDocumento } from '@/ganchos/useTituloDocumento';
import { useHistoricoSessao } from '@/provedores/ProvedorHistoricoSessao';
import { parametros } from '@/rotas/caminhos';
import { juntarClasses } from '@/utilitarios/juntarClasses';
import estilos from './PaginaGerador.module.css';

const ID_ABAS = 'tipo-geracao';
const ID_AVISO_PREVIA = 'aviso-previa-gerador';

const [tipoPadrao] = tiposGeracao;

const opcoesAbas: OpcaoAba<string>[] = tiposGeracao.map(({ parametro, rotulo }) => ({ valor: parametro, rotulo }));

function LinhaOpcaoPrevista({ rotulo, controle }: OpcaoPrevista) {
  return (
    <li className={juntarClasses(estilos.opcao, controle === 'deslizante' && estilos.opcaoDeslizante)}>
      <span className={estilos.rotuloOpcao}>{rotulo}</span>
      {controle === 'deslizante' ? <Esqueleto altura="6px" arredondado animado={false} className={estilos.trilho} /> : null}
      {controle === 'interruptor' ? <Esqueleto largura="36px" altura="20px" arredondado animado={false} /> : null}
      {controle === 'selecao' ? <Esqueleto largura="96px" altura="28px" animado={false} /> : null}
    </li>
  );
}

export default function PaginaGerador() {
  useTituloDocumento('Gerar senha');
  const [busca, definirBusca] = useSearchParams();
  const { senhas } = useHistoricoSessao();

  const parametroAtual = busca.get(parametros.tipoGeracao);
  const tipo = tiposGeracao.find((item) => item.parametro === parametroAtual) ?? tipoPadrao;

  if (!tipo) return null;

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

  return (
    <>
      <CabecalhoPagina
        sobretitulo="Gerador"
        titulo="Gerar senha"
        descricao="Escolha o tipo e ajuste as opções. Tudo é criado no seu navegador, com aleatoriedade criptográfica."
        acoes={
          <Abas idBase={ID_ABAS} rotulo="Tipo de senha" opcoes={opcoesAbas} valor={tipo.parametro} aoMudar={mudarTipo} />
        }
      />

      <div
        role="tabpanel"
        id={idPainelAbas(ID_ABAS)}
        aria-labelledby={idAba(ID_ABAS, tipo.parametro)}
        className={estilos.grade}
      >
        <Painel className={estilos.visor} aria-label={`Prévia: ${tipo.rotulo}`}>
          <div className={estilos.topoVisor}>
            <Selo tom="destaque">Prévia</Selo>
            <LegendaCaracteres />
          </div>

          <div className={estilos.areaSenha} key={tipo.parametro}>
            <VisorSenha valor={tipo.exemplo} quebraLivre={tipo.tipo !== 'FRASE_SENHA'} />
          </div>

          <p className={estilos.descricaoTipo}>{tipo.descricao}</p>

          <div className={estilos.acoesVisor}>
            <Botao icone={Copy} tamanho="lg" disabled aria-describedby={ID_AVISO_PREVIA}>
              Copiar
            </Botao>
            <Botao icone={RefreshCw} variante="secundario" tamanho="lg" disabled aria-describedby={ID_AVISO_PREVIA}>
              Gerar outra
            </Botao>
          </div>

          <p id={ID_AVISO_PREVIA} className={estilos.avisoPrevia}>
            Esta é uma prévia visual. A geração entra na próxima fase.
          </p>
        </Painel>

        <Painel className={estilos.opcoes} aria-labelledby="titulo-opcoes">
          <CabecalhoPainel
            titulo={<span id="titulo-opcoes">Opções</span>}
            descricao={`O que vai dar para ajustar em ${tipo.rotulo.toLowerCase()}.`}
          />
          <ul className={estilos.listaOpcoes}>
            {tipo.opcoesPrevistas.map((opcao) => (
              <LinhaOpcaoPrevista key={opcao.rotulo} {...opcao} />
            ))}
          </ul>
        </Painel>

        <Painel className={estilos.historico} aria-labelledby="titulo-historico">
          <CabecalhoPainel
            titulo={<span id="titulo-historico">Nesta sessão</span>}
            descricao={`As últimas ${TAMANHO_HISTORICO_SESSAO} senhas geradas ficam aqui até você fechar ou recarregar a aba. Nada é gravado.`}
          />
          {senhas.length === 0 ? (
            <p className={estilos.historicoVazio}>
              <History size={16} strokeWidth={2} aria-hidden="true" />
              Nenhuma senha gerada ainda.
            </p>
          ) : null}
        </Painel>
      </div>
    </>
  );
}
