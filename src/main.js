// FILE: main.js

import { createApp } from 'vue'
import { Quasar, Notify, Loading } from 'quasar'
import { register_component } from 'src/boot/component.js'
import Antd from 'ant-design-vue'
// Import icon libraries
import '@quasar/extras/roboto-font/roboto-font.css'
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/material-icons-outlined/material-icons-outlined.css'
import 'ant-design-vue/dist/reset.css'
// A few examples for animations from Animate.css:
// import @quasar/extras/animate/fadeIn.css
// import @quasar/extras/animate/fadeOut.css

// Import Quasar cssC
import 'quasar/src/css/index.sass'
import 'src/css/index.scss'
// Assumes your root component is App.vue
// and placed in same folder as main.js
import App from './App.vue'
import router from './router'
const app = createApp(App)

app.use(router)
app.use(Quasar, {
  plugins: {
    Notify, // import Quasar plugins and add here
    Loading,
  }, // import Quasar plugins and add here
  /*
  config: {
    brand: {
      // primary: '#e46262',
      // ... or all other brand colors
    },
    notify: {...}, // default set of options for Notify Quasar plugin
    loading: {...}, // default set of options for Loading Quasar plugin
    loadingBar: { ... }, // settings for LoadingBar Quasar plugin
    // ..and many more (check Installation card on each Quasar component/directive/plugin)
  }
  */
})
app.use(Antd)
register_component(app)

// Assumes you have a <div id="app"></div> in your index.html
app.mount('#app')
