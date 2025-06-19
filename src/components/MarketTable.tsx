/**
 * @file MarketTable.tsx
 * @brief Componente que exibe uma tabela de ativos de mercado com ordenação e navegação.
 *
 * Renderiza uma tabela responsiva contendo colunas para nome, preço, variação,
 * capitalização de mercado e volume. Permite ordenar por qualquer coluna e
 * navegar para a página de detalhes do ativo ao clicar em uma linha.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingDown, TrendingUp, ArrowDown, ArrowUp } from 'lucide-react';
import { AssetData } from '@/services/marketService';
import { cn } from '@/lib/utils';

/**
 * @interface MarketTableProps
 * @brief Propriedades aceitas pelo componente MarketTable.
 *
 * @param assets       Lista de ativos (`AssetData[]`) a serem exibidos.
 * @param isLoading?   Flag opcional que, se true, exibe skeletons em vez dos dados.
 */
interface MarketTableProps {
  assets: AssetData[];
  isLoading?: boolean;
}

/**
 * @typedef SortField
 * @brief Campos pelos quais a tabela pode ser ordenada.
 *
 * - `name`: ordena por nome do ativo
 * - `price`: ordena por preço
 * - `change`: ordena por variação percentual em 24h
 * - `marketCap`: ordena por capitalização de mercado
 * - `volume`: ordena por volume de negociação
 */
type SortField = 'name' | 'price' | 'change' | 'marketCap' | 'volume';

/**
 * @typedef SortDirection
 * @brief Direção de ordenação aplicável à tabela.
 *
 * - `asc`: ordem crescente
 * - `desc`: ordem decrescente
 */
type SortDirection = 'asc' | 'desc';

/**
 * @brief Componente principal que renderiza a tabela de mercado.
 *
 * Mantém estado de campo e direção de ordenação, calcula um array
 * ordenado de ativos e trata cliques em linhas para navegação.
 *
 * @param props.assets      Lista de ativos a exibir.
 * @param props.isLoading   Se true, exibe placeholders animados.
 * @returns JSX.Element     Estrutura completa da tabela.
 */
const MarketTable = ({
  assets,
  isLoading = false,
}: MarketTableProps) => {
  /** @brief Hook de navegação para roteamento do React Router. */
  const navigate = useNavigate();

  /** @brief Campo atualmente usado para ordenar os ativos. */
  const [sortField, setSortField] = useState<SortField>('marketCap');
  /** @brief Direção de ordenação (ascendente ou descendente). */
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  /**
   * @brief Alterna ou define o campo de ordenação ao clicar no header.
   *
   * Se o mesmo campo for clicado duas vezes, inverte a direção de ordenação.
   * Caso contrário, define o novo campo e zera direção para `desc`.
   *
   * @param field  Campo escolhido para ordenação (`SortField`).
   */
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  /**
   * @brief Gera um novo array de ativos ordenado conforme estado atual.
   *
   * Copia o array original para não mutar `props.assets` e utiliza
   * `Array.prototype.sort` com lógica baseada em `sortField` e `sortDirection`.
   */
  const sortedAssets = [...assets].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'price':
        comparison = a.price - b.price;
        break;
      case 'change':
        comparison = a.changePercent - b.changePercent;
        break;
      case 'marketCap':
        comparison = a.marketCap - b.marketCap;
        break;
      case 'volume':
        comparison = a.volume - b.volume;
        break;
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  /**
   * @brief Navega para a página de detalhes do ativo ao clicar em sua linha.
   *
   * @param asset  Objeto `AssetData` do ativo selecionado.
   */
  const handleRowClick = (asset: AssetData) => {
    console.log("Navigating to asset with ID:", asset.id);
    navigate(`/asset/${asset.id}`);
  };

  /**
   * @brief Renderização da tabela com headers clicáveis e corpo condicional.
   *
   * - Se `isLoading` for true: exibe 10 linhas skeleton animadas.
   * - Caso contrário: renderiza cada ativo ordenado em uma linha clicável.
   */
  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="border-b">
            {/* Coluna de índice */}
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">#</th>

            {/* Coluna Name com handler de ordenação */}
            <th
              className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center gap-1">
                Name
                {sortField === 'name' && (sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
              </div>
            </th>

            {/* Coluna Price com alinhamento à direita e sort */}
            <th
              className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('price')}
            >
              <div className="flex items-center justify-end gap-1">
                Price
                {sortField === 'price' && (sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
              </div>
            </th>

            {/* Coluna 24h % com sort */}
            <th
              className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('change')}
            >
              <div className="flex items-center justify-end gap-1">
                24h %
                {sortField === 'change' && (sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
              </div>
            </th>

            {/* Coluna Market Cap (oculta em telas pequenas) */}
            <th
              className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hidden md:table-cell"
              onClick={() => handleSort('marketCap')}
            >
              <div className="flex items-center justify-end gap-1">
                Market Cap
                {sortField === 'marketCap' && (sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
              </div>
            </th>

            {/* Coluna Volume (oculta em telas menores) */}
            <th
              className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hidden lg:table-cell"
              onClick={() => handleSort('volume')}
            >
              <div className="flex items-center justify-end gap-1">
                Volume
                {sortField === 'volume' && (sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          {isLoading
            // Linhas skeleton durante carregamento
            ? Array.from({ length: 10 }).map((_, index) => (
                <tr key={index} className="border-b animate-pulse">
                  <td className="px-4 py-4">{index + 1}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-secondary rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-4 w-20 bg-secondary rounded"></div>
                        <div className="h-3 w-24 bg-secondary rounded"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="h-4 w-20 bg-secondary rounded ml-auto"></div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="h-4 w-16 bg-secondary rounded ml-auto"></div>
                  </td>
                  <td className="px-4 py-4 text-right hidden md:table-cell">
                    <div className="h-4 w-24 bg-secondary rounded ml-auto"></div>
                  </td>
                  <td className="px-4 py-4 text-right hidden lg:table-cell">
                    <div className="h-4 w-24 bg-secondary rounded ml-auto"></div>
                  </td>
                </tr>
              ))
            // Linhas reais de dados ordenados
            : sortedAssets.map((asset, index) => {
                const isPositive = asset.changePercent >= 0;
                return (
                  <tr
                    key={asset.id}
                    className="border-b hover:bg-secondary/50 cursor-pointer"
                    onClick={() => handleRowClick(asset)}
                  >
                    <td className="px-4 py-4 text-sm">{index + 1}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {asset.logo ? (
                          <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center overflow-hidden">
                            <img
                              src={asset.logo}
                              alt={asset.name}
                              className="w-5 h-5 object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center">
                            <span className="text-xs font-bold">{asset.symbol.substring(0, 2)}</span>
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{asset.name}</div>
                          <div className="text-xs text-muted-foreground">{asset.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right font-medium">
                      ${asset.price.toLocaleString(undefined, {
                        minimumFractionDigits: asset.price < 1 ? 4 : 2,
                        maximumFractionDigits: asset.price < 1 ? 4 : 2,
                      })}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div
                        className={cn(
                          "inline-flex items-center gap-1",
                          isPositive ? "text-green-500" : "text-red-500"
                        )}
                      >
                        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {asset.changePercent.toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right text-sm text-muted-foreground hidden md:table-cell">
                      ${asset.marketCap.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-4 py-4 text-right text-sm text-muted-foreground hidden lg:table-cell">
                      ${asset.volume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                  </tr>
                );
              })}
        </tbody>
      </table>
    </div>
  );
};

export default MarketTable;
