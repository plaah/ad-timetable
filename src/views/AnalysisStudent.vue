<template>
  <div class="p-4 mt-16">
    <Toggle titleBanner="Student Analysis" />
    
    <!-- Header + Search + Pagination -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
      <h1 class="text-xl font-bold text-red-800 flex items-center gap-2">
        👥 Student Schedule Analysis by Subject & Section
      </h1>

      <input
        v-model="searchTerm"
        type="text"
        placeholder="Search subject code/name or lecturer..."
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
            <th class="px-4 py-2 text-left">👥 Student Count</th>
          </tr>
        </thead>
        <tbody v-if="paginatedData.length">
          <tr
            v-for="(item, index) in paginatedData"
            :key="`${item.kod_subjek}-${item.seksyen}-${index}`"
            :class="index % 2 === 0 ? 'bg-[#f5f5f5]' : ''"
            class="border-b border-gray-200 hover:bg-gray-100 text-sm"
          >
            <td class="px-4 py-2">{{ (currentPage - 1) * perPage + index + 1 }}</td>
            <td class="px-4 py-2 text-red-700 font-semibold">{{ item.kod_subjek }}</td>
            <td class="px-4 py-2">{{ item.nama_subjek }}</td>
            <td class="px-4 py-2">{{ item.seksyen }}</td>
            <td class="px-4 py-2">{{ item.pensyarah }}</td>
            <td class="px-4 py-2 text-blue-700 font-medium">{{ item.bil_pelajar }}</td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td colspan="6" class="text-center py-4 text-gray-400">Loading data...</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex justify-center items-center gap-2 mt-4">
      <button class="px-2 py-1 border rounded disabled:opacity-50" :disabled="currentPage === 1" @click="currentPage = 1">«</button>
      <button class="px-2 py-1 border rounded disabled:opacity-50" :disabled="currentPage === 1" @click="currentPage--">‹</button>
      <span class="text-sm">Page</span>
      <input v-model.number="currentPage" type="number" class="w-14 text-center border rounded px-2 py-1 text-sm" :min="1" :max="totalPages" />
      <span class="text-sm">of {{ totalPages }}</span>
      <button class="px-2 py-1 border rounded disabled:opacity-50" :disabled="currentPage === totalPages" @click="currentPage++">›</button>
      <button class="px-2 py-1 border rounded disabled:opacity-50" :disabled="currentPage === totalPages" @click="currentPage = totalPages">»</button>
    </div>
  </div>
</template>

<script>
import {
  fetchCurrentSession,
  fetchSubjectSections,
} from "@/api/StudentAnalysisApi";
import Toggle from "@/components/Toggle.vue";

export default {
  name: "AnalysisStudent",
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
      const term = this.searchTerm.toLowerCase();
      return this.subjects.filter((item) =>
        item.kod_subjek.toLowerCase().includes(term) ||
        item.nama_subjek.toLowerCase().includes(term) ||
        item.pensyarah.toLowerCase().includes(term)
      );
    },
    paginatedData() {
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
      const rawSubjects = await fetchSubjectSections(sesi, semester);
      const flattened = [];

      rawSubjects.forEach((subject) => {
        const kod_subjek = subject.kod_subjek || "-";
        const nama_subjek = subject.nama_subjek || "-";

        if (Array.isArray(subject.seksyen_list)) {
          subject.seksyen_list.forEach((seksyen) => {
            flattened.push({
              kod_subjek: kod_subjek.trim(),
              nama_subjek,
              seksyen: `${seksyen.seksyen || "-"}`,
              pensyarah: seksyen.pensyarah || "-",
              bil_pelajar: seksyen.bil_pelajar ?? 0,
            });
          });
        }
      });

      this.subjects = flattened;
      console.log("✅ All bil_pelajar loaded from seksyen_list.");
    } catch (error) {
      console.error("❌ Failed to load student analysis data:", error);
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
