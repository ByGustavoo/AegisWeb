import { SecaoAparencia } from '@/componentes/configuracoes/SecaoAparencia';
import { SecaoPrivacidade } from '@/componentes/configuracoes/SecaoPrivacidade';
import { SecaoSobre } from '@/componentes/configuracoes/SecaoSobre';
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
        <SecaoAparencia idTitulo="titulo-aparencia" />
        <SecaoPrivacidade idTitulo="titulo-privacidade" />
        <SecaoSobre idTitulo="titulo-sobre" />
      </div>
    </>
  );
}
