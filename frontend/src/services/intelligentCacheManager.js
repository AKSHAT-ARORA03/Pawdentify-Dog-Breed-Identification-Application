// Intelligent Caching Strategy for AI-Driven Image System
// Implements smart caching, preloading, and performance optimization

class IntelligentCacheManager {
  constructor() {
    this.cacheConfig = {
      maxCacheSize: 50, // Maximum number of breed image sets to cache
      cacheExpiry: 24 * 60 * 60 * 1000, // 24 hours
      preloadThreshold: 5, // Preload images for top 5 popular breeds
      compressionLevel: 0.8, // Image compression for cache storage
      enablePersistentCache: true // Store cache in localStorage
    }
    
    this.memoryCache = new Map()
    this.accessFrequency = new Map()
    this.lastAccessed = new Map()
    this.preloadQueue = new Set()
    this.analytics = {
      cacheHits: 0,
      cacheMisses: 0,
      preloadSuccess: 0,
      totalRequests: 0
    }
    
    this.initializeCache()
  }

  /**
   * Initialize the caching system
   */
  async initializeCache() {
    console.log('🧠 Initializing Intelligent Cache Manager...')
    
    try {
      // Load persistent cache from localStorage
      if (this.cacheConfig.enablePersistentCache) {
        await this.loadPersistentCache()
      }
      
      // Start analytics tracking
      this.startAnalyticsTracking()
      
      // Schedule cache maintenance
      this.scheduleCacheMaintenance()
      
      console.log('✅ Intelligent Cache Manager initialized successfully')
    } catch (error) {
      console.error('❌ Error initializing cache manager:', error)
    }
  }

  /**
   * Get cached images for a breed with intelligent retrieval
   */
  async getCachedImages(breedName, options = {}) {
    this.analytics.totalRequests++
    
    const cacheKey = this.generateCacheKey(breedName, options)
    const cached = this.memoryCache.get(cacheKey)
    
    if (cached && this.isCacheValid(cached)) {
      // Cache hit
      this.analytics.cacheHits++
      this.updateAccessMetrics(breedName)
      
      console.log(`💾 Cache hit for ${breedName}`)
      return { 
        success: true, 
        images: cached.data, 
        source: 'cache',
        cacheAge: Date.now() - cached.timestamp
      }
    }
    
    // Cache miss
    this.analytics.cacheMisses++
    console.log(`❌ Cache miss for ${breedName}`)
    return { success: false, source: 'cache_miss' }
  }

  /**
   * Store images in cache with intelligent management
   */
  async setCacheImages(breedName, images, options = {}) {
    try {
      const cacheKey = this.generateCacheKey(breedName, options)
      
      // Optimize images for cache storage
      const optimizedImages = await this.optimizeImagesForCache(images)
      
      const cacheEntry = {
        data: optimizedImages,
        timestamp: Date.now(),
        breedName,
        options,
        size: this.calculateCacheEntrySize(optimizedImages),
        accessCount: 0
      }

      // Check cache size and evict if necessary
      await this.ensureCacheSpace(cacheEntry.size)
      
      // Store in memory cache
      this.memoryCache.set(cacheKey, cacheEntry)
      this.updateAccessMetrics(breedName)
      
      // Store in persistent cache if enabled
      if (this.cacheConfig.enablePersistentCache) {
        await this.saveToPersistentCache(cacheKey, cacheEntry)
      }
      
      console.log(`💾 Cached ${images.length} images for ${breedName}`)
      return true
      
    } catch (error) {
      console.error('Error caching images:', error)
      return false
    }
  }

  /**
   * Intelligent preloading based on usage patterns
   */
  async preloadPopularBreeds(popularBreeds, userPreferences = {}) {
    console.log('🚀 Starting intelligent preload for popular breeds...')
    
    try {
      // Analyze usage patterns to determine preload priority
      const prioritizedBreeds = this.prioritizeBreedPreloading(popularBreeds, userPreferences)
      
      // Preload top priority breeds
      const preloadPromises = prioritizedBreeds.slice(0, this.cacheConfig.preloadThreshold).map(
        async (breed) => {
          try {
            if (!this.isAlreadyCached(breed.name)) {
              this.preloadQueue.add(breed.name)
              
              // Import the enhanced image service here to avoid circular dependency
              const { default: enhancedImageService } = await import('./enhancedImageService.js')
              const images = await enhancedImageService.getBreedImages(breed.name, 'medium', 3)
              
              if (images.length > 0) {
                await this.setCacheImages(breed.name, images, { preloaded: true })
                this.analytics.preloadSuccess++
                console.log(`✅ Preloaded images for ${breed.name}`)
              }
              
              this.preloadQueue.delete(breed.name)
            }
          } catch (error) {
            console.warn(`Failed to preload ${breed.name}:`, error)
            this.preloadQueue.delete(breed.name)
          }
        }
      )
      
      await Promise.allSettled(preloadPromises)
      console.log('🎯 Intelligent preloading completed')
      
    } catch (error) {
      console.error('Error in intelligent preloading:', error)
    }
  }

