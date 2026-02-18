<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'
import { useToast } from 'primevue/usetoast'

const images = ref([])
const toast = useToast()

const loadImages = async () => {
  const res = await api.get('/api/admin/escort-images/pending')
  images.value = res.data
}

const approve = async (image) => {
  await api.patch(`/api/admin/escort-images/${image.id}/approve`)
  images.value = images.value.filter(i => i.id !== image.id)

  toast.add({
    severity: 'success',
    summary: 'Approved',
    detail: 'Image approved',
    life: 2000
  })
}

const reject = async (image) => {
  await api.delete(`/api/admin/escort-images/${image.id}`)
  images.value = images.value.filter(i => i.id !== image.id)

  toast.add({
    severity: 'warn',
    summary: 'Rejected',
    detail: 'Image deleted',
    life: 2000
  })
}

onMounted(loadImages)
</script>

<template>
  <div class="card">
    <h2>Image Approval</h2>

    <DataTable :value="images" paginator :rows="8">
      <Column header="Escort">
        <template #body="{ data }">
          {{ data.stage_name }}
        </template>
      </Column>

      <Column header="Preview">
        <template #body="{ data }">
          <img
            :src="data.image_url"
            style="width:100px;border-radius:8px"
          />
        </template>
      </Column>

      <Column header="Actions">
        <template #body="{ data }">
          <Button
            label="Approve"
            severity="success"
            class="mr-2"
            @click="approve(data)"
          />
          <Button
            label="Reject"
            severity="danger"
            @click="reject(data)"
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>
