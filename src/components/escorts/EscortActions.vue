<script setup>
import { ref } from 'vue'
import Button from 'primevue/button'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'
import EscortEditDialog from './EscortEditDialog.vue'
import api from '../../services/api'
import { useRouter } from 'vue-router'

const router = useRouter()
const props = defineProps({ escort: Object })
const emit = defineEmits(['refresh'])

const confirm = useConfirm()
const showEdit = ref(false)

const toggleActive = async () => {
  await api.patch(`/api/admin/escorts/${props.escort.id}/active`, !props.escort.active)
  emit('refresh')
}

const verify = async () => {
  await api.patch(`/api/admin/escorts/${props.escort.id}/verify`)
  emit('refresh')
}

const remove = () => {
  confirm.require({
    header: 'Delete Escort',
    message: 'This cannot be undone.',
    acceptClass: 'p-button-danger',
    accept: async () => {
      await api.delete(`/api/admin/escorts/${props.escort.id}`)
      emit('refresh')
    }
  })
}
</script>

<template>
  <ConfirmDialog />

  <EscortEditDialog
    v-model:visible="showEdit"
    :escort="escort"
    @saved="emit('refresh')"
  />

  <div class="actions">
    <Button icon="pi pi-pencil" size="small" outlined @click="showEdit = true" />
    <Button
      v-if="!escort.verified"
      icon="pi pi-check"
      size="small"
      @click="verify"
    />
    <Button
      icon="pi pi-power-off"
      size="small"
      :severity="escort.active ? 'warning' : 'success'"
      @click="toggleActive"
    />
    <Button
      icon="pi pi-trash"
      size="small"
      severity="danger"
      outlined
      @click="remove"
    />
<Button
  icon="pi pi-eye"
  size="small"
  outlined
  @click="router.push(`/admin/escorts/${escort.id}`)"
/>

  </div>
</template>

<style scoped>
.actions {
  display: flex;
  gap: .4rem;
  flex-wrap: wrap;
}
</style>
