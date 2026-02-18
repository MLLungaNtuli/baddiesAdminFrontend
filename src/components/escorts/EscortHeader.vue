<script setup>
import EscortActions from './EscortActions.vue'
import Tag from 'primevue/tag'

defineProps({ escort: Object })
defineEmits(['refresh'])
</script>

<template>
  <div class="header">
    <img
      :src="escort.profile_image || 'https://via.placeholder.com/300'"
      class="avatar"
    />

    <div class="info">
      <h1>{{ escort.stage_name }}</h1>
      <p class="location">{{ escort.location }}</p>

      <div class="tags">
        <Tag :severity="escort.active ? 'success' : 'danger'">
          {{ escort.active ? 'Active' : 'Inactive' }}
        </Tag>
        <Tag v-if="escort.verified" severity="info">
          Verified
        </Tag>
      </div>

      <EscortActions
        :escort="escort"
        @refresh="$emit('refresh')"
      />
    </div>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  gap: 1.5rem;
  background: var(--surface-card);
  padding: 1.5rem;
  border-radius: 14px;
  box-shadow: var(--shadow-2);
}

.avatar {
  width: 220px;
  height: 220px;
  object-fit: cover;
  border-radius: 12px;
}

.info {
  display: flex;
  flex-direction: column;
  gap: .75rem;
}

.location {
  opacity: .7;
}

.tags {
  display: flex;
  gap: .5rem;
}
</style>
