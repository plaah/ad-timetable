// src/api/ClashLecturerApi.js

const TTMS_API = 'http://web.fc.utm.my/ttms/web_man_webservice_json.cgi';
const ADMIN_AUTH_API = 'http://web.fc.utm.my/ttms/auth-admin.php';

function getSessionId() {
  const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
  return lsData?.session_id || "";
}

async function fetchAdminSession(sessionId) {
  const url = `${ADMIN_AUTH_API}?session_id=${sessionId}`;
  const response = await fetch(url);
  const data = await response.json();
  return Array.isArray(data) ? data[0] : data;
}

async function fetchLecturers(sessionId, sesi, semester) {
  const url = `${TTMS_API}?entity=pensyarah&session_id=${sessionId}&sesi=${encodeURIComponent(sesi)}&semester=${semester}`;
  const response = await fetch(url);
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

async function fetchLecturerSections(sessionId, noPekerja) {
  const url = `${TTMS_API}?entity=pensyarah_subjek&session_id=${sessionId}&no_pekerja=${noPekerja}`;
  const response = await fetch(url);
  if (!response.ok) return [];
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

async function fetchSchedule(sessionId, kodSubjek, seksyen, sesi, semester) {
  const url = `${TTMS_API}?entity=jadual_subjek&session_id=${sessionId}&kod_subjek=${kodSubjek}&seksyen=${seksyen}&sesi=${encodeURIComponent(sesi)}&semester=${semester}`;
  const response = await fetch(url);
  if (!response.ok) return [];
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchLecturerClashes(sesi, semester) {
  const rawSessionId = getSessionId();
  const admin = await fetchAdminSession(rawSessionId);
  const sessionId = admin.session_id;
  const lecturers = await fetchLecturers(sessionId, sesi, semester);
  const results = [];

  const allSections = await Promise.all(
    lecturers.map((lecturer) => fetchLecturerSections(sessionId, lecturer.no_pekerja))
  );

  for (let i = 0; i < lecturers.length; i++) {
    const lecturer = lecturers[i];
    const sections = allSections[i];
    const sectionCount = sections.length;
    const slotMap = {};

    const allSchedules = await Promise.all(
      sections.map((section) => {
        const kod = section.kod_subjek || section.kodSubjek || section.kod_subjek_seksyen;
        const seksyen = section.seksyen || section.seksyen_subjek;
        if (!kod || !seksyen) return [];
        return fetchSchedule(sessionId, kod, seksyen, sesi, semester);
      })
    );

    sections.forEach((section, idx) => {
      const kod = section.kod_subjek || section.kodSubjek || section.kod_subjek_seksyen;
      const seksyen = section.seksyen || section.seksyen_subjek;
      const schedule = allSchedules[idx];

      schedule.forEach((slot) => {
        // Only process valid slot (must have hari and masa and not undefined/null)
        if (!slot || slot.hari == null || slot.masa == null) return;
        const key = `${slot.hari}-${slot.masa}`;
        const label = `${kod}-${seksyen}`;
        if (!slotMap[key]) slotMap[key] = [];
        slotMap[key].push(label);
      });
    });

    const conflicts = [];
    for (const key in slotMap) {
      if (slotMap[key].length > 1) {
        for (let i = 0; i < slotMap[key].length; i++) {
          for (let j = i + 1; j < slotMap[key].length; j++) {
            conflicts.push(`${slotMap[key][i]}:${slotMap[key][j]} (Slot ${key})`);
          }
        }
      }
    }

    results.push({
      name: lecturer.nama,
      sections: sectionCount,
      conflicts,
      suggestions: 0,
    });
  }

  return results;
}

export async function fetchLecturerClashBatch(sesi, semester, offset = 0, limit = 5) {
  const rawSessionId = getSessionId();
  const admin = await fetchAdminSession(rawSessionId);
  const sessionId = admin.session_id;
  const allLecturers = await fetchLecturers(sessionId, sesi, semester);
  const lecturers = allLecturers.slice(offset, offset + limit);

  const allSections = await Promise.all(
    lecturers.map((lecturer) => fetchLecturerSections(sessionId, lecturer.no_pekerja))
  );

  const results = [];
  for (let i = 0; i < lecturers.length; i++) {
    const lecturer = lecturers[i];
    const sections = allSections[i];
    const sectionCount = sections.length;
    const slotMap = {};

    const allSchedules = await Promise.all(
      sections.map((section) => {
        const kod = section.kod_subjek || section.kodSubjek || section.kod_subjek_seksyen;
        const seksyen = section.seksyen || section.seksyen_subjek;
        if (!kod || !seksyen) return [];
        return fetchSchedule(sessionId, kod, seksyen, sesi, semester);
      })
    );

    sections.forEach((section, idx) => {
      const kod = section.kod_subjek || section.kodSubjek || section.kod_subjek_seksyen;
      const seksyen = section.seksyen || section.seksyen_subjek;
      const schedule = allSchedules[idx];

      schedule.forEach((slot) => {
        // Only process valid slot (must have hari and masa and not undefined/null)
        if (!slot || slot.hari == null || slot.masa == null) return;
        const key = `${slot.hari}-${slot.masa}`;
        const label = `${kod}-${seksyen}`;
        if (!slotMap[key]) slotMap[key] = [];
        slotMap[key].push(label);
      });
    });

    const conflicts = [];
    for (const key in slotMap) {
      if (slotMap[key].length > 1) {
        for (let i = 0; i < slotMap[key].length; i++) {
          for (let j = i + 1; j < slotMap[key].length; j++) {
            conflicts.push(`${slotMap[key][i]}:${slotMap[key][j]} (Slot ${key})`);
          }
        }
      }
    }

    // Only include lecturers with at least one valid slot
    const hasAnySlot = Object.keys(slotMap).length > 0;
    if (hasAnySlot) {
      results.push({
        name: lecturer.nama,
        sections: sectionCount,
        conflicts,
        suggestions: 0,
      });
    }
  }
  return { results, total: allLecturers.length };
}
