
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Candidate } from '../types';

interface ResultsChartProps {
  data: Candidate[];
}

const COLORS = ['#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE', '#E0E7FF'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
        <p className="text-white font-semibold">{label}</p>
        <p className="text-indigo-400">{`Votes: ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

const ResultsChart: React.FC<ResultsChartProps> = ({ data }) => {
    if (!data.length) {
        return (
            <div className="flex items-center justify-center h-96 text-gray-400">
                <p>Waiting for votes...</p>
            </div>
        );
    }

  return (
    <div className="w-full h-96 md:h-[500px] p-4 bg-gray-800/50 rounded-xl shadow-2xl backdrop-blur-md">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
          <XAxis type="number" stroke="#9CA3AF" />
          <YAxis
            dataKey="name"
            type="category"
            width={120}
            stroke="#9CA3AF"
            tick={{ fill: '#D1D5DB' }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(107, 114, 128, 0.1)'}}/>
          <Bar dataKey="votes" barSize={30} radius={[0, 10, 10, 0]}>
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
