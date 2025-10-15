import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, 
  Bell, 
  Crown, 
  Shield, 
  Star,
  Check,
  X,
  Save,
  Palette,
  Globe,
  Lock,
  Smartphone,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useAuthContext } from '../auth/AuthContext'
import apiService from '../services/api'

export default function UserPreferences() {
  const { user, applyTheme, currentTheme } = useAuthContext()
  const [preferences, setPreferences] = useState({
    notifications: {
      email_notifications: true,
      scan_reminders: false,
      breed_updates: true,
      newsletter: false
    },
    privacy: {
      save_scan_history: true,
      save_search_history: true,
      allow_analytics: true,
      public_profile: false
    },
    theme: 'light',
    preferred_language: 'en',
    measurement_units: 'imperial'
  })

  const [activeTab, setActiveTab] = useState('notifications')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState(null)

  // Load user preferences on component mount
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user?.id) return
      
      try {
        setLoading(true)
        const userPrefs = await apiService.getUserPreferences(user.id)
        
        if (userPrefs) {
          const loadedPreferences = {
            notifications: userPrefs.notifications || preferences.notifications,
            privacy: userPrefs.privacy || preferences.privacy,
            theme: userPrefs.theme || currentTheme || 'light',
            preferred_language: userPrefs.preferred_language || 'en',
            measurement_units: userPrefs.measurement_units || 'imperial'
          }
          setPreferences(loadedPreferences)
          
          // Apply theme when preferences are loaded
          if (applyTheme && loadedPreferences.theme) {
            applyTheme(loadedPreferences.theme)
          }
        } else {
          // Set theme from AuthContext if no preferences exist
          setPreferences(prev => ({
            ...prev,
            theme: currentTheme || 'light'
          }))
        }
      } catch (error) {
        console.error('Failed to load preferences:', error)
        showNotification('Failed to load preferences', 'error')
      } finally {
        setLoading(false)
      }
    }

    loadPreferences()
  }, [user?.id])

  const showNotification = (message, type) => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const handlePreferenceChange = (category, key, value) => {
    if (category === 'theme' || category === 'preferred_language' || category === 'measurement_units') {
      setPreferences(prev => ({
        ...prev,
        [category]: value
      }))
      
      // Apply theme immediately when it changes
      if (category === 'theme' && applyTheme) {
        applyTheme(value)
      }
    } else {
      setPreferences(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [key]: value
        }
      }))
    }
  }

  const savePreferences = async () => {
    if (!user?.id) return
    
    try {
      setSaving(true)
      await apiService.updateUserPreferences(user.id, preferences)
      
      // Apply theme changes immediately through AuthContext
      if (applyTheme) {
        applyTheme(preferences.theme)
      }
      
      showNotification('Preferences saved successfully!', 'success')
    } catch (error) {
      console.error('Failed to save preferences:', error)
      showNotification('Failed to save preferences. Please try again.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'premium', label: 'Premium', icon: Crown }
  ]

  const premiumFeatures = [
    { name: 'Unlimited Scans', description: 'No limits on daily scans' },
    { name: 'Advanced Analytics', description: 'Detailed insights and trends' },
    { name: 'Priority Support', description: '24/7 premium customer support' },
    { name: 'Breed Comparison', description: 'Compare multiple breeds side-by-side' },
    { name: 'Export Features', description: 'Download results in various formats' },
    { name: 'Early Access', description: 'Beta features and new updates first' }
  ]

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-gray-600">Loading your preferences...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Notification */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`mb-4 p-4 rounded-lg flex items-center space-x-2 ${
            notification.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{notification.message}</span>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-6 text-white">
          <div className="flex items-center space-x-3">
            <Settings className="h-6 w-6" />
            <h2 className="text-2xl font-bold">User Preferences</h2>
          </div>
          <p className="text-primary-100 mt-1">Customize your Pawdentify experience</p>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200">
            <nav className="p-4 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-semibold text-gray-900">Notification Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Bell className="h-5 w-5 text-gray-600" />
                      <div>
                        <div className="font-medium text-gray-900">Email Notifications</div>
                        <div className="text-sm text-gray-600">Get updates about your scans via email</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.notifications.email_notifications}
                        onChange={(e) => handlePreferenceChange('notifications', 'email_notifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="h-5 w-5 text-gray-600" />
                      <div>
                        <div className="font-medium text-gray-900">Scan Reminders</div>
                        <div className="text-sm text-gray-600">Get reminders to scan your pets regularly</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.notifications.scan_reminders}
                        onChange={(e) => handlePreferenceChange('notifications', 'scan_reminders', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Star className="h-5 w-5 text-gray-600" />
                      <div>
                        <div className="font-medium text-gray-900">Breed Updates</div>
                        <div className="text-sm text-gray-600">Learn about new breed information and features</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.notifications.breed_updates}
                        onChange={(e) => handlePreferenceChange('notifications', 'breed_updates', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Bell className="h-5 w-5 text-gray-600" />
                      <div>
                        <div className="font-medium text-gray-900">Newsletter</div>
                        <div className="text-sm text-gray-600">Receive our monthly newsletter with tips and updates</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.notifications.newsletter}
                        onChange={(e) => handlePreferenceChange('notifications', 'newsletter', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'privacy' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-semibold text-gray-900">Privacy Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Globe className="h-5 w-5 text-gray-600" />
                      <div>
                        <div className="font-medium text-gray-900">Public Profile</div>
                        <div className="text-sm text-gray-600">Make your profile visible to other users</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.privacy.public_profile}
                        onChange={(e) => handlePreferenceChange('privacy', 'public_profile', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Lock className="h-5 w-5 text-gray-600" />
                      <div>
                        <div className="font-medium text-gray-900">Save Scan History</div>
                        <div className="text-sm text-gray-600">Store your scan results for future reference</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.privacy.save_scan_history}
                        onChange={(e) => handlePreferenceChange('privacy', 'save_scan_history', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Lock className="h-5 w-5 text-gray-600" />
                      <div>
                        <div className="font-medium text-gray-900">Save Search History</div>
                        <div className="text-sm text-gray-600">Keep track of your breed searches and recommendations</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.privacy.save_search_history}
                        onChange={(e) => handlePreferenceChange('privacy', 'save_search_history', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Lock className="h-5 w-5 text-gray-600" />
                      <div>
                        <div className="font-medium text-gray-900">Analytics</div>
                        <div className="text-sm text-gray-600">Help improve our service with usage analytics</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.privacy.allow_analytics}
                        onChange={(e) => handlePreferenceChange('privacy', 'allow_analytics', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'appearance' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-semibold text-gray-900">Appearance Settings</h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                    <select
                      value={preferences.theme}
                      onChange={(e) => handlePreferenceChange('theme', null, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto (System)</option>
                    </select>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                    <select
                      value={preferences.preferred_language}
                      onChange={(e) => handlePreferenceChange('preferred_language', null, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Measurement Units</label>
                    <select
                      value={preferences.measurement_units}
                      onChange={(e) => handlePreferenceChange('measurement_units', null, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="imperial">Imperial (lb, in)</option>
                      <option value="metric">Metric (kg, cm)</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'premium' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-semibold text-gray-900">Premium Features</h3>
                
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Crown className="h-8 w-8 text-yellow-600" />
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Pawdentify Premium</h4>
                      <p className="text-sm text-gray-600">Unlock advanced features and unlimited scanning</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    {premiumFeatures.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <Check className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-900">{feature.name}</div>
                          <div className="text-sm text-gray-600">{feature.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-gray-900">
                      $9.99 <span className="text-sm font-normal text-gray-600">/ month</span>
                    </div>
                    <button className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow">
                      Upgrade to Premium
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={savePreferences}
                disabled={saving}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    Save Preferences
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}