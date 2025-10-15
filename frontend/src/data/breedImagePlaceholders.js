/**
 * Placeholder Image Data for Development
 * This file provides fallback image URLs for testing until real breed images are added
 */

// Using Lorem Picsum service for consistent placeholder images
const generateBreedImageUrl = (breedName, imageNumber = 1, width = 800, height = 600) => {
  // Create a consistent seed based on breed name and image number
  const seed = Math.abs(
    (breedName + imageNumber).split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
  ) % 1000

  return `https://picsum.photos/${width}/${height}?random=${seed}`
}

// Popular dog breed placeholder mappings
export const BREED_IMAGE_PLACEHOLDERS = {
  'Labrador Retriever': {
    hero: generateBreedImageUrl('Labrador Retriever', 1, 1200, 800),
    gallery: Array.from({ length: 8 }, (_, i) => ({
      id: `labrador-${i + 1}`,
      url: generateBreedImageUrl('Labrador Retriever', i + 1, 800, 600),
      thumbnail: generateBreedImageUrl('Labrador Retriever', i + 1, 300, 200),
      alt: `Labrador Retriever ${i + 1}`,
      caption: `Beautiful Labrador Retriever`,
      source: 'placeholder'
    }))
  },
  'Golden Retriever': {
    hero: generateBreedImageUrl('Golden Retriever', 1, 1200, 800),
    gallery: Array.from({ length: 8 }, (_, i) => ({
      id: `golden-${i + 1}`,
      url: generateBreedImageUrl('Golden Retriever', i + 1, 800, 600),
      thumbnail: generateBreedImageUrl('Golden Retriever', i + 1, 300, 200),
      alt: `Golden Retriever ${i + 1}`,
      caption: `Beautiful Golden Retriever`,
      source: 'placeholder'
    }))
  },
  'German Shepherd': {
    hero: generateBreedImageUrl('German Shepherd', 1, 1200, 800),
    gallery: Array.from({ length: 8 }, (_, i) => ({
      id: `german-shepherd-${i + 1}`,
      url: generateBreedImageUrl('German Shepherd', i + 1, 800, 600),
      thumbnail: generateBreedImageUrl('German Shepherd', i + 1, 300, 200),
      alt: `German Shepherd ${i + 1}`,
      caption: `Beautiful German Shepherd`,
      source: 'placeholder'
    }))
  },
  'Bulldog': {
    hero: generateBreedImageUrl('Bulldog', 1, 1200, 800),
    gallery: Array.from({ length: 8 }, (_, i) => ({
      id: `bulldog-${i + 1}`,
      url: generateBreedImageUrl('Bulldog', i + 1, 800, 600),
      thumbnail: generateBreedImageUrl('Bulldog', i + 1, 300, 200),
      alt: `Bulldog ${i + 1}`,
      caption: `Beautiful Bulldog`,
      source: 'placeholder'
    }))
  },
  'Poodle': {
    hero: generateBreedImageUrl('Poodle', 1, 1200, 800),
    gallery: Array.from({ length: 8 }, (_, i) => ({
      id: `poodle-${i + 1}`,
      url: generateBreedImageUrl('Poodle', i + 1, 800, 600),
      thumbnail: generateBreedImageUrl('Poodle', i + 1, 300, 200),
      alt: `Poodle ${i + 1}`,
      caption: `Beautiful Poodle`,
      source: 'placeholder'
    }))
  },
  'Beagle': {
    hero: generateBreedImageUrl('Beagle', 1, 1200, 800),
    gallery: Array.from({ length: 8 }, (_, i) => ({
      id: `beagle-${i + 1}`,
      url: generateBreedImageUrl('Beagle', i + 1, 800, 600),
      thumbnail: generateBreedImageUrl('Beagle', i + 1, 300, 200),
      alt: `Beagle ${i + 1}`,
      caption: `Beautiful Beagle`,
      source: 'placeholder'
    }))
  },
  'Rottweiler': {
    hero: generateBreedImageUrl('Rottweiler', 1, 1200, 800),
    gallery: Array.from({ length: 8 }, (_, i) => ({
      id: `rottweiler-${i + 1}`,
      url: generateBreedImageUrl('Rottweiler', i + 1, 800, 600),
      thumbnail: generateBreedImageUrl('Rottweiler', i + 1, 300, 200),
      alt: `Rottweiler ${i + 1}`,
      caption: `Beautiful Rottweiler`,
      source: 'placeholder'
    }))
  },
  'Yorkshire Terrier': {
    hero: generateBreedImageUrl('Yorkshire Terrier', 1, 1200, 800),
    gallery: Array.from({ length: 8 }, (_, i) => ({
      id: `yorkie-${i + 1}`,
      url: generateBreedImageUrl('Yorkshire Terrier', i + 1, 800, 600),
      thumbnail: generateBreedImageUrl('Yorkshire Terrier', i + 1, 300, 200),
      alt: `Yorkshire Terrier ${i + 1}`,
      caption: `Beautiful Yorkshire Terrier`,
      source: 'placeholder'
    }))
  }
}

// Default fallback image
export const DEFAULT_DOG_IMAGE = {
  url: 'https://picsum.photos/800/600?random=999',
  thumbnail: 'https://picsum.photos/300/200?random=999',
  alt: 'Dog placeholder',
  caption: 'Beautiful dog',
  source: 'placeholder'
}

export default BREED_IMAGE_PLACEHOLDERS