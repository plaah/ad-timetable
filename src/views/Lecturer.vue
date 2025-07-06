<script setup>
import { ref, computed, watch, onMounted } from "vue";
import Toggle from "@/components/Toggle.vue";
import LecturerScheduleModal from "@/components/LecturerScheduleModal.vue";
import InfoCard from "@/components/InfoCard.vue";
import { userName, userMatric } from "@/constants/ApiConstants.js";
import {
  fetchCurrentSession,
  fetchAdminSession,
  fetchLecturers,
  fetchLecturerSections
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

// Load data dosen dengan cache
async function loadLecturers() {
  loading.value = true;
  try {
    if (!lsData?.session_id) throw new Error("Session ID not found");
    const session = await fetchCurrentSession();
    const admin = await fetchAdminSession(lsData.session_id);
    const data = await fetchLecturers(admin.session_id, session.sesi, session.semester);

    const lecturersWithSubjects = await Promise.all(
      data.map(async (lect) => {
        const cacheKey = `lecturer_subj_${lect.no_pekerja}_${session.sesi}_${session.semester}`;
        let currentSubjects = [];

        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          currentSubjects = JSON.parse(cached);
        } else {
          const subjectList = await fetchLecturerSections(lect.no_pekerja);
          currentSubjects = subjectList.filter(
            (s) =>
              s.sesi === session.sesi &&
              String(s.semester) === String(session.semester)
          );
          localStorage.setItem(cacheKey, JSON.stringify(currentSubjects));
        }

        return {
          name: lect.nama,
          noPekerja: String(lect.no_pekerja),
          subjectCount: lect.bil_subjek,
          sectionCount: lect.bil_seksyen,
          studentCount: lect.bil_pelajar,
          subjects: currentSubjects.map((s) => `${s.kod_subjek} - ${s.nama_subjek}`),
        };
      })
    );

    lecturers.value = lecturersWithSubjects;
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
  lecturers.value.filter((lect) => {
    const query = searchQuery.value.toLowerCase();
    const nameMatch = lect.name.toLowerCase().includes(query);
    const courseMatch = lect.subjects.some((subj) =>
      subj.toLowerCase().includes(query)
    );
    return nameMatch || courseMatch;
  })
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
    <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-4 max-w-6xl mx-auto px-4 py-4">
      <div class="w-full md:w-auto flex items-center gap-2 mb-2 md:mb-0">
        <label class="font-normal whitespace-nowrap">Search:</label>
        <input
          v-model="searchQuery"
          placeholder="Search lecturer name or course..."
          class="border border-gray-400 rounded px-3 py-1 w-full md:w-72 shadow-sm"
        />
      </div>
    </div>

    <!-- Lecturer Cards -->
    <div v-if="loading" class="text-center text-gray-500 py-10">Loading...</div>
    <div v-else class="grid gap-4 px-4 py-2 max-w-6xl mx-auto grid-cols-1 md:grid-cols-2">
      <InfoCard
        v-for="(lecturer, index) in paginatedLecturers"
        :key="(currentPage - 1) * itemsPerPage + index"
        :icon="'🎓'"
        :title="lecturer.name"
        :details="lecturer.subjects?.length ? lecturer.subjects.map(s => ({ icon: '📚', text: s })) : []"
        :badges="[
          { icon: '📖', text: `Subjects: ${lecturer.subjectCount}`, class: 'bg-red-50 border border-red-200' },
          { icon: '🧩', text: `Sections: ${lecturer.sectionCount}`, class: 'bg-gray-100 border border-gray-300' },
          { icon: '👥', text: `Students: ${lecturer.studentCount}`, class: 'bg-blue-50 border border-blue-200' }
        ]"
        :actions="[{ label: 'View Schedule', onClick: () => openSchedule(lecturer) }]"
      />
      <div v-if="!loading && !paginatedLecturers.length" class="text-center text-gray-400 italic py-10 col-span-full">No lecturer found</div>
    </div>
    <!-- Pagination (always below, all devices) -->
    <div class="flex justify-center mt-2 mb-2 w-full gap-1">
      <button @click="gotoPage(1)" :disabled="currentPage === 1" :class="['px-2 py-1 border rounded font-semibold transition', currentPage === 1 ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed' : 'bg-white text-[#e11d48] border-[#e11d48] hover:bg-[#e11d48] hover:text-white']">&laquo;</button>
      <button @click="gotoPage(currentPage - 1)" :disabled="currentPage === 1" :class="['px-2 py-1 border rounded font-semibold transition', currentPage === 1 ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed' : 'bg-white text-[#e11d48] border-[#e11d48] hover:bg-[#e11d48] hover:text-white']">&lt;</button>
      <span class="mx-2 font-semibold">Page</span>
      <select
        v-model="currentPage"
        @change="gotoPage(Number(currentPage))"
        class="px-2 py-1 border rounded font-semibold text-[#e11d48] border-[#e11d48] bg-white hover:bg-[#fef2f2] transition"
        style="min-width: 48px;"
      >
        <option v-for="page in pageCount" :key="page" :value="page">{{ page }}</option>
      </select>
      <span class="mx-2 font-semibold">of {{ pageCount }}</span>
      <button @click="gotoPage(currentPage + 1)" :disabled="currentPage === pageCount" :class="['px-2 py-1 border rounded font-semibold transition', currentPage === pageCount ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed' : 'bg-white text-[#e11d48] border-[#e11d48] hover:bg-[#e11d48] hover:text-white']">&gt;</button>
      <button @click="gotoPage(pageCount)" :disabled="currentPage === pageCount" :class="['px-2 py-1 border rounded font-semibold transition', currentPage === pageCount ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed' : 'bg-white text-[#e11d48] border-[#e11d48] hover:bg-[#e11d48] hover:text-white']">&raquo;</button>
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
