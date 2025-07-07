<template>
  <!-- Header -->
  <header
    class="header fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 bg-gradient-to-r from-[#5a2a2a] via-[#933b3b] to-[#ba5757] text-white shadow-md"
  >
    <div class="flex items-center space-x-4">
      <button @click="openSidebar" class="toggle-btn">
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

  <!-- Overlay -->
  <div v-if="sidebarVisible" class="overlay" @click="closeSidebar"></div>

  <!-- Sidebar -->
  <div
    v-if="sidebarVisible"
    ref="sidebarRef"
    :class="['sidebar', { 'sidebar-collapsed': isCollapsed }]"
  >
    <div class="sidebar-header">
      <h2 v-if="!isCollapsed" class="text-lg font-bold">Menu</h2>
      <button @click="toggleCollapse" class="expand-btn" :class="{ rotated: !isCollapsed }">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 transform transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="#933b3b">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <nav class="nav-links">
      <div
        v-for="item in navItems"
        :key="item.path"
        class="nav-link"
        :class="{ active: isActive(item.path) }"
        @click.prevent="navigate(item.path)"
      >
        <AppIcon :name="item.icon" />
        <template v-if="!isCollapsed">
          <transition name="fade">
            <span class="link-text">{{ item.label }}</span>
          </transition>
        </template>
        <template v-else>
          <span class="tooltip">{{ item.label }}</span>
        </template>
      </div>

      <div class="nav-link" @click="logout">
        <AppIcon name="logout" />
        <template v-if="!isCollapsed">
          <transition name="fade">
            <span class="link-text">Logout</span>
          </transition>
        </template>
        <template v-else>
          <span class="tooltip">Logout</span>
        </template>
      </div>
    </nav>
  </div>

  <div v-if="error" class="error-message">
    {{ error }}
  </div>

  <slot />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import AppIcon from "./AppIcon.vue";
import { userName, userMatric } from "@/constants/ApiConstants.js";

const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
  userName.value = lsData.full_name;
  userMatric.value = lsData.login_name;
}

const error = ref(null);
const sidebarVisible = ref(false);
const isCollapsed = ref(true);
const sidebarRef = ref(null);

const props = defineProps({
  titleBanner: {
    type: String,
    default: "Welcome",
  },
});

const openSidebar = () => {
  sidebarVisible.value = true;
  isCollapsed.value = true;
};

const closeSidebar = () => {
  sidebarVisible.value = false;
};

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

const navigate = (url) => {
  window.location.href = url;
};

const isActive = (path) => {
  return window.location.pathname === path;
};

const logout = () => {
  localStorage.removeItem("web.fc.utm.my_usersession");
  window.location.replace("/login");
};

const navItems = [
  { path: "/Home", icon: "home", label: "Home" },
  { path: "/Timetable", icon: "timetable", label: "Timetable" },
  { path: "/Venue", icon: "venue", label: "Venue" },
  { path: "/Subject", icon: "subjek", label: "Subject" },
  { path: "/Lecturer", icon: "lecturer", label: "Lecturer" },
  { path: "/Student", icon: "student", label: "Student" },
  { path: "/Curriculum", icon: "curriculum", label: "Curriculum" },
];

const handleKeydown = (e) => {
  if (e.key === "Escape") closeSidebar();
};

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
});
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
  transition: width 0.5s;
}
.toggle-btn:hover {
  transform: scale(1.15);
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.2);
  z-index: 40;
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
  transition: width 0.5s ease;
}
.sidebar-collapsed {
  width: 70px;
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

.expand-btn {
  background: none;
  border: none;
  cursor: pointer;
  transition: transform 0.3s ease;
}
.expand-btn.rotated svg {
  transform: rotate(180deg);
}

.nav-links {
  display: flex;
  flex-direction: column;
  padding: 20px 10px;
}
.nav-link {
  color: white;
  text-decoration: none;
  padding: 12px;
  margin-bottom: 10px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 14px;
  font-weight: 600;
  font-size: 15px;
  transition: all 0.25s ease;
  position: relative;
}
.nav-link:hover {
  background: rgba(255, 255, 255, 0.15);
}
.nav-link.active {
  background-color: rgba(255, 255, 255, 0.2);
  font-weight: 700;
}

.link-text {
  white-space: nowrap;
  overflow: hidden;
}

.tooltip {
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  color: #933b3b;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  opacity: 0;
  white-space: nowrap;
  pointer-events: none;
  transition: opacity 0.2s ease;
  margin-left: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
.nav-link:hover .tooltip {
  opacity: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
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