/**
 * API Service for Pawdentify
 * Handles all communication with the backend MongoDB API
 */

// API Configuration - Use environment variable or fallback to localhost for development
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE
    console.log('🔗 API Base URL:', this.baseUrl) // Debug log
    this.apiAvailable = true // Track if API is available
  }

  // Check if API is available
  async checkApiAvailability() {
    try {
      // Try both /api/health and /health endpoints
      let response = await fetch(`${this.baseUrl}/api/health`)
      if (!response.ok) {
        response = await fetch(`${this.baseUrl}/health`)
      }
      this.apiAvailable = response.ok
      if (this.apiAvailable) {
        console.log('✅ API is available and responding')
      }
    } catch (error) {
      console.log('❌ API availability check failed:', error.message)
      this.apiAvailable = false
    }
    return this.apiAvailable
  }

  /**
   * User Operations
   */
  async createUser(userData) {
    if (!this.apiAvailable) {
      console.log('⚠️ API not available, skipping user creation')
      return { id: userData.clerk_id, ...userData }
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      })
      
      if (!response.ok) {
        if (response.status === 404) {
          this.apiAvailable = false
          console.log('⚠️ API endpoints not available, switching to local mode')
          return { id: userData.clerk_id, ...userData }
        }
        throw new Error(`Failed to create user: ${response.statusText}`)
      }
      
      return response.json()
    } catch (error) {
      if (error.message.includes('Failed to fetch')) {
        this.apiAvailable = false
        console.log('⚠️ API not reachable, switching to local mode')
        return { id: userData.clerk_id, ...userData }
      }
      throw error
    }
  }

  async getUser(clerkUserId) {
    if (!this.apiAvailable) {
      console.log('⚠️ API not available, returning null user')
      return null
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/users/${clerkUserId}`)
      
      if (response.status === 404) {
        return null // User not found
      }
      
      if (!response.ok) {
        if (response.status === 404) {
          this.apiAvailable = false
          console.log('⚠️ API endpoints not available, switching to local mode')
          return null
        }
        throw new Error(`Failed to get user: ${response.statusText}`)
      }
      
      return response.json()
    } catch (error) {
      if (error.message.includes('Failed to fetch')) {
        this.apiAvailable = false
        console.log('⚠️ API not reachable, switching to local mode')
        return null
      }
      throw error
    }
  }

  async syncUserWithClerk(clerkUser) {
    try {
      // Try to get existing user
      let user = await this.getUser(clerkUser.id)
      
      if (!user) {
        // Create new user
        const userData = {
          clerk_user_id: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          username: clerkUser.username || `${clerkUser.firstName}_${clerkUser.lastName}`.toLowerCase(),
          profile_data: {
            first_name: clerkUser.firstName || '',
            last_name: clerkUser.lastName || '',
            avatar_url: clerkUser.imageUrl || ''
          }
        }
        
        user = await this.createUser(userData)
        console.log('✅ New user created in MongoDB:', user)
      } else {
        // Update last login
        await this.updateUser(clerkUser.id, {
          'profile_data.first_name': clerkUser.firstName || '',
          'profile_data.last_name': clerkUser.lastName || '',
          'profile_data.avatar_url': clerkUser.imageUrl || ''
        })
        console.log('✅ User login updated in MongoDB')
      }
      
      return user
    } catch (error) {
      console.error('❌ Failed to sync user with MongoDB:', error)
      throw error
    }
  }

  async updateUser(clerkUserId, updateData) {
    const response = await fetch(`${this.baseUrl}/api/users/${clerkUserId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    })
    
    if (!response.ok) {
      throw new Error(`Failed to update user: ${response.statusText}`)
    }
    
    return response.json()
  }

  /**
   * Scan History Operations
   */
  async getUserScanHistory(clerkUserId, limit = 50, skip = 0) {
    if (!this.apiAvailable) {
      console.log('⚠️ API not available, returning empty scan history')
      return []
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/api/scan-history/user/${clerkUserId}?limit=${limit}&skip=${skip}`
      )
      
      if (!response.ok) {
        if (response.status === 404) {
          this.apiAvailable = false
          console.log('⚠️ API endpoints not available, returning empty scan history')
          return []
        }
        throw new Error(`Failed to get scan history: ${response.statusText}`)
      }
      
      return response.json()
    } catch (error) {
      if (error.message.includes('Failed to fetch')) {
        this.apiAvailable = false
        console.log('⚠️ API not reachable, returning empty scan history')
        return []
      }
      throw error
    }
  }

  async addScanToHistory(clerkUserId, scanData) {
    if (!this.apiAvailable) {
      console.log('⚠️ API not available, cannot save scan to MongoDB')
      return { success: false, savedToMongo: false }
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/scan-history/user/${clerkUserId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          breed: scanData.breed || scanData.predicted_class,
          confidence: scanData.confidence,
          timestamp: scanData.timestamp || new Date().toISOString(),
          imageUrl: scanData.imageUrl,
          isCorssbreed: scanData.is_potential_crossbreed || scanData.isCorssbreed,
          topPredictions: scanData.top_predictions || scanData.topPredictions,
          crossbreedAnalysis: scanData.crossbreed_analysis,
          detectionMetadata: scanData.detection_metadata
        })
      })
      
      if (!response.ok) {
        if (response.status === 404) {
          this.apiAvailable = false
          console.log('⚠️ Scan history API endpoint not available')
          return { success: false, savedToMongo: false }
        }
        throw new Error(`Failed to save scan: ${response.statusText}`)
      }
      
      const result = await response.json()
      console.log('✅ Scan saved to MongoDB:', result)
      return { success: true, savedToMongo: true, data: result }
    } catch (error) {
      if (error.message.includes('Failed to fetch')) {
        this.apiAvailable = false
        console.log('⚠️ API not reachable, cannot save scan to MongoDB')
      } else {
        console.error('❌ Error saving scan to MongoDB:', error)
      }
      return { success: false, savedToMongo: false, error: error.message }
    }
  }

  async getUserScanStats(clerkUserId) {
    if (!this.apiAvailable) {
      console.log('⚠️ API not available, returning default stats')
      return {
        total_scans: 0,
        unique_breeds: 0,
        most_identified_breed: 'None',
        average_confidence: 0,
        recent_scans: []
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/scan-history/user/${clerkUserId}/stats`)
      
      if (!response.ok) {
        if (response.status === 404) {
          this.apiAvailable = false
          console.log('⚠️ API endpoints not available, returning default stats')
          return {
            total_scans: 0,
            unique_breeds: 0,
            most_identified_breed: 'None',
            average_confidence: 0,
            recent_scans: []
          }
        }
        throw new Error(`Failed to get scan stats: ${response.statusText}`)
      }
      
      return response.json()
    } catch (error) {
      if (error.message.includes('Failed to fetch')) {
        this.apiAvailable = false
        console.log('⚠️ API not reachable, returning default stats')
        return {
          total_scans: 0,
          unique_breeds: 0,
          most_identified_breed: 'None',
          average_confidence: 0,
          recent_scans: []
        }
      }
      throw error
    }
  }

  /**
   * Enhanced prediction with user data saving
   */
  async predictWithUserData(imageFile, clerkUserId) {
    const formData = new FormData()
    formData.append('file', imageFile)
    
    // Add user_id as query parameter or form data
    const url = clerkUserId 
      ? `${this.baseUrl}/predict?user_id=${encodeURIComponent(clerkUserId)}`
      : `${this.baseUrl}/predict`
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      throw new Error(`Prediction failed: ${response.statusText}`)
    }
    
    return response.json()
  }

  /**
   * User Preferences Operations
   */
  async getUserPreferences(clerkUserId) {
    if (!this.apiAvailable) {
      console.log('⚠️ API not available, returning null preferences')
      return null
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/preferences`, {
        headers: {
          'X-User-ID': clerkUserId,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.status === 404) {
        this.apiAvailable = false
        console.log('⚠️ API endpoints not available, returning null preferences')
        return null // No preferences yet
      }
      
      if (!response.ok) {
        throw new Error(`Failed to get preferences: ${response.statusText}`)
      }
      
      return response.json()
    } catch (error) {
      if (error.message.includes('Failed to fetch')) {
        this.apiAvailable = false
        console.log('⚠️ API not reachable, returning null preferences')
        return null
      }
      throw error
    }
  }

  async updateUserPreferences(clerkUserId, preferences) {
    const response = await fetch(`${this.baseUrl}/api/preferences`, {
      method: 'PUT',
      headers: {
        'X-User-ID': clerkUserId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences)
    })
    
    if (!response.ok) {
      throw new Error(`Failed to update preferences: ${response.statusText}`)
    }
    
    return response.json()
  }

  /**
   * Analytics Operations
   */
  async getAnalyticsDashboard(clerkUserId, days = 30) {
    if (!this.apiAvailable) {
      console.log('⚠️ API not available, generating analytics from local data')
      return this.generateLocalAnalyticsDashboard(clerkUserId, days)
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/analytics/dashboard?days=${days}`, {
        headers: {
          'X-User-ID': clerkUserId,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        if (response.status === 404) {
          this.apiAvailable = false
          console.log('⚠️ Analytics API not available, generating from local data')
          return this.generateLocalAnalyticsDashboard(clerkUserId, days)
        }
        throw new Error(`Failed to get analytics dashboard: ${response.statusText}`)
      }
      
      return response.json()
    } catch (error) {
      if (error.message.includes('Failed to fetch')) {
        this.apiAvailable = false
        console.log('⚠️ API not reachable, generating analytics from local data')
        return this.generateLocalAnalyticsDashboard(clerkUserId, days)
      }
      throw error
    }
  }

  async getBreedAnalytics(clerkUserId, breedName = null) {
    if (!this.apiAvailable) {
      console.log('⚠️ API not available, generating breed analytics from local data')
      return this.generateLocalBreedAnalytics(clerkUserId, breedName)
    }

    try {
      const url = breedName 
        ? `${this.baseUrl}/api/analytics/breeds?breed_name=${encodeURIComponent(breedName)}`
        : `${this.baseUrl}/api/analytics/breeds`
      
      const response = await fetch(url, {
        headers: {
          'X-User-ID': clerkUserId,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        if (response.status === 404) {
          this.apiAvailable = false
          console.log('⚠️ Breed analytics API not available, generating from local data')
          return this.generateLocalBreedAnalytics(clerkUserId, breedName)
        }
        throw new Error(`Failed to get breed analytics: ${response.statusText}`)
      }
      
      return response.json()
    } catch (error) {
      if (error.message.includes('Failed to fetch')) {
        this.apiAvailable = false
        console.log('⚠️ API not reachable, generating breed analytics from local data')
        return this.generateLocalBreedAnalytics(clerkUserId, breedName)
      }
      throw error
    }
  }

  async getAnalyticsTrends(clerkUserId, period = 'weekly') {
    if (!this.apiAvailable) {
      console.log('⚠️ API not available, generating trends from local data')
      return this.generateLocalAnalyticsTrends(clerkUserId, period)
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/analytics/trends?period=${period}`, {
        headers: {
          'X-User-ID': clerkUserId,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        if (response.status === 404) {
          this.apiAvailable = false
          console.log('⚠️ Trends API not available, generating from local data')
          return this.generateLocalAnalyticsTrends(clerkUserId, period)
        }
        throw new Error(`Failed to get analytics trends: ${response.statusText}`)
      }
      
      return response.json()
    } catch (error) {
      if (error.message.includes('Failed to fetch')) {
        this.apiAvailable = false
        console.log('⚠️ API not reachable, generating trends from local data')
        return this.generateLocalAnalyticsTrends(clerkUserId, period)
      }
      throw error
    }
  }

  async exportAnalyticsData(clerkUserId, format = 'csv', dataType = 'all') {
    const response = await fetch(`${this.baseUrl}/api/analytics/export?format=${format}&data_type=${dataType}`, {
      method: 'POST',
      headers: {
        'X-User-ID': clerkUserId,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to export analytics data: ${response.statusText}`)
    }
    
    return response.json()
  }

  /**
   * Bookmarks/Favorites Operations
   */
  async addFavoriteBreed(clerkUserId, breedName) {
    const response = await fetch(`${this.baseUrl}/api/users/${clerkUserId}/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ breed_name: breedName })
    })
    
    if (!response.ok) {
      throw new Error(`Failed to add favorite breed: ${response.statusText}`)
    }
    
    return response.json()
  }

  async removeFavoriteBreed(clerkUserId, breedName) {
    const response = await fetch(`${this.baseUrl}/api/users/${clerkUserId}/favorites`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ breed_name: breedName })
    })
    
    if (!response.ok) {
      throw new Error(`Failed to remove favorite breed: ${response.statusText}`)
    }
    
    return response.json()
  }

  /**
   * Dashboard Statistics
   */
  async getDashboardStats(clerkUserId) {
    try {
      const [scanStats, user] = await Promise.all([
        this.getUserScanStats(clerkUserId),
        this.getUser(clerkUserId)
      ])
      
      return {
        totalScans: scanStats.total_scans || 0,
        thisMonth: scanStats.this_month || 0,
        accuracyRate: scanStats.accuracy_rate || 0,
        favoriteBreeds: user?.favorite_breeds || [],
        uniqueBreeds: scanStats.unique_breeds || 0,
        recentScans: scanStats.recent_scans || []
      }
    } catch (error) {
      console.error('Failed to get dashboard stats:', error)
      return {
        totalScans: 0,
        thisMonth: 0,
        accuracyRate: 0,
        favoriteBreeds: [],
        uniqueBreeds: 0,
        recentScans: []
      }
    }
  }

  /**
   * Local Analytics Generation Methods
   */
  generateLocalAnalyticsDashboard(clerkUserId, days = 30) {
    const scanHistory = JSON.parse(localStorage.getItem(`pawdentify_history_${clerkUserId}`) || '[]')
    const now = new Date()
    const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000))
    
    // Filter scans within the time period
    const recentScans = scanHistory.filter(scan => {
      const scanDate = new Date(scan.timestamp)
      return scanDate >= startDate
    })

    // Calculate scan frequency by day
    const scansByDay = {}
    recentScans.forEach(scan => {
      const day = new Date(scan.timestamp).toISOString().split('T')[0]
      scansByDay[day] = (scansByDay[day] || 0) + 1
    })

    // Calculate breed distribution
    const breedCounts = {}
    recentScans.forEach(scan => {
      const breed = scan.breed || 'Unknown'
      breedCounts[breed] = (breedCounts[breed] || 0) + 1
    })

    // Calculate confidence trend
    const confidenceByDay = {}
    recentScans.forEach(scan => {
      const day = new Date(scan.timestamp).toISOString().split('T')[0]
      if (!confidenceByDay[day]) confidenceByDay[day] = []
      confidenceByDay[day].push(scan.confidence || 0)
    })

    const avgConfidenceByDay = Object.keys(confidenceByDay).map(day => ({
      date: day,
      scans: scansByDay[day] || 0,
      accuracy: confidenceByDay[day].reduce((a, b) => a + b, 0) / confidenceByDay[day].length
    }))

    // Calculate streak days
    const sortedDays = Object.keys(scansByDay).sort()
    let streakDays = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)
    
    for (let i = 0; i < 30; i++) {
      const dayStr = currentDate.toISOString().split('T')[0]
      if (scansByDay[dayStr]) {
        streakDays++
      } else {
        break
      }
      currentDate.setDate(currentDate.getDate() - 1)
    }

    // Get previous period for growth calculation
    const prevStartDate = new Date(startDate.getTime() - (days * 24 * 60 * 60 * 1000))
    const prevScans = scanHistory.filter(scan => {
      const scanDate = new Date(scan.timestamp)
      return scanDate >= prevStartDate && scanDate < startDate
    })

    const growthRate = prevScans.length > 0 ? 
      ((recentScans.length - prevScans.length) / prevScans.length * 100) : 0

    return {
      overview: {
        total_scans: recentScans.length,
        unique_breeds: Object.keys(breedCounts).length,
        accuracy_rate: recentScans.length > 0 ? 
          recentScans.reduce((sum, scan) => sum + (scan.confidence || 0), 0) / recentScans.length : 0,
        streak_days: streakDays,
        this_month: recentScans.length,
        last_month: prevScans.length,
        growth_rate: growthRate
      },
      charts: {
        daily_scans: avgConfidenceByDay.sort((a, b) => new Date(a.date) - new Date(b.date)),
        breed_distribution: Object.keys(breedCounts).map(breed => ({
          breed,
          count: breedCounts[breed],
          percentage: parseFloat((breedCounts[breed] / recentScans.length * 100).toFixed(1))
        })).sort((a, b) => b.count - a.count).slice(0, 5),
        confidence_histogram: this.calculateConfidenceHistogram(recentScans),
        hourly_usage: this.calculateHourlyUsage(recentScans)
      },
      insights: {
        most_active_hour: this.getMostActiveHour(recentScans),
        favorite_breed: Object.keys(breedCounts).length > 0 ? 
          Object.keys(breedCounts).reduce((a, b) => breedCounts[a] > breedCounts[b] ? a : b) : 'None',
        average_confidence: recentScans.length > 0 ? 
          recentScans.reduce((sum, scan) => sum + (scan.confidence || 0), 0) / recentScans.length : 0,
        scan_frequency: recentScans.length / days
      }
    }
  }

  generateLocalBreedAnalytics(clerkUserId, breedName = null) {
    const scanHistory = JSON.parse(localStorage.getItem(`pawdentify_history_${clerkUserId}`) || '[]')
    
    if (breedName) {
      // Analytics for specific breed
      const breedScans = scanHistory.filter(scan => 
        scan.breed && scan.breed.toLowerCase().includes(breedName.toLowerCase())
      )
      
      const avgConfidence = breedScans.length > 0 ?
        breedScans.reduce((sum, scan) => sum + (scan.confidence || 0), 0) / breedScans.length : 0

      return {
        breed_analytics: [{
          breed: breedName,
          count: breedScans.length,
          average_confidence: avgConfidence,
          latest_scan: breedScans.length > 0 ? breedScans[breedScans.length - 1].timestamp : null
        }],
        total_unique_breeds: 1,
        most_identified: breedName
      }
    } else {
      // All breeds analytics
      const breedCounts = {}
      const breedConfidence = {}
      const breedLatestScan = {}
      
      scanHistory.forEach(scan => {
        const breed = scan.breed || 'Unknown'
        breedCounts[breed] = (breedCounts[breed] || 0) + 1
        if (!breedConfidence[breed]) breedConfidence[breed] = []
        breedConfidence[breed].push(scan.confidence || 0)
        breedLatestScan[breed] = scan.timestamp
      })

      const breedAnalytics = Object.keys(breedCounts).map(breed => ({
        breed,
        count: breedCounts[breed],
        average_confidence: breedConfidence[breed].reduce((a, b) => a + b, 0) / breedConfidence[breed].length,
        latest_scan: breedLatestScan[breed]
      })).sort((a, b) => b.count - a.count)

      return {
        breed_analytics: breedAnalytics,
        total_unique_breeds: breedAnalytics.length,
        most_identified: breedAnalytics[0]?.breed || 'None'
      }
    }
  }

  generateLocalAnalyticsTrends(clerkUserId, period = 'weekly') {
    const scanHistory = JSON.parse(localStorage.getItem(`pawdentify_history_${clerkUserId}`) || '[]')
    const now = new Date()
    
    let groupKey, periodDays
    switch (period) {
      case 'daily':
        groupKey = (date) => date.toISOString().split('T')[0]
        periodDays = 7
        break
      case 'weekly':
        groupKey = (date) => {
          const week = Math.floor((date - new Date(date.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000))
          return `${date.getFullYear()}-W${week}`
        }
        periodDays = 30
        break
      case 'monthly':
        groupKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        periodDays = 365
        break
      default:
        groupKey = (date) => `${date.getFullYear()}-W${Math.floor((date - new Date(date.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000))}`
        periodDays = 30
    }

    const startDate = new Date(now.getTime() - (periodDays * 24 * 60 * 60 * 1000))
    const recentScans = scanHistory.filter(scan => new Date(scan.timestamp) >= startDate)

    // Group scans by period
    const scansByPeriod = {}
    const confidenceByPeriod = {}
    const breedsByPeriod = {}

    recentScans.forEach(scan => {
      const periodKey = groupKey(new Date(scan.timestamp))
      
      scansByPeriod[periodKey] = (scansByPeriod[periodKey] || 0) + 1
      
      if (!confidenceByPeriod[periodKey]) confidenceByPeriod[periodKey] = []
      confidenceByPeriod[periodKey].push(scan.confidence || 0)
      
      if (!breedsByPeriod[periodKey]) breedsByPeriod[periodKey] = new Set()
      breedsByPeriod[periodKey].add(scan.breed || 'Unknown')
    })

    const trends = Object.keys(scansByPeriod).map(period => ({
      period,
      scanCount: scansByPeriod[period],
      averageConfidence: confidenceByPeriod[period].reduce((a, b) => a + b, 0) / confidenceByPeriod[period].length,
      uniqueBreeds: breedsByPeriod[period].size
    })).sort()

    return {
      period,
      trends,
      summary: {
        totalPeriods: trends.length,
        averageScansPerPeriod: trends.length > 0 ? trends.reduce((sum, t) => sum + t.scanCount, 0) / trends.length : 0,
        trendDirection: this.calculateTrendDirection(trends)
      }
    }
  }

  calculateConfidenceDistribution(scans) {
    const ranges = {
      '0.5-0.6': 0,
      '0.6-0.7': 0,
      '0.7-0.8': 0,
      '0.8-0.9': 0,
      '0.9-1.0': 0
    }

    scans.forEach(scan => {
      const confidence = scan.confidence || 0
      if (confidence >= 0.9) ranges['0.9-1.0']++
      else if (confidence >= 0.8) ranges['0.8-0.9']++
      else if (confidence >= 0.7) ranges['0.7-0.8']++
      else if (confidence >= 0.6) ranges['0.6-0.7']++
      else ranges['0.5-0.6']++
    })

    return Object.keys(ranges).map(range => ({
      range,
      count: ranges[range]
    }))
  }

  calculateConfidenceHistogram(scans) {
    const ranges = {
      '0.5-0.6': 0,
      '0.6-0.7': 0,
      '0.7-0.8': 0,
      '0.8-0.9': 0,
      '0.9-1.0': 0
    }

    scans.forEach(scan => {
      const confidence = scan.confidence || 0
      if (confidence >= 0.9) ranges['0.9-1.0']++
      else if (confidence >= 0.8) ranges['0.8-0.9']++
      else if (confidence >= 0.7) ranges['0.7-0.8']++
      else if (confidence >= 0.6) ranges['0.6-0.7']++
      else ranges['0.5-0.6']++
    })

    return Object.keys(ranges).map(range => ({
      range,
      count: ranges[range]
    }))
  }

  calculateHourlyUsage(scans) {
    const hourCounts = Array.from({ length: 24 }, () => 0)
    
    scans.forEach(scan => {
      const hour = new Date(scan.timestamp).getHours()
      hourCounts[hour]++
    })

    return hourCounts.map((count, hour) => ({
      hour,
      scans: count
    }))
  }

  getMostActiveHour(scans) {
    const hourCounts = Array.from({ length: 24 }, () => 0)
    
    scans.forEach(scan => {
      const hour = new Date(scan.timestamp).getHours()
      hourCounts[hour]++
    })

    return hourCounts.indexOf(Math.max(...hourCounts))
  }

  calculateTrendDirection(trends) {
    if (trends.length < 2) return 'stable'
    
    const recent = trends.slice(-3).reduce((sum, t) => sum + t.scanCount, 0) / Math.min(3, trends.length)
    const earlier = trends.slice(0, -3).reduce((sum, t) => sum + t.scanCount, 0) / Math.max(1, trends.length - 3)
    
    if (recent > earlier * 1.1) return 'increasing'
    if (recent < earlier * 0.9) return 'decreasing'
    return 'stable'
  }

  /**
   * User Management Operations
   */
  async createUserIfNotExists(clerkUserId, userData) {
    if (!this.apiAvailable) {
      console.log('⚠️ API not available, skipping user creation')
      return { message: 'API not available' }
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clerk_user_id: clerkUserId,
          email: userData.email,
          username: userData.username,
          first_name: userData.first_name,
          last_name: userData.last_name
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to create user: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('👤 User creation result:', result)
      return result
    } catch (error) {
      console.error('Error creating user:', error)
      // Don't throw error - user might already exist
      return { message: 'User creation failed but continuing...' }
    }
  }

  /**
   * Pet Management Operations
   */
  async createPet(petData, userId) {
    if (!this.apiAvailable) {
      console.log('⚠️ API not available, using mock pet creation')
      return { 
        _id: `pet_${Date.now()}`, 
        ...petData, 
        user_id: userId,
        created_at: new Date().toISOString()
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/pets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': userId
        },
        body: JSON.stringify(petData)
      })

      if (!response.ok) {
        throw new Error(`Failed to create pet: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating pet:', error)
      throw error
    }
  }

  async getUserPets(userId) {
    if (!this.apiAvailable) {
      console.log('⚠️ API not available, returning empty pets array')
      return []
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/pets`, {
        method: 'GET',
        headers: {
          'X-User-ID': userId
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to get pets: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting pets:', error)
      return []
    }
  }

  async updatePet(petId, updateData, userId) {
    if (!this.apiAvailable) {
      console.log('⚠️ API not available, mock updating pet')
      return true
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/pets/${petId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': userId
        },
        body: JSON.stringify(updateData)
      })

      return response.ok
    } catch (error) {
      console.error('Error updating pet:', error)
      return false
    }
  }

  async deletePet(petId, userId) {
    if (!this.apiAvailable) {
      console.log('⚠️ API not available, mock deleting pet')
      return true
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/pets/${petId}`, {
        method: 'DELETE',
        headers: {
          'X-User-ID': userId
        }
      })

      return response.ok
    } catch (error) {
      console.error('Error deleting pet:', error)
      return false
    }
  }

  /**
   * Vaccination Operations
   */
  async createVaccination(vaccinationData, userId) {
    if (!this.apiAvailable) {
      console.log('⚠️ API not available, using mock vaccination creation')
      return { 
        _id: `vaccination_${Date.now()}`, 
        ...vaccinationData, 
        user_id: userId,
        created_at: new Date().toISOString()
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/vaccinations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': userId
        },
        body: JSON.stringify(vaccinationData)
      })

      if (!response.ok) {
        throw new Error(`Failed to create vaccination: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating vaccination:', error)
      throw error
    }
  }

  async getVaccinations(userId, petId = null) {
    if (!this.apiAvailable) {
      console.log('⚠️ API not available, returning empty vaccinations array')
      return []
    }

    try {
      const url = new URL(`${this.baseUrl}/api/vaccinations`)
      if (petId) {
        url.searchParams.append('pet_id', petId)
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-User-ID': userId
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to get vaccinations: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting vaccinations:', error)
      return []
    }
  }

  async getUpcomingVaccinations(userId, daysAhead = 30) {
    if (!this.apiAvailable) {
      console.log('⚠️ API not available, returning empty upcoming vaccinations')
      return []
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/vaccinations/upcoming?days_ahead=${daysAhead}`, {
        method: 'GET',
        headers: {
          'X-User-ID': userId
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to get upcoming vaccinations: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting upcoming vaccinations:', error)
      return []
    }
  }

  async getOverdueVaccinations(userId) {
    if (!this.apiAvailable) {
      console.log('⚠️ API not available, returning empty overdue vaccinations')
      return []
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/vaccinations/overdue`, {
        method: 'GET',
        headers: {
          'X-User-ID': userId
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to get overdue vaccinations: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting overdue vaccinations:', error)
      return []
    }
  }

  async updateVaccinationStatus(vaccinationId, status, administeredDate = null, notes = null) {
    if (!this.apiAvailable) {
      console.log('⚠️ API not available, mock updating vaccination status')
      return true
    }

    try {
      // Build URL with query parameters instead of JSON body
      const params = new URLSearchParams({ status })
      if (administeredDate) params.append('administered_date', administeredDate)
      if (notes) params.append('notes', notes)

      const response = await fetch(`${this.baseUrl}/api/vaccinations/${vaccinationId}/status?${params.toString()}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })

      if (!response.ok) {
        console.error('Failed to update vaccination status:', response.status, response.statusText)
        return false
      }

      return response.ok
    } catch (error) {
      console.error('Error updating vaccination status:', error)
      return false
    }
  }

  async getVaccinationStatistics(userId) {
    if (!this.apiAvailable) {
      console.log('⚠️ API not available, returning mock vaccination statistics')
      return {
        completed: 0,
        upcoming: 0,
        overdue: 0,
        scheduled: 0,
        total: 0
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/vaccinations/statistics`, {
        method: 'GET',
        headers: {
          'X-User-ID': userId
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to get vaccination statistics: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting vaccination statistics:', error)
      return { completed: 0, upcoming: 0, overdue: 0, scheduled: 0, total: 0 }
    }
  }

  /**
   * Feedback Operations
   */
  async submitFeedback(feedbackData, userId) {
    if (!this.apiAvailable) {
      console.log('⚠️ API not available, using mock feedback submission')
      return { 
        _id: `feedback_${Date.now()}`, 
        ...feedbackData, 
        user_id: userId,
        submitted_at: new Date().toISOString(),
        status: 'pending'
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': userId
        },
        body: JSON.stringify(feedbackData)
      })

      if (!response.ok) {
        throw new Error(`Failed to submit feedback: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error submitting feedback:', error)
      throw error
    }
  }

  async getUserFeedback(userId, limit = 20, skip = 0) {
    if (!this.apiAvailable) {
      console.log('⚠️ API not available, returning empty feedback array')
      return []
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/feedback?limit=${limit}&skip=${skip}`, {
        method: 'GET',
        headers: {
          'X-User-ID': userId
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to get user feedback: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting user feedback:', error)
      return []
    }
  }

  /**
   * Community Feedback Operations
   */
  async submitCommunityFeedback(feedbackData, userId) {
    if (!this.apiAvailable) {
      console.log('⚠️ API not available, storing community feedback locally')
      
      const localFeedback = { 
        _id: `community_feedback_${Date.now()}`, 
        ...feedbackData, 
        user_id: userId,
        submitted_at: new Date().toISOString(),
        is_approved: true // Direct approval - no moderation needed
      };
      
      // Store in localStorage
      try {
        const existingFeedback = localStorage.getItem(`community_feedback_${userId}`);
        const feedbackArray = existingFeedback ? JSON.parse(existingFeedback) : [];
        feedbackArray.unshift(localFeedback); // Add to beginning
        localStorage.setItem(`community_feedback_${userId}`, JSON.stringify(feedbackArray));
        console.log('✅ Community feedback stored locally');
      } catch (error) {
        console.error('Failed to store feedback locally:', error);
      }
      
      return localFeedback;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/community-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': userId
        },
        body: JSON.stringify(feedbackData)
      })

      if (!response.ok) {
        throw new Error(`Failed to submit community feedback: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error submitting community feedback:', error)
      throw error
    }
  }

  async getTestimonials(limit = 10, featuredOnly = false) {
    if (!this.apiAvailable) {
      console.log('⚠️ API not available, trying to get community feedback as testimonials')
      
      // Try to get community feedback instead
      try {
        const communityFeedback = await this.getUserCommunityFeedback(this.currentUserId || 'fallback');
        // Filter approved community feedback as testimonials
        const approvedTestimonials = communityFeedback.filter(feedback => 
          feedback.is_approved && feedback.rating && feedback.rating > 0
        ).slice(0, limit);
        
        console.log('📊 Returning community feedback as testimonials:', approvedTestimonials.length);
        return approvedTestimonials;
      } catch (error) {
        console.log('⚠️ Could not get community feedback, returning empty array');
        return []
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/community-feedback/testimonials?limit=${limit}&featured_only=${featuredOnly}`, {
        method: 'GET'
      })

      if (!response.ok) {
        throw new Error(`Failed to get testimonials: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting testimonials:', error)
      return []
    }
  }

  async getUserCommunityFeedback(userId) {
    // Store user ID for potential use in getTestimonials fallback
    this.currentUserId = userId;
    
    if (!this.apiAvailable) {
      console.log('⚠️ API not available, returning stored community feedback');
      
      // Return stored community feedback from localStorage if available
      try {
        const storedFeedback = localStorage.getItem(`community_feedback_${userId}`);
        if (storedFeedback) {
          const parsedFeedback = JSON.parse(storedFeedback);
          console.log('📊 Retrieved stored community feedback:', parsedFeedback.length);
          return parsedFeedback;
        }
      } catch (error) {
        console.log('Could not retrieve stored feedback');
      }
      
      return []
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/community-feedback/user`, {
        method: 'GET',
        headers: {
          'X-User-ID': userId
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to get user community feedback: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting user community feedback:', error)
      return []
    }
  }

  async voteOnFeedback(feedbackId, isHelpful) {
    if (!this.apiAvailable) {
      console.log('⚠️ API not available, mock voting on feedback')
      return true
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/community-feedback/${feedbackId}/vote?is_helpful=${isHelpful}`, {
        method: 'POST'
      })

      return response.ok
    } catch (error) {
      console.error('Error voting on feedback:', error)
      return false
    }
  }
}

// Create and export singleton instance
const apiService = new ApiService()
export default apiService
