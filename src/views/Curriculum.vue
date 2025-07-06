<template>
  <div class="bg-gray-100 min-h-screen pt-20 font-[Segoe UI] text-[15px]">
    <!-- Top Bar -->
    <Toggle titleBanner="Curriculum" />

    <!-- Filters & Pagination -->
    <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-4 px-4 py-4 max-w-6xl mx-auto">
      <div class="w-full md:w-auto flex flex-wrap items-center gap-2 mb-2 md:mb-0">
        <label class="font-normal">Search:</label>
        <input
          v-model="searchTerm"
          placeholder="Search curriculum name or session..."
          class="border border-gray-400 rounded px-3 py-1 w-full md:w-72 shadow-sm"
        />
      </div>
    </div>

    <!-- Curriculum Cards -->
    <div v-if="loading" class="text-center text-gray-500 py-10">Loading...</div>
    <div v-else class="grid gap-4 px-4 py-4 max-w-6xl mx-auto grid-cols-1 md:grid-cols-2">
      <InfoCard
        v-for="(curr, index) in paginatedCurricula"
        :key="index"
        :icon="'📖'"
        :title="curr.name"
        :subtitle="`Session: ${curr.sesi} | Semester: ${curr.semester} | Year: ${curr.tahun}`"
        :badges="[
          { icon: '📚', text: `Core: ${getTerasCount(curr.id_kurikulum)}`, class: 'bg-red-50 text-red-800 border border-red-200' },
          { icon: '🎯', text: `Elective: ${getElektifCount(curr.id_kurikulum)}`, class: 'bg-blue-50 border border-blue-200' },
          { icon: '📊', text: `Total: ${getTotalCount(curr.id_kurikulum)}`, class: 'bg-gray-100 border border-gray-300' }
        ]"
        :actions="[{ label: 'View Details', onClick: () => openModal(curr) }]"
      />
      <div v-if="!loading && !paginatedCurricula.length" class="text-center text-gray-400 italic py-10 col-span-full">No curriculum found</div>
    </div>
    <!-- Pagination (always below, all devices) -->
    <div class="flex justify-center mt-2 mb-2 w-full gap-1">
      <button @click="gotoPage(1)" :disabled="currentPage === 1" :class="['px-2 py-1 border rounded font-semibold transition', currentPage === 1 ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed' : 'bg-white text-[#e11d48] border-[#e11d48] hover:bg-[#e11d48] hover:text-white']">&laquo;</button>
      <button @click="gotoPage(currentPage - 1)" :disabled="currentPage === 1" :class="['px-2 py-1 border rounded font-semibold transition', currentPage === 1 ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed' : 'bg-white text-[#e11d48] border-[#e11d48] hover:bg-[#e11d48] hover:text-white']">&lt;</button>
      <span class="mx-2 font-semibold">Page</span>
      <select
        v-model="currentPage"
        @change="gotoPage(Number(currentPage))"
        class="px-2 py-1 border rounded font-semibold text-[#e11d48] border-[#e11d48] bg-white hover:bg-[#fef2f2] transition"
        style="min-width: 48px;"
      >
        <option v-for="page in pageCount" :key="page" :value="page">{{ page }}</option>
      </select>
      <span class="mx-2 font-semibold">of {{ pageCount }}</span>
      <button @click="gotoPage(currentPage + 1)" :disabled="currentPage === pageCount" :class="['px-2 py-1 border rounded font-semibold transition', currentPage === pageCount ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed' : 'bg-white text-[#e11d48] border-[#e11d48] hover:bg-[#e11d48] hover:text-white']">&gt;</button>
      <button @click="gotoPage(pageCount)" :disabled="currentPage === pageCount" :class="['px-2 py-1 border rounded font-semibold transition', currentPage === pageCount ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed' : 'bg-white text-[#e11d48] border-[#e11d48] hover:bg-[#e11d48] hover:text-white']">&raquo;</button>
    </div>

    <!-- Curriculum Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
    >
      <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] relative flex flex-col">
        <button
          @click="closeModal"
          class="absolute top-2 right-3 text-lg bg-gray-200 rounded-full px-2 py-1 hover:bg-gray-300 z-10"
        >
          ✕
        </button>

        <h3 class="font-bold text-xl mb-2 pr-10">
          Subjects - {{ modalCurriculumName }}
        </h3>

        <div class="overflow-x-auto overflow-y-auto flex-1" style="max-height: 60vh">
          <table class="w-full mb-4 text-sm">
            <thead>
              <tr class="border-b sticky top-0 bg-white z-5">
                <th class="text-left p-2">Code</th>
                <th class="text-left p-2">Name</th>
                <th class="text-left p-2">Credit</th>
                <th class="text-left p-2">Year</th>
                <th class="text-left p-2">Semester</th>
                <th class="text-left p-2">Type</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="subject in modalSubjects"
                :key="subject.id_kurikulum_subjek"
                class="border-b"
              >
                <td class="p-2">{{ subject.kod_subjek }}</td>
                <td class="p-2">{{ subject.nama_subjek }}</td>
                <td class="p-2">{{ subject.kredit }}</td>
                <td class="p-2">{{ subject.tahun_ambil }}</td>
                <td class="p-2">{{ subject.semester_ambil }}</td>
                <td class="p-2">
                  <span v-if="subject.mod_elektif">Elective</span>
                  <span v-else>Core</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import Toggle from '@/components/Toggle.vue';
