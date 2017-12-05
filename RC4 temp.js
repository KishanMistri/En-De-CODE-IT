function rc4(key, str) {
        var s = [], j = 0, x, res = '';
        for (var i = 0; i < 256; i++) {
            s[i] = i;
        }
        for (i = 0; i < 256; i++) {
            j = (j + s[i] + key.charCodeAt(i % key.length)) % 256;
            x = s[i];
            s[i] = s[j];
            s[j] = x;                
        }
        i = 0;
        j = 0;
        for (var y = 0; y < str.length; y++) {
            i = (i + 1) % 256;
            j = (j + s[i]) % 256;
            x = s[i];
            s[i] = s[j];
            s[j] = x;

            //res += String.fromCharCode(str.charCodeAt(y) ^ s[(s[i] + s[j]) % 256]);

            var sx = s[i] + s[j];
            var ssx =  s[sx % 256];
            var fromChar1 =str.charCodeAt(y);
            var fromChar2 = (fromChar1 ^ ssx);
            var fromChar3 = String.fromCharCode(fromChar2);  //******  PROBLEM LINE *******
            //var fromChar3 = fixedFromCharCode(fromChar2);                
            res += fromChar3;
        }
        return res;
    }

    //Fix as per Microsoft
    //https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/fromCharCode
     function fixedFromCharCode(codePt) {
        if (codePt > 0xFFFF) {
            codePt -= 0x10000;
            return String.fromCharCode(0xD800 + (codePt >> 10), 0xDC00 + (codePt & 0x3FF));
        }
        else {
            return String.fromCharCode(codePt);
        }
    }