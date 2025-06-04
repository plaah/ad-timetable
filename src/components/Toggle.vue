<template>
<!-- Header -->
<header class="header flex items-center justify-between px-4 py-2 bg-[#008080] text-white fixed top-0 left-0 right-0 z-50">
  <div class="flex items-center space-x-3">
    <button @click="toggleSidebar" class="toggle-btn p-2 bg-white rounded text-[#008080]">
      &#9776;
    </button>
    <!-- Tambahin title banner di sini -->
    <span class="text-[#933b3b] font-['Poppins'] text-lg font-semibold ">
      {{ titleBanner }}
    </span>
  </div>

  <h1 class="title text-xl font-bold font-['Poppins']">Timely</h1>
</header>


  <!-- Sidebar -->
  <div :class="['sidebar', { 'sidebar-closed': !sidebarOpen }]">
    <div class="sidebar-header">
      <h2>Menu</h2>
      <button @click="toggleSidebar" class="close-btn">&#10005;</button>
    </div>

    <nav class="nav-links">
      <a href="#" @click.prevent="loadMain"><AppIcon name="home" /> Home</a>
      <a href="#" @click.prevent="loadTimetable"><AppIcon name="timetable" /> Timetable</a>
      <a href="#" @click.prevent="loadRuang"><AppIcon name="ruang" /> Venue</a>
      <a href="#" @click.prevent="loadSubjek"><AppIcon name="subjek" /> Subject</a>
      <a href="#" @click.prevent="loadPensyarah"><AppIcon name="lecturer" /> Lecturer</a>
      <a href="#" @click.prevent="loadPelajar"><AppIcon name="student" /> Pelajar</a>
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
import { userInfo, userName, userMatric } from "@/constants/ApiConstants.js";

const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
  userName.value = lsData.full_name;
  userMatric.value = lsData.login_name;
}

const sidebarOpen = ref(false);
const analysisOpen = ref(false);
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

const fetchWithErrorHandler = async (apiCall) => {
  try {
    error.value = null;
    return await apiCall();
  } catch (err) {
    error.value = "Gagal mengambil data: " + (err.message || err);
    console.error("[Fetch Error]", err);
    return null;
  }

};
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(to right, #fbeaea, #e8b9b9, #933b3b);
  color: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 20;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  font-family: 'Segoe UI', sans-serif;
}

.title {
  font-size: 20px;
  font-weight: bold;
}

.toggle-btn {
  background: #933b3b; /* merah toska */
  border: none;
  color: white; /* icon putih */
  font-size: 24px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 4px;
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 260px;
  background-color: #933b3b; /* full merah toska */
  box-shadow: 2px 0 5px rgba(0,0,0,0.1);
  z-index: 50;
  overflow-y: auto;
  transition: transform 0.3s ease;
  font-family: 'Segoe UI', sans-serif;
}

.sidebar-closed {
  transform: translateX(-100%);
}

.sidebar-header {
  padding: 15px 20px;
  background-color: white; /* header sidebar putih */
  color: #933b3b; /* tulisan merah */
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
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
  padding: 10px 20px;
}

.nav-links a {
  color: white;
  text-decoration: none;
  padding: 10px 8px;
  border-radius: 8px;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  font-family: 'Segoe UI', sans-serif;
  transition: transform 0.2s ease;
}

.nav-links a:hover {
  transform: scale(1.05); /* sedikit membesar */
  background-color: rgba(255, 255, 255, 0.1); /* optional efek hover */
}

.dropdown {
  margin-bottom: 10px;
}

.dropdown-btn {
  width: 100%;
  background: none;
  border: none;
  text-align: left;
  padding: 10px 8px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'Segoe UI', sans-serif;
  transition: transform 0.2s ease;
}

.dropdown-btn:hover {
  transform: scale(1.05);
  background-color: rgba(255, 255, 255, 0.1);
}

.dropdown-content {
  padding-left: 15px;
  display: flex;
  flex-direction: column;
}

.dropdown-content a {
  padding: 8px;
  font-size: 14px;
  color: white;
  border-radius: 6px;
  font-family: 'Segoe UI', sans-serif;
  transition: transform 0.2s ease;
}

.dropdown-content a:hover {
  transform: scale(1.05);
  background-color: rgba(255, 255, 255, 0.1);
}

.error-message {
  background-color: #fde2e2;
  color: #d32f2f;
  padding: 10px;
  margin: 15px;
  border-radius: 6px;
  font-size: 14px;
  font-family: 'Segoe UI', sans-serif;
}
</style>
