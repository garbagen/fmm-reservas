// js/modules/siteManager.js

const SiteManager = {
    async loadSites() {
        const token = localStorage.getItem('adminToken');
        if (!token) return;

        try {
            const response = await fetch('https://fmm-reservas-api.onrender.com/api/sites', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const sites = await response.json();
            this.displaySites(sites);
        } catch (error) {
            console.error('Error loading sites:', error);
            window.toast.error('Error loading sites');
        }
    },

    displaySites(sites) {
        const sitesList = document.getElementById('sites-list');
        sitesList.innerHTML = '';

        sites.forEach(site => {
            const siteEditor = this.createSiteEditor(site);
            sitesList.appendChild(siteEditor);
        });
    },

    createSiteEditor(site = null) {
        const template = document.getElementById('site-editor-template');
        const editor = template.content.cloneNode(true).children[0];

        if (site) {
            editor.dataset.siteId = site._id;
            editor.querySelector('.site-name').value = site.name;
            editor.querySelector('.site-description').value = site.description;
            
            if (site.imageUrl) {
                const previewImage = editor.querySelector('#preview-image');
                previewImage.src = site.imageUrl;
                previewImage.classList.remove('hidden');
            }

            if (site.timeSlots && Array.isArray(site.timeSlots)) {
                site.timeSlots.forEach(slot => {
                    this.addTimeSlot(editor.querySelector('.add-button'), slot);
                });
            }
        }

        return editor;
    },

    addTimeSlot(button, existingSlot = null) {
        const template = document.getElementById('time-slot-template');
        const slot = template.content.cloneNode(true).children[0];
        const slotsList = button.closest('.time-slots').querySelector('.slots-list');

        if (existingSlot) {
            slot.querySelector('.slot-time').value = existingSlot.time;
            slot.querySelector('.slot-capacity').value = existingSlot.capacity;
        }

        slotsList.appendChild(slot);
    },

    async saveSite(button) {
        const token = localStorage.getItem('adminToken');
        if (!token) return;

        const editor = button.closest('.site-editor');
        const siteData = this.collectSiteData(editor);

        try {
            await this.uploadImage(editor, siteData);
            await this.saveSiteData(editor, siteData, token);
            
            window.toast.success(editor.dataset.siteId ? 
                'Site updated successfully!' : 
                'Site created successfully!');
            
            await this.loadSites();
        } catch (error) {
            console.error('Error saving site:', error);
            window.toast.error(error.message || 'Error saving site');
        }
    },

    collectSiteData(editor) {
        const siteData = {
            name: editor.querySelector('.site-name').value,
            description: editor.querySelector('.site-description').value,
            timeSlots: []
        };

        const slotElements = editor.querySelectorAll('.slot-item');
        slotElements.forEach(slot => {
            const time = slot.querySelector('.slot-time').value;
            const capacity = parseInt(slot.querySelector('.slot-capacity').value);
            if (time && !isNaN(capacity)) {
                siteData.timeSlots.push({ time, capacity });
            }
        });

        return siteData;
    },

    async uploadImage(editor, siteData) {
        const imageInput = editor.querySelector('.site-image');
        if (imageInput && imageInput.files && imageInput.files[0]) {
            const formData = new FormData();
            formData.append('image', imageInput.files[0]);

            const token = localStorage.getItem('adminToken');
            const uploadResponse = await fetch('https://fmm-reservas-api.onrender.com/api/sites/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!uploadResponse.ok) {
                throw new Error('Image upload failed');
            }

            const uploadResult = await uploadResponse.json();
            siteData.imageUrl = uploadResult.imageUrl;
        }
    },

    async saveSiteData(editor, siteData, token) {
        const siteId = editor.dataset.siteId;
        const url = siteId 
            ? `https://fmm-reservas-api.onrender.com/api/sites/${siteId}`
            : 'https://fmm-reservas-api.onrender.com/api/sites';

        const response = await fetch(url, {
            method: siteId ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(siteData)
        });

        if (!response.ok) {
            throw new Error('Failed to save site');
        }
    },

    async deleteSite(button) {
        const token = localStorage.getItem('adminToken');
        if (!token) return;

        const editor = button.closest('.site-editor');
        const siteId = editor.dataset.siteId;

        if (!siteId) {
            editor.remove();
            return;
        }

        if (!confirm('Are you sure you want to delete this site?')) {
            return;
        }

        try {
            const response = await fetch(`https://fmm-reservas-api.onrender.com/api/sites/${siteId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                window.toast.success('Site deleted successfully!');
                await this.loadSites();
            } else {
                window.toast.error('Error deleting site');
            }
        } catch (error) {
            console.error('Error deleting site:', error);
            window.toast.error('Error deleting site');
        }
    }
};

// Export for global use
window.SiteManager = SiteManager;