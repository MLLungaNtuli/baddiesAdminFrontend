import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'

import Lara from '@primevue/themes/lara'
import 'primeicons/primeicons.css'

// PrimeVue components
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Toast from 'primevue/toast' // Add this
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Checkbox from 'primevue/checkbox'
import ConfirmDialog from 'primevue/confirmdialog'
import Skeleton from 'primevue/skeleton'
import ProgressSpinner from 'primevue/progressspinner' // Add this
import Avatar from 'primevue/avatar' // Add this
import Card from 'primevue/card' // Add this
import TabView from 'primevue/tabview' // Add this
import TabPanel from 'primevue/tabpanel' // Add this
import Dropdown from 'primevue/dropdown' // Add this
import MultiSelect from 'primevue/multiselect' // Add this
import FileUpload from 'primevue/fileupload' // Add this
import Image from 'primevue/image' // Add this

const app = createApp(App)

app.use(router)
app.use(ConfirmationService)
app.use(ToastService) // Use ToastService, not Toast

app.use(PrimeVue, {
  theme: {
    preset: Lara
  }
})

// Register components
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('Button', Button)
app.component('Tag', Tag)
app.component('Toast', Toast) // Register Toast component
app.component('Dialog', Dialog)
app.component('InputText', InputText)
app.component('InputNumber', InputNumber)
app.component('Textarea', Textarea)
app.component('Checkbox', Checkbox)
app.component('ConfirmDialog', ConfirmDialog)
app.component('Skeleton', Skeleton)
app.component('ProgressSpinner', ProgressSpinner)
app.component('Avatar', Avatar)
app.component('Card', Card)
app.component('TabView', TabView)
app.component('TabPanel', TabPanel)
app.component('Dropdown', Dropdown)
app.component('MultiSelect', MultiSelect)
app.component('FileUpload', FileUpload)
app.component('Image', Image)

app.mount('#app')