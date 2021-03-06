// ==UserScript==
// @name         Script Tarea 3 Cifrado
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Tarea 3: Cifrado - Criptografía y Seguridad en Redes
// @author       Sebastián Toro Severino
// @updateURL    https://github.com/SebaSwash/Tarea3Cifrado/blob/main/Javascript%20XXTEA%20Cipher.user.js
// @downloadURL  https://github.com/SebaSwash/Tarea3Cifrado/blob/main/Javascript%20XXTEA%20Cipher.user.js
// @match        https://sebaswash.github.io/Tarea3Cifrado/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var XXTea = function () {
    var delta = 0x9E3779B9;
    var mx = function (sum, y, z, p, e, k) {
        return ((z >>> 5 ^ y << 2) + (y >>> 3 ^ z << 4)) ^ ((sum ^ y) + (k[p & 3 ^ e] ^ z));
    };

    var fixk = function (k) {
        if (k.length < 16) {
            var key = new Uint8Array(16);
            key.set(k);
            k = key;
        }
        return k;
    };

    return {
        stringToByteArray: function(data){
            var bytes = [];

            for (var i = 0; i < data.length; ++i) {
                bytes.push(data.charCodeAt(i));
            }
            return bytes;
        },
        byteArrayToString: function(data) {
            return String.fromCharCode.apply(String, data)
        },

        toUint8Array: function (v, includeLength) {
            var length = v.length;
            var n = length << 2;
            if (includeLength) {
                var m = v[length - 1];
                n -= 4;
                if ((m < n - 3) || (m > n)) {
                    return null;
                }
                n = m;
            }
            var bytes = new Uint8Array(n);
            for (var i = 0; i < n; ++i) {
                bytes[i] = v[i >>> 2] >>> ((i & 3) << 3);
            }
            return bytes;
        },

        toUint32Array: function (bytes, includeLength) {
            var length = bytes.length;
            var n = length >>> 2;
            if ((length & 3) !== 0) {
                ++n;
            }
            var v;
            if (includeLength) {
                v = new Uint32Array(n + 1);
                v[n] = length;
            }
            else {
                v = new Uint32Array(n);
            }
            for (var i = 0; i < length; ++i) {
                v[i >> 2] |= bytes[i] << ((i & 3) << 3);
            }
            return v;
        },



        encryptUint32Array: function (v, k) {
            var length = v.length;
            var n = length - 1;
            var y, z, sum, e, p, q;
            z = v[n];
            sum = 0;
            for (q = Math.floor(6 + 52 / length) | 0; q > 0; --q) {
                sum += delta;
                e = sum >>> 2 & 3;
                for (p = 0; p < n; ++p) {
                    y = v[p + 1];
                    z = v[p] += mx(sum, y, z, p, e, k);
                }
                y = v[0];
                z = v[n] += mx(sum, y, z, p, e, k);
            }
            return v;
        },

        decryptUint32Array: function (v, k) {
            var length = v.length;
            var n = length - 1;
            var y, z, sum, e, p, q;
            y = v[0];
            q = Math.floor(6 + 52 / length);
            for (sum = q * delta; sum !== 0; sum -= delta) {
                e = sum >>> 2 & 3;
                for (p = n; p > 0; --p) {
                    z = v[p - 1];
                    y = v[p] -= mx(sum, y, z, p, e, k);
                }
                z = v[n];
                y = v[0] -= mx(sum, y, z, p, e, k);
            }
            return v;
        },

        encrypt: function (data, key) {
            if (data === undefined || data === null || data.length === 0) {
                return data;
            }
            return this.toUint8Array(this.encryptUint32Array(this.toUint32Array(data, true), this.toUint32Array(fixk(key), false)), false);
        },

        decrypt: function (data, key) {
            if (data === undefined || data === null || data.length === 0) {
                return data;
            }
            return this.toUint8Array(this.decryptUint32Array(this.toUint32Array(data, false), this.toUint32Array(fixk(key), false)), true);
        },

        toBytes: function (str) {
            var n = str.length;
            if (n === 0) return;
            // A single code unit uses at most 3 bytes.
            // Two code units at most 4.
            var bytes = new Uint8Array(n * 3);
            var length = 0;
            for (var i = 0; i < n; i++) {
                var codeUnit = str.charCodeAt(i);
                if (codeUnit < 0x80) {
                    bytes[length++] = codeUnit;
                }
                else if (codeUnit < 0x800) {
                    bytes[length++] = 0xC0 | (codeUnit >> 6);
                    bytes[length++] = 0x80 | (codeUnit & 0x3F);
                }
                else if (codeUnit < 0xD800 || codeUnit > 0xDfff) {
                    bytes[length++] = 0xE0 | (codeUnit >> 12);
                    bytes[length++] = 0x80 | ((codeUnit >> 6) & 0x3F);
                    bytes[length++] = 0x80 | (codeUnit & 0x3F);
                }
                else {
                    if (i + 1 < length) {
                        var nextCodeUnit = str.codeUnitAt(i + 1);
                        if (codeUnit < 0xDC00 && 0xDC00 <= nextCodeUnit && nextCodeUnit <= 0xDFFF) {
                            var rune = (((codeUnit & 0xDC00) << 10) | (nextCodeUnit & 0x03FF)) + 0x010000;
                            bytes[length++] = 0xF0 | ((rune >> 18) & 0x3F);
                            bytes[length++] = 0x80 | ((rune >> 12) & 0x3F);
                            bytes[length++] = 0x80 | ((rune >> 6) & 0x3F);
                            bytes[length++] = 0x80 | (rune & 0x3F);
                            i++;
                            continue;
                        }
                    }
                    throw new Error('Malformed string');
                }
            }
            return bytes.subarray(0, length);
        },

        toString: function (bytes) {
            var n = bytes.length;
            var charCodes = new Uint16Array(n);
            var i = 0, off = 0;
            for (var len = bytes.length; i < n && off < len; i++) {
                var unit = bytes[off++];
                switch (unit >> 4) {
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                        charCodes[i] = unit;
                        break;
                    case 12:
                    case 13:
                        if (off < len) {
                            charCodes[i] = ((unit & 0x1F) << 6) |
                            (bytes[off++] & 0x3F);
                        }
                        else {
                            throw new Error('Unfinished UTF-8 octet sequence');
                        }
                        break;
                    case 14:
                        if (off + 1 < len) {
                            charCodes[i] = ((unit & 0x0F) << 12) |
                            ((bytes[off++] & 0x3F) << 6) |
                            (bytes[off++] & 0x3F);
                        }
                        else {
                            throw new Error('Unfinished UTF-8 octet sequence');
                        }
                        break;
                    case 15:
                        if (off + 2 < len) {
                            var rune = ((unit & 0x07) << 18) |
                                ((bytes[off++] & 0x3F) << 12) |
                                ((bytes[off++] & 0x3F) << 6) |
                                (bytes[off++] & 0x3F) - 0x10000;
                            if (0 <= rune && rune <= 0xFFFFF) {
                                charCodes[i++] = (((rune >> 10) & 0x03FF) | 0xD800);
                                charCodes[i] = ((rune & 0x03FF) | 0xDC00);
                            }
                            else {
                                throw new Error('Character outside valid Unicode range: 0x' + rune.toString(16));
                            }
                        }
                        else {
                            throw new Error('Unfinished UTF-8 octet sequence');
                        }
                        break;
                    default:
                        throw new Error('Bad UTF-8 encoding 0x' + unit.toString(16));
                }
            }
            if (i < n) {
                charCodes = charCodes.subarray(0, i);
            }
            return String.fromCharCode.apply(String, charCodes);
        }

    }
};

    function base64ToByteArray(base64String) {
        try {
            var sliceSize = 1024;
            var byteCharacters = atob(base64String);
            var bytesLength = byteCharacters.length;
            var slicesCount = Math.ceil(bytesLength / sliceSize);
            var byteArrays = new Array(slicesCount);

            for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
                var begin = sliceIndex * sliceSize;
                var end = Math.min(begin + sliceSize, bytesLength);

                var bytes = new Array(end - begin);
                for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
                    bytes[i] = byteCharacters[offset].charCodeAt(0);
                }
                byteArrays[sliceIndex] = new Uint8Array(bytes);
            }
            return byteArrays;
        } catch (e) {
            console.log("Couldn't convert to byte array: " + e);
            return undefined;
        }
    }

    // Se obtiene de los elementos html el mensaje cifrado y la llave utilizada.
    var msgCifrado = document.getElementsByClassName('XXTEA')[0].id;
    console.log('> Mensaje cifrado en Python: \n'+msgCifrado);

    var keyCifrado = document.getElementById('llaveCifrado').innerHTML; // Key de 16 bytes (128 bits)
    console.log('> Llave utilizada en cifrado de Python: \n'+keyCifrado);

    // Instancia de objeto XXTea.
    var xxtea = XXTea();

    //Decodifica el string en base 64 y lo convierte a un byte array.
    var msgBytes = xxtea.stringToByteArray(atob(msgCifrado));
    console.log('> Byte array de mensaje cifrado de Python: \n'+msgBytes);

    //Se descifra el mensaje
    var decryptedBytes = xxtea.decrypt(msgBytes, xxtea.toBytes(keyCifrado));
    console.log('> Mensaje descifrado con librería JS: \n'+decryptedBytes);

    if(decryptedBytes != null){
        decryptedBytes = xxtea.byteArrayToString(decryptedBytes);
    }

    // Se reemplaza en el elemento html
    document.getElementsByTagName('p')[0].innerHTML = decryptedBytes;

})();
