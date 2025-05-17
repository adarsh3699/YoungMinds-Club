import { useState } from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { 
  CalendarIcon, 
  MapPinIcon, 
  ClockIcon,
  BookmarkIcon,
  UserIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';

// Vibrant colors for different event types
const getCategoryColor = (type) => {
  const colors = {
    'Workshop': 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200',
    'MUN': 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
    'Debate': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    'Hackathon': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    'Competition': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    'Conference': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    'default': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
  };
  
  return colors[type] || colors.default;
};

const DashboardEventCard = ({ event, onSaveToggle, isSaved = false, isPast = false, isSaving = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Format date and time
  const formatEventDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };
  
  const formatEventTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'h:mm a');
    } catch (error) {
      return 'Invalid Time';
    }
  };
  
  // Handle bookmark toggle
  const handleSaveToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent toggling if already in progress
    if (onSaveToggle && !isSaving) {
      onSaveToggle(event.id || event._id, !isSaved);
    }
  };
  
  // Calculate days remaining until event
  const getDaysRemaining = () => {
    try {
      const now = new Date();
      const eventDate = new Date(event.date);
      const diffTime = eventDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    } catch (error) {
      return 0;
    }
  };
  
  const daysRemaining = getDaysRemaining();
  const categoryColorClass = getCategoryColor(event.type);
  
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex h-full">
        {/* Event Image */}
        <div className="w-1/4 h-28 relative">
          <Link to={`/event/${event.id || event._id}`} className="block h-full">
            <img 
              src={event.poster || 'https://via.placeholder.com/150x150?text=Event'} 
              alt={event.title} 
              className="w-full h-full object-cover"
            />
            {/* Organizer Badge */}
            <div className="absolute top-1 left-1">
              <div className="flex items-center bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded">
                <UserIcon className="h-2.5 w-2.5 mr-1" />
                <span className="truncate max-w-[80px]">
                  {event.organizer?.name || 'Organizer'}
                </span>
              </div>
            </div>
            {/* Overlay for past events */}
            {isPast && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="text-white text-xs font-bold px-1.5 py-0.5 bg-gray-800 bg-opacity-70 rounded">PAST</span>
              </div>
            )}
          </Link>
        </div>
        
        {/* Event Details */}
        <div className="w-3/4 p-3 flex flex-col">
          {/* Top Row: Title and Save Button */}
          <div className="flex justify-between items-start">
            <Link to={`/event/${event.id || event._id}`} className="block mr-2">
              <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                {event.title}
              </h3>
            </Link>
            
            <button
              onClick={handleSaveToggle}
              className="flex-shrink-0 transition-all duration-300"
              disabled={isSaving}
            >
              {isSaving ? (
                <div className="h-4 w-4 rounded-full border-2 border-indigo-600 border-t-transparent dark:border-indigo-400 dark:border-t-transparent animate-spin"></div>
              ) : isSaved ? (
                <BookmarkSolidIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <BookmarkIcon className="h-4 w-4 text-gray-400 dark:text-gray-500 hover:text-indigo-500 dark:hover:text-indigo-300" />
              )}
            </button>
          </div>
          
          {/* Event Type Badge */}
          <div className="mt-1 mb-1.5">
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${categoryColorClass}`}>
              {event.type || 'Event'}
            </span>
            
            {/* Price Tag */}
            {event.price === 0 || event.price === undefined ? (
              <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 ml-1">
                Free
              </span>
            ) : (
              <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 ml-1">
                ₹{event.price}
              </span>
            )}
          </div>
          
          {/* Meta Information */}
          <div className="flex flex-col space-y-0.5 text-xs text-gray-600 dark:text-gray-400 mt-auto">
            <div className="flex items-center">
              <CalendarIcon className="h-3 w-3 mr-1 text-indigo-500 dark:text-indigo-400" />
              <span>{formatEventDate(event.date)}</span>
              <ClockIcon className="h-3 w-3 ml-2 mr-1 text-indigo-500 dark:text-indigo-400" />
              <span>{formatEventTime(event.date)}</span>
            </div>
            
            <div className="flex items-center">
              <MapPinIcon className="h-3 w-3 mr-1 text-indigo-500 dark:text-indigo-400" />
              <span className="truncate">
                {event.location?.type === 'online' 
                  ? 'Online Event' 
                  : `${event.location?.city || 'Unknown'}`}
              </span>
            </div>
          </div>
          
          {/* Status Bar */}
          <div className="mt-2 flex justify-between items-center">
            {/* Countdown or Status */}
            {!isPast && daysRemaining > 0 ? (
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs px-1.5 py-0.5 rounded">
                {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
              </span>
            ) : isPast ? (
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs px-1.5 py-0.5 rounded">
                Completed
              </span>
            ) : (
              <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 text-xs px-1.5 py-0.5 rounded">
                Today!
              </span>
            )}
            
            {/* Action Link */}
            <Link 
              to={`/event/${event.id || event._id}`} 
              className="inline-flex items-center text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
            >
              <span>{isPast ? 'View' : 'Details'}</span>
              <ArrowRightIcon className="h-3 w-3 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardEventCard; 