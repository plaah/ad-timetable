<script setup>
import { ref, onMounted, computed, watch } from "vue";
import Toggle from "@/components/Toggle.vue";
import SemesterApi from "@/api/SemesterApi";
import SubjectApi from "@/api/SubjectApi";
import { userInfo, userName, userMatric } from "@/constants/ApiConstants.js";

const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
  userName.value = lsData.full_name;
  userMatric.value = lsData.login_name;
}

const selectedKurikulum = ref("All");
const searchQuery = ref("");

const subjectRows = ref([]);
const error = ref(null);
const semesterApi = new SemesterApi();
const subjectApi = new SubjectApi();
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

      const subjectData = await subjectApi.getSubjectSections(currentSession.value, currentSemester.value);

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
      selectedKurikulum.value === "All" ||
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

    <!-- Filters & Pagination -->
    <div class="flex flex-col md:flex-row justify-between items-center gap-4 px-4 py-4 max-w-6xl mx-auto font-[Segoe UI] text-[15px]">
      <div class="flex flex-wrap items-center gap-2">
        <label class="font-normal">Faculty:</label>
        <select v-model="selectedKurikulum" class="border border-gray-400 rounded px-2 py-1 shadow-sm">
          <option value="All">All</option>
          <option value="2025">2025</option>
          <option value="2024">2024</option>
          <option value="2023">2023</option>
        </select>

        <input
          v-model="searchQuery"
          placeholder="Search by subject code or name..."
          class="border border-gray-400 rounded px-3 py-1 w-72 shadow-sm"
        />
      </div>

      <!-- Pagination Style Match Screenshot -->
      <div class="flex items-center gap-1 text-sm font-[Segoe UI]">
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

    <!-- Error Message -->
    <div v-if="error" class="text-red-600 text-center mt-2 text-sm">
      {{ error }}
    </div>

    <!-- Subject Cards -->
    <div class="grid gap-4 px-4 py-4 max-w-6xl mx-auto grid-cols-1 md:grid-cols-2">
      <div
        v-for="(subject, index) in paginatedRows"
        :key="index"
        class="bg-white border border-gray-200 hover:shadow-md rounded-xl p-4 space-y-3"
      >
        <div class="flex justify-between items-start">
          <div class="flex items-center gap-2">
            <span class="text-lg">🏷️</span>
            <span class="text-red-700 font-semibold text-lg">{{ subject.code }}</span>
          </div>
        </div>

        <div class="text-gray-800 font-medium text-base">{{ subject.name }}</div>

        <div class="flex flex-wrap gap-2 text-sm mt-2">
          <span class="flex items-center gap-1 bg-red-50 text-red-800 border border-red-200 px-2 py-1 rounded">
            🎓 {{ subject.shortCode }}
          </span>
          <span class="flex items-center gap-1 bg-gray-100 border border-gray-300 px-2 py-1 rounded">
            🏫 Section: {{ subject.seksyen ?? '-' }}
          </span>
          <span class="flex items-center gap-1 bg-blue-50 border border-blue-200 px-2 py-1 rounded">
            👥 Students: {{ subject.bilPelajar ?? 'N/A' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <p class="text-xs text-center mt-6 px-4 text-gray-600">
      If you have any comments or questions regarding this webpage, please contact
      <a href="mailto:ttms@fc.utm.my" class="text-red-600">ttms@fc.utm.my</a>.<br />
      &copy; 2002–2025, Faculty of Computing, UTM. All rights reserved.
    </p>
  </div>
</template>

<style>
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 15px;
}
</style>