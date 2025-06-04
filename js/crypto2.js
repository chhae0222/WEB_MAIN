// 문자열 → ArrayBuffer
function str2ab(str) {
    return new TextEncoder().encode(str);
}

// ArrayBuffer → Base64 문자열 (유니코드 안전)
function ab2b64(buf) {
    return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

// Base64 문자열 → ArrayBuffer (유니코드 안전)
function b642ab(b64) {
    try {
        return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    } catch (e) {
        console.error("Base64 디코딩 실패:", e);
        return null;
    }
}

// AES-256-GCM 암호화 함수
async function encodeByAES256(key, data) {
    const keyBuffer = str2ab(key.padEnd(32, ' ')); // 256bit key
    const iv = crypto.getRandomValues(new Uint8Array(12)); // GCM 권장 IV (96bit)

    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        'AES-GCM',
        false,
        ['encrypt']
    );

    const encrypted = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv
        },
        cryptoKey,
        str2ab(data)
    );

    // Base64(IV) + ":" + Base64(Encrypted) 형식으로 반환
    return ab2b64(iv) + ":" + ab2b64(encrypted);
}

// AES-256-GCM 복호화 함수
async function decodeByAES256(key, encryptedData) {
    if (typeof encryptedData !== 'string' || !encryptedData.includes(":")) {
        console.error("암호화된 데이터 형식 오류 또는 undefined:", encryptedData);
        return null;
    }

    const [ivB64, cipherB64] = encryptedData.split(':');
    const iv = b642ab(ivB64);
    const encryptedBytes = b642ab(cipherB64);

    if (!iv || !encryptedBytes) {
        console.error("Base64 파싱 오류");
        return null;
    }

    const keyBuffer = str2ab(key.padEnd(32, ' '));

    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        'AES-GCM',
        false,
        ['decrypt']
    );

    try {
        const decrypted = await crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            cryptoKey,
            encryptedBytes
        );
        return new TextDecoder().decode(decrypted);
    } catch (e) {
        console.error("복호화 실패:", e);
        return null;
    }
}

// 문자열 암호화 (사용자 호출 함수)
async function encrypt_text2(password) {
    const key = "key"; // 클라이언트 키
    const encrypted = await encodeByAES256(key, password);
    console.log("암호화된 값 2:", encrypted);
    return encrypted;
}

// 문자열 복호화 (사용자 호출 함수)
async function decrypt_text2(encryptedData) {
    const key = "key"; // 서버의 키
    const decrypted = await decodeByAES256(key, encryptedData);
    console.log("복호화된 값 2:", decrypted);
    return decrypted;
}