// AI Model Integration Service
// Connects AI prediction results to breed-specific image retrieval
// This service reads the actual AI model class indices and provides intelligent mapping

import classIndices from '../data/class_indices.json';

class AIModelIntegrationService {
  constructor() {
    this.classMapping = this.createClassMapping();
    this.breedNameNormalizer = this.createBreedNameNormalizer();
    this.confidenceThreshold = 0.3; // Minimum confidence for image display
  }

  /**
   * Create mapping from AI model class indices to standardized breed names
   */
  createClassMapping() {
    const mapping = {};
    
    Object.entries(classIndices).forEach(([index, breedName]) => {
      // Store both the original and normalized versions
      mapping[parseInt(index)] = {
        original: breedName,
        normalized: this.normalizeBreedName(breedName),
        apiCompatible: this.convertToApiFormat(breedName),
        searchTerms: this.generateSearchTerms(breedName)
      };
    });

    return mapping;
  }

  /**
   * Normalize breed names from AI model format to human-readable format
   */
  normalizeBreedName(aiBreedName) {
    return aiBreedName
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/-/g, ' ') // Replace hyphens with spaces
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .trim();
  }

  /**
   * Convert breed names to API-compatible formats for external services
   */
  convertToApiFormat(breedName) {
    // For Dog CEO API format (lowercase, hyphens, special cases)
    let dogCeoFormat = breedName
      .toLowerCase()
      .replace(/_/g, '-')
      .replace(/\s+/g, '-');

    // Handle special breed name mappings for Dog CEO API
    const dogCeoSpecialMappings = {
      'airedale': 'airedale',
      'yorkshire-terrier': 'terrier/yorkshire',
      'beagle': 'beagle',
      'miniature-poodle': 'poodle/miniature',
      'border-collie': 'collie/border',
      'german-shepherd': 'germanshepherd',
      'labrador-retriever': 'retriever/labrador',
      'golden-retriever': 'retriever/golden',
      'boston-bull': 'terrier/boston',
      'french-bulldog': 'bulldog/french',
      'english-springer': 'spaniel/english',
      'cocker-spaniel': 'spaniel/cocker',
      'flat-coated-retriever': 'retriever/flatcoated',
      'curly-coated-retriever': 'retriever/curly',
      'chesapeake-bay-retriever': 'retriever/chesapeake',
      'wire-haired-fox-terrier': 'terrier/fox',
      'soft-coated-wheaten-terrier': 'terrier/wheaten',
      'west-highland-white-terrier': 'terrier/westhighland',
      'welsh-springer-spaniel': 'spaniel/welsh'
    };

    if (dogCeoSpecialMappings[dogCeoFormat]) {
      dogCeoFormat = dogCeoSpecialMappings[dogCeoFormat];
    }

    // For Unsplash search format (spaces, proper case)
    const unsplashFormat = this.normalizeBreedName(breedName);

    return {
      dogCeo: dogCeoFormat,
      unsplash: `${unsplashFormat} dog breed`,
      search: unsplashFormat.toLowerCase().replace(/\s+/g, '+')
    };
  }

  /**
   * Generate comprehensive search terms for breed image lookup
   */
  generateSearchTerms(breedName) {
    const normalized = this.normalizeBreedName(breedName);
    const terms = [normalized];

    // Add common breed name variations and synonyms
    const synonymMap = {
      'Afghan Hound': ['Afghan', 'Afghan Greyhound'],
      'German Shepherd': ['German Shepherd Dog', 'GSD', 'Alsatian'],
      'Labrador Retriever': ['Labrador', 'Lab', 'Labrador Retriever'],
      'Golden Retriever': ['Golden', 'Golden Retriever'],
      'Border Collie': ['Border Collie', 'Collie Border'],
      'French Bulldog': ['French Bulldog', 'Frenchie', 'French Bull'],
      'Boston Bull': ['Boston Terrier', 'Boston Bull Terrier'],
      'Siberian Husky': ['Siberian Husky', 'Husky', 'Sibe'],
      'Yorkshire Terrier': ['Yorkshire Terrier', 'Yorkie', 'York Terrier'],
      'Chihuahua': ['Chihuahua', 'Chi'],
      'Pomeranian': ['Pomeranian', 'Pom'],
      'Shih Tzu': ['Shih Tzu', 'Shih-Tzu', 'Shitzu'],
      // Add more synonyms as needed
    };

    if (synonymMap[normalized]) {
      terms.push(...synonymMap[normalized]);
    }

    return terms;
  }

  /**
   * Create breed name normalizer for handling API responses and user input
   */
  createBreedNameNormalizer() {
    const normalizer = {};
    
    Object.values(this.classMapping).forEach(breed => {
      // Map various formats to the standard breed info
      normalizer[breed.original.toLowerCase()] = breed;
      normalizer[breed.normalized.toLowerCase()] = breed;
      normalizer[breed.apiCompatible.dogCeo] = breed;
      
      // Add search term variations
      breed.searchTerms.forEach(term => {
        normalizer[term.toLowerCase()] = breed;
      });
      
      // Add Care Guides format (spaces instead of underscores)
      const careGuidesFormat = breed.original.replace(/_/g, ' ').toLowerCase();
      normalizer[careGuidesFormat] = breed;
      
      // Add reverse mapping (AI model format)
      const aiModelFormat = breed.normalized.replace(/\s+/g, '_').toLowerCase();
      normalizer[aiModelFormat] = breed;
    });

    return normalizer;
  }

  /**
   * Process AI model prediction response and extract breed information
   */
  processPredictionResponse(predictionResponse) {
    try {
      // Handle different response formats
      let predictions = [];

      if (predictionResponse.predicted_class && predictionResponse.confidence) {
        // Single prediction format
        const breedInfo = this.getBreedInfoByName(predictionResponse.predicted_class);
        if (breedInfo) {
          predictions.push({
            breed: breedInfo,
            confidence: predictionResponse.confidence,
            isPrimary: true
          });
        }
      }

      // Handle debug_info with top predictions
      if (predictionResponse.debug_info?.top_3_breeds) {
        predictionResponse.debug_info.top_3_breeds.forEach((pred, index) => {
          const breedInfo = this.getBreedInfoByName(pred.breed);
          if (breedInfo && pred.confidence >= this.confidenceThreshold) {
            predictions.push({
              breed: breedInfo,
              confidence: pred.confidence,
              isPrimary: index === 0,
              rank: index + 1
            });
          }
        });
      }

      return {
        success: true,
        predictions: predictions.filter(p => p.confidence >= this.confidenceThreshold),
        primaryBreed: predictions.find(p => p.isPrimary)?.breed,
        isMultiBreed: predictions.length > 1,
        processingMetadata: {
          totalPredictions: predictions.length,
          highConfidencePredictions: predictions.filter(p => p.confidence > 0.7).length,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error processing AI prediction response:', error);
      return {
        success: false,
        error: error.message,
        predictions: [],
        primaryBreed: null
      };
    }
  }

  /**
   * Get breed information by name (handles various formats)
   */
  getBreedInfoByName(breedName) {
    if (!breedName) return null;
    
    const normalized = breedName.toLowerCase().trim();
    
    // Direct lookup first
    let breedInfo = this.breedNameNormalizer[normalized];
    if (breedInfo) return breedInfo;
    
    // Try converting Care Guides format to AI model format
    const aiModelFormat = normalized.replace(/\s+/g, '_');
    breedInfo = this.breedNameNormalizer[aiModelFormat];
    if (breedInfo) return breedInfo;
    
    // Try converting AI model format to Care Guides format
    const careGuidesFormat = normalized.replace(/_/g, ' ');
    breedInfo = this.breedNameNormalizer[careGuidesFormat];
    if (breedInfo) return breedInfo;
    
    // Try exact match against all class indices
    for (const [index, aiBreedName] of Object.entries(classIndices)) {
      const normalizedAiName = this.normalizeBreedName(aiBreedName).toLowerCase();
      if (normalizedAiName === normalized || 
          normalizedAiName === careGuidesFormat ||
          aiBreedName.toLowerCase() === normalized) {
        return this.classMapping[parseInt(index)];
      }
    }
    
    return null;
  }

  /**
   * Get breed information by AI model class index
   */
  getBreedInfoByIndex(classIndex) {
    return this.classMapping[parseInt(classIndex)] || null;
  }

  /**
   * Generate image query parameters for external APIs
   */
  generateImageQueryParams(breedInfo, options = {}) {
    if (!breedInfo) return null;

    const {
      imageCount = 6,
      includeVariations = true,
      priorityLevel = 'standard' // 'high', 'standard', 'low'
    } = options;

    return {
      dogCeoApi: {
        breed: breedInfo.apiCompatible.dogCeo,
        endpoint: `/breed/${breedInfo.apiCompatible.dogCeo}/images`,
        fallbackEndpoint: `/breeds/image/random/${imageCount}`,
        requestLimit: imageCount
      },
      unsplashApi: {
        query: breedInfo.apiCompatible.unsplash,
        searchTerms: breedInfo.searchTerms,
        parameters: {
          per_page: imageCount,
          orientation: 'all',
          category: 'animals',
          content_filter: 'high'
        }
      },
      searchFallbacks: breedInfo.searchTerms.map(term => ({
        term: `${term} dog`,
        platform: 'general'
      })),
      metadata: {
        breedName: breedInfo.normalized,
        originalClassName: breedInfo.original,
        searchComplexity: breedInfo.searchTerms.length,
        priorityLevel
      }
    };
  }

  /**
   * Validate if an image query result matches the expected breed
   */
  validateImageBreedMatch(imageMetadata, expectedBreed) {
    if (!imageMetadata || !expectedBreed) return { isValid: false, confidence: 0 };

    const imageDescription = (imageMetadata.description || '').toLowerCase();
    const imageAltText = (imageMetadata.alt || '').toLowerCase();
    const imageTags = (imageMetadata.tags || []).map(tag => tag.toLowerCase());

    // Check for breed name mentions
    const breedTerms = expectedBreed.searchTerms.map(term => term.toLowerCase());
    const allText = `${imageDescription} ${imageAltText} ${imageTags.join(' ')}`;

    let matchCount = 0;
    breedTerms.forEach(term => {
      if (allText.includes(term)) matchCount++;
    });

    const confidence = matchCount / breedTerms.length;

    return {
      isValid: confidence > 0.3, // At least 30% term match
      confidence,
      matchingTerms: breedTerms.filter(term => allText.includes(term)),
      validationMetadata: {
        imageSource: imageMetadata.source || 'unknown',
        matchScore: confidence,
        termsChecked: breedTerms.length,
        termsMatched: matchCount
      }
    };
  }

  /**
   * Get all available breeds from the AI model
   */
  getAllBreeds() {
    return Object.values(this.classMapping).map(breed => ({
      index: Object.keys(this.classMapping).find(key => this.classMapping[key] === breed),
      original: breed.original,
      normalized: breed.normalized,
      searchTerms: breed.searchTerms
    }));
  }

  /**
   * Generate breed comparison data for crossbreed scenarios
   */
  generateBreedComparison(predictions) {
    if (!predictions || predictions.length < 2) return null;

    return {
      primaryBreed: predictions[0],
      secondaryBreeds: predictions.slice(1),
      comparisonType: 'potential_crossbreed',
      visualStrategy: 'side_by_side',
      educationalContext: {
        showParentBreeds: true,
        highlightDifferences: true,
        includeBreedingInfo: false // For family-friendly content
      }
    };
  }
}

// Create singleton instance
const aiModelIntegrationService = new AIModelIntegrationService();

export default aiModelIntegrationService;