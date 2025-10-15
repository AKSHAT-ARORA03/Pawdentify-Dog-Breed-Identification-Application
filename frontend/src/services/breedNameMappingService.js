/**
 * Breed Name Mapping Service
 * Direct mapping between Care Guides breed names and AI model class indices
 * Ensures accurate breed-specific image loading
 */

import classIndices from '../data/class_indices.json';

class BreedNameMappingService {
  constructor() {
    this.careGuidesToAIModel = this.createDirectMappings();
    this.aiModelToCareGuides = this.createReverseMappings();
    console.log('🔗 Breed Name Mapping Service initialized with', Object.keys(this.careGuidesToAIModel).length, 'mappings');
  }

  /**
   * Create direct mappings from Care Guides names to AI model names
   */
  createDirectMappings() {
    const mappings = {
      // Terriers
      'Yorkshire Terrier': 'Yorkshire_terrier',
      'Airedale Terrier': 'Airedale',
      'Boston Terrier': 'Boston_bull',
      'Border Terrier': 'Border_terrier',
      'Cairn Terrier': 'cairn',
      'Irish Terrier': 'Irish_terrier',
      'Kerry Blue Terrier': 'Kerry_blue_terrier',
      'Lakeland Terrier': 'Lakeland_terrier',
      'Norfolk Terrier': 'Norfolk_terrier',
      'Norwich Terrier': 'Norwich_terrier',
      'Scottish Terrier': 'Scotch_terrier',
      'Sealyham Terrier': 'Sealyham_terrier',
      'Silky Terrier': 'silky_terrier',
      'Tibetan Terrier': 'Tibetan_terrier',
      'West Highland White Terrier': 'West_Highland_white_terrier',
      'Wire Haired Fox Terrier': 'wire-haired_fox_terrier',
      'Soft Coated Wheaten Terrier': 'soft-coated_wheaten_terrier',
      'American Staffordshire Terrier': 'American_Staffordshire_terrier',
      'Staffordshire Bull Terrier': 'Staffordshire_bullterrier',
      'Bedlington Terrier': 'Bedlington_terrier',
      'Dandie Dinmont Terrier': 'Dandie_Dinmont',
      'Toy Terrier': 'toy_terrier',

      // Retrievers
      'Labrador Retriever': 'Labrador_retriever',
      'Golden Retriever': 'golden_retriever',
      'Chesapeake Bay Retriever': 'Chesapeake_Bay_retriever',
      'Flat Coated Retriever': 'flat-coated_retriever',
      'Curly Coated Retriever': 'curly-coated_retriever',

      // Spaniels
      'Cocker Spaniel': 'cocker_spaniel',
      'English Springer Spaniel': 'English_springer',
      'Welsh Springer Spaniel': 'Welsh_springer_spaniel',
      'Irish Water Spaniel': 'Irish_water_spaniel',
      'Sussex Spaniel': 'Sussex_spaniel',
      'Brittany Spaniel': 'Brittany_spaniel',
      'Blenheim Spaniel': 'Blenheim_spaniel',
      'Japanese Spaniel': 'Japanese_spaniel',
      'Clumber Spaniel': 'clumber',

      // Setters
      'English Setter': 'English_setter',
      'Irish Setter': 'Irish_setter',
      'Gordon Setter': 'Gordon_setter',

      // Poodles
      'Poodle': 'standard_poodle',
      'Standard Poodle': 'standard_poodle',
      'Miniature Poodle': 'miniature_poodle',
      'Toy Poodle': 'toy_poodle',

      // Collies and Shepherds
      'Border Collie': 'Border_collie',
      'Collie': 'collie',
      'German Shepherd': 'German_shepherd',
      'Old English Sheepdog': 'Old_English_sheepdog',
      'Shetland Sheepdog': 'Shetland_sheepdog',

      // Hounds
      'Beagle': 'beagle',
      'Basset Hound': 'basset',
      'Afghan Hound': 'Afghan_hound',
      'Bloodhound': 'bloodhound',
      'English Foxhound': 'English_foxhound',
      'Ibizan Hound': 'Ibizan_hound',
      'Irish Wolfhound': 'Irish_wolfhound',
      'Norwegian Elkhound': 'Norwegian_elkhound',
      'Otterhound': 'otterhound',
      'Rhodesian Ridgeback': 'Rhodesian_ridgeback',
      'Saluki': 'Saluki',
      'Scottish Deerhound': 'Scottish_deerhound',
      'Walker Hound': 'Walker_hound',
      'Whippet': 'whippet',
      'Italian Greyhound': 'Italian_greyhound',
      'Borzoi': 'borzoi',
      'Black and Tan Coonhound': 'black-and-tan_coonhound',
      'Bluetick Coonhound': 'bluetick',
      'Redbone Coonhound': 'redbone',

      // Bulldogs and Mastiffs
      'French Bulldog': 'French_bulldog',
      'English Bulldog': 'Boston_bull', // Note: AI model doesn't have "English Bulldog"
      'Bull Mastiff': 'bull_mastiff',
      'Tibetan Mastiff': 'Tibetan_mastiff',

      // Working Dogs
      'German Shorthaired Pointer': 'German_short-haired_pointer',
      'Weimaraner': 'Weimaraner',
      'Vizsla': 'vizsla',
      'Doberman Pinscher': 'Doberman',
      'Rottweiler': 'Rottweiler',
      'Great Dane': 'Great_Dane',
      'Saint Bernard': 'Saint_Bernard',
      'Newfoundland': 'Newfoundland',
      'Great Pyrenees': 'Great_Pyrenees',
      'Bernese Mountain Dog': 'Bernese_mountain_dog',
      'Greater Swiss Mountain Dog': 'Greater_Swiss_Mountain_dog',
      'Entlebucher Mountain Dog': 'EntleBucher',
      'Appenzeller': 'Appenzeller',
      'Siberian Husky': 'Siberian_husky',
      'Alaskan Malamute': 'malamute',
      'Samoyed': 'Samoyed',
      'Komondor': 'komondor',
      'Kuvasz': 'kuvasz',
      'Boxer': 'boxer',

      // Small/Toy Breeds
      'Chihuahua': 'Chihuahua',
      'Pomeranian': 'Pomeranian',
      'Papillon': 'papillon',
      'Maltese': 'Maltese_dog',
      'Shih Tzu': 'Shih-Tzu',
      'Lhasa Apso': 'Lhasa',
      'Pekingese': 'Pekinese',
      'Pug': 'pug',
      'Miniature Pinscher': 'miniature_pinscher',
      'Affenpinscher': 'affenpinscher',

      // Corgis
      'Pembroke Welsh Corgi': 'Pembroke',
      'Cardigan Welsh Corgi': 'Cardigan',

      // Schnauzers
      'Giant Schnauzer': 'giant_schnauzer',
      'Standard Schnauzer': 'standard_schnauzer',
      'Miniature Schnauzer': 'miniature_schnauzer',

      // Other breeds
      'Basenji': 'basenji',
      'Chow Chow': 'chow',
      'Dalmatian': 'Dalmatian', // Not in AI model
      'Australian Terrier': 'Australian_terrier',
      'Eskimo Dog': 'Eskimo_dog',
      'Keeshond': 'keeshond',
      'Kelpie': 'kelpie',
      'Schipperke': 'schipperke',
      'Briard': 'briard',
      'Bouvier des Flandres': 'Bouvier_des_Flandres',
      'Brabancon Griffon': 'Brabancon_griffon',
      'Leonberger': 'Leonberg',
      'Mexican Hairless': 'Mexican_hairless',
      'Groenendael': 'groenendael',
      'Malinois': 'malinois',

      // Wild/Rare breeds
      'African Hunting Dog': 'African_hunting_dog',
      'Dhole': 'dhole',
      'Dingo': 'dingo'
    };

    return mappings;
  }

