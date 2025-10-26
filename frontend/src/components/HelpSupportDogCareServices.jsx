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

// Service configuration optimized for Help & Support context
const SUPPORT_SERVICES = [
  {
    id: 'veterinarians',
    title: 'Find Certified Vets',
    description: 'Emergency and routine care near you',
    icon: Stethoscope,
    gradient: 'from-pink-400 to-red-500',
    searchQuery: {
      withLocation: 'veterinary+clinics+near+me',
      withoutLocation: '24+hour+veterinary+clinics'
    }
  },
  {
    id: 'adoption',
    title: 'Adoption Resources',
    description: 'Find rescue centers and shelters',
    icon: Heart,
    gradient: 'from-purple-500 to-blue-500',
    searchQuery: {
      withLocation: 'dog+adoption+centers+rescue+shelters+near+me',
      withoutLocation: 'dog+adoption+centers+rescue+organizations'
    }
  },
  {
    id: 'stores',
    title: 'Pet Supply Stores',
    description: 'Food, toys, and supplies nearby',
    icon: ShoppingBag,
    gradient: 'from-blue-500 to-cyan-400',
    searchQuery: {
      withLocation: 'pet+stores+dog+supplies+near+me',
      withoutLocation: 'pet+stores+dog+food+supplies'
    }
  },
  {
    id: 'shelters',
    title: 'Local Shelters',
    description: 'Support and rescue services',
    icon: Home,
    gradient: 'from-emerald-500 to-teal-500',
    searchQuery: {
      withLocation: 'animal+shelters+dog+rescue+near+me',
      withoutLocation: 'animal+shelters+humane+society'
    }
  }
];

// Service card component optimized for Help & Support page
const SupportServiceCard = ({ service, hasLocation, onServiceClick, isLoading }) => {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = service.icon;

  const handleClick = () => {
    onServiceClick(service);
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl bg-gradient-to-br ${service.gradient}
        p-5 transition-all duration-300 transform cursor-pointer
        ${isHovered ? 'scale-105 shadow-xl' : 'shadow-lg'}
        ${isLoading ? 'animate-pulse' : ''}
        border border-white border-opacity-20
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
      <div className="absolute inset-0 bg-black bg-opacity-10 backdrop-blur-sm"></div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Icon */}
        <div className="mb-3">
          <div className="w-10 h-10 bg-black bg-opacity-20 rounded-lg flex items-center justify-center">
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-white mb-2">
          {service.title}
        </h3>

        {/* Description */}
        <p className="text-white text-opacity-90 text-sm mb-4 flex-grow">
          {service.description}
        </p>

        {/* Button */}
        <button
          className={`
            w-full bg-black bg-opacity-30 hover:bg-opacity-40 
            text-white font-medium py-2.5 px-4 rounded-lg 
            transition-all duration-200 flex items-center justify-center gap-2
            focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50
            text-sm
          `}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              {hasLocation ? 'Find Nearby' : 'Search Nationally'}
              <ExternalLink className="w-3 h-3" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Location status component for Help & Support context
const SupportLocationStatus = ({ status, message }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'granted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'denied':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <MapPin className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'granted':
        return 'text-green-600';
      case 'denied':
        return 'text-amber-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="flex items-center gap-2 mb-6 px-4 py-2 bg-gray-50 rounded-lg">
      {getStatusIcon()}
      <span className={`text-sm font-medium ${getStatusColor()}`}>
        {message}
      </span>
    </div>
  );
};

// Main component optimized for Help & Support page
const HelpSupportDogCareServices = () => {
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
      { threshold: 0.3 }
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
      setStatusMessage('🔄 Searching nationwide - geolocation not available');
      return;
    }

    setLocationStatus('loading');
    setStatusMessage('🔍 Finding local dog care services...');

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
        setStatusMessage('✅ Location detected - Showing services near you');
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setHasLocation(false);
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationStatus('denied');
            setStatusMessage('⚠️ Enable location access for local results');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationStatus('error');
            setStatusMessage('🔄 Searching nationwide - location unavailable');
            break;
          case error.TIMEOUT:
            setLocationStatus('error');
            setStatusMessage('🔄 Searching nationwide - location request timed out');
            break;
          default:
            setLocationStatus('error');
            setStatusMessage('🔄 Searching nationwide - location unavailable');
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
      searchQuery = service.searchQuery.withLocation;
    } else {
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
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div ref={sectionRef}>
        {/* Header optimized for Help & Support context */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              🗺️ Find Local Dog Care Services
            </h2>
          </div>
          
          <p className="text-gray-600">
            Connect with nearby veterinarians, pet stores, and care facilities for immediate assistance with your dog's needs.
          </p>
        </div>

        {/* Location Status */}
        {locationStatus !== 'pending' && (
          <SupportLocationStatus status={locationStatus} message={statusMessage} />
        )}

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {SUPPORT_SERVICES.map((service, index) => (
            <div
              key={service.id}
              className="animate-fadeInUp"
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: 'both'
              }}
            >
              <SupportServiceCard
                service={service}
                hasLocation={hasLocation}
                onServiceClick={handleServiceClick}
                isLoading={loadingService === service.id}
              />
            </div>
          ))}
        </div>

        {/* Help Context Information */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Local Support Resources</h4>
              <p className="text-gray-600 text-sm">
                These services complement our digital support with real-world assistance. 
                For urgent pet emergencies, contact your nearest veterinary clinic immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSupportDogCareServices;