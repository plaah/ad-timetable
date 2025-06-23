<script setup>
import { ref, onMounted } from "vue";
import Toggle from "@/components/Toggle.vue";
import ClashVenueApi from "@/api/ClashVenueApi";
import SemesterApi from "@/api/SemesterApi";
import { userName, userMatric } from "@/constants/ApiConstants";
import { days, timetable } from "@/constants/TimeTableConstants";

const sampleFacultyCode = "FSKSM";
const sampleRoomCode = "N28-105-01";

const clashRooms = ref([]);
const loading = ref(true);
const error = ref(null);

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
    error.value = "Gagal memuat data jadwal ruang.";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="bg-gradient-to-b from-gray-50 to-white min-h-screen pt-20">
    <Toggle titleBanner="Clash Venue" />

    <main class="px-6">
      <h2 class="text-xl font-semibold text-[#933b3b] mb-4">📌 Jadwal Bentrok Ruangan</h2>

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
            <tr v-for="(room, index) in clashRooms" :key="index" class="border-t">
              <td class="p-2">{{ index + 1 }}</td>
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

        <div v-if="clashRooms.length === 0 && !loading" class="text-center text-gray-400 text-sm mt-4">
          Tidak ada data jadwal ruang bentrok.
        </div>
      </div>

      <div class="text-sm flex justify-center py-4 space-x-2">
        <button class="px-3 py-1 bg-white border rounded shadow hover:bg-gray-100">&lt;&lt;</button>
        <button class="font-bold underline">1</button>
        <button>2</button>
        <button>3</button>
        <button>4</button>
        <button class="px-3 py-1 bg-white border rounded shadow hover:bg-gray-100">&gt;&gt;</button>
      </div>
    </main>

    <p class="text-xs text-center mt-6 px-4 text-gray-600">
      If you have any comments or questions regarding this webpage, please contact
      <a href="mailto:ttms@fc.utm.my" class="text-[#933b3b] font-medium">ttms@fc.utm.my</a>.<br />
      &copy; 2002–2025, Faculty of Computing, UTM. All rights reserved.
    </p>
  </div>
</template>
