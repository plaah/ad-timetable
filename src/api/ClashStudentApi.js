// =========================
// 📡 API Constants
// =========================
const TTMS_API = 'http://web.fc.utm.my/ttms/web_man_webservice_json.cgi';
const ADMIN_AUTH_API = 'http://web.fc.utm.my/ttms/auth-admin.php';

// =========================
// 📦 Ambil session dari localStorage
// =========================
function getSessionId() {
  const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
  return lsData?.session_id || "";
}

// =========================
// 🔑 Ambil session admin
// =========================
async function fetchAdminSession(sessionId) {
  const url = `${ADMIN_AUTH_API}?session_id=${sessionId}`;
  const response = await fetch(url);
  const text = await response.text();
  try {
    const data = JSON.parse(text);
    return Array.isArray(data) ? data[0] : data;
  } catch (e) {
    throw new Error("Invalid JSON from admin session API: " + text);
  }
}

// =========================
// 👨‍🎓 Fetch daftar mahasiswa per sesi + semester
// =========================
async function fetchStudents(sessionId, sesi, semester) {
  const url = `${TTMS_API}?entity=pelajar&session_id=${sessionId}&sesi=${encodeURIComponent(sesi)}&semester=${semester}`;
  const response = await fetch(url);
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

// =========================
// 📚 Ambil daftar subjek mahasiswa
// =========================
async function fetchStudentSubjects(sessionId, matric) {
  const url = `${TTMS_API}?entity=pelajar_subjek&session_id=${sessionId}&no_matrik=${matric}`;
  const response = await fetch(url);
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

// =========================
// 🕰️ Fetch jadwal subjek
// =========================
async function fetchSubjectSchedule(sessionId, kodSubjek, seksyen, sesi, semester) {
  const url = `${TTMS_API}?entity=jadual_subjek&session_id=${sessionId}&kod_subjek=${kodSubjek}&seksyen=${seksyen}&sesi=${encodeURIComponent(sesi)}&semester=${semester}`;
  const response = await fetch(url);
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

// =========================
// 📅 Fetch semua jadwal mahasiswa berdasarkan subjeknya
// =========================
async function fetchStudentSchedule(sessionId, matric, sesi, semester) {
  const subjects = await fetchStudentSubjects(sessionId, matric);
  const currentSubjects = subjects.filter(subj =>
    subj.sesi === sesi && String(subj.semester) === String(semester)
  );

  const schedules = await Promise.all(
    currentSubjects.map(subj =>
      fetchSubjectSchedule(sessionId, subj.kod_subjek, subj.seksyen, sesi, semester)
    )
  );

  return schedules.flat();
}

// =========================
// 🔍 Fungsi utama: deteksi clash
// =========================
export async function fetchStudentClashBatch(sesi, semester, offset = 0, limit = 25) {
  const rawSessionId = getSessionId();
  const admin = await fetchAdminSession(rawSessionId);
  const sessionId = admin.session_id;
  const allStudents = await fetchStudents(sessionId, sesi, semester);
  const students = allStudents.slice(offset, offset + limit);

  const results = [];

  const studentPromises = students.map(async (student) => {
    const matric = student.no_matrik || "-";
    const rawName = student.nama || "-";
    const cleanName = rawName.trim().replace(/^'+/, "");

    try {
      const subjects = await fetchStudentSubjects(sessionId, matric);
      const currentSubjects = subjects.filter(subj =>
        subj.sesi === sesi && String(subj.semester) === String(semester)
      );

      const timetable = await fetchStudentSchedule(sessionId, matric, sesi, semester);

      console.log(`🔍 Student ${matric}: ${currentSubjects.length} subjects, ${timetable.length} schedule slots`);

      // ===== Build slotMap: { 'hari-masa': [subjek-seksyen, ...] }
      const slotMap = {};
      timetable.forEach((slot) => {
        if (!slot || !slot.hari || !slot.masa || !slot.kod_subjek) return;
        const key = `${slot.hari}-${slot.masa}`;
        if (!slotMap[key]) slotMap[key] = [];
        slotMap[key].push(slot.kod_subjek + (slot.seksyen ? `-${slot.seksyen}` : ""));
      });

      // ===== Detect conflicts
      const conflicts = [];
      for (const key in slotMap) {
        if (slotMap[key].length > 1) {
          for (let i = 0; i < slotMap[key].length; i++) {
            for (let j = i + 1; j < slotMap[key].length; j++) {
              conflicts.push(`${slotMap[key][i]} ↔ ${slotMap[key][j]} (Slot ${key})`);
            }
          }
        }
      }

      console.log(`⚠️ Student ${matric}: ${conflicts.length} conflicts detected`);

      // ===== Suggestions
      let suggestions = '-';
      if (conflicts.length > 0) {
        suggestions =
          conflicts.length <= 2
            ? 'Reschedule overlapping subjects'
            : conflicts.length <= 5
              ? 'Consider alternative sections'
              : 'Major schedule conflict detected';
      }

      return {
        name: cleanName,
        yearCourse: student.tahun_kursus || student.tahun || '-',
        faculty: student.kod_fakulti || student.kod_kursus || '-',
        subjectCount: currentSubjects.length,
        conflicts,
        suggestions,
      };
    } catch (e) {
      console.error(`❌ Error processing student ${matric}:`, e);
      return {
        name: cleanName,
        yearCourse: student.tahun_kursus || student.tahun || '-',
        faculty: student.kod_fakulti || student.kod_kursus || '-',
        subjectCount: 0,
        conflicts: [],
        suggestions: '-',
      };
    }
  });

  const settled = await Promise.allSettled(studentPromises);
  for (const res of settled) {
    if (res.status === 'fulfilled') {
      results.push(res.value);
    }
  }

  return { results, total: allStudents.length };
}
