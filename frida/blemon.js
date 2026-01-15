const LOG_DEPRECATED = false
const LOG_AS_TEXT = true
    
if (Java.available) {

    Java.perform(function () {
    var BluetoothGatt = Java.use("android.bluetooth.BluetoothGatt");
    var BluetoothGattCallback = Java.use("android.bluetooth.BluetoothGattCallback")
       // Hook BluetoothDevice.connectGatt overloads to capture callbacks passed as args

    console.log("[*] Script loaded — waiting for BluetoothGattCallback instances or connectGatt calls.");

        //https://developer.android.com/reference/android/bluetooth/BluetoothGatt#writeCharacteristic(android.bluetooth.BluetoothGattCharacteristic)
        //deprecated
        try {
            BluetoothGatt.writeCharacteristic
                .overload('android.bluetooth.BluetoothGattCharacteristic')
                .implementation = function (characteristic) {
                    var uuid = characteristic.getUuid();
                    var data = bytesToUtf8(characteristic.getValue());
                    if(LOG_DEPRECATED) {
                        console.log(Color.Green + "[BLE Write (deprecated) =>]" + " UUID: " + uuid.toString() + Color.Reset + " data: 0x " + data);
                    }
                    return this.writeCharacteristic(characteristic);
                };
        } catch (error) {
            // Code that runs if an error happens
            console.error("Unable to implement writeCharacteristic with characteristic:", error.message);
        }

        //https://developer.android.com/reference/android/bluetooth/BluetoothGatt#writeCharacteristic(android.bluetooth.BluetoothGattCharacteristic,%20byte[],%20int)
        try {
            BluetoothGatt.writeCharacteristic
                .overload('android.bluetooth.BluetoothGattCharacteristic', '[B', 'int')
                .implementation = function (characteristic, value, writeType) {
                    var uuid = characteristic.getUuid();
                    var data = bytesToUtf8(value);
                    console.log(Color.Green + "[BLE Write =>]" + " UUID: " + uuid.toString() + Color.Reset + " data: 0x " + data + " | writeType : " + writeType);
                    return this.writeCharacteristic(characteristic, value, writeType);
                };
        } catch (error) {
            // Code that runs if an error happens
            console.error("Unable to implement writeCharacteristic with characteristic, value, writeType:", error.message);
        }

        // https://developer.android.com/reference/android/bluetooth/BluetoothGattCallback#onCharacteristicRead(android.bluetooth.BluetoothGatt,%20android.bluetooth.BluetoothGattCharacteristic,%20byte[],%20int)
        try {
            BluetoothGattCallback.onCharacteristicRead
            .overload('android.bluetooth.BluetoothGatt', 'android.bluetooth.BluetoothGattCharacteristic', '[B', 'int')
            .implementation = function (gatt, characteristic, value, status) {
                var uuid = characteristic.getUuid();
                var data = bytesToUtf8(value);
                console.log(Color.Blue + "[BLE Read <=]" + " UUID: " + uuid.toString() + Color.Reset + " data: 0x " + data); 
                return this.onCharacteristicRead(gatt, characteristic, value, status);
            };
        } catch (error) {
            // Code that runs if an error happens
            console.error("Unable to implement onCharacteristicRead with gatt, characteristic, value, status:", error.message);
        }

        // https://developer.android.com/reference/android/bluetooth/BluetoothGattCallback#onCharacteristicRead(android.bluetooth.BluetoothGatt,%20android.bluetooth.BluetoothGattCharacteristic,%20int)
        //deprecated
        try {
            BluetoothGattCallback.onCharacteristicRead
                .overload('android.bluetooth.BluetoothGatt', 'android.bluetooth.BluetoothGattCharacteristic', 'int')
                .implementation = function (gatt, characteristic, status) {
                    var uuid = characteristic.getUuid();
                    var data = bytesToUtf8(characteristic.getValue());
                    if(LOG_DEPRECATED) {
                        console.log(Color.Blue + "[BLE Read (deprecated) <=]" + " UUID: " + uuid.toString() + Color.Reset + " data: 0x " + data);
                    }
                    return this.onCharacteristicRead(gatt, characteristic, status);
                };
        } catch (error) {
            // Code that runs if an error happens
            console.error("Unable to implement onCharacteristicRead with gatt, characteristic, status:", error.message);
        }

        //https://developer.android.com/reference/android/bluetooth/BluetoothGattCallback#onCharacteristicChanged(android.bluetooth.BluetoothGatt,%20android.bluetooth.BluetoothGattCharacteristic)
        //deprecated
        try {
            BluetoothGattCallback.onCharacteristicChanged
                .overload('android.bluetooth.BluetoothGatt', 'android.bluetooth.BluetoothGattCharacteristic')
                .implementation = function (gatt, characteristic) {
                    var uuid = characteristic.getUuid();
                    var data = bytesToUtf8(characteristic.getValue());
                    if(LOG_DEPRECATED) {
                        console.log(Color.Cyan + "[BLE Notify (deprecated) <=]" + " UUID: " + uuid.toString() + Color.Reset + " data: 0x" + data + Color.Light.Blue);
                    }
                    return this.onCharacteristicChanged(gatt, characteristic);
                };
        } catch (error) {
            // Code that runs if an error happens
            console.error("Unable to implement writeCharacteristic with characteristic:", error.message);
        }
        
        //https://developer.android.com/reference/android/bluetooth/BluetoothGattCallback#onCharacteristicChanged(android.bluetooth.BluetoothGatt,%20android.bluetooth.BluetoothGattCharacteristic,%20byte[])
        try {
            BluetoothGattCallback.onCharacteristicChanged
                .overload('android.bluetooth.BluetoothGatt', 'android.bluetooth.BluetoothGattCharacteristic', '[B')
                .implementation = function (gatt, characteristic, value) {
                    var uuid = characteristic.getUuid();
                    var data = bytesToUtf8(value);
                    console.log(Color.Cyan + "[BLE Notify <=]" + " UUID: " + uuid.toString() + Color.Reset + " data: 0x" + data + Color.Light.Blue);
                    return this.onCharacteristicChanged(gatt, characteristic, value);
                };
        } catch (error) {
            // Code that runs if an error happens
            console.error("Unable to implement writeCharacteristic with characteristic:", error.message);
        }
    }); // end perform
}

