import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import {
  AdminPageHeader,
  AdminTable,
  AdminConfirmationModal,
  StatsCard,
  UserSearchFilters
} from "../../components/admin/dashboard";
import { 
  ExclamationTriangleIcon, 
  CalendarIcon,
  FlagIcon,
  TrashIcon,
  EyeIcon,
  DocumentCheckIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";
import { AdminEventData } from '@/types';

// Simple modal state type
type EventModalState = {
  isOpen: boolean;
  type: 'delete' | 'flag' | null;
  eventId: string | null;
  eventTitle: string;
  isFlagged: boolean;
  flagReason: string;
};

const EventsManagement: React.FC = () => {
  // State
  const [events, setEvents] = useState<AdminEventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [modal, setModal] = useState<EventModalState>({
    isOpen: false,
    type: null,
    eventId: null,
    eventTitle: '',
    isFlagged: false,
    flagReason: ''
  });

  // Filter options
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
    { value: 'featured', label: 'Featured' },
    { value: 'flagged', label: 'Flagged' },
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'Technology', label: 'Technology' },
    { value: 'Business', label: 'Business' },
    { value: 'Education', label: 'Education' },
    { value: 'Arts', label: 'Arts' },
    { value: 'Science', label: 'Science' },
    { value: 'Music', label: 'Music' },
    { value: 'Sports', label: 'Sports' },
    { value: 'Other', label: 'Other' },
  ];

  // Table columns
  const columns = [
    { key: 'event', label: 'Event' },
    { key: 'date', label: 'Date & Time' },
    { key: 'organizer', label: 'Organizer' },
    { key: 'category', label: 'Category' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' },
  ];

  // Empty state config
  const emptyStateConfig = {
    icon: <CalendarIcon className="w-16 h-16 text-muted-foreground/50" />,
    title: 'No events found',
    description: 'Try adjusting your search or filters',
    noFiltersDescription: 'No events have been created yet'
  };

  // Optimized filtering
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch = !searchTerm ||
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.organizer?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;

      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'published' && event.isPublished) ||
        (statusFilter === 'draft' && !event.isPublished) ||
        (statusFilter === 'featured' && event.isFeatured) ||
        (statusFilter === 'flagged' && event.isFlagged);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [events, searchTerm, categoryFilter, statusFilter]);

  // Optimized stats calculation
  const stats = useMemo(() => {
    const total = events.length;
    const published = events.filter(e => e.isPublished).length;
    const featured = events.filter(e => e.isFeatured).length;
    const flagged = events.filter(e => e.isFlagged).length;
    
    return {
      total,
      published,
      draft: total - published,
      featured,
      flagged
    };
  }, [events]);

  // Stats cards data
  const statsCards = [
    {
      title: 'Total Events',
      value: stats.total,
      description: 'All registered events',
      icon: <CalendarIcon className="h-6 w-6 text-primary" />,
      bgClass: 'bg-gradient-primary-light',
      borderClass: 'border-primary/20',
      iconBgClass: 'bg-primary-5',
    },
    {
      title: 'Published',
      value: stats.published,
      description: 'Live & visible events',
      icon: <EyeIcon className="h-6 w-6 text-success" />,
      bgClass: 'bg-gradient-success-light',
      borderClass: 'border-success/20',
      iconBgClass: 'bg-success-5',
    },
    {
      title: 'Draft',
      value: stats.draft,
      description: 'Unpublished events',
      icon: <DocumentCheckIcon className="h-6 w-6 text-warning" />,
      bgClass: 'bg-warning-10',
      borderClass: 'border-warning/20',
      iconBgClass: 'bg-warning-5',
    },
    {
      title: 'Featured',
      value: stats.featured,
      description: 'Highlighted events',
      icon: <SparklesIcon className="h-6 w-6 text-purple" />,
      bgClass: 'bg-purple-10',
      borderClass: 'border-purple/20',
      iconBgClass: 'bg-purple-10',
    },
    {
      title: 'Flagged',
      value: stats.flagged,
      description: 'Requiring attention',
      icon: <FlagIcon className="h-6 w-6 text-destructive" />,
      bgClass: 'bg-destructive-10',
      borderClass: 'border-destructive/20',
      iconBgClass: 'bg-destructive-10',
    },
  ];

  // API functions
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get("/admin/events");
      if (data.success) {
        setEvents(data.events);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to load events. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteEvent = useCallback(async () => {
    if (!modal.eventId) return;
    
    try {
      const { data } = await axios.delete(`/admin/events/${modal.eventId}`);
      if (data.success) {
        setEvents(prev => prev.filter(event => event._id !== modal.eventId));
        setModal(prev => ({ ...prev, isOpen: false }));
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      setError("Failed to delete event. Please try again.");
    }
  }, [modal.eventId]);

  const toggleFlag = useCallback(async () => {
    if (!modal.eventId) return;
    
    try {
      const { data } = await axios.put(`/admin/events/${modal.eventId}/flag`, {
        isFlagged: !modal.isFlagged,
        flagReason: modal.flagReason
      });
      
      if (data.success) {
        setEvents(prev =>
          prev.map(event =>
            event._id === modal.eventId 
              ? { 
                  ...event, 
                  isFlagged: !modal.isFlagged,
                  flagReason: !modal.isFlagged ? modal.flagReason : null 
                } 
              : event
          )
        );
        setModal(prev => ({ ...prev, isOpen: false }));
      }
    } catch (error) {
      console.error("Error updating event flag status:", error);
      setError("Failed to update event flag status. Please try again.");
    }
  }, [modal.eventId, modal.isFlagged, modal.flagReason]);

  // Modal handlers
  const openModal = useCallback((type: 'delete' | 'flag', event: AdminEventData) => {
    setModal({
      isOpen: true,
      type,
      eventId: event._id,
      eventTitle: event.title,
      isFlagged: event.isFlagged || false,
      flagReason: event.flagReason || ''
    });
  }, []);

  const closeModal = useCallback(() => {
    setModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    if (modal.type === 'delete') {
      deleteEvent();
    } else if (modal.type === 'flag') {
      toggleFlag();
    }
  }, [modal.type, deleteEvent, toggleFlag]);

  // Optimized render function
  const renderEventRow = useCallback((event: AdminEventData, index: number) => (
    <tr 
      key={event._id} 
      className={`group hover:bg-card-hover transition-colors ${
        event.isFlagged ? 'bg-destructive/5 border-l-4 border-l-destructive' : ''
      }`}
    >
      {/* Event Details */}
      <td className="py-4 px-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img 
              src={event.poster} 
              alt={event.title} 
              className="w-16 h-16 object-cover rounded-lg shadow-md"
              onError={(e) => { 
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=Event'; 
              }}
            />
            {event.isFeatured && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand-primary rounded-full border-2 border-card" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <Link 
              to={`/event/${event._id}`} 
              className="text-brand-primary hover:text-brand-dark font-semibold text-sm block line-clamp-2 mb-1 transition-colors"
            >
              {event.title}
            </Link>
            {event.isFlagged && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-destructive/10 text-destructive rounded-full border border-destructive/20">
                <FlagIcon className="w-3 h-3 mr-1" />
                Flagged
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Date & Time */}
      <td className="py-4 px-6 text-sm text-card-foreground">
        <div className="font-medium">{format(new Date(event.date), "PPP")}</div>
        <div className="text-xs text-muted-foreground mt-1">{format(new Date(event.date), "p")}</div>
      </td>

      {/* Organizer */}
      <td className="py-4 px-6 text-sm text-card-foreground">
        <div className="font-medium">{event.organizer?.name || "Unknown"}</div>
      </td>

      {/* Category */}
      <td className="py-4 px-6 text-sm text-card-foreground">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-accent/50 text-accent-foreground border border-accent/30">
          {event.category}
        </span>
      </td>

      {/* Status */}
      <td className="py-4 px-6">
        <div className="flex flex-col space-y-2">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
            event.isPublished 
              ? 'bg-success/10 text-success border border-success/20' 
              : 'bg-warning/10 text-warning border border-warning/20'
          }`}>
            {event.isPublished ? 'Published' : 'Draft'}
          </span>
          {event.isFeatured && (
            <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-purple-10 text-purple rounded-full border border-purple/20">
              Featured
            </span>
          )}
        </div>
      </td>

      {/* Actions */}
      <td className="py-4 px-6">
        <div className="flex space-x-2">
          <button
            onClick={() => openModal('flag', event)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              event.isFlagged 
                ? 'bg-info text-white hover:bg-info/80' 
                : 'bg-warning text-white hover:bg-warning/80'
            }`}
          >
            <FlagIcon className="w-3 h-3 mr-1 inline" />
            {event.isFlagged ? 'Unflag' : 'Flag'}
          </button>
          
          <button
            onClick={() => openModal('delete', event)}
            className="px-3 py-1.5 text-xs font-medium bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/80 transition-all"
          >
            <TrashIcon className="w-3 h-3 mr-1 inline" />
            Delete
          </button>
          
          <Link
            to={`/event/${event._id}`}
            className="px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-lg hover:bg-card-hover transition-all"
          >
            <EyeIcon className="w-3 h-3 mr-1 inline" />
            View
          </Link>
        </div>
      </td>
    </tr>
  ), [openModal]);

  // Load events on mount
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface-secondary to-surface-primary">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <AdminPageHeader
          icon={<CalendarIcon className="w-8 h-8" />}
          title="Event Management"
          description="Manage and monitor all events in the system"
          iconBgColor="text-brand-primary"
        />

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {statsCards.map((card, index) => (
            <StatsCard key={index} {...card} />
          ))}
        </div>

        {/* Search and Filters */}
        <UserSearchFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          filteredCount={filteredEvents.length}
          totalCount={events.length}
          itemType="events"
          searchPlaceholder="Search events by title or organizer..."
          statusOptions={statusOptions}
          categoryOptions={categoryOptions}
          showCategory={true}
          showRole={false}
        />

        {/* Error Alert */}
        {error && (
          <div className="bg-destructive/10 border-2 border-destructive/20 text-destructive px-6 py-4 rounded-xl mb-6 flex items-center gap-3 animate-fade-in">
            <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Events Table */}
        <AdminTable
          loading={loading}
          filteredItems={filteredEvents}
          searchTerm={searchTerm}
          roleFilter="event"
          statusFilter={statusFilter}
          renderRow={renderEventRow}
          columns={columns}
          emptyStateConfig={emptyStateConfig}
        />

        {/* Admin Confirmation Modal */}
        <AdminConfirmationModal
          modalType={modal.type || 'delete'}
          isOpen={modal.isOpen}
          onClose={closeModal}
          userName={modal.eventTitle}
          isFlagged={modal.isFlagged}
          flagReason={modal.flagReason}
          onFlagReasonChange={(e) => setModal(prev => ({ ...prev, flagReason: e.target.value }))}
          onConfirm={handleConfirm}
        />
      </div>
    </div>
  );
};

export default EventsManagement; 