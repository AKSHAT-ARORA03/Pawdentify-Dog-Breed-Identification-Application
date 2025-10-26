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
  Phone,
  X
} from 'lucide-react';
import { useAuthContext } from '../auth/AuthContext';
import apiService from '../services/api';

const VaccinationTracker = () => {
  const { user } = useAuthContext();
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
  const [petForm, setPetForm] = useState({
    name: '',
    breed: '',
    secondary_breed: '',
    age_years: '',
    age_months: '',
    weight_lbs: '',
    color: '',
    microchip_id: '',
    veterinarian_name: '',
    veterinarian_contact: '',
    allergies: [],
    medical_conditions: [],
    special_notes: ''
  });
  const [vaccinationForm, setVaccinationForm] = useState({
    vaccine_name: '',
    vaccine_type: 'core',
    due_date: '',
    administered_date: '',
    is_core_vaccine: true,
    frequency_months: 12,
    veterinarian_name: '',
    clinic_name: '',
    clinic_contact: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debug logging
  console.log('VaccinationTracker: user =', user);
  console.log('VaccinationTracker: user?.id =', user?.id);

  useEffect(() => {
    console.log('VaccinationTracker useEffect: user =', user);
    if (user?.id) {
      console.log('VaccinationTracker: Loading data for user', user.id);
      loadData();
    } else {
      console.log('VaccinationTracker: No user or user.id, setting loading to false');
      setLoading(false);
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Loading data for user:', user?.id);
      console.log('🔄 Full user object type:', typeof user);
      console.log('🔄 User ID specifically:', user?.id);

      // Check API availability first
      console.log('🔍 Checking API availability...');
      await apiService.checkApiAvailability();
      console.log('🔍 API Available:', apiService.apiAvailable);

      // Ensure user exists in database before loading pets
      console.log('👤 Ensuring user exists in database...');
      try {
        await apiService.createUserIfNotExists(user.id, {
          email: user.primaryEmailAddress?.emailAddress || '',
          username: user.username || '',
          first_name: user.firstName || '',
          last_name: user.lastName || ''
        });
        console.log('✅ User exists in database');
      } catch (error) {
        console.log('⚠️ User creation/check failed:', error);
      }

      // Load pets and vaccinations with individual error handling
      console.log('🚀 Calling apiService.getUserPets...');
      console.log('🔧 API Service object:', apiService);
      
      const petsData = await apiService.getUserPets(user.id).catch(err => {
        console.error('❌ Error getting user pets:', err);
        console.error('❌ Error details:', err.message);
        console.error('❌ Error stack:', err.stack);
        return [];
      });
      
      console.log('🚀 Calling apiService.getVaccinations...');
      const vaccinationsData = await apiService.getVaccinations(user.id).catch(err => {
        console.error('❌ Error getting vaccinations:', err);
        return [];
      });
      
      console.log('🚀 Calling apiService.getVaccinationStatistics...');
      const statsData = await apiService.getVaccinationStatistics(user.id).catch(err => {
        console.error('❌ Error getting vaccination statistics:', err);
        return { completed: 0, upcoming: 0, overdue: 0, total: 0 };
      });

      console.log('📊 Loaded pets:', petsData);
      console.log('� Pets data type:', typeof petsData);
      console.log('📊 Pets is array:', Array.isArray(petsData));
      console.log('📊 Pets length:', petsData?.length);
      console.log('�💉 Loaded vaccinations:', vaccinationsData);
      console.log('📈 Loaded stats:', statsData);

      setPets(petsData);
      console.log('✅ Pets state updated, new pets:', petsData);
      setVaccinations(vaccinationsData);
      setStatistics(statsData);

      // Set first pet as selected if none selected
      if (petsData.length > 0 && !selectedPet) {
        setSelectedPet(petsData[0]);
        console.log('🐕 Selected first pet:', petsData[0]);
      }
    } catch (err) {
      console.error('❌ Error loading vaccination data:', err);
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

  const handleAddPet = async (e) => {
    e.preventDefault();
    
    alert('🐕 Add Pet button clicked! Form submission started.');
    console.log('🐕 Add Pet form submitted');
    console.log('Form data:', petForm);
    console.log('User:', user);
    
    if (!petForm.name.trim() || !petForm.breed.trim()) {
      console.log('❌ Validation failed - missing required fields');
      alert('❌ Please fill in Pet Name and Primary Breed');
      setError('Pet name and breed are required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const petData = {
        ...petForm,
        age_years: petForm.age_years ? parseInt(petForm.age_years) : null,
        age_months: petForm.age_months ? parseInt(petForm.age_months) : null,
        weight_lbs: petForm.weight_lbs ? parseFloat(petForm.weight_lbs) : null,
        allergies: petForm.allergies.filter(a => a.trim()),
        medical_conditions: petForm.medical_conditions.filter(c => c.trim())
      };

      console.log('🚀 Sending pet data to API:', petData);
      console.log('🆔 User ID:', user?.id || 'demo-user');
      
      alert('🚀 About to call API...');
      const response = await apiService.createPet(petData, user?.id || 'demo-user');
      console.log('✅ Pet created successfully:', response);
      alert('✅ Pet created successfully!');
      
      // Reset form and close modal
      setPetForm({
        name: '',
        breed: '',
        secondary_breed: '',
        age_years: '',
        age_months: '',
        weight_lbs: '',
        color: '',
        microchip_id: '',
        veterinarian_name: '',
        veterinarian_contact: '',
        allergies: [],
        medical_conditions: [],
        special_notes: ''
      });
      setShowAddPet(false);
      
      // Reload data to show new pet
      console.log('🔄 Reloading data after pet creation...');
      await loadData();
      console.log('✅ Data reload complete, pets should now include the new pet');
      console.log('🐕 Current pets state after reload:', pets);
      console.log('📊 Pets array length:', pets.length);
      
    } catch (err) {
      console.error('❌ Error adding pet:', err);
      alert('❌ Error: ' + err.message);
      setError('Failed to add pet. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddVaccination = async (e) => {
    e.preventDefault();
    
    if (!vaccinationForm.vaccine_name.trim() || !vaccinationForm.due_date) {
      setError('Vaccine name and due date are required');
      return;
    }

    if (!selectedPet) {
      setError('Please select a pet first');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const vaccinationData = {
        ...vaccinationForm,
        pet_id: selectedPet._id,
        frequency_months: parseInt(vaccinationForm.frequency_months) || 12,
        due_date: new Date(vaccinationForm.due_date).toISOString(),
        administered_date: vaccinationForm.administered_date 
          ? new Date(vaccinationForm.administered_date).toISOString() 
          : null
      };

      await apiService.createVaccination(vaccinationData, user.id);
      
      // Reset form and close modal
      setVaccinationForm({
        vaccine_name: '',
        vaccine_type: 'core',
        due_date: '',
        administered_date: '',
        is_core_vaccine: true,
        frequency_months: 12,
        veterinarian_name: '',
        clinic_name: '',
        clinic_contact: '',
        notes: ''
      });
      setShowAddVaccination(false);
      
      // Reload data to show new vaccination
      await loadData();
    } catch (err) {
      console.error('Error adding vaccination:', err);
      setError('Failed to add vaccination. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAllergyInput = (value) => {
    const allergies = value.split(',').map(a => a.trim()).filter(a => a);
    setPetForm(prev => ({ ...prev, allergies }));
  };

  const handleMedicalConditionsInput = (value) => {
    const conditions = value.split(',').map(c => c.trim()).filter(c => c);
    setPetForm(prev => ({ ...prev, medical_conditions: conditions }));
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

  // Show message if no user is logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Please log in to access vaccination tracking</p>
        </div>
      </div>
    );
  }

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

  // Debug: Log current pets state on every render
  console.log('🔍 Current render - pets state:', pets);
  console.log('🔍 Current render - pets length:', pets.length);
  console.log('🔍 Current render - user:', user);

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

      {/* Add Pet Modal */}
      <AnimatePresence>
        {showAddPet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAddPet(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Add New Pet</h3>
                <button
                  onClick={() => setShowAddPet(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddPet} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pet Name *
                    </label>
                    <input
                      type="text"
                      value={petForm.name}
                      onChange={(e) => setPetForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter pet name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Breed *
                    </label>
                    <input
                      type="text"
                      value={petForm.breed}
                      onChange={(e) => setPetForm(prev => ({ ...prev, breed: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Golden Retriever"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secondary Breed (if mixed)
                    </label>
                    <input
                      type="text"
                      value={petForm.secondary_breed}
                      onChange={(e) => setPetForm(prev => ({ ...prev, secondary_breed: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Labrador Retriever"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color/Markings
                    </label>
                    <input
                      type="text"
                      value={petForm.color}
                      onChange={(e) => setPetForm(prev => ({ ...prev, color: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Golden, Black & White"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age (Years)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={petForm.age_years}
                      onChange={(e) => setPetForm(prev => ({ ...prev, age_years: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0-30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Months
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="11"
                      value={petForm.age_months}
                      onChange={(e) => setPetForm(prev => ({ ...prev, age_months: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0-11"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (lbs)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={petForm.weight_lbs}
                      onChange={(e) => setPetForm(prev => ({ ...prev, weight_lbs: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 65.5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Microchip ID
                    </label>
                    <input
                      type="text"
                      value={petForm.microchip_id}
                      onChange={(e) => setPetForm(prev => ({ ...prev, microchip_id: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Microchip number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Veterinarian Name
                    </label>
                    <input
                      type="text"
                      value={petForm.veterinarian_name}
                      onChange={(e) => setPetForm(prev => ({ ...prev, veterinarian_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Dr. Smith"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vet Contact
                    </label>
                    <input
                      type="text"
                      value={petForm.veterinarian_contact}
                      onChange={(e) => setPetForm(prev => ({ ...prev, veterinarian_contact: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Phone or email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allergies (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={petForm.allergies.join(', ')}
                    onChange={(e) => handleAllergyInput(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., chicken, wheat, grass"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medical Conditions (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={petForm.medical_conditions.join(', ')}
                    onChange={(e) => handleMedicalConditionsInput(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., hip dysplasia, diabetes"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Notes
                  </label>
                  <textarea
                    value={petForm.special_notes}
                    onChange={(e) => setPetForm(prev => ({ ...prev, special_notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Any additional information about your pet..."
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
                    {error}
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddPet(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Adding...
                      </div>
                    ) : (
                      'Add Pet'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Vaccination Modal */}
      <AnimatePresence>
        {showAddVaccination && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAddVaccination(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  Add Vaccination for {selectedPet?.name}
                </h3>
                <button
                  onClick={() => setShowAddVaccination(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddVaccination} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vaccine Name *
                    </label>
                    <input
                      type="text"
                      value={vaccinationForm.vaccine_name}
                      onChange={(e) => setVaccinationForm(prev => ({ ...prev, vaccine_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Rabies, DHPP, Bordetella"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vaccine Type
                    </label>
                    <select
                      value={vaccinationForm.vaccine_type}
                      onChange={(e) => setVaccinationForm(prev => ({ ...prev, vaccine_type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="core">Core</option>
                      <option value="non-core">Non-Core</option>
                      <option value="lifestyle">Lifestyle</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date *
                    </label>
                    <input
                      type="date"
                      value={vaccinationForm.due_date}
                      onChange={(e) => setVaccinationForm(prev => ({ ...prev, due_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Administered Date (if completed)
                    </label>
                    <input
                      type="date"
                      value={vaccinationForm.administered_date}
                      onChange={(e) => setVaccinationForm(prev => ({ ...prev, administered_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequency (months)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={vaccinationForm.frequency_months}
                      onChange={(e) => setVaccinationForm(prev => ({ ...prev, frequency_months: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="12"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_core_vaccine"
                      checked={vaccinationForm.is_core_vaccine}
                      onChange={(e) => setVaccinationForm(prev => ({ ...prev, is_core_vaccine: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_core_vaccine" className="ml-2 block text-sm text-gray-700">
                      Core vaccine (required)
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Veterinarian Name
                    </label>
                    <input
                      type="text"
                      value={vaccinationForm.veterinarian_name}
                      onChange={(e) => setVaccinationForm(prev => ({ ...prev, veterinarian_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Dr. Smith"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Clinic Name
                    </label>
                    <input
                      type="text"
                      value={vaccinationForm.clinic_name}
                      onChange={(e) => setVaccinationForm(prev => ({ ...prev, clinic_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Happy Paws Veterinary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Clinic Contact
                    </label>
                    <input
                      type="text"
                      value={vaccinationForm.clinic_contact}
                      onChange={(e) => setVaccinationForm(prev => ({ ...prev, clinic_contact: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Phone or email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={vaccinationForm.notes}
                    onChange={(e) => setVaccinationForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Any additional notes about this vaccination..."
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
                    {error}
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddVaccination(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Adding...
                      </div>
                    ) : (
                      'Add Vaccination'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VaccinationTracker;