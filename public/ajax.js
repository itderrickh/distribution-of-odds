class Ajax {
    constructor() {
        this.request = new XMLHttpRequest();
        this.method = 'GET';
        this.url = '';
        this.error = function() {};
        this.success = function() {};
        this.data = null;
    }

    setRequestHeader(key, value) {
        this.request.setRequestHeader(key, value);
        return this;
    }

    setData(data) {
        this.data = data;
    }

    setMethod(type) {
        this.method = type;
        return this;
    }

    setUrl(url) {
        this.url = url;
        return this;
    }

    onError(fn) {
        this.error = fn;
        return this;
    }

    onSuccess(fn) {
        this.success = fn;
        return this;
    }

    send() {
        var self = this;
        self.request.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var responseData = JSON.parse(this.response);
                self.success(responseData);
            } else if (this.readyState === 4 && this.status !== 200) {
                self.error(this.response);
            }
        };

        self.request.open(this.method, this.url, true);
        self.request.send();
    }

    static sendDataRequest(url, method, data) {
        return new Promise(function(resolve, reject) {
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    var responseData = JSON.parse(this.response);
                    resolve(responseData);
                } else if (this.readyState === 4 && this.status !== 200) {
                    reject(this.response);
                }
            };
            xhttp.open(method, url, true);
            xhttp.setRequestHeader("Content-type", "application/json");

            if (data) {
                xhttp.send(data);
            } else {
                xhttp.send();
            }
        });
    }

    static get(url) {
        return this.sendDataRequest(url, "GET", null);
    }

    static post(url, data) {
        return this.sendDataRequest(url, "POST", data);
    }

    static put(url, data) {
        return this.sendDataRequest(url, "PUT", data);
    }

    static patch(url, data) {
        return this.sendDataRequest(url, "PATCH", data);
    }

    static delete(url, data) {
        return this.sendDataRequest(url, "DELETE", data);
    }
}