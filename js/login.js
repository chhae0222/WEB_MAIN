// 쿠키 저장 함수
function setCookie(name, value, expiredays) {
    const date = new Date();
    date.setDate(date.getDate() + expiredays);
    document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + "; expires=" + date.toUTCString() + "; path=/";
}

// 쿠키 불러오기 함수
function getCookie(name) {
    const cookieName = encodeURIComponent(name) + "=";
    const cookieData = document.cookie;
    let start = cookieData.indexOf(cookieName);
    let value = "";

    if (start !== -1) {
        start += cookieName.length;
        let end = cookieData.indexOf(";", start);
        if (end === -1) end = cookieData.length;
        value = decodeURIComponent(cookieData.substring(start, end));
    }

    return value;
}

// 로그인 횟수 증가 함수
function login_count() {
    let loginCount = getCookie("login_cnt");
    loginCount = loginCount ? parseInt(loginCount) : 0; // 쿠키에서 로그인 횟수를 가져옴
    loginCount += 1; // 횟수 증가
    setCookie("login_cnt", loginCount, 7); // 쿠키에 로그인 횟수 저장 (7일간 유효)
    console.log("로그인 횟수:", loginCount);
}

// 로그아웃 횟수 증가 함수
function logout_count() {
    let logoutCount = getCookie("logout_cnt");
    logoutCount = logoutCount ? parseInt(logoutCount) : 0; // 쿠키에서 로그아웃 횟수를 가져옴
    logoutCount += 1; // 횟수 증가
    setCookie("logout_cnt", logoutCount, 7); // 쿠키에 로그아웃 횟수 저장 (7일간 유효)
    console.log("로그아웃 횟수:", logoutCount);
}

// 로그인 함수 예시
const check_input = () => {
    const loginForm = document.getElementById('login_form');
    const emailInput = document.getElementById('typeEmailX');
    const passwordInput = document.getElementById('typePasswordX');
    const emailValue = emailInput.value.trim();
    const passwordValue = passwordInput.value.trim();
    const sanitizedPassword = check_xss(passwordInput);
    const sanitizedEmail = check_xss(emailInput);

    if (emailValue === '') {
        alert('이메일을 입력하세요.');
        return false;
    }

    if (passwordValue === '') {
        alert('비밀번호를 입력하세요.');
        return false;
    }

    if (emailValue.length < 5) {
        alert('아이디는 최소 5글자 이상 입력해야 합니다.');
        return false;
    }

    if (passwordValue.length < 12) {
        alert('비밀번호는 반드시 12글자 이상 입력해야 합니다.');
        return false;
    }

    const hasSpecialChar = passwordValue.match(/[!,@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/) !== null;
    if (!hasSpecialChar) {
        alert('패스워드는 특수문자를 1개 이상 포함해야 합니다.');
        return false;
    }

    const hasUpperCase = passwordValue.match(/[A-Z]+/) !== null;
    const hasLowerCase = passwordValue.match(/[a-z]+/) !== null;
    if (!hasUpperCase || !hasLowerCase) {
        alert('패스워드는 대소문자를 1개 이상 포함해야 합니다.');
        return false;
    }

    if (!sanitizedEmail || !sanitizedPassword) {
        return false;
    }

    // 로그인 카운트 증가
    login_count();

    const idsave_check = document.getElementById('idSaveCheck');
    if (idsave_check.checked === true) {
        setCookie("id", emailValue, 1);
    } else {
        setCookie("id", emailValue, 0);
    }

    loginForm.submit();
};

// 로그아웃 함수
function logout() {
    logout_count(); // 로그아웃 횟수 증가
    session_del();  // 세션 삭제
    location.href = '../index.html'; // 로그아웃 후 리디렉션
}

// 로그인 버튼 클릭 이벤트
document.getElementById("login_btn").addEventListener('click', check_input);

// 로그아웃 버튼 클릭 이벤트
document.getElementById("logout_btn").addEventListener('click', logout);
