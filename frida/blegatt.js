// print_gatt_impls2.js
Java.perform(function () {
    var TARGET = "android.bluetooth.BluetoothGattCallback";
    var seen = {}; // dedupe set

    function report(name, reason) {
        if (!name) return;
        if (!seen[name]) {
            seen[name] = true;
            console.log("[GATT_IMPL] " + name + (reason ? "  (" + reason + ")" : ""));
        }
    }

    // safe helper: given an instance, walk its class chain to see if it extends TARGET
    function instanceExtendsTarget(inst) {
        try {
            if (!inst || typeof inst.getClass !== "function") return false;
            var cls = inst.getClass();
            while (cls) {
                try {
                    var s = cls.getSuperclass();
                    if (!s) break;
                    var sname = s.getName();
                    if (sname === TARGET) return true;
                    cls = s;
                } catch (e) {
                    break;
                }
            }
        } catch (e) {}
        return false;
    }

    // Hook BluetoothGattCallback constructors to catch subclass instantiations
    try {
        var Super = Java.use(TARGET);

        if (Super.$init && Super.$init.overloads && Super.$init.overloads.length) {
            Super.$init.overloads.forEach(function (ctor) {
                try {
                    ctor.implementation = function () {
                        try {
                            var cname = this.getClass().getName();
                            report(cname, "ctor");
                        } catch (e) {}
                        return ctor.apply(this, arguments);
                    };
                } catch (e) {
                    // ignore per-overload errors
                }
            });
        } else if (Super.$init) {
            try {
                Super.$init.implementation = function () {
                    try {
                        report(this.getClass().getName(), "ctor");
                    } catch (e) {}
                    return this.$init.apply(this, arguments);
                };
            } catch (e) {}
        }
        console.log("[*] Hooked " + TARGET + " constructor(s)");
    } catch (e) {
        console.log("[!] Could not hook " + TARGET + " constructors: " + e);
    }

    // Hook BluetoothDevice.connectGatt overloads to capture callback instances passed as args
    try {
        var Device = Java.use("android.bluetooth.BluetoothDevice");
        if (Device.connectGatt && Device.connectGatt.overloads && Device.connectGatt.overloads.length) {
            Device.connectGatt.overloads.forEach(function (ov, idx) {
                try {
                    ov.implementation = function () {
                        try {
                            for (var i = 0; i < arguments.length; i++) {
                                try {
                                    var a = arguments[i];
                                    if (a && typeof a.getClass === "function") {
                                        // prefer detecting via superclass chain
                                        if (instanceExtendsTarget(a)) {
                                            report(a.getClass().getName(), "connectGatt arg@" + i);
                                        } else {
                                            // fallback: if its class name string contains "GattCallback" report it (best-effort)
                                            try {
                                                var maybe = a.getClass().getName();
                                                if (maybe && /GattCallback/.test(maybe) && maybe !== TARGET) {
                                                    report(maybe, "connectGatt arg heuristics@" + i);
                                                }
                                            } catch (e) {}
                                        }
                                    }
                                } catch (e) {}
                            }
                        } catch (e) {}
                        return ov.apply(this, arguments);
                    };
                    console.log("[*] Hooked connectGatt overload #" + idx);
                } catch (e) {
                    // per-overload ignore
                }
            });
        } else {
            console.log("[*] connectGatt not found or has no overloads");
        }
    } catch (e) {
        console.log("[!] Could not hook BluetoothDevice.connectGatt: " + e);
    }

    // NEW: Hook ClassLoader.loadClass(...) to detect classes that extend the target as they are loaded.
    // This avoids enumerateLoadedClasses and catches classes even if they were loaded before our script attached,
    // as long as they are loaded after the script runs. We hook both common overloads.
    try {
        var CL = Java.use("java.lang.ClassLoader");

        // loadClass(String)
        try {
            CL.loadClass.overload('java.lang.String').implementation = function (name) {
                var cls = this.loadClass.overload('java.lang.String').apply(this, arguments);
                try {
                    if (cls) {
                        var sup = cls.getSuperclass();
                        if (sup && sup.getName && sup.getName() === TARGET) {
                            report(cls.getName(), "loaded (loadClass(String))");
                        }
                    }
                } catch (e) {}
                return cls;
            };
            console.log("[*] Hooked ClassLoader.loadClass(String)");
        } catch (e) {
            // ignore if not present
        }

        // loadClass(String, boolean)
        try {
            CL.loadClass.overload('java.lang.String', 'boolean').implementation = function (name, resolve) {
                var cls = this.loadClass.overload('java.lang.String', 'boolean').apply(this, arguments);
                try {
                    if (cls) {
                        var sup = cls.getSuperclass();
                        if (sup && sup.getName && sup.getName() === TARGET) {
                            report(cls.getName(), "loaded (loadClass(String,boolean))");
                        }
                    }
                } catch (e) {}
                return cls;
            };
            console.log("[*] Hooked ClassLoader.loadClass(String,boolean)");
        } catch (e) {
            // ignore if not present
        }
    } catch (e) {
        console.log("[!] Could not hook ClassLoader.loadClass: " + e);
    }

    // Extra fallback: if user discovers a name and wants to report manually, use rpc.exports
    rpc.exports = {
        reportgattimpl: function (className) {
            Java.perform(function () { report(className, "manual"); });
        }
    };

    console.log("[*] Script loaded — waiting for classes to be instantiated, passed to connectGatt, or loaded.");
});
