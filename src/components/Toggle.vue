<template>
  <!-- Header -->
  <header
    class="header fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 bg-gradient-to-r from-[#5a2a2a] via-[#933b3b] to-[#ba5757] text-white shadow-md"
  >
    <div class="flex items-center space-x-4">
      <button @click="toggleSidebar" class="toggle-btn">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
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
      <h2 class="text-lg font-bold">Menu</h2>
      <button @click="toggleSidebar" class="close-btn">&times;</button>
    </div>
    <nav class="nav-links">
      <a :class="{ active: isActive('/Home') }" href="#" @click.prevent="navigate('/Home')">
        <AppIcon name="home" /> Home
      </a>
      <a :class="{ active: isActive('/Timetable') }" href="#" @click.prevent="navigate('/Timetable')">
        <AppIcon name="timetable" /> Timetable
      </a>
      <a :class="{ active: isActive('/Venue') }" href="#" @click.prevent="navigate('/Venue')">
        <AppIcon name="venue" /> Venue
      </a>
      <a :class="{ active: isActive('/Subject') }" href="#" @click.prevent="navigate('/Subject')">
        <AppIcon name="subjek" /> Subject
      </a>
      <a :class="{ active: isActive('/Lecturer') }" href="#" @click.prevent="navigate('/Lecturer')">
        <AppIcon name="lecturer" /> Lecturer
      </a>
      <a :class="{ active: isActive('/Student') }" href="#" @click.prevent="navigate('/Student')">
        <AppIcon name="student" /> Student
      </a>
      <a :class="{ active: isActive('/Curriculum') }" href="#" @click.prevent="navigate('/Curriculum')">
        <AppIcon name="curriculum" /> Curriculum
      </a>
      <a href="#" @click="logout">
        <AppIcon name="logout" /> Logout
      </a>
    </nav>
  </div>

  <div v-if="error" class="error-message">
    {{ error }}
  </div>

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

const navigate = (url) => {
  toggleSidebar();
  window.location.href = url;
};

const isActive = (path) => {
  return window.location.pathname === path;
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
  transition: transform 0.2s;
}
.toggle-btn:hover {
  transform: scale(1.15);
}
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 260px;
  background: #933b3b;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.3);
  z-index: 50;
  overflow-y: auto;
  transition: transform 0.4s ease;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}
.sidebar-closed {
  transform: translateX(-100%);
}
.sidebar-header {
  background-color: rgba(255, 255, 255, 0.9);
  color: #933b3b;
  padding: 16px 20px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
}
.close-btn {
  background: none;
  border: none;
  color: #933b3b;
  font-size: 22px;
  cursor: pointer;
  transition: transform 0.3s ease;
}
.close-btn:hover {
  transform: rotate(90deg);
}
.nav-links {
  display: flex;
  flex-direction: column;
  padding: 20px;
}
.nav-links a {
  color: white;
  text-decoration: none;
  padding: 12px 16px;
  margin-bottom: 10px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 14px;
  font-weight: 600;
  font-size: 15px;
  transition: all 0.25s ease;
}
.nav-links a:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(5px);
}
.nav-links a.active {
  background-color: rgba(255, 255, 255, 0.2);
  font-weight: 700;
  transform: scale(1.03);
}
.error-message {
  background-color: #fdecea;
  color: #c53030;
  padding: 10px;
  margin: 15px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
}
</style>
