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
        <h2 class="text-xl font-semibold text-[#933b3b]">
          📅 Timetable: {{ studentName }}
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

      <!-- Table: Schedule -->
      <div v-else-if="groupedSlots">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[700px] border text-xs sm:text-sm table-fixed">
            <thead>
              <tr class="bg-[#933b3b] text-white text-center">
                <th class="w-[90px] py-2">Time</th>
                <th
                  v-for="day in days"
                  :key="day"
                  class="py-2 px-1 sm:px-2"
                >
                  {{ day }}
                </th>
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
                    :key="item.kod_subjek + item.masa + item.hari"
                    class="bg-gray-100 border border-gray-300 rounded mb-1 p-1 text-[10px] sm:text-xs leading-tight"
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

        <!-- Optional: scroll hint -->
        <p class="text-gray-400 text-[10px] mt-2 sm:hidden text-center italic">
          Scroll sideways to view more →
        </p>
      </div>

      <!-- No Data -->
      <div v-else class="text-center text-gray-400 py-6 italic">
        No timetable data available.
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, watch } from 'vue'
import { fetchStudentSubjects, fetchCurrentSession } from '@/api/StudentApi.js'
import timetableApi from '@/api/TimetableApi.js'

const props = defineProps({
  matric: String,
  sessionId: String,
  visible: Boolean,
  studentName: String
})

const emit = defineEmits(['update:visible'])

const schedule = ref([])
const groupedSlots = ref(null)
const loading = ref(false)

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const timeSlots = [
  "07:00 - 07:50", "08:00 - 08:50", "09:00 - 09:50", "10:00 - 10:50",
  "11:00 - 11:50", "12:00 - 12:50", "13:00 - 13:50", "14:00 - 14:50",
  "15:00 - 15:50", "16:00 - 16:50", 
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
  "9": "15:00 - 15:50", "10": "16:00 - 16:50", 
}

const api = new timetableApi()

function normalizeTime(t) {
  if (typeof t === 'string') {
    if (t.includes(':')) return t
    if (t.length === 4) return t.slice(0, 2) + ':' + t.slice(2)
  }
  return t
}

function formatTimeRange(mula, tamat) {
  const start = normalizeTime(mula)
  const end = normalizeTime(tamat)
  return `${start} - ${end}`
}

function processSchedule(data) {
  const map = {}
  for (const day of days) {
    map[day] = {}
    for (const time of timeSlots) {
      map[day][time] = []
    }
  }

  data.forEach(slot => {
    const dayName = dayMap[slot.hari] || dayNumberMap[slot.hari] || slot.hari
    const timeRange = periodMap[slot.masa] || formatTimeRange(slot.masa_mula, slot.masa_tamat)

    if (map[dayName] && map[dayName][timeRange]) {
      map[dayName][timeRange].push(slot)
    } else {
      console.warn("⚠️ Slot tidak cocok dengan grid:", { dayName, timeRange, slot })
    }
  })

  groupedSlots.value = map
}

watch(() => props.visible, async (val) => {
  if (val && props.matric && props.sessionId) {
    loading.value = true
    schedule.value = []
    groupedSlots.value = null

    try {
      const subjects = await fetchStudentSubjects(props.sessionId, props.matric)
      const session = await fetchCurrentSession()

      const currentSubjects = subjects.filter(subj =>
        subj.sesi === session.sesi && String(subj.semester) === String(session.semester)
      )

      const results = await Promise.all(
        currentSubjects.map(subj =>
          api.getSubjectSchedule({
            kod_subjek: subj.kod_subjek,
            seksyen: subj.seksyen,
            sesi: session.sesi,
            semester: session.semester
          })
        )
      )

      schedule.value = results.flat()
      processSchedule(schedule.value)
    } catch (err) {
      console.error("❌ Error fetching schedule:", err)
    } finally {
      loading.value = false
    }
  }
})

function closeModal() {
  emit('update:visible', false)
}
</script>
