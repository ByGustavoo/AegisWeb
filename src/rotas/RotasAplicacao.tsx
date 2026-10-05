import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ambiente } from '@/configuracoes/ambiente';
import { LayoutAplicacao } from '@/layouts/LayoutAplicacao';
import { caminhos } from './caminhos';

const PaginaGerador = lazy(() => import('@/paginas/PaginaGerador'));
const PaginaAnalisador = lazy(() => import('@/paginas/PaginaAnalisador'));
const PaginaConfiguracoes = lazy(() => import('@/paginas/PaginaConfiguracoes'));
const PaginaComponentes = ambiente.desenvolvimento ? lazy(() => import('@/paginas/PaginaComponentes')) : null;
const PaginaNaoEncontrada = lazy(() => import('@/paginas/PaginaNaoEncontrada'));

export function RotasAplicacao() {
  return (
    <Routes>
      <Route element={<LayoutAplicacao />}>
        <Route path={caminhos.inicio} element={<Navigate to={caminhos.gerar} replace />} />
        <Route path={caminhos.gerar} element={<PaginaGerador />} />
        <Route path={caminhos.analisar} element={<PaginaAnalisador />} />
        <Route path={caminhos.configuracoes} element={<PaginaConfiguracoes />} />
        {PaginaComponentes ? <Route path={caminhos.componentes} element={<PaginaComponentes />} /> : null}
      </Route>

      <Route
        path="*"
        element={
          <Suspense fallback={null}>
            <PaginaNaoEncontrada />
          </Suspense>
        }
      />
    </Routes>
  );
}
