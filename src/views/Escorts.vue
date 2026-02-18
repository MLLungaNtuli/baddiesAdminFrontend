<!-- views/Escorts.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'

import EscortCard from '@/components/escorts/EscortCard.vue'

const router = useRouter()
const escorts = ref([]) // Fixed variable name - should be plural "escorts"
const viewMode = ref('cards')
const filter = ref(null)
const loading = ref(false)
const error = ref(null)

const filters = [
  { label: 'All', value: null },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Verified', value: 'verified' }
]

const loadEscorts = async () => {
  loading.value = true
  error.value = null
  
  try {
    console.log('Loading escorts...')
    const response = await api.get('/api/admin/escorts') // Should be plural "escorts"
    console.log('API Response:', response.data)
    escorts.value = response.data
    
    // Apply frontend filtering
    if (filter.value) {
      escorts.value = escorts.value.filter(e => {
        if (filter.value === 'active') return e.active === true
        if (filter.value === 'inactive') return e.active === false
        if (filter.value === 'verified') return e.verified === true
        return true
      })
    }
    
    console.log('Loaded escorts:', escorts.value.length)
  } catch (err) {
    console.error('Error loading escorts:', err)
    error.value = err.response?.data?.message || 'Failed to load escorts'
  } finally {
    loading.value = false
  }
}

// Action methods
const verifyEscort = async (id) => {
  try {
    await api.patch(`/api/admin/escorts/${id}/verify`) // Should be plural "escorts"
    loadEscorts()
  } catch (err) {
    console.error('Error verifying escort:', err)
  }
}

const toggleActive = async (id, isActive) => {
  try {
    await api.patch(`/api/admin/escorts/${id}/active`, { // Should be plural "escorts"
      active: !isActive
    })
    loadEscorts()
  } catch (err) {
    console.error('Error toggling active status:', err)
  }
}

const deleteEscort = async (id) => {
  if (confirm('Are you sure you want to delete this escort? This action cannot be undone.')) {
    try {
      await api.delete(`/api/admin/escorts/${id}`) // Should be plural "escorts"
      loadEscorts()
    } catch (err) {
      console.error('Error deleting escort:', err)
    }
  }
}

onMounted(() => {
  console.log('Escorts component mounted')
  loadEscorts()
})
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1>Escort Management</h1>
        <p class="subtitle">Manage all escorts in your agency</p>
      </div>
      <Button 
        label="Add New Escort" 
        icon="pi pi-plus" 
        severity="primary"
      />
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-content">
          <span class="stat-label">Total Escorts</span>
          <span class="stat-value">{{ escorts.length }}</span>
        </div>
        <i class="pi pi-users stat-icon"></i>
      </div>
      
      <div class="stat-card">
        <div class="stat-content">
          <span class="stat-label">Active</span>
          <span class="stat-value">
            {{ escorts.filter(e => e.active).length }}
          </span>
        </div>
        <i class="pi pi-check-circle stat-icon"></i>
      </div>
      
      <div class="stat-card">
        <div class="stat-content">
          <span class="stat-label">Verified</span>
          <span class="stat-value">
            {{ escorts.filter(e => e.verified).length }}
          </span>
        </div>
        <i class="pi pi-verified stat-icon"></i>
      </div>
      
      <div class="stat-card">
        <div class="stat-content">
          <span class="stat-label">Pending</span>
          <span class="stat-value">
            {{ escorts.filter(e => !e.verified).length }}
          </span>
        </div>
        <i class="pi pi-clock stat-icon"></i>
      </div>
    </div>

    <!-- Control Bar -->
    <div class="control-bar">
      <div class="controls-left">
        <Dropdown
          v-model="filter"
          :options="filters"
          optionLabel="label"
          optionValue="value"
          placeholder="Filter escorts"
          @change="loadEscorts"
          class="filter-dropdown"
        />
        
        <div class="view-toggle">
          <Button
            icon="pi pi-th-large"
            outlined
            :severity="viewMode === 'cards' ? 'primary' : 'secondary'"
            @click="viewMode = 'cards'"
            title="Card View"
          />
          <Button
            icon="pi pi-table"
            outlined
            :severity="viewMode === 'table' ? 'primary' : 'secondary'"
            @click="viewMode = 'table'"
            title="Table View"
          />
        </div>
      </div>
      
      <div class="controls-right">
        <Button
          icon="pi pi-refresh"
          label="Refresh"
          outlined
          @click="loadEscorts"
          :loading="loading"
        />
        <Button
          icon="pi pi-download"
          label="Export"
          outlined
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
      <p>Loading escorts...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-card">
        <i class="pi pi-exclamation-triangle error-icon"></i>
        <div class="error-content">
          <h3>Unable to Load Escorts</h3>
          <p>{{ error }}</p>
          <Button 
            label="Try Again" 
            icon="pi pi-refresh" 
            @click="loadEscorts"
          />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && escorts.length === 0" class="empty-state">
      <div class="empty-content">
        <i class="pi pi-users empty-icon"></i>
        <h3>No Escorts Found</h3>
        <p>Get started by adding your first escort to the platform</p>
        <Button 
          label="Add New Escort" 
          icon="pi pi-plus" 
          severity="primary"
          size="large"
        />
      </div>
    </div>

    <!-- Card View -->
    <div v-else-if="viewMode === 'cards'" class="cards-grid">
      <EscortCard
        v-for="escort in escorts"
        :key="escort.id"
        :escort="escort"
        @refresh="loadEscorts"
      />
    </div>

    <!-- Table View -->
    <div v-else class="table-container">
      <div class="table-wrapper">
        <table class="escort-table">
          <thead>
            <tr>
              <th>Profile</th>
              <th>Name</th>
              <th>Age</th>
              <th>Location</th>
              <th>Rate</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="escort in escorts" :key="escort.id">
              <td class="profile-cell">
                <img 
                  :src="escort.profile_image || '/placeholder.jpg'" 
                  :alt="escort.stage_name"
                  class="profile-avatar"
                />
              </td>
              <td class="name-cell">
                <div class="name-info">
                  <strong>{{ escort.stage_name }}</strong>
                  <small>{{ escort.phone_number }}</small>
                </div>
              </td>
              <td>{{ escort.age }}</td>
              <td>{{ escort.location }}</td>
              <td class="rate-cell">
                <span class="rate-badge">${{ escort.price_per_hour }}/hr</span>
              </td>
              <td class="status-cell">
                <span 
                  :class="['status-badge', escort.active ? 'active' : 'inactive']"
                >
                  {{ escort.active ? 'Active' : 'Inactive' }}
                </span>
                <span 
                  v-if="escort.verified"
                  class="verified-badge"
                >
                  ✓ Verified
                </span>
              </td>
              <td class="actions-cell">
                <div class="table-actions">
                  <Button 
                    v-if="!escort.verified"
                    icon="pi pi-check" 
                    size="small"
                    outlined
                    @click="verifyEscort(escort.id)"
                    title="Verify"
                  />
                  <Button 
                    :icon="escort.active ? 'pi pi-times' : 'pi pi-check'" 
                    size="small"
                    :severity="escort.active ? 'danger' : 'success'"
                    outlined
                    @click="toggleActive(escort.id, escort.active)"
                    :title="escort.active ? 'Deactivate' : 'Activate'"
                  />
                  <Button 
                    icon="pi pi-eye" 
                    size="small"
                    outlined
                    @click="router.push(`/escort/${escort.id}`)"
                    title="View Details"
                  />
                  <Button 
                    icon="pi pi-trash" 
                    size="small"
                    severity="danger"
                    outlined
                    @click="deleteEscort(escort.id)"
                    title="Delete"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.subtitle {
  color: #6b7280;
  margin-top: 0.5rem;
  font-size: 0.95rem;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
}

