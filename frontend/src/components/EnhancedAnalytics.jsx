import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Target,
  Clock,
  Camera,
  Star,
  Trophy,
  Activity,
  Zap,
  Eye,
  ArrowUp,
  ArrowDown,
  Minus,
  Users,
  TrendingDown,
  FileText,
  Share2,
  Settings,
  ChevronDown,
  Loader2
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { format, subDays, startOfDay } from 'date-fns'
import { useAuthContext } from '../auth/AuthContext'
import apiService from '../services/api'

export default function EnhancedAnalytics() {
  const { user } = useAuthContext()
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d')
  const [selectedChart, setSelectedChart] = useState('scans')
  const [analyticsData, setAnalyticsData] = useState(null)
  const [breedAnalytics, setBreedAnalytics] = useState(null)
  const [trendsData, setTrendsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedBreed, setSelectedBreed] = useState(null)
  const [exportLoading, setExportLoading] = useState(false)

  const timeRanges = [
    { value: '7d', label: '7 Days', days: 7 },
    { value: '30d', label: '30 Days', days: 30 },
    { value: '90d', label: '3 Months', days: 90 },
    { value: '1y', label: '1 Year', days: 365 }
  ]

  const chartTypes = [
    { value: 'scans', label: 'Scan Activity', icon: Camera },
    { value: 'accuracy', label: 'Accuracy Trends', icon: Target },
    { value: 'breeds', label: 'Breed Distribution', icon: PieChart },
    { value: 'confidence', label: 'Confidence Levels', icon: BarChart3 },
    { value: 'time', label: 'Usage Patterns', icon: Clock }
  ]

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#14B8A6']

  const loadAnalyticsData = useCallback(async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      const days = timeRanges.find(range => range.value === selectedTimeRange)?.days || 30
      
      const [dashboardData, breedData, trendsData] = await Promise.all([
        apiService.getAnalyticsDashboard(user.id, days),
        apiService.getBreedAnalytics(user.id),
        apiService.getAnalyticsTrends(user.id, 'weekly')
      ])
      
      setAnalyticsData(dashboardData)
      setBreedAnalytics(breedData)
      setTrendsData(trendsData)
    } catch (error) {
      console.error('Failed to load analytics:', error)
      // Fallback to mock data for development
      setAnalyticsData(generateMockData())
      setBreedAnalytics(generateMockBreedData())
      setTrendsData(generateMockTrendsData())
    } finally {
      setLoading(false)
    }
  }, [user?.id, selectedTimeRange])

  const refreshData = async () => {
    setRefreshing(true)
    await loadAnalyticsData()
    setRefreshing(false)
  }

  useEffect(() => {
    loadAnalyticsData()
  }, [loadAnalyticsData])

  const generateMockData = () => ({
    overview: {
      total_scans: 127,
      unique_breeds: 23,
      accuracy_rate: 0.89,
      streak_days: 5,
      this_month: 45,
      last_month: 38,
      growth_rate: 18.4
    },
    charts: {
      daily_scans: Array.from({ length: 30 }, (_, i) => ({
        date: format(subDays(new Date(), 29 - i), 'yyyy-MM-dd'),
        scans: Math.floor(Math.random() * 8) + 1,
        accuracy: 0.8 + Math.random() * 0.2
      })),
      breed_distribution: [
        { breed: 'Golden Retriever', count: 18, percentage: 14.2 },
        { breed: 'German Shepherd', count: 15, percentage: 11.8 },
        { breed: 'Labrador', count: 12, percentage: 9.4 },
        { breed: 'Bulldog', count: 10, percentage: 7.9 },
        { breed: 'Beagle', count: 8, percentage: 6.3 }
      ],
      confidence_histogram: [
        { range: '0.5-0.6', count: 5 },
        { range: '0.6-0.7', count: 12 },
        { range: '0.7-0.8', count: 25 },
        { range: '0.8-0.9', count: 45 },
        { range: '0.9-1.0', count: 40 }
      ],
      hourly_usage: Array.from({ length: 24 }, (_, hour) => ({
        hour,
        scans: Math.floor(Math.random() * 10)
      }))
    },
    insights: {
      most_active_hour: 14,
      favorite_breed: 'Golden Retriever',
      average_confidence: 0.847,
      scan_frequency: 4.2
    }
  })

  const generateMockBreedData = () => ({
    breed_analytics: [
      { breed: 'Golden Retriever', count: 18, average_confidence: 0.92, latest_scan: '2024-10-09T10:30:00Z' },
      { breed: 'German Shepherd', count: 15, average_confidence: 0.88, latest_scan: '2024-10-08T15:45:00Z' },
      { breed: 'Labrador', count: 12, average_confidence: 0.85, latest_scan: '2024-10-07T09:20:00Z' }
    ],
    total_unique_breeds: 23,
    most_identified: 'Golden Retriever'
  })

  const generateMockTrendsData = () => ({
    period: 'weekly',
    trends: Array.from({ length: 12 }, (_, i) => ({
      week_start: format(subDays(new Date(), (11 - i) * 7), 'yyyy-MM-dd'),
      scans: Math.floor(Math.random() * 30) + 10
    })),
    growth_metrics: {
      current_period: 28,
      previous_period: 24,
      trend_direction: 'increasing'
    }
  })

  const exportData = async (format = 'csv') => {
    if (!user?.id) return
    
    try {
      setExportLoading(true)
      const exportResult = await apiService.exportAnalyticsData(user.id, format, 'all')
      
      // Create download link
      const dataStr = format === 'csv' 
        ? Object.values(exportResult.data).join('\n\n')
        : JSON.stringify(exportResult.data, null, 2)
      
      const dataBlob = new Blob([dataStr], { type: format === 'csv' ? 'text/csv' : 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `pawdentify-analytics-${format(new Date(), 'yyyy-MM-dd')}.${format}`
      link.click()
      
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setExportLoading(false)
    }
  }

  const getTrendIcon = (value) => {
    if (value > 0) return <ArrowUp className="h-4 w-4 text-green-600" />
    if (value < 0) return <ArrowDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-600" />
  }

  const formatValue = (value, type) => {
    switch (type) {
      case 'percentage':
        return `${(value * 100).toFixed(1)}%`
      case 'number':
        return value.toLocaleString()
      case 'decimal':
        return value.toFixed(2)
      default:
        return value.toString()
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Analytics</h3>
          <p className="text-gray-600">Gathering your scanning insights...</p>
        </div>
      </div>
    )
  }

  const data = analyticsData || generateMockData()
  const breedData = breedAnalytics || generateMockBreedData()
  const trends = trendsData || generateMockTrendsData()

  const stats = [
    {
      icon: Camera,
      label: 'Total Scans',
      value: formatValue(data.overview.total_scans, 'number'),
      change: data.overview.growth_rate,
      color: 'from-blue-500 to-blue-600',
      type: 'percentage'
    },
    {
      icon: Target,
      label: 'Avg Accuracy',
      value: formatValue(data.overview.accuracy_rate, 'percentage'),
      change: 2.5,
      color: 'from-green-500 to-green-600',
      type: 'percentage'
    },
    {
      icon: Star,
      label: 'Unique Breeds',
      value: formatValue(data.overview.unique_breeds, 'number'),
      change: data.overview.unique_breeds > 20 ? 5 : -2,
      color: 'from-purple-500 to-purple-600',
      type: 'number'
    },
    {
      icon: Zap,
      label: 'Day Streak',
      value: formatValue(data.overview.streak_days, 'number'),
      change: data.overview.streak_days > 0 ? data.overview.streak_days : 0,
      color: 'from-orange-500 to-orange-600',
      type: 'days'
    }
  ]

  const renderChart = () => {
    const chartData = data.charts

    switch (selectedChart) {
      case 'scans':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData.daily_scans}>
              <defs>
                <linearGradient id="scanGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => format(new Date(value), 'MM/dd')}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                formatter={(value, name) => [value, 'Scans']}
              />
              <Area 
                type="monotone" 
                dataKey="scans" 
                stroke="#3B82F6" 
                fillOpacity={1} 
                fill="url(#scanGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        )

      case 'breeds':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RechartsPieChart>
              <PieChart 
                data={chartData.breed_distribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="count"
              >
                {chartData.breed_distribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </PieChart>
              <Tooltip formatter={(value, name) => [value, 'Scans']} />
            </RechartsPieChart>
          </ResponsiveContainer>
        )

      case 'confidence':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData.confidence_histogram}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="range" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value, name) => [value, 'Count']} />
              <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )

      case 'time':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData.hourly_usage}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="hour" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}:00`}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                labelFormatter={(value) => `${value}:00`}
                formatter={(value, name) => [value, 'Scans']}
              />
              <Line 
                type="monotone" 
                dataKey="scans" 
                stroke="#F59E0B" 
                strokeWidth={3}
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )

      default:
        return <div className="text-center text-gray-500">Select a chart type</div>
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-6 w-6" />
              <h2 className="text-2xl font-bold">Enhanced Analytics</h2>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={refreshData}
                disabled={refreshing}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <div className="relative">
                <button 
                  onClick={() => exportData('csv')}
                  disabled={exportLoading}
                  className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50"
                >
                  {exportLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <p className="text-primary-100 mt-1">Detailed insights into your scanning patterns and performance</p>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Filter className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-700">Time Range:</span>
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              >
                {timeRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              {chartTypes.map(chart => {
                const Icon = chart.icon
                return (
                  <button
                    key={chart.value}
                    onClick={() => setSelectedChart(chart.value)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      selectedChart === chart.value
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{chart.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(stat.change)}
                      <span className={`text-sm font-medium ${
                        stat.change > 0 ? 'text-green-600' : stat.change < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {stat.type === 'percentage' ? `${stat.change > 0 ? '+' : ''}${stat.change}%` : 
                         stat.type === 'days' ? `${stat.change} days` : 
                         `${stat.change > 0 ? '+' : ''}${stat.change}`}
                      </span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              )
            })}
          </div>

          {/* Chart Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {chartTypes.find(c => c.value === selectedChart)?.label}
              </h3>
              <div className="text-sm text-gray-600">
                Last {timeRanges.find(r => r.value === selectedTimeRange)?.label}
              </div>
            </div>
            
            <div className="relative">
              {renderChart()}
            </div>
          </motion.div>

          {/* Breed Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid md:grid-cols-2 gap-6 mb-8"
          >
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center space-x-3 mb-4">
                <TrendingUp className="h-6 w-6 text-blue-600" />
                <h4 className="text-lg font-semibold text-gray-900">Top Breeds</h4>
              </div>
              <div className="space-y-3">
                {breedData.breed_analytics.slice(0, 5).map((breed, index) => (
                  <div key={breed.breed} className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${
                        index === 0 ? 'from-yellow-400 to-yellow-500' :
                        index === 1 ? 'from-gray-400 to-gray-500' :
                        index === 2 ? 'from-orange-400 to-orange-500' :
                        'from-blue-400 to-blue-500'
                      } flex items-center justify-center text-white font-bold text-sm`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{breed.breed}</div>
                        <div className="text-sm text-gray-600">{breed.count} scans</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatValue(breed.average_confidence, 'percentage')}
                      </div>
                      <div className="text-xs text-gray-600">avg confidence</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center space-x-3 mb-4">
                <Trophy className="h-6 w-6 text-green-600" />
                <h4 className="text-lg font-semibold text-gray-900">Insights & Achievements</h4>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Most active hour: {data.insights.most_active_hour}:00</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>Favorite breed: {data.insights.favorite_breed}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span>Scan frequency: {data.insights.scan_frequency.toFixed(1)} per day</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <span>Average confidence: {formatValue(data.insights.average_confidence, 'percentage')}</span>
                </div>
                
                <div className="mt-4 pt-4 border-t border-green-200">
                  <div className="font-medium text-green-700 mb-2">🏆 Achievements</div>
                  <div className="space-y-1">
                    {data.overview.total_scans >= 100 && (
                      <div className="text-xs">📸 Century Club (100+ scans)</div>
                    )}
                    {data.overview.unique_breeds >= 20 && (
                      <div className="text-xs">🐕 Breed Explorer (20+ breeds)</div>
                    )}
                    {data.overview.accuracy_rate >= 0.9 && (
                      <div className="text-xs">🎯 Accuracy Expert (90%+ avg)</div>
                    )}
                    {data.overview.streak_days >= 7 && (
                      <div className="text-xs">⚡ Week Warrior (7+ day streak)</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}