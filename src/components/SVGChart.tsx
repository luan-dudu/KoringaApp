import React from 'react';

interface ChartDataPoint {
  label: string;
  value: number;
  value2?: number; // Para comparar (ex: despesa vs receita)
}

interface SVGChartProps {
  title: string;
  data: ChartDataPoint[];
  type: 'line' | 'bar';
  color?: 'purple' | 'green' | 'cyan' | 'mixed';
  height?: number;
}

export const SVGChart: React.FC<SVGChartProps> = ({
  title,
  data,
  type,
  color = 'purple',
  height = 200,
}) => {
  const chartHeight = height - 40; // Espaço para labels horizontais
  const chartWidth = 500;
  const paddingX = 40;
  const paddingY = 20;

  const maxVal = Math.max(...data.map(d => Math.max(d.value, d.value2 || 0)), 10);
  const minVal = 0;
  const valRange = maxVal - minVal;

  const pointsCount = data.length;
  const stepX = (chartWidth - paddingX * 2) / (pointsCount - 1 || 1);

  // Calcula coordenadas para o gráfico de linha (Valor 1)
  const getCoordinates = (valueKey: 'value' | 'value2') => {
    return data.map((d, index) => {
      const val = valueKey === 'value' ? d.value : (d.value2 || 0);
      const x = paddingX + index * stepX;
      // Inverte o eixo Y pois SVG começa do topo
      const y = chartHeight - paddingY - ((val - minVal) / valRange) * (chartHeight - paddingY * 2);
      return { x, y };
    });
  };

  const coords1 = getCoordinates('value');
  const coords2 = data.some(d => d.value2 !== undefined) ? getCoordinates('value2') : [];

  // Gera a string do path da linha SVG
  const linePath1 = coords1.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
  const linePath2 = coords2.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');

  // Gera o path da área preenchida
  const areaPath1 = coords1.length > 0 
    ? `${linePath1} L ${coords1[coords1.length - 1].x} ${chartHeight - paddingY} L ${coords1[0].x} ${chartHeight - paddingY} Z`
    : '';

  // Cores do gráfico
  const getStrokeColor = (index = 1) => {
    if (color === 'mixed') {
      return index === 1 ? 'var(--accent-cyan)' : 'var(--accent-danger)';
    }
    switch (color) {
      case 'green': return 'var(--accent-neon)';
      case 'cyan': return 'var(--accent-cyan)';
      default: return 'var(--accent-purple)';
    }
  };

  const getGradientId = (index = 1) => `chart-grad-${color}-${index}`;

  return (
    <div className="glass-card chart-card">
      <h3 className="chart-title">{title}</h3>
      <div className="chart-svg-wrapper">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="svg-element">
          <defs>
            {/* Gradiente 1 */}
            <linearGradient id={getGradientId(1)} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={getStrokeColor(1)} stopOpacity="0.4" />
              <stop offset="100%" stopColor={getStrokeColor(1)} stopOpacity="0.0" />
            </linearGradient>
            
            {/* Gradiente 2 */}
            <linearGradient id={getGradientId(2)} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={getStrokeColor(2)} stopOpacity="0.4" />
              <stop offset="100%" stopColor={getStrokeColor(2)} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Linhas de Grade de Fundo */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = paddingY + ratio * (chartHeight - paddingY * 2);
            const value = Math.round(maxVal - ratio * valRange);
            return (
              <g key={i} className="grid-line-group">
                <line
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="rgba(255,255,255,0.04)"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 10}
                  y={y + 4}
                  fill="var(--text-muted)"
                  fontSize="10"
                  textAnchor="end"
                >
                  {value >= 1000 ? `${(value/1000).toFixed(1)}k` : value}
                </text>
              </g>
            );
          })}

          {/* Tipo: LINHA */}
          {type === 'line' && (
            <>
              {/* Área preenchida 1 */}
              {areaPath1 && (
                <path d={areaPath1} fill={`url(#${getGradientId(1)})`} />
              )}

              {/* Linha principal 2 (Despesas, se houver) */}
              {coords2.length > 0 && (
                <>
                  <path
                    d={linePath2}
                    fill="none"
                    stroke={getStrokeColor(2)}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {coords2.map((c, i) => (
                    <circle
                      key={`c2-${i}`}
                      cx={c.x}
                      cy={c.y}
                      r="4"
                      fill="var(--bg-dark)"
                      stroke={getStrokeColor(2)}
                      strokeWidth="2"
                    />
                  ))}
                </>
              )}

              {/* Linha principal 1 */}
              <path
                d={linePath1}
                fill="none"
                stroke={getStrokeColor(1)}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Círculos dos pontos da Linha 1 */}
              {coords1.map((c, i) => (
                <circle
                  key={`c1-${i}`}
                  cx={c.x}
                  cy={c.y}
                  r="5"
                  fill="var(--bg-dark)"
                  stroke={getStrokeColor(1)}
                  strokeWidth="2"
                  className="chart-dot"
                />
              ))}
            </>
          )}

          {/* Tipo: BARRA */}
          {type === 'bar' && (
            <g>
              {data.map((d, index) => {
                const x = paddingX + index * stepX - 10; // offset centralizado
                const barWidth = 20;
                const barHeight = ((d.value - minVal) / valRange) * (chartHeight - paddingY * 2);
                const y = chartHeight - paddingY - barHeight;

                return (
                  <g key={`bar-${index}`} className="bar-group">
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={Math.max(barHeight, 4)} // Garante altura mínima para ver a barra
                      rx="4"
                      fill={getStrokeColor(1)}
                      opacity="0.8"
                      className="chart-bar"
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* Labels do Eixo X (Categorias) */}
          {data.map((d, index) => {
            const x = paddingX + index * stepX;
            return (
              <text
                key={`lbl-${index}`}
                x={x}
                y={chartHeight - 4}
                fill="var(--text-muted)"
                fontSize="10"
                textAnchor="middle"
              >
                {d.label}
              </text>
            );
          })}
        </svg>
      </div>

      <style>{`
        .chart-card {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .chart-title {
          font-size: 1.05rem;
          color: var(--text-main);
          font-weight: 600;
        }

        .chart-svg-wrapper {
          width: 100%;
          position: relative;
        }

        .svg-element {
          width: 100%;
          height: auto;
          display: block;
        }

        .chart-dot {
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .chart-dot:hover {
          r: 7px;
          stroke-width: 3px;
        }

        .chart-bar {
          transition: var(--transition-smooth);
        }

        .chart-bar:hover {
          opacity: 1;
          filter: brightness(1.2);
        }
      `}</style>
    </div>
  );
};
