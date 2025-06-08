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
        <div class="flex justify-end">
          <select
            v-model="activeSession"
            class="rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#933b3b] w-full sm:w-auto"
          >
            <option v-for="session in sessionOptions" :key="session" :value="session">{{ session }}</option>
          </select>
        </div>

        <!-- Tabs Hari dengan scroll snap -->
        <div
          class="flex overflow-x-auto snap-x snap-mandatory mt-6 text-sm font-medium gap-2"
          style="width: 100%;"
        >
          <div
            v-for="(day, i) in days"
            :key="i"
            @click="selectedDay = i"
            class="px-3 py-2 rounded-lg cursor-pointer transition-all text-center snap-center min-w-[80px]"
            :class="selectedDay === i
              ? 'bg-[#933b3b] text-white shadow-md'
              : 'hover:bg-gray-200 text-gray-700'"
            style="flex: 1;"
          >
            {{ day }}
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="text-center py-10 text-[#933b3b] font-medium animate-pulse">
        Loading your schedule...
      </div>

      <div v-else class="px-6 py-6">
        <TransitionGroup name="fade" tag="div">
          <div
            v-for="(item, i) in daySchedule"
            :key="item.time + i"
            class="flex flex-col sm:flex-row items-start border-l-4 p-5 rounded-xl shadow-md mb-4 backdrop-blur-sm"
            :class="item.color"
          >
            <div class="text-xs text-gray-600 sm:min-w-[60px] text-center sm:text-left">
              <div class="font-bold">{{ item.time.split('-')[0] }}</div>
              <div class="text-gray-400">{{ item.time.split('-')[1] }}</div>
            </div>
            <div class="sm:ml-6 mt-2 sm:mt-0">
              <div class="font-semibold text-gray-800 text-base flex items-center gap-2">
                🎓 <span>{{ item.subject }}</span>
              </div>
              <div class="text-sm text-gray-600 italic">📘 {{ item.subjectName }}</div>
              <div class="text-sm text-gray-500 mt-1">
                Section: {{ item.section }}
                <span v-if="item.room">| 📍 Room: {{ item.room }}</span>
              </div>
            </div>
          </div>
        </TransitionGroup>

        <div v-if="daySchedule.length === 0" class="text-center text-gray-500 py-12">
          No classes scheduled on {{ days[selectedDay] }}.
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
import PelajarSubjekApi from "@/api/PelajarSubjekApi";
import JadualSubjekApi from "@/api/JadualSubjekApi";
import Toggle from "@/components/Toggle.vue";
import { ref, computed, onMounted, watch } from "vue";
import { userMatric, userName } from "@/constants/ApiConstants";
import { timetable, days } from "@/constants/TimetableConstants";

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

const pelajarSubjekApi = new PelajarSubjekApi();
const jadualSubjekApi = new JadualSubjekApi();

onMounted(async () => {
  isLoading.value = true;
  try {
    subjectList.value = await pelajarSubjekApi.getTimetableInfo(userMatric.value);
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

  timetableData.value.forEach((row, timeIdx) => {
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
      jadualSubjekApi.getSubjectSchedule({
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