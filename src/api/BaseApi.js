export default class BaseApi {
    constructor() {
        this.baseUrl = "http://web.fc.utm.my/ttms/web_man_webservice_json.cgi";
    }

    async get(params) {
    const query = new URLSearchParams(params).toString();
    const url = `${this.baseUrl}?${query}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Failed to fetch");
    }

    const text = await response.text();

    try {
        return JSON.parse(text); // Ini lebih aman dari langsung response.json()
    } catch (e) {
        console.error("Invalid JSON:", text);
        throw new Error("Response is not valid JSON");
    }
    }

}