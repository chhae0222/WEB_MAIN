/**
 * AES-256-CBC 알고리즘을 사용하여 데이터를 암호화합니다.
 * @param {string} key - 암호화에 사용할 키 (32바이트여야 함)
 * @param {string} data - 암호화할 평문 데이터
 * @returns {string} Base64 형식의 암호화된 문자열
 */
function encodeByAES256(key, data){
    const cipher = CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(""), // IV(초기화 벡터)를 빈 값으로 설정 (보안 취약)
        padding: CryptoJS.pad.Pkcs7, // PKCS7 패딩 방식 사용
        mode: CryptoJS.mode.CBC // CBC 모드 사용
    });
    return cipher.toString();
}

/**
 * AES-256-CBC 알고리즘으로 암호화된 데이터를 복호화합니다.
 * @param {string} key - 복호화에 사용할 키 (암호화 시 사용한 키와 동일해야 함)
 * @param {string} data - Base64 형식의 암호화된 문자열
 * @returns {string} 복호화된 평문 데이터
 */
function decodeByAES256(key, data){
    const cipher = CryptoJS.AES.decrypt(data, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(""), // IV는 암호화 시 사용한 값과 동일해야 함
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
    });
    // 복호화된 결과가 없을 경우를 대비하여 빈 문자열 반환 (오류 방지)
    try {
        return cipher.toString(CryptoJS.enc.Utf8); // UTF-8로 디코딩
    } catch (e) {
        console.error("복호화 실패:", e);
        return ""; // 복호화 실패 시 빈 문자열 반환
    }
}

/**
 * 클라이언트 측에서 패스워드를 암호화하는 래퍼 함수
 * @param {string} password - 사용자 입력 패스워드
 * @returns {string} 암호화된 문자열
 * @warning 키가 "key"로 고정되어 있어 보안 취약 (운영 환경에서는 랜덤 키 사용 필수)
 */
export function encrypt_text(password){
    const k = "key"; // 고정된 키 (보안 위험)
    const rk = k.padEnd(32, " "); // AES-256 키 길이(32바이트) 맞추기
    const eb = encodeByAES256(rk, password); // 실제 암호화 수행
    return eb;
}

/**
 * 클라이언트 측에서 암호화된 데이터를 복호화하는 함수
 * @param {string} encryptedData - 세션에서 가져온 Base64 형식의 암호화된 문자열
 * @returns {string} 복호화된 평문 데이터
 * @warning 키가 "key"로 고정되어 있어 보안 취약 (운영 환경에서는 랜덤 키 사용 필수)
 */
export function decrypt_text(encryptedData){ // 인자를 추가하여 session_get()에 의존하지 않음
    if (!encryptedData) {
        console.warn("복호화할 암호화된 데이터가 없습니다.");
        return "";
    }
    const k = "key"; // 암호화 시 사용한 키와 동일해야 함
    const rk = k.padEnd(32, " ");
    const b = decodeByAES256(rk, encryptedData); // 인자로 받은 데이터 사용
    console.log("복호화된 데이터:", b); // 복호화 결과 출력 (디버깅용)
    return b; // 복호화된 값 반환
}