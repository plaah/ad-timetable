<template>
  <!-- Header -->
  <header class="header fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 bg-gradient-to-r from-[#5a2a2a] via-[#933b3b] to-[#ba5757] text-white shadow-md">
    <div class="flex items-center space-x-4">
      <button @click="toggleSidebar" class="toggle-btn hover:scale-105 transition">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <span class="text-lg font-semibold font-poppins tracking-wide">
        {{ titleBanner }}
      </span>
    </div>
    <h1 class="text-xl font-bold font-poppins tracking-wider">Timely</h1>
  </header>

  <!-- Sidebar -->
  <div :class="['sidebar', { 'sidebar-closed': !sidebarOpen }]">
    <div class="sidebar-header">
      <h2>Navigation</h2>
      <button @click="toggleSidebar" class="close-btn">×</button>
    </div>
    <nav class="nav-links">
      <a href="#" @click.prevent="loadMain"><AppIcon name="home" /> Home</a>
      <a href="#" @click.prevent="loadTimetable"><AppIcon name="timetable" /> Timetable</a>
      <a href="#" @click.prevent="loadRuang"><AppIcon name="ruang" /> Venue</a>
      <a href="#" @click.prevent="loadSubjek"><AppIcon name="subjek" /> Subject</a>
      <a href="#" @click.prevent="loadPensyarah"><AppIcon name="lecturer" /> Lecturer</a>
      <a href="#" @click.prevent="loadPelajar"><AppIcon name="student" /> Student</a>
      <a href="#" @click.prevent="loadKurikulum"><AppIcon name="curriculum" /> Curriculum</a>
      <a href="#" @click="logout"><AppIcon name="logout" /> Logout</a>
    </nav>
  </div>

  <!-- Error Message -->
  <div v-if="error" class="error-message">
    {{ error }}
  </div>

  <!-- Page Content -->
  <slot />
</template>

<script setup>
import { ref } from "vue";
import AppIcon from "./AppIcon.vue";
import { userName, userMatric } from "@/constants/ApiConstants.js";

const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
  userName.value = lsData.full_name;
  userMatric.value = lsData.login_name;
}

const sidebarOpen = ref(false);
const error = ref(null);
const props = defineProps({
  titleBanner: {
    type: String,
    default: "Welcome",
  },
});

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

const loadMain = () => {
  toggleSidebar();
  window.location.href = "/main";
};
const loadTimetable = () => {
  toggleSidebar();
  window.location.href = "/timetable";
};
const loadRuang = () => {
  toggleSidebar();
  window.location.href = "/ruang";
};
const loadSubjek = () => {
  toggleSidebar();
  window.location.href = "/subjek";
};
const loadPensyarah = () => {
  toggleSidebar();
  window.location.href = "/pensyarah";
};
const loadPelajar = () => {
  toggleSidebar();
  window.location.href = "/pelajar";
};
const loadKurikulum = () => {
  toggleSidebar();
  window.location.href = "/kurikulum";
};
const logout = () => {
  localStorage.removeItem("web.fc.utm.my_usersession");
  window.location.replace("/login");
};
</script>

<style scoped>
.header {
  font-family: 'Segoe UI', sans-serif;
}
.toggle-btn {
  background-color: transparent;
  color: white;
  padding: 6px;
  border: none;
  border-radius: 6px;
}
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 260px;
  background-color: #933b3b;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
  z-index: 50;
  overflow-y: auto;
  transition: transform 0.3s ease;
}
.sidebar-closed {
  transform: translateX(-100%);
}
.sidebar-header {
  background-color: white;
  color: #933b3b;
  padding: 15px 20px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.close-btn {
  background: none;
  border: none;
  color: #933b3b;
  font-size: 20px;
  cursor: pointer;
}
.nav-links {
  display: flex;
  flex-direction: column;
  padding: 15px 20px;
}
.nav-links a {
  color: white;
  text-decoration: none;
  padding: 12px;
  margin-bottom: 6px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  transition: all 0.2s;
}
.nav-links a:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.03);
}
.error-message {
  background-color: #fdecea;
  color: #c53030;
  padding: 10px;
  margin: 15px;
  border-radius: 6px;
}
</style>
