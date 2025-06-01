<template>
  <div class="container">
    <img src="https://upload.wikimedia.org/wikipedia/en/1/1f/UTM-LOGO.png" alt="UTM Logo" class="utm-logo" />
    <h1>UTM</h1>
    <p style="margin-top: -10px;">Universiti Teknologi Malaysia</p>
    <div class="timely">TIMELY</div>

    <input type="text" v-model="utmId" placeholder="UTM ID" style="text-transform: uppercase;" @input="utmId = utmId.toUpperCase()" />
    <input type="password" v-model="password" placeholder="PASSWORD" />

    <div class="forgot-password">
      <a href="#">forget your password?</a>
    </div>

    <button class="login-btn" @click="login">LOG IN</button>

    <div class="error" v-if="error">{{ error }}</div>
    <div v-if="loading" style="margin-top:10px; font-size:14px; color:#555;">Authenticating...</div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { userName, userMatric } from '../constants/ApiConstants';
import AuthApi from '../api/AuthenticationApi';

export default {
  setup() {
    const utmId = ref('');
    const password = ref('');
    const error = ref('');
    const loading = ref(false);
    const router = useRouter();
    const authApi = new AuthApi();

    const login = async () => {
      error.value = '';
      loading.value = true;

      if (!utmId.value || !password.value) {
        error.value = 'Please enter both UTM ID and Password.';
        loading.value = false;
        return;
      }

      try {
        const response = await authApi.login(utmId.value, password.value);

        if (response.success) {
          userName.value = response.fullName;
          userMatric.value = utmId.value;
          localStorage.setItem('utm_session_id', response.sessionId);
          router.push(response.role === 'student' ? '/dashboard-student' : '/dashboard-lecture');
        } else {
          error.value = 'Invalid UTM ID or Password.';
        }
      } catch (error) {
        error.value = 'Invalid UTM ID or Password.';
      }

      loading.value = false;
    };

    return { utmId, password, error, loading, login };
  },
};
</script>

<style scoped>
body {
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