.stat-icon {
  font-size: 2rem;
  color: #3b82f6;
  opacity: 0.2;
}

/* Control Bar */
.control-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.controls-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.filter-dropdown {
  width: 200px;
}

.view-toggle {
  display: flex;
  gap: 0.5rem;
}

.controls-right {
  display: flex;
  gap: 0.5rem;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.loading-container p {
  margin-top: 1rem;
  color: #6b7280;
}

/* Error State */
.error-container {
  padding: 2rem;
}

.error-card {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.error-icon {
  font-size: 3rem;
  color: #dc2626;
}

.error-content h3 {
  margin: 0 0 0.5rem 0;
  color: #1a1a1a;
}

.error-content p {
  margin: 0 0 1rem 0;
  color: #6b7280;
}

/* Empty State */
.empty-state {
  padding: 4rem 2rem;
  text-align: center;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 4rem;
  color: #9ca3af;
  margin-bottom: 1rem;
}

.empty-content h3 {
  margin: 0 0 0.5rem 0;
  color: #1a1a1a;
}

.empty-content p {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

/* Cards Grid */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

/* Table View */
.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.table-wrapper {
  overflow-x: auto;
}

.escort-table {
  width: 100%;
  border-collapse: collapse;
}

.escort-table thead {
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
}

.escort-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.escort-table tbody tr {
  border-bottom: 1px solid #e5e7eb;
  transition: background-color 0.2s;
}

.escort-table tbody tr:hover {
  background-color: #f9fafb;
}

.escort-table td {
  padding: 1rem;
  vertical-align: middle;
}

.profile-cell {
  width: 60px;
}

.profile-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
}

.name-cell .name-info {
  display: flex;
  flex-direction: column;
}

.name-cell strong {
  color: #1f2937;
  font-size: 0.95rem;
}

.name-cell small {
  color: #6b7280;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.rate-cell .rate-badge {
  background: #f0f9ff;
  color: #0369a1;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-cell {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: inline-block;
  width: fit-content;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.inactive {
  background: #f3f4f6;
  color: #6b7280;
}

.verified-badge {
  background: #dbeafe;
  color: #1e40af;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-block;
  width: fit-content;
}

.actions-cell {
  white-space: nowrap;
}

.table-actions {
  display: flex;
  gap: 0.5rem;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (max-width: 768px) {
  .page-container {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .control-bar {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .controls-left,
  .controls-right {
    width: 100%;
  }
  
  .controls-right {
    justify-content: flex-end;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .cards-grid {
    grid-template-columns: 1fr;
  }
}
</style>