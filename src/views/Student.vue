<script setup>
import { ref, computed, watch, onMounted } from "vue";
import Toggle from "@/components/Toggle.vue";
import { userName, userMatric } from "@/constants/ApiConstants.js";
import StudentApi from "@/api/StudentApi.js";

const api = new StudentApi();

const nama = ref("");
const tahun = ref("");
const kursus = ref("");
const students = ref([]);
const loading = ref(true);
const currentPage = ref(1);
const itemsPerPage = 9;

const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
  userName.value = lsData.full_name;
  userMatric.value = lsData.login_name;
}

onMounted(async () => {
  try {
    if (!lsData?.session_id) throw new Error("❌ No user session ID");

    const [{ sesi, semester }] = await api.getCurrentPeriod();
    console.log("📆 Current Period:", sesi, semester);

    const adminSessionId = await api.getAdminSession(lsData.session_id);
    console.log("🧑‍💼 Admin Session ID:", adminSessionId);

    const studentsData = await api.listStudents(adminSessionId, sesi, semester, 5);

    console.log("👩‍🎓 Students Fetched:", studentsData.length);
    console.log("📋 Sample Student:", studentsData[0]);

    students.value = studentsData.map((student) => ({
      name: student.nama || "N/A",
      yearCourse: student.tahun_kursus && student.kod_kursus
        ? `${student.tahun_kursus}/${student.kod_kursus}`
        : "N/A",
      faculty: student.kod_fakulti || "N/A",
      subjectCount: student.bil_subjek || 1,
      credit: student.kredit || 3,
    }));
  } catch (err) {
    console.error("🔥 Failed to fetch students:", err.message);
  } finally {
    loading.value = false;
  }
});

const filteredStudents = computed(() => {
  return students.value.filter((student) => {
    const matchName = student.name.toLowerCase().includes(nama.value.toLowerCase());
    const matchYear = tahun.value ? student.yearCourse.startsWith(tahun.value) : true;
    const matchCourse = kursus.value ? student.yearCourse.includes(kursus.value.toUpperCase()) : true;
    return matchName && matchYear && matchCourse;
  });
});

watch([nama, tahun, kursus], () => {
  currentPage.value = 1;
});

const totalPages = computed(() => Math.ceil(filteredStudents.value.length / itemsPerPage));
const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredStudents.value.slice(start, start + itemsPerPage);
});
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};
</script>

<template>
  <div class="bg-gray-50 min-h-screen pt-20 flex flex-col">
    <Toggle titleBanner="Student" />

    <div class="px-6 pt-4 pb-2 max-w-7xl mx-auto w-full">
      <div class="flex flex-wrap gap-4 items-end">
        <div class="flex flex-col">
          <label class="text-xs mb-1 ml-1">Nama</label>
          <input v-model="nama" type="text" placeholder="Cari nama" class="border px-3 py-1.5 rounded-md text-sm w-44 focus:outline-none focus:ring-2 focus:ring-[#933b3b]" />
        </div>
        <div class="flex flex-col">
          <label class="text-xs mb-1 ml-1">Tahun</label>
          <input v-model="tahun" type="text" placeholder="Contoh: 2" class="border px-3 py-1.5 rounded-md text-sm w-28 focus:outline-none focus:ring-2 focus:ring-[#933b3b]" />
        </div>
        <div class="flex flex-col">
          <label class="text-xs mb-1 ml-1">Kursus</label>
          <input v-model="kursus" type="text" placeholder="Contoh: SECJH" class="border px-3 py-1.5 rounded-md text-sm w-32 focus:outline-none focus:ring-2 focus:ring-[#933b3b]" />
        </div>
        <button class="bg-[#933b3b] text-white px-4 py-1.5 rounded-md text-sm hover:bg-gray-800">
          🔍 Cari
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center text-gray-500 py-10">Loading Student List...</div>

    <div v-else class="grid gap-6 px-6 py-6 max-w-7xl mx-auto grid-cols-1 md:grid-cols-2 xl:grid-cols-3 flex-grow">
      <div
        v-for="student in paginatedStudents"
        :key="student.no_kp"
        class="bg-white rounded-xl shadow-md px-6 py-5 relative hover:shadow-lg transition"
      >
        <button class="absolute top-4 right-4 rounded bg-gray-100 hover:bg-gray-200 p-2" title="Maklumat Jadual">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <rect x="6" y="3" width="12" height="18" rx="2" stroke-width="2" />
            <path d="M9 7h6M9 11h6M9 15h3" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
        <div class="font-semibold text-base text-[#933b3b] mb-1">{{ student.name }}</div>
        <div class="text-gray-700 mb-2 text-sm">Tahun/Kursus: {{ student.yearCourse }}</div>
        <div class="flex flex-wrap gap-2 text-gray-600 text-sm">
          <span class="bg-gray-100 px-2 py-1 rounded border text-xs">🏫 Faculty: {{ student.faculty }}</span>
          <span class="bg-gray-100 px-2 py-1 rounded border text-xs">📘 Subjects: {{ student.subjectCount }}</span>
          <span class="bg-blue-100 px-2 py-1 rounded border text-xs">🎓 Credits: {{ student.credit }}</span>
        </div>
      </div>
    </div>

    <div class="flex justify-center items-center space-x-2 py-6 mb-6">
      <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="px-3 py-1 rounded-full bg-gray-200 hover:bg-gray-300 text-sm disabled:opacity-50">
        «
      </button>

      <button
        v-for="page in totalPages"
        :key="page"
        @click="goToPage(page)"
        class="px-3 py-1 rounded-full text-sm"
        :class="{
          'bg-[#933b3b] text-white font-semibold shadow': currentPage === page,
          'bg-gray-100 hover:bg-gray-300': currentPage !== page
        }"
      >
        {{ page }}
      </button>

      <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" class="px-3 py-1 rounded-full bg-gray-200 hover:bg-gray-300 text-sm disabled:opacity-50">
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