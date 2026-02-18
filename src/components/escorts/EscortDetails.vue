<script setup>
defineProps({ escort: Object })
</script>

<template>
  <div class="card">
    <h3>Profile Details</h3>

    <div class="field">
      <label>Stage Name</label>
      <p>{{ escort.stage_name }}</p>
    </div>

    <div class="field">
      <label>Location</label>
      <p>{{ escort.location }}</p>
    </div>

    <div class="field">
      <label>Bio</label>
      <p class="bio">
        {{ escort.bio || 'No bio provided.' }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: var(--surface-card);
  padding: 1.25rem;
  border-radius: 14px;
  box-shadow: var(--shadow-2);
}

.field {
  margin-bottom: 1rem;
}

label {
  font-weight: 600;
  font-size: .85rem;
  opacity: .7;
}

.bio {
  white-space: pre-line;
}
</style>
