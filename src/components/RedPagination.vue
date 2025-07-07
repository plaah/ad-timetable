<template>
  <nav class="red-pagination">
    <button
      class="page-btn"
      :disabled="currentPage === 1"
      @click="changePage(1)"
      aria-label="First"
    >
      &laquo;
    </button>
    <button
      class="page-btn"
      :disabled="currentPage === 1"
      @click="changePage(currentPage - 1)"
      aria-label="Previous"
    >
      &lsaquo;
    </button>
    <template v-for="page in visiblePages" :key="page">
      <button
        v-if="page !== 'ellipsis'"
        class="page-btn"
        :class="{ selected: page === currentPage }"
        @click="changePage(page)"
        :aria-current="page === currentPage ? 'page' : undefined"
      >
        {{ page }}
      </button>
      <span v-else class="ellipsis">...</span>
    </template>
    <button
      class="page-btn"
      :disabled="currentPage === pageCount"
      @click="changePage(currentPage + 1)"
      aria-label="Next"
    >
      &rsaquo;
    </button>
    <button
      class="page-btn"
      :disabled="currentPage === pageCount"
      @click="changePage(pageCount)"
      aria-label="Last"
    >
      &raquo;
    </button>
    <div class="page-size-dropdown">
      <select v-model.number="localPageSize" @change="changePageSize">
        <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }} / page</option>
      </select>
    </div>
  </nav>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
const props = defineProps({
  currentPage: { type: Number, required: true },
  pageCount: { type: Number, required: true },
  onPageChange: { type: Function, required: true },
  pageSize: { type: Number, required: true },
  onPageSizeChange: { type: Function, required: true },
  pageSizeOptions: { type: Array, default: () => [10, 20, 50, 100] },
});
const localPageSize = ref(props.pageSize);
watch(() => props.pageSize, (val) => { localPageSize.value = val; });
function changePage(page) {
  if (page !== props.currentPage && page >= 1 && page <= props.pageCount) {
    props.onPageChange(page);
  }
}
function changePageSize(e) {
  props.onPageSizeChange(Number(localPageSize.value));
}
const visiblePages = computed(() => {
  const pages = [];
  if (props.pageCount <= 7) {
    for (let i = 1; i <= props.pageCount; i++) pages.push(i);
  } else {
    if (props.currentPage <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push('ellipsis');
      pages.push(props.pageCount);
    } else if (props.currentPage >= props.pageCount - 3) {
      pages.push(1);
      pages.push('ellipsis');
      for (let i = props.pageCount - 4; i <= props.pageCount; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push('ellipsis');
      for (let i = props.currentPage - 1; i <= props.currentPage + 1; i++) pages.push(i);
      pages.push('ellipsis');
      pages.push(props.pageCount);
    }
  }
  return pages;
});
</script>

<style scoped>
.red-pagination {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(90deg, #fff 80%, #fff0f3 100%);
  box-shadow: 0 2px 12px 0 rgba(225, 29, 72, 0.08), 0 1.5px 6px 0 rgba(0,0,0,0.03);
  border-radius: 12px;
  padding: 0.7em 1.2em;
  font-family: 'Poppins', 'Segoe UI', Arial, sans-serif;
  font-size: 1rem;
  margin: 0.5em 0;
}
.page-btn {
  background: #fff;
  color: #e11d48;
  border: 2px solid transparent;
  border-radius: 8px;
  min-width: 2.3em;
  min-height: 2.3em;
  font-weight: 600;
  font-family: inherit;
  font-size: 1em;
  margin: 0 0.1em;
  box-shadow: 0 1px 4px 0 rgba(225, 29, 72, 0.04);
  transition: all 0.16s;
  cursor: pointer;
}
.page-btn.selected {
  border-color: #e11d48;
  background: #fff;
  color: #e11d48;
  box-shadow: 0 2px 8px 0 rgba(225, 29, 72, 0.10);
  z-index: 2;
}
.page-btn:not(:disabled):hover {
  background: #fff5f7;
  border-color: #fbb6ce;
}
.page-btn:disabled {
  background: #f3f4f6;
  color: #d1d5db;
  border-color: #e5e7eb;
  cursor: not-allowed;
}
.ellipsis {
  color: #e11d48;
  font-size: 1.2em;
  padding: 0 0.3em;
  user-select: none;
}
.page-size-dropdown {
  margin-left: 1.2em;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px 0 rgba(225, 29, 72, 0.04);
  padding: 0.2em 0.7em;
  display: flex;
  align-items: center;
}
.page-size-dropdown select {
  border: none;
  background: transparent;
  color: #e11d48;
  font-family: inherit;
  font-size: 1em;
  font-weight: 600;
  outline: none;
  padding: 0.2em 0.5em;
  border-radius: 6px;
  transition: background 0.15s;
}
.page-size-dropdown select:hover {
  background: #fff5f7;
}
@media (max-width: 600px) {
  .red-pagination {
    flex-wrap: wrap;
    font-size: 0.97em;
    padding: 0.5em 0.5em;
    gap: 0.3rem;
  }
  .page-size-dropdown {
    margin-left: 0.5em;
    padding: 0.1em 0.3em;
  }
}
</style> 