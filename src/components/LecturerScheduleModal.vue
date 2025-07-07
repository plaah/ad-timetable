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

      <!-- Daily Card View -->
      <div v-else>
        <!-- Tab Hari -->
        <div class="flex justify-between gap-1 w-full max-w-sm mx-auto mb-4">
          <div
            v-for="(day, i) in days"
            :key="i"
            class="relative text-center"
          >
            <div
              @click="selectedDay = i"
              :class="[
                'inline-flex flex-col items-center justify-center cursor-pointer select-none',
                'transition-all duration-200',
                'border-2',
                'rounded-[2rem]',
                'w-12 h-16',
                selectedDay === i ? 'bg-[#933b3b] border-[#933b3b] text-white shadow-lg scale-105' : 'bg-white border-[#933b3b] text-[#933b3b] hover:bg-[#f8eaea]'
              ]"
              style="font-size: 12px; padding: 0.25rem 0.5rem;"
            >
              <span class="font-bold">{{ day.slice(0,3) }}</span>
              <span class="text-xs mt-1">{{ getDateForDay(i) }}</span>
            </div>
          </div>
        </div>
        <!-- Card Jadwal Harian -->
        <div v-if="mergedDaySchedule.length === 0" class="text-center text-gray-400 text-sm italic">
          No classes scheduled on {{ days[selectedDay] }}.
        </div>
        <div v-else class="space-y-3">
          <InfoCard
            v-for="(item, index) in mergedDaySchedule"
            :key="index"
            :icon="'⏰'"
            :title="item.nama_subjek || item.kod_subjek"
            :subtitle="item.time"
            :details="[
              { icon: '📘', text: item.kod_subjek },
              { icon: '🔢', text: `Section: ${item.seksyen}` },
              ...(item.ruang?.kod ? [{ icon: '📍', text: item.ruang.kod }] : [])
            ]"
            :badges="[]"
            :onCardClick="null"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import timetableApi from "@/api/TimetableApi";
import LecturerSubjectApi from "@/api/LecturerSubjectApi";
import { fetchCurrentSession } from "@/api/LecturerApi";
import InfoCard from './InfoCard.vue';

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
const selectedDay = ref(new Date().getDay());

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

const getDateForDay = (dayIndex) => {
  const today = new Date();
  const currentDay = today.getDay();
  const diff = dayIndex - currentDay;
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + diff);
  return targetDate.getDate();
};

const dailySchedule = computed(() => {
  // Ambil slot untuk hari yang dipilih
  const dayName = days[selectedDay.value];
  const slots = [];
  if (scheduleMap.value && scheduleMap.value[dayName]) {
    for (const time of timeSlots) {
      for (const item of scheduleMap.value[dayName][time]) {
        slots.push({ ...item, time });
      }
    }
  }
  // Urutkan berdasarkan masa
  slots.sort((a, b) => (parseInt(a.masa) || 0) - (parseInt(b.masa) || 0));
  return slots;
});

const mergedDaySchedule = computed(() => {
  // Merge slot subject, section, room, dan jam berurutan
  const schedule = [...dailySchedule.value];
  const merged = [];
  let current = null;
  for (let item of schedule) {
    const masa = parseInt(item.masa) || 0;
    if (!current) {
      current = { ...item, masaStart: masa, masaEnd: masa };
    } else if (
      item.kod_subjek === current.kod_subjek &&
      item.seksyen === current.seksyen &&
      (item.ruang?.kod || '') === (current.ruang?.kod || '') &&
      masa === current.masaEnd + 1
    ) {
      current.masaEnd = masa;
    } else {
      // Format waktu gabungan
      const waktuStart = timeSlots[(current.masaStart || 1) - 1] || current.time;
      const waktuEnd = timeSlots[(current.masaEnd || 1) - 1] || current.time;
      merged.push({ ...current, time: `${waktuStart.split('-')[0].trim()} - ${waktuEnd.split('-')[1].trim()}` });
      current = { ...item, masaStart: masa, masaEnd: masa };
    }
  }
  if (current) {
    const waktuStart = timeSlots[(current.masaStart || 1) - 1] || current.time;
    const waktuEnd = timeSlots[(current.masaEnd || 1) - 1] || current.time;
    merged.push({ ...current, time: `${waktuStart.split('-')[0].trim()} - ${waktuEnd.split('-')[1].trim()}` });
  }
  return merged;
});
</script>
