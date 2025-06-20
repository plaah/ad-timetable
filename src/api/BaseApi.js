export default class BaseApi {
  constructor() {
    this.baseUrl = "http://web.fc.utm.my/ttms/web_man_webservice_json.cgi";
    this.adminAuthURL = "http://web.fc.utm.my/ttms/auth-admin.php";
    this.cache = {}; // simple in-memory cache
  }

  async get(params) {
    const query = new URLSearchParams(params).toString();
    const url = `${this.baseUrl}?${query}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch");
    }

    return await response.json();
  }

  getCache(key) {
    return this.cache[key];
  }

  setCache(key, value) {
    this.cache[key] = value;
  }

  async fetchJSON(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch");
    return await response.json();
  }
}
