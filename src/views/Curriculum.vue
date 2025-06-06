<script setup>
import { ref, computed } from "vue";
import Toggle from "@/components/Toggle.vue";
import { userName, userMatric } from "@/constants/ApiConstants.js";
import ProfileBanner from "@/components/ProfileBanner.vue";

const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
  userName.value = lsData.full_name;
  userMatric.value = lsData.login_name;
}

// Dummy curriculum data (realistic)
const curricula = ref([
  {
    name: "Bachelor of Computer Science (Software Engineering)",
    sesi: "2020/2021",
    semester: 1,
    tahun: 1,
    teras: 28,
    elektif: 5,
    jumlah: 33,
  },
  {
    name: "Bachelor of Computer Science (Bioinformatics)",
    sesi: "2019/2020",
    semester: 2,
    tahun: 2,
    teras: 26,
    elektif: 6,
    jumlah: 32,
  },
  {
    name: "Bachelor of Computer Science (Data Engineering)",
    sesi: "2021/2022",
    semester: 1,
    tahun: 1,
    teras: 30,
    elektif: 4,
    jumlah: 34,
  },
  {
    name: "Bachelor of Computer Science (Network and Security)",
    sesi: "2020/2021",
    semester: 2,
    tahun: 2,
    teras: 29,
    elektif: 3,
    jumlah: 32,
  },
  // Extra dummy but realistic
  {
    name: "Bachelor of Computer Science (Artificial Intelligence)",
    sesi: "2022/2023",
    semester: 1,
    tahun: 1,
    teras: 27,
    elektif: 6,
    jumlah: 33,
  },
  {
    name: "Bachelor of Computer Science (Multimedia)",
    sesi: "2021/2022",
    semester: 2,
    tahun: 2,
    teras: 30,
    elektif: 5,
    jumlah: 35,
  },
  {
    name: "Bachelor of Computer Science (Block Chain)",
    sesi: "2022/2023",
    semester: 1,
    tahun: 1,
    teras: 26,
    elektif: 6,
    jumlah: 32,
  },
  {
    name: "Bachelor of Computer Science (Machine Learning)",
    sesi: "2021/2022",
    semester: 2,
    tahun: 2,
    teras: 31,
    elektif: 5,
    jumlah: 36,
  },
]);

const currentPage = ref(1);
const itemsPerPage = 4;

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
</script>

<template>
  <div class="bg-gray-100 min-h-screen pt-20 flex flex-col justify-between">
    <div>
      <Toggle ProfileBanner titleBanner="Curriculum" />

      <!-- CARD UI SECTION -->
      <div class="grid gap-4 px-4 py-6 max-w-6xl mx-auto grid-cols-1 md:grid-cols-2">
        <div
          v-for="(item, index) in paginatedCurricula"
          :key="index"
          class="bg-white border border-gray-200 hover:shadow-lg rounded-xl p-4 transition space-y-2 relative"
        >
          <button
            class="absolute top-3 right-3 rounded bg-gray-200 hover:bg-gray-300 p-2"
            title="Schedule Info"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <rect x="6" y="3" width="12" height="18" rx="2" stroke-width="2" />
              <path d="M9 7h6M9 11h6M9 15h3" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>

          <div class="text-blue-700 font-bold text-lg">{{ item.name }}</div>

          <div class="text-sm text-gray-600">
            Entry Info:
          </div>

          <div class="flex flex-wrap gap-3 pt-1 text-sm text-gray-700">
            <span class="bg-gray-100 px-2 py-0.5 rounded">Session: {{ item.sesi }}</span>
            <span class="bg-gray-100 px-2 py-0.5 rounded">Semester: {{ item.semester }}</span>
            <span class="bg-gray-100 px-2 py-0.5 rounded">Year: {{ item.tahun }}</span>
          </div>

          <div class="flex flex-wrap gap-3 pt-1 text-xs text-gray-500">
            <span class="bg-gray-50 px-2 py-0.5 rounded">Core: {{ item.teras }}</span>
            <span class="bg-gray-50 px-2 py-0.5 rounded">Electives: {{ item.elektif }}</span>
            <span class="bg-gray-50 px-2 py-0.5 rounded">Total: {{ item.jumlah }}</span>
          </div>
        </div>

        <div v-if="!paginatedCurricula.length" class="text-center text-gray-400 italic py-10">
          No curricula found.
        </div>
      </div>
    </div>

    <!-- Pagination + Footer together -->
    <div class="mt-10">
      <!-- Pagination -->
      <div class="flex justify-center items-center gap-2 pb-6">
        <button
          @click="gotoPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-3 py-1 rounded-full bg-gray-200 disabled:opacity-50"
        >
          «
        </button>
        <button
          v-for="page in pageCount"
          :key="page"
          @click="gotoPage(page)"
          :class="{
            'bg-[#933b3b] text-white font-semibold shadow': currentPage === page,
            'bg-gray-100 hover:bg-gray-300': currentPage !== page
          }"
          class="w-8 h-8 flex items-center justify-center rounded-full"
        >
          {{ page }}
        </button>
        <button
          @click="gotoPage(currentPage + 1)"
          :disabled="currentPage === pageCount"
          class="px-3 py-1 rounded-full bg-gray-200 disabled:opacity-50"
        >
          »
        </button>
      </div>

      <!-- Footer -->
      <p class="text-xs text-center px-4 pb-10 text-gray-600">
        If you have any comments or questions regarding this page, please contact
        <a href="mailto:ttms@fc.utm.my" class="text-blue-600">ttms@fc.utm.my</a><br />
        Copyright © 2002–2025, Faculty of Computing, UTM. All rights reserved.
      </p>
    </div>
  </div>
</template>
