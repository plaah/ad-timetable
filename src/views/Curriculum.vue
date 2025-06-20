<script setup>
import { ref, computed, onMounted } from "vue";
import { userName, userMatric } from "@/constants/ApiConstants.js";
import ProfileBanner from "@/components/ProfileBanner.vue";
import Toggle from "@/components/Toggle.vue";
import CurriculumApi from "@/api/CurriculumApi.js";

const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
  userName.value = lsData.full_name;
  userMatric.value = lsData.login_name;
}

const curricula = ref([]);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const api = new CurriculumApi();
    curricula.value = await api.getCurricula();
  } catch (error) {
    console.error("Failed to fetch curricula:", error);
  } finally {
    isLoading.value = false;
  }
});

const currentPage = ref(1);
const itemsPerPage = 6;

const pageCount = computed(() => {
  return Math.ceil(curricula.value.length / itemsPerPage) || 1;
});

const paginatedCurricula = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return curricula.value.slice(start, start + itemsPerPage);
});

function gotoPage(page) {
  if (page < 1) page = 1;
  if (page > pageCount.value) page = pageCount.value;
  currentPage.value = page;
}

const electiveDetail = ref(null);
const loadingElective = ref(false);

async function showElective(id_kurikulum_subjek) {
  loadingElective.value = true;
  electiveDetail.value = null;
  try {
    const api = new CurriculumApi();
    electiveDetail.value = await api.getElectiveDetails(id_kurikulum_subjek);
  } catch (e) {
    electiveDetail.value = { "s.nama_subjek": "Failed to load details." };
  } finally {
    loadingElective.value = false;
  }
}
</script>

<template>
  <div class="bg-gray-50 min-h-screen pt-20 flex flex-col">
    <Toggle ProfileBanner titleBanner="Curriculum" />

    <div class="grid gap-6 px-6 py-6 max-w-7xl mx-auto grid-cols-1 md:grid-cols-2 xl:grid-cols-3 flex-grow">
      <div
        v-for="(item, index) in paginatedCurricula"
        :key="index"
        class="bg-white rounded-xl shadow-md px-6 py-5 relative hover:shadow-lg transition"
      >
        <button
          class="absolute top-4 right-4 rounded bg-gray-100 hover:bg-gray-200 p-2"
          title="Schedule Info"
          @click="showElective(item.id_kurikulum_subjek)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <rect x="6" y="3" width="12" height="18" rx="2" stroke-width="2" />
            <path d="M9 7h6M9 11h6M9 15h3" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
        <div class="font-semibold text-base text-[#933b3b] mb-1">
          {{ item.name }}
        </div>
        <div class="text-gray-700 mb-2 text-sm">Session: {{ item.sesi }} | Semester: {{ item.semester }} | Year: {{ item.tahun }}</div>
        <div class="flex flex-wrap gap-2 text-gray-600 text-sm">
          <span class="bg-gray-100 px-2 py-1 rounded border text-xs">📚 Core: {{ item.teras }}</span>
          <span class="bg-gray-100 px-2 py-1 rounded border text-xs">🎯 Electives: {{ item.elektif }}</span>
          <span class="bg-blue-100 px-2 py-1 rounded border text-xs">📊 Total: {{ item.jumlah }}</span>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="text-center py-6">
      <p class="text-gray-600">Loading curriculum...</p>
    </div>

    <div v-else class="flex justify-center items-center space-x-2 py-6 mb-6">
      <button
        @click="gotoPage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="px-3 py-1 rounded-full bg-gray-200 hover:bg-gray-300 text-sm disabled:opacity-50"
      >
        «
      </button>
      <button
        v-for="page in pageCount"
        :key="page"
        @click="gotoPage(page)"
        class="px-3 py-1 rounded-full text-sm"
        :class="{
          'bg-[#933b3b] text-white font-semibold shadow': currentPage === page,
          'bg-gray-100 hover:bg-gray-300': currentPage !== page
        }"
      >
        {{ page }}
      </button>
      <button
        @click="gotoPage(currentPage + 1)"
        :disabled="currentPage === pageCount"
        class="px-3 py-1 rounded-full bg-gray-200 hover:bg-gray-300 text-sm disabled:opacity-50"
      >
        »
      </button>
    </div>

    <p class="text-xs text-center px-4 pb-6 text-gray-600">
      If you have any comments or inquiries regarding this webpage, please contact the webmaster at
      <a href="mailto:ttms@fc.utm.my" class="text-blue-600">ttms@fc.utm.my</a><br />
      Copyright ©️ 2002–2025, Faculty of Computing, UTM
    </p>
  </div>
</template>

<style scoped>
.min-h-screen {
  display: flex;
  flex-direction: column;
}
</style>