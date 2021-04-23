import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import localForage from "localforage";

Vue.config.productionTip = false

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')

localForage.config({name: 'd2s'})