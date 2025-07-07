<script setup>
import { ref, watch, onMounted, computed } from "vue";
import TimeVenueApi from "@/api/TimeVenueApi"; // Import API for room schedule
import InfoCard from './InfoCard.vue';

// Props from parent component
const props = defineProps({
  room: Object,
  show: Boolean,
  onClose: Function,
});

// Emit function for closing modal externally
const emit = defineEmits(['update:show'])

// Static session options and selected filters
const sesiOptions = ["2024/2025", "2023/2024"];
const selectedSesi = ref("2024/2025");
const selectedSemester = ref(1);

// Data loading states
const loading = ref(false);
const entries = ref([]);
const groupedSlots = ref(null);

// Timetable layout config
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const timeSlots = [
  "07:00 - 07:50", "08:00 - 08:50", "09:00 - 09:50", "10:00 - 10:50",
  "11:00 - 11:50", "12:00 - 12:50", "13:00 - 13:50", "14:00 - 14:50",
  "15:00 - 15:50", "16:00 - 16:50", "17:00 - 17:50", "18:00 - 18:50"
];

// Mapping day and slot identifiers from backend to readable format
const dayNumberMap = {
  "1": "Sunday", "2": "Monday", "3": "Tuesday", "4": "Wednesday",
  "5": "Thursday", "6": "Friday", "7": "Saturday"
};

const periodMap = {
  "1": "07:00 - 07:50", "2": "08:00 - 08:50", "3": "09:00 - 09:50", "4": "10:00 - 10:50",
  "5": "11:00 - 11:50", "6": "12:00 - 12:50", "7": "13:00 - 13:50", "8": "14:00 - 14:50",
  "9": "15:00 - 15:50", "10": "16:00 - 16:50", "11": "17:00 - 17:50", "12": "18:00 - 18:50"
};

// API instance
const api = new TimeVenueApi();

// Fallback time formatting if period mapping doesn't exist
function formatTimeRange(mula, tamat) {
  return `${mula} - ${tamat}`;
}

// Restructure raw entries into grid format by day and time
function processSchedule(data) {
  const map = {};
  for (const day of days) {
    map[day] = {};
    for (const time of timeSlots) {
      map[day][time] = [];
    }
  }
  data.forEach(slot => {
    const dayName = dayNumberMap[slot.hari] || slot.hari;
    const timeRange = periodMap[slot.masa] || formatTimeRange(slot.masa_mula, slot.masa_tamat);

    if (map[dayName] && map[dayName][timeRange]) {
      map[dayName][timeRange].push(slot);
    } else {
      console.warn("Unmatched slot:", slot);
    }
  });
  groupedSlots.value = map;
}

// Fetch room timetable using TimeVenueApi
async function fetchTimetable() {
  if (!props.room?.code) return;
  loading.value = true;
  entries.value = [];
  groupedSlots.value = null;

  try {
    const data = await api.fetchByRoom(
      selectedSesi.value,
      selectedSemester.value,
      props.room.code
    );
    entries.value = Array.isArray(data) ? data : [];
    processSchedule(entries.value);
  } catch (err) {
    console.error("Failed to fetch timetable:", err);
  } finally {
    loading.value = false;
  }
}

// Watch props and filters for dynamic refresh
onMounted(fetchTimetable);
watch([selectedSesi, selectedSemester, () => props.room?.code], fetchTimetable);

// Emit close event
function closeModal() {
  emit("update:show", false);
}

const selectedDay = ref(new Date().getDay());
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
  if (groupedSlots.value && groupedSlots.value[dayName]) {
    for (const time of timeSlots) {
      for (const item of groupedSlots.value[dayName][time]) {
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
      item.kod_perkara === current.kod_perkara &&
      item.section === current.section &&
      item.nama_bilik === current.nama_bilik &&
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

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex justify-center items-center px-2 pointer-events-none"
  >
    <div
      class="bg-white w-full max-w-6xl rounded-xl p-6 shadow-xl max-h-[90vh] overflow-y-auto pointer-events-auto"
    >
      <!-- Header -->
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-[#933b3b]">
          🏢 Room Timetable: {{ room?.code }}
        </h2>
        <button
          @click="closeModal"
          class="text-red-600 font-bold text-lg hover:scale-110"
        >
          &times;
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center text-gray-500 py-6">
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
            :title="item.kod_perkara"
            :subtitle="item.time"
            :details="[
              { icon: '📘', text: item.kod_perkara },
              { icon: '🔢', text: `Section: ${item.section}` },
              ...(item.nama_bilik ? [{ icon: '📍', text: item.nama_bilik }] : [])
            ]"
            :badges="[]"
            :onCardClick="null"
          />
        </div>
      </div>
    </div>
  </div>
</template>