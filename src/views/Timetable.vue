<template>
  <div class="bg-gradient-to-b from-gray-50 to-white min-h-screen pt-20">
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
    <div v-show="viewMode === 'daily'">
      <div class="px-6 py-4 bg-white shadow rounded-xl mx-4 mt-6">
        <!-- Session Filter -->
        <div class="flex justify-end">
          <select
            v-model="activeSession"
            class="rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#933b3b] w-full sm:w-auto"
          >
            <option v-for="session in sessionOptions" :key="session" :value="session">{{ session }}</option>
          </select>
        </div>

        <!-- Day Tabs: full width with justified spacing -->
        <div class="grid grid-cols-7 gap-2 mt-6 text-sm font-medium relative">
          <div
            v-for="(day, i) in days"
            :key="i"
            class="relative text-center"
          >
            <!-- Day Button -->
            <div
              @click="selectedDay = i"
              :class="selectedDay === i
                ? 'bg-[#933b3b] text-white shadow-md'
                : 'hover:bg-gray-100 text-gray-700'"
              class="px-3 py-2 rounded-lg cursor-pointer transition-all w-full"
            >
              {{ day }}
            </div>

            <!-- Animated Schedule Popup -->
            <transition name="fade-slide">
              <div
  v-if="selectedDay === i"
  class="absolute top-full left-1/2 transform -translate-x-1/2 mt-6 bg-white border rounded-xl p-4 shadow-xl w-[300px] z-10"
>

                <div v-if="daySchedule.length === 0" class="text-center text-gray-400 text-sm italic">
                  No classes scheduled on {{ days[selectedDay] }}.
                </div>
                <div v-else class="space-y-3">
                  <div
                    v-for="(item, index) in daySchedule"
                    :key="index"
                    class="p-3 border-l-4 rounded-md"
                    :class="item.color"
                  >
                    <div class="text-sm font-semibold text-[#933b3b]">
                      {{ item.time }} — {{ item.subjectName }}
                    </div>
                    <div class="text-xs text-gray-600">📘 {{ item.subject }}</div>
                    <div class="text-xs text-gray-500">Section: {{ item.section }}</div>
                    <div class="text-xs text-gray-500" v-if="item.room">📍 {{ item.room }}</div>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>

    <!-- WEEKLY VIEW -->
    <div v-show="viewMode === 'weekly'">
      <div class="overflow-x-auto mt-4 px-4">
        <div id="week-pdf" class="bg-white p-4 rounded-xl shadow min-w-[700px] sm:min-w-full">
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
                    <div class="font-bold">{{ slot.split('\\n')[0] }}</div>
                    <div class="text-xs text-gray-600">{{ slot.split('\\n')[1] }}</div>
                    <div class="text-xs text-gray-500">{{ slot.split('\\n')[2] }}</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import StudentSubjectApi from "@/api/StudentSubjectApi";
import TimetableApi from "@/api/TimetableApi";
import Toggle from "@/components/Toggle.vue";
import { ref, computed, onMounted, watch } from "vue";
import { userMatric, userName } from "@/constants/ApiConstants";
import { timetable, days } from "@/constants/TimeTableConstants";

const viewMode = ref("daily");
const switchView = (mode) => { viewMode.value = mode; };

const activeSession = ref("2024/2025 - 2");
const selectedDay = ref(new Date().getDay());
const sessionOptions = ["2024/2025 - 2", "2024/2025 - 1", "2023/2024 - 2", "2023/2024 - 1"];

const subjectList = ref([]);
const timetableData = ref(JSON.parse(JSON.stringify(timetable)));
const isLoading = ref(true);

const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
  userName.value = lsData.full_name;
  userMatric.value = lsData.login_name;
}

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
});

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
</script>

<style scoped>
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
</style>