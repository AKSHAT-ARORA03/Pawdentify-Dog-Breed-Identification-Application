import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Heart, 
  Star, 
  Activity, 
  Shield, 
  Users, 
  Home, 
  Zap,
  ChevronDown,
  ChevronUp,
  Award,
  Clock,
  Weight,
  Ruler,
  Brain
} from 'lucide-react'

export default function AdvancedBreedInfo({ breed, details, confidence }) {
  const [expandedSection, setExpandedSection] = useState(null)

  if (!details) return null

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const getConfidenceColor = (conf) => {
    if (conf >= 0.9) return 'text-green-600 bg-green-100'
    if (conf >= 0.7) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const sections = [
    {
      id: 'overview',
      title: 'Overview',
      icon: Star,
      content: (
        <div className="grid md:grid-cols-2 gap-4">
          {details.size && (
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <Ruler className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium text-gray-900">Size</div>
                <div className="text-sm text-gray-600">{details.size}</div>
              </div>
            </div>
          )}
          {details.weight_range && (
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <Weight className="h-5 w-5 text-purple-600" />
              <div>
                <div className="font-medium text-gray-900">Weight</div>
                <div className="text-sm text-gray-600">{details.weight_range}</div>
              </div>
            </div>
          )}
          {details.life_span && (
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium text-gray-900">Life Span</div>
                <div className="text-sm text-gray-600">{details.life_span}</div>
              </div>
            </div>
          )}
          {details.group && (
            <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
              <Award className="h-5 w-5 text-orange-600" />
              <div>
                <div className="font-medium text-gray-900">Group</div>
                <div className="text-sm text-gray-600">{details.group}</div>
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'temperament',
      title: 'Temperament & Personality',
      icon: Heart,
      content: (
        <div className="space-y-4">
          {details.temperament && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Personality Traits</h4>
              <div className="flex flex-wrap gap-2">
                {details.temperament.map((trait, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700 rounded-full text-sm font-medium"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="grid md:grid-cols-2 gap-4">
            {details.good_with_kids && (
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900">Good with Children</span>
                </div>
                <p className="text-sm text-green-700">{details.good_with_kids}</p>
              </div>
            )}
            
            {details.good_with_pets && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Heart className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Good with Other Pets</span>
                </div>
                <p className="text-sm text-blue-700">{details.good_with_pets}</p>
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      id: 'care',
      title: 'Care Requirements',
      icon: Shield,
      content: (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {details.exercise_needs && (
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="h-5 w-5 text-orange-600" />
                  <span className="font-medium text-orange-900">Exercise Needs</span>
                </div>
                <p className="text-sm text-orange-700">{details.exercise_needs}</p>
              </div>
            )}
            
            {details.grooming_needs && (
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Star className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-purple-900">Grooming Needs</span>
                </div>
                <p className="text-sm text-purple-700">{details.grooming_needs}</p>
              </div>
            )}
            
            {details.energy_level && (
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-yellow-900">Energy Level</span>
                </div>
                <p className="text-sm text-yellow-700">{details.energy_level}</p>
              </div>
            )}
            
            {details.trainability && (
              <div className="p-4 bg-indigo-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Brain className="h-5 w-5 text-indigo-600" />
                  <span className="font-medium text-indigo-900">Trainability</span>
                </div>
                <p className="text-sm text-indigo-700">{details.trainability}</p>
              </div>
            )}
          </div>
          
          {details.coat_type && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Coat Information</h4>
              <div className="space-y-2">
                <p className="text-sm text-gray-700"><strong>Type:</strong> {details.coat_type}</p>
                {details.colors && (
                  <p className="text-sm text-gray-700">
                    <strong>Colors:</strong> {details.colors.join(', ')}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'history',
      title: 'History & Origin',
      icon: Home,
      content: (
        <div className="space-y-4">
          {details.origin && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Origin</h4>
              <p className="text-gray-700">{details.origin}</p>
            </div>
          )}
          
          {details.bred_for && (
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Originally Bred For</h4>
              <p className="text-gray-700">{details.bred_for}</p>
            </div>
          )}
          
          {details.barking_tendency && (
            <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Barking Tendency</h4>
              <p className="text-gray-700">{details.barking_tendency}</p>
            </div>
          )}
        </div>
      )
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{breed}</h2>
            <p className="text-primary-100 mt-1">Comprehensive breed information</p>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(confidence)} bg-white`}>
              {(confidence * 100).toFixed(1)}% confidence
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Sections */}
      <div className="divide-y divide-gray-200">
        {sections.map((section) => {
          const Icon = section.icon
          const isExpanded = expandedSection === section.id
          
          return (
            <div key={section.id}>
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-primary-600" />
                    <span className="font-semibold text-gray-900">{section.title}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </button>
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4">
                      {section.content}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
      
      {/* Quick Actions */}
      <div className="p-6 bg-gray-50 border-t">
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
            Save Breed
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:border-primary-300 hover:text-primary-600 transition-colors font-medium">
            Compare Breeds
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:border-primary-300 hover:text-primary-600 transition-colors font-medium">
            Share Results
          </button>
        </div>
      </div>
    </motion.div>
  )
}