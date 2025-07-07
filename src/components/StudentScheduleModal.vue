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
            :title="item.subjectName || item.kod_subjek"
            :subtitle="item.time"
            :details="[
              { icon: '📘', text: item.kod_subjek },
              { icon: '🔢', text: `Section: ${item.seksyen}` },
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


<script setup>
import { ref, watch, computed } from 'vue'
import { fetchStudentSubjects, fetchCurrentSession } from '@/api/StudentApi.js'
import timetableApi from '@/api/TimetableApi.js'
import InfoCard from './InfoCard.vue'

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
      item.kod_subjek === current.kod_subjek &&
      item.seksyen === current.seksyen &&
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
