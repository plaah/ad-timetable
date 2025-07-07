<template>
  <div
    class="bg-gradient-to-b from-gray-50 to-white min-h-screen pt-20 transition-all duration-300"
    :class="{ 'pl-[72px]': isSidebarOpen }"
  >
    <Toggle titleBanner="Timetable" />

    <!-- Greeting -->
    <div class="px-6 mt-4 flex items-center justify-between">
      <div>
        <h2 class="text-xl font-semibold text-[#933b3b]">
          📅 {{ greeting }}, {{ userName || 'Student' }}
        </h2>
        <p class="text-sm text-gray-500">
          Here's your schedule for <span class="font-medium">{{ days[selectedDay] }}</span>
        </p>
      </div>
    </div>

    <!-- Tab Switcher -->
    <div class="px-6 mt-6 flex flex-col sm:flex-row gap-2">
      <button
        @click="switchView('daily')"
        :class="viewMode === 'daily' ? 'bg-[#933b3b] text-white scale-105' : 'bg-white text-gray-600 border'"
        class="px-4 py-2 rounded-lg text-sm font-medium shadow-sm border transition-transform duration-300"
      >
        🗓️ Daily View
      </button>
      <button
        @click="switchView('weekly')"
        :class="viewMode === 'weekly' ? 'bg-[#933b3b] text-white scale-105' : 'bg-white text-gray-600 border'"
        class="px-4 py-2 rounded-lg text-sm font-medium shadow-sm border transition-transform duration-300"
      >
        📆 Weekly View
      </button>
    </div>

    <!-- DAILY VIEW -->
    <div v-show="viewMode === 'daily'" class="relative">
      <div class="px-6 py-4 bg-white shadow rounded-xl mx-4 mt-6 relative overflow-visible">
        <!-- Session Filter -->
        <div class="flex justify-end">
          <select
            v-model="activeSession"
            class="rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#933b3b] w-full sm:w-auto"
          >
            <option v-for="session in sessionOptions" :key="session" :value="session">{{ session }}</option>
          </select>
        </div>

        <!-- Day Tabs -->
        <div class="mt-6 text-sm font-medium relative overflow-x-auto px-2 sm:px-0 scrollbar-hide tab-wrapper">
          <div class="flex justify-between gap-1 w-full max-w-sm mx-auto sm:max-w-full sm:grid sm:grid-cols-7">
            <div
              v-for="(day, i) in days"
              :key="i"
              class="relative text-center"
              :ref="el => dayRefs[i] = el"
            >
              <div
                @click="showPopupBelow(i)"
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
        </div>
      </div>

      <!-- Popup Jadwal -->
      <transition name="fade-slide">
        <div
          v-if="showPopup"
          class="popup-panel absolute z-10"
          :style="isMobile
            ? { top: popupTop + 'px', left: '50%', transform: 'translateX(-50%)' }
            : { top: popupTop + 'px', left: popupLeft + 'px', transform: 'translateX(-50%)' }"
        >
          <div v-if="mergedDaySchedule.length === 0" class="text-center text-gray-400 text-sm italic">
            No classes scheduled on {{ days[selectedDay] }}.
          </div>
          <div v-else class="space-y-3">
            <InfoCard
              v-for="(item, index) in mergedDaySchedule"
              :key="index"
              :icon="'⏰'"
              :title="item.subjectName"
              :subtitle="item.time"
              :details="[
                { icon: '📘', text: item.subject },
                { icon: '🔢', text: `Section: ${item.section}` },
                ...(item.room ? [{ icon: '📍', text: item.room }] : [])
              ]"
              :badges="[]"
              :onCardClick="null"
              class="responsive-info-card"
            />
          </div>
        </div>
      </transition>
    </div>

    <!-- WEEKLY VIEW -->
    <div v-show="viewMode === 'weekly'">
      <div class="mt-4 px-2 sm:px-4">
        <!-- Tab Hari Minggu Ini -->
        <div class="flex justify-between gap-1 w-full max-w-sm mx-auto mb-4">
          <div
            v-for="(day, i) in days"
            :key="i"
            class="relative text-center"
          >
            <div
              :class="[
                'inline-flex flex-col items-center justify-center select-none',
                'transition-all duration-200',
                'border-2',
                'rounded-[2rem]',
                'w-12 h-16',
                'bg-[#933b3b] border-[#933b3b] text-white shadow-lg scale-105'
              ]"
              style="font-size: 12px; padding: 0.25rem 0.5rem;"
            >
              <span class="font-bold">{{ day.slice(0,3) }}</span>
              <span class="text-xs mt-1">{{ getDateForDayOfWeek(i) }}</span>
            </div>
          </div>
        </div>
        <!-- Agenda Mingguan: List semua hari minggu ini -->
        <div v-if="weeklyAgendaAll.length === 0" class="text-center text-gray-400 text-sm italic">
          No agenda for this week.
        </div>
        <div v-else>
          <div v-for="(agenda, i) in weeklyAgendaAll" :key="i" class="mb-6">
            <div class="font-semibold text-[#933b3b] mb-2 text-base flex items-center gap-2">
              <span>{{ days[i] }}</span>
              <span class="text-xs text-gray-400">{{ getDateForDayOfWeek(i) }}</span>
            </div>
            <div v-if="agenda.length === 0" class="text-gray-400 text-sm italic mb-2">No agenda.</div>
            <div v-else class="space-y-3">
              <InfoCard
                v-for="(item, idx) in agenda"
                :key="idx"
                :icon="'⏰'"
                :title="item.subjectName"
                :subtitle="item.time"
                :details="[
                  { icon: '📘', text: item.subject },
                  { icon: '🔢', text: `Section: ${item.section}` },
                  ...(item.room ? [{ icon: '📍', text: item.room }] : [])
                ]"
                :badges="[]"
                :onCardClick="null"
                class="responsive-info-card"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Spinner -->
    <div v-if="isLoading" class="text-center text-gray-400 py-10">Loading timetable...</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject } from 'vue';
