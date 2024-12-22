import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const [metrics, setMetrics] = useState({
    engagementRate: [],
    clickThroughRate: [],
    averageRating: [],
    mediaTypeDistribution: {},
    algorithmPerformance: {},
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/api/admin/analytics', {
        params: {
          timeRange,
          metrics: 'engagement,ctr,ratings,distribution,performance',
        },
      });
      setMetrics(response.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const engagementChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Engagement Rate Over Time',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  const engagementChartData = {
    labels: metrics.engagementRate.map((point) => point.date),
    datasets: [
      {
        label: 'Engagement Rate (%)',
        data: metrics.engagementRate.map((point) => point.value),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const algorithmPerformanceData = {
    labels: Object.keys(metrics.algorithmPerformance),
    datasets: [
      {
        label: 'Average Rating',
        data: Object.values(metrics.algorithmPerformance),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
        ],
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Analytics Dashboard</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Engagement Metrics</h3>
          <Line options={engagementChartOptions} data={engagementChartData} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Algorithm Performance</h3>
          <Bar
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Average Rating by Algorithm',
                },
              },
            }}
            data={algorithmPerformanceData}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Media Type Distribution</h3>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(metrics.mediaTypeDistribution).map(([type, percentage]) => (
              <div key={type} className="text-center">
                <div className="text-2xl font-bold text-blue-600">{percentage}%</div>
                <div className="text-sm text-gray-500">{type}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Key Metrics</h3>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-gray-500">Click-through Rate</dt>
              <dd className="text-2xl font-bold text-blue-600">
                {metrics.clickThroughRate[metrics.clickThroughRate.length - 1]?.value || 0}%
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Average Rating</dt>
              <dd className="text-2xl font-bold text-blue-600">
                {metrics.averageRating[metrics.averageRating.length - 1]?.value || 0}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
} 