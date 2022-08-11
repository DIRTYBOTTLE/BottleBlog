import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

window.addEventListener("message", function (msg) {
    if (typeof msg.data === 'string') {
        if (msg.data === "") {
            sessionStorage.removeItem("user")
        } else {
            const data = JSON.parse(msg.data)
            if (data.id) {
                sessionStorage.setItem("user", msg.data)
            }
        }
    }
});

createApp(App).use(router).use(ElementPlus).mount('#app')
