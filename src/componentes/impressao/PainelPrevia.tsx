import type { CSSProperties } from 'react';
import { FileDown, FileText, ShieldAlert, TriangleAlert } from 'lucide-react';
import { Botao, CabecalhoPainel, EstadoMensagem, Esqueleto, Nota, Painel } from '@/componentes/ui';
import type { FaseDocumento } from '@/ganchos/useDocumentoImpresso';
import type { DocumentoImpresso } from '@/modelos/impressao';
import { juntarClasses } from '@/utilitarios/juntarClasses';
import { PaginaPrevia } from './PaginaPrevia';
import estilos from './PainelPrevia.module.css';

export type EstadoDownload =
  | { fase: 'OCIOSO' }
  | { fase: 'GERANDO' }
  | { fase: 'BAIXADO'; arquivo: string }
  | { fase: 'FALHOU' };

interface PainelPreviaProps {
  id: string;
  documento: DocumentoImpresso | null;
  fase: FaseDocumento;
  valoresOcultos: boolean;
  download: EstadoDownload;
  aoBaixar: () => void;
  className?: string;
  style?: CSSProperties;
}

function plural(quantidade: number, singular: string, pluralizado: string): string {
  return `${quantidade} ${quantidade === 1 ? singular : pluralizado}`;
}

function resumo(documento: DocumentoImpresso | null): string {
  if (!documento || documento.paginas.length === 0) return 'Papel A4. Nenhuma conta preenchida ainda.';
  return `Papel A4 · ${plural(documento.paginas.length, 'página', 'páginas')} · ${plural(documento.totalContas, 'conta', 'contas')}`;
}

function mensagemDownload(download: EstadoDownload): string {
  if (download.fase === 'GERANDO') return 'Montando o PDF neste navegador…';
  if (download.fase === 'BAIXADO') return `PDF gerado como ${download.arquivo}. Confira a pasta de downloads.`;
  if (download.fase === 'FALHOU') {
    return 'Não foi possível gerar o PDF: as fontes do documento não carregaram. Confira a conexão e tente de novo.';
  }
  return '';
}

export function PainelPrevia({ id, documento, fase, valoresOcultos, download, aoBaixar, className, style }: PainelPreviaProps) {
  const paginas = documento?.paginas ?? [];
  const temPaginas = paginas.length > 0;
  const mensagem = mensagemDownload(download);

  return (
    <Painel
      id={id}
      tabIndex={-1}
      className={juntarClasses(estilos.painel, className)}
      style={style}
      aria-labelledby="titulo-previa"
    >
      <CabecalhoPainel titulo={<span id="titulo-previa">Prévia do PDF</span>} descricao={resumo(documento)} />

      <div className={estilos.baixar}>
        <Botao
          tamanho="lg"
          larguraTotal
          icone={FileDown}
          carregando={download.fase === 'GERANDO'}
          disabled={!temPaginas}
          onClick={aoBaixar}
        >
          Baixar PDF
        </Botao>
        <p
          className={juntarClasses(estilos.estado, download.fase === 'FALHOU' && estilos.falhou)}
          role="status"
          aria-live="polite"
        >
          {download.fase === 'FALHOU' ? <TriangleAlert size={14} strokeWidth={2} aria-hidden="true" /> : null}
          {mensagem || (temPaginas ? null : 'Preencha o valor de pelo menos um campo para liberar o download.')}
        </p>
      </div>

      <Nota icone={ShieldAlert} className={estilos.aviso}>
        <strong>O PDF não tem senha de proteção</strong> e mostra todos os valores preenchidos. Guarde o arquivo em
        local seguro e apague-o do computador depois de imprimir.
      </Nota>

      <div className={estilos.paginas} tabIndex={temPaginas ? 0 : undefined} aria-label="Páginas do PDF" role="region">
        {fase === 'PREPARANDO' ? <Esqueleto altura="auto" className={estilos.esqueleto} /> : null}
        {fase === 'FALHOU' ? (
          <EstadoMensagem
            compacto
            className={estilos.estadoCentral}
            icone={TriangleAlert}
            titulo="A prévia não carregou"
            descricao="As fontes do documento não puderam ser medidas neste navegador. Recarregue a página para tentar de novo."
          />
        ) : null}
        {fase === 'PRONTO' && !temPaginas ? (
          <EstadoMensagem
            compacto
            className={estilos.estadoCentral}
            icone={FileText}
            titulo="A prévia aparece aqui"
            descricao="Cada conta vira um cartão na folha A4. Campos sem valor ficam de fora."
          />
        ) : null}
        {paginas.map((pagina, indice) => {
          const rotulo = `Página ${indice + 1} de ${paginas.length}`;
          return (
            <figure key={indice} className={estilos.figura}>
              <PaginaPrevia
                pagina={pagina}
                largura={documento?.largura ?? 0}
                altura={documento?.altura ?? 0}
                rotulo={rotulo}
                valoresOcultos={valoresOcultos}
              />
              <figcaption className={estilos.legenda} aria-hidden="true">
                {rotulo}
              </figcaption>
            </figure>
          );
        })}
      </div>
    </Painel>
  );
}
