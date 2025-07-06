<script setup>
import { ref, watch, onMounted, computed } from "vue";
import Toggle from "@/components/Toggle.vue";
import VenueApi from "@/api/VenueApi";
import VenueScheduleModal from "@/components/VenueScheduleModal.vue";
import InfoCard from "@/components/InfoCard.vue";
import { userName, userMatric } from "@/constants/ApiConstants.js";

// Load user session if available
const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
  userName.value = lsData.full_name;
  userMatric.value = lsData.login_name;
}

const venueApi = new VenueApi();
const selectedFaculty = ref("FSKSM");
const rooms = ref([]);
const error = ref(null);
const currentPage = ref(1);
const itemsPerPage = 10;
const searchQuery = ref("");

// Modal state
const showModal = ref(false);
const selectedRoom = ref(null);

// Normalize room object
const formatRoomData = (room) => ({
  code: room.kod_ruang,
  name: room.nama_ruang,
  shortName: room.nama_ruang_singkatan,
  faculty: `${room.kod_fakulti} / ${room.kod_jabatan}`,
  type: room.jenis,
  capacity: room.kapasiti,
});

// Fetch room data by faculty
const fetchRooms = async () => {
  try {
    error.value = null;
    currentPage.value = 1;
    const data = await venueApi.getRoomsByFaculty(selectedFaculty.value);
    rooms.value = Array.isArray(data) ? data.map(formatRoomData) : [formatRoomData(data)];
  } catch (err) {
    error.value = "Failed to load room data.";
    rooms.value = [];
  }
};

watch([selectedFaculty], fetchRooms);
watch([searchQuery], () => (currentPage.value = 1));
onMounted(fetchRooms);

// Filtered and paginated room list
const filteredRooms = computed(() => {
  return rooms.value.filter((room) =>
    room.code.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    room.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const totalPages = computed(() => Math.ceil(filteredRooms.value.length / itemsPerPage));
const paginatedRooms = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredRooms.value.slice(start, start + itemsPerPage);
});

const setPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

// Show modal with selected room
function openModal(room) {
  selectedRoom.value = room;
  showModal.value = true;
}
</script>

<template>
  <div class="bg-gray-100 min-h-screen pt-20 font-[Segoe UI] text-[15px]">
    <Toggle titleBanner="Venue" />

    <!-- Filters & Pagination -->
    <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-4 px-4 py-4 max-w-6xl mx-auto">
      <div class="w-full md:w-auto flex flex-wrap items-center gap-2 mb-2 md:mb-0">
        <label class="font-normal">Faculty:</label>
        <select v-model="selectedFaculty" class="border border-gray-400 rounded px-2 py-1 shadow-sm">
          <option value="FSKSM">FSKSM</option>
          <option value="FKE">FKE</option>
          <option value="FABU">FABU</option>
        </select>
        <input
          v-model="searchQuery"
          placeholder="Search by room code or name..."
          class="border border-gray-400 rounded px-3 py-1 w-full md:w-72 shadow-sm"
        />
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="text-red-600 text-center mt-2 text-sm">
      {{ error }}
    </div>

    <!-- Room Cards -->
    <div v-if="loading" class="text-center text-gray-500 py-10">Loading...</div>
    <div v-else class="grid gap-4 px-4 py-4 max-w-6xl mx-auto grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
      <InfoCard
        v-for="(room, index) in paginatedRooms"
        :key="index"
        :icon="'🏷️'"
        :title="room.code"
        :subtitle="room.name + (room.shortName && room.shortName !== room.name ? ` (${room.shortName})` : '')"
        :badges="[
          { icon: '🎓', text: room.faculty || 'Unknown', class: 'bg-red-50 text-red-800 border border-red-200' },
          { icon: '🏢', text: room.type || 'Room', class: 'bg-gray-100 border border-gray-300' },
          { icon: '👥', text: `Capacity: ${room.capacity || 'N/A'}`, class: 'bg-blue-50 border border-blue-200' }
        ]"
        :actions="[{ label: 'View Schedule', onClick: () => openModal(room) }]"
      />
      <div v-if="!loading && !paginatedRooms.length" class="text-center text-gray-400 italic py-10 col-span-full">No venue found</div>
    </div>
    <!-- Pagination (always below, all devices) -->
    <div class="flex justify-center mt-2 mb-2 w-full gap-1">
      <button @click="setPage(1)" :disabled="currentPage === 1" :class="['px-2 py-1 border rounded font-semibold transition', currentPage === 1 ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed' : 'bg-white text-[#e11d48] border-[#e11d48] hover:bg-[#e11d48] hover:text-white']">&laquo;</button>
      <button @click="setPage(currentPage - 1)" :disabled="currentPage === 1" :class="['px-2 py-1 border rounded font-semibold transition', currentPage === 1 ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed' : 'bg-white text-[#e11d48] border-[#e11d48] hover:bg-[#e11d48] hover:text-white']">&lt;</button>
      <span class="mx-2 font-semibold">Page</span>
      <select
        v-model="currentPage"
        @change="setPage(Number(currentPage))"
        class="px-2 py-1 border rounded font-semibold text-[#e11d48] border-[#e11d48] bg-white hover:bg-[#fef2f2] transition"
        style="min-width: 48px;"
      >
        <option v-for="page in totalPages" :key="page" :value="page">{{ page }}</option>
      </select>
      <span class="mx-2 font-semibold">of {{ totalPages }}</span>
      <button @click="setPage(currentPage + 1)" :disabled="currentPage === totalPages" :class="['px-2 py-1 border rounded font-semibold transition', currentPage === totalPages ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed' : 'bg-white text-[#e11d48] border-[#e11d48] hover:bg-[#e11d48] hover:text-white']">&gt;</button>
      <button @click="setPage(totalPages)" :disabled="currentPage === totalPages" :class="['px-2 py-1 border rounded font-semibold transition', currentPage === totalPages ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed' : 'bg-white text-[#e11d48] border-[#e11d48] hover:bg-[#e11d48] hover:text-white']">&raquo;</button>
    </div>

    <!-- Modal -->
    <VenueScheduleModal
      v-if="showModal"
      :room="selectedRoom"
      :show="showModal"
      @update:show="showModal = $event"
    />

    <!-- Footer -->
    <p class="text-xs text-center mt-6 px-4 text-gray-600">
      If you have any comments or questions regarding this webpage, please contact
      <a href="mailto:ttms@fc.utm.my" class="text-red-600">ttms@fc.utm.my</a>.<br />
      Copyright &copy; 2002–2025, Faculty of Computing, UTM. All rights reserved.
    </p>
  </div>
</template>