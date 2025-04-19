const check_input = () => {
   // 로그인 폼, 로그인 버튼, 이메일, 비밀번호 입력 요소를 가져옴
   const loginForm = document.getElementById('login_form');
   const loginBtn = document.getElementById('login_btn');
   const emailInput = document.getElementById('typeEmailX');
   const passwordInput = document.getElementById('typePasswordX');
   const c = '아이디, 패스워드를 체크합니다'; 
   alert(c);  // 확인용 메시지 (알림창을 띄움)

   // 이메일과 비밀번호 값 가져오기 (앞뒤 공백 제거)
   const emailValue = emailInput.value.trim();
   const passwordValue = passwordInput.value.trim();

   // 이메일 값이 비어있으면 알림을 띄워 폼 제출 x
   if (emailValue === '') {
      alert('이메일을 입력하세요.');
      return false;
   }

   // 비밀번호 값이 비어있으면 알림을 띄워 폼 제출 x
   if (passwordValue === '') {
      alert('비밀번호를 입력하세요.');
      return false;
   }

   // 이메일과 비밀번호 값 출력
   console.log('이메일:', emailValue);
   console.log('비밀번호:', passwordValue);

   // 폼 제출
   loginForm.submit();
};

// 로그인 버튼 클릭 시 check_input 함수 실행
document.getElementById("login_btn").addEventListener('click', check_input);
