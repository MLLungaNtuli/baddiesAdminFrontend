<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'
import { useToast } from 'primevue/usetoast'

const bookings = ref([])
const toast = useToast()

const loadBookings = async () => {
  const res = await api.get('/api/admin/bookings')
  bookings.value = res.data
}

const updateStatus = async (booking, status) => {
  await api.patch(`/api/admin/bookings/${booking.id}/status`, {
    status
  })

  booking.status = status

  toast.add({
    severity: 'success',
    summary: 'Updated',
    detail: `Status changed to ${status}`,
    life: 2000
  })
}

const cancelBooking = async (booking) => {
  await api.delete(`/api/admin/bookings/${booking.id}`)
  booking.status = 'cancelled'
}

onMounted(loadBookings)
</script>

<template>
  <div class="card">
    <h2>Booking Moderation</h2>

    <DataTable :value="bookings" paginator :rows="10">
      <Column field="escort_name" header="Escort" />
      <Column field="booking_date" header="Date" />
      <Column field="status" header="Status" />

      <Column header="Actions">
        <template #body="{ data }">
          <Button
            label="Accept"
            severity="success"
            class="mr-2"
            @click="updateStatus(data, 'accepted')"
          />
          <Button
            label="Reject"
            severity="danger"
            class="mr-2"
            @click="updateStatus(data, 'rejected')"
          />
          <Button
            label="Complete"
            severity="info"
            class="mr-2"
            @click="updateStatus(data, 'completed')"
          />
          <Button
            label="Cancel"
            severity="secondary"
            @click="cancelBooking(data)"
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>