import Toggle from '@/components/Toggle.vue';
import StudentSubjectApi from '@/api/StudentSubjectApi';
import TimetableApi from '@/api/TimetableApi';
import InfoCard from '@/components/InfoCard.vue';
import { userMatric, userName } from '@/constants/ApiConstants';
import { timetable, days } from '@/constants/TimeTableConstants';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameDay, addDays } from 'date-fns';

const isSidebarOpen = inject('isSidebarOpen', false);

const viewMode = ref('daily');
const activeSession = ref('2024/2025 - 2');
const selectedDay = ref(new Date().getDay());
const sessionOptions = [
  '2024/2025 - 2', '2024/2025 - 1', '2023/2024 - 2', '2023/2024 - 1'
];
const subjectList = ref([]);
const timetableData = ref(JSON.parse(JSON.stringify(timetable)));
const isLoading = ref(true);
const showPopup = ref(false);
const popupTop = ref(0);
const popupLeft = ref(0);
const dayRefs = ref([]);
const windowWidth = ref(window.innerWidth);

const isMobile = computed(() => windowWidth.value <= 768);

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
});

const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
  userName.value = lsData.full_name;
  userMatric.value = lsData.login_name;
}

const studentSubjectApi = new StudentSubjectApi();
const timetableApi = new TimetableApi();

onMounted(async () => {
  isLoading.value = true;
  try {
    subjectList.value = await studentSubjectApi.getTimetableInfo(userMatric.value);
  } catch (err) {
    console.error("Error loading subject list", err);
  } finally {
    isLoading.value = false;
  }

  window.addEventListener("resize", () => {
    windowWidth.value = window.innerWidth;
  });
});

const filteredSubjects = computed(() => {
  const [sesi, sem] = activeSession.value.split(" - ");
  return subjectList.value.filter(s => s.sesi === sesi && s.semester == sem);
});

