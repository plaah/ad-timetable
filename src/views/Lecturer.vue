<script setup>
import { ref, computed, watch } from "vue";
import Toggle from "@/components/Toggle.vue";
import { userName, userMatric } from "@/constants/ApiConstants.js";

const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
  userName.value = lsData.full_name;
  userMatric.value = lsData.login_name;
}

// Dummy lecturer data
const lecturers = ref([
  {
    name: "AB. RAZAK BIN CHE HUSSIN",
    subjectCount: 2,
    sectionCount: 4,
    studentCount: 100,
  },
  {
    name: "ADILA FIRDAUS BINTI ARBAIN",
    subjectCount: 4,
    sectionCount: 3,
    studentCount: 85,
  },
  {
    name: "AIDA BT. ALI",
    subjectCount: 3,
    sectionCount: 4,
    studentCount: 120,
  },
  {
    name: "AHMAD FARIZ BIN ALI",
    subjectCount: 3,
    sectionCount: 5,
    studentCount: 110,
  },
  {
    name: "NURUL AIN BINTI MOHD NOH",
    subjectCount: 5,
    sectionCount: 6,
    studentCount: 130,
  },
  {
    name: "SAIFUL NIZAM BIN ISMAIL",
    subjectCount: 2,
    sectionCount: 2,
    studentCount: 70,
  },
]);

const searchQuery = ref("");
const itemsPerPage = 4;
const currentPage = ref(1);

const filteredLecturers = computed(() => {
  return lecturers.value.filter(lect =>
    lect.name.toLowerCase().includes(searchQuery.value.toLowerCase())
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
  <div class="bg-gray-100 min-h-screen flex flex-col justify-between pt-20">
    <Toggle titleBanner="Lecturer" />

  <!-- SEARCH BAR LEFT-ALIGNED, SIMPLE BLACK BORDER -->
<div class="flex justify-start px-4 py-4 max-w-6xl mx-auto">
  <input
    v-model="searchQuery"
    placeholder="Search subject by code or name..."
    class="border border-black px-4 py-2 rounded w-72 focus:outline-none"
  />
</div>



    <!-- MAIN CONTENT -->
    <div class="flex-grow">
      <!-- CARD UI SECTION -->
      <div class="grid gap-4 px-4 py-2 max-w-6xl mx-auto grid-cols-1 md:grid-cols-2">
        <div
          v-for="(lecturer, index) in paginatedLecturers"
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

          <div class="text-blue-700 font-bold text-lg">{{ lecturer.name }}</div>

          <div class="flex flex-wrap gap-3 pt-2 text-sm text-gray-700">
            <span class="bg-gray-100 px-2 py-0.5 rounded">Subjects: {{ lecturer.subjectCount }}</span>
            <span class="bg-gray-100 px-2 py-0.5 rounded">Sections: {{ lecturer.sectionCount }}</span>
            <span class="bg-gray-100 px-2 py-0.5 rounded">Students: {{ lecturer.studentCount }}</span>
          </div>
        </div>

        <div v-if="!paginatedLecturers.length" class="text-center text-gray-400 italic py-10 col-span-full">
          No lecturers found.
        </div>
      </div>
    </div>

    <!-- PAGINATION -->
    <div class="flex justify-center items-center gap-2 py-6">
      <button
        @click="gotoPage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 disabled:opacity-50 hover:bg-gray-200"
      >
        «
      </button>

      <button
        v-for="page in pageCount"
        :key="page"
        @click="gotoPage(page)"
        :class="[
          'w-8 h-8 flex items-center justify-center rounded-full',
          currentPage === page
            ? 'bg-[#933b3b] text-white font-semibold shadow'
            : 'text-gray-800 hover:bg-gray-200'
        ]"
      >
        {{ page }}
      </button>

      <button
        @click="gotoPage(currentPage + 1)"
        :disabled="currentPage === pageCount"
        class="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 disabled:opacity-50 hover:bg-gray-200"
      >
        »
      </button>
    </div>

    <!-- FOOTER -->
    <p class="text-xs text-center px-4 pb-6 text-gray-600">
      If you have any comments or questions regarding this page, please contact
      <a href="mailto:ttms@fc.utm.my" class="text-blue-600">ttms@fc.utm.my</a>.<br />
      Copyright &copy; 2002–2025, Faculty of Computing, UTM. All rights reserved.
    </p>
  </div>
</template>
