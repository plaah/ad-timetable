import BaseApi from "./BaseApi";

export default class Authentication extends BaseApi {
    async login(username, password) {
        return this.get({
            entity: "authentication",
            login: username,
            password: password,
        });
    }
}
