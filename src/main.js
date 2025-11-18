import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './index.css'
import { pinia } from './stores'
import { useThemeStore } from '@/stores/theme'

const app = createApp(App)
const themeStore = useThemeStore(pinia)
themeStore.applyClass()

app.use(pinia)
app.use(router)
app.mount('#app')
