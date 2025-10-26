import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  Phone, 
  Book, 
  Video, 
  Users,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Clock,
  Send,
  FileText,
  Zap,
  Shield,
  Camera,
  Heart
} from 'lucide-react';
import HelpSupportDogCareServices from '../components/HelpSupportDogCareServices';

export default function HelpSupport() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    priority: 'medium',
    message: ''
  });
  const [formStatus, setFormStatus] = useState(null);

  // FAQ Categories and Questions
  const faqCategories = [
    { id: 'all', name: 'All Topics', icon: HelpCircle },
    { id: 'getting-started', name: 'Getting Started', icon: Zap },
    { id: 'scanning', name: 'Dog Scanning', icon: Camera },
    { id: 'account', name: 'Account & Settings', icon: Users },
    { id: 'privacy', name: 'Privacy & Security', icon: Shield },
    { id: 'technical', name: 'Technical Issues', icon: AlertCircle }
  ];

  const faqData = [
    {
      id: 1,
      category: 'getting-started',
      question: 'How do I start using PAWDENTIFY?',
      answer: 'Getting started is easy! Simply sign up for a free account, then navigate to the scan page and upload a photo of your dog. Our AI will analyze the image and provide breed identification results within seconds.'
    },
    {
      id: 2,
      category: 'scanning',
      question: 'What makes a good photo for scanning?',
      answer: 'For best results, use a clear, well-lit photo showing your dog\'s full face and body. Avoid blurry images, extreme angles, or photos where the dog is partially hidden. Natural lighting works best.'
    },
    {
      id: 3,
      category: 'scanning',
      question: 'How accurate is the breed identification?',
      answer: 'Our AI model achieves 95%+ accuracy across 120+ dog breeds. The confidence score shows how certain the model is about the identification. Mixed breeds will show multiple breed components.'
    },
    {
      id: 4,
      category: 'account',
      question: 'How do I save and manage my scan results?',
      answer: 'All your scans are automatically saved to your account. You can view them in your dashboard, add favorites by clicking the heart icon, and access detailed breed information anytime.'
    },
    {
      id: 5,
      category: 'privacy',
      question: 'What happens to my uploaded photos?',
      answer: 'Your privacy is our priority. Photos are processed securely and only stored with your explicit permission. You can delete any saved images from your account settings at any time.'
    },
    {
      id: 6,
      category: 'technical',
      question: 'The app is loading slowly. What should I do?',
      answer: 'Try clearing your browser cache, checking your internet connection, or using a different browser. If issues persist, contact our support team with details about your device and browser.'
    },
    {
      id: 7,
      category: 'scanning',
      question: 'Can I scan multiple dogs in one photo?',
      answer: 'Currently, our model works best with one dog per photo. For multiple dogs, we recommend taking separate photos of each dog for the most accurate results.'
    },
    {
      id: 8,
      category: 'account',
      question: 'How do I update my profile information?',
      answer: 'Go to your profile page through the navigation menu. You can update your name, email, preferences, and privacy settings. Changes are saved automatically.'
    },
    {
      id: 9,
      category: 'getting-started',
      question: 'Is PAWDENTIFY really free to use?',
      answer: 'Yes! PAWDENTIFY is completely free to use. You can scan unlimited photos, save results, and access all features without any charges or hidden fees.'
    },
    {
      id: 10,
      category: 'technical',
      question: 'Which file formats are supported for uploads?',
      answer: 'We support JPG, JPEG, PNG, and WebP image formats. File size should be under 10MB for optimal performance. HEIC files from iOS may need to be converted first.'
    }
  ];

  // Filter FAQs based on search and category
  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Contact form handlers
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('sending');
    
    // Simulate form submission
    setTimeout(() => {
      setFormStatus('success');
      setContactForm({
        name: '',
        email: '',
        subject: '',
        priority: 'medium',
        message: ''
      });
      
      // Reset status after 3 seconds
      setTimeout(() => setFormStatus(null), 3000);
    }, 2000);
  };

  const handleInputChange = (field, value) => {
    setContactForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Service status (mock data)
  const serviceStatus = [
    { service: 'AI Model Processing', status: 'operational', uptime: '99.9%' },
    { service: 'Image Upload System', status: 'operational', uptime: '99.8%' },
    { service: 'User Authentication', status: 'operational', uptime: '99.9%' },
    { service: 'Database Systems', status: 'operational', uptime: '99.7%' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational': return 'text-green-600 bg-green-100';
      case 'maintenance': return 'text-yellow-600 bg-yellow-100';
      case 'outage': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const resources = [
    {
      title: 'Video Tutorials',
      description: 'Step-by-step guides for using PAWDENTIFY',
      icon: Video,
      link: '#',
      external: true
    },
    {
      title: 'User Guide',
      description: 'Comprehensive documentation and tips',
      icon: Book,
      link: '#',
      external: true
    },
    {
      title: 'Community Forum',
      description: 'Connect with other dog owners and experts',
      icon: Users,
      link: '#',
      external: true
    },
    {
      title: 'Breed Information Database',
      description: 'Detailed information about all supported breeds',
      icon: FileText,
      link: '/care-guides',
      external: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Help & Support Center
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get the help you need to make the most of PAWDENTIFY. Search our knowledge base, 
            browse FAQs, or contact our support team.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for help articles, FAQs, and guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => document.getElementById('contact-form').scrollIntoView({ behavior: 'smooth' })}
                  className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Support
                </button>
                <a
                  href="tel:+1-800-PAWDENTIFY"
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:border-blue-300 hover:text-blue-600 transition-colors"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Support
                </a>
                <a
                  href="mailto:support@pawdentify.com"
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:border-blue-300 hover:text-blue-600 transition-colors"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email Us
                </a>
              </div>
            </div>

            {/* FAQ Categories */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Browse by Topic</h3>
              <div className="space-y-2">
                {faqCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      <span className="text-sm font-medium">{category.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Service Status */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Status</h3>
              <div className="space-y-3">
                {serviceStatus.map((service, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{service.service}</p>
                      <p className="text-xs text-gray-500">{service.uptime} uptime</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                      {service.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Dog Care Services Near You Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <HelpSupportDogCareServices />
            </motion.div>

            {/* FAQ Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Frequently Asked Questions
                </h2>
                
                {filteredFAQs.length > 0 ? (
                  <div className="space-y-4">
                    {filteredFAQs.map((faq) => (
                      <div key={faq.id} className="border border-gray-200 rounded-lg">
                        <button
                          onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-medium text-gray-900">{faq.question}</span>
                          {expandedFAQ === faq.id ? (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        <AnimatePresence>
                          {expandedFAQ === faq.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 pt-0 text-gray-600 border-t border-gray-200">
                                {faq.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No FAQs found matching your search.</p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                      }}
                      className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Clear search and show all FAQs
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Resources Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Helpful Resources
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {resources.map((resource, index) => {
                    const Icon = resource.icon;
                    return (
                      <a
                        key={index}
                        href={resource.link}
                        target={resource.external ? '_blank' : '_self'}
                        rel={resource.external ? 'noopener noreferrer' : ''}
                        className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all group"
                      >
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors">
                          <Icon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {resource.title}
                          </h3>
                          <p className="text-sm text-gray-600">{resource.description}</p>
                        </div>
                        {resource.external && (
                          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        )}
                      </a>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              id="contact-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Contact Our Support Team
                </h2>
                
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={contactForm.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={contactForm.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <input
                        type="text"
                        id="subject"
                        required
                        value={contactForm.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Brief description of your issue"
                      />
                    </div>
                    <div>
                      <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                        Priority Level
                      </label>
                      <select
                        id="priority"
                        value={contactForm.priority}
                        onChange={(e) => handleInputChange('priority', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="low">Low - General inquiry</option>
                        <option value="medium">Medium - Standard support</option>
                        <option value="high">High - Urgent issue</option>
                        <option value="critical">Critical - Service outage</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={6}
                      value={contactForm.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe your issue or question in detail..."
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      We typically respond within 24 hours during business days.
                    </p>
                    <button
                      type="submit"
                      disabled={formStatus === 'sending'}
                      className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {formStatus === 'sending' ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </button>
                  </div>

                  {/* Form Status Messages */}
                  <AnimatePresence>
                    {formStatus === 'success' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center p-4 bg-green-100 border border-green-200 rounded-lg"
                      >
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        <span className="text-green-700">
                          Message sent successfully! We'll get back to you soon.
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}