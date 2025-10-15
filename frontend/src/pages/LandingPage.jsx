import React from 'react'
import { SignUpButton } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Camera, 
  Zap, 
  Shield, 
  Users, 
  Star, 
  CheckCircle, 
  ArrowRight,
  Brain,
  Heart,
  Award,
  LogIn,
  UserPlus
} from 'lucide-react'
import { useAuthContext } from '../auth/AuthContext'
import puppyHero from '../assets/puppy-hero.jpg'
import puppyHeroBackup from '../assets/pexels-chevanon-1108099.jpg'

export default function LandingPage() {
  const { isSignedIn, signIn } = useAuthContext()

  // Check if we're using fallback auth (demo mode)
  const isFallbackAuth = signIn !== undefined

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Recognition',
      description: 'Advanced machine learning identifies over 120 dog breeds with 95%+ accuracy'
    },
    {
      icon: Zap,
      title: 'Instant Results',
      description: 'Get breed identification in seconds with detailed characteristics and care tips'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your photos are processed securely and never stored without permission'
    },
    {
      icon: Heart,
      title: 'Comprehensive Insights',
      description: 'Learn about temperament, health, exercise needs, and care requirements'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Dog Rescuer',
      content: 'Pawdentify has been incredible for identifying rescue dogs. The accuracy is amazing!',
      rating: 5
    },
    {
      name: 'Mike Chen',
      role: 'Veterinarian',
      content: 'I recommend this to all my clients. Great for understanding breed-specific health needs.',
      rating: 5
    },
    {
      name: 'Emma Williams',
      role: 'Dog Owner',
      content: 'Finally found out what breeds my rescue pup is! The detailed information is so helpful.',
      rating: 5
    }
  ]

  const stats = [
    { value: '500K+', label: 'Dogs Identified' },
    { value: '120+', label: 'Breeds Recognized' },
    { value: '95%+', label: 'Accuracy Rate' },
    { value: '50K+', label: 'Happy Users' }
  ]

  const renderCTAButton = (primary = true) => {
    if (isSignedIn) {
      return (
        <Link
          to="/scan"
          className={`inline-flex items-center justify-center px-8 py-4 ${
            primary 
              ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white' 
              : 'bg-white text-primary-600'
          } font-semibold rounded-xl hover:shadow-lg transition-shadow group`}
        >
          {primary ? 'Start Scanning' : 'Start Scanning Now'}
          <Camera className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
        </Link>
      )
    } else {
      if (isFallbackAuth) {
        return (
          <button
            onClick={signIn}
            className={`inline-flex items-center justify-center px-8 py-4 ${
              primary 
                ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white' 
                : 'bg-white text-primary-600'
            } font-semibold rounded-xl hover:shadow-lg transition-shadow group`}
          >
            <UserPlus className="mr-2 h-5 w-5" />
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        )
      } else {
        return (
          <SignUpButton mode="modal">
            <button className={`inline-flex items-center justify-center px-8 py-4 ${
              primary 
                ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white' 
                : 'bg-white text-primary-600'
            } font-semibold rounded-xl hover:shadow-lg transition-shadow group`}>
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </SignUpButton>
        )
      }
    }
  }

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center space-x-2 mb-6">
                <Award className="h-5 w-5 text-primary-600" />
                <span className="text-primary-600 font-medium">AI-Powered Dog Recognition</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold font-display text-gray-900 mb-6">
                Know your dog with{' '}
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Pawdentify
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                Discover your dog's breed with cutting-edge AI technology. Get instant identification 
                with detailed insights about temperament, health, and care needs.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                {renderCTAButton(true)}
                
                <button className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-primary-300 hover:text-primary-600 transition-colors">
                  Watch Demo
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Free to use</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Instant results</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative">
                <img
                  src={puppyHero}
                  alt="Cute puppy"
                  className="w-full max-w-lg mx-auto rounded-2xl shadow-2xl"
                  onError={(e) => {
                    // Try backup image first
                    if (e.target.src !== puppyHeroBackup) {
                      e.target.src = puppyHeroBackup
                    } else {
                      // Use a reliable external dog image as final fallback
                      e.target.src = 'https://images.dog.ceo/breeds/retriever-golden/n02099601_100.jpg'
                    }
                  }}
                />
                <div className="absolute -bottom-6 -right-6 bg-white rounded-xl p-4 shadow-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-700">95% Confidence</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 mt-1">Golden Retriever</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl lg:text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold font-display text-gray-900 mb-6">
              Why Choose Pawdentify?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our advanced AI technology provides the most accurate and comprehensive 
              dog breed identification available.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold font-display text-gray-900 mb-6">
              Loved by Dog Owners Everywhere
            </h2>
            <p className="text-xl text-gray-600">
              See what our community has to say about Pawdentify
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-6"
              >
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold font-display text-white mb-6">
              Ready to Discover Your Dog's Breed?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Join thousands of dog owners who trust Pawdentify for accurate breed identification
            </p>
            
            {renderCTAButton(false)}
          </motion.div>
        </div>
      </section>
    </div>
  )
}