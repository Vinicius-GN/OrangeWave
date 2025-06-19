/**
 * @file SpotlightAsset.tsx
 * @brief Componente React que exibe um ativo em destaque com informações detalhadas.
 *
 * Este componente renderiza um cartão clicável contendo:
 *  - Logo do ativo (se disponível)
 *  - Nome e símbolo
 *  - Indicador de tipo (Stock ou Crypto)
 *  - Preço formatado em USD
 *  - Variação percentual com ícone (alta/baixa)
 *  - Market Cap formatado (K, M, B)
 *
 * As operações de formatação internas usam `Intl.NumberFormat` para moeda
 * e lógica condicional para abreviação de market cap.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AssetData } from '@/services/marketService';
import { cn } from '@/lib/utils';

/**
 * @interface SpotlightAssetProps
 * @brief Propriedades aceitas pelo componente SpotlightAsset.
 *
 * @param asset        Objeto `AssetData` contendo dados completos do ativo.
 * @param showButtons  Flag opcional para exibição de botões de ação (default: false).
 */
interface SpotlightAssetProps {
  asset: AssetData;
  showButtons?: boolean;
}

/**
 * @brief Componente funcional para exibir um ativo em destaque.
 *
 * Recebe um objeto `asset` e renderiza um cartão interativo com
 * todas as informações principais. Caso `showButtons` seja verdadeiro,
 * pode exibir botões adicionais (não implementados aqui).
 *
 * @param props.asset        Dados do ativo a ser exibido.
 * @param props.showButtons  Controla exibição de botões de ação.
 * @return JSX.Element       Elemento React representando o cartão do ativo.
 */
const SpotlightAsset: React.FC<SpotlightAssetProps> = ({
  asset,
  showButtons = false, // Default para não mostrar botões na Home
}) => {
  /** @brief Indica se a variação percentual do ativo é positiva ou neutra. */
  const isPositive = asset.changePercent >= 0;

  /**
   * @brief Formata um valor numérico como moeda em USD.
   *
   * Utiliza API Intl para garantir formatação correta independente de locale.
   *
   * @param value  Valor numérico bruto (ex: 1234.56).
   * @return string  String formatada no padrão USD (ex: "$1,234.56").
   */
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  /**
   * @brief Converte market cap numérico em formato legível (K, M ou B).
   *
   * - >= 1 bilhão: abrevia para "X.XXB"
   * - >= 1 milhão: abrevia para "X.XXM"
   * - caso contrário: abrevia para "X.XXK"
   *
   * @param value  Market cap bruto em USD.
   * @return string  String abreviada (ex: "1.23B", "45.67M", "890.12K").
   */
  const formatMarketCap = (value: number): string => {
    if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(2)}B`;
    } else if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(2)}M`;
    } else {
      return `${(value / 1_000).toFixed(2)}K`;
    }
  };

  /**
   * @brief Renderiza o componente.
   *
   * Estrutura principal:
   *  - <Link> para rota do ativo
   *    - <Card> com sombra ao passar o mouse
   *      - <CardContent> com padding
   *        - Cabeçalho (logo, nome/símbolo, badge de tipo)
   *        - Corpo (preço + variação, market cap)
   */
  return (
    <Link to={`/asset/${asset.id}`}>
      {/* Card container clicável */}
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        {/* Conteúdo interno do Card */}
        <CardContent className="p-4">
          {/* Cabeçalho: logo, nome, símbolo, tipo */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {/* Se existir logo, renderiza dentro de círculo */}
              {asset.logo && (
                <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center overflow-hidden">
                  <img
                    src={asset.logo}
                    alt={asset.name}
                    className="w-6 h-6 object-contain"
                    onError={(e) => {
                      // Se falhar, esconde a imagem para não quebrar layout
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              {/* Nome e símbolo do ativo */}
              <div>
                <h3 className="font-medium">{asset.name}</h3>
                <p className="text-xs text-muted-foreground">{asset.symbol}</p>
              </div>
            </div>

            {/* Badge indicando se é Stock ou Crypto */}
            <Badge
              variant="outline"
              className={cn(
                "rounded-md",
                asset.type === 'stock'
                  ? "bg-blue-500/10 text-blue-500"
                  : "bg-orange-500/10 text-orange-500"
              )}
            >
              {asset.type === 'stock' ? 'Stock' : 'Crypto'}
            </Badge>
          </div>

          {/* Rodapé: preço + variação percentual e market cap */}
          <div className="flex justify-between items-end mt-2">
            {/* Seção de preço e variação */}
            <div>
              {/* Preço formatado */}
              <p className="text-xl font-bold">{formatCurrency(asset.price)}</p>
              {/* Variação percentual com cor e ícone condicional */}
              <div
                className={cn(
                  "flex items-center text-sm",
                  isPositive ? "text-green-500" : "text-red-500"
                )}
              >
                {isPositive ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                )}
                {isPositive ? '+' : ''}
                {asset.changePercent.toFixed(2)}%
              </div>
            </div>

            {/* Seção de Market Cap */}
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Market Cap</p>
              <p className="font-medium">{formatMarketCap(asset.marketCap)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

/**
 * @brief Exportação padrão do componente SpotlightAsset.
 */
export default SpotlightAsset;
