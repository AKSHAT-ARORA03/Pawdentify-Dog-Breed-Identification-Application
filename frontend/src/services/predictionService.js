// Enhanced Prediction Service
// Integrates AI model predictions with automatic image fetching
// Provides seamless real-time breed identification with instant image loading

import imageApiService from './imageApiService.js';
import aiModelIntegrationService from './aiModelIntegrationService.js';
import breedNameMappingService from './breedNameMappingService.js';

class PredictionService {
  constructor() {
    this.apiBaseUrl = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';
    this.predictionHistory = [];
    this.currentPrediction = null;
    this.imageLoadingPromises = new Map();
    this.subscribers = new Set();
    
    // Configuration
    this.config = {
      autoFetchImages: true,
      imageCount: 6,
      confidenceThreshold: 0.3,
      enableCaching: true,
      prioritizeQuality: true
    };

    console.log('🧠 Enhanced Prediction Service initialized');
  }

  /**
   * Subscribe to prediction updates
   */
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  /**
   * Notify all subscribers of prediction updates
   */
  notifySubscribers(event, data) {
    this.subscribers.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Subscriber notification error:', error);
      }
    });
  }

  /**
   * Main prediction method with automatic image fetching
   */
  async predictBreed(imageFile, options = {}) {
    const startTime = Date.now();
    
    try {
      console.log('🔍 Starting breed prediction with image enhancement...');
      
      // Notify subscribers that prediction is starting
      this.notifySubscribers('prediction_start', {
        filename: imageFile.name,
        size: imageFile.size,
        timestamp: new Date().toISOString()
      });

      // Step 1: Get AI model prediction
      const predictionResult = await this.callPredictionApi(imageFile);
      
      // Step 2: Process prediction with AI model integration service
      const processedPrediction = aiModelIntegrationService.processPredictionResponse(predictionResult);
      
      if (!processedPrediction.success) {
        throw new Error('Prediction processing failed: ' + processedPrediction.error);
      }

      // Store current prediction
      this.currentPrediction = {
        ...processedPrediction,
        originalFile: {
          name: imageFile.name,
          size: imageFile.size,
          type: imageFile.type
        },
        startTime,
        predictionTime: Date.now()
      };

      // Notify subscribers of successful prediction
      this.notifySubscribers('prediction_complete', this.currentPrediction);

      // Step 3: Automatically fetch breed-specific images (if enabled)
      if (this.config.autoFetchImages && processedPrediction.primaryBreed) {
        console.log('🖼️ Automatically fetching breed-specific images...');
        
        // Start image fetching in parallel (don't await)
        const imagePromise = this.fetchBreedImagesForPrediction(processedPrediction, options);
        this.imageLoadingPromises.set(this.currentPrediction.processingMetadata.timestamp, imagePromise);

        // Notify that image loading started
        this.notifySubscribers('images_loading_start', {
          breedName: processedPrediction.primaryBreed.normalized,
          isMultiBreed: processedPrediction.isMultiBreed
        });

        // Handle image loading completion
        imagePromise.then(imageResult => {
          this.currentPrediction.images = imageResult;
          this.notifySubscribers('images_loaded', {
            breedName: processedPrediction.primaryBreed.normalized,
            images: imageResult.images || [],
            success: imageResult.success
          });
        }).catch(error => {
          console.error('Image loading failed:', error);
          this.notifySubscribers('images_error', {
            breedName: processedPrediction.primaryBreed.normalized,
            error: error.message
          });
        });
      }

      // Step 4: Add to prediction history
      this.addToPredictionHistory(this.currentPrediction);

      // Step 5: Return enhanced prediction result
      const enhancedResult = {
        ...this.currentPrediction,
        processingTime: Date.now() - startTime,
        imagesLoading: this.config.autoFetchImages,
        enhancedFeatures: {
          breedInformation: processedPrediction.primaryBreed,
          multiBreedAnalysis: processedPrediction.isMultiBreed,
          confidenceAnalysis: this.analyzeConfidence(processedPrediction.predictions)
        }
      };

      console.log('✅ Enhanced prediction completed:', enhancedResult.enhancedFeatures.breedInformation.normalized);
      return enhancedResult;

    } catch (error) {
      console.error('❌ Prediction failed:', error);
      
      const errorResult = {
        success: false,
        error: error.message,
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };

      this.notifySubscribers('prediction_error', errorResult);
      return errorResult;
    }
  }

  /**
   * Call the AI model prediction API
   */
  async callPredictionApi(imageFile) {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await fetch(`${this.apiBaseUrl}/predict`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Fetch breed-specific images for a prediction result
   */
  async fetchBreedImagesForPrediction(processedPrediction, options = {}) {
    const imageOptions = {
      imageCount: options.imageCount || this.config.imageCount,
      prioritizeQuality: options.prioritizeQuality ?? this.config.prioritizeQuality,
      includeFallbacks: options.includeFallbacks ?? true,
      forceRefresh: options.forceRefresh ?? false
    };

    try {
      let imageResult;

      if (processedPrediction.isMultiBreed) {
        // Handle crossbreed predictions
        imageResult = await imageApiService.fetchMultiBreedImages(processedPrediction, imageOptions);
      } else {
        // Handle single breed predictions
        imageResult = await imageApiService.fetchBreedImages(processedPrediction, imageOptions);
      }

      return {
        ...imageResult,
        enhancedMetadata: {
          predictionConfidence: processedPrediction.primaryBreed?.confidence,
          breedAccuracy: this.calculateOverallBreedAccuracy(imageResult.images),
          loadingStrategy: processedPrediction.isMultiBreed ? 'multi_breed' : 'single_breed'
        }
      };

    } catch (error) {
      console.error('Image fetching error:', error);
      return {
        success: false,
        error: error.message,
        breedName: processedPrediction.primaryBreed?.normalized || 'Unknown',
        images: []
      };
    }
  }

  /**
   * Get breed-specific images for Care Guides (without prediction)
   */
  async getBreedImagesForCareGuides(breedName, options = {}) {
    try {
      console.log('📚 Care Guides: Fetching images for breed:', breedName);

      // First, try to map Care Guides breed name to AI model breed name
      const aiModelBreedName = breedNameMappingService.getAIModelName(breedName);
      const searchBreedName = aiModelBreedName || breedName;

      console.log('🔗 Breed mapping:', breedName, '->', searchBreedName);
      
      // Validate the mapping
      if (aiModelBreedName) {
        console.log('✅ Found valid mapping for:', breedName);
      } else {
        console.warn('⚠️ No mapping found for:', breedName, '- using original name');
      }

      // Get breed information from AI model integration service
      const breedInfo = aiModelIntegrationService.getBreedInfoByName(searchBreedName);
      
      if (!breedInfo) {
        console.warn(`❌ Breed not found in AI model: ${searchBreedName}, trying original name: ${breedName}`);
        // Fallback to original name
        const fallbackBreedInfo = aiModelIntegrationService.getBreedInfoByName(breedName);
        if (!fallbackBreedInfo) {
          throw new Error(`Breed not found in AI model: ${breedName}`);
        }
        return await this.getBreedImagesForCareGuides(breedName, { ...options, useOriginalName: true });
      }

      console.log('🎯 Using breed info:', breedInfo.normalized, 'for API calls');

      // Create a mock prediction result for the image service
      const mockPrediction = {
        success: true,
        primaryBreed: breedInfo,
        predictions: [{ breed: breedInfo, confidence: 1.0, isPrimary: true }],
        isMultiBreed: false
      };

      // Fetch images using the standard flow
      console.log('🌐 Calling image API service...');
      const imageResult = await imageApiService.fetchBreedImages(mockPrediction, {
        imageCount: options.imageCount || 8,
        prioritizeQuality: true,
        includeFallbacks: true,
        ...options
      });

      console.log('📸 Image API result:', imageResult.success ? `${imageResult.images?.length || 0} images` : 'Failed');

      // Add Care Guide specific metadata
      return {
        ...imageResult,
        context: 'care_guides',
        originalBreedName: breedName,
        mappedBreedName: searchBreedName,
        breedInfo: {
          original: breedInfo.original,
          normalized: breedInfo.normalized,
          searchTerms: breedInfo.searchTerms
        }
      };

    } catch (error) {
      console.error('❌ Care Guide image fetching error for', breedName, ':', error);
      return {
        success: false,
        error: error.message,
        breedName: breedName,
        images: [],
        context: 'care_guides'
      };
    }
  }

  /**
   * Get all available breeds from the AI model
   */
  getAvailableBreeds() {
    return aiModelIntegrationService.getAllBreeds();
  }

  /**
   * Search for breeds by name
   */
  searchBreeds(query) {
    const allBreeds = this.getAvailableBreeds();
    const lowerQuery = query.toLowerCase();

    return allBreeds.filter(breed => 
      breed.normalized.toLowerCase().includes(lowerQuery) ||
      breed.original.toLowerCase().includes(lowerQuery) ||
      breed.searchTerms.some(term => term.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Analyze prediction confidence levels
   */
  analyzeConfidence(predictions) {
    if (!predictions || predictions.length === 0) {
      return { level: 'none', description: 'No predictions available' };
    }

    const topConfidence = predictions[0]?.confidence || 0;
    const secondConfidence = predictions[1]?.confidence || 0;
    const confidenceGap = topConfidence - secondConfidence;

    if (topConfidence >= 0.9) {
      return { level: 'very_high', description: 'Very confident identification' };
    } else if (topConfidence >= 0.7) {
      return { level: 'high', description: 'Confident identification' };
    } else if (topConfidence >= 0.5 && confidenceGap >= 0.2) {
      return { level: 'moderate', description: 'Moderately confident identification' };
    } else if (predictions.length > 1 && confidenceGap < 0.1) {
      return { level: 'uncertain', description: 'Multiple possible breeds detected' };
    } else {
      return { level: 'low', description: 'Low confidence identification' };
    }
  }

  /**
   * Calculate overall breed accuracy for a set of images
   */
  calculateOverallBreedAccuracy(images) {
    if (!images || images.length === 0) return 0;

    const accuracyScores = images
      .filter(img => img.breedAccuracy !== undefined)
      .map(img => img.breedAccuracy);

    if (accuracyScores.length === 0) return 0.5; // Default neutral score

    return accuracyScores.reduce((sum, score) => sum + score, 0) / accuracyScores.length;
  }

  /**
   * Add prediction to history
   */
  addToPredictionHistory(prediction) {
    this.predictionHistory.unshift(prediction);
    
    // Keep only last 50 predictions
    if (this.predictionHistory.length > 50) {
      this.predictionHistory = this.predictionHistory.slice(0, 50);
    }

    // Notify subscribers of history update
    this.notifySubscribers('history_updated', {
      total: this.predictionHistory.length,
      latest: prediction
    });
  }

  /**
   * Get prediction history
   */
  getPredictionHistory() {
    return [...this.predictionHistory]; // Return copy
  }

  /**
   * Get current prediction
   */
  getCurrentPrediction() {
    return this.currentPrediction;
  }

  /**
   * Get images for current prediction (with loading state)
   */
  async getCurrentPredictionImages() {
    if (!this.currentPrediction) return null;

    const timestamp = this.currentPrediction.processingMetadata.timestamp;
    const imagePromise = this.imageLoadingPromises.get(timestamp);

    if (imagePromise) {
      try {
        return await imagePromise;
      } catch (error) {
        console.error('Error getting current prediction images:', error);
        return null;
      }
    }

    return this.currentPrediction.images || null;
  }

  /**
   * Update service configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Prediction service config updated:', this.config);
  }

  /**
   * Clear prediction history
   */
  clearHistory() {
    this.predictionHistory = [];
    this.notifySubscribers('history_cleared', {});
  }

  /**
   * Health check method
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/health`);
      const healthData = await response.json();
      
      return {
        apiConnected: response.ok,
        modelLoaded: healthData.model_loaded,
        breedsAvailable: healthData.breeds_available,
        imageServices: imageApiService.getCacheStats().apiStatus
      };
    } catch (error) {
      return {
        apiConnected: false,
        error: error.message,
        imageServices: imageApiService.getCacheStats().apiStatus
      };
    }
  }
}

// Create singleton instance
const predictionService = new PredictionService();

export default predictionService;