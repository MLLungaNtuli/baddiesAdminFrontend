<!-- components/escorts/EscortCard.vue -->
<template>
  <div class="escort-card">
    <!-- Card Header with Image -->
    <div class="card-header">
      <div class="header-image">
        <img 
          :src="escort.profile_image || 'https://via.placeholder.com/400x200?text=No+Image'" 
          :alt="escort.stage_name"
          class="profile-image"
        />
        <div class="image-overlay">
          <span class="price-badge">${{ escort.price_per_hour }}/hr</span>
        </div>
      </div>
      <div class="status-badges">
        <span 
          v-if="escort.verified"
          class="badge verified"
          title="Verified Escort"
        >
          <i class="pi pi-verified"></i> Verified
        </span>
        <span 
          :class="['badge', escort.active ? 'active' : 'inactive']"
          :title="escort.active ? 'Active Profile' : 'Inactive Profile'"
        >
          <i :class="['pi', escort.active ? 'pi-check' : 'pi-times']"></i>
          {{ escort.active ? 'Active' : 'Inactive' }}
        </span>
      </div>
    </div>

    <!-- Card Body -->
    <div class="card-body">
      <div class="escort-info">
        <div class="name-section">
          <h3>{{ escort.stage_name }}</h3>
          <span class="age">{{ escort.age }} years</span>
        </div>
        
        <div class="meta-info">
          <div class="meta-item">
            <i class="pi pi-map-marker"></i>
            <span>{{ escort.location }}</span>
          </div>
          <div class="meta-item">
            <i class="pi pi-phone"></i>
            <span>{{ formatPhone(escort.phone_number) }}</span>
          </div>
          <div class="meta-item">
            <i class="pi pi-calendar"></i>
            <span>Joined {{ formatDate(escort.created_at) }}</span>
          </div>
        </div>

        <div class="bio-section">
          <p class="bio">{{ truncateBio(escort.bio) }}</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="card-actions">
        <div class="action-group">
          <Button 
            v-if="!escort.verified"
            icon="pi pi-check" 
            label="Verify"
            size="small"
            severity="success"
            outlined
            @click="verifyEscort"
          />
          <Button 
            :icon="escort.active ? 'pi pi-times' : 'pi pi-check'" 
            :label="escort.active ? 'Deactivate' : 'Activate'"
            size="small"
            :severity="escort.active ? 'danger' : 'success'"
            outlined
            @click="toggleActive"
          />
        </div>
        <div class="action-group">
          <Button 
            icon="pi pi-eye" 
            label="View"
            size="small"
            outlined
            @click="viewDetails"
          />
          <Button 
            icon="pi pi-pencil" 
            label="Edit"
            size="small"
            severity="secondary"
            outlined
            @click="editEscort"
          />
          <Button 
            icon="pi pi-trash" 
            label="Delete"
            size="small"
            severity="danger"
            outlined
            @click="deleteEscort"
          />
        </div>
      </div>
    </div>

    <!-- Card Footer -->
    <div class="card-footer">
      <div class="availability">
        <i class="pi pi-circle-fill" :class="escort.available ? 'available' : 'unavailable'"></i>
        <span>{{ escort.available ? 'Available Now' : 'Currently Unavailable' }}</span>
      </div>
      <div class="last-updated">
        Last updated: {{ formatTime(escort.created_at) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import api from '@/services/api'

const props = defineProps({
  escort: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['refresh'])
const router = useRouter()

// Formatting functions
const formatPhone = (phone) => {
  return phone || 'No phone'
}

const formatDate = (dateString) => {
  if (!dateString) return 'Invalid Date'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    year: 'numeric' 
  })
}

const formatTime = (dateString) => {
  if (!dateString) return 'Invalid Date'
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const truncateBio = (bio) => {
  if (!bio) return 'No bio provided'
  return bio.length > 120 ? bio.substring(0, 120) + '...' : bio
}

// Action methods
const verifyEscort = async () => {
  try {
    await api.patch(`/api/admin/escorts/${props.escort.id}/verify`)
    emit('refresh')
  } catch (error) {
    console.error('Error verifying escort:', error)
  }
}

const toggleActive = async () => {
  try {
    await api.patch(`/api/admin/escorts/${props.escort.id}/active`, {
      active: !props.escort.active
    })
    emit('refresh')
  } catch (error) {
    console.error('Error toggling active status:', error)
  }
}

const viewDetails = () => {
  console.log('Clicking View for escort:', props.escort.id)
  // router.push(`/escort/${props.escort.id}`)
  router.push({ name: 'escort-profile', params: { id: props.escort.id } })
}

const editEscort = () => {
  // Implement edit modal
  console.log('Edit escort:', props.escort.id)
}

const deleteEscort = async () => {
  if (confirm('Are you sure you want to delete this escort? This action cannot be undone.')) {
    try {
      await api.delete(`/api/admin/escorts/${props.escort.id}`)
      emit('refresh')
    } catch (error) {
      console.error('Error deleting escort:', error)
    }
  }
}
</script>

<style scoped>
.escort-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.escort-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  border-color: #d1d5db;
}

/* Card Header */
.card-header {
  position: relative;
}

.header-image {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.escort-card:hover .profile-image {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: 12px;
  right: 12px;
}

.price-badge {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  backdrop-filter: blur(4px);
}

.status-badges {
  position: absolute;
  bottom: -12px;
  left: 12px;
  display: flex;
  gap: 8px;
}

.badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.badge.verified {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.badge.active {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.badge.inactive {
  background: #6b7280;
  color: white;
}

/* Card Body */
.card-body {
  padding: 24px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.name-section {
  margin-bottom: 16px;
}

.name-section h3 {
  margin: 0 0 4px 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.name-section .age {
  color: #6b7280;
  font-size: 0.875rem;
}

.meta-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4b5563;
  font-size: 0.875rem;
}

.meta-item i {
  color: #9ca3af;
  font-size: 0.875rem;
}

.bio-section {
  margin-bottom: 20px;
  flex-grow: 1;
}

.bio {
  color: #374151;
  font-size: 0.875rem;
  line-height: 1.6;
  margin: 0;
}

/* Card Actions */
.card-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* Card Footer */
.card-footer {
  padding: 16px 24px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.availability {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
}

.availability .available {
  color: #10b981;
}

.availability .unavailable {
  color: #ef4444;
}

.last-updated {
  color: #9ca3af;
  font-size: 0.75rem;
}

/* Responsive */
@media (max-width: 768px) {
  .card-actions {
    flex-direction: column;
  }
  
  .action-group {
    width: 100%;
  }
  
  .action-group button {
    flex: 1;
  }
}
</style>