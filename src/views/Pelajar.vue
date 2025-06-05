<script setup>
import { ref, computed } from "vue";
import Toggle from "@/components/Toggle.vue";
import { userName, userMatric } from "@/constants/ApiConstants.js";

const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
  userName.value = lsData.full_name;
  userMatric.value = lsData.login_name;
}

// Filters
const nama = ref("");
const tahun = ref("");
const kursus = ref("");

// Dummy student data
const students = ref([
  {
    name: "'SYARAH BINTI MOHAMAD ",
    yearCourse: "2/SECJH",
    faculty: "FSKSM",
    subjectCount: 6,
    credit: 16,
  },
  {
    name: "AFLAKH RASIKH ",
    yearCourse: "2/SECJH",
    faculty: "FSKSM",
    subjectCount: 6,
    credit: 16,
  },
  {
    name: "ABDUL GHANI",
    yearCourse: "2/SECJH",
    faculty: "FSKSM",
    subjectCount: 6,
    credit: 16,
  },
]);

const filteredStudents = computed(() => {
  return students.value.filter((student) => {
    const matchName = student.name.toLowerCase().includes(nama.value.toLowerCase());
    const matchYear = tahun.value ? student.yearCourse.startsWith(tahun.value) : true;
    const matchCourse = kursus.value ? student.yearCourse.includes(kursus.value.toUpperCase()) : true;
    return matchName && matchYear && matchCourse;
  });
});
</script>

<template>
  <div class="bg-gray-100 min-h-screen pt-20">
    <Toggle titleBanner="Pelajar" />

    <!-- Search Form -->
<div class="px-6 pt-4 pb-2 flex justify-between items-center">
    <!-- Search Inputs -->
    <div class="flex gap-3 items-end">
        <div class="flex flex-col">
            <label class="text-xs mb-1 ml-1">Nama</label>
            <input
                v-model="nama"
                type="text"
                placeholder="Cari nama"
                class="border px-3 py-1.5 rounded-md text-sm w-44"
            />
        </div>
        <div class="flex flex-col">
            <label class="text-xs mb-1 ml-1">Tahun</label>
            <input
                v-model="tahun"
                type="text"
                placeholder="Contoh: 2"
                class="border px-3 py-1.5 rounded-md text-sm w-28"
            />
        </div>
        <div class="flex flex-col">
            <label class="text-xs mb-1 ml-1">Kursus</label>
            <input
                v-model="kursus"
                type="text"
                placeholder="Contoh: SECJH"
                class="border px-3 py-1.5 rounded-md text-sm w-32"
            />
        </div>
        <button
            @click="searchStudents"
            class="bg-[#933b3b] text-white px-4 py-1.5 rounded-md text-sm hover:bg-gray-800"
        >
            🔍 Cari
        </button>
    </div>
</div>


    <!-- Student Card List -->
    <div class="px-4 py-6 space-y-4">
      <div
        v-for="(student, index) in filteredStudents"
        :key="index"
        class="bg-white rounded-xl shadow-md p-5 relative hover:shadow-lg transition"
      >
        <button
          class="absolute top-4 right-4 rounded bg-gray-100 hover:bg-gray-200 p-2"
          title="Maklumat Jadual"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <rect x="6" y="3" width="12" height="18" rx="2" stroke-width="2" />
            <path d="M9 7h6M9 11h6M9 15h3" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
        <div class="font-semibold text-lg text-blue-700 mb-1">
          {{ student.name }}
        </div>
        <div class="text-gray-700 mb-2 text-sm">{{ student.yearCourse }}</div>
        <div class="flex flex-wrap gap-x-6 text-gray-600 text-sm">
          <div>Fakulti: {{ student.faculty }}</div>
          <div>Bil. Subjek: {{ student.subjectCount }}</div>
          <div>Total Kredit: {{ student.credit }}</div>
        </div>
      </div>
    </div>

    <!-- Pagination Placeholder -->
    <div class="text-sm flex justify-center py-4 space-x-2">
      <button class="px-2 py-1 hover:underline">&lt;&lt;</button>
      <button class="font-bold underline">1</button>
      <button class="px-2 py-1 hover:underline">2</button>
      <button class="px-2 py-1 hover:underline">3</button>
      <button class="px-2 py-1 hover:underline">4</button>
      <button class="px-2 py-1 hover:underline">&gt;&gt;</button>
    </div>

    <!-- Footer -->
    <p class="text-xs text-center px-4 pb-6">
      Jika anda mempunyai sebarang komen atau pertanyaan mengenai halaman web ini sila hubungi webmaster di
      <a href="mailto:ttms@fc.utm.my" class="text-blue-600">ttms@fc.utm.my</a><br />
      Hakcipta Terpelihara © 2002-2025, Fakulti Komputeran, UTM
    </p>
  </div>
</template>
