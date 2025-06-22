<script setup>
import { ref, watch, computed, onMounted } from "vue";
import TimeVenueApi from "@/api/TimeVenueApi";
import { days, timetable } from "@/constants/TimetableConstants";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const roomCode = route.query.roomCode || ""; // dari URL ?roomCode=XXX
const sesiOptions = ["2024/2025", "2023/2024"];
const selectedSesi = ref("2024/2025");
const selectedSemester = ref(1);
const selectedDay = ref(0);
const entries = ref([]);
const show = ref(true);

const jadualRuangApi = new TimeVenueApi();

async function fetchTimetable() {
  if (!roomCode) return;
  try {
    const data = await jadualRuangApi.fetchByRoom(
      selectedSesi.value,
      selectedSemester.value,
      roomCode
    );
    console.log("✅ Data fetched:", data);
    entries.value = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Failed to fetch timetable:", err);
    entries.value = [];
  }
}

onMounted(fetchTimetable);
watch([selectedSesi, selectedSemester], fetchTimetable);

const filteredEntries = computed(() =>
  entries.value.filter((e) => e.hari === selectedDay.value + 1)
);

function getTime(masa) {
  const row = timetable.find((t) => t.masa === masa);
  return row ? row.waktu : "";
}

function closePage() {
  router.push("/venue"); // atau halaman mana aja
}
</script>


<template>
    <div
        v-if="show"
        class="fixed inset-0 bg-[#933b3b]/30 backdrop-blur-sm bg-opacity-50 z-50 flex justify-center items-center"
    >
        <div
            class="bg-white max-w-lg w-full mx-4 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto relative p-4"
        >
            <!-- Close Button -->
            <button
                @click="onClose"
                class="absolute top-3 right-3 text-gray-500 hover:text-black"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
            </button>

            <!-- Panel Header -->
            <h2 class="text-lg font-bold mb-4 text-[#933b3b]">Jadual {{ roomCode }}</h2>

            <!-- Filter Controls -->
            <div class="flex flex-wrap gap-2 mb-4">
                <select v-model="selectedSesi" class="border border-[#933b3b] px-2 py-1 rounded">
                    <option v-for="s in sesiOptions" :key="s" :value="s">
                        {{ s }}
                    </option>
                </select>

                <select
                    v-model="selectedSemester"
                    class="border border-[#933b3b] px-2 py-1 rounded"
                >
                    <option :value="1">Sem 1</option>
                    <option :value="2">Sem 2</option>
                </select>

                <div class="flex gap-1">
                    <button
                        v-for="(d, i) in days"
                        :key="i"
                        :class="[
                            'px-2 py-1 rounded text-sm',
                            selectedDay === i
                                ? 'bg-[#933b3b] text-white'
                                : 'bg-gray-100',
                        ]"
                        @click="selectedDay = i"
                    >
                        {{ d.slice(0, 3) }}
                    </button>
                </div>
            </div>

            <!-- Timetable List -->
            <div v-if="filteredEntries.length" class="space-y-3">
                <div
                    v-for="(entry, i) in filteredEntries"
                    :key="i"
                    class="bg-[#ba5757] p-3 rounded-xl shadow"
                >
                    <div class="font-bold text-sm text-white">{{ entry.kod_perkara }}</div>
                    <div class="text-xs text-gray-200">
                        {{ getTime(entry.masa) }}
                    </div>
                    <div class="text-sm mt-1 text-white">
                        Section: {{ entry.section || "-" }}
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-else class="text-center text-gray-400 py-6">
                Tiada data untuk hari ini.
            </div>
        </div>
        <!-- Footer -->
    <p class="text-xs text-center mt-6 px-4 text-gray-600">
      If you have any comments or questions regarding this webpage, please contact
      <a href="mailto:ttms@fc.utm.my" class="text-red-600">ttms@fc.utm.my</a>.<br />
      &copy; 2002–2025, Faculty of Computing, UTM. All rights reserved.
    </p>
    </div>
</template>

<style scoped>
/* Gaya baru */
.bg-[#933b3b] {
    background-color: #933b3b;
}

.bg-[#ba5757] {
    background-color: #ba5757;
}

.text-[#933b3b] {
    color: #933b3b;
}
</style>