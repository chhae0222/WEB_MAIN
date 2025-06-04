import { session_set, session_get, session_check } from './session.js';
import { encrypt_text, decrypt_text } from './crypto.js'; // 경로 수정
import { generateJWT, checkAuth } from './token.js'; // 경로 수정

// DOMPurify 라이브러리 로드 (CDN 또는 직접 추가 필요)
// <script src="https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.6/purify.min.js"></script>
// 위 스크립트를 HTML <head> 또는 <body> 하단에 추가해야 합니다.

/**
 * XSS 방지 함수 (DOMPurify 사용)
 * @param {string} input - Sanitize할 입력 문자열
 * @returns {string|boolean} Sanitize된 문자열 또는 XSS 공격 감지 시 false
 */
const check_xss = (input) => {
    // DOMPurify가 로드되었는지 확인
    if (typeof window.DOMPurify === 'undefined') {
        console.error('DOMPurify 라이브러리가 로드되지 않았습니다. CDN 또는 npm을 통해 추가해주세요.');
        alert('보안 오류: XSS 방지 라이브러리가 로드되지 않았습니다.');
        return false;
    }

    const DOMPurify = window.DOMPurify;
    const sanitizedInput = DOMPurify.sanitize(input);

    if (sanitizedInput !== input) {
        alert('XSS 공격 가능성이 있는 입력값을 발견했습니다.');
        return false;
    }
    return sanitizedInput;
};

/**
 * 쿠키 설정 함수
 * @param {string} name - 쿠키 이름
 * @param {string} value - 쿠키 값
 * @param {number} expiredays - 쿠키 만료일 (현재 날짜로부터)
 */
function setCookie(name, value, expiredays) {
    var date = new Date();
    date.setDate(date.getDate() + expiredays);
    // SameSite=None; Secure 속성을 추가하여 HTTPS 환경에서만 전송되도록 하고 교차 사이트 요청을 허용
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${date.toUTCString()}; path=/; SameSite=Lax; Secure`;
    // NOTE: 개발 환경이 아닌 실제 배포 환경에서만 SameSite=None; Secure 를 사용하세요.
    // 대부분의 경우 SameSite=Lax 또는 SameSite=Strict가 더 안전합니다.
    // 여기서는 편의상 Lax로 변경합니다. (추후 배포 환경에 따라 None으로 변경 가능)
}

/**
 * 쿠키 가져오기 함수
 * @param {string} name - 가져올 쿠키 이름
 * @returns {string|null} 쿠키 값 또는 null
 */
function getCookie(name) {
    const nameEq = `${name}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEq) === 0) return decodeURIComponent(c.substring(nameEq.length, c.length));
    }
    return null;
}

/**
 * 로그인 폼 및 세션 초기화
 * - 저장된 아이디 쿠키를 불러와 입력 필드에 채움
 * - 세션 유효성 검사 (session_check)
 * - 암호화된 세션 데이터 복호화 (로그인 후 페이지에서 사용될 경우)
 */
async function init() {
    const emailInput = document.getElementById('typeEmailX');
    const idSaveCheck = document.getElementById('idSaveCheck');
    const savedId = getCookie("id");

    if (savedId) {
        emailInput.value = savedId;
        idSaveCheck.checked = true;
    }

    session_check(); // 세션 유효성 검사

    // 로그인 후 페이지에서 암호화된 세션 정보를 복호화해야 할 경우
    // if (sessionStorage && session_get()) { // 세션 스토리지에 데이터가 있을 경우
    //     await decrypt_text(); // session.js에서 가져온 암호화된 텍스트 복호화
    //     // 필요하다면 decrypt_text2()와 같은 추가 복호화 함수도 호출 가능
    // }
}

/**
 * 로그인 폼 입력값 유효성 검사 및 처리
 * - 이메일/비밀번호 길이, 특수문자, 대소문자 포함 여부 검사
 * - XSS 방지 처리
 * - 아이디 저장 (쿠키)
 * - 세션 설정 및 JWT 토큰 생성/저장
 * - 폼 제출
 */
