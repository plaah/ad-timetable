<template>
  <div class="min-h-screen bg-gray-50 font-[Poppins] text-gray-800 pt-28">
    <!-- HEADER -->
    <div class="max-w-6xl mx-auto px-6">
      <div class="bg-white text-gray-900 p-6 rounded-xl shadow border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 class="text-2xl font-bold mb-1">👋 Welcome, <span class="uppercase">{{ userName }}</span></h1>
          <p class="text-sm">Logged in as <span class="font-semibold">{{ userMatric }}</span></p>
        </div>
        <div class="mt-3 sm:mt-0 text-xs text-gray-500">📆 Session: {{ currentSession }} • Semester {{ currentSemester }}</div>
      </div>
    </div>

    <!-- STUDENT INFO -->
    <div class="max-w-6xl mx-auto px-6 mt-6">
      <div class="rounded-xl p-6 shadow bg-white border border-gray-200">
        <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">🎓 Student Information</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2 text-sm text-gray-700">
          <div><span class="font-medium">👤 Full Name:</span> {{ userName }}</div>
          <div><span class="font-medium">🆔 Matric Number:</span> {{ userMatric }}</div>
          <div><span class="font-medium">📅 Start Date:</span> {{ startDate }}</div>
          <div><span class="font-medium">📅 End Date:</span> {{ endDate }}</div>
          <div><span class="font-medium">🗓️ Semester:</span> {{ currentSemester }}</div>
          <div><span class="font-medium">⏳ Days Remaining:</span> {{ daysLeft }} day(s)</div>
        </div>
      </div>
    </div>

    <!-- MOTIVATION + FACT -->
    <main class="max-w-6xl mx-auto px-6 mt-10 space-y-6">
      <section class="grid md:grid-cols-2 gap-6">
        <!-- MOTIVATION -->
        <div class="bg-blue-50 p-6 rounded-xl shadow border-l-4 border-blue-500">
          <h2 class="text-lg font-semibold text-blue-700 mb-2">💡 Today's Motivation</h2>
          <transition name="fade">
            <blockquote class="italic text-gray-700">“{{ currentMotivation }}”</blockquote>
          </transition>
        </div>

        <!-- FACT -->
        <div class="bg-amber-50 p-6 rounded-xl shadow border-l-4 border-amber-500">
          <h2 class="text-lg font-semibold text-amber-700 mb-2">📚 Academic Fun Fact</h2>
          <transition name="fade">
            <p class="text-gray-700">{{ currentFact }}</p>
          </transition>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import SemesterApi from '@/api/SemesterApi';
import { currentSession, currentSemester, startDate, endDate } from '@/constants/ApiConstants';

// --- STUDENT INFO ---
const userName = ref('');
const userMatric = ref('');

const fetchStudentInfo = async () => {
  try {
    const data = await new SemesterApi().getCurrentSemesterInfo();
    if (data && data.length > 0) {
      const latest = data[0];
      currentSession.value = latest.sesi;
      currentSemester.value = latest.semester;
      startDate.value = latest.tarikh_mula;
      endDate.value = latest.tarikh_tamat;
    }

    const lsData = localStorage.getItem('web.fc.utm.my_usersession');
    if (lsData) {
      const parsed = JSON.parse(lsData);
      userName.value = parsed?.full_name || '';
      userMatric.value = parsed?.login_name || '';
    }
  } catch (err) {
    console.error('Error loading student info:', err);
  }
};

// --- MOTIVATION + FACT ---
const motivations = [
  'Education is the most powerful weapon you can use to change the world. – Nelson Mandela',
  'Success is the result of hard work, persistence, and learning from failure.',
  'It is never too late to learn something new.'
];
const facts = [
  'The human brain can store more information than all the encyclopedias in the world.',
  'University students read an average of 200–300 pages of academic material per week.',
  'Waking up early improves memory and academic productivity.'
];

const currentMotivation = ref(motivations[0]);
const currentFact = ref(facts[0]);
let motIndex = 0;
let factIndex = 0;

const rotateContent = () => {
  motIndex = (motIndex + 1) % motivations.length;
  factIndex = (factIndex + 1) % facts.length;
  currentMotivation.value = motivations[motIndex];
  currentFact.value = facts[factIndex];
};

// --- DAYS LEFT CALC ---
const daysLeft = computed(() => {
  if (!endDate.value) return '-';
  const today = new Date();
  const end = new Date(endDate.value);
  const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? diff : 0;
});

// --- INIT ---
onMounted(async () => {
  await fetchStudentInfo();
  setInterval(rotateContent, 8000);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
