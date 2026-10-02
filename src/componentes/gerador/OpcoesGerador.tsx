import { ControleQuantidade, GrupoOpcoes, Interruptor, Nota } from '@/componentes/ui';
import { separadoresFrase } from '@/configuracoes/geracao';
import type { EstadoFinalidade } from '@/ganchos/useGerador';
import type { Finalidade, OpcoesFraseSenha, OpcoesPin, OpcoesSenha } from '@/modelos/senha';
import { LIMITES_PALAVRAS, SIMBOLOS_FRASE } from '@/regras/fraseSenha';
import { CONJUNTOS_CARACTERES, contarTiposSelecionados, LIMITES_TAMANHO_SENHA } from '@/regras/geradorSenha';
import { LIMITES_TAMANHO_PIN } from '@/regras/pin';
import { EscolhaFinalidade } from './EscolhaFinalidade';
import estilos from './OpcoesGerador.module.css';

const MOTIVO_ULTIMO_TIPO = 'Deixe pelo menos um tipo de caractere ligado.';

interface OpcoesSenhaProps {
  finalidade: EstadoFinalidade;
  opcoes: OpcoesSenha;
  aoEscolherFinalidade: (finalidade: Finalidade) => void;
  aoAjustar: (alteracao: Partial<OpcoesSenha>) => void;
}

export function OpcoesSenhaAleatoria({ finalidade, opcoes, aoEscolherFinalidade, aoAjustar }: OpcoesSenhaProps) {
  const ultimoTipo = contarTiposSelecionados(opcoes) === 1;
  const tipos: { chave: keyof OpcoesSenha; rotulo: string; amostra: string }[] = [
    { chave: 'usarMaiusculas', rotulo: 'Letras maiúsculas', amostra: 'A–Z' },
    { chave: 'usarMinusculas', rotulo: 'Letras minúsculas', amostra: 'a–z' },
    { chave: 'usarNumeros', rotulo: 'Números', amostra: '0–9' },
    { chave: 'usarSimbolos', rotulo: 'Símbolos', amostra: CONJUNTOS_CARACTERES.simbolos },
  ];

  return (
    <div className={estilos.opcoes}>
      <EscolhaFinalidade estado={finalidade} aoEscolher={aoEscolherFinalidade} />

      <div className={estilos.divisor} role="presentation" />

      <ControleQuantidade
        rotulo="Tamanho"
        unidade="caracteres"
        valor={opcoes.tamanho}
        minimo={LIMITES_TAMANHO_SENHA.minimo}
        maximo={LIMITES_TAMANHO_SENHA.maximo}
        aoMudar={(tamanho) => aoAjustar({ tamanho })}
      />

      <div className={estilos.lista}>
        {tipos.map(({ chave, rotulo, amostra }) => {
          const ligado = Boolean(opcoes[chave]);
          return (
            <Interruptor
              key={chave}
              rotulo={rotulo}
              amostra={amostra}
              ligado={ligado}
              bloqueado={ligado && ultimoTipo}
              motivoBloqueio={MOTIVO_ULTIMO_TIPO}
              aoMudar={(valor) => aoAjustar({ [chave]: valor })}
            />
          );
        })}
        <Interruptor
          rotulo="Excluir caracteres ambíguos"
          descricao="Sem O 0 o I l 1 | S 5 B 8, que se confundem ao ler"
          ligado={opcoes.evitarAmbiguos}
          aoMudar={(evitarAmbiguos) => aoAjustar({ evitarAmbiguos })}
        />
      </div>
    </div>
  );
}

interface OpcoesFraseProps {
  opcoes: OpcoesFraseSenha;
  aoAjustar: (alteracao: Partial<OpcoesFraseSenha>) => void;
}

export function OpcoesFrase({ opcoes, aoAjustar }: OpcoesFraseProps) {
  return (
    <div className={estilos.opcoes}>
      <Nota>
        <strong>Mais fácil de lembrar e de digitar.</strong> A frase-senha (passphrase) é a alternativa para senhas que
        você guarda de cabeça ou digita à mão, como a senha mestra do gerenciador.
      </Nota>

      <div className={estilos.divisor} role="presentation" />

      <ControleQuantidade
        rotulo="Quantidade de palavras"
        unidade="palavras"
        valor={opcoes.quantidadePalavras}
        minimo={LIMITES_PALAVRAS.minimo}
        maximo={LIMITES_PALAVRAS.maximo}
        aoMudar={(quantidadePalavras) => aoAjustar({ quantidadePalavras })}
      />
      <GrupoOpcoes
        legenda="Separador"
        opcoes={separadoresFrase}
        valor={opcoes.separador}
        aoMudar={(separador) => aoAjustar({ separador })}
      />
      <div className={estilos.lista}>
        <Interruptor
          rotulo="Iniciais maiúsculas"
          descricao="Neblina em vez de neblina"
          ligado={opcoes.iniciaisMaiusculas}
          aoMudar={(iniciaisMaiusculas) => aoAjustar({ iniciaisMaiusculas })}
        />
        <Interruptor
          rotulo="Incluir um número"
          descricao="Dois dígitos no fim, para sites que exigem números"
          ligado={opcoes.incluirNumero}
          aoMudar={(incluirNumero) => aoAjustar({ incluirNumero })}
        />
        <Interruptor
          rotulo="Incluir um símbolo"
          amostra={SIMBOLOS_FRASE}
          descricao="Um no fim, para sites que exigem símbolos"
          ligado={opcoes.incluirSimbolo}
          aoMudar={(incluirSimbolo) => aoAjustar({ incluirSimbolo })}
        />
      </div>
    </div>
  );
}

interface OpcoesPinProps {
  opcoes: OpcoesPin;
  aoAjustar: (alteracao: Partial<OpcoesPin>) => void;
}

export function OpcoesPinNumerico({ opcoes, aoAjustar }: OpcoesPinProps) {
  return (
    <div className={estilos.opcoes}>
      <ControleQuantidade
        rotulo="Quantidade de dígitos"
        unidade="dígitos"
        valor={opcoes.tamanho}
        minimo={LIMITES_TAMANHO_PIN.minimo}
        maximo={LIMITES_TAMANHO_PIN.maximo}
        aoMudar={(tamanho) => aoAjustar({ tamanho })}
      />
    </div>
  );
}
