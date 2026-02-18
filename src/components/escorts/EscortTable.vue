<!-- components/escorts/EscortTable.vue -->
<template>
  <div class="escort-table">
    <DataTable :value="escorts" class="p-datatable-sm" stripedRows>
      <Column field="stage_name" header="Name" sortable>
        <template #body="{ data }">
          <div class="name-cell">
            <img 
              :src="data.profileImage || '/placeholder.jpg'" 
              class="table-avatar"
            />
            <span>{{ data.stage_name }}</span>
          </div>
        </template>
      </Column>
      
      <Column field="age" header="Age" sortable></Column>
      
      <Column field="location" header="Location" sortable></Column>
      
      <Column field="price_per_hour" header="Rate" sortable>
        <template #body="{ data }">
          ${{ data.price_per_hour }}/hr
        </template>
      </Column>
      
      <Column field="phone_number" header="Phone"></Column>
      
      <Column field="verified" header="Verified" sortable>
        <template #body="{ data }">
          <Tag 
            :value="data.verified ? 'Yes' : 'No'"
            :severity="data.verified ? 'success' : 'warning'"
          />
        </template>
      </Column>
      
      <Column field="active" header="Active" sortable>
        <template #body="{ data }">
          <Tag 
            :value="data.active ? 'Active' : 'Inactive'"
            :severity="data.active ? 'success' : 'danger'"
          />
        </template>
      </Column>
      
      <Column header="Actions">
        <template #body="{ data }">
          <div class="table-actions">
            <Button 
              icon="pi pi-check" 
              size="small"
              :disabled="data.verified"
              @click="verifyEscort(data.id)"
            />
            <Button 
              :icon="data.active ? 'pi pi-times' : 'pi pi-check'" 
              size="small"
              :severity="data.active ? 'danger' : 'success'"
              @click="toggleActive(data.id, data.active)"
            />
            <Button 
              icon="pi pi-eye" 
              size="small"
              @click="viewDetails(data.id)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import api from '../../services/api'

const props = defineProps({
  escorts: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['refresh'])

const verifyEscort = async (id) => {
  try {
    await api.patch(`/api/admin/escorts/${id}/verify`)
    emit('refresh')
  } catch (error) {
    console.error('Error verifying escort:', error)
  }
}

const toggleActive = async (id, isActive) => {
  try {
    await api.patch(`/api/admin/escorts/${id}/active`, {
      active: !isActive
    })
    emit('refresh')
  } catch (error) {
    console.error('Error toggling active status:', error)
  }
}

const viewDetails = (id) => {
  // Navigate to details page or open modal
  console.log('View details for:', id)
}
</script>

<style scoped>
.name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.table-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.table-actions {
  display: flex;
  gap: 5px;
}

::v-deep(.p-datatable) {
  font-size: 0.9rem;
}

::v-deep(.p-tag) {
  font-size: 0.75rem;
  padding: 2px 8px;
}
</style>