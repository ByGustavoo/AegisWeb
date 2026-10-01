import { useNavigate } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Botao, EstadoMensagem, Painel } from '@/componentes/ui';
import { useTituloDocumento } from '@/ganchos/useTituloDocumento';
import { caminhos } from '@/rotas/caminhos';

export default function PaginaNaoEncontrada() {
  const navegar = useNavigate();
  useTituloDocumento('Página não encontrada');

  return (
    <Painel espacamento="nenhum">
      <h1 className="visualmente-oculto">Página não encontrada</h1>
      <EstadoMensagem
        icone={Compass}
        titulo="Página não encontrada"
        descricao="O endereço pode ter mudado ou estar digitado errado. Volte ao gerador para continuar."
        acao={<Botao onClick={() => navegar(caminhos.gerar)}>Ir para o gerador</Botao>}
      />
    </Painel>
  );
}
