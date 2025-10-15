/**
 * Simple Breed Image Service
 * Directly fetches breed-specific dog images without complex AI integration
 * Focuses on getting actual dog breed photos quickly and reliably
 */

class SimpleBreedImageService {
  constructor() {
    this.cache = new Map();
    this.dogCeoBaseUrl = 'https://dog.ceo/api';
    
    // Direct breed mappings for Dog CEO API
    this.breedMappings = {
      'Yorkshire Terrier': 'terrier/yorkshire',
      'Airedale Terrier': 'airedale', 
      'Beagle': 'beagle',
      'Rottweiler': 'rottweiler',
      'Miniature Poodle': 'poodle/miniature',
      'Standard Poodle': 'poodle/standard',
      'Toy Poodle': 'poodle/toy',
      'Labrador Retriever': 'retriever/golden', // Using golden as fallback since labrador isn't in API
      'Golden Retriever': 'retriever/golden',
      'German Shepherd': 'german/shepherd',  // Fixed: correct API format
      'Bernese Mountain Dog': 'mountain/bernese',  // Fixed: correct API format
      'Saint Bernard': 'stbernard',  // Fixed: correct API format
      'Border Collie': 'collie/border',
      'French Bulldog': 'bulldog/french',
      'Boston Terrier': 'terrier/boston',
      'Siberian Husky': 'husky',
      'Chihuahua': 'chihuahua',
      'Pomeranian': 'pomeranian',
      'Shih Tzu': 'shihtzu',
      'Boxer': 'boxer',
      'Great Dane': 'dane/great',
      'Doberman': 'doberman',
      'Cocker Spaniel': 'spaniel/cocker',
      'English Springer Spaniel': 'springer/english',
      'Basset Hound': 'hound/basset',
      'Afghan Hound': 'hound/afghan',
      'Irish Setter': 'setter/irish',
      'English Setter': 'setter/english',
      'Weimaraner': 'weimaraner',
      'Vizsla': 'vizsla',
      'Dalmatian': 'dalmatian',
      'Newfoundland': 'newfoundland',
      'Mastiff': 'mastiff/bull',
      'Rhodesian Ridgeback': 'ridgeback/rhodesian',
      'Whippet': 'whippet',
      'Greyhound': 'greyhound',
      'Scottish Terrier': 'terrier/scottish',
      'West Highland White Terrier': 'terrier/westhighland',
      'Cairn Terrier': 'terrier/cairn',
      'Welsh Corgi': 'corgi/cardigan',
      'Brussels Griffon': 'brabancon'  // Fixed: Brussels Griffon maps to brabancon
    };

    console.log('🐕 Simple Breed Image Service initialized');
  }

  /**
   * Get a single breed image quickly
   */
  async getBreedImage(breedName) {
    try {
      console.log(`🔍 Fetching simple breed image for: ${breedName}`);
      
      // Check cache first
      if (this.cache.has(breedName)) {
        const cached = this.cache.get(breedName);
        if (Date.now() - cached.timestamp < 300000) { // 5 minutes cache
          console.log(`📦 Using cached image for: ${breedName}`);
          return cached.url;
        }
      }

      // Get Dog CEO API breed format
      const apiBreed = this.breedMappings[breedName];
      if (!apiBreed) {
        console.warn(`⚠️ No mapping found for breed: ${breedName}`);
        return this.getFallbackImage(breedName);
      }

      // Fetch from Dog CEO API
      const apiUrl = `${this.dogCeoBaseUrl}/breed/${apiBreed}/images/random`;
      console.log(`🌐 Calling Dog CEO API: ${apiUrl}`);
      
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.status === 'success' && data.message) {
        const imageUrl = data.message;
        
        // Cache the result
        this.cache.set(breedName, {
          url: imageUrl,
          timestamp: Date.now()
        });

        console.log(`✅ Successfully fetched image for: ${breedName}`);
        return imageUrl;
      } else {
        throw new Error(`Dog CEO API error: ${data.message || 'Unknown error'}`);
      }

    } catch (error) {
      console.error(`❌ Error fetching image for ${breedName}:`, error);
      return this.getFallbackImage(breedName);
    }
  }

  /**
   * Get multiple breed images
   */
  async getBreedImages(breedName, count = 4) {
    try {
      console.log(`🖼️ Fetching ${count} images for: ${breedName}`);
      
      // Get Dog CEO API breed format
      const apiBreed = this.breedMappings[breedName];
      if (!apiBreed) {
        console.warn(`⚠️ No mapping found for breed: ${breedName}`);
        return [this.getFallbackImageObject(breedName)];
      }

      // Fetch multiple images from Dog CEO API
      const apiUrl = `${this.dogCeoBaseUrl}/breed/${apiBreed}/images/random/${count}`;
      console.log(`🌐 Calling Dog CEO API for multiple images: ${apiUrl}`);
      
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.status === 'success' && data.message) {
        const imageUrls = Array.isArray(data.message) ? data.message : [data.message];
        
        const images = imageUrls.map((url, index) => ({
          id: `${breedName}-${index}`,
          url: url,
          alt: `${breedName} dog breed ${index + 1}`,
          source: 'Dog CEO API',
          thumbnail: url // Dog CEO doesn't provide separate thumbnails
        }));

        // Cache each image
        images.forEach((image, index) => {
          this.cache.set(`${breedName}-${index}`, {
            url: image.url,
            timestamp: Date.now()
          });
        });

        console.log(`✅ Successfully fetched ${images.length} images for: ${breedName}`);
        return images;
      } else {
        throw new Error(`Dog CEO API error: ${data.message || 'Unknown error'}`);
      }

    } catch (error) {
      console.error(`❌ Error fetching multiple images for ${breedName}:`, error);
      
      // Return fallback images
      return Array.from({ length: count }, (_, i) => ({
        id: `fallback-${breedName}-${i}`,
        url: this.getFallbackImage(breedName),
        alt: `${breedName} placeholder ${i + 1}`,
        source: 'Placeholder',
        isFallback: true
      }));
    }
  }

  /**
   * Get fallback image URL
   */
  getFallbackImage(breedName) {
    const encodedName = encodeURIComponent(breedName);
    return `https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=${encodedName}`;
  }

  /**
   * Get fallback image object
   */
  getFallbackImageObject(breedName) {
    return {
      id: `fallback-${breedName}`,
      url: this.getFallbackImage(breedName),
      alt: `${breedName} placeholder`,
      source: 'Placeholder',
      isFallback: true
    };
  }

  /**
   * Check if breed is supported
   */
  isBreedSupported(breedName) {
    return this.breedMappings.hasOwnProperty(breedName);
  }

  /**
   * Get all supported breeds
   */
  getSupportedBreeds() {
    return Object.keys(this.breedMappings);
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    console.log('🗑️ Simple breed image cache cleared');
  }
}

// Create singleton instance
const simpleBreedImageService = new SimpleBreedImageService();

export default simpleBreedImageService;