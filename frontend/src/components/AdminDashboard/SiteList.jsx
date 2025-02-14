import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Pencil, Trash2, X, Image } from 'lucide-react';

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
    timeSlots: [{ time: '', capacity: '' }]
  };

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

      // Prepare site data
      const siteData = {
        ...formData,
        imageUrl,
        timeSlots: formData.timeSlots.filter(slot => slot.time && slot.capacity)
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
    if (!window.confirm('Are you sure you want to delete this site?')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/sites/${siteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete site');
      fetchSites();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (site) => {
    setSelectedSite(site);
    setFormData({
      name: site.name,
      description: site.description,
      imageUrl: site.imageUrl || '',
      timeSlots: site.timeSlots.length > 0 ? site.timeSlots : [{ time: '', capacity: '' }]
    });
    setIsModalOpen(true);
  };

  const handleAddTimeSlot = () => {
    setFormData({
      ...formData,
      timeSlots: [...formData.timeSlots, { time: '', capacity: '' }]
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

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSite(null);
    setFormData(initialFormState);
    setImageFile(null);
    setError('');
  };

  if (loading) return <div className="text-center">Loading...</div>;

  return (
    <div>
      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Heritage Sites</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Site
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Sites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sites.map((site) => (
          <div key={site._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative h-48">
              <img
                src={site.imageUrl || "/api/placeholder/400/250"}
                alt={site.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{site.name}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">{site.description}</p>
              
              <div className="mb-4">
                <h4 className="font-medium mb-2">Time Slots:</h4>
                <ul className="space-y-1">
                  {site.timeSlots.map((slot, index) => (
                    slot.time && (
                      <li key={index} className="text-sm text-gray-600">
                        {slot.time} - Capacity: {slot.capacity}
                      </li>
                    )
                  ))}
                </ul>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleEdit(site)}
                  className="p-2 text-blue-600 hover:text-blue-800"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(site._id)}
                  className="p-2 text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

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

                {/* Time Slots */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Slots
                  </label>
                  {formData.timeSlots.map((slot, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="time"
                        value={slot.time}
                        onChange={(e) => handleTimeSlotChange(index, 'time', e.target.value)}
                        className="p-2 border rounded-lg"
                      />
                      <input
                        type="number"
                        value={slot.capacity}
                        onChange={(e) => handleTimeSlotChange(index, 'capacity', e.target.value)}
                        placeholder="Capacity"
                        className="p-2 border rounded-lg"
                        min="1"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveTimeSlot(index)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddTimeSlot}
                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Time Slot
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