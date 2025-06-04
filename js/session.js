import { encrypt_text, decrypt_text } from './crypto.js';

// 세션 저장 시 호출될 함수 (로그인 버튼 클릭 시 등)
export function session_set(){
    // 로그인 폼에서 ID와 Password 입력 요소를 가져옵니다.
    // HTML에 #typeEmailX (ID)와 #typePasswordX (Password) ID를 가진 input 필드가 있어야 합니다.
    let idInput = document.querySelector("#typeEmailX");
    let passwordInput = document.querySelector("#typePasswordX");
    
    if (!idInput || !passwordInput) {
        console.error("ID 또는 Password 입력 필드를 찾을 수 없습니다. HTML ID를 확인해주세요.");
        alert("로그인 입력 필드를 찾을 수 없습니다.");
        return;
    }

    let random = new Date(); // 랜덤 타임스탬프 (OTP 대신 단순히 타임스탬프를 사용하는 것으로 보임)
    const obj = { // 객체 선언 (사용자 ID와 임시 OTP로 보임)
        id : idInput.value,
        otp : random.getTime() // 실제 사용 가능한 타임스탬프 값
    }

    if (sessionStorage) {
        // 비밀번호를 암호화하여 저장합니다.
        // encrypt_text 함수에 passwordInput.value를 전달해야 합니다.
        let en_text = encrypt_text(passwordInput.value); // 암호화된 텍스트
        sessionStorage.setItem("Session_Storage_id", idInput.value);
        sessionStorage.setItem("Session_Storage_pass", en_text);
        console.log("세션 저장 완료 - ID:", idInput.value, "암호화된 비밀번호:", en_text);
        alert("로그인 성공! 세션이 저장되었습니다.");
        // 로그인 성공 후 메인 페이지로 리다이렉트 (예시)
        window.location.href = "../index.html"; // 실제 메인 페이지 경로로 변경해주세요
    } else {
        alert("세션 스토리지를 지원하지 않는 브라우저입니다.");
    }
}

// 세션에서 비밀번호를 가져오는 함수
export function session_get() {
    if (sessionStorage) {
        return sessionStorage.getItem("Session_Storage_pass");
    } else {
        console.warn("세션 스토리지를 지원하지 않는 브라우저입니다.");
        return null; // 지원하지 않으면 null 반환
    }
}

// 세션이 초기화되었을 때 복호화를 시도하는 함수 (팝업 등에서 사용될 수 있음)
export function init_logined() { // export를 추가하여 외부에서 호출 가능하게 함
    if (sessionStorage) {
        const encryptedData = session_get(); // 암호화된 데이터를 가져옴
        if (encryptedData) {
            const decryptedPass = decrypt_text(encryptedData); // 복호화 함수 호출, 인자로 전달
            console.log("초기 로드 시 복호화된 비밀번호:", decryptedPass);
            // 여기에서 복호화된 비밀번호를 사용하여 UI 업데이트 등의 로직을 추가할 수 있습니다.
        } else {
            console.log("저장된 세션 비밀번호가 없습니다.");
        }
    } else {
        alert("세션 스토리지를 지원하지 않는 브라우저입니다.");
    }
}

// 이미 로그인되었는지 확인하는 함수 (로그인 페이지에서 사용될 수 있음)
export function session_check() {
    if (sessionStorage.getItem("Session_Storage_id")) {
        alert("이미 로그인되어 있습니다. 메인 페이지로 이동합니다.");
        location.href = "../index.html"; // 로그인 후 이동할 메인 페이지 경로
    }
}

// 페이지 로드 시 바로 세션 확인 (옵션)
// window.addEventListener('DOMContentLoaded', session_check); // 로그인 페이지 로드 시 자동 검사