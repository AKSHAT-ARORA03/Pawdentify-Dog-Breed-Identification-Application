/**
 * Enhanced Breed Database for Care Guides
 * Comprehensive information for all 120+ dog breeds
 */

// Import existing breed details as base
import BREED_DETAILS from '../breedDetails.js'

// Enhanced breed information with comprehensive care data
export const ENHANCED_BREED_DATABASE = {
  // Use existing breed details and enhance them
  ...Object.keys(BREED_DETAILS).reduce((acc, breedName) => {
    const existing = BREED_DETAILS[breedName]
    
    acc[breedName] = {
      // Basic info from existing data
      name: breedName,
      size: existing.size || 'Medium',
      weight_range: existing.weight_range || 'Unknown',
      height_range: existing.height_range || 'Unknown',
      life_span: existing.life_span || '10-15 years',
      group: existing.group || 'Mixed',
      origin: existing.origin || 'Unknown',
      bred_for: existing.bred_for || 'Companionship',
      
      // Enhanced care sections
      overview: {
        size: existing.size || 'Medium',
        lifespan: existing.life_span || '10-15 years',
        energyLevel: existing.energy_level || 'Moderate',
        groomingNeeds: existing.grooming_needs || 'Moderate',
        trainingDifficulty: getTrainingDifficulty(existing.trainability),
        goodWithKids: existing.good_with_kids || 'Yes, with socialization',
        goodWithPets: existing.good_with_pets || 'Yes, with socialization',
        barkingTendency: existing.barking_tendency || 'Moderate',
        temperament: existing.temperament || ['Friendly', 'Loyal']
      },
      
      health: {
        commonIssues: getCommonHealthIssues(breedName, existing.size),
        preventiveCare: getPreventiveCare(existing.size),
        vaccination: getVaccinationSchedule(),
        lifespan: existing.life_span || '10-15 years',
        healthRating: getHealthRating(breedName)
      },
      
      nutrition: {
        dailyCalories: getDailyCalories(existing.size, existing.weight_range),
        feedingSchedule: getFeedingSchedule(existing.size),
        recommendations: getNutritionRecommendations(existing.size),
        avoid: getFoodsToAvoid(),
        specialDiet: getSpecialDietNeeds(breedName)
      },
      
      exercise: {
        dailyNeeds: existing.exercise_needs || getDailyExerciseNeeds(existing.energy_level),
        activities: getRecommendedActivities(existing.energy_level, existing.size),
        mentalStimulation: getMentalStimulationActivities(),
        puppyExercise: getPuppyExerciseGuidelines(existing.size),
        seniorExercise: getSeniorExerciseGuidelines()
      },
      
      grooming: {
        brushing: getGroomingFrequency(existing.coat_type, existing.grooming_needs),
        bathing: getBathingFrequency(existing.coat_type),
        nails: 'Trim every 2-3 weeks',
        ears: getEarCareInstructions(breedName),
        teeth: 'Brush 2-3 times per week',
        professional: getProfessionalGroomingNeeds(existing.grooming_needs),
        coatType: existing.coat_type || 'Short to medium',
        shedding: getSheddingLevel(existing.coat_type)
      },
      
      training: {
        difficulty: getTrainingDifficulty(existing.trainability),
        startAge: '8-12 weeks old',
        essentials: getEssentialTraining(),
        specialConsiderations: getTrainingConsiderations(breedName, existing.temperament),
        socialization: getSocializationNeeds(),
        commonChallenges: getTrainingChallenges(breedName, existing.temperament)
      },
      
      // Metadata for search and filtering
      searchTags: generateSearchTags(breedName, existing),
      popularity: getBreedPopularity(breedName),
      firstTimeOwner: getFirstTimeOwnerSuitability(existing),
      apartmentSuitable: getApartmentSuitability(existing.size, existing.energy_level)
    }
    
    return acc
  }, {})
}

// Helper functions to generate comprehensive care information

function getTrainingDifficulty(trainability) {
  if (!trainability) return 'Moderate'
  if (typeof trainability === 'string') {
    if (trainability.toLowerCase().includes('high') || trainability.toLowerCase().includes('very')) return 'Easy'
    if (trainability.toLowerCase().includes('low')) return 'Challenging'
  }
  return 'Moderate'
}

