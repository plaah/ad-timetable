<!-- src/components/LecturerScheduleModal.vue -->
<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 flex justify-center items-center px-2 pointer-events-none"
  >
    <div
      class="bg-white w-full max-w-6xl rounded-xl p-6 shadow-xl max-h-[90vh] overflow-y-auto pointer-events-auto"
    >
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-[#933b3b]">📅 Timetable: {{ lecturerName }}</h2>
        <button @click="closeModal" class="text-red-600 font-bold text-lg hover:scale-110">&times;</button>
      </div>

      <div v-if="loading" class="text-center text-gray-500 py-6">Loading timetable...</div>

      <div v-else-if="groupedSlots">
        <table class="w-full border text-sm table-fixed">
          <thead>
            <tr class="bg-[#933b3b] text-white text-center">
              <th class="w-[90px] py-2">Time</th>
              <th v-for="day in days" :key="day" class="py-2">{{ day }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="slot in timeSlots" :key="slot">
              <td class="text-center border px-2 py-1 font-semibold">{{ slot }}</td>
              <td
                v-for="day in days"
                :key="day + slot"
                class="border px-2 py-1 align-top"
              >
                <div
                  v-for="item in groupedSlots[day][slot]"
                  :key="item.kod_subjek + item.masa + item.hari"
                  class="bg-gray-100 border border-gray-300 rounded mb-1 p-1 text-xs leading-tight"
                >
                  <strong>{{ item.kod_subjek }}</strong><br />
                  Section: {{ item.seksyen }}<br />
                  {{ item.nama_bilik || 'Room: N/A' }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="text-center text-gray-400 py-6 italic">
        No timetable data available for this lecturer in the current session.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue"
import { fetchCurrentSession, fetchLecturerSections, fetchSchedule } from "@/api/LecturerApi.js"

const props = defineProps({
  visible: Boolean,
  lecturerName: String,
  noPekerja: String,
  sessionId: String
})
const emit = defineEmits(["update:visible"])

const loading = ref(false)
const schedule = ref([])
const groupedSlots = ref(null)

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const timeSlots = [
  "07:00 - 07:50", "08:00 - 08:50", "09:00 - 09:50", "10:00 - 10:50",
  "11:00 - 11:50", "12:00 - 12:50", "13:00 - 13:50", "14:00 - 14:50",
  "15:00 - 15:50", "16:00 - 16:50", "17:00 - 17:50", "18:00 - 18:50"
]

const dayMap = {
  "Ahad": "Sunday", "Isnin": "Monday", "Selasa": "Tuesday",
  "Rabu": "Wednesday", "Khamis": "Thursday", "Jumaat": "Friday", "Sabtu": "Saturday"
}

const dayNumberMap = {
  "1": "Sunday", "2": "Monday", "3": "Tuesday", "4": "Wednesday",
  "5": "Thursday", "6": "Friday", "7": "Saturday"
}

const periodMap = {
  "1": "07:00 - 07:50", "2": "08:00 - 08:50", "3": "09:00 - 09:50", "4": "10:00 - 10:50",
  "5": "11:00 - 11:50", "6": "12:00 - 12:50", "7": "13:00 - 13:50", "8": "14:00 - 14:50",
  "9": "15:00 - 15:50", "10": "16:00 - 16:50", "11": "17:00 - 17:50", "12": "18:00 - 18:50"
}

function normalizeTime(t) {
  if (typeof t === "string") {
    if (t.includes(":")) return t
    if (t.length === 4) return `${t.slice(0, 2)}:${t.slice(2)}`
  }
  return t
}

function formatTimeRange(start, end) {
  return `${normalizeTime(start)} - ${normalizeTime(end)}`
}

function processSchedule(data) {
  const map = {}
  for (const day of days) {
    map[day] = {}
    for (const slot of timeSlots) {
      map[day][slot] = []
    }
  }

  data.forEach(slot => {
    const dayName = dayMap[slot.hari] || dayNumberMap[slot.hari] || slot.hari
    const timeRange = periodMap[slot.masa] || formatTimeRange(slot.masa_mula, slot.masa_tamat)

    if (map[dayName] && map[dayName][timeRange]) {
      map[dayName][timeRange].push(slot)
    } else {
      console.warn("⚠️ Tidak cocok:", { dayName, timeRange, slot })
    }
  })

  groupedSlots.value = map
}

watch(() => props.visible, async (val) => {
    
  if (val && props.noPekerja && props.sessionId) {
    loading.value = true
    schedule.value = []
    groupedSlots.value = null

    try {
      const sections = await fetchLecturerSections(props.noPekerja)
      const session = await fetchCurrentSession()

      const currentSections = sections.filter(
        sec => sec.sesi === session.sesi && String(sec.semester) === String(session.semester)
      )

      const result = await Promise.all(
        currentSections.map(sec =>
          fetchSchedule(sec.kod_subjek, sec.seksyen, sec.sesi, sec.semester)
        )
      )

      schedule.value = result.flat()
      processSchedule(schedule.value)
    } catch (err) {
      console.error("❌ Error fetching lecturer schedule:", err)
    } finally {
      loading.value = false
    }
  }
})

function closeModal() {
  emit("update:visible", false)
}
</script>
