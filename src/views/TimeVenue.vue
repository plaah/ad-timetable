<script setup>
import { ref, onMounted, watch } from "vue";
import TimeVenueApi from "@/api/TimeVenueApi";
import SemesterApi from "@/api/SemesterApi";
import Toggle from "@/components/Toggle.vue";
import { userInfo, userName, userMatric } from "@/constants/ApiConstants.js";
import { timetable, days } from "@/constants/TimeTableConstants.js";

const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
  userName.value = lsData.full_name;
  userMatric.value = lsData.login_name;
}

const selectedDay = ref("Sunday");
const selectedTimes = ref([]);
const selectedWeek = ref("kuliah");
const userStart = ref("");
const userEnd = ref("");
const dateInfo = ref([]); // schedule entries for the room
const mingguKuliah = ref({ start: "", end: "" });
const mingguSemasa = ref({ start: "", end: "" });

const timeVenueApi = new TimeVenueApi();
const semesterApi = new SemesterApi();
const defaultRoom = "N28-01-01"; // Adjust if needed
const sesi = ref("");
const semester = ref("");

// Helper: get week date range
function getWeekRange() {
  if (selectedWeek.value === "kuliah") return mingguKuliah.value;
  if (selectedWeek.value === "seminggu") return mingguSemasa.value;
  return { start: userStart.value, end: userEnd.value };
}

// Fetch semester info and set week ranges
async function fetchSemesterInfo() {
  const sems = await semesterApi.getCurrentSemesterInfo();
  // Ambil semester terbaru (diasumsikan index 0)
  const curr = sems[0];
  sesi.value = curr.sesi;
  semester.value = curr.semester;
  mingguKuliah.value = { start: curr.tarikh_mula, end: curr.tarikh_tamat };
  // Dummy minggu semasa: ambil 1 minggu di tengah minggu kuliah
  const mid = new Date(curr.tarikh_mula);
  mid.setDate(mid.getDate() + 35); // 5 minggu setelah mulai
  const semasaStart = mid.toISOString().slice(0, 10);
  const semasaEnd = new Date(mid);
  semasaEnd.setDate(semasaEnd.getDate() + 6);
  mingguSemasa.value = { start: semasaStart, end: semasaEnd.toISOString().slice(0, 10) };
}

// Fetch schedule for selected week and room
async function fetchSchedule() {
  if (!sesi.value || !semester.value) return;
  const { start, end } = getWeekRange();
  const schedule = await timeVenueApi.fetchByRoom(sesi.value, semester.value, defaultRoom);
  // Filter by date range
  dateInfo.value = schedule.filter(entry => {
    const d = new Date(entry.tarikh_mula);
    return d >= new Date(start) && d <= new Date(end);
  });
}

onMounted(async () => {
  await fetchSemesterInfo();
  await fetchSchedule();
});

// Refetch schedule if week selection or manual date changes
watch([selectedWeek, userStart, userEnd], async () => {
  await fetchSchedule();
});

const handleSubmit = () => {
  console.log("Selected Day:", selectedDay.value);
  console.log("Selected Times:", selectedTimes.value);
  console.log("Week:", selectedWeek.value);
  if (selectedWeek.value === "manual") {
    console.log("From:", userStart.value, "To:", userEnd.value);
  }
  alert("Permintaan dihantar. (Simulasi)");
};

// Helper: check if slot is booked
function isBooked(day, masa) {
  // API: hari (1=Sunday, 2=Monday,...), masa (1=07:00, ...)
  const dayIdx = days.indexOf(day) + 1;
  return dateInfo.value.some(e => e.hari === dayIdx && e.masa === masa);
}
</script>

<!-- Hanya bagian <template> yang diubah -->

<template>
  <div class="bg-gray-100 min-h-screen pt-30">
    <Toggle titleBanner="Time Venue" />
    <main>
      <div class="p-4 max-w-5xl mx-auto">
        <!-- Heading -->
        <h1 class="text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
          🕒 Tempahan Slot Ruang
        </h1>

        <!-- Jadwal Tabel -->
        <div class="overflow-x-auto border border-black rounded-xl shadow bg-white">
          <table class="w-full text-sm text-center bg-[#fef2f2]">
            <thead class="bg-[#991b1b] text-white">
              <tr>
                <th class="border border-black px-2 py-1">Hari</th>
                <th class="border border-black px-2 py-1">Slot</th>
                <th class="border border-black px-2 py-1">Waktu</th>
                <th class="border border-black px-2 py-1">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in timetable" :key="row.masa" class="hover:bg-gray-100">
                <td v-if="i === 0" :rowspan="timetable.length" class="border border-black px-2 py-1 align-top">
                  <div class="flex flex-col items-start space-y-1 pt-1">
                    <label v-for="day in days" :key="day" class="inline-flex items-center">
                      <input type="radio" :value="day" v-model="selectedDay" class="mr-2" />
                      {{ day }}
                    </label>
                  </div>
                </td>
                <td class="border border-black px-2 py-1">{{ row.masa }}</td>
                <td class="border border-black px-2 py-1">
                  <label class="inline-flex items-center">
                    <input
                      type="checkbox"
                      :value="row.waktu"
                      v-model="selectedTimes"
                      class="mr-2"
                      :disabled="isBooked(selectedDay, row.masa)"
                    />
                    {{ row.waktu }}
                  </label>
                </td>
                <td class="border border-black px-2 py-1 font-semibold">
                  <span v-if="isBooked(selectedDay, row.masa)" class="text-red-600">Booked</span>
                  <span v-else class="text-green-700">Available</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pilih Minggu -->
        <div class="mt-6 bg-white border border-black rounded-xl p-4 flex flex-wrap gap-4 text-sm">
          <label class="inline-flex items-center">
            <input type="radio" value="kuliah" v-model="selectedWeek" class="mr-2" />
            Minggu Kuliah
            <span class="text-xs ml-2 text-gray-600">({{ mingguKuliah.start }} – {{ mingguKuliah.end }})</span>
          </label>
          <label class="inline-flex items-center">
            <input type="radio" value="seminggu" v-model="selectedWeek" class="mr-2" />
            Minggu Semasa
            <span class="text-xs ml-2 text-gray-600">({{ mingguSemasa.start }} – {{ mingguSemasa.end }})</span>
          </label>
          <label class="inline-flex items-center">
            <input type="radio" value="manual" v-model="selectedWeek" class="mr-2" />
            Manual
            <input v-model="userStart" type="date" class="border px-1 py-0.5 text-xs ml-2" />
            <span class="text-xs mx-1">↔</span>
            <input v-model="userEnd" type="date" class="border px-1 py-0.5 text-xs" />
          </label>
        </div>

        <!-- Tombol Submit -->
        <div class="text-center mt-6">
          <button
            @click="handleSubmit"
            class="bg-[#991b1b] text-white text-lg font-bold py-2 px-8 rounded-lg hover:bg-[#7f1d1d]"
          >
            Hantar Permintaan
          </button>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <p class="text-xs text-center mt-6 px-4 text-gray-600">
      Any comments or questions? Contact
      <a href="mailto:ttms@fc.utm.my" class="text-red-600">ttms@fc.utm.my</a>.<br />
      &copy; 2002–2025, Faculty of Computing, UTM. All rights reserved.
    </p>
  </div>
</template>