  /**
   * Create reverse mappings from AI model names to Care Guides names
   */
  createReverseMappings() {
    const reverseMappings = {};
    
    Object.entries(this.careGuidesToAIModel).forEach(([careGuideName, aiModelName]) => {
      reverseMappings[aiModelName] = careGuideName;
    });

    // Add direct mappings from class indices that don't have Care Guides equivalents
    Object.entries(classIndices).forEach(([index, aiModelName]) => {
      if (!reverseMappings[aiModelName]) {
        reverseMappings[aiModelName] = this.normalizeAIModelName(aiModelName);
      }
    });

    return reverseMappings;
  }

  /**
   * Convert AI model breed name to readable format
   */
  normalizeAIModelName(aiModelName) {
    return aiModelName
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .trim();
  }

  /**
   * Get AI model breed name from Care Guides breed name
   */
  getAIModelName(careGuidesName) {
    if (!careGuidesName) return null;
    
    // Direct mapping first
    const directMapping = this.careGuidesToAIModel[careGuidesName];
    if (directMapping) return directMapping;
    
    // Try case-insensitive lookup
    const normalizedInput = careGuidesName.toLowerCase();
    for (const [cg, ai] of Object.entries(this.careGuidesToAIModel)) {
      if (cg.toLowerCase() === normalizedInput) {
        return ai;
      }
    }
    
    // Try partial matching
    for (const [cg, ai] of Object.entries(this.careGuidesToAIModel)) {
      if (cg.toLowerCase().includes(normalizedInput) || normalizedInput.includes(cg.toLowerCase())) {
        return ai;
      }
    }
    
    return null;
  }

