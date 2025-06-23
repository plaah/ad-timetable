<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 flex justify-center items-center px-2 pointer-events-none"
  >
    <div
      class="bg-white w-full max-w-6xl rounded-xl p-6 shadow-xl max-h-[90vh] overflow-y-auto pointer-events-auto"
    >
      <!-- Header -->
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-[#933b3b]">📅 Timetable: {{ lecturerName }}</h2>
        <button
          @click="$emit('update:visible', false)"
          class="text-red-600 font-bold text-lg hover:scale-110"
        >
          &times;
        </button>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="text-center text-gray-500 py-6">
        Loading timetable...
      </div>

      <!-- Empty -->
      <div v-else-if="slots.length === 0" class="text-center text-gray-400 py-6 italic">
        No timetable data available.
      </div>
<!-- Table View -->
<div v-else>
  <table class="w-full table-fixed border text-sm border-collapse">
    <thead>
      <tr class="bg-[#933b3b] text-white text-center">
        <th class="w-[90px] py-2 border">Time</th>
        <th v-for="day in days" :key="day" class="py-2 border">{{ day }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="time in timeSlots" :key="time">
        <td class="text-center border px-2 py-2 font-medium">{{ time }}</td>
        <td
          v-for="day in days"
          :key="day + time"
          class="border px-2 py-1 align-top min-h-[80px]"
        >
          <div
            v-for="slot in scheduleMap[day]?.[time] || []"
            :key="slot.id_jws"
            class="bg-gray-100 border border-gray-300 rounded mb-1 p-1 text-xs leading-tight"
          >
            <div class="font-semibold text-[#933b3b]">{{ slot.kod_subjek }}</div>
            <div>Section: {{ slot.seksyen }}</div>
            <div>Room: {{ slot.ruang?.kod || 'N/A' }}</div>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import timetableApi from "@/api/TimetableApi";
import LecturerSubjectApi from "@/api/LecturerSubjectApi";
import { fetchCurrentSession } from "@/api/LecturerApi";

const props = defineProps({
  visible: Boolean,
  lecturerName: String,
  noPekerja: String,
  sessionId: String,
});

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const timeSlots = [
  "07:00 - 07:50", "08:00 - 08:50", "09:00 - 09:50", "10:00 - 10:50",
  "11:00 - 11:50", "12:00 - 12:50", "13:00 - 13:50", "14:00 - 14:50",
  "15:00 - 15:50", "16:00 - 16:50", 
];

const slots = ref([]);
const scheduleMap = ref({});
const isLoading = ref(false);

onMounted(async () => {
  isLoading.value = true;
  try {
    const { sesi, semester } = await fetchCurrentSession();
    const subjectApi = new LecturerSubjectApi();
    const timetable = new timetableApi();

    const subjectList = await subjectApi.getTimetableInfo(props.noPekerja);
    const filtered = subjectList.filter(s => s.sesi === sesi && String(s.semester) === String(semester));

    const all = [];
    for (const subject of filtered) {
      const slotList = await timetable.getSubjectSchedule({
        kod_subjek: subject.kod_subjek,
        seksyen: subject.seksyen,
        sesi,
        semester,
      });

      const enriched = slotList.map(slot => ({
        ...slot,
        kod_subjek: subject.kod_subjek,
        nama_subjek: subject.nama_subjek,
        kelas: subject.kelas,
        seksyen: subject.seksyen,
      }));

      all.push(...enriched);
    }

    slots.value = all;

    const map = {};
    for (const day of days) {
      map[day] = {};
      for (const time of timeSlots) {
        map[day][time] = [];
      }
    }

    for (const slot of all) {
      const dayName = days[parseInt(slot.hari) - 1] || "Unknown";
      const timeLabel = timeSlots[parseInt(slot.masa) - 1] || "Unknown";
      if (map[dayName] && map[dayName][timeLabel]) {
        map[dayName][timeLabel].push(slot);
      }
    }

    scheduleMap.value = map;
  } catch (e) {
    console.error("❌ Failed to load timetable:", e);
  } finally {
    isLoading.value = false;
  }
});
</script>
