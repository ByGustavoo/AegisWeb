import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { CabecalhoPainel, Painel } from '@/componentes/ui';
import { compromissosPrivacidade } from '@/configuracoes/privacidade';
import { ancoras } from '@/rotas/caminhos';
import type { SecaoConfiguracaoProps } from './SecaoAparencia';
import estilos from './SecaoPrivacidade.module.css';

export function SecaoPrivacidade({ idTitulo }: SecaoConfiguracaoProps) {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash !== `#${ancoras.privacidade}`) return undefined;
    const quadro = window.requestAnimationFrame(() => {
      const secao = document.getElementById(ancoras.privacidade);
      secao?.scrollIntoView({ block: 'start' });
      secao?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(quadro);
  }, [hash]);

  return (
    <Painel id={ancoras.privacidade} tabIndex={-1} className={estilos.secao} aria-labelledby={idTitulo}>
      <CabecalhoPainel
        titulo={<span id={idTitulo}>Privacidade</span>}
        descricao="O que acontece com as senhas que passam por aqui."
      />
      <ul className={estilos.lista}>
        {compromissosPrivacidade.map(({ icone: Icone, rotulo, descricao }) => (
          <li key={rotulo} className={estilos.item}>
            <span className={estilos.icone} aria-hidden="true">
              <Icone size={18} strokeWidth={2} />
            </span>
            <span className={estilos.textos}>
              <span className={estilos.titulo}>{rotulo}</span>
              <span className={estilos.descricao}>{descricao}</span>
            </span>
          </li>
        ))}
      </ul>
    </Painel>
  );
}
