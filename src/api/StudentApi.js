import BaseApi from "./BaseApi";

export default class StudentApi extends BaseApi {
  async getCurrentPeriod() {
    return this.get({ entity: "sesisemester" });
  }

  async getSubjects(session, semester) {
    return this.get({
      entity: "subjek",
      sesi: session,
      semester: semester,
    });
  }

  async getStudentProfile(no_matrik) {
    return this.get({
      entity: "pelajar",
      no_matrik: no_matrik,
    });
  }

  async getStudentsInSection(
    adminSessionId,
    session,
    semester,
    subjectCode,
    section,
    limit = 100,
    offset = 0
  ) {
    return this.get({
      entity: "subjek_pelajar",
      session_id: adminSessionId,
      sesi: session,
      semester: semester,
      kod_subjek: subjectCode,
      seksyen: section,
      limit,
      offset,
    });
  }

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
      console.warn("Admin session fallback:", response);
      throw new Error("❌ Invalid admin session response");
    }

    this.setCache(cacheKey, adminSessionId);
    return adminSessionId;
  }

  async searchStudentsBySubject(adminSessionId, session, semester, subjectCode, maxSection = 3) {
    const students = [];

    for (let section = 1; section <= maxSection; section++) {
      let offset = 0;
      const limit = 100;

      while (true) {
        try {
          const response = await this.getStudentsInSection(
            adminSessionId,
            session,
            semester,
            subjectCode,
            section.toString(),
            limit,
            offset
          );

          if (!response || response.length === 0) break;

          console.log(`✅ ${subjectCode} section ${section} offset ${offset}: ${response.length} students`);
          console.log("🧾 Raw student data:", response);

          students.push(...response);

          if (response.length < limit) break;
          offset += limit;
        } catch (error) {
          console.warn(`❌ Error section ${section} offset ${offset}:`, error.message);
          break;
        }
      }
    }

    return students;
  }

  async listStudents(adminSessionId, session, semester, maxSubjects = 5) {
    const allStudents = [];

    const subjects = await this.getSubjects(session, semester);
    const limit = Math.min(subjects.length, maxSubjects);
    const validSubjects = subjects
      .filter((s) => s.bil_seksyen > 0)
      .slice(0, maxSubjects);

    for (const subject of validSubjects) {
      console.log(`🎯 Subject: ${subject.kod_subjek}, bil_seksyen: ${subject.bil_seksyen}`);
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