  /**
   * Prioritize breed preloading based on usage analytics
   */
  prioritizeBreedPreloading(popularBreeds, userPreferences) {
    return popularBreeds.map(breedName => ({
      name: breedName,
      score: this.calculatePreloadScore(breedName, userPreferences)
    })).sort((a, b) => b.score - a.score)
  }

  /**
   * Calculate preload score for a breed
   */
  calculatePreloadScore(breedName, userPreferences) {
    let score = 100 // Base score
    
    // Factor in access frequency
    const frequency = this.accessFrequency.get(breedName) || 0
    score += frequency * 10
    
    // Factor in recent access
    const lastAccess = this.lastAccessed.get(breedName)
    if (lastAccess) {
      const hoursSinceAccess = (Date.now() - lastAccess) / (1000 * 60 * 60)
      score += Math.max(0, 50 - hoursSinceAccess) // Recent access gets higher score
    }
    
    // Factor in user preferences
    if (userPreferences.favoriteBreeds?.includes(breedName)) {
      score += 200
    }
    
    // Factor in cache status
    if (this.isAlreadyCached(breedName)) {
      score -= 50 // Lower priority for already cached breeds
    }
    
    return score
  }

  /**
   * Optimize images for cache storage
   */
  async optimizeImagesForCache(images) {
    return images.map(image => ({
      ...image,
      // Keep essential data, remove heavy metadata
      credit: image.credit ? {
        photographer: image.credit.photographer,
        source: image.credit.source
      } : null,
      // Optimize URLs for caching
      optimizedUrl: this.optimizeImageUrl(image.url),
      cachedAt: Date.now()
    }))
  }

  /**
   * Optimize image URL for better caching
   */
  optimizeImageUrl(url) {
    // Add compression parameters for supported services
    if (url.includes('unsplash.com')) {
      const separator = url.includes('?') ? '&' : '?'
      return `${url}${separator}q=${this.cacheConfig.compressionLevel * 100}&auto=compress`
    }
    return url
  }

  /**
   * Ensure sufficient cache space by evicting least important entries
   */
  async ensureCacheSpace(requiredSize) {
    if (this.memoryCache.size < this.cacheConfig.maxCacheSize) {
      return // Sufficient space available
    }
    
    console.log('🧹 Cache cleanup: Ensuring space for new entries...')
    
    // Get cache entries sorted by importance (least important first)
    const entries = Array.from(this.memoryCache.entries())
      .sort(([, a], [, b]) => this.calculateCacheImportance(a) - this.calculateCacheImportance(b))
    
    // Remove least important entries until we have space
    let removedCount = 0
    while (this.memoryCache.size >= this.cacheConfig.maxCacheSize && removedCount < entries.length) {
      const [key] = entries[removedCount]
      this.memoryCache.delete(key)
      removedCount++
    }
    
    console.log(`🗑️ Evicted ${removedCount} cache entries`)
  }

  /**
   * Calculate importance score for cache entry (higher = more important)
   */
  calculateCacheImportance(entry) {
    let score = 0
    
    // Recent access is important
    const age = Date.now() - entry.timestamp
    score += Math.max(0, 1000 - (age / (1000 * 60))) // Newer = higher score
    
    // Access frequency is important
    score += (entry.accessCount || 0) * 100
    
    // Preloaded content has higher importance
    if (entry.options?.preloaded) {
      score += 500
    }
    
    return score
  }

  /**
   * Load persistent cache from localStorage
   */
  async loadPersistentCache() {
    try {
      const persistentCache = localStorage.getItem('pawdentify_image_cache')
      if (persistentCache) {
        const cacheData = JSON.parse(persistentCache)
        
        // Validate and restore cache entries
        Object.entries(cacheData).forEach(([key, entry]) => {
          if (this.isCacheValid(entry)) {
            this.memoryCache.set(key, entry)
          }
        })
        
        console.log(`📦 Restored ${this.memoryCache.size} cache entries from persistent storage`)
      }
    } catch (error) {
      console.warn('Failed to load persistent cache:', error)
    }
  }

  /**
   * Save cache entry to persistent storage
   */
  async saveToPersistentCache(key, entry) {
    try {
      // Only save lightweight entries to localStorage
      if (entry.size < 100000) { // 100KB limit for localStorage entry
        const currentCache = JSON.parse(localStorage.getItem('pawdentify_image_cache') || '{}')
        currentCache[key] = entry
        
        // Limit persistent cache size
        const keys = Object.keys(currentCache)
        if (keys.length > 20) {
          // Remove oldest entries
          keys.slice(0, -20).forEach(oldKey => delete currentCache[oldKey])
        }
        
        localStorage.setItem('pawdentify_image_cache', JSON.stringify(currentCache))
      }
    } catch (error) {
      console.warn('Failed to save to persistent cache:', error)
    }
  }

