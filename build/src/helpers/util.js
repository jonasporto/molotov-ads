"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Util;
(function (Util) {
    function valueFor(attr) {
        if (attr instanceof Function)
            return attr();
        return attr;
    }
    Util.valueFor = valueFor;
})(Util = exports.Util || (exports.Util = {}));
