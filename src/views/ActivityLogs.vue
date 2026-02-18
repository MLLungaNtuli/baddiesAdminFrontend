<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const logs = ref([])

const loadLogs = async () => {
  const res = await api.get('/api/admin/activity-logs')
  logs.value = res.data
}

onMounted(loadLogs)
</script>

<template>
  <div class="card">
    <h2>Activity Logs</h2>

    <DataTable :value="logs" paginator :rows="15">
      <Column field="admin" header="Admin" />
      <Column field="action" header="Action" />
      <Column field="entity_type" header="Entity" />
      <Column field="description" header="Description" />
      <Column field="created_at" header="Date" />
    </DataTable>
  </div>
</template>
