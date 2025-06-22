<script setup>
import { ref, computed, watch, onMounted } from "vue";
import Toggle from "@/components/Toggle.vue";
import StudentScheduleModal from "@/components/StudentScheduleModal.vue";
import {
  fetchCurrentSession,
  fetchAdminSession,
  fetchStudents
} from "@/api/StudentApi.js";
import { userName, userMatric } from "@/constants/ApiConstants.js";

// Ambil data dari localStorage
const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
  userName.value = lsData.full_name;
  userMatric.value = lsData.login_name;
}

// States
const students = ref([]);
const searchQuery = ref("");
const itemsPerPage = 10;
const currentPage = ref(1);
const loading = ref(false);

// Modal
const showModal = ref(false);
const selectedStudent = ref({ name: "", matric: "" });

function openSchedule(student) {
  selectedStudent.value = student;
  showModal.value = true;
}

// Load daftar mahasiswa dari API
async function loadStudents() {
  loading.value = true;
  try {
    if (!lsData?.session_id) throw new Error("Session ID not found");

    const session = await fetchCurrentSession();
    const admin = await fetchAdminSession(lsData.session_id);

    const data = await fetchStudents(admin.session_id, session.sesi, session.semester);

    students.value = data.map(std => ({
      name: std.nama,
      matric: std.no_matrik,
      course: std.kod_kursus
    }));
  } catch (e) {
    console.error("Failed to load students:", e);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadStudents();
});

// Pagination & Search
const filteredStudents = computed(() => {
  return students.value.filter(std =>
    std.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredStudents.value.slice(start, start + itemsPerPage);
});

const pageCount = computed(() => {
  return Math.ceil(filteredStudents.value.length / itemsPerPage) || 1;
});

function gotoPage(page) {
  if (page < 1) page = 1;
  if (page > pageCount.value) page = pageCount.value;
  currentPage.value = page;
}

watch(searchQuery, () => {
  currentPage.value = 1;
});
</script>

<template>
  <div class="bg-gray-100 min-h-screen pt-20 font-[Segoe UI] text-[15px]">
    <Toggle titleBanner="Student" />

    <!-- Search & Pagination Row -->
    <div class="flex flex-col md:flex-row justify-between items-start gap-4 px-4 py-4 max-w-6xl mx-auto w-full">
      <!-- Search -->
      <div class="flex flex-wrap items-center gap-2 w-full md:w-auto pl-2">
        <label class="font-normal">Search:</label>
        <input
          v-model="searchQuery"
          placeholder="Search by student name..."
          class="border border-gray-400 rounded px-3 py-1 w-72 shadow-sm"
        />
      </div>

      <!-- Pagination -->
      <div class="flex items-center gap-1 text-sm font-[Segoe UI] pr-2 md:ml-auto">
        <button @click="gotoPage(1)" :disabled="currentPage === 1" class="px-2 py-1 border rounded">&laquo;</button>
        <button @click="gotoPage(currentPage - 1)" :disabled="currentPage === 1" class="px-2 py-1 border rounded">&lt;</button>
        <span>Page</span>
        <select
          v-model="currentPage"
          @change="gotoPage(Number(currentPage))"
          class="px-2 py-1 border rounded"
        >
          <option v-for="page in pageCount" :key="page" :value="page">{{ page }}</option>
        </select>
        <span>of {{ pageCount }}</span>
        <button @click="gotoPage(currentPage + 1)" :disabled="currentPage === pageCount" class="px-2 py-1 border rounded">&gt;</button>
        <button @click="gotoPage(pageCount)" :disabled="currentPage === pageCount" class="px-2 py-1 border rounded">&raquo;</button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center text-gray-500 py-10">Loading Student List...</div>

    <!-- Student Cards -->
    <div class="grid gap-4 px-4 py-4 max-w-6xl mx-auto grid-cols-1 md:grid-cols-2">
      <div
        v-for="student in paginatedStudents"
        :key="student.matric"
        class="bg-white border border-gray-200 hover:shadow-md rounded-xl p-4 flex flex-col justify-between min-h-[135px]"
      >
        <div>
          <!-- Klik nama untuk buka modal -->
          <div
            @click="openSchedule(student)"
            class="cursor-pointer hover:underline text-[#933b3b] font-semibold text-base mb-1"
          >
            🎓 {{ student.name }}
          </div>
          <div class="text-gray-800 mb-2 text-sm">Matric: <strong>{{ student.matric }}</strong></div>
        </div>
        <div class="flex gap-2 mt-2 text-sm">
          <span class="flex items-center gap-1 bg-purple-100 text-gray-800 border border-purple-200 px-2 py-1 rounded">
            🆔 {{ student.matric }}
          </span>
          <span class="flex items-center gap-1 bg-blue-100 text-gray-800 border border-blue-200 px-2 py-1 rounded">
            🏛️ {{ student.course }}
          </span>
        </div>
      </div>

      <!-- No Data Message -->
      <div v-if="!paginatedStudents.length" class="text-center text-gray-400 italic py-10 col-span-full">
        No students found.
      </div>
    </div>

    <!-- Student Timetable Modal -->
    <StudentScheduleModal
      v-model:visible="showModal"
      :studentName="selectedStudent.name"
      :matric="selectedStudent.matric"
      :sessionId="lsData?.session_id"
    />

    <!-- Footer -->
    <p class="text-xs text-center mt-6 px-4 text-gray-600">
      If you have any comments or questions regarding this webpage, please contact
      <a href="mailto:ttms@fc.utm.my" class="text-red-600">ttms@fc.utm.my</a>.<br />
      &copy; 2002–2025, Faculty of Computing, UTM. All rights reserved.
    </p>
  </div>
</template>
