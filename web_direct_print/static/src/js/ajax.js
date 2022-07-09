odoo.define('web_direct_print.ajax', function (require) {
"use strict";

var core = require('web.core');
var download = require('web.download');
var contentdisposition = require('web.contentdisposition');
var ajax = require('web.ajax');
var _t = core._t;
let record_list = []
let xhr = new XMLHttpRequest();
xhr.open('GET','/web_direct_print/data');
let data = new FormData();
data.append('csrf_token', core.csrf_token);
xhr.onload = () => {if (xhr.status === 200) record_list = JSON.parse(xhr.response);};
xhr.send(data);

ajax.get_file = (options) => {
    var xhr = new XMLHttpRequest();
    var data;
    if (options.form) {
        xhr.open(options.form.method, options.form.action);
        data = new FormData(options.form);
    } else {
        xhr.open('POST', options.url);
        data = new FormData();
        _.each(options.data || {}, function (v, k) {
            data.append(k, v);
        });
    }
    if (core.csrf_token) {
        data.append('csrf_token', core.csrf_token);
    }
    xhr.responseType = 'blob';
    xhr.onload = function () {
        var mimetype = xhr.response.type;
        if (xhr.status === 200 && mimetype !== 'text/html') {
            var header = (xhr.getResponseHeader('Content-Disposition') || '').replace(/;$/, '');
            var filename = header ? contentdisposition.parse(header).parameters.filename : null;
            if(mimetype == 'application/pdf' && record_list.filter(x => options.url.include(x)).length){
              var blob = new Blob([req.response], {type: 'application/pdf'});
              var blobURL = URL.createObjectURL(blob);
              let iframe =  document.createElement('iframe');
              document.body.appendChild(iframe);

              iframe.style.display = 'none';
              iframe.src = blobURL;
              iframe.onload = function() {
                setTimeout(function() {
                  iframe.focus();
                  iframe.contentWindow.print();
                }, 1);
              };
            }else download(xhr.response, filename, mimetype);
            if (options.success) { options.success(); }
            return true;
        }
        if (!options.error) {
            return true;
        }
        var decoder = new FileReader();
        decoder.onload = function () {
            var contents = decoder.result;
            var err;
            var doc = new DOMParser().parseFromString(contents, 'text/html');
            var nodes = doc.body.children.length === 0 ? doc.body.childNodes : doc.body.children;
            try {
                var node = nodes[1] || nodes[0];
                err = JSON.parse(node.textContent);
            } catch (e) {
                err = {
                    message: nodes.length > 1 ? nodes[1].textContent : '',
                    data: {
                        name: String(xhr.status),
                        title: nodes.length > 0 ? nodes[0].textContent : '',
                    }
                };
            }
            options.error(err);
        };
        decoder.readAsText(xhr.response);
    };
    xhr.onerror = function () {
        if (options.error) {
            options.error({
                message: _t("Something happened while trying to contact the server, check that the server is online and that you still have a working network connection."),
                data: { title: _t("Could not connect to the server") }
            });
        }
    };
    if (options.complete) {
        xhr.onloadend = function () { options.complete(); };
    }
    xhr.send(data);
    return true;
}

return ajax;

});
