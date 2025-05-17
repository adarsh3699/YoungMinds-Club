import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Listbox, Disclosure, Transition } from '@headlessui/react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  CalendarIcon, 
  MapPinIcon, 
  ChevronDownIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { Fragment } from 'react';
import EventCard from '../components/organizer/EventCard';
import { SelectInput, Switch } from '../components/common';
import EventCardSkeleton from '../components/organizer/EventCardSkeleton';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Categories
const EVENT_CATEGORIES = [
  { label: 'All Categories', value: '' },
  { label: 'Model United Nations', value: 'MUN' },
  { label: 'Debate', value: 'Debate' },
  { label: 'Hackathon', value: 'Hackathon' },
  { label: 'Workshop', value: 'Workshop' },
  { label: 'Competition', value: 'Competition' },
  { label: 'Conference', value: 'Conference' }
];

// Locations
const LOCATIONS = [
  { label: 'All Locations', value: '' },
  { label: 'Mumbai', value: 'Mumbai' },
  { label: 'Delhi', value: 'Delhi' },
  { label: 'Bangalore', value: 'Bangalore' },
  { label: 'Hyderabad', value: 'Hyderabad' },
  { label: 'Chennai', value: 'Chennai' },
  { label: 'Online', value: 'Online' }
];

// Sort options
const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Most Popular', value: 'popular' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Outgoing', value: 'outgoing' }
];

const EventsPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  // State for events data
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedEventIds, setSavedEventIds] = useState([]);

  // State for filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [isOnlineOnly, setIsOnlineOnly] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [dateError, setDateError] = useState('');
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0]);
  
  // Mobile filters visibility
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch events data
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/events');
        // Extract events array from response structure
        const eventsData = response.data.events || [];
        setEvents(eventsData);
        setFilteredEvents(eventsData);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
        // Initialize with empty array on error
        setEvents([]);
        setFilteredEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Apply filters and search
  useEffect(() => {
    if (!events.length) {
      setFilteredEvents([]);
      return;
    }

    let result = [...events];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(event => 
        event.title.toLowerCase().includes(query) || 
        (event.description && event.description.toLowerCase().includes(query)) ||
        (event.tags && event.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    // Apply category filter
    if (selectedCategory) {
      result = result.filter(event => event.type === selectedCategory);
    }

    // Apply location filter
    if (selectedLocation) {
      result = result.filter(event => 
        event.location.city === selectedLocation || 
        (selectedLocation === 'Online' && event.isOnline)
      );
    }

    // Apply online only filter
    if (isOnlineOnly) {
      result = result.filter(event => event.isOnline);
    }

    // Apply date range filter
    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      result = result.filter(event => new Date(event.date) >= startDate);
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      result = result.filter(event => new Date(event.date) <= endDate);
    }

    // Apply sorting
    switch (sortBy.value) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'popular':
        result.sort((a, b) => (b.registrationCount || 0) - (a.registrationCount || 0));
        break;
      case 'upcoming':
        result.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'outgoing':
        result.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      default:
        break;
    }

    setFilteredEvents(result);
  }, [events, searchQuery, selectedCategory, selectedLocation, isOnlineOnly, dateRange, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedLocation('');
    setIsOnlineOnly(false);
    setDateRange({ start: '', end: '' });
    setDateError('');
    setSortBy(SORT_OPTIONS[0]);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleLocationChange = (e) => {
    setSelectedLocation(e.target.value);
  };

  const handleOnlineToggle = (e) => {
    setIsOnlineOnly(e.target.checked);
  };

  const handleDateChange = (field, value) => {
    // Create a new date range object
    const newDateRange = { ...dateRange, [field]: value };
    
    // Clear previous errors
    setDateError('');
    
    // Validate that end date is not before start date
    if (newDateRange.start && newDateRange.end) {
      const startDate = new Date(newDateRange.start);
      const endDate = new Date(newDateRange.end);
      
      if (endDate < startDate) {
        setDateError('To Date cannot be earlier than From Date');
        // Still update the date but show error
      }
    }
    
    // Update the date range
    setDateRange(newDateRange);
  };

  // Handle saving/unsaving event
  const handleSaveToggle = async (eventId, isSaved) => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }

    try {
      // Always use POST method, as the server endpoint handles both save and unsave
      const response = await axios.post(`/events/${eventId}/save`);
      
      // Get updated saved status from server response
      const { isSaved: newSavedStatus } = response.data;
      
      // Update saved events list
      if (newSavedStatus) {
        setSavedEventIds(prev => [...prev, eventId]);
      } else {
        setSavedEventIds(prev => prev.filter(id => id !== eventId));
      }
    } catch (error) {
      console.error('Error toggling saved event:', error);
    }
  };

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Discover Events</h1>
        <p className="text-gray-600 dark:text-gray-400">Find and register for exciting events in your area or online</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search events..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          {/* Sort Dropdown */}
          <div className="w-full md:w-48">
            <Listbox value={sortBy} onChange={setSortBy}>
              <div className="relative">
                <Listbox.Button className="relative w-full py-2 pl-3 pr-10 text-left bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md cursor-default focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm">
                  <span className="block truncate text-gray-900 dark:text-white">{sortBy.label}</span>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </span>
                </Listbox.Button>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                    {SORT_OPTIONS.map((option) => (
                      <Listbox.Option
                        key={option.value}
                        className={({ active }) =>
                          `${
                            active ? 'text-white bg-blue-600' : 'text-gray-900 dark:text-white'
                          } cursor-default select-none relative py-2 pl-10 pr-4`
                        }
                        value={option}
                      >
                        {({ selected, active }) => (
                          <>
                            <span className={`${selected ? 'font-medium' : 'font-normal'} block truncate`}>
                              {option.label}
                            </span>
                            {selected ? (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                              </span>
                            ) : null}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          </div>

          {/* Filter Button (Mobile) */}
          <button
            type="button"
            className="md:hidden inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => setShowMobileFilters(true)}
          >
            <FunnelIcon className="h-5 w-5 mr-2" aria-hidden="true" />
            Filters
          </button>
        </div>

        {/* Desktop Filters */}
        <Disclosure as="div" className="hidden md:block mt-4">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center px-4 py-2 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                <div className="flex items-center">
                  <AdjustmentsHorizontalIcon className="mr-2 h-5 w-5" />
                  Advanced Filters
                </div>
                <ChevronDownIcon
                  className={`${open ? 'rotate-180 transform' : ''} h-5 w-5 text-gray-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="px-4 pt-4 pb-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Category Filter */}
                  <div>
                    <SelectInput
                      id="category"
                      name="category"
                      label="Category"
                      value={selectedCategory}
                      onChange={handleCategoryChange}
                      options={EVENT_CATEGORIES}
                      className="bg-white dark:bg-gray-700"
                    />
                  </div>

                  {/* Location Filter */}
                  <div>
                    <SelectInput
                      id="location"
                      name="location"
                      label="Location"
                      value={selectedLocation}
                      onChange={handleLocationChange}
                      options={LOCATIONS}
                      className="bg-white dark:bg-gray-700"
                    />
                  </div>

                  {/* Date Range */}
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                      From Date
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CalendarIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={dateRange.start}
                        onChange={(e) => handleDateChange('start', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                      To Date
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CalendarIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                          ${dateError ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'} 
                          text-gray-900 dark:text-white`}
                        value={dateRange.end}
                        onChange={(e) => handleDateChange('end', e.target.value)}
                      />
                    </div>
                    {dateError && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{dateError}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div>
                    <Switch
                      enabled={isOnlineOnly}
                      onChange={handleOnlineToggle}
                      label="Online Events Only"
                      name="online-only"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    Reset Filters
                  </button>
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </div>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-40 overflow-y-auto md:hidden">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowMobileFilters(false)}
            ></div>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filters</h3>
                  <button
                    type="button"
                    className="bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={() => setShowMobileFilters(false)}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Category Filter */}
                  <SelectInput
                    id="category-mobile"
                    name="category"
                    label="Category"
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    options={EVENT_CATEGORIES}
                    className="bg-white dark:bg-gray-700"
                  />

                  {/* Location Filter */}
                  <SelectInput
                    id="location-mobile"
                    name="location"
                    label="Location"
                    value={selectedLocation}
                    onChange={handleLocationChange}
                    options={LOCATIONS}
                    className="bg-white dark:bg-gray-700"
                  />

                  {/* Date Range */}
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                      From Date
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CalendarIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={dateRange.start}
                        onChange={(e) => handleDateChange('start', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                      To Date
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CalendarIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                          ${dateError ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'} 
                          text-gray-900 dark:text-white`}
                        value={dateRange.end}
                        onChange={(e) => handleDateChange('end', e.target.value)}
                      />
                    </div>
                    {dateError && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{dateError}</p>
                    )}
                  </div>

                  <div>
                    <Switch
                      enabled={isOnlineOnly}
                      onChange={handleOnlineToggle}
                      label="Online Events Only"
                      name="online-only"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowMobileFilters(false)}
                >
                  Apply Filters
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={resetFilters}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Events Grid */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No events found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your search or filter criteria to find events.
            </p>
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={resetFilters}
              >
                Reset all filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard 
                key={event._id} 
                event={event}
                onSaveToggle={isAuthenticated ? handleSaveToggle : undefined}
                isSaved={savedEventIds.includes(event._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage; 