import App from "./App.vue";
import { createApp, ref } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";
import Homepage from "./pages/Homepage.vue";
import Login from "./pages/Login.vue";
import Signup from "./pages/Signup.vue";
import Trips from "./pages/Trips.vue";
import Account from "./pages/Account.vue";
import Statistics from "./pages/Statistics.vue";
import "./style.css";

// Define your routes
const routes = [
  {
    path: "/",
    name: "Homepage",
    component: Homepage,
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/signup",
    name: "Signup",
    component: Signup,
  },
  {
    path: "/trips",
    name: "Trips",
    component: Trips,
  },
  {
    path: "/account",
    name: "Account",
    component: Account,
  },
  {
    path: "/statistics",
    name: "Statistics",
    component: Statistics,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

const app = createApp(App);

export const isLoggedIn = ref(false);

app.use(router);

app.mount("#app");
