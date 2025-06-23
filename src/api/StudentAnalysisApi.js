// src/api/StudentAnalysisApi.js

const TTMS_API = "http://web.fc.utm.my/ttms/web_man_webservice_json.cgi";

export async function fetchCurrentSession() {
  const res = await fetch(`${TTMS_API}?entity=sesisemester`);
  const data = await res.json();
  return Array.isArray(data) ? data[0] : data;
}

export async function fetchSessionId() {
  const login = "12085";
  const password = "S808323";
  const res = await fetch(`${TTMS_API}?entity=authentication&login=${login}&password=${password}`);
  const data = await res.json();
  return data[0]?.session_id;
}

export async function fetchSubjectSections(sesi, semester) {
  const url = `${TTMS_API}?entity=subjek_seksyen&sesi=${encodeURIComponent(sesi)}&semester=${semester}`;
  const res = await fetch(url);
  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("❌ Response subjek_seksyen bukan JSON:", text.slice(0, 300));
    return [];
  }
}

export async function fetchSubjectStudentCount(sessionId, kod_subjek, seksyen, sesi, semester) {
  const url = `${TTMS_API}?entity=subjek_pelajar&session_id=${sessionId}&sesi=${encodeURIComponent(
    sesi
  )}&semester=${semester}&kod_subjek=${encodeURIComponent(
    kod_subjek.trim()
  )}&seksyen=${seksyen}`;

  try {
    const res = await fetch(url);
    const contentType = res.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      const text = await res.text();
      console.warn(`⚠️ Tidak valid JSON untuk ${kod_subjek} seksyen ${seksyen}:`, text.slice(0, 300), `\nURL: ${url}`);
      return 0;
    }

    const data = await res.json();
    return Array.isArray(data) ? data.length : 0;
  } catch (error) {
    console.error(`❌ Gagal fetch subjek_pelajar ${kod_subjek} seksyen ${seksyen}:`, error);
    return 0;
  }
}
