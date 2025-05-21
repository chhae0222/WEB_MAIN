import { encrypt_text, decrypt_text } from './crypto.js';

export function session_set(){ //세션 저장(객체)
let id = document.querySelector("#typeEmailX");
let password = document.querySelector("#typePasswordX");
let random = new Date(); // 랜덤 타임스탬프
const obj = { // 객체 선언
id : id.value,
otp : random
}
// 다음 페이지 계속 작성하기

  if (sessionStorage) {
    let en_text = encrypt_text(session_pass.value); // 암호화된 텍스트
    sessionStorage.setItem("Session_Storage_id", session_id.value);
    sessionStorage.setItem("Session_Storage_pass", en_text);
  } else {
    alert("세션 스토리지 지원 x");
  }
}

export function session_get() { // 세션 읽기
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

export function session_check() { // 세션 검사
  if (sessionStorage.getItem("Session_Storage_id")) {
    alert("이미 로그인 되었습니다.");
    location.href = "../login/index_login.html";
  }
}
