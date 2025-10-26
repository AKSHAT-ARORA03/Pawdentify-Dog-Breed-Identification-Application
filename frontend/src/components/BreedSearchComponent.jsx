import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  X, 
  Clock, 
  Star, 
  Filter,
  ChevronDown,
  Dog,
  Heart,
  TrendingUp
} from 'lucide-react'
import { ENHANCED_BREED_DATABASE } from '../data/enhancedBreedDatabase'

export default function BreedSearchComponent({ 
  onBreedSelect, 
  onSearchHistory,
  placeholder = "Search for dog breeds...",
  showFilters = true,
  showRecentSearches = true
}) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [recentSearches, setRecentSearches] = useState([])
  const [popularBreeds, setPopularBreeds] = useState([])
  const [filters, setFilters] = useState({
    size: 'all',
    energyLevel: 'all',
    goodWithKids: 'all',
    groomingNeeds: 'all',
    trainingDifficulty: 'all'
  })
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  
  const searchRef = useRef(null)
  const dropdownRef = useRef(null)

  // Initialize popular breeds and recent searches
  useEffect(() => {
    const breeds = Object.values(ENHANCED_BREED_DATABASE)
    const popular = breeds
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 6)
    setPopularBreeds(popular)

    // Load recent searches from localStorage
    const recent = JSON.parse(localStorage.getItem('pawdentify_recent_searches') || '[]')
    setRecentSearches(recent.slice(0, 5))
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setShowFilterDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fuzzy search implementation
  const fuzzySearch = (breeds, searchQuery) => {
    if (!searchQuery) return []

    const query = searchQuery.toLowerCase().trim()
    const results = []

    breeds.forEach(breed => {
      let score = 0
      const name = breed.name.toLowerCase()
      const tags = breed.searchTags || []

      // Exact match gets highest score
      if (name === query) {
        score = 1000
      }
      // Starts with query gets high score
      else if (name.startsWith(query)) {
        score = 900
      }
      // Contains query gets medium score
      else if (name.includes(query)) {
        score = 800
      }
      // Tag matches get lower score
      else if (tags.some(tag => tag.includes(query))) {
        score = 700
      }
      // Fuzzy character matching
      else {
        const fuzzyScore = calculateFuzzyScore(name, query)
        if (fuzzyScore > 0.6) {
          score = fuzzyScore * 600
        }
      }

      // Apply filter scoring
      if (score > 0) {
        const filterScore = calculateFilterScore(breed)
        score = score * filterScore

        results.push({
          ...breed,
          searchScore: score,
          matchedField: getMatchedField(breed, query)
        })
      }
    })

    return results
      .sort((a, b) => b.searchScore - a.searchScore)
      .slice(0, 8)
  }

  const calculateFuzzyScore = (text, query) => {
    let textIndex = 0
    let queryIndex = 0
    let matches = 0

    while (textIndex < text.length && queryIndex < query.length) {
      if (text[textIndex] === query[queryIndex]) {
        matches++
        queryIndex++
      }
      textIndex++
    }

    return matches / query.length
  }

  const calculateFilterScore = (breed) => {
    let score = 1
    
    if (filters.size !== 'all' && breed.overview?.size?.toLowerCase() !== filters.size) {
      score *= 0.5
    }
    if (filters.energyLevel !== 'all' && breed.overview?.energyLevel?.toLowerCase() !== filters.energyLevel) {
      score *= 0.5
    }
    if (filters.goodWithKids !== 'all') {
      const goodWithKids = breed.overview?.goodWithKids?.toLowerCase().includes('yes')
      if ((filters.goodWithKids === 'yes') !== goodWithKids) {
        score *= 0.3
      }
    }
    if (filters.groomingNeeds !== 'all' && breed.overview?.groomingNeeds?.toLowerCase() !== filters.groomingNeeds) {
      score *= 0.5
    }
    if (filters.trainingDifficulty !== 'all' && breed.training?.difficulty?.toLowerCase() !== filters.trainingDifficulty) {
      score *= 0.5
    }

    return score
  }

  const getMatchedField = (breed, query) => {
    const name = breed.name.toLowerCase()
    const tags = breed.searchTags || []
    
    if (name.includes(query)) return 'name'
    if (tags.some(tag => tag.includes(query))) return 'characteristics'
    return 'fuzzy'
  }

  // Handle search input changes
  useEffect(() => {
    if (query.length >= 2) {
      const breeds = Object.values(ENHANCED_BREED_DATABASE)
      const results = fuzzySearch(breeds, query)
      setSuggestions(results)
      setIsOpen(true)
      setSelectedIndex(-1)
    } else {
      setSuggestions([])
      setIsOpen(query.length > 0)
    }
  }, [query, filters])

  const handleInputChange = (e) => {
    setQuery(e.target.value)
  }

  const handleKeyDown = (e) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          selectBreed(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        break
    }
  }

  const selectBreed = (breed) => {
    setQuery(breed.name)
    setIsOpen(false)
    setSelectedIndex(-1)
    
    // Add to recent searches
    const recent = [breed.name, ...recentSearches.filter(r => r !== breed.name)].slice(0, 5)
    setRecentSearches(recent)
    localStorage.setItem('pawdentify_recent_searches', JSON.stringify(recent))
    
    // Call callbacks
    if (onBreedSelect) onBreedSelect(breed)
    if (onSearchHistory) onSearchHistory(breed.name, query)
  }

  const selectRecentSearch = (breedName) => {
    const breed = Object.values(ENHANCED_BREED_DATABASE).find(b => b.name === breedName)
    if (breed) {
      selectBreed(breed)
    }
  }

  const clearSearch = () => {
    setQuery('')
    setSuggestions([])
    setIsOpen(false)
    searchRef.current?.focus()
  }

  const toggleFilter = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType] === value ? 'all' : value
    }))
  }

  const hasActiveFilters = Object.values(filters).some(f => f !== 'all')

  return (
    <div className="relative w-full max-w-2xl mx-auto" ref={dropdownRef}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={searchRef}
          type="text"
          className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg text-gray-900 dark:text-gray-900"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
        />
        
        {/* Clear button */}
        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mt-3 flex items-center space-x-2">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className={`flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              hasActiveFilters 
                ? 'bg-primary-100 text-primary-700 border border-primary-300' 
                : 'bg-gray-100 text-gray-700 border border-gray-300'
            }`}
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 bg-primary-500 text-white rounded-full px-1.5 py-0.5 text-xs">
                {Object.values(filters).filter(f => f !== 'all').length}
              </span>
            )}
            <ChevronDown className="h-4 w-4 ml-1" />
          </button>
        </div>
      )}

      {/* Filter Dropdown */}
      <AnimatePresence>
        {showFilterDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-4"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* Size Filter */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Size</label>
                <div className="space-y-1">
                  {['Small', 'Medium', 'Large'].map(size => (
                    <button
                      key={size}
                      onClick={() => toggleFilter('size', size.toLowerCase())}
                      className={`block w-full text-left px-2 py-1 text-sm rounded ${
                        filters.size === size.toLowerCase()
                          ? 'bg-primary-100 text-primary-700'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Energy Level Filter */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Energy</label>
                <div className="space-y-1">
                  {['Low', 'Moderate', 'High'].map(level => (
                    <button
                      key={level}
                      onClick={() => toggleFilter('energyLevel', level.toLowerCase())}
                      className={`block w-full text-left px-2 py-1 text-sm rounded ${
                        filters.energyLevel === level.toLowerCase()
                          ? 'bg-primary-100 text-primary-700'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Good with Kids */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">With Kids</label>
                <div className="space-y-1">
                  <button
                    onClick={() => toggleFilter('goodWithKids', 'yes')}
                    className={`block w-full text-left px-2 py-1 text-sm rounded ${
                      filters.goodWithKids === 'yes'
                        ? 'bg-primary-100 text-primary-700'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    Good with Kids
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-96 overflow-y-auto z-40"
          >
            {/* Recent Searches */}
            {query.length === 0 && showRecentSearches && recentSearches.length > 0 && (
              <div className="p-4 border-b border-gray-100">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Recent Searches
                </h4>
                <div className="space-y-1">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => selectRecentSearch(search)}
                      className="block w-full text-left px-2 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Breeds */}
            {query.length === 0 && popularBreeds.length > 0 && (
              <div className="p-4 border-b border-gray-100">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Popular Breeds
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {popularBreeds.map((breed, index) => (
                    <button
                      key={index}
                      onClick={() => selectBreed(breed)}
                      className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                    >
                      <Dog className="h-4 w-4 mr-2 text-gray-400" />
                      {breed.name}
                      <div className="ml-auto flex">
                        {[...Array(breed.popularity || 3)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            {suggestions.length > 0 && (
              <div className="p-2">
                {suggestions.map((breed, index) => (
                  <button
                    key={index}
                    onClick={() => selectBreed(breed)}
                    className={`w-full flex items-center px-3 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors ${
                      selectedIndex === index ? 'bg-primary-50' : ''
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="font-medium text-gray-900">{breed.name}</h4>
                        <span className="ml-2 text-xs text-gray-500">
                          {breed.overview?.size} • {breed.group}
                        </span>
                      </div>
                      <div className="flex items-center mt-1 space-x-3 text-xs text-gray-500">
                        <span>Energy: {breed.overview?.energyLevel}</span>
                        <span>Training: {breed.training?.difficulty}</span>
                        {breed.overview?.goodWithKids?.includes('Yes') && (
                          <span className="text-green-600">Good with kids</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center">
                      {breed.popularity && (
                        <div className="flex mr-2">
                          {[...Array(breed.popularity)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                          ))}
                        </div>
                      )}
                      <Heart className="h-4 w-4 text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* No Results */}
            {query.length >= 2 && suggestions.length === 0 && (
              <div className="p-4 text-center">
                <Dog className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-600">No breeds found for "{query}"</p>
                <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}