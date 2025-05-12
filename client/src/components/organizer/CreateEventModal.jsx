import { useState, useEffect } from 'react';
import axios from 'axios';
import { XMarkIcon } from '@heroicons/react/24/outline';

const CreateEventModal = ({ 
  onClose, 
  onSuccess, 
  eventToEdit = null, 
  isEditing = false 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    type: 'Workshop',
    category: 'Technology',
    date: '',
    endDate: '',
    location: {
      type: 'offline',
      city: '',
      venue: '',
      address: '',
      onlineUrl: ''
    },
    capacity: 50,
    tags: [],
    price: 0,
    registrationDeadline: ''
  });
  
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // If editing, populate form with event data
  useEffect(() => {
    if (isEditing && eventToEdit) {
      const formattedEvent = {
        ...eventToEdit,
        date: formatDateForInput(eventToEdit.date),
        endDate: eventToEdit.endDate ? formatDateForInput(eventToEdit.endDate) : '',
        registrationDeadline: eventToEdit.registrationDeadline ? 
          formatDateForInput(eventToEdit.registrationDeadline) : ''
      };
      
      setFormData(formattedEvent);
      if (eventToEdit.poster) {
        setPosterPreview(eventToEdit.poster);
      }
    }
  }, [isEditing, eventToEdit]);
  
  // Format date for datetime-local input
  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
      .toISOString()
      .slice(0, 16);
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested location object
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          [locationField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleLocationTypeChange = (e) => {
    const locationType = e.target.value;
    setFormData({
      ...formData,
      location: {
        ...formData.location,
        type: locationType
      }
    });
  };
  
  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPosterFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPosterPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };
  
  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData({
          ...formData,
          tags: [...formData.tags, tagInput.trim()]
        });
      }
      setTagInput('');
    }
  };
  
  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.shortDescription) newErrors.shortDescription = 'Short description is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.capacity) newErrors.capacity = 'Capacity is required';
    
    // Location validation based on type
    if (formData.location.type === 'offline') {
      if (!formData.location.city) newErrors['location.city'] = 'City is required';
      if (!formData.location.venue) newErrors['location.venue'] = 'Venue is required';
      if (!formData.location.address) newErrors['location.address'] = 'Address is required';
    } else {
      if (!formData.location.onlineUrl) newErrors['location.onlineUrl'] = 'Online URL is required';
    }
    
    // Poster validation only for new events
    if (!isEditing && !posterFile && !posterPreview) {
      newErrors.poster = 'Event poster is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Create FormData object for file upload
      const eventFormData = new FormData();
      
      // Add all form data fields
      Object.keys(formData).forEach(key => {
        if (key === 'location') {
          // Handle nested location object
          Object.keys(formData.location).forEach(locationKey => {
            eventFormData.append(`location[${locationKey}]`, formData.location[locationKey]);
          });
        } else if (key === 'tags') {
          // Handle array of tags
          formData.tags.forEach(tag => {
            eventFormData.append('tags[]', tag);
          });
        } else {
          eventFormData.append(key, formData[key]);
        }
      });
      
      // Add poster file if available
      if (posterFile) {
        eventFormData.append('poster', posterFile);
      }
      
      let response;
      if (isEditing) {
        response = await axios.put(
          `/organizer/events/${eventToEdit._id}`,
          eventFormData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      } else {
        response = await axios.post(
          '/organizer/events',
          eventFormData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      }
      
      setLoading(false);
      
      if (response.data.success) {
        onSuccess(response.data.event);
      }
    } catch (error) {
      console.error('Error submitting event:', error);
      setLoading(false);
      
      // Handle validation errors from the server
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert('Failed to save event. Please try again.');
      }
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">
            {isEditing ? 'Edit Event' : 'Create New Event'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6 md:col-span-1">
              {/* Basic Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title*
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter a descriptive title"
                />
                {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short Description* (Max 200 chars)
                </label>
                <textarea
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  maxLength={200}
                  rows={2}
                  className={`w-full p-2 border rounded-md ${errors.shortDescription ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Brief summary of your event"
                ></textarea>
                {errors.shortDescription && <p className="mt-1 text-sm text-red-500">{errors.shortDescription}</p>}
                <p className="text-xs text-gray-500 mt-1">{formData.shortDescription.length}/200 characters</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Description*
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  className={`w-full p-2 border rounded-md ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Detailed description of your event"
                ></textarea>
                {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Type*
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="Conference">Conference</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Meetup">Meetup</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="MUN">MUN</option>
                    <option value="Concert">Concert</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category*
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Business">Business</option>
                    <option value="Education">Education</option>
                    <option value="Arts">Arts</option>
                    <option value="Science">Science</option>
                    <option value="Music">Music</option>
                    <option value="Sports">Sports</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="space-y-6 md:col-span-1">
              {/* Event Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Poster*
                </label>
                <div className={`border-2 border-dashed rounded-lg p-4 ${errors.poster ? 'border-red-400' : 'border-gray-300'}`}>
                  {posterPreview ? (
                    <div className="relative">
                      <img 
                        src={posterPreview} 
                        alt="Event poster preview" 
                        className="max-h-48 mx-auto rounded"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPosterFile(null);
                          setPosterPreview(null);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="mt-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePosterChange}
                          className="w-full text-sm"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  )}
                </div>
                {errors.poster && <p className="mt-1 text-sm text-red-500">{errors.poster}</p>}
              </div>
              
              {/* Date and Time */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date and Time*
                  </label>
                  <input
                    type="datetime-local"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-md ${errors.date ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date and Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registration Deadline (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    name="registrationDeadline"
                    value={formData.registrationDeadline}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              {/* Location Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location Type*
                  </label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="locationType"
                        value="offline"
                        checked={formData.location.type === 'offline'}
                        onChange={handleLocationTypeChange}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-gray-700">Offline (Physical)</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="locationType"
                        value="online"
                        checked={formData.location.type === 'online'}
                        onChange={handleLocationTypeChange}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-gray-700">Online</span>
                    </label>
                  </div>
                </div>
                
                {formData.location.type === 'offline' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City*
                      </label>
                      <input
                        type="text"
                        name="location.city"
                        value={formData.location.city}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded-md ${errors['location.city'] ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="e.g., New York"
                      />
                      {errors['location.city'] && <p className="mt-1 text-sm text-red-500">{errors['location.city']}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Venue*
                      </label>
                      <input
                        type="text"
                        name="location.venue"
                        value={formData.location.venue}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded-md ${errors['location.venue'] ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="e.g., Convention Center"
                      />
                      {errors['location.venue'] && <p className="mt-1 text-sm text-red-500">{errors['location.venue']}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address*
                      </label>
                      <input
                        type="text"
                        name="location.address"
                        value={formData.location.address}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded-md ${errors['location.address'] ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Full address"
                      />
                      {errors['location.address'] && <p className="mt-1 text-sm text-red-500">{errors['location.address']}</p>}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Online Meeting URL*
                    </label>
                    <input
                      type="text"
                      name="location.onlineUrl"
                      value={formData.location.onlineUrl}
                      onChange={handleChange}
                      className={`w-full p-2 border rounded-md ${errors['location.onlineUrl'] ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="e.g., Zoom or Meet URL"
                    />
                    {errors['location.onlineUrl'] && <p className="mt-1 text-sm text-red-500">{errors['location.onlineUrl']}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Additional Information - Full Width */}
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (Press Enter to add)
                </label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyDown={handleTagInputKeyDown}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Add tags related to your event"
                />
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-blue-800 hover:text-blue-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity*
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    min="1"
                    className={`w-full p-2 border rounded-md ${errors.capacity ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.capacity && <p className="mt-1 text-sm text-red-500">{errors.capacity}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  <p className="text-xs text-gray-500 mt-1">Set to 0 for free events</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : isEditing ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal; 