import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Stethoscope, 
  Heart, 
  ShoppingBag, 
  Home, 
  CheckCircle, 
  AlertTriangle, 
  Loader2,
  ExternalLink 
} from 'lucide-react';

// Service configuration with Google Maps integration
const SERVICES = [
  {
    id: 'veterinarians',
    title: 'Find Veterinarians',
    description: 'Locate certified vets near your location',
    icon: Stethoscope,
    gradient: 'from-pink-400 to-red-500',
    searchQuery: {
      withLocation: 'veterinary+clinics+near+me',
      withoutLocation: '24+hour+veterinary+clinics'
    }
  },
  {
    id: 'adoption',
    title: 'Adoption Centers',
    description: 'Find your perfect companion nearby',
    icon: Heart,
    gradient: 'from-purple-500 to-blue-500',
    searchQuery: {
      withLocation: 'dog+adoption+centers+rescue+shelters+near+me',
      withoutLocation: 'dog+adoption+centers+rescue+organizations'
    }
  },
  {
    id: 'stores',
    title: 'Pet Stores',
    description: 'Food, toys, and supplies near you',
    icon: ShoppingBag,
    gradient: 'from-blue-500 to-cyan-400',
    searchQuery: {
      withLocation: 'pet+stores+dog+supplies+near+me',
      withoutLocation: 'pet+stores+dog+food+supplies'
    }
  },
  {
    id: 'shelters',
    title: 'Animal Shelters',
    description: 'Support and rescue services',
    icon: Home,
    gradient: 'from-emerald-500 to-teal-500',
    searchQuery: {
      withLocation: 'animal+shelters+dog+rescue+near+me',
      withoutLocation: 'animal+shelters+humane+society'
    }
  }
];

