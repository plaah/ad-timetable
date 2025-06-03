<script setup>
import IconLibrary from "@/constants/IconLibrary.js";

const props = defineProps({
    name: String,
    customclass: {
        type: String,
        default: "",
    },
});

const iconSvg = IconLibrary[props.name] || "";
</script>

<template>
    <span v-if="iconSvg" v-html="iconSvg" :class="customclass" />
    <!-- ignore error -->
</template>