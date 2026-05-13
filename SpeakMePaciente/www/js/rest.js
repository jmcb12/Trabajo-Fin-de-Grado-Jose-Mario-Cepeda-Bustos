(function () {

    function rest(method, url, data, callback) {
        method = method.toUpperCase();

        if (typeof data === "function") {
            callback = data;
            data = null;
        }

        var xhr = new XMLHttpRequest();

        xhr.open(method, "http://192.168.137.1:3000" + url, true);

        if (data) {
            xhr.setRequestHeader("Content-Type", "application/json");
            data = JSON.stringify(data);
        }

        xhr.onload = function () {
            var respuesta = xhr.responseText;

            if (respuesta != "") {
                respuesta = JSON.parse(respuesta);
            }

            callback(xhr.status, respuesta);
        };

        xhr.onerror = function () {
            callback(500, "Error de conexión con el servidor");
        };

        xhr.send(data);
    }

    rest.get = function (url, callback) {
        rest("GET", url, callback);
    };

    rest.post = function (url, data, callback) {
        rest("POST", url, data, callback);
    };

    rest.put = function (url, data, callback) {
        rest("PUT", url, data, callback);
    };

    rest.delete = function (url, callback) {
        rest("DELETE", url, callback);
    };

    rest.postForm = function (url, formData, callback) {
        var xhr = new XMLHttpRequest();

        xhr.open("POST", "http://192.168.137.1:3000" + url, true);

        xhr.onload = function () {
            var respuesta = xhr.responseText;

            if (respuesta != "") {
                try {
                    respuesta = JSON.parse(respuesta);
                } catch (error) {
                    respuesta = xhr.responseText;
                }
            }

            callback(xhr.status, respuesta);
        };

        xhr.onerror = function () {
            callback(500, "Error de conexión con el servidor");
        };

        xhr.send(formData);
    };

    rest.putForm = function (url, formData, callback) {
        var xhr = new XMLHttpRequest();

        xhr.open("PUT", "http://192.168.137.1:3000" + url, true);

        xhr.onload = function () {
            var respuesta = xhr.responseText;

            if (respuesta != "") {
                try {
                    respuesta = JSON.parse(respuesta);
                } catch (error) {
                    respuesta = xhr.responseText;
                }
            }

            callback(xhr.status, respuesta);
        };

        xhr.onerror = function () {
            callback(500, "Error de conexión con el servidor");
        };

        xhr.send(formData);

    };

    window.rest = rest;

})();
