<template>
    <div class="bg-white font-[Poppins] min-h-screen" pt-20>
        <Toggle />

        <main class="flex flex-col items-center justify-center py-8 px-4">
            <!-- Profile Icon -->
            <div
                class="w-32 h-32 rounded-full bg-red-100 border-4 border-red-400 flex items-center justify-center shadow-xl mb-6 mt-4"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-20 w-20 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <circle cx="12" cy="8" r="4" stroke-width="2" />
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 20c0-4 4-7 8-7s8 3 8 7"
                    />
                </svg>
            </div>

            <!-- Info cards -->
            <div class="w-full max-w-xs flex flex-col gap-4">
                <div
                    class="bg-white border border-red-200 rounded-xl shadow-md p-4 flex justify-between items-center text-base text-red-700"
                >
                    <span class="font-semibold">Sesi</span>
                    <span>{{ currentSession }}</span>
                </div>
                <div
                    class="bg-white border border-red-200 rounded-xl shadow-md p-4 flex justify-between items-center text-base text-red-700"
                >
                    <span class="font-semibold">Semester</span>
                    <span>{{ currentSemester }}</span>
                </div>
                <div
                    class="bg-white border border-red-200 rounded-xl shadow-md p-4 flex justify-between items-center text-base text-red-700"
                >
                    <span class="font-semibold">Tarikh Mula / Tamat</span>
                    <span>{{ startDate }} / {{ endDate }}</span>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Toggle from "@/components/Toggle.vue";
import SemesterApi from "@/api/SemesterApi";
import ProfileBanner from "@/components/ProfileBanner.vue";
import {
    currentSession,
    currentSemester,
    startDate,
    endDate,
} from "@/constants/ApiConstants";

const semesterApi = new SemesterApi();

onMounted(async () => {
    const data = await semesterApi.getCurrentSemesterInfo();
    if (data && data.length > 0) {
        const latest = data[0];
        currentSession.value = latest.sesi;
        currentSemester.value = latest.semester;
        startDate.value = latest.tarikh_mula;
        endDate.value = latest.tarikh_tamat;
    }
});
</script>