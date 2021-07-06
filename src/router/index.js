import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: () => import( '../views/About.vue')
  },
  {
    path: '/20210706',
    name: '20210706',
    component: () => import( '../components/tableTest.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
