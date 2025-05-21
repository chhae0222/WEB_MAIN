import { session_set2 } from './session.js';

function join() { // 회원가입 기능
    let form = document.querySelector("#join_form"); // 회원가입 폼 식별자
    let name = document.querySelector("#form3Example1c");
    let email = document.querySelector("#form3Example3c");
    let password = document.querySelector("#form3Example4c");
    let re_password = document.querySelector("#form3Example4cd");
    let agree = document.querySelector("#form2Example3c");

    // 입력값 유효성 검사
    if (
        name.value.length === 0 ||
        email.value.length === 0 ||
        password.value.length === 0 ||
        re_password.value.length === 0
    ) {
        alert("회원가입 폼에 모든 정보를 입력해주세요.");
        return;
    }
    else{
const newSignUp = new SignUp(name.value, email.value, password.value, re_password.value); // 회원가입 정보 객체 생성
session_set2(newSignUp); // 세션 저장 및 객체 전달
form.submit(); // 폼 실행
}

    // 동의 체크 여부 확인
    if (!agree.checked) {
        alert("약관에 동의해주세요.");
        return;
    }

    // 비밀번호 일치 여부 확인
    if (password.value !== re_password.value) {
        alert("비밀번호가 일치하지 않습니다.");
        return;
    }

    // 회원 정보 객체 생성
    const user = new SignUp(name.value, email.value, password.value, re_password.value);
    console.log("회원 정보:", user.getUserInfo());

    form.action = "../Index.html"; // 로그인 성공 시 이동
    form.method = "get"; // 전송 방식
    form.submit(); // 폼 제출
}

class SignUp {
    constructor(name, email, password, re_password) {
        // 생성자 함수: 객체 생성 시 회원 정보 초기화
        this._name = name;
        this._email = email;
        this._password = password;
        this._re_password = re_password;
    }

    // 전체 회원 정보를 한 번에 설정하는 함수
    setUserInfo(name, email, password, re_password) {
        this._name = name;
        this._email = email;
        this._password = password;
        this._re_password = re_password;
    }

    // 전체 회원 정보를 한 번에 가져오는 함수
    getUserInfo() {
        return {
            name: this._name,
            email: this._email,
            password: this._password,
            re_password: this._re_password
        };
    }
}

document.getElementById("join_btn").addEventListener('click', join); // 이벤트 리스너
