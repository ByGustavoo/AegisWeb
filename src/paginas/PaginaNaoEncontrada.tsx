import { useEffect, useRef, useState } from 'react';
import type { AnimationEvent, CSSProperties } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CircleHelp, KeyRound } from 'lucide-react';
import { MarcaAegis } from '@/componentes/comum/MarcaAegis';
import { NomeAegis } from '@/componentes/comum/NomeAegis';
import { VisorSenha } from '@/componentes/senha/VisorSenha';
import { Botao } from '@/componentes/ui';
import { ID_CONTEUDO_PRINCIPAL, NOME_APLICACAO, SLOGAN_APLICACAO } from '@/configuracoes/aplicacao';
import { NIVEIS_FORCA, niveisForca } from '@/configuracoes/forca';
import { navegacaoCompleta } from '@/configuracoes/navegacao';
import { useTituloDocumento } from '@/ganchos/useTituloDocumento';
import type { ClasseCaractere } from '@/modelos/senha';
import { embaralhar, escolher } from '@/regras/aleatorio';
import { classificarCaractere } from '@/regras/caracteres';
import { CONJUNTOS_CARACTERES } from '@/regras/geradorSenha';
import { caminhos } from '@/rotas/caminhos';
import { juntarClasses } from '@/utilitarios/juntarClasses';
import estilos from './PaginaNaoEncontrada.module.css';

const atalhos = navegacaoCompleta.filter((item) => item.destino !== caminhos.gerar);

const CICLO_MS = 7200;
const ATRASO_ENTRE_CELULAS_MS = 180;
const MOMENTO_DA_TROCA_NO_CICLO = 0.55;

const CODIGO = '404';
const TENTATIVAS_POR_CLASSE = 2;
const SIMBOLOS_DAS_TENTATIVAS = '!@#$%&*+=?';

const FONTES_DAS_TENTATIVAS: string[][] = [
  [...CONJUNTOS_CARACTERES.maiusculas, ...CONJUNTOS_CARACTERES.minusculas],
  [...CONJUNTOS_CARACTERES.numeros].filter((numero) => !CODIGO.includes(numero)),
  [...SIMBOLOS_DAS_TENTATIVAS],
];

const INDICE_DO_CODIGO = FONTES_DAS_TENTATIVAS.length * TENTATIVAS_POR_CLASSE;

const NIVEL_FORA_DO_CODIGO = niveisForca[5];
const CONTAGEM_DA_NOTA: number[] = [...[...NIVEIS_FORCA].reverse(), 0, ...NIVEIS_FORCA];

function sortearTentativas(): string[] {
  return embaralhar(
    FONTES_DAS_TENTATIVAS.flatMap((fonte) => Array.from({ length: TENTATIVAS_POR_CLASSE }, () => escolher(fonte))),
  );
}

function sortearRodas(): string[][] {
  return [...CODIGO].map((digito) => {
    const tentativas = sortearTentativas();
    return [...tentativas, digito, ...tentativas.slice(0, 1)];
  });
}

const classesPorTipo: Record<ClasseCaractere, string | undefined> = {
  LETRA: estilos.letra,
  NUMERO: estilos.numero,
  SIMBOLO: estilos.simbolo,
  ESPACO: undefined,
};

function comIndice(indice: number): CSSProperties {
  return { '--indice': indice } as CSSProperties;
}

function comAtraso(atrasoMs: number): CSSProperties {
  return { '--atraso': `${atrasoMs}ms` } as CSSProperties;
}

