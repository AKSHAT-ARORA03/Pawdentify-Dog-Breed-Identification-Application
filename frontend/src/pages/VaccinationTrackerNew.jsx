import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Plus,
  Edit2,
  Trash2,
  PawPrint,
  Stethoscope,
  MapPin,
  Phone
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import apiService from '../services/api';

const VaccinationTracker = () => {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [statistics, setStatistics] = useState({
    completed: 0,
    upcoming: 0,
    overdue: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPet, setSelectedPet] = useState(null);
  const [showAddPet, setShowAddPet] = useState(false);
  const [showAddVaccination, setShowAddVaccination] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load pets and vaccinations
      const [petsData, vaccinationsData, statsData] = await Promise.all([
        apiService.getUserPets(user.id),
        apiService.getVaccinations(user.id),
        apiService.getVaccinationStatistics(user.id)
      ]);

      setPets(petsData);
      setVaccinations(vaccinationsData);
      setStatistics(statsData);

      // Set first pet as selected if none selected
      if (petsData.length > 0 && !selectedPet) {
        setSelectedPet(petsData[0]);
      }
    } catch (err) {
      console.error('Error loading vaccination data:', err);
      setError('Failed to load vaccination data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCompleted = async (vaccinationId) => {
    try {
      const success = await apiService.updateVaccinationStatus(
        vaccinationId, 
        'completed', 
        new Date().toISOString()
      );
      
      if (success) {
        await loadData(); // Reload data
      }
    } catch (err) {
      console.error('Error updating vaccination:', err);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'overdue':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'upcoming':
      case 'scheduled':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <Shield className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'overdue':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'upcoming':
      case 'scheduled':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilDue = (dueDateString) => {
    if (!dueDateString) return null;
    const dueDate = new Date(dueDateString);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredVaccinations = selectedPet 
    ? vaccinations.filter(v => v.pet_id === selectedPet._id)
    : vaccinations;

  const upcomingVaccinations = filteredVaccinations.filter(v => 
    v.status === 'upcoming' || v.status === 'scheduled'
  );
  
  const completedVaccinations = filteredVaccinations.filter(v => 
    v.status === 'completed'
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vaccination data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-800">Vaccination Tracker</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Keep your pets healthy with our comprehensive vaccination tracking system. 
            Never miss an important vaccination again.
          </p>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{statistics.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-blue-600">{statistics.upcoming}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{statistics.overdue}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-800">{statistics.total}</p>
              </div>
              <Shield className="w-8 h-8 text-gray-500" />
            </div>
          </div>
        </motion.div>

        {/* Pet Selection */}
        {pets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Select Pet</h2>
                <button
                  onClick={() => setShowAddPet(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Pet
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {pets.map((pet) => (
                  <motion.button
                    key={pet._id}
                    onClick={() => setSelectedPet(pet)}
                    className={`p-4 rounded-lg border transition-all ${
                      selectedPet?._id === pet._id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3">
                      <PawPrint className="w-6 h-6 text-blue-600" />
                      <div className="text-left">
                        <p className="font-semibold text-gray-800">{pet.name}</p>
                        <p className="text-sm text-gray-600">{pet.breed}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* No pets message */}
        {pets.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <PawPrint className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Pets Added Yet</h3>
            <p className="text-gray-600 mb-6">Add your first pet to start tracking vaccinations</p>
            <button
              onClick={() => setShowAddPet(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Pet
            </button>
          </motion.div>
        )}

        {/* Vaccination Lists */}
        {selectedPet && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upcoming Vaccinations */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Upcoming Vaccinations</h2>
                <button
                  onClick={() => setShowAddVaccination(true)}
                  className="flex items-center px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </button>
              </div>
              
              <div className="space-y-4">
                {upcomingVaccinations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No upcoming vaccinations</p>
                  </div>
                ) : (
                  upcomingVaccinations.map((vaccination) => {
                    const daysUntil = getDaysUntilDue(vaccination.due_date);
                    return (
                      <motion.div
                        key={vaccination._id}
                        className={`p-4 rounded-lg border ${getStatusColor(vaccination.status)}`}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            {getStatusIcon(vaccination.status)}
                            <div>
                              <h3 className="font-semibold">{vaccination.vaccine_name}</h3>
                              <p className="text-sm opacity-75">Due: {formatDate(vaccination.due_date)}</p>
                              {daysUntil !== null && (
                                <p className="text-xs opacity-60 mt-1">
                                  {daysUntil > 0 ? `${daysUntil} days remaining` : 
                                   daysUntil === 0 ? 'Due today' : `${Math.abs(daysUntil)} days overdue`}
                                </p>
                              )}
                              {vaccination.veterinarian_name && (
                                <p className="text-xs opacity-60 mt-1 flex items-center">
                                  <Stethoscope className="w-3 h-3 mr-1" />
                                  {vaccination.veterinarian_name}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleMarkCompleted(vaccination._id)}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                          >
                            Mark Complete
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>

            {/* Completed Vaccinations */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Completed Vaccinations</h2>
              
              <div className="space-y-4">
                {completedVaccinations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No completed vaccinations</p>
                  </div>
                ) : (
                  completedVaccinations.map((vaccination) => (
                    <motion.div
                      key={vaccination._id}
                      className={`p-4 rounded-lg border ${getStatusColor(vaccination.status)}`}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-start space-x-3">
                        {getStatusIcon(vaccination.status)}
                        <div className="flex-1">
                          <h3 className="font-semibold">{vaccination.vaccine_name}</h3>
                          <p className="text-sm opacity-75">
                            Completed: {formatDate(vaccination.administered_date)}
                          </p>
                          {vaccination.next_due_date && (
                            <p className="text-xs opacity-60 mt-1">
                              Next due: {formatDate(vaccination.next_due_date)}
                            </p>
                          )}
                          {vaccination.veterinarian_name && (
                            <p className="text-xs opacity-60 mt-1 flex items-center">
                              <Stethoscope className="w-3 h-3 mr-1" />
                              {vaccination.veterinarian_name}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VaccinationTracker;