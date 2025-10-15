import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  TrendingUp, 
  Heart, 
  Activity, 
  Scissors,
  Brain,
  Info,
  ChevronRight,
  Zap,
  Scale,
  Eye,
  Users
} from 'lucide-react'
import simpleBreedImageService from '../services/simpleBreedImageService'

/**
 * CrossbreedAnalysisModal Component
 * Comprehensive analysis modal for potential crossbreed detection
 */
const CrossbreedAnalysisModal = ({ 
  isOpen, 
  onClose, 
  crossbreedData,
  predictionData 
}) => {
  const [breedImages, setBreedImages] = useState({})
  const [activeTab, setActiveTab] = useState('overview')
  const [traitComparison, setTraitComparison] = useState(null)

  // Load images for parent breeds
  useEffect(() => {
    const loadBreedImages = async () => {
      if (!crossbreedData || !isOpen) return;

      try {
        const { primary_breed, secondary_breed } = crossbreedData;
        
        // Load images for both potential parent breeds
        const [primaryImages, secondaryImages] = await Promise.all([
          simpleBreedImageService.getBreedImage(primary_breed),
          simpleBreedImageService.getBreedImage(secondary_breed)
        ]);

        setBreedImages({
          primary: primaryImages,
          secondary: secondaryImages
        });
      } catch (error) {
        console.error('Error loading crossbreed images:', error);
      }
    };

    loadBreedImages();
  }, [crossbreedData, isOpen]);

  // Generate trait comparison data
  useEffect(() => {
    if (!crossbreedData) return;

    // Mock trait data - in production, this would come from a comprehensive breed database
    const generateTraitComparison = () => {
      const traits = {
        size: {
          primary: getBreedSize(crossbreedData.primary_breed),
          secondary: getBreedSize(crossbreedData.secondary_breed),
          predicted: 'Medium', // Would be calculated based on parent breeds
          icon: Scale
        },
        energy: {
          primary: getBreedEnergy(crossbreedData.primary_breed),
          secondary: getBreedEnergy(crossbreedData.secondary_breed),
          predicted: 'Moderate to High',
          icon: Zap
        },
        trainability: {
          primary: getBreedTrainability(crossbreedData.primary_breed),
          secondary: getBreedTrainability(crossbreedData.secondary_breed),
          predicted: 'Good',
          icon: Brain
        },
        social: {
          primary: getBreedSociability(crossbreedData.primary_breed),
          secondary: getBreedSociability(crossbreedData.secondary_breed),
          predicted: 'Family Friendly',
          icon: Users
        }
      };

      setTraitComparison(traits);
    };

    generateTraitComparison();
  }, [crossbreedData]);

  // Helper functions for breed characteristics (simplified)
  const getBreedSize = (breed) => {
    const sizeMap = {
      'Labrador_retriever': 'Large',
      'golden_retriever': 'Large', 
      'beagle': 'Medium',
      'chihuahua': 'Small',
      'German_shepherd': 'Large',
      'Yorkshire_terrier': 'Small',
      'Border_collie': 'Medium',
      'bulldog': 'Medium'
    };
    return sizeMap[breed] || 'Medium';
  };

  const getBreedEnergy = (breed) => {
    const energyMap = {
      'Border_collie': 'Very High',
      'Labrador_retriever': 'High',
      'beagle': 'Moderate',
      'bulldog': 'Low',
      'chihuahua': 'Moderate'
    };
    return energyMap[breed] || 'Moderate';
  };

  const getBreedTrainability = (breed) => {
    const trainabilityMap = {
      'Border_collie': 'Excellent',
      'German_shepherd': 'Excellent',
      'Labrador_retriever': 'Very Good',
      'golden_retriever': 'Very Good',
      'beagle': 'Good',
      'bulldog': 'Moderate'
    };
    return trainabilityMap[breed] || 'Good';
  };

  const getBreedSociability = (breed) => {
    const socialMap = {
      'golden_retriever': 'Excellent with all',
      'Labrador_retriever': 'Excellent with all',
      'beagle': 'Good with children',
      'German_shepherd': 'Protective, loyal',
      'chihuahua': 'Selective bonding'
    };
    return socialMap[breed] || 'Generally friendly';
  };

  // Format breed name for display
  const formatBreedName = (breedName) => {
    return breedName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (!isOpen || !crossbreedData) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold mb-2">🐕‍🦺 Crossbreed Analysis</h2>
                <p className="text-purple-100">
                  Mixed heritage detected - exploring parent breed combinations
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Confidence Indicator */}
            <div className="mt-4 bg-white/20 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Crossbreed Likelihood</span>
                <span className="text-sm font-bold">
                  {Math.round(crossbreedData.crossbreed_likelihood * 100)}%
                </span>
              </div>
              <div className="bg-white/30 rounded-full h-2">
                <div 
                  className="bg-yellow-300 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${crossbreedData.crossbreed_likelihood * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: Eye },
                { id: 'traits', label: 'Traits', icon: TrendingUp },
                { id: 'care', label: 'Care Guide', icon: Heart }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4 inline mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Parent Breeds Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-purple-600" />
                    Potential Parent Breeds
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Primary Breed */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                      <div className="text-center">
                        <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-gray-200">
                          {breedImages.primary ? (
                            <img 
                              src={breedImages.primary} 
                              alt={formatBreedName(crossbreedData.primary_breed)}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                              <Activity className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                        <h4 className="font-bold text-lg text-gray-900 mb-2">
                          {formatBreedName(crossbreedData.primary_breed)}
                        </h4>
                        <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Primary • {Math.round(crossbreedData.primary_confidence * 100)}%
                        </div>
                      </div>
                    </div>

                    {/* Secondary Breed */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                      <div className="text-center">
                        <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-gray-200">
                          {breedImages.secondary ? (
                            <img 
                              src={breedImages.secondary} 
                              alt={formatBreedName(crossbreedData.secondary_breed)}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                              <Activity className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                        <h4 className="font-bold text-lg text-gray-900 mb-2">
                          {formatBreedName(crossbreedData.secondary_breed)}
                        </h4>
                        <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Secondary • {Math.round(crossbreedData.secondary_confidence * 100)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mix Information */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                  <h4 className="font-bold text-lg mb-3 text-gray-900">
                    🧬 Suggested Mix Name
                  </h4>
                  <p className="text-2xl font-bold text-purple-700 mb-2">
                    {crossbreedData.suggested_mix}
                  </p>
                  <p className="text-gray-600">
                    This is a likely combination based on the AI's confidence analysis. 
                    Crossbreed characteristics can vary significantly between individual dogs.
                  </p>
                </div>

                {/* Confidence Analysis */}
                <div className="bg-yellow-50 rounded-xl p-6">
                  <h4 className="font-bold text-lg mb-3 text-gray-900 flex items-center">
                    <Info className="h-5 w-5 mr-2 text-yellow-600" />
                    Analysis Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Confidence Gap</span>
                      <div className="text-lg font-semibold">
                        {Math.round(crossbreedData.confidence_gap * 100)}%
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Detection Method</span>
                      <div className="text-lg font-semibold">AI Pattern Analysis</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    Low confidence gaps and moderate individual confidences suggest mixed heritage.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'traits' && traitComparison && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">
                  🧬 Trait Inheritance Analysis
                </h3>

                {Object.entries(traitComparison).map(([traitKey, trait]) => {
                  const Icon = trait.icon;
                  return (
                    <div key={traitKey} className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center mb-4">
                        <Icon className="h-6 w-6 mr-3 text-purple-600" />
                        <h4 className="font-semibold text-lg capitalize">{traitKey}</h4>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="bg-blue-100 rounded-lg p-3 mb-2">
                            <span className="text-sm text-blue-600 font-medium">
                              {formatBreedName(crossbreedData.primary_breed)}
                            </span>
                          </div>
                          <div className="font-semibold">{trait.primary}</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="bg-green-100 rounded-lg p-3 mb-2">
                            <span className="text-sm text-green-600 font-medium">
                              {formatBreedName(crossbreedData.secondary_breed)}
                            </span>
                          </div>
                          <div className="font-semibold">{trait.secondary}</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="bg-purple-100 rounded-lg p-3 mb-2">
                            <span className="text-sm text-purple-600 font-medium">Predicted Mix</span>
                          </div>
                          <div className="font-semibold text-purple-700">{trait.predicted}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                    <Info className="h-5 w-5 mr-2" />
                    Important Note
                  </h4>
                  <p className="text-blue-800 text-sm">
                    Crossbreed traits can be highly variable. Individual dogs may inherit different 
                    combinations of characteristics from their parent breeds. These predictions are 
                    based on general breed tendencies and should be used as a guideline only.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'care' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">
                  🏥 Mixed Breed Care Guide
                </h3>

                <div className="grid gap-6">
                  {/* Exercise Needs */}
                  <div className="bg-green-50 rounded-xl p-6">
                    <h4 className="font-semibold text-lg mb-3 flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-green-600" />
                      Exercise Requirements
                    </h4>
                    <p className="text-gray-700 mb-3">
                      Based on the parent breeds, this mix likely needs <strong>moderate to high</strong> daily exercise.
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      <li>45-90 minutes of daily activity</li>
                      <li>Mental stimulation through puzzle toys</li>
                      <li>Regular walks and playtime</li>
                      <li>Monitor individual energy levels as they may vary</li>
                    </ul>
                  </div>

                  {/* Grooming */}
                  <div className="bg-purple-50 rounded-xl p-6">
                    <h4 className="font-semibold text-lg mb-3 flex items-center">
                      <Scissors className="h-5 w-5 mr-2 text-purple-600" />
                      Grooming Needs
                    </h4>
                    <p className="text-gray-700 mb-3">
                      Grooming requirements will depend on which parent's coat type is inherited.
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      <li>Regular brushing 2-3 times per week minimum</li>
                      <li>Professional grooming every 6-8 weeks</li>
                      <li>Monitor coat development as puppy matures</li>
                      <li>Adjust routine based on actual coat type</li>
                    </ul>
                  </div>

                  {/* Health Considerations */}
                  <div className="bg-red-50 rounded-xl p-6">
                    <h4 className="font-semibold text-lg mb-3 flex items-center">
                      <Heart className="h-5 w-5 mr-2 text-red-600" />
                      Health Monitoring
                    </h4>
                    <p className="text-gray-700 mb-3">
                      Mixed breeds often have hybrid vigor but may inherit conditions from either parent breed.
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      <li>Regular veterinary checkups</li>
                      <li>Monitor for conditions common to both parent breeds</li>
                      <li>Maintain healthy weight and diet</li>
                      <li>Early socialization and training</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Crossbreed analysis powered by AI pattern recognition
              </p>
              <button
                onClick={onClose}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Close Analysis
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CrossbreedAnalysisModal;