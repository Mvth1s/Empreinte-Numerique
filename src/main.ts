import { createApp } from 'vue'
import './fonts.css'
import './style.css'
import App from './App.vue'
import { initAnalytics } from './utils/analytics'

initAnalytics()

createApp(App).mount('#app')
