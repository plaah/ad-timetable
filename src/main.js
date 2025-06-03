import "./assets/main.css";

import { createApp } from "vue";
import StrangeApp from "./StrangeApp.vue";
import router from "./router";

createApp(StrangeApp).use(router).mount("#app");
