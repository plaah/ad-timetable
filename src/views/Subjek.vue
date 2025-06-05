<script setup>
import { ref, onMounted, computed, watch } from "vue";
import Toggle from "@/components/Toggle.vue";
import SemesterApi from "@/api/SemesterApi";
import SubjekApi from "@/api/SubjekApi";
import { userInfo, userName, userMatric } from "@/constants/ApiConstants.js";

const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
  userName.value = lsData.full_name;
  userMatric.value = lsData.login_name;
}

const selectedKurikulum = ref("Semua");
const searchQuery = ref("");

const subjectRows = ref([]);
const error = ref(null);
const semesterApi = new SemesterApi();
const subjekApi = new SubjekApi();
const currentSession = ref("");
const currentSemester = ref("");

const itemsPerPage = 10;
const currentPage = ref(1);

onMounted(async () => {
  try {
    const sessionData = await semesterApi.getCurrentSemesterInfo();
    if (sessionData.length > 0) {
      currentSession.value = sessionData[0].sesi;
      currentSemester.value = sessionData[0].semester;

      const subjectData = await subjekApi.getSubjectSections(currentSession.value, currentSemester.value);

      if (Array.isArray(subjectData)) {
        subjectRows.value = subjectData.flatMap(subj =>
          (Array.isArray(subj.seksyen_list) ? subj.seksyen_list : []).map(section => ({
            code: subj.kod_subjek,
            name: subj.nama_subjek,
            shortCode: subj.kod_fakulti ?? "-",
            kredit: subj.kredit ?? 0,
            seksyen: section.seksyen,
            drPensyarah: section.pensyarah,
            bilPelajar: section.bil_pelajar,
            bilSeksyen: subj.bil_seksyen ?? (subj.seksyen_list?.length ?? 0),
            bilPensyarah: subj.bil_pensyarah ?? new Set((subj.seksyen_list ?? []).map(s => s.pensyarah)).size,
            kurikulum: subj.kurikulum || "2025"
          }))
        );
      } else {
        subjectRows.value = [];
      }
    }
  } catch (err) {
    error.value = "Failed to retrieve subject data.";
    console.error("[ERROR] Failed to fetch subject data:", err);
  }
});

const filteredRows = computed(() => {
  return subjectRows.value.filter(row => {
    const matchSearch =
      row.code.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      row.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchKurikulum =
      selectedKurikulum.value === "Semua" ||
      row.kurikulum?.includes(selectedKurikulum.value);
    return matchSearch && matchKurikulum;
  });
});

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredRows.value.slice(start, start + itemsPerPage);
});

const pageCount = computed(() => {
  return Math.ceil(filteredRows.value.length / itemsPerPage) || 1;
});

function gotoPage(page) {
  if (page < 1) page = 1;
  if (page > pageCount.value) page = pageCount.value;
  currentPage.value = page;
}

watch([searchQuery, selectedKurikulum], () => {
  currentPage.value = 1;
});
</script>

<template>
  <div class="bg-gray-100 min-h-screen pt-20">
    <Toggle titleBanner="Subject" />

    <!-- FILTERS & PAGINATION -->
    <div class="flex flex-col md:flex-row justify-between items-center gap-3 px-4 py-4 max-w-6xl mx-auto">
      <div class="flex flex-wrap items-center gap-3">
        <div>
          Curriculum:
          <select v-model="selectedKurikulum" class="ml-1 px-2 py-1 border rounded">
            <option value="Semua">All</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
        </div>
        <input
          v-model="searchQuery"
          placeholder="Search subject by code or name..."
          class="border px-3 py-1 rounded w-64"
        />
      </div>

      <div class="flex items-center gap-2 text-sm">
        <button @click="gotoPage(1)" :disabled="currentPage === 1">&lt;&lt;</button>
        <button @click="gotoPage(currentPage - 1)" :disabled="currentPage === 1">&lt;</button>
        <span>
          Page
          <select
            v-model="currentPage"
            @change="gotoPage(Number(currentPage))"
            class="mx-1 px-2 py-1 border rounded"
          >
            <option v-for="page in pageCount" :key="page" :value="page">
              {{ page }}
            </option>
          </select>
          of {{ pageCount }}
        </span>
        <button @click="gotoPage(currentPage + 1)" :disabled="currentPage === pageCount">&gt;</button>
        <button @click="gotoPage(pageCount)" :disabled="currentPage === pageCount">&gt;&gt;</button>
      </div>
    </div>

    <!-- SUBJECT CARD SECTION -->
    <div class="grid gap-4 px-4 py-2 max-w-6xl mx-auto grid-cols-1 md:grid-cols-2">
      <div
        v-for="(subject, index) in paginatedRows"
        :key="(currentPage - 1) * itemsPerPage + index"
        class="bg-white border border-gray-200 hover:shadow-lg rounded-xl p-4 transition space-y-2 relative"
      >
        <button
          class="absolute top-3 right-3 rounded bg-gray-200 hover:bg-gray-300 p-2"
          title="View Schedule Info"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <rect x="6" y="3" width="12" height="18" rx="2" stroke-width="2" />
            <path d="M9 7h6M9 11h6M9 15h3" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>

        <div class="text-blue-700 font-bold text-lg">{{ subject.code }}</div>
        <div class="text-gray-800 text-base font-medium">{{ subject.name }}</div>

        <div class="flex justify-between text-sm text-gray-600">
          <span>{{ subject.shortCode }}</span>
          <span>Kredit: {{ subject.kredit }}</span>
        </div>

        <div class="flex flex-wrap gap-3 pt-2 text-sm text-gray-700">
          <span class="bg-gray-100 px-2 py-0.5 rounded">Section: {{ subject.seksyen ?? '-' }}</span>
          <span class="bg-gray-100 px-2 py-0.5 rounded">Lecturer: {{ subject.drPensyarah ?? '-' }}</span>
          <span class="bg-gray-100 px-2 py-0.5 rounded">Students: {{ subject.bilPelajar ?? '-' }}</span>
        </div>
      </div>

      <div v-if="!paginatedRows.length && !error" class="text-center text-gray-400 italic py-10">
        No subjects to display.
      </div>
      <div v-if="error" class="text-red-600 text-center py-4">
        {{ error }}
      </div>
    </div>

    <!-- FOOTER -->
    <p class="text-xs text-center px-4 pb-6 text-gray-600">
      If you have any comments or questions regarding this page, please contact
      <a href="mailto:ttms@fc.utm.my" class="text-blue-600">ttms@fc.utm.my</a>.<br />
      Copyright &copy; 2002–2025, Faculty of Computing, UTM. All rights reserved.
    </p>
  </div>
</template>