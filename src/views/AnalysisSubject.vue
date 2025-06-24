<template>
  <div class="p-4 mt-16">
    <Toggle titleBanner="Analysis Subject" />
    
    <!-- Header + Search + Pagination -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
      <h1 class="text-xl font-bold text-red-800 flex items-center gap-2">
        📊 Subject & Section Analysis
      </h1>

      <!-- Search -->
      <input
        v-model="searchTerm"
        type="text"
        placeholder="Search subject code, name, or lecturer..."
        class="px-3 py-2 border border-gray-300 rounded text-sm w-full md:w-72"
      />
    </div>

    <!-- Table -->
    <div class="overflow-x-auto bg-white rounded-xl shadow p-4">
      <table class="min-w-full text-sm text-left border border-gray-300">
        <thead class="bg-red-800 text-white text-sm">
          <tr>
            <th class="px-4 py-2 text-left">🔢 No.</th>
            <th class="px-4 py-2 text-left">📘 Subject Code</th>
            <th class="px-4 py-2 text-left">📖 Subject Name</th>
            <th class="px-4 py-2 text-left">📑 Section</th>
            <th class="px-4 py-2 text-left">👩‍🏫 Lecturer</th>
            <th class="px-4 py-2 text-left">🏛️ Faculty (Student)</th>
          </tr>
        </thead>
        <tbody v-if="paginatedSubjects.length > 0">
          <tr
            v-for="(subject, index) in paginatedSubjects"
            :key="`${subject.kod_subjek}-${subject.seksyen}-${index}`"
            :class="index % 2 === 0 ? 'bg-[#f5f5f5]' : ''"
            class="border-b border-gray-200 hover:bg-gray-100 text-sm"
          >
            <td class="px-4 py-2">{{ (currentPage - 1) * perPage + index + 1 }}</td>
            <td class="px-4 py-2">{{ subject.kod_subjek }}</td>
            <td class="px-4 py-2">{{ subject.nama_subjek }}</td>
            <td class="px-4 py-2">{{ subject.seksyen }}</td>
            <td class="px-4 py-2">{{ subject.pensyarah }}</td>
            <td class="px-4 py-2">{{ subject.fakulti }}</td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td colspan="6" class="text-center text-gray-500 py-4">
              Loading data...
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination Controls -->
    <div class="flex justify-center items-center gap-2 mt-4">
      <button class="px-2 py-1 border rounded disabled:opacity-50" :disabled="currentPage === 1" @click="currentPage = 1">
        «
      </button>
      <button class="px-2 py-1 border rounded disabled:opacity-50" :disabled="currentPage === 1" @click="currentPage--">
        ‹
      </button>

      <span class="text-sm">Page</span>
      <input
        v-model.number="currentPage"
        type="number"
        class="w-14 text-center border rounded px-2 py-1 text-sm"
        :min="1"
        :max="totalPages"
      />
      <span class="text-sm">of {{ totalPages }}</span>

      <button class="px-2 py-1 border rounded disabled:opacity-50" :disabled="currentPage === totalPages" @click="currentPage++">
        ›
      </button>
      <button class="px-2 py-1 border rounded disabled:opacity-50" :disabled="currentPage === totalPages" @click="currentPage = totalPages">
        »
      </button>
    </div>
  </div>
</template>

<script>
import {
  fetchCurrentSession,
  fetchSessionId,
  fetchSubjectSections,
} from "@/api/SubjectAnalysisApi";
import Toggle from "@/components/Toggle.vue";

export default {
  name: "AnalysisSubject",
  data() {
    return {
      subjects: [],
      currentPage: 1,
      perPage: 20,
      searchTerm: "",
    };
  },
  computed: {
    filteredSubjects() {
      const q = this.searchTerm.toLowerCase();
      return this.subjects.filter((s) =>
        s.kod_subjek.toLowerCase().includes(q) ||
        s.nama_subjek.toLowerCase().includes(q) ||
        s.pensyarah.toLowerCase().includes(q)
      );
    },
    paginatedSubjects() {
      const start = (this.currentPage - 1) * this.perPage;
      return this.filteredSubjects.slice(start, start + this.perPage);
    },
    totalPages() {
      return Math.max(1, Math.ceil(this.filteredSubjects.length / this.perPage));
    },
  },
  async mounted() {
    try {
      const { sesi, semester } = await fetchCurrentSession();
      const sessionId = await fetchSessionId();
      const rawSubjects = await fetchSubjectSections(sesi, semester);

      const flattened = [];
      rawSubjects.forEach((subject) => {
        const kod_subjek = subject.kod_subjek || "-";
        const nama_subjek = subject.nama_subjek || "-";

        if (Array.isArray(subject.seksyen_list)) {
          subject.seksyen_list.forEach((seksyen) => {
            flattened.push({
              kod_subjek,
              nama_subjek,
              seksyen: seksyen.seksyen || "-",
              pensyarah: seksyen.pensyarah || "-",
              fakulti: seksyen.fakulti || "FSKSM",
            });
          });
        }
      });

      this.subjects = flattened;
    } catch (error) {
      console.error("❌ Failed to load data:", error);
    }
  },
};
</script>

<style scoped>
table th,
table td {
  white-space: nowrap;
  font-size: 13px;
}
</style>