function CombinacaoSemCorrespondencia() {
  const [rodas, setRodas] = useState(sortearRodas);
  const trocaAgendada = useRef<number>();

  useEffect(() => () => window.clearTimeout(trocaAgendada.current), []);

  const agendarTrocaDasTentativas = (evento: AnimationEvent<HTMLDivElement>) => {
    if (!(evento.target instanceof HTMLElement) || evento.target.dataset.roda !== '0') return;
    window.clearTimeout(trocaAgendada.current);
    trocaAgendada.current = window.setTimeout(() => setRodas(sortearRodas()), CICLO_MS * MOMENTO_DA_TROCA_NO_CICLO);
  };

  const IconeForaDoCodigo = NIVEL_FORA_DO_CODIGO.icone;

  const estiloCena = {
    '--ciclo': `${CICLO_MS}ms`,
    '--indice-do-codigo': INDICE_DO_CODIGO,
    '--cor-nivel': NIVEL_FORA_DO_CODIGO.cor,
  } as CSSProperties;

  return (
    <div className={estilos.cena} style={estiloCena} aria-hidden="true">
      <div
        className={juntarClasses(estilos.combinacao, 'mono')}
        translate="no"
        onAnimationStart={agendarTrocaDasTentativas}
        onAnimationIteration={agendarTrocaDasTentativas}
      >
        {rodas.map((roda, indiceCelula) => (
          <span key={indiceCelula} className={estilos.celula}>
            <span className={estilos.janela}>
              <span
                className={estilos.roda}
                style={comAtraso(indiceCelula * ATRASO_ENTRE_CELULAS_MS)}
                data-roda={indiceCelula}
              >
                {roda.map((caractere, posicao) => (
                  <span
                    key={posicao}
                    className={juntarClasses(estilos.caractere, classesPorTipo[classificarCaractere(caractere)])}
                  >
                    {caractere}
                  </span>
                ))}
              </span>
            </span>
          </span>
        ))}
      </div>

      <div className={estilos.medidor}>
        <div className={estilos.topoMedidor}>
          <span className={estilos.estados}>
            <span className={juntarClasses(estilos.rotuloMedidor, estilos.estadoForte)}>
              <IconeForaDoCodigo size={20} strokeWidth={2} />
              {NIVEL_FORA_DO_CODIGO.rotulo}
            </span>
            <span className={juntarClasses(estilos.rotuloMedidor, estilos.estadoVeredito)}>
              <CircleHelp className={estilos.iconeVeredito} size={20} strokeWidth={2} />
              Sem correspondência
            </span>
          </span>
          <span className={juntarClasses(estilos.nota, 'mono')}>
            <span className={estilos.janelaNota}>
              <span className={estilos.rodaNota}>
                {CONTAGEM_DA_NOTA.map((valor, posicao) => (
                  <span key={posicao} className={estilos.algarismoNota}>
                    {valor}
                  </span>
                ))}
              </span>
            </span>
            /{NIVEIS_FORCA.length}
          </span>
        </div>
        <div className={estilos.trilho}>
          {NIVEIS_FORCA.map((nivel) => (
            <span key={nivel} className={estilos.segmento} />
          ))}
          <div className={estilos.preenchimento}>
            {NIVEIS_FORCA.map((nivel) => (
              <span key={nivel} className={estilos.segmentoCheio} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaginaNaoEncontrada() {
  const navegar = useNavigate();
  const localizacao = useLocation();
  useTituloDocumento('Página não encontrada');

  const podeVoltar = localizacao.key !== 'default';

  return (
    <div className={estilos.tela}>
      <Link className={estilos.marca} to={caminhos.gerar} aria-label={`${NOME_APLICACAO}, ir para o Gerador`}>
        <span className={estilos.linhaMarca}>
          <span className={juntarClasses(estilos.simboloMarca, 'marca-em-transicao')}>
            <MarcaAegis tamanho={32} />
          </span>
          <NomeAegis className={juntarClasses(estilos.nomeMarca, 'nome-em-transicao')} />
        </span>
        <span className={estilos.sloganMarca}>{SLOGAN_APLICACAO}</span>
      </Link>

      <main className={estilos.cartao} id={ID_CONTEUDO_PRINCIPAL}>
        <div className={estilos.palco}>
          <CombinacaoSemCorrespondencia />
        </div>

        <div className={estilos.conteudo}>
          <h1 className={juntarClasses(estilos.titulo, estilos.entra)} style={comIndice(0)}>
            Página não encontrada
          </h1>

          <p className={juntarClasses(estilos.descricao, estilos.entra)} style={comIndice(1)}>
            Nenhuma combinação abre o endereço{' '}
            <code className={estilos.endereco}>
              <VisorSenha
                valor={localizacao.pathname}
                tamanho="normal"
                quebraLivre={false}
                className={estilos.enderecoVisor}
              />
            </code>
            . Ele pode ter sido digitado com um erro ou pertencer a uma tela que mudou de lugar.
          </p>

          <div className={juntarClasses(estilos.acoes, estilos.entra)} style={comIndice(2)}>
            <Botao icone={KeyRound} onClick={() => navegar(caminhos.gerar)}>
              Ir para o gerador
            </Botao>
            {podeVoltar ? (
              <Botao variante="secundario" icone={ArrowLeft} onClick={() => navegar(-1)}>
                Voltar
              </Botao>
            ) : null}
          </div>

          <nav className={juntarClasses(estilos.atalhos, estilos.entra)} style={comIndice(3)} aria-label="Atalhos">
            <span className={estilos.rotuloAtalhos}>Talvez você procure</span>
            <ul className={estilos.links}>
              {atalhos.map(({ rotulo, destino }) => (
                <li key={destino}>
                  <Link className={estilos.link} to={destino}>
                    {rotulo}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </main>
    </div>
  );
}