var Color = {
    Reset: "\x1b[39;49;00m",
    Black: "\x1b[30;01m", Blue: "\x1b[34;01m", Cyan: "\x1b[36;01m", Gray: "\x1b[37;11m",
    Green: "\x1b[32;01m", Purple: "\x1b[35;01m", Red: "\x1b[31;01m", Yellow: "\x1b[33;01m",
    Light: {
        Black: "\x1b[30;11m", Blue: "\x1b[34;11m", Cyan: "\x1b[36;11m", Gray: "\x1b[37;01m",
        Green: "\x1b[32;11m", Purple: "\x1b[35;11m", Red: "\x1b[31;11m", Yellow: "\x1b[33;11m"
    }
};

function convertOutput(bytes) {
    if(LOG_AS_TEXT) {
        return bytes2utf8Partial(bytes)
    } else {
        return bytes2hex(input);
    }
}

// thanks: https://awakened1712.github.io/hacking/hacking-frida/

function bytes2utf8Partial(bytes) {
    if (!bytes || bytes.length === 0) return "";

    const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    let result = "";
    let i = 0;

    while (i < u8.length) {
        let byte = u8[i];

        // ASCII (single-byte UTF-8)
        if (byte <= 0x7F) {
            result += String.fromCharCode(byte);
            i++;
            continue;
        }

        // Determine UTF-8 sequence length
        let len =
            byte >= 0xC2 && byte <= 0xDF ? 2 :
            byte >= 0xE0 && byte <= 0xEF ? 3 :
            byte >= 0xF0 && byte <= 0xF4 ? 4 :
            0;

        if (len === 0 || i + len > u8.length) {
            // Invalid start byte
            result += byte.toString(16).padStart(2, "0");
            i++;
            continue;
        }

        // Validate continuation bytes
        let valid = true;
        for (let j = 1; j < len; j++) {
            if ((u8[i + j] & 0xC0) !== 0x80) {
                valid = false;
                break;
            }
        }

        if (!valid) {
            result += byte.toString(16).padStart(2, "0");
            i++;
            continue;
        }

        // Decode valid UTF-8 sequence
        try {
            const slice = u8.slice(i, i + len);
            const char = new TextDecoder("utf-8", { fatal: true }).decode(slice);
            result += char;
            i += len;
        } catch {
            result += byte.toString(16).padStart(2, "0");
            i++;
        }
    }

    return result;
}

function bytes2hex(bytes) {
    if (!bytes) return "";
    var result = [];
    for (var i = 0; i < bytes.length; i++) {
        var byte = (bytes[i] & 0xFF).toString(16);
        if (byte.length === 1) byte = "0" + byte;
        result.push(byte);
    }
    return result.join(" ");
}
