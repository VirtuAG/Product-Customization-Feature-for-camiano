/*! modernizr 3.6.0 (Custom Build) | MIT *
 * https://modernizr.com/download/?-promises-setclasses !*/
! function(n, e, s) {
    function o(n, e) {
        return typeof n === e
    }

    function i() {
        var n, e, s, i, a, f, l;
        for (var c in r)
            if (r.hasOwnProperty(c)) {
                if (n = [], e = r[c], e.name && (n.push(e.name.toLowerCase()), e.options && e.options.aliases && e.options.aliases.length))
                    for (s = 0; s < e.options.aliases.length; s++) n.push(e.options.aliases[s].toLowerCase());
                for (i = o(e.fn, "function") ? e.fn() : e.fn, a = 0; a < n.length; a++) f = n[a], l = f.split("."), 1 === l.length ? Modernizr[l[0]] = i : (!Modernizr[l[0]] || Modernizr[l[0]] instanceof Boolean || (Modernizr[l[0]] = new Boolean(Modernizr[l[0]])), Modernizr[l[0]][l[1]] = i), t.push((i ? "" : "no-") + l.join("-"))
            }
    }

    function a(n) {
        var e = l.className,
            s = Modernizr._config.classPrefix || "";
        if (c && (e = e.baseVal), Modernizr._config.enableJSClass) {
            var o = new RegExp("(^|\\s)" + s + "no-js(\\s|$)");
            e = e.replace(o, "$1" + s + "js$2")
        }
        Modernizr._config.enableClasses && (e += " " + s + n.join(" " + s), c ? l.className.baseVal = e : l.className = e)
    }
    var t = [],
        r = [],
        f = {
            _version: "3.6.0",
            _config: {
                classPrefix: "",
                enableClasses: !0,
                enableJSClass: !0,
                usePrefixes: !0
            },
            _q: [],
            on: function(n, e) {
                var s = this;
                setTimeout(function() {
                    e(s[n])
                }, 0)
            },
            addTest: function(n, e, s) {
                r.push({
                    name: n,
                    fn: e,
                    options: s
                })
            },
            addAsyncTest: function(n) {
                r.push({
                    name: null,
                    fn: n
                })
            }
        },
        Modernizr = function() {};
    Modernizr.prototype = f, Modernizr = new Modernizr;
    var l = e.documentElement,
        c = "svg" === l.nodeName.toLowerCase();
    Modernizr.addTest("promises", function() {
        return "Promise" in n && "resolve" in n.Promise && "reject" in n.Promise && "all" in n.Promise && "race" in n.Promise && function() {
            var e;
            return new n.Promise(function(n) {
                e = n
            }), "function" == typeof e
        }()
    }), i(), a(t), delete f.addTest, delete f.addAsyncTest;
    for (var u = 0; u < Modernizr._q.length; u++) Modernizr._q[u]();
    n.Modernizr = Modernizr
}(window, document);