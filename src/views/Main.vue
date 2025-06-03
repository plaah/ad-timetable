<template>
  <div id="app">
    <header class="header">
      <h1>Dashboard</h1>
      <div class="burger" @click="toggleSidebar">☰</div>
    </header>

    <nav class="nav-tabs">
      <a href="#" class="tab active" @click.prevent="setActiveTab('home')">Home</a>
      <a href="#" class="tab" @click.prevent="setActiveTab('timetable')">Timetable</a>
    </nav>

    <div class="search-container">
      <input type="text" placeholder="Search" class="search-input" />
    </div>

    <main class="main">
      <section class="timetable">
        <h2>Timetable</h2>
        <div class="cards">
          <div
            v-for="(timetableItem, index) in timetable"
            :key="index"
            class="card"
            :style="{ backgroundColor: timetableItem.bgColor }"
          >
            <h3>{{ timetableItem.title }}</h3>
            <p>{{ timetableItem.course }}</p>
            <p>{{ timetableItem.lecturer }}</p>
          </div>
        </div>
      </section>

      <aside class="notifications">
        <h2>Notification</h2>
        <ul>
          <li v-for="(notification, index) in notifications" :key="index">
            <strong>{{ notification.date }}</strong>
            <span v-if="notification.label" class="label">{{ notification.label }}</span>
            {{ notification.message }}
          </li>
        </ul>
      </aside>
    </main>

    <div class="sidebar-overlay" v-if="sidebarOpen" @click="closeSidebar"></div>

    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <div class="profile">
        <h2>Student</h2>
        <p>Matric: A12345678</p>
      </div>
      <ul>
        <li><a href="#">Profile</a></li>
        <li><a href="#">Dashboard</a></li>
        <li><a href="#">Settings</a></li>
        <li><a href="#" @click.prevent="logout">Logout</a></li>
      </ul>
    </aside>
  </div>
</template>

<script>
defineOptions({
  name: 'PageMain'
})
export default {
  data() {
    return {
      activeTab: 'home',
      sidebarOpen: false,
      timetable: [
        {
          title: 'ProdMNG 2021 EA',
          course: 'SMO 201 EA',
          lecturer: 'HONG Jisoo',
          bgColor: '#cce6f6'
        },
        {
          title: 'Spanish 2 OB',
          course: 'LNG 215 OD',
          lecturer: 'CHWE Vernon',
          bgColor: '#fff2c6'
        },
        {
          title: 'Japanese Pre-advanced',
          course: 'LNG 302 DC',
          lecturer: 'JEON Wonwoo',
          bgColor: '#fbd6dc'
        }
      ],
      notifications: [
        {
          date: '07/07 (Wed)',
          label: 'New',
          message: 'ProdMNG - Submission completed'
        },
        {
          date: '07/07 (Tue)',
          label: 'New',
          message: 'Global Management - new course published'
        },
        {
          date: '07/06 (Tue)',
          label: '',
          message: 'Submission closed'
        },
        {
          date: '07/05 (Mon)',
          label: '[Important]',
          message: 'Tuition for Fall Sem'
        },
        {
          date: '07/05 (Mon)',
          label: '',
          message: 'Have you finished your MFA settings?'
        }
      ]
    };
  },
  methods: {
    setActiveTab(tab) {
      this.activeTab = tab;
    },
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen;
    },
    closeSidebar() {
      this.sidebarOpen = false;
    },
    logout() {
      // Logic to handle logout
      console.log('Logout');
      this.sidebarOpen = false;
    }
  }
};
</script>

<style scoped>
body {
  font-family: Arial, sans-serif;
  margin: 0;
  background-color: #f9f9f9;
}

.header {
  background-color: #1e2a4a;
  color: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.burger {
  font-size: 24px;
  cursor: pointer;
}

.nav-tabs {
  display: flex;
  background: #fff;
  border-bottom: 1px solid #ddd;
  padding: 10px 20px;
}

.tab {
  padding: 10px 20px;
  text-decoration: none;
  color: #333;
  margin-right: 10px;
}

.tab.active {
  color: #7f1d1d;
  border-bottom: 3px solid #7f1d1d;
  font-weight: bold;
}

.search-container {
  padding: 20px;
}

.search-input {
  padding: 8px 12px;
  width: 100%;
  max-width: 400px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.main {
  display: flex;
  justify-content: space-between;
  padding: 20px;
}

.sidebar {
  width: 250px;
  background-color: #1e2a4a;
  color: white;
  padding: 20px;
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  transition: transform 0.3s ease;
  transform: translateX(-100%);
  z-index: 1000;
}

.sidebar.open {
  transform: translateX(0);
}

.sidebar .profile {
  margin-bottom: 20px;
}

.sidebar ul {
  list-style: none;
  padding: 0;
}

.sidebar li {
  margin-bottom: 10px;
}

.sidebar a {
  color: white;
  text-decoration: none;
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: none;
  z-index: 500;
}

.sidebar-overlay.active {
  display: block;
}

.timetable {
  width: 70%;
}

.notifications {
  width: 30%;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.cards {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.card {
  background-color: #e9f1fc;
  border-radius: 12px;
  padding: 20px;
  flex: 1 1 calc(33.333% - 16px);
  box-sizing: border-box;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  margin-bottom: 16px;
}

.card h3 {
  margin: 0 0 6px 0;
  color: #1e2a4a;
  font-weight: 700;
}

.card p {
  margin: 2px 0;
  font-size: 0.95rem;
  color: #444;
  font-weight: 500;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  border-bottom: 1px dotted #aaa;
  padding: 8px 0;
}

.label {
  color: #7f1d1d;
  font-weight: bold;
  margin-left: 5px;
}
</style>