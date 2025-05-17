import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { 
  PencilIcon, 
  CameraIcon, 
  UserIcon, 
  BuildingOfficeIcon, 
  LinkIcon, 
  EnvelopeIcon,
  DocumentTextIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const Profile = () => {
  const { user, updateUserInfo } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [organizerProfile, setOrganizerProfile] = useState(null);
  const [feedbackSummary, setFeedbackSummary] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formValues, setFormValues] = useState({
    name: '',
    organizationName: '',
    bio: '',
    email: '',
    socialLinks: {
      website: '',
      linkedin: '',
      twitter: '',
      instagram: '',
    },
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        // Get organizer profile data
        const profileResponse = await axios.get('/organizer/profile');
        if (profileResponse.data.success) {
          const profileData = profileResponse.data.profile;
          setOrganizerProfile(profileData);
          
          // Set form values
          setFormValues({
            name: profileData.name || '',
            organizationName: profileData.organizationName || '',
            bio: profileData.bio || '',
            email: profileData.email || '',
            socialLinks: {
              website: profileData.socialLinks?.website || '',
              linkedin: profileData.socialLinks?.linkedin || '',
              twitter: profileData.socialLinks?.twitter || '',
              instagram: profileData.socialLinks?.instagram || '',
            },
          });
        }
        
        // Get feedback summary
        const feedbackResponse = await axios.get('/organizer/feedback/summary');
        if (feedbackResponse.data.success) {
          setFeedbackSummary(feedbackResponse.data.summary);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setError('Failed to load profile data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, []);
  
  const toggleEditMode = () => {
    if (editMode) {
      // Reset form values when canceling edit
      setFormValues({
        name: organizerProfile?.name || '',
        organizationName: organizerProfile?.organizationName || '',
        bio: organizerProfile?.bio || '',
        email: organizerProfile?.email || '',
        socialLinks: {
          website: organizerProfile?.socialLinks?.website || '',
          linkedin: organizerProfile?.socialLinks?.linkedin || '',
          twitter: organizerProfile?.socialLinks?.twitter || '',
          instagram: organizerProfile?.socialLinks?.instagram || '',
        },
      });
    }
    setEditMode(!editMode);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };
  
  const handleSocialLinkChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      socialLinks: {
        ...formValues.socialLinks,
        [name]: value,
      },
    });
  };
  
  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await axios.put('/organizer/profile', formValues);
      
      if (response.data.success) {
        setOrganizerProfile({
          ...organizerProfile,
          ...formValues,
        });
        
        // Update auth context if available
        if (updateUserInfo) {
          updateUserInfo({
            name: formValues.name,
            email: formValues.email,
          });
        }
        
        setEditMode(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleProfilePictureClick = () => {
    fileInputRef.current.click();
  };
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    setSaving(true);
    try {
      const response = await axios.post('/organizer/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        setOrganizerProfile({
          ...organizerProfile,
          profilePicture: response.data.profilePicture,
        });
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setError('Failed to upload profile picture. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 ml-4">Loading profile...</h2>
        </div>
      </div>
    );
  }

  if (!organizerProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 dark:bg-red-800 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded relative">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> Failed to load profile data.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="bg-red-100 dark:bg-red-800 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded relative mb-6">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Info */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Organizer Profile</h1>
                <button
                  onClick={toggleEditMode}
                  className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition"
                >
                  {editMode ? (
                    'Cancel'
                  ) : (
                    <>
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit Profile
                    </>
                  )}
                </button>
              </div>
              
              <div className="flex flex-col md:flex-row">
                {/* Profile Picture */}
                <div className="flex-shrink-0 mb-6 md:mb-0 md:mr-8">
                  <div className="relative group">
                    <div 
                      className="h-32 w-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden cursor-pointer"
                      onClick={handleProfilePictureClick}
                    >
                      {organizerProfile.profilePicture ? (
                        <img 
                          src={organizerProfile.profilePicture} 
                          alt="Profile" 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-5xl text-gray-400 dark:text-gray-500">
                          {organizerProfile.name ? organizerProfile.name.charAt(0) : '?'}
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                        <CameraIcon className="h-10 w-10 text-white" />
                      </div>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                  
                  {feedbackSummary && (
                    <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Organizer Rating</h3>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, index) => (
                          <StarIcon
                            key={index}
                            className={`h-4 w-4 ${
                              index < Math.floor(feedbackSummary.averageRating || 0)
                                ? 'text-yellow-500 fill-current'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        ))}
                        <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
                          {feedbackSummary.averageRating ? feedbackSummary.averageRating.toFixed(1) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Profile Details */}
                <div className="flex-grow">
                  {editMode ? (
                    <form onSubmit={saveProfile}>
                      <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          <UserIcon className="h-5 w-5 inline mr-1" />
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formValues.name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          required
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          <BuildingOfficeIcon className="h-5 w-5 inline mr-1" />
                          Organization Name
                        </label>
                        <input
                          type="text"
                          id="organizationName"
                          name="organizationName"
                          value={formValues.organizationName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          <EnvelopeIcon className="h-5 w-5 inline mr-1" />
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formValues.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          required
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          <DocumentTextIcon className="h-5 w-5 inline mr-1" />
                          Bio / About
                        </label>
                        <textarea
                          id="bio"
                          name="bio"
                          rows={4}
                          value={formValues.bio}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-3 mt-6">
                        <button
                          type="button"
                          onClick={toggleEditMode}
                          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 transition flex items-center"
                          disabled={saving}
                        >
                          {saving ? (
                            <>
                              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Saving...
                            </>
                          ) : (
                            'Save Changes'
                          )}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                          <UserIcon className="h-5 w-5 mr-1" />
                          Full Name
                        </p>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">{organizerProfile.name}</p>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                          <BuildingOfficeIcon className="h-5 w-5 mr-1" />
                          Organization
                        </p>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          {organizerProfile.organizationName || 'Not specified'}
                        </p>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                          <EnvelopeIcon className="h-5 w-5 mr-1" />
                          Email Address
                        </p>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">{organizerProfile.email}</p>
                      </div>
                      
                      {organizerProfile.bio && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                            <DocumentTextIcon className="h-5 w-5 mr-1" />
                            Bio
                          </p>
                          <p className="text-gray-700 dark:text-gray-300">{organizerProfile.bio}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Social Links */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Social Links</h2>
            
            {editMode ? (
              <form>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Website URL
                    </label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={formValues.socialLinks.website}
                      onChange={handleSocialLinkChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      id="linkedin"
                      name="linkedin"
                      value={formValues.socialLinks.linkedin}
                      onChange={handleSocialLinkChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Twitter / X
                    </label>
                    <input
                      type="url"
                      id="twitter"
                      name="twitter"
                      value={formValues.socialLinks.twitter}
                      onChange={handleSocialLinkChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="https://twitter.com/username"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Instagram
                    </label>
                    <input
                      type="url"
                      id="instagram"
                      name="instagram"
                      value={formValues.socialLinks.instagram}
                      onChange={handleSocialLinkChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="https://instagram.com/username"
                    />
                  </div>
                </div>
              </form>
            ) : (
              <div>
                {Object.values(organizerProfile.socialLinks || {}).some(link => link) ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {organizerProfile.socialLinks?.website && (
                      <a 
                        href={organizerProfile.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <LinkIcon className="h-5 w-5 mr-2" />
                        Website
                      </a>
                    )}
                    
                    {organizerProfile.socialLinks?.linkedin && (
                      <a 
                        href={organizerProfile.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <LinkIcon className="h-5 w-5 mr-2" />
                        LinkedIn
                      </a>
                    )}
                    
                    {organizerProfile.socialLinks?.twitter && (
                      <a 
                        href={organizerProfile.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <LinkIcon className="h-5 w-5 mr-2" />
                        Twitter / X
                      </a>
                    )}
                    
                    {organizerProfile.socialLinks?.instagram && (
                      <a 
                        href={organizerProfile.socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <LinkIcon className="h-5 w-5 mr-2" />
                        Instagram
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No social links added yet. Click edit to add your social profiles.</p>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Right Column: Feedback Summary */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Feedback Summary</h2>
            
            {feedbackSummary ? (
              <div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Overall Rating</h3>
                  <div className="flex items-center mb-1">
                    <div className="flex mr-2">
                      {[...Array(5)].map((_, index) => (
                        <StarIcon
                          key={index}
                          className={`h-5 w-5 ${
                            index < Math.floor(feedbackSummary.averageRating || 0)
                              ? 'text-yellow-500 fill-current'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xl font-bold text-gray-800 dark:text-gray-200">
                      {feedbackSummary.averageRating ? feedbackSummary.averageRating.toFixed(1) : 'N/A'}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 ml-1">/ 5</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Based on {feedbackSummary.totalFeedback || 0} feedback submissions
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Feedback Breakdown</h3>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count = feedbackSummary.ratingCounts?.[rating] || 0;
                        const percentage = feedbackSummary.totalFeedback
                          ? Math.round((count / feedbackSummary.totalFeedback) * 100)
                          : 0;
                        
                        return (
                          <div key={rating} className="flex items-center">
                            <div className="w-12 text-sm text-gray-600 dark:text-gray-400">{rating} stars</div>
                            <div className="flex-grow mx-2">
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    rating >= 4
                                      ? 'bg-green-500'
                                      : rating >= 3
                                      ? 'bg-yellow-500'
                                      : 'bg-red-500'
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="w-9 text-sm text-gray-600 dark:text-gray-400 text-right">{percentage}%</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {feedbackSummary.recentFeedback && feedbackSummary.recentFeedback.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Recent Feedback</h3>
                      <div className="space-y-3">
                        {feedbackSummary.recentFeedback.slice(0, 3).map((feedback, index) => (
                          <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <div className="flex justify-between">
                              <span className="text-gray-700 dark:text-gray-300 font-medium">{feedback.eventTitle}</span>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <StarIcon 
                                    key={i} 
                                    className={`h-4 w-4 ${i < feedback.rating ? 'text-yellow-500 fill-current' : 'text-gray-300 dark:text-gray-600'}`} 
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{feedback.comment}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                              {new Date(feedback.date).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No feedback data available yet. As you host more events and receive feedback, this section will be populated.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 