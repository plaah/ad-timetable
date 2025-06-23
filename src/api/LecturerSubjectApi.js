// src/api/LecturerSubjectApi.js
import BaseApi from "./BaseApi";

export default class LecturerSubjectApi extends BaseApi {
  /**
   * Ambil daftar subjek & seksyen yang diajar oleh dosen.
   * @param {string|number} no_pekerja - ID dosen
   * @returns {Promise<Array>} Daftar subjek
   */
  async getTimetableInfo(no_pekerja) {
    return this.get({
      entity: "pensyarah_subjek",
      no_pekerja,
    });
  }
}
