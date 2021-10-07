
const Response = {
    error(message, error, code = -1) {
        return { status: "error", message, code, error }
    },

    success(data) {
        return { status: "success", data, code: 0 }
    }
}

function time() {
    return Math.floor(Date.now() / 1000)
}


module.exports = {
    Response,
    time
}