if (Java.available) {
     console.log("Startup");

    Java.perform(function () {
        var BluetoothGatt = Java.use("android.bluetooth.BluetoothGatt");
        var BluetoothGattCallback = Java.use("android.bluetooth.BluetoothGattCallback") //replace this with your custom gatt callback

        //https://developer.android.com/reference/android/bluetooth/BluetoothGatt#writeCharacteristic(android.bluetooth.BluetoothGattCharacteristic)
        //deprecated
        BluetoothGatt.writeCharacteristic
                    .overload('android.bluetooth.BluetoothGattCharacteristic')
                    .implementation = function (characteristic) {
                        var uuid = characteristic.getUuid();
                        var data = bytes2hex(characteristic.getValue());
                        console.log(Color.Green + "[BLE Write =>]" + " UUID: " + uuid.toString() + Color.Reset + " data: 0x " + data);
                        return BluetoothGatt.writeCharacteristic
                            .overload('android.bluetooth.BluetoothGattCharacteristic')
                            .call(this, characteristic)
                };

        //https://developer.android.com/reference/android/bluetooth/BluetoothGatt#writeCharacteristic(android.bluetooth.BluetoothGattCharacteristic,%20byte[],%20int)
        BluetoothGatt.writeCharacteristic
                .overload('android.bluetooth.BluetoothGattCharacteristic', '[B', 'int')
                .implementation = function (characteristic, value, writeType) {
                    var uuid = characteristic.getUuid();
                    var data = bytes2hex(value);
                    console.log(Color.Green + "[BLE Write =>]" + " UUID: " + uuid.toString() + Color.Reset + " data: 0x " + data + " | writeType : " + writeType);
                    return BluetoothGatt.writeCharacteristic
                        .overload('android.bluetooth.BluetoothGattCharacteristic', '[B', 'int')
                        .call(this, characteristic, value, writeType)
            };

        //https://developer.android.com/reference/android/bluetooth/BluetoothGatt#readCharacteristic(android.bluetooth.BluetoothGattCharacteristic)
        BluetoothGatt.readCharacteristic
                .overload('android.bluetooth.BluetoothGattCharacteristic')
                .implementation = function (characteristic) {
                    var result = BluetoothGatt.readCharacteristic
                        .overload('android.bluetooth.BluetoothGattCharacteristic')
                        .call(this, characteristic)
                    var uuid = characteristic.getUuid();
                    var data = bytes2hex(characteristic.getValue());
                    console.log(Color.Blue + "[BLE Read <=]" + " UUID: " + uuid.toString() + Color.Reset + " data: 0x " + data + " | result: " + result);
                   return result
            };

        // https://developer.android.com/reference/android/bluetooth/BluetoothGattCallback#onCharacteristicRead(android.bluetooth.BluetoothGatt,%20android.bluetooth.BluetoothGattCharacteristic,%20byte[],%20int)
        BluetoothGattCallback.onCharacteristicRead
            .overload('android.bluetooth.BluetoothGatt', 'android.bluetooth.BluetoothGattCharacteristic', '[B', 'int')
            .implementation = function (gatt, characteristic, value, status) {
                var uuid = characteristic.getUuid();
                var data = bytes2hex(value);
                console.log(Color.Blue + "[BLE Read <=]" + " UUID: " + uuid.toString() + Color.Reset + " data: 0x " + data + " | status: " + status);

                return this.onCharacteristicRead(gatt, characteristic, value, status);
            };

        // https://developer.android.com/reference/android/bluetooth/BluetoothGattCallback#onCharacteristicRead(android.bluetooth.BluetoothGatt,%20android.bluetooth.BluetoothGattCharacteristic,%20int)
        //deprecated
        BluetoothGattCallback.onCharacteristicRead
            .overload('android.bluetooth.BluetoothGatt', 'android.bluetooth.BluetoothGattCharacteristic', 'int')
            .implementation = function (gatt, characteristic, status) {
            var uuid = characteristic.getUuid();
            var data = bytes2hex(characteristic.getValue());
                console.log(Color.Blue + "[BLE Read <=]" + " UUID: " + uuid.toString() + Color.Reset + " data: 0x " + data + " | status: " + status);

            return this.onCharacteristicChanged(gatt, characteristic, status);
        };
            BTGattCB.onCharacteristicChanged
                .overload('android.bluetooth.BluetoothGatt', 'android.bluetooth.BluetoothGattCharacteristic')
                .implementation = function (g, c) {
                    console.log(Color.Cyan + "[BLE Notify   <=]");
                    var uuid = c.getUuid();
                    var data = bytes2hex(c.getValue());
                    console.log(Color.Cyan + "[BLE Notify <=]" + Color.Light.Black + " UUID: " + uuid.toString() + Color.Reset + " data: 0x" + data + Color.Light.Blue);
                    return this.onCharacteristicChanged.call(g, c);
            };
            BTGattCB.onCharacteristicChanged
                .overload('android.bluetooth.BluetoothGatt', 'android.bluetooth.BluetoothGattCharacteristic', '[B')
                .implementation = function (g, c, b) {
                    var uuid = c.getUuid();
                    var data = bytes2hex(b);
                    console.log(Color.Cyan + "[BLE Notify <=]" + " UUID: " + uuid.toString() + Color.Reset + " data: 0x" + data + Color.Light.Blue);
                    return BTGattCB.onCharacteristicChanged.call(this, g, c, b);
                };
    }); // end perform
} else if (ObjC.available) {
    Interceptor.attach(ObjC.classes.CBPeripheral['- writeValue:forCharacteristic:type:'].implementation, {
        onEnter: function (args) {
            var data = new ObjC.Object(args[2]);
            var CBChar = new ObjC.Object(args[3]);
            var dataBytes = Memory.readByteArray(data.bytes(), data.length());
            var b = new Uint8Array(dataBytes);
            var hexData = "";
            for (var i = 0; i < b.length; i++) {
                hexData += pad(b[i].toString(16), 2);
            }
            console.log(Color.Green + "[BLE Write  =>]" + Color.Light.Black + " UUID: " + CBChar.$ivars['_UUID'] + Color.Reset + " data: 0x" + hexData);
        }
    }); //end Interceptor
    Interceptor.attach(ObjC.classes.CBCharacteristic['- value'].implementation, {
        onEnter: function (args) {
            var CBChar = new ObjC.Object(args[0]);
            // turns <12 34> into 1234
            var data = CBChar.$ivars['_value']
            if (data != null) {
                data = data.toString().replace(/ /g, '').slice(1, -1)
            }
            if (CBChar.$ivars['_isNotifying'] === true) {
                console.log(Color.Cyan + "[BLE Notify <=]" + Color.Light.Black + " UUID: " + CBChar.$ivars['_UUID'] + Color.Reset + " data: 0x" + data);
            }
            else {
                console.log(Color.Blue + "[BLE Read   <=]" + Color.Light.Black + " UUID: " + CBChar.$ivars['_UUID'] + Color.Reset + " data: 0x" + data);
            }
        }
    }); //end Interceptor 
};
var Color = {
    Reset: "\x1b[39;49;00m",
    Black: "\x1b[30;01m", Blue: "\x1b[34;01m", Cyan: "\x1b[36;01m", Gray: "\x1b[37;11m",
    Green: "\x1b[32;01m", Purple: "\x1b[35;01m", Red: "\x1b[31;01m", Yellow: "\x1b[33;01m",
    Light: {
        Black: "\x1b[30;11m", Blue: "\x1b[34;11m", Cyan: "\x1b[36;11m", Gray: "\x1b[37;01m",
        Green: "\x1b[32;11m", Purple: "\x1b[35;11m", Red: "\x1b[31;11m", Yellow: "\x1b[33;11m"
    }
};
// thanks: https://awakened1712.github.io/hacking/hacking-frida/
function bytes2hex(bytes) {
        if (!bytes) return "";
        var result = [];
        for (var i = 0; i < bytes.length; i++) {
            var byte = (bytes[i] & 0xFF).toString(16);
            if (byte.length === 1) byte = "0" + byte;
            result.push(byte);
        }
        return result.join(" "); // whitespace between bytes
    }
function pad(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}
