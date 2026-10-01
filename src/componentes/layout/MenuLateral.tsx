import { Link, NavLink } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { MarcaAegis } from '@/componentes/comum/MarcaAegis';
import { NOME_APLICACAO } from '@/configuracoes/aplicacao';
import type { ItemNavegacao } from '@/configuracoes/navegacao';
import { navegacaoConfiguracoes, navegacaoFerramentas } from '@/configuracoes/navegacao';
import { caminhos } from '@/rotas/caminhos';
import { juntarClasses } from '@/utilitarios/juntarClasses';
import estilos from './MenuLateral.module.css';

interface MenuLateralProps {
  recolhido: boolean;
  podeExpandir: boolean;
  aoAlternarRecolhido: () => void;
}

export function MenuLateral({ recolhido, podeExpandir, aoAlternarRecolhido }: MenuLateralProps) {
  const rotuloAlternar = recolhido ? 'Expandir menu' : 'Recolher menu';

  return (
    <aside
      id="menu-lateral"
      className={juntarClasses(estilos.menu, recolhido && estilos.recolhido)}
      aria-label="Navegação principal"
    >
      <div className={estilos.marca}>
        <Link to={caminhos.gerar} className={estilos.linkMarca} aria-label={`${NOME_APLICACAO}, ir para o Gerador`}>
          <span className={juntarClasses(estilos.simbolo, 'marca-em-transicao')}>
            <MarcaAegis tamanho={32} />
          </span>
          <span className={juntarClasses(estilos.nome, 'nome-em-transicao')} aria-hidden="true">
            {NOME_APLICACAO}
          </span>
        </Link>
      </div>

      <nav className={estilos.navegacao} aria-label="Ferramentas">
        <ul className={estilos.itens}>
          {navegacaoFerramentas.map((item) => (
            <li key={item.destino}>
              <ItemMenu item={item} recolhido={recolhido} />
            </li>
          ))}
        </ul>
      </nav>

      <div className={estilos.rodape}>
        <ItemMenu item={navegacaoConfiguracoes} recolhido={recolhido} />
        {podeExpandir ? (
          <button
            type="button"
            className={estilos.recolher}
            onClick={aoAlternarRecolhido}
            aria-label={rotuloAlternar}
            aria-expanded={!recolhido}
            aria-controls="menu-lateral"
            title={rotuloAlternar}
          >
            {recolhido ? (
              <PanelLeftOpen size={18} strokeWidth={2} aria-hidden="true" />
            ) : (
              <PanelLeftClose size={18} strokeWidth={2} aria-hidden="true" />
            )}
          </button>
        ) : null}
      </div>
    </aside>
  );
}

function ItemMenu({ item, recolhido }: { item: ItemNavegacao; recolhido: boolean }) {
  const Icone = item.icone;

  return (
    <NavLink
      to={item.destino}
      title={recolhido ? item.rotulo : undefined}
      aria-label={recolhido ? item.rotulo : undefined}
      className={({ isActive }) => juntarClasses(estilos.item, isActive && estilos.itemAtivo)}
    >
      <Icone className={estilos.iconeItem} size={18} strokeWidth={2} aria-hidden="true" />
      <span className={estilos.rotuloItem}>{item.rotulo}</span>
    </NavLink>
  );
}