  /**
   * Generate cache key for breed and options
   */
  generateCacheKey(breedName, options) {
    const optionsHash = Object.keys(options).sort().map(k => `${k}:${options[k]}`).join('|')
    return `${breedName}|${optionsHash}`
  }

  /**
   * Check if cache entry is still valid
   */
  isCacheValid(entry) {
    if (!entry || !entry.timestamp) return false
    
    const age = Date.now() - entry.timestamp
    return age < this.cacheConfig.cacheExpiry
  }

  /**
   * Check if breed is already cached
   */
  isAlreadyCached(breedName) {
    return Array.from(this.memoryCache.keys()).some(key => key.startsWith(breedName))
  }

  /**
   * Update access metrics for analytics
   */
  updateAccessMetrics(breedName) {
    this.accessFrequency.set(breedName, (this.accessFrequency.get(breedName) || 0) + 1)
    this.lastAccessed.set(breedName, Date.now())
  }

  /**
   * Calculate cache entry size (rough estimation)
   */
  calculateCacheEntrySize(images) {
    return images.length * 1000 // Rough estimate: 1KB per image metadata
  }

  /**
   * Start analytics tracking
   */
  startAnalyticsTracking() {
    // Log cache statistics periodically
    setInterval(() => {
      const stats = this.getCacheStatistics()
      console.log('📊 Cache Analytics:', stats)
    }, 5 * 60 * 1000) // Every 5 minutes
  }

  /**
   * Schedule regular cache maintenance
   */
  scheduleCacheMaintenance() {
    // Run maintenance every hour
    setInterval(() => {
      this.performCacheMaintenance()
    }, 60 * 60 * 1000)
  }

  /**
   * Perform cache maintenance tasks
   */
  async performCacheMaintenance() {
    console.log('🔧 Performing cache maintenance...')
    
    let cleanedEntries = 0
    
    // Remove expired entries
    for (const [key, entry] of this.memoryCache.entries()) {
      if (!this.isCacheValid(entry)) {
        this.memoryCache.delete(key)
        cleanedEntries++
      }
    }
    
    if (cleanedEntries > 0) {
      console.log(`🧹 Cleaned ${cleanedEntries} expired cache entries`)
    }
    
    // Update persistent cache
    if (this.cacheConfig.enablePersistentCache) {
      await this.syncPersistentCache()
    }
  }

  /**
   * Sync memory cache with persistent cache
   */
  async syncPersistentCache() {
    try {
      const cacheToSave = {}
      
      // Save only the most important entries to persistent storage
      const sortedEntries = Array.from(this.memoryCache.entries())
        .sort(([, a], [, b]) => this.calculateCacheImportance(b) - this.calculateCacheImportance(a))
        .slice(0, 10) // Top 10 most important
      
      sortedEntries.forEach(([key, entry]) => {
        cacheToSave[key] = entry
      })
      
      localStorage.setItem('pawdentify_image_cache', JSON.stringify(cacheToSave))
    } catch (error) {
      console.warn('Failed to sync persistent cache:', error)
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStatistics() {
    const hitRate = this.analytics.totalRequests > 0 
      ? (this.analytics.cacheHits / this.analytics.totalRequests * 100).toFixed(2)
      : 0

    return {
      memoryCache: {
        size: this.memoryCache.size,
        maxSize: this.cacheConfig.maxCacheSize
      },
      analytics: {
        ...this.analytics,
        hitRate: `${hitRate}%`
      },
      preloading: {
        queueSize: this.preloadQueue.size,
        successCount: this.analytics.preloadSuccess
      },
      topBreeds: this.getTopAccessedBreeds()
    }
  }

  /**
   * Get top accessed breeds for analytics
   */
  getTopAccessedBreeds() {
    return Array.from(this.accessFrequency.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([breed, count]) => ({ breed, accessCount: count }))
  }

  /**
   * Clear all cache data
   */
  clearAll() {
    this.memoryCache.clear()
    this.accessFrequency.clear()
    this.lastAccessed.clear()
    this.preloadQueue.clear()
    
    if (this.cacheConfig.enablePersistentCache) {
      localStorage.removeItem('pawdentify_image_cache')
    }
    
    console.log('🗑️ All cache data cleared')
  }

  /**
   * Update cache configuration
   */
  updateConfig(newConfig) {
    this.cacheConfig = { ...this.cacheConfig, ...newConfig }
    console.log('⚙️ Cache configuration updated:', this.cacheConfig)
  }
}

// Create singleton instance
const intelligentCacheManager = new IntelligentCacheManager()

export default intelligentCacheManager;