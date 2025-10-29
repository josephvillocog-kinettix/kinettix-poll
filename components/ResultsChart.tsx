import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { Candidate } from '../types';

interface ResultsChartProps {
  data: Candidate[];
}

// A more vibrant and modern color palette
const COLORS = ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6'];

const ResultsChart: React.FC<ResultsChartProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="w-full h-96 md:h-[500px] p-4 bg-gray-800/50 rounded-xl shadow-2xl backdrop-blur-md border border-gray-700/50">
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <div className="relative">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-24 w-24 bg-indigo-500/10 rounded-full animate-ping"></div>
                        </div>
                    </div>
                    <p className="text-xl font-semibold mt-4">Waiting for votes...</p>
                    <p className="text-base text-gray-400">Results will appear here in real-time.</p>
                </div>
            </div>
        );
    }

  return (
    <div className="w-full h-96 md:h-[500px] p-4 bg-gray-800/50 rounded-xl shadow-2xl backdrop-blur-md border border-gray-700/50">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{
            top: 20,
            right: 40,
            left: 20,
            bottom: 5,
          }}
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(107, 114, 128, 0.2)" />
          <XAxis type="number" stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 12 }} allowDecimals={false} />
          <YAxis
            dataKey="name"
            type="category"
            width={120}
            stroke="#9CA3AF"
            tick={{ fill: '#D1D5DB', fontSize: 14, dx: -5 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            cursor={{fill: 'rgba(107, 114, 128, 0.1)'}}
            contentStyle={{
                backgroundColor: 'rgba(17, 24, 39, 0.8)', // bg-gray-900/80
                backdropFilter: 'blur(4px)',
                border: '1px solid #374151', // border-gray-700
                borderRadius: '0.75rem', // rounded-xl
                boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', // shadow-2xl
                color: 'white'
            }}
            labelStyle={{
                fontWeight: 'bold',
                fontSize: '1.125rem', // text-lg
                marginBottom: '0.5rem',
            }}
            formatter={(value: number, name: string) => [`${value.toLocaleString()}`, 'Votes']}
            itemStyle={{
                color: '#A5B4FC', // text-indigo-300
            }}
          />
          <Bar dataKey="votes" barSize={35} radius={[0, 8, 8, 0]} isAnimationActive={true} animationDuration={800} animationEasing="ease-out">
            <LabelList dataKey="votes" position="right" offset={10} style={{ fill: '#D1D5DB', fontSize: 14, fontWeight: 'bold' }} formatter={(value: number) => value.toLocaleString()} />
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ResultsChart;