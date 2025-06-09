<template>
  <div class="min-h-screen bg-gray-50 font-poppins text-gray-800 pt-28">
    <!-- HEADER -->
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      <div class="bg-white text-gray-900 p-6 rounded-2xl shadow-md border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 class="text-2xl font-bold mb-1">👋 <span class="opacity-80">{{ greeting }}</span>, <span class="uppercase text-blue-600">{{ userName }}</span></h1>
          <p class="text-sm text-gray-600">Logged in as <span class="font-semibold">{{ userMatric }}</span></p>
        </div>
        <div class="mt-4 sm:mt-0 text-xs text-gray-600 space-x-2">
          <span class="bg-sky-100 text-sky-800 px-2 py-1 rounded-full font-semibold">📆 Session: {{ currentSession }}</span>
          <span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-semibold">Semester {{ currentSemester }}</span>
        </div>
      </div>
    </div>

    <!-- STUDENT INFO -->
    <div class="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
      <div class="rounded-2xl p-6 shadow bg-white border border-gray-200">
        <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">🎓 Student Information</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2 text-sm text-gray-700">
          <div><span class="font-medium">👤 Full Name:</span> {{ userName }}</div>
          <div><span class="font-medium">🆔 Matric Number:</span> {{ userMatric }}</div>
          <div><span class="font-medium">📅 Start Date:</span> {{ startDate }}</div>
          <div><span class="font-medium">📅 End Date:</span> {{ endDate }}</div>
          <div><span class="font-medium">🗓️ Semester:</span> {{ currentSemester }}</div>
          <div><span class="font-medium">⏳ Days Remaining:</span>
            <span class="text-white bg-green-500 px-2 py-0.5 rounded-full font-semibold">{{ daysLeft }} day(s)</span>
          </div>
        </div>
      </div>
    </div>

    <!-- MOTIVATION + FACT -->
    <main class="max-w-6xl mx-auto px-4 sm:px-6 mt-10 space-y-6">
      <section class="grid md:grid-cols-2 gap-6">
        <!-- MOTIVATION -->
        <transition name="fade-slide" mode="out-in">
          <div key="motivation" class="bg-blue-50 p-6 rounded-xl shadow border-l-4 border-blue-500 min-h-[120px]">
            <h2 class="text-lg font-semibold text-blue-700 mb-2">💡 Today's Motivation</h2>
            <blockquote class="italic text-gray-700 transition-all">{{ currentMotivation }}</blockquote>
          </div>
        </transition>

        <!-- FACT -->
        <transition name="fade-slide" mode="out-in">
          <div key="fact" class="bg-amber-50 p-6 rounded-xl shadow border-l-4 border-amber-500 min-h-[120px]">
            <h2 class="text-lg font-semibold text-amber-700 mb-2">📚 Academic Fun Fact</h2>
            <p class="text-gray-700 transition-all">{{ currentFact }}</p>
          </div>
        </transition>
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

// --- GREETING BASED ON TIME ---
const greeting = ref('Welcome');
const setGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) greeting.value = 'Good Morning';
  else if (hour < 18) greeting.value = 'Good Afternoon';
  else greeting.value = 'Good Evening';
};

// --- INIT ---
onMounted(async () => {
  await fetchStudentInfo();
  setGreeting();
  setInterval(rotateContent, 8000);
});
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>