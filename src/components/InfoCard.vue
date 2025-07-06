<template>
  <div
    class="info-card group"
    @click="onCardClick"
  >
    <div class="flex justify-between items-start">
      <div class="flex items-center gap-2">
        <span v-if="icon" class="text-xl md:text-2xl">{{ icon }}</span>
        <span class="font-semibold text-lg md:text-xl text-red-700 leading-tight">{{ title }}</span>
      </div>
      <div v-if="actions && actions.length" class="flex gap-2">
        <button
          v-for="(action, idx) in actions"
          :key="idx"
          class="action-btn"
          @click.stop="action.onClick"
        >
          {{ action.label }}
        </button>
      </div>
    </div>
    <div v-if="subtitle" class="text-gray-800 font-medium text-base md:text-lg mt-1">{{ subtitle }}</div>
    <div v-if="details && details.length" class="flex flex-col gap-1 mt-1">
      <div v-for="(detail, idx) in details" :key="idx" class="text-sm text-gray-700 flex items-center">
        <span v-if="detail.icon" class="mr-1">{{ detail.icon }}</span>{{ detail.text }}
      </div>
    </div>
    <div v-if="badges && badges.length" class="flex flex-wrap gap-2 mt-2 text-sm">
      <span
        v-for="(badge, idx) in badges"
        :key="idx"
        :class="badge.class || 'badge-default'"
        class="badge"
      >
        <span v-if="badge.icon">{{ badge.icon }}</span>{{ badge.text }}
      </span>
    </div>
    <slot />
    <div class="mt-2">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: String,
  subtitle: String,
  icon: String,
  details: Array, // [{ icon, text }]
  badges: Array, // [{ icon, text, class }]
  actions: Array, // [{ label, onClick }]
  onCardClick: Function,
});
</script>

<style scoped>
.info-card {
  background: linear-gradient(135deg, #fff 70%, #f8fafc 100%);
  border: 1.5px solid #e5e7eb;
  border-radius: 1.1rem;
  box-shadow: 0 2px 8px 0 rgba(200, 0, 0, 0.04), 0 1.5px 6px 0 rgba(0,0,0,0.03);
  padding: 1.25rem;
  transition: box-shadow 0.22s, transform 0.18s, border 0.18s;
  cursor: pointer;
  font-family: 'Segoe UI', 'Inter', 'Roboto', Arial, sans-serif;
  min-height: 120px;
  position: relative;
}
.info-card:hover, .info-card:focus, .info-card:active, .info-card.group:hover {
  box-shadow: 0 8px 32px 0 rgba(200, 0, 0, 0.10), 0 4px 16px 0 rgba(0,0,0,0.07);
  border-color: #e11d48;
  transform: translateY(-2px) scale(1.012);
  z-index: 2;
}
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3em;
  font-weight: 500;
  border-radius: 0.7em;
  padding: 0.25em 0.8em;
  border-width: 1.5px;
  box-shadow: 0 1px 2px 0 rgba(0,0,0,0.03);
  letter-spacing: 0.01em;
  transition: background 0.18s, color 0.18s, border 0.18s;
}
.badge-default {
  background: #f3f4f6;
  color: #374151;
  border: 1.5px solid #d1d5db;
}
.action-btn {
  background: #f3f4f6;
  color: #e11d48;
  border: 1.5px solid #e5e7eb;
  border-radius: 0.5em;
  padding: 0.25em 0.9em;
  font-size: 0.97em;
  font-weight: 600;
  transition: background 0.18s, color 0.18s, border 0.18s;
  box-shadow: 0 1px 2px 0 rgba(0,0,0,0.03);
  white-space: nowrap;
  min-width: 120px;
  text-align: center;
  display: inline-block;
}
.action-btn:hover, .action-btn:focus {
  background: #e11d48;
  color: #fff;
  border-color: #e11d48;
}
@media (max-width: 600px) {
  .info-card {
    padding: 0.9rem 0.7rem;
    min-height: 90px;
  }
  .badge {
    font-size: 0.93em;
    padding: 0.18em 0.6em;
  }
  .action-btn {
    min-width: 110px;
    width: auto;
    font-size: 0.97em;
    padding: 0.25em 0.7em;
    margin-top: 0.5em;
    white-space: nowrap;
    display: inline-block;
  }
}
</style> 