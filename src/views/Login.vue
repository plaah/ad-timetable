<script setup>
import { ref } from "vue";
import AuthApi from "@/api/AuthApi";

const login = ref("");
const password = ref("");
const sessionId = ref("");
const isLoading = ref(false);
const errorMessage = ref("");

// Instantiate the AuthApi class
const authApi = new AuthApi();

// HANDLE LOGIN
const handleLogin = async () => {
  errorMessage.value = "";
  try {
    isLoading.value = true;
    const data = await authApi.login(login.value, password.value);

    if (data?.[0]?.session_id) {
      alert("Login successful!");
      localStorage.setItem("web.fc.utm.my_usersession", JSON.stringify(data[0]));
      sessionId.value = data[0].session_id;
      window.location.replace("/main");
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
  <div class="login-body">
    <div class="container">
      <img src="/UTM-LOGO-FULL.png" alt="UTM Logo" class="utm-logo" />
      <h1>UTM</h1>
      <div class="timely">Timely</div>

      <form @submit.prevent="handleLogin">
        <input
          type="text"
          v-model="login"
          placeholder="Username"
          required
        />
        <input
          type="password"
          v-model="password"
          placeholder="Password"
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
</template>

<style scoped>
.login-body {
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.container {
  width: 100%;
  max-width: 400px;
  background-color: #fff;
  padding: 40px 30px;
  border-radius: 16px;
  box-shadow: 0 0 20px rgba(0,0,0,0.1);
  text-align: center;
}

.utm-logo {
  width: 90px;
  height: auto;
  margin-bottom: 10px;
}

h1 {
  margin: 5px 0;
  color: #7f1d1d;
}

.timely {
  font-size: 48px;
  font-weight: bold;
  color: #7f1d1d;
  text-shadow: 2px 2px 0 #000000;
  margin: 10px 0 30px;
}

input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 10px;
  border: 1px solid #ccc;
  background-color: #f5f5f9;
  font-weight: bold;
  font-size: 16px;
}

.forgot-password {
  text-align: right;
  margin-bottom: 25px;
  font-size: 13px;
}

.forgot-password a {
  color: navy;
  text-decoration: none;
  font-weight: bold;
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
}

.login-btn:hover:not(:disabled) {
  background-color: #7f2f2f;
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error {
  color: red;
  margin-top: 10px;
  font-size: 14px;
}

#loading {
  margin-top: 10px;
  font-size: 14px;
  color: #555;
}
</style>
