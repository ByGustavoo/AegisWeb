import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { CampoCredencial, ContaCredencial, FolhaCredenciais } from '@/modelos/impressao';
import { contaTemDados, folhaTemDados } from '@/regras/impressao/selecao';

export type RemocaoDesfazivel =
  | { tipo: 'CONTA'; indice: number; conta: ContaCredencial }
  | { tipo: 'CAMPO'; contaId: string; indice: number; campo: CampoCredencial };

export interface CampoInicial {
  nome: string;
  valor: string;
}

type AlteracaoCampo = Partial<Pick<CampoCredencial, 'nome' | 'valor'>>;

interface ValorContextoFolhaImpressao {
  folha: FolhaCredenciais;
  remocao: RemocaoDesfazivel | null;
  definirTitulo: (titulo: string) => void;
  definirLinhasParaPreencher: (ligado: boolean) => void;
  adicionarConta: (campos?: CampoInicial[]) => ContaCredencial;
  renomearConta: (contaId: string, titulo: string) => void;
  removerConta: (contaId: string) => void;
  moverConta: (contaId: string, deslocamento: number) => void;
  adicionarCampo: (contaId: string, nome?: string) => CampoCredencial;
  alterarCampo: (contaId: string, campoId: string, alteracao: AlteracaoCampo) => void;
  removerCampo: (contaId: string, campoId: string) => void;
  moverCampo: (contaId: string, campoId: string, deslocamento: number) => void;
  desfazerRemocao: () => void;
  esquecerRemocao: () => void;
  apagarTudo: () => void;
  encaminharSenha: (nome: string, valor: string) => void;
  retirarContaEncaminhada: () => string | null;
}

const FOLHA_VAZIA: FolhaCredenciais = { titulo: '', contas: [], linhasParaPreencher: false };

const ContextoFolhaImpressao = createContext<ValorContextoFolhaImpressao | null>(null);

function novoCampo(nome = '', valor = ''): CampoCredencial {
  return { id: crypto.randomUUID(), nome, valor };
}

function novaConta(campos: CampoInicial[] = [{ nome: '', valor: '' }]): ContaCredencial {
  return { id: crypto.randomUUID(), titulo: '', campos: campos.map(({ nome, valor }) => novoCampo(nome, valor)) };
}

function mover<T extends { id: string }>(itens: T[], id: string, deslocamento: number): T[] {
  const origem = itens.findIndex((item) => item.id === id);
  const destino = origem + deslocamento;
  if (origem < 0 || destino < 0 || destino >= itens.length) return itens;
  const copia = [...itens];
  const [item] = copia.splice(origem, 1);
  if (item) copia.splice(destino, 0, item);
  return copia;
}

function campoIntocado(campo: CampoCredencial | undefined): campo is CampoCredencial {
  return campo !== undefined && campo.nome.trim() === '' && campo.valor === '';
}

