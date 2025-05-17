import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { 
  ShieldCheckIcon, 
  CogIcon,
  KeyIcon
} from '@heroicons/react/24/outline';

const Settings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [settings, setSettings] = useState({
    privacy: {
      showEmail: false,
      showPhone: false,
      publicProfile: true
    },
    security: {
      twoFactorAuth: false
    }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        // This endpoint would need to be implemented on the backend
        // For now, we'll just use default values after a delay
        setTimeout(() => {
          setLoading(false);
        }, 1000);
        
        // When the endpoint exists, uncomment this code:
        /*
        const response = await axios.get('/organizer/settings');
        if (response.data.success) {
          setSettings(response.data.settings);
        }
        */
      } catch (error) {
        console.error('Error fetching settings:', error);
        setMessage({
          type: 'error',
          text: 'Failed to load settings. Please try again.'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);
  
  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      // This endpoint would need to be implemented on the backend
      // For now, we'll just simulate a successful save
      setTimeout(() => {
        setMessage({
          type: 'success',
          text: 'Settings saved successfully!'
        });
        setSaving(false);
      }, 1000);
      
      // When the endpoint exists, uncomment this code:
      /*
      const response = await axios.put('/organizer/settings', settings);
      if (response.data.success) {
        setMessage({
          type: 'success',
          text: 'Settings saved successfully!'
        });
      }
      */
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({
        type: 'error',
        text: 'Failed to save settings. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleToggle = (category, setting) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting]
      }
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 ml-4">Loading settings...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden mb-8">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4">
          <h1 className="text-xl font-bold text-white flex items-center">
            <CogIcon className="h-6 w-6 mr-2" />
            Organizer Settings
          </h1>
        </div>
        
        {/* Message display */}
        {message.text && (
          <div className={`mx-6 mt-4 p-3 rounded ${
            message.type === 'success' 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-200' 
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-200'
          }`}>
            {message.text}
          </div>
        )}
        
        <div className="p-6">
          {/* Privacy Settings */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <ShieldCheckIcon className="h-5 w-5 mr-2 text-blue-500" />
              Privacy Settings
            </h2>
            
            <div className="bg-gray-800 rounded-lg p-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-base text-gray-300">Show Email to Attendees</label>
                  <div className="relative inline-block w-12 mr-2 align-middle select-none">
                    <input 
                      type="checkbox" 
                      checked={settings.privacy.showEmail}
                      onChange={() => handleToggle('privacy', 'showEmail')}
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                    />
                    <label 
                      className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                        settings.privacy.showEmail ? 'bg-blue-500' : 'bg-gray-600'
                      }`}
                    ></label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-base text-gray-300">Show Phone Number</label>
                  <div className="relative inline-block w-12 mr-2 align-middle select-none">
                    <input 
                      type="checkbox" 
                      checked={settings.privacy.showPhone}
                      onChange={() => handleToggle('privacy', 'showPhone')}
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                    />
                    <label 
                      className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                        settings.privacy.showPhone ? 'bg-blue-500' : 'bg-gray-600'
                      }`}
                    ></label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-base text-gray-300">Public Organizer Profile</label>
                  <div className="relative inline-block w-12 mr-2 align-middle select-none">
                    <input 
                      type="checkbox" 
                      checked={settings.privacy.publicProfile}
                      onChange={() => handleToggle('privacy', 'publicProfile')}
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                    />
                    <label 
                      className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                        settings.privacy.publicProfile ? 'bg-blue-500' : 'bg-gray-600'
                      }`}
                    ></label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Security Settings */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <KeyIcon className="h-5 w-5 mr-2 text-blue-500" />
              Security Settings
            </h2>
            
            <div className="bg-gray-800 rounded-lg p-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-base text-gray-300">Two-Factor Authentication</label>
                  <div className="relative inline-block w-12 mr-2 align-middle select-none">
                    <input 
                      type="checkbox" 
                      checked={settings.security.twoFactorAuth}
                      onChange={() => handleToggle('security', 'twoFactorAuth')}
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                    />
                    <label 
                      className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                        settings.security.twoFactorAuth ? 'bg-blue-500' : 'bg-gray-600'
                      }`}
                    ></label>
                  </div>
                </div>
                
                <div className="mt-4">
                  <button 
                    type="button" 
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white text-base font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              {saving ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 