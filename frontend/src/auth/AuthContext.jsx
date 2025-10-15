import { createContext, useContext, useEffect, useState } from 'react'
import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-react'
import apiService from '../services/api'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const AuthContext = createContext({})

export const useAuthContext = () => useContext(AuthContext)

// Fallback auth provider when Clerk is not available
function FallbackAuthProvider({ children }) {
  const [fallbackUser, setFallbackUser] = useState(null)
  const [isSignedIn, setIsSignedIn] = useState(false)

  const signIn = () => {
    setFallbackUser({
      id: 'demo-user',
      firstName: 'Demo',
      lastName: 'User',
      emailAddresses: [{ emailAddress: 'demo@pawdentify.com' }]
    })
    setIsSignedIn(true)
  }

  const signOut = () => {
    setFallbackUser(null)
    setIsSignedIn(false)
  }

  return (
    <AuthContextProvider 
      isSignedIn={isSignedIn} 
      isLoaded={true} 
      user={fallbackUser}
      signIn={signIn}
      signOut={signOut}
    >
      {children}
    </AuthContextProvider>
  )
}

export function AuthProvider({ children }) {
  // Check if Clerk key is available and valid
  if (!PUBLISHABLE_KEY || !PUBLISHABLE_KEY.startsWith('pk_')) {
    console.warn('Clerk not configured, using fallback authentication')
    return <FallbackAuthProvider>{children}</FallbackAuthProvider>
  }

  try {
    return (
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <AuthContextProvider>
          {children}
        </AuthContextProvider>
      </ClerkProvider>
    )
  } catch (error) {
    console.warn('Clerk initialization failed, using fallback authentication:', error)
    return <FallbackAuthProvider>{children}</FallbackAuthProvider>
  }
}

