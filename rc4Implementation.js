var dg = ''

function makeArray(n) {
	for (var i = 1; i <= n; i++) {
		this[i] = 0
	}
	return this
}

function rc4(key, text) {
	var i, x, y, t, x2;
	status("rc4")
	s = makeArray(0);

	for (i = 0; i < 256; i++) {
		s[i] = i
	}
	y = 0
	for (x = 0; x < 256; x++) {
		y = (key.charCodeAt(x % key.length) + s[x] + y) % 256
		t = s[x];
		s[x] = s[y];
		s[y] = t
	}
	x = 0;
	y = 0;
	var z = ""
	for (x = 0; x < text.length; x++) {
		x2 = x % 256
		y = (s[x2] + y) % 256
		t = s[x2];
		s[x2] = s[y];
		s[y] = t
		z += String.fromCharCode((text.charCodeAt(x) ^ s[(s[x2] + s[y]) % 256]))
	}
	return z
}

function badd(a, b) { // binary add
	var r = ''
	var c = 0
	while (a || b) {
		c = chop(a) + chop(b) + c
		a = a.slice(0, -1);
		b = b.slice(0, -1)
		if (c & 1) {
			r = "1" + r
		} else {
			r = "0" + r
		}
		c >>= 1
	}
	if (c) {
		r = "1" + r
	}
	return r
}

function chop(a) {
	if (a.length) {
		return parseInt(a.charAt(a.length - 1))
	} else {
		return 0
	}
}

function bsub(a, b) { // binary subtract
	var r = ''
	var c = 0
	while (a) {
		c = chop(a) - chop(b) - c
		a = a.slice(0, -1);
		b = b.slice(0, -1)
		if (c == 0) {
			r = "0" + r
		}
		if (c == 1) {
			r = "1" + r
			c = 0
		}
		if (c == -1) {
			r = "1" + r
			c = 1
		}
		if (c == -2) {
			r = "0" + r
			c = 1
		}
	}
	if (b || c) {
		return ''
	}
	return bnorm(r)
}

function bnorm(r) { // trim off leading 0s
	var i = r.indexOf('1')
	if (i == -1) {
		return '0'
	} else {
		return r.substr(i)
	}
}

function bmul(a, b) { // binary multiply
	var r = '';
	var p = ''
	while (a) {
		if (chop(a) == '1') {
			r = badd(r, b + p)
		}
		a = a.slice(0, -1)
		p += '0'
	}
	return r;
}

function bmod(a, m) { // binary modulo
	return bdiv(a, m).mod
}

function bdiv(a, m) { // binary divide & modulo
	// this.q = quotient this.mod=remainder
	var lm = m.length,
		al = a.length
	var p = '',
		d
	this.q = ''
	for (n = 0; n < al; n++) {
		p = p + a.charAt(n);
		if (p.length < lm || (d = bsub(p, m)) == '') {
			this.q += '0'
		} else {
			if (this.q.charAt(0) == '0') {
				this.q = '1'
			} else {
				this.q += "1"
			}
			p = d
		}
	}
	this.mod = bnorm(p)
	return this
}

function bmodexp(x, y, m) { // binary modular exponentiation
	var r = '1'
	status("bmodexp " + x + " " + y + " " + m)

	while (y) {
		if (chop(y) == 1) {
			r = bmod(bmul(r, x), m)
		}
		y = y.slice(0, y.length - 1)
		x = bmod(bmul(x, x), m)
	}
	return bnorm(r)
}

function modexp(x, y, m) { // modular exponentiation
	// convert packed bits (text) into strings of 0s and 1s
	return b2t(bmodexp(t2b(x), t2b(y), t2b(m)))
}

function i2b(i) { // convert integer to binary
	var r = ''
	while (i) {
		if (i & 1) {
			r = "1" + r
		} else {
			r = "0" + r
		}
		i >>= 1;
	}
	return r ? r : '0'
}

function t2b(s) {
	var r = ''
	if (s == '') {
		return '0'
	}
	while (s.length) {
		var i = s.charCodeAt(0)
		s = s.substr(1)
		for (n = 0; n < 8; n++) {
			r = ((i & 1) ? '1' : '0') + r
			i >>= 1;
		}
	}
	return bnorm(r)
}

function b2t(b) {
	var r = '';
	var v = 0;
	var m = 1
	while (b.length) {
		v |= chop(b) * m
		b = b.slice(0, -1)
		m <<= 1
		if (m == 256 || b == '') {
			r += String.fromCharCode(v)
			v = 0;
			m = 1
		}
	}
	return r
}
b64s = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_"'

function textToBase64(t) {
	status("t 2 b64")
	var r = '';
	var m = 0;
	var a = 0;
	var tl = t.length - 1;
	var c
	for (n = 0; n <= tl; n++) {
		c = t.charCodeAt(n)
		r += b64s.charAt((c << m | a) & 63)
		a = c >> (6 - m)
		m += 2
		if (m == 6 || n == tl) {
			r += b64s.charAt(a)
			if ((n % 45) == 44) {
				r += "\n"
			}
			m = 0
			a = 0
		}
	}
	return r
}

function base64ToText(t) {
	status("b64 2 t")
	var r = '';
	var m = 0;
	var a = 0;
	var c
	for (n = 0; n < t.length; n++) {
		c = b64s.indexOf(t.charAt(n))
		if (c >= 0) {
			if (m) {
				r += String.fromCharCode((c << (8 - m)) & 255 | a)
			}
			a = c >> m
			m += 2
			if (m == 8) {
				m = 0
			}
		}
	}
	return r
}

