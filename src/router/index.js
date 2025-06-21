import { createRouter, createWebHistory } from "vue-router";
import Login from "@/views/Login.vue";
import Home from "@/views/Home.vue";
import Timetable from "@/views/Timetable.vue";
import Room from "@/views/Venue.vue";
import Subject from "@/views/Subject.vue";
import Lecturer from "@/views/Lecturer.vue";
import Student from "@/views/Student.vue";
import Curriculum from "@/views/Curriculum.vue";
import AnalysisSubject from "@/views/AnalysisSubject.vue";
import AnalysisStudent from "@/views/AnalysisStudent.vue";
import ClashLecture from "@/views/ClashLecture.vue";
import ClashStudent from "@/views/ClashStudent.vue";
import ClashVenue from "@/views/ClashVenue.vue";
import TimeVenue from "@/views/TimeVenue.vue";

const routes = [
  // Saat akses '/', redirect ke /login
  { path: "/", redirect: "/login" },

  // Halaman Login (tidak butuh auth)
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { requiresAuth: false },
  },

  // Halaman yang butuh login
  {
    path: "/home",
    name: "Home",
    component: Home,
    meta: { requiresAuth: true },
  },
  {
    path: "/timetable",
    name: "Timetable",
    component: Timetable,
    meta: { requiresAuth: true },
  },
  {
    path: "/venue",
    name: "Venue",
    component: Room,
    meta: { requiresAuth: true },
  },
  {
    path: "/subject",
    name: "Subject",
    component: Subject,
    meta: { requiresAuth: true },
  },
  {
    path: "/lecturer",
    name: "Lecturer",
    component: Lecturer,
    meta: { requiresAuth: true },
  },
  {
    path: "/student",
    name: "Student",
    component: Student,
    meta: { requiresAuth: true },
  },
  {
    path: "/curriculum",
    name: "Curriculum",
    component: Curriculum,
    meta: { requiresAuth: true },
  },
  {
    path: "/analysissubject",
    name: "AnalysisSubject",
    component: AnalysisSubject,
    meta: { requiresAuth: true },
  },
  {
    path: "/analysisstudent",
    name: "AnalysisStudent",
    component: AnalysisStudent,
    meta: { requiresAuth: true },
  },
  {
    path: "/clashlecture",
    name: "ClashLecture",
    component: ClashLecture,
    meta: { requiresAuth: true },
  },
  {
    path: "/clashstudent",
    name: "ClashStudent",
    component: ClashStudent,
    meta: { requiresAuth: true },
  },
  {
    path: "/clashvenue",
    name: "ClashVenue",
    component: ClashVenue,
    meta: { requiresAuth: true },
  },
  {
    path: "/timevenue",
    name: "TimeVenue",
    component: TimeVenue,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard: cek apakah user sudah login
router.beforeEach((to, from, next) => {
  const session = localStorage.getItem("web.fc.utm.my_usersession");

  // Jika halaman butuh login dan belum login, redirect ke /login
  if (to.meta.requiresAuth && !session) {
    return next("/login");
  }

  // Jika user sudah login dan mencoba akses /login, redirect ke /home
  if (to.path === "/login" && session) {
    return next("/home");
  }

  // Jika semua aman, lanjutkan ke halaman yang diminta
  next();
});

export default router;