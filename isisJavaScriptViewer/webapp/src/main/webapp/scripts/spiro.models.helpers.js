var Spiro;
(function (Spiro) {
    (function (Helpers) {
        function getClassName(obj) {
            var funcNameRegex = /function (.{1,})\(/;
            var results = (funcNameRegex).exec(obj.constructor.toString());
            return (results && results.length > 1) ? results[1] : "";
        }
        Helpers.getClassName = getClassName;

        function typeFromUrl(url) {
            var typeRegex = /(objects|services)\/([\w|\.]+)/;
            var results = (typeRegex).exec(url);
            return (results && results.length > 2) ? results[2] : "";
        }
        Helpers.typeFromUrl = typeFromUrl;
    })(Spiro.Helpers || (Spiro.Helpers = {}));
    var Helpers = Spiro.Helpers;
})(Spiro || (Spiro = {}));
//@ sourceMappingURL=spiro.models.helpers.js.map
