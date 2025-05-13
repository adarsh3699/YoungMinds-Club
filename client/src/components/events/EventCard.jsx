import { useState } from 'react';
import { format } from 'date-fns';
import { 
  CalendarIcon, 
  MapPinIcon, 
  UserGroupIcon,
  PencilIcon,
  TrashIcon,
  ArrowRightIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const EventCard = ({ 
  event, 
  isOrganizer = false,
  onManage,
  onEdit,
  onDelete
}) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy h:mm a');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Get event capacity status
  const getCapacityStatus = () => {
    const percentage = (event.registrationCount / event.capacity) * 100;
    
    if (percentage >= 90) {
      return { text: 'Almost Full', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900' };
    } else if (percentage >= 50) {
      return { text: 'Filling Up', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900' };
    } else {
      return { text: 'Spots Available', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900' };
    }
  };
  
  const capacityStatus = getCapacityStatus();

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition transform hover:scale-[1.02] hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Event Image */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={event.poster || 'https://via.placeholder.com/400x200?text=No+Image'} 
          alt={event.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${capacityStatus.bg} ${capacityStatus.color}`}>
            {event.registrationCount} / {event.capacity}
          </span>
        </div>
        
        {/* Event category tag */}
        <div className="absolute top-2 left-2">
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
            {event.category}
          </span>
        </div>
      </div>
      
      {/* Event Details */}
      <div className="p-4">
        <h3 className="font-bold text-lg truncate text-gray-800 dark:text-white">{event.title}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mt-1 h-10">
          {event.shortDescription}
        </p>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <CalendarIcon className="h-4 w-4 mr-2" />
            <span>{formatDate(event.date)}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            {event.location.type === 'online' ? (
              <>
                <VideoCameraIcon className="h-4 w-4 mr-2" />
                <span>Online Event</span>
              </>
            ) : (
              <>
                <MapPinIcon className="h-4 w-4 mr-2" />
                <span>{event.location.city}, {event.location.venue}</span>
              </>
            )}
          </div>
          
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <UserGroupIcon className="h-4 w-4 mr-2" />
            <span>{event.registrationCount} attendees</span>
          </div>
        </div>
      </div>
      
      {/* Action buttons (Only visible for organizers) */}
      {isOrganizer && (
        <div className="bg-gray-50 dark:bg-gray-700 p-4 flex justify-between items-center">
          <button
            onClick={onManage}
            className="text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center hover:text-blue-800 dark:hover:text-blue-300"
          >
            View Details
            <ArrowRightIcon className="ml-1 h-4 w-4" />
          </button>
          
          <div className="flex space-x-2">
            <button 
              onClick={onEdit}
              className="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-blue-600 dark:hover:text-blue-400"
              aria-label="Edit event"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button 
              onClick={onDelete}
              className="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-red-600 dark:hover:text-red-400"
              aria-label="Delete event"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCard; 