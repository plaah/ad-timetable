<template>
  <component :is="layoutComponent">
    <transition name="fade" mode="out-in">
      <router-view />
    </transition>
  </component>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import Toggle from "./components/Toggle.vue";

const route = useRoute();

const layoutComponent = computed(() =>
  route.path === "/login" ? "div" : Toggle
);
</script>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
