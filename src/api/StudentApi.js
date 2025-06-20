import BaseApi from "./BaseApi";

export default class StudentApi extends BaseApi {
  /**
   * Ambil sesi & semester akademik saat ini
   * @returns {Promise<Array>} - [ { sesi, semester } ]
   */
  async getCurrentPeriod() {
    return this.get({ entity: "sesisemester" });
  }

  /**
   * Ambil daftar subjek berdasarkan sesi & semester
   * @param {string} session
   * @param {string} semester
   * @returns {Promise<Array>}
   */
  async getSubjects(session, semester) {
    return this.get({
      entity: "subjek",
      sesi: session,
      semester: semester,
    });
  }

  /**
   * Ambil mahasiswa dalam 1 seksyen spesifik
   * @param {string} adminSessionId
   * @param {string} session
   * @param {string} semester
   * @param {string} subjectCode
   * @param {string} section
   * @returns {Promise<Array>}
   */
  async getStudentsInSection(adminSessionId, session, semester, subjectCode, section) {
    return this.get({
      entity: "subjek_pelajar",
      session_id: adminSessionId,
      sesi: session,
      semester: semester,
      kod_subjek: subjectCode,
      seksyen: section,
    });
  }

  /**
   * Ambil session admin dari session login biasa
   * @param {string} userSessionId
   * @returns {Promise<string>} - adminSessionId
   */
async getAdminSession(userSessionId) {
  const cacheKey = `admin_session_${userSessionId}`;
  const cached = this.getCache(cacheKey);
  if (cached) return cached;

  const url = `${this.adminAuthURL}?session_id=${userSessionId}`;
  
  let response;
  try {
    response = await this.fetchJSON(url);
  } catch (e) {
    console.warn("⚠️ Failed to fetch admin session:", e);
    throw e;
  }

  const adminAuth = Array.isArray(response) ? response[0] : response;
  const adminSessionId = adminAuth?.session_id;

  if (!adminSessionId) {
    console.warn("Admin session fallback:", response); // biar kita tahu isi response asli
    throw new Error("❌ Invalid admin session response");
  }

  this.setCache(cacheKey, adminSessionId);
  return adminSessionId;
}




  /**
   * Cari semua mahasiswa dalam 1 subject, across multiple sections
   * @param {string} adminSessionId
   * @param {string} session
   * @param {string} semester
   * @param {string} subjectCode
   * @param {number} maxSection
   * @returns {Promise<Array>}
   */
  async searchStudentsBySubject(adminSessionId, session, semester, subjectCode, maxSection = 3) {
    const students = [];

    for (let section = 1; section <= maxSection; section++) {
      try {
        const sectionStudents = await this.getStudentsInSection(
          adminSessionId,
          session,
          semester,
          subjectCode,
          section.toString()
        );
        students.push(...sectionStudents);
      } catch (error) {
        console.warn(`⚠️ Error fetching ${subjectCode} section ${section}:`, error.message);
      }
    }

    return students;
  }

  /**
   * Ambil seluruh mahasiswa dari beberapa subject (limit 5 by default)
   * @param {string} adminSessionId
   * @param {string} session
   * @param {string} semester
   * @param {number} maxSubjects
   * @returns {Promise<Array>}
   */
  async listStudents(adminSessionId, session, semester, maxSubjects = 5) {
    const allStudents = [];

    const subjects = await this.getSubjects(session, semester);
    const limit = Math.min(subjects.length, 15); // limit ke 15 subject aja
    const validSubjects = subjects
     .filter((s) => s.bil_seksyen > 0)
     .slice(0, limit);


    for (const subject of validSubjects) {
      const subjectStudents = await this.searchStudentsBySubject(
        adminSessionId,
        session,
        semester,
        subject.kod_subjek,
        Math.min(subject.bil_seksyen, 3)
      );
      allStudents.push(...subjectStudents);
    }

    // Remove duplicates by no_kp
    const seen = new Set();
    const unique = [];

    for (const student of allStudents) {
      if (!seen.has(student.no_kp)) {
        seen.add(student.no_kp);
        unique.push(student);
      }
    }

    return unique;
  }
}
