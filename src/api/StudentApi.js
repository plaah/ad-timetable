const TTMS_API = 'http://web.fc.utm.my/ttms/web_man_webservice_json.cgi';
const ADMIN_AUTH_API = 'http://web.fc.utm.my/ttms/auth-admin.php';

export async function fetchCurrentSession() {
  const url = `${TTMS_API}?entity=sesisemester`;
  const response = await fetch(url);
  const data = await response.json();
  return Array.isArray(data) ? data[0] : data;
}

export async function fetchAdminSession(sessionId) {
  const url = `${ADMIN_AUTH_API}?session_id=${sessionId}`;
  const response = await fetch(url);
  const data = await response.json();
  return Array.isArray(data) ? data[0] : data;
}

export async function fetchStudents(sessionId, sesi, semester) {
  const url = `${TTMS_API}?entity=pelajar&session_id=${sessionId}&sesi=${sesi}&semester=${semester}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

export async function fetchStudentTimetable(sessionId, matric) {
  const url = `${TTMS_API}?entity=jadualpelajar&session_id=${sessionId}&no_matrik=${matric}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

export async function fetchStudentSubjects(sessionId, matric) {
  const url = `${TTMS_API}?entity=pelajar_subjek&session_id=${sessionId}&no_matrik=${matric}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}