function getCommonHealthIssues(breedName, size) {
  const commonBySize = {
    'Small': ['Luxating patella', 'Dental issues', 'Tracheal collapse', 'Heart problems'],
    'Medium': ['Hip dysplasia', 'Allergies', 'Eye problems', 'Bloat'],
    'Large': ['Hip dysplasia', 'Elbow dysplasia', 'Bloat', 'Heart disease'],
    'Giant': ['Hip dysplasia', 'Bloat', 'Heart disease', 'Joint problems']
  }
  
  const breedSpecific = {
    'Golden Retriever': ['Hip dysplasia', 'Elbow dysplasia', 'Cancer', 'Heart disease'],
    'German Shepherd Dog': ['Hip dysplasia', 'Elbow dysplasia', 'Bloat', 'Degenerative myelopathy'],
    'Labrador Retriever': ['Hip dysplasia', 'Elbow dysplasia', 'Obesity', 'Eye problems'],
    'Bulldog': ['Breathing problems', 'Hip dysplasia', 'Cherry eye', 'Skin fold dermatitis']
  }
  
  return breedSpecific[breedName] || commonBySize[size] || commonBySize['Medium']
}

function getPreventiveCare(size) {
  return [
    'Regular veterinary check-ups (annually for adults, bi-annually for seniors)',
    'Maintain healthy weight through proper diet and exercise',
    'Regular dental care and cleanings',
    'Parasite prevention (fleas, ticks, heartworm)',
    'Up-to-date vaccinations',
    'Regular grooming and skin checks',
    'Joint health monitoring' + (size === 'Large' || size === 'Giant' ? ' (especially important for large breeds)' : '')
  ]
}

function getVaccinationSchedule() {
  return [
    'DHPP (Distemper, Hepatitis, Parvovirus, Parainfluenza) - Core vaccine',
    'Rabies - Core vaccine (required by law)',
    'Bordetella (Kennel Cough) - Non-core, recommended for social dogs',
    'Lyme Disease - Non-core, recommended in endemic areas',
    'Leptospirosis - Non-core, discuss with vet based on risk factors'
  ]
}

function getDailyCalories(size, weightRange) {
  if (weightRange && weightRange.includes('lbs')) {
    const weight = parseInt(weightRange.split('-')[0])
    if (weight < 20) return '300-600 calories'
    if (weight < 50) return '600-1,200 calories'
    if (weight < 70) return '1,200-1,800 calories'
    return '1,800-2,400 calories'
  }
  
  const caloriesBySize = {
    'Small': '300-600 calories',
    'Medium': '600-1,200 calories',
    'Large': '1,200-1,800 calories',
    'Giant': '1,800-2,400 calories'
  }
  
  return caloriesBySize[size] || '600-1,200 calories'
}

function getFeedingSchedule(size) {
  if (size === 'Small') return '3-4 small meals per day'
  if (size === 'Large' || size === 'Giant') return '2 meals per day (prevents bloat)'
  return '2-3 meals per day'
}

function getNutritionRecommendations(size) {
  const base = [
    'High-quality protein as first ingredient (22-26% for adults)',
    'Appropriate fat content (12-16% for most dogs)',
    'Life-stage appropriate formula (puppy, adult, senior)',
    'Fresh water available at all times',
    'Avoid overfeeding and maintain healthy weight'
  ]
  
  if (size === 'Large' || size === 'Giant') {
    base.push('Large breed formula for puppies (controlled calcium/phosphorus)')
    base.push('Glucosamine and chondroitin for joint health')
  }
  
  return base
}

function getFoodsToAvoid() {
  return [
    'Chocolate (toxic)',
    'Grapes and raisins (toxic)',
    'Onions and garlic (toxic)',
    'Xylitol (artificial sweetener - toxic)',
    'Avocado (can cause stomach upset)',
    'Alcohol (toxic)',
    'Caffeine (toxic)',
    'Macadamia nuts (toxic)',
    'Cooked bones (choking hazard)',
    'High-fat foods (can cause pancreatitis)'
  ]
}

