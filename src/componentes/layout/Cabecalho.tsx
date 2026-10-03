import { Link } from 'react-router-dom';
import { MarcaAegis } from '@/componentes/comum/MarcaAegis';
import { NomeAegis } from '@/componentes/comum/NomeAegis';
import { NOME_APLICACAO } from '@/configuracoes/aplicacao';
import { caminhos } from '@/rotas/caminhos';
import { juntarClasses } from '@/utilitarios/juntarClasses';
import { BotaoTema } from './BotaoTema';
import estilos from './Cabecalho.module.css';

export function Cabecalho() {
  return (
    <header className={estilos.cabecalho}>
      <div className={estilos.interno}>
        <Link to={caminhos.gerar} className={estilos.marca} aria-label={`${NOME_APLICACAO}, ir para o Gerador`}>
          <span className={juntarClasses(estilos.simbolo, 'marca-em-transicao')}>
            <MarcaAegis tamanho={28} />
          </span>
          <NomeAegis className={juntarClasses(estilos.nome, 'nome-em-transicao')} />
        </Link>

        <div className={estilos.acoes}>
          <BotaoTema />
        </div>
      </div>
    </header>
  );
}
