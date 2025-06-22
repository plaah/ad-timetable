<script setup>
import { ref, watch, onMounted } from "vue";
import TimeVenueApi from "@/api/TimeVenueApi"; // Import API for room schedule

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

      <!-- Table View -->
      <div v-else-if="groupedSlots">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[700px] border text-xs sm:text-sm table-fixed">
            <thead>
              <tr class="bg-[#933b3b] text-white text-center">
                <th class="w-[90px] py-2">Time</th>
                <th v-for="day in days" :key="day" class="py-2 px-1 sm:px-2">{{ day }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="slot in timeSlots" :key="slot">
                <td class="text-center border px-1 sm:px-2 py-1 font-semibold">
                  {{ slot }}
                </td>
                <td
                  v-for="day in days"
                  :key="day + slot"
                  class="border px-1 sm:px-2 py-1 align-top"
                >
                  <div
                    v-for="item in groupedSlots[day][slot]"
                    :key="item.kod_perkara + item.masa + item.hari"
                    class="bg-gray-100 border border-gray-300 rounded mb-1 p-1 text-[10px] sm:text-xs leading-tight"
                  >
                    <strong>{{ item.kod_perkara }}</strong><br />
                    Section: {{ item.section || '-' }}<br />
                    {{ item.nama_bilik || 'Room: N/A' }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-gray-400 text-[10px] mt-2 sm:hidden text-center italic">
          Scroll sideways to view more →
        </p>
      </div>

      <!-- Fallback for no data -->
      <div v-else class="text-center text-gray-400 py-6 italic">
        No timetable data available.
      </div>
    </div>
  </div>
</template>