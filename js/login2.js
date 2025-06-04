import { session_set, session_get, session_check } from './session.js';
import { encrypt_text, decrypt_text } from './crypto.js'; // 경로 수정
import { generateJWT, checkAuth } from './token.js';     // 경로 수정

// DOMPurify 라이브러리 로드 (CDN 또는 직접 추가 필요)
// <script src="https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.6/purify.min.js"></script>
// 위 스크립트를 HTML <head> 또는 <body> 하단에 추가해야 합니다.

/**
 * XSS 방지 함수 (DOMPurify 사용)
 * - 입력값을 안전하게 Sanitize하여 XSS 공격을 방지합니다.
 * @param {string} input - Sanitize할 입력 문자열
 * @returns {string|boolean} Sanitize된 문자열 또는 XSS 공격 감지 시 false
 */
const check_xss = (input) => {
    // DOMPurify가 로드되었는지 확인. 로드되지 않았다면 오류를 발생시킵니다.
    if (typeof window.DOMPurify === 'undefined') {
        console.error('DOMPurify 라이브러리가 로드되지 않았습니다. CDN 또는 npm을 통해 추가해주세요.');
        alert('보안 오류: XSS 방지 라이브러리가 로드되지 않았습니다.');
        return false;
    }

    const DOMPurify = window.DOMPurify;
    const sanitizedInput = DOMPurify.sanitize(input); // DOMPurify로 입력값 Sanitize

    // Sanitize된 값이 원본과 다르면 XSS 공격 시도로 판단
    if (sanitizedInput !== input) {
        alert('XSS 공격 가능성이 있는 입력값을 발견했습니다.');
        return false;
    }
    return sanitizedInput;
};

/**
 * 쿠키 설정 함수
 * - 지정된 이름, 값, 만료일로 쿠키를 설정합니다.
 * @param {string} name - 쿠키 이름
 * @param {string} value - 쿠키 값
 * @param {number} expiredays - 쿠키 만료일 (현재 날짜로부터의 일수)
 */
function setCookie(name, value, expiredays) {
    const date = new Date();
    date.setDate(date.getDate() + expiredays);
    // SameSite=Lax; Secure 속성 추가: HTTPS 환경에서만 전송되며, CSRF 방지에 도움이 됩니다.
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${date.toUTCString()}; path=/; SameSite=Lax; Secure`;
    // NOTE: 운영 환경에서는 보안 정책에 따라 SameSite=None; Secure가 필요할 수도 있습니다.
}

/**
 * 쿠키 가져오기 함수
 * - 지정된 이름의 쿠키 값을 반환합니다.
 * @param {string} name - 가져올 쿠키 이름
 * @returns {string|null} 쿠키 값 또는 해당 쿠키가 없을 경우 null
 */
function getCookie(name) {
    const nameEq = `${name}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length); // 앞쪽 공백 제거
        if (c.indexOf(nameEq) === 0) return decodeURIComponent(c.substring(nameEq.length, c.length));
    }
    return null;
}

/**
 * 로그인 폼 및 초기 세션/쿠키 관련 데이터를 설정합니다.
 * - 저장된 아이디 쿠키를 불러와 이메일 입력 필드에 채웁니다.
 * - 세션 유효성을 검사합니다.
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
}

/**
 * 로그인 상태일 때 초기화 로직 (로그인 후 페이지에서 사용)
 * - 현재는 빈 함수로 정의되어 있지만, 필요에 따라 암호화된 세션 데이터 복호화 등
 * 로그인 후 필요한 추가 로직을 여기에 구현할 수 있습니다.
 */
async function init_logined() {
    // 예: 로그인 후 페이지에서 암호화된 세션 정보를 복호화해야 할 경우
    // if (sessionStorage && session_get()) {
    //     await decrypt_text();
    //     // await decrypt_text2(); // 필요하다면 다른 복호화 함수도 호출
    // }
    console.log('init_logined() is called. Add your post-login initialization logic here.');
}


