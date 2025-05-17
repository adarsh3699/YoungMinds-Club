import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import XPProgressBar from '../../components/user/XPProgressBar';
import { PencilIcon, CameraIcon, AcademicCapIcon, BuildingLibraryIcon, EnvelopeIcon, UserIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

const Profile = () => {
  const { user, updateUserInfo } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [xpHistory, setXPHistory] = useState([]);
  const [badges, setBadges] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    college: '',
  });
  const [applyingForOrganizer, setApplyingForOrganizer] = useState(false);
  const [organizerApplication, setOrganizerApplication] = useState({
    organizationName: '',
    reason: '',
    experience: '',
    socialLinks: '',
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        // Get user profile data
        const profileResponse = await axios.get('/user/profile');
        if (profileResponse?.data?.success) {
          const profileData = profileResponse.data.profile || {};
          setUserProfile(profileData);
          setFormValues({
            name: profileData?.name || '',
            email: profileData?.email || '',
            college: profileData?.college || '',
          });
        } else {
          // Create default profile if response is not successful
          const defaultProfile = { name: user?.name || '', email: user?.email || '' };
          setUserProfile(defaultProfile);
          setFormValues({
            name: defaultProfile.name,
            email: defaultProfile.email,
            college: '',
          });
        }
        
        // Get XP history
        const xpResponse = await axios.get('/user/xp-history');
        if (xpResponse?.data?.success) {
          setXPHistory(xpResponse.data.xpHistory || []);
        } else {
          setXPHistory([]);
        }
        
        // Get badges collection
        const badgesResponse = await axios.get('/user/badges');
        if (badgesResponse?.data?.success) {
          setBadges(badgesResponse.data.badges || []);
        } else {
          setBadges([]);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setError('Failed to load profile data. Please try again.');
        
        // Set defaults in case of error
        const defaultProfile = { name: user?.name || '', email: user?.email || '' };
        setUserProfile(defaultProfile);
        setFormValues({
          name: defaultProfile.name,
          email: defaultProfile.email,
          college: '',
        });
        setXPHistory([]);
        setBadges([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [user]);
  
  const toggleEditMode = () => {
    if (editMode) {
      // Reset form values when canceling edit
      setFormValues({
        name: userProfile?.name || '',
        email: userProfile?.email || '',
        college: userProfile?.college || '',
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
  
  const handleApplicationChange = (e) => {
    const { name, value } = e.target;
    setOrganizerApplication({
      ...organizerApplication,
      [name]: value,
    });
  };
  
  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await axios.put('/user/profile', formValues);
      
      if (response.data.success) {
        setUserProfile({
          ...userProfile,
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
  
  const submitOrganizerApplication = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await axios.post('/user/apply-organizer', organizerApplication);
      
      if (response.data.success) {
        setApplyingForOrganizer(false);
        // Show success message or notification
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setError('Failed to submit organizer application. Please try again.');
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
      const response = await axios.post('/user/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        setUserProfile({
          ...userProfile,
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
  
  // Badge styling helper
  const getBadgeInfo = (badgeName) => {
    switch (badgeName) {
      case 'Newbie':
        return { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', icon: '🌱' };
      case 'Regular':
        return { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: '🌟' };
      case 'Champ':
        return { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300', icon: '🏆' };
      case 'Veteran':
        return { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300', icon: '🔥' };
      case 'Master':
        return { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', icon: '👑' };
      default:
        return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300', icon: '❓' };
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

  if (!userProfile) {
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
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Profile Information</h1>
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
                      {userProfile?.profilePicture ? (
                        <img 
                          src={userProfile.profilePicture} 
                          alt="Profile" 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-5xl text-gray-400 dark:text-gray-500">
                          {userProfile?.name ? userProfile.name.charAt(0) : '?'}
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
                        <label htmlFor="college" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          <BuildingLibraryIcon className="h-5 w-5 inline mr-1" />
                          College/University
                        </label>
                        <input
                          type="text"
                          id="college"
                          name="college"
                          value={formValues.college}
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
                        <p className="text-lg font-medium text-gray-900 dark:text-white">{userProfile?.name || 'Not specified'}</p>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                          <EnvelopeIcon className="h-5 w-5 mr-1" />
                          Email Address
                        </p>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">{userProfile?.email || 'Not specified'}</p>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                          <BuildingLibraryIcon className="h-5 w-5 mr-1" />
                          College/University
                        </p>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          {userProfile?.college || 'Not specified'}
                        </p>
                      </div>
                      
                      <div className="mt-6">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                          <AcademicCapIcon className="h-5 w-5 mr-1" />
                          Current Badge Level
                        </p>
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getBadgeInfo(userProfile?.badge || 'Newbie').color}`}>
                            <span className="mr-1">{getBadgeInfo(userProfile?.badge || 'Newbie').icon}</span>
                            {userProfile?.badge || 'Newbie'}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* XP Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">XP Progress</h2>
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400 mb-1">Current XP: {userProfile?.xp || 0}</p>
              <XPProgressBar xp={userProfile?.xp || 0} />
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
                {userProfile?.xp || 0} / {Math.ceil((userProfile?.xp || 0) / 100) * 100} XP to next level
              </p>
            </div>
            
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">XP History</h3>
            
            {!xpHistory || xpHistory.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No XP history available.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Activity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">XP Earned</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {xpHistory.map((entry) => (
                      <tr key={entry?._id || Math.random().toString()}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {entry?.date ? new Date(entry.date).toLocaleDateString() : 'Unknown date'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                          {entry?.description || 'Unknown activity'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400 font-medium">
                          +{entry?.amount || 0} XP
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Column: Badges & Organizer Application */}
        <div>
          {/* Badges Collection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Badge Collection</h2>
            
            {!badges || badges.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No badges earned yet. Participate in events to earn badges!</p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {badges.map((badge) => (
                  <div 
                    key={badge?._id || Math.random().toString()} 
                    className={`${getBadgeInfo(badge?.name || 'Newbie').color} p-4 rounded-lg text-center ${!(badge?.unlocked ?? false) ? 'opacity-50' : ''}`}
                  >
                    <div className="text-3xl mb-2">{getBadgeInfo(badge?.name || 'Newbie').icon}</div>
                    <h3 className="font-semibold mb-1">{badge?.name || 'Badge'}</h3>
                    <p className="text-xs">{badge?.description || 'Description unavailable'}</p>
                    {!(badge?.unlocked ?? true) && (
                      <p className="text-xs mt-2 font-semibold">Locked</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Apply to become Organizer */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Become an Organizer</h2>
            
            {applyingForOrganizer ? (
              <form onSubmit={submitOrganizerApplication}>
                <div className="mb-4">
                  <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    id="organizationName"
                    name="organizationName"
                    value={organizerApplication.organizationName}
                    onChange={handleApplicationChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Why do you want to become an organizer?
                  </label>
                  <textarea
                    id="reason"
                    name="reason"
                    rows={3}
                    value={organizerApplication.reason}
                    onChange={handleApplicationChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Previous event organization experience
                  </label>
                  <textarea
                    id="experience"
                    name="experience"
                    rows={3}
                    value={organizerApplication.experience}
                    onChange={handleApplicationChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="socialLinks" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Social links or portfolio (optional)
                  </label>
                  <input
                    type="text"
                    id="socialLinks"
                    name="socialLinks"
                    value={organizerApplication.socialLinks}
                    onChange={handleApplicationChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="LinkedIn, portfolio website, etc."
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setApplyingForOrganizer(false)}
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
                        Submitting...
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Want to create and host your own events? Apply to become an organizer!
                </p>
                <button
                  onClick={() => setApplyingForOrganizer(true)}
                  className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center mx-auto"
                >
                  <ArrowUpTrayIcon className="h-4 w-4 mr-1" />
                  Apply to Become an Organizer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 