function getDailyExerciseNeeds(energyLevel) {
  const exerciseByEnergy = {
    'Low': '20-30 minutes of gentle exercise',
    'Moderate': '30-60 minutes of moderate exercise',
    'High': '60-90 minutes of vigorous exercise',
    'Very High': '90+ minutes of intense exercise'
  }
  
  return exerciseByEnergy[energyLevel] || '30-60 minutes of moderate exercise'
}

function getRecommendedActivities(energyLevel, size) {
  const baseActivities = ['Daily walks', 'Play time', 'Interactive toys']
  
  if (energyLevel === 'High' || energyLevel === 'Very High') {
    baseActivities.push('Running', 'Hiking', 'Fetch games', 'Agility training', 'Dog sports')
  }
  
  if (size === 'Small') {
    baseActivities.push('Indoor play', 'Short walks', 'Puzzle games')
  } else if (size === 'Large' || size === 'Giant') {
    baseActivities.push('Swimming (excellent low-impact exercise)', 'Long hikes', 'Backyard play')
  }
  
  return baseActivities
}

function getMentalStimulationActivities() {
  return [
    'Puzzle toys and treat-dispensing toys',
    'Training sessions (5-15 minutes multiple times daily)',
    'Scent work and nose games',
    'Hide and seek games',
    'Interactive feeding (slow feeders, snuffle mats)',
    'Rotating toys to maintain interest',
    'New environments and experiences'
  ]
}

function getGroomingFrequency(coatType, groomingNeeds) {
  if (!coatType) return 'Weekly brushing'
  
  if (coatType.toLowerCase().includes('long') || coatType.toLowerCase().includes('thick')) {
    return 'Daily brushing to prevent matting'
  }
  if (coatType.toLowerCase().includes('curly') || coatType.toLowerCase().includes('wire')) {
    return '2-3 times per week'
  }
  if (coatType.toLowerCase().includes('short')) {
    return 'Weekly brushing'
  }
  
  return 'Weekly to bi-weekly brushing'
}

function getBathingFrequency(coatType) {
  if (coatType && coatType.toLowerCase().includes('oil')) {
    return 'Every 2-3 weeks'
  }
  return 'Every 6-8 weeks or as needed'
}

function getEarCareInstructions(breedName) {
  const floppyEarBreeds = ['Golden Retriever', 'Labrador Retriever', 'Cocker Spaniel', 'Basset Hound']
  
  if (floppyEarBreeds.some(breed => breedName.includes(breed))) {
    return 'Clean weekly to prevent infections (floppy ears trap moisture)'
  }
  
  return 'Clean bi-weekly or as needed'
}

function getProfessionalGroomingNeeds(groomingNeeds) {
  if (!groomingNeeds) return 'Every 6-12 weeks'
  
  if (groomingNeeds.toLowerCase().includes('high')) {
    return 'Every 4-6 weeks'
  }
  if (groomingNeeds.toLowerCase().includes('low')) {
    return 'Every 12-16 weeks or as needed'
  }
  
  return 'Every 6-8 weeks'
}

function getEssentialTraining() {
  return [
    'House training/potty training',
    'Basic commands (sit, stay, come, down)',
    'Leash training',
    'Crate training',
    'Socialization with people and other dogs',
    'Bite inhibition',
    'Name recognition',
    'Boundaries and rules'
  ]
}

function generateSearchTags(breedName, existing) {
  const tags = [
    breedName.toLowerCase(),
    existing.size?.toLowerCase(),
    existing.group?.toLowerCase(),
    existing.origin?.toLowerCase(),
    ...(existing.temperament || []).map(t => t.toLowerCase()),
    ...(existing.colors || []).map(c => c.toLowerCase())
  ].filter(Boolean)
  
  // Add alternate names and common nicknames
  const nicknames = {
    'German Shepherd Dog': ['german shepherd', 'gsd', 'alsatian'],
    'Labrador Retriever': ['lab', 'labrador'],
    'Golden Retriever': ['golden', 'goldie'],
    'Yorkshire Terrier': ['yorkie', 'york']
  }
  
  if (nicknames[breedName]) {
    tags.push(...nicknames[breedName])
  }
  
  return [...new Set(tags)] // Remove duplicates
}

