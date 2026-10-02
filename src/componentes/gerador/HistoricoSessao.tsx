import { useEffect, useRef, useState } from 'react';
import { Check, Copy, History, Trash2 } from 'lucide-react';
import { BotaoIcone, Botao, CabecalhoPainel, Painel, Selo } from '@/componentes/ui';
import { TAMANHO_HISTORICO_SESSAO, tiposGeracao } from '@/configuracoes/geracao';
import type { SenhaGerada } from '@/modelos/senha';
import { juntarClasses } from '@/utilitarios/juntarClasses';
import estilos from './HistoricoSessao.module.css';

const formatoHora = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });
const ID_TITULO = 'titulo-historico';

interface HistoricoSessaoProps {
  senhas: SenhaGerada[];
  visivel: boolean;
  valorCopiado: string | null;
  aoCopiar: (senha: SenhaGerada) => void;
  aoRemover: (id: string) => void;
  aoLimpar: () => void;
}

type DestinoFoco = { tipo: 'ITEM'; id: string } | { tipo: 'TITULO' };

function rotuloTipo(senha: SenhaGerada): string {
  return tiposGeracao.find((tipo) => tipo.tipo === senha.tipo)?.rotulo ?? senha.tipo;
}

export function HistoricoSessao({ senhas, visivel, valorCopiado, aoCopiar, aoRemover, aoLimpar }: HistoricoSessaoProps) {
  const botoesCopiar = useRef(new Map<string, HTMLButtonElement>());
  const [destinoFoco, setDestinoFoco] = useState<DestinoFoco | null>(null);
  const [anuncio, setAnuncio] = useState('');

  useEffect(() => {
    if (!destinoFoco) return;
    if (destinoFoco.tipo === 'ITEM') botoesCopiar.current.get(destinoFoco.id)?.focus();
    else document.getElementById(ID_TITULO)?.focus();
    setDestinoFoco(null);
  }, [destinoFoco, senhas]);

  const remover = (id: string) => {
    const indice = senhas.findIndex((senha) => senha.id === id);
    const restantes = senhas.filter((senha) => senha.id !== id);
    const proxima = restantes[Math.min(indice, restantes.length - 1)];
    aoRemover(id);
    setDestinoFoco(proxima ? { tipo: 'ITEM', id: proxima.id } : { tipo: 'TITULO' });
    setAnuncio(restantes.length > 0 ? 'Senha removida do histórico.' : 'Senha removida. O histórico está vazio.');
  };

  const limpar = () => {
    aoLimpar();
    setDestinoFoco({ tipo: 'TITULO' });
    setAnuncio('Histórico limpo.');
  };

  return (
    <Painel aria-labelledby={ID_TITULO}>
      <CabecalhoPainel
        titulo={
          <span id={ID_TITULO} tabIndex={-1} className={estilos.titulo}>
            Nesta sessão
          </span>
        }
        descricao={`As últimas ${TAMANHO_HISTORICO_SESSAO} senhas que você copiou ficam aqui até fechar ou recarregar a aba. Nada é gravado.`}
        acao={
          senhas.length > 0 ? (
            <Botao variante="terciario" tamanho="sm" icone={Trash2} onClick={limpar}>
              Limpar
            </Botao>
          ) : null
        }
      />

      {senhas.length === 0 ? (
        <p className={estilos.vazio}>
          <History size={16} strokeWidth={2} aria-hidden="true" />
          Nenhuma senha copiada ainda.
        </p>
      ) : (
        <ul className={estilos.lista}>
          {senhas.map((senha) => {
            const copiada = valorCopiado === senha.valor;
            return (
              <li key={senha.id} className={estilos.item}>
                <span className={juntarClasses(estilos.valor, 'mono', !visivel && estilos.oculto)} translate="no">
                  {visivel ? senha.valor : '•'.repeat(Math.min(senha.valor.length, 16))}
                  {visivel ? null : <span className="visualmente-oculto">Senha oculta</span>}
                </span>
                <span className={estilos.meta}>
                  <Selo>{rotuloTipo(senha)}</Selo>
                  <time dateTime={senha.geradaEm} className={estilos.hora}>
                    {formatoHora.format(new Date(senha.geradaEm))}
                  </time>
                </span>
                <span className={estilos.acoes}>
                  <BotaoIcone
                    ref={(botao) => {
                      if (botao) botoesCopiar.current.set(senha.id, botao);
                      else botoesCopiar.current.delete(senha.id);
                    }}
                    icone={copiada ? Check : Copy}
                    rotulo={copiada ? 'Copiada' : 'Copiar esta senha'}
                    tamanho="sm"
                    className={juntarClasses(copiada && estilos.copiada)}
                    onClick={() => aoCopiar(senha)}
                  />
                  <BotaoIcone icone={Trash2} rotulo="Remover do histórico" tamanho="sm" onClick={() => remover(senha.id)} />
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <p className="visualmente-oculto" aria-live="polite">
        {anuncio}
      </p>
    </Painel>
  );
}
