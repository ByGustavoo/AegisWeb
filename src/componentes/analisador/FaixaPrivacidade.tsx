import { ShieldCheck } from 'lucide-react';
import { garantiasPrivacidade } from '@/configuracoes/analise';
import estilos from './FaixaPrivacidade.module.css';

export function FaixaPrivacidade() {
  return (
    <section className={estilos.faixa} aria-labelledby="titulo-privacidade">
      <div className={estilos.selo}>
        <span className={estilos.iconeSelo} aria-hidden="true">
          <ShieldCheck size={20} strokeWidth={2} />
        </span>
        <h2 id="titulo-privacidade" className={estilos.titulo}>
          Sua senha não sai deste aparelho
        </h2>
      </div>
      <ul className={estilos.garantias}>
        {garantiasPrivacidade.map(({ icone: Icone, titulo, descricao }) => (
          <li key={titulo} className={estilos.garantia}>
            <Icone size={16} strokeWidth={2} className={estilos.iconeGarantia} aria-hidden="true" />
            <span>
              <strong className={estilos.tituloGarantia}>{titulo}</strong>
              <span className={estilos.descricaoGarantia}>. {descricao}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
