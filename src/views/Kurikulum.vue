<script setup>
import { ref } from "vue";
import Toggle from "@/components/Toggle.vue";
import { userInfo, userName, userMatric } from "@/constants/ApiConstants.js";
import ProfileBanner from "@/components/ProfileBanner.vue";

const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
    userName.value = lsData.full_name;
    userMatric.value = lsData.login_name;
}

// Dummy curriculum data
const curricula = ref([
    {
        name: "Bachelor of Computer Science (Software Engineering)",
        sesi: "2020/2021",
        semester: 1,
        tahun: 1,
        teras: 1,
        elektif: 1,
        jumlah: 2,
    },
    {
        name: "Bachelor of Computer Science (Bioinformatic)",
        sesi: "2017/2018",
        semester: 1,
        tahun: 1,
        teras: 32,
        elektif: 8,
        jumlah: 40,
    },
    {
        name: "Bachelor of Computer Science (Computer Network and Security)",
        sesi: "2017/2018",
        semester: 1,
        tahun: 1,
        teras: 32,
        elektif: 1,
        jumlah: 43,
    },
    {
        name: "Bachelor of Computer Science (Data Engineering)",
        sesi: "2017/2018",
        semester: 1,
        tahun: 1,
        teras: 34,
        elektif: 7,
        jumlah: 31,
    },
]);
</script>

<template>
  <div class="bg-gray-100 min-h-screen pt-20">
    <Toggle ProfileBanner titleBanner="Kurikulum" />

    <!-- CARD UI SECTION -->
    <div class="grid gap-4 px-4 py-6 max-w-6xl mx-auto grid-cols-1 md:grid-cols-2">
      <div
        v-for="(item, index) in curricula"
        :key="index"
        class="bg-white border border-gray-200 hover:shadow-lg rounded-xl p-4 transition space-y-2 relative"
      >
        <!-- Top Right Icon -->
        <button
          class="absolute top-3 right-3 rounded bg-gray-200 hover:bg-gray-300 p-2"
          title="Maklumat Jadual"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <rect x="6" y="3" width="12" height="18" rx="2" stroke-width="2" />
            <path d="M9 7h6M9 11h6M9 15h3" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>

        <!-- Program Title -->
        <div class="text-blue-700 font-bold text-lg">{{ item.name }}</div>

        <!-- Details -->
        <div class="text-sm text-gray-600">
          Maklumat Mula Kemasukan:
        </div>

        <div class="flex flex-wrap gap-3 pt-1 text-sm text-gray-700">
          <span class="bg-gray-100 px-2 py-0.5 rounded">Sesi: {{ item.sesi }}</span>
          <span class="bg-gray-100 px-2 py-0.5 rounded">Semester: {{ item.semester }}</span>
          <span class="bg-gray-100 px-2 py-0.5 rounded">Tahun: {{ item.tahun }}</span>
        </div>

        <div class="flex flex-wrap gap-3 pt-1 text-xs text-gray-500">
          <span class="bg-gray-50 px-2 py-0.5 rounded">Teras: {{ item.teras }}</span>
          <span class="bg-gray-50 px-2 py-0.5 rounded">Elektif: {{ item.elektif }}</span>
          <span class="bg-gray-50 px-2 py-0.5 rounded">Jumlah: {{ item.jumlah }}</span>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="text-lg flex justify-center py-4 items-center gap-2">
      <span>&lt;&lt;</span>
      <span class="underline font-bold">1</span>
      <span>2</span>
      <span>3</span>
      <span>4</span>
      <span>&gt;&gt;</span>
    </div>

    <!-- Footer -->
    <p class="text-xs text-center px-4 pb-6">
      Jika anda mempunyai sebarang komen atau pertanyaan mengenai halaman web ini sila hubungi webmaster di
      <a href="mailto:ttms@fc.utm.my" class="text-blue-600">ttms@fc.utm.my</a><br />
      Hakcipta Terpelihara © 2002-2025, Fakulti Komputeran, UTM
    </p>
  </div>
</template>

