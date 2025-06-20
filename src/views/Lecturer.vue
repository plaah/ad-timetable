<script setup>
import { ref, computed, watch } from "vue";
import Toggle from "@/components/Toggle.vue";
import { userName, userMatric } from "@/constants/ApiConstants.js";

const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
  userName.value = lsData.full_name;
  userMatric.value = lsData.login_name;
}

const lecturers = ref([
  { name: "AB. RAZAK BIN CHE HUSSIN", subjectCount: 2, sectionCount: 4, studentCount: 100 },
  { name: "ADILA FIRDAUS BINTI ARBAIN", subjectCount: 4, sectionCount: 3, studentCount: 85 },
  { name: "AIDA BT. ALI", subjectCount: 3, sectionCount: 4, studentCount: 120 },
  { name: "AHMAD FARIZ BIN ALI", subjectCount: 3, sectionCount: 5, studentCount: 110 },
  { name: "NURUL AIN BINTI MOHD NOH", subjectCount: 5, sectionCount: 6, studentCount: 130 },
  { name: "SAIFUL NIZAM BIN ISMAIL", subjectCount: 2, sectionCount: 2, studentCount: 70 },
  { name: "WAN NORLIZA BINTI WAN MANSOR", subjectCount: 3, sectionCount: 3, studentCount: 95 },
  { name: "SYAFIQ BIN AZIZ", subjectCount: 4, sectionCount: 5, studentCount: 145 },
  { name: "HAFIZ BIN KAMARUDIN", subjectCount: 3, sectionCount: 4, studentCount: 105 },
  { name: "ZULKIFLI BIN RAHMAN", subjectCount: 4, sectionCount: 4, studentCount: 90 },
  { name: "MAISARAH BINTI OTHMAN", subjectCount: 2, sectionCount: 2, studentCount: 65 },
  { name: "NAJIHAH BINTI SULAIMAN", subjectCount: 3, sectionCount: 3, studentCount: 98 },
  { name: "FADHLI BIN HASSAN", subjectCount: 5, sectionCount: 6, studentCount: 140 },
  { name: "LATIFAH BINTI ABDUL GHANI", subjectCount: 2, sectionCount: 3, studentCount: 88 },
  { name: "RIZAL BIN MOHAMAD", subjectCount: 4, sectionCount: 4, studentCount: 115 },
  { name: "AZRINA BINTI YUSOF", subjectCount: 3, sectionCount: 2, studentCount: 75 },
  { name: "FATIN FARHANA BINTI AZMI", subjectCount: 4, sectionCount: 3, studentCount: 100 },
  { name: "IZWAN BIN HUSSEIN", subjectCount: 2, sectionCount: 2, studentCount: 67 },
  { name: "SHARIFAH ZAINAB BINTI SYED", subjectCount: 3, sectionCount: 4, studentCount: 123 },
  { name: "JULIANA BINTI MOHD SAID", subjectCount: 4, sectionCount: 4, studentCount: 94 },
  { name: "ZAKARIA BIN MOHD YUNUS", subjectCount: 2, sectionCount: 2, studentCount: 58 },
  { name: "MARIA BINTI RAZAK", subjectCount: 3, sectionCount: 3, studentCount: 101 },
  { name: "SYAMIM BIN AZHAR", subjectCount: 4, sectionCount: 4, studentCount: 137 },
  { name: "RAFIQ BIN SALLEH", subjectCount: 3, sectionCount: 3, studentCount: 82 }
]);

const searchQuery = ref("");
const itemsPerPage = 12;
const currentPage = ref(1);

const filteredLecturers = computed(() => {
  return lecturers.value.filter(item =>
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const paginatedLecturers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredLecturers.value.slice(start, start + itemsPerPage);
});

const pageCount = computed(() => {
  return Math.ceil(filteredLecturers.value.length / itemsPerPage) || 1;
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
  <div class="bg-gray-50 min-h-screen pt-20">
    <Toggle titleBanner="Lecturer" />

    <!-- Search Bar Left -->
    <div class="flex justify-start px-6 py-4 max-w-7xl mx-auto">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search lecturer name..."
        class="border px-4 py-2 text-sm rounded shadow-sm w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-[#933b3b]"
      />
    </div>

    <!-- Cards -->
    <div class="grid gap-6 px-6 pb-12 max-w-7xl mx-auto grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="(lecturer, index) in paginatedLecturers"
        :key="index"
        class="bg-white shadow border border-gray-200 rounded-xl px-6 py-5 flex flex-col gap-2"
      >
        <div class="flex items-center gap-2 text-sm text-[#933b3b] font-semibold">
          <span class="text-yellow-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 inline-block" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            </svg>
          </span>
          {{ lecturer.name }}
        </div>
        <div class="flex flex-wrap gap-2 pt-2 text-sm text-gray-700">
          <span class="bg-gray-100 px-2 py-1 rounded border text-xs flex items-center gap-1">
            📚 Subjects: {{ lecturer.subjectCount }}
          </span>
          <span class="bg-gray-100 px-2 py-1 rounded border text-xs flex items-center gap-1">
            🏠 Sections: {{ lecturer.sectionCount }}
          </span>
          <span class="bg-blue-100 px-2 py-1 rounded border text-xs flex items-center gap-1">
            👨‍🎓 Students: {{ lecturer.studentCount }}
          </span>
        </div>
      </div>

      <div v-if="!paginatedLecturers.length" class="text-center text-gray-400 italic py-10 col-span-full">
        No lecturers found.
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex justify-center items-center gap-2 py-4">
      <button @click="gotoPage(currentPage - 1)" :disabled="currentPage === 1" class="px-2 py-1 text-sm rounded border bg-white shadow disabled:opacity-50">
        «
      </button>
      <span class="text-sm">Page</span>
      <select v-model="currentPage" class="border text-sm rounded px-2 py-1">
        <option v-for="p in pageCount" :key="p" :value="p">{{ p }}</option>
      </select>
      <span class="text-sm">of {{ pageCount }}</span>
      <button @click="gotoPage(currentPage + 1)" :disabled="currentPage === pageCount" class="px-2 py-1 text-sm rounded border bg-white shadow disabled:opacity-50">
        »
      </button>
    </div>
      <!-- Footer -->
    <p class="text-xs text-center px-4 pb-6 text-gray-600">
      If you have any comments or questions regarding this page, please contact
      <a href="mailto:ttms@fc.utm.my" class="text-blue-600">ttms@fc.utm.my</a>.<br />
      Copyright &copy; 2002–2025, Faculty of Computing, UTM. All rights reserved.
    </p>
  </div>
</template>

<style scoped>
input::placeholder {
  color: #999;
}
</style>