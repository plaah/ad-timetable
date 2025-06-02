<template>
  <div class="container">
    <img src="/UTM-LOGO.png" alt="UTM Logo" class="utm-logo" />
    <h1>UTM</h1>
    <p style="margin-top: -10px;">Universiti Teknologi Malaysia</p>
    <div class="timely">TIMELY</div>

    <input
      type="text"
      v-model="utmId"
      placeholder="UTM ID"
      style="text-transform: uppercase"
      @input="utmId = utmId.toUpperCase()"
    />
    <input type="password" v-model="password" placeholder="PASSWORD" />

    <div class="forgot-password">
      <a href="#">forget your password?</a>
    </div>

    <button class="login-btn" @click="handleLogin">Login</button>

    <div class="error" v-if="error">{{ error }}</div>
    <div v-if="isLoading" style="margin-top:10px; font-size:14px; color:#555;">
      Authenticating...
    </div>
  </div>
</template>

<script setup>
console.log("Login Loaded . . . ");
import { ref } from "vue";
import AuthApi from "@/api/AuthenticationApi";
import { useRouter } from "vue-router";

const utmId = ref("");
const password = ref("");
const sessionId = ref("");
const isLoading = ref(false);
const error = ref("");
const router = useRouter();

const authApi = new AuthApi();

const handleLogin = async () => {
  error.value = "";
  try {
    isLoading.value = true;

    console.log("Sending login:", utmId.value, password.value);
    const data = await authApi.login(utmId.value, password.value);

    console.log("Received:", data);

    if (Array.isArray(data) && data[0]?.session_id) {
      alert("Login successful!");
      localStorage.setItem(
        "web.fc.utm.my_usersession",
        JSON.stringify(data[0])
      );
      sessionId.value = data[0].session_id;

      // 🔥 Tambahin redirect berdasarkan role
      const role = data[0]?.role?.toLowerCase();
      if (role === "student") {
        router.push("/dashboard-student");
      } else if (role === "lecture") {
        router.push("/dashboard-lecture");
      } else {
        router.push("/"); // fallback kalau role nggak ada
      }
    } else {
      error.value = "Invalid login response!";
      console.warn("Unexpected response format:", data);
    }
  } catch (err) {
    error.value = "Invalid credentials or failed to fetch!";
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};
</script>



<style scoped>
body {
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(180deg, #ff7e5f, #feb47b);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
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

.login-btn:hover {
  background-color: #7f2f2f;
}

.error {
  color: red;
  margin-top: 10px;
  font-size: 14px;
}

@media (max-width: 600px) {
  .container {
    padding: 30px 20px;
  }

  .timely {
    font-size: 36px;
  }

  input[type="text"],
  input[type="password"] {
    padding: 12px;
    font-size: 15px;
  }

  .login-btn {
    font-size: 15px;
  }

  .forgot-password {
    font-size: 12px;
  }
}
</style>