// XSS 방지 함수
function check_xss(value) {
  return value.replace(/[<>]/g, '');
}

// 입력값 검증 함수
function check_input() {
  const emailInput = document.getElementById('typeEmailX');
  const passwordInput = document.getElementById('typePasswordX');
  const emailValue = emailInput.value;
  const passwordValue = passwordInput.value;

  // 이메일 최소 길이 확인
  if (emailValue.length < 5) {
    alert('아이디는 최소 5글자 이상 입력해야 합니다.');
    return false;
  }

  // 비밀번호 길이 확인
  if (passwordValue.length < 12) {
    alert('비밀번호는 반드시 12글자 이상 입력해야 합니다.');
    return false;
  }

  // 특수문자 포함 여부 확인
  const hasSpecialChar = /[!,@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(passwordValue);
  if (!hasSpecialChar) {
    alert('패스워드는 특수문자를 1개 이상 포함해야 합니다.');
    return false;
  }

  // 대소문자 포함 여부 확인
  const hasUpperCase = /[A-Z]+/.test(passwordValue);
  const hasLowerCase = /[a-z]+/.test(passwordValue);
  if (!hasUpperCase || !hasLowerCase) {
    alert('패스워드는 대소문자를 1개 이상 포함해야 합니다.');
    return false;
  }

  // XSS 방지 처리
  const sanitizedEmail = check_xss(emailValue);
  const sanitizedPassword = check_xss(passwordValue);

  if (!sanitizedEmail || !sanitizedPassword) {
    alert('입력값이 올바르지 않습니다.');
    return false;
  }

  console.log('Sanitized Email:', sanitizedEmail);
  console.log('Sanitized Password:', sanitizedPassword);

  session_set(); // 세션 저장

  document.getElementById('login_form').submit(); // 로그인 폼 제출
}

// 쿠키 가져오기 함수
function getCookie(name) {
  const nameEq = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEq) === 0) return c.substring(nameEq.length, c.length);
  }
  return null;
}

// 아이디 저장 및 세션 확인 초기화 함수
function init() {
  const emailInput = document.getElementById('typeEmailX');
  const idSaveCheck = document.getElementById('idSaveCheck');
  const savedId = getCookie("id");

  if (savedId) {
    emailInput.value = savedId;
    idSaveCheck.checked = true;
  }

  session_check(); // 세션 유효성 검사
}

// 세션 삭제 함수
function session_del() {
  if (sessionStorage) {
    sessionStorage.removeItem("Session_Storage_test");
    alert('로그아웃 버튼 클릭 확인 : 세션 스토리지를 삭제합니다.');
  } else {
    alert("세션 스토리지를 지원하지 않습니다.");
  }
}

// 로그아웃 함수
function logout() {
  session_del(); // 세션 삭제
  location.href = '../index.html'; // 메인 페이지로 이동
}

// 로그인 버튼에 이벤트 바인딩
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById("login_btn").addEventListener('click', check_input);
});
