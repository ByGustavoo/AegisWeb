import { useEffect, useState } from 'react';
import { GlobeLock, ScanSearch } from 'lucide-react';
import { CabecalhoPagina } from '@/componentes/layout/CabecalhoPagina';
import { MedidorForca } from '@/componentes/senha/MedidorForca';
import { CabecalhoPainel, CampoSenha, EstadoMensagem, Painel, Selo } from '@/componentes/ui';
import { useTituloDocumento } from '@/ganchos/useTituloDocumento';
import { useSenhaParaAnalise } from '@/provedores/ProvedorSenhaParaAnalise';
import estilos from './PaginaAnalisador.module.css';

const metricasPrevistas = [
  { rotulo: 'Entropia', detalhe: 'Quantos palpites, em bits, seriam necessários.' },
  { rotulo: 'Tempo estimado para quebrar', detalhe: 'Num ataque a um banco de senhas vazado.' },
  { rotulo: 'Padrões encontrados', detalhe: 'Palavras comuns, sequências, datas e repetições.' },
];

export default function PaginaAnalisador() {
  useTituloDocumento('Analisar senha');
  const [senha, setSenha] = useState('');
  const { retirar } = useSenhaParaAnalise();

  useEffect(() => {
    const encaminhada = retirar();
    if (encaminhada) setSenha(encaminhada);
  }, [retirar]);

  const preenchida = senha.length > 0;

  return (
    <>
      <CabecalhoPagina
        sobretitulo="Analisador"
        titulo="Analisar senha"
        descricao="Descubra quanto uma senha resiste a um ataque e o que melhorar nela. A senha não sai deste aparelho."
      />

      <div className={estilos.grade}>
        <div className={estilos.coluna}>
          <Painel aria-labelledby="titulo-entrada">
            <CabecalhoPainel titulo={<span id="titulo-entrada">Sua senha</span>} />
            <CampoSenha
              rotulo="Senha para analisar"
              descricao="Fica só na memória desta página e some quando você sai dela."
              valor={senha}
              aoMudar={setSenha}
              placeholder="Digite ou cole aqui"
            />
          </Painel>

          <Painel tom="suave" aria-labelledby="titulo-vazamento">
            <CabecalhoPainel
              nivel={2}
              titulo={<span id="titulo-vazamento">Vazamentos conhecidos</span>}
              acao={<Selo>Opcional</Selo>}
            />
            <div className={estilos.vazamento}>
              <span className={estilos.iconeVazamento} aria-hidden="true">
                <GlobeLock size={18} strokeWidth={2} />
              </span>
              <p className={estilos.textoVazamento}>
                Confira se a senha já apareceu em algum vazamento público. Só os 5 primeiros caracteres do hash dela
                são enviados, e só quando você pedir. Chega na próxima fase.
              </p>
            </div>
          </Painel>
        </div>

        <Painel className={estilos.resultado} aria-labelledby="titulo-resultado">
          <CabecalhoPainel titulo={<span id="titulo-resultado">Resultado</span>} />
          <MedidorForca nivel={null} />

          <dl className={estilos.metricas}>
            {metricasPrevistas.map((metrica) => (
              <div key={metrica.rotulo} className={estilos.metrica}>
                <dt className={estilos.rotuloMetrica}>
                  {metrica.rotulo}
                  <span className={estilos.detalheMetrica}>{metrica.detalhe}</span>
                </dt>
                <dd className={estilos.valorMetrica}>
                  <span aria-hidden="true">—</span>
                  <span className="visualmente-oculto">Sem análise</span>
                </dd>
              </div>
            ))}
          </dl>

          <div aria-live="polite">
            <EstadoMensagem
              compacto
              icone={ScanSearch}
              titulo={preenchida ? 'A análise detalhada chega na próxima fase' : 'Digite uma senha para ver a análise'}
              descricao={
                preenchida
                  ? 'A força, o tempo estimado e os padrões vão aparecer aqui enquanto você digita.'
                  : 'O resultado aparece aqui enquanto você digita, sem precisar enviar nada.'
              }
            />
          </div>
        </Painel>
      </div>
    </>
  );
}
