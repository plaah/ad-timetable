import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../views/LoginPage.vue';
import DashboardStudent from '../views/DashboardStudent.vue';
import DashboardLecture from '../views/DashboardLecture.vue';

const routes = [
  { path: '/', component: LoginPage },
  { path: '/dashboard-student', component: DashboardStudent },
  { path: '/dashboard-lecture', component: DashboardLecture },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;