import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { Candidate } from '../types';

interface ResultsChartProps {
  data: Candidate[];
}

// --- Constants and Helper Functions ---

// A modern, vibrant, and accessible color palette.
const COLORS = [
  '#8B5CF6', // Violet
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#EF4444', // Red
];

// To ensure stable function and object references are passed to Recharts components,
// these are defined outside the component's render cycle. This is a key fix to
// prevent hook-related errors in the library caused by re-renders.
const formatVoteCount = (value: number) => value.toLocaleString();
const formatTooltip = (value: number) => [`${value.toLocaleString()} votes`, null];

const tooltipLabelStyle = { color: '#F9FAFB', fontWeight: 'bold', fontSize: '1rem' };
const tooltipItemStyle = { display: 'none' };
const tooltipContentStyle = {
  backgroundColor: 'rgba(31, 41, 55, 0.8)',
  backdropFilter: 'blur(5px)',
  border: '1px solid #4B5563',
  borderRadius: '0.5rem',
  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)',
};
const labelListStyle = { fill: '#F9FAFB', fontSize: 14, fontWeight: 'bold' };
const tooltipCursorStyle = { fill: 'rgba(75, 85, 99, 0.2)' };
const xAxisTickStyle = { fill: '#9CA3AF', fontSize: 12 };
const yAxisTickStyle = { fill: '#D1D5DB', fontSize: 14, dx: -10, fontWeight: 500 };
const chartMargin = { top: 10, right: 50, left: 20, bottom: 10 };
const barRadius: [number, number, number, number] = [0, 6, 6, 0];


const ChartIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);


// --- Sub-components for better readability ---

const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
    <div className="relative mb-4">
        <ChartIcon />
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-20 w-20 bg-indigo-500/10 rounded-full animate-ping delay-500"></div>
        </div>
    </div>
    <h3 className="text-xl font-bold text-gray-300">Waiting for votes...</h3>
    <p>Results will appear here in real-time as votes are cast.</p>
  </div>
);

const ChartContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="w-full h-96 md:h-[500px] p-4 bg-gray-800/50 rounded-xl shadow-2xl backdrop-blur-md border border-gray-700/50">
        {children}
    </div>
);


// --- Main ResultsChart Component ---

const ResultsChart: React.FC<ResultsChartProps> = ({ data }) => {
  // Memoize the gradient definitions. This ensures a stable reference for a part of the chart's children,
  // preventing unnecessary re-renders. The dependency array is empty because COLORS is a constant.
  const memoizedGradients = useMemo(() => (
    <defs>
      {COLORS.map((color, index) => (
        <linearGradient id={`colorGradient${index}`} key={`gradient-${index}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
          <stop offset="95%" stopColor={color} stopOpacity={0.4}/>
        </linearGradient>
      ))}
    </defs>
  ), []);

  // Memoize the array of <Cell> components. This is a critical fix.
  // Generating a new array of components on every render can destabilize the recharts library's internal state.
  // Using the candidate's stable `id` as the key instead of the array `index` prevents incorrect state reconciliation when the data reorders.
  const memoizedCells = useMemo(() => (
    data.map((entry, index) => (
      <Cell key={`cell-${entry.id}`} fill={`url(#colorGradient${index % COLORS.length})`} />
    ))
  ), [data]);


  if (!data || data.length === 0) {
    return (
      <ChartContainer>
        <EmptyState />
      </ChartContainer>
    );
  }

  return (
    <ChartContainer>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={chartMargin}
          barCategoryGap="25%"
        >
          {memoizedGradients}

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(107, 114, 128, 0.15)" horizontal={true} vertical={false} />

          <XAxis 
            type="number" 
            stroke="#9CA3AF" 
            tick={xAxisTickStyle} 
            axisLine={false} 
            tickLine={false}
            allowDecimals={false}
          />
          
          <YAxis
            dataKey="name"
            type="category"
            width={120}
            stroke="#D1D5DB"
            tick={yAxisTickStyle}
            tickLine={false}
            axisLine={false}
            interval={0}
          />

          <Tooltip
            cursor={tooltipCursorStyle}
            formatter={formatTooltip}
            labelStyle={tooltipLabelStyle}
            itemStyle={tooltipItemStyle}
            contentStyle={tooltipContentStyle}
          />
          
          <Bar 
            dataKey="votes" 
            radius={barRadius} 
            isAnimationActive={true} 
            animationDuration={1000} 
            animationEasing="ease-out"
          >
            <LabelList 
              dataKey="votes" 
              position="right" 
              offset={12} 
              style={labelListStyle} 
              formatter={formatVoteCount} 
            />
            {memoizedCells}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default ResultsChart;