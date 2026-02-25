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
    <div className="weather-chart-inner">
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '600', color: 'rgba(255,255,255,0.8)' }}>
        5-Day Temperature Trend
      </h2>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart
          data={data}
          margin={{
            top: 20, right: 40, left: 30, bottom: 40,
          }}
        >
          <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" vertical={false} />

          <XAxis
            dataKey="name"
            stroke="rgba(255,255,255,0.4)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'rgba(255,255,255,0.6)' }}
            padding={{ left: 20, right: 20 }}
            dy={20}
          />

          <YAxis
            stroke="rgba(255,255,255,0.4)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}°`}
            tick={{ fill: 'rgba(255,255,255,0.6)' }}
            dx={-10}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(30, 41, 59, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '1rem',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)',
              color: '#fff'
            }}
            itemStyle={{ color: '#818cf8', fontWeight: '600' }}
            labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem' }}
          />

          <Line
            type="monotone"
            dataKey="temperature"
            stroke="#6366f1"
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
            activeDot={{ r: 6, strokeWidth: 0, fill: '#8b5cf6' }}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default WeatherChart;
