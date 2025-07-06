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
          <div class="flex sm:grid sm:grid-cols-7 gap-2 min-w-max sm:min-w-0">
            <div
              v-for="(day, i) in days"
              :key="i"
              class="relative text-center"
              :ref="el => dayRefs[i] = el"
            >
              <div
                @click="showPopupBelow(i)"
                :class="selectedDay === i
                  ? 'bg-[#933b3b] text-white shadow-md'
                  : 'hover:bg-gray-100 text-gray-700'"
                class="px-3 py-2 rounded-lg cursor-pointer transition-all w-full whitespace-nowrap"
              >
                {{ day }}
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
          <div v-if="daySchedule.length === 0" class="text-center text-gray-400 text-sm italic">
            No classes scheduled on {{ days[selectedDay] }}.
          </div>
          <div v-else class="space-y-3">
            <InfoCard
              v-for="(item, index) in daySchedule"
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
            />
          </div>
        </div>
      </transition>
    </div>

    <!-- WEEKLY VIEW -->
    <div v-show="viewMode === 'weekly'">
      <div class="overflow-x-auto mt-4 px-4 relative">
        <div class="sm:hidden absolute -top-6 left-4 text-xs text-gray-400">
          👈 Swipe to view full timetable
        </div>
        <div id="week-pdf" class="bg-white p-4 rounded-xl shadow min-w-[700px] sm:min-w-full overflow-auto sm:overflow-visible">
          <table class="w-full table-fixed border border-gray-300 rounded-xl text-sm text-left bg-white shadow">
            <thead class="bg-[#933b3b] text-white">
              <tr>
                <th class="p-3 border-r border-white">Time</th>
                <th v-for="day in days" :key="day" class="p-3 border-r border-white">{{ day }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, timeIdx) in timetableData.filter(r => parseInt(r.waktu.split('-')[0]) < 17)"
                :key="row.waktu"
                class="border-t border-gray-300"
              >
                <td class="p-3 font-semibold text-gray-700">{{ row.waktu }}</td>
                <td v-for="(slot, i) in row.slots" :key="i" class="p-3 align-top">
                  <div v-if="slot">
                    <div class="font-bold">{{ slot.split('\n')[0] }}</div>
                    <div class="text-xs text-gray-600">{{ slot.split('\n')[1] }}</div>
                    <div class="text-xs text-gray-500">{{ slot.split('\n')[2] }}</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
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
</style>