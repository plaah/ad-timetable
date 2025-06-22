<script setup>
import { ref, computed, watch, onMounted } from "vue";
import Toggle from "@/components/Toggle.vue";
import LecturerScheduleModal from "@/components/LecturerScheduleModal.vue";
import { userName, userMatric } from "@/constants/ApiConstants.js";
import {
  fetchCurrentSession,
  fetchAdminSession,
  fetchLecturers
} from "@/api/LecturerApi.js";

// Auth dari localStorage
const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
  userName.value = lsData.full_name;
  userMatric.value = lsData.login_name;
}

// State
const lecturers = ref([]);
const searchQuery = ref("");
const itemsPerPage = 10;
const currentPage = ref(1);
const loading = ref(false);

// Modal
const showModal = ref(false);
const selectedLecturer = ref({ name: "", noPekerja: "" });

// Load data dosen
async function loadLecturers() {
  loading.value = true;
  try {
    if (!lsData?.session_id) throw new Error("Session ID not found");
    const session = await fetchCurrentSession();
    const admin = await fetchAdminSession(lsData.session_id);
    const data = await fetchLecturers(admin.session_id, session.sesi, session.semester);

    lecturers.value = data.map(lect => ({
      name: lect.nama,
      noPekerja: String(lect.no_pekerja), // ✅ convert to string
      subjectCount: lect.bil_subjek,
      sectionCount: lect.bil_seksyen,
      studentCount: lect.bil_pelajar
    }));
  } catch (e) {
    console.error("Failed to load lecturers:", e);
  } finally {
    loading.value = false;
  }
}

function openSchedule(lecturer) {
  selectedLecturer.value = lecturer;
  showModal.value = true;
}

onMounted(() => {
  loadLecturers();
});

// Filter & Paginate
const filteredLecturers = computed(() =>
  lecturers.value.filter(lect =>
    lect.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
);

const paginatedLecturers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredLecturers.value.slice(start, start + itemsPerPage);
});

const pageCount = computed(() =>
  Math.ceil(filteredLecturers.value.length / itemsPerPage) || 1
);

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
    <Toggle titleBanner="Lecturer" />

    <!-- Search & Pagination -->
    <div class="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center md:items-start py-4 gap-4">
      <!-- Search -->
      <div class="flex items-center gap-2 w-full md:w-auto">
        <label class="font-normal whitespace-nowrap">Search:</label>
        <input
          v-model="searchQuery"
          placeholder="Search lecturer name..."
          class="border border-gray-400 rounded px-3 py-1 w-72 shadow-sm"
        />
      </div>

      <!-- Pagination -->
      <div class="flex items-center gap-1 text-sm md:ml-auto">
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

    <!-- Lecturer Cards -->
    <div class="grid gap-4 px-4 py-2 max-w-6xl mx-auto grid-cols-1 md:grid-cols-2">
      <div
        v-for="(lecturer, index) in paginatedLecturers"
        :key="(currentPage - 1) * itemsPerPage + index"
        class="bg-white border border-gray-200 hover:shadow-md rounded-xl px-4 py-3 flex flex-col justify-between min-h-[140px]"
      >
        <!-- Click name to open modal -->
        <div
          @click="openSchedule(lecturer)"
          class="cursor-pointer text-[#933b3b] font-semibold text-lg hover:underline"
        >
          {{ lecturer.name }}
        </div>

        <div class="flex flex-wrap gap-2 text-sm mt-2">
          <span class="flex items-center gap-1 bg-red-50 border border-red-200 px-2 py-1 rounded">
            📘 Subjects: {{ lecturer.subjectCount }}
          </span>
          <span class="flex items-center gap-1 bg-gray-100 border border-gray-300 px-2 py-1 rounded">
            🧩 Sections: {{ lecturer.sectionCount }}
          </span>
          <span class="flex items-center gap-1 bg-blue-50 border border-blue-200 px-2 py-1 rounded">
            👥 Students: {{ lecturer.studentCount }}
          </span>
        </div>
      </div>

      <div v-if="!paginatedLecturers.length" class="text-center text-gray-400 italic py-10 col-span-full">
        No lecturers found.
      </div>
    </div>

    <!-- Modal transparan -->
    <Teleport to="body">
      <div
        v-if="showModal"
        class="fixed top-0 left-0 w-full h-full z-50 flex justify-center items-center pointer-events-none"
      >
        <div
          class="bg-white rounded-xl shadow-xl p-6 max-w-5xl w-[95%] max-h-[90vh] overflow-y-auto pointer-events-auto"
        >
          <LecturerScheduleModal
            v-model:visible="showModal"
            :lecturerName="selectedLecturer.name"
            :noPekerja="selectedLecturer.noPekerja"
            :sessionId="lsData?.session_id"
          />
        </div>
      </div>
    </Teleport>

    <!-- Footer -->
    <p class="text-xs text-center mt-6 px-4 text-gray-600">
      If you have any comments or inquiries regarding this webpage, please contact the webmaster at
      <a href="mailto:ttms@fc.utm.my" class="text-red-600">ttms@fc.utm.my</a><br />
      &copy; 2002–2025, Faculty of Computing, UTM. All rights reserved.
    </p>
  </div>
</template>