// Service card component
const ServiceCard = ({ service, hasLocation, onServiceClick, isLoading }) => {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = service.icon;

  const handleClick = () => {
    onServiceClick(service);
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl bg-gradient-to-br ${service.gradient}
        p-6 transition-all duration-300 transform cursor-pointer
        ${isHovered ? 'scale-105 shadow-2xl' : 'shadow-lg'}
        ${isLoading ? 'animate-pulse' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`Search for ${service.title}`}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 bg-black bg-opacity-10"></div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Icon */}
        <div className="mb-4">
          <div className="w-12 h-12 bg-black bg-opacity-20 rounded-lg flex items-center justify-center">
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-white mb-2">
          {service.title}
        </h3>

        {/* Description */}
        <p className="text-white text-opacity-90 text-sm mb-6 flex-grow">
          {service.description}
        </p>

        {/* Button */}
        <button
          className={`
            w-full bg-black bg-opacity-30 hover:bg-opacity-40 
            text-white font-medium py-3 px-4 rounded-lg 
            transition-all duration-200 flex items-center justify-center gap-2
            focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50
          `}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              {hasLocation ? 'Search Nearby' : 'Search Nationally'}
              <ExternalLink className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Location status component
const LocationStatus = ({ status, message }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-5 h-5 animate-spin text-yellow-400" />;
      case 'granted':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'denied':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      default:
        return <MapPin className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'granted':
        return 'text-green-400';
      case 'denied':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="flex items-center gap-2 mb-8">
      {getStatusIcon()}
      <span className={`text-sm ${getStatusColor()}`}>
        {message}
      </span>
    </div>
  );
};

// Main component
const LocationAwareDogCareServices = () => {
  const [locationStatus, setLocationStatus] = useState('pending');
  const [statusMessage, setStatusMessage] = useState('');
  const [hasLocation, setHasLocation] = useState(false);
  const [coordinates, setCoordinates] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [loadingService, setLoadingService] = useState(null);
  
  const sectionRef = useRef(null);

  // Intersection Observer for triggering geolocation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          requestLocationPermission();
        }
      },
      { threshold: 0.5 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  // Request location permission
  const requestLocationPermission = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setStatusMessage('Geolocation is not supported by this browser');
      return;
    }

    setLocationStatus('loading');
    setStatusMessage('Finding dog care services in your area...');

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setHasLocation(true);
        setLocationStatus('granted');
        setStatusMessage('Location detected - Showing services near you');
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setHasLocation(false);
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationStatus('denied');
            setStatusMessage('Location access will help us show services near you');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationStatus('error');
            setStatusMessage('Having trouble finding your location - searching nationwide');
            break;
          case error.TIMEOUT:
            setLocationStatus('error');
            setStatusMessage('Location request timed out - searching nationwide');
            break;
          default:
            setLocationStatus('error');
            setStatusMessage('Unable to get location - searching nationwide');
        }
      },
      options
    );
  };

  // Handle service click and redirect to Google Maps
  const handleServiceClick = (service) => {
    setLoadingService(service.id);

    // Build Google Maps URL
    const baseUrl = 'https://www.google.com/maps/search/';
    let searchQuery;

    if (hasLocation && coordinates) {
      // Use location-aware search
      searchQuery = service.searchQuery.withLocation;
      // Note: Google Maps will use browser location automatically when available
    } else {
      // Use general search
      searchQuery = service.searchQuery.withoutLocation;
    }

    const mapsUrl = `${baseUrl}${encodeURIComponent(searchQuery)}`;

    // Add a small delay for user feedback
    setTimeout(() => {
      window.open(mapsUrl, '_blank', 'noopener,noreferrer');
      setLoadingService(null);
    }, 500);
  };

  return (
    <section 
      ref={sectionRef}
      className="w-full bg-gray-800 rounded-2xl p-8 my-8"
      role="region"
      aria-labelledby="dog-care-services-title"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-pink-500 rounded-xl flex items-center justify-center">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <h2 
            id="dog-care-services-title"
            className="text-3xl font-bold text-white"
          >
            Dog Care Services Near You
          </h2>
        </div>
        
        <p className="text-gray-300 text-lg">
          Questions about your dog's breed or health? We're here to help with expert guidance and resources.
        </p>
      </div>

      {/* Location Status */}
      {locationStatus !== 'pending' && (
        <LocationStatus status={locationStatus} message={statusMessage} />
      )}

      {/* Emergency Helpline Banner */}
      <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black bg-opacity-20 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Pet Emergency Helpline</h3>
              <p className="text-white text-opacity-90">24/7 support for urgent pet care situations</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">1962</div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SERVICES.map((service, index) => (
          <div
            key={service.id}
            className="animate-fadeInUp"
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'both'
            }}
          >
            <ServiceCard
              service={service}
              hasLocation={hasLocation}
              onServiceClick={handleServiceClick}
              isLoading={loadingService === service.id}
            />
          </div>
        ))}
      </div>

      {/* Information Resources */}
      <div className="mt-8 bg-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" />
          </div>
          Breed Information Resources
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-purple-600 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">🏆 AKC Breeds</h4>
            <p className="text-white text-opacity-90 text-sm">Official breed standards</p>
          </div>
          <div className="bg-blue-600 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">🎓 Training Tips</h4>
            <p className="text-white text-opacity-90 text-sm">Expert training guides</p>
          </div>
          <div className="bg-red-600 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">💊 Health Guide</h4>
            <p className="text-white text-opacity-90 text-sm">Dog health information</p>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className="mt-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-white flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-white mb-1">⚠️ Important Notice</h4>
            <p className="text-white text-opacity-90 text-sm">
              This tool provides breed predictions based on visual characteristics. For accurate identification and health concerns,
              always consult with a licensed veterinarian or certified dog breed expert.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Message */}
      <div className="mt-6 text-center">
        <p className="text-gray-400 text-sm">
          🐕 Your dog's health and happiness are our priority. We're dedicated to providing accurate breed 
          information and connecting you with the best care resources.
        </p>
        <p className="text-blue-400 text-sm mt-2">
          💡 Remember: Always consult with a licensed veterinarian for medical advice!
        </p>
      </div>
    </section>
  );
};

export default LocationAwareDogCareServices;