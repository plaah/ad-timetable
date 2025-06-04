import "./assets/main.css";

import { createApp } from "vue";
import StrangeApp from "./StrangeApp.vue";
import router from "./router";
import './assets/styles/global.css';

createApp(StrangeApp).use(router).mount("#app");
