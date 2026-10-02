import { Suspense, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BarraAbas } from '@/componentes/layout/BarraAbas';
import { Cabecalho } from '@/componentes/layout/Cabecalho';
import { MenuLateral } from '@/componentes/layout/MenuLateral';
import { EsqueletoPagina } from '@/componentes/ui';
import { CHAVE_MENU_RECOLHIDO, ID_CONTEUDO_PRINCIPAL } from '@/configuracoes/aplicacao';
import { useArmazenamentoLocal } from '@/ganchos/useArmazenamentoLocal';
import { useMenuSempreRecolhido } from '@/ganchos/useConsultaMidia';
import { caminhos } from '@/rotas/caminhos';
import { juntarClasses } from '@/utilitarios/juntarClasses';
import estilos from './LayoutAplicacao.module.css';

const ROTAS_DE_CONTEUDO_ESTREITO: ReadonlySet<string> = new Set([caminhos.configuracoes]);

export function LayoutAplicacao() {
  const localizacao = useLocation();
  const primeiraRenderizacao = useRef(true);
  const [recolhidoEscolhido, setRecolhidoEscolhido] = useArmazenamentoLocal(CHAVE_MENU_RECOLHIDO, false);
  const sempreRecolhido = useMenuSempreRecolhido();
  const recolhido = sempreRecolhido || recolhidoEscolhido;

  useEffect(() => {
    if (primeiraRenderizacao.current) {
      primeiraRenderizacao.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
    document.getElementById(ID_CONTEUDO_PRINCIPAL)?.focus({ preventScroll: true });
  }, [localizacao.pathname]);

  return (
    <div className={juntarClasses(estilos.casca, recolhido && estilos.cascaRecolhida)}>
      <a className="link-pular" href={`#${ID_CONTEUDO_PRINCIPAL}`}>
        Pular para o conteúdo
      </a>

      <MenuLateral
        recolhido={recolhido}
        podeExpandir={!sempreRecolhido}
        aoAlternarRecolhido={() => setRecolhidoEscolhido(!recolhidoEscolhido)}
      />

      <div
        className={juntarClasses(
          estilos.principal,
          ROTAS_DE_CONTEUDO_ESTREITO.has(localizacao.pathname) && estilos.principalEstreito,
        )}
      >
        <Cabecalho />

        <main className={estilos.conteudo} id={ID_CONTEUDO_PRINCIPAL} tabIndex={-1}>
          <div className={estilos.limite} key={localizacao.pathname}>
            <Suspense fallback={<EsqueletoPagina rotulo="Carregando a página…" />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>

      <BarraAbas />
    </div>
  );
}
