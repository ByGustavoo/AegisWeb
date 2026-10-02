import { Link } from 'react-router-dom';
import { selosPrivacidade } from '@/configuracoes/privacidade';
import { ancoras, caminhos } from '@/rotas/caminhos';
import { juntarClasses } from '@/utilitarios/juntarClasses';
import estilos from './SelosPrivacidade.module.css';

export function SelosPrivacidade({ className }: { className?: string }) {
  return (
    <div className={juntarClasses(estilos.selos, className)}>
      <ul className={estilos.lista} aria-label="Privacidade">
        {selosPrivacidade.map(({ icone: Icone, rotulo }) => (
          <li key={rotulo} className={estilos.item}>
            <Icone size={14} strokeWidth={2} aria-hidden="true" className={estilos.icone} />
            {rotulo}
          </li>
        ))}
      </ul>
      <Link to={`${caminhos.configuracoes}#${ancoras.privacidade}`} className={estilos.link}>
        Como funciona
      </Link>
    </div>
  );
}
