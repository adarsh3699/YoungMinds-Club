import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { XMarkIcon, CalendarIcon, MapPinIcon, TagIcon, UsersIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { useDropzone } from 'react-dropzone';
import './CreateEventModal.css';

const InputField = ({ label, name, value, onChange, placeholder, type = 'text', error, className = '', required = false, icon = null }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}{required && '*'}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          {icon}
        </div>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full ${icon ? 'pl-10' : 'pl-3'} p-2.5 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
        placeholder={placeholder}
      />
    </div>
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

const TextareaField = ({ label, name, value, onChange, placeholder, rows = 3, maxLength, error, className = '', required = false }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}{required && '*'}{maxLength && ` (Max ${maxLength} chars)`}
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={rows}
      maxLength={maxLength}
      className={`w-full p-2.5 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
      placeholder={placeholder}
    ></textarea>
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    {maxLength && <p className="text-xs text-gray-500 mt-1">{value.length}/{maxLength} characters</p>}
  </div>
);

const SelectField = ({ label, name, value, onChange, options, error, className = '', required = false, icon = null }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}{required && '*'}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          {icon}
        </div>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full ${icon ? 'pl-10' : 'pl-3'} p-2.5 border rounded-md focus:ring-blue-500 focus:border-blue-500 appearance-none bg-no-repeat bg-right ${error ? 'border-red-500' : 'border-gray-300'}`}
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

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
  
  const onDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];
    if (file) {
      setPosterFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPosterPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxSize: 5242880, // 5MB
    multiple: false
  });
  
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
  
  const eventTypeOptions = [
    { value: 'Conference', label: 'Conference' },
    { value: 'Workshop', label: 'Workshop' },
    { value: 'Meetup', label: 'Meetup' },
    { value: 'Hackathon', label: 'Hackathon' },
    { value: 'MUN', label: 'MUN' },
    { value: 'Concert', label: 'Concert' },
    { value: 'Other', label: 'Other' }
  ];
  
  const categoryOptions = [
    { value: 'Technology', label: 'Technology' },
    { value: 'Business', label: 'Business' },
    { value: 'Education', label: 'Education' },
    { value: 'Arts', label: 'Arts' },
    { value: 'Science', label: 'Science' },
    { value: 'Music', label: 'Music' },
    { value: 'Sports', label: 'Sports' },
    { value: 'Other', label: 'Other' }
  ];
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white z-10 flex justify-between items-center p-5 border-b rounded-t-lg">
          <h2 className="text-xl font-bold flex items-center">
            {isEditing ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 9.75v7.5" />
              </svg>
            )}
            {isEditing ? 'Edit Event' : 'Create New Event'}
          </h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-blue-800"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div 
          className="custom-scrollbar overflow-y-auto overflow-x-hidden" 
          style={{ maxHeight: 'calc(90vh - 73px)', borderRadius: '0 0 0.5rem 0.5rem' }}
        >
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6 md:col-span-1">
                {/* Basic Information */}
                <InputField
                  label="Event Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter a descriptive title"
                  error={errors.title}
                  required
                />
                
                <TextareaField
                  label="Short Description"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  placeholder="Brief summary of your event"
                  maxLength={200}
                  error={errors.shortDescription}
                  required
                />
                
                <TextareaField
                  label="Full Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Detailed description of your event"
                  rows={6}
                  error={errors.description}
                  required
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <SelectField
                    label="Event Type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    options={eventTypeOptions}
                    required
                  />
                  
                  <SelectField
                    label="Category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    options={categoryOptions}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-6 md:col-span-1">
                {/* Event Image Upload */}
                <div>
                  <div className="flex items-center mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                    <label className="text-sm font-medium text-gray-700">
                      Event Poster*
                    </label>
                  </div>
                  <div 
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition-all hover:shadow-md
                      ${isDragActive ? 'border-blue-400 bg-blue-50' : errors.poster ? 'border-red-400' : 'border-gray-300 hover:bg-gray-50'}`}
                  >
                    <input {...getInputProps()} />
                    {posterPreview ? (
                      <div className="relative">
                        <img 
                          src={posterPreview} 
                          alt="Event poster preview" 
                          className="max-h-48 mx-auto rounded shadow-md"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPosterFile(null);
                            setPosterPreview(null);
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent text-white p-2 rounded-b">
                          <p className="text-xs font-medium truncate">
                            {posterFile?.name || "Uploaded image"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="p-3 bg-blue-100 rounded-full">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                            </svg>
                          </div>
                          <p className="text-sm font-medium text-gray-700">
                            {isDragActive ? 'Drop the file here...' : 'Drag & drop an image, or click to browse'}
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {errors.poster && <p className="mt-1 text-sm text-red-500">{errors.poster}</p>}
                </div>
                
                {/* Date and Time */}
                <div className="space-y-4">
                  <div className="flex items-center mb-1">
                    <CalendarIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="text-sm font-medium text-gray-700">Event Schedule</h3>
                  </div>
                  <InputField
                    label="Start Date and Time"
                    name="date"
                    type="datetime-local"
                    value={formData.date}
                    onChange={handleChange}
                    error={errors.date}
                    required
                    className="flex-1"
                    icon={<CalendarIcon className="h-5 w-5 text-gray-400" />}
                  />
                  
                  <InputField
                    label="End Date and Time"
                    name="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="flex-1"
                    icon={<CalendarIcon className="h-5 w-5 text-gray-400" />}
                  />
                  
                  <InputField
                    label="Registration Deadline"
                    name="registrationDeadline"
                    type="datetime-local"
                    value={formData.registrationDeadline}
                    onChange={handleChange}
                    className="flex-1"
                    icon={<CalendarIcon className="h-5 w-5 text-gray-400" />}
                  />
                </div>
                
                {/* Location Information */}
                <div className="space-y-4">
                  <div className="flex items-center mb-1">
                    <MapPinIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="text-sm font-medium text-gray-700">Location Details</h3>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex space-x-4 mb-3">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="locationType"
                          value="offline"
                          checked={formData.location.type === 'offline'}
                          onChange={handleLocationTypeChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
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
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-700">Online</span>
                      </label>
                    </div>
                    
                    {formData.location.type === 'offline' ? (
                      <div className="space-y-4">
                        <InputField
                          label="City"
                          name="location.city"
                          value={formData.location.city}
                          onChange={handleChange}
                          placeholder="e.g., New York"
                          error={errors['location.city']}
                          required
                          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                          </svg>}
                        />
                        
                        <InputField
                          label="Venue"
                          name="location.venue"
                          value={formData.location.venue}
                          onChange={handleChange}
                          placeholder="e.g., Convention Center"
                          error={errors['location.venue']}
                          required
                          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
                          </svg>}
                        />
                        
                        <InputField
                          label="Address"
                          name="location.address"
                          value={formData.location.address}
                          onChange={handleChange}
                          placeholder="Full address"
                          error={errors['location.address']}
                          required
                          icon={<MapPinIcon className="h-5 w-5 text-gray-400" />}
                        />
                      </div>
                    ) : (
                      <InputField
                        label="Online Meeting URL"
                        name="location.onlineUrl"
                        value={formData.location.onlineUrl}
                        onChange={handleChange}
                        placeholder="e.g., Zoom or Meet URL"
                        error={errors['location.onlineUrl']}
                        required
                        icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                        </svg>}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Additional Information - Full Width */}
            <div className="mt-8">
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-base font-medium text-gray-900 mb-4">Additional Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center mb-1">
                      <TagIcon className="h-5 w-5 text-blue-600 mr-2" />
                      <label className="text-sm font-medium text-gray-700">
                        Tags (Press Enter to add)
                      </label>
                    </div>
                    <div className="flex items-center bg-white border border-gray-300 rounded-md overflow-hidden">
                      <TagIcon className="h-5 w-5 text-gray-400 ml-3 mr-2" />
                      <input
                        type="text"
                        value={tagInput}
                        onChange={handleTagInputChange}
                        onKeyDown={handleTagInputKeyDown}
                        className="w-full p-2.5 border-none focus:ring-0 focus:outline-none"
                        placeholder="Add tags related to your event"
                      />
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.tags.length === 0 && (
                        <p className="text-xs text-gray-500 italic">No tags added yet. Tags help attendees find your event more easily.</p>
                      )}
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1.5 rounded-full flex items-center"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1.5 text-blue-800 hover:text-blue-900 flex items-center justify-center"
                            aria-label={`Remove tag ${tag}`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-5">
                    <div>
                      <div className="flex items-center mb-1">
                        <UsersIcon className="h-5 w-5 text-blue-600 mr-2" />
                        <label className="text-sm font-medium text-gray-700">
                          Capacity*
                        </label>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <UsersIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          name="capacity"
                          value={formData.capacity}
                          onChange={handleChange}
                          min="1"
                          className={`w-full pl-10 p-2.5 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.capacity ? 'border-red-500' : 'border-gray-300'}`}
                        />
                      </div>
                      {errors.capacity && <p className="mt-1 text-sm text-red-500">{errors.capacity}</p>}
                      <p className="text-xs text-gray-500 mt-1">Maximum number of attendees allowed</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600 mr-2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 8.25H9m6 3H9m3 6-3-3h1.5a3 3 0 1 0 0-6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        <label className="text-sm font-medium text-gray-700">
                          Price (₹)
                        </label>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <span className="text-gray-500 text-sm font-medium">₹</span>
                        </div>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          min="0"
                          step="1"
                          className="w-full pl-10 p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Set to 0 for free events</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-5 border-t border-gray-200 flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-medium shadow-sm transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
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
    </div>
  );
};

export default CreateEventModal; 