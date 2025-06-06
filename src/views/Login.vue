<script setup>
import { ref, onBeforeMount } from "vue";
import { useRouter } from "vue-router";
import AuthApi from "@/api/AuthApi";

const login = ref("");
const password = ref("");
const sessionId = ref("");
const isLoading = ref(false);
const errorMessage = ref("");
const isReady = ref(false);

const router = useRouter();
const authApi = new AuthApi();

// Cek apakah user sudah login sebelum menampilkan halaman login
onBeforeMount(() => {
  const session = localStorage.getItem("web.fc.utm.my_usersession");
  if (session) {
    router.push("/home");
  } else {
    isReady.value = true;
  }
});

const handleLogin = async () => {
  errorMessage.value = "";
  try {
    isLoading.value = true;
    const data = await authApi.login(login.value, password.value);

    if (data?.[0]?.session_id) {
      localStorage.setItem("web.fc.utm.my_usersession", JSON.stringify(data[0]));
      sessionId.value = data[0].session_id;
      alert(`Login berhasil. Selamat datang, ${data[0].full_name}`);
      router.push("/home");
    } else {
      errorMessage.value = "Invalid login response!";
      console.log("Response:", data);
    }
  } catch (error) {
    errorMessage.value = "Invalid credentials or failed to fetch!";
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <transition name="fade-slide">
    <div class="login-body" v-if="isReady">
      <div class="container">
        <img src="/UTM-LOGO-FULL.png" alt="UTM Logo" class="utm-logo" />

        <div class="timely">Timely</div>

        <form @submit.prevent="handleLogin">
          <input
            type="text"
            v-model="login"
            placeholder="Username"
            :class="{ filled: login.length > 0 }"
            required
          />
          <input
            type="password"
            v-model="password"
            placeholder="Password"
            :class="{ filled: password.length > 0 }"
            required
          />

          <div class="forgot-password">
            <a href="#">Forgot password?</a>
          </div>

          <button type="submit" class="login-btn" :disabled="isLoading">
            {{ isLoading ? "Signing in..." : "Login" }}
          </button>

          <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
          <div v-if="isLoading" id="loading">Please wait...</div>
        </form>
      </div>
    </div>
  </transition>
</template>

<style scoped>
/* Transisi */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.login-body {
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #fafafa;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.container {
  width: 100%;
  max-width: 420px;
  background-color: #ffffff;
  padding: 40px 32px;
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: all 0.3s ease;
}

.container:hover {
  transform: translateY(-2px);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.12);
}

.utm-logo {
  display: block;
  margin: 0 auto 10px;
  max-width: 180px;
  height: auto;
}

.timely {
  font-size: 40px;
  font-weight: 800;
  color: #7f1d1d;
  margin-bottom: 30px;
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.1);
}

input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 14px;
  margin-bottom: 16px;
  border-radius: 10px;
  border: 1.5px solid #ccc;
  background-color: #f5f5f9;
  font-size: 15px;
  transition: 0.3s;
  font-weight: 500;
}

input.filled {
  border-color: #ba5757;
  background-color: #fcf1f1;
  box-shadow: 0 0 0 2px rgba(186, 87, 87, 0.2);
  color: #111;
}

input[type="text"]:focus,
input[type="password"]:focus {
  outline: none;
  border-color: #933b3b;
  box-shadow: 0 0 0 3px rgba(147, 59, 59, 0.1);
}

input:-webkit-autofill {
  box-shadow: 0 0 0 1000px #fcf1f1 inset !important;
  -webkit-text-fill-color: #111 !important;
  border-color: #ba5757 !important;
}

.forgot-password {
  text-align: right;
  margin-bottom: 24px;
  font-size: 13px;
}

.forgot-password a {
  color: #2c3e50;
  text-decoration: none;
  font-weight: 600;
}

.login-btn {
  background-color: #933b3b;
  color: white;
  padding: 14px;
  width: 100%;
  border: none;
  border-radius: 10px;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.25s ease;
}

.login-btn:hover:not(:disabled) {
  background-color: #7f2f2f;
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error {
  color: #d63031;
  margin-top: 15px;
  font-size: 14px;
  font-weight: bold;
}

#loading {
  margin-top: 10px;
  font-size: 14px;
  color: #555;
  font-style: italic;
}
</style>