const daySchedule = computed(() => {
  const schedule = [];
  const colorMap = new Map();
  let colorIndex = 0;
  const colors = [
    "bg-[#f9dcdc] border-[#933b3b]",
    "bg-[#f0e0e0] border-[#933b3b]",
    "bg-[#f7eaea] border-[#933b3b]",
    "bg-[#fae3e3] border-[#933b3b]",
    "bg-[#ffecec] border-[#933b3b]",
    "bg-[#ffe2e2] border-[#933b3b]",
  ];
  timetableData.value.forEach((row) => {
    const slot = row.slots[selectedDay.value];
    if (slot && slot.trim()) {
      const [code, secRaw, room] = slot.split("\n");
      const section = secRaw?.replace("section :", "").trim();
      const info = filteredSubjects.value.find(s => s.kod_subjek === code.trim());
      if (!colorMap.has(code)) {
        colorMap.set(code, colors[colorIndex % colors.length]);
        colorIndex++;
      }
      schedule.push({
        time: row.waktu,
        subject: code.trim(),
        subjectName: info?.nama_subjek || "",
        section,
        room: room?.trim(),
        color: colorMap.get(code),
      });
    }
  });
  return schedule;
});

const mergedDaySchedule = computed(() => {
  const waktuToMasa = {};
  timetableData.value.forEach(row => {
    waktuToMasa[row.waktu] = row.masa;
  });
  const schedule = [...daySchedule.value];
  schedule.sort((a, b) => (waktuToMasa[a.time] || 0) - (waktuToMasa[b.time] || 0));
  const merged = [];
  let current = null;
  for (let item of schedule) {
    const masa = waktuToMasa[item.time] || 0;
    if (!current) {
      current = { ...item, masaStart: masa, masaEnd: masa };
    } else if (
      item.subject === current.subject &&
      item.section === current.section &&
      item.room === current.room &&
      masa === current.masaEnd + 1
    ) {
      current.masaEnd = masa;
    } else {
      const waktuStart = Object.keys(waktuToMasa).find(w => waktuToMasa[w] === current.masaStart) || current.time;
      const waktuEnd = Object.keys(waktuToMasa).find(w => waktuToMasa[w] === current.masaEnd) || current.time;
      merged.push({ ...current, time: `${waktuStart.split('-')[0].trim()} - ${waktuEnd.split('-')[1].trim()}` });
      current = { ...item, masaStart: masa, masaEnd: masa };
    }
  }
  if (current) {
    const waktuStart = Object.keys(waktuToMasa).find(w => waktuToMasa[w] === current.masaStart) || current.time;
    const waktuEnd = Object.keys(waktuToMasa).find(w => waktuToMasa[w] === current.masaEnd) || current.time;
    merged.push({ ...current, time: `${waktuStart.split('-')[0].trim()} - ${waktuEnd.split('-')[1].trim()}` });
  }
  return merged;
});

watch(filteredSubjects, async (newSubs) => {
  isLoading.value = true;
  timetableData.value = JSON.parse(JSON.stringify(timetable));
  try {
    const schedules = (await Promise.all(newSubs.map(s =>
      timetableApi.getSubjectSchedule({
        kod_subjek: s.kod_subjek,
        seksyen: s.seksyen,
        sesi: s.sesi,
        semester: s.semester
      })
    ))).flat();
    schedules.forEach(i => {
      const rIdx = (i.masa ?? 1) - 1;
      const cIdx = (i.hari ?? 1) - 1;
      if (timetableData.value[rIdx] && timetableData.value[rIdx].slots[cIdx] !== undefined) {
        timetableData.value[rIdx].slots[cIdx] = `${i.kod_subjek}\nsection : ${i.seksyen}\n   ${i.ruang?.nama_ruang_singkatan ?? ""}`;
      }
    });
  } catch (e) {
    console.error("Error fetching timetable data", e);
  } finally {
    isLoading.value = false;
  }
});

function switchView(mode) {
  viewMode.value = mode;
  if (mode !== 'daily') showPopup.value = false;
}

function showPopupBelow(index) {
  if (selectedDay.value === index && showPopup.value) {
    showPopup.value = false;
    return;
  }

  selectedDay.value = index;
  showPopup.value = true;

  const tabWrapper = document.querySelector('.tab-wrapper');
  const dayEl = dayRefs.value[index]?.$el ?? dayRefs.value[index];

  if (dayEl && tabWrapper) {
    const rect = dayEl.getBoundingClientRect();
    const tabRect = tabWrapper.getBoundingClientRect();

    if (isMobile.value) {
      popupTop.value = tabRect.bottom + window.scrollY - 280;
      popupLeft.value = window.innerWidth / 2;
    } else {
      popupTop.value = rect.bottom + window.scrollY -200;
      popupLeft.value = rect.left + rect.width / 2;
    }
  }
}