import CurriculumApi from '@/api/CurriculumApi';
import InfoCard from '@/components/InfoCard.vue';

const curricula = ref([]);
const curriculumSubjects = ref({});
const searchTerm = ref('');
const currentPage = ref(1);
const itemsPerPage = 6;

const modalSubjects = ref([]);
const showModal = ref(false);
const modalCurriculumName = ref('');
const loading = ref(true);

onMounted(async () => {
  const api = new CurriculumApi();
  const sesiList = await api.getCurricula();

  const cohortArrays = await Promise.all(
    sesiList.map(item =>
      api.getCohort(item.sesi_masuk).then(result => {
        if (Array.isArray(result)) {
          return result
            .filter(cohort => cohort.nama_kurikulum && cohort.id_kurikulum)
            .map(cohort => ({
              name: cohort.nama_kurikulum,
              sesi: cohort.sesi_masuk,
              semester: cohort.semester_masuk,
              tahun: cohort.tahun_masuk,
              id_kurikulum: cohort.id_kurikulum
            }));
        } else {
          return [];
        }
      })
    )
  );
  curricula.value = cohortArrays.flat();

  for (const curr of curricula.value) {
    const subjects = await api.getSubjects(curr.id_kurikulum);
    curriculumSubjects.value[curr.id_kurikulum] = Array.isArray(subjects) ? subjects : [subjects];
  }
  loading.value = false;
});

const filteredCurricula = computed(() => {
  return curricula.value.filter(item => {
    return (
      item.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      item.sesi?.toLowerCase().includes(searchTerm.value.toLowerCase())
    );
  });
});

const paginatedCurricula = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredCurricula.value.slice(start, start + itemsPerPage);
});

const pageCount = computed(() => {
  return Math.ceil(filteredCurricula.value.length / itemsPerPage) || 1;
});

function gotoPage(page) {
  if (page < 1) page = 1;
  if (page > pageCount.value) page = pageCount.value;
  currentPage.value = page;
}

watch(searchTerm, () => {
  currentPage.value = 1;
});

function getTerasCount(id) {
  return (curriculumSubjects.value[id] || []).filter(s => !s.mod_elektif).length;
}
function getElektifCount(id) {
  return (curriculumSubjects.value[id] || []).filter(s => s.mod_elektif).length;
}
function getTotalCount(id) {
  return (curriculumSubjects.value[id] || []).length;
}

function openModal(curriculum) {
  modalCurriculumName.value = curriculum.name;
  modalSubjects.value = curriculumSubjects.value[curriculum.id_kurikulum] || [];
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
}
</script>

<style scoped>
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 15px;
}
</style>