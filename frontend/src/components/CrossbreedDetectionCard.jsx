import React from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Eye, 
  Zap, 
  Info,
  ChevronRight,
  Users,
  Sparkles
} from 'lucide-react'

/**
 * CrossbreedDetectionCard Component
 * Displays crossbreed detection results with confidence-based UI
 */
const CrossbreedDetectionCard = ({ 
  predictionResult,
  onAnalyzeClick,
  className = ''
}) => {
  if (!predictionResult) return null;

  const { 
    predicted_class,
    confidence,
    is_potential_crossbreed,
    crossbreed_analysis,
    top_predictions 
  } = predictionResult;

  // Format breed name for display
  const formatBreedName = (breedName) => {
    if (!breedName) return 'Unknown Breed';
    return breedName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Get confidence level and styling
  const getConfidenceLevel = () => {
    if (confidence > 0.8) return { level: 'High', color: 'green', bgColor: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-200' };
    if (confidence > 0.5) return { level: 'Medium', color: 'yellow', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', borderColor: 'border-yellow-200' };
    return { level: 'Low', color: 'red', bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200' };
  };

  const confidenceInfo = getConfidenceLevel();

  // High confidence - single breed display
  if (!is_potential_crossbreed && confidence > 0.8) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-2xl shadow-lg border border-green-200 p-6 ${className}`}
      >
        <div className="text-center">
          <div className="mb-4">
            <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-3">
              <Sparkles className="h-4 w-4 mr-1" />
              High Confidence Match
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {formatBreedName(predicted_class)}
          </h3>
          
          <div className="mb-4">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {Math.round(confidence * 100)}%
            </div>
            <div className="text-sm text-gray-600">Confidence Level</div>
          </div>

          <div className="bg-green-100 rounded-full h-2 mb-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confidence * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="bg-green-500 h-2 rounded-full"
            />
          </div>

          <p className="text-gray-600 text-sm">
            Strong breed identification with high confidence. This appears to be a purebred {formatBreedName(predicted_class)}.
          </p>
        </div>
      </motion.div>
    );
  }

  // Medium/Low confidence - crossbreed analysis available
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl shadow-lg border ${confidenceInfo.borderColor} p-6 ${className}`}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="mb-4">
          <div className={`inline-flex items-center px-3 py-1 ${confidenceInfo.bgColor} ${confidenceInfo.textColor} rounded-full text-sm font-medium mb-3`}>
            {is_potential_crossbreed ? (
              <>
                <Users className="h-4 w-4 mr-1" />
                Mixed Heritage Detected
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-1" />
                {confidenceInfo.level} Confidence
              </>
            )}
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {is_potential_crossbreed ? (
            crossbreed_analysis ? 
              crossbreed_analysis.suggested_mix : 
              `${formatBreedName(predicted_class)} Mix`
          ) : (
            formatBreedName(predicted_class)
          )}
        </h3>

        <div className="mb-4">
          <div className={`text-2xl font-bold ${confidenceInfo.textColor} mb-1`}>
            {Math.round(confidence * 100)}%
          </div>
          <div className="text-sm text-gray-600">Primary Match Confidence</div>
        </div>

        <div className={`${confidenceInfo.bgColor} rounded-full h-2 mb-4`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${confidence * 100}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`bg-${confidenceInfo.color}-500 h-2 rounded-full`}
          />
        </div>
      </div>

      {/* Crossbreed Information */}
      {is_potential_crossbreed && crossbreed_analysis && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Zap className="h-4 w-4 mr-2 text-purple-600" />
            Potential Parent Breeds
          </h4>
          
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="text-center">
              <div className="bg-blue-100 rounded-lg p-2 mb-1">
                <span className="text-xs text-blue-600 font-medium">Primary</span>
              </div>
              <div className="text-sm font-medium">{formatBreedName(crossbreed_analysis.primary_breed)}</div>
              <div className="text-xs text-gray-600">{Math.round(crossbreed_analysis.primary_confidence * 100)}%</div>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-lg p-2 mb-1">
                <span className="text-xs text-green-600 font-medium">Secondary</span>
              </div>
              <div className="text-sm font-medium">{formatBreedName(crossbreed_analysis.secondary_breed)}</div>
              <div className="text-xs text-gray-600">{Math.round(crossbreed_analysis.secondary_confidence * 100)}%</div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-sm text-purple-600 font-medium mb-1">
              Crossbreed Likelihood: {Math.round(crossbreed_analysis.crossbreed_likelihood * 100)}%
            </div>
            <div className="bg-purple-200 rounded-full h-1">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${crossbreed_analysis.crossbreed_likelihood * 100}%` }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                className="bg-purple-500 h-1 rounded-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Top Predictions Preview */}
      {top_predictions && top_predictions.length > 1 && (
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h4 className="font-semibold text-gray-900 mb-3 text-sm">
            Other Possible Breeds:
          </h4>
          <div className="space-y-2">
            {top_predictions.slice(1, 4).map((prediction, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-700">{formatBreedName(prediction.breed)}</span>
                <span className="text-sm font-medium text-gray-600">
                  {Math.round(prediction.confidence * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="text-center">
        {is_potential_crossbreed ? (
          <button
            onClick={() => onAnalyzeClick && onAnalyzeClick(crossbreed_analysis)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center mx-auto"
          >
            <Users className="h-5 w-5 mr-2" />
            Analyze Crossbreed
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        ) : (
          <button
            onClick={() => onAnalyzeClick && onAnalyzeClick({ 
              primary_breed: predicted_class,
              primary_confidence: confidence,
              secondary_breed: top_predictions[1]?.breed || predicted_class,
              secondary_confidence: top_predictions[1]?.confidence || 0,
              suggested_mix: `Possible ${formatBreedName(predicted_class)} Mix`,
              crossbreed_likelihood: 0.6
            })}
            className={`bg-gradient-to-r from-${confidenceInfo.color}-500 to-${confidenceInfo.color}-600 text-white px-6 py-3 rounded-xl font-medium hover:from-${confidenceInfo.color}-600 hover:to-${confidenceInfo.color}-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center mx-auto`}
          >
            <TrendingUp className="h-5 w-5 mr-2" />
            Explore Breed Analysis
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        )}
      </div>

      {/* Confidence Explanation */}
      <div className="mt-4 text-center">
        <div className={`inline-flex items-center px-3 py-1 ${confidenceInfo.bgColor} rounded-full`}>
          <Info className="h-3 w-3 mr-1" />
          <span className="text-xs">
            {is_potential_crossbreed ? 
              "Multiple breed characteristics detected" :
              `${confidenceInfo.level} confidence suggests potential mixed heritage`
            }
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default CrossbreedDetectionCard;