const getDateForDay = (dayIndex) => {
  const today = new Date();
  const currentDay = today.getDay();
  const diff = dayIndex - currentDay;
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + diff);
  return targetDate.getDate();
};

const today = new Date();
const calendarDates = computed(() => {
  const start = startOfMonth(today);
  const end = endOfMonth(today);
  const dates = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d));
  }
  return dates;
});

const activeWeekStart = ref(startOfWeek(today, { weekStartsOn: 0 }));
const activeWeekEnd = ref(endOfWeek(today, { weekStartsOn: 0 }));

function isToday(date) {
  return isSameDay(date, today);
}
function isDateInActiveWeek(date) {
  return date >= activeWeekStart.value && date <= activeWeekEnd.value;
}
function selectWeekByDate(date) {
  activeWeekStart.value = startOfWeek(date, { weekStartsOn: 0 });
  activeWeekEnd.value = endOfWeek(date, { weekStartsOn: 0 });
}

const weeklyAgenda = computed(() => {
  // Kumpulkan semua jadwal di minggu aktif
  const agenda = [];
  for (let i = 0; i < 7; i++) {
    const d = addDays(activeWeekStart.value, i);
    const dayIdx = d.getDay();
    // Ambil jadwal harian (pakai logic merge agar tidak duplikat)
    const waktuToMasa = {};
    timetableData.value.forEach(row => {
      waktuToMasa[row.waktu] = row.masa;
    });
    const schedule = [];
    const colorMap = new Map();
    let colorIndex = 0;
    const colors = [
      "bg-[#f9dcdc] border-[#933b3b]",
      "bg-[#f0e0e0] border-[#933b3b]",
      "bg-[#f7eaea] border-[#933b3b]",
      "bg-[#fae3e3] border-[#933b3b]",
      "bg-[#ffecec] border-[#933b3b]",
      "bg-[#ffe2e2] border-[#933b3b]",
    ];
    timetableData.value.forEach((row) => {
      const slot = row.slots[dayIdx];
      if (slot && slot.trim()) {
        const [code, secRaw, room] = slot.split("\n");
        const section = secRaw?.replace("section :", "").trim();
        const info = filteredSubjects.value.find(s => s.kod_subjek === code.trim());
        if (!colorMap.has(code)) {
          colorMap.set(code, colors[colorIndex % colors.length]);
          colorIndex++;
        }
        schedule.push({
          time: row.waktu,
          subject: code.trim(),
          subjectName: info?.nama_subjek || "",
          section,
          room: room?.trim(),
          color: colorMap.get(code),
        });
      }
    });
    // Merge jadwal harian
    schedule.sort((a, b) => (waktuToMasa[a.time] || 0) - (waktuToMasa[b.time] || 0));
    let current = null;
    for (let item of schedule) {
      const masa = waktuToMasa[item.time] || 0;
      if (!current) {
        current = { ...item, masaStart: masa, masaEnd: masa };
      } else if (
        item.subject === current.subject &&
        item.section === current.section &&
        item.room === current.room &&
        masa === current.masaEnd + 1
      ) {
        current.masaEnd = masa;
      } else {
        const waktuStart = Object.keys(waktuToMasa).find(w => waktuToMasa[w] === current.masaStart) || current.time;
        const waktuEnd = Object.keys(waktuToMasa).find(w => waktuToMasa[w] === current.masaEnd) || current.time;
        agenda.push({ ...current, time: `${waktuStart.split('-')[0].trim()} - ${waktuEnd.split('-')[1].trim()}` });
        current = { ...item, masaStart: masa, masaEnd: masa };
      }
    }
    if (current) {
      const waktuStart = Object.keys(waktuToMasa).find(w => waktuToMasa[w] === current.masaStart) || current.time;
      const waktuEnd = Object.keys(waktuToMasa).find(w => waktuToMasa[w] === current.masaEnd) || current.time;
      agenda.push({ ...current, time: `${waktuStart.split('-')[0].trim()} - ${waktuEnd.split('-')[1].trim()}` });
    }
  }
  // Urutkan agenda by hari & jam
  agenda.sort((a, b) => {
    if (a.section !== b.section) return a.section.localeCompare(b.section);
    if (a.subject !== b.subject) return a.subject.localeCompare(b.subject);
    return (a.masaStart || 0) - (b.masaStart || 0);
  });
  return agenda;
});

