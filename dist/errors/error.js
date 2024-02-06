class HTTPError extends Error {
    constructor() {
        super(...arguments);
        this.status = 0;
    }
}
export default HTTPError;
