import { SecaoAparencia } from '@/componentes/configuracoes/SecaoAparencia';
import { SecaoPrivacidade } from '@/componentes/configuracoes/SecaoPrivacidade';
import { SecaoVersoes } from '@/componentes/configuracoes/SecaoVersoes';
import { CabecalhoPagina } from '@/componentes/layout/CabecalhoPagina';
import { useTituloDocumento } from '@/ganchos/useTituloDocumento';
import estilos from './PaginaConfiguracoes.module.css';

export default function PaginaConfiguracoes() {
  useTituloDocumento('Configurações');

  return (
    <>
      <CabecalhoPagina
        sobretitulo="Preferências"
        titulo="Configurações"
        descricao="Aparência do aplicativo e o que acontece com as suas senhas."
      />
      <div className={estilos.secoes}>
        <div className={estilos.linhaSuperior}>
          <SecaoAparencia idTitulo="titulo-aparencia" indiceCascata={3} />
          <SecaoVersoes idTitulo="titulo-versoes" indiceCascata={4} />
        </div>
        <SecaoPrivacidade idTitulo="titulo-privacidade" indiceCascata={5} />
      </div>
    </>
  );
}
