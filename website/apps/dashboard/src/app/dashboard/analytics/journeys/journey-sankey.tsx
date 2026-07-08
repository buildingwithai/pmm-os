'use client';

import { useMemo } from 'react';
import {
  ResponsiveContainer,
  Sankey,
  Tooltip,
  Layer,
  Rectangle
} from 'recharts';
import type { JourneyTransition } from '@/lib/analytics/types';

function SankeyNode({ x, y, width, height, name }: { x: number; y: number; width: number; height: number; name: string }) {
  return (
    <Layer>
      <Rectangle x={x} y={y} width={width} height={Math.max(height, 4)} fill='hsl(var(--primary))' fillOpacity={0.8} radius={2} />
      <text
        x={x + width + 6}
        y={y + height / 2}
        textAnchor='start'
        dominantBaseline='middle'
        fontSize={11}
        fill='hsl(var(--foreground))'
      >
        {name}
      </text>
    </Layer>
  );
}

function SankeyLink({ sourceX, targetX, sourceY, targetY, sourceControlX, targetControlX, linkWidth }: {
  sourceX: number;
  targetX: number;
  sourceY: number;
  targetY: number;
  sourceControlX: number;
  targetControlX: number;
  linkWidth: number;
}) {
  return (
    <Layer>
      <path
        d={`
          M${sourceX},${sourceY + linkWidth / 2}
          C${sourceControlX},${sourceY + linkWidth / 2}
            ${targetControlX},${targetY + linkWidth / 2}
            ${targetX},${targetY + linkWidth / 2}
          L${targetX},${targetY - linkWidth / 2}
          C${targetControlX},${targetY - linkWidth / 2}
            ${sourceControlX},${sourceY - linkWidth / 2}
            ${sourceX},${sourceY - linkWidth / 2}
          Z
        `}
        fill='hsl(var(--primary))'
        fillOpacity={0.2}
      />
    </Layer>
  );
}

export function JourneySankey({ transitions }: { transitions: JourneyTransition[] }) {
  const chartData = useMemo(() => {
    const pathSet = new Set<string>();
    for (const t of transitions) {
      pathSet.add(t.from);
      pathSet.add(t.to);
    }
    const paths = Array.from(pathSet);
    const nodeMap = new Map(paths.map((p, i) => [p, i]));

    const nodes = paths.map((name) => ({ name }));
    const links = transitions.map((t) => ({
      source: nodeMap.get(t.from)!,
      target: nodeMap.get(t.to)!,
      value: t.count
    }));

    return { nodes, links };
  }, [transitions]);

  if (chartData.nodes.length === 0) {
    return (
      <div className='flex h-48 items-center justify-center rounded-lg border border-dashed'>
        <p className='text-muted-foreground text-sm'>No journey data to visualize</p>
      </div>
    );
  }

  return (
    <div className='h-72 w-full'>
      <ResponsiveContainer width='100%' height='100%'>
        <Sankey
          data={chartData}
          node={<SankeyNode x={0} y={0} width={0} height={0} name='' />}
          link={<SankeyLink
            sourceX={0}
            targetX={0}
            sourceY={0}
            targetY={0}
            sourceControlX={0}
            targetControlX={0}
            linkWidth={0}
          />}
          nodeWidth={10}
          nodePadding={8}
          margin={{ top: 10, right: 120, bottom: 10, left: 10 }}
        >
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius)',
              fontSize: 12
            }}
          />
        </Sankey>
      </ResponsiveContainer>
    </div>
  );
}
