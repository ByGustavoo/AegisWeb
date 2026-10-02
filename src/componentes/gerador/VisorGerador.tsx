import { useEffect, useRef } from 'react';
import { Check, Copy, Eye, EyeOff, Info, RefreshCw, ScanSearch, TriangleAlert } from 'lucide-react';
import { SelosPrivacidade } from '@/componentes/comum/SelosPrivacidade';
import { MedidorForca } from '@/componentes/senha/MedidorForca';
import { LegendaCaracteres, VisorSenha } from '@/componentes/senha/VisorSenha';
import { Botao, BotaoIcone } from '@/componentes/ui';
import { SEGUNDOS_PARA_LIMPAR_AREA_TRANSFERENCIA } from '@/configuracoes/geracao';
import type { ForcaCalculada } from '@/modelos/senha';
import type { EstadoAreaTransferencia } from '@/provedores/ProvedorAreaTransferencia';
import { juntarClasses } from '@/utilitarios/juntarClasses';
import { ExplicacaoEntropia } from './ExplicacaoEntropia';
import estilos from './VisorGerador.module.css';

const LIMITE_PONTOS_OCULTOS = 32;

export interface AvisoVisor {
  tom: 'aviso' | 'info';
  texto: string;
}

interface VisorGeradorProps {
  valor: string;
  visivel: boolean;
  forca: ForcaCalculada;
  descricaoTipo: string;
  quebraLivre: boolean;
  mostrarLegenda: boolean;
  aviso: AvisoVisor | null;
  estadoCopia: EstadoAreaTransferencia;
  copiadaAgora: boolean;
  aoLimparAgora: () => void;
  aoAlternarVisivel: () => void;
  aoCopiar: () => void;
  aoGerar: () => void;
  aoAnalisar: () => void;
}

function textoEstadoCopia(estado: EstadoAreaTransferencia, visivel: boolean): string {
  switch (estado.fase) {
    case 'COPIADA':
      return `Senha copiada. A área de transferência será limpa em ${estado.segundosRestantes} s.`;
    case 'AGUARDANDO_INTERACAO':
      return 'A área de transferência será limpa no seu próximo clique ou tecla nesta aba.';
    case 'LIMPA':
      return 'Área de transferência limpa.';
    case 'NAO_LIMPOU':
      return 'Não foi possível limpar a área de transferência. Copie outro texto por cima para apagar a senha.';
    case 'FALHOU':
      return visivel
        ? 'Não foi possível copiar. A senha ficou selecionada para você copiar manualmente.'
        : 'Não foi possível copiar. Mostre a senha para selecioná-la e copiar manualmente.';
    default:
      return '';
  }
}

function anuncioEstadoCopia(estado: EstadoAreaTransferencia, visivel: boolean): string {
  if (estado.fase === 'COPIADA') {
    return `Senha copiada. A área de transferência será limpa em ${SEGUNDOS_PARA_LIMPAR_AREA_TRANSFERENCIA} segundos.`;
  }
  return textoEstadoCopia(estado, visivel);
}

export function VisorGerador({
  valor,
  visivel,
  forca,
  descricaoTipo,
  quebraLivre,
  mostrarLegenda,
  aviso,
  estadoCopia,
  copiadaAgora,
  aoLimparAgora,
  aoAlternarVisivel,
  aoCopiar,
  aoGerar,
  aoAnalisar,
}: VisorGeradorProps) {
  const copiada = copiadaAgora;
  const textoCopia = textoEstadoCopia(estadoCopia, visivel);
  const anuncioCopia = anuncioEstadoCopia(estadoCopia, visivel);
  const limpezaPendente = estadoCopia.fase === 'COPIADA' || estadoCopia.fase === 'AGUARDANDO_INTERACAO';
  const IconeAviso = aviso?.tom === 'aviso' ? TriangleAlert : Info;
  const falhaCopia = estadoCopia.fase === 'FALHOU' || estadoCopia.fase === 'NAO_LIMPOU';
  const areaSenha = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const senha = areaSenha.current?.firstElementChild;
    if (estadoCopia.fase !== 'FALHOU' || !visivel || !senha) return;
    window.getSelection()?.selectAllChildren(senha);
  }, [estadoCopia.fase, visivel, valor]);

  return (
    <div className={estilos.visor}>
      <div className={estilos.topo}>
        <span className={estilos.titulo}>Sua senha</span>
        <div className={estilos.topoDireita}>
          {visivel && mostrarLegenda ? <LegendaCaracteres className={estilos.legenda} /> : null}
          <BotaoIcone
            icone={visivel ? EyeOff : Eye}
            rotulo={visivel ? 'Ocultar senha' : 'Mostrar senha'}
            onClick={aoAlternarVisivel}
          />
        </div>
      </div>

      <div className={estilos.areaSenha} key={valor} ref={areaSenha}>
        {visivel ? (
          <VisorSenha valor={valor} quebraLivre={quebraLivre} className={estilos.senha} />
        ) : (
          <span className={juntarClasses(estilos.oculta, 'mono')}>
            <span aria-hidden="true">{'•'.repeat(Math.min(valor.length, LIMITE_PONTOS_OCULTOS))}</span>
            <span className="visualmente-oculto">Senha oculta</span>
          </span>
        )}
      </div>

      <div className={estilos.forca}>
        <MedidorForca nivel={forca.nivel} mostrarResumo={false} />
        <dl className={estilos.metricas}>
          <div className={estilos.metricaComDica}>
            <dt className={estilos.rotuloComDica}>
              Entropia
              <ExplicacaoEntropia bits={forca.entropiaBits} className={estilos.dicaAncorada} />
            </dt>
            <dd className="mono">{Math.round(forca.entropiaBits)} bits</dd>
          </div>
          <div>
            <dt>Tempo para quebrar</dt>
            <dd>{forca.tempoEstimadoQuebra}</dd>
          </div>
        </dl>
      </div>

      {aviso ? (
        <p className={juntarClasses(estilos.aviso, aviso.tom === 'aviso' ? estilos.tomAviso : estilos.tomInfo)}>
          <IconeAviso size={16} strokeWidth={2} aria-hidden="true" />
          <span>{aviso.texto}</span>
        </p>
      ) : null}

      <div className={estilos.acoes}>
        <Botao
          icone={copiada ? Check : Copy}
          tamanho="lg"
          onClick={aoCopiar}
          className={juntarClasses(estilos.copiar, copiada && estilos.copiada)}
        >
          {copiada ? 'Copiada' : 'Copiar'}
        </Botao>
        <Botao icone={RefreshCw} variante="secundario" tamanho="lg" onClick={aoGerar} className={estilos.gerar}>
          Gerar outra
        </Botao>
        <Botao icone={ScanSearch} variante="terciario" tamanho="lg" onClick={aoAnalisar} className={estilos.analisar}>
          Analisar
        </Botao>
      </div>

      <p className={estilos.rodape}>
        <span className={juntarClasses(estilos.estadoCopia, falhaCopia && estilos.falhaCopia)} aria-hidden="true">
          {textoCopia}
        </span>
        <span className="visualmente-oculto" role="status">
          {anuncioCopia}
        </span>
        {limpezaPendente ? (
          <button type="button" className={estilos.limparAgora} onClick={aoLimparAgora}>
            Limpar agora
          </button>
        ) : null}
        <span className={estilos.descricaoTipo}>{textoCopia ? null : descricaoTipo}</span>
      </p>

      <SelosPrivacidade />
    </div>
  );
}
