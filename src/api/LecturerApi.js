// src/api/LecturerApi.js

const TTMS_API = 'http://web.fc.utm.my/ttms/web_man_webservice_json.cgi';
const ADMIN_AUTH_API = 'http://web.fc.utm.my/ttms/auth-admin.php';

// Ambil sesi & semester aktif
export async function fetchCurrentSession() {
  const url = `${TTMS_API}?entity=sesisemester`;
  const response = await fetch(url);
  const data = await response.json();
  return Array.isArray(data) ? data[0] : data;
}

// Verifikasi session ID admin
export async function fetchAdminSession(sessionId) {
  const url = `${ADMIN_AUTH_API}?session_id=${sessionId}`;
  const response = await fetch(url);
  const data = await response.json();
  return Array.isArray(data) ? data[0] : data;
}

// Ambil daftar dosen berdasarkan sesi dan semester
export async function fetchLecturers(sessionId, sesi, semester) {
  const url = `${TTMS_API}?entity=pensyarah&session_id=${sessionId}&sesi=${sesi}&semester=${semester}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

// Ambil daftar subjek & seksyen yang diampu dosen
export async function fetchLecturerSections(noPekerja) {
  const url = `${TTMS_API}?entity=pensyarah_subjek&no_pekerja=${noPekerja}`;
  const response = await fetch(url);

  if (!response.ok) {
    console.warn(`❌ Failed to fetch sections for ${noPekerja}`);
    return [];
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

// Ambil jadwal suatu subjek & seksyen
export async function fetchSchedule(kodSubjek, seksyen, sesi, semester) {
  const url = `${TTMS_API}?entity=jadual_subjek&kod_subjek=${kodSubjek}&seksyen=${seksyen}&sesi=${sesi}&semester=${semester}`;
  const response = await fetch(url);

  if (!response.ok) {
    console.warn(`❌ Failed to fetch schedule for ${kodSubjek} - ${seksyen}: HTTP ${response.status}`);
    return [];
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    console.warn(`⚠️ Schedule not in expected format for ${kodSubjek} - ${seksyen}`, data);
    return [];
  }

  return data;
}