  /**
   * Get Care Guides breed name from AI model breed name
   */
  getCareGuidesName(aiModelName) {
    if (!aiModelName) return null;
    
    const directMapping = this.aiModelToCareGuides[aiModelName];
    if (directMapping) return directMapping;
    
    // Fallback to normalized version
    return this.normalizeAIModelName(aiModelName);
  }

  /**
   * Get Dog CEO API format for a breed
   */
  getDogCeoFormat(breedName) {
    const aiModelName = this.getAIModelName(breedName) || breedName;
    
    // Special mappings for Dog CEO API structure
    const specialMappings = {
      'Yorkshire_terrier': 'terrier/yorkshire',
      'Boston_bull': 'terrier/boston',
      'Border_terrier': 'terrier/border',
      'Airedale': 'airedale',
      'beagle': 'beagle',
      'miniature_poodle': 'poodle/miniature',
      'standard_poodle': 'poodle/standard',
      'toy_poodle': 'poodle/toy',
      'Labrador_retriever': 'retriever/labrador',
      'golden_retriever': 'retriever/golden',
      'Border_collie': 'collie/border',
      'German_shepherd': 'germanshepherd',
      'French_bulldog': 'bulldog/french',
      'English_springer': 'spaniel/english',
      'cocker_spaniel': 'spaniel/cocker'
    };

    if (specialMappings[aiModelName]) {
      return specialMappings[aiModelName];
    }

    // Default conversion
    return aiModelName.toLowerCase().replace(/_/g, '').replace(/-/g, '');
  }

  /**
   * Validate breed name exists in AI model
   */
  isValidBreed(breedName) {
    const aiModelName = this.getAIModelName(breedName);
    return aiModelName && Object.values(classIndices).includes(aiModelName);
  }

  /**
   * Get all supported breeds
   */
  getAllSupportedBreeds() {
    return Object.keys(this.careGuidesToAIModel);
  }

  /**
   * Search for breeds by partial name
   */
  searchBreeds(query) {
    if (!query) return [];
    
    const normalizedQuery = query.toLowerCase();
    const results = [];
    
    // Search in Care Guides names
    Object.keys(this.careGuidesToAIModel).forEach(breedName => {
      if (breedName.toLowerCase().includes(normalizedQuery)) {
        results.push({
          careGuidesName: breedName,
          aiModelName: this.careGuidesToAIModel[breedName],
          matchType: 'exact'
        });
      }
    });
    
    // Search in AI model names
    Object.values(classIndices).forEach(aiModelName => {
      const normalized = this.normalizeAIModelName(aiModelName);
      if (normalized.toLowerCase().includes(normalizedQuery)) {
        const existing = results.find(r => r.aiModelName === aiModelName);
        if (!existing) {
          results.push({
            careGuidesName: this.getCareGuidesName(aiModelName),
            aiModelName: aiModelName,
            matchType: 'partial'
          });
        }
      }
    });
    
    return results.slice(0, 10); // Limit results
  }
}

// Create singleton instance
const breedNameMappingService = new BreedNameMappingService();

export default breedNameMappingService;