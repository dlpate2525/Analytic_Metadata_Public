
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Asset, LineageNode } from '../types';

// --- Lineage Graph Component (D3) ---
interface LineageProps {
  data: Asset['lineage'];
}

export const LineageGraph: React.FC<LineageProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  useEffect(() => {
    if (wrapperRef.current) {
      const { width, height } = wrapperRef.current.getBoundingClientRect();
      setDimensions({ width, height });
    }
  }, []);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    const { width, height } = dimensions;

    // Simulation setup
    const simulation = d3.forceSimulation(data.nodes as any)
      .force("link", d3.forceLink(data.links).id((d: any) => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(50));

    // Arrow marker
    svg.append("defs").append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 25) 
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#94a3b8");

    const link = svg.append("g")
      .selectAll("line")
      .data(data.links)
      .enter().append("line")
      .attr("stroke", "#cbd5e1")
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrowhead)");

    const node = svg.append("g")
      .selectAll("g")
      .data(data.nodes)
      .enter().append("g")
      .call(d3.drag<any, any>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    // Node shapes (Circles with color coding)
    node.append("circle")
      .attr("r", 20)
      .attr("fill", (d: any) => {
          if (d.id === 'this_asset') return '#0ea5e9'; // Current Asset
          if (d.type === 'Dashboard') return '#f59e0b';
          if (d.type === 'Pipeline') return '#64748b';
          return '#e2e8f0';
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    // Labels
    node.append("text")
      .text((d: any) => d.name)
      .attr("x", 25)
      .attr("y", 5)
      .attr("font-size", "12px")
      .attr("fill", "#334155")
      .attr("font-weight", (d: any) => d.id === 'this_asset' ? "bold" : "normal");
      
    // Type Labels (small under)
    node.append("text")
      .text((d: any) => d.type)
      .attr("x", 25)
      .attr("y", 18)
      .attr("font-size", "10px")
      .attr("fill", "#94a3b8");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

  }, [data, dimensions]);

  return (
    <div ref={wrapperRef} className="w-full h-96 border border-slate-200 rounded-lg bg-white overflow-hidden relative">
      <div className="absolute top-2 left-2 z-10 bg-white/80 p-2 rounded text-xs text-slate-500 pointer-events-none">
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-sky-500"></div> Current Data Source</div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-200"></div> Table/View</div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Dashboard</div>
      </div>
      <svg ref={svgRef} width="100%" height="100%" className="cursor-grab active:cursor-grabbing"></svg>
    </div>
  );
};

// --- Quality Trend Chart (Recharts) ---
interface QualityChartProps {
  data: Asset['qualityHistory'];
}

export const QualityTrendChart: React.FC<QualityChartProps> = ({ data }) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} />
          <YAxis domain={[80, 100]} tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
          />
          <Area type="monotone" dataKey="score" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorScore)" strokeWidth={2} name="Quality Score" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// --- Usage Chart (Recharts) ---
export const UsageBarChart = () => {
  // Mock data for usage
  const data = [
    { name: 'Finance', queries: 4000 },
    { name: 'Marketing', queries: 3000 },
    { name: 'Product', queries: 2000 },
    { name: 'Sales', queries: 2780 },
    { name: 'Exec', queries: 1890 },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} />
          <YAxis tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} />
          <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px'}} />
          <Bar dataKey="queries" fill="#64748b" radius={[4, 4, 0, 0]} barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// --- Uploads Trend Chart (Recharts) ---
export const UploadsTrendChart = () => {
  // Mock data for uploads over last 30 days
  const data = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    uploads: Math.floor(Math.random() * 50) + 10,
    queries: Math.floor(Math.random() * 5000) + 1000,
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="day" tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} />
          <YAxis yAxisId="left" tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} />
          <YAxis yAxisId="right" orientation="right" tick={{fontSize: 12, fill: '#0ea5e9'}} tickLine={false} axisLine={false} />
          <Tooltip 
            cursor={{stroke: '#94a3b8', strokeWidth: 1}} 
            contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0'}}
            labelFormatter={(label) => `Day ${label}`}
          />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="uploads" stroke="#64748b" strokeWidth={2} dot={false} activeDot={{r: 6}} name="Metadata Updates" />
          <Line yAxisId="right" type="monotone" dataKey="queries" stroke="#0ea5e9" strokeWidth={2} dot={false} activeDot={{r: 6}} name="Query Volume" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// --- Governance Pie Chart ---
export const GovernancePieChart = () => {
  const data = [
    { name: 'Certified', value: 45, color: '#10b981' }, // Emerald
    { name: 'Pending', value: 25, color: '#f59e0b' }, // Amber
    { name: 'Warning', value: 15, color: '#f43f5e' }, // Rose
    { name: 'Draft', value: 15, color: '#94a3b8' }, // Slate
  ];

  return (
     <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