function AuthContextProvider({ children, isSignedIn: fallbackIsSignedIn, isLoaded: fallbackIsLoaded, user: fallbackUser, signIn: fallbackSignIn, signOut: fallbackSignOut }) {
  // Use Clerk hooks if available, otherwise use fallback props
  let clerkAuth = null
  let clerkUser = null
  
  try {
    clerkAuth = useAuth()
    clerkUser = useUser()
  } catch (error) {
    // Clerk hooks not available in fallback mode
  }
  
  const isSignedIn = fallbackIsSignedIn !== undefined ? fallbackIsSignedIn : clerkAuth?.isSignedIn || false
  const isLoaded = fallbackIsLoaded !== undefined ? fallbackIsLoaded : clerkAuth?.isLoaded || true
  const user = fallbackUser !== undefined ? fallbackUser : clerkUser?.user || null
  
  const [userHistory, setUserHistory] = useState([])
  const [savedBreeds, setSavedBreeds] = useState([])
  const [dashboardStats, setDashboardStats] = useState(null)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [currentTheme, setCurrentTheme] = useState('light')

  // Initialize theme on app load
  useEffect(() => {
    const initializeTheme = () => {
      // Check localStorage first
      const savedTheme = localStorage.getItem('pawdentify_theme')
      if (savedTheme) {
        applyTheme(savedTheme)
        setCurrentTheme(savedTheme)
      } else {
        // Use system preference as default
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        const defaultTheme = prefersDark ? 'dark' : 'light'
        applyTheme(defaultTheme)
        setCurrentTheme(defaultTheme)
      }
    }

    initializeTheme()

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => {
      if (currentTheme === 'auto') {
        applyTheme('auto')
      }
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Sync user with MongoDB when signed in
  useEffect(() => {
    if (isSignedIn && user && !fallbackUser) {
      syncUserData()
    } else if (isSignedIn && user) {
      // Load fallback data from localStorage for demo mode
      loadFallbackData()
    }
  }, [isSignedIn, user])

  // Recalculate dashboard stats whenever userHistory or savedBreeds change
  useEffect(() => {
    if (isSignedIn && user) {
      // Always recalculate stats when data changes, even if userHistory is empty
      calculateLocalDashboardStats()
    }
  }, [userHistory, savedBreeds, isSignedIn, user])

  const applyTheme = (theme) => {
    const root = document.documentElement
    
    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'light') {
      root.classList.remove('dark')
    } else if (theme === 'auto') {
      // Use system preference
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (isDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
    
    // Store in localStorage for persistence
    localStorage.setItem('pawdentify_theme', theme)
    setCurrentTheme(theme)
  }

  const syncUserData = async () => {
    try {
      setIsLoadingData(true)
      
      // Sync user with MongoDB
      const syncResult = await apiService.syncUserWithClerk(user)
      
      // Check if API is available by checking the apiService flag
      if (apiService.apiAvailable) {
        // Load real data from MongoDB
        await Promise.all([
          loadScanHistory(),
          loadDashboardStats(),
          loadUserPreferences()
        ])
        console.log('✅ User data synced successfully with MongoDB')
      } else {
        // API not available, load from localStorage
        console.log('⚠️ API not available, loading data from localStorage')
        loadFallbackData()
      }
    } catch (error) {
      console.log('⚠️ Failed to sync user data, continuing with local storage:', error.message)
      // Continue without MongoDB sync - app will use localStorage
      loadFallbackData()
    } finally {
      setIsLoadingData(false)
    }
  }

  const loadScanHistory = async () => {
    try {
      console.log('📚 Loading scan history from MongoDB...')
      const history = await apiService.getUserScanHistory(user.id, 50)
      
      if (history && history.length > 0) {
        // Transform MongoDB data to match existing format
        const transformedHistory = history.map(scan => ({
          id: scan._id || scan.id,
          breed: scan.predicted_breed || scan.breed,
          confidence: scan.confidence_score || scan.confidence,
          timestamp: scan.timestamp || scan.created_at,
          imageUrl: scan.image_url || scan.imageUrl,
          isCorssbreed: scan.is_crossbreed || scan.isCorssbreed,
          topPredictions: scan.top_predictions || scan.topPredictions,
          crossbreedAnalysis: scan.crossbreed_analysis || scan.crossbreedAnalysis,
          detectionMetadata: scan.detection_metadata || scan.detectionMetadata
        }))
        
        setUserHistory(transformedHistory)
        
        // Also update localStorage as backup
        localStorage.setItem(`pawdentify_history_${user.id}`, JSON.stringify(transformedHistory))
        console.log('✅ Loaded', transformedHistory.length, 'scans from MongoDB')
      } else {
        console.log('📭 No scan history found in MongoDB, checking localStorage...')
        // Fallback to localStorage
        const localHistory = JSON.parse(localStorage.getItem(`pawdentify_history_${user.id}`) || '[]')
        setUserHistory(localHistory)
        console.log('📚 Loaded', localHistory.length, 'scans from localStorage')
      }
    } catch (error) {
      console.log('⚠️ Failed to load scan history from MongoDB, using localStorage:', error.message)
      // Use localStorage history when API is not available - use user-specific key
      const localHistory = JSON.parse(localStorage.getItem(`pawdentify_history_${user.id}`) || '[]')
      setUserHistory(localHistory)
      console.log('📚 Loaded', localHistory.length, 'scans from localStorage (fallback)')
    }
  }

  const loadDashboardStats = async () => {
    try {
      const stats = await apiService.getDashboardStats(user.id)
      setDashboardStats(stats)
      
      // Update saved breeds from user favorites
      const favoriteBreeds = stats.favoriteBreeds.map((breed, index) => ({
        id: `fav-${index}`,
        breed,
        timestamp: new Date().toISOString()
      }))
      setSavedBreeds(favoriteBreeds)
    } catch (error) {
      console.log('⚠️ Failed to load dashboard stats, using defaults:', error.message)
      // Use default stats when API is not available - calculate from current userHistory
      calculateLocalDashboardStats()
    }
  }

  const calculateLocalDashboardStats = () => {
    const now = new Date()
    const thisMonth = userHistory.filter(item => {
      const itemDate = new Date(item.timestamp)
      return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear()
    }).length

    const uniqueBreeds = [...new Set(userHistory.map(scan => scan.breed))].length
    const avgConfidence = userHistory.length > 0 ? 
      userHistory.reduce((sum, scan) => sum + (scan.confidence || 0), 0) / userHistory.length : 0

    setDashboardStats({
      totalScans: userHistory.length,
      uniqueBreeds: uniqueBreeds,
      averageConfidence: avgConfidence,
      accuracyRate: avgConfidence, // Use average confidence as accuracy approximation
      thisMonth: thisMonth,
      favoriteBreeds: savedBreeds.map(saved => saved.breed) || [],
      recentScans: userHistory.slice(0, 5)
    })
  }

  const loadUserPreferences = async () => {
    try {
      const preferences = await apiService.getUserPreferences(user.id)
      
      // Apply theme from user preferences
      if (preferences && preferences.theme) {
        applyTheme(preferences.theme)
        setCurrentTheme(preferences.theme)
      }
      
      console.log('User preferences loaded:', preferences)
    } catch (error) {
      console.log('⚠️ Failed to load user preferences, using defaults:', error.message)
      // Use default preferences when API is not available
    }
  }

  const loadFallbackData = () => {
    // Load data from localStorage for fallback mode
    const history = localStorage.getItem(`pawdentify_history_${user.id}`)
    const saved = localStorage.getItem(`pawdentify_saved_${user.id}`)
    
    if (history) {
      const parsedHistory = JSON.parse(history)
      setUserHistory(parsedHistory)
      console.log('📚 Loaded scan history from localStorage:', parsedHistory.length, 'items')
    }
    if (saved) {
      const parsedSaved = JSON.parse(saved)
      setSavedBreeds(parsedSaved)
      console.log('⭐ Loaded saved breeds from localStorage:', parsedSaved.length, 'items')
    }
  }

  const addToHistory = async (result) => {
    if (!isSignedIn || !user) return
    
    const newHistoryItem = {
      id: result._id || Date.now(),
      breed: result.predicted_class || result.breed,
      confidence: result.confidence,
      timestamp: result.timestamp || new Date().toISOString(),
      imageUrl: result.imageUrl,
      isCorssbreed: result.is_potential_crossbreed,
      topPredictions: result.top_predictions,
      crossbreedAnalysis: result.crossbreed_analysis,
      detectionMetadata: result.detection_metadata
    }
    
    // Update local state immediately for responsive UI
    const newHistory = [newHistoryItem, ...userHistory].slice(0, 50)
    setUserHistory(newHistory)
    
    try {
      if (!fallbackUser && apiService.apiAvailable) {
        // Primary: Save to MongoDB
        console.log('💾 Saving scan to MongoDB...')
        const saveResult = await apiService.addScanToHistory(user.id, newHistoryItem)
        
        if (saveResult.savedToMongo) {
          console.log('✅ Scan successfully saved to MongoDB')
          // Update the ID with MongoDB-generated ID if available
          if (saveResult.data && saveResult.data._id) {
            newHistoryItem.id = saveResult.data._id
            const updatedHistory = [newHistoryItem, ...userHistory.slice(1)].slice(0, 50)
            setUserHistory(updatedHistory)
            // Also update localStorage with the MongoDB ID
            localStorage.setItem(`pawdentify_history_${user.id}`, JSON.stringify(updatedHistory))
          }
          // Refresh dashboard stats from MongoDB
          await loadDashboardStats()
        } else {
          // MongoDB save failed, use localStorage as backup
          console.log('⚠️ MongoDB save failed, using localStorage backup')
          localStorage.setItem(`pawdentify_history_${user.id}`, JSON.stringify(newHistory))
          setTimeout(() => calculateLocalDashboardStats(), 100)
        }
      } else {
        // Fallback: Save to localStorage only
        console.log('💾 API not available, saving to localStorage only')
        localStorage.setItem(`pawdentify_history_${user.id}`, JSON.stringify(newHistory))
        setTimeout(() => calculateLocalDashboardStats(), 100)
      }
    } catch (error) {
      console.error('❌ Error saving scan history:', error)
      // Always save to localStorage as backup
      localStorage.setItem(`pawdentify_history_${user.id}`, JSON.stringify(newHistory))
      setTimeout(() => calculateLocalDashboardStats(), 100)
    }
  }

  const saveBreed = async (breed) => {
    if (!isSignedIn || !user) return
    
    try {
      if (!fallbackUser && apiService.apiAvailable) {
        // Primary: Save to MongoDB
        console.log('💾 Saving favorite breed to MongoDB:', breed)
        await apiService.addFavoriteBreed(user.id, breed)
        await loadDashboardStats() // Refresh to get updated favorites from MongoDB
        console.log('✅ Favorite breed saved to MongoDB')
      } else {
        // Fallback: Save to localStorage
        console.log('💾 API not available, saving favorite breed to localStorage:', breed)
        const newSaved = [...savedBreeds, {
          id: Date.now(),
          breed,
          timestamp: new Date().toISOString()
        }]
        
        setSavedBreeds(newSaved)
        localStorage.setItem(`pawdentify_saved_${user.id}`, JSON.stringify(newSaved))
        console.log('✅ Favorite breed saved to localStorage')
      }
    } catch (error) {
      console.error('❌ Error saving favorite breed, using localStorage fallback:', error)
      // Always fallback to localStorage if MongoDB fails
      const newSaved = [...savedBreeds, {
        id: Date.now(),
        breed,
        timestamp: new Date().toISOString()
      }]
      
      setSavedBreeds(newSaved)
      localStorage.setItem(`pawdentify_saved_${user.id}`, JSON.stringify(newSaved))
    }
  }

  const removeSavedBreed = async (breedName) => {
    try {
      if (!fallbackUser) {
        // Remove from MongoDB
        await apiService.removeFavoriteBreed(user.id, breedName)
        await loadDashboardStats() // Refresh to get updated favorites
      } else {
        // Fallback to localStorage
        const filtered = savedBreeds.filter(item => item.breed !== breedName)
        setSavedBreeds(filtered)
        localStorage.setItem(`pawdentify_saved_${user.id}`, JSON.stringify(filtered))
      }
    } catch (error) {
      console.error('Failed to remove saved breed:', error)
    }
  }

  // Function to refresh all user data from MongoDB
  const refreshUserDataFromMongoDB = async () => {
    if (!user || fallbackUser || !apiService.apiAvailable) {
      console.log('⚠️ Cannot refresh from MongoDB: user not available or API offline')
      return false
    }

    try {
      console.log('🔄 Refreshing all user data from MongoDB...')
      setIsLoadingData(true)
      
      await Promise.all([
        loadScanHistory(),
        loadDashboardStats(),
        loadUserPreferences()
      ])
      
      console.log('✅ All user data refreshed from MongoDB')
      return true
    } catch (error) {
      console.error('❌ Failed to refresh user data from MongoDB:', error)
      return false
    } finally {
      setIsLoadingData(false)
    }
  }

  const value = {
    isSignedIn,
    isLoaded,
    user,
    userHistory,
    savedBreeds,
    dashboardStats,
    isLoadingData,
    currentTheme,
    applyTheme,
    addToHistory,
    saveBreed,
    removeSavedBreed,
    // API methods
    apiService,
    refreshData: syncUserData,
    refreshUserDataFromMongoDB,
    // Fallback auth methods
    signIn: fallbackSignIn,
    signOut: fallbackSignOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}