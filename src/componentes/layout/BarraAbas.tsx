import { NavLink } from 'react-router-dom';
import { navegacaoCompleta } from '@/configuracoes/navegacao';
import { juntarClasses } from '@/utilitarios/juntarClasses';
import estilos from './BarraAbas.module.css';

export function BarraAbas() {
  return (
    <nav className={estilos.barra} aria-label="Principal">
      <ul className={estilos.lista}>
        {navegacaoCompleta.map(({ rotulo, icone: Icone, destino }) => (
          <li key={destino} className={estilos.celula}>
            <NavLink to={destino} className={({ isActive }) => juntarClasses(estilos.item, isActive && estilos.ativo)}>
              <span className={estilos.pilula} aria-hidden="true">
                <Icone size={20} strokeWidth={2} />
              </span>
              <span className={estilos.rotulo}>{rotulo}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
