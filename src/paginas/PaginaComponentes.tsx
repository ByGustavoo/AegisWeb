import { useState } from 'react';
import type { ReactNode } from 'react';
import { Copy, RefreshCw, Trash2 } from 'lucide-react';
import { CabecalhoPagina } from '@/componentes/layout/CabecalhoPagina';
import { MedidorForca } from '@/componentes/senha/MedidorForca';
import { LegendaCaracteres, VisorSenha } from '@/componentes/senha/VisorSenha';
import { Abas, Botao, BotaoIcone, CabecalhoPainel, CampoSenha, Esqueleto, Painel, Selo } from '@/componentes/ui';
import { NIVEIS_FORCA } from '@/configuracoes/forca';
import { useTituloDocumento } from '@/ganchos/useTituloDocumento';
import estilos from './PaginaComponentes.module.css';

const coresBase = ['fundo', 'superficie', 'superficie-suave', 'borda', 'borda-forte', 'texto', 'texto-secundario', 'texto-terciario'];
const coresMarca = ['destaque', 'destaque-forte', 'destaque-suave', 'caractere-numero', 'caractere-simbolo'];
const coresForca = NIVEIS_FORCA.map((nivel) => `forca-${nivel}`);
const tamanhosTexto = ['xs', 'sm', 'base', 'md', 'lg', 'xl', '2xl', '3xl', 'destaque'];

function Bloco({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <Painel aria-label={titulo}>
      <CabecalhoPainel titulo={titulo} />
      {children}
    </Painel>
  );
}

function Amostras({ cores }: { cores: string[] }) {
  return (
    <ul className={estilos.amostras}>
      {cores.map((cor) => (
        <li key={cor} className={estilos.amostra}>
          <span className={estilos.cor} style={{ backgroundColor: `var(--${cor})` }} />
          <code className="mono">--{cor}</code>
        </li>
      ))}
    </ul>
  );
}

export default function PaginaComponentes() {
  useTituloDocumento('Componentes');
  const [aba, setAba] = useState('senha');
  const [senha, setSenha] = useState('Correto#Cavalo9');

  return (
    <>
      <CabecalhoPagina
        sobretitulo="Desenvolvimento"
        titulo="Componentes"
        descricao="Tokens e componentes do Aegis. Esta página existe só no ambiente de desenvolvimento."
      />

      <div className={estilos.blocos}>
        <Bloco titulo="Cores">
          <div className={estilos.grupos}>
            <Amostras cores={coresBase} />
            <Amostras cores={coresMarca} />
            <Amostras cores={coresForca} />
          </div>
        </Bloco>

        <Bloco titulo="Tipografia">
          <ul className={estilos.tipos}>
            {tamanhosTexto.map((tamanho) => (
              <li key={tamanho} className={estilos.tipo}>
                <code className="mono">--tamanho-{tamanho}</code>
                <span style={{ fontSize: `var(--tamanho-${tamanho})` }}>Senhas fortes</span>
              </li>
            ))}
          </ul>
        </Bloco>

        <Bloco titulo="Botões">
          <div className={estilos.linha}>
            <Botao icone={Copy}>Copiar</Botao>
            <Botao variante="secundario" icone={RefreshCw}>
              Gerar outra
            </Botao>
            <Botao variante="terciario">Cancelar</Botao>
            <Botao variante="perigo" icone={Trash2}>
              Limpar histórico
            </Botao>
            <Botao carregando>Verificando</Botao>
            <Botao disabled>Desabilitado</Botao>
            <BotaoIcone icone={Copy} rotulo="Copiar senha" />
            <BotaoIcone icone={RefreshCw} rotulo="Gerar outra" variante="secundario" />
          </div>
          <div className={estilos.linha}>
            <Botao tamanho="sm">Pequeno</Botao>
            <Botao>Médio</Botao>
            <Botao tamanho="lg">Grande</Botao>
          </div>
        </Bloco>

        <Bloco titulo="Selos">
          <div className={estilos.linha}>
            <Selo>Neutro</Selo>
            <Selo tom="destaque">Prévia</Selo>
            <Selo tom="sucesso">Sem vazamentos</Selo>
            <Selo tom="aviso">Reutilizada</Selo>
            <Selo tom="erro">Vazada</Selo>
            <Selo tom="info">Opcional</Selo>
          </div>
        </Bloco>

        <Bloco titulo="Abas">
          <Abas
            idBase="abas-componentes"
            rotulo="Exemplo de abas"
            valor={aba}
            aoMudar={setAba}
            opcoes={[
              { valor: 'senha', rotulo: 'Senha' },
              { valor: 'frase', rotulo: 'Frase-senha' },
              { valor: 'pin', rotulo: 'PIN' },
            ]}
          />
        </Bloco>

        <Bloco titulo="Visor de senha">
          <div className={estilos.pilha}>
            <VisorSenha valor="k7#Qm-vR2p!xLw9$eTa4" />
            <VisorSenha valor="Neblina-Trilho-Cobalto-Farol-42" tamanho="normal" quebraLivre={false} />
            <LegendaCaracteres />
          </div>
        </Bloco>

        <Bloco titulo="Medidor de força">
          <div className={estilos.medidores}>
            <MedidorForca nivel={null} />
            {NIVEIS_FORCA.map((nivel) => (
              <MedidorForca key={nivel} nivel={nivel} />
            ))}
          </div>
        </Bloco>

        <Bloco titulo="Campo de senha">
          <CampoSenha rotulo="Senha" descricao="Texto de apoio do campo." valor={senha} aoMudar={setSenha} />
        </Bloco>

        <Bloco titulo="Esqueletos">
          <div className={estilos.pilha}>
            <Esqueleto largura="60%" />
            <Esqueleto largura="40%" />
            <Esqueleto altura="6px" arredondado animado={false} />
          </div>
        </Bloco>
      </div>
    </>
  );
}
