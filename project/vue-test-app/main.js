import { createApp } from 'vue'
import { Quasar, Notify, Loading } from 'quasar'
import { register_component } from 'src/boot/component.js'
import Antd from 'ant-design-vue'
import { createHead } from '@unhead/vue/client'

import '@quasar/extras/roboto-font/roboto-font.css'
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/material-icons-outlined/material-icons-outlined.css'
import 'ant-design-vue/dist/reset.css'
import 'github-markdown-css/github-markdown.css'
import 'quasar/src/css/index.sass'
import 'src/css/index.scss'

import App from 'src/App.vue'
import router from './router'

const app = createApp(App)
register_component(app)
app.use(router)
app.use(Quasar, {
  plugins: { Notify, Loading },
  config: { dark: true },
})
app.use(Antd)
const head = createHead()
app.use(head)
app.mount('#app')
