function session_set() { // 세션 저장
  let session_id = document.querySelector("#typeEmailX"); // 이메일 입력
  let session_pass = document.querySelector("#typePasswordX"); // 패스워드 입력

  if (sessionStorage) {
    let en_text = encrypt_text(session_pass.value); // 암호화된 텍스트
    sessionStorage.setItem("Session_Storage_id", session_id.value);
    sessionStorage.setItem("Session_Storage_pass", en_text);
  } else {
    alert("세션 스토리지 지원 x");
  }
}

function session_get() { // 세션 읽기
  if (sessionStorage) {
    return sessionStorage.getItem("Session_Storage_pass");
  } else {
    alert("세션 스토리지 지원 x");
  }
}

function init_logined() {
  if (sessionStorage) {
    decrypt_text(); // 복호화 함수는 crypto.js에 있을 가능성 있음
  } else {
    alert("세션 스토리지 지원 x");
  }
}

function session_check() { // 세션 검사
  if (sessionStorage.getItem("Session_Storage_id")) {
    alert("이미 로그인 되었습니다.");
    location.href = "../login/index_login.html";
  }
}
