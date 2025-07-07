<script setup>
import { ref, computed, watch, onMounted } from "vue";
import Toggle from "@/components/Toggle.vue";
import StudentScheduleModal from "@/components/StudentScheduleModal.vue";
import InfoCard from "@/components/InfoCard.vue";
import {
  fetchCurrentSession,
  fetchAdminSession,
  fetchStudents
} from "@/api/StudentApi.js";
import { userName, userMatric } from "@/constants/ApiConstants.js";
import RedPagination from '@/components/RedPagination.vue';

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

const pageSizeOptions = [10, 20, 50, 100];
const pageSize = ref(itemsPerPage);
watch(pageSize, (val) => { itemsPerPage = val; currentPage.value = 1; });
function handlePageChange(page) { gotoPage(page); }
function handlePageSizeChange(size) { itemsPerPage = size; currentPage.value = 1; }
</script>

<template>
  <div class="bg-gray-100 min-h-screen pt-20 font-[Segoe UI] text-[15px]">
    <Toggle titleBanner="Student" />

    <!-- Search & Pagination Row -->
    <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-4 px-4 py-4 max-w-6xl mx-auto w-full">
      <div class="w-full md:w-auto flex flex-wrap items-center gap-2 mb-2 md:mb-0 pl-0 md:pl-2">
        <label class="font-normal">Search:</label>
        <input
          v-model="searchQuery"
          placeholder="Search by student name..."
          class="border border-gray-400 rounded px-3 py-1 w-full md:w-72 shadow-sm"
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center text-gray-500 py-10">Loading...</div>

    <!-- Student Cards -->
    <div v-else class="grid gap-4 px-4 py-4 max-w-6xl mx-auto grid-cols-1 md:grid-cols-2">
      <InfoCard
        v-for="student in paginatedStudents"
        :key="student.matric"
        :icon="'🎓'"
        :title="student.name"
        :subtitle="`Matric: ${student.matric}`"
        :badges="[
          { icon: '🎓', text: student.matric, class: 'bg-purple-100 text-gray-800 border border-purple-200' },
          { icon: '🏛️', text: student.course, class: 'bg-blue-100 text-gray-800 border border-blue-200' }
        ]"
        :actions="[{ label: 'View Schedule', onClick: () => openSchedule(student) }]"
      />
      <div v-if="!loading && !paginatedStudents.length" class="text-center text-gray-400 italic py-10 col-span-full">No student found</div>
    </div>
    <!-- Pagination (always below, all devices) -->
    <RedPagination
      :currentPage="currentPage"
      :pageCount="pageCount"
      :onPageChange="handlePageChange"
      :pageSize="pageSize"
      :onPageSizeChange="handlePageSizeChange"
      :pageSizeOptions="pageSizeOptions"
    />

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
