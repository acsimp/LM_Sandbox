/* Copyright © 2015-2018 Apple Inc. All rights reserved. */

! function() {
    function t(e, i, n) {
        function o(a, r) {
            if (!i[a]) {
                if (!e[a]) { var l = "function" == typeof require && require; if (!r && l) return l(a, !0); if (s) return s(a, !0); var h = new Error("Cannot find module '" + a + "'"); throw h.code = "MODULE_NOT_FOUND", h }
                var c = i[a] = { exports: {} };
                e[a][0].call(c.exports, function(t) { return o(e[a][1][t] || t) }, c, c.exports, t, e, i, n)
            }
            return i[a].exports
        }
        for (var s = "function" == typeof require && require, a = 0; a < n.length; a++) o(n[a]);
        return o
    }
    return t
}()({
    1: [function(t, e, i) {
        (function(i) {
            var n = t("@maps/localizer"),
                o = t("@maps/js-utils"),
                s = t("@maps/dom-events"),
                a = t("@maps/loaders").XHRLoader,
                r = t("@maps/loaders").Priority,
                l = o.isIE10() ? window.location.protocol : "https:",
                h = { url: l + "//cdn.apple-mapkit.com/ma/bootstrap", apiVersion: "2", accessKeyExpirationBiasMS: 3e4 },
                c = { OK: 200, MULTIPLE_CHOICES: 300, UNAUTHORIZED: 401, TOO_MANY_REQUESTS: 429 },
                u = ["l10n", "languageSupport", "mkjsVersion", "messagePrefix", "poi"],
                d = ["language", "countryCode", "origin", "madabaBaseUrl", "authorizationCallback"],
                p = { READY: 0, PENDING: 1, ERROR: 2 },
                m = { Initialized: "Initialized", Refreshed: "Refreshed" },
                g = { Unauthorized: "Unauthorized", TooManyRequests: "Too Many Requests" },
                _ = { Apple: "Apple", AutoNavi: "AutoNavi" },
                f = {
                    HTTP: c,
                    ErrorStatus: g,
                    TILE_SOURCES: { TOMTOM: "TomTom", AUTONAVI: "AutoNavi" },
                    Events: { Changed: "bootstrap-load", Error: "bootstrap-error" },
                    States: p,
                    StorageKeys: null,
                    state: p.PENDING,
                    authorizationCallback: null,
                    tileProvider: _.Apple,
                    _countryCode: null,
                    _madabaBaseUrl: null,
                    _customMadabaUrl: !1,
                    _madabaDomains: null,
                    _accessKey: null,
                    _accessToken: null,
                    apiBaseUrl: null,
                    apiBaseUrlOverride: null,
                    types: {},
                    _acceptLanguage: null,
                    _optionsLanguage: null,
                    _bootstrapRequestParams: null,
                    _messagePrefix: "Bootstrap.init(): ",
                    withParameters: function(t) { return u.forEach(function(e) { e in t && (this["_" + e] = t[e]) }, this), this },
                    init: function(t, e) {
                        if (o.required(t, e + "`options` object is required.", { checkNull: !0 }).checkType(t, "object", e + "`options` object is invalid."), Object.keys(t).forEach(function(t) {-1 === d.indexOf(t) && console.warn(e + "ignoring invalid option: `" + t + "`.") }), null === this.authorizationCallback) {
                            var i = t.authorizationCallback;
                            o.required(i, e + "`options` is missing `authorizationCallback`.", { checkNull: !0 }).checkType(i, "function", e + "`authorizationCallback` in `options` must be a function."), this.authorizationCallback = i, t.language && (o.checkType(t.language, "string", e + "`language` in `options` must be a string."), this._optionsLanguage = t.language), o.isNode() && t.origin && (this.origin = t.origin), this.language = this._optionsLanguage, "countryCode" in t && (this._countryCode = t.countryCode), t.madabaBaseUrl && (this._madabaBaseUrl = t.madabaBaseUrl, this._customMadabaUrl = !0), this._loadFromServer()
                        }
                        else console.warn(e + "already initialized; ignoring.")
                    },
                    reloadFromServer: function() { this._clearLocalStorage(), this._loadFromServer() },
                    get accessKey() { return this._accessKey },
                    get accessToken() { return this._accessToken },
                    accessKeyHasExpired: function() { this._clearLocalStorage(), this._loadFromServer(r.Highest) },
                    get ready() { return this.state === p.READY },
                    get language() { return this._language },
                    set language(t) { t !== this._language && (t ? o.checkType(t, "string", "[MapKit] `language` must be a string or `null`.") : t = this._acceptLanguage || this._getClientLanguage(), this._language = this._languageSupport.bestMatch(t, "en"), this._l10n.localeId = this._l10n.bestMatch(t, "en-US")) },
                    get countryCode() { return this._countryCode },
                    set countryCode(t) { t !== this._countryCode && (t && (o.checkType(t, "string", "[MapKit] `countryCode` must be a string or `null`."), t = t.toUpperCase()), this._countryCode = t, this._clearLocalStorage(), this._loadFromServer()) },
                    get isAutoNavi() { return this.tileProvider === _.AutoNavi },
                    syrupRequestedFallback: function() {
                        this._syrupRequestedFallback = !0, setTimeout(function() {
                            var t = new s.Event(this.Events.Changed);
                            t.status = m.Refreshed, this.dispatchEvent(t)
                        }.bind(this), 0)
                    },
                    get canRunCSR() { return this.ready && (!this._disableCsr || !!this.previewLoCSR) && !this._syrupRequestedFallback },
                    get madabaDomains() { return this._customMadabaUrl || !this._madabaDomains && this._madabaBaseUrl ? [this._madabaBaseUrl] : this._madabaDomains ? this._madabaDomains : null },
                    appendAuthOptions: function(t, e) { return this.origin && (t.origin = this.origin), this.authorizationCallback && (t.headers = { Authorization: o.fillTemplate("Bearer {{token}}", { token: e || this.accessToken }) }), t },
                    appendServiceAuthOptions: function(t) { return this.isAutoNavi ? t : this.appendAuthOptions(t) },
                    loaderWillStart: function(t) { this.state = p.PENDING },
                    loaderDidSucceed: function(t, e) { this._requestDidLoad(e) },
                    loaderDidFail: function(t, e) { this._parseError(t._xhr) },
                    _clearLocalStorage: function() { this.StorageKeys && o.supportsLocalStorage && Object.keys(this.StorageKeys).forEach(function(t) { window.localStorage.removeItem(this.StorageKeys[t]) }, this) },
                    _storeInLocalStorage: function(t, e, i) {
                        if (this.StorageKeys && o.supportsLocalStorage) try {
                            var n = Date.now() + 1e3 * i;
                            window.localStorage.setItem(this.StorageKeys.BootstrapDataExpirationTimeMS, n), window.localStorage.setItem(this.StorageKeys.BootstrapRequestParams, JSON.stringify(e)), window.localStorage.setItem(this.StorageKeys.BootstrapData, t)
                        }
                        catch (t) { return }
                    },
                    _isBootstrapRequestParamsDifferentFromLocalStorage: function() { if (this.StorageKeys && o.supportsLocalStorage) { var t = JSON.parse(window.localStorage.getItem(this.StorageKeys.BootstrapRequestParams)); return null === t || null === this._bootstrapRequestParams || Object.keys(this._bootstrapRequestParams).some(function(e) { return this._bootstrapRequestParams[e] !== t[e] }, this) } },
                    _loadFromLocalStorage: function() { if (this.StorageKeys && o.supportsLocalStorage) { var t = parseInt(window.localStorage.getItem(this.StorageKeys.BootstrapDataExpirationTimeMS), 10) || 0; if (!(t <= Date.now() || this._isBootstrapRequestParamsDifferentFromLocalStorage())) { var e = JSON.parse(window.localStorage.getItem(this.StorageKeys.BootstrapData)); if (e && (!this.authorizationCallback || e.accessToken)) return e.expiresInSeconds = Math.floor((t - Date.now()) / 1e3), this._processLoadedData(e), e } } },
                    _loadFromServer: function(t) {
                        if (this._bootstrapRequestParams = { apiVersion: h.apiVersion, countryCode: this._countryCode, mkjsVersion: this._mkjsVersion, poi: this._poi }, !this._loadFromLocalStorage()) {
                            var e = h.url + "?" + o.toQueryString(this._bootstrapRequestParams),
                                i = { retry: !0, delay: 0, priority: t };
                            this.authorizationCallback(function(t) { this.appendAuthOptions(i, t), this.accessToken && (i.headers["X-Maps-Access-Token"] = o.fillTemplate("Bearer {{token}}", { token: this.accessToken })), new a(e, this, i).schedule() }.bind(this))
                        }
                    },
                    _requestDidLoad: function(t) {
                        if (!this._parseError(t)) try {
                            var e = JSON.parse(t.responseText);
                            this._storeInLocalStorage(t.responseText, this._bootstrapRequestParams, e.expiresInSeconds), this._processLoadedData(e)
                        }
                        catch (t) { console.error(this._messagePrefix + "parse error.", t), this._loadFailed() }
                    },
                    _resetReloadTimer: function(t) { clearTimeout(this._reloadTimerId), this._reloadTimerId = setTimeout(function() { delete this._reloadTimerId, this.accessKeyHasExpired() }.bind(this), t), o.isNode() && this._reloadTimerId.unref() },
                    _loadSucceeded: function(t) {
                        setTimeout(function() {
                            this.state = p.READY;
                            var e = new s.Event(this.Events.Changed);
                            e.status = t ? m.Refreshed : m.Initialized, this.dispatchEvent(e)
                        }.bind(this), 0)
                    },
                    _loadFailed: function(t) {
                        setTimeout(function() {
                            this.state = p.ERROR;
                            var e = new s.Event(this.Events.Error);
                            e.status = t, this.dispatchEvent(e)
                        }.bind(this), 0)
                    },
                    _processLoadedData: function(t) { var e = !!this._accessToken; try { this._parseData(t), this.expiresInSeconds && this._resetReloadTimer(this._adjustedExpirationInSeconds(this.expiresInSeconds)) } catch (t) { return console.error(this._messagePrefix + "parse error.", t), void this._loadFailed() } this.language = this._optionsLanguage, this._loadSucceeded(e) },
                    _parseData: function(t) {
                        t.apiBaseUrl || console.warn(this._messagePrefix + "apiBaseUrl not found. Using default."), this._countryCode = "unknown" !== t.countryCode ? t.countryCode : null, this.environment = t.environment, this.apiBaseUrl = this.apiBaseUrlOverride || t.apiBaseUrl, t.analytics && (this.analytics = t.analytics), t.authInfo && t.authInfo.team_id && (this.teamId = t.authInfo.team_id), t.locationShiftUrl && (this.locationShiftUrl = t.locationShiftUrl), this.expiresInSeconds = t.expiresInSeconds, this.ipLocation = t.ipLocation, this._customMadabaUrl || !t.madabaBaseUrl && !t.madabaDomains || (this._madabaBaseUrl = t.madabaBaseUrl, this._madabaDomains = t.madabaDomains && t.madabaDomains.length && t.madabaDomains.map(function(t) { return t.match(/^(https?:)?\/\//) ? t : l + "//" + t })), this._disableCsr = !!t.disableCsr, t.accessKey && (this._accessKey = t.accessKey), t.authInfo && t.authInfo.access_token && (this._accessToken = t.authInfo.access_token), this._acceptLanguage = this._parseAcceptLanguage(t.acceptLanguage), this.tileProvider = _.Apple;
                        var e = {};
                        t.attributions && t.attributions.forEach(function(t) { e[t.attributionId] = t, this.tileGroup = t.attributionId }, this);
                        var i = {};
                        t.tileSources.forEach(function(t) {
                            var n = t.tileSource;
                            i[n] = { name: n, path: t.path, domains: t.domains, protocol: t.protocol || "https:", attribution: e[t.attributionId], minZoomLevel: t.minZoomLevel, maxZoomLevel: t.maxZoomLevel, supportedResolutions: t.supportedResolutions, showPrivacyLink: t.showPrivacyLink, showTermsOfUseLink: t.showTermsOfUseLink }, t.needsLocationShift && (this.tileProvider = _.AutoNavi), i[n].attribution && i[n].attribution.global && (i[n].attribution.name = i[n].attribution.global[0].name, i[n].attribution.url = i[n].attribution.global[0].url)
                        }.bind(this)), this.types = {};
                        for (var n in t.modes) {
                            var o = t.modes[n].layers;
                            this.types[n] = { name: n, provider: this.tileProvider, lowResolutionTileSource: i[o[0].lowResTileSource], tileSources: o.map(function(t) { return i[t.tileSource] }) }
                        }
                    },
                    _parseError: function(t) { var e, i, n = t.status; return !(n >= c.OK && n < c.MULTIPLE_CHOICES) && (n === c.UNAUTHORIZED ? (i = g.Unauthorized, e = "initialization failed because the authorization token is invalid.") : n === c.TOO_MANY_REQUESTS ? (i = g.TooManyRequests, e = "initialization failed because the daily usage limit has exceeded.") : e = "initialization failed because the server returned error " + n + " (" + t.statusText + ").", console.error(this._messagePrefix + e), this._loadFailed(i), !0) },
                    _getClientLanguage: function() { return o.isNode() ? i.env.LANG ? i.env.LANG.split(".")[0].replace("_", "-") : "en-US" : window.navigator.languages ? window.navigator.languages[0] : window.navigator.language },
                    _parseAcceptLanguage: function(t) { var e = n.LanguageSupport.parseAcceptLanguage(t); return e ? e[0].langTag.tag : null },
                    _adjustedExpirationInSeconds: function(t) { return 1e3 * t - h.accessKeyExpirationBiasMS },
                    _restore: function() { this._authorizationCallback = null, this._acceptLanguage = null, this._optionsLanguage = null, this.apiBaseUrl = null, this.apiBaseUrlOverride = null, this.state = p.PENDING, delete this._language, this._listeners = {}, clearTimeout(this._reloadTimerId), delete this._reloadTimerId },
                    _debugInfo: function() { var t = {}; return ["ready", "state", "_countryCode", "tileProvider", "apiBaseUrl", "language", "_acceptLanguage", "_optionsLanguage", "_getClientLanguage", "types"].forEach(function(e) { t[e] = "function" == typeof this[e] ? this[e]() : this[e] }, this), t }
                };
            s.EventTarget(f), o.isNode() && (f.MapsWS = h), e.exports = f
        }).call(this, t("_process"))
    }, { "@maps/dom-events": 62, "@maps/js-utils": 84, "@maps/loaders": 85, "@maps/localizer": 94, _process: 110 }],
    2: [function(t, e, i) {
        function n(t) { var e = g.clamp(t, 1e-8 - 90, 90 - 1e-8) * _; return .5 + Math.log(Math.tan(f - e / 2)) / y }

        function o(t) { var e = Math.pow(Math.E, 2 * Math.PI * (t - .5)); return -2 * (Math.atan(e) - Math.PI / 4) / Math.PI * 180 }

        function s(t) { return g.mod(t / 360 + .5, 1) }

        function a(t) { return 360 * (g.mod(t, 1) - .5) }

        function r(t) { return g.mod(180 + t, 360) - 180 }

        function l(t, e) { void 0 === t && (t = new c), void 0 === e && (e = new h), g.checkInstance(t, c, "[MapKit] `center` is not a Coordinate."), g.checkInstance(e, h, "[MapKit] `span` is not a CoordinateSpan."), this.center = new c(t.latitude, t.longitude), this.span = new h(e.latitudeDelta, e.longitudeDelta) }

        function h(t, e) { void 0 === t && (t = 0), void 0 === e && (e = 0), g.checkType(t, "number", "[MapKit] `latitudeDelta` is not a number."), g.checkType(e, "number", "[MapKit] `longitudeDelta` is not a number."), this.latitudeDelta = Math.max(t, 0), this.longitudeDelta = Math.max(e, 0) }

        function c(t, e) { void 0 === t && (t = 0), void 0 === e && (e = 0), g.checkType(t, "number", "[MapKit] `latitude` is not a number."), g.checkType(e, "number", "[MapKit] `longitude` is not a number."), this.latitude = t, this.longitude = e }

        function u(t, e, i, n) { arguments.length < 4 && (n = 0, arguments.length < 3 && (i = 0, arguments.length < 2 && (e = 0, arguments.length < 1 && (t = 0)))), g.checkType(t, "number", "[MapKit] Expected a number for `northLatitude` in BoundingRegion constructor but got `" + t + "` instead."), g.checkType(e, "number", "[MapKit] Expected a number for `eastLongitude` in BoundingRegion constructor but got `" + e + "` instead."), g.checkType(i, "number", "[MapKit] Expected a number for `southLatitude` in BoundingRegion constructor but got `" + i + "` instead."), g.checkType(n, "number", "[MapKit] Expected a number for `westLongitude` in BoundingRegion constructor but got `" + n + "` instead."), this.northLatitude = t, this.eastLongitude = e, this.southLatitude = i, this.westLongitude = n }

        function d(t, e) { arguments.length < 2 && (e = 0, arguments.length < 1 && (t = 0)), g.checkType(t, "number", "[MapKit] Expected a number for `x` in MapPoint constructor but got `" + t + "` instead."), g.checkType(e, "number", "[MapKit] Expected a number for `y` in MapPoint constructor but got `" + e + "` instead."), this.x = t, this.y = e }

        function p(t, e) { arguments.length < 2 && (e = 0, arguments.length < 1 && (t = 0)), g.checkType(t, "number", "[MapKit] Expected a number for `width` in MapSize constructor but got `" + t + "` instead."), g.checkType(e, "number", "[MapKit] Expected a number for `height` in MapSize constructor but got `" + e + "` instead."), this.width = t, this.height = e }

        function m(t, e, i, n) { arguments.length < 4 && (n = 0, arguments.length < 3 && (i = 0, arguments.length < 2 && (e = 0, arguments.length < 1 && (t = 0)))), g.checkType(t, "number", "[MapKit] Expected a number for `x` in MapRect constructor but got `" + t + "` instead."), g.checkType(e, "number", "[MapKit] Expected a number for `y` in MapRect constructor but got `" + e + "` instead."), g.checkType(i, "number", "[MapKit] Expected a number for `width` in MapRect constructor but got `" + i + "` instead."), g.checkType(n, "number", "[MapKit] Expected a number for `height` in MapRect constructor but got `" + n + "` instead."), this.origin = new d(t, e), this.size = new p(i, n) }
        var g = t("@maps/js-utils"),
            _ = Math.PI / 180,
            f = Math.PI / 4,
            y = 2 * Math.PI,
            v = 256,
            w = o(0),
            b = o(1);
        l.prototype = {
            constructor: l,
            copy: function() { return new l(this.center.copy(), this.span.copy()) },
            toString: function() { return ["CoordinateRegion(", "\tlatitude: " + this.center.latitude, "\tlongitude: " + this.center.longitude, "\tlatitudeDelta: " + this.span.latitudeDelta, "\tlongitudeDelta: " + this.span.longitudeDelta, ")"].join("\n") },
            equals: function(t) { return this.center.equals(t.center) && this.span.equals(t.span) },
            toBoundingRegion: function() {
                var t = this.span.latitudeDelta / 2,
                    e = this.span.longitudeDelta / 2;
                return new u(this.center.latitude + t, r(this.center.longitude + e), this.center.latitude - t, r(this.center.longitude - e))
            },
            toMapRect: function() {
                if (this.span.latitudeDelta < 0) this.span.latitudeDelta = 0;
                else {
                    var t = n(Math.abs(this.center.latitude)),
                        e = w - o(2 * t);
                    this.span.latitudeDelta > e && (this.span.latitudeDelta = e)
                }
                var i = this.center.longitude - this.span.longitudeDelta / 2,
                    s = this.center.longitude + this.span.longitudeDelta / 2,
                    a = !1;
                i < -180 && (i += 360, a = !0);
                var r = !1;
                s > 180 && (s -= 360, r = !0);
                var l = new c(this.center.latitude, i),
                    h = new c(this.center.latitude, s),
                    u = l.toMapPoint(),
                    p = h.toMapPoint();
                a && (u.x -= 1), r && (p.x += 1);
                var g = new m;
                if (0 === this.center.latitude) {
                    var _ = new c(this.center.latitude + this.span.latitudeDelta / 2, this.center.longitude),
                        f = new c(this.center.latitude - this.span.latitudeDelta / 2, this.center.longitude);
                    return g.origin.x = u.x, g.size.width = p.x - g.origin.x, g.origin.y = _.toMapPoint().y, g.size.height = f.toMapPoint().y - g.origin.y, g
                }
                var y = this.copy();
                y.center.latitude = b + this.span.latitudeDelta / 2;
                var v = 10,
                    C = new c,
                    S = new d;
                _ = new c, f = new c, _.longitude = this.center.longitude, f.longitude = this.center.longitude;
                var L = 0;
                do {
                    if (y.center.latitude > w && y.center.latitude > this.center.latitude || y.center.latitude < b && y.center.latitude < this.center.latitude) y.center.latitude -= v, v *= .1;
                    else if (y.center.latitude > w || y.center.latitude < b) return new m(0, 0, 1, 1);
                    if (L > 500) return new m(0, 0, 1, 1);
                    _.latitude = y.center.latitude + y.span.latitudeDelta / 2, f.latitude = y.center.latitude - y.span.latitudeDelta / 2, g.origin.x = u.x, g.size.width = p.x - g.origin.x, g.origin.y = _.toMapPoint().y, g.size.height = f.toMapPoint().y - g.origin.y, S.x = g.midX(), S.y = g.midY(), C = S.toCoordinate(), (v > 0 && C.latitude > this.center.latitude || v < 0 && C.latitude < this.center.latitude) && (v *= -.1), y.center.latitude += v, L++
                } while (Math.abs(C.latitude - this.center.latitude) >= 1e-8);
                return g
            }
        }, h.prototype = { constructor: h, copy: function() { return new h(this.latitudeDelta, this.longitudeDelta) }, equals: function(t) { return Math.abs(this.latitudeDelta - t.latitudeDelta) < 1e-8 && Math.abs(this.longitudeDelta - t.longitudeDelta) < 1e-8 }, toString: function() { return ["CoordinateSpan(", "\tlatitudeDelta: " + this.latitudeDelta, "\tlongitudeDelta: " + this.longitudeDelta, ")"].join("\n") } }, c.prototype = { constructor: c, copy: function() { return new c(this.latitude, this.longitude) }, equals: function(t) { return Math.abs(this.latitude - t.latitude) < 1e-8 && Math.abs(this.longitude - t.longitude) < 1e-8 }, toMapPoint: function() { return new d(s(this.longitude), n(this.latitude)) }, toUnwrappedMapPoint: function() { return new d(this.longitude / 360 + .5, n(this.latitude)) }, toString: function() { return ["Coordinate(", "latitude:" + this.latitude.toFixed(12), ",longitude:" + this.longitude.toFixed(12), ")"].join("") } }, u.prototype = {
            constructor: u,
            copy: function() { return new u(this.northLatitude, this.eastLongitude, this.southLatitude, this.westLongitude) },
            toString: function() { return ["BoundingRegion(", "\tnorthLatitude: " + this.northLatitude, "\teastLongitude: " + this.eastLongitude, "\tsouthLatitude: " + this.southLatitude, "\twestLongitude: " + this.westLongitude, ")"].join("\n") },
            toCoordinateRegion: function() {
                var t = r(this.eastLongitude),
                    e = r(this.westLongitude);
                t < e && (t += 360);
                var i = this.northLatitude - this.southLatitude,
                    n = t - e;
                return new l(new c(this.southLatitude + i / 2, r(e + n / 2)), new h(i, n))
            }
        }, d.prototype = { constructor: d, z: 0, w: 1, toString: function() { return "MapPoint(" + this.x + ", " + this.y + ")" }, copy: function() { return new d(this.x, this.y) }, equals: function(t) { return this.x === t.x && this.y === t.y }, toCoordinate: function() { return new c(o(this.y), r(a(this.x))) } }, p.prototype = { constructor: p, toString: function() { return "MapSize(" + this.width + ", " + this.height + ")" }, copy: function() { return new p(this.width, this.height) }, equals: function(t) { return this.width === t.width && this.height === t.height } }, m.prototype = {
            constructor: m,
            toString: function() { return "MapRect(" + [this.origin.x.toFixed(12), this.origin.y.toFixed(12), this.size.width.toFixed(12), this.size.height.toFixed(12)].join(", ") + ")" },
            copy: function() { return new m(this.origin.x, this.origin.y, this.size.width, this.size.height) },
            equals: function(t) { return this.origin.equals(t.origin) && this.size.equals(t.size) },
            minX: function() { return this.origin.x },
            minY: function() { return this.origin.y },
            midX: function() { return this.origin.x + this.size.width / 2 },
            midY: function() { return this.origin.y + this.size.height / 2 },
            maxX: function() { return this.origin.x + this.size.width },
            maxY: function() { return this.origin.y + this.size.height },
            scale: function(t, e) {
                if (g.required(t, "[MapKit] Missing `scaleFactor` parameter in call to `MapRect.scale()`."), "number" != typeof t || isNaN(t)) throw new TypeError("[MapKit] The `scaleFactor` parameter passed to `MapRect.scale()` is not a number.");
                var i = this.size.width * t,
                    n = this.size.height * t;
                return e ? (g.checkInstance(e, d, "[MapKit] The `scaleCenter` parameter passed to `MapRect.scale()` is not a MapPoint."), new m(e.x - t * (e.x - this.origin.x), e.y - t * (e.y - this.origin.y), i, n)) : new m(this.midX() - i / 2, this.midY() - n / 2, i, n)
            },
            toCoordinateRegion: function() {
                var t = this.origin.toCoordinate(),
                    e = new d(this.maxX(), this.maxY()).toCoordinate(),
                    i = Math.abs(e.latitude - t.latitude),
                    n = e.longitude - t.longitude;
                return e.longitude < t.longitude && (n += 360), new l(new d(this.midX(), this.midY()).toCoordinate(), new h(i, n))
            }
        }, e.exports = {
            tileSize: v,
            convertLatitudeToY: n,
            convertYToLatitude: o,
            convertLongitudeToX: s,
            convertXToLongitude: a,
            wrapLongitude: r,
            zoomLevelForMapRectInViewport: function(t, e, i) {
                var n = e.width / (i * t.size.width),
                    o = e.height / (i * t.size.height);
                return g.log2(Math.min(n, o))
            },
            mapUnitsPerMeterAtLatitude: function(t) {
                var e = t * _,
                    i = 111132.92 + -559.82 * Math.cos(2 * e) + 1.175 * Math.cos(4 * e) + -.0023 * Math.cos(6 * e),
                    o = n(t - .5),
                    s = n(t + .5);
                return Math.abs(o - s) / i
            },
            pointsPerAxis: function(t) { return Math.pow(2, t) * v },
            CoordinateRegion: l,
            CoordinateSpan: h,
            Coordinate: c,
            BoundingRegion: u,
            MapPoint: d,
            MapRect: m,
            MapSize: p
        }
    }, { "@maps/js-utils": 84 }],
    3: [function(t, e, i) {
        "use strict";
        e.exports = { Feature: "Feature", FeatureCollection: "FeatureCollection", MultiPoint: "MultiPoint", MultiLineString: "MultiLineString", MultiPolygon: "MultiPolygon", Point: "Point", LineString: "LineString", Polygon: "Polygon", Position: "Position" }
    }, {}],
    4: [function(t, e, i) {
        "use strict";

        function n(t, e) { return u.isPosition(t) ? new c(t[1], t[0]) : (l("[MapKit] Expected a GeoJSON Position type, instead got " + t, e), !1) }

        function o(t, e, i) {
            switch (e) {
                case d.MultiPoint:
                case d.LineString:
                    return t.map(function(t) { return n(t, i) });
                case d.Polygon:
                    return t.map(function(t) { return t.map(function(t) { return n(t, i) }) });
                default:
                    return n(t, i)
            }
        }

        function s(t, e) {
            var i, n = g.indexOf(t.type) > -1,
                a = "GeometryCollection" === t.type;
            if (n || a) {
                var r = n ? t.coordinates : t.geometries;
                if (n) switch (t.type) {
                    case d.MultiPoint:
                        i = e.itemForMultiPoint;
                        break;
                    case d.MultiLineString:
                        i = e.itemForMultiLineString;
                        break;
                    case d.MultiPolygon:
                        i = e.itemForMultiPolygon
                }
                a && (i = e.itemForPoint);
                var c = new h(r.map(function(i) { var o = i; return n && (o = { type: m[t.type], coordinates: i }), s(o, e) }), t),
                    u = i ? i(c, t) : c;
                return u
            }
            var _ = p[t.type];
            if (!_) return l("[MapKit] Expected a GeoJSON " + t.type + " type, instead got " + t, e), !1;
            var f, y, v = o(t.coordinates, t.type, e),
                w = new _(v, { data: t });
            switch (t.type) {
                case d.Point:
                    i = e.itemForPoint, f = v;
                    break;
                case d.LineString:
                    i = e.itemForLineString, y = e.styleForOverlay;
                    break;
                case d.Polygon:
                    i = e.itemForPolygon, y = e.styleForOverlay
            }
            return u = i ? i(f || w, t) : w, y && (u.style = y(w, t)), u
        }

        function a(t, e) { if (null !== !t.geometry) { if (!u.isValid(t)) return l("[MapKit] Expected a GeoJSON " + t.type + " type, instead got " + t, e), !1; var i = s(t.geometry, e, t); return i || (l("[MapKit] " + t + " is an unknown GeoJSON type", e), !1) } }

        function r(t, e) {
            var i;
            switch (t.type) {
                case d.Feature:
                    return i = t.geometry && a(t, e), e.itemForFeature && (i = e.itemForFeature(i, t)), i;
                case d.FeatureCollection:
                    return i = new h(t.features.map(function(t) { return r(t, e) }).filter(function(t) { return t }), t), e.itemForFeatureCollection && (i = e.itemForFeatureCollection(i, t)), i;
                default:
                    return s(t, e)
            }
        }

        function l(t, e) { var i = new Error(t); "function" == typeof e.geoJSONDidError ? e.geoJSONDidError(i, e._input) : console.error(i) }
        var h = t("../../src/js/collections/item-collection"),
            c = t("../../lib/geo").Coordinate,
            u = t("./validate"),
            d = t("./constants"),
            p = { Point: t("../../src/js/annotations/marker-annotation"), LineString: t("../../src/js/overlays/polyline-overlay"), Polygon: t("../../src/js/overlays/polygon-overlay") },
            m = { MultiPoint: d.Point, MultiLineString: d.LineString, MultiPolygon: d.Polygon },
            g = [d.MultiPoint, d.MultiLineString, d.MultiPolygon];
        e.exports = function(t, e) { if (e = e || {}, e._input = t, !t instanceof Object || Array.isArray(t)) return l("[MapKit] importGeoJSON expects an Object and was passed " + t, e), !1; var i = r(t, e); return !i instanceof h && (i = new h(i, t)), e.geoJSONDidComplete && (i = e.geoJSONDidComplete(i, t)), i }
    }, { "../../lib/geo": 2, "../../src/js/annotations/marker-annotation": 146, "../../src/js/collections/item-collection": 158, "../../src/js/overlays/polygon-overlay": 199, "../../src/js/overlays/polyline-overlay": 202, "./constants": 3, "./validate": 6 }],
    5: [function(t, e, i) {
        "use strict";
        var n = { importGeoJSON: t("./import"), constants: t("./constants"), validate: t("./validate") };
        e.exports = n
    }, { "./constants": 3, "./import": 4, "./validate": 6 }],
    6: [function(t, e, i) {
        "use strict";

        function n(t, e) { return !(!t instanceof Object) && (t.type === r.Feature && !!o(t.geometry, e)) }

        function o(t, e) { return !(!t instanceof Object) && ((!e || t.type === e) && (!(!t.type instanceof String) && (t.type === r.MultiLineString || t.type === r.MultiPolygon || t.type === r.MultiPoint ? a(t.coordinates) : t.coordinates instanceof Array))) }

        function s(t) {
            if (!Array.isArray(t) || t.length < 2) return !1;
            for (var e = 0; e < 2; ++e)
                if ("number" != typeof t[e] || isNaN(t[e])) return !1;
            return !0
        }

        function a(t) {
            for (var e in t)
                if (!t[e].coordinates instanceof Array) return !1;
            return !0
        }
        var r = t("./constants"),
            l = {
                Feature: function(t) { return n(t, t.geometry && t.geometry.type) },
                FeatureCollection: function(t) { if (!t instanceof Object || !t.features instanceof Array) return !1; for (var e in t.features) { var i = t.features[e]; if (i.geometry && !n(i, i.geometry.type)) return !1 } return !0 },
                Position: function(t) { return s(t) },
                Point: function(t) { return o(t, r.Point) },
                MultiPoint: function(t) { return o(t, r.MultiPoint) },
                LineString: function(t) { return o(t, r.LineString) },
                MultiLineString: function(t) { return o(t, r.MultiLineString) },
                Polygon: function(t) { return o(t, r.Polygon) },
                MultiPolygon: function(t) { return o(t, r.MultiPolygon) },
                GeometryCollection: function(t) {
                    if (!t instanceof Object || !t.geometries instanceof Array) return !1;
                    for (var e in t.features)
                        if (!o(t, t.geometries[e].type)) return !1;
                    return !0
                }
            };
        e.exports = { isValid: function(t) { return !!l[t.type] && l[t.type](t) }, isPosition: function(t) { return l.Position(t) } }
    }, { "./constants": 3 }],
    7: [function(t, e, i) { e.exports = { BackgroundGridThemes: t("./src/background-grid-node").Themes, SceneGraphMapNode: t("./src/scene-graph-map-node"), SyrupMapNode: t("./src/syrup-map-node"), TileOverlay: t("./src/tile-overlay") } }, { "./src/background-grid-node": 8, "./src/scene-graph-map-node": 22, "./src/syrup-map-node": 25, "./src/tile-overlay": 33 }],
    8: [function(t, e, i) {
        function n() { o.BaseNode.call(this), this._renderer = new(t("./render-background-grid"))(this), this._theme = n.Themes.Light }
        var o = t("../../scene-graph"),
            s = t("@maps/js-utils");
        n.Themes = { Light: { fillColor: [249, 245, 237], lineColor: [152, 151, 147] }, Dark: { fillColor: [64, 64, 64], lineColor: [214, 214, 214] } }, n.prototype = s.inheritPrototype(o.BaseNode, n, { get size() { return this.parent.size }, get zoom() { return this.parent.zoomLevel }, get origin() { return this.parent.visibleMapRect.origin }, get theme() { return this._theme }, set theme(t) { t !== this._theme && (this._theme = t, this.needsDisplay = !0) }, stringInfo: function() { return "BackgroundGridNode" } }), e.exports = n
    }, { "../../scene-graph": 47, "./render-background-grid": 17, "@maps/js-utils": 84 }],
    9: [function(t, e, i) {
        function n(t) { this.node = t, this._configuration = null, this._debug = !1, this._language = null, this._showsPointsOfInterest = !0, this._showsDefaultTiles = !0, this._tileOverlays = [], this.camera = new h, this._element = document.createElement("div") }
        var o = t("@maps/js-utils"),
            s = t("../../scene-graph"),
            a = t("../../geo"),
            r = t("@maps/device-pixel-ratio"),
            l = t("@maps/js-utils"),
            h = t("./camera"),
            c = t("./camera-animation"),
            u = t("./initial-interaction-controller"),
            d = t("./zoom-controller"),
            p = t("./pan-controller"),
            m = t("./tile-data"),
            g = t("./tile-overlay"),
            _ = t("./tile-overlay-internal"),
            f = 1 - Math.pow(2, -52);
        n.prototype = {
            constructor: n,
            get element() { return this._element },
            deactivate: function() { this.delegate = null },
            destroy: function(t) {!t && this.cameraAnimation && this.cameraAnimation.cancel(), this._tileOverlays.forEach(function(t) { t.removeEventListener(_.RELOAD_EVENT, this) }, this), this._initialInteractionController && (this._initialInteractionController.destroy(), this._initialInteractionController = null), this._panController && (this._panController.destroy(), this._panController = null), this._zoomController && (this._zoomController.destroy(), this._zoomController = null), this._rotationController && (this._rotationController.destroy(), this._rotationController = null), delete this.node.delegate },
            minZoomLevel: 3,
            maxZoomLevel: 20,
            staysCenteredDuringZoom: !1,
            get configuration() { return this._configuration },
            set configuration(t) { this._configuration !== t && this.updateConfiguration(t) },
            get language() { return this._language },
            set language(t) { this._language !== t && (this._language = t, this.refresh()) },
            get showsPointsOfInterest() { return this._showsPointsOfInterest },
            set showsPointsOfInterest(t) { this._showsPointsOfInterest !== t && (this._showsPointsOfInterest = t, this.updateShowsPointsOfInterest()) },
            get size() { return this.camera.viewportSize.copy() },
            set size(t) { this.adjustForSize(t.copy()) },
            adjustForSize: function(t) {
                if (this._visibleMapRect && this._visibleMapRect.size.width > 0 && this._visibleMapRect.size.height > 0 && t.width > 0 && t.height > 0) {
                    var e = this._visibleMapRect;
                    delete this._visibleMapRect, this.setCameraAnimated(this.camera.withNewMapRect(e, this.snapsToIntegralZoomLevels, t))
                }
                else {
                    var i = this.camera;
                    this.setCameraAnimated(new h(i.center, i.zoom, t, i.rotation))
                }
            },
            get cameraIsPanning() { return !!this._panning },
            get pannable() { return !!this._panController },
            set pannable(t) {!t && this._panController ? (this._panController.destroy(), delete this._panController) : t && !this._panController && (this._initialInteractionController || (this._initialInteractionController = new u(this)), this._panController = new p(this)) },
            get cameraIsZooming() { return !!this._zooming || !!this._suspendedZoom },
            get zoomable() { return !!this._zoomController },
            set zoomable(t) {!t && this._zoomController ? (this._zoomController.destroy(), delete this._zoomController) : t && !this._zoomController && (this._initialInteractionController || (this._initialInteractionController = new u(this)), this._zoomController = new d(this)) },
            get cameraIsRotating() { return !!this._rotating },
            get visibleMapRect() { return this._visibleMapRect || this.camera.toMapRect() },
            set visibleMapRect(t) { this.setVisibleMapRectAnimated(t) },
            setVisibleMapRectAnimated: function(t, e) {
                if (this.camera.viewportSize.equals(s.Size.Zero)) this._visibleMapRect = t.copy();
                else {
                    var i = this.camera.withNewMapRect(t, this.snapsToIntegralZoomLevels);
                    i.rotation = 0, this.setCameraAnimated(i, !!e)
                }
            },
            setCenterAnimated: function(t, e) {
                var i = t.toMapPoint();
                if (this._visibleMapRect) this._visibleMapRect = new a.MapRect(i.x - this._visibleMapRect.size.width / 2, i.y - this._visibleMapRect.size.height / 2, this._visibleMapRect.size.width, this._visibleMapRect.size.height);
                else {
                    var n = this.camera.copy();
                    n.center = i, this.setCameraAnimated(n, e)
                }
            },
            get transformCenter() { var t = this.node.delegate; return t && "function" == typeof t.mapTransformCenter ? t.mapTransformCenter(this.node) : this.camera.center },
            get zoomLevel() { return this.camera.zoom },
            set zoomLevel(t) { this.setZoomLevelAnimated(t) },
            setZoomLevelAnimated: function(t, e) {
                if (this._suspendedZoom) return this._suspendedZoom.animated = this._suspendedZoom.animated || this._suspendedZoom.level !== t, void(this._suspendedZoom.level = t);
                if (!this.cameraAnimation || e) {
                    var i = this.zoomLevel,
                        n = l.clamp(t, this.minZoomLevel, this.maxZoomLevel);
                    if (i !== n) {
                        var o = this.transformCenter,
                            s = this.camera;
                        o.equals(s.center) ? this.setCameraAnimated(new h(s.center, n, s.viewportSize, s.rotation), e) : this.scaleCameraAroundMapPoint(Math.pow(2, n - i), this.transformCenter, e)
                    }
                }
                else this.cameraAnimation.additiveZoom = t
            },
            adjustMapItemPoint: function(t) {
                if (this.cameraIsZooming || this._pendingCameraDrawingReadiness) return t;
                if (!this._pointAdjustmentReference) {
                    var e = this.camera.zoom,
                        i = this.visibleMapRect.origin,
                        n = new m(this.camera),
                        o = n.zoom,
                        l = n.mapRect.origin,
                        h = Math.pow(2, e - o),
                        c = a.pointsPerAxis(o) * h;
                    this._pointAdjustmentReference = new s.Point((l.x - i.x) * c, (l.y - i.y) * c)
                }
                return t.x = r.roundToDevicePixel(this._pointAdjustmentReference.x) + r.roundToDevicePixel(t.x - this._pointAdjustmentReference.x), t.y = r.roundToDevicePixel(this._pointAdjustmentReference.y) + r.roundToDevicePixel(t.y - this._pointAdjustmentReference.y), t
            },
            scaleCameraAroundMapPoint: function(t, e, i) {
                var n = a.pointsPerAxis(this.minZoomLevel),
                    o = this.camera.viewportSize.width / (this.visibleMapRect.size.width * n),
                    s = this.camera.viewportSize.height / (this.visibleMapRect.size.height * n),
                    r = Math.min(1 / t, o, s),
                    l = e.x + (e.x < 1 ? 1 : -1),
                    h = this.visibleMapRect;
                l >= h.origin.x && l <= h.maxX() && (e = new a.MapPoint(l, e.y));
                var c = this.camera.withNewMapRect(h.scale(r, e), !1);
                this.setCameraAnimated(c, i)
            },
            setCameraAnimated: function(t, e) {
                if (0 === t.viewportSize.width || 0 === t.viewportSize.height) return this._pendingCameraDrawingReadiness = !0, void(this.camera = t);
                var i = this.camera;
                t.viewportSize.equals(i.viewportSize) || this._updateMinAndMaxZoomLevels(t.viewportSize), t.zoom = l.clamp(t.zoom, this.minZoomLevel, this.maxZoomLevel);
                var n = t.toMapRect().size,
                    o = n.width / 2,
                    s = n.height / 2;
                t.center.x = l.mod(t.center.x - o, 1) + o, t.center.y = l.clamp(t.center.y, s, f - s), !this._pendingCameraDrawingReadiness && t.equals(i) || (delete this._pendingCameraDrawingReadiness, this._cameraWillChange(!!e), e && !this.cameraAnimation ? (this._cameraChangesMayHaveStarted(), this.cameraAnimation = new c(this, i, t), this.cameraAnimation.zooming && this.cameraZoomWasSet(t)) : (delete this._pointAdjustmentReference, this.camera = t, this.cameraZoomWasSet(), this._cameraDidChange()))
            },
            cameraWillStartZooming: function(t, e) {
                var i = this.node.delegate,
                    n = function() { return i && "function" == typeof i.mapCanStartZooming && !i.mapCanStartZooming(this.node) }.bind(this);
                return this.cameraAnimation ? !(this._zoomController.active || this.cameraAnimation.zooming || n()) && (this._suspendedZoom = { animated: !!t, offCenter: !!e, level: this.zoomLevel, completed: !1 }, !0) : n() ? (this._zoomController.interrupt(), !1) : (this._cameraWillStartZooming(i, t, e), !0)
            },
            _cameraWillStartZooming: function(t, e, i) { t && "function" == typeof t.mapWillStartZooming && t.mapWillStartZooming(this.node, e, i), this._cameraChangesMayHaveStarted(), this._zooming = !0, this.beforeCameraZoomChange(!0), this._cameraWillChange(!!e) },
            cameraDidStopZooming: function() {
                if (this.snapsToIntegralZoomLevels && (this.camera.zoom = Math.round(this.camera.zoom)), this._suspendedZoom) this._suspendedZoom.complete = !0;
                else {
                    delete this._zooming, this.beforeCameraZoomChange(!1), this._cameraDidChange(), this._cameraChangesMayHaveEnded();
                    var t = this.node.delegate;
                    t && "function" == typeof t.mapDidStopZooming && t.mapDidStopZooming(this.node)
                }
            },
            cameraWillStartRotating: function() {
                this._rotating = !0;
                var t = this.node.delegate;
                t && "function" == typeof t.mapRotationWillStart && t.mapRotationWillStart(this.node), this._cameraWillChange()
            },
            cameraDidStopRotating: function() {
                delete this._rotating;
                var t = this.node.delegate;
                t && "function" == typeof t.mapRotationDidEnd && t.mapRotationDidEnd(this.node), this._cameraDidChange()
            },
            migrateStateTo: function(t) {
                t.backgroundGridTheme = this.node.backgroundGridTheme, t.configuration = this.node.configuration, t.language = this.node.language, t.pannable = this.node.pannable, t.showsPointsOfInterest = this.node.showsPointsOfInterest, t.showsDefaultTiles = this.node.showsDefaultTiles, t.tileOverlays = this.node.tileOverlays, t.size = this.node.size, t.staysCenteredDuringZoom = this.node.staysCenteredDuringZoom;
                var e = this.node.visibleMapRect;
                e.size.width > 0 && e.size.height > 0 && (t.visibleMapRect = e), t.zoomable = this.node.zoomable, t.isRotationEnabled = this.isRotationEnabled, t.rotation = this.rotation, t._impl.debug = this.debug, this.cameraAnimation && (this.cameraAnimation.map = t._impl, t._impl.cameraAnimation = this.cameraAnimation, this.cameraChangesHaveStarted && (t._impl.cameraChangesHaveStarted = !0))
            },
            createLabelRegion: o.noop,
            updatedLabelRegion: o.noop,
            unregisterLabelRegion: o.noop,
            get debug() { return this._debug },
            set debug(t) { this._debug !== !!t && (this._debug = !!t, this.refresh()) },
            updateConfiguration: function(t) { this._configuration = t, this._updateMinAndMaxZoomLevels(this.camera.viewportSize), this.setCameraAnimated(this.camera), this.refresh() },
            updateShowsPointsOfInterest: function() { this.refresh() },
            refresh: function() {},
            beforeCameraZoomChange: function() {},
            cameraZoomWasSet: function() {},
            get showsDefaultTiles() { return this._showsDefaultTiles },
            set showsDefaultTiles(t) { this._showsDefaultTiles !== t && (this._showsDefaultTiles = t, this._tileOverlaysDidChange()) },
            get tileOverlays() { return this._tileOverlays },
            set tileOverlays(t) {
                if (0 !== this._tileOverlays.length || 0 !== t.length) {
                    var e = "[MapKit] Map.tileOverlays should be an array, got `" + t + "` instead.";
                    l.checkArray(t, e), t.forEach(function(t) {
                        var e = "[MapKit] Map.tileOverlays can only contain TileOverlays, but got `" + t + "` instead.";
                        l.checkInstance(t, g, e)
                    }), this._tileOverlays.forEach(function(t) { t.removeEventListener(_.RELOAD_EVENT, this) }, this), this._tileOverlays = t, this._tileOverlays.forEach(function(t) { t.addEventListener(_.RELOAD_EVENT, this) }, this), this._tileOverlaysDidChange()
                }
            },
            addTileOverlay: function(t) { var e = "[MapKit] Map.addTileOverlay expected a TileOverlay, but got `" + t + "` instead."; return l.checkInstance(t, g, e), this.addTileOverlays([t]), t },
            addTileOverlays: function(t) {
                var e = "[MapKit] Map.addTileOverlays expected an array, but got `" + t + "` instead.";
                return l.checkArray(t, e), t.forEach(function(t) {
                    var e = "[MapKit] Map.addTileOverlays expected only TileOverlays, but got `" + t + "` instead.";
                    l.checkInstance(t, g, e), "number" == typeof t.minimumZ && t.minimumZ < this.minZoomLevel && console.warn("[MapKit] This TileOverlay has a minimumZ of " + t.minimumZ + "but the map won't go as low.")
                }, this), this.tileOverlays = this.tileOverlays.concat(t), t
            },
            removeTileOverlay: function(t) { var e = "[MapKit] Map.removeTileOverlay expected a TileOverlay, but got `" + t + "` instead."; return l.checkInstance(t, g, e), this.tileOverlays = this.tileOverlays.filter(function(e) { return e !== t }), t },
            removeTileOverlays: function(t) {
                var e = "[MapKit] Map.removeTileOverlays expected an array, but got `" + t + "` instead.";
                return l.checkArray(t, e), t.forEach(function(t) {
                    var e = "[MapKit] Map.removeTileOverlays expected only TileOverlays, but got `" + t + "` instead.";
                    l.checkInstance(t, g, e), this.removeTileOverlay(t)
                }, this), t
            },
            handleEvent: function() {},
            cameraWillStartPanning: function() {
                var t = this.node.delegate;
                this.cameraAnimation || t && "function" == typeof t.mapCanStartPanning && !t.mapCanStartPanning(this.node) ? this._panController.interrupt() : (t && "function" == typeof t.mapWillStartPanning && t.mapWillStartPanning(this.node), this.refresh(), this._cameraChangesMayHaveStarted(), this._panning = !0, this._cameraWillChange())
            },
            cameraWillStopPanning: function() {
                var t = this.node.delegate;
                t && "function" == typeof t.mapWillStopPanning && t.mapWillStopPanning(this.node)
            },
            cameraDidStopPanning: function() {
                delete this._panning, this._cameraDidChange(), this._cameraChangesMayHaveEnded();
                var t = this.node.delegate;
                t && "function" == typeof t.mapDidStopPanning && t.mapDidStopPanning(this.node)
            },
            cameraAnimationDidProgress: function(t) { this.setCameraAnimated(t) },
            cameraAnimationDidEnd: function() {
                var t = !1;
                if (this.cameraAnimation.zooming && !this.cameraAnimation.zoomIsAdditive && (this.cameraDidStopZooming(), t = !0), this.cameraAnimation.rotating && (this.cameraDidStopRotating(), t = !0), t || this._cameraDidChange(), delete this.cameraAnimation, this._cameraChangesMayHaveEnded(), this._suspendedZoom) {
                    var e = this._suspendedZoom;
                    delete this._suspendedZoom, this._cameraWillStartZooming(this.node.delegate, e.animated), e.complete && (this.setZoomLevelAnimated(e.level, e.animated), e.animated || this.cameraDidStopZooming())
                }
            },
            interactionDidStart: function() { this._panController && this._panController.stopDecelerating(), this._zoomController && this._zoomController.stopDecelerating(), this._rotationController && this._rotationController.stopDecelerating() },
            beganRecognizingRotation: function() { this._zoomController && (this._zoomController._singleTapWithTwoFingersRecognizer.enabled = !1) },
            finishedRecognizingRotation: function() { this._zoomController && (this._zoomController._singleTapWithTwoFingersRecognizer.enabled = !0) },
            tileGridDidFinishRendering: function() {
                var t = this.node.delegate;
                t && "function" == typeof t.mapDidFinishRendering && t.mapDidFinishRendering(this.node)
            },
            updateMinAndMaxZoomLevelsWhenConfigurationChanges: function() { this.minZoomLevel = 0, this.maxZoomLevel = Number.MAX_VALUE, this._configuration.tileSources.forEach(function(t) { this.minZoomLevel = Math.max(this.minZoomLevel, t.minZoomLevel), this.maxZoomLevel = Math.min(this.maxZoomLevel, t.maxZoomLevel) }, this) },
            _updateMinAndMaxZoomLevels: function(t) {
                if (t.width <= 0 || t.height <= 0) return !1;
                this._configuration && this.updateMinAndMaxZoomLevelsWhenConfigurationChanges(), this.minZoomLevel = Math.max(this.minZoomLevel, this.minZoomLevelForViewportSize(t, a.tileSize)), this.snapsToIntegralZoomLevels && (this.minZoomLevel = Math.ceil(this.minZoomLevel)), this.adjustForSize(this.size)
            },
            _cameraChangesMayHaveStarted: function(t) {
                if (!(this.cameraChangesHaveStarted || this._panning || this._zooming || this.cameraAnimation)) {
                    this.cameraChangesHaveStarted = !0;
                    var e = this.node.delegate;
                    e && "function" == typeof e.mapCameraChangesWillStart && e.mapCameraChangesWillStart(this.node, t)
                }
            },
            _cameraWillChange: function(t) {
                this._cameraChangesMayHaveStarted(), this._cameraWillChangeAnimated = !!t;
                var e = this.node.delegate;
                e && "function" == typeof e.mapCameraWillChange && e.mapCameraWillChange(this.node, !!t)
            },
            _cameraDidChange: function() {
                var t = this.node.delegate;
                t && "function" == typeof t.mapCameraDidChange && t.mapCameraDidChange(this.node, !!this._cameraWillChangeAnimated), delete this._cameraWillChangeAnimated, this._cameraChangesMayHaveEnded()
            },
            _cameraChangesMayHaveEnded: function(t) { if (this.cameraChangesHaveStarted && !this._panning && !this._zooming && !this.cameraAnimation) { delete this.cameraChangesHaveStarted; var e = this.node.delegate; return e && "function" == typeof e.mapCameraChangesDidEnd && e.mapCameraChangesDidEnd(this.node), !0 } }
        }, e.exports = n
    }, { "../../geo": 2, "../../scene-graph": 47, "./camera": 12, "./camera-animation": 11, "./initial-interaction-controller": 15, "./pan-controller": 16, "./tile-data": 26, "./tile-overlay": 33, "./tile-overlay-internal": 32, "./zoom-controller": 36, "@maps/device-pixel-ratio": 61, "@maps/js-utils": 84 }],
    10: [function(t, e, i) {
        function n() { o.GroupNode.call(this) }
        var o = t("../../scene-graph"),
            s = t("@maps/js-utils");
        n.prototype = s.inheritPrototype(o.GroupNode, n, { delegate: null, deactivate: function() { this._impl.deactivate() }, destroy: function(t) { this._impl.destroy(t) }, get element() { return this._impl.element }, get camera() { return this._impl.camera }, get minZoomLevel() { return this._impl.minZoomLevel }, get maxZoomLevel() { return this._impl.maxZoomLevel }, get staysCenteredDuringZoom() { return this._impl.staysCenteredDuringZoom }, set staysCenteredDuringZoom(t) { this._impl.staysCenteredDuringZoom = t }, get configuration() { return this._impl.configuration }, set configuration(t) { this._impl.configuration = t }, get language() { return this._impl.language }, set language(t) { this._impl.language = t }, get showsPointsOfInterest() { return this._impl.showsPointsOfInterest }, set showsPointsOfInterest(t) { this._impl.showsPointsOfInterest = t }, get backgroundGridTheme() { return this._impl.backgroundGridTheme }, set backgroundGridTheme(t) { this._impl.backgroundGridTheme = t }, get size() { return this._impl.size }, set size(t) { this._impl.size = t }, get rotation() { return this._impl.rotation }, set rotation(t) { this._impl.rotation = t }, get isRotationEnabled() { return this._impl.isRotationEnabled }, set isRotationEnabled(t) { this._impl.isRotationEnabled = t }, get cameraIsPanning() { return this._impl.cameraIsPanning }, get pannable() { return this._impl.pannable }, set pannable(t) { this._impl.pannable = t }, get cameraIsZooming() { return this._impl.cameraIsZooming }, get zoomable() { return this._impl.zoomable }, set zoomable(t) { this._impl.zoomable = t }, get zoomLevel() { return this._impl.zoomLevel }, set zoomLevel(t) { this._impl.setZoomLevelAnimated(t) }, setZoomLevelAnimated: function(t, e) { this._impl.setZoomLevelAnimated(t, e) }, get visibleMapRect() { return this._impl.visibleMapRect }, set visibleMapRect(t) { return this._impl.setVisibleMapRectAnimated(t) }, setVisibleMapRectAnimated: function(t, e) { this._impl.setVisibleMapRectAnimated(t, e) }, setCenterAnimated: function(t, e) { this._impl.setCenterAnimated(t, e) }, get showsDefaultTiles() { return this._impl.showsDefaultTiles }, set showsDefaultTiles(t) { this._impl.showsDefaultTiles = t }, get tileOverlays() { return this._impl.tileOverlays }, set tileOverlays(t) { this._impl.tileOverlays = t }, addTileOverlay: function(t) { return this._impl.addTileOverlay(t) }, addTileOverlays: function(t) { return this._impl.addTileOverlays(t) }, removeTileOverlay: function(t) { return this._impl.removeTileOverlay(t) }, removeTileOverlays: function(t) { return this._impl.removeTileOverlays(t) }, adjustMapItemPoint: function(t) { return this._impl.adjustMapItemPoint(t) }, cameraWillStartZooming: function(t) { return this._impl.cameraWillStartZooming(t) }, cameraDidStopZooming: function() { this._impl.cameraDidStopZooming() }, get fullyRendered() { return this._impl.fullyRendered }, devicePixelRatioDidChange: function() { return this._impl.devicePixelRatioDidChange() }, stringInfo: function() { return this._impl.stringInfo() }, get snapsToIntegralZoomLevels() { return this._impl.snapsToIntegralZoomLevels }, migrateStateTo: function(t) { return this._impl.migrateStateTo(t) }, needsReplacing: function(t) { return this._impl.needsReplacing(t) }, createLabelRegion: function() { return this._impl.createLabelRegion() }, updatedLabelRegion: function() { this._impl.updatedLabelRegion() }, unregisterLabelRegion: function(t) { this._impl.unregisterLabelRegion(t) }, setCameraAnimated: function(t, e) { this._impl.setCameraAnimated(t, e) } }), e.exports = n
    }, { "../../scene-graph": 47, "@maps/js-utils": 84 }],
    11: [function(t, e, i) {
        function n(t, e, i) { this.map = t, this._startCamera = e, this._endCamera = i, this._duration = a, t.snapsToIntegralZoomLevels && (i.zoom = Math.round(i.zoom)), this._updateAnimationRects(), this._startTime = Date.now(), this._schedule() }
        var o = t("../../geo"),
            s = t("@maps/scheduler"),
            a = 250;
        n.prototype = {
            constructor: n,
            cancel: function() { this._canceled = !0 },
            get zooming() { return this._startCamera.zoom !== this._endCamera.zoom },
            set additiveZoom(t) { this._zoomIsAdditive = !0, this._endCamera.zoom = t, this._updateAnimationRects() },
            get zoomIsAdditive() { return this._zoomIsAdditive },
            get rotating() { return this._startCamera.rotation !== this._endCamera.rotation },
            adjustRotation: function(t, e) { this._startCamera.rotateAroundCenter(t, e), this._endCamera.rotateAroundCenter(t, e), this._updateAnimationRects() },
            performScheduledUpdate: function() { this._canceled || this._animationDidProgress(Math.min((Date.now() - this._startTime) / this._duration, 1)) },
            _zoomIsAdditive: !1,
            _updateAnimationRects: function() {
                this._startRect = this._startCamera.toMapRect(), this._animatedEndRect = this._endCamera.toMapRect();
                var t = this._startCamera.center.x - this._endCamera.center.x;
                Math.abs(t) > .5 && (t < 0 ? this._startRect.origin.x += 1 : this._animatedEndRect.origin.x += 1)
            },
            _schedule: function() { s.scheduleOnNextFrame(this) },
            _animationDidProgress: function(t) {
                if (1 === t) return this.map.snapsToIntegralZoomLevels && (this._endCamera.zoom = Math.round(this._endCamera.zoom)), this.map.cameraAnimationDidProgress(this._endCamera), void this.map.cameraAnimationDidEnd();
                var e = this._startRect,
                    i = this._animatedEndRect,
                    n = e.origin.x,
                    s = e.origin.y,
                    a = e.size.width,
                    r = e.size.height,
                    l = i.origin.x - e.origin.x,
                    h = i.origin.y - e.origin.y,
                    c = i.size.width - e.size.width,
                    u = i.size.height - e.size.height,
                    d = this._endCamera.rotation - this._startCamera.rotation;
                Math.abs(d) > 180 && (d = this._endCamera.rotation + 360 - this._startCamera.rotation);
                var p = new o.MapRect(n + l * t, s + h * t, a + c * t, r + u * t),
                    m = this._startCamera.withNewMapRect(p);
                this.map.cameraAnimationDidProgress(m), this.map.rotation = this._startCamera.rotation + d * t, this._schedule()
            }
        }, e.exports = n
    }, { "../../geo": 2, "@maps/scheduler": 106 }],
    12: [function(t, e, i) {
        function n(t, e, i, n) { this.center = t || new o.MapPoint(.5, .5), this.zoom = e || 3, this.viewportSize = i || new s, this.rotation = n || 0 }
        var o = t("../../geo"),
            s = t("@maps/geometry/size"),
            a = t("@maps/js-utils"),
            r = t("@maps/geometry/point"),
            l = t("@maps/css-matrix");
        n.prototype = {
            constructor: n,
            get zoom() { return this._zoom },
            set zoom(t) { this._zoom = t || 3, this._pointsPerAxis = o.pointsPerAxis(this._zoom) },
            get worldSize() { return this._pointsPerAxis },
            get rotation() { return this._rotation },
            set rotation(t) {
                var e = a.mod(t, 360);
                this._rotation = e
            },
            minX: function() { var t = this.viewportSize.width / this._pointsPerAxis; return this.center.x - t / 2 },
            minY: function() { var t = this.viewportSize.height / this._pointsPerAxis; return this.center.y - t / 2 },
            maxX: function() { var t = this.viewportSize.width / this._pointsPerAxis; return this.center.x + t / 2 },
            maxY: function() { var t = this.viewportSize.height / this._pointsPerAxis; return this.center.y + t / 2 },
            equals: function(t) { return this.zoom === t.zoom && this.center.equals(t.center) && this.viewportSize.equals(t.viewportSize) && this.rotation === t.rotation },
            copy: function() { return new n(this.center, this.zoom, this.viewportSize, this.rotation) },
            toString: function() { return "Camera(" + ["center: [" + this.center.x + ", " + this.center.y + "]", "zoom: " + this.zoom, "viewportSize: " + this.viewportSize.toString(), "rotation: " + this.rotation].join(", ") + ")" },
            toMapRect: function() {
                var t = this.viewportSize.width / this._pointsPerAxis,
                    e = this.viewportSize.height / this._pointsPerAxis;
                return new o.MapRect(this.center.x - t / 2, this.center.y - e / 2, t, e)
            },
            toRenderingMapRect: function() {
                var t = [new r(this.minX(), this.minY()), new r(this.maxX(), this.minY()), new r(this.maxX(), this.maxY()), new r(this.minX(), this.maxY())];
                if (0 !== this.rotation) {
                    var e = (new l).rotate(this.rotation);
                    t = t.map(function(t) { return e.transformPoint(t) })
                }
                for (var i = t[0].x, n = t[0].y, s = t[0].x, a = t[0].y, h = 1; h < t.length; ++h) {
                    var c = t[h];
                    c.x < i && (i = c.x), c.x > s && (s = c.x), c.y < n && (n = c.y), c.y > a && (a = c.y)
                }
                var u = s - i,
                    d = a - n;
                return new o.MapRect(this.center.x - u / 2, this.center.y - d / 2, u, d)
            },
            translate: function(t) { return 0 !== this.rotation && (t = (new l).rotate(-this.rotation).transformPoint(t)), new n(new o.MapPoint(a.mod(this.center.x - t.x / this._pointsPerAxis, 1), a.mod(this.center.y - t.y / this._pointsPerAxis, 1)), this.zoom, this.viewportSize, this.rotation) },
            transformMapPoint: function(t) {
                var e = this.viewportSize.width,
                    i = this.viewportSize.height,
                    n = this.toScreenSpace(t);
                return (new l).translate(e / 2, i / 2).rotate(this.rotation).translate(e / -2, i / -2).transformPoint(n)
            },
            transformGestureCenter: function(t) {
                if (0 === this.rotation) return t;
                var e = this.viewportSize.width,
                    i = this.viewportSize.height;
                return (new l).translate(e / 2, i / 2).rotate(-this.rotation).translate(-e / 2, -i / 2).transformPoint(t)
            },
            toScreenSpace: function(t) { var e = this._pointsPerAxis; return (new l).translate(-this.minX() * e, -this.minY() * e).scale(e).transformPoint(t) },
            rotateAroundCenter: function(t, e) {
                var i = (new l).translate(t.x, t.y).rotate(-e).translate(-t.x, -t.y).transformPoint(new r(this.center.x, this.center.y));
                this.center = new o.MapPoint(i.x, i.y), this.rotation += e
            },
            withNewMapRect: function(t, e, i) { i = i || this.viewportSize; var s = o.zoomLevelForMapRectInViewport(t, i, o.tileSize); return new n(new o.MapPoint(t.midX(), t.midY()), e ? Math.floor(s) : s, i, this.rotation) }
        }, e.exports = n
    }, { "../../geo": 2, "@maps/css-matrix": 58, "@maps/geometry/point": 69, "@maps/geometry/size": 71, "@maps/js-utils": 84 }],
    13: [function(t, e, i) {
        function n(t) { o.BaseNode.call(this), this._tile = t, this._renderer = new a(this) }
        var o = t("../../scene-graph"),
            s = t("@maps/js-utils"),
            a = t("./render-debug");
        n.prototype = s.inheritPrototype(o.BaseNode, n, { get tile() { return this._tile }, stringInfo: function() { return "DebugNode<x:" + this.tile.x + ",y:" + this.tile.y + ",z:" + this.tile.z + ">" } }), e.exports = n
    }, { "../../scene-graph": 47, "./render-debug": 18, "@maps/js-utils": 84 }],
    14: [function(t, e, i) {
        function n(t) { this._map = t, this._recognizers = [] }
        var o = t("../../../src/js/utils");
        n.prototype = {
            constructor: n,
            get map() { return this._map },
            canTrustGestureCenter: function(t) { return 1 === t.numberOfTouchesRequired || !(o.supportsGestureEvents && !o.supportsTouches && o.insideIframe) },
            addRecognizer: function(t) { return this._recognizers.push(t), t.target = this.map.node.element, t.addEventListener("statechange", this), t },
            interrupt: function() { this._recognizers.forEach(function(t) { t.enabled = !1, t.enabled = !0 }) },
            centerForGesture: function(t) { var e = this.map; return e.staysCenteredDuringZoom || !this.canTrustGestureCenter(t) ? e.transformCenter : this._centerWithRecognizer(t) },
            destroy: function() {
                for (; this._recognizers.length;) {
                    var t = this._recognizers.pop();
                    t.enabled = !1, t.target = null, t.removeEventListener("statechange", this)
                }
            }
        }, e.exports = n
    }, { "../../../src/js/utils": 225 }],
    15: [function(t, e, i) {
        function n(t, e) { this._map = t, this._map.element.addEventListener(o.SupportsTouches ? "touchstart" : "mousedown", this) }
        var o = t("@maps/gesture-recognizers");
        n.prototype = { constructor: n, handleEvent: function(t) { "touchstart" === t.type && 1 !== t.touches.length || this._map.interactionDidStart() }, destroy: function() { this._map.element.removeEventListener(o.SupportsTouches ? "touchstart" : "mousedown", this) } }, e.exports = n
    }, { "@maps/gesture-recognizers": 72 }],
    16: [function(t, e, i) {
        function n(t) { r.call(this, t), this.addRecognizer(new o.Pan).maximumNumberOfTouches = 2 }
        var o = t("@maps/gesture-recognizers"),
            s = t("@maps/geometry/point"),
            a = t("@maps/scheduler"),
            r = t("./gesture-controller"),
            l = t("@maps/js-utils");
        n.prototype = l.inheritPrototype(r, n, {
            decelerating: !1,
            stopDecelerating: function() { this.decelerating && this._decelerationEnded() },
            destroy: function() { r.prototype.destroy.call(this), this.stopDecelerating() },
            handleEvent: function(t) {
                var e = t.target,
                    i = this.map;
                i.staysCenteredDuringZoom && i.cameraIsZooming || (e.state === o.States.Began ? i.cameraWillStartPanning() : e.state !== o.States.Ended && e.state !== o.States.Changed || (this._panMapCameraBy(e.translation), e.translation = new s), e.state === o.States.Ended && (this._startDeceleratingWithVelocity(e.velocity), this.decelerating || i.cameraDidStopPanning()))
            },
            performScheduledUpdate: function() {
                if (this.decelerating) {
                    var t = Date.now(),
                        e = t - this._timeAtPreviousFrame,
                        i = Math.exp(Math.log(.995) * e),
                        n = (1 - i) / (1 - .995) * .995;
                    this._panMapCameraBy(new s(this._velocity.x / 1e3 * n, this._velocity.y / 1e3 * n)), this._velocity.x *= i, this._velocity.y *= i, Math.abs(this._velocity.x) <= 10 && Math.abs(this._velocity.y) <= 10 ? this._decelerationEnded() : (this._timeAtPreviousFrame = t, this._schedule())
                }
            },
            _panMapCameraBy: function(t) {
                var e = this.map;
                e.setCameraAnimated(e.camera.translate(t))
            },
            _startDeceleratingWithVelocity: function(t) { this._velocity = t, this.map.cameraWillStopPanning(), Math.pow(t.x, 2) + Math.pow(t.y, 2) < 62500 || (this.decelerating = !0, this._timeAtPreviousFrame = Date.now(), this._schedule()) },
            _schedule: function() { a.scheduleOnNextFrame(this) },
            _decelerationEnded: function() { this.decelerating = !1, this.map.cameraDidStopPanning() }
        }), e.exports = n
    }, { "./gesture-controller": 14, "@maps/geometry/point": 69, "@maps/gesture-recognizers": 72, "@maps/js-utils": 84, "@maps/scheduler": 106 }],
    17: [function(t, e, i) {
        function n(t) { l.RenderItem.call(this, t) }

        function o(t, e, i, n, o, s) { i = c.mod(i, e), n = c.mod(n, e), o = Math.ceil(o), s = Math.ceil(s); for (var a = Math.ceil(o / e), r = Math.ceil(s / e), l = 0; l < a; ++l) t.fillRect(i + l * e, 0, 1, s); for (l = 0; l < r; ++l) t.fillRect(0, n + l * e, o, 1) }

        function s(t) { return "rgb(" + t.join(",") + ")" }

        function a(t, e, i) { return 0 === i ? t : 1 === i ? e : [r(t[0], e[0], i), r(t[1], e[1], i), r(t[2], e[2], i)] }

        function r(t, e, i) { return Math.round(e * i + t * (1 - i)) }
        var l = t("../../scene-graph"),
            h = t("../../geo"),
            c = t("@maps/js-utils"),
            u = Math.log(10) / Math.log(2);
        n.prototype = c.inheritPrototype(l.RenderItem, n, {
            draw: function(t, e) {
                var i = this.node,
                    n = i.zoom,
                    r = 100 * Math.pow(2, n % u),
                    d = r / 10,
                    p = Math.min(d, 100),
                    m = d < 10 ? 0 : (p - 10) / 90,
                    g = i.origin,
                    _ = Math.pow(2, n) * h.tileSize,
                    f = new l.Point(-g.x * _, -g.y * _),
                    y = c.mod(f.x, r) - r,
                    v = c.mod(f.y, r) - r,
                    w = this.node.theme;
                t.fillStyle = s(w.fillColor), t.fillRect(0, 0, i.size.width, i.size.height);
                var b = 1 - Math.pow(1 - m, 2);
                b > 0 && (t.fillStyle = s(a(w.fillColor, w.lineColor, b)), o(t, d, y, v, i.size.width, i.size.height)), t.fillStyle = s(w.lineColor), o(t, r, y, v, i.size.width, i.size.height)
            }
        }), e.exports = n
    }, { "../../geo": 2, "../../scene-graph": 47, "@maps/js-utils": 84 }],
    18: [function(t, e, i) {
        function n(t) { o.RenderItem.call(this, t) }
        var o = t("../../scene-graph"),
            s = t("@maps/js-utils"),
            a = { background: "rgba(0, 0, 0, 0.5)", text: "white" },
            r = { background: "rgba(255, 255, 255, 0.75)", text: "black" };
        n.prototype = s.inheritPrototype(o.RenderItem, n, {
            draw: function(t) {
                var e = this._node.size.width,
                    i = "standard" === this._node.tile.settings.configuration.name;
                t.fillStyle = i ? a.background : r.background, t.fillRect(0, 0, e, 1), t.fillRect(0, 1, 1, e - 1);
                var n = ["x", "y", "z"].map(function(t) { return t + " = " + this._node.tile[t] }, this);
                t.font = "12px -apple-system-font", t.beginPath(), t.moveTo(1, 1);
                var o = 1,
                    s = 1;
                n.forEach(function(e, i) {
                    var n = t.measureText(e).width;
                    o = 1 + n + 16, t.lineTo(o, s), s += 20, 0 === i && (s += 8), t.lineTo(o, s)
                }), t.lineTo(1, s), t.closePath(), t.fill(), t.fillStyle = i ? a.text : r.text, t.textBaseline = "hanging", n.forEach(function(i, n) { t.fillText(i, 9, 9 + 20 * n, e) })
            }
        }), e.exports = n
    }, { "../../scene-graph": 47, "@maps/js-utils": 84 }],
    19: [function(t, e, i) {
        function n(t) { this.node = t, this._readyToDraw = !1, this._unregisteredLabelRegions = [] }

        function o(t) { return t * a * -1 }
        var s = t("@maps/device-pixel-ratio");
        n.prototype = {
            constructor: n,
            init: function(t, e, i, n, o) { this.Camera = i, this.initRenderer(e, t, n).then(this.syrupInitHandler.bind(this, o)).catch(o.bind(null, !0)) },
            initRenderer: function(t, e, i) { var n = this._syrupRenderer = new t({ startInLoCSR: i }); return n.on("invalid-access-key", function() { e.accessKeyHasExpired() }, "mapkit-re-bootstrap-notification"), n.on("fallback", function() { e.syrupRequestedFallback() }, "mapkit-csr-fallback-notification"), n.init(e) },
            syrupInitHandler: function(t) {
                var e = this._syrupRenderer;
                e.setDeterministicCollisions(!0), e.setLanguage(this.node.language), e.setDeterministicCollisions(!1), e.setPixelRatio(s()), this._canvas = e.element(), this.updateConfiguration(this.node.configuration, !0), this._readyToDraw = !0, this.performScheduledDraw(), this._unregisteredLabelRegions.forEach(function(t) { this._syrupRenderer.registerLabelRegion(t) }, this), delete this._unregisteredLabelRegions, t()
            },
            deactivate: function() { this._readyToDraw = !1 },
            destroy: function() { this._readyToDraw = !1, this._syrupRenderer && (this._syrupRenderer.off("invalid-access-key", null, "mapkit-re-bootstrap-notification"), this._syrupRenderer.off("fallback", null, "mapkit-csr-fallback-notification"), "function" == typeof this._syrupRenderer.destroy && this._syrupRenderer.destroy(), this._syrupRenderer = null) },
            get snapsToIntegralZoomLevels() { return !!this._syrupRenderer && !this._syrupRenderer.supportsNonIntegralZoomLevels() },
            performScheduledDraw: function() {
                if (this._readyToDraw) {
                    var t = [this.node.size.width, this.node.size.height],
                        e = new this.Camera(t[0] / t[1]),
                        i = this.node.zoomLevel,
                        n = [this.node.camera.center.x, 1 - this.node.camera.center.y, 0];
                    e.setTarget(n), e.setZoomLevel(i), e.setRotation(o(this.node.camera.rotation)), this._syrupRenderer.update(e, t), this._syrupRenderer.mapFullyRendered() ? this.node._impl.tileGridDidFinishRendering() : this.node.needsDisplay = !0
                }
            },
            forceRerender: function() { this._readyToDraw && this._syrupRenderer.forceRerender() },
            devicePixelRatioDidChange: function() { this._syrupRenderer && this._syrupRenderer.setPixelRatio(s()) },
            frozen: !1,
            get element() { return this.canvas },
            get canvas() { return this._canvas },
            get fullyRendered() { return this._syrupRenderer && this._syrupRenderer.mapFullyRendered() },
            set language(t) { this._syrupRenderer && this._syrupRenderer.setLanguage(t) },
            updateNetworkConfiguration: function(t) { this._syrupRenderer && this._syrupRenderer.updateNetworkConfiguration(t) },
            updateConfiguration: function(t, e) {
                if (this._syrupRenderer) {
                    var i = e,
                        n = t.name;
                    this._syrupRenderer.setMapMode(n, i)
                }
            },
            updateShowsPointsOfInterest: function(t, e) { this.updateConfiguration(t, e) },
            createLabelRegion: function() { if (this._syrupRenderer) { var t = this._syrupRenderer.createLabelRegion(); return this._unregisteredLabelRegions ? this._unregisteredLabelRegions.push(t) : this._syrupRenderer.registerLabelRegion(t), t } },
            unregisterLabelRegion: function(t) { this._unregisteredLabelRegions ? this._unregisteredLabelRegions.splice(this._unregisteredLabelRegions.indexOf(t), 1) : this._syrupRenderer && this._syrupRenderer.unregisterLabelRegion(t) }
        };
        var a = Math.PI / 180;
        e.exports = n
    }, { "@maps/device-pixel-ratio": 61 }],
    20: [function(t, e, i) {
        function n(t) { l.call(this, t), this._recognizer = this.addRecognizer(new s.Rotation) }
        var o = t("../../geo"),
            s = t("@maps/gesture-recognizers"),
            a = t("@maps/scheduler"),
            r = t("@maps/js-utils"),
            l = t("./gesture-controller"),
            h = 180 / Math.PI,
            c = 3 * h,
            u = 1e-4 * h * 1e3;
        n.prototype = r.inheritPrototype(l, n, {
            decelerating: !1,
            stopDecelerating: function() { this.decelerating && this._decelerationEnded() },
            destroy: function() { l.prototype.destroy.call(this), this.stopDecelerating(), delete this._recognizer },
            handleEvent: function(t) {
                var e = t.target;
                e === this._recognizer && (e.state === s.States.Began && (this._rotatedMinimumAmount = !1, this.map.cameraWillStartRotating()), e.state === s.States.Ended && (this.map.finishedRecognizingRotation(), this._startDeceleratingWithVelocity(e.velocity)), this._handleRotationChange(t.target))
            },
            _handleRotationChange: function(t) {
                if (!this._rotatedMinimumAmount) {
                    if (Math.abs(t.rotation) < 5) return;
                    this.map.beganRecognizingRotation(), this._rotatedMinimumAmount = !0
                }
                this._lastRotationCenter = this.centerForGesture(t), t.state === s.States.Changed && (this.map.rotateCameraAroundMapPoint(this._lastRotationCenter, t.rotation), t.rotation = 0)
            },
            _centerWithRecognizer: function(t) {
                var e = this.map,
                    i = t.locationInElement(),
                    n = this.map.node.convertPointFromPage(i);
                n = e.camera.transformGestureCenter(n);
                var s = e.visibleMapRect,
                    a = e.camera.viewportSize;
                return new o.MapPoint(s.minX() + n.x / a.width * s.size.width, s.minY() + n.y / a.height * s.size.height)
            },
            performScheduledUpdate: function() {
                if (this.decelerating) {
                    var t = Date.now(),
                        e = t - this._timeAtPreviousFrame,
                        i = this._velocity / 1e3,
                        n = Math.pow(.995, e),
                        o = .995 * i * (n - 1) / (.995 - 1);
                    i *= n, this.map.cameraAnimation ? this.map.cameraAnimation.adjustRotation(this._lastRotationCenter, o) : this.map.rotateCameraAroundMapPoint(this._lastRotationCenter, o), this._velocity *= n, Math.abs(this._velocity) <= u ? this._decelerationEnded() : (this._timeAtPreviousFrame = t, this._schedule())
                }
            },
            _startDeceleratingWithVelocity: function(t) {
                if (Math.abs(t) > 1440 || isNaN(t) || !this._rotatedMinimumAmount) this.map.cameraDidStopRotating();
                else {
                    if (Math.abs(t) < c) return this.decelerating = !1, void this.map.cameraDidStopRotating();
                    this._velocity = t, this.decelerating = !0, this._timeAtPreviousFrame = Date.now(), this._schedule()
                }
            },
            _schedule: function() { a.scheduleOnNextFrame(this) },
            _decelerationEnded: function() { this.decelerating = !1, this.map.cameraDidStopRotating() }
        }), e.exports = n
    }, { "../../geo": 2, "./gesture-controller": 14, "@maps/gesture-recognizers": 72, "@maps/js-utils": 84, "@maps/scheduler": 106 }],
    21: [function(t, e, i) {
        function n(t) { o.call(this, t), this._backgroundGrid = this.node.addChild(new s), this._tileGridsGroup = this.node.addChild(new a(this)), this._tileGridsGroup.opacity = 0, setTimeout(function() { this._tileGridsGroup.opacity = 1 }.bind(this), 0) }
        var o = t("./base-map-node-internal"),
            s = t("./background-grid-node"),
            a = t("./tile-grids-group-node"),
            r = t("@maps/js-utils");
        n.prototype = r.inheritPrototype(o, n, {
            stringInfo: function() { return "MapNode<camera:" + this.camera.toString() + ">" },
            get tileSettings() { return { configuration: this._configuration, language: this._language, showsPOI: this._showsPointsOfInterest, showsDefaultTiles: this._showsDefaultTiles, showsTileInfo: this._debug, tileOverlays: this._tileOverlays } },
            get backgroundGridTheme() { return this._backgroundGrid.theme },
            set backgroundGridTheme(t) { this._backgroundGrid.theme = t },
            get fullyRendered() { return this._tileGridsGroup.fullyRendered },
            get cssBackgroundProperty() { return this._tileGridsGroup.cssBackgroundProperty },
            snapsToIntegralZoomLevels: !0,
            destroy: function(t) { o.prototype.destroy.call(this, t), this._tileGridsGroup.destroy() },
            refresh: function() { this._tileGridsGroup.scheduleRefresh() },
            cameraZoomWasSet: function(t) { t ? this._tileGridsGroup.cameraWillStartZooming(t) : this._tileGridsGroup.invalidate() },
            tileGridDidFinishRendering: function() { this._tileOverlays.forEach(function(t) { t._impl.reloadComplete() }, this), o.prototype.tileGridDidFinishRendering.call(this) },
            handleEvent: function() { this._tileGridsGroup.scheduleRefresh() },
            beforeCameraZoomChange: function(t) { t ? this._tileGridsGroup.cameraWillStartZooming() : this._tileGridsGroup.cameraDidStopZooming() },
            devicePixelRatioDidChange: function() { return this._tileGridsGroup.scheduleRefresh(), !0 },
            minZoomLevelForViewportSize: function(t, e) {
                var i = Math.max(t.width, t.height),
                    n = Math.ceil(i / e) + 1;
                return r.log2(n)
            },
            updateMinAndMaxZoomLevelsWhenConfigurationChanges: function() { o.prototype.updateMinAndMaxZoomLevelsWhenConfigurationChanges.call(this), this.tileOverlays.forEach(function(t) { "number" != typeof t.minimumZ || isNaN(t.minimumZ) || (this.minZoomLevel = Math.min(this.minZoomLevel, t.minimumZ)), "number" != typeof t.maximumZ || isNaN(t.maximumZ) || (this.maxZoomLevel = Math.max(this.maxZoomLevel, t.maximumZ)) }, this) },
            _tileOverlaysDidChange: function() { this._updateMinAndMaxZoomLevels(this.camera.viewportSize), this._tileGridsGroup.scheduleRefresh() },
            needsReplacing: function(t) { return t }
        }), e.exports = n
    }, { "./background-grid-node": 8, "./base-map-node-internal": 9, "./tile-grids-group-node": 28, "@maps/js-utils": 84 }],
    22: [function(t, e, i) {
        function n() { o.call(this), Object.defineProperty(this, "_impl", { value: new s(this) }) }
        var o = t("./base-map-node"),
            s = t("./scene-graph-map-node-internal"),
            a = t("@maps/js-utils");
        n.prototype = a.inheritPrototype(o, n, { get cssBackgroundProperty() { return this._impl.cssBackgroundProperty }, get rotation() { return 0 }, set rotation(t) { this._impl.rotation = t } }), e.exports = n
    }, { "./base-map-node": 10, "./scene-graph-map-node-internal": 21, "@maps/js-utils": 84 }],
    23: [function(t, e, i) {
        function n(t, e) {
            this._element = o(document.createElement("div"), r);
            var i = o(this._element.appendChild(document.createElement("ul")), l);
            this._items = [function(t) { var e = t.center.toCoordinate(); return "Center: " + e.latitude.toFixed(6) + ", " + e.longitude.toFixed(6) }, function(t) { return "Zoom level: " + t.zoom.toFixed(6) }, function(t) {
                var e = Math.floor(t.zoom),
                    i = Math.pow(2, e);
                return "Center tile: x=" + Math.floor(a.mod(t.center.x, 1) * i) + ", y=" + Math.floor(t.center.y * i) + ", z=" + e
            }, function(t) { return "Viewport: " + t.viewportSize.width + "×" + t.viewportSize.height }].map(function(t) { var e = i.appendChild(document.createElement("li")); return function(i) { e.textContent = t(i) } });
            var n = s.svgElement("svg", { viewBox: "-16 -16 32 32" }, s.svgElement("circle", { r: 16, fill: "#ccc" }), s.svgElement("g", { "stroke-width": 4, stroke: "#222" }, s.svgElement("line", { x1: -8, y1: -8, x2: 8, y2: 8 }), s.svgElement("line", { x1: 8, y1: -8, x2: -8, y2: 8 })));
            this._element.appendChild(o(n, h)), n.addEventListener("click", t), this.update(e)
        }

        function o(t, e) { for (var i in e) t.style[i] = e[i]; return t }
        var s = t("../../../src/js/utils"),
            a = t("@maps/js-utils"),
            r = { fontFamily: "-apple-system-font, sans-serif", margin: "2em auto", width: "18em", borderRadius: "0.5em", color: "#f8f9f0", backgroundColor: "rgba(0, 0, 0, 0.7)", padding: "1em", textAlign: "center", position: "relative" },
            l = { listStyleType: "none", margin: 0, paddingLeft: 0 },
            h = { width: "1em", height: "1em", position: "absolute", top: "0.5em", left: "0.5em" };
        n.prototype = { constructor: n, attachTo: function(t) { t.appendChild(this._element) }, detach: function() { this._element.remove() }, update: function(t) { this._items.forEach(function(e) { e(t) }) } }, e.exports = n
    }, { "../../../src/js/utils": 225, "@maps/js-utils": 84 }],
    24: [function(t, e, i) {
        function n(t) { o.call(this, t), this._renderer = t._renderer, this._backgroundGridTheme = a.Themes.Light, this._requiresFallback = !1, this._fallback = function() { this._requiresFallback = !0 }.bind(this) }
        var o = t("./base-map-node-internal"),
            s = t("./syrup-debug-panel"),
            a = t("./background-grid-node"),
            r = t("@maps/js-utils"),
            l = t("@maps/device-pixel-ratio"),
            h = t("./rotation-controller"),
            c = t("./initial-interaction-controller");
        n.prototype = r.inheritPrototype(o, n, {
            init: function(t, e, i, n, o) { this._requiresFallback ? t.syrupRequestedFallback() : (this._fallback = t.syrupRequestedFallback.bind(t), this._renderer.init(this.networkConfigurationFor(t), e, i, n, function(t) { this._updateMinAndMaxZoomLevels(this.camera.viewportSize), o(t, this._renderer) }.bind(this))) },
            get isRotationEnabled() { return this._isRotationEnabled },
            set isRotationEnabled(t) {!t && this._rotationController ? (this._rotationController.destroy(), delete this._rotationController) : t && !this._rotationController && (this._initialInteractionController || (this._initialInteractionController = new c(this)), this._rotationController = new h(this), this.camera._initialRotation = 0), this._isRotationEnabled = t },
            get rotation() { return this.camera.rotation },
            set rotation(t) {
                if (this.camera.rotation = t, this._updateDisplay(), !this.cameraAnimation || !this.cameraAnimation.rotating) {
                    var e = this.node.delegate;
                    e && "function" == typeof e.mapRotationDidChange && e.mapRotationDidChange(this.node)
                }
            },
            updateNetworkConfiguration: function(t) { this._renderer.updateNetworkConfiguration(this.networkConfigurationFor(t)) },
            forceRerender: function() { this._renderer.forceRerender() },
            adjustForSize: function(t) { o.prototype.adjustForSize.call(this, t), this.forceRerender() },
            adjustMapItemPoint: function(t) { return this.cameraIsZooming || this.cameraIsPanning || this.cameraIsRotating ? t : (t.x = l.roundToDevicePixel(t.x), t.y = l.roundToDevicePixel(t.y), t) },
            networkConfigurationFor: function(t) { return t ? { madabaDomains: t.madabaDomains, rasterTiles: t.types, tileGroup: t.tileGroup, accessKey: t.accessKey, accessKeyHasExpired: t.accessKeyHasExpired.bind(t), syrupRequestedFallback: t.syrupRequestedFallback.bind(t) } : {} },
            rotateCameraAroundMapPoint: function(t, e) {
                this.camera.rotateAroundCenter(t, e), this._updateDisplay();
                var i = this.node.delegate;
                i && "function" == typeof i.mapRotationDidChange && i.mapRotationDidChange(this.node)
            },
            deactivate: function() { o.prototype.deactivate.call(this), this._renderer.deactivate() },
            destroy: function(t) { o.prototype.destroy.call(this, t), this.customCanvas && this.customCanvas.remove(), this._renderer.destroy(), this._renderer = null },
            stringInfo: function() { return "SyrupNode<camera:" + this.camera.toString() + ">" },
            get backgroundGridTheme() { return this._backgroundGridTheme },
            set backgroundGridTheme(t) { this._backgroundGridTheme = t },
            get fullyRendered() { return this._renderer.fullyRendered },
            get customCanvas() { return this._renderer && this._renderer.canvas },
            get camera() { return this._camera },
            set camera(t) { this._camera = t, this.node.needsDisplay = !0 },
            get language() { return this._language },
            set language(t) { this._language !== t && (this._language = t, this._renderer && (this._renderer.language = t, this.node.needsDisplay = !0)) },
            updateConfiguration: function(t) {
                var e = this._configuration && t.name !== this._configuration.name;
                o.prototype.updateConfiguration.call(this, t), e && this._renderer && (this._renderer.updateConfiguration(t, this._showsPointsOfInterest), this.node.needsDisplay = !0)
            },
            updateShowsPointsOfInterest: function() { this._renderer && this._configuration && (this._renderer.updateShowsPointsOfInterest(this._configuration, this._showsPointsOfInterest), this.node.needsDisplay = !0) },
            devicePixelRatioDidChange: function() { return !this._renderer },
            get snapsToIntegralZoomLevels() { return this._renderer.snapsToIntegralZoomLevels },
            get debug() { return this._debug },
            set debug(t) { this._debug !== !!t && (this._debug = !!t, this._debug ? this._showDebugPanel() : this._hideDebugPanel()) },
            minZoomLevelForViewportSize: function(t, e) { return this._renderer && this._renderer.Camera ? this._renderer.Camera.getMinZoomLevel([t.width, t.height], e) : this.minZoomLevel },
            needsReplacing: function(t) { return !t },
            createLabelRegion: function() { return this._renderer.createLabelRegion() },
            updatedLabelRegion: function() { this.forceRerender(), this.node.needsDisplay = !0 },
            unregisterLabelRegion: function(t) { return this._renderer.unregisterLabelRegion(t) },
            _tileOverlaysDidChange: function() { this._fallback() },
            _showDebugPanel: function() { this._debugPanel = new s(function() { this.debug = !1 }.bind(this), this.camera), this._debugPanel.attachTo(this._element), this._cameraChangesMayHaveEnded = function(t) { o.prototype._cameraChangesMayHaveEnded.call(this, t) && this._debugPanel && this._debugPanel.update(this.camera) } },
            _hideDebugPanel: function() { this._debugPanel.detach(), delete this._debugPanel, delete this._cameraChangesMayHaveEnded },
            _updateDisplay: function() { this.forceRerender(), this.node.needsDisplay = !0, this._cameraDidChange() }
        }), e.exports = n
    }, { "./background-grid-node": 8, "./base-map-node-internal": 9, "./initial-interaction-controller": 15, "./rotation-controller": 20, "./syrup-debug-panel": 23, "@maps/device-pixel-ratio": 61, "@maps/js-utils": 84 }],
    25: [function(t, e, i) {
        function n() { o.call(this), this._renderer = new s(this), Object.defineProperty(this, "_impl", { value: new a(this) }) }
        var o = t("./base-map-node"),
            s = t("./render-syrup-map"),
            a = t("./syrup-map-node-internal"),
            r = t("@maps/js-utils"),
            l = t("@maps/scheduler");
        n.prototype = r.inheritPrototype(o, n, { get isRotationEnabled() { return this._impl.isRotationEnabled }, set isRotationEnabled(t) { this._impl.isRotationEnabled = t }, get customCanvas() { return this._impl.customCanvas }, set needsDisplay(t) { t && l.scheduleDraw(this._renderer) }, init: function(t, e, i, n, o) { this._impl.init(t, e, i, n, o) }, updateNetworkConfiguration: function(t) { this._impl.updateNetworkConfiguration(t) }, forceRerender: function() { this._impl.forceRerender() }, rotateCameraAroundMapPoint: function(t, e) { this._impl.rotateCameraAroundMapPoint(t, e) } }), e.exports = n
    }, { "./base-map-node": 10, "./render-syrup-map": 19, "./syrup-map-node-internal": 24, "@maps/js-utils": 84, "@maps/scheduler": 106 }],
    26: [function(t, e, i) {
        function n(t, e) {
            var i = Math.pow(2, t.zoom),
                n = i * o.tileSize,
                r = t.viewportSize.width / n / 2,
                c = t.viewportSize.height / n / 2,
                u = new o.MapPoint(t.center.x - r, t.center.y - c),
                d = new o.MapPoint(t.center.x + r, t.center.y + c),
                p = i - 1,
                m = Math.floor(s.mod(u.x, 1) * i),
                g = Math.floor(s.mod(d.x, 1) * i),
                _ = s.clamp(Math.floor(u.y * i), 0, p),
                f = s.clamp(Math.floor(d.y * i), 0, p);
            this.range = new l(new h(m, _, t.zoom), new h(g, f, t.zoom)), this.settings = e, this.resolution = a(), this.zoom = t.zoom, this.mapRect = new o.MapRect(m / i, _ / i, (g - m) / i, (f - _) / i), this.mapRect.size.width < 0 && this.mapRect.size.width++
        }
        var o = t("../../geo"),
            s = t("@maps/js-utils"),
            a = t("@maps/device-pixel-ratio"),
            r = t("./tile-manager"),
            l = t("./tile-range"),
            h = t("@maps/geometry/point");
        n.prototype = {
            constructor: n,
            equals: function(t) { return this.sameSettings(t) && this.resolution === t.resolution && this.range.equals(t.range) },
            sameSettings: function(t) {
                var e = this.settings,
                    i = t.settings;
                return e.configuration === i.configuration && e.showsPOI === i.showsPOI && e.language === i.language && e.showsDefaultTiles === i.showsDefaultTiles && e.showsTileInfo === i.showsTileInfo && this.sameTileOverlays(t)
            },
            sameTileOverlays: function(t) { return this.settings.tileOverlays.length === t.settings.tileOverlays.length && this.settings.tileOverlays.every(function(e, i) { return e === t.settings.tileOverlays[i] & !e._impl.stale }, this) },
            sharesTileSourcesWithTileData: function(t) {
                var e = this.settings.configuration.tileSources,
                    i = t.settings.configuration.tileSources;
                return !("AutoNavi" !== this.settings.configuration.provider || "AutoNavi" !== t.settings.configuration.provider || 1 !== e.length || 1 !== i.length || "satellite" !== e[0].name && "hybrid" !== e[0].name || "satellite" !== i[0].name && "hybrid" !== i[0].name) || i.some(function(t) { return -1 !== e.indexOf(t) })
            },
            load: function() { this._tiles || (this._tiles = r.tilesForTileData(this)) },
            cancel: function() {
                if (!this._canceled && (this._canceled = !0, this._tiles))
                    for (var t = 0, e = this._tiles, i = e.length; t < i; ++t) e[t].unschedule()
            },
            releaseTiles: function() {
                if (this._tiles)
                    for (var t = 0, e = this._tiles, i = e.length; t < i; ++t) r.releaseTile(e[t], this)
            },
            get tiles() { return this.load(), this._tiles }
        }, e.exports = n
    }, { "../../geo": 2, "./tile-manager": 31, "./tile-range": 34, "@maps/device-pixel-ratio": 61, "@maps/geometry/point": 69, "@maps/js-utils": 84 }],
    27: [function(t, e, i) {
        function n(t) { a.GroupNode.call(this), this._scale = 1, this._nodesByTileKey = {}, this._fadingNodes = [], this._debug = !!t }

        function o(t) { var e = new u(t.tileSource); return e.size = m, t.loaderState === d.Succeeded && (e.image = t.image, e.opacity = t.preferredOpacity), e }
        var s = t("../../geo"),
            a = t("../../scene-graph"),
            r = t("@maps/js-utils"),
            l = t("@maps/scheduler"),
            h = t("./debug-node"),
            c = t("./tile"),
            u = t("./tile-image-node"),
            d = t("@maps/loaders").State,
            p = new a.Matrix,
            m = new a.Size(s.tileSize, s.tileSize);
        n.prototype = r.inheritPrototype(a.GroupNode, n, {
            stale: !1,
            fullyRendered: !1,
            _pendingTileCount: 0,
            _tileData: null,
            get locked() { return this.wantsLayerBacking },
            set locked(t) { t !== this.wantsLayerBacking && (t && this._fadingNodes.length > 0 ? this.wantsLayerBacking = !0 : !t && this._wantsLayerBacking ? this.wantsLayerBacking = !1 : this.frozen = t) },
            get tileData() { return this._tileData },
            setTileDataAnimated: function(t, e) {
                this._fadingNodes = [], delete this._failedTileAndImage;
                var i = t.tiles,
                    n = t.range.min,
                    o = Math.pow(2, n.z);
                this._tileData && this._tileData.tiles.forEach(function(t) {
                    if (t.removeEventListener(c.Events.LoadSuccess, this), t.removeEventListener(c.Events.LoadFail, this), -1 === i.indexOf(t)) {
                        var e = t.key,
                            n = this._nodesByTileKey[e];
                        n && (n.remove(), delete this._nodesByTileKey[e])
                    }
                }, this), this._tileData = t, this.fullyRendered = !1, this._pendingTileCount = i.length;
                var l = this.childCount;
                i.forEach(function(t) {
                    var i = new a.Point(r.mod(t.x - n.x, o) * s.tileSize, (t.y - n.y) * s.tileSize),
                        h = this._ensureNodeForTile(t);
                    h.position = i, h.opacity = 0, this.addChild(h), t.loaded ? ((l > 0 || !e) && (h.opacity = 1), this._tileDidLoad(t)) : (t.addEventListener(c.Events.LoadSuccess, this), t.addEventListener(c.Events.LoadFail, this))
                }, this)
            },
            get pendingTileCount() { return this._pendingTileCount },
            set scale(t) { t !== this._scale && (this._scale = t, this.transform = 1 === t ? p : (new a.Matrix).scale(t)) },
            get debug() { return this._debug },
            stringInfo: function() { return "TileGridNode" + (this.tileData ? "<range:(" + this.tileData.range.toString() + ")>" : "") },
            get cssBackgroundProperty() { if (!this.fullyRendered) return ""; var t = this.position; return Array.prototype.concat.apply([], this._tileData.tiles.map(function(e) { var i = this._nodesByTileKey[e.key]; return e.tileImages.reduce(function(e, n, o) { return "url(" + n.image.src + ") " + (t.x + i.position.x) + "px " + (t.y + i.position.y) + "px / " + s.tileSize + "px no-repeat" + (0 === o ? "" : ", ") + e }, "") }, this)).join(", ") },
            handleEvent: function(t) {
                var e = t.target;
                switch (t.type) {
                    case c.Events.LoadSuccess:
                        e.removeEventListener(c.Events.LoadSuccess, this), this._tileDidLoad(e);
                        break;
                    case c.Events.LoadFail:
                        this._tileLoadFail(e, t.tileImage)
                }
            },
            performScheduledUpdate: function() { this._updateFadingNodes(), 0 === this._pendingTileCount && 0 === this._fadingNodes.length && this._allTilesDidDraw() },
            _tileDidLoad: function(t) {
                0 === --this._pendingTileCount && this._failedTileAndImage && (this._failedTileAndImage.tile._requestTileImageLoadStatus(this._failedTileAndImage.tileImage, this._handleTileImageLoadStatus.bind(this)), delete this._failedTileAndImage);
                var e = this._nodesByTileKey[t.key];
                if (0 === e.childCount) {
                    var i = t.tileImages;
                    if (e.children = i.map(o), this.debug) {
                        var n = new h(t);
                        n.size = m, e.addChild(n)
                    }
                }
                e.opacity < 1 ? (this._fadingNodes.push(e), l.scheduleASAP(this)) : 0 === this._pendingTileCount && this._allTilesDidDraw()
            },
            _tileLoadFail: function(t, e) { this._failedTileAndImage = { tile: t, tileImage: e } },
            _handleTileImageLoadStatus: function(t) {
                if (403 === t.target.status) {
                    var e = this.parent._map.node.delegate;
                    e && e.tileAccessForbidden()
                }
            },
            _updateFadingNodes: function() {
                var t = Date.now();
                this._fadingNodes = this._fadingNodes.filter(function(e) { return e._startTime ? e.opacity = Math.min(1, (t - e._startTime) / 300) : 0 === e.opacity && (e._startTime = t), 1 !== e.opacity || (delete e._startTime, !1) }), this._fadingNodes.length > 0 ? l.scheduleOnNextFrame(this) : this._wantsLayerBacking && (this.wantsLayerBacking = !1, this.frozen = !0)
            },
            _allTilesDidDraw: function() { this.fullyRendered = !0, this.parent && this.parent.tileGridDidFinishRendering(this) },
            _ensureNodeForTile: function(t) {
                var e = t.key,
                    i = this._nodesByTileKey[e];
                return i || (i = this._nodesByTileKey[e] = new a.GroupNode), i
            }
        }), e.exports = n
    }, { "../../geo": 2, "../../scene-graph": 47, "./debug-node": 13, "./tile": 35, "./tile-image-node": 29, "@maps/js-utils": 84, "@maps/loaders": 85, "@maps/scheduler": 106 }],
    28: [function(t, e, i) {
        function n(t) { a.GroupNode.call(this), this._map = t }
        var o = t("../../geo"),
            s = t("@maps/scheduler"),
            a = t("../../scene-graph"),
            r = t("@maps/device-pixel-ratio"),
            l = t("./tile-grid-node"),
            h = t("./tile-data"),
            c = t("@maps/js-utils");
        n.prototype = c.inheritPrototype(a.GroupNode, n, {
            fullyRendered: !1,
            scheduleRefresh: function() { this.children.forEach(function(t) { t.stale = !0 }), this.invalidate() },
            destroy: function() { this._releaseChildren(!0) },
            invalidate: function() { this.fullyRendered = !1, s.scheduleASAP(this) },
            stringInfo: function() { return "TileGridsGroupNode" },
            get cssBackgroundProperty() { return this.fullyRendered ? this.lastChild.cssBackgroundProperty : "" },
            handleEvent: function(t) { this.scheduleRefresh() },
            performScheduledUpdate: function() {
                if (this._canDraw()) {
                    var t = this._map,
                        e = t.camera,
                        i = this.lastChild,
                        n = !!i && i.debug !== this._map.debug,
                        s = !!i && i.tileData.settings.showsDefaultTiles !== this._map.showsDefaultTiles;
                    if (!this._tileDataAtZoomCompletion) {
                        var l;
                        if (Math.round(e.zoom) === e.zoom) l = new h(e, t.tileSettings);
                        else {
                            if (!i) return;
                            l = i.tileData
                        }
                        if (i) {
                            if ((i.stale || !i.locked) && (!l.equals(i.tileData) || n || s)) {
                                var c = i.tileData;
                                c.tiles.forEach(function(t) { l.tiles.indexOf(t) < 0 && t.unschedule() });
                                var u = l.settings.configuration === c.settings.configuration,
                                    d = l.sameSettings(c) && l.resolution === c.resolution && !n;
                                if (u ? !d : l.sharesTileSourcesWithTileData(c)) i.locked = !0, this._addNewTileGridAnimated(l, !0);
                                else if (!i.locked) {
                                    delete i.stale, i.setTileDataAnimated(l, u);
                                    var p = this._children[this._children.length - 2];
                                    p && !l.sharesTileSourcesWithTileData(p.tileData) && (this._releaseChildren(!1), this._children = [i])
                                }
                            }
                        }
                        else this._addNewTileGridAnimated(l, !1)
                    }
                    for (var m = e.zoom, g = t.visibleMapRect, _ = g.origin, f = g.size, y = 0, v = this.children, w = v.length; y < w; ++y) {
                        var b = v[y],
                            C = b.tileData,
                            S = C.zoom,
                            L = C.mapRect.origin,
                            T = Math.pow(2, m - S),
                            E = Math.pow(2, S) * (o.tileSize * T),
                            x = L.x - _.x;
                        if (x > f.width) x--;
                        else {
                            var M = C.mapRect.size.width;
                            M > 0 && x + M < 0 && x++
                        }
                        b.scale = T, b.position = new a.Point(r.roundToDevicePixel(x * E), r.roundToDevicePixel((L.y - _.y) * E)), y < w - 1 && C.cancel()
                    }
                    this.fullyRendered = w > 0 && this.children[w - 1].fullyRendered
                }
            },
            cameraWillStartZooming: function(t) {
                if (this._canDraw()) {
                    var e = this._map;
                    t && (this._tileDataAtZoomCompletion = new h(t, e.tileSettings), this._tileDataAtZoomCompletion.load()), this.children.forEach(function(t) { t.locked = !0 })
                }
            },
            cameraDidStopZooming: function() {
                if (this._canDraw())
                    if (this._tileDataAtZoomCompletion) this._addNewTileGridAnimated(this._tileDataAtZoomCompletion, !0, !0), delete this._tileDataAtZoomCompletion;
                    else {
                        var t = this._map,
                            e = this.lastChild;
                        if (e && t.camera.zoom === e.tileData.zoom) e.locked = !1;
                        else {
                            var i = new h(t.camera, t.tileSettings);
                            this._addNewTileGridAnimated(i, !0, !0)
                        }
                    }
            },
            tileGridDidFinishRendering: function(t) {
                var e = this.children,
                    i = e.length,
                    n = e[i - 1];
                if (n.fullyRendered && !n.locked) {
                    for (var o = 0; o < i - 1; ++o) e[o].tileData.releaseTiles();
                    i > 1 && (this.children = [n]), this.fullyRendered = !0, this._map.tileGridDidFinishRendering()
                }
            },
            _canDraw: function() { var t = this._map; return t && !!t.configuration && !!t.language },
            _addNewTileGridAnimated: function(t, e, i) {
                var n = new l(this._map.debug),
                    o = this.lastChild;
                o && !t.sharesTileSourcesWithTileData(o.tileData) ? (this._releaseChildren(!0), this.children = [n]) : this.addChild(n), n.setTileDataAnimated(t, e), i && s.scheduleASAP(this)
            },
            _releaseChildren: function(t) {
                for (var e = this.childCount - (t ? 1 : 2); e >= 0; --e) {
                    var i = this.children[e].tileData;
                    i.cancel(), i.releaseTiles()
                }
            }
        }), e.exports = n
    }, { "../../geo": 2, "../../scene-graph": 47, "./tile-data": 26, "./tile-grid-node": 27, "@maps/device-pixel-ratio": 61, "@maps/js-utils": 84, "@maps/scheduler": 106 }],
    29: [function(t, e, i) {
        function n(t) { o.ImageNode.call(this), this._tileSource = t._public, this._tileSource && "function" == typeof this._tileSource.addEventListener && this._tileSource.addEventListener(s.OPACITY_EVENT, this) }
        var o = t("../../scene-graph"),
            s = t("./tile-overlay-internal"),
            a = t("@maps/js-utils");
        n.prototype = a.inheritPrototype(o.ImageNode, n, { handleEvent: function() { this._tileSource && (this.opacity = this._tileSource.opacity) }, wasRemoved: function() { setTimeout(function() { this.parent && this.parent.scene || this._tileSource && "function" == typeof this._tileSource.removeEventListener && this._tileSource.removeEventListener(s.OPACITY_EVENT, this) }.bind(this), 0) } }), e.exports = n
    }, { "../../scene-graph": 47, "./tile-overlay-internal": 32, "@maps/js-utils": 84 }],
    30: [function(t, e, i) {
        function n(t, e, i, n, s, a, r, l) { this.x = t, this.y = e, this.z = i, this.tileSource = n, this.language = s, this.showsPOI = a, this.resolution = r, this._priority = l, this._loader = o(l, this) }

        function o(t, e) { var i; return l.length > 0 ? (i = l.shift()).reuse(t, e) : i = new s.ImageLoader(t, e), i }
        var s = t("@maps/loaders"),
            a = t("@maps/js-utils"),
            r = {},
            l = [];
        n.prototype = {
            constructor: n,
            get preferredOpacity() { return "number" == typeof this.tileSource.opacity ? this.tileSource.opacity : 1 },
            get loaderState() { return this._loader ? this._loader.state : s.State.Unscheduled },
            schedule: function() { this._loader || (this._loader = o(this._priority, this)), this._loader.state > s.State.Unscheduled || this._loader.schedule() },
            unschedule: function() { this._loader && this._loader.unschedule() && (l.push(this._loader), this._loader = null) },
            whenDoneLoading: function(t) { this._loader && this._loader.state > s.State.Loading ? t(this) : this._doneLoadingCallback = t },
            get urlForImageLoader() {
                var t = this.tileSource;
                if ("function" == typeof t.urlForImageLoader) return t.urlForImageLoader(this.x, this.y, this.z, this.resolution);
                var e = t.domains,
                    i = t.protocol,
                    n = t.supportedResolutions[0],
                    o = t.supportedResolutions[t.supportedResolutions.length - 1],
                    s = a.clamp(this.resolution, n, o),
                    l = a.fillTemplate(t.path, { tileSizeIndex: 1, x: this.x, y: this.y, z: this.z, resolution: s, lang: this.language, poi: this.showsPOI ? 1 : 0 }),
                    h = r[l];
                return h || (h = i + "//" + e[(this.x + this.y) % e.length] + l, r[l] = h, h)
            },
            loaderDidSucceed: function(t) { this._loaderDidComplete() },
            loaderDidFail: function(t) { this._loaderDidComplete() },
            _loaderDidComplete: function() { this.image = this._loader.image, "function" == typeof this._doneLoadingCallback && (this._doneLoadingCallback(this), delete this._doneLoadingCallback) }
        }, e.exports = n
    }, { "@maps/js-utils": 84, "@maps/loaders": 85 }],
    31: [function(t, e, i) {
        function n(t, e, i, n) { return n.settings.configuration.provider + n.settings.configuration.name + t + "-" + e + "-" + i + n.settings.language + n.settings.showsPOI + n.settings.showsDefaultTiles + n.settings.showsTileInfo + n.resolution + n.settings.tileOverlays.map(function(n) { return n._impl.keyForTile(t, e, i) }).join("-") }

        function o(t, e, i, o, r) {
            var l = n(t, e, i, o),
                h = u[l];
            return h ? h.schedule() : ((h = new c(l, t, e, i, o.settings, o.resolution, r)).addEventListener(c.Events.LoadSuccess, s), h.addEventListener(c.Events.LoadFail, a), u[l] = h, h._refCount = 0, h._loadTileImages()), h._refCount++, h
        }

        function s(t) {
            var e = t.target;
            e.removeEventListener(c.Events.LoadSuccess, s), e.removeEventListener(c.Events.LoadFail, a)
        }

        function a(t) {
            var e = t.target;
            delete u[e.key], e.removeEventListener(c.Events.LoadSuccess, s), e.removeEventListener(c.Events.LoadFail, a)
        }
        var r = t("@maps/loaders"),
            l = t("@maps/geometry/point"),
            h = t("@maps/js-utils"),
            c = t("./tile"),
            u = {};
        e.exports = {
            tilesForTileData: function(t) {
                for (var e = t.range, i = e.min.z, n = Math.pow(2, i), s = e.min, a = e.denormalize().max, c = new l((s.x + a.x) / 2, (s.y + a.y) / 2), u = [], d = Math.min(a.x, s.x + n - 1), p = s.x; p <= d; ++p)
                    for (var m = s.y; m <= a.y; ++m) u.push(new l(p, m));
                return u.sort(function(t, e) { var i = t.distanceToPoint(c) - e.distanceToPoint(c); return 0 === i ? t.x - e.x == 0 ? t.y - e.y : t.x - e.x : i }), u.map(function(e) { return o(h.mod(e.x, n), e.y, i, t, r.Priority.High) })
            },
            releaseTile: function(t, e) {
                if (t._refCount--, 0 === t._refCount) {
                    t.unschedule();
                    var i = n(t.x, t.y, t.z, e);
                    delete u[i]
                }
            }
        }
    }, { "./tile": 35, "@maps/geometry/point": 69, "@maps/js-utils": 84, "@maps/loaders": 85 }],
    32: [function(t, e, i) {
        function n(t, e, i) { s.EventTarget(t), this._public = t, i = a.checkOptions(i), r.forEach(function(t) { t in i && (this[t] = i[t]) }, this), Object.keys(i).forEach(function(t) { r.indexOf(t) < 0 && console.warn("[MapKit] Unknown option: " + t + ". Use the data property to store custom data.") }), this.urlTemplate = e, void 0 === this.opacity && (this.opacity = l), this.stale = !1 }

        function o(t) { return t.replace(/\{/g, "{{").replace(/\}/g, "}}") }
        var s = t("@maps/dom-events"),
            a = t("@maps/js-utils"),
            r = ["minimumZ", "maximumZ", "opacity", "data"],
            l = 1;
        n.RELOAD_EVENT = "tile-overlay-reload", n.OPACITY_EVENT = "tile-overlay-opacity-changed", n.prototype = {
            constructor: n,
            _minimumZ: null,
            _maximumZ: null,
            get urlTemplate() { return this._urlTemplate },
            set urlTemplate(t) { var e = typeof t; if ("function" !== e && "string" !== e) { var i = "[MapKit] TileOverlay.urlTemplate expected a function or a string, but got `" + t + "` instead."; throw new TypeError(i) } this._urlTemplate = t },
            keyForTile: function(t, e, i) { return this._minimumZ + "-" + this._maximumZ + "-" + this.urlForImageLoader(t, e, i, 1) },
            get minimumZ() { return this._minimumZ },
            get minZoomLevel() { return this._minimumZ },
            set minimumZ(t) {
                var e = "[MapKit] TileOverlay.minimumZ expected a number, but got `" + t + "` instead.";
                a.checkType(t, "number", e), this._minimumZ = Math.floor(t)
            },
            get maximumZ() { return this._maximumZ },
            get maxZoomLevel() { return this._maximumZ },
            set maximumZ(t) {
                var e = "[MapKit] TileOverlay.maximumZ expected a number, but got `" + t + "` instead.";
                a.checkType(t, "number", e), this._maximumZ = Math.ceil(t)
            },
            get opacity() { return this._opacity },
            set opacity(t) {
                var e = "[MapKit] TileOverlay.opacity expected a number, but got `" + t + "` instead.";
                a.checkType(t, "number", e), this._opacity = a.clamp(t, 0, 1);
                var i = new s.Event(n.OPACITY_EVENT);
                i.tileOverlay = this, i.opacity = this._opacity, this._public.dispatchEvent(i)
            },
            get data() { return this.hasOwnProperty("_data") || (this._data = {}), this._data },
            set data(t) {
                var e = "[MapKit] TileOverlay.data expected an Object, but got `" + t + "` instead.";
                a.checkType(t, "object", e), this._data = t
            },
            reload: function() {
                this.stale = !0;
                var t = new s.Event(n.RELOAD_EVENT);
                t.tileOverlay = this, this._public.dispatchEvent(t)
            },
            reloadComplete: function() { this.stale = !1 },
            urlForImageLoader: function(t, e, i, n) {
                if (this._urlTemplate) {
                    if ("function" == typeof this._urlTemplate) return this._urlTemplate(t, e, i, n, this._data);
                    var s = o(this._urlTemplate),
                        r = {};
                    return this._data && Object.keys(this._data).forEach(function(t) { r[t] = this._data[t] }, this), r.x = t, r.y = e, r.z = i, r.scale = n, a.fillTemplate(s, r)
                }
            },
            dispatchErrorForURL: function(t) {
                var e = new s.Event("tile-error");
                e.tileOverlay = this._public, e.tileUrl = t, this._public.dispatchEvent(e)
            }
        }, e.exports = n
    }, { "@maps/dom-events": 62, "@maps/js-utils": 84 }],
    33: [function(t, e, i) {
        function n(t, e) { Object.defineProperty(this, "_impl", { value: new o(this, t, e) }) }
        var o = t("./tile-overlay-internal");
        n.prototype = { constructor: n, get urlTemplate() { return this._impl.urlTemplate }, set urlTemplate(t) { this._impl.urlTemplate = t }, get minimumZ() { return this._impl.minimumZ }, set minimumZ(t) { this._impl.minimumZ = t }, get maximumZ() { return this._impl.maximumZ }, set maximumZ(t) { this._impl.maximumZ = t }, get opacity() { return this._impl.opacity }, set opacity(t) { this._impl.opacity = t }, get data() { return this._impl.data }, set data(t) { this._impl.data = t }, reload: function() { this._impl.reload() } }, e.exports = n
    }, { "./tile-overlay-internal": 32 }],
    34: [function(t, e, i) {
        function n(t, e) { this.min = t, this.max = e } n.prototype = {
            constructor: n,
            denormalize: function() {
                var t = this.min.copy(),
                    e = this.max.copy();
                return e.x < t.x && (e.x += Math.pow(2, t.z)), new n(t, e)
            },
            toString: function() { return this.min.toString() + " -> " + this.max.toString() },
            equals: function(t) {
                var e = this.denormalize(),
                    i = t.denormalize();
                return i.min.x === e.min.x && i.min.y === e.min.y && i.max.x === e.max.x && i.max.y === e.max.y && i.min.z === e.min.z && i.max.z === e.max.z
            }
        }, e.exports = n
    }, {}],
    35: [function(t, e, i) {
        function n(t, e, i, n, s, a, r) { o.EventTarget(this), this.key = t, this.x = e, this.y = i, this.z = n, this.settings = s, this.resolution = a, this.priority = r, this.tileImages = [] }
        var o = t("@maps/dom-events"),
            s = t("@maps/loaders"),
            a = t("@maps/js-utils"),
            r = t("./tile-image");
        n.Events = { LoadSuccess: "tile-load-success", LoadFail: "tile-load-fail" }, n.prototype = {
            constructor: n,
            loading: !1,
            loaded: !1,
            get tileSources() { return (this.settings.showsDefaultTiles ? this.settings.configuration.tileSources : []).concat(this.settings.tileOverlays.map(function(t) { return t._impl }).filter(function(t) { return !!t.urlForImageLoader(this.x, this.y, this.z, this.resolution) }, this)).filter(function(t) { return (this.z >= t.minZoomLevel || "number" != typeof t.minZoomLevel) && (this.z <= t.maxZoomLevel || "number" != typeof t.maxZoomLevel) }, this) },
            schedule: function() { this.loaded || (this.tileImages.forEach(function(t) { t.schedule() }), this.loading = !0) },
            unschedule: function() { this.tileImages.forEach(function(t) { t.unschedule() }), this.loading = !1 },
            _loadTileImages: function() {
                if (!this.loading) {
                    if (this.loaded) {
                        if (!this._containsCanceledTileImages()) return;
                        this.tileImages = [], this.loaded = !1
                    }
                    this.loading = !0;
                    var t = this.tileSources;
                    0 !== t.length ? (this._pendingTileImageLoads = t.length, t.forEach(this._loadTileImage, this)) : this._allTileImagesDoneLoading()
                }
            },
            _loadTileImage: function(t) {
                var e = this.settings,
                    i = new r(this.x, this.y, this.z, t, e.language, e.showsPOI, this.resolution, this.priority);
                i.schedule(), this.tileImages.push(i), i.whenDoneLoading(this._tileImageDoneLoading.bind(this, t))
            },
            _requestTileImageLoadStatus: function(t, e) {
                var i = a.xhr(e, t.image.src);
                i.open("GET", t.image.src, !0), i.send()
            },
            _tileImageDoneLoading: function(t, e) {
                if (e._loader.state === s.State.Failed)
                    if ("function" == typeof t.dispatchErrorForURL) t.dispatchErrorForURL(e._loader.url);
                    else {
                        var i = new o.Event(n.Events.LoadFail);
                        i.tileImage = e, this.dispatchEvent(i)
                    }
                0 === --this._pendingTileImageLoads && this._allTileImagesDoneLoading()
            },
            _allTileImagesDoneLoading: function() { delete this._pendingTileImageLoads, this.loading = !1, this.loaded = !0, this._containsCanceledTileImages() || this.dispatchEvent(new o.Event(n.Events.LoadSuccess)) },
            _containsCanceledTileImages: function() { return this.tileImages.some(function(t) { return t.loaderState === s.State.Canceled }) }
        }, e.exports = n
    }, { "./tile-image": 30, "@maps/dom-events": 62, "@maps/js-utils": 84, "@maps/loaders": 85 }],
    36: [function(t, e, i) {
        function n(t) { c.call(this, t), this._pinchRecognizer = this.addRecognizer(new a.Pinch), this._pinchRecognizer.scaleThreshold = .1, this._doubleTapWithOneFingerRecognizer = this.addRecognizer(new a.Tap), this._doubleTapWithOneFingerRecognizer.numberOfTouchesRequired = 1, this._doubleTapWithOneFingerRecognizer.numberOfTapsRequired = 2, this._singleTapWithTwoFingersRecognizer = this.addRecognizer(new a.Tap), this._singleTapWithTwoFingersRecognizer.numberOfTouchesRequired = 2, this._singleTapWithTwoFingersRecognizer.numberOfTapsRequired = 1, this.map.node.element.addEventListener("wheel", this) }

        function o(t) { return t.state === a.States.Began || t.state === a.States.Changed }
        var s = t("../../geo"),
            a = t("@maps/gesture-recognizers"),
            r = t("@maps/js-utils"),
            l = t("@maps/scheduler"),
            h = t("@maps/geometry/point"),
            c = t("./gesture-controller"),
            u = t("./camera"),
            d = Math.pow(1e-4, 2.5);
        n.prototype = r.inheritPrototype(c, n, {
            decelerating: !1,
            stopDecelerating: function() { this.decelerating && this._decelerationEnded() },
            destroy: function() { c.prototype.destroy.call(this), delete this._pinchRecognizer, delete this._doubleTapWithOneFingerRecognizer, delete this._singleTapWithTwoFingersRecognizer, this.map.node.element.removeEventListener("wheel", this), this.stopDecelerating() },
            get active() { return o(this._pinchRecognizer) || o(this._doubleTapWithOneFingerRecognizer) || o(this._singleTapWithTwoFingersRecognizer) },
            handleEvent: function(t) {
                if ("wheel" !== t.type) {
                    var e = t.target;
                    switch (e) {
                        case this._pinchRecognizer:
                            this._handlePinchChange(e);
                            break;
                        case this._doubleTapWithOneFingerRecognizer:
                            this._handleDoubleTapWithOneFingerChange(e);
                            break;
                        case this._singleTapWithTwoFingersRecognizer:
                            this._handleSingleTapWithTwoFingersChange(e)
                    }
                }
                else this._handleWheelEvent(t)
            },
            performScheduledUpdate: function() {
                if (this._snapping, this.decelerating) {
                    var t = this.map,
                        e = Date.now() - this._startTime;
                    if (e >= this._decelerationDuration) return t.scaleCameraAroundMapPoint(this._adjustedScaleAtDecelerationEnd / this._scale, this._lastScaleCenter), void this._decelerationEnded();
                    var i = this._scaleAtTime(e),
                        n = (i - this._initialScale) / (this._scaleAtDecelerationEnd - this._initialScale);
                    i += this._scaleAdjustment * n, t.scaleCameraAroundMapPoint(i / this._scale, this._lastScaleCenter);
                    var o = t.camera.zoom;
                    o === t.minZoomLevel || o === this.maxZoomLevel ? this.stopDecelerating() : (this._scale = i, this._schedule())
                }
            },
            _centerWithRecognizer: function(t) { return this._mapPointFromCentroid(t.locationInElement()) },
            _mapPointFromCentroid: function(t) {
                var e = this.map,
                    i = e.node.convertPointFromPage(t);
                i = e.camera.transformGestureCenter(i);
                var n = e.visibleMapRect,
                    o = e.camera.viewportSize;
                return new s.MapPoint(n.minX() + i.x / o.width * n.size.width, n.minY() + i.y / o.height * n.size.height)
            },
            _handlePinchChange: function(t) {
                var e = this.map,
                    i = e.camera,
                    n = i.zoom;
                if (t.state === a.States.Began) this._singleTapWithTwoFingersRecognizer.enabled = !1, e.cameraWillStartZooming();
                else if (t.state === a.States.Ended || t.state === a.States.Changed) {
                    var o = t.scale;
                    this._lastScaleCenter = this.centerForGesture(t), (o > 1 && e.camera.zoom !== e.maxZoomLevel || o < 1 && n !== e.minZoomLevel) && (e.scaleCameraAroundMapPoint(o, this._lastScaleCenter), t.scale = 1)
                }
                if ((t.state === a.States.Ended || t.state === a.States.Failed) && (this._singleTapWithTwoFingersRecognizer.enabled = !0, this._startDeceleratingWithVelocity(t.velocity), !this.decelerating)) {
                    var s = e.snapsToIntegralZoomLevels ? Math.round(n) : n,
                        l = r.clamp(s, e.minZoomLevel, e.maxZoomLevel);
                    n === l ? e.cameraDidStopZooming() : this._lastScaleCenter ? e.scaleCameraAroundMapPoint(Math.pow(2, l - n), this._lastScaleCenter, !0) : e.setCameraAnimated(new u(i.center, l, i.viewportSize, i.rotation), !0)
                }
            },
            _handleDoubleTapWithOneFingerChange: function(t) { t.state === a.States.Recognized && this._zoomWithTapRecognizer(t, t.modifierKeys.alt) },
            _handleSingleTapWithTwoFingersChange: function(t) { t.state === a.States.Recognized && this._zoomWithTapRecognizer(t, !0) },
            _handleWheelEvent: function(t) {
                if (t.shiftKey && !t.ctrlKey) {
                    t.preventDefault();
                    var e = 0,
                        i = 1 + .0075 * (e = t.deltaY > 0 ? Math.sqrt(t.deltaY) : -Math.sqrt(-t.deltaY)),
                        n = this.map;
                    this._wheelZooming || (n.cameraWillStartZooming(), this._wheelZooming = !0);
                    var o = new h(t.clientX, t.clientY);
                    this._lastScaleCenter = n.staysCenteredDuringZoom ? n.transformCenter : this._mapPointFromCentroid(o);
                    var s = n.camera.zoom;
                    (i > 1 && n.camera.zoom !== n.maxZoomLevel || i < 1 && s !== n.minZoomLevel) && n.scaleCameraAroundMapPoint(i, this._lastScaleCenter), this._wheelEndTimeout && (clearTimeout(this._wheelEndTimeout), this._wheelEndTimeout = null), this._wheelEndTimeout = setTimeout(function() {
                        this._wheelEndTimeout = !1, this._wheelZooming = !1;
                        var t = n.camera.zoom,
                            e = t;
                        n.snapsToIntegralZoomLevels && (e = Math.round(t));
                        var i = r.clamp(e, n.minZoomLevel, n.maxZoomLevel);
                        t === i ? n.cameraDidStopZooming() : n.scaleCameraAroundMapPoint(Math.pow(2, i - t), this._lastScaleCenter, !0)
                    }.bind(this), 100)
                }
            },
            _zoomWithTapRecognizer: function(t, e) {
                var i = this.map,
                    n = i.camera.zoom,
                    o = e ? -1 : 1,
                    s = (e ? Math.floor(n + .5) : Math.ceil(n - .5)) + o,
                    a = n - r.clamp(s, i.minZoomLevel, i.maxZoomLevel);
                Math.abs(a) < .5 || !i.cameraWillStartZooming(!0, !0) || i.setCameraAnimated(i.camera.withNewMapRect(i.visibleMapRect.scale(Math.pow(2, a), this.centerForGesture(t))), !0)
            },
            _startDeceleratingWithVelocity: function(t) { Math.abs(t) < 1 || (this.decelerating = !0, this._startTime = Date.now(), this._initialScale = this._scale = 1, this._initialVelocity = t / 1e3, this._decelerationFactor = .98875, this._decelerationDuration = Math.log(d / Math.pow(this._initialVelocity, 2)) / (2 * Math.log(this._decelerationFactor)), this._scaleAtDecelerationEnd = this._scaleAtTime(this._decelerationDuration), this._adjustedScaleAtDecelerationEnd = this._adjustScaleAtDecelerationEnd(this._scaleAtDecelerationEnd / this._scale), this._scaleAdjustment = this._adjustedScaleAtDecelerationEnd - this._scaleAtDecelerationEnd, this._schedule()) },
            _adjustScaleAtDecelerationEnd: function(t) {
                var e = this.map,
                    i = e.camera.zoom,
                    n = i + r.log2(t);
                if (e.snapsToIntegralZoomLevels) {
                    var o = Math.round(n);
                    n > i && o <= i ? o = Math.ceil(n) : n < i && o >= i && (o = Math.floor(n)), n = o
                }
                var s = r.clamp(n, e.minZoomLevel, e.maxZoomLevel);
                return Math.pow(2, s - i)
            },
            _schedule: function() { l.scheduleOnNextFrame(this) },
            _scaleAtTime: function(t) { return Math.max(this._initialScale + this._decelerationFactor * this._initialVelocity * (Math.pow(this._decelerationFactor, t) - 1) / (this._decelerationFactor - 1), 0) },
            _decelerationEnded: function() {
                this.decelerating = !1;
                var t = this.map;
                if (t.snapsToIntegralZoomLevels) {
                    var e = t.camera,
                        i = t.snapsToIntegralZoomLevels ? Math.round(e.zoom) : e.zoom;
                    t.setCameraAnimated(new u(e.center, i, e.viewportSize, e.rotation))
                }
                t.cameraDidStopZooming()
            }
        }), e.exports = n
    }, { "../../geo": 2, "./camera": 12, "./gesture-controller": 14, "@maps/geometry/point": 69, "@maps/gesture-recognizers": 72, "@maps/js-utils": 84, "@maps/scheduler": 106 }],
    37: [function(t, e, i) { e.exports = t("./src/scale-node") }, { "./src/scale-node": 45 }],
    38: [function(t, e, i) {
        "use strict";

        function n(t, e) {
            if (!e) return this._targetOpacity = t, void(this.opacity = t);
            t !== this._targetOpacity && (t !== this.opacity ? (this._targetOpacity = t, this._startTime = Date.now(), this._startOpacity = this._opacity, s.scheduleOnNextFrame(this)) : this._targetOpacity = t)
        }

        function o() {
            if ("function" == typeof this.constructor.prototype.performScheduledUpdate && this.constructor.prototype.performScheduledUpdate.call(this), null !== this._targetOpacity) {
                if (this._targetOpacity === this.opacity) return this._startTime = null, this._startOpacity = null, void(this._targetOpacity = null);
                var t = Date.now() - this._startTime,
                    e = this._targetOpacity - this._startOpacity,
                    i = Math.abs(e * this._totalDurationMs),
                    n = Math.min(t / i, 1),
                    o = a.easeInOut(n) * e + this._startOpacity;
                this.opacity = r.clamp(o, 0, 1), s.scheduleOnNextFrame(this)
            }
        }
        var s = t("@maps/scheduler"),
            a = t("../../../src/js/utils"),
            r = t("@maps/js-utils");
        e.exports = function(t, e) { return t._targetOpacity = null, t._startOpacity = null, t._startTime = null, t._totalDurationMs = e || 300, t.setOpacityAnimated = n, t.performScheduledUpdate = o, t }
    }, { "../../../src/js/utils": 225, "@maps/js-utils": 84, "@maps/scheduler": 106 }],
    39: [function(t, e, i) {
        "use strict";

        function n() { s.BaseNode.call(this), this._legend = null, this._segmentWidth = 0, this._segmentStart = 0, this._numberOfSegments = 0, this._fillColor = null, this._strokeColor = null, this._renderer = new o(this) }
        var o = t("./render-legend"),
            s = t("../../scene-graph"),
            a = t("@maps/js-utils");
        n.prototype = a.inheritPrototype(s.BaseNode, n, { get legend() { return this._legend }, set legend(t) { this._legend = t, this.needsDisplay = !0 }, get segmentStart() { return this._segmentStart }, set segmentStart(t) { this._segmentStart = t, this.needsDisplay = !0 }, get segmentWidth() { return this._segmentWidth }, set segmentWidth(t) { this._segmentWidth = t, this.needsDisplay = !0 }, get numberOfSegments() { return this._numberOfSegments }, set numberOfSegments(t) { this._numberOfSegments = t, this.needsDisplay = !0 }, get fillColor() { return this._fillColor }, set fillColor(t) { this._fillColor = t, this.needsDisplay = !0 }, get strokeColor() { return this._strokeColor }, set strokeColor(t) { this._strokeColor = t, this.needsDisplay = !0 }, stringInfo: function() { var t = "~" + this.fillColor + "/" + this.strokeColor + "~ "; return this._legend ? "LegendNode<labels:[" + this._legend.labels.slice(0, this.numberOfSegments + 1).join(", ") + "], unit:" + this._legend.unit + ")> " + t : "LegendNode " + t }, measureTextOverflow: function(t, e) { return this._renderer.measureTextOverflow(t, e) } }), e.exports = n
    }, { "../../scene-graph": 47, "./render-legend": 42, "@maps/js-utils": 84 }],
    40: [function(t, e, i) {
        "use strict";

        function n() { a.call(this), o(this, s.InnerTransitionDuration), this.lineWidth = s.OutlineWidth }
        var o = t("./animatable-opacity-mixin"),
            s = t("./scale-constants"),
            a = t("./rect-node"),
            r = t("@maps/js-utils");
        n.prototype = r.inheritPrototype(a, n, { stringInfo: function() { return "OutlineNode " + ("~" + this.strokeColor + "~ ") } }), e.exports = n
    }, { "./animatable-opacity-mixin": 38, "./rect-node": 41, "./scale-constants": 44, "@maps/js-utils": 84 }],
    41: [function(t, e, i) {
        "use strict";

        function n() { s.BaseNode.call(this), this._fillColor = null, this._strokeColor = null, this._lineWidth = null, this._innerStroke = !1, this._renderer = new o(this) }
        var o = t("./render-rect"),
            s = t("../../scene-graph"),
            a = t("@maps/js-utils");
        n.prototype = a.inheritPrototype(s.BaseNode, n, { get fillColor() { return this._fillColor }, set fillColor(t) { this._fillColor = t, this.needsDisplay = !0 }, get strokeColor() { return this._strokeColor }, set strokeColor(t) { this._strokeColor = t, this.needsDisplay = !0 }, get innerStroke() { return this._innerStroke }, set innerStroke(t) { this._innerStroke = t, this.needsDisplay = !0 }, get lineWidth() { return this._lineWidth }, set lineWidth(t) { this._lineWidth = t, this.needsDisplay = !0 } }), e.exports = n
    }, { "../../scene-graph": 47, "./render-rect": 43, "@maps/js-utils": 84 }],
    42: [function(t, e, i) {
        "use strict";

        function n(t) { s.RenderItem.call(this, t) }
        var o = t("./scale-constants"),
            s = t("../../scene-graph"),
            a = t("@maps/js-utils");
        n.prototype = a.inheritPrototype(s.RenderItem, n, {
            measureTextOverflow: function(t, e) {
                var i = this._node;
                if (!i.legend) return 0;
                t.font = o.LegendFont;
                var n;
                n = e ? i.legend.labels[0] : i.legend.labels[i.numberOfSegments];
                var s, a = t.measureText(n).width / 2;
                return s = e ? 0 : t.measureText(" " + i.legend.unit).width, a + s
            },
            draw: function(t) {
                var e = this._node;
                if (e.legend) {
                    t.font = o.LegendFont, t.textAlign = "center", t.textBaseline = "bottom", t.lineWidth = o.LegendOuterStrokeWidth, t.fillStyle = e.fillColor, t.strokeStyle = e.strokeColor;
                    for (var i = e.size.height - o.LegendMarginBottom - o.LegendSpacing, n = e.segmentStart, s = 0; s <= e.numberOfSegments; s++) {
                        var a = e.legend.labels[s];
                        t.strokeText(a, n, i), t.fillText(a, n, i), s === e.numberOfSegments ? n += t.measureText(a).width / 2 : n += e.segmentWidth
                    }
                    var r = " " + e.legend.unit;
                    t.textAlign = "left", t.strokeText(r, n, i), t.fillText(r, n, i)
                }
            }
        }), e.exports = n
    }, { "../../scene-graph": 47, "./scale-constants": 44, "@maps/js-utils": 84 }],
    43: [function(t, e, i) {
        "use strict";

        function n(t) { s.RenderItem.call(this, t) }
        var o = t("@maps/device-pixel-ratio"),
            s = t("../../scene-graph"),
            a = t("@maps/js-utils");
        n.prototype = a.inheritPrototype(s.RenderItem, n, {
            draw: function(t) {
                var e = this._node,
                    i = e.fillColor,
                    n = e.strokeColor,
                    s = e.lineWidth;
                i && (t.fillStyle = i, t.fillRect(0, 0, e.size.width, e.size.height)), n && s && (s >= 1 || o() > 1) && (t.lineWidth = s, t.strokeStyle = n, e.innerStroke ? t.strokeRect(s / 2, s / 2, e.size.width - s, e.size.height - s) : t.strokeRect(-s / 2, -s / 2, e.size.width + s, e.size.height + s))
            }
        }), e.exports = n
    }, { "../../scene-graph": 47, "@maps/device-pixel-ratio": 61, "@maps/js-utils": 84 }],
    44: [function(t, e, i) {
        "use strict";
        e.exports = { GlobalFadeDuration: 700, InnerTransitionDuration: 200, MinimumNumberOfSegments: 2, MaximumNumberOfSegments: 5, MagicNumbers: [1.25, 2.5, 5], FirstMagicExponent: -3, LastMagicExponent: 7, MaximumNumberOfDisplayedSegments: 3, SegmentThickness: 3, LegendHorizontalMargin: 6, LegendMarginBottom: 8, LegendSpacing: 1, OutlineWidth: 1, LightSegmentColorRegular: "rgba(255, 255, 255, 0.7)", DarkSegmentColorRegular: "rgba(0, 0, 0, 0.73)", OutlineColorRegular: "rgba(255, 255, 255, 0.5)", LightSegmentColorSatellite: "rgba(255, 255, 255, 0.8)", DarkSegmentColorSatellite: "rgba(178, 178, 178, 0.8)", OutlineColorSatellite: "rgba(0, 0, 0, 1)", SegmentInnerStrokeColor: "rgba(0, 0, 0, 0.2)", SegmentInnerStrokeWidth: .5, LegendFont: "9px '-apple-system-font', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'", LegendColorRegular: "rgba(72, 69, 65, 1)", LegendOuterStrokeColorRegular: "rgba(255, 255, 255, 0.5)", LegendColorSatellite: "rgba(255, 255, 255, 1)", LegentOuterStrokeColorSatellite: "rgba(0, 0, 0, 1)", LegendOuterStrokeWidth: 1, MetersThreshold: 500, FeetThreshold: .25, MilesToMeters: 1609.344, MetersToMiles: 1 / 1609.344, MilesToFeet: 5280 }
    }, {}],
    45: [function(t, e, i) {
        "use strict";

        function n() { c.GroupNode.call(this), this._needsLayout = !1, this._layoutCanvas = document.createElement("canvas"), this._layoutContext = this._layoutCanvas.getContext("2d"), this._distance = 0, this._mapWidth = 0, this._theme = n.Themes.Light, this._leftAligned = !1, this._l10n = null, this._segmentWidth = 0, this._oldNumberOfSegments = 0, this._legend = { labels: [], unit: "" }, this._legendNode = this.addChild(new a), this._outlineNodes = [0, 1].map(function() { return this.addChild(new r) }, this), this._activeOutlineNode = this._outlineNodes[0], this._outlineNodes[1].opacity = 0, this._segmentNodes = [0, 1, 2].map(function(t) { return this.addChild(new u) }, this), this._updateColors(), o(this, s.GlobalFadeDuration) }
        var o = t("./animatable-opacity-mixin"),
            s = t("./scale-constants"),
            a = t("./legend-node"),
            r = t("./outline-node"),
            l = t("@maps/geometry/rect"),
            h = t("@maps/scheduler"),
            c = t("../../scene-graph"),
            u = t("./segment-node"),
            d = t("@maps/js-utils"),
            p = .01;
        n.Themes = { Light: "Light", Dark: "Dark" }, n.prototype = d.inheritPrototype(c.GroupNode, n, {
            get layerBounds() { return new l(0, 0, this.size.width, Math.max(this.size.height, 48)) },
            get distance() { return this._distance },
            set distance(t) { Math.abs(t - this._distance) / this._distance < p || (this._distance = t, this._computeSegments(), this.needsLayout = !0) },
            get mapWidth() { return this._mapWidth },
            set mapWidth(t) { t !== this._mapWidth && (this._mapWidth = t, this._computeSegments(), this.needsLayout = !0) },
            get theme() { return this._theme },
            set theme(t) { this._theme = t, this._updateColors() },
            get l10n() { return this._l10n },
            set l10n(t) { this._l10n && this._l10n.removeEventListener(this._l10n.Events.LocaleChanged, this), this._l10n = t, t && t.addEventListener(t.Events.LocaleChanged, this) },
            get leftAligned() { return this._leftAligned },
            set leftAligned(t) { this._leftAligned = t, this.needsLayout = !0 },
            stringInfo: function() { return "ScaleNode<distance:" + Math.round(100 * this.distance) / 100 + "m>" },
            get needsLayout() { return this._needsLayout },
            set needsLayout(t) { this._needsLayout !== t && (this._needsLayout = t, t && h.scheduleASAP(this)) },
            performScheduledUpdate: function() { this.needsLayout && (this.layoutSubNodes(), this.needsLayout = !1) },
            layoutSubNodes: function() {
                for (var t = this._computeSegmentsRects(), e = 0; e < s.MaximumNumberOfDisplayedSegments; e++) {
                    var i = t[this.leftAligned ? e : t.length - 1 - e],
                        n = this._segmentNodes[e];
                    i ? (n.position = i.origin, n.size = i.size, n.setOpacityAnimated(1, !0)) : n.setOpacityAnimated(0, !0)
                }
                var o = l.unionOfRects(t).round();
                if (t.length !== this._oldNumberOfSegments) {
                    this._activeOutlineNode.setOpacityAnimated(0, !0);
                    var a = 0 === this._outlineNodes.indexOf(this._activeOutlineNode) ? 1 : 0;
                    this._activeOutlineNode = this._outlineNodes[a], this._activeOutlineNode.setOpacityAnimated(1, !0)
                }
                this._activeOutlineNode.position = o.origin, this._activeOutlineNode.size = o.size;
                var r = t[0];
                this._legendNode.segmentStart = r.origin.x, this._legendNode.segmentWidth = r.size.width, this._legendNode.size.width = this.size.width, this._legendNode.size.height = this.size.height, this._oldNumberOfSegments = t.length
            },
            handleEvent: function(t) { this._computeSegments(), this.needsLayout = !0 },
            _updateColors: function(t) {
                var e = this.theme === n.Themes.Dark;
                this._legendNode.fillColor = e ? s.LegendColorSatellite : s.LegendColorRegular, this._legendNode.strokeColor = e ? s.LegentOuterStrokeColorSatellite : s.LegendOuterStrokeColorRegular;
                var i = e ? [s.LightSegmentColorSatellite, s.DarkSegmentColorSatellite] : [s.DarkSegmentColorRegular, s.LightSegmentColorRegular];
                this._segmentNodes.forEach(function(t, n) { t.fillColor = i[n % 2], t.strokeColor = e ? null : s.SegmentInnerStrokeColor }, this);
                var o = e ? s.OutlineColorSatellite : s.OutlineColorRegular;
                this._outlineNodes.forEach(function(t) { t.strokeColor = o })
            },
            _computeSegments: function() {
                if (0 !== this.size.width && 0 !== this.mapWidth && this._l10n) {
                    var t, e = this.size.width,
                        i = this.mapWidth,
                        n = this.distance * e / i,
                        o = !this._l10n.useMetric(),
                        a = !1,
                        r = 1;
                    o && (n *= s.MetersToMiles) < s.FeetThreshold && (a = !0, n *= s.MilesToFeet);
                    for (var l = s.FirstMagicExponent, h = !1; !h && l < s.LastMagicExponent; l++) h = s.MagicNumbers.some(function(e) { return t = e * Math.pow(10, l), (r = n / t) >= s.MinimumNumberOfSegments && r < s.MaximumNumberOfSegments });
                    this._segmentWidth = r ? e / r : 0;
                    var c = t;
                    o && (a && (t /= s.MilesToFeet), t *= s.MilesToMeters), this._computeLegend(t, c, a)
                }
            },
            _computeLegend: function(t, e, i) {
                var n = 0;
                this._l10n.useMetric() ? t > s.MetersThreshold ? (this._legend.unit = this._l10n.get("Scale.Kilometer.Short"), n = t / 1e3) : (this._legend.unit = this._l10n.get("Scale.Meter.Short"), n = t) : (this._legend.unit = i ? this._l10n.get("Scale.Feet.Short") : this._l10n.get("Scale.Mile.Short"), n = e);
                for (var o = [], a = 0; a < s.MaximumNumberOfSegments; a++) {
                    var r = a * n;
                    o.push(r.toString())
                }
                this._legend.labels = o, this._legendNode.legend = this._legend
            },
            _computeSegmentsRects: function() { for (var t = this._layoutContext, e = 0, i = s.LegendHorizontalMargin + this._legendNode.measureTextOverflow(t, !0), n = this.size.height - s.LegendMarginBottom + s.LegendSpacing, o = this._segmentWidth, a = [], r = 0; r < s.MaximumNumberOfDisplayedSegments; r++) { var h = new l(i, n, o, s.SegmentThickness).round(); if (a.push(h), i = h.origin.x + h.size.width, this._legendNode.numberOfSegments = a.length, e = this._legendNode.measureTextOverflow(t), i + o + e + s.LegendHorizontalMargin > this.size.width) break } 0 === this._oldNumberOfSegments && (this._oldNumberOfSegments = a.length); var c = 0; return this.leftAligned || (c = Math.round(this.size.width - i - e - s.LegendHorizontalMargin), a.forEach(function(t) { t.origin.x += c })), a }
        }), e.exports = n
    }, { "../../scene-graph": 47, "./animatable-opacity-mixin": 38, "./legend-node": 39, "./outline-node": 40, "./scale-constants": 44, "./segment-node": 46, "@maps/geometry/rect": 70, "@maps/js-utils": 84, "@maps/scheduler": 106 }],
    46: [function(t, e, i) {
        "use strict";

        function n() { a.call(this), o(this, s.InnerTransitionDuration), this.lineWidth = s.SegmentInnerStrokeWidth, this.innerStroke = !0 }
        var o = t("./animatable-opacity-mixin"),
            s = t("./scale-constants"),
            a = t("./rect-node"),
            r = t("@maps/js-utils");
        n.prototype = r.inheritPrototype(a, n, { stringInfo: function() { return "SegmentNode " + ("~" + this.fillColor + "~ ") } }), e.exports = n
    }, { "./animatable-opacity-mixin": 38, "./rect-node": 41, "./scale-constants": 44, "@maps/js-utils": 84 }],
    47: [function(t, e, i) { e.exports = { Scene: t("./src/model/scene"), BaseNode: t("./src/model/base-node"), GroupNode: t("./src/model/group-node"), ImageNode: t("./src/model/image-node"), RenderItem: t("./src/render/c2d/render-item"), NodeAnimator: t("./src/node-animator"), Size: t("@maps/geometry/size"), Point: t("@maps/geometry/point"), Matrix: t("@maps/css-matrix") } }, { "./src/model/base-node": 49, "./src/model/group-node": 50, "./src/model/image-node": 51, "./src/model/scene": 52, "./src/node-animator": 53, "./src/render/c2d/render-item": 55, "@maps/css-matrix": 58, "@maps/geometry/point": 69, "@maps/geometry/size": 71 }],
    48: [function(t, e, i) {
        function n() {
            var t = a;
            a = [];
            for (var e = [], i = 0, n = t.length; i < n; ++i) {
                var s = t[i].scene;
                s && o(e, s) && s.renderer.update()
            }
        }

        function o(t, e) { return -1 === t.indexOf(e) && (t.push(e), !0) }
        var s = t("@maps/scheduler"),
            a = [];
        e.exports = { scheduleNode: function(t) { o(a, t) && 1 === a.length && s.scheduleDraw(n) } }
    }, { "@maps/scheduler": 106 }],
    49: [function(t, e, i) {
        function n() { this._parent = null, this._children = [], this._renderer = null, this._opacity = 1, this._size = new h, this._position = new c, this._transform = new d, this._frozen = !1, this._wantsLayerBacking = !1 }

        function o(t) {
            t._parent = null;
            for (var e = [t]; e.length > 0;) {
                var i = e.pop();
                i.wasRemoved(), i._renderer && "function" == typeof i._renderer.nodeWasRemoved && i._renderer.nodeWasRemoved(), Array.prototype.push.apply(e, i.children)
            }
        }

        function s(t) {
            for (var e = null, i = 0, n = 0; t && !e;) {
                var o = t.transform.transformPoint(t.position);
                i -= o.x, n -= o.y, e = (t = t.parent).element
            }
            return { element: e, offsetX: i, offsetY: n }
        }

        function a(t) { return t < 0 ? "" : t + ":" }

        function r(t) { return t.childCount < 1 ? "" : " ⤵︎ " + t.childCount }

        function l(t, e, i, n, o) {
            var s = "";
            if (s += e, o && (s += a(i)), s += t.toString(), s += r(t), 0 === n) return s;
            for (var h = t.children, c = 0, u = h.length; c < u; ++c) {
                var d = t.childCount < 1 ? -1 : c;
                s += "\n", s += l(h[c], e + "    ", d, n - 1, o)
            }
            return s
        }
        var h = t("@maps/geometry/size"),
            c = t("@maps/geometry/point"),
            u = t("@maps/geometry/rect"),
            d = t("@maps/css-matrix"),
            p = t("@maps/web-point-converter"),
            m = t("../display-scheduler"),
            g = (new d).toString();
        n.prototype = {
            constructor: n,
            get scene() {
                for (var e = t("./scene"), i = this; i; i = i._parent)
                    if (i instanceof e) return i
            },
            get renderer() { return this._renderer },
            get wantsLayerBacking() { return this._frozen || this._wantsLayerBacking || this._needsLayerBacking() },
            set wantsLayerBacking(t) { t !== this._wantsLayerBacking && (this._wantsLayerBacking = t, this.needsDisplay = !0) },
            get frozen() { return this._frozen },
            set frozen(t) { t !== this._frozen && (this._frozen = t, this.needsDisplay = !0) },
            get opacity() { return this._opacity },
            set opacity(t) {
                (t = Math.min(Math.max(0, t), 1)) !== this._opacity && (this._opacity = t, this.needsDisplay = !0)
            },
            get position() { return this._position },
            set position(t) { t.equals(this._position) || (this._position = t.copy(), this.needsDisplay = !0) },
            get transform() { return this._transform },
            set transform(t) { this._transform = t, this.needsDisplay = !0 },
            get size() { return this._size },
            set size(t) { this._size = t || new h, this.needsDisplay = !0 },
            get bounds() { return new u(this._position.x, this._position.y, this.size.width, this.size.height) },
            get layerBounds() {
                for (var t = new u(0, 0, this.size.width, this.size.height), e = this._children, i = 0, n = e.length; i < n; ++i) {
                    var o = e[i],
                        s = o.layerBounds;
                    s.origin.x += o._position.x, s.origin.y += o._position.y;
                    for (var a = o.transform, r = [a.transformPoint(new c(s.minX(), s.minY())), a.transformPoint(new c(s.maxX(), s.minY())), a.transformPoint(new c(s.maxX(), s.maxY())), a.transformPoint(new c(s.minX(), s.maxY()))], l = r[0].x, h = r[0].y, d = r[0].x, p = r[0].y, m = 1; m < r.length; ++m) {
                        var g = r[m];
                        g.x < l && (l = g.x), g.x > d && (d = g.x), g.y < h && (h = g.y), g.y > p && (p = g.y)
                    }
                    t = t.unionWithRect(new u(l, h, d - l, p - h))
                }
                return t
            },
            set needsDisplay(t) { t && m.scheduleNode(this) },
            get parent() { return this._parent },
            get children() { return this._children },
            set children(t) { for (var e = this._children; e.length;) this.removeChild(e[0]); for (var i = 0, n = t.length; i < n; ++i) this.addChild(t[i]) },
            get childCount() { return this._children.length },
            get firstChild() { return this._children[0] || null },
            get lastChild() { return this._children[this._children.length - 1] || null },
            get previousSibling() {
                if (!this._parent) return null;
                var t = this._parent._children,
                    e = t.indexOf(this);
                return e > 0 ? t[e - 1] : null
            },
            get nextSibling() {
                if (!this._parent) return null;
                var t = this._parent._children,
                    e = t.indexOf(this);
                return -1 !== e && e < t.length - 1 ? t[e + 1] : null
            },
            toString: function() { var t = ""; return this.element && (t += "🏷 "), this.wantsLayerBacking && (t += "🏁 "), this.frozen && (t += "❄️ "), this.stringInfo && "function" == typeof this.stringInfo ? t += this.stringInfo() : t += "UnknownNode", 0 === this.position.x && 0 === this.position.y || (t += " (" + this.position.x + ", " + this.position.y + ")"), 0 === this.size.width && 0 === this.size.height || (t += " " + this.size.width + "x" + this.size.height), 1 !== this.opacity && (t += " [opacity:" + this.opacity + "]"), this.transform.toString() !== g && (t += " [" + this.transform.toString() + "]"), this.animators && this.animators.forEach(function(e) { t += " " + e.stringInfo() }), t },
            dump: function(t, e) { return void 0 === t && (t = 1 / 0), l(this, "", -1, t, !!e) },
            addChild: function(t, e) { return t.remove(), (void 0 === e || e < 0 || e > this._children.length) && (e = this._children.length), this._children.splice(e, 0, t), t._parent = this, this.needsDisplay = !0, t },
            insertBefore: function(t, e) { return this.addChild(t, this._children.indexOf(e)) },
            insertAfter: function(t, e) { return this.addChild(t, this._children.indexOf(e) + 1) },
            removeChild: function(t) { if (t._parent === this) { var e = this._children.indexOf(t); if (-1 !== e) return this._children.splice(e, 1), o(t), this.needsDisplay = !0, t } },
            remove: function() { if (this._parent instanceof n) return this._parent.removeChild(this) },
            wasRemoved: function() {},
            convertPointFromPage: function(t) {
                if (this.element) return p.fromPageToElement(this.element, t);
                var e = s(this),
                    i = p.fromPageToElement(e.element, t);
                return new c(i.x + e.offsetX, i.y + e.offsetY)
            },
            convertPointToPage: function(t) {
                if (this.element) return p.fromElementToPage(this.element, t);
                var e = s(this),
                    i = p.fromElementToPage(e.element, t);
                return new c(i.x - e.offsetX, i.y - e.offsetY)
            },
            _needsLayerBacking: function() { return this.opacity < 1 && (this._children.length > 1 || 1 === this._children.length && this._children[0]._children.length > 0) }
        }, e.exports = n
    }, { "../display-scheduler": 48, "./scene": 52, "@maps/css-matrix": 58, "@maps/geometry/point": 69, "@maps/geometry/rect": 70, "@maps/geometry/size": 71, "@maps/web-point-converter": 107 }],
    50: [function(t, e, i) {
        function n() { o.call(this), this._renderer = new s(this) }
        var o = t("./base-node"),
            s = t("../render/c2d/render-item"),
            a = t("@maps/js-utils");
        n.prototype = a.inheritPrototype(o, n, { stringInfo: function() { return "GroupNode" } }), e.exports = n
    }, { "../render/c2d/render-item": 55, "./base-node": 49, "@maps/js-utils": 84 }],
    51: [function(t, e, i) {
        function n() { a.call(this), this._image = null, this._renderer = new r(this) }
        var o = t("@maps/geometry/size"),
            s = t("@maps/js-utils"),
            a = t("./base-node"),
            r = t("../render/c2d/render-image");
        n.prototype = s.inheritPrototype(a, n, { get image() { return this._image }, set image(t) { this._image !== t && (this._image && this._image.removeEventListener("load", this), this._image = t, this._imageDidLoad(), !t || t.src && t.complete || t.addEventListener("load", this)) }, stringInfo: function() { return "ImageNode" + (this._image ? "<src:" + this._image.src + ">" : "") }, handleEvent: function(t) { t.target === this._image && this._image.complete && (this._image.removeEventListener("load", this), this._imageDidLoad(), this.needsDisplay = !0) }, _imageDidLoad: function() { this.size.equals(o.Zero) && (this.size = new o(this._image.width, this._image.height)), this.needsDisplay = !0 } }), e.exports = n
    }, { "../render/c2d/render-image": 54, "./base-node": 49, "@maps/geometry/size": 71, "@maps/js-utils": 84 }],
    52: [function(t, e, i) {
        function n() { o.call(this), this._renderer = new s(this), r.addEventListener("device-pixel-ratio-change", this) }
        var o = t("./base-node"),
            s = t("../render/c2d/render-scene"),
            a = t("@maps/js-utils"),
            r = t("@maps/device-pixel-ratio");
        n.prototype = a.inheritPrototype(o, n, { get element() { return this._renderer.element }, destroy: function() { this.children = [], this._renderer._ctx = null, this._renderer._canvas.width = this._renderer._canvas.height = 0, r.removeEventListener("device-pixel-ratio-change", this) }, stringInfo: function() { return "Scene" }, handleEvent: function(t) { this.needsDisplay = !0 } }), e.exports = n
    }, { "../render/c2d/render-scene": 56, "./base-node": 49, "@maps/device-pixel-ratio": 61, "@maps/js-utils": 84 }],
    53: [function(t, e, i) {
        function n(t) { this.node = t.node, this.node.animators || (this.node.animators = []), this.node.animators.push(this), this.duration = t.duration, ["from", "to", "done"].forEach(function(e) { e in t && null != t[e] && (this[e] = t[e]) }, this) }

        function o(t) { n.call(this, t) }

        function s(t) { n.call(this, t) }

        function a(t) { n.call(this, t), ["center", "mass", "stiffness", "damping", "initialVelocity"].forEach(function(e) { e in t && (this[e] = t[e]) }, this), this.mass > 0 && (this.springSolver = new r(this.mass, this.stiffness, this.damping, this.initialVelocity)) }

        function r(t, e, i, n) { this.w0 = Math.sqrt(e / t), this.zeta = i / (2 * Math.sqrt(e * t)), this.zeta < 1 ? (this.wd = this.w0 * Math.sqrt(1 - this.zeta * this.zeta), this.A = 1, this.B = (this.zeta * this.w0 - n) / this.wd) : (this.wd = 0, this.A = 1, this.B = -n + this.w0) }
        var l = t("@maps/geometry/point"),
            h = t("@maps/css-matrix"),
            c = t("@maps/scheduler"),
            u = t("@maps/js-utils");
        n.prototype = { from: 0, to: 1, done: u.noop, begin: function() { return this.beginDate = Date.now(), c.scheduleASAP(this), this }, end: function() { this.node.animators.splice(this.node.animators.indexOf(this), 1), 0 === this.node.animators.length && delete this.node.animators, delete this.beginDate }, performScheduledUpdate: function() { this.beginDate && (this._p = Math.min((Date.now() - this.beginDate) / this.duration, 1), this.update(this._p), this._p < 1 ? c.scheduleOnNextFrame(this) : this.ended()) }, ended: function() { this.end(), this.done(this) }, valueAt: function(t) { return this.from + t * (this.to - this.from) }, stringInfo: function(t, e) { var i = "🏇" + t + "<" + this.duration + "ms; " + this.from + "→" + this.to; return this._p >= 0 && (i += "/" + Math.round(100 * this._p) + "%"), this.hasOwnProperty("done") && (i += "*"), i + (e || "") + ">" } }, o.prototype = u.inheritPrototype(n, o, { update: function(t) { this.node.opacity = this.valueAt(t) }, stringInfo: function() { return n.prototype.stringInfo.call(this, "opacity") } }), s.prototype = u.inheritPrototype(n, s, { from: new l(0, 0), to: new l(0, 0), update: function(t) { this.node.transform = (new h).translate(this.from.x + t * (this.to.x - this.from.x), this.from.y + t * (this.to.y - this.from.y)) }, stringInfo: function() { return n.prototype.stringInfo.call(this, "translation") } }), a.prototype = u.inheritPrototype(n, a, {
            center: new l(0, 0),
            scale: function(t) {
                var e = this.center.x,
                    i = this.center.y;
                this.node.transform = (new h).translate(e, i).scale(t).translate(-e, -i)
            },
            update: function(t) { this.scale(this.valueAt(this.springSolver ? this.springSolver.solve(t) : t)) },
            ended: function() { this.mass > 0 && this.scale(this.to), n.prototype.ended.call(this) },
            stringInfo: function() { var t = ""; return 0 === this.center.x && 0 === this.center.y || (t += " (" + this.center.x + ", " + this.center.y + ")"), this.mass > 0 && (t += "🌀"), n.prototype.stringInfo.call(this, "scale", t) }
        }), r.prototype.solve = function(t) { return 1 - (t = this.zeta < 1 ? Math.exp(-t * this.zeta * this.w0) * (this.A * Math.cos(this.wd * t) + this.B * Math.sin(this.wd * t)) : (this.A + this.B * t) * Math.exp(-t * this.w0)) }, e.exports = { Opacity: o, Translation: s, Scale: a }
    }, { "@maps/css-matrix": 58, "@maps/geometry/point": 69, "@maps/js-utils": 84, "@maps/scheduler": 106 }],
    54: [function(t, e, i) {
        function n(t) { o.call(this, t) }
        var o = t("./render-item"),
            s = t("@maps/js-utils");
        n.prototype = s.inheritPrototype(o, n, { _lastDrawnImage: null, draw: function(t) { this._node.image && (this._node.image.complete ? (this._lastDrawnImage = this._node.image, t.drawImage(this._node.image, 0, 0, this._node.size.width, this._node.size.height)) : this._node.image === this._lastDrawnImage && (this._node.needsDisplay = !0)) } }), e.exports = n
    }, { "./render-item": 55, "@maps/js-utils": 84 }],
    55: [function(t, e, i) {
        function n(t) { this._node = t, this._layer = null }

        function o(t) { 0 === a.length && window.setTimeout(function() { a.forEach(function(t) { t._node.scene || (t.layer = null) }), a = [] }, 0), a.push(t) }
        var s = t("@maps/device-pixel-ratio");
        n.prototype = {
            constructor: n,
            get node() { return this._node },
            get frozen() { return !!this._frozenLayer },
            get layer() {
                var t = this._node;
                if (t.frozen && this._frozenLayer) return this._frozenLayer;
                delete this._frozenLayer, this._layer || (this._layer = document.createElement("canvas"));
                var e = s(),
                    i = t.layerBounds;
                this._layer.width = Math.ceil(i.size.width * e), this._layer.height = Math.ceil(i.size.height * e);
                var n = this._layer.getContext("2d");
                return n && n.scale(e, e), t.frozen && (this._frozenLayer = this._layer), this._layer
            },
            set layer(t) { this._layer && (this._layer.width = 0), this._layer = t, t || delete this._frozenLayer },
            nodeWasRemoved: function() { this._layer && o(this) },
            draw: function(t) {}
        };
        var a = [];
        e.exports = n
    }, { "@maps/device-pixel-ratio": 61 }],
    56: [function(t, e, i) {
        function n(t) { l.call(this, t), this._canvas = document.createElement("canvas"), this._ctx = this._canvas.getContext("2d") }

        function o(t, e, i, n, s, a) {
            var r = t.renderer;
            s && (r.layer = null);
            var l = r.frozen,
                h = t.wantsLayerBacking ? r.layer : null;
            if (h || t.frozen || (r.layer = null), e && (!t.wantsLayerBacking || h) && 0 !== t.opacity) {
                e.save(), e.translate(t.position.x, t.position.y);
                var c = t.transform;
                if (e.transform(c.a, c.b, c.c, c.d, c.e, c.f), a *= t.opacity, e.globalAlpha = a, !l || !t.frozen) {
                    var u = h ? h.getContext("2d") : e;
                    t.renderer.draw(u);
                    for (var d = t.children, p = 0, m = d.length; p < m; ++p) o(d[p], u, i, n, s, h ? 1 : a)
                }
                h && 0 !== h.width && 0 !== h.height && e.drawImage(h, 0, 0, h.width / n, h.height / n), e.restore()
            }
        }
        var s = t("@maps/device-pixel-ratio"),
            a = t("@maps/geometry/rect"),
            r = t("@maps/js-utils"),
            l = t("./render-item");
        n.prototype = r.inheritPrototype(l, n, {
            get element() { return this._canvas },
            update: function() {
                if (this._ctx) {
                    var t = this._node,
                        e = t.size,
                        i = s(),
                        n = !this._previousScale || this._previousScale !== i;
                    !n && this._previousSize && this._previousSize.equals(e) ? this._ctx.clearRect(0, 0, e.width * i, e.height * i) : (this._canvas.style.width = e.width + "px", this._canvas.style.height = e.height + "px", this._canvas.width = e.width * i, this._canvas.height = e.height * i, this._previousSize = e.copy(), this._previousScale = i), this._ctx.scale(i, i), o(this.node, this._ctx, new a(-t.position.x, -t.position.y, e.width, e.height), i, n, 1), this._ctx.scale(1 / i, 1 / i)
                }
            }
        }), e.exports = n
    }, { "./render-item": 55, "@maps/device-pixel-ratio": 61, "@maps/geometry/rect": 70, "@maps/js-utils": 84 }],
    57: [function(t, e, i) {
        function n() { return /Trident/i.test(navigator.userAgent) } e.exports = {
            add: function(t, e) {
                if (t.classList) t.classList.add(e);
                else if (Boolean(e) && "string" == typeof e) {
                    var i = this._classNames(t);
                    i.indexOf(e) >= 0 || (i.push(e), this._classNames(t, i))
                }
            },
            remove: function(t, e) {
                if (t.classList) t.classList.remove(e);
                else {
                    var i = this._classNames(t),
                        n = i.indexOf(e);
                    n < 0 || (i.splice(n, 1), this._classNames(t, i))
                }
            },
            toggle: function(t, e, i) { return !t.classList || n() && 3 === arguments.length ? (void 0 === i && (i = !this.contains(t, e)), i ? this.add(t, e) : this.remove(t, e), i) : void 0 === i ? t.classList.toggle(e) : t.classList.toggle(e, i) },
            contains: function(t, e) { return this._classNames(t).indexOf(e) >= 0 },
            _classNames: function(t, e) {
                if (t && e) t.className = e.join(" ");
                else if (t) { var i = (t.className || "").trim(); return i.length > 0 ? i.split(" ") : [] }
            }
        }
    }, {}],
    58: [function(t, e, i) {
        function n() {
            if (this._ = [
                    [1, 0, 0, 0],
                    [0, 1, 0, 0],
                    [0, 0, 1, 0],
                    [0, 0, 0, 1]
                ], 6 === arguments.length) this._setValues(["a", "b", "c", "d", "e", "f"], arguments);
            else if (16 === arguments.length) this._setValues(["m11", "m12", "m13", "m14", "m21", "m22", "m23", "m24", "m31", "m32", "m33", "m34", "m41", "m42", "m43", "m44"], arguments);
            else if (1 == arguments.length) {
                var t = arguments[0];
                if ("string" == typeof t) {
                    if ("none" === t) return;
                    t = t.match(/\bmatrix(?:3d)?\(([^)]+)\)/)[1].split(",").map(parseFloat)
                }
                6 === t.length ? this._setValues(["a", "b", "c", "d", "e", "f"], t) : 16 === t.length && this._setValues(["m11", "m12", "m13", "m14", "m21", "m22", "m23", "m24", "m31", "m32", "m33", "m34", "m41", "m42", "m43", "m44"], t)
            }
        }

        function o(t) { return t / 180 * Math.PI }

        function s(t, e, i, n) { return t * n - e * i }

        function a(t, e, i, n, o, a, r, l, h) { return t * s(o, a, l, h) - n * s(e, i, l, h) + r * s(e, i, o, a) }

        function r(t, e) {
            l(t, e);
            var i = t._determinant();
            if (Math.abs(i) < c) return !1;
            for (var n = 0; n < 4; n++)
                for (var o = 0; o < 4; o++) e._[n][o] = e._[n][o] / i;
            return !0
        }

        function l(t, e) {
            var i = t._[0][0],
                n = t._[0][1],
                o = t._[0][2],
                s = t._[0][3],
                r = t._[1][0],
                l = t._[1][1],
                h = t._[1][2],
                c = t._[1][3],
                u = t._[2][0],
                d = t._[2][1],
                p = t._[2][2],
                m = t._[2][3],
                g = t._[3][0],
                _ = t._[3][1],
                f = t._[3][2],
                y = t._[3][3];
            e._[0][0] = a(l, d, _, h, p, f, c, m, y), e._[1][0] = -a(r, u, g, h, p, f, c, m, y), e._[2][0] = a(r, u, g, l, d, _, c, m, y), e._[3][0] = -a(r, u, g, l, d, _, h, p, f), e._[0][1] = -a(n, d, _, o, p, f, s, m, y), e._[1][1] = a(i, u, g, o, p, f, s, m, y), e._[2][1] = -a(i, u, g, n, d, _, s, m, y), e._[3][1] = a(i, u, g, n, d, _, o, p, f), e._[0][2] = a(n, l, _, o, h, f, s, c, y), e._[1][2] = -a(i, r, g, o, h, f, s, c, y), e._[2][2] = a(i, r, g, n, l, _, s, c, y), e._[3][2] = -a(i, r, g, n, l, _, o, h, f), e._[0][3] = -a(n, l, d, o, h, p, s, c, m), e._[1][3] = a(i, r, u, o, h, p, s, c, m), e._[2][3] = -a(i, r, u, n, l, d, s, c, m), e._[3][3] = a(i, r, u, n, l, d, o, h, p)
        }
        var h = t("@maps/geometry/point"),
            c = 1e-8;
        n.prototype = {
            constructor: n,
            get a() { return this._[0][0] },
            get b() { return this._[0][1] },
            get c() { return this._[1][0] },
            get d() { return this._[1][1] },
            get e() { return this._[3][0] },
            get f() { return this._[3][1] },
            get m11() { return this._[0][0] },
            get m12() { return this._[0][1] },
            get m13() { return this._[0][2] },
            get m14() { return this._[0][3] },
            get m21() { return this._[1][0] },
            get m22() { return this._[1][1] },
            get m23() { return this._[1][2] },
            get m24() { return this._[1][3] },
            get m31() { return this._[2][0] },
            get m32() { return this._[2][1] },
            get m33() { return this._[2][2] },
            get m34() { return this._[2][3] },
            get m41() { return this._[3][0] },
            get m42() { return this._[3][1] },
            get m43() { return this._[3][2] },
            get m44() { return this._[3][3] },
            set a(t) { this._[0][0] = t },
            set b(t) { this._[0][1] = t },
            set c(t) { this._[1][0] = t },
            set d(t) { this._[1][1] = t },
            set e(t) { this._[3][0] = t },
            set f(t) { this._[3][1] = t },
            set m11(t) { this._[0][0] = t },
            set m12(t) { this._[0][1] = t },
            set m13(t) { this._[0][2] = t },
            set m14(t) { this._[0][3] = t },
            set m21(t) { this._[1][0] = t },
            set m22(t) { this._[1][1] = t },
            set m23(t) { this._[1][2] = t },
            set m24(t) { this._[1][3] = t },
            set m31(t) { this._[2][0] = t },
            set m32(t) { this._[2][1] = t },
            set m33(t) { this._[2][2] = t },
            set m34(t) { this._[2][3] = t },
            set m41(t) { this._[3][0] = t },
            set m42(t) { this._[3][1] = t },
            set m43(t) { this._[3][2] = t },
            set m44(t) { this._[3][3] = t },
            translate: function(t, e, i) { return t = t || 0, e = e || 0, i = i || 0, this._[3][0] += t * this._[0][0] + e * this._[1][0] + i * this._[2][0], this._[3][1] += t * this._[0][1] + e * this._[1][1] + i * this._[2][1], this._[3][2] += t * this._[0][2] + e * this._[1][2] + i * this._[2][2], this._[3][3] += t * this._[0][3] + e * this._[1][3] + i * this._[2][3], this },
            scale: function(t, e, i) { return t = t || 1, e = e || t, i = i || 1, this._[0][0] *= t, this._[0][1] *= t, this._[0][2] *= t, this._[0][3] *= t, this._[1][0] *= e, this._[1][1] *= e, this._[1][2] *= e, this._[1][3] *= e, this._[2][0] *= i, this._[2][1] *= i, this._[2][2] *= i, this._[2][3] *= i, this },
            rotate: function(t) { return this.rotateAxisAngle(0, 0, 1, t) },
            rotateAxisAngle: function(t, e, i, s) {
                0 === t && 0 === e && 0 === i && (i = 1);
                var a = Math.sqrt(t * t + e * e + i * i);
                1 != a && (t /= a, e /= a, i /= a), s = o(s);
                var r = Math.sin(s),
                    l = Math.cos(s),
                    h = new n;
                if (1 === t && 0 === e && 0 === i) h._[0][0] = 1, h._[0][1] = 0, h._[0][2] = 0, h._[1][0] = 0, h._[1][1] = l, h._[1][2] = r, h._[2][0] = 0, h._[2][1] = -r, h._[2][2] = l, h._[0][3] = h._[1][3] = h._[2][3] = 0, h._[3][0] = h._[3][1] = h._[3][2] = 0, h._[3][3] = 1;
                else if (0 === t && 1 === e && 0 === i) h._[0][0] = l, h._[0][1] = 0, h._[0][2] = -r, h._[1][0] = 0, h._[1][1] = 1, h._[1][2] = 0, h._[2][0] = r, h._[2][1] = 0, h._[2][2] = l, h._[0][3] = h._[1][3] = h._[2][3] = 0, h._[3][0] = h._[3][1] = h._[3][2] = 0, h._[3][3] = 1;
                else if (0 === t && 0 === e && 1 === i) h._[0][0] = l, h._[0][1] = r, h._[0][2] = 0, h._[1][0] = -r, h._[1][1] = l, h._[1][2] = 0, h._[2][0] = 0, h._[2][1] = 0, h._[2][2] = 1, h._[0][3] = h._[1][3] = h._[2][3] = 0, h._[3][0] = h._[3][1] = h._[3][2] = 0, h._[3][3] = 1;
                else {
                    var c = 1 - l;
                    h._[0][0] = l + t * t * c, h._[0][1] = e * t * c + i * r, h._[0][2] = i * t * c - e * r, h._[1][0] = t * e * c - i * r, h._[1][1] = l + e * e * c, h._[1][2] = i * e * c + t * r, h._[2][0] = t * i * c + e * r, h._[2][1] = e * i * c - t * r, h._[2][2] = l + i * i * c, h._[0][3] = h._[1][3] = h._[2][3] = 0, h._[3][0] = h._[3][1] = h._[3][2] = 0, h._[3][3] = 1
                }
                return this.multiply(h)
            },
            multiply: function(t) {
                var e = [
                    [1, 0, 0, 0],
                    [0, 1, 0, 0],
                    [0, 0, 1, 0],
                    [0, 0, 0, 1]
                ];
                return e[0][0] = t._[0][0] * this._[0][0] + t._[0][1] * this._[1][0] + t._[0][2] * this._[2][0] + t._[0][3] * this._[3][0], e[0][1] = t._[0][0] * this._[0][1] + t._[0][1] * this._[1][1] + t._[0][2] * this._[2][1] + t._[0][3] * this._[3][1], e[0][2] = t._[0][0] * this._[0][2] + t._[0][1] * this._[1][2] + t._[0][2] * this._[2][2] + t._[0][3] * this._[3][2], e[0][3] = t._[0][0] * this._[0][3] + t._[0][1] * this._[1][3] + t._[0][2] * this._[2][3] + t._[0][3] * this._[3][3], e[1][0] = t._[1][0] * this._[0][0] + t._[1][1] * this._[1][0] + t._[1][2] * this._[2][0] + t._[1][3] * this._[3][0], e[1][1] = t._[1][0] * this._[0][1] + t._[1][1] * this._[1][1] + t._[1][2] * this._[2][1] + t._[1][3] * this._[3][1], e[1][2] = t._[1][0] * this._[0][2] + t._[1][1] * this._[1][2] + t._[1][2] * this._[2][2] + t._[1][3] * this._[3][2], e[1][3] = t._[1][0] * this._[0][3] + t._[1][1] * this._[1][3] + t._[1][2] * this._[2][3] + t._[1][3] * this._[3][3], e[2][0] = t._[2][0] * this._[0][0] + t._[2][1] * this._[1][0] + t._[2][2] * this._[2][0] + t._[2][3] * this._[3][0], e[2][1] = t._[2][0] * this._[0][1] + t._[2][1] * this._[1][1] + t._[2][2] * this._[2][1] + t._[2][3] * this._[3][1], e[2][2] = t._[2][0] * this._[0][2] + t._[2][1] * this._[1][2] + t._[2][2] * this._[2][2] + t._[2][3] * this._[3][2], e[2][3] = t._[2][0] * this._[0][3] + t._[2][1] * this._[1][3] + t._[2][2] * this._[2][3] + t._[2][3] * this._[3][3], e[3][0] = t._[3][0] * this._[0][0] + t._[3][1] * this._[1][0] + t._[3][2] * this._[2][0] + t._[3][3] * this._[3][0], e[3][1] = t._[3][0] * this._[0][1] + t._[3][1] * this._[1][1] + t._[3][2] * this._[2][1] + t._[3][3] * this._[3][1], e[3][2] = t._[3][0] * this._[0][2] + t._[3][1] * this._[1][2] + t._[3][2] * this._[2][2] + t._[3][3] * this._[3][2], e[3][3] = t._[3][0] * this._[0][3] + t._[3][1] * this._[1][3] + t._[3][2] * this._[2][3] + t._[3][3] * this._[3][3], this._ = e, this
            },
            skewX: function(t) { return this._skew(t, 0) },
            skewY: function(t) { return this._skew(0, t) },
            isAffine: function() { return 0 == this._[0][2] && 0 == this._[0][3] && 0 == this._[1][2] && 0 == this._[1][3] && 0 == this._[2][0] && 0 == this._[2][1] && 1 == this._[2][2] && 0 == this._[2][3] && 0 == this._[3][2] && 1 == this._[3][3] },
            inverse: function() { if (this._isIdentityOrTranslation()) return 0 == this._[3][0] && 0 == this._[3][1] && 0 == this._[3][2] ? this : (this._[3][0] *= -1, this._[3][1] *= -1, this._[3][2] *= -1, this); var t = new n; return r(this, t) ? t : new n },
            transformPoint: function(t) { return new h(this._[0][0] * t.x + this._[1][0] * t.y + this._[2][0] * t.z + this._[3][0], this._[0][1] * t.x + this._[1][1] * t.y + this._[2][1] * t.z + this._[3][1], this._[0][2] * t.x + this._[1][2] * t.y + this._[2][2] * t.z + this._[3][2]) },
            toString: function() { return this.isAffine() ? "matrix(" + [this._[0][0], this._[0][1], this._[1][0], this._[1][1], this._[3][0], this._[3][1]].join(", ") + ")" : "matrix3d(" + this._.map(function(t) { return t.join(", ") }).join(", ") + ")" },
            _setValues: function(t, e) { t.forEach(function(t, i) { this[t] = e[i] }, this) },
            _isIdentityOrTranslation: function() { return 1 == this._[0][0] && 0 == this._[0][1] && 0 == this._[0][2] && 0 == this._[0][3] && 0 == this._[1][0] && 1 == this._[1][1] && 0 == this._[1][2] && 0 == this._[1][3] && 0 == this._[2][0] && 0 == this._[2][1] && 1 == this._[2][2] && 0 == this._[2][3] && 1 == this._[3][3] },
            _skew: function(t, e) { var i = new n; return i._[0][1] = Math.tan(o(e)), i._[1][0] = Math.tan(o(t)), this.multiply(i) },
            _determinant: function() {
                var t = this._[0][0],
                    e = this._[0][1],
                    i = this._[0][2],
                    n = this._[0][3],
                    o = this._[1][0],
                    s = this._[1][1],
                    r = this._[1][2],
                    l = this._[1][3],
                    h = this._[2][0],
                    c = this._[2][1],
                    u = this._[2][2],
                    d = this._[2][3],
                    p = this._[3][0],
                    m = this._[3][1],
                    g = this._[3][2],
                    _ = this._[3][3];
                return t * a(s, c, m, r, u, g, l, d, _) - e * a(o, h, p, r, u, g, l, d, _) + i * a(o, h, p, s, c, m, l, d, _) - n * a(o, h, p, s, c, m, r, u, g)
            }
        }, e.exports = n
    }, { "@maps/geometry/point": 59 }],
    59: [function(t, e, i) {
        function n(t, e, i) { this.x = t || 0, this.y = e || 0, this.z = i || 0 } e.exports = n, n.Zero = new n, n.fromEvent = function(t) { var e = "undefined" != typeof TouchEvent && t instanceof TouchEvent ? t.targetTouches[0] : t; return new n(e.pageX, e.pageY) }, n.fromEventInElement = function(t, e) {
            var i = "undefined" != typeof TouchEvent && t instanceof TouchEvent ? t.targetTouches[0] : t,
                o = window.webkitConvertPointFromPageToNode(e, new WebKitPoint(i.pageX, i.pageY));
            return new n(o.x, o.y)
        }, n.prototype = { constructor: n, toString: function() { return "Point[" + [this.x, this.y, this.z].join(", ") + "]" }, copy: function() { return new n(this.x, this.y, this.z) }, equals: function(t) { return this.x === t.x && this.y === t.y && this.z === t.z }, distanceToPoint: function(t) { return Math.sqrt(Math.pow(this.x - t.x, 2) + Math.pow(this.y - t.y, 2) + Math.pow(this.z - t.z, 2)) } }
    }, {}],
    60: [function(t, e, i) {
        function n() { this._operations = [] }

        function o(t, e, i) { this.x = c(t), this.y = c(e), this.z = c(i) }

        function s(t, e, i) { this.x = c(t, 1), this.y = c(e, this.x), this.z = c(i, 1) }

        function a(t) { this.angle = c(t) }

        function r(t, e) { this.x = c(t), this.y = c(e) }

        function l(t, e, i, n) { this.x = c(t), this.y = c(e), this.z = c(i), this.angle = c(n) }

        function h() { if (1 === arguments.length) return arguments[0] + "px"; for (var t = 0, e = arguments.length, i = []; t < e; ++t) i.push(h(arguments[t])); return i.join(", ") }

        function c(t, e) { return null == t ? e || 0 : t }

        function u(t, e) { return t + "(" + e + ")" } n.prototype = { constructor: n, translate: function(t, e, i) { return this._operations.push(new o(t, e, i)), this }, scale: function(t, e, i) { return this._operations.push(new s(t, e, i)), this }, rotate: function(t) { return this._operations.push(new a(t)), this }, rotate3d: function(t, e, i, n) { return this._operations.push(new l(t, e, i, n)), this }, skew: function(t, e) { return this._operations.push(new r(t, e)), this }, transform: function(t) { return this._operations = this._operations.concat(t), this }, toString: function() { return this._operations.map(function(t) { return t.toString() }).join(" ") } }, e.exports = n, o.prototype = { constructor: o, toString: function() { return !this.x || this.y || this.z ? !this.y || this.x || this.z ? !this.z || this.x || this.y ? this.z ? u("translate3d", h(this.x, this.y, this.z)) : u("translate", h(this.x, this.y)) : u("translateZ", h(this.z)) : u("translateY", h(this.y)) : u("translateX", h(this.x)) } }, s.prototype = { constructor: s, toString: function() { return 1 !== this.x && 1 === this.y && 1 === this.z ? u("scaleX", this.x) : 1 !== this.y && 1 === this.x && 1 === this.z ? u("scaleY", this.y) : 1 !== this.z && 1 === this.x && 1 === this.y ? u("scaleZ", this.z) : 1 === this.z ? this.x === this.y ? u("scale", this.x) : u("scale", [this.x, this.y].join(", ")) : u("scale3d", [this.x, this.y, this.z].join(", ")) } }, a.prototype = { constructor: a, toString: function() { return u("rotate", angle + "deg") } }, r.prototype = { constructor: r, toString: function() { return 0 !== this.x && 0 === this.y ? u("skewX", this.x + "deg") : 0 !== this.y && 0 === this.x ? u("skewY", this.y + "deg") : u("skew", [this.x + "deg", this.y + "deg"].join(", ")) } }, l.prototype = { constructor: a, toString: function() { return u("rotate3d", [this.x, this.y, this.z, this.angle].join(", ") + "deg") } }
    }, {}],
    61: [function(t, e, i) {
        function n(t, e) { if (window.matchMedia) { var i = window.matchMedia(t); "function" == typeof i.addListener && (h = !0, i.addListener(e)) } }

        function o() { return h ? c : s() }

        function s() { return null != r ? r : "devicePixelRatio" in window ? Math.max(Math.round(window.devicePixelRatio), 1) : "screen" in window && "deviceXDPI" in window.screen && "logicalXDPI" in window.screen ? Math.max(Math.round(window.screen.deviceXDPI / window.screen.logicalXDPI), 1) : 1 }

        function a() {
            c = s();
            var t = new l.Event("device-pixel-ratio-change");
            t.value = o(), o.dispatchEvent(t)
        }
        var r, l = t("@maps/dom-events"),
            h = !1,
            c = s();
        n("(-webkit-device-pixel-ratio: 1)", a), n("(-moz-device-pixel-ratio: 1)", a), l.EventTarget(o), e.exports = o, e.exports.roundToDevicePixel = function(t) { var e = o(); return Math.round(t * e) / e }, e.exports.simulateDevicePixelRatio = function(t) { r = t, c = null == t ? s() : r, a() }
    }, { "@maps/dom-events": 62 }],
    62: [function(t, e, i) {
        function n(t) { if (t) return t.addEventListener = n.prototype.addEventListener, t.removeEventListener = n.prototype.removeEventListener, t.dispatchEvent = n.prototype.dispatchEvent, t }

        function o(t) { this.type = t, this.target = null, this.defaultPrevented = !1, this._stoppedPropagation = !1 } e.exports = { EventTarget: n, Event: o }, n.prototype = {
            constructor: n,
            addEventListener: function(t, e, i) {
                if (i = i || null, console.assert(t, "Object.addEventListener: invalid event type ", t, "(listener: ", e, "thisObject: ", i, ")"), !t) return !1;
                if (console.assert(e, "Object.addEventListener: invalid listener ", e, "(event type: ", t, "thisObject: ", i, ")"), !e) return !1;
                this._listeners || (this._listeners = {});
                var n = this._listeners[t];
                n || (n = this._listeners[t] = []);
                for (var o = 0; o < n.length; ++o)
                    if (n[o].listener === e && n[o].thisObject === i) return !1;
                return n.push({ thisObject: i, listener: e }), !0
            },
            removeEventListener: function(t, e, i) {
                if (t = t || null, e = e || null, i = i || null, !this._listeners) return !1;
                if (!t) { for (t in this._listeners) this.removeEventListener(t, e, i); return !1 }
                var n = this._listeners[t];
                if (!n) return !1;
                for (var o = !1, s = n.length - 1; s >= 0; --s)
                    if (e && n[s].listener === e && n[s].thisObject === i || !e && i && n[s].thisObject === i) { n.splice(s, 1), o = !0; break }
                return n.length || delete this._listeners[t], Object.keys(this._listeners).length || delete this._listeners, o
            },
            dispatchEvent: function(t) {
                if (t.target = this, !this._listeners || !this._listeners[t.type] || t._stoppedPropagation) return !0;
                for (var e = this._listeners[t.type].slice(0), i = 0; i < e.length; ++i) {
                    var n = e[i].thisObject,
                        o = e[i].listener;
                    if (n || "function" == typeof o || "function" != typeof o.handleEvent ? o.call(n, t) : o.handleEvent.call(o, t), t._stoppedPropagation) break
                }
                return !t.defaultPrevented
            }
        }, o.prototype = { constructor: o, stopPropagation: function() { this._stoppedPropagation = !0 }, preventDefault: function() { this.defaultPrevented = !0 } }
    }, {}],
    63: [function(t, e, i) {
        var n = t("./src/types"),
            o = t("./src/functions"),
            s = t("./src/webgl");
        e.exports = function(t, e) { t = t || 0, e = e || 0; var i = {}; return i.shouldTryCSR = [n, o, s].every(function(n) { var o = n.fn(t, e); return i[n.name] = o, "object" == typeof o ? o.capable : o }), i }
    }, { "./src/functions": 64, "./src/types": 65, "./src/webgl": 66 }],
    64: [function(t, e, i) { e.exports = { name: "functions", fn: function() { return !!(Array.prototype.fill && Uint8Array.from && window.btoa) } } }, {}],
    65: [function(t, e, i) { e.exports = { name: "types", fn: function() { return !!(Float32Array && Float64Array && Uint8Array && Int32Array) } } }, {}],
    66: [function(t, e, i) {
        function n(t, e, i) { return t.getParameter(t.MAX_TEXTURE_SIZE) >= 4096 && t.getParameter(t.MAX_RENDERBUFFER_SIZE) >= 2 * e && t.getParameter(t.MAX_RENDERBUFFER_SIZE) >= 2 * i && t.getParameter(t.MAX_VERTEX_TEXTURE_IMAGE_UNITS) >= 8 && t.getParameter(t.MAX_VARYING_VECTORS) >= 8 && t.getParameter(t.STENCIL_BITS) >= 8 }

        function o(t) { return { VERSION: t.getParameter(t.VERSION), MAX_RENDERBUFFER_SIZE: t.getParameter(t.MAX_RENDERBUFFER_SIZE) } } e.exports = {
            name: "webGL",
            fn: function(t, e) {
                var i = document.createElement("canvas");
                i.width = i.height = 0;
                var s = i.getContext("webgl", { antialias: !1, stencil: !0, failIfMajorPerformanceCaveat: !0 });
                return !!s && { capable: n(s, t, e), gpuInfo: o(s) }
            }
        }
    }, {}],
    67: [function(t, e, i) {
        "use strict";

        function n(t, e, i, n) { 1 === arguments.length && t && "object" == typeof t ? ("x" in t && (this.x = t.x), "y" in e && (this.y = t.y), "z" in t && (this.z = t.z), "w" in t && (this.w = t.w)) : arguments.length > 0 && (this.x = t, arguments.length > 1 && (this.y = e, arguments.length > 2 && (this.z = i, arguments.length > 3 && (this.w = n)))) } n.prototype = {
            _x: 0,
            _y: 0,
            _z: 0,
            _w: 1,
            get x() { return this._x },
            set x(t) {
                if (null === t || isNaN(t)) throw "[DOMPoint] `" + t + "` set for x is not a number";
                this._x = t
            },
            get y() { return this._y },
            set y(t) {
                if (null === t || isNaN(t)) throw "[DOMPoint] `" + t + "` set for y is not a number";
                this._y = t
            },
            get z() { return this._z },
            set z(t) {
                if (null === t || isNaN(t)) throw "[DOMPoint] `" + t + "` set for z is not a number";
                this._z = t
            },
            get w() { return this._w },
            set w(t) {
                if (null === t || isNaN(t)) throw "[DOMPoint] `" + t + "` set for w is not a number";
                this._w = t
            },
            matrixTransform: function(t) { return console.warn("DOMPoint.matrixTransform is not implemented yet."), this }
        }, e.exports = n
    }, {}],
    68: [function(t, e, i) { e.exports = { Point: t("./point"), Size: t("./size"), Rect: t("./rect") } }, { "./point": 69, "./rect": 70, "./size": 71 }],
    69: [function(t, e, i) { arguments[4][59][0].apply(i, arguments) }, { dup: 59 }],
    70: [function(t, e, i) {
        function n(t, e, i, n) { this.origin = new o(t || 0, e || 0), this.size = new s(i || 0, n || 0) } e.exports = n;
        var o = t("./point"),
            s = t("./size");
        n.Zero = new n, n.rectFromClientRect = function(t) { return new n(t.left, t.top, t.width, t.height) }, n.unionOfRects = function(t) { for (var e = t[0], i = 1; i < t.length; ++i) e = e.unionWithRect(t[i]); return e }, n.prototype = {
            constructor: n,
            toString: function() { return "Rect[" + [this.origin.x, this.origin.y, this.size.width, this.size.height].join(", ") + "]" },
            copy: function() { return new n(this.origin.x, this.origin.y, this.size.width, this.size.height) },
            equals: function(t) { return this.origin.equals(t.origin) && this.size.equals(t.size) },
            inset: function(t, e, i, o) { return new n(this.origin.x + t, this.origin.y + e, this.size.width - t - i, this.size.height - e - o) },
            pad: function(t) { return new n(this.origin.x - t, this.origin.y - t, this.size.width + 2 * t, this.size.height + 2 * t) },
            minX: function() { return this.origin.x },
            minY: function() { return this.origin.y },
            midX: function() { return this.origin.x + this.size.width / 2 },
            midY: function() { return this.origin.y + this.size.height / 2 },
            maxX: function() { return this.origin.x + this.size.width },
            maxY: function() { return this.origin.y + this.size.height },
            intersectionWithRect: function(t) {
                var e = new n,
                    i = Math.max(this.minX(), t.minX()),
                    o = Math.min(this.maxX(), t.maxX());
                if (i > o) return e;
                var s = Math.max(this.minY(), t.minY()),
                    a = Math.min(this.maxY(), t.maxY());
                return s > a ? e : (e.origin.x = i, e.origin.y = s, e.size.width = o - i, e.size.height = a - s, e)
            },
            unionWithRect: function(t) {
                var e = Math.min(this.minX(), t.minX()),
                    i = Math.min(this.minY(), t.minY());
                return new n(e, i, Math.max(this.maxX(), t.maxX()) - e, Math.max(this.maxY(), t.maxY()) - i)
            },
            round: function() { return new n(Math.floor(this.origin.x), Math.floor(this.origin.y), Math.ceil(this.size.width), Math.ceil(this.size.height)) }
        }
    }, { "./point": 69, "./size": 71 }],
    71: [function(t, e, i) {
        function n(t, e) { this.width = t || 0, this.height = e || 0 } e.exports = n, n.Zero = new n, n.prototype = { constructor: n, toString: function() { return "Size[" + this.width + ", " + this.height + "]" }, copy: function() { return new n(this.width, this.height) }, equals: function(t) { return this.width === t.width && this.height === t.height } }
    }, {}],
    72: [function(t, e, i) {
        var n = t("./js/gesture-recognizer");
        e.exports = { GestureRecognizer: n, SupportsTouches: n.SupportsTouches, States: n.States, LongPress: t("./js/long-press"), Pan: t("./js/pan"), Pinch: t("./js/pinch"), Rotation: t("./js/rotation"), Swipe: t("./js/swipe"), Tap: t("./js/tap"), View: t("./js/view") }
    }, { "./js/gesture-recognizer": 73, "./js/long-press": 74, "./js/pan": 75, "./js/pinch": 76, "./js/rotation": 77, "./js/swipe": 78, "./js/tap": 79, "./js/view": 80 }],
    73: [function(t, e, i) {
        function n() { o.EventTarget.call(this), this._targetTouches = [], this._enabled = !0, this._target = null, this.view = null, this.state = n.States.Possible, this.delegate = null }
        var o = t("@maps/dom-events"),
            s = t("@maps/geometry/point"),
            a = t("@maps/web-point-converter");
        n.SupportsTouches = "createTouch" in document, n.SupportsGestures = !!window.GestureEvent, n.States = { Possible: "possible", Began: "began", Changed: "changed", Ended: "ended", Cancelled: "cancelled", Failed: "failed", Recognized: "ended" }, n.Events = { TouchStart: n.SupportsTouches ? "touchstart" : "mousedown", TouchMove: n.SupportsTouches ? "touchmove" : "mousemove", TouchEnd: n.SupportsTouches ? "touchend" : "mouseup", TouchCancel: "touchcancel", GestureStart: "gesturestart", GestureChange: "gesturechange", GestureEnd: "gestureend", StateChange: "statechange" }, n.prototype = Object.create(o.EventTarget.prototype, { target: { get: function() { return this._target }, set: function(t) { t && this._target !== t && (this._target = t, this._initRecognizer()) } }, numberOfTouches: { get: function() { return this._targetTouches.length } }, enabled: { get: function() { return this._enabled }, set: function(t) { this._enabled !== t && (this._enabled = t, t || (0 === this.numberOfTouches ? (this._removeTrackingListeners(), this.reset()) : this.enterCancelledState()), this._updateBaseListeners()) } } }), n.prototype.constructor = n, n.prototype.modifierKeys = { alt: !1, ctrl: !1, meta: !1, shift: !1 }, n.prototype.reset = function() {}, n.prototype.locationInElement = function(t) {
            for (var e = new s, i = this._targetTouches, n = 0, o = i.length; n < o; ++n) {
                var r = i[n];
                e.x += r.pageX, e.y += r.pageY
            }
            return e.x /= o, e.y /= o, t ? a.fromPageToElement(t, e) : e
        }, n.prototype.locationInClient = function() {
            for (var t = new s, e = this._targetTouches, i = 0, n = e.length; i < n; ++i) {
                var o = e[i];
                t.x += o.clientX, t.y += o.clientY
            }
            return t.x /= n, t.y /= n, t
        }, n.prototype.locationOfTouchInElement = function(t, e) { var i = this._targetTouches[t]; if (!i) return new s; var n = new s(i.pageX, i.pageY); return e ? a.fromPageToElement(e, n) : n }, n.prototype.touchesBegan = function(t) { t.currentTarget === this._target && (window.addEventListener(n.Events.TouchMove, this, !0), window.addEventListener(n.Events.TouchEnd, this, !0), window.addEventListener(n.Events.TouchCancel, this, !0), this.enterPossibleState()) }, n.prototype.touchesMoved = function(t) {}, n.prototype.touchesEnded = function(t) {}, n.prototype.touchesCancelled = function(t) {}, n.prototype.gestureBegan = function(t) { t.currentTarget === this._target && (window.addEventListener(n.Events.GestureChange, this, !0), window.addEventListener(n.Events.GestureEnd, this, !0), this.enterPossibleState()) }, n.prototype.gestureChanged = function(t) {}, n.prototype.gestureEnded = function(t) {}, n.prototype.enterPossibleState = function() { this._setStateAndNotifyOfChange(n.States.Possible) }, n.prototype.enterBeganState = function() {!this.delegate || "function" != typeof this.delegate.gestureRecognizerShouldBegin || this.delegate.gestureRecognizerShouldBegin(this) ? this._setStateAndNotifyOfChange(n.States.Began) : this.enterFailedState() }, n.prototype.enterEndedState = function() { this._setStateAndNotifyOfChange(n.States.Ended), this._removeTrackingListeners(), this.reset() }, n.prototype.enterCancelledState = function() { this._setStateAndNotifyOfChange(n.States.Cancelled), this._removeTrackingListeners(), this.reset() }, n.prototype.enterFailedState = function() { this._setStateAndNotifyOfChange(n.States.Failed), this._removeTrackingListeners(), this.reset() }, n.prototype.enterChangedState = function() { this._setStateAndNotifyOfChange(n.States.Changed) }, n.prototype.enterRecognizedState = function() { this._setStateAndNotifyOfChange(n.States.Recognized) }, n.prototype.handleEvent = function(t) {
            switch (this._updateTargetTouches(t), this._updateKeyboardModifiers(t), t.type) {
                case n.Events.TouchStart:
                    this.touchesBegan(t);
                    break;
                case n.Events.TouchMove:
                    this.touchesMoved(t);
                    break;
                case n.Events.TouchEnd:
                    this.touchesEnded(t);
                    break;
                case n.Events.TouchCancel:
                    this.touchesCancelled(t);
                    break;
                case n.Events.GestureStart:
                    this.gestureBegan(t);
                    break;
                case n.Events.GestureChange:
                    this.gestureChanged(t);
                    break;
                case n.Events.GestureEnd:
                    this.gestureEnded(t)
            }
        }, n.prototype._initRecognizer = function() { this.reset(), this.state = n.States.Possible, this._updateBaseListeners() }, n.prototype._updateBaseListeners = function() { this._target && (this._enabled ? (this._target.addEventListener(n.Events.TouchStart, this), n.SupportsGestures && this._target.addEventListener(n.Events.GestureStart, this)) : (this._target.removeEventListener(n.Events.TouchStart, this), n.SupportsGestures && this._target.removeEventListener(n.Events.GestureStart, this))) }, n.prototype._removeTrackingListeners = function() { window.removeEventListener(n.Events.TouchMove, this, !0), window.removeEventListener(n.Events.TouchEnd, this, !0), window.removeEventListener(n.Events.GestureChange, this, !0), window.removeEventListener(n.Events.GestureEnd, this, !0) }, n.prototype._setStateAndNotifyOfChange = function(t) { this.state = t, this.dispatchEvent(new o.Event(n.Events.StateChange)) }, n.prototype._updateTargetTouches = function(t) {
            if (n.SupportsTouches) {
                if (t instanceof TouchEvent)
                    if (t.type !== n.Events.TouchStart)
                        if (t.type !== n.Events.TouchMove) {
                            for (var e = t.touches, i = [], o = 0, s = e.length; o < s; ++o) i.push(e[o].identifier);
                            this._targetTouches = this._targetTouches.filter(function(t) { return -1 !== i.indexOf(t.identifier) })
                        }
                else {
                    var a = this._targetTouches.map(function(t) { return t.identifier });
                    this._targetTouches = [];
                    for (var r = t.touches, o = 0, s = r.length; o < s; ++o) { var l = r[o]; - 1 !== a.indexOf(l.identifier) && this._targetTouches.push(l) }
                }
                else { this._targetTouches = []; for (var o = 0, s = (r = t.targetTouches).length; o < s; ++o) this._targetTouches.push(r[o]) }
            }
            else t.type === n.Events.TouchEnd ? this._targetTouches = [] : this._targetTouches = [t]
        }, n.prototype._updateKeyboardModifiers = function(t) { this.modifierKeys.alt = t.altKey, this.modifierKeys.ctrl = t.ctrlKey, this.modifierKeys.meta = t.metaKey, this.modifierKeys.shift = t.shiftKey }, e.exports = n
    }, { "@maps/dom-events": 62, "@maps/geometry/point": 82, "@maps/web-point-converter": 83 }],
    74: [function(t, e, i) {
        function n() { this.allowableMovement = 10, this.minimumPressDuration = 500, this.numberOfTouchesRequired = 1, this.allowsRightMouseButton = !1, o.call(this) }
        var o = t("./gesture-recognizer");
        n.prototype = Object.create(o.prototype), n.constructor = n, n.prototype.touchesBegan = function(t) { t.currentTarget === this.target && (2 !== t.button || this.allowsRightMouseButton) && (o.prototype.touchesBegan.call(this, t), this.numberOfTouches === this.numberOfTouchesRequired ? (this._startPoint = this.locationInElement(), this._timerId = window.setTimeout(this.enterRecognizedState.bind(this), this.minimumPressDuration)) : this.enterFailedState()) }, n.prototype.touchesMoved = function(t) { t.preventDefault(), this._startPoint.distanceToPoint(this.locationInElement()) > this.allowableMovement && this.enterFailedState() }, n.prototype.touchesEnded = function(t) { this.state === o.States.Recognized ? (t.preventDefault(), this.numberOfTouches !== this.numberOfTouchesRequired && this.enterFailedState()) : this.enterFailedState() }, n.prototype.reset = function() { window.clearTimeout(this._timerId), delete this._timerId }, e.exports = n
    }, { "./gesture-recognizer": 73 }],
    75: [function(t, e, i) {
        function n() { a.call(this) }

        function o() { return { start: new r, end: new r, dt: 0 } }

        function s(t) { return t.dt < 1 ? new r : new r((t.end.x - t.start.x) / t.dt * 1e3, (t.end.y - t.start.y) / t.dt * 1e3) }
        var a = t("./gesture-recognizer"),
            r = t("@maps/geometry/point");
        (n.prototype = Object.create(a.prototype, {
            velocity: {
                get: function() {
                    if (Date.now() - this._lastTouchTime > 100) return new r;
                    var t = s(this._velocitySample);
                    if (a.SupportsTouches && this._previousVelocitySample.dt > 0) {
                        var e = s(this._previousVelocitySample);
                        t.x = .25 * t.x + .75 * e.x, t.y = .25 * t.y + .75 * e.y
                    }
                    return t
                }
            }
        })).constructor = n, n.prototype.minimumNumberOfTouches = 1, n.prototype.maximumNumberOfTouches = 1e5, n.prototype.translationThreshold = 10, n.prototype.touchesBegan = function(t) { t.currentTarget === this.target && (t instanceof MouseEvent && 0 !== t.button || (a.prototype.touchesBegan.call(this, t), this._numberOfTouchesIsAllowed() ? (this._lastTouchTime = Date.now(), this._resetTrackedLocations(), 1 === this.numberOfTouches && (this._travelledMinimumDistance = !1)) : this.enterFailedState())) }, n.prototype.touchesMoved = function(t) {
            t.preventDefault();
            var e = Date.now(),
                i = this.locationInElement(),
                n = e - this._lastTouchTime;
            n > 8 && (this._previousVelocitySample.start = this._velocitySample.start.copy(), this._previousVelocitySample.end = this._velocitySample.end.copy(), this._previousVelocitySample.dt = this._velocitySample.dt, this._velocitySample.start = this._lastTouchLocation.copy(), this._velocitySample.end = i, this._velocitySample.dt = n), this._travelledMinimumDistance ? (this.translation.x += i.x - this._lastTouchLocation.x, this.translation.y += i.y - this._lastTouchLocation.y, this.enterChangedState()) : this._canBeginWithTravelledDistance(new r(i.x - this._translationOrigin.x, i.y - this._translationOrigin.y)) && (this._travelledMinimumDistance = !0, this.enterBeganState()), this._lastTouchTime = e, this._lastTouchLocation = i
        }, n.prototype.touchesEnded = function(t) { this._numberOfTouchesIsAllowed() ? this._resetTrackedLocations() : this._travelledMinimumDistance ? this.enterEndedState() : this.enterFailedState() }, n.prototype.reset = function() { this._velocitySample = o(), this._previousVelocitySample = o(), this._gestures = [], this.translation = new r, delete this._travelledMinimumDistance }, n.prototype._travelledMinimumDistance = !1, n.prototype._previousVelocitySample = o(), n.prototype._velocitySample = o(), n.prototype._canBeginWithTravelledDistance = function(t) { return Math.abs(t.x) >= this.translationThreshold || Math.abs(t.y) >= this.translationThreshold }, n.prototype._numberOfTouchesIsAllowed = function() { return this.numberOfTouches >= this.minimumNumberOfTouches && this.numberOfTouches <= this.maximumNumberOfTouches }, n.prototype._resetTrackedLocations = function() {
            var t = this.locationInElement();
            this._lastTouchLocation = t, this._translationOrigin = t
        }, e.exports = n
    }, { "./gesture-recognizer": 73, "@maps/geometry/point": 82 }],
    76: [function(t, e, i) {
        function n() { o.call(this) }
        var o = t("./gesture-recognizer"),
            s = t("@maps/geometry/point"),
            a = !!window.GestureEvent;
        n.prototype = Object.create(o.prototype, { velocity: { get: function() { var t = this._gestures[this._gestures.length - 1]; if (!t) return this._velocity; var e = Date.now() - (t.timeStamp + 100); if (e <= 0) return this._velocity; var i = Math.max((500 - e) / 500, 0); return this._velocity * i } } }), n.constructor = n, n.prototype.scaleThreshold = 0, n.prototype.touchesBegan = function(t) {
            if (t.currentTarget === this.target) {
                if (a) { if (2 !== this.numberOfTouches) return }
                else {
                    if (this.numberOfTouches > 2) return void this.enterFailedState();
                    if (2 !== this.numberOfTouches) return;
                    this._startDistance = this._distance(), this._recordGesture(1), this._scaledMinimumAmount = !1, this._updateStateWithEvent(t)
                }
                o.prototype.touchesBegan.call(this, t)
            }
        }, n.prototype.touchesMoved = function(t) { a || 2 === this.numberOfTouches && this._updateStateWithEvent(t) }, n.prototype.touchesEnded = function(t) { a || this.numberOfTouches >= 2 || !this._startDistance || (this._scaledMinimumAmount ? this.enterEndedState() : this.enterFailedState()) }, n.prototype.gestureBegan = function(t) { o.prototype.gestureBegan.call(this, t), this._recordGesture(t.scale), this._scaledMinimumAmount = !1, this._updateStateWithEvent(t), t.preventDefault() }, n.prototype.gestureChanged = function(t) { t.preventDefault(), this._updateStateWithEvent(t) }, n.prototype.gestureEnded = function(t) { this._scaledMinimumAmount ? this.enterEndedState() : this.enterFailedState() }, n.prototype.reset = function() { this.scale = 1, this._velocity = 0, this._gestures = [], delete this._startDistance }, n.prototype._scaledMinimumAmount = !1, n.prototype._recordGesture = function(t) {
            var e = Date.now(),
                i = this._gestures.push({ scale: t, timeStamp: e });
            if (!(i <= 2)) { for (var n = this._gestures[i - 1].scale >= this._gestures[i - 2].scale, o = i - 3; o >= 0; --o) { var s = this._gestures[o]; if (e - s.timeStamp > 100 || this._gestures[o + 1].scale >= s.scale !== n) break } o > 0 && (this._gestures = this._gestures.slice(o + 1)) }
        }, n.prototype._updateStateWithEvent = function(t) {
            var e = a ? t.scale : this._distance() / this._startDistance;
            if (this._scaledMinimumAmount) {
                this._recordGesture(e);
                var i = this._gestures[0],
                    n = e - i.scale,
                    o = Date.now() - i.timeStamp;
                this._velocity = 0 === o ? 0 : n / o * 1e3, this.scale *= e / this._gestures[this._gestures.length - 2].scale, this.enterChangedState()
            }
            else Math.abs(1 - e) >= this.scaleThreshold && (this._scaledMinimumAmount = !0, this.scale = 1, this.enterBeganState())
        }, n.prototype._distance = function() {
            console.assert(2 === this.numberOfTouches);
            var t = this._targetTouches[0],
                e = new s(t.pageX, t.pageY),
                i = this._targetTouches[1],
                n = new s(i.pageX, i.pageY);
            return e.distanceToPoint(n)
        }, e.exports = n
    }, { "./gesture-recognizer": 73, "@maps/geometry/point": 82 }],
    77: [function(t, e, i) {
        function n() { s.call(this) }

        function o(t, e) {
            var i = t - e,
                n = t + 180 - e;
            return Math.abs(n) < Math.abs(i) ? n : i
        }
        var s = t("./gesture-recognizer"),
            a = t("@maps/geometry/point"),
            r = !!window.GestureEvent;
        n.prototype = Object.create(s.prototype, { velocity: { get: function() { var t = this._gestures[this._gestures.length - 1]; if (!t) return this._velocity; var e = Date.now() - (t.timeStamp + 100); if (e <= 0) return this._velocity; var i = Math.max((500 - e) / 500, 0); return this._velocity * i } } }), n.constructor = n, n.prototype.touchesBegan = function(t) {
            if (t.currentTarget === this.target && 2 === this.numberOfTouches && (s.prototype.touchesBegan.call(this, t), !r))
                if (this.numberOfTouches > 2) this.enterFailedState();
                else if (2 === this.numberOfTouches) {
                this._startAngle = this._angle();
                var t = { rotation: 0 };
                this._recordGesture(t), this.enterBeganState()
            }
        }, n.prototype.touchesMoved = function(t) { r || 2 === this.numberOfTouches && this._updateStateWithEvent(t) }, n.prototype.touchesEnded = function(t) { r || this.numberOfTouches >= 2 || null === this._startAngle || this.enterEndedState() }, n.prototype.gestureBegan = function(t) { s.prototype.gestureBegan.call(this, t), this._recordGesture(t), this.rotation = 0, this.enterBeganState() }, n.prototype.gestureChanged = function(t) {
            t.preventDefault(), this.enterChangedState(), this._recordGesture(t);
            var e = this._gestures[0],
                i = o(t.rotation, e.rotation),
                n = Date.now() - e.timeStamp;
            this._velocity = i / n * 1e3, this.rotation += o(t.rotation, this._gestures[this._gestures.length - 2].rotation)
        }, n.prototype.gestureEnded = function(t) { this.enterEndedState() }, n.prototype.reset = function() { this.rotation = 0, this._velocity = 0, this._gestures = [], this._startAngle = null }, n.prototype._recordGesture = function(t) {
            var e = Date.now(),
                i = this._gestures.push({ rotation: t.rotation, timeStamp: e });
            if (!(i <= 2)) { for (var n = this._gestures[i - 1].rotation >= this._gestures[i - 2].rotation, o = i - 3; o >= 0; --o) { var s = this._gestures[o]; if (e - s.timeStamp > 100 || this._gestures[o + 1].rotation >= s.rotation !== n) break } o > 0 && (this._gestures = this._gestures.slice(o + 1)) }
        }, n.prototype._updateStateWithEvent = function(t) {
            var e = r ? t.rotation : this._angle() - this._startAngle;
            this._recordGesture({ rotation: e });
            var i = this._gestures[0],
                n = e - i.rotation,
                o = Date.now() - i.timeStamp;
            this._velocity = 0 === o ? 0 : n / o * 1e3, this.rotation += e - this._gestures[this._gestures.length - 2].rotation, this.enterChangedState()
        }, n.prototype._angle = function() {
            console.assert(2 === this.numberOfTouches);
            var t = this._targetTouches[0],
                e = new a(t.pageX, t.pageY),
                i = this._targetTouches[1],
                n = new a(i.pageX, i.pageY);
            return 180 * Math.atan2(e.y - n.y, e.x - n.x) / Math.PI
        }, e.exports = n
    }, { "./gesture-recognizer": 73, "@maps/geometry/point": 82 }],
    78: [function(t, e, i) {
        function n() { this.numberOfTouchesRequired = 1, this.direction = n.Directions.Right, o.call(this) }
        var o = t("./gesture-recognizer"),
            s = t("@maps/geometry/point");
        n.Directions = { Right: 1, Left: 2, Up: 4, Down: 8 }, n.prototype = Object.create(o.prototype), n.constructor = n, n.prototype.touchesBegan = function(t) { t.currentTarget === this.target && (this.numberOfTouchesRequired === this.numberOfTouches ? (o.prototype.touchesBegan.call(this, t), this._translationOrigin = this.locationInElement()) : this.enterFailedState()) }, n.prototype.touchesMoved = function(t) {
            if (this.numberOfTouchesRequired === this.numberOfTouches) {
                t.preventDefault();
                var e = this.locationInElement(),
                    i = new s(e.x - this._translationOrigin.x, e.y - this._translationOrigin.y);
                this.state !== o.States.Recognized && this.direction === n.Directions.Right && i.x > 100 && Math.abs(i.x) > Math.abs(i.y) && this.enterRecognizedState(), this.state !== o.States.Recognized && this.direction === n.Directions.Left && i.x < -100 && Math.abs(i.x) > Math.abs(i.y) && this.enterRecognizedState(), this.state !== o.States.Recognized && this.direction === n.Directions.Up && i.y < -100 && Math.abs(i.y) > Math.abs(i.x) && this.enterRecognizedState(), this.state !== o.States.Recognized && this.direction === n.Directions.Down && i.y > 100 && Math.abs(i.y) > Math.abs(i.x) && this.enterRecognizedState()
            }
            else this.enterFailedState()
        }, n.prototype.touchesEnded = function(t) { this.enterFailedState() }, e.exports = n
    }, { "./gesture-recognizer": 73, "@maps/geometry/point": 82 }],
    79: [function(t, e, i) {
        function n() { this.numberOfTapsRequired = 1, this.numberOfTouchesRequired = 1, this.allowsRightMouseButton = !1, o.call(this) }
        var o = t("./gesture-recognizer"),
            s = t("@maps/web-point-converter"),
            a = t("@maps/geometry/point"),
            r = o.SupportsTouches ? 40 : 0;
        n.prototype = Object.create(o.prototype), n.constructor = n, n.prototype.touchesBegan = function(t) { t.currentTarget === this.target && (2 !== t.button || this.allowsRightMouseButton) && (o.prototype.touchesBegan.call(this, t), this.numberOfTouches === this.numberOfTouchesRequired ? (this._startPoint = o.prototype.locationInElement.call(this), this._startClientPoint = o.prototype.locationInClient.call(this), this._rewindTimer(750)) : this.enterFailedState()) }, n.prototype.touchesMoved = function(t) { t.preventDefault(), this._startPoint.distanceToPoint(o.prototype.locationInElement.call(this)) > r && this.enterFailedState() }, n.prototype.touchesEnded = function(t) {++this._taps === this.numberOfTapsRequired && (t.preventDefault(), this.enterRecognizedState(), this.reset()), this._rewindTimer(350) }, n.prototype.reset = function() { this._taps = 0, this._clearTimer() }, n.prototype.locationInElement = function(t) { var e = this._startPoint || new a; return t ? s.fromPageToElement(t, e) : e }, n.prototype.locationInClient = function() { return this._startClientPoint || new a }, n.prototype._clearTimer = function() { window.clearTimeout(this._timerId), delete this._timerId }, n.prototype._rewindTimer = function(t) { this._clearTimer(), this._timerId = window.setTimeout(this._timerFired.bind(this), t) }, n.prototype._timerFired = function() { this.enterFailedState() }, e.exports = n
    }, { "./gesture-recognizer": 73, "@maps/geometry/point": 82, "@maps/web-point-converter": 83 }],
    80: [function(t, e, i) {
        function n(t) { this.element = "string" == typeof t ? document.getElementById(t) : t, this.scale = 1, this.rotation = this.x = this.y = this.z = 0, this.transform = {} } e.exports = n;
        t("./gesture-recognizer");
        n.prototype = {
            constructor: n,
            set transform(t) { this._x = this._getDefined(t.x, this._x, this.x), this._y = this._getDefined(t.y, this._y, this.y), this._z = this._getDefined(t.z, this._z, this.z), this._scale = this._getDefined(t.scale, this._scale, this.scale), this._rotation = this._getDefined(t.rotation, this._rotation, this.rotation), this.element.style.webkitTransform = "translate3d(" + this._x + "px, " + this._y + "px, " + this._z + ") scale(" + this._scale + ") rotate(" + this._rotation + "deg)" },
            addGestureRecognizer: function(t) { t.target = this.element, t.view = this },
            _getDefined: function() {
                for (var t = 0; t < arguments.length; t++)
                    if (void 0 !== arguments[t]) return arguments[t];
                return arguments[arguments.length - 1]
            }
        }
    }, { "./gesture-recognizer": 73 }],
    81: [function(t, e, i) { arguments[4][58][0].apply(i, arguments) }, { "@maps/geometry/point": 82, dup: 58 }],
    82: [function(t, e, i) { arguments[4][59][0].apply(i, arguments) }, { dup: 59 }],
    83: [function(t, e, i) {
        function n(t) {
            for (var e, i = t.getBoundingClientRect(), n = t.offsetWidth, a = t.offsetHeight, r = [new s(0, 0), new s(n, 0), new s(n, a), new s(0, a)], l = new o, h = t.ownerDocument.defaultView; t.nodeType === Node.ELEMENT_NODE;) e = h.getComputedStyle(t), l = new o(e.transform || e.MozTransform || e.msTransform || e.WebkitTransform).multiply(l), t = t.parentNode;
            var c = 1 / 0,
                u = 1 / 0;
            r.forEach(function(t) {
                var e = l.transformPoint(t);
                c = Math.min(c, e.x), u = Math.min(u, e.y)
            });
            var d = window.pageXOffset + i.left - c,
                p = window.pageYOffset + i.top - u;
            return (new o).translate(d, p).multiply(l)
        }
        var o = t("@maps/css-matrix"),
            s = t("@maps/geometry/point");
        e.exports = { fromPageToElement: function(t, e) { if (window.webkitConvertPointFromPageToNode) { var i = window.webkitConvertPointFromPageToNode(t, new WebKitPoint(e.x, e.y)); return new s(i.x, i.y) } return n(t).inverse().transformPoint(e) }, fromElementToPage: function(t, e) { if (window.webkitConvertPointFromNodeToPage) { var i = window.webkitConvertPointFromNodeToPage(t, new WebKitPoint(e.x, e.y)); return new s(i.x, i.y) } return n(t).transformPoint(e) } }
    }, { "@maps/css-matrix": 81, "@maps/geometry/point": 82 }],
    84: [function(t, e, i) {
        var n = Math.log(2),
            o = [/MSIE [5-9]\./, /Firefox\/[1-9]\./, /Firefox\/[1-2][0-9]\./, /Firefox\/3[0-1]\./, /Firefox\/[0-9]\./, /Firefox\/[1-2][0-9]\./, /Firefox\/3[0-6]\./, /Android [0-3]\./, /Android 4\.[0-3]\./],
            s = [/\(Macintosh; Intel Mac OS X 10.9*\)*/, /\(Macintosh; Intel Mac OS X 10_9*\)*/, /\(Macintosh; Intel Mac OS X 10_??;*\)*/, /\(Macintosh; Intel Mac OS X 10.??;*\)*/, /\(Macintosh; Intel Mac OS X 10_??_*\)*/, /\(Macintosh; Intel Mac OS X 10.??.*\)*/, /\(Macintosh; Intel Mac OS X 10_??\)*/, /\(Macintosh; Intel Mac OS X 10.??\)*/, /iP(hone|od|ad)/],
            a = {
                KeyCodes: { Tab: 9, Enter: 13, Escape: 27, SpaceBar: 32, LeftArrow: 37, UpArrow: 38, RightArrow: 39, DownArrow: 40 },
                get iOSVersion() { if (/iP(hone|od|ad)/.test(navigator.platform)) { var t = navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/); return [parseInt(t[1], 10), parseInt(t[2], 10), parseInt(t[3] || 0, 10)] } },
                noop: function() {},
                isIE10: function() { return /MSIE 10/i.test(navigator.userAgent) },
                isEdge: function() { return /Edge\//i.test(navigator.userAgent) },
                isIEAndNotEdge: function() { return /MSIE|Trident\//i.test(navigator.userAgent) },
                isNode: function() { return "object" != typeof window || window !== function() { return this }() },
                isUnsupportedBrowser: function(t) { return o.some(function(e) { return e.test(t) }) },
                hasMapsApp: function(t) { return s.some(function(e) { return e.test(t) }) },
                mod: function(t, e) { return t - e * Math.floor(t / e) },
                log2: function(t) { return Math.log(t) / n },
                clamp: function(t, e, i) { return Math.max(e, Math.min(t, i)) },
                inheritPrototype: function(t, e, i) {
                    var n = { constructor: { enumerable: !0, value: e } };
                    return Object.keys(i).forEach(function(t) {
                        var e = Object.getOwnPropertyDescriptor(i, t);
                        e && (n[t] = e)
                    }), Object.create(t.prototype, n)
                },
                checkValueIsInEnum: function(t, e) { return Object.keys(e).some(function(i) { return e[i] === t }) },
                required: function(t, e, i) { if ("checkNull" in (i = i || {}) || (i.checkNull = !0), void 0 === t || i.checkNull && null === t) throw new Error(e || "Missing parameter"); return this },
                checkType: function(t, e, i) { if (typeof t !== e) throw new TypeError(i || "Expected `" + e + "` but got `" + typeof t + "`"); if ("number" === e && isNaN(t)) throw new TypeError(i || "Expected `" + e + "` but got `NaN`"); if ("object" === e && t instanceof Array) throw new TypeError(i || "Expected a non-array object but got an array"); return this },
                checkInstance: function(t, e, i) { if (!(t instanceof e)) throw new Error(i || "Unexpected object instance"); return this },
                checkElement: function(t, e) { if (!this.isElement(t)) throw new Error(e || "Expected an Element"); return this },
                checkArray: function(t, e) { if (!Array.isArray(t)) throw new Error(e || "Expected an array"); return this },
                checkOptions: function(t, e) { return null !== t && void 0 !== t ? this.checkType(t, "object", e || "[MapKit] The `options` parameter is not a valid object.") : t = {}, t },
                isElement: function(t) { return t instanceof window.Node && t.nodeType === window.Node.ELEMENT_NODE },
                get supportsLocalStorage() {
                    if ("_supportsLocalStorage" in this) return this._supportsLocalStorage;
                    if (this._supportsLocalStorage = !1, a.isNode()) return !1;
                    try {
                        if (!window.localStorage) return !1;
                        if ("function" != typeof window.localStorage.setItem || "function" != typeof window.localStorage.getItem || "function" != typeof window.localStorage.removeItem) return !1;
                        var t = "storageTest";
                        if (window.localStorage.setItem(t, t), window.localStorage.getItem(t) !== t) return !1;
                        window.localStorage.removeItem(t), this._supportsLocalStorage = !0
                    }
                    catch (t) { return !1 }
                    return this._supportsLocalStorage
                },
                fillTemplate: function(t, e, i) { return t.replace(/{{(.*?)}}/g, function(t, n) { var o = e[n]; if (i && !o) throw new Error("fillTemplate: Missing value for parameter: " + n); return o }) },
                xhr: function(t) { var e; return (e = new XMLHttpRequest).addEventListener("load", t), e.addEventListener("error", t), e.addEventListener("timeout", t), e },
                parseURL: function(t) { var e = document.createElement("a"); return e.href = t, e.protocol || (e.protocol = location.protocol), ["href", "protocol", "hostname", "port", "pathname", "search", "hash"].reduce(function(t, i) { return t[i] = e[i], t }, {}) },
                toQueryString: function(t, e) { return null === t || "object" != typeof t ? "" : (e || Object.keys(t)).reduce(function(e, i) { var n = t[i]; return n && (console.assert("string" == typeof n, "toQueryString: only strings are allowed as values"), e.push(encodeURIComponent(i) + "=" + encodeURIComponent(n))), e }, []).join("&") },
                splitStringAtSubStringAndReplace: function(t) {
                    var e = [],
                        i = t.text.toLowerCase().indexOf(t.subString.toLowerCase());
                    if (t.text && !(i < 0) && t.replaceSubString) {
                        var n = t.text.substr(0, i);
                        n && e.push(t.replacePre ? t.replacePre(n) : n);
                        var o = t.text.substr(i, t.subString.length);
                        e.push(t.replaceSubString(t.subString, o));
                        var s = t.text.substr(i + t.subString.length);
                        return s && e.push(t.replacePost ? t.replacePost(s) : s), e
                    }
                },
                isSameOrigin: function(t, e) { return t = this.parseURL(t), e = this.parseURL(e), t.hostname === e.hostname && t.protocol === e.protocol },
                capitalize: function(t) { return t ? t[0].toUpperCase() + t.substr(1).toLowerCase() : t },
                generateSessionIdValue: function() { return Math.floor(1e15 * (9 * Math.random() + 1)) },
                doNotTrack: function() { var t = window && (window.navigator && (navigator.doNotTrack || navigator.msDoNotTrack) || window.doNotTrack); return "1" === t || "yes" === t },
                supportsTouches: function() { return "createTouch" in document },
                isSpaceKey: function(t) { return t.keyCode === this.KeyCodes.SpaceBar },
                isEnterKey: function(t) { return t.keyCode === this.KeyCodes.Enter },
                isTabKey: function(t) { return t.keyCode === this.KeyCodes.Tab }
            };
        a.noopConsole = { log: a.noop, warn: a.noop, error: a.noop, assert: a.noop }, a.isNode() && (Object.defineProperty(a, "iOSVersion", { enumerable: !0, get: function() {} }), a.isIE10 = a.isIEAndNotEdge = a.isElement = function() { return !1 }, a.xhr = function(t) {
            function i(e) { t.handleEvent({ target: n, type: e }) }
            var n = new(0, e.require("xmlhttprequest").XMLHttpRequest);
            return n.addEventListener("load", i.bind(null, "load")), n.addEventListener("error", i.bind(null, "error")), n.addEventListener("timeout", i.bind(null, "timeout")), n
        }, a.parseURL = function(t) { return e.require("url").parse(t) }), e.exports = a
    }, {}],
    85: [function(t, e, i) { e.exports = { Priority: t("./lib/priority"), State: t("./lib/state"), Loader: t("./lib/loader"), ImageLoader: t("./lib/image-loader"), XHRLoader: t("./lib/xhr-loader") } }, { "./lib/image-loader": 86, "./lib/loader": 87, "./lib/priority": 89, "./lib/state": 90, "./lib/xhr-loader": 91 }],
    86: [function(t, e, i) {
        function n(t, e) { s.call(this, t, e), this._image = null }
        var o = t("@maps/js-utils"),
            s = t("./loader");
        n.prototype = o.inheritPrototype(s, n, {
            get image() { return this._image },
            get url() { return this._image.src },
            reuse: function(t, e) { console.assert(this._unscheduled, "Loader has not been unscheduled"), this.init(t, e) },
            loaderWillStart: function() { s.prototype.loaderWillStart.call(this), this._image || (this._image = document.createElement("img")), console.assert(this._delegate.urlForImageLoader, "ImageLoader._delegate.urlForImageLoader is not set"), this._image.src = this._delegate.urlForImageLoader, this._image.complete ? this.loaderDidSucceed() : (this._image.addEventListener("load", this), this._image.addEventListener("error", this)) },
            handleEvent: function(t) {
                switch (t.type) {
                    case "error":
                        this.loaderDidFail(t.target);
                        break;
                    case "load":
                        this.loaderDidSucceed()
                }
            },
            _reset: function() { this._image && (this._image.removeEventListener("load", this), this._image.removeEventListener("error", this)), s.prototype._reset.call(this) }
        }), e.exports = n
    }, { "./loader": 87, "@maps/js-utils": 92 }],
    87: [function(t, e, i) {
        function n(t, e) { this.init(t, e) }
        var o = t("./manager"),
            s = t("./state");
        n.prototype = {
            constructor: n,
            get state() { return this._state },
            schedule: function() { console.assert(!this._state, "Loader has already been scheduled"), this._state || (this._state = s.Waiting, o.schedule(this)) },
            unschedule: function() {
                var t = !1;
                if (this._state === s.Waiting) t = o.unschedule(this);
                else {
                    if (this._state !== s.Loading) return !1;
                    o.loaderDidComplete(this), t = !0
                }
                return this._unscheduled = t, this._state = s.Canceled, "function" == typeof this._delegate.loaderDidCancel && this._delegate.loaderDidCancel(this), this._reset(), t
            },
            loaderWillStart: function() { this._state = s.Loading, "function" == typeof this._delegate.loaderWillStart && this._delegate.loaderWillStart(this) },
            loaderDidSucceed: function(t) { this._state = s.Succeeded, o.loaderDidComplete(this), "function" == typeof this._delegate.loaderDidSucceed && this._delegate.loaderDidSucceed(this, t), this._reset() },
            loaderDidFail: function(t) { this._state = s.Failed, o.loaderDidComplete(this), "function" == typeof this._delegate.loaderDidFail && this._delegate.loaderDidFail(this, t), this._reset() },
            init: function(t, e) { this._delegate = e, this._state = s.Unscheduled, this._retries = 0, this._timeoutID = -1, this.priority = t, this._unscheduled = !1 },
            _reset: function() { clearTimeout(this._timeoutID) },
            _reload: function() {
                if (++this._retries < 3) {
                    var t = "number" == typeof this._delay ? this._delay : 1e4;
                    this._timeoutID = setTimeout(this.loaderWillStart.bind(this), t)
                }
                else this.loaderDidFail()
            }
        }, e.exports = n
    }, { "./manager": 88, "./state": 90 }],
    88: [function(t, e, i) {
        function n() { for (var t in r) { if (h[r[t]].length > 0) { if (c[r[t]] === l[r[t]]) break; return h[r[t]][0] } if (c[r[t]] > 0) break } return null }

        function o() {
            for (var t in r)
                if (h[r[t]].length > 0) return h[r[t]].shift(), !0;
            return !1
        }

        function s(t) { for (var e in r) { var i = h[r[e]].indexOf(t); if (-1 !== i) return h[r[e]].splice(i, 1), !0 } return !1 }

        function a() { for (var t = n(); t;) c[t.priority]++, o(), t.loaderWillStart(), t = n() }
        var r = t("./priority"),
            l = [];
        l[r.Highest] = 12, l[r.High] = 12, l[r.Medium] = 4, l[r.Low] = 1;
        var h = [],
            c = [];
        for (var u in r) h[r[u]] = [], c[r[u]] = 0;
        e.exports = { schedule: function(t) { h[t.priority].push(t), a() }, unschedule: function(t) { return s(t) }, loaderDidComplete: function(t) { c[t.priority]--, a() } }
    }, { "./priority": 89 }],
    89: [function(t, e, i) { e.exports = { Highest: 0, High: 1, Medium: 2, Low: 3 } }, {}],
    90: [function(t, e, i) { e.exports = { Unscheduled: 0, Waiting: 1, Loading: 2, Canceled: 3, Succeeded: 4, Failed: 5 } }, {}],
    91: [function(t, e, i) {
        function n(t, e, i) {
            var n = (i = i || {}).priority || a.Highest;
            s.call(this, n, e), this._url = t, this._method = i.method || "GET", this._retry = !0 === i.retry, this._delay = i.delay, this._headers = i.headers, o.isNode() && (this._origin = i.origin)
        }
        var o = t("@maps/js-utils"),
            s = t("./loader"),
            a = t("./priority");
        n.prototype = o.inheritPrototype(s, n, {
            get xhrData() { return this._xhrData },
            unschedule: function() { return this._xhr && this._xhr.abort(), s.prototype.unschedule.call(this) },
            loaderWillStart: function() {
                if (s.prototype.loaderWillStart.call(this), this._xhr = o.xhr(this), this._xhr.open(this._method, this._url, !0), this._origin && (this._xhr.setDisableHeaderCheck(!0), this._xhr.setRequestHeader("Origin", this._origin)), this._headers && Object.keys(this._headers).forEach(function(t) { this._xhr.setRequestHeader(t, this._headers[t]) }, this), "POST" === this._method && !this._xhrData) {
                    if (this._xhrData = this._delegate.getDataToSend(this._xhr), !this._xhrData) return;
                    console.assert("string" == typeof this._xhrData, "XHRLoader data has been set to a non-string value.")
                }
                this._xhr.send(this._xhrData)
            },
            handleEvent: function(t) { "error" === t.type || "timeout" === t.type || 200 !== t.target.status ? this._retry ? s.prototype._reload.call(this) : this.loaderDidFail(t.target) : "load" === t.type ? this.loaderDidSucceed(t.target) : console.log("Unhandled XHR event type:", t.type, " status:", t.target.status) }
        }), e.exports = n
    }, { "./loader": 87, "./priority": 89, "@maps/js-utils": 92 }],
    92: [function(t, e, i) {
        var n = Math.log(2),
            o = [/MSIE [5-8]\./, /Firefox\/[1-9]\./, /Firefox\/[1-2][0-9]\./, /Firefox\/3[0-1]\./, /Firefox\/[0-9]\./, /Firefox\/[1-2][0-9]\./, /Firefox\/3[0-6]\./, /Android [0-3]\./, /Android 4\.[0-3]\./],
            s = [/\(Macintosh; Intel Mac OS X 10.9*\)*/, /\(Macintosh; Intel Mac OS X 10_9*\)*/, /\(Macintosh; Intel Mac OS X 10_??;*\)*/, /\(Macintosh; Intel Mac OS X 10.??;*\)*/, /\(Macintosh; Intel Mac OS X 10_??_*\)*/, /\(Macintosh; Intel Mac OS X 10.??.*\)*/, /\(Macintosh; Intel Mac OS X 10_??\)*/, /\(Macintosh; Intel Mac OS X 10.??\)*/, /iP(hone|od|ad)/],
            a = {
                KeyCodes: { Tab: 9, Enter: 13, Escape: 27, SpaceBar: 32, LeftArrow: 37, UpArrow: 38, RightArrow: 39, DownArrow: 40 },
                get iOSVersion() { if (/iP(hone|od|ad)/.test(navigator.platform)) { var t = navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/); return [parseInt(t[1], 10), parseInt(t[2], 10), parseInt(t[3] || 0, 10)] } },
                noop: function() {},
                isIE9: function() { return /MSIE 9/i.test(navigator.userAgent) },
                isIE10: function() { return /MSIE 10/i.test(navigator.userAgent) },
                isEdge: function() { return /Edge\//i.test(navigator.userAgent) },
                isIEAndNotEdge: function() { return /MSIE|Trident\//i.test(navigator.userAgent) },
                isNode: function() { return "object" != typeof window || window !== function() { return this }() },
                isUnsupportedBrowser: function(t) { return o.some(function(e) { return e.test(t) }) },
                hasMapsApp: function(t) { return s.some(function(e) { return e.test(t) }) },
                mod: function(t, e) { return t - e * Math.floor(t / e) },
                log2: function(t) { return Math.log(t) / n },
                clamp: function(t, e, i) { return Math.max(e, Math.min(t, i)) },
                inheritPrototype: function(t, e, i) {
                    var n = { constructor: { enumerable: !0, value: e } };
                    return Object.keys(i).forEach(function(t) {
                        var e = Object.getOwnPropertyDescriptor(i, t);
                        e && (n[t] = e)
                    }), Object.create(t.prototype, n)
                },
                checkValueIsInEnum: function(t, e) { return Object.keys(e).some(function(i) { return e[i] === t }) },
                required: function(t, e, i) { if ("checkNull" in (i = i || {}) || (i.checkNull = !0), void 0 === t || i.checkNull && null === t) throw new Error(e || "Missing parameter"); return this },
                checkType: function(t, e, i) { if (typeof t !== e) throw new TypeError(i || "Expected `" + e + "` but got `" + typeof t + "`"); if ("number" === e && isNaN(t)) throw new TypeError(i || "Expected `" + e + "` but got `NaN`"); if ("object" === e && t instanceof Array) throw new TypeError(i || "Expected a non-array object but got an array"); return this },
                checkInstance: function(t, e, i) { if (!(t instanceof e)) throw new Error(i || "Unexpected object instance"); return this },
                checkElement: function(t, e) { if (!this.isElement(t)) throw new Error(e || "Expected an Element"); return this },
                checkArray: function(t, e) { if (!Array.isArray(t)) throw new Error(e || "Expected an array"); return this },
                checkOptions: function(t, e) { return null !== t && void 0 !== t ? this.checkType(t, "object", e || "[MapKit] The `options` parameter is not a valid object.") : t = {}, t },
                isElement: function(t) { return t instanceof window.Node && t.nodeType === window.Node.ELEMENT_NODE },
                get supportsLocalStorage() {
                    if ("_supportsLocalStorage" in this) return this._supportsLocalStorage;
                    if (this._supportsLocalStorage = !1, a.isNode()) return !1;
                    try {
                        if (!window.localStorage) return !1;
                        if ("function" != typeof window.localStorage.setItem || "function" != typeof window.localStorage.getItem || "function" != typeof window.localStorage.removeItem) return !1;
                        var t = "storageTest";
                        if (window.localStorage.setItem(t, t), window.localStorage.getItem(t) !== t) return !1;
                        window.localStorage.removeItem(t), this._supportsLocalStorage = !0
                    }
                    catch (t) { return !1 }
                    return this._supportsLocalStorage
                },
                fillTemplate: function(t, e, i) { return t.replace(/{{(.*?)}}/g, function(t, n) { var o = e[n]; if (i && !o) throw new Error("fillTemplate: Missing value for parameter: " + n); return o }) },
                xhr: function(t) { var e; return (e = new XMLHttpRequest).addEventListener("load", t), e.addEventListener("error", t), e.addEventListener("timeout", t), e },
                parseURL: function(t) { var e = document.createElement("a"); return e.href = t, e.protocol || (e.protocol = location.protocol), ["href", "protocol", "hostname", "port", "pathname", "search", "hash"].reduce(function(t, i) { return t[i] = e[i], t }, {}) },
                toQueryString: function(t, e) { return null === t || "object" != typeof t ? "" : (e || Object.keys(t)).reduce(function(e, i) { var n = t[i]; return n && (console.assert("string" == typeof n, "toQueryString: only strings are allowed as values"), e.push(encodeURIComponent(i) + "=" + encodeURIComponent(n))), e }, []).join("&") },
                splitStringAtSubStringAndReplace: function(t) {
                    var e = [],
                        i = t.text.toLowerCase().indexOf(t.subString.toLowerCase());
                    if (t.text && !(i < 0) && t.replaceSubString) {
                        var n = t.text.substr(0, i);
                        n && e.push(t.replacePre ? t.replacePre(n) : n);
                        var o = t.text.substr(i, t.subString.length);
                        e.push(t.replaceSubString(t.subString, o));
                        var s = t.text.substr(i + t.subString.length);
                        return s && e.push(t.replacePost ? t.replacePost(s) : s), e
                    }
                },
                isSameOrigin: function(t, e) { return t = this.parseURL(t), e = this.parseURL(e), t.hostname === e.hostname && t.protocol === e.protocol },
                capitalize: function(t) { return t ? t[0].toUpperCase() + t.substr(1).toLowerCase() : t },
                generateSessionIdValue: function() { return Math.floor(1e15 * (9 * Math.random() + 1)) },
                doNotTrack: function() { var t = window && (window.navigator && (navigator.doNotTrack || navigator.msDoNotTrack) || window.doNotTrack); return "1" === t || "yes" === t },
                supportsTouches: function() { return "createTouch" in document },
                isSpaceKey: function(t) { return t.keyCode === this.KeyCodes.SpaceBar },
                isEnterKey: function(t) { return t.keyCode === this.KeyCodes.Enter },
                isTabKey: function(t) { return t.keyCode === this.KeyCodes.Tab }
            };
        a.noopConsole = { log: a.noop, warn: a.noop, error: a.noop, assert: a.noop }, a.isNode() && (Object.defineProperty(a, "iOSVersion", { enumerable: !0, get: function() {} }), a.isIE9 = a.isIE10 = a.isIEAndNotEdge = a.isElement = function() { return !1 }, a.xhr = function(t) {
            function i(e) { t.handleEvent({ target: n, type: e }) }
            var n = new(0, e.require("xmlhttprequest").XMLHttpRequest);
            return n.addEventListener("load", i.bind(null, "load")), n.addEventListener("error", i.bind(null, "error")), n.addEventListener("timeout", i.bind(null, "timeout")), n
        }, a.parseURL = function(t) { return e.require("url").parse(t) }), e.exports = a
    }, {}],
    93: [function(t, e, i) { e.exports = { "ar-SA": 6, "ca-ES": 1, "cs-CZ": 1, "da-DK": 1, "de-DE": 1, "el-GR": 1, "en-GB": 1, "en-US": 0, "en-ZA": 0, "es-ES": 1, "es-MX": 1, "fi-FI": 1, "fr-CA": 0, "fr-FR": 1, "hi-IN": 0, "hr-HR": 1, "hu-HU": 1, "id-ID": 1, "it-IT": 1, "iw-IL": 0, "ja-JP": 0, "ko-KR": 0, "ms-MY": 1, "nb-NO": 1, "nl-NL": 1, "pl-PL": 1, "pt-BR": 0, "pt-PT": 1, "ro-RO": 1, "ru-RU": 1, "sk-SK": 1, "sv-SE": 1, "th-TH": 0, "tr-TR": 1, "uk-UA": 1, "vi-VN": 1, "zh-CN": 1, "zh-TW": 0 } }, {}],
    94: [function(t, e, i) {
        "use strict";
        e.exports = { LangTag: t("./lib/lang-tag"), Locale: t("./lib/locale"), LanguageSupport: t("./lib/language-support"), L10n: t("./lib/l10n"), UseMetric: t("./lib/use-metric"), localizeDigits: t("./lib/localize-digits") }
    }, { "./lib/l10n": 95, "./lib/lang-tag": 96, "./lib/language-support": 97, "./lib/locale": 98, "./lib/localize-digits": 99, "./lib/use-metric": 100 }],
    95: [function(t, e, i) {
        "use strict";

        function n(t) {
            t.delegate.supportedLocales.forEach(function(e) {
                var i = m.parse(e);
                s(t, i)
            })
        }

        function o(t) {
            Object.keys(t.delegate.regionToScriptMap).forEach(function(e) {
                t.scriptMap[e] = Object.create(null), Object.keys(t.delegate.regionToScriptMap[e]).forEach(function(i) {
                    var n = t.delegate.regionToScriptMap[e][i].toLowerCase();
                    t.scriptMap[e][n] = i
                })
            })
        }

        function s(t, e) {
            console.assert(e), console.assert(e.region);
            var i = e.language,
                n = e.region;
            t.supportMap[i] || (t.supportMap[i] = []), -1 !== t.delegate.primaryLocales.indexOf(e.tag) ? t.supportMap[i].splice(0, 0, n) : t.supportMap[i].push(n)
        }

        function a(t, e) {
            var i, n = e.language,
                o = e.region,
                s = e.script;
            console.assert(n, "L10n.delegate.bestMatch: required: `language`"), "he" === n && (n = "iw");
            var a = t.supportMap[n];
            if (!a) return null;
            if (o)(i = a.filter(function(t) { return t.toUpperCase() === e.region.toUpperCase() })[0]) || (i = a[0]);
            else if (s) {
                var r = t.scriptMap[n];
                if (!r) return null;
                i = r[s.toLowerCase()]
            }
            else i = a[0];
            return new m(n, i)
        }

        function r(t, e, i) { return console.assert(c(t, e)), console.assert(!(e in t.locales)), new p(e, i, t.delegate, t.dowForBestMatch(e)) }

        function l(t, e) {
            if (!t.activeLocale || t.activeLocale.localeId !== e) {
                c(t, e) || (console.warn("Localizer: not a valid locale ID:", e), e = f);
                var i = t.locales[e];
                i || (i = r(t, e)).ready ? h(t, i) : i.load(function(e, i) {
                    if (e) return console.error(e.toString()), void h(t, t.locales[f]);
                    h(t, i)
                })
            }
        }

        function h(t, e) {
            t.locales[e.localeId] || (t.locales[e.localeId] = e), t.activeLocale = e;
            var i = new d.Event(u.Events.LocaleChanged);
            i.locale = e, t.dispatchEvent(i)
        }

        function c(t, e) { return -1 !== t.delegate.supportedLocales.indexOf(e) }

        function u(t) { console.assert(!!t, "L10n constructor: delegate is `undefined`"), this.delegate = t, this.locales = t.localesCache || Object.create(null), this.supportMap = t.supportCache || Object.create(null), this.scriptMap = t.scriptCache || Object.create(null), h(this, this.locales[f] || r(this, f, this.delegate.enUSDictionary)), n(this), o(this) }
        var d = t("@maps/dom-events"),
            p = t("./locale"),
            m = t("./lang-tag"),
            g = t("../data/locale-to-dow.json"),
            _ = t("./localize-digits"),
            f = "en-US";
        u.Events = { LocaleChanged: "locale-changed" }, u.Days = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 }, u.prototype = {
            constructor: u,
            Events: u.Events,
            get: function(t, e) { return console.assert(!!this.activeLocale, "L10n: no active locale"), this.activeLocale.get(t, e) },
            get localeId() { return this.activeLocale.localeId },
            set localeId(t) { l(this, t) },
            get localeIds() { return Object.keys(locales) },
            get supportedLocaleIds() { return this.delegate.supportedLocales },
            bestMatch: function(t, e) {
                var i = m.parse(t),
                    n = null;
                return i && this.delegate.localesMap && this.delegate.localesMap[i.tag] && (i = m.parse(this.delegate.localesMap[i.tag])), e = e || null, i && (n = a(this, i)), n ? n.tag : e
            },
            dowForBestMatch: function(t, e) { return g[this.bestMatch(t, e)] },
            digits: function(t) { return _(t, this.localeId) }
        }, d.EventTarget(u.prototype), e.exports = u
    }, { "../data/locale-to-dow.json": 93, "./lang-tag": 96, "./locale": 98, "./localize-digits": 99, "@maps/dom-events": 62 }],
    96: [function(t, e, i) {
        "use strict";

        function n(t, e, i) { this.language = t.toLowerCase(), e && (this.region = e.toUpperCase(), console.assert(!this.script, "Can't have `region` and `script`.")), i && (this.script = o.capitalize(i), console.assert(!this.region, "Can't have `region` and `script`.")) }
        var o = t("@maps/js-utils");
        n.prototype = { constructor: n, get tag() { var t = this.language; return this.region ? t + "-" + this.region : this.script ? t + "-" + this.script : t }, toString: function() { var t = "{ language: " + this.language; return this.region && (t += ", region: " + this.region), this.script && (t += ", script: " + this.script), t + " }" } }, n.parse = function(t) {
            var e, i, o;
            if (t && "string" == typeof t) {
                if (-1 !== t.indexOf("_")) return console.warn("Invalid character: '_'"), null;
                var s = t.split("-");
                if (2 !== (e = s[0]).length) return console.warn("Invalid language:", t), null;
                if (2 === s.length) {
                    var a = s[1],
                        r = a.length;
                    if (4 === r) o = a;
                    else {
                        if (!(r > 1 && r < 4)) return console.warn("Don't know how to parse:", t), null;
                        i = a
                    }
                }
                else if (s.length > 2) return console.warn("Don't know how to parse language tags with more than 2 parts:", t), null;
                return new n(e, i, o)
            }
            return null
        }, e.exports = n
    }, { "@maps/js-utils": 101 }],
    97: [function(t, e, i) {
        "use strict";

        function n(t, e) {
            console.assert(t, "LanguageSupport.add: `langTag` is null.");
            var i = t.language,
                n = t.region,
                o = t.script;
            e[i] || (e[i] = { regions: [], scripts: [] }), n && e[i].regions.push(n), o && e[i].scripts.push(o)
        }

        function o(t, e, i) {
            var n = t.language,
                o = t.region,
                s = t.script;
            console.assert(n, "LanguageSupport._bestMatch: required: `language`"), "iw" === n && (n = "he");
            var r = i[n];
            if (!r) return null;
            if (o) {
                console.assert(!s, "LanguageSupport._bestMatch: can't match on `region` + `script`");
                var l = r.regions.filter(function(e) { return e.toUpperCase() === t.region.toUpperCase() })[0];
                if (l) return new a(n, l);
                var h = e[n];
                if (!h) return new a(n);
                t.script = s = h[o.toUpperCase()], o = null
            }
            if (s) { console.assert(!o, "LanguageSupport._bestMatch: can't match on `region` + `script`"); var c = r.scripts.filter(function(e) { return e.toUpperCase() === t.script.toUpperCase() })[0]; return new a(n, null, c) }
            return new a(n)
        }

        function s(t) { console.assert(!!t, "LanguageSupport constructor: delegate is `undefined`"), this.supportMap = Object.create(null), this.delegate = t, this.delegate.supportedLocales.forEach(function(t) { n(a.parse(t), this.supportMap) }, this) }
        var a = t("./lang-tag");
        s.prototype = {
            constructor: s,
            bestMatch: function(t, e) {
                var i = a.parse(t),
                    n = null;
                return i && this.delegate.localesMap && this.delegate.localesMap[i.tag] && (i = a.parse(this.delegate.localesMap[i.tag])), e = e || null, i && (n = o(i, this.delegate.regionToScriptMap, this.supportMap)), n ? n.tag : e
            }
        }, s.parseAcceptLanguage = function(t) { return t ? t.split(",").map(function(t) { if (!t) return null; var e = t.split(";"); return { langTag: a.parse(e[0]), quality: e[1] ? parseFloat(e[1].split("=")[1]) : 1 } }).filter(function(t) { return !!t }).sort(function(t, e) { return e.quality - t.quality }) : null }, e.exports = s
    }, { "./lang-tag": 96 }],
    98: [function(t, e, i) {
        "use strict";

        function n(t, e, i, n) { this.localeId = t, this._dict = e || {}, this.ready = !!e, this.localeUrl = i.localeUrl, this.rtl = i.rtlLocales.indexOf(t) > -1, this.dow = n }
        var o = t("@maps/js-utils"),
            s = t("@maps/loaders").XHRLoader;
        n.prototype = {
            constructor: n,
            get: function(t, e) { var i = this._dict[t]; return i ? (e = e || {}, o.fillTemplate(i, e, !0)) : "[" + t + "]" },
            load: function(t) {
                console.assert("function" == typeof t);
                var e = this,
                    i = this.localeUrl.replace(/{{(.*?)}}/, this.localeId);
                new s(i, {
                    loaderDidSucceed: function(i, n) { var o; if (n.status < 200 || n.status >= 300) return o = "HTTP error " + n.status + " loading strings for locale: " + e.localeId, void t(new Error(o)); try { e._dict = JSON.parse(n.responseText) } catch (i) { return o = "Failed to parse response for locale: " + e.localeId, void t(new Error(o)) } e.ready = !0, t(null, e) },
                    loaderDidFail: function(i, n) {
                        var o = "Network error loading strings for locale: " + e.localeId;
                        t(new Error(o))
                    }
                }).schedule()
            }
        }, e.exports = n
    }, { "@maps/js-utils": 101, "@maps/loaders": 85 }],
    99: [function(t, e, i) {
        var n = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
            o = { "ar-SA": ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"], "hi-IN": ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"] },
            s = ".",
            a = { "ca-ES": ",", "ca-CZ": ",", "da-DK": ",", "da-DE": ",", "el-GR": ",", "en-ZA": ",", "es-ES": ",", "fi-FI": ",", "fr-CA": ",", "fr-FR": ",", "hr-HR": ",", "hu-HU": ",", "it-IT": ",", "nb-NO": ",", "nl-NL": ",", "pl-PL": ",", "pt-BR": ",", "pt-PT": ",", "ro-RO": ",", "ru-RU": ",", "sk-SK": ",", "sv-SE": ",", "tr-TR": ",", "uk-UA": "," };
        e.exports = function(t, e) {
            for (var i = o[e] || n, r = a[e] || s, l = "", h = t.toString(), c = 0, u = h.length; c < u; ++c) {
                var d = h.charAt(c);
                l += d === s ? r : i[parseInt(d, 10)] || d
            }
            return l
        }
    }, {}],
    100: [function(t, e, i) {
        "use strict";
        var n = ["AS", "BS", "BZ", "DM", "FK", "GB", "GD", "GU", "KN", "KY", "LC", "LR", "MM", "MP", "SH", "TC", "US", "VC", "VG", "VI", "WS"];
        e.exports = { forRegion: function(t) { return !!t && n.indexOf(t) < 0 }, forLanguageTag: function(t) { var e = t.region; return e ? n.indexOf(e) < 0 : "en" !== t.language && "my" !== t.language } }
    }, {}],
    101: [function(t, e, i) { arguments[4][92][0].apply(i, arguments) }, { dup: 92 }],
    102: [function(t, e, i) {
        function n(t) { t ? m(t) ? this.element = t : "string" == typeof t || t instanceof String ? this.element = c(t) : "object" == typeof t && (this.element = u(t)) : this.element = document.createElement("div"), this._parent = null, this._children = [], this._opacity = 1, this._color = "", this._size = new w, this._position = new b, this._transform = new C, this._backgroundImages = [], this._classList = new y(this), this._wantsHardwareCompositing = !1, this._dirtyProperties = [], this._dirtyAttributes = {}, this._deferredUpdates = [], this._pendingDOMManipulation = M.None }

        function o(t, e) { e ? (d(E, t), S.scheduleDraw(s)) : p(E, t) }

        function s() { E.forEach(a), E = [], x.forEach(r), x = [], n.updates++, O.dispatchEvent(new v.Event(A)) }

        function a(t) {
            if (t._pendingDOMManipulation === M.Removal) {
                var e = t.element.parentNode;
                e && e.removeChild(t.element)
            }
            t._dirtyProperties.forEach(function(e) { l(t, e) }), t._dirtyProperties = [], Object.getOwnPropertyNames(t._dirtyAttributes).forEach(function(e) { t.element.setAttribute(e, t._dirtyAttributes[e]) }), t._dirtyAttributes = {}, t._pendingDOMManipulation === M.Addition && d(x, t.parent)
        }

        function r(t) {
            for (var e = null, i = t.element, n = t.children.length - 1; n >= 0; --n) {
                var o = t.children[n],
                    s = o.element;
                o._pendingDOMManipulation === M.Addition && (i.insertBefore(s, e), o._pendingDOMManipulation = M.None), e = s
            }
        }

        function l(t, e) {
            var i = t.element,
                n = i.style;
            switch (e) {
                case "opacity":
                    n.opacity = t._opacity;
                    break;
                case "color":
                    n.color = t._color;
                    break;
                case "size":
                    n.width = t._size.width + "px", n.height = t._size.height + "px";
                    break;
                case "position":
                case "transform":
                    var o = (new C).translate(T.roundToDevicePixel(t._position.x), T.roundToDevicePixel(t._position.y)).transform(t._transform);
                    k && t._wantsHardwareCompositing && o.rotate3d(0, 0, 0, 0), n.transform = n.webkitTransform = n.msTransform = o;
                    break;
                case "backgroundImages":
                    h(t);
                    break;
                case "classList":
                    i.className = t._classList, t._classList.reset();
                    break;
                default:
                    return
            }
        }

        function h(t) {
            var e = t.element.style;
            if (!t._backgroundImages.length) return e.removeProperty("background-image"), e.removeProperty("background-position"), void e.removeProperty("background-size");
            for (var i = [], n = [], o = [], s = t._backgroundImages, a = s.length - 1; a >= 0; --a) {
                var r = s[a];
                i.push("url(" + r.url + ")"), n.push(r.position.x + "px " + r.position.y + "px"), o.push(r.size.width + "px " + r.size.height + "px")
            }
            e.backgroundImage = i.join(","), e.backgroundPosition = n.join(","), e.backgroundSize = o.join(",")
        }

        function c(t) { var e = document.createElement("div"); return e.innerHTML = t, e.firstElementChild }

        function u(t) {
            var e = t.name;
            if ("#text" === e) return document.createTextNode(t.value);
            var i = document.createElement(e),
                n = t.attributes;
            for (var o in n) i.setAttribute(o, n[o]);
            return t.children instanceof Array && t.children.forEach(function(t) { i.appendChild(u(t)) }), i
        }

        function d(t, e) { return -1 === t.indexOf(e) && (t.push(e), !0) }

        function p(t, e) { var i = t.indexOf(e); return -1 !== i && (t.splice(i, 1), !0) }

        function m(t) { return t instanceof window.Node && t.nodeType === window.Node.ELEMENT_NODE }

        function g(t) { return t < 0 ? "" : t + ":" }

        function _(t) { return t.childCount < 1 ? "" : " ⤵︎ " + t.childCount }

        function f(t, e, i, n) {
            var o = "";
            o += e, n && (o += g(i)), o += t.toString(), o += _(t);
            for (var s = t.children, a = 0, r = s.length; a < r; ++a) {
                var l = t.childCount < 1 ? -1 : a;
                o += "\n", o += f(s[a], e + "    ", l, n)
            }
            return o
        }

        function y(t) { this._node = t, this.reset() }
        var v = t("@maps/dom-events"),
            w = t("@maps/geometry/size"),
            b = t("@maps/geometry/point"),
            C = t("@maps/css-transform"),
            S = t("@maps/scheduler"),
            L = t("@maps/web-point-converter"),
            T = t("@maps/device-pixel-ratio"),
            E = [],
            x = [],
            M = { None: 0, Removal: 1, Addition: 2 },
            A = "update",
            k = function() { var t = document.createElement("div"); return t.style.msTransform = "translate3d(2px, 2px, 2px)", "none" !== window.getComputedStyle(t).msTransform }();
        n.updates = 0, n.prototype = {
            constructor: n,
            get classList() { return this._classList },
            get wantsHardwareCompositing() { return this._wantsHardwareCompositing },
            set wantsHardwareCompositing(t) { t !== this._wantsHardwareCompositing && (this._wantsHardwareCompositing = t, this._markDirtyProperty("transform")) },
            get opacity() { return this._opacity },
            set opacity(t) {
                (t = Math.min(Math.max(0, t), 1)) !== this._opacity && (this._opacity = t, this._markDirtyProperty("opacity"))
            },
            get color() { return this._color },
            set color(t) { t !== this._color && (this._color = t, this._markDirtyProperty("color")) },
            get position() { return this._position },
            set position(t) { this._position = t, this._markDirtyProperty("position") },
            get transform() { return this._transform },
            set transform(t) { this._transform = t, this._markDirtyProperty("transform") },
            get backgroundImages() { return this._backgroundImages },
            set backgroundImages(t) { this._backgroundImages = t || [], this._markDirtyProperty("backgroundImages") },
            get size() { return this._size },
            set size(t) { this._size = t || new w, this._markDirtyProperty("size") },
            setAttribute: function(t, e) { this._dirtyAttributes[t] = e, this._updateNodeDirtiness() },
            get parent() { return this._parent },
            get children() { return this._children },
            set children(t) {
                for (var e = this._children; e.length;) this.removeChild(e[0]);
                t.forEach(function(t) { this.addChild(t) }, this)
            },
            get childCount() { return this._children.length },
            get firstChild() { return this._children[0] || null },
            get lastChild() { return this._children[this._children.length - 1] || null },
            get previousSibling() {
                if (!this._parent) return null;
                var t = this._parent._children,
                    e = t.indexOf(this);
                return e > 0 ? t[e - 1] : null
            },
            get nextSibling() {
                if (!this._parent) return null;
                var t = this._parent._children,
                    e = t.indexOf(this);
                return -1 !== e && e < t.length - 1 ? t[e + 1] : null
            },
            addChild: function(t, e) { return t.willMoveToParent(this), t._doNotNotifyParentChange = !0, t.remove(), delete t._doNotNotifyParentChange, (void 0 === e || e < 0 || e > this._children.length) && (e = this._children.length), this._children.splice(e, 0, t), t._parent = this, t.didMoveToParent(this), this.didAddChild(t), t._markNodeManipulation(M.Addition), t },
            insertBefore: function(t, e) { return this.addChild(t, this._children.indexOf(e)) },
            insertAfter: function(t, e) { var i = this._children.indexOf(e); return this.addChild(t, -1 !== i ? i + 1 : 0) },
            removeChild: function(t) { if (t._parent === this) { var e = this._children.indexOf(t); if (-1 !== e) return this.willRemoveChild(t), t._doNotNotifyParentChange || t.willMoveToParent(null), this._children.splice(e, 1), t._parent = null, t._doNotNotifyParentChange || t.didMoveToParent(null), t._markNodeManipulation(M.Removal), t } },
            remove: function() { if (this._parent instanceof n) return this._parent.removeChild(this) },
            findNode: function(t, e) { if ("function" != typeof t) throw new TypeError("RenderTree.RenderNode.findNode: callback must be a function"); var i, n = this; return function o(s) { s !== n && t.call(e, s) ? i = s : s.children.some(function(t) { return o(t), i }) }(n), i },
            convertPointFromPage: function(t) { return L.fromPageToElement(this.element, t) },
            convertPointToPage: function(t) { return L.fromElementToPage(this.element, t) },
            toString: function() { var t = ""; return this._wantsHardwareCompositing && (t += "🏁 "), t += this.stringInfo(), this.classList.toString() && (t += this.classList._classes().map(function(t) { return "." + t }).join(", ")), 0 === this.position.x && 0 === this.position.y || (t += " (" + this.position.x + ", " + this.position.y + ")"), 0 === this.size.width && 0 === this.size.height || (t += " " + this.size.width + "x" + this.size.height), 1 !== this.opacity && (t += " [opacity:" + this.opacity + "]"), this.transform.toString() && (t += " [" + this.transform.toString() + "]"), t },
            dump: function(t) { return f(this, "", -1, t) },
            stringInfo: function() { return "<" + this.element.tagName.toLowerCase() + ">" },
            willRemoveChild: function(t) {},
            didAddChild: function(t) {},
            willMoveToParent: function(t) {},
            didMoveToParent: function(t) {},
            _markDirtyProperty: function(t, e) {
                (void 0 === e || e ? d(this._dirtyProperties, t) : p(this._dirtyProperties, t)) && this._updateNodeDirtiness()
            },
            _markNodeManipulation: function(t) { this._pendingDOMManipulation = t, this._updateNodeDirtiness() },
            _updateNodeDirtiness: function() { o(this, this._pendingDOMManipulation !== M.None || this._dirtyProperties.length > 0 || Object.getOwnPropertyNames(this._dirtyAttributes).length > 0) }
        }, y.prototype = {
            constructor: y,
            add: function(t) { this._add(t) },
            remove: function(t) { this._remove(t) },
            contains: function(t) { return -1 !== this._classes().indexOf(t) },
            toggle: function(t, e) {
                if ("boolean" == typeof e || e instanceof Boolean) return e ? this._add(t) : this._remove(t), e;
                this._add(t) || this._remove(t)
            },
            toString: function() { return this._classes().join(" ") },
            _classes: function() { return this._populateClasses && (this.__classes = this._node.element.className.split(/[ ]+/).filter(Boolean), delete this._populateClasses), this.__classes },
            reset: function() { this._additions = [], this._removals = [], this.__classes = [], this._populateClasses = !0 },
            _add: function(t) { if (!t) return !1; var e = d(this._classes(), t); return e && (p(this._removals, t) || d(this._additions, t), this._updateNodeDirtiness()), e },
            _remove: function(t) { if (!t) return !1; var e = p(this._classes(), t); return e && (p(this._additions, t) || d(this._removals, t), this._updateNodeDirtiness()), e },
            _updateNodeDirtiness: function() { this._node._markDirtyProperty("classList", this._additions.length > 0 || this._removals.length > 0) }
        };
        var O = new v.EventTarget;
        O.Node = n, O.Point = b, O.Transform = C, e.exports = O
    }, { "@maps/css-transform": 60, "@maps/device-pixel-ratio": 61, "@maps/dom-events": 62, "@maps/geometry/point": 103, "@maps/geometry/size": 104, "@maps/scheduler": 106, "@maps/web-point-converter": 107 }],
    103: [function(t, e, i) { arguments[4][59][0].apply(i, arguments) }, { dup: 59 }],
    104: [function(t, e, i) { arguments[4][71][0].apply(i, arguments) }, { dup: 71 }],
    105: [function(t, e, i) {
        function n() {
            if (0 !== a.length) {
                var t = a.concat();
                a = [], o = {}, t.forEach(function(t) { t() })
            }
        }
        var o = {},
            s = 0,
            a = [],
            r = 1e3 / 60;
        "undefined" != typeof window && window.requestAnimationFrame ? (e.exports.request = window.requestAnimationFrame.bind(window), e.exports.cancel = window.cancelAnimationFrame.bind(window)) : "undefined" != typeof window && window.webkitRequestAnimationFrame ? (e.exports.request = window.webkitRequestAnimationFrame.bind(window), e.exports.cancel = window.webkitCancelAnimationFrame.bind(window)) : (e.exports.request = function(t) { 0 === a.length && setTimeout(n, r), a.push(t); var e = ++s; return o[e] = t, e }, e.exports.cancel = function(t) {
            if (t in o) {
                var e = o[t],
                    i = a.indexOf(e); - 1 !== i && (a.splice(i, 1), delete o[t])
            }
        })
    }, {}],
    106: [function(t, e, i) {
        function n() {-1 === h && (c.length > 0 || d.length > 0) && (h = l.request(o)) }

        function o() { m === p.Flushing && -1 !== h && l.cancel(h), s(), a(), m = p.Idle, h = -1, n() }

        function s() {
            for (m = p.Updating; c.length > 0;) {
                var t = c;
                c = [];
                for (var e = 0, i = t.length; e < i; ++e) { var n = t[e]; "function" == typeof n ? n() : n && "object" == typeof n && "function" == typeof n.performScheduledUpdate && n.performScheduledUpdate() }
            }
            c = u, u = []
        }

        function a() {
            m = p.Drawing;
            var t = d;
            d = [];
            for (var e = 0, i = t.length; e < i; ++e) { var n = t[e]; "function" == typeof n ? n() : n && "object" == typeof n && "function" == typeof n.performScheduledDraw && n.performScheduledDraw() }
        }

        function r(t, e) { return -1 === t.indexOf(e) && (t.push(e), !0) }
        var l = t("@maps/request-animation-frame"),
            h = -1,
            c = [],
            u = [],
            d = [],
            p = { Idle: 0, Updating: 1, Drawing: 2, Flushing: 3 },
            m = p.Idle;
        e.exports = { scheduleASAP: function(t) { r(c, t) && n() }, scheduleOnNextFrame: function(t) { r(m === p.Updating ? u : c, t) && n() }, scheduleDraw: function(t) { r(d, t) && n() }, flush: function() { m > p.Idle || (m = p.Flushing, o()) } }
    }, { "@maps/request-animation-frame": 105 }],
    107: [function(t, e, i) { arguments[4][83][0].apply(i, arguments) }, { "@maps/css-matrix": 108, "@maps/geometry/point": 109, dup: 83 }],
    108: [function(t, e, i) { arguments[4][58][0].apply(i, arguments) }, { "@maps/geometry/point": 109, dup: 58 }],
    109: [function(t, e, i) { arguments[4][59][0].apply(i, arguments) }, { dup: 59 }],
    110: [function(t, e, i) {
        function n() { throw new Error("setTimeout has not been defined") }

        function o() { throw new Error("clearTimeout has not been defined") }

        function s(t) { if (u === setTimeout) return setTimeout(t, 0); if ((u === n || !u) && setTimeout) return u = setTimeout, setTimeout(t, 0); try { return u(t, 0) } catch (e) { try { return u.call(null, t, 0) } catch (e) { return u.call(this, t, 0) } } }

        function a(t) { if (d === clearTimeout) return clearTimeout(t); if ((d === o || !d) && clearTimeout) return d = clearTimeout, clearTimeout(t); try { return d(t) } catch (e) { try { return d.call(null, t) } catch (e) { return d.call(this, t) } } }

        function r() { _ && m && (_ = !1, m.length ? g = m.concat(g) : f = -1, g.length && l()) }

        function l() {
            if (!_) {
                var t = s(r);
                _ = !0;
                for (var e = g.length; e;) {
                    for (m = g, g = []; ++f < e;) m && m[f].run();
                    f = -1, e = g.length
                }
                m = null, _ = !1, a(t)
            }
        }

        function h(t, e) { this.fun = t, this.array = e }

        function c() {}
        var u, d, p = e.exports = {};
        ! function() { try { u = "function" == typeof setTimeout ? setTimeout : n } catch (t) { u = n } try { d = "function" == typeof clearTimeout ? clearTimeout : o } catch (t) { d = o } }();
        var m, g = [],
            _ = !1,
            f = -1;
        p.nextTick = function(t) {
            var e = new Array(arguments.length - 1);
            if (arguments.length > 1)
                for (var i = 1; i < arguments.length; i++) e[i - 1] = arguments[i];
            g.push(new h(t, e)), 1 !== g.length || _ || s(l)
        }, h.prototype.run = function() { this.fun.apply(null, this.array) }, p.title = "browser", p.browser = !0, p.env = {}, p.argv = [], p.version = "", p.versions = {}, p.on = c, p.addListener = c, p.once = c, p.off = c, p.removeListener = c, p.removeAllListeners = c, p.emit = c, p.prependListener = c, p.prependOnceListener = c, p.listeners = function(t) { return [] }, p.binding = function(t) { throw new Error("process.binding is not supported") }, p.cwd = function() { return "/" }, p.chdir = function(t) { throw new Error("process.chdir is not supported") }, p.umask = function() { return 0 }
    }, {}],
    111: [function(t, e, i) { e.exports = { version: "5.6.0", build: "18.33-11", cdnUrl: "//cdn.apple-mapkit.com/mk/5.6.0" } }, {}],
    112: [function(t, e, i) {
        function n() { this._doNotTrack = a.doNotTrack(), this._isInternalClient = o(), s.addEventListener(s.Events.Changed, this) }

        function o() { return /\.apple\.com$/.test(window.origin) || /\.icloud\.com$/.test(window.origin) || /\.filemaker\.com$/.test(window.origin) || /\.apple-mapkit\.com$/.test(window.origin) || /\.tryrating\.com$/.test(window.origin) || /localhost/.test(window.origin) }
        var s = t("../configuration"),
            a = t("@maps/js-utils"),
            r = t("./transforms"),
            l = t("@maps/loaders").XHRLoader,
            h = t("@maps/loaders").Priority,
            c = { ScreenSize: "SCREEN_SIZE", BrowserInfo: "BROWSER_INFO", ApplicationIdentifier: "APPLICATION_IDENTIFIER", BrowserWindowSize: "BROWSER_WINDOW_SIZE", Url: "URL", MapView: "MAP_VIEW", UserSession: "USER_SESSION", Tile: "TILE" },
            u = { Short: [c.ScreenSize, c.BrowserInfo, c.ApplicationIdentifier, c.BrowserWindowSize, c.Url, c.MapView, c.UserSession, c.Tile] },
            d = { Zoom: { name: "ZOOM", states: u.Short }, MapsLoad: { name: "MAPS_LOAD", states: u.Short }, AnnotationClick: { name: "ANNOTATION_CLICK", states: u.Short }, MapTypeChange: { name: "MAP_TYPE_CHANGE", states: u.Short }, MapNodeReady: { name: "MAP_NODE_READY", states: u.Short } };
        n.prototype = {
            _queuedMessages: [],
            _loader: null,
            _analyticsUrl: null,
            _errorUrl: null,
            _sessionId: null,
            _sessionTimerStart: null,
            _sessionTimeToExpire: null,
            _sequenceNumber: null,
            _doNotTrack: null,
            Events: d,
            log: function(t, e) {!s.analytics || this._doNotTrack || a.isNode() || ((!this._sessionId || (new Date).getTime() > this._sessionTimeToExpire) && this._initSession(), this._queuedMessages.push(this._createMessage(t, e)), this._sequenceNumber++, this._loader || (console.assert(this._analyticsUrl, "analytics._analyticsUrl is not set"), this._loader = new l(this._analyticsUrl, this, { method: "POST", priority: h.Low, retry: !0 }), this._loader.schedule())) },
            getDataToSend: function(t) { if (0 === this._queuedMessages.length) return this._loader.unschedule(), !1; var e = JSON.stringify({ analytics_message_type: "SHORT_SESSION_USAGE", analytics_event: this._queuedMessages }); return this._queuedMessages = [], t.setRequestHeader("Content-Type", "text/plain"), t.responseType = "text", e },
            loaderDidSucceed: function(t) { delete this._loader },
            loaderDidFail: function(t) { this._queuedMessages = this._queuedMessages.concat(JSON.parse(t.xhrData).analytics_event), delete this._loader },
            handleEvent: function(t) {
                switch (t.type) {
                    case s.Events.Changed:
                        this._configurationBecameAvailable()
                }
            },
            reduceHost: function(t) { var e = t.match(/([^\.]+\.[^\.]+)$/); return e && e.length > 0 ? e[0] : t },
            _createMessage: function(t, e) { var i = { event_type: "USER_ACTION", user_action_event: { user_action_event_key: t.name } }; return i.analytics_state = this._createStateMessages(t.states, e), i },
            _initSession: function() { this._sessionId = { high: a.generateSessionIdValue(), low: a.generateSessionIdValue() }, this._sessionTimerStart = (new Date).getTime(), this._sessionTimeToExpire = this._sessionTimerStart + 9e5, this._sequenceNumber = 0 },
            _createStateMessages: function(t, e) { return t.map(function(t) { var i = { state_type: t }; return i[t.toLowerCase()] = r[t](this, e), i }, this) },
            _configurationBecameAvailable: function() { s.analytics && (this._analyticsUrl = s.analytics.analyticsUrl), s.teamId && (this._teamId = s.teamId) }
        }, e.exports = new n
    }, { "../configuration": 159, "./transforms": 116, "@maps/js-utils": 84, "@maps/loaders": 85 }],
    113: [function(t, e, i) {
        var n = t("../../../build.json");
        e.exports = function(t) { var e = { host: location.host, mkjs_version: n.version }; return t._teamId && (e.team_id = t._teamId), t._isInternalClient || (e.host = t.reduceHost(location.host)), e }
    }, { "../../../build.json": 111 }],
    114: [function(t, e, i) { e.exports = function(t) { var e = { browser_user_agent: navigator.userAgent, browser_language: navigator.language }; return t._isInternalClient ? (e.browser_referer = document.referrer, e.browser_origin = location.protocol + "//" + location.host) : e.browser_origin = t.reduceHost(location.host), e } }, {}],
    115: [function(t, e, i) { e.exports = function(t) { if (t._isInternalClient) return { width: window.innerWidth, height: window.innerHeight } } }, {}],
    116: [function(t, e, i) { e.exports = { SCREEN_SIZE: t("./screen-size-state"), BROWSER_INFO: t("./browser-info-state"), APPLICATION_IDENTIFIER: t("./application-identifier"), BROWSER_WINDOW_SIZE: t("./browser-window-size-state"), URL: t("./url-state"), MAP_VIEW: t("./map-view-state"), USER_SESSION: t("./user-session-state"), TILE: t("./tile-state") } }, { "./application-identifier": 113, "./browser-info-state": 114, "./browser-window-size-state": 115, "./map-view-state": 117, "./screen-size-state": 118, "./tile-state": 119, "./url-state": 120, "./user-session-state": 121 }],
    117: [function(t, e, i) {
        e.exports = function(t, e) {
            console.assert(e.map, "A `map` object must be provided to report map view analytics.");
            var i = e.map.region.toBoundingRegion(),
                n = e.map.ensureRenderingFrame().size;
            return { display_map_region: { eastLng: i.eastLongitude, northLat: i.northLatitude, southLat: i.southLatitude, westLng: i.westLongitude }, zoom_level: e.map.zoomLevel, map_type: "MAP_TYPE_" + e.map.mapType.toUpperCase(), size: { width: n.width, height: n.height } }
        }
    }, {}],
    118: [function(t, e, i) { e.exports = function(e) { var i = { device_pixel_ratio: t("@maps/device-pixel-ratio")() }; return e._isInternalClient ? (i.width = screen.width, i.height = screen.height, i) : i } }, { "@maps/device-pixel-ratio": 61 }],
    119: [function(t, e, i) { e.exports = function(t, e) { return { rendering: e.map._mapNodeController && e.map._mapNodeController.renderingMode } } }, {}],
    120: [function(t, e, i) { e.exports = function(t) { var e = {}; return t._isInternalClient && (e.query_string = location.search, e.path = location.pathname), e } }, {}],
    121: [function(t, e, i) { e.exports = function(t) { var e = ((new Date).getTime() - t._sessionTimerStart) / 1e3; return { session_id: t._sessionId, sequence_number: t._sequenceNumber, relative_timestamp: e } } }, {}],
    122: [function(t, e, i) {
        function n(t) { this._annotation = t }
        var o = t("@maps/geometry").Point,
            s = t("@maps/scheduler");
        n.prototype = {
            liftDurationMs: 200,
            liftOpacity: .5,
            animateLift: function() {
                var t = Math.min((Date.now() - this._liftAnimationStartDate) / this.liftDurationMs, 1);
                this._annotation.translate(this.translation.x, this.translation.y - this.liftAmount * t), this._annotation.opacity = 1 - (1 - this.liftOpacity) * t, t < 1 ? (s.scheduleOnNextFrame(this), this._liftAnimationProgress = t) : (delete this._liftAnimationStartDate, delete this._liftAnimationProgress)
            },
            animateDropAfterLift: function() {
                var t = Math.max(this._dropAnimationStartP - Math.min((Date.now() - this._dropAfterLiftAnimationStartDate) / this.liftDurationMs, 1), 0);
                this._dropAnimationRevert && this._annotation.translate(0, -this.liftAmount * t), this._annotation.opacity = 1 - (1 - this.liftOpacity) * t, t > 0 ? s.scheduleOnNextFrame(this) : this._annotation.droppedAfterLift()
            },
            dropAnnotationAfterDraggingAndRevertPosition: function(t) { this._liftAnimationStartDate ? (this._dropAnimationStartP = this._liftAnimationProgress, delete this._liftAnimationStartDate, delete this._liftAnimationProgress) : this._dropAnimationStartP = 1, t ? this._annotation.resetNodeTransform() : this._annotation.draggingDidEnd(), this._dropAfterLiftAnimationStartDate = Date.now(), this._dropAnimationRevert = t, s.scheduleOnNextFrame(this) },
            lift: function(t) { this.liftAmount = t, this.translation = new o, this._liftAnimationStartDate = Date.now(), this._liftAnimationProgress = 0, s.scheduleOnNextFrame(this) },
            getTranslation: function() { return new o(this.translation.x, this.translation.y - this.liftAmount) },
            setTranslation: function(t) { this.translation = t, this._liftAnimationStartDate || this._annotation.translate(this.translation.x + this._annotation.dragOffset.x, this.translation.y - this.liftAmount + this._annotation.dragOffset.y) },
            performScheduledUpdate: function() { this._liftAnimationStartDate ? this.animateLift() : this._dropAfterLiftAnimationStartDate && this.animateDropAfterLift() }
        }, e.exports = n
    }, { "@maps/geometry": 68, "@maps/scheduler": 106 }],
    123: [function(t, e, i) {
        function n(t) { this._map = t, this.panning = !1 }
        var o = t("@maps/geometry/point"),
            s = t("@maps/scheduler");
        n.prototype = {
            constructor: n,
            update: function(t, e) {
                if (this._map.isScrollEnabled) {
                    var i = t._impl.translatedPosition(),
                        n = i.x,
                        a = n + e.size.width,
                        r = i.y,
                        l = r + e.size.height,
                        h = this._map.ensureVisibleFrame();
                    this._direction = new o, n <= h.minX() ? this._direction.x = 1 : a >= h.maxX() && (this._direction.x = -1), r <= h.minY() + 5 ? this._direction.y = 1 : l >= h.maxY() - 5 && (this._direction.y = -1);
                    var c = 0 !== this._direction.x || 0 !== this._direction.y;
                    !this.panning && c ? (this.panning = !0, this._startTime = Date.now(), this._initialSpeed = Math.floor(1 / 104.1 * (h.size.width + h.size.height) / 2), s.scheduleOnNextFrame(this)) : this.panning && !c && this.stop()
                }
            },
            stop: function() { this.panning && (this.panning = !1, delete this._direction, delete this._startTime, delete this._initialSpeed) },
            performScheduledUpdate: function() {
                if (this.panning) {
                    console.assert(!!this._startTime && !!this._initialSpeed);
                    var t = this._initialSpeed,
                        e = Date.now() - this._startTime;
                    e > 4e3 ? t *= 3 : e > 1e3 && (t *= 1.5), this._map.translateCameraAnimated(new o(this._direction.x * t, this._direction.y * t), !1), this._map.panningDuringAnnotationDrag(), s.scheduleOnNextFrame(this)
                }
            },
            mapWasDestroyed: function() { delete this._map }
        }, e.exports = n
    }, { "@maps/geometry/point": 69, "@maps/scheduler": 106 }],
    124: [function(t, e, i) {
        function n(t, e, i, n) {
            o.call(this, t), m.EventTarget(t), p.checkType(i, "function"), p.checkOptions(n), this._setCoordinate(e);
            var a = i(e, n);
            p.checkElement(a, "[MapKit] Annotation element factory must return a DOM element, got `" + a + "` instead."), this._element = a, this._node = new g.Node(d.htmlElement("div", a)), this._node.wantsHardwareCompositing = !0, this._node.element._annotation = this, this._unsized = !0, this._public = t, this.occluded = !1, this._dragController || (this._dragController = new s(this)), n && (y.forEach(function(t) { t in n && (this[t] = n[t]) }, this), v.forEach(function(t) { t in n && this["_set" + t.replace(/^\w/, function(t) { return t.toUpperCase() })](n[t]) }, this), Object.keys(n).forEach(function(t) { "map" === t || "element" === t ? console.warn("[MapKit] `" + t + "` is read-only and can't be set on an Annotation.") : this.isAKnownOption(t) || console.warn("[MapKit] Unknown option for annotation: " + t + " (use the `data` property instead)") }, this)), f.addEventListener(f.Events.LocaleChanged, this), this.updateLocalizedText()
        }
        var o = t("./annotation-layer-item-internal"),
            s = t("./annotation-drag-controller"),
            a = t("../../../lib/geo"),
            r = a.Coordinate,
            l = t("@maps/geometry/size"),
            h = t("@maps/css-matrix"),
            c = t("@maps/css-transform"),
            u = t("@maps/geometry/point"),
            d = t("../utils"),
            p = t("@maps/js-utils"),
            m = t("@maps/dom-events"),
            g = t("@maps/render-tree"),
            _ = t("../../../lib/scene-graph"),
            f = t("../localizer").l10n,
            y = ["title", "subtitle", "data", "accessibilityLabel", "anchorOffset", "calloutOffset", "size", "callout", "visible", "enabled", "selected", "calloutEnabled", "animates", "appearanceAnimation", "collisionMode"],
            v = ["draggable", "displayPriority", "clusteringIdentifier"],
            w = n.Events = { DragStart: "drag-start", Dragging: "dragging", DragEnd: "drag-end" },
            b = n.DisplayPriority = { Low: 250, High: 750, Required: 1e3 },
            C = n.CollisionMode = { Rectangle: "rectangle", Circle: "circle" };
        n.prototype = p.inheritPrototype(o, n, {
            _calloutOffset: new window.DOMPoint(0, 1),
            _enabled: !0,
            _selected: !1,
            _calloutEnabled: !0,
            _animates: !0,
            _draggable: !1,
            _title: "",
            _subtitle: "",
            _accessibilityLabel: null,
            _displayPriority: b.Required,
            _collisionMode: C.Rectangle,
            _clusteringIdentifier: null,
            _sceneGraphNode: null,
            shouldHideLabels: !1,
            _callout: null,
            get map() { return this.delegate && this.delegate.mapForAnnotation(this._public) },
            set map(t) { console.warn("[MapKit] The `map` property is read-only.") },
            get coordinate() { return this._coordinate },
            set coordinate(t) { this.memberAnnotations || this._setCoordinate(t) },
            get title() { return this._title },
            set title(t) { null != t ? (p.checkType(t, "string", "[MapKit] Expected a string value for Annotation.title, but got `" + t + "` instead"), this._title = t) : delete this._title, this.updateLocalizedText(), this._updatedProperty("title") },
            get subtitle() { return this._subtitle },
            set subtitle(t) { null != t ? (p.checkType(t, "string", "[MapKit] Expected a string value for Annotation.subtitle, but got `" + t + "` instead"), this._subtitle = t) : delete this._subtitle, this.updateLocalizedText(), this._updatedProperty("subtitle") },
            get accessibilityLabel() { return this._accessibilityLabel },
            set accessibilityLabel(t) { null != t ? (p.checkType(t, "string", "[MapKit] Expected a string value for Annotation.accessibilityLabel, but got `" + t + "` instead"), this._accessibilityLabel = t) : delete this._accessibilityLabel, this.updateLocalizedText() },
            get data() { return this.hasOwnProperty("_data") || (this._data = {}), this._data },
            set data(t) { this._data = t },
            get enabled() { return this._enabled },
            set enabled(t) { this._enabled = !!t },
            get calloutEnabled() { return this._calloutEnabled },
            set calloutEnabled(t) { this._calloutEnabled = !!t },
            get selected() { return this._selected },
            set selected(t) {
                var e = !!t;
                e !== this._selected && (this._selected = e, this._updatedProperty("selected"))
            },
            get animates() { return this._animates },
            set animates(t) { this._animates = !!t },
            get calloutOffset() { return this._calloutOffset },
            set calloutOffset(t) { p.checkInstance(t, window.DOMPoint, "[MapKit] Annotation.calloutOffset expected a DOMPoint, but got `" + t + "` instead."), this._calloutOffset = new window.DOMPoint(t.x, t.y), this._updatedProperty("calloutOffset") },
            get callout() { return this._callout },
            set callout(t) { p.checkType(t, "object", "[MapKit] Annotation.callout expected an object, but got `" + t + "` instead."), this._callout = t },
            get draggable() { return this._draggable },
            set draggable(t) { this.memberAnnotations || this._setDraggable(t) },
            get size() { if (this._updateSize(), !this._unsized) return this._node.size.copy() },
            set size(t) {
                var e = "[MapKit] Annotation size expects a size object with width and height properties";
                p.checkType(t, "object", e).checkType(t.width, "number", e).checkType(t.height, "number", e), this.setSize(new l(t.width, t.height)), this._userSetSize = !0, this.updateSize()
            },
            get opacity() { return this.sceneGraphNode ? this.sceneGraphNode.opacity : this.node.opacity },
            set opacity(t) { this.sceneGraphNode ? this.sceneGraphNode.opacity = t : this.node.opacity = t },
            get displayPriority() { return this._displayPriority },
            set displayPriority(t) { this.memberAnnotations || this._setDisplayPriority(t) },
            isRequired: function() { return this.selected || this.displayPriority === b.Required },
            get collisionMode() { return this._collisionMode },
            set collisionMode(t) {
                if (!p.checkValueIsInEnum(t, C)) throw new Error("[MapKit] Unknown value for `collisionMode`. Choose from Annotation.CollisionMode.");
                t !== this._collisionMode && (this._collisionMode = t, this._updatedProperty("collisionMode"))
            },
            get clusteringIdentifier() { return this._clusteringIdentifier },
            set clusteringIdentifier(t) { this.memberAnnotations || this._setClusteringIdentifier(t) },
            get needsLayout() { return this._sceneGraphNode && this._sceneGraphNode.needsLayout },
            removedFromMap: function() { this._removedFromMap = !0, f.removeEventListener(f.Events.LocaleChanged, this) },
            addedToMap: function() { this._removedFromMap && (this._removedFromMap = !1, f.addEventListener(f.Events.LocaleChanged, this), this.updateLocalizedText()) },
            delegate: null,
            setDelegate: function(t) { this.delegate = t },
            updateLayout: function() {},
            doesAnimate: function() { return this._animates && !!this._appearanceAnimationName },
            willMoveToMap: function() { this._isMoving = this.doesAnimate(), this._updateSize() },
            didMoveToMap: function() { this._isMoving && this._appearanceAnimationName && this._visible && (this.element.style.animation = this.element.style.webkitAnimation = this._appearanceAnimation, (this.element.style.animationName || this.element.style.webkitAnimationName) && (this._animating = !0, this.element.addEventListener("animationend", this), this.element.addEventListener("webkitAnimationEnd", this))), delete this._isMoving },
            canShowCallout: function() { return this._calloutEnabled && !this.isWaiting && !this._isMoving && !this._isAnimating && !this._isLifted },
            calloutWillAppear: function() {},
            calloutWillDisappear: function() {},
            canBePicked: function() { return this._shown && this._visible && !this._isMoving && !this._isAnimating && !this._isLifted && !this.occluded },
            draggingDidStart: function() { this._public.dispatchEvent(new m.Event(w.DragStart)) },
            isDraggable: function() { return this.draggable && !this._isLifted },
            isLifted: function() { return this._isLifted },
            dispatchDraggingEvent: function() { var t = new m.Event(n.Events.Dragging); return t.coordinate = this._coordinateDuringDrag(), this._public.dispatchEvent(t), t },
            positionForCallout: function() {
                var t = this._calloutAnchorPoint;
                if (!t) {
                    var e = this._userSetSize ? this._node.size : this.delegate.sizeForElement(this.element);
                    t = new window.DOMPoint(-e.width / 2, 0)
                }
                return new u(this._node.position.x - t.x - this._calloutOffset.x, this._node.position.y - t.y - this._calloutOffset.y)
            },
            setDraggingTranslationForMapFrameSize: function(t, e) { this._dragController.setTranslation(this.clampDraggingTranslationForMapFrameSize(t, e)) },
            dropAfterDraggingAndRevertPosition: function(t) { this._dragController.dropAnnotationAfterDraggingAndRevertPosition(t) },
            distanceToPoint: function(t) {
                var e = this._node.position.x,
                    i = e + this._node.size.width,
                    n = e - t.x,
                    o = i - t.x,
                    s = n <= 0 && o >= 0 ? 0 : Math.min(Math.abs(n), Math.abs(o)),
                    a = this._node.position.y,
                    r = a + this._node.size.height,
                    l = a - t.y,
                    h = r - t.y,
                    c = l <= 0 && h >= 0 ? 0 : Math.min(Math.abs(l), Math.abs(h));
                return s * s + c * c
            },
            lift: function(t) { this._isLifted = !0, this._dragController.lift(t), this._updatedProperty("") },
            translate: function(t, e) { this.sceneGraphNode ? this.sceneGraphNode.transform = (new h).translate(t, e) : this._node.transform = (new c).translate(t, e) },
            translatedPosition: function() { var t = this._dragController.getTranslation(); return new u(this._position.x - this._anchorPoint.x - this._anchorOffset.x + t.x, this._position.y - this._anchorPoint.y - this._anchorOffset.y + t.y) },
            updatedPosition: function() { return this.coordinate ? (this.x = a.convertLongitudeToX(a.wrapLongitude(this.coordinate.longitude)), this.y = a.convertLatitudeToY(this.coordinate.latitude), !0) : (this.setShown(!1), this.sceneGraphNode && this.sceneGraphNode.remove(), !1) },
            get sceneGraphNode() { return this._sceneGraphNode },
            mayBeDrawn: function() { return !!this.sceneGraphNode && this._shown && this.visible && !this.isWaiting },
            isDrawn: function() { return (!this.occluded || this._occludedAnimation) && this.mayBeDrawn() },
            animateOcclusion: function() {
                var t = this.occluded ? 0 : 1;
                this._sceneGraphNode && (this._occludedAnimation && this._occludedAnimation.end(), this._occludedAnimation = new _.NodeAnimator.Opacity({ node: this._sceneGraphNode, from: 1 - t, to: t, duration: 200, done: function() { delete this._occludedAnimation }.bind(this) }).begin());
                var e = this.occluded && this.cluster && this.cluster._impl,
                    i = !this.occluded && this.previousCluster;
                (e || i) && this._animateClustering()
            },
            dragOffset: u.Zero,
            handleEvent: function(t) {
                switch (t.type) {
                    case f.Events.LocaleChanged:
                        this.updateLocalizedText();
                        break;
                    case "animationend":
                    case "webkitAnimationEnd":
                        if (t.animationName !== this._appearanceAnimationName) return;
                        this.element.style.animation = this.element.style.webkitAnimation = "", this.element.removeEventListener("animationend", this), this.element.removeEventListener("webkitAnimationEnd", this), this.finishedAnimating()
                }
            },
            updateLocalizedText: function() { this._element.setAttribute("aria-label", this.altText()) },
            altText: function() { return this._accessibilityLabel || (this.title && this.subtitle ? f.get("Annotation.Generic.AccessibilityLabel", { title: this.title, subtitle: this.subtitle }) : this.title || this.subtitle || "") },
            updateSize: function() { delete this._unsized, this._selected && this.delegate && this.delegate.selectedAnnotationDidMoveToMap(this._public) },
            clampDraggingTranslationForMapFrameSize: function(t, e) {
                var i = this._anchorPoint.x + this._anchorOffset.x - this._position.x,
                    n = e.width - this._node.size.width + i,
                    o = this._anchorPoint.y + this._anchorOffset.y + this._dragController.liftAmount - this._position.y,
                    s = e.height - this._node.size.height + o;
                return new u(p.clamp(t.x, i, n), p.clamp(t.y, o, s))
            },
            droppedAfterLift: function() { delete this._isLifted, this.selected && this.delegate.selectedAnnotationDidMoveToMap(this._public), this._updatedProperty("") },
            draggingDidEnd: function() { this.coordinate = this._coordinateDuringDrag(), this.resetNodeTransform(), this._public.dispatchEvent(new m.Event(n.Events.DragEnd)) },
            resetNodeTransform: function() { this.node.transform = new c },
            finishedAnimating: function() { delete this._isAnimating, this._selected && this.delegate && this.delegate.selectedAnnotationDidMoveToMap(this._public), this._visible || this._updateVisibility(), this.delegate && this.delegate.annotationFinishedAnimating(this._public) },
            isAKnownOption: function(t) { return y.indexOf(t) >= 0 || v.indexOf(t) >= 0 },
            _animateClustering: function() {
                if (this._sceneGraphNode) {
                    var t = { node: this._sceneGraphNode, duration: 200, done: function() { delete this._clusteringAnimation }.bind(this) },
                        e = this.boundingBox;
                    if (this.cluster) {
                        var i = this.cluster._impl.boundingBox;
                        t.to = new u(i.x1 - e.x1, i.y1 - e.y1)
                    }
                    else {
                        var n = this.previousCluster._impl.boundingBox;
                        t.from = new u(n.x1 - e.x1, n.y1 - e.y1)
                    }
                    this._clusteringAnimation && this._clusteringAnimation.end(), this._clusteringAnimation = new _.NodeAnimator.Translation(t).begin()
                }
            },
            _setCoordinate: function(t) { p.checkInstance(t, r, "[MapKit] Annotation.coordinate expected a Coordinate value."), delete this._translation, this._coordinate = t.copy(), this._updatedProperty("coordinate") },
            _setDraggable: function(t) {
                var e = !!t;
                e !== this._draggable && (this._draggable = e, this._updatedProperty("draggable"))
            },
            _setDisplayPriority: function(t) {
                var e = "[MapKit] Annotation displayPriority expects a number between 0 and " + b.Required;
                p.checkType(t, "number", e);
                var i = p.clamp(t, 0, b.Required);
                if (i !== t) console.warn(e + ", value was normalized");
                else if (i === this._displayPriority) return;
                this._displayPriority = i, this._updatedProperty("displayPriority")
            },
            _setClusteringIdentifier: function(t) { null !== t && p.checkType(t, "string", "[MapKit] Annotation clusteringIdentifier expects a string"), this._clusteringIdentifier !== t && (this._clusteringIdentifier = t, this._updatedProperty("clusteringIdentifier")) },
            _coordinateDuringDrag: function() {
                var t = this.sceneGraphNode ? this._dragController.translation.x : 0,
                    e = this.sceneGraphNode ? this._dragController.translation.y - this._dragController.liftAmount : 0,
                    i = this.node.convertPointToPage(new u(t + this.dragOffset.x + this._anchorPoint.x + this.anchorOffset.x, e + this.dragOffset.y + this._anchorPoint.y + this.anchorOffset.y));
                return this.delegate._map.convertPointOnPageToCoordinate(new window.DOMPoint(i.x, i.y))
            },
            _updateSize: function() {
                if (this._unsized && !this._userSetSize && this.delegate) {
                    var t = this.delegate.sizeForElement(this.element);
                    t && (delete this._unsized, this.setSize(t))
                }
            },
            _updatedProperty: function(t) { this.delegate && this.delegate.annotationPropertyDidChange(this._public, t) }
        }), n.div = function() { return document.createElement("div") }, e.exports = n
    }, { "../../../lib/geo": 2, "../../../lib/scene-graph": 47, "../localizer": 182, "../utils": 225, "./annotation-drag-controller": 122, "./annotation-layer-item-internal": 125, "@maps/css-matrix": 58, "@maps/css-transform": 60, "@maps/dom-events": 62, "@maps/geometry/point": 69, "@maps/geometry/size": 71, "@maps/js-utils": 84, "@maps/render-tree": 102 }],
    125: [function(t, e, i) {
        function n(t) { t && (this._public = t) }
        var o = t("../utils"),
            s = t("@maps/js-utils"),
            a = t("@maps/geometry/point"),
            r = { HIDDEN: "mk-hidden", INVISIBLE: "mk-invisible" };
        n.CalloutTailSide = { Left: "left", Right: "right", Bottom: "bottom" }, n.prototype = {
            _shown: !0,
            _visible: !0,
            _position: new a,
            _anchorPoint: new a,
            _anchorOffset: new window.DOMPoint,
            _appearanceAnimation: "",
            get node() { return this._node },
            get element() { return this._element },
            set element(t) { console.warn("[MapKit] The `element` property is read-only.") },
            get anchorOffset() { return this._anchorOffset },
            set anchorOffset(t) { s.checkInstance(t, window.DOMPoint, "[MapKit] Annotation.anchorOffset expected a DOMPoint, but got `" + t + "` instead."), this._anchorOffset = new window.DOMPoint(t.x, t.y), this.updatePosition() },
            get visible() { return this._visible },
            set visible(t) { t = !!t, this._visible !== t && (this._visible = t, this._updateVisibility()) },
            get appearanceAnimation() { return this._appearanceAnimation },
            set appearanceAnimation(t) {
                s.checkType(t, "string", "[MapKit] Annotation.appearanceAnimation expected a string, but got `" + t + "` instead."), this._appearanceAnimation = t;
                var e = document.createElement("div");
                e.style.animation = e.style.webkitAnimation = t, this._appearanceAnimationName = e.style.animationName || e.style.webkitAnimationName
            },
            updatePosition: function() { this._node.position = new a(this._position.x - this._anchorPoint.x - this._anchorOffset.x, this._position.y - this._anchorPoint.y - this._anchorOffset.y) },
            setShown: function(t) { t = !!t, this._shown !== t && (this._shown = t, o.classList.toggle(this._node.element, r.HIDDEN), this.shownPropertyWasUpdated(t)) },
            shownPropertyWasUpdated: function() {},
            isShown: function() { return this._shown },
            position: function() { return this._position },
            setPosition: function(t) { this._position = t, this.updatePosition() },
            updateVisibility: function(t) { o.classList.toggle(this._node.element, r.INVISIBLE, t) },
            setSize: function(t, e) { this._node.size = t, this._anchorPoint = e === n.CalloutTailSide.Left ? new a(0, t.height / 2) : e === n.CalloutTailSide.Right ? new a(t.width, t.height / 2) : new a(t.width / 2, t.height), this.updatePosition() },
            _updateVisibility: function() {!this._visible && this._animating || (this.updateVisibility(!this._visible), this.delegate && this.delegate.annotationPropertyDidChange(this._public || this, "visible")) }
        }, e.exports = n
    }, { "../utils": 225, "@maps/geometry/point": 69, "@maps/js-utils": 84 }],
    126: [function(t, e, i) {
        function n() { Object.defineProperty(this, "_impl", { value: new o(this) }) }
        var o = t("./annotation-layer-item-internal");
        n.CalloutTailSide = { Left: "left", Right: "right", Bottom: "bottom" }, n.prototype = { get node() { return this._impl.node }, get element() { return this._impl.element }, set element(t) { this._impl.element = t }, get anchorOffset() { return this._impl.anchorOffset }, set anchorOffset(t) { this._impl.anchorOffset = t }, get animates() { return this._impl.animates }, set animates(t) { this._impl.animates = t }, get visible() { return this._impl.visible }, set visible(t) { this._impl.visible = t }, get appearanceAnimation() { return this._impl.appearanceAnimation }, set appearanceAnimation(t) { this._impl.appearanceAnimation = t }, addEventListener: function(t, e) { this._impl.addEventListener(t, e) }, removeEventListener: function(t, e) { this._impl.addEventListener(t, e) } }, e.exports = n
    }, { "./annotation-layer-item-internal": 125 }],
    127: [function(t, e, i) {
        function n(t, e, i) { Object.defineProperty(this, "_impl", { value: new s(this, t, e, i) }) }
        var o = t("./annotation-layer-item"),
            s = t("./annotation-internal"),
            a = t("@maps/js-utils");
        n.EVENTS = s.EVENTS, n.DisplayPriority = s.DisplayPriority, n.CollisionMode = s.CollisionMode, n.prototype = a.inheritPrototype(o, n, { get map() { return this._impl.map }, set map(t) { this._impl.map = t }, get coordinate() { return this._impl.coordinate }, set coordinate(t) { this._impl.coordinate = t }, get title() { return this._impl.title }, set title(t) { this._impl.title = t }, get subtitle() { return this._impl.subtitle }, set subtitle(t) { this._impl.subtitle = t }, get accessibilityLabel() { return this._impl.accessibilityLabel }, set accessibilityLabel(t) { this._impl.accessibilityLabel = t }, get data() { return this._impl.data }, set data(t) { this._impl.data = t }, get enabled() { return this._impl.enabled }, set enabled(t) { this._impl.enabled = t }, get calloutEnabled() { return this._impl.calloutEnabled }, set calloutEnabled(t) { this._impl.calloutEnabled = t }, get selected() { return this._impl.selected }, set selected(t) { this._impl.selected = t }, get animates() { return this._impl.animates }, set animates(t) { this._impl.animates = t }, get calloutOffset() { return this._impl.calloutOffset }, set calloutOffset(t) { this._impl.calloutOffset = t }, get callout() { return this._impl.callout }, set callout(t) { this._impl.callout = t }, get draggable() { return this._impl.draggable }, set draggable(t) { this._impl.draggable = t }, get size() { return this._impl.size }, set size(t) { this._impl.size = t }, get displayPriority() { return this._impl.displayPriority }, set displayPriority(t) { this._impl.displayPriority = t }, get collisionMode() { return this._impl.collisionMode }, set collisionMode(t) { this._impl.collisionMode = t }, get clusteringIdentifier() { return this._impl.clusteringIdentifier }, set clusteringIdentifier(t) { this._impl.clusteringIdentifier = t } }), e.exports = n
    }, { "./annotation-internal": 124, "./annotation-layer-item": 126, "@maps/js-utils": 84 }],
    128: [function(t, e, i) {
        function n() { o.GroupNode.call(this), this._element = a.htmlElement("div") }
        var o = t("../../../lib/scene-graph"),
            s = t("@maps/js-utils"),
            a = t("../utils");
        n.prototype = s.inheritPrototype(o.GroupNode, n, { get element() { return this._element }, stringInfo: function() { return "AnnotationsControllerNode" } }), e.exports = n
    }, { "../../../lib/scene-graph": 47, "../utils": 225, "@maps/js-utils": 84 }],
    129: [function(t, e, i) {
        function n(t) { h.call(this, t), this._sceneGraphNode = new c, this._node = new S.Node(v.htmlElement("div", { class: T.CONTAINER })), this._annotationsNode = this._node.addChild(new S.Node(this._sceneGraphNode.element)), this._calloutsNode = this._node.addChild(new S.Node(v.htmlElement("div"))), this._styleHelper = new _, this._map.element.appendChild(this._styleHelper.element), this._pendingAnnotations = [], this._annotationDraggingMapPanningController = new r(t), this._clustersController = new l(this) }

        function o(t, e, i) { return new C(t.origin.x - e, t.origin.y - i, t.size.width, t.size.height) }

        function s() {
            if (this._draggedAnnotation) {
                var t = this._draggedAnnotation._impl.dispatchDraggingEvent();
                this._map.dispatchEventWithAnnotation(t.type, this._draggedAnnotation, { coordinate: t.coordinate })
            }
        }
        var a = t("../../../lib/geo"),
            r = t("./annotation-dragging-map-panning-controller"),
            l = t("./clusters-controller"),
            h = t("../layer-items-controller"),
            c = t("./annotations-controller-node"),
            u = t("./annotation"),
            d = t("./annotation-internal"),
            p = t("./marker-annotation-internal"),
            m = t("./callout"),
            g = t("../services/geocoder"),
            _ = t("../style-helper"),
            f = a.MapRect,
            y = t("./user-location-annotation"),
            v = t("../utils"),
            w = t("@maps/js-utils"),
            b = t("@maps/geometry/point"),
            C = t("@maps/geometry/rect"),
            S = t("@maps/render-tree"),
            L = t("@maps/scheduler"),
            T = { CONTAINER: "mk-annotation-container", DRAGGING: "mk-dragging", SELECTED: "mk-selected", LIFTED: "mk-lifted" },
            E = null;
        n.prototype = w.inheritPrototype(h, n, {
            itemConstructor: u,
            itemName: "annotation",
            capitalizedItemName: "Annotation",
            _rtl: !1,
            _selectionDistance: Math.pow(h.prototype._selectionDistance, 2),
            get sceneGraphNode() { return this._sceneGraphNode },
            isItemExposed: function(t) { return t !== this._userLocationAnnotation && !t.memberAnnotations },
            _userLocationAnnotation: null,
            get userLocationAnnotation() { return this._userLocationAnnotation },
            get dragging() { return !!this._draggedAnnotation },
            set rtl(t) { this._rtl !== t && (this._rtl = t, this._selectedItem && this._callout && this._showCalloutForAnnotation(this._selectedItem, !0)) },
            preAddedAnnotation: function(t) { return !(t.map || !t._impl.updatedPosition()) && (t._impl.setDelegate(this), !0) },
            resetAnnotation: function(t) { delete t._impl.delegate },
            addItems: function(t) {
                if (t = h.prototype.addItems.call(this, t), this._shouldAnnotationBePending()) return t;
                t.sort(function(t, e) { return e.coordinate.latitude - t.coordinate.latitude });
                var e = this._map.camera.toMapRect(),
                    i = e.size.width,
                    n = e.size.height,
                    o = e.origin.x - i,
                    s = o + 3 * i,
                    a = e.origin.y - n,
                    r = a + 3 * n,
                    l = this._map.shouldWaitForTilesAndControls(),
                    c = 0;
                t.forEach(function(t) { t._impl.doesAnimate() && t.visible && t._impl.x + (t._impl.x < o ? 1 : 0) <= s && t._impl.y >= a && t._impl.y <= r && (t._impl.delayRank = c, ++c) });
                var u = Math.min(50 * c, 3e3),
                    d = 0 === c ? 0 : u / c;
                return t.forEach(function(t) { t._impl.delayMs = t._impl.delayRank * d, delete t._impl.delayRank, this._addAnnotationWaitingForTiles(t, l) }, this), t
            },
            addWaitingAnnotations: function(t) {
                var e = "function" == typeof t;
                this._waitingAnnotations ? (e && (this._completionCallback = t), window.clearTimeout(this._tileLoadingTimeout), delete this._tileLoadingTimeout, this._waitingAnnotations.forEach(function(t) { t.map && this._addAnnotationWaitingForTiles(t, !1, !e) }, this), delete this._waitingAnnotations, L.scheduleOnNextFrame(this._checkCompletion.bind(this))) : e && t()
            },
            annotationsInMapRect: function(t) {
                w.checkInstance(t, f, "[MapKit] Map.annotationsInMapRect expects a MapRect as its argument, got `" + t + "` instead.");
                var e = w.mod(t.origin.x, 1),
                    i = e + t.size.width,
                    n = t.origin.y,
                    o = n + t.size.height;
                return this._items.filter(function(t) {
                    if (t === this._userLocationAnnotation) return !1;
                    var s = t._impl.x + (t._impl.x < e ? 1 : 0),
                        a = t._impl.y;
                    return s >= e && s <= i && a >= n && a <= o
                }, this)
            },
            removeItem: function(t) { return t === this._userLocationAnnotation ? (console.warn("[MapKit] Map.removeAnnotation: the user location annotation cannot be removed. Set showsUserLocation to false instead."), t) : (delete t._impl.wasCollided, h.prototype.removeItem.call(this, t)) },
            removeUserLocationAnnotation: function() { this._userLocationAnnotation && (this._userLocationAnnotation._impl.removedFromMap(), h.prototype.removeItem.call(this, this._userLocationAnnotation), delete this._userLocationAnnotation) },
            updateUserLocationAnnotation: function(t) {
                if (t.coordinate) {
                    var e = this._userLocationAnnotation || new y(t);
                    if (this._userLocationAnnotation || (this._userLocationAnnotation = e, this.addItem(e)), t.stale) return delete this._lastGeocoderRequestCoordinate, delete this._lastUserLocationAnnotationSubtitle, void(e._impl.stale = !0);
                    if (e._impl.stale = !1, e._impl.setCoordinate(t.coordinate), E) { if (this._lastGeocoderRequestCoordinate && this._lastGeocoderRequestCoordinate.latitude === e._impl.coordinate.latitude && this._lastGeocoderRequestCoordinate.longitude === e._impl.coordinate.longitude) return void(this._userLocationAnnotation.subtitle = this._lastUserLocationAnnotationSubtitle) }
                    else E = new g;
                    this._lastGeocoderRequestCoordinate = e._impl.coordinate.copy(), x(E, e, this)
                }
            },
            mapSizeDidUpdate: function() {
                if (0 !== this._pendingAnnotations.length) {
                    var t = this._map.shouldWaitForTilesAndControls();
                    this._pendingAnnotations.forEach(function(e) { e._impl.isPending && this._addAnnotationWaitingForTiles(e, t) }, this), this._pendingAnnotations = []
                }
            },
            updateVisibleAnnotations: function() { this._updateVisibleAnnotations(this._items) },
            startDraggingAnnotation: function(t, e) { this._map.annotationDraggingWillStart(), this._draggedAnnotation = t, this._pendingDragStart = !0, t.selected && this._hideCallout(t), v.classList.add(this._node.element, T.DRAGGING), v.classList.add(this._draggedAnnotation._impl.node.element, T.LIFTED), this._draggedAnnotation._impl.lift(40), this._updateSceneGraph() },
            mapTypeWasSet: function(t) { p.prototype.darkColorScheme = t, this._items.forEach(function(t) { t._impl.updateLayout() }) },
            devicePixelRatioDidChange: function() { this._items.forEach(function(t) { "function" == typeof t._impl.updateGlyphImages && t._impl.updateGlyphImages() }) },
            handleEvent: function(t) {
                switch (t.type) {
                    case "region-change-start":
                        this._nudgeStarted = !0, this._map.public.addEventListener("region-change-end", this);
                        break;
                    case "region-change-end":
                        !this._nudgeStarted && this._nudgeMapToShowCallout() || (delete this._nudgeStarted, this._callout && this._callout.animateIn(), this._map.public.removeEventListener(t.type, this))
                }
            },
            performScheduledUpdate: s,
            addedItem: function(t, e) {
                h.prototype.addedItem.call(this, t, e), t._impl.isWaiting = !0, e && (t._impl.delayRank = 0);
                var i = this._shouldAnnotationBePending(t);
                i && (t._impl.isPending = !0, this._pendingAnnotations.push(t)), this._updateAnnotation(t), t._impl.selected && this._didSelectAnnotation(t), e || i || this._addAnnotationWaitingForTiles(t, this._map.shouldWaitForTilesAndControls())
            },
            removedItem: function(t) { t._impl.node.remove(), h.prototype.removedItem.call(this, t), t._impl.labelRegion && this._removeLabelRegionForAnnotation(t), this._updateVisibleAnnotations([t]), this._clustersController.removedAnnotation(t), t.memberAnnotations || this._updateCollisions(this._items) },
            removedReferenceToMap: function() { this._userLocationAnnotation && this._userLocationAnnotation._impl.removedFromMap() },
            pickableItemsCloseToPoint: function(t, e) { var i = t.filter(function(t, i) { var n = t._impl.distanceToPoint(e); return n <= this._selectionDistance && (t._impl.distance = n, t._impl.index = i, !0) }, this).sort(function(t, e) { return t._impl.distance - e._impl.distance || e._impl.index - t._impl.index }); return i.forEach(function(t) { delete t._impl.distance, delete t._impl.index }), i },
            annotationDraggingDidChange: function(t) { this._draggedAnnotation && !this._draggedAnnotation._impl.shouldPreventDrag && (this._pendingDragStart && (delete this._pendingDragStart, this._draggedAnnotation._impl.draggingDidStart(), this._map.dispatchEventWithAnnotation(d.Events.DragStart, this._draggedAnnotation)), L.scheduleASAP(this), this._draggedAnnotation._impl.setDraggingTranslationForMapFrameSize(t, this._map.ensureRenderingFrame().size), this._annotationDraggingMapPanningController.update(this._draggedAnnotation, this._draggedAnnotation._impl.node)) },
            annotationDraggingDidEnd: function(t) { this._draggedAnnotation && (this._annotationDraggingMapPanningController.stop(), this._draggedAnnotation._impl.dropAfterDraggingAndRevertPosition(!t), v.classList.remove(this._draggedAnnotation._impl.node.element, T.LIFTED), v.classList.remove(this._node.element, T.DRAGGING), this._map.annotationDraggingDidEnd(), this._map.dispatchEventWithAnnotation(d.Events.DragEnd, this._draggedAnnotation), delete this._draggedAnnotation, this._updateSceneGraph()) },
            annotationPropertyDidChange: function(t, e) {
                switch (e) {
                    case "selected":
                        t.selected ? this._didSelectAnnotation(t) : this._didDeselectAnnotation(t);
                        break;
                    case "coordinate":
                        if (!t._impl.updatedPosition()) return;
                        break;
                    case "":
                    case "displayPriority":
                    case "collisionMode":
                        break;
                    case "calloutOffset":
                        this._updateCalloutPositionWithTailShift(t, !0);
                        break;
                    case "visible":
                        this._selectedItem === t && (this._callout ? this._callout.visible = t.visible : t.visible && this._showCalloutForAnnotation(t, !0)), t._impl.needsColliding = !0;
                        break;
                    case "draggable":
                        this._draggedAnnotation !== t || t.draggable || this._map.stopDraggingAnnotation();
                        break;
                    default:
                        this._selectedItem === t && (this._updateCalloutInfo(t), this._updateCalloutTailShift())
                }
                this._annotationsDidChangeSinceLastCollision = !0, this._updateVisibleAnnotations([t]), this._updateLabelRegionForAnnotation(t)
            },
            mapForAnnotation: function(t) { return this._map ? this._map.public : null },
            sizeForElement: function(t) { if (this._map.isRooted()) return this._styleHelper.sizeForElement(t) },
            selectedAnnotationDidMoveToMap: function(t) { this._updateSceneGraph(), this._showCalloutForAnnotation(t) },
            supportsLabelRegions: function() { return this._map.supportsLabelRegions() },
            annotationFinishedAnimating: function(t) { this._checkCompletion() },
            isElementInCallout: function(t) { return !!this._callout && this._callout.containsElement(t) },
            isElementInCustomCallout: function(t) { return !!this._callout && this._callout.isCustomCallout() && this._callout.node.element.contains(t) },
            mapPanningDuringAnnotationDrag: s,
            mapSupportForLabelRegionsChanged: function() {
                this._items.forEach(function(t) {
                    var e = t._impl;
                    e.updateLayout(), delete e.labelRegion, this._updateLabelRegionForAnnotation(t)
                }, this)
            },
            containsMarkerAnnotation: function() { return this._items.some(function(t) { return "string" == typeof t.glyphText }) },
            _addAnnotationToMap: function(t, e) { this._shouldAnnotationBePending() ? t._impl.isPending = !0 : (t._impl.willMoveToMap(t._impl.canAnimate && !e), delete t._impl.timeout, delete t._impl.isWaiting, delete t._impl.canAnimate, delete t._impl.delayMs, this._annotationsNode.addChild(t._impl.node), t._impl.sceneGraphNode && this._sceneGraphNode.addChild(t._impl.sceneGraphNode), this._updateAnnotation(t), t.selected && this._showCalloutForAnnotation(t), this._updateLabelRegionForAnnotation(t), t._impl.didMoveToMap()) },
            _addAnnotationWaitingForTiles: function(t, e, i) { t._impl.hasOwnProperty("canAnimate") || (t._impl.canAnimate = !t._impl.isPending), delete t._impl.isPending, !e || t === this._userLocationAnnotation || this._items.some(function(t) { return t !== this._userLocationAnnotation && t._impl.mayBeDrawn() }) ? !i && t._impl.doesAnimate() && t._impl.delayMs > 0 ? t._impl.timeout = window.setTimeout(this._addAnnotationToMap.bind(this, t), t._impl.delayMs) : this._addAnnotationToMap(t, i) : this._waitingAnnotations ? this._waitingAnnotations.push(t) : (this._waitingAnnotations = [t], this._tileLoadingTimeout = window.setTimeout(this.addWaitingAnnotations.bind(this, w.noop), 3e3)) },
            _didDeselectAnnotation: function(t) { v.classList.remove(t._impl.node.element, T.SELECTED), this.selectedItem = null, this._map.annotationSelectionDidChange(t), this._hideCallout(t) },
            _didSelectAnnotation: function(t) { v.classList.add(t._impl.node.element, T.SELECTED), this.selectedItem = t, this._map.annotationSelectionDidChange(t), t._impl.visible && this._showCalloutForAnnotation(t) },
            _boundingRectForSelectedAnnotationAndCallout: function() {
                var t = this._callout.boundingRect,
                    e = this._selectedItem._impl.position(),
                    i = Math.min(t.minX(), e.x),
                    n = Math.min(t.minY(), e.y),
                    o = Math.max(t.maxX(), e.x) - i,
                    s = Math.max(t.maxY(), e.y) - n;
                return new C(i, n, o, s)
            },
            _updateCalloutTailShift: function(t) {
                if (!this._callout) return !1;
                var e = t ? this._callout.boundingRect.pad(12) : this._boundingRectForSelectedAnnotationAndCallout().pad(12),
                    i = this._totalMapNudgingTranslation(e, this._map.ensureVisibleFrame(), t),
                    n = i.x,
                    o = i.y,
                    s = this._callout.shiftTailBy(n);
                return 0 !== n || 0 !== o ? new b(-(n + s), -o) : void 0
            },
            _nudgeMapToShowCallout: function() { if (this._map.cameraIsPanning || this._map.cameraIsZooming) return this._map.public.addEventListener("region-change-end", this), !0; if (!this._selectedItem._impl.isShown()) return !1; var t = this._updateCalloutTailShift(); return !!t && (this._map.public.addEventListener("region-change-start", this), this._map.translateCameraAnimated(t, !0), this._map.public.removeEventListener("region-change-start", this), !!this._nudgeStarted) },
            _translationToFitInFrame: function(t, e) { var i = { x: 0, y: 0 }; return (t.maxX() > e.maxX() || t.minX() < e.minX() || t.maxY() > e.maxY() || t.minY() < e.minY()) && (i.x = t.minX() < e.minX() ? t.minX() - e.minX() : t.maxX() > e.maxX() ? t.maxX() - e.maxX() : 0, i.y = t.minY() < e.minY() ? t.minY() - e.minY() : t.maxY() > e.maxY() ? t.maxY() - e.maxY() : 0), i },
            _totalMapNudgingTranslation: function(t, e, i) {
                var n = this._translationToFitInFrame(t, e),
                    s = this._map.controlsLayer.controlBounds(),
                    a = e.midX(),
                    r = e.midY(),
                    l = 0,
                    h = 0;
                return t = o(t, n.x, n.y), s.forEach(function(e) {
                    if (t.minX() < e.maxX() && t.maxX() > e.minX() && t.minY() < e.maxY() && t.maxY() > e.minY()) {
                        if (l += e.maxX() < a ? t.minX() - e.maxX() : t.maxX() - e.minX(), h += e.maxY() < r ? t.minY() - e.maxY() : t.maxY() - e.minY(), i) return;
                        0 !== h && Math.abs(l) > Math.abs(h) ? l = 0 : h = 0, t = o(t, l, h)
                    }
                }, this), n.x += l, n.y += h, n
            },
            _hideCallout: function(t) { this._callout && (t._impl.calloutWillDisappear(), v.classList.remove(this._callout.node.element, T.SELECTED), this._callout.animateOut(), delete this._callout) },
            _shouldAnnotationBePending: function() { return !this._map.isRooted() },
            _showCalloutForAnnotation: function(t, e) {
                if (this._hideCallout(t), t._impl.canShowCallout()) {
                    var i = t._impl.callout;
                    if (!i || "function" != typeof i.calloutShouldAppearForAnnotation || i.calloutShouldAppearForAnnotation(t)) {
                        var n;
                        if (i && "function" == typeof i.calloutElementForAnnotation && (n = i.calloutElementForAnnotation(t), w.checkElement(n, "[MapKit] calloutElementForAnnotation() must return a DOM element, but returned `" + n + "` instead.")), !n) { var o; if (i && "function" == typeof i.calloutContentForAnnotation && (o = i.calloutContentForAnnotation(t), w.checkElement(o, "[MapKit] contentElementForAnnotation() must return a DOM element, but returned `" + o + "` instead.")), !o && !t.title) return } t._impl.calloutWillAppear();
                        var s;
                        i && "function" == typeof i.calloutLeftAccessoryForAnnotation && (s = i.calloutLeftAccessoryForAnnotation(t), w.checkElement(s, "[MapKit] calloutLeftAccessoryForAnnotation() must return a DOM element, but returned `" + s + "` instead."));
                        var a;
                        i && "function" == typeof i.calloutRightAccessoryForAnnotation && (a = i.calloutRightAccessoryForAnnotation(t), w.checkElement(a, "[MapKit] calloutRightAccessoryForAnnotation() must return a DOM element, but returned `" + a + "` instead."));
                        var r = t._impl.ignoreCalloutCornerRadiusForLeftAccessory && !s && !a;
                        !s && t._impl.canvasForCalloutAccessory && (s = t._impl.canvasForCalloutAccessory()), this._callout = new m(this._styleHelper, { customElement: n, contentElement: o, ignoreCalloutCornerRadiusForLeftAccessory: r, leftAccessory: this._rtl ? a : s, rightAccessory: this._rtl ? s : a, rtl: this._rtl }), this._callout.animates = !e && (!i || "function" != typeof i.calloutShouldAnimateForAnnotation || !!i.calloutShouldAnimateForAnnotation(t));
                        var l = this._callout.animates && i && "function" == typeof i.calloutAppearanceAnimationForAnnotation ? i.calloutAppearanceAnimationForAnnotation(t) : "";
                        if (w.checkType(l, "string", "[MapKit] calloutAppearanceAnimationForAnnotation() must return a string, but returned `" + l + "` instead."), this._callout.appearanceAnimation = l, n) {
                            var h;
                            i && "function" == typeof i.calloutAnchorOffsetForAnnotation && (h = i.calloutAnchorOffsetForAnnotation(t, this._callout.node.size), w.checkInstance(h, window.DOMPoint, "[MapKit] calloutAnchorOffsetForAnnotation() must return a DOMPoint, but returned `" + h + "` instead.")), this._callout.setAnchorOffset(h)
                        }
                        this._updateCalloutInfo(t), this._updateCalloutPositionWithTailShift(t, !1);
                        var c = !e && this._nudgeMapToShowCallout();
                        this._callout.willMoveToMap(), v.classList.add(this._callout.node.element, T.SELECTED), this._calloutsNode.addChild(this._callout.node), c || this._callout.animateIn()
                    }
                }
            },
            mapWasDestroyed: function() { h.prototype.mapWasDestroyed.call(this), this._annotationDraggingMapPanningController.mapWasDestroyed() },
            _updateCalloutInfo: function(t) { this._callout ? this._callout.updateInfo(t, 12) || this._hideCallout(t) : this._showCalloutForAnnotation(t) },
            _updateCalloutPositionWithTailShift: function(t, e) { this._selectedItem === t && this._callout && (this._callout.setShown(t._impl.isShown()), this._callout.setPosition(t._impl.positionForCallout()), e && this._updateCalloutTailShift(e)) },
            _updateLabelRegionForAnnotation: function(t) {
                var e = t._impl;
                if (e.shouldHideLabels) {
                    e.labelRegion || (e.labelRegion = this._map.createLabelRegion());
                    var i = e.labelRegion;
                    if (i) {
                        var n = e.node.size,
                            o = n.width,
                            s = n.height;
                        i.x = e.x, i.y = 1 - e.y, i.width = o, i.height = s, i.xOffset = o / 2 - e._anchorPoint.x - e._anchorOffset.x, i.yOffset = e._anchorPoint.y + e._anchorOffset.y - s / 2, this._map.updatedLabelRegion()
                    }
                }
            },
            _removeLabelRegionForAnnotation: function(t) { this._map.unregisterLabelRegion(t._impl.labelRegion), delete t._impl.labelRegion },
            _updateVisibleAnnotations: function(t, e) {
                e || this._deletePreviousPointForPickingItem();
                var i = this._map,
                    n = i.camera.toRenderingMapRect(),
                    o = n.size.width,
                    s = n.size.height,
                    a = n.minX(),
                    r = n.maxX(),
                    l = a - o,
                    h = r + o,
                    c = n.minY() - s,
                    u = c + 3 * s;
                t.forEach(function(t) {
                    if (t !== this._draggedAnnotation || !this._annotationDraggingMapPanningController.panning) {
                        var e = t._impl.x + (t._impl.x < l ? 1 : t._impl.x > h ? -1 : 0);
                        if (e >= l && e <= h && t._impl.y >= c && t._impl.y <= u) {
                            t._impl.isShown() || t !== this._selectedItem || this._showCalloutForAnnotation(t, !0), t._impl.setShown(!0);
                            var n = a - e;
                            n > 0 ? Math.abs(r - (e + 1)) < n && ++e : (n = e - r) > 0 && Math.abs(a - (e - 1)) < n && --e
                        }
                        else t._impl.setShown(!1);
                        t._impl.setPosition(i.adjustMapItemPoint(i.camera.transformMapPoint(new b(e, t._impl.y))))
                    }
                }, this), this._updateCalloutPositionWithTailShift(this._selectedItem, !0), e || this._updateCollisions(t), this._updateSceneGraph()
            },
            _updateCollisions: function(t) {
                var e = !1,
                    i = this._items.filter(function(t) {
                        var i = t.visible && t._impl.isShown(),
                            n = (i || t._impl.needsColliding) && t !== this._userLocationAnnotation;
                        return delete t._impl.needsColliding, n && (t.displayPriority < u.DisplayPriority.Required || t.clusteringIdentifier) && (e = !0), n && i && !t.memberAnnotations
                    }, this);
                if (e) {
                    var n = this._map;
                    this._clustersController.collideAnnotations(i, n.zoomLevel, n.rotation, this._annotationsDidChangeSinceLastCollision)
                }
                this._annotationsDidChangeSinceLastCollision = !1
            },
            addCluster: function(t) {
                try {
                    var e = "function" == typeof this._map.annotationForCluster ? this._map._annotationForCluster.call(this._map.public, t) : t;
                    e = this._clustersController.setRequiredClusterAnnotationProperties(e, t), this.addItem(e)
                }
                catch (i) { console.warn("[MapKit] annotationForCluster: the following error occurred; reverting to default annotation: " + i), e = this.addItem(t) }
                return e._impl.customCluster = e !== t, e._impl.updateLayout(!0), e
            },
            willUpdateCollisions: function() { this._items.forEach(function(t) { t._impl.wasOccluded = t._impl.occluded, t._impl.previousCluster = t._impl.cluster }) },
            didUpdateCollisions: function() {
                this._items.forEach(function(t) {
                    var e = t._impl;
                    e.wasCollided || e.occluded || (e.wasCollided = !0), t.memberAnnotations && t.memberAnnotations[0]._impl.cluster !== t && (e.cluster = e.memberAnnotations[0]._impl.cluster), e.updateVisibility(e.occluded), e.occluded !== e.wasOccluded && e.animateOcclusion(), delete e.wasOccluded, delete e.previousCluster, e.shouldHideLabels && (e.occluded || e.labelRegion ? e.occluded && e.labelRegion && this._removeLabelRegionForAnnotation(t) : this._updateLabelRegionForAnnotation(t))
                }, this), this._updateVisibleAnnotations(this._items, !0)
            },
            deselectClusterAnnotation: function() { this._selectedItem && this._selectedItem.memberAnnotations && (this._selectedItem.selected = !1) },
            _updateAnnotation: function(t) { t._impl.updatedPosition() && this._updateVisibleAnnotations([t]) },
            _updateSceneGraph: function() {
                var t = this._selectedItem,
                    e = this._draggedAnnotation;
                this._sceneGraphNode.children = this._items.filter(function(i) { return i._impl.isDrawn() && i !== t && i !== e }).map(function(t) { return t._impl.sceneGraphNode }), t && t._impl.isDrawn() && this._sceneGraphNode.addChild(t._impl.sceneGraphNode), e && e._impl.isDrawn() && this._sceneGraphNode.addChild(e._impl.sceneGraphNode)
            },
            _checkCompletion: function() { this._annotationsDidChangeSinceLastCollision = !0, this._updateVisibleAnnotations(this._items), this._completionCallback && (this._items.some(function(t) { return t._impl.floating }) || "function" != typeof this._completionCallback || (this._completionCallback(), delete this._completionCallback)) }
        });
        var x = v.debounce(function(t, e, i) { i._geocoderRequestId && t.cancel(i._geocoderRequestId); var n = i._geocoderRequestId = t.reverseLookup(e._impl.coordinate, function(t, o) { n === i._geocoderRequestId && (delete i._geocoderRequestId, t ? (console.error("[MapKit] Error getting address for user location: " + t.message), e.subtitle = null) : o.results.length > 0 ? i._lastUserLocationAnnotationSubtitle = e.subtitle = o.results[0].formattedAddress : e.subtitle = null) }) }, 1e3);
        e.exports = n
    }, { "../../../lib/geo": 2, "../layer-items-controller": 180, "../services/geocoder": 213, "../style-helper": 220, "../utils": 225, "./annotation": 127, "./annotation-dragging-map-panning-controller": 123, "./annotation-internal": 124, "./annotations-controller-node": 128, "./callout": 130, "./clusters-controller": 133, "./marker-annotation-internal": 142, "./user-location-annotation": 156, "@maps/geometry/point": 69, "@maps/geometry/rect": 70, "@maps/js-utils": 84, "@maps/render-tree": 102, "@maps/scheduler": 106 }],
    130: [function(t, e, i) {
        function n(t, e) {
            function i(e) { var i = t.backgroundColorForElement(e); return e.style.background = "transparent", i }

            function n(t, e) { var i = p.htmlElement("div", { class: I.CALLOUT_ACCESSORY_CONTENT }, t); return i.style.maxWidth = E / 2 + "px", e && (i.style.padding = "0"), p.htmlElement("div", { class: I.CALLOUT_ACCESSORY }, i) } r.call(this), this._styleHelper = t, this._rtl = e.rtl;
            var o = p.htmlElement("div", { class: I.CALLOUT });
            this._node = new u.Node(o), e.customElement ? (this._containerElement = this._customElement = o.appendChild(e.customElement), this.setSize(this._styleHelper.sizeForElement(this._customElement))) : (this._ignoreCalloutCornerRadiusForLeftAccessory = e.ignoreCalloutCornerRadiusForLeftAccessory, this._tailSide = e.tailSide || _.Bottom, this._tailScale = e.tailScale || 1, this._bubbleElement = p.svgElement("path"), this._svgElement = o.appendChild(p.svgElement("svg", { class: I.CALLOUT_BUBBLE }, this._bubbleElement)), this._containerElement = o.appendChild(p.htmlElement("div")), e.leftAccessory && (this._leftAccessoryBackgroundColor = i(e.leftAccessory), this._leftAccessory = n(e.leftAccessory, !this._rtl && this._ignoreCalloutCornerRadiusForLeftAccessory), this._containerElement.appendChild(this._leftAccessory)), this._containerContentElement = this._containerElement.appendChild(p.htmlElement("div", { class: I.CALLOUT_CONTENT })), e.rightAccessory && (this._rightAccessoryBackgroundColor = i(e.rightAccessory), this._rightAccessory = n(e.rightAccessory, this._rtl && this._ignoreCalloutCornerRadiusForLeftAccessory), this._containerElement.appendChild(this._rightAccessory)), (this._leftAccessoryBackgroundColor || this._rightAccessoryBackgroundColor) && (this._calloutId = a(), this._linearGradientElement = p.svgElement("linearGradient", { id: this._calloutId }), this._svgElement.appendChild(p.svgElement("defs", this._linearGradientElement))), e.contentElement ? this._setContentElement(e.contentElement) : (p.classList.add(this._containerElement, I.STANDARD_CONTENT), p.classList.toggle(this._containerContentElement, I.RTL, e.rtl))), e.position && this.setPosition(e.position), this._node.wantsHardwareCompositing = !0
        }

        function o(t) { return (t - T) / (2 * b) }

        function s(t, e) {
            e || (e = {});
            var i = e.tailShift || 0,
                n = e.side || _.Bottom,
                o = e.scale || 1,
                s = b * o,
                a = y * o,
                r = t.height / 2 - s,
                l = t.width / 2 - s,
                h = C * o,
                c = S * o;
            return "M" + (n === _.Left ? a : 0) + "," + f + "c0," + (w - f) + " " + v + "," + -f + " " + f + "," + -f + "h" + t.width + "c" + (f - v) + ",0 " + f + "," + w + " " + f + "," + f + (n === _.Right ? "v" + (r + i) + "c0," + h + " " + a + "," + c + " " + a + "," + s + "c0," + (s - c) + " " + -a + "," + (s - h) + " " + -a + "," + s + "v" + (r - i) : "v" + t.height) + "c0," + (f - w) + " " + -v + "," + f + " " + -f + "," + f + (n === _.Bottom ? "h" + (-i - l) + "c" + -h + ",0 " + -c + "," + a + " " + -s + "," + a + "c" + (c - s) + ",0 " + (h - s) + "," + -a + " " + -s + "," + -a + "h" + (i - l) : "h" + -t.width) + "c" + (v - f) + ",0 " + -f + "," + -w + " " + -f + "," + -f + (n === _.Left ? "v" + (i - r) + "c0," + -h + " " + -a + "," + -c + " " + -a + "," + -s + "c0," + (c - s) + " " + a + "," + (h - s) + " " + a + "," + -s + "v" + (-i - r) : "z")
        }

        function a() { var t = Math.random().toString(36).substr(2); return document.getElementById(t) ? a() : t }
        var r = t("./annotation-layer-item-internal"),
            l = t("@maps/geometry/point"),
            h = t("@maps/geometry/rect"),
            c = t("@maps/geometry/size"),
            u = t("@maps/render-tree"),
            d = t("@maps/css-transform"),
            p = t("../utils"),
            m = t("@maps/js-utils"),
            g = t("@maps/scheduler"),
            _ = r.CalloutTailSide,
            f = 10.5,
            y = 13,
            v = 3.5826363,
            w = 3.58028186,
            b = 17,
            C = 10,
            S = 12,
            L = 91 - b,
            T = 3,
            E = 373,
            x = 50 + y,
            M = 55 + y,
            A = 1 + 2 * f,
            k = { default: { left: 10, right: 10, content: { left: 4, right: 4 } }, withIcon: { left: 7.5, right: 10 }, withAccessories: { left: 7.5, right: 7.5 } },
            O = { default: 5.5, withCustomContent: 0 },
            I = { CALLOUT: "mk-callout", CALLOUT_BUBBLE: "mk-bubble", TITLE: "mk-title", SUBTITLE: "mk-subtitle", NO_SUBTITLE: "mk-no-subtitle", NO_ACESSORIES: "mk-no-accessories", STANDARD_CONTENT: "mk-standard", CALLOUT_ACCESSORY: "mk-callout-accessory", CALLOUT_CONTENT: "mk-callout-content", CUSTOM_CONTENT: "mk-custom-content", CALLOUT_ACCESSORY_CONTENT: "mk-callout-accessory-content", RTL: "mk-rtl" };
        n.prototype = m.inheritPrototype(r, n, {
            _tailShift: 0,
            get node() { return this._node },
            get boundingRect() { var t = this._node.position; return new h(t.x, t.y, this._node.size.width, this._node.size.height) },
            willMoveToMap: function() { this._node.transform = (new d).scale(0) },
            setAnchorOffset: function(t) { this._anchorOffset = t ? new window.DOMPoint(t.x, t.y) : new window.DOMPoint },
            containsElement: function(t) { return t !== this._svgElement && this._containerElement.contains(t) },
            isCustomCallout: function() { return !(!this._customElement && !this._contentElement) },
            updateInfo: function(t, e) {
                if (this._customElement || this._contentElement) return !0;
                if (!t || !t.title) return !1;
                this._containerContentElement.innerHTML = "", this._containerElement.style.width = "", this._containerContentElement.appendChild(p.htmlElement("div", { class: I.TITLE }, t.title)), t.subtitle ? (this._containerContentElement.appendChild(p.htmlElement("div", { class: I.SUBTITLE }, t.subtitle)), p.classList.remove(this._containerElement, I.NO_SUBTITLE)) : (p.classList.add(this._containerElement, I.NO_SUBTITLE), this._containerElement.classList.toggle(I.NO_ACESSORIES, !this._leftAccessory && !this._rightAccessory)), this._updateAccessoryViews();
                var i = this._styleHelper.sizeForElement(this._containerElement),
                    n = t.map._impl.ensureVisibleFrame().size.width - 2 * e - this._extraWidth(this._ignoreCalloutCornerRadiusForLeftAccessory);
                return i.width = m.clamp(i.width, L, m.clamp(n, L, E)), this._updateSize(i, { annotation: t }), this.updatePosition(), !0
            },
            shiftTailBy: function(t) {
                if (this._customElement) return 0;
                var e = this._tailSide === _.Bottom ? new c(this._node.size.width - A, this._node.size.height - this._extraHeight) : new c(this._node.size.width - this._extraHeight, this._node.size.height - A),
                    i = this._tailSide === _.Bottom ? e.width : e.height,
                    n = Math.max(0, (i - L - f) / 2);
                return this._tailShift = t < 0 ? Math.min(n, -t) : -Math.min(n, t), this._bubbleElement.setAttribute("d", s(e, { side: this._tailSide, scale: this._tailScale, tailShift: this._tailShift })), this._node.position = this._tailSide === _.Bottom ? new l(this._node.position.x + this._tailShift, this._node.position.y) : new l(this._node.position.x, this._node.position.y - this._tailShift), this._tailShift
            },
            animateIn: function() {
                if (!this.animates || this.animates && this._customElement && !this.appearanceAnimation) this._node.transform = new d;
                else {
                    if (this._appearanceAnimationName) return this._node.transform = new d, this._containerElement.style.animation = this._containerElement.style.webkitAnimation = this._appearanceAnimation, this._svgElement && (this._svgElement.style.animation = this._svgElement.style.webkitAnimation = this._appearanceAnimation), this._animationName = this._appearanceAnimationName, this._containerElement.addEventListener("animationend", this), void this._containerElement.addEventListener("webkitAnimationEnd", this);
                    this._scaleXOffset = this._tailSide === _.Bottom ? -this._tailShift : this._tailSide === _.Left ? -this._node.size.width / 2 : this._node.size.width / 2, this._scaleYOffset = this._tailSide === _.Bottom ? this._node.size.height / 2 : 0, this._scaleAnimationParameterIndex = 0, this._scaleAnimationStartDate = Date.now(), g.scheduleOnNextFrame(this)
                }
            },
            animateOut: function() { this.visible ? (this._scaleAnimationStartDate && this._finishAnimatingScale(), this._node.element.style.webkitAnimation = this._node.element.style.animation = "mk-fadeout 0.1s forwards", this._node.element.style.webkitAnimationName || this._node.element.style.animationName ? (this._animationName = "mk-fadeout", this._node.element.addEventListener("animationend", this), this._node.element.addEventListener("webkitAnimationEnd", this)) : this._node.remove()) : this._node.remove() },
            handleEvent: function(t) { "animationend" !== t.type && "webkitAnimationEnd" !== t.type || t.animationName !== this._animationName || (this._animationName === this._appearanceAnimationName ? (this._containerElement.style.animation = this._containerElement.style.webkitAnimation = "", this._containerElement.removeEventListener("animationend", this), this._containerElement.removeEventListener("webkitAnimationEnd", this)) : this._node.remove(), delete this._animationName) },
            performScheduledUpdate: function() { this._scaleAnimationStartDate && this._animateScale() },
            _updateSize: function(t, e) {
                var i = this._ignoreCalloutCornerRadiusForLeftAccessory,
                    n = this._tailSide === _.Left || this._tailSide === _.Right ? Math.min(o(t.height), this._tailScale) : this._tailScale,
                    a = (this._tailSide === _.Bottom ? t.width - this.node.size.width : t.height - this.node.size.height) - A;
                this._tailShift = Math.max(0, this._tailShift + Math.min(0, a)), this._bubbleElement.setAttribute("d", s(t, { side: this._tailSide, scale: n, tailShift: this._tailShift })), this._containerElement.style.width = t.width + "px";
                var r = t.height;
                this._extraHeight = A + y * n;
                var l = this._extraWidth(i);
                t.width += this._tailSide === _.Bottom ? l : this._extraHeight;
                var h = i ? M : x;
                t.height += this._tailSide === _.Bottom ? this._extraHeight : A, t.height -= f, t.height = e.hasCustomContent ? t.height : Math.max(t.height, h);
                var c = e.hasCustomContent ? O.withCustomContent : O.default,
                    u = (t.height - r - y) / 2;
                this._containerElement.style.top = r / 2 + Math.max(c, u) + "px", this._svgElement.style.width = t.width + "px", this._svgElement.style.height = t.height + "px", this._svgElement.setAttribute("viewBox", "-0.5 -0.5 " + t.width + " " + t.height);
                var d = k.withAccessories.left + (this._tailSide === _.Left ? y * n : 0),
                    p = k.withAccessories.right + (this._tailSide === _.Right ? y * n : 0);
                this._containerElement.style.left = d + "px", this.setSize(t, this._tailSide);
                var m;
                this._leftAccessoryBackgroundColor && (m = 100 * (this._leftAccessoryWidth + d) / t.width, this._updateAccessoryViewBackground(m, this._leftAccessoryBackgroundColor, "white")), this._rightAccessoryBackgroundColor && (m = 100 - 100 * (this._rightAccessoryWidth + p) / t.width, this._updateAccessoryViewBackground(m, "white", this._rightAccessoryBackgroundColor))
            },
            _extraWidth: function(t) { return t ? k.withIcon.left + k.withIcon.right : k.default.left + k.default.right - k.default.content.left },
            _updateAccessoryViews: function() { this._leftAccessory && (this._leftAccessoryWidth = (!this._rtl && this._ignoreCalloutCornerRadiusForLeftAccessory ? 0 : f) + this._styleHelper.sizeForElement(this._leftAccessory.children[0]).width, this._leftAccessory.style.width = this._leftAccessoryWidth + "px", this._ignoreCalloutCornerRadiusForLeftAccessory && !this._rtl && (this._leftAccessory.style.height = this._leftAccessoryWidth + "px", this._leftAccessory.style.overflow = "visible"), this._containerContentElement.style.marginLeft = this._leftAccessoryWidth + "px"), this._rightAccessory && (this._rightAccessoryWidth = (this._rtl && this._ignoreCalloutCornerRadiusForLeftAccessory ? 0 : f) + this._styleHelper.sizeForElement(this._rightAccessory.children[0]).width, this._rightAccessory.style.width = this._rightAccessoryWidth + "px", this._ignoreCalloutCornerRadiusForLeftAccessory && this._rtl && (this._rightAccessory.style.height = this._rightAccessoryWidth + "px", this._rightAccessory.style.overflow = "visible"), this._containerContentElement.style.marginRight = this._rightAccessoryWidth + "px") },
            _updateAccessoryViewBackground: function(t, e, i) { this._linearGradientElement.appendChild(p.svgElement("stop", { offset: t + "%", "stop-color": "" + e })), this._linearGradientElement.appendChild(p.svgElement("stop", { offset: t + "%", "stop-color": "" + i })), this._bubbleElement.style.fill = "url(#" + this._calloutId + ")" },
            _setContentElement: function(t) {
                this._updateAccessoryViews(), this._contentElement = t, this._containerContentElement.appendChild(p.htmlElement("div", t)), p.classList.add(this._containerElement, I.CUSTOM_CONTENT);
                var e = this._styleHelper.sizeForElement(this._containerElement);
                this._updateSize(e, { hasCustomContent: !0 })
            },
            _scaleAnimationParameters: [
                [8e3 / 60, 30 / 249, 277 / 249],
                [5e3 / 60, 277 / 249, 237 / 249],
                [5e3 / 60, 237 / 249, 1]
            ],
            _animateScale: function() {
                var t = this._scaleAnimationParameters[this._scaleAnimationParameterIndex],
                    e = t[0],
                    i = t[1],
                    n = t[2],
                    o = Date.now(),
                    s = Math.min((o - this._scaleAnimationStartDate) / e, 1),
                    a = i + (n - i) * s;
                if (this._node.transform = (new d).translate(this._scaleXOffset, this._scaleYOffset).scale(a).translate(-this._scaleXOffset, -this._scaleYOffset), 1 === s) {
                    if (!(++this._scaleAnimationParameterIndex < this._scaleAnimationParameters.length)) return void this._finishAnimatingScale();
                    this._scaleAnimationStartDate = o
                }
                g.scheduleOnNextFrame(this)
            },
            _finishAnimatingScale: function() { delete this._scaleXOffset, delete this._scaleYOffset, delete this._scaleAnimationStartDate, delete this._scaleAnimationParameterIndex }
        }), e.exports = n
    }, { "../utils": 225, "./annotation-layer-item-internal": 125, "@maps/css-transform": 60, "@maps/geometry/point": 69, "@maps/geometry/rect": 70, "@maps/geometry/size": 71, "@maps/js-utils": 84, "@maps/render-tree": 102, "@maps/scheduler": 106 }],
    131: [function(t, e, i) {
        function n(t, e, i, n) { this._memberAnnotations = i, s.call(this, t, e, n) }
        var o = t("./annotation-internal"),
            s = t("./marker-annotation-internal"),
            a = t("@maps/js-utils"),
            r = t("../localizer").l10n;
        n.prototype = a.inheritPrototype(s, n, { get memberAnnotations() { return this._memberAnnotations }, get n() { return this._memberAnnotations.length }, get title() { return this.hasOwnProperty("_title") ? this._title : this._topAnnotation.title }, set title(t) { Object.getOwnPropertyDescriptor(o.prototype, "title").set.call(this, t) }, get subtitle() { var t = this.n - 1; return this.hasOwnProperty("_subtitle") ? this._subtitle : r.get("Annotation.Clustering.More" + (t > 1 ? ".Plural" : ""), { n: r.digits(t) }) }, set subtitle(t) { Object.getOwnPropertyDescriptor(o.prototype, "subtitle").set.call(this, t) }, get glyphText() { return this.hasOwnProperty("_glyphText") ? this._glyphText : this.hasOwnProperty("_glyphImage") || this.hasOwnProperty("_selectedGlyphImage") ? "" : r.digits(this.n) }, set glyphText(t) { Object.getOwnPropertyDescriptor(s.prototype, "glyphText").set.call(this, t) }, get draggable() { return !1 }, get displayPriority() { return this._topAnnotation.displayPriority }, get clusteringIdentifier() { return this._topAnnotation.clusteringIdentifier }, get _topAnnotation() { return this._memberAnnotations[0] }, get _showDefaultAltText() { return this.hasOwnProperty("_glyphText") || this.hasOwnProperty("_glyphImage") || this.hasOwnProperty("_selectedGlyphImage") }, altText: function() { return this._showDefaultAltText ? o.prototype.altText.call(this) : this.title ? r.get("Annotation.Clustering.AccessibilityLabel", { n: this.glyphText, title: this.title, subtitle: this.subtitle }) : r.get("Annotation.Clustering.NoTitle.AccessibilityLabel", { n: this.glyphText, subtitle: this.subtitle }) } }), e.exports = n
    }, { "../localizer": 182, "./annotation-internal": 124, "./marker-annotation-internal": 142, "@maps/js-utils": 84 }],
    132: [function(t, e, i) {
        function n(t, e, i) { Object.defineProperty(this, "_impl", { value: new s(this, t, e, i) }) }
        var o = t("./marker-annotation"),
            s = t("./cluster-annotation-internal"),
            a = t("@maps/js-utils");
        n.prototype = a.inheritPrototype(o, n, { get memberAnnotations() { return this._impl.memberAnnotations } }), e.exports = n
    }, { "./cluster-annotation-internal": 131, "./marker-annotation": 146, "@maps/js-utils": 84 }],
    133: [function(t, e, i) {
        function n(t) { this._annotationsController = t, this._clusters = [], this._previousClusters = [], this._previousOverlaps = [], this._previousAnnotations = [], this._frameCounter = 0 }

        function o(t) {
            var e = [0, 0];
            t.forEach(function(t) { e[0] += t.coordinate.latitude, e[1] += t.coordinate.longitude });
            var i = t.length;
            return new f(e[0] / i, e[1] / i)
        }

        function s(t, e) {
            for (var i = 0, n = t.length; i < n; ++i) {
                var o = t[i],
                    s = e.length;
                if (o.memberAnnotations.length === s) { for (var a = 0; a < s && e[a] === o.memberAnnotations[a]; ++a); if (a === s) return i }
            }
            return -1
        }

        function a(t, e) {
            var i = g.DisplayPriority.Required,
                n = t.selected ? i : t.displayPriority;
            return (e.selected ? i : e.displayPriority) - n || e._impl.boundingBox.y2 - t._impl.boundingBox.y2
        }

        function r(t, e) { return e.displayPriority - t.displayPriority || t._impl.index - e._impl.index }

        function l(t, e) { return t._impl.boundingBox.x1 - e._impl.boundingBox.x1 }

        function h(t) {
            var e = t._impl.node,
                i = e.size,
                n = i.width,
                o = i.height,
                s = { x1: e.position.x, x2: e.position.x + n, y1: e.position.y, y2: e.position.y + o };
            return t.collisionMode === g.CollisionMode.Circle && (s.cx = (s.x1 + s.x2) / 2, s.cy = (s.y1 + s.y2) / 2, s.r = Math.min(n, o) / 2), s
        }

        function c(t, e) { var i = { x1: t.x1 - e, x2: t.x2 + e, y1: t.y1 - e, y2: t.y2 + e }; return t.hasOwnProperty("r") && (i.r = t.r + e, i.cx = t.cx, i.cy = t.cy), i }

        function u(t, e) {
            var i = t.cx - y.clamp(t.cx, e.x1, e.x2),
                n = t.cy - y.clamp(t.cy, e.y1, e.y2);
            return i * i + n * n <= t.r * t.r
        }

        function d(t, e, i) {
            var n = t._impl.boundingBox,
                o = e._impl.boundingBox;
            return i && (n = c(n, w), o = c(o, w)), p(n, o)
        }

        function p(t, e) {
            if (!(e.x2 >= t.x1 && e.x1 <= t.x2 && e.y2 >= t.y1 && e.y1 <= t.y2)) return !1;
            if (t.hasOwnProperty("r")) {
                if (e.hasOwnProperty("r")) {
                    var i = t.cx - e.cx,
                        n = t.cy - e.cy,
                        o = Math.sqrt(i * i + n * n);
                    return t.r + e.r >= o
                }
                return u(t, e)
            }
            return !e.hasOwnProperty("r") || u(e, t)
        }

        function m(t, e) { t._impl.occluded = e, t._impl.updateVisibility(e) }
        var g = t("./annotation"),
            _ = t("./cluster-annotation"),
            f = t("../../../lib/geo").Coordinate,
            y = t("@maps/js-utils"),
            v = t("@maps/scheduler"),
            w = 5;
        n.prototype = {
            collideAnnotations: function(t, e, i, n) { this._locked || (this._annotations = t, this._zoomLevel = e, this._rotation = i, this._changesSinceLastCollision = n, v.scheduleOnNextFrame(this)) },
            setRequiredClusterAnnotationProperties: function(t, e) { return t !== e && (t || (t = e), t.coordinate = e.coordinate, t.draggable = !1, t.displayPriority = e.memberAnnotations[0].displayPriority, t.clusteringIdentifier = e.memberAnnotations[0].clusteringIdentifier, t.selected = !1, Object.defineProperty(t, "memberAnnotations", { enumerable: !0, get: function() { return this._impl.memberAnnotations } }), Object.defineProperty(t._impl, "memberAnnotations", { enumerable: !0, value: e.memberAnnotations })), t.animates = e.memberAnnotations.some(function(t) { return !t._impl.wasCollided }), t },
            removedAnnotation: function(t) {
                t.memberAnnotations || (this._previousClusters = this._previousClusters.filter(function(e) {
                    if (e.memberAnnotations.indexOf(t) < 0) return !0;
                    this._annotationsController.removeItem(e)
                }, this))
            },
            performScheduledUpdate: function() {
                if (this._frameCounter = (this._frameCounter + 1) % 10, 1 === this._frameCounter) {
                    var t = this._needsUpdate();
                    if (t) {
                        this._changesSinceLastCollision = !1, this._previousZoomLevel = this._zoomLevel, this._previousRotation = this._rotation, this._previousAnnotations = this._annotations.slice(), this._locked = !0, this._annotationsController.willUpdateCollisions(), "region" === t && this._annotationsController.deselectClusterAnnotation(), this._overlaps = [];
                        for (var e = 0, i = 0, n = this._annotations.length; i < n; ++i) {
                            var o = this._annotations[i];
                            if (o._impl.needsLayout) return this._frameCounter = 0, this._locked = !1, void v.scheduleOnNextFrame(this);
                            o._impl.index = i, o._impl.occluded = !1, o._impl.previousCluster = o._impl.cluster, delete o._impl.cluster, o._impl.boundingBox = h(o), e = Math.max(e, o._impl.boundingBox.x2 - o._impl.boundingBox.x1)
                        }
                        var s = this._annotations.sort(l),
                            a = {};
                        s.forEach(function(t) {
                            if (!t.selected) {
                                var e = t.clusteringIdentifier;
                                e && (a[e] ? a[e].push(t) : a[e] = [t])
                            }
                        });
                        var r = this._clusters;
                        this._clusters = [];
                        for (var c in a) a[c].length > 1 && (e = this._clusterAnnotationsWithMaxWidth(a[c], e));
                        r.forEach(function(t) { this._clusters.indexOf(t) < 0 && (m(t, !0), t.selected && (t.selected = !1)) }, this), this._collideAnnotationsAndClusters(s, e), this._previousOverlaps = this._overlaps, this._annotationsController.didUpdateCollisions(), this._locked = !1
                    }
                }
                else v.scheduleOnNextFrame(this)
            },
            _clusterAnnotationsWithMaxWidth: function(t, e) {
                for (var i = 0; i < t.length;) {
                    var n = t[i];
                    if (n._impl.cluster) ++i;
                    else {
                        var o = n._impl.boundingBox.x2,
                            s = [n],
                            a = i + 1;
                        if (n.memberAnnotations && i > 0) { var l = n._impl.boundingBox.x1 - e; for (a = i - 1; a > 0 && t[a]._impl.boundingBox.x1 >= l; --a); }
                        for (; a < t.length && t[a]._impl.boundingBox.x1 <= o; ++a) { var c = t[a];!c._impl.cluster && a !== i && this._annotationsOverlapExcludingSelected(n, c) && s.push(c) }
                        if (s.length > 1) {
                            s = s.reduce(function(t, e) { return e.memberAnnotations ? (t = t.concat(e.memberAnnotations), e._impl.cluster = !0, m(e, !0)) : t.push(e), t }, []).sort(r);
                            var u = this._clusterAnnotationForMemberAnnotations(s);
                            for (u._impl.occluded = !1, u._impl.boundingBox = h(u), e = Math.max(e, u._impl.boundingBox.x2 - u._impl.boundingBox.x1), delete u._impl.cluster, a = 0; a < s.length; ++a) s[a]._impl.occluded = !0, s[a]._impl.cluster = u;
                            for (a = 0; a < t.length && t[a]._impl.boundingBox.x1 < u._impl.boundingBox.x1; ++a);
                            t.splice(a, 0, u), i = Math.min(i + 1, a)
                        }
                        else ++i
                    }
                }
                return t.forEach(function(t) { t.memberAnnotations && !t._impl.cluster && (this._clusters.push(t), t.map || this._annotationsController.addItem(t)) }, this), e
            },
            _collideAnnotationsAndClusters: function(t, e) {
                for (var i = !1, n = [], o = 0, s = 0, a = t.length, r = this._clusters.length; o < a || s < r;) {
                    var l = t[o],
                        h = this._clusters[s];
                    l ? l._impl.cluster ? ++o : h && h._impl.boundingBox.x1 < l._impl.boundingBox.x1 ? (h._impl.isRequired() || (i = !0), n.push(h), ++s) : (l._impl.isRequired() || (i = !0), n.push(l), ++o) : (h._impl.isRequired() || (i = !0), n.push(h), ++s)
                }
                i && this._collideAnnotationsWithMaxWidth(n, e)
            },
            _collideAnnotationsWithMaxWidth: function(t, e) {
                for (var i = [], n = 0, o = t.length; n < o; ++n)
                    for (var s = t[n], r = s._impl.boundingBox.x2, l = n + 1; l < o; ++l) {
                        var h = t[l];
                        if (h._impl.boundingBox.x1 > r) break;
                        s._impl.isRequired() && h._impl.isRequired() || this._annotationsOverlap(s, h) && i.push(a(s, h) <= 0 ? [s, h] : [h, s])
                    }
                i.sort(function(t, e) { return a(t[0], e[0]) }).forEach(function(t) { t[0]._impl.occluded || (t[1]._impl.occluded = !0) })
            },
            _annotationsOverlapExcludingSelected: function(t, e) { return !t.selected && !e.selected && this._annotationsOverlap(t, e) },
            _annotationsOverlap: function(t, e) {
                if (t._impl.isLifted() || e._impl.isLifted()) return !1;
                for (var i, n = r(t, e) <= 0 ? [t, e] : [e, t], o = 0, s = this._previousOverlaps.length; o < s && !i; ++o) {
                    var a = this._previousOverlaps[o];
                    a[0] === n[0] && a[1] === n[1] && (i = a)
                }
                var l = d(t, e, i);
                return l && this._overlaps.push(n), l
            },
            _clusterAnnotationForMemberAnnotations: function(t) {
                var e, i = s(this._previousClusters, t);
                if (i >= 0) e = this._previousClusters[i];
                else {
                    var n = o(t);
                    e = this._annotationsController.addCluster(new _(n, t)), this._previousClusters.push(e)
                }
                return e
            },
            _needsUpdate: function() {
                if (this._zoomLevel !== this._previousZoomLevel || this._rotation !== this._previousRotation) return "region";
                if (this._changesSinceLastCollision) return "annotations";
                var t = this._annotations.length;
                if (this._previousAnnotations.length !== t) return "annotations";
                for (var e = 0; e < t; ++e)
                    if (this._annotations[e] !== this._previousAnnotations[e]) return "annotations";
                return ""
            }
        }, e.exports = n
    }, { "../../../lib/geo": 2, "./annotation": 127, "./cluster-annotation": 132, "@maps/js-utils": 84, "@maps/scheduler": 106 }],
    134: [function(t, e, i) {
        function n(t, e, i) {
            if (this._sceneGraphNode = new s(this), o.call(this, t, e, o.div, i), !(i && "url" in i)) throw new Error("[MapKit] No URL for image of ImageAnnotation");
            this._waitingForImage = !this._userSetSize, this.url = i.url
        }
        var o = t("./annotation-internal"),
            s = t("./image-annotation-node"),
            a = t("./pin-annotation-internal"),
            r = t("../urls"),
            l = t("../utils"),
            h = t("@maps/js-utils"),
            c = t("@maps/geometry/size"),
            u = t("@maps/geometry/point"),
            d = t("@maps/css-matrix"),
            p = Math.min(l.devicePixelRatio, 3),
            m = r.createImageUrl("pins/pin-red") + (p > 1 ? "_" + p + "x" : "") + ".png",
            g = new c(32, 39);
        n.prototype = h.inheritPrototype(o, n, {
            get url() { return this._url },
            set url(t) {
                if (this._ratio = n.bestRatio(t), !this._ratio) throw new Error("[MapKit] No URL for image of ImageAnnotation");
                this._url = t;
                var e = this._sceneGraphNode.image = l.htmlElement("img", { src: this._url[this._ratio] });
                e.complete ? this.updateSize() : (this._userSetSize || (this._waitingForImage = !0), e.addEventListener("load", this), e.addEventListener("error", this))
            },
            handleEvent: function(t) {
                switch (t.type) {
                    case "load":
                        this._handleImageLoaded();
                        break;
                    case "error":
                        this._handleImageError();
                        break;
                    default:
                        return void o.prototype.handleEvent.call(this, t)
                }
                this._sceneGraphNode.image.removeEventListener("load", this), this._sceneGraphNode.image.removeEventListener("error", this)
            },
            resetNodeTransform: function() { this.sceneGraphNode.transform = new d },
            updateLocalizedText: function() { this._element.setAttribute("aria-label", this.altText()) },
            updateSize: function() {
                if (delete this._waitingForImage, !this._useFallbackImage) {
                    var t;
                    if (this._userSetSize) t = this._node.size;
                    else {
                        var e = this._sceneGraphNode.image;
                        t = new c(e.naturalWidth / this._ratio, e.naturalHeight / this._ratio), this.setSize(t)
                    }
                    this._useFallbackImage || this._setElementSize(t), o.prototype.updateSize.call(this)
                }
            },
            isAKnownOption: function(t) { return "url" === t || o.prototype.isAKnownOption.call(this, t) },
            willMoveToMap: function() { this._isMoving = this.doesAnimate() },
            canShowCallout: function() { return !this._waitingForImage && o.prototype.canShowCallout.call(this) },
            _handleImageLoaded: function() { this._useFallbackImage && (delete this.updatePosition, delete this._useFallbackImage, delete this.positionForCallout), this.updateSize() },
            _handleImageError: function() { console.error("[MapKit] Could not load image for ImageAnnotation at URL " + this._sceneGraphNode.image.src), this._useFallbackImage = !0, this.updatePosition = function() { this._node.position = new u(this._position.x - a.prototype._anchorPoint.x, this._position.y - a.prototype._anchorPoint.y) }, this.updatePosition(), this.positionForCallout = function() { return new u(this._node.position.x - a.prototype._calloutAnchorPoint.x, this._node.position.y - a.prototype._calloutAnchorPoint.y) }, this._sceneGraphNode.image = l.htmlElement("img", { src: m }), this._setElementSize(g) },
            _setElementSize: function(t) { this._element.style.width = t.width + "px", this._element.style.height = t.height + "px", this._sceneGraphNode.size = t }
        }), n.bestRatio = function(t) { if (t && "object" == typeof t) { for (var e, i = Object.keys(t).filter(function(e) { return !!t[e] }).map(parseFloat).filter(function(t) { return !isNaN(t) }).sort(), n = l.devicePixelRatio, o = i.length - 1; o >= 0 && ((!e || i[o] >= n) && (e = i[o]), !(i[o] <= n)); --o); return e } }, e.exports = n
    }, { "../urls": 222, "../utils": 225, "./annotation-internal": 124, "./image-annotation-node": 135, "./pin-annotation-internal": 148, "@maps/css-matrix": 58, "@maps/geometry/point": 69, "@maps/geometry/size": 71, "@maps/js-utils": 84 }],
    135: [function(t, e, i) {
        function n(t) { o.ImageNode.call(this), this._annotation = t }
        var o = t("../../../lib/scene-graph"),
            s = t("@maps/js-utils");
        n.prototype = s.inheritPrototype(o.ImageNode, n, { get position() { return this._annotation.node.position } }), e.exports = n
    }, { "../../../lib/scene-graph": 47, "@maps/js-utils": 84 }],
    136: [function(t, e, i) {
        function n(t, e) { Object.defineProperty(this, "_impl", { value: new s(this, t, e) }) }
        var o = t("./annotation"),
            s = t("./image-annotation-internal"),
            a = t("@maps/js-utils");
        n.prototype = a.inheritPrototype(o, n, { get url() { return this._impl._url }, set url(t) { this._impl.url = t } }), e.exports = n
    }, { "./annotation": 127, "./image-annotation-internal": 134, "@maps/js-utils": 84 }],
    137: [function(t, e, i) {
        function n(t, e) { o.BaseNode.call(this), this._renderer = new a(this), this.annotation = t, e && (this._state = e) }
        var o = t("../../../lib/scene-graph"),
            s = t("@maps/js-utils"),
            a = t("./marker-annotation-balloon-renderer");
        n.prototype = s.inheritPrototype(o.BaseNode, n, {
            stringInfo: function() {
                var t = this._renderer,
                    e = this.hasOwnProperty("_state") ? "<" + this.state + ">" : "",
                    i = t.hasOwnProperty("glyphFontSize") ? ' "' + this.annotation.glyphText + '"@' + t.glyphFontSize : "",
                    n = t.glyphImageSrc ? " 🖼 " + t.glyphImageSrc : "";
                return "MarkerAnnotationBalloonNode" + e + ("<color: " + this.annotation.color + ">") + i + n
            },
            get state() { return this.hasOwnProperty("_state") ? this._state : this.parent.state },
            get params() { return this.parent.params[this.state] },
            glyphImageError: function(t) { "selected" === t && this.selectedGlyphImage ? delete this.selectedGlyphImage : delete this.glyphImage, this.needsDisplay = !0 }
        }), e.exports = n
    }, { "../../../lib/scene-graph": 47, "./marker-annotation-balloon-renderer": 138, "@maps/js-utils": 84 }],
    138: [function(t, e, i) {
        function n(t) { c.RenderItem.call(this, t) }

        function o(t, e, i, n) {
            null == n && (n = e.glyphText), t.save(), t.textAlign = "center", t.textBaseline = "bottom", t.fillStyle = e.glyphColor;
            var o, s = i.glyphFontSize;
            do { t.font = s-- + "px " + h.MarkerAnnotationFontFamily, o = t.measureText(n).width } while (o > i.glyphImageSize && s > 0);
            var a = s + i.balloonRadius - s / 2 + 1;
            return t.fillText(n, i.balloonRadius, a, i.glyphImageSize), t.restore(), s + 1
        }

        function s(t, e, i, n) {
            var s, r = n.glyphImageSize,
                h = g.roundToDevicePixel((e.size.width - r) / 2),
                c = !1;
            if (!(s = "default" === i || "lifted" === i ? e.glyphImage : e.selectedGlyphImage || e.glyphImage)) {
                if (b) return o(t, e.annotation, n, b), null;
                s = l[e.bubble ? "bubble" : i], c = !0
            }
            try { return t.drawImage(a(s, e.annotation.glyphColor, r), h, h, r, r), c ? null : s.src }
            catch (t) { e.glyphImageError() }
        }

        function a(t, e, i) {
            t._tinted || (t._tinted = {}), t._tinted[e] || (t._tinted[e] = []);
            var n = i * g();
            if (!t._tinted[e][n]) {
                var o = document.createElement("canvas");
                o.width = n, o.height = n;
                var s = o.getContext("2d");
                s.fillStyle = e, s.fillRect(0, 0, n, n), s.globalCompositeOperation = "destination-in", s.drawImage(t, 0, 0, n, n), t._tinted[e][n] = o
            }
            return t._tinted[e][n]
        }

        function r(t, e, i) {
            var n = i / 6,
                o = i / 3,
                s = 2 * e,
                a = .448 * e,
                r = .385 * e;
            t.moveTo(s, e), t.bezierCurveTo(s, 1.5 * e, s - r, s - i / 3, e + i / 2 + o, s), t.bezierCurveTo(e + i / 3, s + i / 3, e + n, s + i, e, s + i), t.bezierCurveTo(e - n, s + i, e - i / 3, s + i / 3, e - (i / 2 + o), s), t.bezierCurveTo(r, s - i / 3, 0, 1.5 * e, 0, e), t.bezierCurveTo(0, a, a, 0, e, 0), t.bezierCurveTo(s - a, 0, s, a, s, e), t.closePath()
        }
        var l, h = t("../constants"),
            c = t("../../../lib/scene-graph"),
            u = t("@maps/js-utils"),
            d = t("@maps/loaders"),
            p = t("../utils"),
            m = t("../urls"),
            g = t("@maps/device-pixel-ratio"),
            _ = Math.min(p.devicePixelRatio, 3),
            f = m.createImageUrl("pins/marker"),
            y = (_ > 1 ? "_" + _ + "x" : "") + ".png",
            v = ["default", "selected", "bubble"],
            w = [],
            b = "…";
        n.prototype = u.inheritPrototype(c.RenderItem, n, {
                draw: function(t) {
                    l || w.indexOf(this._node) < 0 && w.push(this._node);
                    var e = this._node,
                        i = e.state,
                        n = e.annotation,
                        a = e.params;
                    delete this.glyphImageSrc, delete this.renderType, t.save(), t.fillStyle = n.color, e.bubble || (t.shadowOffsetY = a.shadowOffsetY, t.shadowBlur = a.shadowBlur, t.shadowColor = a.shadowColor), t.beginPath(), "callout" === i ? t.arc(a.radius, a.radius, a.radius, 0, 2 * Math.PI) : e.bubble ? t.arc(a.balloonRadius, a.balloonRadius, a.balloonRadius, 0, 2 * Math.PI) : r(t, a.balloonRadius, a.tailLength), t.fill(), t.restore(), "callout" !== i && (delete this.glyphFontSize, delete this.glyphImageSrc, n.glyphText ? (this.glyphFontSize = o(t, n, a), this.renderType = "glyphText") : (this.glyphImageSrc = s(t, e, i, a), this.renderType = this.glyphImageSrc ? "glyphImage" : "default"))
                }
            }),
            function() {
                function t() { 0 === --n && ((l = i).lifted = l.default, b = "", w.forEach(function(t) { t.needsDisplay = !0 })) }

                function e(e) { new d.ImageLoader(d.Priority.Highest, { urlForImageLoader: f + (e ? "-" : "") + e + y, loaderDidSucceed: function(n) { i[e] = n.image, t() }, loaderDidFail: function(e) { console.warn("[MapKit] Error loading marker annotation image " + e.url + "; marker annotations may not display correctly."), b = "?", t() } }).schedule() }
                var i = {},
                    n = v.length;
                v.forEach(function(t) { i[t] = {}, e(t) })
            }(), e.exports = n
    }, { "../../../lib/scene-graph": 47, "../constants": 161, "../urls": 222, "../utils": 225, "@maps/device-pixel-ratio": 61, "@maps/js-utils": 84, "@maps/loaders": 85 }],
    139: [function(t, e, i) {
        function n(t, e) {
            this._renderer = new s(this), this.frozen = !0, this.annotation = t, this.state = "default", this.params = e, this.bubble = !0;
            var i = 2 * e.balloonRadius;
            this.size = new o.Size(i, i), this.layerBounds = new o.Rect(0, 0, this.size.width, this.size.height)
        }
        var o = t("@maps/geometry"),
            s = t("./marker-annotation-balloon-renderer");
        n.prototype.glyphImageError = function(t) { delete this.glyphImage }, e.exports = n
    }, { "./marker-annotation-balloon-renderer": 138, "@maps/geometry": 68 }],
    140: [function(t, e, i) {
        function n(t, e) { o.BaseNode.call(this), this.annotation = t, this.radius = e, this._renderer = new a(this) }
        var o = t("../../../lib/scene-graph"),
            s = t("@maps/js-utils"),
            a = t("./marker-annotation-dot-renderer");
        n.prototype = s.inheritPrototype(o.BaseNode, n, { stringInfo: function() { return "MarkerAnnotationDotNode<color: " + this.annotation.color + ">" } }), e.exports = n
    }, { "../../../lib/scene-graph": 47, "./marker-annotation-dot-renderer": 141, "@maps/js-utils": 84 }],
    141: [function(t, e, i) {
        function n(t) { o.RenderItem.call(this, t) }
        var o = t("../../../lib/scene-graph"),
            s = t("@maps/js-utils");
        n.prototype = s.inheritPrototype(o.RenderItem, n, {
            draw: function(t) {
                var e = this._node,
                    i = e.size.width,
                    n = e.size.height;
                t.save(), t.fillStyle = e.annotation.color, t.beginPath(), t.arc(i / 2, n / 2, e.radius, 0, 2 * Math.PI), t.fill(), t.restore()
            }
        }), e.exports = n
    }, { "../../../lib/scene-graph": 47, "@maps/js-utils": 84 }],
    142: [function(t, e, i) {
        function n(t, e, i) { this._sceneGraphNode = new r(this), s.call(this, t, e, s.div, i), this._public = t, i && g.forEach(function(t) { t in i && (this[t] = i[t]) }, this), this._sceneGraphNode.updateState() }

        function o(t, e, i, n) { new u.ImageLoader(u.Priority.Highest, { urlForImageLoader: e, loaderDidSucceed: function(e) { t[i] = e.image, t._sceneGraphNode[n](e.image) }, loaderDidFail: function() { delete t[i], t._sceneGraphNode[n]() } }).schedule() }
        var s = t("./annotation-internal"),
            a = t("./image-annotation-internal"),
            r = t("./marker-annotation-node"),
            l = t("./marker-annotation-callout-bubble-node"),
            h = t("@maps/css-matrix"),
            c = t("@maps/js-utils"),
            u = t("@maps/loaders"),
            d = t("../localizer").l10n,
            p = t("@maps/geometry/point"),
            m = t("@maps/device-pixel-ratio"),
            g = ["color", "glyphColor", "glyphImage", "selectedGlyphImage", "glyphText", "titleVisibility", "subtitleVisibility"];
        n.prototype = c.inheritPrototype(s, n, {
            _animates: !0,
            _calloutAnchorPoint: new window.DOMPoint(-r.prototype.params.callout.radius, 1),
            _color: "#ff5b40",
            _glyphColor: "white",
            _glyphImage: null,
            _selectedGlyphImage: null,
            _glyphText: "",
            _titleVisibility: r.FeatureVisibility.Adaptive,
            _subtitleVisibility: r.FeatureVisibility.Adaptive,
            shouldHideLabels: !0,
            darkColorScheme: !1,
            get size() { return this._sceneGraphNode.size.copy() },
            set size(t) { console.warn("[MapKit] The `size` property of a pin annotation cannot be set.") },
            get color() { return this._color },
            set color(t) { c.checkType(t, "string", "[MapKit] Expected a string value for MarkerAnnotation.color, but got `" + t + "` instead"), t !== this._color && (this._color = t, this._sceneGraphNode.needsDisplay = !0, this._drawCalloutAccessory()) },
            get glyphColor() { return this._glyphColor },
            set glyphColor(t) { c.checkType(t, "string", "[MapKit] Expected a string value for MarkerAnnotation.glyphColor, but got `" + t + "` instead"), t !== this._glyphColor && (this._glyphColor = t, this._sceneGraphNode.needsDisplay = !0, this._drawCalloutAccessory()) },
            get glyphImage() { return this._glyphImage },
            set glyphImage(t) { this._setGlyphImage("_glyphImage", "updateGlyphImage", t) },
            get selectedGlyphImage() { return this._selectedGlyphImage },
            set selectedGlyphImage(t) { this._setGlyphImage("_selectedGlyphImage", "updateSelectedGlyphImage", t) },
            updateGlyphImages: function() { this._setGlyphImage("_glyphImage", "updateGlyphImage", this._glyphImage), this._setGlyphImage("_selectedGlyphImage", "updateSelectedGlyphImage", this._selectedGlyphImage) },
            get glyphText() { return this._glyphText },
            set glyphText(t) { c.checkType(t, "string", "[MapKit] Expected a string value for MarkerAnnotation.glyphText, but got `" + t + "` instead"), t !== this._glyphText && (this._glyphText = t, this.updateLocalizedText(), this._sceneGraphNode.needsDisplay = !0, this._drawCalloutAccessory()) },
            get titleVisibility() { return this._titleVisibility },
            set titleVisibility(t) {
                if (!c.checkValueIsInEnum(t, r.FeatureVisibility)) throw new Error("[MapKit] Expected one of Hidden, Visible or Adaptive for MarkerAnnotation.titleVisibility");
                t !== this._titleVisibility && (this._titleVisibility = t, this._sceneGraphNode.needsLayout = !0)
            },
            get subtitleVisibility() { return this._subtitleVisibility },
            set subtitleVisibility(t) {
                if (!c.checkValueIsInEnum(t, r.FeatureVisibility)) throw new Error("[MapKit] Expected one of Hidden, Visible or Adaptive for MarkerAnnotation.subtitleVisibility");
                t !== this._subtitleVisibility && (this._subtitleVisibility = t, this._sceneGraphNode.needsLayout = !0)
            },
            labelsCanBeShown: function() { return this.delegate && this.delegate.supportsLabelRegions() },
            titleCanBeShown: function() { return this.title && this._titleVisibility !== r.FeatureVisibility.Hidden },
            subtitleCanBeShown: function(t) { return this.subtitle && (this._subtitleVisibility === r.FeatureVisibility.Visible || this._subtitleVisibility === r.FeatureVisibility.Adaptive && (this._public.memberAnnotations || this.selected && t)) },
            updateLayout: function(t) { t ? this._sceneGraphNode.updateLayout() : this._sceneGraphNode.needsLayout = !0 },
            updatedLayout: function() { this._updatedProperty("") },
            updatePosition: function() { this._node.position = new p(m.roundToDevicePixel(this._position.x - this._anchorPoint.x - this._anchorOffset.x), this._position.y - this._anchorPoint.y - this._anchorOffset.y) },
            setDelegate: function(t) { s.prototype.setDelegate.call(this, t), this.labelsCanBeShown() && this._updatedProperty("title") },
            doesAnimate: function() { return this._animates },
            willMoveToMap: function(t) { this._isMoving = t && this.animates },
            didMoveToMap: function() {
                var t = this._isMoving;
                s.prototype.didMoveToMap.call(this), this.delegate && t && this.visible && !this._appearanceAnimation && this._shown && (this._isAnimating = !0, this._sceneGraphNode.animateAppearance(function(t) { t.node.annotation.finishedAnimating() }))
            },
            lift: function(t) { this._sceneGraphNode.updateState("lifted"), s.prototype.lift.call(this, t) },
            droppedAfterLift: function() { this._sceneGraphNode.updateState(), s.prototype.droppedAfterLift.call(this) },
            canShowCallout: function() { return (!!this.callout || this.delegate && !this.delegate.supportsLabelRegions()) && s.prototype.canShowCallout.call(this) },
            calloutWillAppear: function() { this._sceneGraphNode.updateState("callout") },
            calloutWillDisappear: function() { delete this._calloutAccessoryNode, this._sceneGraphNode.updateState() },
            canvasForCalloutAccessory: function() {
                if (!this.callout || !(this.callout.calloutElementForAnnotation || this.callout.calloutContentForAnnotation || this.callout.calloutLeftAccessoryForAnnotation || this.callout.calloutRightAccessoryForAnnotation)) return this._calloutAccessoryNode ? this._calloutAccessoryNode._renderer.layer : (this._calloutAccessoryNode = new l(this, r.prototype.params.bubble), this._calloutAccessoryNode.glyphImage = this._sceneGraphNode._balloon.glyphImage, this._calloutAccessoryNode.glyphText = this._glyphText, this._drawCalloutAccessory(), this._calloutAccessoryNode._renderer.layer);
                delete this._calloutAccessoryNode
            },
            get ignoreCalloutCornerRadiusForLeftAccessory() { return !0 },
            altText: function() { return s.prototype.altText.call(this) || d.get("Annotation.Marker.AccessibilityLabel") },
            isAKnownOption: function(t) { return g.indexOf(t) >= 0 || s.prototype.isAKnownOption.call(this, t) },
            resetNodeTransform: function() { this.sceneGraphNode.transform = new h },
            _setGlyphImage: function(t, e, i) {
                null != i && c.checkType(i, "object", "[MapKit] Expected a hash value for MarkerAnnotation." + t.replace(/^_/, "") + ", but got `" + i + "` instead"), this[t] = i;
                var n = t + "Element";
                if (!i) return delete this[n], void this._sceneGraphNode[e](null);
                var s = a.bestRatio(i);
                s ? o(this, i[s], n, e) : (delete this[n], this._sceneGraphNode.glyphImageError())
            },
            _updatedProperty: function(t) { "selected" === t ? this._sceneGraphNode.updateState() : "title" !== t && "subtitle" !== t || (this._sceneGraphNode.needsLayout = !0), s.prototype._updatedProperty.call(this, t) },
            _drawCalloutAccessory: function() {
                if (this._calloutAccessoryNode) {
                    var t = this._calloutAccessoryNode._renderer.layer;
                    t.style.width = t.style.height = this._calloutAccessoryNode.size.width + "px", this._calloutAccessoryNode._renderer.draw(t.getContext("2d"))
                }
            }
        }), e.exports = n
    }, { "../localizer": 182, "./annotation-internal": 124, "./image-annotation-internal": 134, "./marker-annotation-callout-bubble-node": 139, "./marker-annotation-node": 145, "@maps/css-matrix": 58, "@maps/device-pixel-ratio": 61, "@maps/geometry/point": 69, "@maps/js-utils": 84, "@maps/loaders": 85 }],
    143: [function(t, e, i) {
        function n(t, e, i) { o.BaseNode.call(this), this.text = t, this.kind = e, this._renderer = new a(this), this.size = new r(i, this._renderer.params[this.kind].height), this.frozen = !0 }
        var o = t("../../../lib/scene-graph"),
            s = t("@maps/js-utils"),
            a = t("./marker-annotation-label-renderer"),
            r = t("@maps/geometry/size");
        n.prototype = s.inheritPrototype(o.BaseNode, n, { stringInfo: function() { return "MarkerAnnotationLabelNode<" + this.kind + (this.parent.annotation.darkColorScheme ? ", dark" : "") + '> "' + this.text + '"' }, get lineHeight() { return this._renderer.params[this.kind].lineHeight } }), n.Font = { title: a.prototype.params.title.font, subtitle: a.prototype.params.subtitle.font }, e.exports = n
    }, { "../../../lib/scene-graph": 47, "./marker-annotation-label-renderer": 144, "@maps/geometry/size": 71, "@maps/js-utils": 84 }],
    144: [function(t, e, i) {
        function n(t) { s.RenderItem.call(this, t) }
        var o = t("../constants"),
            s = t("../../../lib/scene-graph"),
            a = t("@maps/js-utils");
        n.prototype = a.inheritPrototype(s.RenderItem, n, {
            params: { haloColor: { light: "rgba(255, 255, 255, .8)", dark: "black" }, haloSize: 2, miterLimit: 2, textAlign: "center", title: { font: "600 11px " + o.MarkerAnnotationFontFamily, height: 16, lineHeight: 12, color: { light: "#2b2b2b", dark: "white" }, yPadding: 1 }, subtitle: { font: "500 10px " + o.MarkerAnnotationFontFamily, height: 15, lineHeight: 12, color: { light: "#4c4c4c", dark: "white" }, yPadding: 1 } },
            draw: function(t) {
                var e = this._node,
                    i = e.parent.annotation.darkColorScheme ? "dark" : "light",
                    n = this.params[e.kind];
                t.font = n.font, t.textAlign = this.params.textAlign, t.textBaseline = "bottom", t.fillStyle = n.color[i], t.strokeStyle = this.params.haloColor[i], t.lineWidth = this.params.haloSize, t.miterLimit = this.params.miterLimit;
                var o = e.size.width / 2,
                    s = e.size.height - n.yPadding;
                t.strokeText(e.text, o, s), t.fillText(e.text, o, s)
            }
        }), e.exports = n
    }, { "../../../lib/scene-graph": 47, "../constants": 161, "@maps/js-utils": 84 }],
    145: [function(t, e, i) {
        function n(t) { h.GroupNode.call(this), this.annotation = t, this._balloon = this.addChild(new b(t)) }

        function o(t, e, i) {
            L.font = e;
            for (var n = t.trim().split(/\s+/), o = []; n.length > 0;) {
                for (var s = [n.shift()], a = L.measureText(s.join(" ")).width, r = 0; n.length > 0 && a < i;) s.push(n.shift()), r = a, a = L.measureText(s.join(" ")).width;
                a > i && s.length > 1 && (n.unshift(s.pop()), a = r), o.push([s.join(" "), a])
            }
            return o
        }

        function s(t, e) { var i = Object.create(t); for (var n in e) i[n] = e[n]; return i }

        function a(t, e) { new h.NodeAnimator.Opacity({ node: t, duration: e.transitionDuration }).begin() }

        function r(t, e, i) { t.fadingOut = !0, new h.NodeAnimator.Opacity({ node: t, duration: e.transitionDuration, from: 1, to: 0, done: function() { delete t.fadingOut, t.remove() } }).begin() }

        function l(t, e, i, n, o, s) { new h.NodeAnimator.Scale({ node: t, duration: e.transitionDuration, from: i, to: n, center: new d(t.size.width / 2, t.size.height), done: s, mass: o, stiffness: e.springStiffness, damping: e.springDamping, initialVelocity: e.initialSpringVelocity }).begin() }
        var h = t("../../../lib/scene-graph"),
            c = t("@maps/js-utils"),
            u = t("@maps/scheduler"),
            d = t("@maps/geometry/point"),
            p = t("@maps/device-pixel-ratio"),
            m = t("@maps/geometry/size"),
            g = t("@maps/css-matrix"),
            _ = t("../constants").FeatureVisibility,
            f = { labelWidth: 64, shadowBlur: 3, shadowColor: "rgba(0, 0, 0, 0.15)", shadowOffsetY: 1.5, transitionDuration: 300, dotAnimationDuration: 100, dotScale: 1.5, springMass: 1, springStiffness: 100, springDamping: 10, initialSpringVelocity: 0 },
            y = s(f, { balloonRadius: 13.5, dotRadius: 0, glyphFontSize: 15, glyphImageSize: 20, offset: 0, tailLength: 5 }),
            v = s(f, { balloonRadius: 30, dotRadius: 3, glyphFontSize: 32, glyphImageSize: 40, offset: 8, tailLength: 6 }),
            w = s(f, { balloonRadius: 20, dotRadius: 3, glyphFontSize: 28, glyphImageSize: 30, offset: 0, tailLength: 0 }),
            b = t("./marker-annotation-balloon-node"),
            C = t("./marker-annotation-dot-node"),
            S = t("./marker-annotation-label-node");
        n.prototype = c.inheritPrototype(h.BaseNode, n, {
            params: { default: y, lifted: y, selected: v, bubble: w, callout: s(f, { radius: 4.5, shadowOffsetY: 0, shadowBlur: 0, shadowColor: "transparent" }) },
            get position() { return this.annotation ? this.annotation.node.position : new d },
            stringInfo: function() { return "MarkerAnnotationNode" + ("default" !== this.state ? "<" + this.state + ">" : "") },
            set needsLayout(t) { t && !this._needsLayout && u.scheduleASAP(this), this._needsLayout = t },
            get needsLayout() { return this._needsLayout },
            balloonNodeSize: function(t) { t || (t = this.state); var e = this.params[t]; if ("callout" === t) return new m(2 * e.radius, 2 * e.radius); var i = 2 * e.balloonRadius; return new m(i, i + e.tailLength + e.offset) },
            updateState: function(t) {
                var e = this.annotation;
                t = t || (e.selected && !e.callout ? "selected" : "default"), this.state !== t && ((e.selected || "selected" === this.state || "callout" === this.state) && (this._animateFromState = this._animateFromState || this.state), this.state = t, e._node.size = this._size = this._balloon.size = this.balloonNodeSize(), this.needsLayout = !0)
            },
            performScheduledUpdate: function() { this.updateLayout(!1) },
            updateLayout: function(t) { this._needsLayout && (this._layoutSubNodes(t), this._needsLayout = !1) },
            updateGlyphImage: function(t) { this._balloon.glyphImage = t, this._balloon.needsDisplay = !0 },
            updateSelectedGlyphImage: function(t) { this._balloon.selectedGlyphImage = t, this._balloon.needsDisplay = !0 },
            glyphImageError: function() { this._balloon.glyphImageError(this.state) },
            animateAppearance: function(t) {
                var e = this.params[this.state];
                this.children.forEach(function(t) { a(t, e) }), l(this._balloon, e, 1e-12, 1, e.springMass, t)
            },
            _layoutSubNodes: function(t) {
                function e(t, e) { n.forEach(function(e) { e.kind === t && (this.addChild(e), r(e, _, this.annotation)) }, this), delete this[e] }

                function i(t, e) {
                    var i = S.Font[t],
                        n = _.labelWidth,
                        s = c[t],
                        r = !(!this.parent || s === e || s && e);
                    return o(s, i, n).forEach(function(e) {
                        var i = new S(e[0], t, e[1]);
                        h = Math.max(h, e[1]), L = i.lineHeight / 2, this.addChild(i), r && a(i, _)
                    }, this), s
                }
                if (this.annotation) {
                    var n = this.children.slice();
                    this.children = [this._balloon], this._dot && this.addChild(this._dot);
                    var h = this._balloon.size.width,
                        c = this.annotation,
                        u = this.state,
                        _ = this.params[this.state],
                        f = "callout" !== u && "lifted" !== u && !("default" === u && c.selected) && c.labelsCanBeShown(),
                        y = f && c.titleCanBeShown();
                    y ? this._prevTitle = i.call(this, "title", this._prevTitle) : e.call(this, "title", "_prevTitle"), f && c.subtitleCanBeShown(y) ? this._prevSubtitle = i.call(this, "subtitle", this._prevSubtitle) : e.call(this, "subtitle", "_prevSubtitle");
                    var v = this._balloon.size.height,
                        w = v,
                        L = 0;
                    this.children.forEach(function(t) { t.position = new d((h - t.size.width) / 2, t.lineHeight ? w : 0), t.lineHeight && (w += t.lineHeight, t.fadingOut || (v += t.lineHeight, L = t.lineHeight / 2)) }), c._anchorPoint = new d(h / 2, this._balloon.size.height), c._node.size = this.size = new m(h, v + L), c.updatePosition();
                    var T = c._position.x - c._anchorPoint.x - c._anchorOffset.x,
                        E = this.position.x;
                    if (this.children.forEach(function(t) { t.position = new d(p.roundToDevicePixel(T + t.position.x) - E, t.position.y) }), "selected" === u ? (this._dot || (this._dot = this.addChild(new C(this.annotation, _.dotRadius * _.dotScale))), this._dot.size = new m(2 * _.dotRadius * _.dotScale, 2 * _.dotRadius * _.dotScale), this._dot.position = new d(this._balloon.position.x + _.balloonRadius - _.dotRadius, this._balloon.size.height - 2 * _.dotRadius), this._dot.transform = (new g).scale(1 / _.dotScale), this._dot.wantsLayerBacking = !0) : this._dot && (this._dot.remove(), delete this._dot), this.hasOwnProperty("_animateFromState")) {
                        if ("callout" === u || "callout" === this._animateFromState) {
                            var x = s(_);
                            x.transitionDuration /= 2;
                            var M = this.addChild(new b(this.annotation, this._animateFromState));
                            M.glyphImage = this._balloon.glyphImage, M.selectedGlyphImage = this._balloon.selectedGlyphImage, M.size = this.balloonNodeSize(M.state), M.position = new d((this.size.width - M.size.width) / 2, this._balloon.size.height - M.size.height), this._balloon.transform = (new g).scale(1e-12), l(M, x, 1, 1e-12, 0, function() { M.remove(), l(this._balloon, _, 1e-12, 1, _.springMass) }.bind(this))
                        }
                        else {
                            var A = this.balloonNodeSize(this._animateFromState).height / this.balloonNodeSize().height;
                            1 !== A && l(this._balloon, _, A, 1, _.springMass);
                            var k = this._dot;
                            k && a(k, { transitionDuration: _.dotAnimationDuration })
                        }
                        delete this._animateFromState
                    }
                    t || c.updatedLayout()
                }
            }
        }), n.FeatureVisibility = _;
        var L = document.createElement("canvas").getContext("2d");
        e.exports = n
    }, { "../../../lib/scene-graph": 47, "../constants": 161, "./marker-annotation-balloon-node": 137, "./marker-annotation-dot-node": 140, "./marker-annotation-label-node": 143, "@maps/css-matrix": 58, "@maps/device-pixel-ratio": 61, "@maps/geometry/point": 69, "@maps/geometry/size": 71, "@maps/js-utils": 84, "@maps/scheduler": 106 }],
    146: [function(t, e, i) {
        function n(t, e) { Object.defineProperty(this, "_impl", { value: new s(this, t, e) }) }
        var o = t("./annotation"),
            s = t("./marker-annotation-internal"),
            a = t("@maps/js-utils");
        n.prototype = a.inheritPrototype(o, n, { get size() { return this._impl.size }, set size(t) { this._impl.size = t }, get color() { return this._impl.color }, set color(t) { this._impl.color = t }, get glyphColor() { return this._impl.glyphColor }, set glyphColor(t) { this._impl.glyphColor = t }, get glyphImage() { return this._impl.glyphImage }, set glyphImage(t) { this._impl.glyphImage = t }, get selectedGlyphImage() { return this._impl.selectedGlyphImage }, set selectedGlyphImage(t) { this._impl.selectedGlyphImage = t }, get glyphText() { return this._impl.glyphText }, set glyphText(t) { this._impl.glyphText = t }, get titleVisibility() { return this._impl.titleVisibility }, set titleVisibility(t) { this._impl.titleVisibility = t }, get subtitleVisibility() { return this._impl.subtitleVisibility }, set subtitleVisibility(t) { this._impl.subtitleVisibility = t } }), e.exports = n
    }, { "./annotation": 127, "./marker-annotation-internal": 142, "@maps/js-utils": 84 }],
    147: [function(t, e, i) {
        function n(t) { o.call(this, t) }
        var o = t("./annotation-drag-controller"),
            s = t("@maps/css-matrix"),
            a = t("@maps/scheduler"),
            r = t("@maps/js-utils"),
            l = [1, 2, 3, 2, 1],
            h = Math.tan(.820304748437335);
        n.prototype = r.inheritPrototype(o, n, {
            get isBouncing() { return this._bounceAnimationFrameIndex >= 0 },
            animateDropAfterLift: function() {
                var t = Math.max(this._dropAnimationStartP - Math.min((Date.now() - this._dropAfterLiftAnimationStartDate) / this.liftDurationMs, 1), 0),
                    e = this.liftAmount * t;
                this._annotation.sceneGraphNode.transform = (new s).translate(0, -e), this._dropAnimationRevert || (e *= 1.25), this._annotation.sceneGraphNode.shadowTransform = (new s).translate(h * e, -e), 0 === t && (delete this._annotation.floating, this._annotation.sceneGraphNode.updateState(), delete this._dropAfterLiftAnimationStartDate, delete this._dropAnimationStartP, delete this._dropAnimationRevert, this._dequeueNextAnimation()), a.scheduleOnNextFrame(this)
            },
            animateLift: function() {
                var t = Math.min((Date.now() - this._liftAnimationStartDate) / this.liftDurationMs, 1),
                    e = this.liftAmount * t;
                this._annotation.sceneGraphNode.transform = (new s).translate(this.translation.x, this.translation.y - e), this._shadowLiftDamping && (e = this.liftAmount * (1 + .25 * t)), this._annotation.sceneGraphNode.shadowTransform = (new s).translate(h * e, -e), t < 1 ? (a.scheduleOnNextFrame(this), this._liftAnimationProgress = t) : (delete this._liftAnimationStartDate, delete this._liftAnimationProgress, delete this._shadowLiftDamping, this._dequeueNextAnimation())
            },
            drop: function() {
                var t = this._annotation.position().y;
                this._pinVerticalTranslation = -t - 4, this._shadowHorizontalTranslation = h * -this._pinVerticalTranslation, this._shadowVerticalTranslation = this._pinVerticalTranslation;
                var e = t / this._annotation.delegate.mapForAnnotation(this._annotation._public)._impl.ensureRenderingFrame().size.height;
                this._dropDurationMs = 1e3 * Math.min(.35 * (e + (1 - e) / 2), 3), this._dropAnimationStartDate = Date.now(), this._annotation.floating = !0, this._annotation.sceneGraphNode.updateState(), this._animateDrop(), this._animationQueue = [this._bounce, this._annotation.finishedAnimating.bind(this._annotation)], a.scheduleOnNextFrame(this)
            },
            dropAnnotationAfterDraggingAndRevertPosition: function(t) {
                var e = this._annotation.droppedAfterLift.bind(this._annotation);
                this._bounceAnimationFrameIndex >= 0 ? this._animationQueue = [e] : (this._liftAnimationStartDate ? (this._dropAnimationStartP = this._liftAnimationProgress, delete this._liftAnimationStartDate, delete this._liftAnimationProgress) : this._dropAnimationStartP = 1, t ? (this._dropAfterLift(), this._animationQueue = [this._bounce, e]) : (this._annotation.draggingDidEnd(), this._shadowLiftDamping = !0, this._animationQueue = [this._dropAfterLift, this._bounce, e], o.prototype.lift.call(this, this.nominalLiftAmount)), this._dropAnimationRevert = t, a.scheduleOnNextFrame(this))
            },
            lift: function(t) { this.nominalLiftAmount = t, this._animationQueue = [this._liftAfterBounce], this._bounce(), a.scheduleOnNextFrame(this) },
            setTranslation: function(t) { this.translation = t, this._bounceAnimationFrameIndex >= 0 || this._liftAnimationStartDate || (this._annotation.sceneGraphNode.transform = (new s).translate(t.x, t.y - this.liftAmount), this._annotation.sceneGraphNode.shadowTransform = (new s).translate(h * this.liftAmount, -this.liftAmount)) },
            performScheduledUpdate: function() { this._dropAnimationStartDate ? this._animateDrop() : this._bounceAnimationFrameIndex >= 0 ? this._animateBounce() : o.prototype.performScheduledUpdate.call(this) },
            _animateBounce: function() { this._bounceAnimationFrameIndex < l.length ? (this._annotation.sceneGraphNode.updateState("down" + l[this._bounceAnimationFrameIndex]), ++this._bounceAnimationFrameIndex) : (delete this._bounceAnimationFrameIndex, this._dequeueNextAnimation()), a.scheduleOnNextFrame(this) },
            _animateDrop: function() {
                var t = Math.min((Date.now() - this._dropAnimationStartDate) / this._dropDurationMs, 1),
                    e = 1 - t;
                this._annotation.sceneGraphNode.transform = (new s).translate(0, e * this._pinVerticalTranslation), this._annotation.sceneGraphNode.shadowTransform = (new s).translate(e * this._shadowHorizontalTranslation, e * this._shadowVerticalTranslation), 1 === t && (delete this._pinVerticalTranslation, delete this._shadowHorizontalTranslation, delete this._shadowVerticalTranslation, delete this._dropAnimationStartDate, delete this._dropDurationMs, this._annotation.floating = !1, this._annotation.sceneGraphNode.updateState(), this._dequeueNextAnimation()), a.scheduleOnNextFrame(this)
            },
            _bounce: function() { this._bounceAnimationFrameIndex = 0 },
            _dequeueNextAnimation: function() { this._animationQueue.length > 0 && this._animationQueue.shift().call(this) },
            _dropAfterLift: function() { delete this.translation, this._dropAfterLiftAnimationStartDate = Date.now(), a.scheduleOnNextFrame(this) },
            _liftAfterBounce: function() { o.prototype.lift.call(this, this.nominalLiftAmount), this._annotation.floating = !0, this._annotation.sceneGraphNode.updateState() }
        }), e.exports = n
    }, { "./annotation-drag-controller": 122, "@maps/css-matrix": 58, "@maps/js-utils": 84, "@maps/scheduler": 106 }],
    148: [function(t, e, i) {
        function n(t, e, i) { this._animationController = new a(this), this._dragController = this._animationController, this._sceneGraphNode = new s(this), o.call(this, t, e, o.div, i), this._public = t, this.setSize(d), i && "color" in i && (this.color = i.color) }
        var o = t("./annotation-internal"),
            s = t("./pin-annotation-node"),
            a = t("./pin-annotation-animation-controller"),
            r = t("@maps/geometry/size"),
            l = t("@maps/geometry/point"),
            h = t("@maps/css-matrix"),
            c = t("@maps/js-utils"),
            u = t("../localizer").l10n,
            d = new r(15, 36);
        n.Colors = { Red: "#ff3d38", Green: "#54d669", Purple: "#c969e0" }, n.prototype = c.inheritPrototype(o, n, {
            _animates: !0,
            _color: n.Colors.Red,
            _anchorPoint: new window.DOMPoint(8, 35),
            _calloutAnchorPoint: new window.DOMPoint(-8, 0),
            get size() { return d.copy() },
            set size(t) { console.warn("[MapKit] The `size` property of a pin annotation cannot be set.") },
            get color() { return this._color },
            set color(t) { c.checkType(t, "string", "[MapKit] Expected a string value for PinAnnotation.color, but got `" + t + "` instead"), t !== this._color && (this._color = t, this.updateLocalizedText(), this._sceneGraphNode.needsDisplay = !0) },
            get shouldPreventDrag() { return this._animationController.isBouncing },
            doesAnimate: function() { return this._animates },
            willMoveToMap: function(t) { this._isMoving = t && this.animates },
            didMoveToMap: function() {
                var t = this._isMoving;
                o.prototype.didMoveToMap.call(this), this.delegate && t && this.visible && !this._appearanceAnimation && this._shown && (this._isAnimating = !0, this._animationController.drop())
            },
            droppedAfterLift: function() { this.resetNodeTransform(), this._sceneGraphNode.updateState(), o.prototype.droppedAfterLift.call(this) },
            finishedAnimating: function() { this._sceneGraphNode.updateState(), o.prototype.finishedAnimating.call(this) },
            altText: function() { return o.prototype.altText.call(this) || (this._color === n.Colors.Green ? u.get("Annotation.Pin.Green.AccessibilityLabel") : this._color === n.Colors.Purple ? u.get("Annotation.Pin.Purple.AccessibilityLabel") : this._color === n.Colors.Red ? u.get("Annotation.Pin.Red.AccessibilityLabel") : u.get("Annotation.Pin.AccessibilityLabel")) },
            draggingDidEnd: function() { o.prototype.draggingDidEnd.call(this), o.prototype.updatePosition.call(this) },
            dragOffset: new l(0, 2),
            isAKnownOption: function(t) { return "color" === t || o.prototype.isAKnownOption.call(this, t) },
            resetNodeTransform: function() { this.sceneGraphNode.transform = new h }
        }), e.exports = n
    }, { "../localizer": 182, "./annotation-internal": 124, "./pin-annotation-animation-controller": 147, "./pin-annotation-node": 149, "@maps/css-matrix": 58, "@maps/geometry/point": 69, "@maps/geometry/size": 71, "@maps/js-utils": 84 }],
    149: [function(t, e, i) {
        function n(t) { o.BaseNode.call(this), this.size = new s(32, 39), this._annotation = t, this._renderer = new r(this), this.updateState() }
        var o = t("../../../lib/scene-graph"),
            s = t("@maps/geometry/size"),
            a = t("@maps/js-utils"),
            r = t("./pin-annotation-renderer");
        n.prototype = a.inheritPrototype(o.BaseNode, n, { get position() { return this._annotation.node.position }, stringInfo: function() { return "PinAnnotationNode" + (this._state ? "<" + this._state + ">" : "") }, updateState: function(t) { t = this._annotation.floating ? "floating" : t || "", this._state !== t && (this._state = t, this.needsDisplay = !0) } }), e.exports = n
    }, { "../../../lib/scene-graph": 47, "./pin-annotation-renderer": 150, "@maps/geometry/size": 71, "@maps/js-utils": 84 }],
    150: [function(t, e, i) {
        function n(t) { a.RenderItem.call(this, t) }

        function o(t, e, i, n) { t.strokeStyle = "#ff4040", t.lineWidth = 2, t.strokeRect(0, e, i, n - e), t.beginPath(), t.moveTo(0, e), t.lineTo(i, n), t.moveTo(0, n), t.lineTo(i, e), t.stroke() }
        var s, a = t("../../../lib/scene-graph"),
            r = t("@maps/js-utils"),
            l = t("../utils"),
            h = t("../urls"),
            c = Math.min(l.devicePixelRatio, 3),
            u = h.createImageUrl("pins/pin"),
            d = (c > 1 ? "_" + c + "x" : "") + ".png",
            p = {},
            m = [],
            g = !1;
        n.prototype = r.inheritPrototype(a.RenderItem, n, {
                draw: function(t) {
                    if (s) {
                        var e = this._node,
                            i = e.size.width,
                            n = e.size.height;
                        if (g) o(t, n - e._annotation.size.height, e._annotation.size.width, n);
                        else {
                            var a = e._state,
                                r = e._annotation.color;
                            if (p[r] || (p[r] = {}), !p[r][a]) {
                                var l = document.createElement("canvas");
                                l.width = i * c, l.height = n * c;
                                var h = l.getContext("2d");
                                h.fillStyle = r, h.fillRect(0, 0, l.width, l.height), h.save(), h.globalCompositeOperation = "destination-in", h.drawImage(s[a].head, 0, 0), h.restore(), h.drawImage(s[a].base, 0, 0), p[r][a] = l
                            }
                            e.shadowTransform && t.drawImage(s[""].shadow, e.shadowTransform.e, e.shadowTransform.f, i, n), t.drawImage(p[r][a], 0, 0, i, n)
                        }
                    }
                    else m.indexOf(this._node) < 0 && m.push(this._node)
                }
            }),
            function() {
                function t() { 0 === --o && (s = n, m.forEach(function(t) { t.needsDisplay = !0 })) }

                function e(e) { console.warn("[MapKit] Error loading pin annotation image " + e.target.src + "; pin annotations may not display correctly."), g = !0, t() }

                function i(i, o) {
                    var s = u + (i ? "-" : "") + i + "-" + o + d,
                        a = l.htmlElement("img", { src: s });
                    a.addEventListener("load", function() { n[i][o] = a, t() }), a.addEventListener("error", e)
                }
                var n = {},
                    o = ["", "floating", "down1", "down2", "down3"].reduce(function(t, e) { return n[e] = {}, i(e, "base"), i(e, "head"), t + 2 }, 1);
                i("", "shadow")
            }(), e.exports = n
    }, { "../../../lib/scene-graph": 47, "../urls": 222, "../utils": 225, "@maps/js-utils": 84 }],
    151: [function(t, e, i) {
        function n(t, e) { console.warn("[MapKit] mapkit.PinAnnotation is deprecated and will be removed in a future release. Please use the newer mapkit.MarkerAnnotation class instead."), Object.defineProperty(this, "_impl", { value: new s(this, t, e) }) }
        var o = t("./annotation"),
            s = t("./pin-annotation-internal"),
            a = t("@maps/js-utils");
        n.Colors = s.Colors, n.prototype = a.inheritPrototype(o, n, { get size() { return this._impl.size }, set size(t) { this._impl.size = t }, get color() { return this._impl._color }, set color(t) { this._impl.color = t } }), e.exports = n
    }, { "./annotation": 127, "./pin-annotation-internal": 148, "@maps/js-utils": 84 }],
    152: [function(t, e, i) {
        function n(t, e) { console.assert(e && e.location && "number" == typeof e.location.latitude && "number" == typeof e.location.longitude), o.call(this, t, e.coordinate, o.div), this._element.style.width = this._element.style.height = 2 * l.TOTAL_RADIUS + "px", this._updateTitleAndSubtitleForLocale(), this._sceneGraphNode = new s(this), this.shownPropertyWasUpdated(!0) }
        var o = t("./annotation-internal"),
            s = t("./user-location-annotation-node"),
            a = t("../localizer").l10n,
            r = t("@maps/js-utils"),
            l = t("./user-location-annotation-style");
        n.prototype = r.inheritPrototype(o, n, {
            _anchorOffset: new window.DOMPoint(0, -l.TOTAL_RADIUS),
            _calloutAnchorPoint: new window.DOMPoint(-l.TOTAL_RADIUS, -l.SHADOW_BLUR),
            get coordinate() { return this._coordinate },
            set coordinate(t) { this.hasOwnProperty("_coordinate") ? console.warn("[MapKit] The `coordinate` property of the user location annotation cannot be set.") : this._coordinate = t.copy() },
            get draggable() { return !1 },
            set draggable(t) { console.warn("[MapKit] The `draggable` property of the user location annotation cannot be set.") },
            get size() { return this._node.size.copy() },
            set size(t) { console.warn("[MapKit] The `size` property of the user location annotation cannot be set.") },
            get node() { return this._node },
            handleEvent: function(t) {
                switch (t.type) {
                    case a.Events.LocaleChanged:
                        this._updateTitleAndSubtitleForLocale();
                        break;
                    case "blur":
                        this._sceneGraphNode.pauseAnimation();
                        break;
                    case "focus":
                        this._sceneGraphNode.resumeAnimation()
                }
            },
            shownPropertyWasUpdated: function(t) { t ? (this._sceneGraphNode.startAnimation(), this._startMonitoringFocus()) : (this._sceneGraphNode.stopAnimation(), this._stopMonitoringFocus()) },
            removedFromMap: function() { this._sceneGraphNode.stopAnimation(), a.removeEventListener(a.Events.LocaleChanged, this), this._stopMonitoringFocus() },
            stale: !1,
            setCoordinate: function(t) { Object.getOwnPropertyDescriptor(o.prototype, "coordinate").set.call(this, t) },
            _startMonitoringFocus: function() { try { window.top.addEventListener("blur", this), window.top.addEventListener("focus", this) } catch (t) {} },
            _stopMonitoringFocus: function() { try { window.top.removeEventListener("blur", this), window.top.removeEventListener("focus", this) } catch (t) {} },
            _updateTitleAndSubtitleForLocale: function() { this.title = a.get("Location.Title"), this.subtitle = a.get("Location.Subtitle") }
        }), e.exports = n
    }, { "../localizer": 182, "./annotation-internal": 124, "./user-location-annotation-node": 153, "./user-location-annotation-style": 155, "@maps/js-utils": 84 }],
    153: [function(t, e, i) {
        function n(t) { s.BaseNode.call(this), this._annotation = t, this._renderer = new r(this) }
        var o = t("@maps/scheduler"),
            s = t("../../../lib/scene-graph"),
            a = t("@maps/js-utils"),
            r = t("./user-location-annotation-renderer");
        n.prototype = a.inheritPrototype(s.BaseNode, n, { stringInfo: function() { var t = []; return this.stale && t.push("stale"), null != this._pausedTime && t.push("paused@" + this._pausedTime), "UserLocationAnnotationNode" + (t.length > 0 ? "<" + t.join(", ") + ">" : "") }, get startTime() { return this._startTime }, get size() { return this._annotation.node.size }, get position() { return this._annotation.node.position }, startAnimation: function() { this._startTime = Date.now(), this._pausedTime = null, o.scheduleASAP(this) }, stopAnimation: function() { this._startTime = null, this._pausedTime = null }, pauseAnimation: function() { this._pausedTime = Date.now() }, resumeAnimation: function() { null != this._pausedTime && (this._startTime += Date.now() - this._pausedTime, this._pausedTime = null, o.scheduleASAP(this)) }, performScheduledUpdate: function() { null != this._startTime && (this.needsDisplay = !0, null == this._pausedTime && o.scheduleOnNextFrame(this)) } }), e.exports = n
    }, { "../../../lib/scene-graph": 47, "./user-location-annotation-renderer": 154, "@maps/js-utils": 84, "@maps/scheduler": 106 }],
    154: [function(t, e, i) {
        function n(t) { s.RenderItem.call(this, t) }

        function o(t, e, i) { return "rgb(" + t.map(function(t, n) { return Math.round(t + (e[n] - t) * i) }).join(", ") + ")" }
        var s = t("../../../lib/scene-graph"),
            a = t("@maps/js-utils"),
            r = t("./user-location-annotation-style"),
            l = t("../utils");
        n.prototype = a.inheritPrototype(s.RenderItem, n, {
            draw: function(t) {
                var e = (Date.now() - this._node.startTime) % r.ANIMATION_DURATION_MS,
                    i = l.easeInOut(e < r.ANIMATION_HALF_DURATION_MS ? 1 - e / r.ANIMATION_HALF_DURATION_MS : (e - r.ANIMATION_HALF_DURATION_MS) / r.ANIMATION_HALF_DURATION_MS),
                    n = r.ANIMATION_SCALE_TO + (r.ANIMATION_SCALE_FROM - r.ANIMATION_SCALE_TO) * i;
                t.save(), t.beginPath(), t.arc(r.TOTAL_RADIUS, r.TOTAL_RADIUS, r.OUTER_RADIUS, 0, 2 * Math.PI), t.fillStyle = r.OUTER_FILL, t.shadowColor = r.SHADOW_COLOR, t.shadowBlur = r.SHADOW_BLUR, t.fill(), t.restore(), t.beginPath(), t.arc(r.TOTAL_RADIUS, r.TOTAL_RADIUS, r.INNER_RADIUS * n, 0, 2 * Math.PI), t.fillStyle = this.node.stale ? r.STALE_FILL : o(r.ANIMATION_FILL_FROM, r.ANIMATION_FILL_TO, i), t.fill()
            }
        }), e.exports = n
    }, { "../../../lib/scene-graph": 47, "../utils": 225, "./user-location-annotation-style": 155, "@maps/js-utils": 84 }],
    155: [function(t, e, i) { e.exports = { INNER_RADIUS: 8, OUTER_RADIUS: 11, SHADOW_BLUR: 10, TOTAL_RADIUS: 21, OUTER_FILL: "white", STALE_FILL: "rgb(180, 180, 180)", SHADOW_COLOR: "rgba(0, 0, 0, 0.3)", ANIMATION_DURATION_MS: 3e3, ANIMATION_HALF_DURATION_MS: 1500, ANIMATION_SCALE_FROM: 1, ANIMATION_SCALE_TO: .75, ANIMATION_FILL_FROM: [68, 152, 252], ANIMATION_FILL_TO: [26, 129, 251] } }, {}],
    156: [function(t, e, i) {
        function n(t) { Object.defineProperty(this, "_impl", { value: new s(this, t) }) }
        var o = t("./annotation"),
            s = t("./user-location-annotation-internal"),
            a = t("@maps/js-utils");
        n.prototype = a.inheritPrototype(o, n, { set coordinate(t) { this._impl.coordinate = t }, get coordinate() { return this._impl.coordinate }, get draggable() { return this._impl.draggable }, set draggable(t) { this._impl.draggable = t }, get size() { return this._impl.size }, set size(t) { this._impl.size = t } }), e.exports = n
    }, { "./annotation": 127, "./user-location-annotation-internal": 152, "@maps/js-utils": 84 }],
    157: [function(t, e, i) {
        "use strict";

        function n(t, e) { this.items = t, this.data = e } n.prototype = { constructor: n, get data() { return this._data }, set data(t) { this._data = t }, get items() { return this._items }, set items(t) { this._items = t instanceof Array ? t : [t] }, getFlattenedItemList: function() { var t = []; return this.items.forEach(function(e) { "function" == typeof e.getFlattenedItemList ? t = t.concat(e.getFlattenedItemList(e)) : t.push(e) }, this), t } }, e.exports = n
    }, {}],
    158: [function(t, e, i) {
        function n(t, e) { Object.defineProperty(this, "_impl", { value: new o(t, e) }) }
        var o = t("./item-collection-internal");
        n.prototype = { get data() { return this._impl.data }, set data(t) { this._impl.data = t }, get items() { return this._impl._items }, set items(t) { this._impl.items = t }, getFlattenedItemList: function() { return this._impl.getFlattenedItemList() } }, e.exports = n
    }, { "./item-collection-internal": 157 }],
    159: [function(t, e, i) {
        var n = t("../build.json"),
            o = t("./localizer"),
            s = t("../../lib/bootstrap"),
            a = { _instrumented: !1, get instrumented() { return this._instrumented }, get previewLoCSR() { return !!this._previewLoCSR }, get didFallback() { return this._syrupRequestedFallback }, init: function(t) { return t && "object" == typeof t && ("instrumented" in t && (this._instrumented = !!t.instrumented, delete t.instrumented), "_previewLoCSR" in t && (this._previewLoCSR = !!t._previewLoCSR, delete t._previewLoCSR)), s.init.call(this, t, "[MapKit] mapkit.init(): ") }, Events: { Changed: "configuration-change", Error: "error" }, StorageKeys: { BootstrapData: "mapkit.bootstrapData", BootstrapRequestParams: "mapkit.bootstrapRequestParams", BootstrapDataExpirationTimeMS: "mapkit.bootstrapData.expirationTimeMS" } },
            r = Object.create(s).withParameters({ mkjsVersion: n.version, poi: "1", languageSupport: o.languageSupport, l10n: o.l10n });
        Object.keys(a).forEach(function(t) { Object.defineProperty(r, t, Object.getOwnPropertyDescriptor(a, t)) }), e.exports = r
    }, { "../../lib/bootstrap": 1, "../build.json": 111, "./localizer": 182 }],
    160: [function(t, e, i) {
        var n = t("@maps/js-utils").noop;
        e.exports = { log: n, warn: n, error: n, assert: n }
    }, { "@maps/js-utils": 84 }],
    161: [function(t, e, i) { e.exports = { MapTypes: { Satellite: "satellite", Hybrid: "hybrid", Standard: "standard" }, FeatureVisibility: { Adaptive: "adaptive", Hidden: "hidden", Visible: "visible" }, MarkerAnnotationFontFamily: '"-apple-system", "BlinkMacSystemFont", "Helvetica Neue", Helvetica, Arial, sans-serif', MapTiledLayerMinZoomLevel: 2, MapTiledLayerMaxZoomLevel: 20 } }, {}],
    162: [function(t, e, i) {
        function n(t) { h.call(this, t), r.classList.add(t, u.CONTROL) }

        function o(t) { this._control = t }

        function s(t) { this._control = t }

        function a(t) { this._control = t }
        var r = t("../utils"),
            l = t("@maps/js-utils"),
            h = t("@maps/render-tree").Node,
            c = t("../localizer").l10n,
            u = { CONTROL: "mk-control", DISABLED: "mk-disabled", FOCUS: "mk-focus" };
        n.prototype = l.inheritPrototype(h, n, {
            constructor: n,
            _enabled: !1,
            hasFocus: !1,
            pageHasFocus: !1,
            get enabled() { return this._enabled },
            set enabled(t) {
                var e = !!t;
                this._enabled !== e && (e ? (r.classList.remove(this.element, u.DISABLED), this._createListeners(), this.element.addEventListener(r.touchstartOrMousedown, this._eventListener), this._addFocusAndBlurListeners(), this._addKeyboardListeners()) : (r.classList.add(this.element, u.DISABLED), this.element.removeEventListener(r.touchstartOrMousedown, this._eventListener), this._removeFocusAndBlurListeners(), this._removeKeyboardListeners()), this._enabled = e, this.reset())
            },
            set canShowTooltips(t) { t ? this._updateLabels() : this._clearLabels() },
            willMoveToParent: function(t) { t ? this.parent || (this._createListeners(), c.addEventListener(c.Events.LocaleChanged, this._eventListener), this._addFocusAndBlurListeners(), this._addKeyboardListeners(), this.addEventListeners()) : (c.removeEventListener(c.Events.LocaleChanged, this._eventListener), this.removeEventListeners(), this._removeFocusAndBlurListeners(), this._removeKeyboardListeners(), this._destroyListeners()) },
            blurFocusedElement: function(t) { try { this.element.contains(document.activeElement) && document.activeElement.blur() } catch (t) {} },
            reset: function() {},
            touchesBegan: function(t) {},
            touchesMoved: function(t) {},
            touchesEnded: function(t) {},
            touchesCanceled: function(t) {},
            spaceBarKeyDown: function(t) {},
            spaceBarKeyUp: function(t) {},
            escapeKeyDown: function(t) {},
            escapeKeyUp: function(t) {},
            downArrowKeyUp: function(t) {},
            downArrowKeyDown: function(t) {},
            upArrowKeyUp: function(t) {},
            upArrowKeyDown: function(t) {},
            rightArrowKeyUp: function(t) {},
            leftArrowKeyUp: function(t) {},
            rightArrowKeyDown: function(t) {},
            leftArrowKeyDown: function(t) {},
            focused: function(t) {},
            blurred: function(t) {},
            pageDidFocus: function(t) {},
            pageDidBlur: function(t) {},
            updateTintColor: function(t) {},
            removeEventListeners: function() {},
            addEventListeners: function() {},
            localeChanged: function() {},
            _clearLabels: function() { r.updateLabel(this.element, "") },
            _createListeners: function() { this._eventListener || (this._eventListener = new o(this)), this._windowEventListener || (this._windowEventListener = new a(this)), this._cancelFocusEventListener || (this._cancelFocusEventListener = new s(this)) },
            _destroyListeners: function() { this._eventListener && (this.element.removeEventListener(r.touchstartOrMousedown, this._eventListener), this._eventListener.destroy(), delete this._eventListener), this._windowEventListener && (this._windowEventListener.destroy(), delete this._windowEventListener), this._cancelFocusEventListener && (this._cancelFocusEventListener.destroy(), delete this._cancelFocusEventListener) },
            _addFocusAndBlurListeners: function() { this.element.addEventListener("focus", this._eventListener, !0), this.element.addEventListener("blur", this._eventListener, !0), window.addEventListener("focus", this._windowEventListener), window.addEventListener("blur", this._windowEventListener) },
            _removeFocusAndBlurListeners: function() { this.element.removeEventListener("focus", this._eventListener, !0), this.element.removeEventListener("blur", this._eventListener, !0), window.removeEventListener("focus", this._windowEventListener), window.removeEventListener("blur", this._windowEventListener) },
            _addKeyboardListeners: function() { this.element.addEventListener("keydown", this._eventListener), this.element.addEventListener("keyup", this._eventListener) },
            _removeKeyboardListeners: function() { this.element.removeEventListener("keydown", this._eventListener), this.element.removeEventListener("keyup", this._eventListener) }
        }), o.prototype = {
            destroy: function() { this._removeEventListeners(), delete this._control },
            handleEvent: function(t) {
                switch (t.type) {
                    case "mousedown":
                    case "touchstart":
                        this._touchesBegan(t);
                        break;
                    case "touchmove":
                    case "mousemove":
                        this._control.touchesMoved(t);
                        break;
                    case "touchend":
                    case "mouseup":
                        this._removeEventListeners(), this._control.touchesEnded(t);
                        break;
                    case "touchcancel":
                        this._removeEventListeners(), this._control.touchesCanceled(t);
                        break;
                    case "keydown":
                        this._keyDown(t);
                        break;
                    case "keyup":
                        this._keyUp(t);
                        break;
                    case "focus":
                        this._focus(t);
                        break;
                    case "blur":
                        this._blur(t);
                        break;
                    case c.Events.LocaleChanged:
                        this._control.localeChanged(t)
                }
            },
            _touchesBegan: function(t) { t.preventDefault(), t.stopPropagation(), ("mousedown" !== t.type || 0 === t.button && !t.ctrlKey) && (r.supportsTouches ? (window.addEventListener("touchmove", this, !0), window.addEventListener("touchend", this, !0), window.addEventListener("touchcancel", this, !0)) : (window.addEventListener("mousemove", this, !0), window.addEventListener("mouseup", this, !0)), this._control.touchesBegan(t)) },
            _keyDown: function(t) {
                switch (t.keyCode) {
                    case l.KeyCodes.Escape:
                        this._control.escapeKeyDown(t);
                        break;
                    case l.KeyCodes.SpaceBar:
                        t.preventDefault(), this._control.spaceBarKeyDown(t);
                        break;
                    case l.KeyCodes.DownArrow:
                        t.preventDefault(), this._control.downArrowKeyDown(t);
                        break;
                    case l.KeyCodes.UpArrow:
                        t.preventDefault(), this._control.upArrowKeyDown(t);
                        break;
                    case l.KeyCodes.RightArrow:
                        t.preventDefault(), this._control.rightArrowKeyDown(t);
                        break;
                    case l.KeyCodes.LeftArrow:
                        t.preventDefault(), this._control.leftArrowKeyDown(t)
                }
            },
            _keyUp: function(t) {
                switch (t.keyCode) {
                    case l.KeyCodes.Escape:
                        this._control.escapeKeyUp(t);
                        break;
                    case l.KeyCodes.DownArrow:
                        t.preventDefault(), this._control.downArrowKeyUp(t);
                        break;
                    case l.KeyCodes.UpArrow:
                        t.preventDefault(), this._control.upArrowKeyUp(t);
                        break;
                    case l.KeyCodes.RightArrow:
                        t.preventDefault(), this._control.rightArrowKeyUp(t);
                        break;
                    case l.KeyCodes.LeftArrow:
                        t.preventDefault(), this._control.leftArrowKeyUp(t);
                        break;
                    case l.KeyCodes.SpaceBar:
                        t.preventDefault(), this._control.spaceBarKeyUp(t)
                }
            },
            _focus: function(t) { this._control.hasFocus || (this._control.hasFocus = !0, r.classList.add(this._control.element, u.FOCUS), window.addEventListener(r.touchstartOrMousedown, this._control._cancelFocusEventListener, !0), this._control.focused(t)) },
            _blur: function(t) { this._control.hasFocus && (this._control.hasFocus = !1, window.removeEventListener(r.touchstartOrMousedown, this._control._cancelFocusEventListener, !0), r.classList.remove(this._control.element, u.FOCUS), this._control.blurred(t)) },
            _removeEventListeners: function() { r.supportsTouches ? (window.removeEventListener("touchmove", this, !0), window.removeEventListener("touchend", this, !0), window.removeEventListener("touchcancel", this, !0)) : (window.removeEventListener("mousemove", this, !0), window.removeEventListener("mouseup", this, !0)) }
        }, s.prototype = { destroy: function() { delete this._control }, handleEvent: function(t) { this._control.blurFocusedElement(t) } }, a.prototype = {
            destroy: function() { delete this._control },
            handleEvent: function(t) {
                switch (t.type) {
                    case "focus":
                        this._control.pageHasFocus || (this._control.pageHasFocus = !0, this._control.pageDidFocus(t));
                        break;
                    case "blur":
                        this._control.pageHasFocus = !1, this._control.pageDidBlur(t)
                }
            }
        }, e.exports = n
    }, { "../localizer": 182, "../utils": 225, "@maps/js-utils": 84, "@maps/render-tree": 102 }],
    163: [function(t, e, i) {
        function n(t) { _.call(this, o.htmlElement("div", { class: C })), this._map = t, this._logo = this.addChild(new a), this._topLeftControlsNode = this.addChild(new _(o.htmlElement("div", { class: S }))), this._topRightControlsNode = this.addChild(new _(o.htmlElement("div", { class: T }))), this._bottomRightControlsNode = this.addChild(new _(o.htmlElement("div", { class: L }))), this._legalControl = this._topRightControlsNode.addChild(new r), this._controlsPending = !1, y.activeLocale && (this._rtl = y.activeLocale.rtl), y.addEventListener(y.Events.LocaleChanged, this) }
        var o = t("../utils"),
            s = t("@maps/js-utils"),
            a = t("./logo"),
            r = t("./legal-control"),
            l = t("./map-type-control"),
            h = t("./scale"),
            c = t("./zoom-control"),
            u = t("./user-location-control"),
            d = t("./rotation-control"),
            p = t("@maps/geometry/point"),
            m = t("@maps/geometry/size"),
            g = t("@maps/render-tree"),
            _ = t("@maps/render-tree").Node,
            f = t("../user-location/user-location"),
            y = t("../localizer").l10n,
            v = t("@maps/geometry/rect"),
            w = t("../constants").FeatureVisibility,
            b = new m(262, 222),
            C = "mk-controls-container",
            S = "mk-top-left-controls-container",
            L = "mk-bottom-right-controls-container",
            T = "mk-top-right-controls-container",
            E = new p(7, 11);
        n.prototype = s.inheritPrototype(_, n, {
            _rtl: !1,
            get controlsPending() { return this._controlsPending },
            set canShowTooltips(t) { this._userLocationControl && (this._userLocationControl.canShowTooltips = t), this._zoomControl && (this._zoomControl.canShowTooltips = t), this._mapTypeControl && (this._mapTypeControl.canShowTooltips = t), this._rotationControl && (this._rotationControl.canShowTooltips = t) },
            get legalControlExpandedSize() { return this._legalControl.expandedSize },
            mapPaddingDidChange: function(t) {
                var e = this.element.style;
                e.top = t.top + "px", e.left = t.left + "px", e.bottom = t.bottom + "px", e.right = t.right + "px", this.sizeDidChange()
            },
            sizeDidChange: function() {
                var t = this._shouldHideControls();
                this._toggleControl(this._map.showsZoomControl && !t, this._zoomControl, this.updateZoomControl), this._toggleControl(this._map.showsMapTypeControl && !t, this._mapTypeControl, this.updateMapTypeControl), this._toggleControl(this._map.showsUserLocationControl && !t, this._userLocationControl, this.updateUserLocationControl), this.updateRotationControl(), this.updateScale(), this.zoomLevelDidChange()
            },
            zoomLevelDidChange: function() { this._zoomControl && (this._zoomControl.zoomOutEnabled = this._map.zoomLevel !== this._map.minZoomLevel, this._zoomControl.zoomInEnabled = this._map.zoomLevel !== this._map.maxZoomLevel) },
            update: function() { this._map && (this._setPendingControls(), this._shouldHideControls() ? (this._removeZoomControl(), this._removeMapTypeControl(), this._removeUserLocationControl(), this._removeRotationControl(), this._removeScale()) : (this.updateZoomControl(), this.updateMapTypeControl(), this.updateUserLocationControl(), this.updateRotationControl(), this.updateScale()), this._logo.updateWithMapType(this._map.mapType), this.updateLegalControl()) },
            scaleDidChange: function() { this._scale && (this._scale.update(), this._scale.hideIfNeeded()) },
            updateScale: function() { this._map.showsScale === w.Hidden || this._shouldHideControls() ? this._removeScale() : (this._addScale(), this._scale.node.mapWidth = this._map._mapNode.size.width, this._scale.updateThemeForMap(this._map), this._positionScale(), this._scale.update()) },
            updateZoomControl: function() { this._map.showsZoomControl && !this._shouldHideControls() ? (this._addZoomControl(), this._zoomControl.enabled = this._map.isZoomEnabled, this._zoomControl.zoomOutEnabled = this._map.zoomLevel !== this._map.minZoomLevel, this._zoomControl.zoomInEnabled = this._map.zoomLevel !== this._map.maxZoomLevel, this._zoomControl.updateTintColor(this._map.tintColor)) : this._removeZoomControl() },
            updateMapTypeControl: function() { this._map.showsMapTypeControl && !this._shouldHideControls() ? (this._addMapTypeControl(), this._mapTypeControl.mapType = this._map.mapType, this._mapTypeControl.enabled = !0, this._mapTypeControl.updateTintColor(this._map.tintColor)) : this._removeMapTypeControl() },
            updateUserLocationControl: function() {
                if (this._map.showsUserLocationControl && !this._shouldHideControls()) {
                    switch (this._addUserLocationControl(), this._userLocationControl.enabled = !0, this._userLocationControl.state) {
                        case u.States.Default:
                            this._map.tracksUserLocation && f && f.location ? this._userLocationControl.toTrackingState() : (this._map.tracksUserLocation || this._map.showsUserLocation && !this._map.userLocationAnnotation) && this._userLocationControl.toWaitingState();
                            break;
                        case u.States.Waiting:
                            f && f.location && this.userLocationDidChange(f), this._map.showsUserLocation || this._userLocationControl.toDefaultState();
                            break;
                        case u.States.Tracking:
                            this._map.tracksUserLocation || this._userLocationControl.toDefaultState()
                    }
                    this._userLocationControl.updateTintColor(this._map.tintColor)
                }
                else this._removeUserLocationControl()
            },
            updateRotationControl: function() { this._shouldHideControls() || this._map.isCompassHidden ? this._removeRotationControl() : (this._addRotationControl(), this._rotationControl.rotation = this._map.rotation, this._rotationControl.updateTintColor(this._map.tintColor)) },
            updateLegalControl: function() { this._legalControl.updateWithMapType(this._map.mapType), this._legalControl.updateTintColor(this._map.tintColor) },
            devicePixelRatioDidChange: function(t) { this._userLocationControl && this._userLocationControl.updateIcons(t.value), this._rotationControl && this._rotationControl.updateImage(t.value) },
            handleEvent: function(t) {
                if (this._map) switch (t.type) {
                    case l.EVENTS.MAPTYPE_CHANGE:
                        this._mapTypeControl && (this._map.mapType = this._mapTypeControl.mapType);
                        break;
                    case u.EVENTS.PRESSED:
                        this._userLocationControl.state === u.States.Waiting ? this._map.tracksUserLocation = !0 : this._userLocationControl.state !== u.States.Tracking && (this._map.tracksUserLocation = !1);
                        break;
                    case y.Events.LocaleChanged:
                        this._handleLocaleChanged(t);
                        break;
                    case "update":
                        this._unsetPendingControls(), this._map.addWaitingAnnotations()
                }
            },
            mapWasDestroyed: function() { this._unsetPendingControls(), y.removeEventListener(y.Events.LocaleChanged, this), this._destroyZoomControl(), this._destroyMapTypeControl(), this._destroyUserLocationControl(), this._destroyRotationControl(!0), this._legalControl.remove(), delete this._legalControl, this._logo.mapWasDestroyed(), this._logo.remove(), delete this._logo, this._removeScale(), this.remove(), delete this._map },
            userLocationDidChange: function(t) { this._userLocationControl && (this._map.tracksUserLocation ? this._userLocationControl.toTrackingState() : this._userLocationControl.toDefaultState()) },
            userLocationDidError: function(t) { this._userLocationControl && this._userLocationControl.toDisabledState(), this._map.userLocationAnnotation || 3 === t.errorCode || (this._map.showsUserLocation = !1) },
            mapTypeControlWasOpened: function() {},
            mapTypeControlWasClosed: function() {},
            _handleLocaleChanged: function(t) { this._rtl !== t.locale.rtl && (this._rtl = t.locale.rtl, this._rtlChanged = !0, this.update(), this._rtlChanged = !1) },
            _addScale: function() { this._scale || (this._setPendingControls(), this._scale = new h(this._map), this.addChild(this._scale, 0)) },
            _positionScale: function() {
                var t = this._map.ensureVisibleFrame().size,
                    e = !this._rtl;
                this._scale.node.leftAligned = e, this._scale.position = e ? new p(E.x, E.y) : new p(t.width - this._scale.size.width - E.x, E.y), this._scale.shouldDisplayScale || this._scale.node.setOpacityAnimated(0, !1)
            },
            _removeScale: function() { this._scale && (this._setPendingControls(), this._scale.node.l10n = null, this._scale.node.remove(), this._scale.scene.destroy(), this._scale.remove(), delete this._scale) },
            _addZoomControl: function() {!this._map.showsZoomControl || this._zoomControl || this._shouldHideControls() || (this._setPendingControls(), this._zoomControl = new c, this._zoomControl.enabled = this._map.isZoomEnabled, this._zoomControl.addEventListener(c.EVENTS.ZOOM_START, this._map), this._zoomControl.addEventListener(c.EVENTS.ZOOM_END, this._map), this._bottomRightControlsNode.addChild(this._zoomControl)) },
            _removeZoomControl: function() {!this._shouldHideControls() && this._map.showsZoomControl || !this._zoomControl || (this._setPendingControls(), this._zoomControl.enabled = !1, this._destroyZoomControl()) },
            _destroyZoomControl: function() { this._zoomControl && (this._zoomControl.removeEventListener(c.EVENTS.ZOOM_START, this._map), this._zoomControl.removeEventListener(c.EVENTS.ZOOM_END, this._map), this._zoomControl.remove(), delete this._zoomControl) },
            _addMapTypeControl: function() {!this._map.showsMapTypeControl || this._mapTypeControl || this._shouldHideControls() || (this._setPendingControls(), this._mapTypeControl = new l(t("../map").MapTypes, this._map.mapType, this), this._mapTypeControl.addEventListener(l.EVENTS.MAPTYPE_CHANGE, this), this._topRightControlsNode.addChild(this._mapTypeControl), this.updateLegalControl()) },
            _removeMapTypeControl: function() { this._mapTypeControl && (this._setPendingControls(), this._mapTypeControl.enabled = !1, this._destroyMapTypeControl(), this.updateLegalControl()) },
            _destroyMapTypeControl: function() { this._mapTypeControl && (this._mapTypeControl.removeEventListener(l.EVENTS.MAPTYPE_CHANGE, this), this._mapTypeControl.remove(), delete this._mapTypeControl) },
            _toggleControl: function(t, e, i) {
                (e && !t || !e && t) && i.call(this)
            },
            _shouldHideControls: function() { var t = this._map.ensureVisibleFrame().size; return t.width < b.width || t.height < b.height },
            _addRotationControl: function() { this._shouldHideControls() || this._rotationControl || (this._setPendingControls(), this._rotationControl = new d(this._map), this._rotationControl.enabled = !0, this._bottomRightControlsNode.insertBefore(this._rotationControl, this._zoomControl)) },
            _removeRotationControl: function() { this._rotationControl && (this._setPendingControls(), this._destroyRotationControl()) },
            _destroyRotationControl: function(t) {
                if (this._rotationControl) {
                    if (t) this._rotationControl.mapWasDestroyed(), this._rotationControl.remove();
                    else {
                        var e = this._rotationControl;
                        e.opacity = 0, e.element.addEventListener(o.transitionend, function t() { e.element.removeEventListener(o.transitionend, t), e.mapWasDestroyed(), e.remove() })
                    }
                    delete this._rotationControl
                }
            },
            _addUserLocationControl: function() {!this._map.showsUserLocationControl || this._userLocationControl || this._shouldHideControls() || (this._setPendingControls(), this._userLocationControl = new u(this._map, this._rtl), this._userLocationControl.addEventListener(u.EVENTS.PRESSED, this), this._bottomRightControlsNode.insertBefore(this._userLocationControl, this._rotationControl || this._zoomControl)) },
            _removeUserLocationControl: function() {!this._shouldHideControls() && this._map.showsUserLocationControl || !this._userLocationControl || (this._setPendingControls(), this._destroyUserLocationControl()) },
            _destroyUserLocationControl: function() { this._userLocationControl && (this._userLocationControl.removeEventListener(u.EVENTS.STATE_CHANGE, this._map), this._userLocationControl.mapWasDestroyed(), this._userLocationControl.remove(), delete this._userLocationControl) },
            _setPendingControls: function() { this._controlsPending = !0, g.addEventListener("update", this) },
            _unsetPendingControls: function() { this._controlsPending = !1, g.removeEventListener("update", this) },
            controlBounds: function() {
                var t = [];
                return this.children.forEach(function(e) { 0 !== e.children.length && (e.classList.contains(L) ? Array.prototype.push.apply(t, e.children) : t.push(e)) }), t.map(function(t) {
                    try {
                        var e = t.element.getBoundingClientRect(),
                            i = window.getComputedStyle(this._map.element);
                        if ("none" === (i.transform || i.msTransform || i.webkitTransform)) { var n = this._map.element.getBoundingClientRect(); return new v(e.left - n.left, e.top - n.top, e.width, e.height) }
                        return v.rectFromClientRect(e)
                    }
                    catch (t) { return new v }
                }, this)
            }
        }), e.exports = n
    }, { "../constants": 161, "../localizer": 182, "../map": 185, "../user-location/user-location": 224, "../utils": 225, "./legal-control": 164, "./logo": 165, "./map-type-control": 166, "./rotation-control": 167, "./scale": 168, "./user-location-control": 169, "./zoom-control": 170, "@maps/geometry/point": 69, "@maps/geometry/rect": 70, "@maps/geometry/size": 71, "@maps/js-utils": 84, "@maps/render-tree": 102 }],
    164: [function(t, e, i) {
        function n() {
            var t = h.htmlElement("div", { class: y.CONTROL });
            this._elLegal = t.appendChild(h.htmlElement("div", { class: y.LEGAL, role: "button", tabindex: 0 })), this._elLegal.textContent = m.get("Legal.Label"), d.call(this, t);
            var e = h.htmlElement("div", { class: y.LEGAL_INFO, "aria-hidden": !0 });
            this._legalInfoNode = new p.Node(e);
            var i = e.appendChild(h.htmlElement("div", { class: y.LEGAL_INFO_CONTAINER }));
            this._elCloseButton = h.htmlElement("div", { class: y.CLOSE, role: "button" }, r()), i.appendChild(h.htmlElement("header")).appendChild(this._elCloseButton), this._elInfoItems = i.appendChild(h.htmlElement("div", { class: y.LEGAL_INFO_ITEMS, role: "menu" })), this.enabled = !0, this._updateAccessibilityState()
        }

        function o(t, e) { var i = a(t); return i.textContent = m.get(e), i }

        function s(t, e, i) { var n, o, s = a(t); return h.classList.add(s, y.LEGAL_ATTRIBUTION_ITEM), i ? (n = '<img width="68" height="22" class="mk-attribution-logo" src="' + h.imagePathForDevice([1, 2, 3], g.createImageUrl("legal/tomtom")) + '" alt="TomTom">', o = h.htmlElement("span", { class: "mk-right-caret" }, l()), s.innerHTML = m.get("Legal.Attribution.HTML.Label", { logo: n, chevron: o.outerHTML })) : s.textContent = m.get("Legal.Attribution.Plain.Label", { attribution: e }), s }

        function a(t) { var e = h.htmlElement("div", { class: y.LEGAL_INFO_ITEM, role: "menuitem", tabindex: -1 }); return t && e.setAttribute(v.MAP_ATTRIBUTION_URL, t), e }

        function r() { return h.createSVGIcon(h.svgElement("path", { d: "M6.20710678,5.5 L10.3535534,9.6464466 L9.6464466,10.3535534 L5.5,6.20710678 L1.35355339,10.3535534 L0.646446609,9.64644661 L4.79289322,5.5 L0.646446602,1.35355338 L1.35355338,0.646446602 L5.5,4.79289322 L9.64644661,0.646446609 L10.3535534,1.35355339 L6.20710678,5.5 Z" }), { viewBox: "0 0 11 11" }) }

        function l() { return h.createSVGIcon(h.svgElement("path", { d: "M1,1 L5,4.5 L1,7.5" }), { viewBox: "0 0 7 9" }) }
        var h = t("../utils"),
            c = t("@maps/js-utils"),
            u = t("../configuration"),
            d = t("./control"),
            p = t("@maps/render-tree"),
            m = t("../localizer").l10n,
            g = t("../urls"),
            _ = t("@maps/geometry/size");
        e.exports = n;
        var f = new _(222, 116),
            y = { CONTROL: "mk-legal-controls", OPEN: "mk-open", CLOSE: "mk-close", DIVIDER: "mk-divider", LEGAL: "mk-legal", LEGAL_SATELLITE: "mk-legal-satellite", LEGAL_INFO: "mk-legal-info", LEGAL_INFO_CONTAINER: "mk-legal-info-container", LEGAL_INFO_ITEMS: "mk-legal-info-items", LEGAL_INFO_ITEM: "mk-legal-info-item", LEGAL_ATTRIBUTION_ITEM: "mk-legal-attribution-item", PRESSED: "mk-pressed" },
            v = { MAP_ATTRIBUTION_URL: "data-map-attribution-url" };
        n.prototype = c.inheritPrototype(d, n, {
            _isOpen: !1,
            _shouldFocusOnLegalButton: !1,
            _canShowFocusOutline: !0,
            _hadFocusOutline: !1,
            _pageLostFocus: !1,
            updateWithMapType: function(e) {
                var i = t("../map");
                if (u.ready) {
                    this.mapType = e, this._elLegal.className = y.LEGAL, this._elLegal.textContent = m.get("Legal.Label"), this._elLegal.removeAttribute(v.MAP_ATTRIBUTION_URL), e !== i.MapTypes.Standard && h.classList.add(this._elLegal, y.LEGAL_SATELLITE), this._elCloseButton.setAttribute("aria-label", m.get("Legal.Menu.Close.Label"));
                    var n = u.types[this.mapType].tileSources[0];
                    n.showTermsOfUseLink || n.showPrivacyLink ? (this.updateLegalInfo(n), this.addChild(this._legalInfoNode)) : (this._elLegal.setAttribute(v.MAP_ATTRIBUTION_URL, n.attribution && n.attribution.url), this._legalInfoNode.remove()), this._updateAccessibilityState()
                }
            },
            updateLegalInfo: function(t) {
                console.assert(t);
                var e = [];
                if (this._elInfoItems.innerHTML = "", t.showTermsOfUseLink && e.push(o(m.get("Legal.TermsOfUse.URL"), "Legal.TermsOfUse.Label")), t.showPrivacyLink && e.push(o(m.get("Legal.Privacy.URL"), "Legal.Privacy.Label")), t.attribution) {
                    var i = t.attribution.url,
                        n = t.attribution.name,
                        a = t.attribution.name === u.TILE_SOURCES.TOMTOM;
                    e.push(s(i, n, a))
                }
                e.forEach(function(t, i) { this._elInfoItems.appendChild(t), i < e.length - 1 && this._elInfoItems.appendChild(h.htmlElement("div", { class: y.DIVIDER })) }, this)
            },
            get expandedSize() { var t = this._legalInfoNode.element.getBoundingClientRect(); return new _(Math.ceil(t.width) || f.width, Math.ceil(t.height) || f.height) },
            handleEvent: function(t) {
                switch (t.type) {
                    case h.transitionend:
                        this._handleTransitionend(t);
                        break;
                    case h.touchstartOrMousedown:
                        this._isOpen && !this.element.contains(t.target) && this._close()
                }
            },
            localeChanged: function(t) { this.mapType && (this.updateWithMapType(this.mapType), this.updateTintColor(this.tintColor)) },
            touchesBegan: function(t) { this._setPressedElement(t.target) },
            touchesMoved: function(t) {
                if (this._isOpen && this._isDown) {
                    var e = h.parentNodeForSvgTarget(t.target);
                    this._clearPressedElement(), this._setPressedElement(e)
                }
            },
            touchesEnded: function(t) { this._pressed(t) },
            spaceBarKeyDown: function(t) { this._setPressedElement(t.target) },
            spaceBarKeyUp: function(t) { this._pressed(t) },
            escapeKeyDown: function(t) { this._isOpen && (this._shouldFocusOnLegalButton = !0, this._canShowFocusOutline = !0, this._close()) },
            focused: function(t) {
                if (this._isOpen && t.target === this._elLegal) return this._shouldFocusOnLegalButton = !0, void this._close();
                var e = this._canShowFocusOutline && !this._pageLostFocus || this._canShowFocusOutline && this._pageLostFocus && this._hadFocusOutline;
                this._hadFocusOutline = e, h.classList.toggle(this.element, "mk-focus", e), this._isDown && e && (this._clearPressedElement(), this._setPressedElement(t.target))
            },
            blurred: function(t) { setTimeout(function(t) { document.activeElement && "body" !== document.activeElement.tagName.toLowerCase() && !this.element.contains(document.activeElement) && this._close() }.bind(this), 0) },
            pageDidFocus: function(t) { setTimeout(function() { delete this._pageLostFocus }.bind(this), 0) },
            pageDidBlur: function(t) { this._elInfoItems.contains(document.activeElement) && d.prototype.blurFocusedElement.call(this, t), this._pageLostFocus = !0, this._close() },
            blurFocusedElement: function(t) { d.prototype.blurFocusedElement.call(this, t), this._isOpen && !this.element.contains(t.target) && this._close() },
            updateTintColor: function(t) {
                if (this.tintColor = t, this._elInfoItems)
                    for (var e = this._elInfoItems.querySelectorAll("." + y.LEGAL_INFO_ITEM + ":not(." + y.LEGAL_ATTRIBUTION_ITEM + ")"), i = 0; i < e.length; i++) e[i].style.color = t
            },
            reset: function() { this._close() },
            _open: function() { window.addEventListener(h.touchstartOrMousedown, this, !0), this._legalInfoNode.element.addEventListener("transitionend", this), h.classList.add(this._legalInfoNode.element, y.OPEN), this._isOpen = !0 },
            _close: function() { this._isOpen = !1, this._updateAccessibilityState(), window.removeEventListener(h.touchstartOrMousedown, this, !0), h.classList.remove(this._legalInfoNode.element, y.OPEN) },
            _tabbable: function() {
                for (var t = this.element.querySelectorAll("." + y.LEGAL_INFO_ITEM), e = 0; e < t.length; e++) t[e].setAttribute("tabindex", this._isOpen ? 0 : -1);
                this._elCloseButton.setAttribute("tabindex", this._isOpen ? 0 : -1)
            },
            _pressed: function(t) {
                var e = h.parentNodeForSvgTarget(t.target),
                    i = "keyup" === t.type && t.keyCode === c.KeyCodes.SpaceBar;
                delete this._isDown, this._clearPressedElement(), h.classList.contains(e, "mk-attribution-logo") && (e = e.parentNode), e.getAttribute(v.MAP_ATTRIBUTION_URL) ? window.open(e.getAttribute(v.MAP_ATTRIBUTION_URL)) : h.classList.contains(e, y.CLOSE) ? (this._shouldFocusOnLegalButton = !0, this._canShowFocusOutline = i, this._elCloseButton.blur(), this._close()) : h.classList.contains(this._legalInfoNode.element, y.OPEN) || (this._canShowFocusOutline = i, this._open())
            },
            _handleTransitionend: function(t) { this._isOpen ? (this._updateAccessibilityState(), this.element.blur(), this._elInfoItems.children.item(0).focus()) : (this._legalInfoNode.element.removeEventListener("transitionend", this), this._shouldFocusOnLegalButton && this._elLegal.focus(), this._shouldFocusOnLegalButton = !1), c.isIEAndNotEdge() ? setTimeout(function() { this._canShowFocusOutline = !0 }.bind(this), 0) : this._canShowFocusOutline = !0 },
            _updateAccessibilityState: function() { this._legalInfoNode.parent ? (this._elLegal.setAttribute("aria-haspopover", !0), this._elLegal.setAttribute("aria-expanded", this._isOpen), this._isOpen ? this._legalInfoNode.element.removeAttribute("aria-hidden") : this._legalInfoNode.element.setAttribute("aria-hidden", "true"), this._tabbable()) : (this._elLegal.removeAttribute("aria-haspopover"), this._elLegal.removeAttribute("aria-expanded")) },
            _setPressedElement: function(t) { t = h.parentNodeForSvgTarget(t), this._isDown = !0, this._clearPressedElement(), (h.classList.contains(t, y.LEGAL_INFO_ITEM) || h.classList.contains(t, y.CLOSE)) && h.classList.add(t, y.PRESSED) },
            _clearPressedElement: function() {
                var t = this.element.querySelector("." + y.PRESSED);
                t && h.classList.remove(t, y.PRESSED)
            }
        })
    }, { "../configuration": 159, "../localizer": 182, "../map": 185, "../urls": 222, "../utils": 225, "./control": 162, "@maps/geometry/size": 71, "@maps/js-utils": 84, "@maps/render-tree": 102 }],
    165: [function(t, e, i) {
        function n() { this._logoElement = o.htmlElement("img", { class: u.LOGO }), l.call(this, o.htmlElement("div", { class: u.CONTROL }, this._logoElement)), h.addEventListener(h.Events.LocaleChanged, this) }
        var o = t("../utils"),
            s = t("@maps/js-utils"),
            a = t("../configuration"),
            r = t("../urls"),
            l = t("@maps/render-tree").Node,
            h = t("../localizer").l10n;
        e.exports = n;
        var c = r.createImageUrl("logos/logo"),
            u = { CONTROL: "mk-logo-control", LOGO: "mk-logo", LOGO_AUTONAVI: "mk-logo-autonavi" };
        n.prototype = s.inheritPrototype(l, n, {
            updateWithMapType: function(e) {
                var i = t("../map"),
                    n = e.toLowerCase() === i.MapTypes.Standard;
                this.mapType = e, this._logoElement.className = u.LOGO;
                var s = [c];
                "AutoNavi" === a.tileProvider && (o.classList.add(this._logoElement, u.LOGO_AUTONAVI), s.push("autonavi")), n || s.push("satellite"), this.rtl && s.push("rtl"), this._logoElement.src = o.imagePathForDevice([1, 2, 3], s.join("-")), this._logoElement.setAttribute("alt", h.get("Logo." + a.tileProvider + ".Tooltip"))
            },
            handleEvent: function(t) {
                switch (t.type) {
                    case h.Events.LocaleChanged:
                        this.rtl = t.locale.rtl, this._handleLocaleChange(t)
                }
            },
            mapWasDestroyed: function() { h.removeEventListener(h.Events.LocaleChanged, this) },
            _handleLocaleChange: function(t) { this.mapType && this.updateWithMapType(this.mapType) }
        })
    }, { "../configuration": 159, "../localizer": 182, "../map": 185, "../urls": 222, "../utils": 225, "@maps/js-utils": 84, "@maps/render-tree": 102 }],
    166: [function(t, e, i) {
        function n(t, e, i) {
            c.call(this, l.htmlElement("div", { class: g.CONTROL })), u.EventTarget(this), this._caretIcon = o(), this._checkmarkIcon = s(), ["Standard", "Hybrid", "Satellite"].forEach(function(i) {
                var n = new d.Node(l.htmlElement("div", { class: g.MAP_TYPE })),
                    o = "Mode." + i;
                n.element.setAttribute(m.MAP_TYPE, t[i]), n.element.setAttribute(m.L10N, o), n.element.textContent = p.get(o), t[i] === e && (this._mapType = e, this._updateActiveNode(n)), this.addChild(n)
            }, this), this._updateLabels(), this._updateAccessibilityState(), this.enabled = !0, this._delegate = i
        }

        function o() { return l.createSVGIcon(l.svgElement("path", { d: "M1,1 L4.5,4.5 L8,1" }), { viewBox: "0 0 9 6" }) }

        function s() { return l.createSVGIcon(l.svgElement("path", { d: "M3.76776695,8.47487373 L3.41421356,8.82842712 L2.70710678,8.12132034 L0.707106781,6.12132034 L0,5.41421356 L1.41421356,4 L2.12132034,4.70710678 L3.41421356,6 L8.70710678,0.707106781 L9.41421356,0 L10.8284271,1.41421356 L10.1213203,2.12132034 L4.12132034,8.12132034 L3.76776695,8.47487373 Z" }), { viewBox: "0 0 11 9" }) }

        function a(t) { t.focus(), t.setAttribute("tabindex", 0), t.setAttribute("aria-checked", !0) }

        function r(t) { t.blur(), t.setAttribute("tabindex", -1), t.setAttribute("aria-checked", !1) }
        var l = t("../utils"),
            h = t("@maps/js-utils"),
            c = t("./control"),
            u = t("@maps/dom-events"),
            d = t("@maps/render-tree"),
            p = t("../localizer").l10n;
        e.exports = n;
        var m = { MAP_TYPE: "data-map-type", L10N: "data-l10n-key" },
            g = { CONTROL: "mk-map-type-control", MAP_TYPES: "mk-map-types", MAP_TYPE: "mk-map-type", ACTIVE: "mk-active", PRESSED: "mk-pressed", OPEN: "mk-open", OPENING: "mk-opening", FOCUS: "mk-focus", SHOW_FOCUS: "mk-show-focus" };
        n.EVENTS = { MAPTYPE_CHANGE: "map-type-change" }, n.prototype = h.inheritPrototype(c, n, {
            constructor: n,
            _transitioning: !1,
            _shouldFocusOnClose: !0,
            _canShowFocusOutline: !0,
            _hadFocusOutline: !1,
            _pageLostFocus: !1,
            _activeMapTypeNode: null,
            _activeIcon: null,
            get mapType() { return this._mapType },
            set mapType(t) { t !== this._mapType && (this._mapType = t, this._updateDisplay(), this.dispatchEvent(new u.Event(n.EVENTS.MAPTYPE_CHANGE))) },
            handleEvent: function(t) {
                switch (t.type) {
                    case l.touchstartOrMousedown:
                        this.element.contains(t.target) ? this._shouldFocusOnClose = !0 : (this._shouldFocusOnClose = !1, this._close());
                        break;
                    case l.transitionend:
                        this._handleTransitionend(t)
                }
            },
            localeChanged: function(t) {
                this._updateLabels(), this.children.forEach(function(t) {
                    var e = t.element.getAttribute(m.L10N);
                    t.element.textContent = p.get(e)
                }), this._updateActiveIcon()
            },
            touchesBegan: function(t) {
                if (!this._transitioning) {
                    var e = l.parentNodeForSvgTarget(t.target);
                    this._updatePressedMapType(e), this._clearOutline(), this._isDown = !0, this._canShowFocusOutline = !1, this._open()
                }
            },
            touchesMoved: function(t) {
                if (this._isOpen && this._isDown) {
                    var e = l.parentNodeForSvgTarget(t.target);
                    this._updatePressedMapType(e)
                }
            },
            touchesEnded: function(t) {
                var e = l.parentNodeForSvgTarget(t.target);
                if (t.stopPropagation(), this._isDown = !1, this._clearPressedState(), Date.now() - this._openTime < 200) this._openTime = 0;
                else if (this._isOpen && !this._transitioning) {
                    this._shouldFocusOnClose = !0, this._canShowFocusOutline = !1;
                    var i = e.getAttribute(m.MAP_TYPE);
                    i && (this.mapType = i), this.reset()
                }
            },
            blurred: function(t) { setTimeout(function() { document.activeElement && "body" !== document.activeElement.tagName.toLowerCase() && !this.element.contains(document.activeElement) && (this._clearPressedState(), this._shouldFocusOnClose = !1, this._close()) }.bind(this), 0) },
            touchesCanceled: function(t) { this.reset() },
            spaceBarKeyDown: function(t) {
                var e = l.parentNodeForSvgTarget(t.target);
                this._isOpen || (e = this._activeMapTypeNode.element), this._updatePressedMapType(e), this._isDown = !0
            },
            spaceBarKeyUp: function(t) {
                var e = l.parentNodeForSvgTarget(t.target);
                this._isDown = !1, this._clearPressedState(), this._isOpen && l.classList.contains(e, g.MAP_TYPE) ? (this.mapType = e.getAttribute(m.MAP_TYPE), this.resetWithFocusOutline()) : this._isOpen || (this._canShowFocusOutline = !0, this._open())
            },
            escapeKeyDown: function(t) { this._isOpen && this.resetWithFocusOutline() },
            downArrowKeyUp: function(t) { this._handleUpAndDownArrows("down") },
            upArrowKeyUp: function(t) { this._handleUpAndDownArrows("up") },
            focused: function(t) {
                var e = l.parentNodeForSvgTarget(t.target),
                    i = this._canShowFocusOutline && !this._pageLostFocus || this._canShowFocusOutline && this._pageLostFocus && this._hadFocusOutline;
                this._hadFocusOutline = i, l.classList.toggle(this.element, g.SHOW_FOCUS, i), this._outlinedMapTypeNode || (this._outlinedMapTypeNode = this._activeMapTypeNode), this._isDown && i && this._updatePressedMapType(e)
            },
            pageDidFocus: function(t) { setTimeout(function() { this._pageLostFocus = !1 }.bind(this), 0) },
            pageDidBlur: function(t) { this._pageLostFocus = !0, this._clearPressedState(), this._close() },
            updateTintColor: function(t) { this.tintColor = t, this._activeMapTypeNode.element.style.color = this.tintColor, this._checkmarkIcon.style.fill = this.tintColor, this._caretIcon.style.stroke = this.tintColor, this._activeIcon.style[this._isOpen ? "fill" : "stroke"] = this.tintColor },
            reset: function() { this._close() },
            resetWithFocusOutline: function() { this._shouldFocusOnClose = !0, this._canShowFocusOutline = !0, this.reset() },
            removeEventListeners: function() { this.element.removeEventListener(l.transitionend, this) },
            addEventListeners: function() { this.element.addEventListener(l.transitionend, this) },
            _updateLabels: function() { l.updateLabel(this.element, p.get("MapType.Tooltip")) },
            _open: function() { this._isOpen || (window.addEventListener(l.touchstartOrMousedown, this, !0), this._isOpen = !0, this._openTime = Date.now(), this._transitioning = !0, l.classList.add(this.element, g.OPEN), this._updateActiveIcon(), l.classList.add(this.element, g.OPENING), this._delegate.mapTypeControlWasOpened()) },
            _close: function() { this._isOpen && (window.removeEventListener(l.touchstartOrMousedown, this, !0), delete this._isOpen, delete this._isDown, delete this._openTime, this._transitioning = !0, l.classList.remove(this.element, g.OPEN), this._updateActiveIcon(), this._clearOutline(), this._delegate.mapTypeControlWasClosed()) },
            _updateDisplay: function() {
                this.localeChanged();
                var t = this.findNode(function(t) { return t.element.getAttribute(m.MAP_TYPE) === this._mapType }, this);
                t && (this._updateActiveNode(t), this._updateAccessibilityState())
            },
            _updateActiveNode: function(t) { t !== this._activeMapTypeNode && (this._activeMapTypeNode && (this._activeMapTypeNode.element.style.removeProperty("color"), l.classList.remove(this._activeMapTypeNode.element, g.ACTIVE)), this._activeMapTypeNode = t, l.classList.add(t.element, g.ACTIVE), this._updateActiveIcon()) },
            _updateActiveIcon: function() { this._activeIcon && this._activeIcon.parentNode && this._activeIcon.parentNode.removeChild(this._activeIcon), this._activeMapTypeNode ? (this._activeIcon = this._isOpen ? this._checkmarkIcon : this._caretIcon, this._activeMapTypeNode.element.appendChild(this._activeIcon)) : this._activeIcon = null },
            _updatePressedMapType: function(t) { this._clearPressedState(), l.classList.contains(t, g.MAP_TYPE) && l.classList.add(t, g.PRESSED) },
            _handleLocaleChange: function() {
                this.children.forEach(function(t) {
                    var e = t.element.getAttribute(m.L10N);
                    t.element.textContent = p.get(e)
                }), this._updateActiveIcon()
            },
            _handleTransitionend: function() { this._updateAccessibilityState(), this._focusWhenClosed(), this.updateTintColor(this.tintColor), this._isOpen && this._activeMapTypeNode && a(this._activeMapTypeNode.element), delete this._transitioning, h.isIEAndNotEdge() ? setTimeout(function() { this._canShowFocusOutline = !0 }.bind(this), 0) : this._canShowFocusOutline = !0 },
            _handleUpAndDownArrows: function(t) {
                if (this._isOpen) {
                    var e, i = this.children.indexOf(this._outlinedMapTypeNode || this._activeMapTypeNode);
                    l.classList.contains(this.element, g.SHOW_FOCUS) ? e = "up" === t ? Math.max(0, i - 1) : Math.min(i + 1, this.children.length - 1) : (e = i, this._canShowFocusOutline = !0), this._clearOutline(), this._outlinedMapTypeNode = this.children[e], a(this._outlinedMapTypeNode.element)
                }
            },
            _clearOutline: function() { this._outlinedMapTypeNode && (r(this._outlinedMapTypeNode.element), this._outlinedMapTypeNode = null) },
            _clearPressedState: function() { this._clearState(g.PRESSED) },
            _clearState: function(t) {
                var e = this.findNode(function(e) { return l.classList.contains(e.element, t) });
                e && l.classList.remove(e.element, t)
            },
            _focusWhenClosed: function() { this._isOpen ? l.classList.remove(this.element, g.OPENING) : (this._shouldFocusOnClose && this.element.focus(), this._shouldFocusOnClose = !1) },
            _updateAccessibilityState: function() {
                this._isOpen ? (this.element.setAttribute("role", "menu"), this.element.setAttribute("aria-expanded", !0), this.element.setAttribute("tabindex", -1)) : (this.element.setAttribute("role", "button"), this.element.setAttribute("aria-expanded", !1), this.element.setAttribute("tabindex", 0)), this.children.forEach(function(t) {
                    var e = l.classList.contains(t.element, g.ACTIVE);
                    t.element.setAttribute("tabindex", e && this._isOpen ? 0 : -1), t.element.setAttribute("aria-checked", e && this._isOpen), this._isOpen ? (t.element.setAttribute("role", "menuitem"), t.element.removeAttribute("aria-hidden")) : (t.element.removeAttribute("role"), e || t.element.setAttribute("aria-hidden", !0))
                }, this)
            }
        })
    }, { "../localizer": 182, "../utils": 225, "./control": 162, "@maps/dom-events": 62, "@maps/js-utils": 84, "@maps/render-tree": 102 }],
    167: [function(t, e, i) {
        function n(t) {
            u.EventTarget(this), this.element = l.htmlElement("div", { class: y.CONTROL, role: "button", tabindex: 0 }), this._compassNode = new g.Node(r()), this.element.appendChild(this._compassNode.element);
            var e = l.htmlElement("img", { class: y.COMPASS, role: "presentation" });
            e.src = a(), this._compass = e, this._compassNode.element.appendChild(e);
            var i = l.htmlElement("div", { class: y.NORTH_INDICATOR });
            this._compassNode.element.appendChild(i), this._northIndicator = i, this._map = t, this._rotation = 0, this._activeKeyRightAt = null, this._activeKeyLeftAt = null, this._updateLabels(), this._setupGestureRecognizers(), c.call(this, this.element)
        }

        function o(t, e, i, n) {
            var o = e - n,
                a = t - i;
            return t > i ? e < n ? 90 + s(Math.atan(o / a)) : 180 - s(Math.atan(a / o)) : e < n ? 360 - s(Math.atan(a / o)) : 270 + s(Math.atan(o / a))
        }

        function s(t) { return 180 * t / Math.PI }

        function a(t) { var e = t || l.devicePixelRatio; return e = h.clamp(Math.floor(e), 1, 3), d.createImageUrl("icons/compass_" + e + "x.png") }

        function r() { return l.htmlElement("div", { class: y.WRAPPER }) }
        var l = t("../utils"),
            h = t("@maps/js-utils"),
            c = t("./control"),
            u = t("@maps/dom-events"),
            d = t("../urls"),
            p = t("../localizer").l10n,
            m = t("@maps/gesture-recognizers"),
            g = t("@maps/render-tree"),
            _ = t("@maps/scheduler"),
            f = t("../configuration"),
            y = { CONTROL: "mk-rotation-control", ROTATION: "mk-rotation", COMPASS: "mk-compass", PRESSED: "mk-pressed", NORTH_INDICATOR: "mk-north-indicator", LONG_NORTH_INDICATOR: "mk-north-indicator-long", WRAPPER: "mk-rotation-wrapper" };
        n.prototype = h.inheritPrototype(c, n, {
            set rotation(t) { this._rotation = t, this._rotateTo(t) },
            localeChanged: function(t) { this._updateLabels() },
            mapWasDestroyed: function() { delete this._map },
            updateTintColor: function(t) { this.tintColor !== t && (this.tintColor = t, this._northIndicator.style.color = t) },
            updateImage: function(t) { this._compass.src = a(t) },
            reset: function(t) { this._map && this._center && this._map.compassDraggingDidEnd(), l.classList.remove(this.element, y.PRESSED), !t || t.target !== this._tapRecognizer && t.keyCode !== h.KeyCodes.UpArrow && t.keyCode !== h.KeyCodes.SpaceBar || this._map.setRotationAnimated(0, !0), delete this._angleOffset },
            spaceBarKeyDown: function() { this.reset(event) },
            upArrowKeyUp: function(t) { this.reset(t) },
            rightArrowKeyDown: function(t) { this._beginKeyboardRotate(t) },
            rightArrowKeyUp: function(t) { this._endKeyboardRotate(t) },
            leftArrowKeyDown: function(t) { this._beginKeyboardRotate(t) },
            leftArrowKeyUp: function(t) { this._endKeyboardRotate(t) },
            performScheduledUpdate: function() {
                if (!this._activeKeyRightAt && !this._activeKeyLeftAt) return !1;
                this._keyboardRotate(), _.scheduleOnNextFrame(this)
            },
            handleEvent: function(t) {
                switch (t.target) {
                    case this._tapRecognizer:
                        t.target.state === m.States.Recognized && this.reset(t);
                        break;
                    case this._panRecognizer:
                        t.target.state === m.States.Possible ? this._beginDrag(t) : t.target.state === m.States.Changed ? this._drag(t) : t.target.state !== m.States.Recognized && t.target.state !== m.States.Failed || this.reset(t)
                }
            },
            fadeIn: function() { this.element.style.opacity = 1 },
            fadeOut: function() { this.element.style.opacity = 0 },
            _updateLabels: function(t) { this._northIndicator.textContent = p.get("Compass.NorthIndicator"), l.updateLabel(this.element, p.get("Compass.Tooltip")), "ar" === f.language || "th" === f.language ? l.classList.add(this._northIndicator, y.LONG_NORTH_INDICATOR) : l.classList.remove(this._northIndicator, y.LONG_NORTH_INDICATOR) },
            _rotateTo: function(t) { return Math.abs(t) < 5 && (t = 0), this._compassNode.transform = "rotate(" + t + "deg)", t },
            _setupGestureRecognizers: function() {
                var t = new m.Tap;
                t.numberOfTapsRequired = 1, t.addEventListener("statechange", this), t.target = this.element, this._tapRecognizer = t;
                var e = new m.Pan;
                e.addEventListener("statechange", this), e.target = this.element, this._panRecognizer = e
            },
            removeEventListeners: function() { this._tapRecognizer.removeEventListener("statechange", this), this._tapRecognizer.enabled = !1, this._tapRecognizer.target = null, this._panRecognizer.removeEventListener("statechange", this), this._panRecognizer.enabled = !1, this._panRecognizer.target = null },
            _beginDrag: function(t) {
                var e = this.element.getBoundingClientRect();
                this._center = { x: e.right - e.width / 2, y: e.bottom - e.height / 2 }, this._map.compassDraggingWillStart(), l.classList.add(this.element, y.PRESSED), this._angleOffset = o(t.target.locationInClient().x, t.target.locationInClient().y, this._center.x, this._center.y) - this._map.rotation
            },
            _drag: function(t) {
                var e = o(t.target.locationInClient().x, t.target.locationInClient().y, this._center.x, this._center.y) - this._angleOffset;
                e = this._rotateTo(e), this._map.setRotationAnimated(e, !1, !0)
            },
            _beginKeyboardRotate: function(t) {
                var e = this._activeKeyRightAt && t.keyCode === h.KeyCodes.RightArrow,
                    i = this._activeKeyLeftAt && t.keyCode === h.KeyCodes.LeftArrow;
                if (!e && !i) {
                    var n = Date.now();
                    t.keyCode === h.KeyCodes.RightArrow ? this._activeKeyRightAt = n : this._activeKeyLeftAt = n, this._timeAtLastFrame = n, _.scheduleASAP(this)
                }
            },
            _keyboardRotate: function() {
                var t = Math.max(this._activeKeyRightAt || 0, this._activeKeyLeftAt || 0);
                if (t && this._timeAtLastFrame) {
                    var e = Date.now(),
                        i = this._rotation,
                        n = e - this._timeAtLastFrame;
                    i += (4 * (t === this._activeKeyLeftAt) ? -1 : 1) * (60 * n) / 1e3, this._map.rotation = i, this._timeAtLastFrame = Date.now()
                }
            },
            _endKeyboardRotate: function(t) { t.keyCode === h.KeyCodes.RightArrow ? this._activeKeyRightAt = null : this._activeKeyLeftAt = null, this._activeKeyRightAt || this._activeKeyLeftAt || (this._timeAtLastFrame = null) }
        }), e.exports = n
    }, { "../configuration": 159, "../localizer": 182, "../urls": 222, "../utils": 225, "./control": 162, "@maps/dom-events": 62, "@maps/gesture-recognizers": 72, "@maps/js-utils": 84, "@maps/render-tree": 102, "@maps/scheduler": 106 }],
    168: [function(t, e, i) {
        function n(t) { this._map = t, this.scene = new u.Scene, this.scene.size = m, this.node = this.scene.addChild(new c), this.node.size = m, this.node.position = new h(0, 0), this.node.opacity = 0, this.node.l10n = r, o.call(this, this.scene.element), this.element.classList.add(g.Control), this.size = m }
        var o = t("./control"),
            s = t("../../../lib/geo"),
            a = t("@maps/js-utils"),
            r = t("../localizer").l10n,
            l = t("@maps/device-pixel-ratio"),
            h = t("@maps/geometry/point"),
            c = t("../../../lib/scale-node"),
            u = t("../../../lib/scene-graph"),
            d = t("@maps/geometry/size"),
            p = t("../constants").FeatureVisibility,
            m = new d(170, 20),
            g = { Control: "mk-scale" };
        n.prototype = a.inheritPrototype(o, n, {
            get shouldDisplayScale() { return this._map._showsScale === p.Visible || this._map._showsScale === p.Adaptive && this._map.cameraIsZooming },
            updateThemeForMap: function(e) {
                var i = t("../map");
                this.node.theme = c.Themes[e._mapType === i.MapTypes.Standard ? "Light" : "Dark"]
            },
            update: function() {
                var t = this._map;
                if (this.node && this.shouldDisplayScale) {
                    var e = t.renderingMapRect.origin.toCoordinate().latitude,
                        i = t.renderingMapRect.size.width / s.mapUnitsPerMeterAtLatitude(e);
                    i / t._visibleFrame.size.width * l() >= 7500 ? this.hideIfNeeded(!0) : (this.node.distance = i, this.node.setOpacityAnimated(1, !1))
                }
            },
            hideIfNeeded: function(t) {!this.node || this.shouldDisplayScale && !t || this.node.setOpacityAnimated(0, !0) }
        }), e.exports = n
    }, { "../../../lib/geo": 2, "../../../lib/scale-node": 37, "../../../lib/scene-graph": 47, "../constants": 161, "../localizer": 182, "../map": 185, "./control": 162, "@maps/device-pixel-ratio": 61, "@maps/geometry/point": 69, "@maps/geometry/size": 71, "@maps/js-utils": 84 }],
    169: [function(t, e, i) {
        function n(t, e) { h.call(this, a.htmlElement("div", { class: g.CONTROL, role: "button", tabindex: "0" })), c.EventTarget(this), this._arrowIconNode = new d.Node(o()), this._waitingIconNode = new d.Node(s()), this.element.appendChild(this._arrowIconNode.element), this.element.appendChild(this._waitingIconNode.element), this._updateLabels(), this.updateIcons(a.devicePixelRatio), this._map = t, this._showsErrorMessage = !1, this._rtl = e }

        function o() {
            var t = a.svgElement("path"),
                e = a.createSVGIcon(t);
            return t.parentNode.appendChild(a.svgElement("path")), e.setAttribute("class", e.getAttribute("class") + " " + g.ARROW_ICON), e
        }

        function s() {
            var t = a.svgElement("path");
            t.setAttribute("d", "M14.5732357,10 C13.5436447,12.9129809 10.7655471,15 7.5,15 C3.35786438,15 0,11.6421356 0,7.5 C0,3.35786438 3.35786438,0 7.5,0 C10.7655471,0 13.5436447,2.08701907 14.5732357,5 L13.5018367,5 C12.522277,2.65104815 10.20395,1 7.5,1 C3.91014913,1 1,3.91014913 1,7.5 C1,11.0898509 3.91014913,14 7.5,14 C10.20395,14 12.522277,12.3489518 13.5018367,10 L14.5732357,10 L14.5732357,10 Z");
            var e = a.createSVGIcon(t, { viewBox: "0 0 15 15" });
            return e.setAttribute("class", e.getAttribute("class") + " " + g.WAITING_ICON), e
        }
        var a = t("../utils"),
            r = t("@maps/scheduler"),
            l = t("@maps/js-utils"),
            h = t("./control"),
            c = t("@maps/dom-events"),
            u = t("../localizer").l10n,
            d = t("@maps/render-tree");
        e.exports = n;
        var p = .3,
            m = { "1x": ["M0,6 L8,6 L8,14 L14,0 Z", "M3.65,5.25 L8.75,5.25 L8.75,10.35 L12.6,1.4 Z"], "2x": ["M0,12 L16,12 L16,28 L28,0 Z", "M7.3,10.5 L17.5,10.5 L17.5,20.7 L25.2,2.8 Z"], "3x": ["M0,18 L24,18 L24,42 L42,0 Z", "M10.95,15.75 L26.25,15.75 L26.25,31.05 L37.8,4.2 Z"] },
            g = { CONTROL: "mk-user-location-control", BUTTON_USER_LOCATION: "mk-user-location-button", PRESSED: "mk-pressed", TRACKING: "mk-tracking", WAITING: "mk-waiting", DISABLED: "mk-disabled", WAITING_ICON: "mk-icon-waiting", ARROW_ICON: "mk-icon-arrow", ERROR: "mk-error-message", ERROR_TEXT: "mk-error-text", ERROR_SUPPORT: "mk-error-support", ERROR_ANIMATE_IN: "mk-error-message-pop" };
        n.States = { Default: "default", Waiting: "waiting", Tracking: "tracking", Disabled: "disabled" }, n.EVENTS = { PRESSED: "pressed" }, n.prototype = l.inheritPrototype(h, n, {
            _state: n.States.Default,
            _tintColor: "",
            _arrowIconDurationMs: 200,
            _waitingIconDurationMs: 200,
            _waitingIconCycleTimeMs: 1500,
            get state() { return this._state },
            set state(t) { this._state !== t && (this._state = t, a.classList.toggle(this.element, g.TRACKING, this.isTrackingState()), a.classList.toggle(this.element, g.WAITING, this.isWaitingState()), a.classList.toggle(this.element, g.DISABLED, this.isDisabledState()), this.updateTintColor(this._tintColor), !this.isWaitingState() && this._waitingIconInStart && (this._waitingIconOutStart = Date.now(), r.scheduleOnNextFrame(this)), this.isWaitingState() && (this._arrowIconOutStart = Date.now(), r.scheduleOnNextFrame(this)), this.isDisabledState() ? this._arrowIconNode.opacity = p : this._arrowIconNode.opacity = 1) },
            isDefaultState: function() { return this.state === n.States.Default },
            toDefaultState: function() { this.state = n.States.Default, this._removeErrorMessage() },
            isTrackingState: function() { return this.state === n.States.Tracking },
            toTrackingState: function() { this.state = n.States.Tracking, this._removeErrorMessage() },
            isWaitingState: function() { return this.state === n.States.Waiting },
            toWaitingState: function() { this.state = n.States.Waiting },
            isDisabledState: function() { return this.state === n.States.Disabled },
            toDisabledState: function() {
                if (!this._map.tracksUserLocation || !this._map.userLocationAnnotation)
                    if (this.state = n.States.Disabled, this._showsErrorMessage) this._removeErrorMessage();
                    else {
                        if (0 === this.element.getBoundingClientRect().width) return;
                        this._errorMessageNode || (this._errorMessageElement = this._createErrorMessageElement(), this._errorMessageNode = new d.Node(this._errorMessageElement)), this._addUpdatedErrorMessage()
                    }
            },
            handleEvent: function(t) {
                switch (t.type) {
                    case a.touchstartOrMousedown:
                        t.target === this._errorMessageElement || this._errorMessageElement.contains(t.target) || (this._removeErrorMessage(), window.removeEventListener(a.touchstartOrMousedown, this, !0));
                        break;
                    case "animationend":
                    case "webkitAnimationEnd":
                        "mk-fadeout" === t.animationName && this._errorMessageNode.remove(), this._errorMessageElement.removeEventListener("animationend", this), this._errorMessageElement.removeEventListener("webkitAnimationEnd", this);
                        break;
                    case "keydown":
                        27 === t.keyCode && this._removeErrorMessage(), window.removeEventListener("keydown", this, !0)
                }
            },
            touchesBegan: function(t) { this._pressed(t) },
            touchesEnded: function(t) { this.reset(), this.dispatchEvent(new c.Event(n.EVENTS.PRESSED)) },
            touchesCanceled: function(t) { this.reset() },
            spaceBarKeyDown: function(t) { this._pressed(t) },
            spaceBarKeyUp: function(t) { this.reset(t), this.dispatchEvent(new c.Event(n.EVENTS.PRESSED)) },
            updateTintColor: function(t) { this._tintColor = t, this._arrowIconNode.element.querySelector("g").style.fill = this.isTrackingState() ? "" : t, this._waitingIconNode.element.querySelector("g").style.fill = t, this.element.style.backgroundColor = this.isTrackingState() ? t : "" },
            updateIcons: function(t) {
                var e = 14 * (t = t || 1);
                this._arrowIconNode.element.setAttribute("viewBox", [0, 0, e, e].join(" "));
                for (var i = this._arrowIconNode.element.querySelectorAll("path"), n = 0, o = i.length; n < o; ++n) i[n].setAttribute("d", m[t + "x"][n])
            },
            reset: function() { a.classList.contains(this.element, g.PRESSED) && (a.classList.remove(this.element, g.PRESSED), this.isDefaultState() ? this.toWaitingState() : this.isDisabledState() ? this.toWaitingState() : this.toDefaultState()), delete this._mousedown, window.removeEventListener(a.touchendOrMouseup, this), a.supportsTouches && window.removeEventListener("touchcancel", this) },
            localeChanged: function(t) { this._updateLabels(), this._rtl = t.locale.rtl, this._showsErrorMessage && (this._removeErrorMessage(), this._addUpdatedErrorMessage()) },
            remove: function() { this._removeErrorMessage(), h.prototype.remove.call(this) },
            performScheduledUpdate: function() { this._arrowIconOutStart && this._animateArrowIconOut(), this._waitingIconInStart && this._animateWaitingIconIn(), this._waitingIconOutStart && this._animateWaitingIconOut(), this._waitingIconSpinStart && this._animateWaitingIconSpin() },
            mapWasDestroyed: function() { delete this._map },
            blurred: function(t) { this._removeErrorMessage() },
            _updateLabels: function() { a.updateLabel(this.element, u.get("Track.User.Location.Tooltip")) },
            _pressed: function(t) {
                var e = a.parentNodeForSvgTarget(t.target);
                a.classList.add(e, g.PRESSED)
            },
            _animateArrowIconOut: function() {
                var t = Math.min((Date.now() - this._arrowIconOutStart) / this._arrowIconDurationMs, 1),
                    e = Math.max(0, 1 - t);
                this._arrowIconNode.opacity = e, this._arrowIconNode.transform = "scale(" + e + ")", this.isWaitingState() && !this._waitingIconInStart && t > .15 && (this._waitingIconInStart = Date.now(), r.scheduleOnNextFrame(this)), this.isWaitingState() || (delete this._arrowIconOutStart, this._arrowIconNode.opacity = this.isDisabledState() ? p : 1, this._arrowIconNode.transform = "scale(1)"), t < 1 ? r.scheduleOnNextFrame(this) : delete this._arrowIconOutStart
            },
            _animateWaitingIconIn: function() {
                var t = Math.min((Date.now() - this._waitingIconInStart) / this._waitingIconDurationMs, 1),
                    e = Math.min(1, t);
                this._waitingIconNode.opacity = e, this._waitingIconNode.transform = "scale(" + e + ")", t < 1 ? r.scheduleOnNextFrame(this) : (delete this._waitingIconInStart, this.isWaitingState() && (this._waitingIconSpinStart = Date.now(), r.scheduleOnNextFrame(this)))
            },
            _animateWaitingIconOut: function() {
                var t = Math.min((Date.now() - this._waitingIconOutStart) / this._waitingIconDurationMs, 1),
                    e = Math.max(0, 1 - t);
                this._waitingIconNode.opacity = e, this._waitingIconNode.transform = "scale(" + e + ")", t < 1 ? r.scheduleOnNextFrame(this) : (delete this._waitingIconOutStart, this._arrowIconNode.opacity = this.isDisabledState() ? p : 1, this._arrowIconNode.transform = "scale(1)")
            },
            _animateWaitingIconSpin: function() {
                var t = (Date.now() - this._waitingIconSpinStart) % this._waitingIconCycleTimeMs / this._waitingIconCycleTimeMs,
                    e = 2 * Math.PI * t;
                this._waitingIconNode.transform = "rotate(" + e + "rad)", this.isWaitingState() ? r.scheduleOnNextFrame(this) : (delete this._waitingIconSpinStart, this._waitingIconOutStart = Date.now(), r.scheduleOnNextFrame(this))
            },
            _createErrorMessageElement: function() { var t = a.htmlElement("div", { class: g.ERROR }); return this._supportLink = a.htmlElement("a", { class: g.ERROR_SUPPORT, target: "__blank" }), t.appendChild(a.htmlElement("span", { class: g.ERROR_TEXT })), t.appendChild(this._supportLink), t },
            _updateErrorMessage: function() { this._errorMessageElement.getElementsByClassName(g.ERROR_TEXT)[0].textContent = u.get("Location.Error.Message") + " ", this._supportLink.textContent = u.get("Location.Error.Support.Label"), this._supportLink.href = u.get("Location.Error.Support.URL") },
            _positionErrorMessage: function() {
                var t, e, i = this.element.getBoundingClientRect(),
                    n = this._map.element.getBoundingClientRect();
                t = "left" === this._messagePlacementSide() ? i.left + i.width + 9 - n.left - this._map.padding.left : n.right - i.right + 9 + i.width - this._map.padding.right, e = n.bottom - i.bottom - this._map.padding.bottom, this._errorMessageElement.removeAttribute("style"), this._errorMessageElement.style[this._messagePlacementSide()] = t + "px", this._errorMessageElement.style.bottom = e + "px"
            },
            _addUpdatedErrorMessage: function() { this._showsErrorMessage = !0, this._updateErrorMessage(), this._positionErrorMessage(), this._animateErrorMessageIn(), this.parent.parent.addChild(this._errorMessageNode), window.addEventListener(a.touchstartOrMousedown, this, !0), window.addEventListener("keydown", this, !0) },
            _removeErrorMessage: function() { this._errorMessageNode && (a.classList.remove(this._errorMessageElement, g.ERROR_ANIMATE_IN), this._showsErrorMessage = !1, this._errorMessageElement.style.webkitAnimation = this._errorMessageElement.style.animation = "mk-fadeout 300ms ease-out", this._errorMessageElement.style.webkitAnimationName || this._errorMessageElement.style.animationName ? (this._errorMessageElement.addEventListener("animationend", this), this._errorMessageElement.addEventListener("webkitAnimationEnd", this)) : this._errorMessageNode.remove(), window.removeEventListener(a.touchstartOrMousedown, this, !0)) },
            _animateErrorMessageIn: function() { a.classList.remove(this._errorMessageElement, g.ERROR_ANIMATE_OUT), a.classList.add(this._errorMessageElement, g.ERROR_ANIMATE_IN) },
            _messagePlacementSide: function() { return this._rtl ? "left" : "right" }
        })
    }, { "../localizer": 182, "../utils": 225, "./control": 162, "@maps/dom-events": 62, "@maps/js-utils": 84, "@maps/render-tree": 102, "@maps/scheduler": 106 }],
    170: [function(t, e, i) {
        function n() {
            c.EventTarget(this);
            var t = r.htmlElement("div", { class: d.CONTROL });
            this._zoomOutButton = t.appendChild(r.htmlElement("div", { class: d.BUTTON_ZOOM_OUT, role: "button", tabindex: "0" })), this._zoomOutButton.appendChild(a()), t.appendChild(r.htmlElement("div", { class: d.BUTTON_DIVIDER })), this._zoomInButton = t.appendChild(r.htmlElement("div", { class: d.BUTTON_ZOOM_IN, role: "button", tabindex: "0" })), this._zoomInButton.appendChild(s()), this._updateLabels(), h.call(this, t)
        }

        function o(t, e) { e ? (r.classList.remove(t, d.DISABLED), t.removeAttribute("aria-disabled"), t.setAttribute("tabindex", 0)) : (r.classList.add(t, d.DISABLED), t.setAttribute("aria-disabled", "true"), t.setAttribute("tabindex", -1)) }

        function s() { var t = r.svgElement("path"); return t.setAttribute("d", "M7,6 L7,1 L6,1 L6,6 L1,6 L1,7 L6,7 L6,12 L7,12 L7,7 L12,7 L12,6 L7,6 Z"), r.createSVGIcon(t, { viewBox: "0 0 13 13" }) }

        function a() { var t = r.svgElement("rect", { x: 1, y: 6, width: 12, height: 1 }); return r.createSVGIcon(t, { viewBox: "0 0 13 13" }) }
        var r = t("../utils"),
            l = t("@maps/js-utils"),
            h = t("./control"),
            c = t("@maps/dom-events"),
            u = t("../localizer").l10n;
        e.exports = n;
        var d = { CONTROL: "mk-zoom-controls", BUTTON_DIVIDER: "mk-divider", BUTTON_ZOOM_IN: "mk-zoom-in", BUTTON_ZOOM_OUT: "mk-zoom-out", PRESSED: "mk-pressed", DISABLED: "mk-disabled" };
        n.EVENTS = { ZOOM_START: "zoom-start", ZOOM_END: "zoom-end" }, n.prototype = l.inheritPrototype(h, n, {
            _zoomInEnabled: !0,
            _zoomOutEnabled: !0,
            get zoomInEnabled() { return this._zoomInEnabled },
            set zoomInEnabled(t) { this._enabled && t === this._zoomInEnabled || (this._zoomInEnabled = this._enabled && t, o(this._zoomInButton, this._zoomInEnabled)) },
            get zoomOutEnabled() { return this._zoomOutEnabled },
            set zoomOutEnabled(t) { this._enabled && t === this._zoomOutEnabled || (this._zoomOutEnabled = this._enabled && t, o(this._zoomOutButton, this._zoomOutEnabled)) },
            localeChanged: function(t) { this._updateLabels() },
            touchesBegan: function(t) { this._pressed(t) },
            touchesEnded: function(t) { this.reset(t) },
            touchesCanceled: function(t) { this.reset(t) },
            focused: function(t) { this.updateTintColor(this.tintColor), t.target.style.fill = r.focusColor },
            blurred: function(t) { this.updateTintColor(this.tintColor) },
            spaceBarKeyDown: function(t) { this._pressed(t) },
            spaceBarKeyUp: function(t) { this.reset(t) },
            updateTintColor: function(t) { this.tintColor = t, this._zoomInButton.querySelector(".mk-icon").style.fill = t, this._zoomOutButton.querySelector(".mk-icon").style.fill = t },
            reset: function(t) {
                var e = this.element.querySelector("." + d.PRESSED);
                if (e) {
                    var i = Date.now() - this._zoomStartTimestamp;
                    r.classList.remove(e, d.PRESSED);
                    var o = new c.Event(n.EVENTS.ZOOM_END);
                    o.dt = i, this.dispatchEvent(o)
                }
                t && t.keyCode !== l.KeyCodes.SpaceBar && this.blurFocusedElement(), delete this._zoomStartTimestamp, window.removeEventListener(r.touchendOrMouseup, this), r.supportsTouches && window.removeEventListener("touchcancel", this)
            },
            _clearLabels: function(t) { r.updateLabel(this._zoomInButton, ""), r.updateLabel(this._zoomOutButton, "") },
            _updateLabels: function(t) { r.updateLabel(this._zoomInButton, u.get("Zoom.In.Tooltip")), r.updateLabel(this._zoomOutButton, u.get("Zoom.Out.Tooltip")) },
            _pressed: function(t) {
                var e = r.parentNodeForSvgTarget(t.target);
                r.classList.add(e, d.PRESSED), this._zoomStartTimestamp = Date.now();
                var i = new c.Event(n.EVENTS.ZOOM_START);
                i.zoomIn = r.classList.contains(e, d.BUTTON_ZOOM_IN), this.dispatchEvent(i)
            }
        })
    }, { "../localizer": 182, "../utils": 225, "./control": 162, "@maps/dom-events": 62, "@maps/js-utils": 84 }],
    171: [function(t, e, i) {
        "use strict";

        function n(t, e, i) {
            new r(e, {
                getDataToSend: function() { return t },
                loaderDidSucceed: function(t, e) {
                    if (e.status < 200 || e.status >= 300) i(new Error("HTTP error:" + e.status));
                    else try { i(null, JSON.parse(e.responseText)) }
                    catch (t) { return void i(new Error("Failed to parse response: " + e.responseText)) }
                },
                loaderDidFail: function(t, e) { i(new Error("Network error")) }
            }, { method: "POST" }).schedule()
        }

        function o(t) {
            var e = t.toMapPoint(),
                i = c * a.tileSize;
            return { x: Math.floor(e.x * i), y: Math.floor(e.y * i), z: h }
        }

        function s(t) {
            function e(t) { return t / c / a.tileSize }
            return new l(e(t.x), e(t.y)).toCoordinate()
        }
        var a = t("../../lib/geo"),
            r = t("@maps/loaders").XHRLoader,
            l = a.MapPoint,
            h = 21,
            c = Math.pow(2, h);
        i.shift = function(t, e, i) { n(JSON.stringify({ pixelPoint: o(t) }), e, function(t, e) { t ? i(new Error) : e && e.shiftedPixelPoint ? i(null, s(e.shiftedPixelPoint)) : i(new Error) }) }
    }, { "../../lib/geo": 2, "@maps/loaders": 85 }],
    172: [function(t, e, i) { e.exports = '.mk-map-view{width:100%;height:100%;overflow:hidden;-webkit-tap-highlight-color:transparent}.mk-map-view.mk-dragging-annotation{cursor:none}.mk-map-view img{padding:0}.mk-map-view.mk-dragging-annotation .mk-legal,.mk-map-view.mk-dragging-annotation .mk-map-type,.mk-map-view.mk-dragging-annotation .mk-user-location-control,.mk-map-view.mk-dragging-annotation .mk-zoom-in,.mk-map-view.mk-dragging-annotation .mk-zoom-out{cursor:none}.mk-annotation-container,.mk-map-view{z-index:0}.mk-map-view>*{position:absolute;-webkit-user-select:none;-moz-user-select:none}.mk-map-node-element{background-color:rgba(0,0,0,0)}.mk-map-view .rt-root{left:0;letter-spacing:.3px}.mk-map-view .mk-annotation-container,.mk-map-view .mk-controls-container{-ms-user-select:text}.mk-map-view .mk-annotation-container.mk-dragging ::selection,.mk-map-view .mk-annotation-container>div:first-child ::selection,.mk-map-view .mk-controls-container ::selection,.mk-map-view.mk-panning ::selection{background:0 0}.mk-map-view.mk-dragging-cursor{cursor:pointer;cursor:-moz-grabbing;cursor:-webkit-grabbing;cursor:grabbing}.mk-map-view>iframe{width:100%;height:100%;pointer-events:none;opacity:0;border:0}.mk-map-view>.mk-grid{width:100%;height:100%}.mk-map-view .mk-tile-grid{position:absolute;pointer-events:none;background-repeat:no-repeat}.mk-invisible{opacity:0;pointer-events:none}.mk-hidden{display:none}.mk-annotation-container{direction:ltr}.mk-annotation-container>div,.mk-annotation-container>div>*{position:absolute;top:0;left:0}.mk-annotation-container .mk-selected{z-index:1}.mk-annotation-container .mk-lifted{z-index:2}.mk-callout{position:absolute;top:0;left:0;pointer-events:auto;-webkit-user-select:auto;-moz-user-select:text;-ms-user-select:text}.mk-callout>*{position:absolute;top:0;left:0}svg.mk-bubble{display:block;width:100%;height:100%}div.mk-callout-accessory{position:absolute;top:50%;-webkit-transform:translateY(-50%);-ms-transform:translateY(-50%);transform:translateY(-50%);overflow:hidden}div.mk-callout-accessory-content{white-space:nowrap;position:relative;text-align:center;font-size:12px}div.mk-callout-accessory:first-child{left:0}div.mk-callout-accessory:last-child{right:0}div.mk-callout-accessory:first-child .mk-callout-accessory-content{padding-right:8px}div.mk-callout-accessory:last-child .mk-callout-accessory-content{padding-left:8px}div.mk-callout-accessory:first-child+.mk-callout-content{padding-left:8px}div.mk-standard .mk-callout-content:nth-last-child(2){padding-right:8px}div.mk-standard{font-family:"-apple-system",BlinkMacSystemFont,"Helvetica Neue",Helvetica,Arial,sans-serif;box-sizing:border-box;position:relative}div.mk-custom-content,div.mk-standard{-webkit-transform:translateY(-50%);-ms-transform:translateY(-50%);transform:translateY(-50%)}div.mk-standard .mk-callout-content>div{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}div.mk-standard .mk-callout-content{padding:0 4px}div.mk-standard .mk-title{font-size:17px;font-weight:500;color:#000;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:.025em}div.mk-standard.mk-no-subtitle.mk-no-accessories .mk-title{text-align:center}div.mk-standard .mk-subtitle{font-size:13px;color:rgba(0,0,0,.7);letter-spacing:.025em}svg.mk-bubble path{fill:#fff;stroke:rgba(0,0,0,.2)}.mk-top-left-controls-container,.mk-top-right-controls-container{position:absolute;top:12px;left:12px}.mk-top-right-controls-container{left:auto;right:12px}.mk-bottom-right-controls-container .mk-control:last-child.mk-user-location-control{right:0}.mk-control.mk-pressed{background:#ededed}.mk-scale{vertical-align:top}.mk-user-location-control{position:absolute;right:60px;bottom:0;cursor:pointer;position:relative;width:23px;height:23px;background-color:#fff;box-shadow:0 0 0 1px #bfbfbf;border-radius:4px;pointer-events:auto;margin:0;-webkit-transition:background-color .2s ease;-ms-transition:background-color .2s ease;transition:background-color .2s ease}.mk-user-location-control .mk-icon{pointer-events:none;position:absolute;top:0;left:0;width:14px;height:14px;margin:5px 5px 4px 4px}.mk-user-location-control .mk-icon-waiting{opacity:0;top:-1px;left:1px}.mk-user-location-control .mk-icon path:nth-child(2){fill:#fff}.mk-user-location-control.mk-tracking{box-shadow:0 0 0 1px rgba(255,255,255,.7);background-color:#007aff}.mk-user-location-control.mk-tracking .mk-icon{fill:#fff}.mk-user-location-control.mk-focus{box-shadow:0 0 0 3px rgba(0,122,255,.2),0 0 0 1px #007aff}.mk-user-location-control.mk-pressed.mk-focus{background-color:#e0ecfa}.mk-user-location-control.mk-tracking.mk-focus{background-color:#007aff;box-shadow:0 0 0 3px rgba(0,122,255,.2)}.mk-user-location-control.mk-focus:not(.mk-tracking) .mk-icon{fill:#007aff;fill-rule:nonzero}.mk-error-message{font-family:"-apple-system-font","Helvetica Neue",Helvetica,Arial,sans-serif;position:absolute;background-color:rgba(250,250,250,.95);color:#333;font-size:13px;bottom:0;box-shadow:0 0 0 1px #bfbfbf;opacity:0;border-radius:5px;padding:7px;max-width:250px;pointer-events:auto;-webkit-transform-origin:100% 50% 0;transform-origin:100% 50% 0}.mk-error-support{white-space:nowrap}.mk-error-message-pop{-webkit-animation-name:mk-pop;animation-name:mk-pop;-webkit-animation-duration:.7s;animation-duration:.7s;-webkit-animation-timing-function:ease-in;animation-timing-function:ease-in;-webkit-animation-fill-mode:forwards;animation-fill-mode:forwards}@-webkit-keyframes mk-pop{0%{-webkit-transform:translate3d(0,0,0) scale3d(.01,.05,1);opacity:0}50%{opacity:0}70%{-webkit-transform:scale3d(1.1,1.1,1)}85%{-webkit-transform:scale3d(.95,.95,1)}100%{-webkit-transform:translate3d(0,0,0) scale3d(1,1,1);opacity:1}}@keyframes mk-pop{0%{transform:translate3d(0,0,0) scale3d(.01,.05,1);opacity:0}50%{opacity:0}70%{transform:scale3d(1.1,1.1,1)}85%{transform:scale3d(.95,.95,1)}100%{transform:translate3d(0,0,0) scale3d(1,1,1);opacity:1}}.mk-controls-container{position:absolute;overflow:hidden;top:0;bottom:0;left:0;right:0;z-index:3;pointer-events:none}.mk-controls-container :focus{outline:0}.mk-logo-control{position:absolute;bottom:0;left:0}.mk-logo-control .mk-logo{vertical-align:bottom;width:40px;height:46px;margin:0}.mk-logo-control .mk-logo.mk-logo-autonavi{width:68px;height:45px}.mk-bottom-right-controls-container{position:absolute;bottom:12px;right:12px}.mk-bottom-right-controls-container .mk-control:last-child.mk-rotation-control{bottom:-2px}.mk-legal-controls{display:inline-block;vertical-align:top;margin-bottom:2px;pointer-events:auto;overflow:hidden}.mk-legal-controls .mk-pressed{background:rgba(0,0,0,.07)}.mk-legal-controls .mk-legal{color:rgba(0,0,0,.7);font:9px "-apple-system-font","Helvetica Neue",Helvetica,Arial,sans-serif;font-weight:500;text-decoration:underline;text-shadow:0 0 1px rgba(255,255,255,.85);pointer-events:auto;white-space:nowrap;cursor:pointer;padding:4px 5px 6px 5px}.mk-legal-controls .mk-legal.mk-legal-satellite{color:rgba(255,255,255,.9);text-shadow:0 0 1px rgba(0,0,0,.5),0 0 10px rgba(0,0,0,1)}.mk-legal-controls.mk-focus{background-color:#e2eef9;border-radius:2px;box-shadow:0 0 0 1px #007aff}.mk-legal-controls.mk-focus .mk-legal{color:#157efb;text-shadow:none}.mk-legal-info{z-index:1;box-sizing:border-box;position:absolute;top:-12px;right:-12px;padding:0 0 1px 1px;background:rgba(0,0,0,.2);-webkit-transform:translate3d(0,-100%,0) translateY(2px);-ms-transform:translateY(-100%) translateY(2px);transform:translate3d(0,-100%,0) translateY(2px);-webkit-transition:-webkit-transform .3s;-ms-transition:-ms-transform .3s;transition:transform .3s}.mk-legal-info.mk-open{-webkit-transform:translate3d(0,0,0);-ms-transform:translateY(0);transform:translate3d(0,0,0)}.mk-legal-info .mk-legal-info-container{background:#fff}.mk-legal-info .mk-legal-info-container>header{height:27px;background:rgba(0,0,0,.04)}.mk-legal-info header{position:relative}.mk-legal-info .mk-close{position:relative;cursor:pointer;pointer-events:auto;width:27px;height:27px}.mk-legal-controls .mk-close svg{position:absolute;pointer-events:none;height:11px;width:11px;top:8px;left:8px}.mk-legal-controls.mk-focus .mk-legal-info .mk-close:focus svg{border:1px solid #007aff;border-radius:2px;padding:3px;top:4px;left:4px;fill:#007aff}.mk-legal-controls.mk-focus .mk-legal-info .mk-pressed:focus{background:0 0}.mk-legal-controls.mk-focus .mk-legal-info .mk-close.mk-pressed:focus svg,.mk-legal-controls.mk-focus .mk-legal-info .mk-legal-info-item.mk-pressed:focus{background:rgba(0,122,255,.1)}.mk-legal-info .mk-legal-info-item{display:block;cursor:pointer;text-decoration:none;text-align:left;font:13px/16px "-apple-system-font",HelveticaNeue-Medium,Helvetica,Arial,sans-serif;color:#212121;padding:6px 10px;pointer-events:auto;white-space:nowrap}.mk-legal-controls.mk-focus .mk-legal-info .mk-legal-info-item:focus{color:#007aff!important;box-shadow:0 0 0 3px rgba(0,122,255,.2),0 0 0 1px #007aff}.mk-legal-info .mk-legal-attribution-item{color:#b2b2b2;font:13px/1.2em "-apple-system-font","Helvetica Neue",Helvetica,Arial,sans-serif;font-weight:500;letter-spacing:.5px}.mk-legal-info .mk-legal-attribution-item img{border:none;max-width:none}.mk-legal-info .mk-legal-info-item .mk-attribution-logo{margin-bottom:-7px;pointer-events:none}.mk-legal-info .mk-legal-info-item .mk-right-caret{pointer-events:none;display:inline-block;position:relative;width:7px;height:9px}.mk-legal-info .mk-legal-info-item .mk-right-caret svg{position:absolute;width:7px;height:9px;top:1px;fill:none;stroke-width:1.5;stroke:#8e8e8e}.mk-legal-controls.mk-focus .mk-legal-info .mk-legal-info-item:focus svg{stroke:#007aff}.mk-legal-info .mk-legal-info-container .mk-divider{height:1px;background-color:rgba(0,0,0,.2)}.mk-legal-info[aria-hidden=true]{visibility:hidden}.mk-zoom-controls{position:absolute;right:0;bottom:0;width:51px;height:23px;background:#fff;box-shadow:0 0 0 1px #bfbfbf;border-radius:4px;pointer-events:auto}.mk-zoom-controls .mk-icon{position:absolute;pointer-events:none;width:13px;height:13px;margin:5px 6px;fill:#333}.mk-zoom-controls .mk-disabled,.mk-zoom-controls.mk-disabled .mk-zoom-in,.mk-zoom-controls.mk-disabled .mk-zoom-out{opacity:.25}.mk-zoom-controls .mk-zoom-in,.mk-zoom-controls .mk-zoom-out{position:absolute;z-index:2;width:25px;height:23px;cursor:pointer;transform:translateZ(0)}.mk-zoom-controls .mk-zoom-in{border-top-right-radius:inherit;border-bottom-right-radius:inherit;right:0}.mk-zoom-controls .mk-zoom-out{border-top-left-radius:inherit;border-bottom-left-radius:inherit}.mk-zoom-controls.mk-focus{background:#fafafa;box-shadow:0 0 0 3px rgba(0,122,255,.2)}.mk-zoom-controls.mk-focus .mk-zoom-in:focus,.mk-zoom-controls.mk-focus .mk-zoom-out:focus{box-shadow:0 0 0 1px #007aff}.mk-zoom-controls.mk-focus .mk-zoom-in.mk-pressed:focus,.mk-zoom-controls.mk-focus .mk-zoom-out.mk-pressed:focus{background:rgba(0,122,255,.1)}.mk-zoom-controls.mk-focus .mk-zoom-in:focus .mk-icon,.mk-zoom-controls.mk-focus .mk-zoom-out:focus .mk-icon{fill:#007aff}.mk-zoom-controls .mk-pressed{background:#ededed}.mk-zoom-controls .mk-divider{position:absolute;left:25px;width:1px;height:23px;border-left:1px solid #bfbfbf;box-sizing:border-box}.mk-map-type-control{display:inline-block;vertical-align:top;height:23px;margin-left:7px;overflow:hidden;background:#fff;box-shadow:0 0 0 1px #bfbfbf;border-radius:4px;pointer-events:auto;-webkit-transition:height .3s,margin-top .3s;-ms-transition:height .3s,margin-top .3s;transition:height .3s,margin-top .3s}.mk-map-type-control .mk-map-type{position:relative;cursor:pointer;font:13px/23px "-apple-system-font",HelveticaNeue-Medium,Helvetica,Arial,sans-serif;color:#424242;letter-spacing:.1px;text-align:left;padding:0 24px 0 6px;margin-top:-24px;border-bottom:1px solid #e1e1e1;opacity:0}.mk-map-type-control .mk-map-type.mk-active{margin-top:auto;opacity:1}.mk-map-type-control .mk-map-type.mk-active .mk-icon{pointer-events:none;position:absolute;width:9px;height:6px;right:5px;top:9px;fill:none;stroke-width:1.5;stroke:#7c7c7c}.mk-map-type-control .mk-map-type.mk-pressed{background:#ededed}.mk-map-type-control.mk-open.mk-opening{overflow:hidden}.mk-map-type-control.mk-open{height:71px;overflow:visible}.mk-map-type-control.mk-open .mk-map-type{position:relative;opacity:1;margin-top:auto}.mk-map-type-control:not(.mk-open) .mk-map-type.mk-active{border-bottom:none;border-radius:3px}.mk-map-type-control.mk-open .mk-map-type:first-child{border-radius:3px 3px 0 0}.mk-map-type-control.mk-open .mk-map-type:last-child{border:none;border-radius:0 0 3px 3px}.mk-map-type-control.mk-open .mk-map-type.mk-active{margin-top:auto;opacity:1}.mk-map-type-control.mk-open .mk-map-type.mk-active .mk-icon{width:11px;height:9px;right:5px;top:7px;stroke:none;fill:#333}.mk-map-type-control.mk-focus.mk-show-focus{background-color:#fff;box-shadow:0 0 0 1px #007aff,0 0 0 3px rgba(0,122,255,.2)}.mk-map-type-control.mk-focus.mk-show-focus:not(.mk-open) .mk-map-type.mk-active{color:#007aff!important}.mk-map-type-control.mk-focus.mk-show-focus:not(.mk-open) .mk-map-type.mk-pressed.mk-active{background-color:rgba(0,122,255,.1)}.mk-map-type-control.mk-focus.mk-show-focus:not(.mk-open) .mk-map-type.mk-active .mk-icon{stroke:#007aff!important}.mk-map-type-control.mk-open.mk-focus.mk-show-focus{box-shadow:0 0 0 3px rgba(0,122,255,.2)}.mk-map-type-control.mk-open.mk-focus .mk-map-type.mk-active{color:#424242}.mk-map-type-control.mk-open .mk-map-type.mk-active .mk-icon{stroke:none!important;fill:#333}.mk-map-type-control.mk-open .mk-map-type.mk-active.mk-focus .mk-icon,.mk-map-type-control.mk-open.mk-show-focus .mk-map-type.mk-active:focus .mk-icon{fill:#007aff!important}.mk-map-type-control.mk-open.mk-show-focus .mk-map-type:focus{color:#007aff!important;box-shadow:0 0 0 1px #007aff}.mk-map-type-control.mk-open:focus.mk-show-focus .mk-map-type.mk-pressed:focus{background-color:rgba(0,122,255,.1)}.mk-style-helper{opacity:0;pointer-events:none}.mk-rotation-control{width:53px;height:53px;cursor:-webkit-grab;cursor:grab;pointer-events:auto;position:absolute;bottom:33px;right:-1px;border-radius:50px;box-shadow:0 1px 3px rgba(0,0,0,.1);z-index:-1;overflow:hidden;line-height:0;-webkit-transition:opacity .1s cubic-bezier(.19,1,.22,1);transition:opacity .1s cubic-bezier(.19,1,.22,1)}.mk-rotation-control{-webkit-transition:opacity .3s;-ms-transition:opacity .3s;transition:opacity .3s}.mk-rotation-control>.mk-rotation-wrapper{width:53px;height:53px;position:absolute;will-change:transform}.mk-rotation-control.mk-pressed{cursor:-webkit-grabbing;cursor:grabbing}.mk-rotation-control .mk-compass{width:53px}.mk-rotation-control .mk-north-indicator{font:16px/18px "-apple-system-font",HelveticaNeue-Medium,Helvetica,Arial,sans-serif;color:#000;position:absolute;top:24px;left:26.5%;width:25px;overflow:hidden;text-overflow:clip;text-align:center}.mk-rotation-control .mk-north-indicator.mk-north-indicator-long{font-size:12px}.mk-rotation-control.mk-focus{box-shadow:0 0 0 1px #007aff,0 0 0 3px rgba(0,122,255,.2)}.mk-rotation-control.mk-focus .mk-north-indicator{color:#007aff}.mk-rtl *{text-align:right!important;direction:rtl}.mk-rtl .mk-user-location-control{right:auto;left:60px}.mk-rtl .mk-logo-control{right:0}.mk-rtl .mk-top-right-controls-container{left:12px;right:auto}.mk-rtl .mk-top-left-controls-container{left:auto;right:12px}.mk-rtl .mk-map-type-control .mk-map-type{padding:0 6px 0 24px}.mk-rtl .mk-map-type-control .mk-map-type.mk-active .mk-icon{left:5px;right:auto}.mk-rtl .mk-zoom-controls{right:auto;left:0}.mk-rtl .mk-zoom-controls .mk-zoom-out{right:0;left:auto}.mk-rtl .mk-zoom-controls .mk-zoom-in{right:auto;left:0}.mk-rtl .mk-bottom-right-controls-container{left:12px;right:auto}.mk-rtl .mk-bottom-right-controls-container .mk-zoom-controls{margin-left:0;margin-right:9px}.mk-rtl .mk-bottom-right-controls-container .mk-control:last-child.mk-user-location-control{right:auto;left:0}.mk-rtl .mk-map-type-control{margin-right:7px;margin-left:0}.mk-rtl .mk-legal-info{left:-12px;right:auto;padding:0 1px 1px 0}.mk-rtl .mk-right-caret{-webkit-transform:rotate(180deg);-moz-transform:rotate(180deg);-o-transform:rotate(180deg);-ms-transform:rotate(180deg);transform:rotate(180deg)}.mk-rtl>.mk-error-message{-webkit-transform-origin:0 50% 0;transform-origin:0 50% 0}.mk-rtl .mk-rotation-control{right:auto;left:-1px}.mk-rtl .mk-rotation-control .mk-north-indicator{text-align:center!important}div.mk-standard.mk-no-subtitle.mk-no-accessories .mk-rtl .mk-title{text-align:center!important}@-webkit-keyframes mk-fadeout{from{opacity:1}to{opacity:0}}@keyframes mk-fadeout{from{opacity:1}to{opacity:0}}' }, {}],
    173: [function(t, e, i) {
        var n = t("./configuration"),
            o = t("../build.json"),
            s = t("./utils"),
            a = t("@maps/js-utils"),
            r = {
                init: function(t) { this.options = t || {} },
                infoForMap: function(e) {
                    var i = t("./map");
                    a.required(e, "[MapKit] Missing `map` parameter in call to `mapkit.debugInfoForMap()`.").checkInstance(e, i, "[MapKit] The parameter passed to `mapkit.debugInfoForMap()` is not a Map.");
                    var r = e._impl._mapNode._impl._tileGridsGroup.lastChild;
                    return JSON.stringify({ userAgent: navigator.userAgent, build: o, mapSize: e._impl.ensureRenderingFrame().size.toString(), devicePixelRatio: s.devicePixelRatio, zoomLevel: e._impl.zoomLevel, visibleMapRect: e.visibleMapRect.toString(), tileRange: { min: e._impl.tileRange && e._impl.tileRange.min.toString(), max: e._impl.tileRange && e._impl.tileRange.max.toString() }, pendingTiles: r ? r._pendingTileCount : 0, screenSize: { width: window.screen.width, height: window.screen.height }, rootNode: e._impl.rootNode.element.outerHTML, configuration: n._debugInfo() }, null, "    ")
                }
            };
        e.exports = r
    }, { "../build.json": 111, "./configuration": 159, "./map": 185, "./utils": 225, "@maps/js-utils": 84 }],
    174: [function(t, e, i) {
        "use strict";

        function n(t, e) { var i = new o(t, { loaderDidSucceed: function(i, n) { var o; try { o = JSON.parse(n.responseText) } catch (i) { return void e(new Error("[MapKit] The response of " + t + " does not appear to be valid JSON:" + n.responseText)) } e(null, o) }, loaderDidFail: function(i, n) { e(new Error("[MapKit] Failed to load " + t)) } }); return i.schedule(), i.id }
        var o = t("@maps/loaders").XHRLoader,
            s = t("../../lib/geojson-adapter");
        e.exports = function(t, e) {
            function i(t) { var i = s.importGeoJSON(t, o); return a && e(null, i), i }
            var o = {},
                a = "function" == typeof e,
                r = "object" == typeof e,
                l = "string" == typeof t;
            if (r && (o = e), l && !a && !r) { var h = new Error("[MapKit] For GeoJSON file imports, a callback must be provided as a second argument"); throw o.geoJSONDidError && o.geoJSONDidError(h), h }
            return l ? n(t, function(t, n) { return t ? (o.geoJSONDidError && o.geoJSONDidError(t), void(a && e(t))) : i(n) }) : i(t)
        }
    }, { "../../lib/geojson-adapter": 5, "@maps/loaders": 85 }],
    175: [function(t, e, i) {
        var n = t("@maps/dom-events"),
            o = t("../../lib/geo"),
            s = t("../build.json"),
            a = t("./configuration"),
            r = t("./debug"),
            l = t("./utils");
        window.DOMPoint || (window.DOMPoint = t("@maps/geometry-interfaces"));
        var h = t("./overlays/polyline-overlay"),
            c = t("./services/directions-internal");
        Object.defineProperty(c.Route.prototype, "polyline", { enumerable: !0, get: function() { return this._polyline || (this._polyline = new h(this._path.reduce(function(t, e) { return t.concat(e) }, []))), this._polyline } });
        var u = t("./map-internal.js"),
            d = {
                init: function(t, e) {
                    r.init(e), a.init(t);
                    var i = this.dispatchEvent.bind(this);
                    a.addEventListener(a.Events.Changed, i), a.addEventListener(a.Events.Error, i)
                },
                get version() { return s.version },
                get build() { return s.build },
                get language() { return a.language },
                set language(t) { a.language = t },
                toString: function() { return ["MapKit JS", this.version, "(" + this.build + ")"].join(" ") },
                importGeoJSON: t("./import-geojson-method"),
                get _tileProvider() { return a.tileProvider },
                get _countryCode() { return a.countryCode },
                set _countryCode(t) { a.countryCode = t },
                _restore: function() { a._restore() },
                get _environment() { return a.environment },
                debugInfoForMap: r.infoForMap,
                get maps() { return u.maps },
                FeatureVisibility: t("./constants").FeatureVisibility,
                CoordinateRegion: o.CoordinateRegion,
                CoordinateSpan: o.CoordinateSpan,
                Coordinate: o.Coordinate,
                BoundingRegion: o.BoundingRegion,
                MapPoint: o.MapPoint,
                MapRect: o.MapRect,
                MapSize: o.MapSize,
                Padding: t("./padding"),
                Style: t("./overlays/style"),
                CircleOverlay: t("./overlays/circle-overlay"),
                PolylineOverlay: h,
                PolygonOverlay: t("./overlays/polygon-overlay"),
                Geocoder: t("./services/geocoder"),
                Search: t("./services/search"),
                Directions: t("./services/directions"),
                Map: t("./map"),
                Annotation: t("./annotations/annotation"),
                PinAnnotation: t("./annotations/pin-annotation"),
                ImageAnnotation: t("./annotations/image-annotation"),
                MarkerAnnotation: t("./annotations/marker-annotation"),
                TileOverlay: t("../../lib/map-node").TileOverlay
            };
        n.EventTarget(d), e.exports = d, document.head.appendChild(l.htmlElement("style", t("./css")))
    }, { "../../lib/geo": 2, "../../lib/map-node": 7, "../build.json": 111, "./annotations/annotation": 127, "./annotations/image-annotation": 136, "./annotations/marker-annotation": 146, "./annotations/pin-annotation": 151, "./configuration": 159, "./constants": 161, "./css": 172, "./debug": 173, "./import-geojson-method": 174, "./map": 185, "./map-internal.js": 183, "./overlays/circle-overlay": 190, "./overlays/polygon-overlay": 199, "./overlays/polyline-overlay": 202, "./overlays/style": 204, "./padding": 209, "./services/directions": 211, "./services/directions-internal": 210, "./services/geocoder": 213, "./services/search": 216, "./utils": 225, "@maps/dom-events": 62, "@maps/geometry-interfaces": 67 }],
    176: [function(t, e, i) {
        function n(t, e) { r.call(this, t), this._map = e }

        function o(t) { a.call(this), this._renderer = new n(this, t) }
        var s = t("@maps/js-utils"),
            a = t("../../lib/scene-graph/src/model/scene"),
            r = t("../../lib/scene-graph/src/render/c2d/render-scene");
        n.prototype = s.inheritPrototype(r, n, {
            update: function() {
                var t = performance && performance.now() || Date.now();
                r.prototype.update.call(this);
                var e = performance && performance.now() || Date.now();
                this._map._performanceLog.push({ name: "render-frame", timestamp: t, duration: e - t })
            }
        }), o.prototype = s.inheritPrototype(a, o, {}), e.exports = { Scene: o, now: window.performance && window.performance.now ? function() { return window.performance.now() } : Date.now }
    }, { "../../lib/scene-graph/src/model/scene": 52, "../../lib/scene-graph/src/render/c2d/render-scene": 56, "@maps/js-utils": 84 }],
    177: [function(t, e, i) {
        function n(t, e) { this._delegate = e, this._snapsToIntegralZoomLevels = t }
        var o = t("../utils"),
            s = t("@maps/js-utils"),
            a = t("@maps/scheduler");
        n.prototype = {
            constructor: n,
            _speed: .03,
            _startTime: 0,
            _shouldStop: !1,
            _animating: !1,
            start: function(t, e) { var i = Date.now(); return this._gasPedalValue = 0, this._startTime = i, this._shouldStop && this._cleanUp(), this._shouldStop = !1, this.zoomsIn = !!e, o.supportsForceTouch && window.addEventListener("webkitmouseforcechanged", this), !this._animating && (this._animating = !0, this._zoomLevel = t, this._timeAtLastFrame = i, a.scheduleOnNextFrame(this), !0) },
            stop: function() { this._shouldStop = !0, o.supportsForceTouch && (window.removeEventListener("webkitmouseforcechanged", this), delete this._speed) },
            set snapsToIntegralZoomLevels(t) { this._snapsToIntegralZoomLevels = !!t },
            performScheduledUpdate: function() {
                var t = !0,
                    e = Date.now(),
                    i = e - this._timeAtLastFrame,
                    n = this._speed * (this.zoomsIn ? 1 : -1);
                this._zoomLevel += 60 * i * s.log2(1 + n) / 1e3, this._timeAtLastFrame = e, this._shouldStop && e - this._startTime >= 250 && (this._zoomLevelAtWhichToStop ? (t = this.zoomsIn && this._zoomLevel < this._zoomLevelAtWhichToStop || !this.zoomsIn && this._zoomLevel > this._zoomLevelAtWhichToStop) || (this._zoomLevel = this._zoomLevelAtWhichToStop) : this._snapsToIntegralZoomLevels ? this._zoomLevelAtWhichToStop = this.zoomsIn ? Math.ceil(this._zoomLevel) : Math.floor(this._zoomLevel) : t = !1), this._delegate && this._delegate.linearZoomControllerDidZoom(this._zoomLevel), t ? a.scheduleOnNextFrame(this) : this._cleanUp()
            },
            handleEvent: function(t) { this._handleForceChangedEvent(t) },
            _handleForceChangedEvent: function(t) {
                var e = s.clamp(t.webkitForce, MouseEvent.WEBKIT_FORCE_AT_MOUSE_DOWN, MouseEvent.WEBKIT_FORCE_AT_FORCE_MOUSE_DOWN) - MouseEvent.WEBKIT_FORCE_AT_MOUSE_DOWN;
                Math.abs(e - this._gasPedalValue) > .01 && (this._gasPedalValue = e), this._speed = .01 + this._gasPedalValue * (.06 - .01)
            },
            _cleanUp: function() { this._animating = !1, this._shouldStop = !1, delete this._zoomLevelAtWhichToStop, this._delegate && this._delegate.linearZoomControllerDidStop() }
        }, e.exports = n
    }, { "../utils": 225, "@maps/js-utils": 84, "@maps/scheduler": 106 }],
    178: [function(t, e, i) {
        function n() { a.LongPress.call(this), this.minimumPressDuration = 125 }
        var o = t("@maps/js-utils"),
            s = t("@maps/geometry/point"),
            a = t("@maps/gesture-recognizers");
        n.prototype = o.inheritPrototype(a.LongPress, n, {
            touchesBegan: function(t) {
                (o.isIEAndNotEdge() || o.isEdge()) && document.getSelection().removeAllRanges(), a.LongPress.prototype.touchesBegan.call(this, t), this.translation = new s, this._translationOrigin = this._lastTouchLocation = this.locationInElement()
            },
            enterRecognizedState: function() { a.LongPress.prototype.enterBeganState.call(this) },
            touchesMoved: function(t) {
                t.preventDefault();
                var e = this.locationInElement();
                this.state === a.States.Possible ? a.LongPress.prototype.touchesMoved.call(this, t) : this.state !== a.States.Began && this.state !== a.States.Changed || (this.translation.x += e.x - this._lastTouchLocation.x, this.translation.y += e.y - this._lastTouchLocation.y, this.enterChangedState()), this._lastTouchLocation = e
            },
            touchesCanceled: function(t) { this.interruptGesture() },
            touchesEnded: function(t) { this.state === a.States.Changed ? (t.preventDefault(), this.enterEndedState()) : this.enterFailedState() },
            interruptGesture: function() { this.state === a.States.Changed ? this.enterEndedState() : this.state === a.States.Began && this.enterFailedState() },
            reset: function() { a.LongPress.prototype.reset.call(this), delete this._translationOrigin, delete this._lastTouchLocation }
        }), e.exports = n
    }, { "@maps/geometry/point": 69, "@maps/gesture-recognizers": 72, "@maps/js-utils": 84 }],
    179: [function(t, e, i) {
        function n(t, e) { this._target = t, this._delegate = e, this.initialEventTargetForCurrentInteraction = null, this._doubleTapWithOneFingerRecognizer = this._addGestureRecognizer(o.Tap), this._doubleTapWithOneFingerRecognizer.numberOfTouchesRequired = 1, this._doubleTapWithOneFingerRecognizer.numberOfTapsRequired = 2, this._singleTapWithOneFingerRecognizer = this._addGestureRecognizer(o.Tap), this._longPressAndPanRecognizer = this._addGestureRecognizer(s), this._longPressAndPanRecognizer.delegate = this, t.addEventListener(a.touchstartOrMousedown, this), window.addEventListener(a.touchendOrMouseup, this), this._target.addEventListener("dragstart", this) }
        var o = t("@maps/gesture-recognizers"),
            s = t("./long-press-and-pan-gesture-recognizer"),
            a = t("../utils"),
            r = "auto" === a.htmlElement("div", { style: "pointer-events: auto" }).style.pointerEvents;
        n.prototype = {
            constructor: n,
            handleEvent: function(t) {
                switch (t.type) {
                    case "dragstart":
                        this._delegate.elementShouldPreventDragstart(t.target) && t.preventDefault();
                        break;
                    case "mousedown":
                        if (this.initialEventTargetForCurrentInteraction = t.target, !r && "none" === window.getComputedStyle(this.initialEventTargetForCurrentInteraction).pointerEvents) {
                            var e = this.initialEventTargetForCurrentInteraction.style,
                                i = e.display;
                            e.display = "none", this.initialEventTargetForCurrentInteraction = document.elementFromPoint(t.clientX, t.clientY), e.display = i
                        }
                        t.target.ownerDocument.defaultView !== window.top || this._delegate.elementWantsDefaultBrowserBehavior(this.initialEventTargetForCurrentInteraction) || t.preventDefault();
                        break;
                    case "mouseup":
                        this.initialEventTargetForCurrentInteraction = null;
                        break;
                    case "touchstart":
                        t.touches.length === t.changedTouches.length && (this.initialEventTargetForCurrentInteraction = t.touches[0].target, this._delegate.elementWantsDefaultBrowserBehavior(this.initialEventTargetForCurrentInteraction) || t.preventDefault());
                        break;
                    case "touchend":
                        0 === t.touches.length && (this.initialEventTargetForCurrentInteraction = null);
                        break;
                    case "statechange":
                        this._handleStatechange(t)
                }
            },
            _handleStatechange: function(t) {
                switch (t.target) {
                    case this._doubleTapWithOneFingerRecognizer:
                        this._handleDoubleTapWithOneFingerChange(t);
                        break;
                    case this._singleTapWithOneFingerRecognizer:
                        this._handleSingleTapWithOneFingerChange(t);
                        break;
                    case this._longPressAndPanRecognizer:
                        this._handleLongPressAndPanChange(t)
                }
            },
            gestureRecognizerShouldBegin: function(t) { return this._delegate.userDidLongPress(t.locationInElement()) },
            mapWasDestroyed: function() { window.removeEventListener(a.touchendOrMouseup, this), this._target.removeEventListener(a.touchstartOrMousedown, this), this._target.removeEventListener("dragstart", this), this._doubleTapWithOneFingerRecognizer.removeEventListener("statechange", this), this._doubleTapWithOneFingerRecognizer.enabled = !1, this._doubleTapWithOneFingerRecognizer = null, this._singleTapWithOneFingerRecognizer.removeEventListener("statechange", this), this._singleTapWithOneFingerRecognizer.enabled = !1, this._singleTapWithOneFingerRecognizer = null, this._longPressAndPanRecognizer.removeEventListener("statechange", this), this._longPressAndPanRecognizer.enabled = !1, this._longPressAndPanRecognizer.delegate = null, this._longPressAndPanRecognizer = null, delete this.initialEventTargetForCurrentInteraction, delete this._target, delete this._delegate },
            _addGestureRecognizer: function(t) { var e = new t; return e.target = this._target, e.addEventListener("statechange", this), e },
            _handleDoubleTapWithOneFingerChange: function(t) { t.target.state === o.States.Recognized && (this._delayedSingleTapRecognizerTimeoutID && (this._delegate.userCanceledTap(), window.clearTimeout(this._delayedSingleTapRecognizerTimeoutID), delete this._delayedSingleTapRecognizerTimeoutID), this._singleTapWithOneFingerRecognizer.enabled = !1) },
            _handleSingleTapWithOneFingerChange: function(t) {
                var e = t.target;
                this._singleTapWithOneFingerRecognizer.enabled && e.state === o.States.Recognized && (this._delegate.userWillTap(e.locationInElement()), this._delayedSingleTapRecognizerTimeoutID = window.setTimeout(function() { delete this._delayedSingleTapRecognizerTimeoutID, this._delegate.userDidTap() }.bind(this), 350))
            },
            _handleLongPressAndPanChange: function(t) {
                var e = t.target;
                switch (e.state) {
                    case o.States.Began:
                        this._singleTapWithOneFingerRecognizer.enabled = !1, this._doubleTapWithOneFingerRecognizer.enabled = !1, this._doubleTapWithOneFingerRecognizer.enabled = !0;
                        break;
                    case o.States.Changed:
                        this._delegate.userDidPanAfterLongPress(e.translation);
                        break;
                    case o.States.Ended:
                    case o.States.Failed:
                        this._singleTapWithOneFingerRecognizer.enabled = !0, this._delegate.userDidStopPanningAfterLongPress(e.state !== o.States.Failed)
                }
            },
            _stopDraggingAnnotation: function() { this._longPressAndPanRecognizer.interruptGesture() }
        }, e.exports = n
    }, { "../utils": 225, "./long-press-and-pan-gesture-recognizer": 178, "@maps/gesture-recognizers": 72 }],
    180: [function(t, e, i) {
        function n(t) { this._map = t, this._items = [] }

        function o(t, e) {
            var i = t.toCoordinateRegion();
            if (i.span.latitudeDelta >= e.latitudeDelta && i.span.longitudeDelta >= e.longitudeDelta) return t;
            i.span.latitudeDelta = Math.max(i.span.latitudeDelta, e.latitudeDelta), i.span.longitudeDelta = Math.max(i.span.longitudeDelta, e.longitudeDelta);
            var n = i.span.latitudeDelta / 2,
                o = i.span.longitudeDelta / 2,
                a = new h(s.convertLongitudeToX(i.center.longitude - o), s.convertLatitudeToY(i.center.latitude + n)),
                l = new h(s.convertLongitudeToX(i.center.longitude + o), s.convertLatitudeToY(i.center.latitude - n));
            return a.x > l.x && a.x--, new r(a.x, a.y, Math.min(l.x - a.x, 1), l.y - a.y)
        }
        var s = t("../../lib/geo"),
            a = t("@maps/js-utils"),
            r = s.MapRect,
            l = s.CoordinateSpan,
            h = s.MapPoint,
            c = t("./padding"),
            u = t("./types-internal"),
            d = t("@maps/dom-events"),
            p = new l(.001, .001),
            m = new c(12, 12, 12, 12),
            g = { Select: "select", Deselect: "deselect" };
        n.checkShowItemsParameters = function(t, e) {
            return a.checkArray(t, "[MapKit] Map.showItems expects an array of items as its first parameter."), e = a.checkOptions(e, "object", "[MapKit] Map.showItems expects an object as optional second parameter."), Object.keys(e).forEach(function(t) {
                switch (t) {
                    case "animate":
                        break;
                    case "padding":
                        a.checkInstance(e.padding, c, "[MapKit] Map.showItems expects a Padding object for `options.padding`.");
                        break;
                    case "minimumSpan":
                        a.checkInstance(e.minimumSpan, l, "[MapKit] Map.showItems expects a CoordinateSpan for `options.minimumSpan`.");
                        break;
                    default:
                        console.warn("[MapKit] `" + t + "` is not a valid option of Map.showItems.")
                }
            }), e
        }, n.setRegionForItems = function(t, e, i) {
            if (t.ensureRenderingFrame().size.height <= 0 || t.ensureRenderingFrame().size.width <= 0) return !1;
            if (0 === e.length) return !0;
            for (var n = !!i.animate, s = i.padding || m, a = i.minimumSpan || p, l = 0, h = 0, d = 0, g = 0, _ = [], f = 0, y = e.length; f < y; ++f) {
                var v = e[f];
                if (v.map === t.public) {
                    var w = v._impl._boundingRect || v._impl.boundingRectAtScale && v._impl.boundingRectAtScale(1);
                    if (w) {
                        if (v._impl.style) {
                            var b = v._impl.style._impl.halfStrokeWidthAtResolution();
                            l = Math.max(l, b), h = Math.max(h, b), d = Math.max(d, b), g = Math.max(g, b)
                        }
                        _.push(w)
                    }
                    else v._impl.updateLayout(!0), l = Math.max(l, v._impl._anchorPoint.y), h = Math.max(h, v.size.width - v._impl._anchorPoint.x), d = Math.max(d, v.size.height - v._impl._anchorPoint.y), g = Math.max(g, v._impl._anchorPoint.x), _.push(new r(v._impl.x, v._impl.y, 0, 0))
                }
            }
            if (0 === _.length) return !0;
            s = new c(s.top + l, s.right + h, s.bottom + d, s.left + g);
            var C = o(u.boundingRectForSortedRects(_.sort(function(t, e) { return t.minX() - e.minX() })), a);
            return t.setVisibleMapRectAnimated(t.padMapRect(C, s), n), !0
        }, n.prototype = {
            constructor: n,
            _map: null,
            _selectedItem: null,
            _selectionDistance: 10,
            get node() { return this._node },
            get items() { return this._items.filter(this.isItemExposed, this) },
            set items(t) { a.checkArray(t, "[MapKit] Map." + this.itemName + "s expected an array of " + this.itemName + "s, but got `" + t + "` instead."), this._items.forEach(function(t) { this.isItemExposed(t) && this.removedItem(t) }, this), this._items = t.filter(function(t, e) { return a.checkInstance(t, this.itemConstructor, "[MapKit] Map." + this.itemName + "s expected an " + this.itemName + " at index " + e + ", but got `" + t + "` instead."), this.isItemExposed(t) && this.shouldAddItem(t, !0) }, this), this._items.forEach(function(t) { this.addedItem(t) }, this) },
            get selectedItem() { return this._selectedItem },
            set selectedItem(t) {
                if (t !== this._selectedItem) {
                    if (null != t && (a.checkInstance(t, this.itemConstructor, "[MapKit] Map.selected" + this.capitalizedItemName + " expected an " + this.itemName + " or `null`, but got `" + t + "` instead."), t.map !== this._map.public)) throw new Error("[MapKit] Map.selected" + this.capitalizedItemName + " cannot be set to an " + this.itemName + " that is not in the map.");
                    if (this._selectedItem) {
                        var e = this._selectedItem;
                        this._selectedItem = null, e.selected = !1, e.dispatchEvent(new d.Event(g.Deselect))
                    }
                    t && (this._selectedItem = t, t.selected = !0, t.dispatchEvent(new d.Event(g.Select)))
                }
            },
            addItem: function(t) { return a.checkInstance(t, this.itemConstructor, "[MapKit] Map.add" + this.capitalizedItemName + " expected an " + this.itemName + ", but got `" + t + "` instead."), this.addItemToList(t), t },
            addItems: function(t) { return a.checkArray(t, "[MapKit] Map.add" + this.capitalizedItemName + "s expected an array of " + this.itemName + "s, but got `" + t + "` instead."), t.filter(function(t, e) { return a.checkInstance(t, this.itemConstructor, "[MapKit] Map.add" + this.capitalizedItemName + "s expected an " + this.itemName + " at index " + e + ", but got `" + t + "` instead."), !!this.addItemToList(t, !0) }, this) },
            shouldAddItem: function(t, e) { return !t.map || (t.map._impl !== this._map && console.warn("[MapKit] Map." + this.capitalizedItemName + (e ? "s" : "") + ": " + this.itemName + " is already in another map."), !1) },
            removeItem: function(t) {
                if (a.checkInstance(t, this.itemConstructor, "[MapKit] Map.remove" + this.capitalizedItemName + " expected an " + this.itemName + ", but got `" + t + "` instead."), t.map !== this._map.public) console.warn("[MapKit] Map.remove" + this.capitalizedItemName + ": cannot remove " + this.itemName + " as it is not attached to this map.");
                else {
                    var e = this._items.indexOf(t);
                    console.assert(e >= 0), e >= 0 && (this._items.splice(e, 1), this.removedItem(t))
                }
                return t
            },
            removeItems: function(t) { return a.checkArray(t, "[MapKit] Map.remove" + this.capitalizedItemName + "s expected an array of " + this.itemName + "s, but got `" + t + "` instead."), t.forEach(function(t, e) { a.checkInstance(t, this.itemConstructor, "[MapKit] Map.remove" + this.capitalizedItemName + "s expected an " + this.itemName + " at index " + e + ", but got `" + t + "` instead."), t.map === this._map.public ? t._impl._toBeRemoved = !0 : console.warn("[MapKit] Map.remove" + this.capitalizedItemName + "s: cannot remove " + this.itemName + " at index " + e + " as it is not attached to this map.") }, this), this._items = this._items.filter(function(t) { return !t._impl._toBeRemoved }), t.forEach(function(t) { t._impl._toBeRemoved && (delete t._impl._toBeRemoved, this.removedItem(t)) }, this), t },
            itemCloseToPoint: function(t, e) {
                if (this._previousPointForPickingItem && this._previousPointForPickingItem.equals(t)) return e ? this._closeItems[this._closeItemIndex] : (this._closeItemIndex = (this._closeItemIndex + 1) % this._closeItems.length, this._closeItems[this._closeItemIndex]);
                this._previousPointForPickingItem = t;
                var i = this._itemsCloseToPoint(t),
                    n = i.filter(function(t) { return t.enabled });
                return this._closeItems = n.length > 0 ? n : i, this._closeItemIndex = !e && this._closeItems.length > 1 && this._closeItems[0].selected ? 1 : 0, this._closeItems[this._closeItemIndex]
            },
            addItemToList: function(t, e) { if (this.shouldAddItem(t, e)) return this._items.push(t), this.addedItem(t, e), t },
            addedItem: function(t, e) { "function" == typeof t._impl.setDelegate ? t._impl.setDelegate(this) : t._impl.delegate = this, t._impl.addedToMap && t._impl.addedToMap() },
            removedItem: function(t) { t.selected = !1, delete t._impl.delegate, t._impl.removedFromMap && t._impl.removedFromMap() },
            mapWasDestroyed: function() { delete this._map, this.removedReferenceToMap() },
            _node: null,
            _deletePreviousPointForPickingItem: function() { delete this._previousPointForPickingItem, delete this._closeItems, delete this._closeItemIndex },
            _itemsCloseToPoint: function(t) { var e = this._items.filter(function(t) { return t._impl.canBePicked() }); return 0 === e.length ? [] : this.pickableItemsCloseToPoint(e, t) }
        }, e.exports = n
    }, { "../../lib/geo": 2, "./padding": 209, "./types-internal": 221, "@maps/dom-events": 62, "@maps/js-utils": 84 }],
    181: [function(t, e, i) {
        e.exports = {
            preprocessPoints: function(t, e) {
                function i(t, e) { var i = r[t]; return r[t] = r[e], r[e] = i, r[t]._index = t, r[e]._index = e, e }

                function n(t) {
                    for (; t > 0;) {
                        var e = Math.floor((t - 1) / 2);
                        if (r[e]._area <= r[t]._area) return;
                        t = i(t, e)
                    }
                }

                function o(t) {
                    for (;;) {
                        var e = 2 * t + 1,
                            n = 2 * t + 2,
                            o = r[t]._area,
                            s = r[e] ? r[e]._area : 1 / 0,
                            a = r[n] ? r[n]._area : 1 / 0;
                        if (o <= s && o <= a) return;
                        t = i(t, s <= o && s <= a ? e : n)
                    }
                }

                function s(t) {
                    var e = t._prev,
                        i = t,
                        n = t._next;
                    return Math.abs((e.x - n.x) * (i.y - e.y) - (e.x - i.x) * (n.y - e.y)) / 2
                }

                function a(t, e) {
                    var i = t._area;
                    t._area = Math.max(s(t), e), t._area < i ? n(t._index) : o(t._index)
                }
                var r = [],
                    l = t.length - 1;
                if (e && l > 1) {
                    if (!t[l].equals(t[0])) { t.push(t[0].copy()); var h = !0;++l }
                    var c = !0;
                    t.unshift(t[l - 1].copy()), ++l
                }
                t[0]._area = t[l]._area = 1 / 0;
                for (var u = 1; u < l; ++u) {
                    var d = t[u];
                    d._prev = t[u - 1], d._next = t[u + 1], d._area = s(d),
                        function(t) {
                            var e = r.length;
                            t._index = e, r.push(t), n(e)
                        }(d)
                }
                for (c && t.shift(), h && t.pop(); r.length > 0;) {
                    var p = function() {
                            var t = r[0],
                                e = r.pop();
                            return r.length > 0 && (r[0] = e, e._index = 0, o(0)), t
                        }(),
                        m = p._prev,
                        g = p._next;
                    m._prev && (m._next = g, a(m, p._area)), g._next && (g._prev = m, a(g, p._area)), delete p._index, delete p._next, delete p._prev
                }
            },
            filterPointsAtScale: function(t, e) {
                var i = 1 / (e * e),
                    n = t.filter(function(t) { return t._area > i });
                if (2 === n.length) {
                    var o = n[0].x - n[1].x,
                        s = n[0].y - n[1].y;
                    if (o * o + s * s < 1 * i) return []
                }
                return n
            }
        }
    }, {}],
    182: [function(t, e, i) {
        var n = t("@maps/localizer"),
            o = t("@maps/js-utils").isNode() ? "file://" + e.require("path").resolve(t.resolve("."), "..", "..", "locales/{{locale}}/strings.json") : t("./urls").createUrl("locales/{{locale}}/strings.json"),
            s = new n.LanguageSupport({ supportedLocales: t("../locales/supported-tile-locales.json"), regionToScriptMap: t("../locales/region-to-script-map.json"), localesMap: t("../locales/locales-map.json") }),
            a = new n.L10n({ supportedLocales: t("../locales/supported-locales.json"), primaryLocales: t("../locales/primary-locales.json"), localesMap: t("../locales/locales-map.json"), regionToScriptMap: t("../locales/region-to-script-map.json"), rtlLocales: t("../locales/rtl-locales.json"), enUSDictionary: t("../locales/en-US/strings.json"), localeUrl: o });
        a.useMetric = function() { var t = n.LangTag.parse(this.activeLocale.localeId); return n.UseMetric.forLanguageTag(t) }, e.exports = { languageSupport: s, l10n: a }
    }, { "../locales/en-US/strings.json": 226, "../locales/locales-map.json": 227, "../locales/primary-locales.json": 228, "../locales/region-to-script-map.json": 229, "../locales/rtl-locales.json": 230, "../locales/supported-locales.json": 231, "../locales/supported-tile-locales.json": 232, "./urls": 222, "@maps/js-utils": 84, "@maps/localizer": 94 }],
    183: [function(t, e, i) {
        function n(t, e, i) { if (u.instrumented) { this._instrumented = u.instrumented, this._performanceLog = []; var o = N.now() } this._initialMapLoad = !0, e && (this._bootstrapSize = new T(e.offsetWidth, e.offsetHeight)), E.EventTarget(t), this.public = t, n.maps.push(this.public), e = this._checkParent(e), i = c.checkOptions(i), this._checkOptions(i), this._setDefaultState(i), this._setupScene(), this._setupRenderTree(), this._setupControllers(i), this.isRotationEnabled = !("isRotationEnabled" in i) || i.isRotationEnabled, i.rotation && (this.rotation = i.rotation), this._flushToDOM(e), this._handleOptions(i, e), this._setupListeners(), this._shouldPerformDelayedInit = !0, M.scheduleOnNextFrame(this), this._instrumented && this._performanceLog.push({ name: "map-init", timestamp: o, duration: N.now() - o }) }

        function o(t) { this.selected = t }

        function s(t) { t.selected = !0, k.log(k.Events.AnnotationClick, { map: this }) }
        var a = t("../../lib/geo"),
            r = t("../../lib/scene-graph"),
            l = t("../../lib/map-node").BackgroundGridThemes,
            h = t("./utils"),
            c = t("@maps/js-utils"),
            u = t("./configuration"),
            d = t("./types-internal"),
            p = t("./padding"),
            m = t("./interaction/linear-zoom-controller"),
            g = t("./interaction/map-user-interaction-controller"),
            _ = t("./localizer").l10n,
            f = t("./overlays/overlays-controller"),
            y = t("./annotations/annotations-controller"),
            v = t("./map-node-controller"),
            w = t("./controls/zoom-control"),
            b = t("./user-location/user-location-controller"),
            C = t("./controls/controls-layer"),
            S = t("@maps/geometry/point"),
            L = t("@maps/geometry/rect"),
            T = t("@maps/geometry/size"),
            E = t("@maps/dom-events"),
            x = t("@maps/render-tree"),
            M = t("@maps/scheduler"),
            A = t("@maps/device-pixel-ratio"),
            k = t("./analytics/analytics"),
            O = t("./layer-items-controller"),
            I = t("./overlays/overlay"),
            R = t("./annotations/annotation"),
            P = t("./collections/item-collection"),
            D = t("./constants"),
            z = D.FeatureVisibility,
            N = t("./instruments"),
            F = a.CoordinateRegion,
            j = a.CoordinateSpan,
            U = a.Coordinate,
            B = a.MapPoint,
            G = a.MapSize,
            W = a.MapRect,
            K = h.supportsTouches,
            Z = new W(0, 0, 1, 1),
            V = new j(.15, .15),
            q = { padding: "rw", isScrollEnabled: "rw", isZoomEnabled: "rw", center: "rw", region: "rw", rotation: "rw", isRotationEnabled: "rw", showsCompass: "rw", visibleMapRect: "rw", tintColor: "rw", annotations: "rw", selectedAnnotation: "rw", overlays: "rw", selectedOverlay: "rw", showsUserLocation: "rw", tracksUserLocation: "rw", mapType: "rw", _showsDefaultTiles: "rw", showsPointsOfInterest: "rw", showsMapTypeControl: "rw", showsZoomControl: "rw", showsScale: "rw", showsUserLocationControl: "rw", annotationForCluster: "rw", element: "ro", userLocationAnnotation: "ro" };
        n.maps = [];
        var H = { ZOOM_START: "zoom-start", ZOOM_END: "zoom-end", SELECT: "select", DESELECT: "deselect", DRAG_START: "drag-start", DRAGGING: "dragging", DRAG_END: "drag-end", REGION_CHANGE_START: "region-change-start", REGION_CHANGE_END: "region-change-end", SCROLL_START: "scroll-start", SCROLL_END: "scroll-end", MAP_TYPE_CHANGE: "map-type-change", ROTATION_START: "rotation-start", ROTATION_END: "rotation-end", MAP_NODE_CHANGE: "map-node-change", MAP_NODE_READY: "map-node-ready", COMPLETE: "complete" };
        n.MapTypes = D.MapTypes, n.prototype = {
            constructor: n,
            _showsUserLocation: !1,
            _tracksUserLocation: !1,
            _tintColor: "",
            _annotationForCluster: null,
            get padding() { return this._padding.copy() },
            set padding(t) {
                if (c.checkInstance(t, p, "[MapKit] The `padding` parameter passed to `Map.padding` is not a Padding."), !this._padding.equals(t)) {
                    this._padding = t.copy();
                    var e = this.ensureRenderingFrame();
                    e.equals(L.Zero) || (this._setRenderingFrameValue(e), this.setVisibleMapRectAnimated(this._mapRectAccountingForPadding(), !1)), this.controlsLayer && this.controlsLayer.mapPaddingDidChange(this._adjustedPadding)
                }
            },
            get isScrollEnabled() { return this._mapNode.pannable },
            set isScrollEnabled(t) { this._mapNode.pannable = !!t },
            get isZoomEnabled() { return this._mapNode.zoomable },
            set isZoomEnabled(t) { this._mapNode.zoomable = !!t, this.controlsLayer.updateZoomControl() },
            get showsZoomControl() { return this._showsZoomControl },
            set showsZoomControl(t) {
                (t = !!t) !== this._showsZoomControl && (this._showsZoomControl = t, this.controlsLayer.updateZoomControl(), this.controlsLayer.updateScale())
            },
            get showsScale() { return this._showsScale },
            set showsScale(t) { c.checkValueIsInEnum(t, z) ? t !== this._showsScale && (this._showsScale = t, this.controlsLayer && this.controlsLayer.updateScale()) : console.warn("[MapKit] value passed to `Map.showsScale` setter must be part of the mapkit.FeatureVisibility enum.") },
            get mapType() { return this._mapType },
            set mapType(t) {
                if (t !== this._mapType) {
                    if (!c.checkValueIsInEnum(t, n.MapTypes)) throw new Error("[MapKit] Unknown value for `mapType`. Choose from Map.MapTypes.");
                    this._mapType = t, this._mapNodeController.handleMapConfigurationChange(), this.controlsLayer.update();
                    var e = t !== n.MapTypes.Standard;
                    this._annotationsController.mapTypeWasSet(e), this._overlaysController.mapTypeWasSet(e), this.public.dispatchEvent(new E.Event(H.MAP_TYPE_CHANGE)), k.log(k.Events.MapTypeChange, { map: this })
                }
            },
            get _showsTileInfo() { return this._mapNode._impl.debug },
            set _showsTileInfo(t) { this._mapNode._impl.debug = t },
            get _showsDefaultTiles() { return this._mapNode.showsDefaultTiles },
            set _showsDefaultTiles(t) { this._mapNode.showsDefaultTiles = t },
            get tileOverlays() { return this._mapNode.tileOverlays },
            set tileOverlays(t) { this._mapNode.tileOverlays = t, this.controlsLayer.updateZoomControl() },
            addTileOverlay: function(t) { var e = this._mapNode.addTileOverlay(t); return this.controlsLayer.updateZoomControl(), e },
            addTileOverlays: function(t) { var e = this._mapNode.addTileOverlays(t); return this.controlsLayer.updateZoomControl(), e },
            removeTileOverlay: function(t) { var e = this._mapNode.removeTileOverlay(t); return this.controlsLayer.updateZoomControl(), e },
            removeTileOverlays: function(t) { var e = this._mapNode.removeTileOverlays(t); return this.controlsLayer.updateZoomControl(), e },
            get showsMapTypeControl() { return this._showsMapTypeControl },
            set showsMapTypeControl(t) {
                (t = !!t) !== this._showsMapTypeControl && (this._showsMapTypeControl = t, this.controlsLayer.updateMapTypeControl())
            },
            get showsUserLocationControl() { return this._showsUserLocationControl },
            set showsUserLocationControl(t) {
                (t = !!t) !== this._showsUserLocationControl && (this._showsUserLocationControl = t, this.controlsLayer.updateUserLocationControl(), this.controlsLayer.updateScale())
            },
            get showsPointsOfInterest() { return this._mapNode.showsPointsOfInterest },
            set showsPointsOfInterest(t) { this._mapNode.showsPointsOfInterest = !!t },
            get element() { return this.rootNode && this.rootNode.element },
            set element(t) { console.warn("[MapKit] The `element` property is read-only.") },
            get renderingMapRect() { return this._mapNode.visibleMapRect },
            get visibleMapRect() { return this._visibleMapRect || (this._visibleMapRect = this._mapRectAccountingForPadding()), this._visibleMapRect },
            set visibleMapRect(t) { this.setVisibleMapRectAnimated(t, !1) },
            setVisibleMapRectAnimated: function(t, e, i) {
                c.required(t, "[MapKit] Missing `visibleMapRect` parameter in call to `Map.setVisibleMapRectAnimated()`.").checkInstance(t, W, "[MapKit] The `visibleMapRect` parameter passed to `Map.setVisibleMapRectAnimated()` is not a MapRect."), t !== Z && (this._defaultVisibleMapRectHasBeenOverriden = !0);
                var n = this.ensureRenderingFrame();
                if (0 === n.size.width || 0 === n.size.height) this._visibleMapRect = t;
                else {
                    var o = this._visibleFrame,
                        s = t,
                        r = this._adjustedPadding;
                    if (!r.equals(p.Zero)) {
                        var l = n.size.width / o.size.width,
                            h = n.size.height / o.size.height;
                        s = new W(t.minX() - r.left * l * t.size.width, t.minY() - r.top * h * t.size.height, t.size.width * l, t.size.height * h)
                    }
                    var u = new B(t.midX(), t.midY()),
                        d = a.zoomLevelForMapRectInViewport(s, n.size, a.tileSize);
                    d = c.clamp(this._mapNode.snapsToIntegralZoomLevels ? Math.floor(d + 1e-6) : d, this.minZoomLevel, this.maxZoomLevel);
                    var m = Math.pow(2, Math.ceil(d)) * (a.tileSize * Math.pow(2, d - Math.ceil(d))),
                        g = new G(o.size.width / m, o.size.height / m);
                    t = new W(u.x - g.width / 2, u.y - g.height / 2, g.width, g.height)
                }
                return e = null == e || !!e, this._setVisibleMapRect(t, e, i), delete this._delayedShowItems, this.public
            },
            get region() { return this.visibleMapRect.toCoordinateRegion() },
            set region(t) { this.setRegionAnimated(t, !1) },
            setRegionAnimated: function(t, e, i) { return c.required(t, "[MapKit] Tried to set `Map.region` property to a non-existent value.").checkInstance(t, F, "[MapKit] Region passed to `Map.region` setter is not a CoordinateRegion."), this.region.equals(t) || this.setVisibleMapRectAnimated(t.toMapRect(), e, i), this.public },
            get isRotationAvailable() { return u.previewLoCSR ? !u.didFallback && this.csrCapable : u.ready || u.didFallback ? u.canRunCSR && this.csrCapable : this.csrCapable },
            set isRotationAvailable(t) { console.warn("[MapKit] Map.isRotationAvailable is a read-only property") },
            get isRotationEnabled() { return this._mapNode.isRotationEnabled },
            set isRotationEnabled(t) { "boolean" == typeof t ? (this.isRotationAvailable ? this._mapNode.isRotationEnabled = t : console.warn("[MapKit] Rotation can't be enabled because it's not available."), this.controlsLayer.updateRotationControl()) : console.warn("[MapKit] Value passed to `Map.isRotationEnabled` is not a Boolean.") },
            get rotation() { return this._mapNode.rotation },
            set rotation(t) { this.setRotationAnimated(t, !1), this.controlsLayer.updateRotationControl() },
            get showsCompass() { return this.usingCSR ? this._showsCompass : z.Hidden },
            set showsCompass(t) { c.checkValueIsInEnum(t, z) ? (this.isRotationEnabled || t !== z.Visible && t !== z.Adaptive || console.warn("[MapKit] The compass cannot be shown when `Map.isRotationEnabled` is false."), this._usingDefaultShowsCompassValue = !1, t !== this._showsCompass && (this._showsCompass = t, this.controlsLayer && this.controlsLayer.updateRotationControl())) : console.warn("[MapKit] value passed to `Map.showsCompass` setter must be part of the MapKit.FeatureVisibility enum.") },
            get usingCSR() { return !this._mapNodeController.usingSSR },
            setRotationAnimated: function(t, e, i) {
                if (this.isRotationAvailable || console.warn("[MapKit] Rotation is not available."), c.required(t, "[MapKit] Tried to set `Map.rotation` property to a non-existent value."), "number" == typeof t && !isNaN(t)) {
                    if (e || null == e) {
                        var n = this.camera.copy();
                        n.rotation = t, this._mapNode.setCameraAnimated(n, !0), this.mapRotationWillStart()
                    }
                    else i || this.mapRotationWillStart(), this._mapNode.rotation = t, i || this.mapRotationDidEnd();
                    return this.public
                }
                console.warn("[MapKit] Argument for `Map.rotation` is not a Number.")
            },
            get center() { var t = this.visibleMapRect; return new B(t.midX(), t.midY()).toCoordinate() },
            set center(t) { this.setCenterAnimated(t, !1) },
            setCenterAnimated: function(t, e, i) { return c.required(t, "[MapKit] Tried to set `Map.center` property to a non-existent value.").checkInstance(t, U, "[MapKit] Value passed to `Map.center` setter is not a Coordinate object."), this._mapNode.setCenterAnimated(t, null == e || !!e), delete this._visibleMapRect, i || (this.tracksUserLocation = !1), this.public },
            get overlays() { return this._overlaysController.items },
            set overlays(t) { this._overlaysController.items = t },
            get selectedOverlay() { return this._overlaysController.selectedItem },
            set selectedOverlay(t) { this._overlaysController.selectedItem = t },
            addOverlay: function(t) { return this._overlaysController.addItem(t) },
            addOverlays: function(t) { return this._overlaysController.addItems(t), t },
            removeOverlay: function(t) { return this._overlaysController.removeItem(t) },
            removeOverlays: function(t) { return this._overlaysController.removeItems(t) },
            topOverlayAtPoint: function(t) {
                c.checkInstance(t, window.DOMPoint, "[MapKit] Map.topOverlayAtPoint expected a DOMPoint, but got `" + t + "` instead.");
                var e = this.rootNode.convertPointFromPage(t),
                    i = this._overlaysController.pickableItemsCloseToPoint(this.overlays, e, 0),
                    n = this.selectedOverlay;
                return n && i.indexOf(n) > 0 ? n : i[0]
            },
            overlaysAtPoint: function(t) { c.checkInstance(t, window.DOMPoint, "[MapKit] Map.overlaysAtPoint expected a DOMPoint, but got `" + t + "` instead."); var e = this.rootNode.convertPointFromPage(t); return this._overlaysController.pickableItemsCloseToPoint(this.overlays, e, 0).reverse() },
            get annotations() { return this._annotationsController.items },
            set annotations(t) { this._annotationsController.items = t },
            get selectedAnnotation() { return this._annotationsController.selectedItem },
            set selectedAnnotation(t) { this._annotationsController.selectedItem = t },
            addAnnotation: function(t) { return this._annotationsController.addItem(t) },
            addAnnotations: function(t) { return this._annotationsController.addItems(t) },
            removeAnnotation: function(t) { return this._annotationsController.removeItem(t) },
            removeAnnotations: function(t) { return this._annotationsController.removeItems(t) },
            showItems: function(t, e) {
                var i = new P(t).getFlattenedItemList();
                e = O.checkShowItemsParameters(i, e);
                var n = [],
                    o = [];
                return i.forEach(function(t) { t.map || (t instanceof I ? (t._impl._map = this.public, n.push(t)) : t instanceof R && this._annotationsController.preAddedAnnotation(t) && o.push(t)) }, this), this.isRooted() && O.setRegionForItems(this, i, e) || (this._delayedShowItems = [i, e]), n.forEach(function(t) { delete t._impl._map }), o.forEach(this._annotationsController.resetAnnotation), this._addItems(i), t
            },
            addItems: function(t) { var e = new P(t).getFlattenedItemList(); return this._addItems(e) },
            removeItems: function(t) {
                var e = [],
                    i = [];
                return new P(t).getFlattenedItemList().forEach(function(t, n) {
                    if (!(t instanceof I || t instanceof R)) throw new Error("[MapKit] Map.removeItems expected an Annotation, Overlay, ItemCollection, or Array of valid items at index " + n + ", but got `" + t + "` instead.");
                    t instanceof I ? e.push(t) : i.push(t)
                }, this), this.removeOverlays(e), this.removeAnnotations(i), t
            },
            annotationsInMapRect: function(t) { return this._annotationsController.annotationsInMapRect(t) },
            updateSize: function(t) { return console.warn("[MapKit] Map resizing is now automatic, the Map.updateSize() method has been deprecated and will be removed in a future version."), this.public },
            convertCoordinateToPointOnPage: function(t) {
                c.checkInstance(t, U, "[MapKit] Map.convertCoordinateToPointOnPage expected a Coordinate, but got `" + t + "` instead.");
                var e = this.camera.transformMapPoint(t.toMapPoint()),
                    i = this.rootNode.convertPointToPage(e);
                return new window.DOMPoint(i.x, i.y)
            },
            convertPointOnPageToCoordinate: function(t) {
                c.checkInstance(t, window.DOMPoint, "[MapKit] Map.convertPointOnPageToCoordinate expected a DOMPoint, but got `" + t + "` instead.");
                var e = this.camera.transformGestureCenter(this.rootNode.convertPointFromPage(new S(t.x, t.y))),
                    i = this.renderingMapRect.origin;
                return new U(a.convertYToLatitude(i.y + e.y / this.worldSize), a.convertXToLongitude(i.x + e.x / this.worldSize))
            },
            get showsUserLocation() { return this._userLocationController.showsUserLocation },
            set showsUserLocation(t) {
                (t = !!t) !== this.showsUserLocation && (this._userLocationController.showsUserLocation = t, t || (this._removeUserLocationDisplay(), this.tracksUserLocation = !1), this.showsUserLocationControl && (this.controlsLayer.updateUserLocationControl(), this.controlsLayer.updateScale()))
            },
            get userLocationAnnotation() { return this._annotationsController.userLocationAnnotation },
            get tracksUserLocation() { return this._userLocationController.tracksUserLocation },
            set tracksUserLocation(t) {
                (t = !!t) !== this.tracksUserLocation && (this._userLocationController.tracksUserLocation = t, this._mapNode.staysCenteredDuringZoom = t, t ? this.showsUserLocation = !0 : this.userLocationAnnotation || (this.showsUserLocation = !1), this._firstCameraUpdateToTrackUserLocationPending = t, this._updateCameraToTrackUserLocation(this._userLocationController.userLocation), this.controlsLayer.updateUserLocationControl(), this._userLocationTrackingDelegate && "function" == typeof this._userLocationTrackingDelegate.mapUserLocationTrackingDidChange && this._userLocationTrackingDelegate.mapUserLocationTrackingDidChange(this.public))
            },
            get tintColor() { return this._tintColor },
            set tintColor(t) {
                if (t !== this._tintColor) {
                    if (null != t) {
                        if (c.checkType(t, "string", "[MapKit] Expected a string value for Map.tintColor, but got `" + t + "` instead"), "" !== t && !h.isValidCSSColor(t)) return void console.warn("[MapKit] value passed to `Map.tintColor` is not a valid color value. Ignoring: " + t);
                        this._tintColor = t
                    }
                    else delete this._tintColor;
                    this.controlsLayer && this.controlsLayer.update()
                }
            },
            get minZoomLevel() { return this._mapNode.minZoomLevel },
            get maxZoomLevel() { return this._mapNode.maxZoomLevel },
            get zoomLevel() { return this._mapNode.zoomLevel },
            set zoomLevel(t) { this._mapNode.zoomLevel = t },
            get worldSize() { return Math.pow(2, this._mapNode.zoomLevel) * a.tileSize },
            get camera() { return this._mapNodeController.node.camera },
            get cameraIsPanning() { return this._mapNode.cameraIsPanning },
            get cameraIsZooming() { return this._mapNode.cameraIsZooming },
            get _mapNode() { return this._mapNodeController.node },
            get csrCapable() { return this._mapNodeController.csrCapable },
            destroy: function() {
                this.removeAnnotations(this.annotations), this.removeOverlays(this.overlays), this._stopStabilizationTimeout(), this._shouldPerformDelayedInit = !1, this._linearZoomController.stop(), this.showsUserLocation && this._removeUserLocationDisplay(), this.controlsLayer.mapWasDestroyed(), this.controlsLayer = null, this._mapUserInteractionController.mapWasDestroyed(), this._overlaysController.mapWasDestroyed(), this._annotationsController.mapWasDestroyed(), this._userLocationController.mapWasDestroyed(), this._linearZoomController._delegate = null, u.removeEventListener(u.Events.Changed, this), _.removeEventListener(_.Events.LocaleChanged, this), A.removeEventListener("device-pixel-ratio-change", this), this._iframe && (this._iframe.removeEventListener("load", this), this._iframe.contentWindow && this._iframe.contentWindow.removeEventListener("resize", this), this._iframe.remove(), this._iframe = null), this._mapNodeController.destroy(), this._mapRoot.remove(), this._mapRoot = null, this._scene.destroy(), this._scene = null, this._removePrintListener(), this.element && this.element.parentNode && this.element.parentNode.removeChild(this.element), this.rootNode.remove(), this.rootNode = null;
                var t = n.maps.indexOf(this.public);
                t >= 0 && n.maps.splice(t, 1)
            },
            adjustMapItemPoint: function(t) { return this._mapNode.adjustMapItemPoint(t) },
            get annotationForCluster() { return this._annotationForCluster },
            set annotationForCluster(t) {
                if (null == t) delete this._annotationForCluster;
                else {
                    if ("function" != typeof t) throw new Error("[MapKit] annotationForCluster must be a function or null");
                    this._annotationForCluster = t
                }
            },
            handleEvent: function(t) {
                switch (t.type) {
                    case u.Events.Changed:
                        this._configurationDidBecomeAvailable();
                        break;
                    case w.EVENTS.ZOOM_START:
                        this._handleZoomStartEvent(t);
                        break;
                    case w.EVENTS.ZOOM_END:
                        this._handleZoomEndEvent(t);
                        break;
                    case _.Events.LocaleChanged:
                        this._handleLocaleChange(t);
                        break;
                    case "device-pixel-ratio-change":
                        this._devicePixelRatioDidChange(t);
                        break;
                    case "load":
                        this._iframeDidLoad();
                        break;
                    case "resize":
                        this._iframeSizeDidChange()
                }
            },
            elementShouldPreventDragstart: function(t) { return !this._annotationsController.isElementInCustomCallout(t) },
            elementWantsDefaultBrowserBehavior: function(t) { return this._annotationsController.isElementInCallout(t) },
            tileAccessForbidden: function() { u.accessKeyHasExpired() },
            mapDidFinishRendering: function(t) { this._instrumented && this._performanceLog.push({ name: "map-fully-rendered", timestamp: N.now() }), this.addWaitingAnnotations(), this._startStabilizationTimeoutIfNeeded() },
            mapCanStartPanning: function(t) { return !(this.tracksUserLocation && this.cameraIsZooming || this._annotationsController.dragging || this._isInitialInteractionTargetInUIElement() || !this.public.dispatchEvent(new E.Event(H.SCROLL_START))) },
            mapWillStartPanning: function(t) {
                this._stopStabilizationTimeout(), this.tracksUserLocation = !1;
                var e = this.rootNode.element;
                h.classList.add(e, "mk-panning"), h.classList.add(e, "mk-dragging-cursor")
            },
            mapWillStopPanning: function(t) { h.classList.remove(this.rootNode.element, "mk-dragging-cursor") },
            mapDidStopPanning: function(t) { this._startStabilizationTimeoutIfNeeded(), h.classList.remove(this.rootNode.element, "mk-panning"), this.public.dispatchEvent(new E.Event(H.SCROLL_END)) },
            mapCanStartZooming: function(t) { return !(this._isInitialInteractionTargetInUIElement() || !this.public.dispatchEvent(new E.Event(H.ZOOM_START))) },
            mapWillStartZooming: function(t, e, i) { this._stopStabilizationTimeout(), i && (this.tracksUserLocation = !1) },
            mapDidStopZooming: function(t) { this._startStabilizationTimeoutIfNeeded(), this.public.dispatchEvent(new E.Event(H.ZOOM_END)), k.log(k.Events.Zoom, { map: this }), this.controlsLayer.scaleDidChange() },
            mapCameraDidChange: function(t, e) { delete this._visibleMapRect, this._overlaysController.mapCameraDidChange(), this._annotationsController.updateVisibleAnnotations(), this.controlsLayer.scaleDidChange(), this.controlsLayer.updateRotationControl() },
            mapCameraChangesWillStart: function(t, e) { this._zoomLevelWhenCameraChangeStarted = this.zoomLevel, this.public.dispatchEvent(new E.Event(H.REGION_CHANGE_START)) },
            mapCameraChangesDidEnd: function(t) { this._zoomLevelWhenCameraChangeStarted !== this.zoomLevel && this.controlsLayer.zoomLevelDidChange(), delete this._zoomLevelWhenCameraChangeStarted, this.public.dispatchEvent(new E.Event(H.REGION_CHANGE_END)) },
            mapRotationWillStart: function(t) { this.public.dispatchEvent(new E.Event(H.ROTATION_START)) },
            mapRotationDidChange: function(t) { this.controlsLayer.updateRotationControl() },
            mapRotationDidEnd: function(t) { this.public.dispatchEvent(new E.Event(H.ROTATION_END)) },
            mapTransformCenter: function(t) { var e = this.visibleMapRect; return new B(e.midX(), e.midY()) },
            userWillTap: function(t) {
                if (this._isInitialInteractionTargetInUIElement()) h.supportsTouches && (this._delayedTapFunction = this._elementWasTapped.bind(this, this._mapUserInteractionController.initialEventTargetForCurrentInteraction));
                else {
                    var e = this.rootNode.convertPointFromPage(t),
                        i = this._annotationsController.itemCloseToPoint(e);
                    if (i) i.enabled && (this._delayedTapFunction = s.bind(this, i));
                    else {
                        var n = this._overlaysController.itemCloseToPoint(e);
                        n ? n.enabled && (this._delayedTapFunction = o.bind(n, !0)) : this._delayedTapFunction = function() { this._annotationsController.selectedItem = null, this._overlaysController.selectedItem = null }.bind(this)
                    }
                }
            },
            userDidTap: function(t) { this._delayedTapFunction && (this._delayedTapFunction(), delete this._delayedTapFunction) },
            userCanceledTap: function(t) { delete this._delayedTapFunction },
            userDidLongPress: function(t) { if (this._isInitialInteractionTargetInUIElement()) return !1; var e = this._annotationsController.itemCloseToPoint(this.rootNode.convertPointFromPage(t), !0); if (!e) return !1; if (e.enabled) { if (e._impl.isDraggable() && !this.cameraIsPanning && !this.cameraIsZooming) return this._annotationsController.startDraggingAnnotation(e, t), !0; if (h.supportsTouches) return s.call(this, e), !0 } return h.supportsTouches },
            userDidPanAfterLongPress: function(t) { this._annotationsController.annotationDraggingDidChange(t) },
            userDidStopPanningAfterLongPress: function(t) { this._annotationsController.annotationDraggingDidEnd(t) },
            linearZoomControllerDidZoom: function(t) { this.cameraIsZooming && (this.zoomLevel = t, (t <= this.minZoomLevel && !this._linearZoomController.zoomsIn || t >= this.maxZoomLevel && this._linearZoomController.zoomsIn) && this._mapNode.cameraDidStopZooming()) },
            linearZoomControllerDidStop: function() { this._mapNode.cameraDidStopZooming() },
            userLocationDidChange: function(t) { this._updateUserLocationDisplay(t.target), this.controlsLayer.userLocationDidChange(t.target), this.tracksUserLocation && this._updateCameraToTrackUserLocation(t.target), this.public.dispatchEvent(t) },
            userLocationDidError: function(t) { this._updateUserLocationDisplay(t.target), this.controlsLayer.userLocationDidError(t.target), this.public.dispatchEvent(t) },
            isRooted: function() { return this.element && this.element.ownerDocument.body.contains(this.element) },
            stopDraggingAnnotation: function() { this._mapUserInteractionController._stopDraggingAnnotation() },
            translateVisibleMapRectAnimated: function(t, e) {
                var i = this.visibleMapRect;
                this._setVisibleMapRect(new W(i.minX() + t.x / this.worldSize, i.minY() + t.y / this.worldSize, i.size.width, i.size.height), !!e)
            },
            translateCameraAnimated: function(t, e) { this._mapNode.setCameraAnimated(this.camera.translate(t), !!e) },
            setCameraAnimated: function(t, e) { this._mapNode.setCameraAnimated(t, !!e) },
            shouldWaitForTilesAndControls: function() { return !u.ready || this.controlsLayer.controlsPending || !this._mapNode.fullyRendered },
            ensureRenderingFrame: function() { return this._renderingFrame || new L },
            ensureVisibleFrame: function() { return this._visibleFrame || new L },
            annotationDraggingWillStart: function() { h.classList.add(this.rootNode.element, "mk-dragging-annotation"), this.controlsLayer.canShowTooltips = !1 },
            annotationDraggingDidEnd: function() { h.classList.remove(this.rootNode.element, "mk-dragging-annotation"), this.controlsLayer.canShowTooltips = !0 },
            get isCompassHidden() { return this.showsCompass === z.Hidden || h.supportsTouches && this.showsCompass === z.Adaptive && 0 === this.rotation || !this.isRotationEnabled },
            compassDraggingWillStart: function() { this.mapRotationWillStart(), h.classList.add(this.element, "mk-dragging-cursor") },
            compassDraggingDidEnd: function() { this.mapRotationDidEnd(), h.classList.remove(this.element, "mk-dragging-cursor") },
            panningDuringAnnotationDrag: function() { this._annotationsController.mapPanningDuringAnnotationDrag() },
            padMapRect: function(t, e) {
                c.checkType(e, "object", "[MapKit] padding must be an object with any of `top`, `left`, `bottom`, `right`"), ["top", "left", "bottom", "right"].forEach(function(t) { if (t in e) { var i = e[t]; if ("number" != typeof i || i < 0) throw new Error("[MapKit] property `" + t + "` of padding must be a number >= 0; got `" + i + "`") } else e[t] = 0 });
                var i = a.zoomLevelForMapRectInViewport(t, this.ensureRenderingFrame().size, a.tileSize),
                    n = Math.pow(2, i) * a.tileSize;
                return d.padMapRect(t, { top: e.top / n, left: e.left / n, bottom: e.bottom / n, right: e.right / n })
            },
            supportsLabelRegions: function() { return !this._mapNodeController.usingSSR },
            createLabelRegion: function() { return this._mapNode.createLabelRegion() },
            updatedLabelRegion: function() { this._mapNode.updatedLabelRegion() },
            unregisterLabelRegion: function(t) { this._mapNode.unregisterLabelRegion(t) },
            _addItems: function(t) {
                var e = [];
                return t.forEach(function(t, i) {
                    if (!(t instanceof I || t instanceof R)) throw new Error("[MapKit] Map.addItems expected an Annotation, Overlay, ItemCollection, or Array of valid items at index " + i + ", but got `" + t + "` instead.");
                    t.map || (t instanceof I ? this.addOverlay(t) : e.push(t))
                }, this), this.addAnnotations(e), t
            },
            _configurationDidBecomeAvailable: function(t) { this._mapNodeController.configurationDidBecomeAvailable(t), this._initialMapLoad && (k.log(k.Events.MapsLoad, { map: this }), this._initialMapLoad = !1), this.controlsLayer.update(), u.location && !this._defaultVisibleMapRectHasBeenOverriden && (this.region = new F(new U(u.location.lat, u.location.lng), V)) },
            _setupScene: function() { this._instrumented ? this._scene = new N.Scene(this) : this._scene = new r.Scene, h.classList.add(this._scene.element, "rt-root") },
            _checkOptions: function(t) { c.checkType(t, "object", "[MapKit] The `options` object is invalid."), Object.keys(t).forEach(function(t) { var e = q[t]; "rw" === e || ("ro" === e ? console.warn("[MapKit] `" + t + "` is read-only and can't be set on a Map.") : console.warn("[MapKit] `" + t + "` is not a valid property of Map.")) }) },
            _checkParent: function(t) { if (void 0 !== t && null !== t) { var e = "string" == typeof t ? document.getElementById(t) : t; if (!e || !c.isElement(e)) throw new Error("[MapKit] `parent` must either be a DOM element or its ID."); return e } },
            _setDefaultState: function(t) {
                this._showsScale = z.Hidden, this._visibleMapRect = Z, this._padding = new p, this._adjustedPadding = new p, this._showsCompass = z.Adaptive, this._usingDefaultShowsCompassValue = !0, this._showsZoomControl = "showsZoomControl" in t ? !!t.showsZoomControl : !K, this._showsMapTypeControl = "showsMapTypeControl" in t ? !!t.showsMapTypeControl : !K, this._showsUserLocationControl = "showsUserLocationControl" in t && !!t.showsUserLocationControl;
                var e = n.MapTypes.Standard;
                if (t.mapType) {
                    if (!c.checkValueIsInEnum(t.mapType, n.MapTypes)) throw new Error("[MapKit] Unknown value for `mapType`. Choose from Map.MapTypes.");
                    e = t.mapType
                }
                this._mapType = e
            },
            _setupRenderTree: function() {
                var t = document.createElement("div");
                t.className = "mk-map-view", t.appendChild(this._scene.element), this.rootNode = new x.Node(t)
            },
            _setupControllers: function(t) { this.controlsLayer = new C(this), this._overlaysController = new f(this), this._scene.addChild(this._overlaysController.node), this._annotationsController = new y(this), this._scene.addChild(this._annotationsController.sceneGraphNode), this._userLocationController = new b(this), this._mapNodeController = new v(this, t), this._linearZoomController = new m(this._mapNode.snapsToIntegralZoomLevels, this), this._mapUserInteractionController = new g(this.rootNode.element, this) },
            _handleOptions: function(t, e) {
                t.showsScale && (this.showsScale = t.showsScale), t.showsCompass && (this.showsCompass = t.showsCompass), t.padding && (this.padding = t.padding), t.visibleMapRect ? this.visibleMapRect = t.visibleMapRect : t.region ? this.region = t.region : t.center && (this.center = t.center);
                var i = [],
                    n = !t.visibleMapRect && !t.region && !t.center && e;
                t.overlays && (c.checkArray(t.overlays, "[MapKit] Map constructor overlays option expected an array of overlays, but got `" + t.annotations + "` instead."), n ? i.push.apply(i, t.overlays) : this.overlays = t.overlays), t.annotations && (c.checkArray(t.annotations, "[MapKit] Map constructor annotations option expected an array of annotations, but got `" + t.annotations + "` instead."), n ? i.push.apply(i, t.annotations) : this.annotations = t.annotations), i.length > 0 && this.showItems(i), t.selectedOverlay && (this.selectedOverlay = t.selectedOverlay), t.selectedAnnotation && (this.selectedAnnotation = t.selectedAnnotation), this.tintColor = t.tintColor, this.showsUserLocation = t.showsUserLocation, this.tracksUserLocation = t.tracksUserLocation
            },
            _flushToDOM: function(t) { this._addMapToParent(t), M.flush(), this._ensureContainerIsPositioned() },
            _addMapToParent: function(t) { void 0 !== t && null !== t && (t.appendChild(this.element), this._bootstrapSize.width && this._bootstrapSize.height && this._updateRenderingFrameSize(this._bootstrapSize), delete this._bootstrapSize) },
            performScheduledUpdate: function() { this._shouldPerformDelayedInit && (this._delayedInit(), this._shouldPerformDelayedInit = !1) },
            _delayedInit: function() { this._iframe = h.htmlElement("iframe", { tabindex: -1, "aria-hidden": !0 }), this._iframe.addEventListener("load", this), this.element.insertBefore(this._iframe, this._scene.element) },
            _updateUserLocationDisplay: function(t) { this._annotationsController.updateUserLocationAnnotation(t), this._overlaysController.updateUserLocationAccuracyRingOverlay(t) },
            _removeUserLocationDisplay: function() { this._annotationsController.removeUserLocationAnnotation(), this._overlaysController.removeUserLocationAccuracyRingOverlay() },
            _updateCameraToTrackUserLocation: function(t) {
                var e, i;
                if (this.tracksUserLocation && this.showsUserLocation && t.coordinate) {
                    if (this._firstCameraUpdateToTrackUserLocationPending && this.zoomLevel < 9.5) {
                        var n = 14;
                        if (t.location.accuracy > 0) {
                            var o = 5 * t.location.accuracy * a.mapUnitsPerMeterAtLatitude(t.location.latitude),
                                s = new W(0, 0, o, o),
                                r = this._visibleFrame.size;
                            n = Math.max(this.zoomLevel, a.zoomLevelForMapRectInViewport(s, r, a.tileSize))
                        }
                        e = this._mapRectForCenterAndZoomLevel(t.coordinate.toMapPoint(), n), this._userLocationTrackingDelegate && "function" == typeof this._userLocationTrackingDelegate.mapRegionWillChangeToTrackUserLocation && (i = e.toCoordinateRegion(), this._userLocationTrackingDelegate.mapRegionWillChangeToTrackUserLocation(this.public, i), e = i.toMapRect()), this._mapNode.setCameraAnimated(this.camera.withNewMapRect(e), !0, !0)
                    }
                    else this._userLocationTrackingDelegate && "function" == typeof this._userLocationTrackingDelegate.mapRegionWillChangeToTrackUserLocation ? (i = (e = this._mapRectForCenterAndZoomLevel(t.coordinate.toMapPoint(), this.zoomLevel)).toCoordinateRegion(), this._userLocationTrackingDelegate.mapRegionWillChangeToTrackUserLocation(this.public, i), this._mapNode.setCameraAnimated(this.camera.withNewMapRect(e), !0, !0)) : this.setCenterAnimated(t.coordinate, !0, !0);
                    delete this._firstCameraUpdateToTrackUserLocationPending
                }
            },
            _updateRenderingFrameFromElement: function() {
                var t = this.rootNode.element,
                    e = t.offsetWidth,
                    i = t.offsetHeight;
                0 !== e && 0 !== i && this._updateRenderingFrameSize(new T(e, i))
            },
            _setRenderingFrameValue: function(t) {
                this._renderingFrame = t, this._visibleFrame = t;
                var e = this._adjustedPadding.copy(),
                    i = this._adjustedPadding = this._adjustedPaddingForMapSize(t.size);
                i.equals(p.Zero) || (this._visibleFrame = new L(t.origin.x + i.left, t.origin.y + i.top, t.size.width - i.left - i.right, t.size.height - i.top - i.bottom)), !i.equals(e) && this.controlsLayer && this.controlsLayer.mapPaddingDidChange(i)
            },
            _adjustedPaddingForMapSize: function(t) {
                var e = this.controlsLayer.legalControlExpandedSize,
                    i = new T(Math.min(e.width, t.width), Math.min(e.height, t.height)),
                    n = this._padding.copy(),
                    o = n.left + n.right,
                    s = n.top + n.bottom,
                    a = o + i.width - t.width,
                    r = s + i.height - t.height;
                if (a > 0 && o > 0) {
                    var l = (o - a) / o;
                    n.left *= l, n.right *= l
                }
                if (r > 0 && s > 0) {
                    var h = (s - r) / s;
                    n.top *= h, n.bottom *= h
                }
                return n
            },
            _iframeDidLoad: function() { this._iframe.contentWindow.addEventListener("resize", this), this._ensureContainerIsPositioned(), this._iframeSizeDidChange() },
            _iframeSizeDidChange: function() { "function" == typeof window.matchMedia && window.matchMedia("print").matches || this._updateRenderingFrameFromElement() },
            _updateRenderingFrameSize: function(t) {
                var e = !this._renderingFrame;
                0 === t.width || 0 === t.height || !e && this._renderingFrame.size.equals(t) || (this._setRenderingFrameValue(new L(0, 0, t.width, t.height)), this._scene.size = t, this._mapRoot.size = t, this._mapNodeController.updateSize(t), this._delayedShowItems && (O.setRegionForItems(this, this._delayedShowItems[0], this._delayedShowItems[1]), delete this._delayedShowItems), this.controlsLayer.sizeDidChange(), this._annotationsController.mapSizeDidUpdate())
            },
            _mapRectForCenterAndZoomLevel: function(t, e) {
                var i = this.ensureVisibleFrame().size,
                    n = Math.pow(2, e) * a.tileSize,
                    o = i.width / n,
                    s = i.height / n;
                return new W(t.x - o / 2, t.y - s / 2, o, s)
            },
            _isInitialInteractionTargetInUIElement: function() { var t = this._mapUserInteractionController.initialEventTargetForCurrentInteraction; return !!t && (!!this._annotationsController.isElementInCallout(t) || !!this.controlsLayer.element.contains(t)) },
            _handleZoomStartEvent: function(t) { t.zoomIn && this.zoomLevel >= this.maxZoomLevel || !t.zoomIn && this.zoomLevel <= this.minZoomLevel || this._linearZoomController.start(this.zoomLevel, t.zoomIn) && this._mapNode.cameraWillStartZooming() },
            _handleZoomEndEvent: function(t) { this._linearZoomController.stop() },
            _setVisibleMapRect: function(t, e, i) {
                i || (this.tracksUserLocation = !1);
                var n = t,
                    o = this._adjustedPadding,
                    s = this.ensureRenderingFrame(),
                    a = this.ensureVisibleFrame();
                o.equals(p.Zero) || a.equals(L.Zero) || (n = new W(t.minX() - o.left / a.size.width * t.size.width, t.minY() - o.top / a.size.height * t.size.height, t.size.width * (s.size.width / a.size.width), t.size.height * (s.size.height / a.size.height))), this._mapNode.setVisibleMapRectAnimated(n, e)
            },
            _ensureContainerIsPositioned: function() { var t = this.rootNode.element; "static" === t.ownerDocument.defaultView.getComputedStyle(t).position && (t.style.position = "relative") },
            didInsertNewMapNode: function(t) { t.delegate = this, this._updateMapRoot(t), window.setTimeout(function() { this.public.dispatchEvent(new E.Event(H.MAP_NODE_CHANGE)) }.bind(this), 0) },
            didReconfigureMapNode: function(t) { t.backgroundGridTheme = l[this._mapType === n.MapTypes.Standard ? "Light" : "Dark"], this._linearZoomController && (this._linearZoomController.snapsToIntegralZoomLevels = t.snapsToIntegralZoomLevels), this.controlsLayer.updateZoomControl() },
            didFinishMapNodeInitialization: function(t) {
                if (t.customCanvas) {
                    var e = this._scene.element;
                    e.parentNode.insertBefore(t.customCanvas, e)
                }
                else this._scene.addChild(t, 0)
            },
            mapNodeReady: function(t) {
                window.setTimeout(function() {
                    var e = new E.Event(H.MAP_NODE_READY);
                    e.usingCSR = t, this.public.dispatchEvent(e), k.log(k.Events.MapNodeReady, { map: this })
                }.bind(this), 0), this.controlsLayer.updateRotationControl(), this._annotationsController.mapSupportForLabelRegionsChanged()
            },
            _updateMapRoot: function(t) { this._mapRoot && this._mapRoot.remove(), this._mapRoot = this.rootNode.insertBefore(new x.Node(t.element), this.rootNode.firstChild), t.element.className = "mk-map-node-element", this._mapRoot.size = t.size = this._scene.size, this._mapRoot.addChild(this._annotationsController.node), this._mapRoot.addChild(this.controlsLayer) },
            overlaySelectionDidChange: function(t) {
                t.selected && (this._annotationsController.selectedItem = null);
                var e = new E.Event(t.selected ? H.SELECT : H.DESELECT);
                e.overlay = t, this.public.dispatchEvent(e)
            },
            annotationSelectionDidChange: function(t) { t.selected && (this._overlaysController.selectedItem = null), this.dispatchEventWithAnnotation(t.selected ? H.SELECT : H.DESELECT, t) },
            dispatchEventWithAnnotation: function(t, e, i) {
                var n = new E.Event(t);
                if (n.annotation = e, i)
                    for (var o in i) n[o] = i[o];
                this.public.dispatchEvent(n)
            },
            addWaitingAnnotations: function() { this.shouldWaitForTilesAndControls() || this._annotationsController.addWaitingAnnotations(this._dispatchCompleteEvent.bind(this)) },
            _dispatchCompleteEvent: function() { this._mapNode.fullyRendered && this.public.dispatchEvent(new E.Event(H.COMPLETE)) },
            _handleLocaleChange: function(t) {
                this._mapNodeController.handleMapConfigurationChange(), h.classList.toggle(this.controlsLayer.element, "mk-rtl", t.locale.rtl);
                var e = this.ensureRenderingFrame();
                0 !== e.size.width && 0 !== e.size.height && (this._annotationsController.rtl = t.locale.rtl, this._setRenderingFrameValue(e))
            },
            _elementWasTapped: function(t) {
                for (; null !== t; t = t.parentNode)
                    if (function(t) { return "a" === t.localName || "button" === t.localName || "input" === t.localName && "button" === t.type }(t)) return void t.click()
            },
            _devicePixelRatioDidChange: function(t) { this.controlsLayer.devicePixelRatioDidChange(t), this._annotationsController.devicePixelRatioDidChange(), this._mapNode.devicePixelRatioDidChange() || this._mapNodeController.handleRecreate() },
            _mapRectAccountingForPadding: function() {
                var t = this.renderingMapRect;
                if (this._adjustedPadding.equals(p.Zero)) return t.copy();
                var e = this.ensureVisibleFrame(),
                    i = this.ensureRenderingFrame();
                return new W(t.minX() + this._adjustedPadding.left / i.size.width * t.size.width, t.minY() + this._adjustedPadding.top / i.size.height * t.size.height, t.size.width * (e.size.width / i.size.width), t.size.height * (e.size.height / i.size.height))
            },
            _setupListeners: function() { u.state === u.States.READY && this._configurationDidBecomeAvailable(!0), u.addEventListener(u.Events.Changed, this), _.activeLocale && this._handleLocaleChange({ locale: _.activeLocale }), _.addEventListener(_.Events.LocaleChanged, this), A.addEventListener("device-pixel-ratio-change", this), "function" == typeof window.matchMedia && (this._boundPrintListener = this._printMediaQueryChanged.bind(this), this._mediaQuery = window.matchMedia("print"), this._mediaQuery.addListener(this._boundPrintListener)) },
            _removePrintListener: function() { "function" == typeof window.matchMedia && (this._mediaQuery.removeListener(this._boundPrintListener), this._boundPrintListener = null, this._mediaQuery = null) },
            _printMediaQueryChanged: function(t) {
                var e = this._mapNode;
                t.matches ? (this.rootNode.element.style.background = this.rootNode.element.parentNode.getAttribute("data-map-printing-background"), e.fullyRendered ? this._ensureMapCenterDuringPrint(!0) : (e.opacity = 0, this._annotationsController.addWaitingAnnotations()), this._mapNodeController.handlePrintMatch(), M.flush()) : (this._mapNodeController.handlePrintUnmatch(), e.opacity = 1, this.rootNode.element.style.background = "", this._ensureMapCenterDuringPrint(!1))
            },
            _ensureMapCenterDuringPrint: function(t) {
                var e = [this._scene.element];
                this._mapNode.customCanvas && e.push(this._mapNode.customCanvas), e.forEach(function(e) {
                    if (t) {
                        var i = this._scene.size;
                        e.style.left = "50%", e.style.marginLeft = "-" + i.width / 2 + "px", e.style.top = "50%", e.style.marginTop = "-" + i.height / 2 + "px"
                    }
                    else e.style.left = "", e.style.marginLeft = "", e.style.top = "", e.style.marginTop = ""
                }, this)
            },
            _mapStabilizationTimeout: null,
            _startStabilizationTimeoutIfNeeded: function() { this._mapNode && this._mapNode.fullyRendered && !this.cameraIsPanning && !this.cameraIsZooming && this._mapNode.cssBackgroundProperty && (this._stopStabilizationTimeout(), this._mapStabilizationTimeout = window.setTimeout(this._updatePrintingBackground.bind(this), 500)) },
            _stopStabilizationTimeout: function() { this._mapStabilizationTimeout && (window.clearTimeout(this._mapStabilizationTimeout), this._mapStabilizationTimeout = null) },
            _updatePrintingBackground: function() { this._mapNode && this._mapNode.fullyRendered && this.isRooted() && this.rootNode.element.parentNode.setAttribute("data-map-printing-background", this._mapNode.cssBackgroundProperty) },
            _loadSpileAndSwitchToCSR: function(t, e) {
                if (u.state === u.States.READY)
                    if (this._mapNode) { var i = function() { e && (u._madabaBaseUrl = e, u._customMadabaUrl = !0), u._disableCsr = !1, this._mapNodeController.forceSyrup() }.bind(this); if (t) { if (!this._mapNodeController.hasSpile) { var n = document.head.appendChild(document.createElement("script")); return n.addEventListener("error", function() { n.remove() }), n.addEventListener("load", i), void(n.src = t) } console.warn("Spile is already loaded; will not load again from " + t + ".") } i() }
                else console.warn("Will not force switch to CSR: no map node yet.");
                else console.warn("Will not force switch to CSR: configuration not loaded.")
            }
        }, e.exports = n
    }, { "../../lib/geo": 2, "../../lib/map-node": 7, "../../lib/scene-graph": 47, "./analytics/analytics": 112, "./annotations/annotation": 127, "./annotations/annotations-controller": 129, "./collections/item-collection": 158, "./configuration": 159, "./constants": 161, "./controls/controls-layer": 163, "./controls/zoom-control": 170, "./instruments": 176, "./interaction/linear-zoom-controller": 177, "./interaction/map-user-interaction-controller": 179, "./layer-items-controller": 180, "./localizer": 182, "./map-node-controller": 184, "./overlays/overlay": 194, "./overlays/overlays-controller": 196, "./padding": 209, "./types-internal": 221, "./user-location/user-location-controller": 223, "./utils": 225, "@maps/device-pixel-ratio": 61, "@maps/dom-events": 62, "@maps/geometry/point": 69, "@maps/geometry/rect": 70, "@maps/geometry/size": 71, "@maps/js-utils": 84, "@maps/render-tree": 102, "@maps/scheduler": 106 }],
    184: [function(t, e, i) {
        function n(t, e) {
            this._state = null, this._map = t, this._previousNode = null, this.node = null, this._initialOptions = e, this._cachedWebGLCheck = null, this.hasSpile = null, this._previousCanRunCSR = !1;
            this._updateState("sg_grid")
        }

        function o(t) { return btoa(t) }

        function s(t) {
            if (h.supportsLocalStorage) try { return window.localStorage.getItem(t) }
            catch (t) { return }
        }

        function a(t, e) {
            if (h.supportsLocalStorage) try { window.localStorage.setItem(t, e) }
            catch (t) { return }
        }

        function r(t) {
            if (h.supportsLocalStorage) try { window.localStorage.removeItem(t) }
            catch (t) { return }
        }
        var l = t("./configuration"),
            h = t("@maps/js-utils"),
            c = t("../../lib/map-node").SceneGraphMapNode,
            u = t("../../lib/map-node").SyrupMapNode,
            d = t("./debug"),
            p = t("@maps/fast-webgl-check"),
            m = t("@maps/loaders").XHRLoader,
            g = t("@maps/loaders").Priority,
            _ = t("./constants").FeatureVisibility,
            f = { MissingMadaba: 1, SpileFailed: 3, SpileAdvancedRunning: 4, SyrupInitFailure: 5 },
            y = "mapkit.SpileTestResults",
            v = .2,
            w = { sg_grid: { "global-configuration": "sg_ready", upgrade: "syrup_insert" }, sg_insert: { "global-configuration": "sg_ready", upgrade: "syrup_insert", recreate: "sg_insert" }, syrup_insert: { "global-configuration": "syrup_need_spile", fallback: "sg_insert", recreate: "syrup_insert" }, syrup_need_spile: { "spile-load": "syrup_init", fallback: "sg_insert", recreate: "syrup_insert" }, syrup_init: { "global-configuration": "syrup_network_stalled", fallback: "sg_insert", recreate: "syrup_insert", "syrup-complete": "syrup_ready" }, syrup_network_stalled: { "global-configuration": "syrup_network_stalled", fallback: "sg_insert", recreate: "syrup_insert", "syrup-complete": "syrup_ready" }, sg_ready: { "global-configuration": "sg_ready", upgrade: "syrup_insert", recreate: "sg_insert", "map-configuration": "sg_ready" }, syrup_ready: { "global-configuration": "syrup_ready", fallback: "sg_insert", recreate: "syrup_insert", "map-configuration": "syrup_ready", "print-match": "syrup_printing" }, syrup_printing: { "print-unmatch": "syrup_ready" } };
        n.prototype = {
            constructor: n,
            defaultSpileURL: "//cdn.apple-mapkit.com/mk/csr/1.x.x/mk-csr.js",
            get usingSSR() { return "sg_insert" === this._state || "sg_ready" === this._state },
            get usingAdvancedAPIs() { return !0 },
            get manageableMap() {
                var t = this._map.ensureRenderingFrame(),
                    e = this._gpuInfo.MAX_RENDERBUFFER_SIZE * v;
                return t.size.width <= e && t.size.height <= e
            },
            get csrCapable() { return this._webglCheckResult.shouldTryCSR && !this.knownBadRendering },
            get shouldDynamicallyLoadSyrup() { return this._webglCheckResult.shouldTryCSR },
            get knownGoodRendering() { return !!this._cachedSpileResult && !!this._cachedSpileResult.pass },
            get knownBadRendering() { return !!this._cachedSpileResult && !this._cachedSpileResult.pass },
            get _webglCheckResult() {
                if (null === this._cachedWebGLCheck) {
                    var t = this._map.ensureRenderingFrame().size;
                    this._cachedWebGLCheck = p(t.width, t.height)
                }
                return this._cachedWebGLCheck
            },
            get _gpuInfo() { return this._webglCheckResult && this._webglCheckResult.webGL ? this._webglCheckResult.webGL.gpuInfo : { MAX_RENDERBUFFER_SIZE: 0, VERSION: "unknown" } },
            get gpuKey() { return o(this._gpuInfo.VERSION) },
            get _cachedSpileResult() { var t = s(y); if (t) { var e = JSON.parse(t); if (e) return e[this.gpuKey] } },
            get renderingMode() { var t = "CLIENT"; return this.usingSSR ? t = "SERVER" : this._startedInLoCSR && (t = "HYBRID"), t },
            configurationDidBecomeAvailable: function(t) {
                var e = this._previousCanRunCSR,
                    i = l.canRunCSR;
                this._previousCanRunCSR = i, !e || i || this.usingSSR ? !e && i ? this.handleUpgrade() : t || this.handleGlobalConfigurationChange() : this.handleFallback()
            },
            forceSyrup: function() { this.hasSpile = null, this._transition("upgrade") },
            updateSize: function(t) { this.node.size = t, this._previousNode && (this._previousNode.size = t) },
            destroy: function() { this.node.destroy(), this.node.delegate = null, this.node = null, this._previousNode && (this._previousNode.destroy(), this._previousNode = null) },
            handleGlobalConfigurationChange: function() { this._transition("global-configuration") },
            handleSpileLoad: function() { this._transition("spile-load") },
            handleFallback: function(t) { t ? this._logFallback("TEST_FAILURE") : l.didFallback ? this._logFallback("BOOTSTRAP_FALLBACK") : this._logFallback("SYRUP_FALLBACK"), this._transition("fallback") },
            handleUpgrade: function() { this._transition("upgrade") },
            handleRecreate: function() { this._transition("recreate") },
            handleMapConfigurationChange: function() { this._transition("map-configuration") },
            handleSyrupComplete: function() { this._transition("syrup-complete") },
            handlePrintMatch: function() { this._transition("print-match") },
            handlePrintUnmatch: function() { this._transition("print-unmatch") },
            _transition: function(t) {
                var e = w[this._state][t];
                e && this._updateState(e)
            },
            _updateState: function(t) { this._state = t; var e = this["_enter_" + t]; "function" == typeof e && e.call(this) },
            _loadSpileIfNeeded: function(t) {
                var e = null,
                    i = function() { e && (e.removeEventListener("error", i), e.removeEventListener("load", i), e = null), this.hasSpile = !!window.Spile && !!window.Spile.Syrup, t.call(this, this.hasSpile) }.bind(this);
                null != this.hasSpile ? t.call(this, this.hasSpile) : "function" == typeof window.Spile ? i() : ((e = document.head.appendChild(document.createElement("script"))).addEventListener("error", i), e.addEventListener("load", i), e.src = window.location.protocol + this.defaultSpileURL)
            },
            _insertSceneGraphNode: function() {
                this.usingSSR && (this.node.isRotationEnabled = !1);
                var t = new c;
                this._insertNewMapNode(t), this._map.didFinishMapNodeInitialization(t)
            },
            _enter_sg_grid: function() { this._insertSceneGraphNode(), l.ready && !l.canRunCSR && this._updateState("sg_ready") },
            _enter_sg_insert: function() { this._insertSceneGraphNode(), l.ready && this._updateState("sg_ready") },
            _enter_syrup_insert: function() { this._insertNewMapNode(new u), l.state === l.States.READY && this._updateState("syrup_need_spile") },
            _insertNewMapNode: function(t) {
                var e = this._initialOptions || {};
                this.node ? (this._removePreviousMapNode(), this._previousNode = this.node, this._previousNode.deactivate(), this.node.migrateStateTo(t)) : (t.pannable = !("isScrollEnabled" in e) || !!e.isScrollEnabled, t.zoomable = !("isZoomEnabled" in e) || !!e.isZoomEnabled, t.showsPointsOfInterest = !("showsPointsOfInterest" in e) || !!e.showsPointsOfInterest, t.showsDefaultTiles = !("_showsDefaultTiles" in e) || !!e._showsDefaultTiles), this.node = t, this._map.didInsertNewMapNode(t), this._initialOptions ? delete this._initialOptions : this.node._impl._cameraDidChange(this.node, !1)
            },
            _removePreviousMapNode: function() { this._previousNode && (this._previousNode.destroy(!0), this._previousNode.remove(), this._previousNode = null) },
            _enter_syrup_need_spile: function() {
                if (this.shouldDynamicallyLoadSyrup) return this.knownBadRendering ? (this.handleFallback(), void this._loadSpileIfNeeded(function(t) { t && (this.isSpileResultValid(this._cachedSpileResult) || (this.invalidateSpileCache(), this.spileRun())) })) : void this._loadSpileIfNeeded(function(t) { t ? this.handleSpileLoad() : this.handleFallback() });
                this.handleFallback()
            },
            _enter_syrup_init: function() {
                if (!l.madabaDomains || !l.madabaDomains.length) return this._csrWarning(f.MissingMadaba), void this.handleFallback();
                this._cachedSpileResult && !this.isSpileResultValid(this._cachedSpileResult) && this.invalidateSpileCache();
                var t = Spile.getRendererWithoutAnyWarranty();
                if (this._startedInLoCSR = !(this.knownGoodRendering && this.manageableMap && !l.previewLoCSR), this.manageableMap || this.usingAdvancedAPIs || l.previewLoCSR) {
                    var e = this.node;
                    this._reConfigureMapNode(), e.init(l, t, Spile.Syrup.Camera, this._startedInLoCSR, function(t) { t ? (this._csrWarning(f.SyrupInitFailure), this.handleFallback()) : (this._reConfigureMapNode(), e.needsDisplay = !0, this._map.didFinishMapNodeInitialization(e), this.handleSyrupComplete()) }.bind(this))
                }
                else this.handleFallback()
            },
            _csrWarning: function(t) { console.warn("[MapKit] CSR is unavailable:", t) },
            _enter_syrup_network_stalled: function() { this.node.updateNetworkConfiguration(l) },
            _enter_sg_ready: function() { this._removePreviousMapNode(), this._reConfigureMapNode(), this.node.isRotationEnabled = !1, this._map.mapNodeReady(!1) },
            _enter_syrup_ready: function() { this._removePreviousMapNode(), this._reConfigureMapNode(), this.node.updateNetworkConfiguration(l), this._map.mapNodeReady(!0), this._cachedSpileResult || this.spileRun() },
            _reConfigureMapNode: function() { this.node.language = l.language, this.node.configuration = l.types[this._map.mapType], this.node._impl.debug || (this.node._impl.debug = !!d.options.showsTileInfo), this._map.didReconfigureMapNode(this.node) },
            _enter_syrup_printing: function() { this.node.forceRerender(), this.node.needsDisplay = !0 },
            _logFallback: function(t) { h.doNotTrack() || (this._fallbackReason = t, new m("https://gsp10-ssl.ls.apple.com/hvr/mw/v1/spile", this, { method: "POST", priority: g.Low }).schedule()) },
            _usingCSRAPI: function() { return !(this._map._showsCompass !== _.Visible && (this._map._showsCompass !== _.Adaptive || this._map._usingDefaultShowsCompassValue) && 0 === this._map.rotation && !this._map._annotationsController.containsMarkerAnnotation()) },
            getDataToSend: function(t) { return t.setRequestHeader("Content-Type", "text/plain"), t.responseType = "text", JSON.stringify({ ssrFallback: { reason: this._fallbackReason, usingCSRAPI: this._usingCSRAPI() } }) },
            spileRun: function() { Spile && Spile.testRendering && Spile.testRendering(this.cacheSpileResult.bind(this)) },
            cacheSpileResult: function(t) {
                if (t.status !== Spile.Status.MAYBE && t["gpu-identifier"]) {
                    var e = o(t["gpu-identifier"].VERSION),
                        i = t.status === Spile.Status.YES,
                        n = JSON.parse(s(y)) || {};
                    n[e] = { pass: i, version: Spile.version }, a(y, JSON.stringify(n)), i || this.usingSSR || this.handleFallback(!0)
                }
            },
            isSpileResultValid: function(t) { if (Spile && Spile.version) return t.version === Spile.version },
            invalidateSpileCache: function() { r(y) }
        }, e.exports = n
    }, { "../../lib/map-node": 7, "./configuration": 159, "./constants": 161, "./debug": 173, "@maps/fast-webgl-check": 63, "@maps/js-utils": 84, "@maps/loaders": 85 }],
    185: [function(t, e, i) {
        function n(t, e) { Object.defineProperty(this, "_impl", { value: new o(this, t, e) }) }
        var o = t("./map-internal");
        n.MapTypes = o.MapTypes, n.prototype = { constructor: n, get padding() { return this._impl.padding }, set padding(t) { this._impl.padding = t }, get isScrollEnabled() { return this._impl.isScrollEnabled }, set isScrollEnabled(t) { this._impl.isScrollEnabled = t }, get isZoomEnabled() { return this._impl.isZoomEnabled }, set isZoomEnabled(t) { this._impl.isZoomEnabled = t }, get showsZoomControl() { return this._impl.showsZoomControl }, set showsZoomControl(t) { this._impl.showsZoomControl = t }, get showsScale() { return this._impl.showsScale }, set showsScale(t) { this._impl.showsScale = t }, get mapType() { return this._impl.mapType }, set mapType(t) { this._impl.mapType = t }, get _showsTileInfo() { return this._impl._showsTileInfo }, set _showsTileInfo(t) { this._impl._showsTileInfo = t }, get _showsDefaultTiles() { return this._impl._showsDefaultTiles }, set _showsDefaultTiles(t) { this._impl._showsDefaultTiles = t }, get tileOverlays() { return this._impl.tileOverlays }, set tileOverlays(t) { this._impl.tileOverlays = t }, addTileOverlay: function(t) { return this._impl.addTileOverlay(t) }, addTileOverlays: function(t) { return this._impl.addTileOverlays(t) }, removeTileOverlay: function(t) { return this._impl.removeTileOverlay(t) }, removeTileOverlays: function(t) { return this._impl.removeTileOverlays(t) }, get showsMapTypeControl() { return this._impl.showsMapTypeControl }, set showsMapTypeControl(t) { this._impl.showsMapTypeControl = t }, get showsUserLocationControl() { return this._impl.showsUserLocationControl }, set showsUserLocationControl(t) { this._impl.showsUserLocationControl = t }, get showsPointsOfInterest() { return this._impl.showsPointsOfInterest }, set showsPointsOfInterest(t) { this._impl.showsPointsOfInterest = t }, get element() { return this._impl.element }, set element(t) { this._impl.element = t }, get visibleMapRect() { return this._impl.visibleMapRect }, set visibleMapRect(t) { this._impl.visibleMapRect = t }, setVisibleMapRectAnimated: function(t, e) { return this._impl.setVisibleMapRectAnimated(t, e) }, get region() { return this._impl.region }, set region(t) { this._impl.region = t }, setRegionAnimated: function(t, e) { return this._impl.setRegionAnimated(t, e) }, get isRotationAvailable() { return this._impl.isRotationAvailable }, set isRotationAvailable(t) { this._impl.isRotationAvailable = t }, get isRotationEnabled() { return this._impl.isRotationEnabled }, set isRotationEnabled(t) { this._impl.isRotationEnabled = t }, get rotation() { return this._impl.rotation }, set rotation(t) { this._impl.rotation = t }, get showsCompass() { return this._impl.showsCompass }, set showsCompass(t) { this._impl.showsCompass = t }, setRotationAnimated: function(t, e) { return this._impl.setRotationAnimated(t, e) }, get center() { return this._impl.center }, set center(t) { this._impl.center = t }, setCenterAnimated: function(t, e) { return this._impl.setCenterAnimated(t, e) }, get overlays() { return this._impl.overlays }, set overlays(t) { this._impl.overlays = t }, get selectedOverlay() { return this._impl.selectedOverlay }, set selectedOverlay(t) { this._impl.selectedOverlay = t }, addOverlay: function(t) { return this._impl.addOverlay(t) }, addOverlays: function(t) { return this._impl.addOverlays(t) }, removeOverlay: function(t) { return this._impl.removeOverlay(t) }, removeOverlays: function(t) { return this._impl.removeOverlays(t) }, topOverlayAtPoint: function(t) { return this._impl.topOverlayAtPoint(t) }, overlaysAtPoint: function(t) { return this._impl.overlaysAtPoint(t) }, get annotations() { return this._impl.annotations }, set annotations(t) { this._impl.annotations = t }, get selectedAnnotation() { return this._impl.selectedAnnotation }, set selectedAnnotation(t) { this._impl.selectedAnnotation = t }, addAnnotation: function(t) { return this._impl.addAnnotation(t) }, addAnnotations: function(t) { return this._impl.addAnnotations(t) }, removeAnnotation: function(t) { return this._impl.removeAnnotation(t) }, removeAnnotations: function(t) { return this._impl.removeAnnotations(t) }, showItems: function(t, e) { return this._impl.showItems(t, e) }, addItems: function(t) { return this._impl.addItems(t) }, removeItems: function(t) { return this._impl.removeItems(t) }, annotationsInMapRect: function(t) { return this._impl.annotationsInMapRect(t) }, updateSize: function(t) { return this._impl.updateSize(t) }, convertCoordinateToPointOnPage: function(t) { return this._impl.convertCoordinateToPointOnPage(t) }, convertPointOnPageToCoordinate: function(t) { return this._impl.convertPointOnPageToCoordinate(t) }, get showsUserLocation() { return this._impl.showsUserLocation }, set showsUserLocation(t) { this._impl.showsUserLocation = t }, get userLocationAnnotation() { return this._impl.userLocationAnnotation }, get tracksUserLocation() { return this._impl.tracksUserLocation }, set tracksUserLocation(t) { this._impl.tracksUserLocation = t }, get tintColor() { return this._impl.tintColor }, set tintColor(t) { this._impl.tintColor = t }, get performanceLog() { return this._impl._performanceLog }, destroy: function() { this._impl.destroy() }, get annotationForCluster() { return this._impl.annotationForCluster }, set annotationForCluster(t) { this._impl.annotationForCluster = t } }, e.exports = n
    }, { "./map-internal": 183 }],
    186: [function(t, e, i) {
        function n(t) { s.call(this, t.coordinate, o(t), { style: l }) }

        function o(t) { return !t.stale && t.location.accuracy > 0 && t.location.accuracy < h ? t.location.accuracy : 0 }
        var s = t("./circle-overlay"),
            a = t("./style"),
            r = t("@maps/js-utils"),
            l = new a({ strokeColor: null }),
            h = 3e4;
        n.prototype = r.inheritPrototype(s, n, { updateForUserLocation: function(t) { this.coordinate = t.coordinate, this.radius = o(t) } }), e.exports = n
    }, { "./circle-overlay": 190, "./style": 204, "@maps/js-utils": 84 }],
    187: [function(t, e, i) {
        function n(t, e, i, n) { s.call(this, new a(this), t, n), this.coordinate = e, this.radius = i }

        function o() { return [this._coordinate.toMapPoint()] }
        var s = t("./styled-overlay-internal"),
            a = t("./circle-overlay-node"),
            r = t("../../../lib/geo"),
            l = r.Coordinate,
            h = r.MapRect,
            c = t("@maps/js-utils");
        n.prototype = c.inheritPrototype(s, n, {
            get coordinate() { return this._coordinate },
            set coordinate(t) { c.checkInstance(t, l, "[MapKit] CircleOverlayInternal.coordinate expected a Coordinate value, but got `" + t + "` instead."), this._coordinate && this._coordinate.latitude === t.latitude && this._coordinate.longitude === t.longitude || (this._coordinate = t.copy(), this.updateGeometry()) },
            get radius() { return this._radius },
            set radius(t) {
                var e = "[MapKit] CircleOverlayInternal.radius expected a non-negative number (radius in meters), but got `" + t + "` instead.";
                c.checkType(t, "number", e), t < 0 && console.warn(e);
                var i = Math.max(0, t);
                this._radius !== i && (this._radius = i, this.updateGeometry())
            },
            calculateBoundingRect: function() {
                if (!this._coordinate || isNaN(this._radius)) return null;
                var t = this._center = this._coordinate.toMapPoint(),
                    e = this._mapRadius = this._radius * r.mapUnitsPerMeterAtLatitude(this._coordinate.latitude);
                return new h(t.x - e, t.y - e, 2 * e, 2 * e)
            },
            simplifyShapeAtLevel: o,
            clip: o
        }), e.exports = n
    }, { "../../../lib/geo": 2, "./circle-overlay-node": 188, "./styled-overlay-internal": 205, "@maps/js-utils": 84 }],
    188: [function(t, e, i) {
        function n(t) { o.call(this, t, !0, new s(this)) }
        var o = t("./styled-overlay-node.js"),
            s = t("./circle-overlay-renderer.js"),
            a = t("@maps/js-utils");
        n.prototype = a.inheritPrototype(o, n, { stringInfo: function() { var t = this.overlay; return "CircleOverlayNode<radius:" + t.radius + "," + t.coordinate.toString().toLowerCase() + ">" + (t.style.toString() ? "[" + t.style + "]" : "") } }), e.exports = n
    }, { "./circle-overlay-renderer.js": 189, "./styled-overlay-node.js": 206, "@maps/js-utils": 84 }],
    189: [function(t, e, i) {
        function n(t) { r.call(this, t) }

        function o(t, e, i, n, o, s, r) {
            t.beginPath();
            var l = e.transformMapPoint(new a(i.x + n, i.y));
            s && (s += e.rotation), r && (r -= e.rotation), t.arc(l.x, l.y, o, s || 0, r || h, !0)
        }
        var s = t("../../../lib/geo").MapPoint,
            a = t("@maps/geometry/point"),
            r = t("./styled-overlay-renderer"),
            l = t("@maps/js-utils"),
            h = 2 * Math.PI;
        n.prototype = l.inheritPrototype(r, n, {
            drawShapes: function(t, e, i, n, s, a) {
                var r = this._node.shapes[0],
                    l = r[0],
                    h = this._node.overlay._mapRadius,
                    c = h * a.worldSize;
                c < .5 || this.drawClipped(t, e, i, n, s, a, l, h, r.xOffset) || (o(t, a, l, r.xOffset, c), i && this._node.overlay.fillPath(t, e), n && this._node.overlay.strokePath(t, e, 1))
            },
            drawClipped: function(t, e, i, n, r, l, c, u, d) {
                function p(t, e) {
                    var i = w - t,
                        n = b - e;
                    return i * i + n * n <= u * u
                }
                if (!n || u < r.size.width || u < r.size.height) return !1;
                var m, g = e._impl.halfStrokeWidthAtResolution() / l.worldSize,
                    _ = r.minX() - g - d,
                    f = r.maxX() + g - d,
                    y = r.minY() - g,
                    v = r.maxY() + g,
                    w = c.x,
                    b = c.y,
                    C = [];
                p(f, v) && C.push(new s(f, v));
                var S = Math.acos((f - w) / u);
                if (!isNaN(S)) {
                    var L = b + u * Math.sin(S);
                    L >= y && L <= v && ((m = new s(f, L)).angle = S, C.push(m)), (L = b - u * Math.sin(S)) >= y && L <= v && ((m = new s(f, L)).angle = h - S, C.push(m))
                }
                p(f, y) && C.push(new s(f, y));
                var T = Math.asin((y - b) / u);
                if (!isNaN(T)) {
                    var E = w + u * Math.cos(T);
                    E >= _ && E <= f && ((m = new s(E, y)).angle = (T + h) % h, C.push(m)), (E = w - u * Math.cos(T)) >= _ && E <= f && ((m = new s(E, y)).angle = Math.PI - T, C.push(m))
                }
                p(_, y) && C.push(new s(_, y));
                var x = Math.acos((_ - w) / u);
                if (!isNaN(x)) {
                    var M = b - u * Math.sin(x);
                    M >= y && M <= v && ((m = new s(_, M)).angle = h - x, C.push(m)), (M = b + u * Math.sin(x)) >= y && M <= v && ((m = new s(_, M)).angle = x, C.push(m))
                }
                p(_, v) && C.push(new s(_, v));
                var A = Math.asin((v - b) / u);
                if (!isNaN(A)) {
                    var k = w - u * Math.cos(A);
                    k >= _ && k <= f && ((m = new s(k, v)).angle = Math.PI - A, C.push(m)), (k = w + u * Math.cos(A)) >= _ && k <= f && ((m = new s(k, v)).angle = (A + h) % h, C.push(m))
                }
                for (var O = C.length, I = 1; O > 2 && I < O && (!isNaN(C[I - 1].angle) || isNaN(C[I].angle) || isNaN(C[(I + 1) % O].angle)); ++I);
                if (I < O) {
                    for (var R = (I + 1) % O; O > 2 && !isNaN(C[R].angle) && !isNaN(C[(R + 1) % O].angle); R = (R + 1) % O);
                    var P = u * l.worldSize,
                        D = Math.abs(C[I].angle - C[R].angle),
                        z = P * D - 2 * P * Math.sin(D / 2) > .001,
                        N = l.transformMapPoint(new a(C[I].x + d, C[I].y)),
                        F = l.transformMapPoint(new a(C[R].x + d, C[R].y));
                    if (i) {
                        z ? o(t, l, c, d, P, C[I].angle, C[R].angle) : (t.beginPath(), t.moveTo(N.x, N.y), t.lineTo(F.x, F.y));
                        for (var j = (R + 1) % O; isNaN(C[j].angle); j = (j + 1) % O) {
                            var U = l.transformMapPoint(new a(C[j].x + d, C[j].y));
                            t.lineTo(U.x, U.y)
                        }
                        this._node.overlay.fillPath(t, e)
                    }
                    n && (z ? o(t, l, c, d, P, C[I].angle, C[R].angle) : (t.beginPath(), t.moveTo(N.x, N.y), t.lineTo(F.x, F.y)), this._node.overlay.strokePath(t, e))
                }
                else O > 0 && i && (t.fillStyle = e.fillColor, t.globalAlpha = e.fillOpacity, t.fillRect(0, 0, r.size.width * l.worldSize, r.size.height * l.worldSize));
                return !0
            }
        }), e.exports = n
    }, { "../../../lib/geo": 2, "./styled-overlay-renderer": 207, "@maps/geometry/point": 69, "@maps/js-utils": 84 }],
    190: [function(t, e, i) {
        function n(t, e, i) { Object.defineProperty(this, "_impl", { value: new s(this, t, e, i) }) }
        var o = t("./styled-overlay"),
            s = t("./circle-overlay-internal"),
            a = t("@maps/js-utils");
        n.prototype = a.inheritPrototype(o, n, { get coordinate() { return this._impl.coordinate }, set coordinate(t) { this._impl.coordinate = t }, get radius() { return this._impl.radius }, set radius(t) { this._impl.radius = t } }), e.exports = n
    }, { "./circle-overlay-internal": 187, "./styled-overlay": 208, "@maps/js-utils": 84 }],
    191: [function(t, e, i) {
        function n() { this._overlays = [] }
        var o = t("@maps/js-utils"),
            s = t("@maps/scheduler");
        n.prototype = {
            constructor: n,
            fadeOverlayTo: function(t, e) { t.hasOwnProperty("fadeInOutOpacity") ? t.fadeInOutOpacity.durationMs = 350 * Math.abs(t.fadeInOutOpacity.value - t.fadeInOutOpacity.end) : (t.fadeInOutOpacity = { durationMs: 350 }, t.setFadeInOutOpacity(1 - e), this._overlays.push(t)), t.fadeInOutOpacity.start = t.fadeInOutOpacity.value, t.fadeInOutOpacity.end = e, t.fadeInOutOpacity.startTime = Date.now(), s.scheduleASAP(this) },
            performScheduledUpdate: function() {
                var t = Date.now();
                this._overlays = this._overlays.filter(function(e) { return e.setFadeInOutOpacity(o.clamp(e.fadeInOutOpacity.start + (e.fadeInOutOpacity.end - e.fadeInOutOpacity.start) * ((t - e.fadeInOutOpacity.startTime) / e.fadeInOutOpacity.durationMs), 0, 1)), e.fadeInOutOpacity.value !== e.fadeInOutOpacity.end || (delete e.fadeInOutOpacity, !1) }), this._overlays.length > 0 && s.scheduleOnNextFrame(this)
            }
        }, e.exports = n
    }, { "@maps/js-utils": 84, "@maps/scheduler": 106 }],
    192: [function(t, e, i) {
        function n(t, e, i) { s.EventTarget(e), this._node = t, this._public = e, i = o.checkOptions(i), r.forEach(function(t) { t in i && (this[t] = i[t]) }, this), Object.keys(i).forEach(function(t) { r.indexOf(t) < 0 && console.warn("[MapKit] Unknown option: " + t + ". Use the data property to store custom data.") }) }
        var o = t("@maps/js-utils"),
            s = t("@maps/dom-events"),
            a = t("../../../lib/geo").MapRect,
            r = ["visible", "enabled", "selected", "data"];
        n.prototype = {
            constructor: n,
            delegate: null,
            _map: null,
            _visible: !0,
            _enabled: !0,
            _selected: !1,
            get map() { return this._map },
            set map(t) { console.warn("[MapKit] The `map` property of an overlay is read-only. Use map.addOverlay() instead.") },
            get data() { return this.hasOwnProperty("_data") || (this._data = {}), this._data },
            set data(t) { this._data = t },
            get visible() { return this._visible },
            set visible(t) {
                var e = !!t;
                this._visible !== e && (this._visible = e, this.updatedProperty("visible"))
            },
            get enabled() { return this._enabled },
            set enabled(t) { this._enabled = !!t },
            get selected() { return this._selected },
            set selected(t) {
                var e = !!t;
                e !== this._selected && (this._selected = e, this.updatedProperty("selected"))
            },
            get node() { return this._node },
            canBePicked: function() { return this.shown && this._visible },
            setMap: function(t) { t ? this._map = t : this._map && delete this._map },
            handleEvent: function() {},
            updatedProperty: function(t) { this.delegate && this.delegate.overlayPropertyDidChange(this._public, t) },
            visibleAfterClipping: function(t, e, i, n, o) {
                this._node.shapes = [];
                var s = this.visibilityToleranceAtScale(i),
                    r = this._boundingRect || this.boundingRectAtScale(i);
                if (!this.visible || r.maxY() + s < t.minY() || r.minY() - s > t.maxY()) return !1;
                for (var l = r.minX() - s, h = r.maxX() + s, c = -1; c <= 1; ++c) {
                    var u = 0 === c ? t : new a(t.origin.x - c, t.origin.y, t.size.width, t.size.height);
                    if (h >= u.minX() && l <= u.maxX()) {
                        var d = this.clipOverlay(u, e, i, n, o);
                        d.length > 0 && (d.xOffset = c, this._node.shapes.push(d))
                    }
                }
                return this._node.shapes.length > 0
            },
            visibilityToleranceAtScale: function() { return 0 }
        }, e.exports = n
    }, { "../../../lib/geo": 2, "@maps/dom-events": 62, "@maps/js-utils": 84 }],
    193: [function(t, e, i) {
        function n(t) { o.BaseNode.call(this), this.overlay = t }
        var o = t("../../../lib/scene-graph"),
            s = t("@maps/js-utils");
        n.prototype = s.inheritPrototype(o.BaseNode, n, {}), e.exports = n
    }, { "../../../lib/scene-graph": 47, "@maps/js-utils": 84 }],
    194: [function(t, e, i) {
        function n(t) { Object.defineProperty(this, "_impl", { value: new o(null, this, t) }) }
        var o = t("./overlay-internal");
        n.Events = { Select: "select", Deselect: "deselect" }, n.prototype = { constructor: n, get map() { return this._impl.map }, set map(t) { this._impl.map = t }, get data() { return this._impl.data }, set data(t) { this._impl.data = t }, get visible() { return this._impl.visible }, set visible(t) { this._impl.visible = t }, get enabled() { return this._impl.enabled }, set enabled(t) { this._impl.enabled = t }, get selected() { return this._impl.selected }, set selected(t) { this._impl.selected = t } }, e.exports = n
    }, { "./overlay-internal": 192 }],
    195: [function(t, e, i) {
        function n(t) { o.GroupNode.call(this), this._controller = t }
        var o = t("../../../lib/scene-graph"),
            s = t("@maps/js-utils");
        n.prototype = s.inheritPrototype(o.GroupNode, n, { stringInfo: function() { return "OverlaysControllerNode" } }), e.exports = n
    }, { "../../../lib/scene-graph": 47, "@maps/js-utils": 84 }],
    196: [function(t, e, i) {
        function n(t) { o.call(this, t), this._node = new s(this), this._fadeAnimationController = new r }
        var o = t("../layer-items-controller"),
            s = t("./overlays-controller-node"),
            a = t("./overlay"),
            r = t("./fade-animation-controller"),
            l = t("./accuracy-ring-overlay"),
            h = t("../utils"),
            c = t("@maps/js-utils"),
            u = t("../../../lib/geo").MapRect,
            d = t("@maps/geometry/point"),
            p = t("@maps/scheduler"),
            m = t("../constants");
        n.prototype = c.inheritPrototype(o, n, {
            itemConstructor: a,
            itemName: "overlay",
            capitalizedItemName: "Overlay",
            get map() { return this._map },
            get node() { return this._node },
            isItemExposed: function(t) { return t !== this._userLocationAccuracyRingOverlay },
            removeUserLocationAccuracyRingOverlay: function() { this._userLocationAccuracyRingOverlay && (this.removeItem(this._userLocationAccuracyRingOverlay), delete this._userLocationAccuracyRingOverlay) },
            removedReferenceToMap: function() { this._items.forEach(function(t) { t._impl.setMap(null) }) },
            mapTypeWasSet: function(t) { this._userLocationAccuracyRingOverlay && (this._userLocationAccuracyRingOverlay.style.fillOpacity = t ? .4 : .1) },
            mapCameraDidChange: function() { p.scheduleASAP(this), this._deletePreviousPointForPickingItem() },
            overlayPropertyDidChange: function(t, e) {
                switch (e) {
                    case "selected":
                        t.selected ? this.selectedItem = t : this.selectedItem = null, this._map.overlaySelectionDidChange(t), p.scheduleASAP(this);
                        break;
                    case "style":
                    case "visible":
                    case "geometry":
                        p.scheduleASAP(this)
                }
            },
            fadeOverlayTo: function(t, e) { this._fadeAnimationController.fadeOverlayTo(t, e) },
            updateUserLocationAccuracyRingOverlay: function(t) { if (t.coordinate) return this._userLocationAccuracyRingOverlay ? void this._userLocationAccuracyRingOverlay.updateForUserLocation(t) : (this._userLocationAccuracyRingOverlay = this.addItem(new l(t)), void this.mapTypeWasSet(this._map.mapType !== m.MapTypes.Standard)) },
            addedItem: function(t, e) { o.prototype.addedItem.call(this, t, e), t._impl.setMap(this._map.public), t.selected && (this.selectedItem = t), p.scheduleASAP(this) },
            removedItem: function(t) { t._impl.setMap(null), o.prototype.removedItem.call(this, t), p.scheduleASAP(this) },
            pickableItemsCloseToPoint: function(t, e, i) {
                var n = document.createElement("canvas"),
                    o = n.getContext("2d");
                n.width = this._selectionDistance, n.height = this._selectionDistance;
                var s = this._map.camera.copy();
                e = s.transformGestureCenter(e);
                var a = s.toMapRect(),
                    r = s.worldSize,
                    l = this._selectionDistance / 2,
                    c = e.x - l,
                    p = e.y - l,
                    m = new d(-a.origin.x * r - c, -a.origin.y * r - p),
                    g = "number" == typeof i ? i : this._selectionDistance / h.devicePixelRatio,
                    _ = new u(-m.x / r, -m.y / r, n.width / r, n.height / r);
                s.rotation = 0;
                var f = !1;
                return t.filter(function(t) { return !!t._impl.shown && (f && (o.clearRect(0, 0, n.width, n.height), f = !1), t._impl.node._renderer.render(o, _, s, g), f = !0, !!o.getImageData(l, l, 1, 1).data[3]) }, this).reverse()
            },
            performScheduledUpdate: function() {
                var t = this.map;
                if (t) {
                    for (var e = t.camera.toRenderingMapRect(), i = t.worldSize, n = Math.ceil(c.log2(i)), o = [], s = this._items, a = 0, r = s.length; a < r; ++a) {
                        var l = s[a];
                        l._impl.shown = l._impl.visibleAfterClipping(e, !0, i, n, !0), l._impl.shown && !l.selected && o.push(l._impl.node)
                    }
                    var h = this.selectedItem;
                    h && h._impl.shown && o.push(h._impl.node), this._node.children = o
                }
            }
        }), e.exports = n
    }, { "../../../lib/geo": 2, "../constants": 161, "../layer-items-controller": 180, "../utils": 225, "./accuracy-ring-overlay": 186, "./fade-animation-controller": 191, "./overlay": 194, "./overlays-controller-node": 195, "@maps/geometry/point": 69, "@maps/js-utils": 84, "@maps/scheduler": 106 }],
    197: [function(t, e, i) {
        function n(t, e, i) { h.call(this, new c(this), t, i), this.points = e, this.updateGeometry() }

        function o(t) { var e = t.filter(function(t) { return t.length > 2 }).map(function(t) { var e = t.reduce(function(t, e) { return e.x < t.xMin && (t.xMin = e.x), e.x > t.xMax && (t.xMax = e.x), e.y < t.yMin && (t.yMin = e.y), e.y > t.yMax && (t.yMax = e.y), t }, { xMin: 1 / 0, xMax: -1 / 0, yMin: 1, yMax: 0 }); return new l(e.xMin, e.yMin, e.xMax - e.xMin, e.yMax - e.yMin) }).sort(function(t, e) { return t.minX() - e.minX() }); return p.boundingRectForSortedRects(e) }

        function s(t, e, i) {
            for (var n = e.minX() - i, o = e.minY() - i, s = e.maxX() + i, a = e.maxY() + i, r = [], l = 0, h = t.length; l < h; ++l) {
                for (var c = t[l], u = [], d = 0, p = c.length; d < p; ++d) {
                    var m = c[d];
                    (m.x >= n || c[(d - 1 + p) % p].x >= n || c[(d + 1) % p].x >= n) && u.push(m)
                }
                var g = [];
                for (d = 0, p = u.length; d < p; ++d)((m = u[d]).y >= o || u[(d - 1 + p) % p].y >= o || u[(d + 1) % p].y >= o) && g.push(m);
                var _ = [];
                for (d = 0, p = g.length; d < p; ++d)((m = g[d]).x <= s || g[(d - 1 + p) % p].x <= s || g[(d + 1) % p].x <= s) && _.push(m);
                var f = [];
                for (d = 0, p = _.length; d < p; ++d)((m = _[d]).y <= a || _[(d - 1 + p) % p].y <= a || _[(d + 1) % p].y <= a) && f.push(m);
                f.length > 2 && r.push(f)
            }
            return r
        }
        var a = t("../../../lib/geo"),
            r = a.Coordinate,
            l = a.MapRect,
            h = t("./styled-overlay-internal"),
            c = t("./polygon-overlay-node"),
            u = t("../line-simplification"),
            d = t("@maps/js-utils"),
            p = t("../types-internal");
        n.prototype = d.inheritPrototype(h, n, {
            get points() { return this._points.map(function(t) { return t.slice() }) },
            set points(t) { d.checkArray(t, "[MapKit] PolygonOverlay.points expected an array of Coordinates."), Array.isArray(t[0]) || (t = [t]), this._points = t.map(function(t, e) { return d.checkArray(t, "[MapKit] PolygonOverlay.points expected an array at index: " + e), t.slice() }), this._polygons = this._points.map(function(t, e) { return t.map(function(t, i) { return d.checkInstance(t, r, "[MapKit] PolygonOverlay.points expected a Coordinate at index: " + e + ", " + i), t.toUnwrappedMapPoint() }) }), this.updateGeometry() },
            calculateBoundingRect: function() {
                var t = o(this._polygons);
                return delete this._simplifiedShapeLevel, t.size.width > 1 && console.warn("[MapKit] Polygon overlay spans over 360º in longitude and may not render correctly."), this._polygons.forEach(function(e) {
                    0 !== e.length && (e.forEach(function(e) {
                        var i = d.mod(e.x, 1);
                        e.x = i + (i < t.minX() ? 1 : 0)
                    }), u.preprocessPoints(e, !0))
                }), t
            },
            simplifyShapeAtLevel: function(t) {
                var e = this._simplifiedShapeLevel > t ? this._simplifiedShape : this._polygons,
                    i = Math.pow(2, t);
                return e.reduce(function(t, e) { var n = u.filterPointsAtScale(e, i); return n.length > 0 && t.push(n), t }, [])
            },
            clip: function(t, e, i) { return !e || p.mapRectContains(e, this._boundingRect) ? t : s(t, e, i) }
        }), e.exports = n
    }, { "../../../lib/geo": 2, "../line-simplification": 181, "../types-internal": 221, "./polygon-overlay-node": 198, "./styled-overlay-internal": 205, "@maps/js-utils": 84 }],
    198: [function(t, e, i) {
        function n(t) { s.call(this, t, !0) }

        function o(t) { return t.map(function(t) { return t.map(function(t) { return t.toString() }).join(",") }).join("|") }
        var s = t("./styled-overlay-node.js"),
            a = t("@maps/js-utils");
        n.prototype = a.inheritPrototype(s, n, { stringInfo: function() { var t = this.overlay; return "PolygonOverlayNode<points:" + o(t.points) + ">" + (t.style.toString() ? "[" + t.style + "]" : "") } }), e.exports = n
    }, { "./styled-overlay-node.js": 206, "@maps/js-utils": 84 }],
    199: [function(t, e, i) {
        function n(t, e) { Object.defineProperty(this, "_impl", { value: new s(this, t, e) }) }
        var o = t("./styled-overlay"),
            s = t("./polygon-overlay-internal"),
            a = t("@maps/js-utils");
        n.prototype = a.inheritPrototype(o, n, { get points() { return this._impl.points }, set points(t) { this._impl.points = t } }), e.exports = n
    }, { "./polygon-overlay-internal": 197, "./styled-overlay": 208, "@maps/js-utils": 84 }],
    200: [function(t, e, i) {
        function n(t, e, i) { l.call(this, new h(this), t, i), this.points = e, this.updateGeometry() }

        function o(t, e, i) {
            for (var n, o = e.minX() - i, s = e.minY() - i, a = e.maxX() + i, r = e.maxY() + i, l = [], h = 0, c = t.length; h < c - 1; ++h) {
                var u, d = t[h],
                    p = t[h + 1],
                    m = p.x - d.x;
                if (0 !== m) {
                    var g = (o - d.x) / m,
                        _ = (a - d.x) / m;
                    u = !(g < 0 && _ < 0 || g > 1 && _ > 1)
                }
                else u = d.x >= o && d.x <= a;
                if (u) {
                    var f = p.y - d.y;
                    if (0 !== f) {
                        var y = (s - d.y) / f,
                            v = (r - d.y) / f;
                        u = !(y < 0 && v < 0 || y > 1 && v > 1)
                    }
                    else u = d.y >= s && d.y <= r
                }
                u ? (n || (n = []), n.push(d)) : n && (n.push(d), l.push(n), n = null)
            }
            return n && (n.push(p), l.push(n)), l
        }
        var s = t("../../../lib/geo"),
            a = s.Coordinate,
            r = s.MapRect,
            l = t("./styled-overlay-internal"),
            h = t("./polyline-overlay-node"),
            c = t("../line-simplification"),
            u = t("../types-internal"),
            d = t("@maps/js-utils");
        n.prototype = d.inheritPrototype(l, n, {
            _fillable: !1,
            get points() { return this._points.slice() },
            set points(t) { d.checkInstance(t, Array, "[MapKit] PolylineOverlay.points expected an array of Coordinates."), this._points = t.slice(), this._mapPoints = this._points.map(function(t, e) { return d.checkInstance(t, a, "[MapKit] PolylineOverlay.points expected a Coordinate at index: " + e), t.toUnwrappedMapPoint() }), this._pointsNeedRemapping = !0, this.updateGeometry() },
            calculateBoundingRect: function() {
                if (0 === this._mapPoints.length) return new r(0, 0, 0, 0);
                var t = this._mapPoints.reduce(function(t, e) { return e.x < t.xMin && (t.xMin = e.x), e.x > t.xMax && (t.xMax = e.x), e.y < t.yMin && (t.yMin = e.y), e.y > t.yMax && (t.yMax = e.y), t }, { xMin: 1 / 0, xMax: -1 / 0, yMin: 1, yMax: 0 }),
                    e = t.xMax - t.xMin,
                    i = d.mod(t.xMin, 1);
                if (this._pointsNeedRemapping) {
                    delete this._pointsNeedRemapping, e > 1 && console.warn("[MapKit] Polyline overlay spans over 360º in longitude and may not render correctly.");
                    var n = t.xMin - i;
                    this._mapPoints.forEach(function(t) { t.x -= n }), c.preprocessPoints(this._mapPoints), delete this._simplifiedShapeLevel
                }
                return new r(i, t.yMin, e, t.yMax - t.yMin)
            },
            simplifyShapeAtLevel: function(t) { var e = this._simplifiedShapeLevel > t ? this._simplifiedShape : this._mapPoints; return c.filterPointsAtScale(e, Math.pow(2, t)) },
            clip: function(t, e, i) { return !e || u.mapRectContains(e, this._boundingRect) ? 0 === t.length ? [] : [t] : o(t, e, i) }
        }), e.exports = n
    }, { "../../../lib/geo": 2, "../line-simplification": 181, "../types-internal": 221, "./polyline-overlay-node": 201, "./styled-overlay-internal": 205, "@maps/js-utils": 84 }],
    201: [function(t, e, i) {
        function n(t) { s.call(this, t, !1) }

        function o(t) { return t.map(function(t) { return t.toString() }).join(",") }
        var s = t("./styled-overlay-node.js"),
            a = t("@maps/js-utils");
        n.prototype = a.inheritPrototype(s, n, { stringInfo: function() { var t = this.overlay; return "PolylineOverlayNode<points:" + o(t.points) + ">" + (t.style.toString() ? "[" + t.style + "]" : "") } }), e.exports = n
    }, { "./styled-overlay-node.js": 206, "@maps/js-utils": 84 }],
    202: [function(t, e, i) {
        function n(t, e) { Object.defineProperty(this, "_impl", { value: new s(this, t, e) }) }
        var o = t("./styled-overlay"),
            s = t("./polyline-overlay-internal"),
            a = t("@maps/js-utils");
        n.prototype = a.inheritPrototype(o, n, { get points() { return this._impl.points }, set points(t) { this._impl.points = t } }), e.exports = n
    }, { "./polyline-overlay-internal": 200, "./styled-overlay": 208, "@maps/js-utils": 84 }],
    203: [function(t, e, i) {
        function n(t) {
            o.EventTarget(this), a.checkOptions(t);
            for (var e in t) {
                var i = Object.getOwnPropertyDescriptor(n.prototype, e);
                i && i.set ? this[e] = t[e] : console.warn("[MapKit] Style has no property named `" + e + "`, ignoring.")
            }
        }
        var o = t("@maps/dom-events"),
            s = t("../utils"),
            a = t("@maps/js-utils"),
            r = { lineCap: ["butt", "round", "square"], lineJoin: ["miter", "round", "bevel"], fillRule: ["nonzero", "evenodd"] };
        n.UPDATE_EVENT = "update-style";
        n.prototype = {
            constructor: n,
            _strokeColor: "rgb(0, 122, 255)",
            _strokeOpacity: 1,
            _lineWidth: 1,
            _lineCap: "round",
            _lineJoin: "round",
            _lineDash: [],
            _lineDashOffset: 0,
            _fillColor: "rgb(0, 122, 255)",
            _fillOpacity: .1,
            _fillRule: "nonzero",
            get strokeColor() { return this._strokeColor },
            set strokeColor(t) { null != t && a.checkType(t, "string", "[MapKit] Expected a string value for Style.strokeColor, but got `" + t + "` instead."), this._strokeColor !== t && (this._strokeColor = t, this._updated()) },
            get strokeOpacity() { return this._strokeOpacity },
            set strokeOpacity(t) {
                a.checkType(t, "number", "[MapKit] Expected a number value for Style.strokeOpacity, but got `" + t + "` instead.");
                var e = a.clamp(t, 0, 1);
                this._strokeOpacity !== e && (this._strokeOpacity = e, this._updated())
            },
            get lineWidth() { return this._lineWidth },
            set lineWidth(t) {
                a.checkType(t, "number", "[MapKit] Expected a number value for Style.lineWidth, but got `" + t + "` instead.");
                var e = Math.max(0, t);
                this._lineWidth !== e && (this._lineWidth = e, this._updated())
            },
            get lineCap() { return this._lineCap },
            set lineCap(t) {
                var e = r.lineCap,
                    i = "[MapKit] Expected one of " + e.map(function(t) { return "`" + t + "`" }).join(", ") + " for Style.lineCap, but got `" + t + "` instead.";
                if (a.checkType(t, "string", i), e.indexOf(t) < 0) throw new TypeError(i);
                this._lineCap !== t && (this._lineCap = t, this._updated())
            },
            get lineJoin() { return this._lineJoin },
            set lineJoin(t) {
                var e = r.lineJoin,
                    i = "[MapKit] Expected one of " + e.map(function(t) { return "`" + t + "`" }).join(", ") + " for Style.lineJoin, but got `" + t + "` instead.";
                if (a.checkType(t, "string", i), e.indexOf(t) < 0) throw new TypeError(i);
                this._lineJoin !== t && (this._lineJoin = t, this._updated())
            },
            get lineDash() { return this._lineDash },
            set lineDash(t) { a.checkArray(t, "[MapKit] Expected an array of numbers for Style.lineDash, but got `" + t + "` instead."), t.forEach(function(t, e) { a.checkType(t, "number", "[MapKit] Expected an array of numbers for Style.lineDash, but got `" + t + "` at index " + e + " instead.") }), this._lineDash = t.slice(), this._updated() },
            get lineDashOffset() { return this._lineDashOffset },
            set lineDashOffset(t) { a.checkType(t, "number", "[MapKit] Expected a number value for Style.lineDashOffset, but got `" + t + "` instead."), this._lineDashOffset !== t && (this._lineDashOffset = t, this._updated()) },
            get fillColor() { return this._fillColor },
            set fillColor(t) { null != t && a.checkType(t, "string", "[MapKit] Expected a string value for Style.fillColor, but got `" + t + "` instead."), this._fillColor !== t && (this._fillColor = t, this._updated()) },
            get fillOpacity() { return this._fillOpacity },
            set fillOpacity(t) {
                a.checkType(t, "number", "[MapKit] Expected a number value for Style.fillOpacity, but got `" + t + "` instead.");
                var e = a.clamp(t, 0, 1);
                this._fillOpacity !== e && (this._fillOpacity = e, this._updated())
            },
            get fillRule() { return this._fillRule },
            set fillRule(t) {
                var e = r.fillRule,
                    i = "[MapKit] Expected one of " + e.map(function(t) { return "`" + t + "`" }).join(", ") + " for Style.fillRule, but got `" + t + "` instead.";
                if (a.checkType(t, "string", i), e.indexOf(t) < 0) throw new TypeError(i);
                this._fillRule !== t && (this._fillRule = t, this._updated())
            },
            shouldStroke: function() { return this.strokeColor && this.strokeOpacity > 0 && this.lineWidth > 0 },
            shouldFill: function() { return this.fillColor && this.fillOpacity > 0 },
            halfStrokeWidthAtResolution: function() { return this.strokeColor && this.strokeOpacity > 0 ? this.lineWidth / 2 * s.devicePixelRatio : 0 },
            styleForHitTesting: function(t) { var e = Object.create(this); return null != this._fillColor && (e._fillColor = "rgb(0, 122, 255)", e._fillOpacity = 1), e._strokeColor = "rgb(0, 122, 255)", e._strokeOpacity = 1, e._lineWidth = this.lineWidth + t, e._impl = e, e },
            toString: function() { return ["strokeColor", "strokeOpacity", "lineWidth", "lineCap", "lineJoin", "lineDash", "lineDashOffset", "fillColor", "fillOpacity", "fillRule"].filter(function(t) { return this.hasOwnProperty("_" + t) }, this).map(function(t) { return t + ":" + (Array.isArray(this[t]) ? JSON.stringify(this[t]) : this[t]) }, this).join(",") },
            _updated: function() { this.dispatchEvent(new o.Event(n.UPDATE_EVENT)) }
        }, e.exports = n
    }, { "../utils": 225, "@maps/dom-events": 62, "@maps/js-utils": 84 }],
    204: [function(t, e, i) {
        function n(t) { Object.defineProperty(this, "_impl", { value: new o(t) }) }
        var o = t("./style-internal.js");
        n.prototype = { constructor: n, get strokeColor() { return this._impl.strokeColor }, set strokeColor(t) { this._impl.strokeColor = t }, get strokeOpacity() { return this._impl.strokeOpacity }, set strokeOpacity(t) { this._impl.strokeOpacity = t }, get lineWidth() { return this._impl.lineWidth }, set lineWidth(t) { this._impl.lineWidth = t }, get lineCap() { return this._impl.lineCap }, set lineCap(t) { this._impl.lineCap = t }, get lineJoin() { return this._impl.lineJoin }, set lineJoin(t) { this._impl.lineJoin = t }, get lineDash() { return this._impl.lineDash }, set lineDash(t) { this._impl.lineDash = t }, get lineDashOffset() { return this._impl.lineDashOffset }, set lineDashOffset(t) { this._impl.lineDashOffset = t }, get fillColor() { return this._impl.fillColor }, set fillColor(t) { this._impl.fillColor = t }, get fillOpacity() { return this._impl.fillOpacity }, set fillOpacity(t) { this._impl.fillOpacity = t }, get fillRule() { return this._impl.fillRule }, set fillRule(t) { this._impl.fillRule = t }, toString: function() { return this._impl.toString() } }, e.exports = n
    }, { "./style-internal.js": 203 }],
    205: [function(t, e, i) {
        function n(t, e, i) {
            if (i && "object" == typeof i && "style" in i) {
                this.style = i.style;
                var n = {};
                Object.keys(i).forEach(function(t) { "style" !== t && (n[t] = i[t]) }), i = n
            }
            o.call(this, t, e, i)
        }
        var o = t("./overlay-internal"),
            s = t("./style"),
            a = t("./style-internal"),
            r = t("../utils"),
            l = t("@maps/js-utils");
        n.prototype = l.inheritPrototype(o, n, {
            constructor: n,
            _fillable: !0,
            fadeInOutOpacity: { value: 1 },
            get style() { return this._style || (this._style = new s, this._style._impl.addEventListener(a.UPDATE_EVENT, this)), this._style },
            set style(t) {
                if (this._style) {
                    if (this._style === t) return;
                    this._style._impl.removeEventListener(a.UPDATE_EVENT, this)
                }
                l.checkInstance(t, s, "[MapKit] Expected a mapkit.Style value for Overlay.style, but got `" + t + "` instead."), this._style !== t && (this._style = t, this._style && this._style._impl.addEventListener(a.UPDATE_EVENT, this), this.updatedProperty("style"))
            },
            visibilityToleranceAtScale: function(t) { return this.style._impl.halfStrokeWidthAtResolution() / t },
            clipOverlay: function(t, e, i, n, o) {
                if (this._simplifiedShapeLevel !== n) {
                    var s = Math.abs(this._simplifiedShapeLevel - n),
                        a = !!this._hasPoints,
                        r = this._simplifiedShape;
                    this._simplifiedShape = this.simplifyShapeAtLevel(n), this._simplifiedShapeLevel = n, this._hasPoints = this._simplifiedShape.length > 0, 1 === s && a !== this._hasPoints && (this.delegate.fadeOverlayTo(this, a ? 0 : 1), a && (this.fadeInOutOpacity.previousShape = this.clip(r)))
                }
                var l = this.fadeInOutOpacity.previousShape || (e || !this.clippedShape ? this.clip(this._simplifiedShape, t, this.style._impl.halfStrokeWidthAtResolution() / i) : this.clippedShape);
                return o && (this.clippedShape = l), l
            },
            setFadeInOutOpacity: function(t) { this.fadeInOutOpacity.value = t, this.updatedProperty("style") },
            handleEvent: function(t) { t.type === a.UPDATE_EVENT && this.updatedProperty("style") },
            fillPath: function(t, e) { t.save(), t.fillStyle = e.fillColor, t.globalAlpha = e.fillOpacity * this.fadeInOutOpacity.value, t.fill(e.fillRule), t.restore() },
            strokePath: function(t, e, i) {
                t.save(), t.strokeStyle = e.strokeColor, t.globalAlpha = e.strokeOpacity * this.fadeInOutOpacity.value;
                var n = i || r.devicePixelRatio;
                t.lineWidth = e.lineWidth * n, e.lineDash.length > 0 && "function" == typeof t.setLineDash && (t.setLineDash(e.lineDash.map(function(t) { return t * n })), t.lineDashOffset = e.lineDashOffset * n), t.lineJoin = e.lineJoin, t.lineCap = e.lineCap, t.stroke(), t.restore()
            },
            updateGeometry: function() {
                var t = this.calculateBoundingRect();
                t && (this._boundingRect = t, this.updatedProperty("geometry"))
            }
        }), e.exports = n
    }, { "../utils": 225, "./overlay-internal": 192, "./style": 204, "./style-internal": 203, "@maps/js-utils": 84 }],
    206: [function(t, e, i) {
        function n(t, e, i) { o.call(this, t), this._closed = !!e, this._renderer = i || new s(this) }
        var o = t("./overlay-node.js"),
            s = t("./styled-overlay-renderer.js"),
            a = t("@maps/js-utils");
        n.prototype = a.inheritPrototype(o, n, { get closed() { return this._closed } }), e.exports = n
    }, { "./overlay-node.js": 193, "./styled-overlay-renderer.js": 207, "@maps/js-utils": 84 }],
    207: [function(t, e, i) {
        function n(t) { o.RenderItem.call(this, t) }
        var o = t("../../../lib/scene-graph"),
            s = t("@maps/js-utils"),
            a = t("@maps/geometry/point");
        n.prototype = s.inheritPrototype(o.RenderItem, n, {
            draw: function(t) {
                if (this._node.overlay.map) {
                    var e = this._node.overlay.map._impl.camera;
                    this.render(t, e.toRenderingMapRect(), e)
                }
            },
            render: function(t, e, i, n) {
                var o = this._node.overlay.style;
                "number" == typeof n && (o = o._impl.styleForHitTesting(n));
                var s = this._node.closed && o._impl.shouldFill(),
                    a = o._impl.shouldStroke();
                (s || a) && this.drawShapes(t, o, s, a, e, i)
            },
            drawShapes: function(t, e, i, n, o, s) {
                var r = s.toRenderingMapRect(),
                    l = new a(r.minX() - o.minX(), r.minY() - o.minY());
                t.beginPath(), this._node.shapes.forEach(function(e) {
                    e.forEach(function(i) {
                        var n = s.transformMapPoint(new a(i[0].x + e.xOffset + l.x, i[0].y + l.y));
                        t.moveTo(n.x, n.y);
                        for (var o = 1, r = i.length; o < r; o++) n = s.transformMapPoint(new a(i[o].x + e.xOffset + l.x, i[o].y + l.y)), t.lineTo(n.x, n.y);
                        this._node.closed && t.closePath()
                    }, this)
                }, this), i && this._node.overlay.fillPath(t, e), n && this._node.overlay.strokePath(t, e, 1)
            }
        }), e.exports = n
    }, { "../../../lib/scene-graph": 47, "@maps/geometry/point": 69, "@maps/js-utils": 84 }],
    208: [function(t, e, i) {
        function n(t) { Object.defineProperty(this, "_impl", { value: new s(this, t) }) }
        var o = t("./overlay"),
            s = t("./styled-overlay-internal"),
            a = t("@maps/js-utils");
        n.prototype = a.inheritPrototype(o, n, { constructor: n, get style() { return this._impl.style }, set style(t) { this._impl.style = t } }), e.exports = n
    }, { "./overlay": 194, "./styled-overlay-internal": 205, "@maps/js-utils": 84 }],
    209: [function(t, e, i) {
        function n() {
            var t = arguments.length;
            if (1 === t && "object" == typeof arguments[0]) {
                this.top = 0, this.right = 0, this.bottom = 0, this.left = 0;
                var e = arguments[0];
                Object.keys(e).forEach(function(t) { "top" === t || "right" === t || "bottom" === t || "left" === t ? this[t] = e[t] : console.warn("[MapKit] Unknown property `" + t + "` for Padding constructor.") }, this)
            }
            else this.top = t > 0 ? arguments[0] : 0, this.right = t > 1 ? arguments[1] : 0, this.bottom = t > 2 ? arguments[2] : 0, this.left = t > 3 ? arguments[3] : 0;
            o.checkType(this.top, "number", "[MapKit] Expected a number for `top` in Padding constructor but got `" + this.top + "` instead."), o.checkType(this.left, "number", "[MapKit] Expected a number for `left` in Padding constructor but got `" + this.left + "` instead."), o.checkType(this.bottom, "number", "[MapKit] Expected a number for `bottom` in Padding constructor but got `" + this.bottom + "` instead."), o.checkType(this.right, "number", "[MapKit] Expected a number for `right` in Padding constructor but got `" + this.right + "` instead.")
        }
        var o = t("@maps/js-utils");
        n.Zero = new n, n.prototype = { constructor: n, toString: function() { return "Padding(" + [this.top, this.right, this.bottom, this.left].join(", ") + ")" }, copy: function() { return new n(this.top, this.right, this.bottom, this.left) }, equals: function(t) { return this.top === t.top && this.right === t.right && this.bottom === t.bottom && this.left === t.left } }, e.exports = n
    }, { "@maps/js-utils": 84 }],
    210: [function(t, e, i) {
        function n(t) { t = h.checkOptions(t), this._checkOptions(t, u), c.call(this, "Directions", t) }

        function o(t) { if ("string" == typeof t) return { q: t }; if ("object" == typeof t && t.muid) return { muid: t.muid }; var e = t.coordinate || t; if (e instanceof l) return { loc: { lat: e.latitude, lng: e.longitude } }; throw new Error("[MapKit] Location must be an address (string), Coordinate object or Place object.") }

        function s(t, e, i) { this.name = t.name, this.distance = t.distanceMeters, this.expectedTravelTime = t.durationSeconds, this.transportType = t.transportType, this._path = t.stepIndexes.map(function(t) { return i[t] }), this.steps = t.stepIndexes.map(function(t) { return e[t] }) }

        function a(t, e, i) {
            if (this.instructions = t.instructions, this.pathIndex = t.stepPathIndex, this.distance = t.distanceMeters, this.transportType = t.transportType, this.path = e[t.stepPathIndex], i && i.length && t.maneuver) {
                var n, o, s = i[t.stepPathIndex % i.length],
                    a = t.maneuver;
                if (a.names && a.names.length) {
                    var r = a.names.filter(function(t) { return t.type && t.shieldUrl });
                    r.length && (n = "//" + s + r[0].shieldUrl)
                }
                a.arrowUrl && (o = "//" + s + a.arrowUrl);
                var l = n && -1 !== p.indexOf(a.type);
                this._imageUrl = l ? n : o
            }
        }
        var r = t("../configuration"),
            l = t("../../../lib/geo").Coordinate,
            h = t("@maps/js-utils"),
            c = t("./service-internal"),
            u = ["language"],
            d = ["origin", "destination", "transportType", "requestsAlternateRoutes"];
        n.Transport = { Automobile: "AUTOMOBILE", Walking: "WALKING" }, n.prototype = h.inheritPrototype(c, n, {
            constructor: n,
            route: function(t, e) {
                if (h.required(t, "[MapKit] Missing `request` in call to `Directions.route()`.").checkOptions(t, "[MapKit] `request` is not a valid object."), h.required(e, "[MapKit] Missing `callback` in call to `Directions.route()`.").checkType(e, "function", "[MapKit] `callback` passed to `Directions.route()` is not a function."), "CN" === r.countryCode) return e(new Error("Directions aren't supported in China yet.")), 0;
                this._checkOptions(t, d);
                var i = {},
                    s = t.origin,
                    a = t.destination,
                    l = t.transportType;
                h.required(s, "[MapKit] Missing required property `origin` in `request` object."), h.required(a, "[MapKit] Missing required property `destination` in `request` object."), i.wps = JSON.stringify([o(s), o(a)]), l && (l === n.Transport.Automobile || l === n.Transport.Walking ? i.transport = l : console.warn("[MapKit] transportType must be either Directions.Transport.Automobile or Directions.Transport.Walking.")), t.hasOwnProperty("requestsAlternateRoutes") ? i.n = t.requestsAlternateRoutes ? "3" : "1" : i.n = "1";
                var c = this.language || r.language;
                return c && (i.lang = c), this._send("directions", i, e, this._handleResponse)
            },
            _handleResponse: function(t, e) {
                var i = e.stepPaths.map(function(t) { return t.map(function(t) { return new l(t.lat, t.lng) }) }),
                    n = e.steps.map(function(t) { return new a(t, i, e.shieldDomains) });
                return { request: t, routes: e.routes.map(function(t) { return new s(t, n, i) }) }
            }
        }), s.prototype = { get path() { return console.warn("[MapKit] The `Route.path` property is deprecated and will be removed in a future release."), this._path } }, n.Route = s;
        var p = ["ON_RAMP", "OFF_RAMP", "HIGHWAY_OFF_RAMP_LEFT", "HIGHWAY_OFF_RAMP_RIGHT", "CHANGE_HIGHWAY", "CHANGE_HIGHWAY_LEFT", "CHANGE_HIGHWAY_RIGHT"];
        e.exports = n
    }, { "../../../lib/geo": 2, "../configuration": 159, "./service-internal": 217, "@maps/js-utils": 84 }],
    211: [function(t, e, i) {
        function n(t) { Object.defineProperty(this, "_impl", { value: new a(t) }) }
        var o = t("@maps/js-utils"),
            s = t("./service"),
            a = t("./directions-internal");
        n.Transport = a.Transport, n.prototype = o.inheritPrototype(s, n, { constructor: n, route: function(t, e) { return this._impl.route(t, e) } }), e.exports = n
    }, { "./directions-internal": 210, "./service": 218, "@maps/js-utils": 84 }],
    212: [function(t, e, i) {
        "use strict";

        function n(t) { t = s.checkOptions(t), this._checkOptions(t, c), r.call(this, "Geocoder", t) }
        var o = t("../configuration"),
            s = t("@maps/js-utils"),
            a = t("../../../lib/geo"),
            r = t("./service-internal"),
            l = a.BoundingRegion,
            h = a.Coordinate,
            c = ["language", "getsUserLocation"],
            u = ["language", "region", "coordinate", "limitToCountries"],
            d = ["language"];
        n.prototype = s.inheritPrototype(r, n, {
            constructor: n,
            lookup: function(t, e, i) {
                var n = {};
                i = s.checkOptions(i), this._checkOptions(i, u), s.required(t, "[MapKit] Missing `address` in call to `Geocoder.lookup()`.").checkType(t, "string", "[MapKit] `address` passed to `Geocoder.lookup()` is not a string."), s.required(e, "[MapKit] Missing `callback` in call to `Geocoder.lookup()`.").checkType(e, "function", "[MapKit] `callback` passed to `Geocoder.lookup()` is not a function."), n.q = t;
                var a = i.region,
                    r = i.coordinate,
                    l = i.limitToCountries,
                    h = this.language || o.language;
                if (a) {
                    var c = a.toBoundingRegion();
                    n.searchRegion = [c.northLatitude, c.eastLongitude, c.southLatitude, c.westLongitude].join(",")
                }
                else r && (n.searchLocation = [r.latitude, r.longitude].join(","));
                return i.language && (h = this._bestLanguage(i.language)), h && (n.lang = h), l && (s.checkType(l, "string", "[MapKit] `limitToCountries` is not a string."), n.limitToCountries = l), this._sendImmediatelyOrWithUserLocation("geocode", n, e, this._transform)
            },
            reverseLookup: function(t, e, i) {
                var n = {},
                    a = this.language || o.language;
                return i = s.checkOptions(i), this._checkOptions(i, d), s.required(t, "[MapKit] Missing `coordinate` in call to `Geocoder.reverseLookup()`.").checkInstance(t, h, "[MapKit] `coordinate` passed to `Geocoder.reverseLookup()` is not a Coordinate."), s.required(e, "[MapKit] Missing `callback` in call to `Geocoder.reverseLookup()`.").checkType(e, "function", "[MapKit] `callback` passed to `Geocoder.reverseLookup()` is not a function."), n.loc = t.latitude + "," + t.longitude, i.language && (a = this._bestLanguage(i.language)), a && (n.lang = a), this._send("reverseGeocode", n, e, this._transform)
            },
            _transform: function(t, e) { var i = { status: e.status, results: [] }; return e.results && (i.results = e.results.map(function(t) { var e, i, n = {}; return t.displayMapRegion && (e = t.displayMapRegion, i = new l(e.northLat, e.eastLng, e.southLat, e.westLng), n.region = i.toCoordinateRegion(), n.coordinate = n.region.center), t.formattedAddressLines && (n.formattedAddress = t.formattedAddressLines.join(", ")), t.center && (n.coordinate = new h(t.center.lat, t.center.lng)), t.countryCode && (n.countryCode = t.countryCode), t.geocodeAccuracy && (n.geocodeAccuracy = t.geocodeAccuracy), n })), i }
        }), e.exports = n
    }, { "../../../lib/geo": 2, "../configuration": 159, "./service-internal": 217, "@maps/js-utils": 84 }],
    213: [function(t, e, i) {
        function n(t) { Object.defineProperty(this, "_impl", { value: new a(t) }) }
        var o = t("@maps/js-utils"),
            s = t("./service"),
            a = t("./geocoder-internal");
        n.prototype = o.inheritPrototype(s, n, { constructor: n, lookup: function(t, e, i) { return this._impl.lookup(t, e, i) }, reverseLookup: function(t, e, i) { return this._impl.reverseLookup(t, e, i) } }), e.exports = n
    }, { "./geocoder-internal": 212, "./service": 218, "@maps/js-utils": 84 }],
    214: [function(t, e, i) {
        function n() { this._requests = {}, this._types = {}, this._counter = 1 } n.prototype = { constructor: n, add: function(t, e) { console.assert(e && -1 !== ["query", "geo", "xhr"].indexOf(e), "Invalid type: " + e); var i = this._counter; return this._counter += 1, this._requests[i] = t, this._types[i] = e, i }, get: function(t) { return console.assert(t && "number" == typeof t, "Invalid ID: " + t), this._requests[t] }, typeForId: function(t) { return console.assert(t && "number" == typeof t, "Invalid ID: " + t), this._types[t] }, idsByType: function(t) { return Object.keys(this._requests).filter(function(e) { return this._types[e] === t }, this).map(function(t) { return parseInt(t) }) }, remove: function(t) { return console.assert(t && "number" == typeof t, "Invalid ID: " + t), !!this.get(t) && (delete this._requests[t], delete this._types[t], !0) } }, e.exports = n
    }, {}],
    215: [function(t, e, i) {
        function n(t) { this.displayLines = t.displayLines, t.location && (this.coordinate = new u(t.location.lat, t.location.lng)), this._completionUrl = t.completionUrl }

        function o(t) { t = a.checkOptions(t), this._checkOptions(t, d), l.call(this, "Search", t), this.coordinate = t.coordinate, this.region = t.region }
        var s = t("../configuration"),
            a = t("@maps/js-utils"),
            r = t("../../../lib/geo"),
            l = t("./service-internal"),
            h = r.BoundingRegion,
            c = r.CoordinateRegion,
            u = r.Coordinate,
            d = ["language", "getsUserLocation", "coordinate", "region"],
            p = ["language", "region", "coordinate"];
        o.prototype = a.inheritPrototype(l, o, {
            constructor: o,
            get coordinate() { return this._coordinate },
            set coordinate(t) { null != t && (a.checkInstance(t, u, "[MapKit] Search.coordinate expected a Coordinate value."), t = t.copy()), this._coordinate = t },
            get region() { return this._region },
            set region(t) { null != t && (a.checkInstance(t, c, "[MapKit] Search.region expected a CoordinateRegion value."), t = t.copy()), this._region = t },
            search: function(t, e, i) { return this._request("search", "search", this._searchTransform, t, e, i) },
            autocomplete: function(t, e, i) { this._request("autocomplete", "searchAutocomplete", this._autocompleteTransform, t, e, i) },
            _request: function(t, e, i, o, r, l) {
                if ("object" == typeof r) {
                    var h = r;
                    r = function(e, i) {
                        var n = "search" === t ? h.searchDidError : h.autocompleteDidError,
                            o = "search" === t ? h.searchDidComplete : h.autocompleteDidComplete;
                        e ? "function" == typeof n && n(e) : "function" == typeof o && o(i)
                    }
                }
                var c = {};
                l = a.checkOptions(l), this._checkOptions(l, p);
                var u = "Search." + t + "()";
                a.required(o, "[MapKit] Missing `query` in call to `" + u + "`."), a.required(r, "[MapKit] Missing `callback` in call to `" + u + "`.").checkType(r, "function", "[MapKit] `callback` passed to `" + u + "` is not a function."), o instanceof n ? e = o._completionUrl : (console.assert("string" == typeof o, "[MapKit] `query` passed to `" + u + "` is neither a string nor SearchAutocompleteResult."), c.q = o);
                var d = l.region || this.region,
                    m = l.coordinate || this.coordinate,
                    g = this.language || s.language;
                if (d) {
                    var _ = d.toBoundingRegion();
                    c.searchRegion = [_.northLatitude, _.eastLongitude, _.southLatitude, _.westLongitude].join(",")
                }
                else m && (c.searchLocation = [m.latitude, m.longitude].join(","));
                return l.language && (g = this._bestLanguage(l.language)), g && (c.lang = g), this._sendImmediatelyOrWithUserLocation(e, c, r, i)
            },
            _searchTransform: function(t, e) {
                var i = { places: [] };
                if (t.q && (i.query = t.q), e.displayMapRegion) {
                    var n = new h(e.displayMapRegion.northLat, e.displayMapRegion.eastLng, e.displayMapRegion.southLat, e.displayMapRegion.westLng);
                    i.boundingRegion = n.toCoordinateRegion()
                }
                return e.results && (i.places = e.results.map(function(t) { var e, i, n = {}; return t.muid && (n.muid = t.muid), t.placecardUrl && (n._wpURL = t.placecardUrl), t.name && (n.name = t.name), t.displayMapRegion && (e = t.displayMapRegion, i = new h(e.northLat, e.eastLng, e.southLat, e.westLng), n.region = i.toCoordinateRegion(), n.coordinate = n.region.center), t.formattedAddressLines && (n.formattedAddress = t.formattedAddressLines.join(", ")), t.center && (n.coordinate = new u(t.center.lat, t.center.lng)), t.countryCode && (n.countryCode = t.countryCode), n })), i
            },
            _autocompleteTransform: function(t, e) { var i = { query: t.q, results: [] }; return e.results && (i.results = e.results.map(function(t) { return new n(t) })), i }
        }), e.exports = o
    }, { "../../../lib/geo": 2, "../configuration": 159, "./service-internal": 217, "@maps/js-utils": 84 }],
    216: [function(t, e, i) {
        function n(t) { Object.defineProperty(this, "_impl", { value: new a(t) }) }
        var o = t("@maps/js-utils"),
            s = t("./service"),
            a = t("./search-internal");
        n.prototype = o.inheritPrototype(s, n, { constructor: n, get coordinate() { return this._impl.coordinate }, set coordinate(t) { this._impl.coordinate = t }, get region() { return this._impl.region }, set region(t) { this._impl.region = t }, search: function(t, e, i) { return this._impl.search(t, e, i) }, autocomplete: function(t, e, i) { return this._impl.autocomplete(t, e, i) } }), e.exports = n
    }, { "./search-internal": 215, "./service": 218, "@maps/js-utils": 84 }],
    217: [function(t, e, i) {
        function n(t, e) { this._name = t, this._requestMap = new h, o.state === o.States.ERROR && (this._configFailed = !0), this.language = e.language, this.getsUserLocation = !!e.getsUserLocation }
        var o = t("../configuration"),
            s = t("../localizer").languageSupport,
            a = t("@maps/js-utils"),
            r = t("../user-location/user-location"),
            l = t("../../../lib/geo").Coordinate,
            h = t("./request-map"),
            c = t("@maps/loaders").XHRLoader,
            u = { enableHighAccuracy: !1, timeout: 8e3, maximumAge: 9e5 };
        n.prototype = {
            constructor: n,
            get getsUserLocation() { return this._getsUserLocation },
            set getsUserLocation(t) { this._getsUserLocation = !!t },
            get language() { return this._language },
            set language(t) { this._language = null == t ? null : this._bestLanguage(t) },
            cancel: function(t) {
                a.required(t, "[MapKit] Missing `id` in call to `" + this._name + ".cancel()`.").checkType(t, "number", "[MapKit] `id` passed to `" + this._name + ".cancel()` is not a number.");
                var e = this._requestMap.typeForId(t);
                if (e) switch (e) {
                    case "query":
                    case "geo":
                        return this._requestMap.remove(t);
                    case "xhr":
                        var i = this._requestMap.get(t);
                        if (i) return i.unschedule(), this._requestMap.remove(t);
                        break;
                    default:
                        console.assert(!1, "Unknown type: " + e)
                }
                return !1
            },
            handleEvent: function(t) {
                switch (t.type) {
                    case o.Events.Error:
                        this._configFailed = !0;
                    case o.Events.Changed:
                        this._requestMap.idsByType("query").forEach(function(t) {
                            var e = this._requestMap.get(t);
                            this._send(e.path, e.parameters, e.callback, e.transform), this._requestMap.remove(t)
                        }, this)
                }
                0 === this._requestMap.idsByType("query").length && this._stopWatchingConfiguration()
            },
            _watchingConfiguration: !1,
            _watchConfiguration: function() { this._watchingConfiguration || (this._watchingConfiguration = !0, o.addEventListener(o.Events.Changed, this), o.addEventListener(o.Events.Error, this)) },
            _stopWatchingConfiguration: function() { this._watchingConfiguration && (this._watchingConfiguration = !1, o.removeEventListener(o.Events.Changed, this), o.removeEventListener(o.Events.Error, this)) },
            _send: function(t, e, i, n) {
                var s = this._requestMap;
                if (!o.apiBaseUrl || o.state === o.States.PENDING) return this._configFailed ? (i(new Error("MapKit failed to initialize.")), 0) : (console.warn("[MapKit] The configuration has not been initialized, or it is loading. The request has been queued."), this._watchConfiguration(), s.add({ path: t, parameters: e, callback: i, transform: n }, "query"));
                var r;
                if (0 === t.search(/\/v?[0-9]+\//)) {
                    var l = a.parseURL(o.apiBaseUrl);
                    r = l.protocol + "//" + l.hostname, l.port && (r += ":" + l.port), r += t
                }
                else r = o.apiBaseUrl + t;
                e = e || {};
                var h = a.toQueryString(e);
                "" !== h && (r += (a.parseURL(r).search ? "&" : "?") + h);
                var u = new c(r, {
                    loaderDidSucceed: function(t, o) {
                        var a;
                        if (s.remove(t.id), o.status < 200 || o.status >= 300) i(new Error("HTTP error:" + o.status));
                        else { try { a = JSON.parse(o.responseText) } catch (t) { return void i(new Error("Failed to parse response:" + o.responseText)) } i(null, n(e, a)) }
                    },
                    loaderDidFail: function(t, e) {
                        s.remove(t.id);
                        var n = "Network error";
                        e.status === o.HTTP.UNAUTHORIZED ? n = o.ErrorStatus.Unauthorized : e.status === o.HTTP.TOO_MANY_REQUESTS && (n = o.ErrorStatus.TooManyRequests), i(new Error(n))
                    }
                }, o.appendServiceAuthOptions({}));
                return u.schedule(), u.id = s.add(u, "xhr"), u.id
            },
            _sendImmediatelyOrWithUserLocation: function(t, e, i, n) { return this.getsUserLocation || e.getsUserLocation ? this._sendWithUserLocation.apply(this, arguments) : this._send.apply(this, arguments) },
            _sendWithUserLocation: function(t, e, i, n) {
                var o = this._requestMap.add({ path: t, parameters: e, callback: i, transform: n }, "geo");
                return this._locate(function(t, e) {
                    var i = this._requestMap.get(o);
                    i && (t ? console.warn("[MapKit] Unable to get current location:", t.message) : i.parameters.userLocation = [e.latitude, e.longitude].join(","), this._send(i.path, i.parameters, i.callback, i.transform), this._requestMap.remove(o))
                }.bind(this)), o
            },
            _checkOptions: function(t, e) { a.checkType(t, "object", "[MapKit] The `options` object is invalid."), Object.keys(t).forEach(function(t) {-1 === e.indexOf(t) && console.warn("[MapKit] `" + t + "` is not a valid option.") }) },
            _bestLanguage: function(t) { a.checkType(t, "string", "[MapKit] `language` is not a string."); var e = s.bestMatch(t); return null === e ? console.warn("[MapKit] Geocoder: “" + t + "” is not supported.") : e !== t && console.warn("[MapKit] Geocoder: “" + t + "” is not supported. Substituting “" + e + "”"), e },
            _locate: function(t) {
                a.required(t, "Missing callback").checkType(t, "function"), r.locate(function(e) {
                    var i = e.coords;
                    t(null, new l(i.latitude, i.longitude))
                }, function(e) {
                    var i;
                    switch (e.code) {
                        case e.PERMISSION_DENIED:
                            i = "PERMISSION_DENIED";
                            break;
                        case e.POSITION_UNAVAILABLE:
                            i = "POSITION_UNAVAILABLE";
                            break;
                        case e.TIMEOUT:
                            i = "TIMEOUT";
                            break;
                        default:
                            console.assert(!1, "Unknown PositionError code: " + e.code)
                    }
                    t(new Error(i))
                }, u)
            }
        }, e.exports = n
    }, { "../../../lib/geo": 2, "../configuration": 159, "../localizer": 182, "../user-location/user-location": 224, "./request-map": 214, "@maps/js-utils": 84, "@maps/loaders": 85 }],
    218: [function(t, e, i) {
        function n(t, e) { Object.defineProperty(this, "_impl", { value: new o(t, e) }) }
        var o = t("./service-internal");
        n.prototype = { constructor: n, get getsUserLocation() { return this._impl.getsUserLocation }, set getsUserLocation(t) { this._impl.getsUserLocation = t }, get language() { return this._impl.language }, set language(t) { this._impl.language = t }, cancel: function(t) { return this._impl.cancel(t) } }, e.exports = n
    }, { "./service-internal": 217 }],
    219: [function(t, e, i) { window.console || (window.console = t("./console")), window.mapkit = t("./index") }, { "./console": 160, "./index": 175 }],
    220: [function(t, e, i) {
        function n() { this._element = a.htmlElement("div", { class: r }) }

        function o(t) {
            for (var e, i = [t]; i.length > 0;)
                if ((t = i.shift()).nodeType === window.Node.ELEMENT_NODE) {
                    var n = window.getComputedStyle(t),
                        o = parseFloat(n.marginLeft),
                        a = parseFloat(n.marginTop),
                        r = parseFloat(n.marginRight),
                        l = parseFloat(n.marginBottom),
                        h = s.rectFromClientRect(t.getBoundingClientRect()).inset(-o, -a, -r, -l);
                    h.size.width > 0 && h.size.height > 0 && (e = e ? e.unionWithRect(h) : h), Array.prototype.push.apply(i, t.childNodes)
                }
            return e || new s
        }
        var s = t("@maps/geometry/rect"),
            a = t("./utils"),
            r = "mk-style-helper";
        n.prototype = {
            constructor: n,
            get element() { return this._element },
            sizeForElement: function(t) {
                var e = t.cloneNode(!0);
                this._element.appendChild(e);
                var i = o(e);
                return this._element.removeChild(e), i.size
            },
            backgroundColorForElement: function(t) { this._element.appendChild(t); var e = window.getComputedStyle(t).backgroundColor; return this._element.removeChild(t), /^transparent|initial|rgba\(.*, 0\)$/.test(e) ? null : e }
        }, e.exports = n
    }, { "./utils": 225, "@maps/geometry/rect": 70 }],
    221: [function(t, e, i) {
        var n = t("../../lib/geo"),
            o = t("@maps/js-utils"),
            s = n.Coordinate,
            a = n.CoordinateRegion,
            r = n.CoordinateSpan,
            l = n.MapRect;
        e.exports = {
            enclosingRegionForCoordinates: function(t) {
                var e = 0,
                    i = 180,
                    l = -180,
                    h = 0,
                    c = 90,
                    u = -90;
                t.forEach(function(t) {
                    var s = o.clamp(t.latitude, -90, 90);
                    c = Math.min(c, s), u = Math.max(u, s);
                    var a = n.wrapLongitude(t.longitude);
                    a < 0 ? (e = Math.min(e, a), l = Math.max(l, a)) : (i = Math.min(i, a), h = Math.max(h, a))
                });
                var d, p, m = u - c,
                    g = c + m / 2;
                if (e > l) p = i + (d = h - i) / 2;
                else if (i > h) p = e + (d = l - e) / 2;
                else {
                    var _ = h - e,
                        f = 360 - (i - l);
                    p = _ < f ? e + (d = _) / 2 : i + (d = f) / 2
                }
                return new a(new s(g, p), new r(m, d))
            },
            padMapRect: function(t, e) {
                o.checkType(e, "object", "[MapKit] MapRect.pad expects a padding object with top, left, bottom, right but got `" + e + "` instead");
                var i = e.left || 0,
                    n = e.top || 0;
                return new l(t.origin.x - i, t.origin.y - n, t.size.width + i + (e.right || 0), t.size.height + n + (e.bottom || 0))
            },
            mapRectContains: function(t, e) {
                var i = e.origin.x,
                    n = e.origin.y,
                    o = t.maxX(),
                    s = t.maxY();
                return i >= t.origin.x && i <= o && n >= t.origin.y && n <= s && e.maxX() <= o && e.maxY() <= s
            },
            boundingRectForSortedRects: function(t) {
                if (0 === t.length) return new l;
                if (1 === t.length) { var e = t[0].minX(); return e >= 0 && e < 1 ? t[0] : new l(o.mod(e, 1), t[0].minY(), t[0].size.width, t[0].size.height) }
                for (var i = [
                        [t[0].minX(), t[0].maxX()]
                    ], n = t[0].minY(), s = t[0].maxY(), a = 1, r = t.length, h = 0; a < r; ++a) {
                    var c = i[h],
                        u = t[a];
                    n = Math.min(n, u.minY()), s = Math.max(s, u.maxY()), u.minX() <= c[1] ? i[h] = [c[0], Math.max(c[1], u.maxX())] : (i.push([u.minX(), u.maxX()]), ++h)
                }
                var d = i.length;
                if (1 === d) return new l(i[0][0], n, Math.min(i[0][1] - i[0][0], 1), s - n);
                for (var p = 1 + i[0][0] - i[d - 1][1], m = i[0][0], g = 1; g < d; ++g) {
                    var _ = i[g][0] - i[g - 1][1];
                    _ > p && (p = _, m = i[g][0])
                }
                return new l(o.mod(m, 1), n, 1 - p, s - n)
            }
        }
    }, { "../../lib/geo": 2, "@maps/js-utils": 84 }],
    222: [function(t, e, i) {
        "use strict";
        var n = t("../build.json"),
            o = t("@maps/js-utils"),
            s = "";
        e.exports = { createUrl: function(t) { return s || (s = n.useLocalResources ? this.getMapKitScriptParts().prefix : n.cdnUrl), t = t && t.replace(/^\//, "") || "", [s, t].join("/") }, createImageUrl: function(t) { return this.createUrl("images/" + t) }, getMapKitScriptParts: function() { for (var t = /(.*)(?=\/mapkit\.js)/, e = document.scripts, i = 0, n = e.length; i < n; ++i) { var s = t.exec(e[i].src); if (s) { var a = o.parseURL(e[i].src); return a.prefix = s[0], a } } return {} } }
    }, { "../build.json": 111, "@maps/js-utils": 84 }],
    223: [function(t, e, i) {
        function n(t) { this._delegate = t, this._showsUserLocation = !1, this._tracksUserLocation = !1 }
        var o = t("./user-location");
        n.prototype = {
            constructor: n,
            get showsUserLocation() { return this._showsUserLocation },
            set showsUserLocation(t) { this._showsUserLocation = t, t ? (o.addEventListener(o.Events.Change, this), o.addEventListener(o.Events.Error, this), o.watch()) : (o.removeEventListener(o.Events.Change, this), o.removeEventListener(o.Events.Error, this)) },
            get tracksUserLocation() { return this._tracksUserLocation },
            set tracksUserLocation(t) { this._tracksUserLocation = t, t ? (o.addEventListener(o.Events.Change, this), o.addEventListener(o.Events.Error, this), o.watch()) : (o.removeEventListener(o.Events.Change, this), o.removeEventListener(o.Events.Error, this)) },
            get userLocation() { return o },
            handleEvent: function(t) {
                switch (t.type) {
                    case o.Events.Change:
                        this._handleUserLocationChange(t);
                        break;
                    case o.Events.Error:
                        this._handleUserLocationError(t)
                }
            },
            mapWasDestroyed: function() { delete this._delegate, o.removeEventListener(o.Events.Change, this), o.removeEventListener(o.Events.Error, this) },
            _handleUserLocationChange: function(t) { o.errorCode = 0, this._delegate.userLocationDidChange(t) },
            _handleUserLocationError: function(t) { o.errorCode = t.code, this._delegate.userLocationDidError(t) }
        }, e.exports = n
    }, { "./user-location": 224 }],
    224: [function(t, e, i) {
        function n() { clearTimeout(y), y = null }

        function o(t, e, i) {
            if ("AutoNavi" === p.tileProvider) {
                var n = new u(t.coords.latitude, t.coords.longitude);
                m.shift(n, p.locationShiftUrl, function(n, o) {
                    if (n) i && i(n);
                    else { var s = { coords: { latitude: o.latitude, longitude: o.longitude } }; "accuracy" in t.coords && (s.coords.accuracy = t.coords.accuracy), e && e(s) }
                })
            }
            else e && e(t)
        }

        function s(t) { n(), c = t, p.ready ? !v._stale && v._coordinate && t.coords.latitude === v._coordinate.latitude && t.coords.longitude === v._coordinate.longitude || o(t, a, r) : r({ code: 4, message: "MapKit not initialized." }) }

        function a(t) { v._stale = !1, v._location = t.coords, v._coordinate = new u(t.coords.latitude, t.coords.longitude), v.dispatchEvent(new l(v._coordinate)) }

        function r(t) { c = null, v._stale = !0, v.dispatchEvent(new h(t)) }

        function l(t) { d.Event.call(this, g.Change), this.coordinate = t, this.timestamp = new Date }

        function h(t) { d.Event.call(this, g.Error), this.code = t.code, this.message = t.message }
        var c, u = t("../../../lib/geo").Coordinate,
            d = t("@maps/dom-events"),
            p = t("../configuration"),
            m = t("../coordinate-shifter"),
            g = { Change: "user-location-change", Error: "user-location-error" },
            _ = 15e3,
            f = 3,
            y = null,
            v = new function() {
                d.EventTarget(this), this.Events = g, this._location = null, this._coordinate = null, this._stale = !1, this._watchers = 0, Object.defineProperty(this, "location", { get: function() { return this._location } }), Object.defineProperty(this, "coordinate", { get: function() { return this._coordinate } }), Object.defineProperty(this, "stale", { get: function() { return this._stale } }), this.watch = function() { this._watchId || (n(), this._watchId = window.navigator.geolocation.watchPosition(s, r), y = setTimeout(function() { n(), r({ code: f, message: "Timeout expired" }) }, _)) }, this.locate = function(t, e, i) { c && this._watchId ? o(c, t, e) : window.navigator.geolocation.getCurrentPosition(function(i) { o(i, t, e) }, e, i) }, this.addEventListener = function() { d.EventTarget.prototype.addEventListener.apply(this, arguments) && ++this._watchers }, this.removeEventListener = function() { d.EventTarget.prototype.removeEventListener.apply(this, arguments) && 0 == --this._watchers && this._watchId && (window.navigator.geolocation.clearWatch(this._watchId), this._watchId = null) }, this.handleEvent = function(t) {
                    switch (t.type) {
                        case p.Events.Changed:
                            if (!c) return;
                            s(c)
                    }
                }, this.reset = function() { n(), this._watchers = 0, this._watchId = null, c = null }, p.addEventListener(p.Events.Changed, this)
            };
        e.exports = v
    }, { "../../../lib/geo": 2, "../configuration": 159, "../coordinate-shifter": 171, "@maps/dom-events": 62 }],
    225: [function(t, e, i) {
        function n(t, e) {
            var i = window.document.createElementNS(this, t),
                n = 1;
            if ("object" == typeof e && null != e && !(e instanceof window.Node)) {++n; for (var o in e) i.setAttribute(o, e[o]) }
            for (var s = n, a = arguments.length; s < a; ++s) {
                var r = arguments[s];
                r instanceof window.Node ? i.appendChild(r) : "string" == typeof r && i.appendChild(document.createTextNode(r))
            }
            return i
        }
        var o = t("@maps/device-pixel-ratio"),
            s = t("@maps/gesture-recognizers").SupportsTouches;
        e.exports = {
            focusColor: "rgb(0, 122, 255)",
            classList: t("@maps/class-list"),
            get devicePixelRatio() { return o() },
            supportsTouches: s,
            supportsGestureEvents: !!window.GestureEvent,
            touchstartOrMousedown: s ? "touchstart" : "mousedown",
            touchendOrMouseup: s ? "touchend" : "mouseup",
            supportsForceTouch: !s && "webkitForce" in MouseEvent.prototype,
            transitionend: document.createElement("div").style.WebkitTransition ? "webkitTransitionEnd" : "transitionend",
            htmlElement: n.bind("http://www.w3.org/1999/xhtml"),
            svgElement: n.bind("http://www.w3.org/2000/svg"),
            insideIframe: window.top !== window,
            parentNodeForSvgTarget: function(t) { return t.tagName && "div" !== t.tagName.toLowerCase() ? this.parentNodeForSvgTarget(t.parentNode) : t },
            imagePathForDevice: function(t, e, i) { var n = (t || []).indexOf(this.devicePixelRatio) >= 0 ? this.devicePixelRatio : 1; return i = i || ".png", e + (n > 1 ? "_" + n + "x" : "") + ".png" },
            parseQueryString: function(t) {
                var e, i = {},
                    n = /\+/g,
                    o = /([^&=]+)=?([^&]*)/g,
                    s = function(t) { return decodeURIComponent(t.replace(n, " ")) };
                if ("string" == typeof t)
                    for (; null !== (e = o.exec(t));) i[s(e[1])] = s(e[2]);
                return i
            },
            createSVGIcon: function(t, e) { var i = this.svgElement("svg", e); return i.setAttribute("class", "mk-icon"), i.setAttribute("focusable", !1), i.appendChild(this.svgElement("g")).appendChild(t), i },
            debounce: function(t, e, i) {
                var n;
                return function() {
                    var o = arguments;
                    n && window.clearTimeout(n), n = window.setTimeout(function() { n = null, t.apply(i, o) }, e || 0)
                }
            },
            convertColorToRGB: function(t) { var e = document.createElement("div"); try { return e.style.setProperty("color", t), e.style.color } catch (t) { return "" } },
            isValidCSSColor: function(t) { return "" !== this.convertColorToRGB(t) },
            updateLabel: function(t, e) { t.setAttribute("title", e), t.setAttribute("aria-label", e) },
            easeInOut: function(t) { var e = Math.pow(t, 2); return e / (e + Math.pow(1 - t, 2)) }
        }
    }, { "@maps/class-list": 57, "@maps/device-pixel-ratio": 61, "@maps/gesture-recognizers": 72 }],
    226: [function(t, e, i) { e.exports = { "Annotation.Clustering.AccessibilityLabel": "{{n}} locations, {{title}}, {{subtitle}}", "Annotation.Clustering.More": "+{{n}} more", "Annotation.Clustering.More.Plural": "+{{n}} more", "Annotation.Clustering.NoTitle.AccessibilityLabel": "{{n}} locations, {{subtitle}}", "Annotation.Generic.AccessibilityLabel": "{{title}}, {{subtitle}}", "Annotation.Pin.AccessibilityLabel": "Pin", "Annotation.Pin.Green.AccessibilityLabel": "Green Pin", "Annotation.Pin.Purple.AccessibilityLabel": "Purple Pin", "Annotation.Pin.Red.AccessibilityLabel": "Red Pin", "Compass.NorthIndicator": "N", "Compass.Tooltip": "Rotate the map", "Legal.Attribution.HTML.Label": "Data from {{logo}}, others {{chevron}}", "Legal.Attribution.Plain.Label": "Data from {{attribution}}", "Legal.Label": "Legal", "Legal.Menu.Close.Label": "Close", "Legal.Privacy.Label": "Privacy", "Legal.Privacy.URL": "https://www.apple.com/privacy/", "Legal.TermsOfUse.Label": "Terms of Use", "Legal.TermsOfUse.URL": "http://www.apple.com/legal/internet-services/maps/terms-en.html", "Location.Error.Instructions": "To allow this page to show your current location, connect to Wi-Fi and enable location services in your browser.", "Location.Error.Message": "Your location can only be shown when location services are enabled and you are connected to the Internet.", "Location.Error.Support.HTML": "For more information, visit {{link}}.", "Location.Error.Support.Label": "Learn more", "Location.Error.Support.URL": "https://support.apple.com/en-us/HT204690", "Location.Error.Title": "Your current location cannot be shown.", "Location.Subtitle": "Unknown Address", "Location.Title": "Current Location", "Logo.Apple.Tooltip": "Apple", "Logo.AutoNavi.Tooltip": "AutoNavi", "MapType.Tooltip": "Change the map type", "Mode.Hybrid": "Hybrid", "Mode.Satellite": "Satellite", "Mode.Standard": "Standard", "Scale.Feet.Short": "ft", "Scale.Kilometer.Short": "km", "Scale.Meter.Short": "m", "Scale.Mile.Short": "mi", "Track.User.Location.Tooltip": "Show your current location", "Zoom.In.Tooltip": "Zoom In", "Zoom.Out.Tooltip": "Zoom Out" } }, {}],
    227: [function(t, e, i) { e.exports = { "en-AU": "en-GB", "en-IE": "en-GB", "en-IN": "en-GB", "en-NZ": "en-GB", "en-SG": "en-GB", "en-ZA": "en-GB", "es-LA": "es-MX", "es-XL": "es-MX", "nn-NO": "nb-NO", "no-NO": "nb-NO", "zh-HK": "zh-TW" } }, {}],
    228: [function(t, e, i) { e.exports = ["en-US", "fr-FR", "pt-BR", "zh-CN"] }, {}],
    229: [function(t, e, i) { e.exports = { zh: { CN: "Hans", HK: "Hant", TW: "Hant" } } }, {}],
    230: [function(t, e, i) { e.exports = ["ar-SA", "iw-IL"] }, {}],
    231: [function(t, e, i) { e.exports = ["ar-SA", "ca-ES", "cs-CZ", "da-DK", "de-DE", "el-GR", "en-GB", "en-US", "es-ES", "es-MX", "fi-FI", "fr-CA", "fr-FR", "hi-IN", "hr-HR", "hu-HU", "id-ID", "it-IT", "iw-IL", "ja-JP", "ko-KR", "ms-MY", "nl-NL", "nb-NO", "pl-PL", "pt-BR", "pt-PT", "ro-RO", "ru-RU", "sk-SK", "sv-SE", "th-TH", "tr-TR", "uk-UA", "vi-VN", "zh-CN", "zh-HK", "zh-TW"] }, {}],
    232: [function(t, e, i) { e.exports = ["ar", "ca", "cs", "da", "de", "el", "en", "en-AU", "en-GB", "es", "es-MX", "fi", "fr", "fr-CA", "he", "hi", "hr", "hu", "id", "it", "ja", "ko", "ms", "nb", "nl", "pl", "pt", "pt-PT", "ro", "ru", "sk", "sv", "th", "tr", "uk", "vi", "zh-Hans", "zh-Hant"] }, {}]
}, {}, [219]);