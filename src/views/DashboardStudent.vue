<template>
  <div>
    <h1>Student Dashboard</h1>
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