import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, 
  Sliders, 
  Save, 
  RotateCcw,
  Info,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

export default function CrossbreedSettings({ 
  onSettingsChange, 
  initialSettings = {},
  isOpen = false,
  onClose 
}) {
  const [settings, setSettings] = useState({
    confidence_threshold: 0.70,
    secondary_threshold: 0.15,
    confidence_gap: 0.30,
    enable_crossbreed_detection: true,
    ...initialSettings
  })
  
  const [hasChanges, setHasChanges] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null)

  useEffect(() => {
    const changed = Object.keys(settings).some(key => 
      settings[key] !== (initialSettings[key] ?? getDefaultValue(key))
    )
    setHasChanges(changed)
  }, [settings, initialSettings])

  const getDefaultValue = (key) => {
    const defaults = {
      confidence_threshold: 0.70,
      secondary_threshold: 0.15,
      confidence_gap: 0.30,
      enable_crossbreed_detection: true
    }
    return defaults[key]
  }

  const handleSliderChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const resetToDefaults = () => {
    setSettings({
      confidence_threshold: 0.70,
      secondary_threshold: 0.15,
      confidence_gap: 0.30,
      enable_crossbreed_detection: true
    })
  }

  const saveSettings = async () => {
    setSaveStatus('saving')
    try {
      if (onSettingsChange) {
        await onSettingsChange(settings)
      }
      setSaveStatus('success')
      setTimeout(() => setSaveStatus(null), 2000)
    } catch (error) {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus(null), 3000)
    }
  }

  const getThresholdColor = (value) => {
    if (value >= 0.8) return 'text-green-600'
    if (value >= 0.6) return 'text-yellow-600'
    return 'text-orange-600'
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <Settings className="h-6 w-6 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">
              Crossbreed Detection Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <h3 className="font-semibold text-gray-900">Enable Crossbreed Detection</h3>
              <p className="text-sm text-gray-600">Automatically detect mixed breed dogs</p>
            </div>
            <button
              onClick={() => handleToggle('enable_crossbreed_detection')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.enable_crossbreed_detection ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.enable_crossbreed_detection ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {settings.enable_crossbreed_detection && (
            <div className="space-y-6">
              {/* Confidence Threshold */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Primary Confidence Threshold
                  </label>
                  <span className={`text-sm font-bold ${getThresholdColor(settings.confidence_threshold)}`}>
                    {Math.round(settings.confidence_threshold * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="0.9"
                  step="0.01"
                  value={settings.confidence_threshold}
                  onChange={(e) => handleSliderChange('confidence_threshold', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Below this confidence, the system will check for crossbreeds
                </p>
              </div>

              {/* Secondary Threshold */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Secondary Breed Threshold
                  </label>
                  <span className="text-sm font-bold text-gray-600">
                    {Math.round(settings.secondary_threshold * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.30"
                  step="0.01"
                  value={settings.secondary_threshold}
                  onChange={(e) => handleSliderChange('secondary_threshold', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum confidence for considering a secondary breed
                </p>
              </div>

              {/* Confidence Gap */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Max Confidence Gap
                  </label>
                  <span className="text-sm font-bold text-gray-600">
                    {Math.round(settings.confidence_gap * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.50"
                  step="0.01"
                  value={settings.confidence_gap}
                  onChange={(e) => handleSliderChange('confidence_gap', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum gap between top two breeds to suggest crossbreed
                </p>
              </div>

              {/* Example Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Info className="h-4 w-4 mr-1" />
                  Current Settings Preview
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Crossbreed if primary confidence ≤</span>
                    <span className="font-semibold">{Math.round(settings.confidence_threshold * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Or if secondary breed ≥</span>
                    <span className="font-semibold">{Math.round(settings.secondary_threshold * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>And confidence gap ≤</span>
                    <span className="font-semibold">{Math.round(settings.confidence_gap * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Status */}
          {saveStatus && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-center p-3 rounded-lg ${
                saveStatus === 'success' ? 'bg-green-100 text-green-700' :
                saveStatus === 'error' ? 'bg-red-100 text-red-700' :
                'bg-blue-100 text-blue-700'
              }`}
            >
              {saveStatus === 'success' && <CheckCircle className="h-4 w-4 mr-2" />}
              {saveStatus === 'error' && <AlertTriangle className="h-4 w-4 mr-2" />}
              {saveStatus === 'saving' && <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-blue-700 border-t-transparent" />}
              <span className="text-sm font-medium">
                {saveStatus === 'success' && 'Settings saved successfully!'}
                {saveStatus === 'error' && 'Failed to save settings. Please try again.'}
                {saveStatus === 'saving' && 'Saving settings...'}
              </span>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={resetToDefaults}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveSettings}
              disabled={!hasChanges || saveStatus === 'saving'}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                hasChanges && saveStatus !== 'saving'
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// CSS for custom slider styling (add to your global CSS)
const sliderStyles = `
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3B82F6;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.slider::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3B82F6;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
`