/**
 * 로그인 폼 입력값의 유효성을 검사하고 로그인 처리를 진행합니다.
 * - 이메일/비밀번호 길이, 특수문자, 대소문자 포함 여부 등을 검사합니다.
 * - XSS 방지 처리를 수행합니다.
 * - 아이디 저장 (쿠키) 기능을 처리합니다.
 * - 세션을 설정하고 JWT 토큰을 생성하여 로컬 스토리지에 저장합니다.
 * - 최종적으로 로그인 폼을 서버로 제출합니다.
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

    // check_xss 함수에서 false가 반환되면 XSS 공격으로 판단하여 즉시 종료
    if (sanitizedEmail === false || sanitizedPassword === false) {
        return false;
    }

    // 5. 아이디 저장 (쿠키)
    if (idSaveCheck.checked) {
        setCookie("id", sanitizedEmail, 30); // 30일 저장 (이전 코드의 1일 대신 일반적인 30일로 설정)
    } else {
        setCookie("id", "", 0); // 체크 해제 시 쿠키 삭제
    }

    // 6. 패스워드 암호화 (선택적: 일반적으로 서버 측에서 처리)
    // 클라이언트 측에서 비밀번호를 직접 암호화하는 것은 키 노출 위험이 있으므로,
    // 일반적으로 HTTPS를 통해 서버로 전송 후 서버에서 해싱/솔팅하는 것이 보안상 안전합니다.
    // const encryptedPassword = encrypt_text(sanitizedPassword);
    // console.log('암호화된 비밀번호 (클라이언트 측):', encryptedPassword);

    // 7. 세션 설정 및 JWT 토큰 생성
    // session_set 함수가 어떤 데이터를 필요로 하는지에 따라 sanitizedEmail을 인자로 전달
    session_set(sanitizedEmail); 

    const payload = {
        id: sanitizedEmail, // Sanitize된 이메일을 JWT payload에 사용
        exp: Math.floor(Date.now() / 1000) + (60 * 60) // JWT 만료 시간: 1시간 후 (3600초)
    };
    const jwtToken = generateJWT(payload); // token.js의 generateJWT 함수로 토큰 생성
    localStorage.setItem('jwt_token', jwtToken); // 생성된 JWT를 로컬 스토리지에 저장

    // 8. 폼 제출
    alert('로그인 정보를 확인하고 있습니다.'); // 사용자에게 로그인 진행 상황 알림
    loginForm.submit(); // 로그인 폼 제출 (서버로 데이터 전송)
};

/**
 * 세션 삭제 함수
 * - sessionStorage에서 세션 데이터를 삭제하고, localStorage의 JWT 토큰도 삭제합니다.
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
 * - 세션 데이터를 삭제하고 메인 페이지로 리디렉션합니다.
 */
function logout() {
    session_del(); // 세션 및 JWT 삭제
    location.href = '../index.html'; // 메인 페이지로 이동
}

// --- 이벤트 리스너 ---
// DOMContentLoaded 이벤트 발생 시 모든 초기화 및 이벤트 바인딩을 처리
document.addEventListener('DOMContentLoaded', () => {
    // 페이지 로드 시 JWT 유효성 검사 및 로그인 후 초기화 함수 호출
    checkAuth(); // token.js의 checkAuth 함수 호출
    init_logined(); // 로그인 후 초기화 로직 호출

    // 로그인 폼 및 쿠키 관련 초기화
    init();

    // 로그인 버튼에 이벤트 바인딩
    const loginBtn = document.getElementById("login_btn");
    if (loginBtn) {
        loginBtn.addEventListener('click', check_input);
    } else {
        console.warn("ID가 'login_btn'인 요소를 찾을 수 없습니다. 로그인 버튼 이벤트 바인딩 실패.");
    }

    // 로그아웃 버튼에 이벤트 바인딩 (만약 있다면)
    const logoutBtn = document.getElementById("logout_btn"); // 로그아웃 버튼 ID를 가정
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});