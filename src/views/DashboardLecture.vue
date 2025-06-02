<template>
  <div>
    <h1>Lecture Dashboard</h1>
    <p>Welcome, {{ userName }}!</p>
  </div>
</template>

<script>
import { userName } from '../constants/ApiConstants';

export default {
  setup() {
    return { userName };
  },
};
</script>