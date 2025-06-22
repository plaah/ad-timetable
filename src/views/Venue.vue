<script setup>
import { ref, watch, onMounted, computed } from "vue";
import Toggle from "@/components/Toggle.vue";
import VenueApi from "@/api/VenueApi";
import VenueScheduleModal from "@/components/VenueScheduleModal.vue";
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
    <div class="flex flex-col md:flex-row justify-between items-center gap-4 px-4 py-4 max-w-6xl mx-auto">
      <div class="flex flex-wrap items-center gap-2">
        <label class="font-normal">Faculty:</label>
        <select v-model="selectedFaculty" class="border border-gray-400 rounded px-2 py-1 shadow-sm">
          <option value="FSKSM">FSKSM</option>
          <option value="FKE">FKE</option>
          <option value="FABU">FABU</option>
        </select>

        <input
          v-model="searchQuery"
          placeholder="Search by room code or name..."
          class="border border-gray-400 rounded px-3 py-1 w-72 shadow-sm"
        />
      </div>

      <div class="flex items-center gap-1 text-sm font-[Segoe UI]">
        <button @click="setPage(1)" :disabled="currentPage === 1" class="px-2 py-1 border rounded">&laquo;</button>
        <button @click="setPage(currentPage - 1)" :disabled="currentPage === 1" class="px-2 py-1 border rounded">&lt;</button>
        <span>Page</span>
        <select v-model="currentPage" @change="setPage(Number(currentPage))" class="px-2 py-1 border rounded">
          <option v-for="page in totalPages" :key="page" :value="page">{{ page }}</option>
        </select>
        <span>of {{ totalPages }}</span>
        <button @click="setPage(currentPage + 1)" :disabled="currentPage === totalPages" class="px-2 py-1 border rounded">&gt;</button>
        <button @click="setPage(totalPages)" :disabled="currentPage === totalPages" class="px-2 py-1 border rounded">&raquo;</button>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="text-red-600 text-center mt-2 text-sm">
      {{ error }}
    </div>

    <!-- Room Cards -->
    <div class="grid gap-4 px-4 py-4 max-w-6xl mx-auto grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
      <div
        v-for="(room, index) in paginatedRooms"
        :key="index"
        class="bg-white border border-red-200 hover:shadow-md rounded-xl transition p-4 space-y-2 cursor-pointer"
        @click="openModal(room)"
      >
        <div class="flex justify-between items-start">
          <div class="flex items-center gap-2">
            <span class="text-lg">🏷️</span>
            <div class="text-lg font-semibold text-red-700">{{ room.code }}</div>
          </div>
        </div>

        <div class="font-medium text-gray-800">
          {{ room.name }}
          <span v-if="room.shortName && room.shortName !== room.name" class="text-sm text-gray-500">
            ({{ room.shortName }})
          </span>
        </div>

        <div class="flex gap-3 mt-3 text-sm text-gray-600 flex-wrap">
          <div class="flex items-center gap-1 bg-red-50 px-2 py-1 rounded text-red-800 border border-red-200">
            <span class="text-lg">🎓</span>
            {{ room.faculty || 'Unknown' }}
          </div>

          <div class="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded border border-gray-300">
            <span class="text-lg">🏢</span>
            {{ room.type || 'Room' }}
          </div>

          <div class="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded border border-blue-200">
            <span class="text-lg">👥</span>
            Capacity: {{ room.capacity || 'N/A' }}
          </div>
        </div>
      </div>
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