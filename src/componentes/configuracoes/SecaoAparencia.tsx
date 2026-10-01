import { useId } from 'react';
import { CabecalhoPainel, Painel } from '@/componentes/ui';
import { NOME_APLICACAO } from '@/configuracoes/aplicacao';
import type { ModoTema, TemaAplicado } from '@/provedores/ProvedorTema';
import { useTema } from '@/provedores/ProvedorTema';
import { juntarClasses } from '@/utilitarios/juntarClasses';
import estilos from './SecaoAparencia.module.css';

interface OpcaoTema {
  modo: ModoTema;
  rotulo: string;
  descricao: (temaDoSistema: TemaAplicado) => string;
}

const opcoesTema: OpcaoTema[] = [
  { modo: 'claro', rotulo: 'Claro', descricao: () => 'Fundo claro o tempo todo.' },
  { modo: 'escuro', rotulo: 'Escuro', descricao: () => 'Fundo escuro o tempo todo.' },
  {
    modo: 'sistema',
    rotulo: 'Automático',
    descricao: (temaDoSistema) =>
      `Acompanha o seu aparelho. Agora está ${temaDoSistema === 'escuro' ? 'escuro' : 'claro'}.`,
  },
];

function Miniatura({ tema }: { tema: TemaAplicado }) {
  return (
    <span className={juntarClasses(estilos.miniatura, tema === 'escuro' ? estilos.miniaturaEscura : estilos.miniaturaClara)}>
      <span className={estilos.miniMenu}>
        <span className={estilos.miniMarca} />
        <span className={estilos.miniItemAtivo} />
        <span className={estilos.miniItem} />
      </span>
      <span className={estilos.miniConteudo}>
        <span className={estilos.miniVisor}>
          <span className={estilos.miniSenha} />
          <span className={estilos.miniForca} />
        </span>
        <span className={estilos.miniLateral}>
          <span className={estilos.miniLinha} />
          <span className={estilos.miniLinhaCurta} />
          <span className={estilos.miniLinha} />
        </span>
      </span>
    </span>
  );
}

export interface SecaoConfiguracaoProps {
  idTitulo: string;
}

export function SecaoAparencia({ idTitulo }: SecaoConfiguracaoProps) {
  const { modo, temaDoSistema, definirModo } = useTema();
  const nomeGrupo = useId();

  return (
    <Painel aria-labelledby={idTitulo} className={estilos.secao}>
      <CabecalhoPainel
        titulo={<span id={idTitulo}>Aparência</span>}
        descricao={`Escolha como o ${NOME_APLICACAO} aparece para você. A mudança vale na hora e fica salva neste navegador.`}
      />

      <fieldset className={estilos.grupo}>
        <legend className="visualmente-oculto">Tema</legend>
        {opcoesTema.map((opcao) => {
          const selecionada = modo === opcao.modo;
          return (
            <label key={opcao.modo} className={juntarClasses(estilos.opcao, selecionada && estilos.selecionada)}>
              <input
                type="radio"
                name={nomeGrupo}
                value={opcao.modo}
                checked={selecionada}
                onChange={() => definirModo(opcao.modo)}
                className={estilos.entrada}
              />
              <span className={estilos.previa} aria-hidden="true">
                {opcao.modo === 'sistema' ? (
                  <span className={estilos.previaDividida}>
                    <Miniatura tema="claro" />
                    <span className={estilos.metadeEscura}>
                      <Miniatura tema="escuro" />
                    </span>
                  </span>
                ) : (
                  <Miniatura tema={opcao.modo} />
                )}
              </span>
              <span className={estilos.textos}>
                <span className={estilos.marcador} aria-hidden="true" />
                <span className={estilos.rotulo}>{opcao.rotulo}</span>
                <span className={estilos.descricao}>{opcao.descricao(temaDoSistema)}</span>
              </span>
            </label>
          );
        })}
      </fieldset>
    </Painel>
  );
}
