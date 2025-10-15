import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  TrendingUp, 
  BarChart3,
  Info,
  ThumbsUp,
  ThumbsDown,
  HelpCircle
} from 'lucide-react'

export default function CrossbreedAnalysis({ 
  crossbreedData, 
  topPredictions, 
  onUserFeedback 
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [userFeedback, setUserFeedback] = useState(null)

  if (!crossbreedData) return null

  const {
    primary_breed,
    primary_confidence,
    secondary_breed,
    secondary_confidence,
    confidence_gap,
    crossbreed_likelihood,
    suggested_mix
  } = crossbreedData

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100'
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100'
    return 'text-orange-600 bg-orange-100'
  }

  const getLikelihoodColor = (likelihood) => {
    if (likelihood >= 0.7) return 'text-red-600 bg-red-100'
    if (likelihood >= 0.4) return 'text-orange-600 bg-orange-100'
    return 'text-yellow-600 bg-yellow-100'
  }

  const handleFeedback = (feedback) => {
    setUserFeedback(feedback)
    if (onUserFeedback) {
      onUserFeedback(feedback)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-6 shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <AlertTriangle className="h-6 w-6 text-orange-600 mr-2" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Crossbreed Detection
            </h3>
            <p className="text-sm text-gray-600">
              Mixed breed characteristics detected
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-white/50 rounded-lg transition-colors"
        >
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-600" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Quick Summary */}
      <div className="bg-white/70 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-700">Likely Mix:</h4>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLikelihoodColor(crossbreed_likelihood)}`}>
            {Math.round(crossbreed_likelihood * 100)}% Mixed
          </span>
        </div>
        <p className="text-lg font-semibold text-gray-900 mb-2">
          {suggested_mix}
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Primary</p>
            <p className="font-semibold text-gray-900">{primary_breed}</p>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(primary_confidence)}`}>
              {(primary_confidence * 100).toFixed(1)}%
            </span>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Secondary</p>
            <p className="font-semibold text-gray-900">{secondary_breed}</p>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(secondary_confidence)}`}>
              {(secondary_confidence * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Analysis */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            {/* Confidence Analysis */}
            <div className="bg-white/70 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <BarChart3 className="h-4 w-4 mr-1" />
                Confidence Analysis
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Confidence Gap</span>
                    <span>{(confidence_gap * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full" 
                      style={{ width: `${Math.min(confidence_gap * 200, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Lower gap indicates higher likelihood of mixed breed
                  </p>
                </div>
              </div>
            </div>

            {/* Top Predictions Breakdown */}
            <div className="bg-white/70 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                All Detected Breeds
              </h4>
              <div className="space-y-2">
                {topPredictions.slice(0, 5).map((pred, index) => (
                  <div key={index} className="flex items-center justify-between py-2 px-3 bg-white/50 rounded">
                    <div className="flex items-center">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${
                        index === 0 ? 'bg-blue-500 text-white' : 
                        index === 1 ? 'bg-orange-500 text-white' : 
                        'bg-gray-300 text-gray-600'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium">{pred.breed || pred.breed_name}</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {(pred.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* User Feedback */}
            <div className="bg-white/70 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <HelpCircle className="h-4 w-4 mr-1" />
                Help Us Improve
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Is this crossbreed analysis accurate?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleFeedback('correct')}
                  disabled={userFeedback !== null}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    userFeedback === 'correct' 
                      ? 'bg-green-500 text-white' 
                      : userFeedback !== null 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  Correct
                </button>
                <button
                  onClick={() => handleFeedback('incorrect')}
                  disabled={userFeedback !== null}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    userFeedback === 'incorrect' 
                      ? 'bg-red-500 text-white' 
                      : userFeedback !== null 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  <ThumbsDown className="h-4 w-4 mr-1" />
                  Incorrect
                </button>
                <button
                  onClick={() => handleFeedback('partially_correct')}
                  disabled={userFeedback !== null}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    userFeedback === 'partially_correct' 
                      ? 'bg-yellow-500 text-white' 
                      : userFeedback !== null 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  }`}
                >
                  <Info className="h-4 w-4 mr-1" />
                  Partially
                </button>
              </div>
              {userFeedback && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-gray-600 mt-2"
                >
                  Thank you for your feedback! This helps improve our AI model.
                </motion.p>
              )}
            </div>

            {/* Educational Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">
                💡 About Mixed Breeds
              </h4>
              <p className="text-sm text-blue-700">
                Mixed breed dogs often exhibit characteristics from both parent breeds. 
                Our AI analyzes visual features to identify the most likely breed combinations. 
                For the most accurate identification, consider genetic testing.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}