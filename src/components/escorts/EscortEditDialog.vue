<script setup>
import { reactive, watch } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import api from '../../services/api'

const props = defineProps({
  escort: {
    type: Object,
    required: true
  },
  visible: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:visible', 'saved'])

const form = reactive({
  stage_name: '',
  location: '',
  bio: ''
})

/**
 * When escort changes (or dialog opens),
 * copy values into the local form
 */
watch(
  () => props.escort,
  (escort) => {
    if (!escort) return
    form.stage_name = escort.stage_name
    form.location = escort.location
    form.bio = escort.bio
  },
  { immediate: true }
)

const save = async () => {
  await api.put(`/api/admin/escorts/${props.escort.id}`, {
    stage_name: form.stage_name,
    location: form.location,
    bio: form.bio
  })

  emit('saved')
  emit('update:visible', false)
}
</script>

<template>
  <Dialog
    modal
    header="Edit Escort Profile"
    :visible="visible"
    style="width: 480px"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="form">
      <div class="field">
        <label>Stage Name</label>
        <InputText v-model="form.stage_name" />
      </div>

      <div class="field">
        <label>Location</label>
        <InputText v-model="form.location" />
      </div>

      <div class="field">
        <label>Bio</label>
        <Textarea
          v-model="form.bio"
          rows="4"
          autoResize
        />
      </div>

      <div class="actions">
        <Button
          label="Cancel"
          outlined
          @click="emit('update:visible', false)"
        />
        <Button
          label="Save Changes"
          icon="pi pi-save"
          @click="save"
        />
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: .25rem;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: .5rem;
  margin-top: 1rem;
}
</style>
