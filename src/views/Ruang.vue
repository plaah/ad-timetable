<script setup>
import { ref, watch, onMounted, computed } from "vue";
import Toggle from "@/components/Toggle.vue";
import ProfileBanner from "@/components/ProfileBanner.vue";
import RuangApi from "@/api/RuangApi";
import { userInfo, userName, userMatric } from "@/constants/ApiConstants.js";

const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
  userName.value = lsData.full_name;
  userMatric.value = lsData.login_name;
}

const ruangApi = new RuangApi();
const selectedFaculty = ref("FSKSM");
const rooms = ref([]);
const error = ref(null);
const currentPage = ref(1);
const itemsPerPage = 10;

const formatRoomData = (room) => ({
  code: room.kod_ruang,
  name: room.nama_ruang,
  shortName: room.nama_ruang_singkatan,
  faculty: `${room.kod_fakulti} / ${room.kod_jabatan}`,
  type: room.jenis,
  capacity: room.kapasiti,
});

const fetchRooms = async () => {
  try {
    error.value = null;
    currentPage.value = 1;
    const data = await ruangApi.getRoomsByFaculty(selectedFaculty.value);
    rooms.value = Array.isArray(data) ? data.map(formatRoomData) : [formatRoomData(data)];
  } catch (err) {
    error.value = "Gagal memuatkan data ruang.";
    rooms.value = [];
  }
};

watch(selectedFaculty, fetchRooms);
onMounted(fetchRooms);

const totalPages = computed(() => Math.ceil(rooms.value.length / itemsPerPage));
const paginatedRooms = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return rooms.value.slice(start, start + itemsPerPage);
});
const setPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};
</script>

<template>
  <div class="bg-gray-100 min-h-screen pt-20">
    <Toggle titleBanner="Ruang" />

    <!-- Filter + Pagination -->
    <div class="flex flex-col md:flex-row justify-between items-center gap-3 px-4 py-4 max-w-6xl mx-auto">
      <label class="text-sm">
        Pilih Fakulti:
        <select v-model="selectedFaculty" class="border border-gray-300 rounded px-3 py-1 ml-2">
          <option value="FSKSM">FSKSM</option>
          <option value="FKE">FKE</option>
          <option value="FABU">FABU</option>
        </select>
      </label>

      <div class="flex items-center gap-2 text-sm">
        <button @click="setPage(1)" :disabled="currentPage === 1">&lt;&lt;</button>
        <button @click="setPage(currentPage - 1)" :disabled="currentPage === 1">&lt;</button>
        <span>Page</span>
        <select
          v-model="currentPage"
          @change="setPage(Number(currentPage))"
          class="px-2 py-1 border rounded"
        >
          <option v-for="page in totalPages" :key="page" :value="page">{{ page }}</option>
        </select>
        <span>of {{ totalPages }}</span>
        <button @click="setPage(currentPage + 1)" :disabled="currentPage === totalPages">&gt;</button>
        <button @click="setPage(totalPages)" :disabled="currentPage === totalPages">&gt;&gt;</button>
      </div>
    </div>

    <!-- Error Notice -->
    <div v-if="error" class="text-red-600 text-center mt-2 text-sm">
      {{ error }}
    </div>

    <!-- ROOM CARD LIST -->
    <div class="grid gap-4 px-4 py-4 max-w-6xl mx-auto grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
      <div
        v-for="(room, index) in paginatedRooms"
        :key="index"
        class="bg-white border border-gray-200 hover:shadow-md rounded-xl transition p-4 space-y-2"
      >
        <div class="flex justify-between items-start">
          <div class="text-lg font-semibold text-blue-700">{{ room.code }}</div>
          <button title="Lihat Jadual" class="p-1.5 bg-blue-100 hover:bg-blue-200 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <rect x="6" y="3" width="12" height="18" rx="2" stroke-width="2" />
              <path d="M9 7h6M9 11h6M9 15h3" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
        </div>

        <div class="font-medium text-gray-800">
          {{ room.name }}
          <span v-if="room.shortName && room.shortName !== room.name" class="text-sm text-gray-500">
            ({{ room.shortName }})
          </span>
        </div>

        <div class="flex justify-between text-sm text-gray-600">
          <div>{{ room.faculty || 'Fakulti tidak tersedia' }}</div>
          <div>{{ room.type || 'Jenis tidak diketahui' }}</div>
          <div class="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M17 20H7a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2Z" />
              <circle cx="12" cy="7" r="3" />
            </svg>
            {{ room.capacity || 'Tidak tersedia' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <p class="text-xs text-center mt-6 px-4 text-gray-600">
      If you have any comments or questions regarding this webpage, please contact
      <a href="mailto:ttms@fc.utm.my" class="text-blue-600">ttms@fc.utm.my</a><br />
      Copyright &copy; 2002-2025, Faculty of Computing, UTM. All rights reserved.
    </p>
  </div>
</template>
