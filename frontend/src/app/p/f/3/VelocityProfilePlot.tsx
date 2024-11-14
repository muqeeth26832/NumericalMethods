// src/components/VelocityProfilePlot.tsx
import React from 'react';
import Plot from 'react-plotly.js';

interface VelocityProfilePlotProps {
  y: number[];
  explicit: number[];
  implicit: number[];
  analytical: number[];
}

const VelocityProfilePlot: React.FC<VelocityProfilePlotProps> = ({ y, explicit, implicit, analytical }) => {
  return (
    <Plot
      data={[
        {
          x: y,
          y: explicit,
          type: 'scatter',
          mode: 'lines',
          name: 'Explicit',
        },
        {
          x: y,
          y: implicit,
          type: 'scatter',
          mode: 'lines',
          name: 'Implicit',
        },
        {
          x: y,
          y: analytical,
          type: 'scatter',
          mode: 'lines',
          name: 'Analytical',
        },
      ]}
      layout={{
        title: 'Velocity Profile',
        xaxis: { title: 'y' },
        yaxis: { title: 'u(y)' },
        showlegend: true,
      }}
    />
  );
};

export default VelocityProfilePlot;
