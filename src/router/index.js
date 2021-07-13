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
    component: () => import('../views/About.vue')
  },
  {
    path: '/20210706',
    name: '20210706',
    component: () => import('../components/tableTest.vue')
  },
  {
    path: '/20210708',
    name: '20210708',
    component: () => import('../views/teachingClass.vue')
  },
  {
    path: '/courseInfo',
    name: 'courseInfo',
    component: () => import('../views/courseInfo.vue')
  },
  {
    path: '/courseArrangement',
    name: 'courseArrangement',
    component: () => import('../views/courseArrangement.vue')
  },
  {
    path: '/courseApplication',
    name: 'courseApplication',
    component: () => import('../views/courseApplication.vue')
  },
  {
    path: '/classroomApplication',
    name: 'classroomApplication',
    component: () => import('../views/classroomApplication.vue')
  },
  {
    path: '/classSchedule',
    name: 'classSchedule',
    component: () => import('../components/classSchedule.vue')
  },
  {
    path: '/workloadStatistics',
    name: 'workloadStatistics',
    component: () => import('../views/workloadStatistics.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
