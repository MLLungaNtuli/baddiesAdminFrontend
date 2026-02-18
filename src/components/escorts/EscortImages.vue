<script setup>
import { ref, onMounted } from 'vue'
import FileUpload from 'primevue/fileupload'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import api from '../../services/api'

const props = defineProps({
  escortId: {
    type: String,
    required: true
  }
})

const images = ref([])
const loading = ref(false)

const loadImages = async () => {
  loading.value = true
  const res = await api.get(`/api/admin/escorts/${props.escortId}/images`)
  images.value = res.data
  loading.value = false
}

const approve = async (imageId) => {
  await api.patch(`/api/admin/escort-images/${imageId}/approve`)
  loadImages()
}

const reject = async (imageId) => {
  const reason = prompt('Reason for rejection')
  if (!reason) return

  await api.patch(
    `/api/admin/escort-images/${imageId}/reject`,
    reason
  )
  loadImages()
}

onMounted(loadImages)
</script>

<template>
  <div class="images-section">
    <h4>Images</h4>

    <FileUpload
      mode="basic"
      name="file"
      :url="`/api/admin/images/escort/${escortId}`"
      accept="image/*"
      auto
      chooseLabel="Upload Image"
      @upload="loadImages"
    />

    <div class="images" v-if="images.length">
      <div
        v-for="img in images"
        :key="img.id"
        class="image-card"
      >
        <img :src="img.image_url" />

        <div class="image-footer">
          <Tag
            v-if="!img.approved"
            severity="warning"
          >
            Pending
          </Tag>

          <div class="buttons">
            <Button
              v-if="!img.approved"
              icon="pi pi-check"
              size="small"
              @click="approve(img.id)"
            />
            <Button
              icon="pi pi-times"
              severity="danger"
              size="small"
              @click="reject(img.id)"
            />
          </div>
        </div>
      </div>
    </div>

    <p v-else class="empty">
      No images uploaded yet.
    </p>
  </div>
</template>

<style scoped>
.images-section {
  margin-top: 1rem;
}

.images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: .75rem;
  margin-top: .75rem;
}

.image-card {
  background: var(--surface-card);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: var(--shadow-1);
}

.image-card img {
  width: 100%;
  height: 140px;
  object-fit: cover;
}

.image-footer {
  padding: .5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.buttons {
  display: flex;
  gap: .25rem;
}

.empty {
  opacity: .6;
  font-size: .9rem;
  margin-top: .5rem;
}
</style>
