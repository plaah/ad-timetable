<script setup>
import { ref, onMounted } from "vue";
import SemesterApi from "@/api/SemesterApi";
import Toggle from "@/components/Toggle.vue";
import { userInfo, userName, userMatric } from "@/constants/ApiConstants.js";
import { fetchStudentClashBatch } from "@/api/ClashStudentApi.js";

// Auth
const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
  userName.value = lsData.full_name;
  userMatric.value = lsData.login_name;
}

// State
const clashList = ref([]);
const loading = ref(false);
const error = ref(null);
const page = ref(1);
const limit = 10;
const total = ref(0);
const sesi = ref("");
const semester = ref("");
const totalPages = ref(1);

async function loadPage(pageNum) {
  try {
    loading.value = true;
    error.value = null;
    if (!sesi.value || !semester.value) {
      const semesterApi = new SemesterApi();
      const semesterInfo = await semesterApi.getCurrentSemesterInfo();
      sesi.value = semesterInfo[0].sesi;
      semester.value = semesterInfo[0].semester;
    }
    const offset = (pageNum - 1) * limit;
    const { results, total: totalStud } = await fetchStudentClashBatch(sesi.value, semester.value, offset, limit);
    clashList.value = results;
    total.value = totalStud;
    totalPages.value = Math.ceil(totalStud / limit) || 1;
    page.value = pageNum;
  } catch (err) {
    error.value = "Failed to load student clash data.";
  } finally {
    loading.value = false;
  }
}

function prevPage() {
  if (page.value > 1) loadPage(page.value - 1);
}
function nextPage() {
  if (page.value < totalPages.value) loadPage(page.value + 1);
}

onMounted(() => {
  loadPage(1);
});
</script>

<template>
  <div class="bg-gradient-to-b from-gray-50 to-white min-h-screen pt-24 transition-all duration-300">
    <Toggle titleBanner="Student Clash" />

    <main class="px-6 py-6">
      <!-- Table -->
      <div class="overflow-x-auto bg-white rounded-xl shadow-lg">
        <table class="w-full text-sm text-left table-auto">
          <thead class="bg-[#933b3b] text-white text-center">
            <tr>
              <th class="px-4 py-2 border-r">No.</th>
              <th class="px-4 py-2 border-r">Name</th>
              <th class="px-4 py-2 border-r">Year / Program</th>
              <th class="px-4 py-2 border-r">Faculty</th>
              <th class="px-4 py-2 border-r">No. of Subjects</th>
              <th class="px-4 py-2 border-r">Schedule Conflicts</th>
              <th class="px-4 py-2">Suggestions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="clashList.length === 0 && loading">
              <td colspan="7" class="text-center py-4">Loading...</td>
            </tr>
            <tr v-else-if="error">
              <td colspan="7" class="text-center py-4 text-red-600">{{ error }}</td>
            </tr>
            <tr v-for="(student, index) in clashList" :key="index" class="text-center even:bg-gray-50">
              <td class="px-4 py-2 border-r">{{ (page - 1) * limit + index + 1 }}</td>
              <td class="px-4 py-2 border-r font-medium text-[#933b3b]">{{ student.name }}</td>
              <td class="px-4 py-2 border-r">{{ student.yearCourse }}</td>
              <td class="px-4 py-2 border-r">{{ student.faculty }}</td>
              <td class="px-4 py-2 border-r">{{ student.subjectCount }}</td>
              <td class="px-4 py-2 border-r text-left">
                <ul class="list-disc list-inside text-sm text-gray-700">
                  <li v-for="(conflict, i) in student.conflicts" :key="i">{{ conflict }}</li>
                  <li v-if="student.conflicts.length === 0" class="text-gray-400">-</li>
                </ul>
              </td>
              <td class="px-4 py-2 font-semibold text-[#933b3b]">{{ student.suggestions }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Controls -->
      <div class="flex flex-wrap justify-center items-center gap-4 mt-6 text-sm">
        <button
          @click="prevPage"
          :disabled="page === 1 || loading"
          class="bg-[#933b3b] text-white font-semibold py-1 px-4 rounded-lg disabled:bg-gray-300 disabled:text-gray-500"
        >
          &larr; Prev
        </button>
        <span>Page {{ page }} of {{ totalPages }}</span>
        <button
          @click="nextPage"
          :disabled="page === totalPages || loading"
          class="bg-[#933b3b] text-white font-semibold py-1 px-4 rounded-lg disabled:bg-gray-300 disabled:text-gray-500"
        >
          Next &rarr;
        </button>
        <span v-if="loading" class="ml-2 text-gray-500">Loading...</span>
      </div>
    </main>

    <!-- Footer -->
    <p class="text-xs text-center mt-6 px-4 text-gray-600">
      If you have any comments or questions regarding this webpage, please contact
      <a href="mailto:ttms@fc.utm.my" class="text-[#933b3b] underline">ttms@fc.utm.my</a>.<br />
      &copy; 2002–2025, Faculty of Computing, UTM. All rights reserved.
    </p>
  </div>
</template>
