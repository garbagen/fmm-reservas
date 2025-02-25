import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import EnhancedAdminTable from './Table';
import { Plus, X, Image, Clock, Calendar } from 'lucide-react';

const SiteList = () => {
  const [sites, setSites] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();

  const initialFormState = {
    name: '',
    description: '',
    imageUrl: '',
    timeSlots: [{ time: '', capacity: '', days: [] }]
  };

  // Available days for selection
  const availableDays = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
  ];

  const [formData, setFormData] = useState(initialFormState);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/sites`);
      if (!response.ok) throw new Error('Failed to fetch sites');
      const data = await response.json();
      setSites(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      let imageUrl = formData.imageUrl;

      // Handle image upload if a new file is selected
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);

        const uploadResponse = await fetch(`${import.meta.env.VITE_API_URL}/sites/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (!uploadResponse.ok) throw new Error('Failed to upload image');
        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.imageUrl;
      }

      // Prepare site data - filter out any empty time slots or ones with no days selected
      const siteData = {
        ...formData,
        imageUrl,
        timeSlots: formData.timeSlots.filter(slot => 
          slot.time && 
          slot.capacity && 
          slot.days && 
          slot.days.length > 0
        )
      };

      // Create or update site
      const url = selectedSite 
        ? `${import.meta.env.VITE_API_URL}/sites/${selectedSite._id}`
        : `${import.meta.env.VITE_API_URL}/sites`;

      const response = await fetch(url, {
        method: selectedSite ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(siteData)
      });

      if (!response.ok) throw new Error('Failed to save site');

      fetchSites();
      handleCloseModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (siteId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/sites/${siteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete site');
      await fetchSites();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBulkDelete = async (siteIds) => {
    try {
      await Promise.all(
        siteIds.map(id =>
          fetch(`${import.meta.env.VITE_API_URL}/sites/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        )
      );
      await fetchSites();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (site) => {
    setSelectedSite(site);
    
    // Transform existing site data to match our new structure with days
    // If the site data doesn't have days yet, initialize with empty array
    const timeSlots = site.timeSlots.map(slot => ({
      ...slot,
      days: slot.days || []
    }));
    
    // If there are no time slots, add an empty one
    if (timeSlots.length === 0) {
      timeSlots.push({ time: '', capacity: '', days: [] });
    }
    
    setFormData({
      name: site.name,
      description: site.description,
      imageUrl: site.imageUrl || '',
      timeSlots
    });
    
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSite(null);
    setFormData(initialFormState);
    setImageFile(null);
    setError('');
  };

  const handleAddTimeSlot = () => {
    setFormData({
      ...formData,
      timeSlots: [...formData.timeSlots, { time: '', capacity: '', days: [] }]
    });
  };

  const handleRemoveTimeSlot = (index) => {
    setFormData({
      ...formData,
      timeSlots: formData.timeSlots.filter((_, i) => i !== index)
    });
  };

  const handleTimeSlotChange = (index, field, value) => {
    const newTimeSlots = [...formData.timeSlots];
    newTimeSlots[index] = { ...newTimeSlots[index], [field]: value };
    setFormData({ ...formData, timeSlots: newTimeSlots });
  };

  const handleDayChange = (index, day) => {
    const newTimeSlots = [...formData.timeSlots];
    const currentDays = newTimeSlots[index].days || [];
    
    // Toggle the day (add if not present, remove if present)
    if (currentDays.includes(day)) {
      newTimeSlots[index].days = currentDays.filter(d => d !== day);
    } else {
      newTimeSlots[index].days = [...currentDays, day];
    }
    
    setFormData({ ...formData, timeSlots: newTimeSlots });
  };

  // Format time slots for display in the table
  const formatTimeSlots = (slots) => {
    if (!slots || slots.length === 0) return 'No time slots';
    
    return slots
      .filter(slot => slot.time && slot.capacity)
      .map(slot => {
        // Format days if available
        const daysString = slot.days && slot.days.length > 0 
          ? `(${slot.days.map(day => day.charAt(0).toUpperCase() + day.slice(1, 3)).join(', ')})` 
          : '';
          
        return `${slot.time} (${slot.capacity}) ${daysString}`;
      })
      .join(', ');
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (value) => value
    },
    {
      key: 'description',
      header: 'Description',
      render: (value) => (
        <div className="max-w-xs truncate">
          {value}
        </div>
      )
    },
    {
      key: 'timeSlots',
      header: 'Time Slots',
      render: (value) => formatTimeSlots(value)
    },
    {
      key: 'imageUrl',
      header: 'Image',
      render: (value) => (
        value ? (
          <img 
            src={value} 
            alt="Site" 
            className="w-16 h-16 object-cover rounded"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-500">
            No image
          </div>
        )
      )
    }
  ];

  if (loading) return <div className="text-center">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Heritage Sites</h2>
        <button
          onClick={() => {
            setSelectedSite(null);
            setFormData(initialFormState);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Site
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <EnhancedAdminTable
        data={sites}
        columns={columns}
        onDelete={handleDelete}
        onEdit={handleEdit}
        onBulkDelete={handleBulkDelete}
        filename="heritage-sites"
      />

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold">
                {selectedSite ? 'Edit Site' : 'Add New Site'}
              </h3>
              <button onClick={handleCloseModal}>
                <X className="w-6 h-6 text-gray-500 hover:text-gray-700" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                {/* Site Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>

                {/* Site Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                    rows="3"
                    required
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      onChange={(e) => setImageFile(e.target.files[0])}
                      accept="image/*"
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex items-center px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200"
                    >
                      <Image className="w-4 h-4 mr-2" />
                      Choose Image
                    </label>
                    {(imageFile || formData.imageUrl) && (
                      <span className="text-sm text-gray-600">
                        {imageFile ? imageFile.name : 'Current image'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Time Slots with Days */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Slots & Days
                  </label>
                  {formData.timeSlots.map((slot, index) => (
                    <div key={index} className="mb-6 p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-gray-500 mr-2" />
                          <input
                            type="time"
                            value={slot.time}
                            onChange={(e) => handleTimeSlotChange(index, 'time', e.target.value)}
                            className="p-2 border rounded-lg"
                          />
                        </div>
                        <div className="flex items-center">
                          <input
                            type="number"
                            value={slot.capacity}
                            onChange={(e) => handleTimeSlotChange(index, 'capacity', e.target.value)}
                            placeholder="Capacity"
                            className="p-2 border rounded-lg"
                            min="1"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveTimeSlot(index)}
                          className="p-2 text-red-600 hover:text-red-800 ml-auto"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Days selection */}
                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                          <Calendar className="w-4 h-4 mr-2" />
                          Available Days
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {availableDays.map((day) => (
                            <label 
                              key={day.value} 
                              className={`
                                flex items-center px-3 py-1 rounded-lg border cursor-pointer
                                ${slot.days?.includes(day.value) 
                                  ? 'bg-blue-100 border-blue-500 text-blue-700' 
                                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}
                              `}
                            >
                              <input
                                type="checkbox"
                                checked={slot.days?.includes(day.value) || false}
                                onChange={() => handleDayChange(index, day.value)}
                                className="hidden"
                              />
                              {day.label}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddTimeSlot}
                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Time Slot
                  </button>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                  >
                    {selectedSite ? 'Update Site' : 'Create Site'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteList;