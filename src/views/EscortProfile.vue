<!-- views/EscortProfile.vue -->
<script setup>
import { ref, onMounted, reactive, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import api from '@/services/api'

import Button from 'primevue/button'
import Card from 'primevue/card'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'
import MultiSelect from 'primevue/multiselect'
import Checkbox from 'primevue/checkbox'
import InputNumber from 'primevue/inputnumber'
import FileUpload from 'primevue/fileupload'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import Skeleton from 'primevue/skeleton'
import ProgressSpinner from 'primevue/progressspinner'
import Avatar from 'primevue/avatar'
import Image from 'primevue/image'
import { useConfirm } from 'primevue/useconfirm'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const confirm = useConfirm()

const escort = ref(null)
const loading = ref(false)
const saving = ref(false)
const uploading = ref(false)
const activeTab = ref(0)

const showImageUpload = ref(false)
const imageUploadType = ref('gallery')
const uploadProgress = ref(0)

// Options arrays
const bodyTypes = ref([])
const hairColors = ref([])
const eyeColors = ref([])
const ethnicities = ref([])
const languages = ref([])
const services = ref([])

// Form state - MATCHES YOUR C# DTO PROPERTY NAMES
const form = reactive({
  stageName: '',
  age: null,
  phoneNumber: '',
  bio: '',
  location: '',
  pricePerHour: 0,
  available: true,
  
  // Physical attributes
  nationality: '',
  height: '',
  weight: '',
  bust: '',
  waist: '',
  hips: '',
  hairColor: '',        // Changed from hair_color
  eyeColor: '',         // Changed from eye_color
  ethnicity: '',
  measurements: '',
  bodyType: '',         // Changed from body_type
  
  // Lifestyle
  smoking: false,
  drinking: false,
  tattoos: false,
  piercings: false,
  
  // Services
  languages: [],
  services: [],
  availabilityTimes: '', // Changed from availability_times
  
  // Rates
  incallRate: null,
  outcallRate: null,
  travelRadius: null,
  travelFee: null
})

// ===============================
// LOAD DROPDOWN OPTIONS
// ===============================
const loadOptions = async () => {
  try {
    const [bodyRes, hairRes, eyeRes, ethnicityRes, langRes, serviceRes] = await Promise.all([
      api.get('/api/admin/escorts/options/body-types'),
      api.get('/api/admin/escorts/options/hair-colors'),
      api.get('/api/admin/escorts/options/eye-colors'),
      api.get('/api/admin/escorts/options/ethnicities'),
      api.get('/api/admin/escorts/options/languages'),
      api.get('/api/admin/escorts/options/services')
    ])

    bodyTypes.value = bodyRes.data || []
    hairColors.value = hairRes.data || []
    eyeColors.value = eyeRes.data || []
    ethnicities.value = ethnicityRes.data || []
    languages.value = langRes.data || []
    services.value = serviceRes.data || []

    console.log('✅ Dropdown options loaded')
  } catch (error) {
    console.error('❌ Error loading dropdown options:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load dropdown options',
      life: 3000
    })
  }
}

// ===============================
// LOAD ESCORT PROFILE
// ===============================
const loadEscort = async () => {
  loading.value = true
  try {
    console.log('📥 Loading escort ID:', route.params.id)
    const res = await api.get(`/api/admin/escorts/${route.params.id}/profile`)
    
    escort.value = res.data
    console.log('✅ Escort data loaded:', escort.value)
    
    // Map C# DTO to Vue form
    form.stageName = escort.value.stageName || ''
    form.age = escort.value.age || null
    form.phoneNumber = escort.value.phoneNumber || ''
    form.bio = escort.value.bio || ''
    form.location = escort.value.location || ''
    form.pricePerHour = escort.value.pricePerHour || 0
    form.available = escort.value.available ?? true
    
    // Physical attributes
    form.nationality = escort.value.nationality || ''
    form.height = escort.value.height || ''
    form.weight = escort.value.weight || ''
    form.bust = escort.value.bust || ''
    form.waist = escort.value.waist || ''
    form.hips = escort.value.hips || ''
    form.hairColor = escort.value.hairColor || ''
    form.eyeColor = escort.value.eyeColor || ''
    form.ethnicity = escort.value.ethnicity || ''
    form.measurements = escort.value.measurements || ''
    form.bodyType = escort.value.bodyType || ''
    
    // Lifestyle
    form.smoking = escort.value.smoking || false
    form.drinking = escort.value.drinking || false
    form.tattoos = escort.value.tattoos || false
    form.piercings = escort.value.piercings || false
    
    // Services
    form.languages = Array.isArray(escort.value.languages) ? escort.value.languages : []
    form.services = Array.isArray(escort.value.services) ? escort.value.services : []
    form.availabilityTimes = escort.value.availabilityTimes || ''
    
    // Rates
    form.incallRate = escort.value.incallRate || null
    form.outcallRate = escort.value.outcallRate || null
    form.travelRadius = escort.value.travelRadius || null
    form.travelFee = escort.value.travelFee || null
    
  } catch (error) {
    console.error('❌ Error loading escort:', error)
    console.error('Error details:', error.response?.data)
    console.error('Status:', error.response?.status)
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load escort profile',
      life: 3000
    })
    
    if (error.response?.status === 404) {
      router.push('/escorts')
    }
  } finally {
    loading.value = false
  }
}

// ===============================
// SAVE PROFILE - MATCHES YOUR C# DTO
// ===============================
const saveProfile = async () => {
  saving.value = true
  
  try {
    // Create payload that EXACTLY matches your UpdateEscortDto in C#
    const payload = {
      // Basic info
      stageName: form.stageName,
      age: form.age,
      phoneNumber: form.phoneNumber,
      bio: form.bio,
      location: form.location,
      pricePerHour: form.pricePerHour,
      available: form.available,
      
      // Physical attributes
      nationality: form.nationality,
      height: form.height,
      weight: form.weight,
      bust: form.bust,
      waist: form.waist,
      hips: form.hips,
      hairColor: form.hairColor,
      eyeColor: form.eyeColor,
      ethnicity: form.ethnicity,
      languages: form.languages || [],
      services: form.services || [],
      measurements: measurementsString.value,
      bodyType: form.bodyType,
      
      // Lifestyle
      smoking: form.smoking,
      drinking: form.drinking,
      tattoos: form.tattoos,
      piercings: form.piercings,
      availabilityTimes: form.availabilityTimes,
      
      // Rates
      incallRate: form.incallRate,
      outcallRate: form.outcallRate,
      travelRadius: form.travelRadius,
      travelFee: form.travelFee
    }
    
    console.log('📤 Sending payload:', payload)
    
    await api.put(`/api/admin/escorts/${route.params.id}/profile`, payload)
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Escort profile updated successfully',
      life: 3000
    })
    
    // Reload fresh data
    await loadEscort()
    
  } catch (error) {
    console.error('❌ Save error:', error.response?.data || error)
    
    toast.add({
      severity: 'error',
      summary: 'Save Failed',
      detail: error.response?.data?.message || 'Database update failed',
      life: 4000
    })
  } finally {
    saving.value = false
  }
}

