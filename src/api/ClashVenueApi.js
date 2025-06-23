// src/api/ClashVenueApi.js
const TTMS_API = "http://web.fc.utm.my/ttms/web_man_webservice_json.cgi";
const ADMIN_AUTH_API = "http://web.fc.utm.my/ttms/auth-admin.php";

const ClashVenueApi = {
  async fetchCurrentSession() {
    const url = `${TTMS_API}?entity=sesisemester`;
    const response = await fetch(url);
    const data = await response.json();
    return Array.isArray(data) ? data[0] : data;
  },

  async fetchAdminSession(sessionId) {
    const url = `${ADMIN_AUTH_API}?session_id=${sessionId}`;
    const response = await fetch(url);
    const data = await response.json();
    return Array.isArray(data) ? data[0] : data;
  },

  async fetchRoomsByFaculty(facultyCode) {
    const url = `${TTMS_API}?entity=ruang&kod_fakulti=${facultyCode}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  },

  async fetchSubjectSections(sesi, semester) {
    const url = `${TTMS_API}?entity=subjek_seksyen&sesi=${sesi}&semester=${semester}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  },

  async fetchRoomSchedule(sesi, semester, kod_ruang) {
    const url = `${TTMS_API}?entity=jadual_ruang&sesi=${sesi}&semester=${semester}&kod_ruang=${kod_ruang}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  },

  async getClashData({ sesi, semester, kod_ruang, kod_fakulti }) {
    const [jadualList, ruangList, subjekList] = await Promise.all([
      this.fetchRoomSchedule(sesi, semester, kod_ruang),
      this.fetchRoomsByFaculty(kod_fakulti),
      this.fetchSubjectSections(sesi, semester),
    ]);

    return jadualList.map((entry) => {
      const ruang = ruangList.find((r) => r.kod_ruang === entry.kod_ruang) || {};
      const subjek =
        subjekList.find(
          (s) =>
            s.kod_subjek === (entry.subjek?.kod_subjek || entry.kod_subjek) &&
            s.seksyen === (entry.subjek?.seksyen || "")
        ) || {};

      return {
        roomCode: entry.kod_ruang || ruang.kod_ruang || "-",
        roomName: ruang.nama_ruang || "-",
        shortName: ruang.nama_ruang_singkatan || "-",
        faculty: `${ruang.kod_fakulti || "-"} / ${ruang.kod_jabatan || "-"}`,
        day: entry.hari || "-",
        time: entry.masa || "-",
        subject: entry.subjek
          ? `${entry.subjek.kod_subjek || "-"} - ${entry.subjek.seksyen || subjek.seksyen || "-"} - ${subjek.nama_pensyarah || "-"}`
          : `${entry.kod_subjek || "-"} - ${subjek.seksyen || "-"} - ${subjek.nama_pensyarah || "-"}`,
      };
    });
  }
};

export default ClashVenueApi;