// Helper: tanggal untuk hari ke-i di minggu aktif
function getDateForDayOfWeek(dayIdx) {
  const today = new Date();
  const start = startOfWeek(today, { weekStartsOn: 0 });
  const d = new Date(start);
  d.setDate(start.getDate() + dayIdx);
  return d.getDate();
}

const weeklyAgendaAll = computed(() => {
  // List agenda per hari minggu berjalan
  const agendaPerDay = [];
  const today = new Date();
  const start = startOfWeek(today, { weekStartsOn: 0 });
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const dayIdx = d.getDay();
    // Ambil jadwal harian (pakai logic merge agar tidak duplikat)
    const waktuToMasa = {};
    timetableData.value.forEach(row => {
      waktuToMasa[row.waktu] = row.masa;
    });
    const schedule = [];
    const colorMap = new Map();
    let colorIndex = 0;
    const colors = [
      "bg-[#f9dcdc] border-[#933b3b]",
      "bg-[#f0e0e0] border-[#933b3b]",
      "bg-[#f7eaea] border-[#933b3b]",
      "bg-[#fae3e3] border-[#933b3b]",
      "bg-[#ffecec] border-[#933b3b]",
      "bg-[#ffe2e2] border-[#933b3b]",
    ];
    timetableData.value.forEach((row) => {
      const slot = row.slots[dayIdx];
      if (slot && slot.trim()) {
        const [code, secRaw, room] = slot.split("\n");
        const section = secRaw?.replace("section :", "").trim();
        const info = filteredSubjects.value.find(s => s.kod_subjek === code.trim());
        if (!colorMap.has(code)) {
          colorMap.set(code, colors[colorIndex % colors.length]);
          colorIndex++;
        }
        schedule.push({
          time: row.waktu,
          subject: code.trim(),
          subjectName: info?.nama_subjek || "",
          section,
          room: room?.trim(),
          color: colorMap.get(code),
        });
      }
    });
    // Merge jadwal harian
    schedule.sort((a, b) => (waktuToMasa[a.time] || 0) - (waktuToMasa[b.time] || 0));
    let current = null;
    const merged = [];
    for (let item of schedule) {
      const masa = waktuToMasa[item.time] || 0;
      if (!current) {
        current = { ...item, masaStart: masa, masaEnd: masa };
      } else if (
        item.subject === current.subject &&
        item.section === current.section &&
        item.room === current.room &&
        masa === current.masaEnd + 1
      ) {
        current.masaEnd = masa;
      } else {
        const waktuStart = Object.keys(waktuToMasa).find(w => waktuToMasa[w] === current.masaStart) || current.time;
        const waktuEnd = Object.keys(waktuToMasa).find(w => waktuToMasa[w] === current.masaEnd) || current.time;
        merged.push({ ...current, time: `${waktuStart.split('-')[0].trim()} - ${waktuEnd.split('-')[1].trim()}` });
        current = { ...item, masaStart: masa, masaEnd: masa };
      }
    }
    if (current) {
      const waktuStart = Object.keys(waktuToMasa).find(w => waktuToMasa[w] === current.masaStart) || current.time;
      const waktuEnd = Object.keys(waktuToMasa).find(w => waktuToMasa[w] === current.masaEnd) || current.time;
      merged.push({ ...current, time: `${waktuStart.split('-')[0].trim()} - ${waktuEnd.split('-')[1].trim()}` });
    }
    agendaPerDay.push(merged);
  }
  return agendaPerDay;
});
</script>

<style scoped>
.popup-panel {
  background: white;
  border-radius: 0.75rem;
  padding: 1rem;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  width: 300px;
  transition: top 0.3s ease, left 0.3s ease;
}
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
@media (max-width: 600px) {
  .responsive-info-card {
    padding: 0.9rem 0.7rem !important;
    min-height: 90px !important;
    font-size: 0.97em !important;
  }
}
@media (min-width: 601px) {
  .responsive-info-card {
    padding: 1.25rem !important;
    min-height: 120px !important;
    font-size: 1em !important;
  }
}
</style>