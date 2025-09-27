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
                    var data = bytes2hex(characteristic.getValue());
                    console.log(Color.Green + "[BLE Write (deprecated) =>]" + " UUID: " + uuid.toString() + Color.Reset + " data: 0x " + data);
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
                    var data = bytes2hex(value);
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
                var data = bytes2hex(value);
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
                    var data = bytes2hex(characteristic.getValue());
                    console.log(Color.Blue + "[BLE Read (deprecated) <=]" + " UUID: " + uuid.toString() + Color.Reset + " data: 0x " + data);
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
                    var data = bytes2hex(characteristic.getValue());
                    console.log(Color.Cyan + "[BLE Notify (deprecated) <=]" + " UUID: " + uuid.toString() + Color.Reset + " data: 0x" + data + Color.Light.Blue);
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
                    var data = bytes2hex(value);
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

// Pure-JS UTF-8 decoder (works in Frida)
function bytesToUtf8(input) {
  if (!input) return "";

  // normalize to Uint8Array
  var bytes;
  if (input instanceof ArrayBuffer) {
    bytes = new Uint8Array(input);
  } else if (input instanceof Uint8Array) {
    bytes = input;
  } else if (Array.isArray(input)) {
    bytes = new Uint8Array(input);
  } else {
    // try to treat as Array-like
    bytes = new Uint8Array(input);
  }

  var out = "";
  var i = 0;

  function cpToStr(cp) {
    if (cp <= 0xFFFF) return String.fromCharCode(cp);
    // produce surrogate pair
    cp -= 0x10000;
    return String.fromCharCode((cp >> 10) + 0xD800, (cp & 0x3FF) + 0xDC00);
  }

  while (i < bytes.length) {
    var b1 = bytes[i];

    if (b1 < 0x80) {
      // 1-byte (ASCII)
      out += String.fromCharCode(b1);
      i++;
    } else if ((b1 & 0xE0) === 0xC0) {
      // 2-byte
      if (i + 1 >= bytes.length) break; // truncated
      var b2 = bytes[i + 1];
      var cp = ((b1 & 0x1F) << 6) | (b2 & 0x3F);
      out += cpToStr(cp);
      i += 2;
    } else if ((b1 & 0xF0) === 0xE0) {
      // 3-byte
      if (i + 2 >= bytes.length) break; // truncated
      var b2 = bytes[i + 1], b3 = bytes[i + 2];
      var cp = ((b1 & 0x0F) << 12) | ((b2 & 0x3F) << 6) | (b3 & 0x3F);
      out += cpToStr(cp);
      i += 3;
    } else if ((b1 & 0xF8) === 0xF0) {
      // 4-byte
      if (i + 3 >= bytes.length) break; // truncated
      var b2 = bytes[i + 1], b3 = bytes[i + 2], b4 = bytes[i + 3];
      var cp = ((b1 & 0x07) << 18) |
               ((b2 & 0x3F) << 12) |
               ((b3 & 0x3F) << 6) |
               (b4 & 0x3F);
      out += cpToStr(cp);
      i += 4;
    } else {
      // invalid leading byte — skip
      i++;
    }
  }

  return out;
}
