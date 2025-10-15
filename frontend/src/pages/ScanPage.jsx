import React, { useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  Camera, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Heart,
  Bookmark,
  Share2,
  Download,
  Calendar
} from 'lucide-react'
import { useAuthContext } from '../auth/AuthContext'
import AdvancedBreedInfo from '../components/AdvancedBreedInfo'
import CrossbreedAnalysis from '../components/CrossbreedAnalysis'
import CrossbreedDetectionCard from '../components/CrossbreedDetectionCard'
import CrossbreedAnalysisModal from '../components/CrossbreedAnalysisModal'
import BREED_DETAILS from '../breedDetails'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8001'

export default function ScanPage() {
  const { addToHistory, saveBreed, isSignedIn, user, apiService } = useAuthContext()
  const fileInputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showCrossbreedModal, setShowCrossbreedModal] = useState(false)
  const [selectedCrossbreedData, setSelectedCrossbreedData] = useState(null)

  // Breed matching functions (from original)
  function sanitize(s) {
    return (s || '')
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/[()]/g, '')
      .replace(/[^a-z0-9 ]+/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  const ALIASES = {
    'boston terrier': 'Boston Bull (Boston Terrier)',
    'boston bull': 'Boston Bull (Boston Terrier)',
    'german shepherd': 'German Shepherd Dog',
    'german shepherd dog': 'German Shepherd Dog',
    'miniature poodle': 'Miniature Poodle',
    'standard poodle': 'Standard Poodle',
    'english springer spaniel': 'English Springer Spaniel',
    'welsh springer spaniel': 'Welsh Springer Spaniel',
    'pembroke welsh corgi': 'Pembroke Welsh Corgi',
    'afghan hound': 'Afghan Hound',
    'airedale terrier': 'Airedale Terrier',
    'yorkshire terrier': 'Yorkshire Terrier',
    'shetland sheepdog': 'Shetland Sheepdog'
  }

  function getBreedDetails(predicted) {
    if (!predicted) return null
    if (BREED_DETAILS[predicted]) return BREED_DETAILS[predicted]
    const norm = sanitize(predicted)
    if (ALIASES[norm] && BREED_DETAILS[ALIASES[norm]]) {
      return BREED_DETAILS[ALIASES[norm]]
    }
    const keys = Object.keys(BREED_DETAILS)
    let matchKey = keys.find(k => sanitize(k) === norm)
    if (matchKey) return BREED_DETAILS[matchKey]
    matchKey = keys.find(k => sanitize(k).includes(norm) || norm.includes(sanitize(k)))
    if (matchKey) return BREED_DETAILS[matchKey]
    return null
  }

  const details = getBreedDetails(result?.breed)

  // Drag and drop handlers
  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFile = (file) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size should be less than 10MB')
      return
    }

    setFile(file)
    setResult(null)
    setError('')
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const onFileChange = (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFile(selectedFile)
    }
  }

  const onUploadClick = () => {
    fileInputRef.current?.click()
  }

  const removeFile = () => {
    setFile(null)
    setPreviewUrl('')
    setResult(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const onPredict = async () => {
    if (!file) return
    
    setLoading(true)
    setError('')
    setResult(null)
    setUploadProgress(0)
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 100)
      
      let data
      if (apiService && isSignedIn && user) {
        // Use new API service with user data saving
        data = await apiService.predictWithUserData(file, user.id)
      } else {
        // Fallback to original API
        const form = new FormData()
        form.append('file', file)
        
        const res = await fetch(`${API_BASE}/predict`, { 
          method: 'POST', 
          body: form 
        })
        
        data = await res.json()
        if (data.error) {
          throw new Error(data.error)
        }
      }
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      const newResult = { 
        breed: data.predicted_class, 
        predicted_class: data.predicted_class, // Add for CrossbreedDetectionCard compatibility
        confidence: data.confidence,
        imageUrl: previewUrl,
        is_potential_crossbreed: data.is_potential_crossbreed,
        top_predictions: data.top_predictions,
        crossbreed_analysis: data.crossbreed_analysis,
        detection_metadata: data.detection_metadata,
        timestamp: data.timestamp
      }
      
      setResult(newResult)
      
      // Add to user history (this will also save to localStorage as backup)
      if (isSignedIn) {
        addToHistory(newResult)
      }
      
    } catch (err) {
      setError(err.message || 'Prediction failed')
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  const onSaveBreed = () => {
    if (result?.breed && isSignedIn) {
      saveBreed(result.breed)
    }
  }

  const handleUserFeedback = async (feedback) => {
    if (!result || !isSignedIn || !user) return
    
    try {
      // Send feedback to backend for improving the model
      const response = await fetch(`${API_BASE}/api/scan-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          predicted_breed: result.breed,
          feedback_type: feedback,
          is_crossbreed: result.is_potential_crossbreed,
          crossbreed_analysis: result.crossbreed_analysis,
          timestamp: new Date().toISOString()
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to submit feedback')
      }
      
      console.log('✅ User feedback submitted successfully')
    } catch (error) {
      console.error('❌ Failed to submit feedback:', error)
    }
  }

  const handleCrossbreedAnalysis = (crossbreedData) => {
    setSelectedCrossbreedData(crossbreedData)
    setShowCrossbreedModal(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl lg:text-4xl font-bold font-display text-gray-900 mb-4">
            Identify Your Dog's Breed
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload a clear photo of your dog and let our AI identify the breed with detailed insights
          </p>
        </motion.div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragActive 
                ? 'border-primary-400 bg-primary-50' 
                : 'border-gray-300 hover:border-primary-300 bg-white'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="hidden"
            />
            
            {!previewUrl ? (
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center">
                  <Upload className="h-8 w-8 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Upload a photo of your dog
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Drag and drop an image here, or click to select
                  </p>
                  <button
                    onClick={onUploadClick}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow"
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    Choose Photo
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  Supports JPG, PNG, WEBP up to 10MB
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative inline-block">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-64 rounded-lg shadow-lg"
                  />
                  <button
                    onClick={removeFile}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={onUploadClick}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:border-primary-300 hover:text-primary-600 transition-colors"
                  >
                    Change Photo
                  </button>
                  <button
                    onClick={onPredict}
                    disabled={loading}
                    className="px-6 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Identify Breed'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Progress Bar */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-6"
            >
              <div className="bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-primary-600 to-secondary-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2 text-center">
                Analyzing your dog's image...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center"
            >
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Crossbreed Detection Card */}
              <CrossbreedDetectionCard
                predictionResult={result}
                onAnalyzeClick={handleCrossbreedAnalysis}
                className="mb-6"
              />

              {/* Breed Details */}
              {details && (
                <AdvancedBreedInfo 
                  breed={result.breed}
                  details={details}
                  confidence={result.confidence}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Crossbreed Analysis Modal */}
        <CrossbreedAnalysisModal
          isOpen={showCrossbreedModal}
          onClose={() => setShowCrossbreedModal(false)}
          crossbreedData={selectedCrossbreedData}
          predictedBreed={result?.breed}
          predictionImage={previewUrl}
        />
      </div>
    </div>
  )
}