const check_input = async () => {
    const loginForm = document.getElementById('login_form');
    const emailInput = document.getElementById('typeEmailX');
    const passwordInput = document.getElementById('typePasswordX');
    const idSaveCheck = document.getElementById('idSaveCheck'); // 아이디 저장 체크박스

    const emailValue = emailInput.value.trim();
    const passwordValue = passwordInput.value.trim();

    // 1. 입력값 존재 여부 확인
    if (emailValue === '') {
        alert('이메일을 입력하세요.');
        return false;
    }
    if (passwordValue === '') {
        alert('비밀번호를 입력하세요.');
        return false;
    }

    // 2. 이메일/아이디 길이 검증
    if (emailValue.length < 5) {
        alert('아이디는 최소 5글자 이상 입력해야 합니다.');
        return false;
    }

    // 3. 비밀번호 복잡성 검증
    if (passwordValue.length < 12) {
        alert('비밀번호는 반드시 12글자 이상 입력해야 합니다.');
        return false;
    }
    const hasSpecialChar = /[!,@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(passwordValue);
    if (!hasSpecialChar) {
        alert('패스워드는 특수문자를 1개 이상 포함해야 합니다.');
        return false;
    }
    const hasUpperCase = /[A-Z]+/.test(passwordValue);
    const hasLowerCase = /[a-z]+/.test(passwordValue);
    if (!hasUpperCase || !hasLowerCase) {
        alert('패스워드는 대소문자를 1개 이상 포함해야 합니다.');
        return false;
    }

    // 4. XSS 방지 처리
    const sanitizedEmail = check_xss(emailValue);
    const sanitizedPassword = check_xss(passwordValue);

    if (sanitizedEmail === false || sanitizedPassword === false) { // check_xss에서 false가 반환되면 XSS 공격 감지
        return false;
    }
    // console.log('Sanitized Email:', sanitizedEmail); // 디버깅용
    // console.log('Sanitized Password:', sanitizedPassword); // 디버깅용

    // 5. 아이디 저장 (쿠키)
    if (idSaveCheck.checked) {
        setCookie("id", sanitizedEmail, 30); // 30일 저장 (첫 번째 코드의 1일 대신 일반적인 30일로 설정)
    } else {
        setCookie("id", "", 0); // 체크 해제 시 쿠키 삭제
    }

    // 6. 패스워드 암호화 (실제 서버 전송 시 필요)
    // const encryptedPassword = encrypt_text(sanitizedPassword);
    // console.log('암호화된 비밀번호:', encryptedPassword);

    // 7. 세션 설정 및 JWT 토큰 생성
    session_set(sanitizedEmail); // 세션에 이메일 정보 저장 (session.js에 세션 설정 로직이 있을 경우)

    const payload = {
        id: sanitizedEmail, // Sanitize된 이메일 사용
        exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1시간 만료 (3600초)
    };
    const jwtToken = generateJWT(payload); // JWT 토큰 생성 (token.js)
    localStorage.setItem('jwt_token', jwtToken); // 생성된 JWT를 로컬 스토리지에 저장

    // 8. 폼 제출
    alert('로그인 정보를 확인하고 있습니다.'); // 사용자에게 알림
    loginForm.submit(); // 로그인 폼 제출 (서버로 데이터 전송)
};

/**
 * 세션 삭제 함수
 */
function session_del() {
    if (sessionStorage) {
        sessionStorage.removeItem("Session_Storage_test"); // 정확한 세션 키 확인 및 사용 필요
        localStorage.removeItem('jwt_token'); // JWT 토큰도 함께 삭제
        alert('로그아웃 버튼 클릭 확인: 세션 스토리지를 삭제합니다.');
    } else {
        alert("세션 스토리지를 지원하지 않습니다.");
    }
}

/**
 * 로그아웃 함수
 */
function logout() {
    session_del(); // 세션 및 JWT 삭제
    location.href = '../index.html'; // 메인 페이지로 이동
}

// --- 이벤트 리스너 ---
// DOMContentLoaded 이벤트 발생 시 초기화 함수 실행
document.addEventListener('DOMContentLoaded', () => {
    init(); // 초기화 함수 호출

    // 로그인 버튼에 이벤트 바인딩
    const loginBtn = document.getElementById("login_btn");
    if (loginBtn) {
        loginBtn.addEventListener('click', check_input);
    }

    // 로그아웃 버튼에 이벤트 바인딩 (만약 있다면)
    const logoutBtn = document.getElementById("logout_btn"); // 로그아웃 버튼 ID를 가정
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});