function rand(n) {
	return Math.floor(Math.random() * n)
}

function rstring(s, l) {
	var r = ""
	var sl = s.length
	while (l-- > 0) {
		r += s.charAt(rand(sl))
	}
	//status("rstring "+r)
	return r
}

function key2(k) {
	var l = k.length
	var kl = l
	var r = ''
	while (l--) {
		r += k.charAt((l * 3) % kl)
	}
	return r
}

function rsaEncrypt(keylen, key, mod, text) {
	// I read that rc4 with keys larger than 256 bytes doesn't significantly
	// increase the level of rc4 encryption because it's sbuffer is 256 bytes
	// makes sense to me, but what do i know...

	status("encrypt")
	if (text.length >= keylen) {
		var sessionkey = rc4(rstring(text, keylen), rstring(text, keylen))

		// session key must be less than mod, so mod it
		sessionkey = b2t(bmod(t2b(sessionkey), t2b(mod)))
		alert("sessionkey=" + sessionkey)

		// return the rsa encoded key and the encrypted text
		// i'm double encrypting because it would seem to me to
		// lessen known-plaintext attacks, but what do i know
		return modexp(sessionkey, key, mod) +
			rc4(key2(sessionkey), rc4(sessionkey, text))
	} else {

		// don't need a session key
		return modexp(text, key, mod)
	}
}

function rsaDecrypt(keylen, key, mod, text) {
	status("decrypt")
	if (text.length <= keylen) {
		return modexp(text, key, mod)
	} else {

		// sessionkey is first keylen bytes
		var sessionkey = text.substr(0, keylen)
		text = text.substr(keylen)

		// un-rsa the session key
		sessionkey = modexp(sessionkey, key, mod)
		alert("sessionkey=" + sessionkey)

		// double decrypt the text
		return rc4(sessionkey, rc4(key2(sessionkey, text), text))
	}
}

function trim2(d) {
	return d.substr(0, d.lastIndexOf('1') + 1)
}

function bgcd(u, v) { // return greatest common divisor
	// algorythm from http://algo.inria.fr/banderier/Seminar/Vallee/index.html
	var d, t
	while (1) {
		d = bsub(v, u)
		//alert(v+" - "+u+" = "+d)
		if (d == '0') {
			return u
		}
		if (d) {
			if (d.substr(-1) == '0') {
				v = d.substr(0, d.lastIndexOf('1') + 1) // v=(v-u)/2^val2(v-u)
			} else v = d
		} else {
			t = v;
			v = u;
			u = t // swap u and v
		}
	}
}

function isPrime(p) {
	var n, p1, p12, t
	p1 = bsub(p, '1')
	t = p1.length - p1.lastIndexOf('1')
	p12 = trim2(p1)
	for (n = 0; n < 2; n += mrtest(p, p1, p12, t)) {
		if (n < 0) return 0
	}
	return 1
}

function mrtest(p, p1, p12, t) {
	// Miller-Rabin test from forum.swathmore.edu/dr.math/
	var n, a, u
	a = '1' + rstring('01', Math.floor(p.length / 2)) // random a
	//alert("mrtest "+p+", "+p1+", "+a+"-"+p12)
	u = bmodexp(a, p12, p)
	if (u == '1') {
		return 1
	}
	for (n = 0; n < t; n++) {
		u = bmod(bmul(u, u), p)
		//dg+=u+" "
		if (u == '1') return -100
		if (u == p1) return 1
	}
	return -100
}
pfactors = '11100011001110101111000110001101'
// this number is 3*5*7*11*13*17*19*23*29*31*37
function prime(bits) {
	// return a prime number of bits length
	var p = '1' + rstring('001', bits - 2) + '1'
	while (!isPrime(p)) {
		p = badd(p, '10'); // add 2
	}
	alert("p is " + p)
	return p
}

function genkey(bits) {
	q = prime(bits)
	do {
		p = q
		q = prime(bits)
	} while (bgcd(p, q) != '1')
	p1q1 = bmul(bsub(p, '1'), bsub(q, '1'))
	// now we need a d, e,  and an n so that:
	//  p1q1*n-1=de  -> bmod(bsub(bmul(d,e),'1'),p1q1)='0'
	// or more specifically an n so that d & p1q1 are rel prime and factor e
	n = '1' + rstring('001', Math.floor(bits / 3) + 2)
	alert('n is ' + n)
	factorMe = badd(bmul(p1q1, n), '1')
	alert('factor is ' + factorMe)
	//e=bgcd(factorMe,p1q1)
	//alert('bgcd='+e)
	e = '1'
	// is this always 1?
	//r=bdiv(factorMe,e)
	//alert('r='+r.q+" "+r.mod)
	//if(r.mod != '0') {alert('Mod Error!')}
	//factorMe=r.q
	d = bgcd(factorMe, '11100011001110101111000110001101')
	alert('d=' + d)
	if (d == '1' && e == '1') {
		alert('Factoring failed ' + factorMe + ' p=' + p + ' q=' + q)
	}
	e = bmul(e, d)
	r = bdiv(factorMe, d)
	d = r.q
	if (r.mod != '0') {
		alert('Mod Error 2!')
	}

	this.mod = b2t(bmul(p, q))
	this.pub = b2t(e)
	this.priv = b2t(d)
}

function status(a) {} //alert(a)}
