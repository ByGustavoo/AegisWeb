import { Copy, History, Trash2 } from 'lucide-react';
import { BotaoIcone, Botao, CabecalhoPainel, Painel, Selo } from '@/componentes/ui';
import { TAMANHO_HISTORICO_SESSAO, tiposGeracao } from '@/configuracoes/geracao';
import type { SenhaGerada } from '@/modelos/senha';
import { juntarClasses } from '@/utilitarios/juntarClasses';
import estilos from './HistoricoSessao.module.css';

const formatoHora = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });

interface HistoricoSessaoProps {
  senhas: SenhaGerada[];
  visivel: boolean;
  aoCopiar: (senha: SenhaGerada) => void;
  aoRemover: (id: string) => void;
  aoLimpar: () => void;
}

function rotuloTipo(senha: SenhaGerada): string {
  return tiposGeracao.find((tipo) => tipo.tipo === senha.tipo)?.rotulo ?? senha.tipo;
}

export function HistoricoSessao({ senhas, visivel, aoCopiar, aoRemover, aoLimpar }: HistoricoSessaoProps) {
  return (
    <Painel aria-labelledby="titulo-historico">
      <CabecalhoPainel
        titulo={<span id="titulo-historico">Nesta sessão</span>}
        descricao={`As últimas ${TAMANHO_HISTORICO_SESSAO} senhas que você copiou ou trocou ficam aqui até fechar ou recarregar a aba. Nada é gravado.`}
        acao={
          senhas.length > 0 ? (
            <Botao variante="terciario" tamanho="sm" icone={Trash2} onClick={aoLimpar}>
              Limpar
            </Botao>
          ) : null
        }
      />

      {senhas.length === 0 ? (
        <p className={estilos.vazio}>
          <History size={16} strokeWidth={2} aria-hidden="true" />
          Nenhuma senha por aqui ainda.
        </p>
      ) : (
        <ul className={estilos.lista}>
          {senhas.map((senha) => (
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
                <BotaoIcone icone={Copy} rotulo="Copiar esta senha" tamanho="sm" onClick={() => aoCopiar(senha)} />
                <BotaoIcone icone={Trash2} rotulo="Remover do histórico" tamanho="sm" onClick={() => aoRemover(senha.id)} />
              </span>
            </li>
          ))}
        </ul>
      )}
    </Painel>
  );
}