export function ProvedorFolhaImpressao({ children }: { children: ReactNode }) {
  const [folha, setFolha] = useState<FolhaCredenciais>(FOLHA_VAZIA);
  const [remocao, setRemocao] = useState<RemocaoDesfazivel | null>(null);
  const contaEncaminhada = useRef<string | null>(null);
  const temDados = folhaTemDados(folha);

  useEffect(() => {
    if (!temDados) return undefined;
    const avisarAntesDeSair = (evento: BeforeUnloadEvent) => {
      evento.preventDefault();
      evento.returnValue = '';
    };
    window.addEventListener('beforeunload', avisarAntesDeSair);
    return () => window.removeEventListener('beforeunload', avisarAntesDeSair);
  }, [temDados]);

  const alterarContas = useCallback((alterar: (contas: ContaCredencial[]) => ContaCredencial[]) => {
    setFolha((atual) => ({ ...atual, contas: alterar(atual.contas) }));
  }, []);

  const alterarConta = useCallback(
    (contaId: string, alterar: (conta: ContaCredencial) => ContaCredencial) => {
      alterarContas((contas) => contas.map((conta) => (conta.id === contaId ? alterar(conta) : conta)));
    },
    [alterarContas],
  );

  const definirTitulo = useCallback((titulo: string) => setFolha((atual) => ({ ...atual, titulo })), []);

  const definirLinhasParaPreencher = useCallback(
    (linhasParaPreencher: boolean) => setFolha((atual) => ({ ...atual, linhasParaPreencher })),
    [],
  );

  const adicionarConta = useCallback(
    (campos?: CampoInicial[]) => {
      const conta = novaConta(campos);
      alterarContas((contas) => [...contas, conta]);
      return conta;
    },
    [alterarContas],
  );

  const renomearConta = useCallback(
    (contaId: string, titulo: string) => alterarConta(contaId, (conta) => ({ ...conta, titulo })),
    [alterarConta],
  );

  const removerConta = useCallback(
    (contaId: string) => {
      const indice = folha.contas.findIndex((conta) => conta.id === contaId);
      const conta = folha.contas[indice];
      if (!conta) return;
      setRemocao(contaTemDados(conta) ? { tipo: 'CONTA', indice, conta } : null);
      alterarContas((contas) => contas.filter((item) => item.id !== contaId));
    },
    [alterarContas, folha.contas],
  );

  const moverConta = useCallback(
    (contaId: string, deslocamento: number) => alterarContas((contas) => mover(contas, contaId, deslocamento)),
    [alterarContas],
  );

  const adicionarCampo = useCallback(
    (contaId: string, nome?: string) => {
      const conta = folha.contas.find((item) => item.id === contaId);
      const ultimo = conta?.campos[conta.campos.length - 1];
      if (nome && campoIntocado(ultimo)) {
        alterarConta(contaId, (atual) => ({
          ...atual,
          campos: atual.campos.map((campo) => (campo.id === ultimo.id ? { ...campo, nome } : campo)),
        }));
        return { ...ultimo, nome };
      }
      const campo = novoCampo(nome);
      alterarConta(contaId, (atual) => ({ ...atual, campos: [...atual.campos, campo] }));
      return campo;
    },
    [alterarConta, folha.contas],
  );

  const alterarCampo = useCallback(
    (contaId: string, campoId: string, alteracao: AlteracaoCampo) =>
      alterarConta(contaId, (conta) => ({
        ...conta,
        campos: conta.campos.map((campo) => (campo.id === campoId ? { ...campo, ...alteracao } : campo)),
      })),
    [alterarConta],
  );

  const removerCampo = useCallback(
    (contaId: string, campoId: string) => {
      const conta = folha.contas.find((item) => item.id === contaId);
      const indice = conta?.campos.findIndex((campo) => campo.id === campoId) ?? -1;
      const campo = conta?.campos[indice];
      if (!campo) return;
      setRemocao(campo.nome.trim() || campo.valor ? { tipo: 'CAMPO', contaId, indice, campo } : null);
      alterarConta(contaId, (atual) => ({ ...atual, campos: atual.campos.filter((item) => item.id !== campoId) }));
    },
    [alterarConta, folha.contas],
  );

  const moverCampo = useCallback(
    (contaId: string, campoId: string, deslocamento: number) =>
      alterarConta(contaId, (conta) => ({ ...conta, campos: mover(conta.campos, campoId, deslocamento) })),
    [alterarConta],
  );

  const desfazerRemocao = useCallback(() => {
    if (!remocao) return;
    if (remocao.tipo === 'CONTA') {
      alterarContas((contas) => {
        const copia = [...contas];
        copia.splice(Math.min(remocao.indice, copia.length), 0, remocao.conta);
        return copia;
      });
    } else {
      alterarConta(remocao.contaId, (conta) => {
        const campos = [...conta.campos];
        campos.splice(Math.min(remocao.indice, campos.length), 0, remocao.campo);
        return { ...conta, campos };
      });
    }
    setRemocao(null);
  }, [alterarConta, alterarContas, remocao]);

  const esquecerRemocao = useCallback(() => setRemocao(null), []);

  const apagarTudo = useCallback(() => {
    setFolha(FOLHA_VAZIA);
    setRemocao(null);
    contaEncaminhada.current = null;
  }, []);

  const encaminharSenha = useCallback(
    (nome: string, valor: string) => {
      const conta = novaConta([{ nome, valor }]);
      alterarContas((contas) => [...contas, conta]);
      contaEncaminhada.current = conta.id;
    },
    [alterarContas],
  );

  const retirarContaEncaminhada = useCallback(() => {
    const id = contaEncaminhada.current;
    contaEncaminhada.current = null;
    return id;
  }, []);

  const valor = useMemo(
    () => ({
      folha,
      remocao,
      definirTitulo,
      definirLinhasParaPreencher,
      adicionarConta,
      renomearConta,
      removerConta,
      moverConta,
      adicionarCampo,
      alterarCampo,
      removerCampo,
      moverCampo,
      desfazerRemocao,
      esquecerRemocao,
      apagarTudo,
      encaminharSenha,
      retirarContaEncaminhada,
    }),
    [
      folha,
      remocao,
      definirTitulo,
      definirLinhasParaPreencher,
      adicionarConta,
      renomearConta,
      removerConta,
      moverConta,
      adicionarCampo,
      alterarCampo,
      removerCampo,
      moverCampo,
      desfazerRemocao,
      esquecerRemocao,
      apagarTudo,
      encaminharSenha,
      retirarContaEncaminhada,
    ],
  );

  return <ContextoFolhaImpressao.Provider value={valor}>{children}</ContextoFolhaImpressao.Provider>;
}

export function useFolhaImpressao(): ValorContextoFolhaImpressao {
  const contexto = useContext(ContextoFolhaImpressao);
  if (!contexto) throw new Error('useFolhaImpressao precisa estar dentro de <ProvedorFolhaImpressao>.');
  return contexto;
}