// ===============================
// IMAGE UPLOAD
// ===============================
const uploadImage = async (event) => {
  const file = event.files[0]
  if (!file) return
  
  uploading.value = true
  uploadProgress.value = 0
  
  const formData = new FormData()
  formData.append('file', file)
  
  try {
    const res = await api.post(
      `/api/admin/images/escort/${route.params.id}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          uploadProgress.value = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
        }
      }
    )
    
    toast.add({
      severity: 'success',
      summary: 'Upload Successful',
      detail: 'Image uploaded successfully',
      life: 3000
    })
    
    showImageUpload.value = false
    await loadEscort()
    
  } catch (error) {
    console.error('❌ Error uploading image:', error)
    toast.add({
      severity: 'error',
      summary: 'Upload Failed',
      detail: error.response?.data?.message || 'Failed to upload image',
      life: 3000
    })
  } finally {
    uploading.value = false
    uploadProgress.value = 0
  }
}

// ===============================
// SET PROFILE IMAGE
// ===============================
const setProfileImage = async (imageUrl) => {
  try {
    await api.patch(`/api/admin/escorts/${route.params.id}/profile-image`, {
      imageUrl: imageUrl
    })
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Profile image updated',
      life: 2000
    })
    
    await loadEscort()
    
  } catch (error) {
    console.error('❌ Error setting profile image:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to update profile image',
      life: 3000
    })
  }
}

// ===============================
// DELETE IMAGE
// ===============================
const deleteImage = (imageId) => {
  confirm.require({
    message: 'Are you sure you want to delete this image?',
    header: 'Delete Image',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await api.delete(`/api/admin/escort-images/${imageId}`)
        
        toast.add({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Image deleted successfully',
          life: 2000
        })
        
        await loadEscort()
        
      } catch (error) {
        console.error('❌ Error deleting image:', error)
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete image',
          life: 3000
        })
      }
    }
  })
}

// ===============================
// APPROVE IMAGE
// ===============================
const approveImage = async (imageId) => {
  try {
    await api.patch(`/api/admin/escort-images/${imageId}/approve`)
    
    toast.add({
      severity: 'success',
      summary: 'Approved',
      detail: 'Image approved',
      life: 2000
    })
    
    await loadEscort()
    
  } catch (error) {
    console.error('❌ Error approving image:', error)
  }
}

// ===============================
// REJECT IMAGE
// ===============================
const rejectImage = async (imageId) => {
  confirm.require({
    message: 'Enter reason for rejection:',
    header: 'Reject Image',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      const reason = prompt('Reason for rejection:')
      if (!reason) return
      
      try {
        await api.patch(`/api/admin/escort-images/${imageId}/reject`, { reason })
        
        toast.add({
          severity: 'warn',
          summary: 'Rejected',
          detail: 'Image rejected',
          life: 2000
        })
        
        await loadEscort()
        
      } catch (error) {
        console.error('❌ Error rejecting image:', error)
      }
    }
  })
}

// ===============================
// TOGGLE FEATURED
// ===============================
const toggleFeatured = async () => {
  try {
    await api.patch(`/api/admin/escorts/${route.params.id}/featured`, {
      featured: !escort.value.featured
    })
    
    toast.add({
      severity: 'success',
      summary: escort.value.featured ? 'Unfeatured' : 'Featured',
      detail: escort.value.featured ? 'Escort removed from featured' : 'Escort added to featured',
      life: 2000
    })
    
    await loadEscort()
    
  } catch (error) {
    console.error('❌ Error toggling featured:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to toggle featured status',
      life: 3000
    })
  }
}

// ===============================
// TOGGLE VERIFY
// ===============================
const toggleVerify = async () => {
  try {
    await api.patch(`/api/admin/escorts/${route.params.id}/verify`)
    
    toast.add({
      severity: 'success',
      summary: 'Verified',
      detail: 'Escort verified successfully',
      life: 2000
    })
    
    await loadEscort()
    
  } catch (error) {
    console.error('❌ Error verifying escort:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to verify escort',
      life: 3000
    })
  }
}

// ===============================
// TOGGLE ACTIVE STATUS
// ===============================
const toggleActive = async () => {
  try {
    await api.patch(`/api/admin/escorts/${route.params.id}/active`, {
      active: !escort.value.active
    })
    
    toast.add({
      severity: 'success',
      summary: escort.value.active ? 'Deactivated' : 'Activated',
      detail: escort.value.active ? 'Escort deactivated' : 'Escort activated',
      life: 2000
    })
    
    await loadEscort()
    
  } catch (error) {
    console.error('❌ Error toggling active status:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to update active status',
      life: 3000
    })
  }
}

// ===============================
// SOFT DELETE
// ===============================
const softDelete = () => {
  confirm.require({
    message: 'Are you sure you want to delete this escort?',
    header: 'Delete Escort',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        const reason = prompt('Reason for deletion:') || 'No reason provided'
        await api.delete(`/api/admin/escorts/${route.params.id}`, {
          data: reason
        })
        
        toast.add({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Escort deleted successfully',
          life: 2000
        })
        
        router.push('/escorts')
        
      } catch (error) {
        console.error('❌ Error deleting escort:', error)
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete escort',
          life: 3000
        })
      }
    }
  })
}

// ===============================
// COMPUTED PROPERTIES
// ===============================
const measurementsString = computed(() => {
  if (form.bust && form.waist && form.hips) {
    return `${form.bust}-${form.waist}-${form.hips}`
  }
  return form.measurements || ''
})

const profileImage = computed(() => {
  return escort.value?.profileImage || null
})

// ===============================
// WATCHERS
// ===============================
watch(() => form.bust, () => {
  if (form.bust && form.waist && form.hips) {
    form.measurements = `${form.bust}-${form.waist}-${form.hips}`
  }
})

watch(() => form.waist, () => {
  if (form.bust && form.waist && form.hips) {
    form.measurements = `${form.bust}-${form.waist}-${form.hips}`
  }
})

watch(() => form.hips, () => {
  if (form.bust && form.waist && form.hips) {
    form.measurements = `${form.bust}-${form.waist}-${form.hips}`
  }
})

// ===============================
// INITIALIZE
// ===============================
onMounted(() => {
  console.log('🚀 EscortProfile mounted with ID:', route.params.id)
  loadOptions()
  loadEscort()
})
</script>

<template>
  <div class="escort-profile-page">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
      <p>Loading escort profile...</p>
    </div>

    <!-- Main Content -->
    <template v-else-if="escort">
      <!-- Header with Back Button -->
      <div class="page-header">
        <Button 
          icon="pi pi-arrow-left" 
          label="Back to Escorts" 
          text
          @click="router.push('/escorts')"
        />
        <div class="header-actions">
          <Button 
            :icon="escort.featured ? 'pi pi-star-fill' : 'pi pi-star'"
            :label="escort.featured ? 'Featured' : 'Feature'"
            :severity="escort.featured ? 'warning' : 'secondary'"
            @click="toggleFeatured"
          />
          <Button 
            v-if="!escort.verified"
            icon="pi pi-check-circle" 
            label="Verify Escort"
            severity="success"
            @click="toggleVerify"
          />
        </div>
      </div>

      <!-- Profile Header -->
      <Card class="profile-header">
        <template #content>
          <div class="header-content">
            <!-- Profile Image -->
            <div class="profile-image-section">
              <Avatar 
                :image="profileImage" 
                size="xlarge" 
                shape="circle"
                class="profile-avatar"
              />
              <div class="image-actions">
                <Button 
                  icon="pi pi-camera" 
                  label="Change Photo"
                  outlined
                  @click="() => {
                    imageUploadType = 'profile'
                    showImageUpload = true
                  }"
                />
              </div>
            </div>

            <!-- Profile Info -->
            <div class="profile-info">
              <div class="name-section">
                <h1>{{ escort.stageName }}</h1>
                <div class="status-badges">
                  <Tag 
                    :severity="escort.active ? 'success' : 'danger'"
                    :value="escort.active ? 'Active' : 'Inactive'"
                  />
                  <Tag 
                    v-if="escort.verified"
                    severity="info"
                    value="Verified"
                    icon="pi pi-check-circle"
                  />
                  <Tag 
                    v-if="escort.featured"
                    severity="warning"
                    value="Featured"
                    icon="pi pi-star-fill"
                  />
                </div>
              </div>

              <div class="basic-info">
                <div class="info-item">
                  <i class="pi pi-user"></i>
                  <span>{{ escort.age }} years</span>
                </div>
                <div class="info-item">
                  <i class="pi pi-map-marker"></i>
                  <span>{{ escort.location }}</span>
                </div>
                <div class="info-item">
                  <i class="pi pi-money-bill"></i>
                  <span>${{ escort.pricePerHour }}/hr</span>
                </div>
                <div class="info-item">
                  <i class="pi pi-phone"></i>
                  <span>{{ escort.phoneNumber }}</span>
                </div>
              </div>

              <div class="header-action-buttons">
                <Button 
                  icon="pi pi-power-off"
                  :label="escort.active ? 'Deactivate' : 'Activate'"
                  :severity="escort.active ? 'danger' : 'success'"
                  @click="toggleActive"
                />
                <Button 
                  icon="pi pi-trash" 
                  label="Delete"
                  severity="danger"
                  outlined
                  @click="softDelete"
                />
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Main Content Tabs -->
      <Card>
        <template #content>
          <TabView v-model:activeIndex="activeTab">
            <!-- Profile Details Tab -->
            <TabPanel header="Profile Details">
              <div class="tab-content">
                <form @submit.prevent="saveProfile" class="profile-form">
                  <!-- Basic Information -->
                  <div class="form-section">
                    <h3>Basic Information</h3>
                    <div class="form-grid">
                      <div class="field">
                        <label>Stage Name <span class="required">*</span></label>
                        <InputText v-model="form.stageName" required />
                      </div>
                      <div class="field">
                        <label>Age <span class="required">*</span></label>
                        <InputNumber v-model="form.age" :min="18" :max="99" required />
                      </div>
                      <div class="field">
                        <label>Phone Number <span class="required">*</span></label>
                        <InputText v-model="form.phoneNumber" required />
                      </div>
                      <div class="field">
                        <label>Location <span class="required">*</span></label>
                        <InputText v-model="form.location" required />
                      </div>
                      <div class="field">
                        <label>Nationality</label>
                        <InputText v-model="form.nationality" />
                      </div>
                      <div class="field">
                        <label>Ethnicity</label>
                        <Dropdown 
                          v-model="form.ethnicity" 
                          :options="ethnicities" 
                          placeholder="Select ethnicity"
                          class="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Physical Attributes -->
                  <div class="form-section">
                    <h3>Physical Attributes</h3>
                    <div class="form-grid">
                      <div class="field">
                        <label>Height</label>
                        <InputText v-model="form.height" placeholder="e.g., 170cm" />
                      </div>
                      <div class="field">
                        <label>Weight</label>
                        <InputText v-model="form.weight" placeholder="e.g., 55kg" />
                      </div>
                      <div class="field">
                        <label>Bust</label>
                        <InputText v-model="form.bust" placeholder="e.g., 34" />
                      </div>
                      <div class="field">
                        <label>Waist</label>
                        <InputText v-model="form.waist" placeholder="e.g., 24" />
                      </div>
                      <div class="field">
                        <label>Hips</label>
                        <InputText v-model="form.hips" placeholder="e.g., 36" />
                      </div>
                      <div class="field">
                        <label>Measurements</label>
                        <InputText 
                          v-model="form.measurements" 
                          placeholder="34-24-36"
                        />
                      </div>
                      <div class="field">
                        <label>Body Type</label>
                        <Dropdown 
                          v-model="form.bodyType" 
                          :options="bodyTypes" 
                          placeholder="Select body type"
                          class="w-full"
                        />
                      </div>
                      <div class="field">
                        <label>Hair Color</label>
                        <Dropdown 
                          v-model="form.hairColor" 
                          :options="hairColors" 
                          placeholder="Select hair color"
                          class="w-full"
                        />
                      </div>
                      <div class="field">
                        <label>Eye Color</label>
                        <Dropdown 
                          v-model="form.eyeColor" 
                          :options="eyeColors" 
                          placeholder="Select eye color"
                          class="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Lifestyle -->
                  <div class="form-section">
                    <h3>Lifestyle</h3>
                    <div class="checkbox-group">
                      <div class="checkbox-item">
                        <Checkbox v-model="form.smoking" :binary="true" inputId="smoking" />
                        <label for="smoking">Smoking</label>
                      </div>
                      <div class="checkbox-item">
                        <Checkbox v-model="form.drinking" :binary="true" inputId="drinking" />
                        <label for="drinking">Drinking</label>
                      </div>
                      <div class="checkbox-item">
                        <Checkbox v-model="form.tattoos" :binary="true" inputId="tattoos" />
                        <label for="tattoos">Tattoos</label>
                      </div>
                      <div class="checkbox-item">
                        <Checkbox v-model="form.piercings" :binary="true" inputId="piercings" />
                        <label for="piercings">Piercings</label>
                      </div>
                    </div>
                  </div>

                  <!-- Languages & Services -->
                  <div class="form-section">
                    <h3>Languages & Services</h3>
                    <div class="form-grid">
                      <div class="field">
                        <label>Languages</label>
                        <MultiSelect 
                          v-model="form.languages" 
                          :options="languages" 
                          placeholder="Select languages"
                          display="chip"
                          class="w-full"
                        />
                      </div>
                      <div class="field">
                        <label>Services Offered</label>
                        <MultiSelect 
                          v-model="form.services" 
                          :options="services" 
                          placeholder="Select services"
                          display="chip"
                          class="w-full"
                        />
                      </div>
                      <div class="field md:col-span-2">
                        <label>Availability Times</label>
                        <InputText 
                          v-model="form.availabilityTimes" 
                          placeholder="e.g., Mon-Fri 6pm-12am, Weekends 24/7"
                          class="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Rates & Travel -->
                  <div class="form-section">
                    <h3>Rates & Travel</h3>
                    <div class="form-grid">
                      <div class="field">
                        <label>Hourly Rate ($) <span class="required">*</span></label>
                        <InputNumber 
                          v-model="form.pricePerHour" 
                          :min="0" 
                          mode="currency" 
                          currency="USD"
                          class="w-full"
                          required
                        />
                      </div>
                      <div class="field">
                        <label>Incall Rate ($)</label>
                        <InputNumber 
                          v-model="form.incallRate" 
                          :min="0" 
                          mode="currency" 
                          currency="USD"
                          class="w-full"
                        />
                      </div>
                      <div class="field">
                        <label>Outcall Rate ($)</label>
                        <InputNumber 
                          v-model="form.outcallRate" 
                          :min="0" 
                          mode="currency" 
                          currency="USD"
                          class="w-full"
                        />
                      </div>
                      <div class="field">
                        <label>Travel Radius (km)</label>
                        <InputNumber 
                          v-model="form.travelRadius" 
                          :min="0"
                          class="w-full"
                        />
                      </div>
                      <div class="field">
                        <label>Travel Fee ($)</label>
                        <InputNumber 
                          v-model="form.travelFee" 
                          :min="0" 
                          mode="currency" 
                          currency="USD"
                          class="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Bio -->
                  <div class="form-section">
                    <h3>Bio & Description</h3>
                    <div class="field">
                      <label>Bio <span class="required">*</span></label>
                      <Textarea 
                        v-model="form.bio" 
                        rows="6" 
                        placeholder="Describe the escort's personality, interests, and what clients can expect..."
                        class="w-full"
                        required
                      />
                    </div>
                  </div>

                  <!-- Form Actions -->
                  <div class="form-actions">
                    <Button 
                      type="button" 
                      label="Cancel" 
                      severity="secondary" 
                      outlined
                      @click="loadEscort"
                    />
                    <Button 
                      type="submit" 
                      label="Save Changes" 
                      icon="pi pi-save"
                      :loading="saving"
                    />
                  </div>
                </form>
              </div>
            </TabPanel>

            <!-- Gallery Tab -->
            <TabPanel header="Gallery">
              <div class="tab-content">
                <div class="gallery-header">
                  <h3>Images ({{ escort.images?.length || 0 }})</h3>
                  <Button 
                    icon="pi pi-upload" 
                    label="Upload Images"
                    @click="() => {
                      imageUploadType = 'gallery'
                      showImageUpload = true
                    }"
                  />
                </div>

                <!-- Upload Dialog -->
                <Dialog 
                  v-model:visible="showImageUpload" 
                  header="Upload Image" 
                  :style="{ width: '450px' }"
                  :modal="true"
                >
                  <div class="upload-dialog">
                    <FileUpload
                      mode="basic"
                      name="file"
                      accept="image/*"
                      :maxFileSize="10000000"
                      @select="uploadImage"
                      :auto="true"
                      :disabled="uploading"
                      chooseLabel="Select Image"
                    />
                    
                    <div v-if="uploading" class="upload-progress">
                      <ProgressSpinner style="width: 50px; height: 50px;" />
                      <p>Uploading... {{ uploadProgress }}%</p>
                    </div>
                    
                    <p class="upload-note">
                      Accepted formats: PNG, JPG, JPEG, GIF<br>
                      Max file size: 10MB
                    </p>
                  </div>
                </Dialog>

                <!-- Gallery Grid -->
                <div v-if="escort.images?.length" class="gallery-grid">
                  <div 
                    v-for="image in escort.images" 
                    :key="image.id"
                    class="gallery-card"
                    :class="{ 'profile-card': image.isProfile }"
                  >
                    <div class="image-container">
                      <Image 
                        :src="image.imageUrl" 
                        alt="Escort"
                        class="gallery-image"
                        preview
                      />
                      <Tag 
                        v-if="image.isProfile" 
                        value="Profile" 
                        severity="info"
                        class="image-badge"
                      />
                    </div>
                    <div class="card-actions">
                      <div class="action-buttons">
                        <Button 
                          v-if="!image.isProfile"
                          icon="pi pi-star" 
                          severity="info"
                          text
                          rounded
                          @click="setProfileImage(image.imageUrl)"
                          tooltip="Set as Profile"
                        />
                        <Button 
                          v-if="!image.approved"
                          icon="pi pi-check" 
                          severity="success"
                          text
                          rounded
                          @click="approveImage(image.id)"
                          tooltip="Approve"
                        />
                        <Button 
                          v-if="!image.approved"
                          icon="pi pi-times" 
                          severity="danger"
                          text
                          rounded
                          @click="rejectImage(image.id)"
                          tooltip="Reject"
                        />
                        <Button 
                          icon="pi pi-trash" 
                          severity="danger"
                          text
                          rounded
                          @click="deleteImage(image.id)"
                          tooltip="Delete"
                        />
                      </div>
                      <Tag 
                        :severity="image.approved ? 'success' : 'warn'"
                        :value="image.approved ? 'Approved' : 'Pending'"
                        class="mt-2"
                      />
                    </div>
                  </div>
                </div>

                <!-- Empty Gallery -->
                <div v-else class="empty-gallery">
                  <i class="pi pi-images" style="font-size: 3rem; color: #9ca3af;"></i>
                  <h4>No Images</h4>
                  <p>This escort hasn't uploaded any images yet.</p>
                  <Button 
                    icon="pi pi-upload" 
                    label="Upload First Image"
                    @click="() => {
                      imageUploadType = 'gallery'
                      showImageUpload = true
                    }"
                  />
                </div>

                <!-- Gallery Tips -->
                <div class="gallery-tips">
                  <h4>📸 Image Guidelines</h4>
                  <ul>
                    <li>Clear, high-quality photos work best</li>
                    <li>First image will be used as profile photo</li>
                    <li>All images must be approved before appearing on the site</li>
                    <li>Max file size: 10MB per image</li>
                    <li>Supported formats: PNG, JPG, JPEG, GIF</li>
                  </ul>
                </div>
              </div>
            </TabPanel>

            <!-- Statistics Tab -->
            <TabPanel header="Statistics">
              <div class="tab-content">
                <!-- Stats Cards -->
                <div class="stats-grid">
                  <Card class="stat-card">
                    <template #content>
                      <div class="stat-content">
                        <i class="pi pi-eye stat-icon"></i>
                        <div class="stat-info">
                          <span class="stat-label">Profile Views</span>
                          <span class="stat-value">{{ escort.statistics?.profileViews || 0 }}</span>
                        </div>
                      </div>
                    </template>
                  </Card>

                  <Card class="stat-card">
                    <template #content>
                      <div class="stat-content">
                        <i class="pi pi-star stat-icon"></i>
                        <div class="stat-info">
                          <span class="stat-label">Average Rating</span>
                          <span class="stat-value">{{ escort.rating?.toFixed(1) || '0.0' }}</span>
                        </div>
                      </div>
                    </template>
                  </Card>

                  <Card class="stat-card">
                    <template #content>
                      <div class="stat-content">
                        <i class="pi pi-calendar stat-icon"></i>
                        <div class="stat-info">
                          <span class="stat-label">Member Since</span>
                          <span class="stat-value">{{ new Date(escort.createdAt).toLocaleDateString() }}</span>
                        </div>
                      </div>
                    </template>
                  </Card>

                  <Card class="stat-card">
                    <template #content>
                      <div class="stat-content">
                        <i class="pi pi-check-circle stat-icon"></i>
                        <div class="stat-info">
                          <span class="stat-label">Verification Status</span>
                          <span class="stat-value">{{ escort.verificationStatus || 'Pending' }}</span>
                        </div>
                      </div>
                    </template>
                  </Card>
                </div>

                <!-- Recent Activity -->
                <div class="recent-activity">
                  <h3>Recent Activity</h3>
                  <div class="activity-list">
                    <div v-if="escort.activity?.length" class="activity-item" v-for="activity in escort.activity.slice(0,5)" :key="activity.id">
                      <i :class="`pi pi-${activity.icon} activity-icon ${activity.type}`"></i>
                      <div class="activity-content">
                        <p>{{ activity.description }}</p>
                        <small>{{ new Date(activity.createdAt).toLocaleString() }}</small>
                      </div>
                    </div>
                    <div v-else class="activity-item">
                      <i class="pi pi-info-circle activity-icon info"></i>
                      <div class="activity-content">
                        <p>No recent activity</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabPanel>
          </TabView>
        </template>
      </Card>
    </template>

    <!-- Not Found -->
    <div v-else class="not-found">
      <i class="pi pi-exclamation-triangle" style="font-size: 3rem; color: #f59e0b;"></i>
      <h2>Escort Not Found</h2>
      <p>The escort you're looking for doesn't exist or has been removed.</p>
      <Button 
        label="Back to Escorts" 
        icon="pi pi-arrow-left"
        @click="router.push('/escorts')"
      />
    </div>
  </div>
</template>

<style scoped>
.escort-profile-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  min-height: 400px;
}

.loading-container p {
  margin-top: 1rem;
  color: #6b7280;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

/* Profile Header */
.profile-header {
  margin-bottom: 1.5rem;
}

.header-content {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.profile-image-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.profile-avatar {
  width: 150px !important;
  height: 150px !important;
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.image-actions {
  display: flex;
  gap: 0.5rem;
}

.profile-info {
  flex: 1;
}

.name-section {
  margin-bottom: 1rem;
}

.name-section h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
}

.status-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.basic-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4b5563;
}

.info-item i {
  color: #6b7280;
}

.header-action-buttons {
  display: flex;
  gap: 0.5rem;
}

/* Tab Content */
.tab-content {
  padding: 1rem 0;
}

/* Profile Form */
.profile-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 2rem;
}

.form-section:last-child {
  border-bottom: none;
}

.form-section h3 {
  margin: 0 0 1.5rem 0;
  color: #1f2937;
  font-size: 1.25rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.required {
  color: #ef4444;
}

.checkbox-group {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

/* Gallery */
.gallery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.upload-dialog {
  text-align: center;
  padding: 1rem;
}

.upload-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
}

.upload-note {
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 1rem;
  line-height: 1.5;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.gallery-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.gallery-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.profile-card {
  border: 2px solid #3b82f6;
}

.image-container {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-badge {
  position: absolute;
  top: 10px;
  right: 10px;
}

.card-actions {
  padding: 1rem;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.empty-gallery {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  background: #f9fafb;
  border-radius: 12px;
  border: 2px dashed #e5e7eb;
}

.empty-gallery h4 {
  margin: 1rem 0 0.5rem;
  color: #1f2937;
}

.empty-gallery p {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.gallery-tips {
  background: #f0f9ff;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 2rem;
}

.gallery-tips h4 {
  margin: 0 0 1rem 0;
  color: #1e40af;
}

.gallery-tips ul {
  margin: 0;
  padding-left: 1.5rem;
  color: #4b5563;
}

.gallery-tips li {
  margin-bottom: 0.5rem;
}

/* Statistics */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  border: 1px solid #e5e7eb;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 2rem;
  color: #3b82f6;
  opacity: 0.7;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  color: #6b7280;
  font-size: 0.875rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.recent-activity {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
}

.recent-activity h3 {
  margin: 0 0 1rem 0;
  color: #1f2937;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

.activity-icon {
  font-size: 1.25rem;
}

.activity-icon.success {
  color: #10b981;
}

.activity-icon.info {
  color: #3b82f6;
}

.activity-icon.warning {
  color: #f59e0b;
}

.activity-content p {
  margin: 0 0 0.25rem 0;
  color: #374151;
}

.activity-content small {
  color: #6b7280;
  font-size: 0.875rem;
}

/* Not Found */
.not-found {
  text-align: center;
  padding: 4rem 2rem;
}

.not-found h2 {
  margin: 1rem 0;
  color: #1f2937;
}

.not-found p {
  color: #6b7280;
  margin-bottom: 2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .escort-profile-page {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .basic-info {
    grid-template-columns: 1fr;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

.w-full {
  width: 100%;
}

.mt-2 {
  margin-top: 0.5rem;
}

.md\:col-span-2 {
  grid-column: span 2;
}
</style>