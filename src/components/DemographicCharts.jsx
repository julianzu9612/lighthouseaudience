import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const DemographicCharts = ({ stats }) => {
  if (!stats || !stats.demographics) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
        {[1, 2].map(i => (
          <div key={i} className="glass-panel p-8">
            <div className="h-8 bg-slate/30 rounded w-1/3 mb-6"></div>
            <div className="h-80 bg-slate/30 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  // Age distribution data
  const ageData = stats.demographics.age_distribution || [];
  const ageChartData = ageData.map(item => ({
    range: item.range,
    count: item.count,
    percentage: item.percentage,
  }));

  // Gender distribution data
  const genderData = [
    {
      name: 'Male',
      value: stats.demographics.gender_distribution?.male || 0,
      color: '#FF0000', // fire-red
    },
    {
      name: 'Female',
      value: stats.demographics.gender_distribution?.female || 0,
      color: '#DC143C', // crimson
    },
    {
      name: 'Unknown',
      value: stats.demographics.gender_distribution?.unknown || 0,
      color: '#666666', // dim-gray
    },
  ].filter(item => item.value > 0);

  // Custom tooltip for age chart
  const AgeTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 border-fire-red">
          <p className="text-white font-bold">{payload[0].payload.range}</p>
          <p className="text-fire-red">{payload[0].value} persons</p>
          <p className="text-dim-gray text-sm">
            {payload[0].payload.percentage.toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for gender chart
  const GenderTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const total = genderData.reduce((sum, item) => sum + item.value, 0);
      const percentage = ((payload[0].value / total) * 100).toFixed(1);
      return (
        <div className="glass-panel p-3 border-fire-red">
          <p className="text-white font-bold">{payload[0].name}</p>
          <p className="text-fire-red">{payload[0].value} persons</p>
          <p className="text-dim-gray text-sm">{percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  // Custom label for pie chart
  const renderPieLabel = (entry) => {
    const total = genderData.reduce((sum, item) => sum + item.value, 0);
    const percentage = ((entry.value / total) * 100).toFixed(0);
    return `${entry.name} ${percentage}%`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Age Distribution Chart */}
      <motion.div
        className="glass-panel p-8 hover:border-fire-red transition-all duration-300"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-fire-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Age Distribution
          </h3>
          <p className="text-dim-gray text-sm mt-1">
            {ageChartData.length} age groups detected
          </p>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={ageChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
            <XAxis
              dataKey="range"
              stroke="#666666"
              tick={{ fill: '#999999', fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              stroke="#666666"
              tick={{ fill: '#999999', fontSize: 12 }}
            />
            <Tooltip content={<AgeTooltip />} cursor={{ fill: 'rgba(255, 0, 0, 0.1)' }} />
            <Bar
              dataKey="count"
              fill="url(#ageGradient)"
              radius={[8, 8, 0, 0]}
              animationDuration={1000}
            />
            <defs>
              <linearGradient id="ageGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF0000" stopOpacity={1} />
                <stop offset="100%" stopColor="#8B0000" stopOpacity={0.8} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Gender Distribution Chart */}
      <motion.div
        className="glass-panel p-8 hover:border-fire-red transition-all duration-300"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-fire-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            Gender Distribution
          </h3>
          <p className="text-dim-gray text-sm mt-1">
            {genderData.reduce((sum, item) => sum + item.value, 0)} persons analyzed
          </p>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={genderData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderPieLabel}
              outerRadius={100}
              innerRadius={60}
              fill="#8884d8"
              dataKey="value"
              animationDuration={1000}
            >
              {genderData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<GenderTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-6">
          {genderData.map((item) => {
            const total = genderData.reduce((sum, g) => sum + g.value, 0);
            const percentage = ((item.value / total) * 100).toFixed(1);
            return (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-dim-gray text-sm">
                  {item.name}: {item.value} ({percentage}%)
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default DemographicCharts;