function getBreedPopularity(breedName) {
  // Simplified popularity ranking (1-5 stars)
  const popular = ['Labrador Retriever', 'Golden Retriever', 'German Shepherd Dog', 'French Bulldog', 'Bulldog']
  const common = ['Beagle', 'Poodle', 'Rottweiler', 'Yorkshire Terrier', 'Dachshund']
  
  if (popular.includes(breedName)) return 5
  if (common.includes(breedName)) return 4
  return 3
}

function getFirstTimeOwnerSuitability(existing) {
  const trainability = existing.trainability?.toLowerCase() || ''
  const energy = existing.energy_level?.toLowerCase() || ''
  
  if (trainability.includes('high') && !energy.includes('very high')) return 'Good'
  if (trainability.includes('low') || energy.includes('very high')) return 'Challenging'
  return 'Moderate'
}

function getApartmentSuitability(size, energyLevel) {
  if (size === 'Small' || size === 'Medium') return 'Good'
  if ((size === 'Large' || size === 'Giant') && energyLevel === 'Low') return 'Possible'
  return 'Not Recommended'
}

function getHealthRating(breedName) {
  // Simplified health rating (1-5 stars)
  const healthyBreeds = ['Border Collie', 'Australian Cattle Dog', 'Belgian Malinois']
  const moderateBreeds = ['Labrador Retriever', 'Golden Retriever', 'German Shepherd Dog']
  const concernBreeds = ['Bulldog', 'French Bulldog', 'Pug', 'Boston Terrier']
  
  if (healthyBreeds.includes(breedName)) return 5
  if (moderateBreeds.includes(breedName)) return 4
  if (concernBreeds.includes(breedName)) return 2
  return 3
}

function getSpecialDietNeeds(breedName) {
  const specialNeeds = {
    'German Shepherd Dog': 'May benefit from sensitive stomach formulas',
    'Dalmatian': 'Low-purine diet recommended',
    'Great Dane': 'Adult food from 18-24 months to prevent bloat',
    'Bulldog': 'Weight management crucial for breathing'
  }
  
  return specialNeeds[breedName] || null
}

function getPuppyExerciseGuidelines(size) {
  return `5 minutes per month of age, twice daily until fully grown (${
    size === 'Large' || size === 'Giant' ? '18-24 months' : '12-18 months'
  })`
}

function getSeniorExerciseGuidelines() {
  return 'Gentler, shorter sessions. Swimming and short walks. Monitor for joint stiffness and adjust accordingly.'
}

function getSheddingLevel(coatType) {
  if (!coatType) return 'Moderate'
  
  if (coatType.toLowerCase().includes('double')) return 'High'
  if (coatType.toLowerCase().includes('curly') || coatType.toLowerCase().includes('poodle')) return 'Low'
  if (coatType.toLowerCase().includes('short')) return 'Moderate'
  return 'Moderate to High'
}

function getTrainingConsiderations(breedName, temperament) {
  const considerations = []
  
  if (temperament?.includes('Independent')) {
    considerations.push('May require patience due to independent nature')
  }
  if (temperament?.includes('Stubborn')) {
    considerations.push('Consistency and positive reinforcement essential')
  }
  if (temperament?.includes('Protective')) {
    considerations.push('Early socialization crucial to prevent overprotectiveness')
  }
  if (breedName.includes('Terrier')) {
    considerations.push('High prey drive - leash training important')
  }
  
  return considerations.length > 0 ? considerations : ['Standard training approaches work well']
}

function getTrainingChallenges(breedName, temperament) {
  if (breedName.includes('Hound')) {
    return ['Strong scent drive may cause distractions', 'Recall training requires extra patience']
  }
  if (breedName.includes('Terrier')) {
    return ['High prey drive', 'May be dog-selective', 'Strong-willed nature']
  }
  if (temperament?.includes('Independent')) {
    return ['May not always come when called', 'Requires motivation-based training']
  }
  
  return ['Standard training challenges for most dogs']
}

function getSocializationNeeds() {
  return [
    'Early exposure to various people, animals, and environments (critical period: 3-14 weeks)',
    'Positive experiences with children, adults, and seniors',
    'Meeting other dogs in controlled settings',
    'Exposure to different sounds, surfaces, and situations',
    'Regular outings to new places throughout life',
    'Ongoing socialization to maintain social skills'
  ]
}

export default ENHANCED_BREED_DATABASE