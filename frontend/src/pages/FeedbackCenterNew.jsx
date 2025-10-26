import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star,
  Heart,
  MessageSquare,
  Send,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Bug,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  Users,
  Award,
  Camera,
  FileText,
  Image,
  Smile,
  Meh,
  Frown
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import apiService from '../services/api';

export default function FeedbackCenter() {
  const { user } = useAuth();
  const [overallRating, setOverallRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackType, setFeedbackType] = useState('general');
  const [feedbackForm, setFeedbackForm] = useState({
    title: '',
    description: '',
    category: 'improvement',
    attachments: []
  });
  const [submitStatus, setSubmitStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('submit');
  const fileInputRef = useRef(null);

  // Real data states
  const [communityFeedback, setCommunityFeedback] = useState([]);
  const [userFeedback, setUserFeedback] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Feature ratings state
  const [featureRatings, setFeatureRatings] = useState({
    scanning: 0,
    accuracy: 0,
    interface: 0,
    speed: 0
  });

  useEffect(() => {
    if (user?.id) {
      loadFeedbackData();
    }
  }, [user]);

  const loadFeedbackData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [testimonialData, userFeedbackData, communityData] = await Promise.all([
        apiService.getTestimonials(10, false),
        apiService.getUserFeedback(user.id, 10, 0),
        apiService.getUserCommunityFeedback(user.id)
      ]);

      setTestimonials(testimonialData);
      setUserFeedback(userFeedbackData);
      setCommunityFeedback(communityData);
    } catch (err) {
      console.error('Error loading feedback data:', err);
      setError('Failed to load feedback data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    
    if (!user?.id) {
      setSubmitStatus({ type: 'error', message: 'Please log in to submit feedback' });
      return;
    }

    if (!feedbackForm.title.trim() || !feedbackForm.description.trim()) {
      setSubmitStatus({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    setLoading(true);
    
    try {
      const feedbackData = {
        feedback_type: feedbackType,
        subject: feedbackForm.title,
        message: feedbackForm.description,
        app_version: '2.0.0',
        device_type: 'desktop',
        page_url: window.location.href,
        priority: 'medium',
        rating: overallRating || null
      };

      await apiService.submitFeedback(feedbackData, user.id);
      
      setSubmitStatus({ 
        type: 'success', 
        message: 'Thank you! Your feedback has been submitted successfully.' 
      });
      
      // Reset form
      setFeedbackForm({ title: '', description: '', category: 'improvement', attachments: [] });
      setOverallRating(0);
      setFeatureRatings({ scanning: 0, accuracy: 0, interface: 0, speed: 0 });
      
      // Reload user feedback data
      await loadFeedbackData();
      
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setSubmitStatus({ 
        type: 'error', 
        message: 'Failed to submit feedback. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTestimonial = async (testimonialData) => {
    if (!user?.id) {
      setSubmitStatus({ type: 'error', message: 'Please log in to submit a testimonial' });
      return;
    }

    setLoading(true);
    
    try {
      await apiService.submitCommunityFeedback(testimonialData, user.id);
      
      setSubmitStatus({ 
        type: 'success', 
        message: 'Thank you! Your testimonial has been submitted for review.' 
      });
      
      // Reload community feedback data
      await loadFeedbackData();
      
    } catch (err) {
      console.error('Error submitting testimonial:', err);
      setSubmitStatus({ 
        type: 'error', 
        message: 'Failed to submit testimonial. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVoteOnFeedback = async (feedbackId, isHelpful) => {
    try {
      await apiService.voteOnFeedback(feedbackId, isHelpful);
      // Reload testimonials to show updated votes
      await loadFeedbackData();
    } catch (err) {
      console.error('Error voting on feedback:', err);
    }
  };

  const renderStars = (rating, onRate, size = 'w-6 h-6') => {
    return [...Array(5)].map((_, index) => (
      <motion.button
        key={index}
        onClick={() => onRate && onRate(index + 1)}
        onMouseEnter={() => setHoverRating(index + 1)}
        onMouseLeave={() => setHoverRating(0)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="focus:outline-none"
      >
        <Star 
          className={`${size} ${
            index < (hoverRating || rating) 
              ? 'text-yellow-400 fill-current' 
              : 'text-gray-300'
          }`}
        />
      </motion.button>
    ));
  };

  const renderFeedbackSubmission = () => (
    <div className="space-y-6">
      {/* Overall Rating */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">How would you rate Pawdentify overall?</h3>
        <div className="flex items-center justify-center space-x-2 mb-4">
          {renderStars(overallRating, setOverallRating, 'w-8 h-8')}
        </div>
        <p className="text-center text-gray-600">
          {overallRating === 0 && "Click to rate"}
          {overallRating === 1 && "😞 Poor"}
          {overallRating === 2 && "😐 Fair"}
          {overallRating === 3 && "🙂 Good"}
          {overallRating === 4 && "😊 Very Good"}
          {overallRating === 5 && "🤩 Excellent"}
        </p>
      </div>

      {/* Feedback Type Selection */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">What type of feedback do you have?</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { id: 'general', label: 'General', icon: MessageSquare, color: 'blue' },
            { id: 'bug_report', label: 'Bug Report', icon: Bug, color: 'red' },
            { id: 'feature_request', label: 'Feature Request', icon: Lightbulb, color: 'yellow' },
            { id: 'breed_correction', label: 'Breed Correction', icon: AlertCircle, color: 'purple' }
          ].map((type) => (
            <motion.button
              key={type.id}
              onClick={() => setFeedbackType(type.id)}
              className={`p-4 rounded-lg border transition-all ${
                feedbackType === type.id
                  ? `border-${type.color}-500 bg-${type.color}-50`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <type.icon className={`w-6 h-6 mx-auto mb-2 ${
                feedbackType === type.id ? `text-${type.color}-600` : 'text-gray-500'
              }`} />
              <p className={`text-sm font-medium ${
                feedbackType === type.id ? `text-${type.color}-800` : 'text-gray-700'
              }`}>
                {type.label}
              </p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Feedback Form */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <form onSubmit={handleSubmitFeedback} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Feedback Title *
            </label>
            <input
              type="text"
              value={feedbackForm.title}
              onChange={(e) => setFeedbackForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief summary of your feedback"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Description *
            </label>
            <textarea
              value={feedbackForm.description}
              onChange={(e) => setFeedbackForm(prev => ({ ...prev, description: e.target.value }))}
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Please provide detailed information about your feedback..."
              required
            />
          </div>

          {/* Submit Status */}
          <AnimatePresence>
            {submitStatus && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-4 rounded-lg ${
                  submitStatus.type === 'success' 
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}
              >
                <div className="flex items-center">
                  {submitStatus.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 mr-2" />
                  ) : (
                    <AlertCircle className="w-5 h-5 mr-2" />
                  )}
                  {submitStatus.message}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Submitting...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Send className="w-5 h-5 mr-2" />
                Submit Feedback
              </div>
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );

  const renderCommunityFeedback = () => (
    <div className="space-y-6">
      {/* User's Feedback History */}
      {userFeedback.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Feedback History</h3>
          <div className="space-y-4">
            {userFeedback.map((feedback) => (
              <div key={feedback._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{feedback.subject}</h4>
                    <p className="text-gray-600 text-sm mt-1">{feedback.message}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        feedback.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        feedback.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                        feedback.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {feedback.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(feedback.submitted_at).toLocaleDateString()}
                      </span>
                      {feedback.rating && (
                        <div className="flex items-center">
                          {renderStars(feedback.rating, null, 'w-3 h-3')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Community Testimonials */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Community Testimonials</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{testimonials.length} testimonials</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading testimonials...</p>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No testimonials available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial._id}
                className="border border-gray-200 rounded-lg p-4"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-800">{testimonial.display_name}</h4>
                    {testimonial.user_location && (
                      <p className="text-xs text-gray-500">{testimonial.user_location}</p>
                    )}
                  </div>
                  <div className="flex items-center">
                    {renderStars(testimonial.rating, null, 'w-4 h-4')}
                  </div>
                </div>
                
                <h5 className="font-medium text-gray-800 mb-2">{testimonial.title}</h5>
                <p className="text-gray-600 text-sm mb-3">{testimonial.content}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    {testimonial.usage_duration && (
                      <span>Using for {testimonial.usage_duration}</span>
                    )}
                    {testimonial.scan_count && (
                      <span>{testimonial.scan_count} scans</span>
                    )}
                  </div>
                  
                  {testimonial.helpful_votes > 0 && (
                    <div className="flex items-center space-x-1">
                      <ThumbsUp 
                        className="w-3 h-3 cursor-pointer hover:text-blue-600" 
                        onClick={() => handleVoteOnFeedback(testimonial._id, true)}
                      />
                      <span>{testimonial.helpful_votes}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-purple-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-800">Feedback Center</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Your feedback helps us improve Pawdentify! Share your thoughts, report issues, 
            or suggest new features to help us serve you better.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-lg border border-gray-100">
            {[
              { id: 'submit', label: 'Submit Feedback', icon: Send },
              { id: 'community', label: 'Community', icon: Users }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 rounded-md font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-purple-600'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'submit' && renderFeedbackSubmission()}
            {activeTab === 'community' && renderCommunityFeedback()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}