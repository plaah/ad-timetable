<script setup>
import { useRoute } from "vue-router";
import Toggle from "./components/Toggle.vue";

const route = useRoute();
</script>

<template>
  <component :is="route.path === '/login' ? 'div' : Toggle">
    <router-view />
  </component>
</template>
