<script setup>
import { ref, onMounted, computed } from "vue";
import Toggle from "@/components/Toggle.vue";
import ClashVenueApi from "@/api/ClashVenueApi";
import SemesterApi from "@/api/SemesterApi";
import { userName, userMatric } from "@/constants/ApiConstants";
import { days, timetable } from "@/constants/TimeTableConstants";

const sampleFacultyCode = "FSKSM";
const sampleRoomCode = "N28-105-01";

const clashRooms = ref([]);
const searchTerm = ref("");
const loading = ref(true);
const currentPage = ref(1);
const perPage = 20;

const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
  userName.value = lsData.full_name;
  userMatric.value = lsData.login_name;
}

const semesterApi = new SemesterApi();

onMounted(async () => {
  try {
    loading.value = true;
    const semesterInfo = await semesterApi.getCurrentSemesterInfo();
    const { sesi, semester } = semesterInfo[0];

    const ruangList = await ClashVenueApi.fetchRoomsByFaculty(sampleFacultyCode);
    const ruang = ruangList.find(r => r.kod_ruang === sampleRoomCode) || {};

    const jadualList = await ClashVenueApi.fetchRoomSchedule(sesi, semester, sampleRoomCode);

    clashRooms.value = jadualList.map((entry) => ({
      roomCode: ruang.kod_ruang || "-",
      roomName: ruang.nama_ruang || "-",
      shortName: ruang.nama_ruang_singkatan || "-",
      faculty: `${ruang.kod_fakulti || "-"} / ${ruang.kod_jabatan || "-"}`,
      day: days[(entry.hari ?? 1) - 1] || entry.hari || "-",
      time: (timetable.find(t => t.masa === entry.masa)?.waktu) || entry.masa || "-",
      subject: entry.subjek
        ? `${entry.subjek.kod_subjek || "-"} - ${entry.subjek.seksyen || "-"}`
        : `${entry.kod_subjek || "-"} - -`,
    }));
  } catch (err) {
    console.error("❌ Gagal memuat data:", err);
  } finally {
    loading.value = false;
  }
});

const filteredRooms = computed(() => {
  const term = searchTerm.value.toLowerCase();
  return clashRooms.value.filter(room =>
    room.roomCode.toLowerCase().includes(term) ||
    room.roomName.toLowerCase().includes(term) ||
    room.shortName.toLowerCase().includes(term) ||
    room.subject.toLowerCase().includes(term)
  );
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredRooms.value.length / perPage))
);

const paginatedRooms = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  return filteredRooms.value.slice(start, start + perPage);
});
</script>

<template>
  <div class="bg-gradient-to-b from-gray-50 to-white min-h-screen pt-20">
    <Toggle titleBanner="Clash Venue" />

    <main class="px-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h2 class="text-xl font-semibold text-[#933b3b]">📌 Jadwal Bentrok Ruangan</h2>

        <!-- Search + Pagination -->
        <div class="flex flex-col md:flex-row md:items-center md:gap-3 w-full md:w-auto">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Cari kod ruang, nama, singkatan, subjek..."
            class="w-full md:w-80 px-3 py-2 border border-gray-300 rounded text-sm"
          />

          <div class="flex items-center gap-1 mt-2 md:mt-0 text-sm">
            <button class="px-2 py-1 border rounded" :disabled="currentPage === 1" @click="currentPage--">‹</button>
            <span>Page</span>
            <input
              type="number"
              v-model.number="currentPage"
              :min="1"
              :max="totalPages"
              class="w-14 text-center border rounded px-2 py-1"
            />
            <span>of {{ totalPages }}</span>
            <button class="px-2 py-1 border rounded" :disabled="currentPage === totalPages" @click="currentPage++">›</button>
          </div>
        </div>
      </div>

      <div class="overflow-x-auto bg-white rounded-xl shadow p-4">
        <table class="w-full table-auto text-sm text-center">
          <thead class="bg-[#933b3b] text-white">
            <tr>
              <th class="p-2">Bil</th>
              <th class="p-2">Kod Ruang</th>
              <th class="p-2">Nama Ruang</th>
              <th class="p-2">Nama Singkatan</th>
              <th class="p-2">Kod Fakulti/Jabatan</th>
              <th class="p-2">Hari</th>
              <th class="p-2">Masa</th>
              <th class="p-2">Subjek</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(room, index) in paginatedRooms" :key="index" class="border-t">
              <td class="p-2">{{ (currentPage - 1) * perPage + index + 1 }}</td>
              <td class="p-2 text-[#933b3b] font-medium underline cursor-pointer">{{ room.roomCode }}</td>
              <td class="p-2">{{ room.roomName }}</td>
              <td class="p-2">{{ room.shortName }}</td>
              <td class="p-2">{{ room.faculty }}</td>
              <td class="p-2">{{ room.day }}</td>
              <td class="p-2">{{ room.time }}</td>
              <td class="p-2">{{ room.subject }}</td>
            </tr>
          </tbody>
        </table>

        <div v-if="paginatedRooms.length === 0 && !loading" class="text-center text-gray-400 text-sm mt-4">
          Tidak ada hasil ditemukan.
        </div>
      </div>
    </main>

    <p class="text-xs text-center mt-6 px-4 text-gray-600">
      If you have any comments or questions regarding this webpage, please contact
      <a href="mailto:ttms@fc.utm.my" class="text-[#933b3b] font-medium">ttms@fc.utm.my</a>.<br />
      &copy; 2002–2025, Faculty of Computing, UTM. All rights reserved.
    </p>
  </div>
</template>
