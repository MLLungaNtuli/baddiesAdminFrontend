<script setup>
import Tag from 'primevue/tag'

defineProps({
  escort: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="status">
    <Tag :severity="escort.active ? 'success' : 'danger'">
      {{ escort.active ? 'Active' : 'Inactive' }}
    </Tag>

    <Tag
      v-if="escort.verified"
      severity="info"
      class="ml-2"
    >
      Verified
    </Tag>
  </div>
</template>

<style scoped>
.status {
  display: flex;
  gap: .5rem;
}
</style>
