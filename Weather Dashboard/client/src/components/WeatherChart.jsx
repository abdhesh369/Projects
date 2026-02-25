// client/src/components/WeatherChart.js

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

function WeatherChart({ data }) {
  return (
    <div className="weather-chart-container">
      <h2>5-Day Temperature Trend</h2>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{
            top: 5, right: 30, left: 0, bottom: 5,
          }}
        >
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="5 5" />
          
          <XAxis 
            dataKey="name" 
            stroke="#6b7280" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          
          <YAxis 
            stroke="#6b7280" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(value) => `${value}°C`} 
          />
          
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(5px)',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            labelStyle={{ color: '#1f2937', fontWeight: 'bold' }}
          />

          <Legend wrapperStyle={{ fontSize: '14px', color: '#374151' }} />
          
          <Line 
            type="monotone" 
            dataKey="temperature" 
            stroke="#3b82f6" 
            strokeWidth={2}
            activeDot={{ r: 8, strokeWidth: 2, fill: '#3b82f6' }} 
            dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default WeatherChart;
