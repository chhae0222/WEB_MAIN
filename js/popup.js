let close_time_id;
let close_time_countdown = 50;

function close_window() {
    window.close();
}

function show_time() {
    const divClock = document.getElementById('Time');
    if (divClock) {
        divClock.innerText = close_time_countdown;
        close_time_countdown--;

        if (close_time_countdown >= 0) {
            setTimeout(show_time, 1000);
        }
    } else {
        console.warn("ID가 'Time'인 요소를 찾을 수 없습니다. show_time()이 작동하지 않을 수 있습니다.");
    }
}

function setCookie(name, value, expiredays) {
    const date = new Date();
    date.setDate(date.getDate() + expiredays);
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${date.toUTCString()}; path=/; SameSite=Lax; Secure`;
}

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

function closePopup() {
    const checkPopupElement = document.getElementById('check_popup');
    if (checkPopupElement && checkPopupElement.checked) {
        setCookie("popupYN", "N", 1);
        console.log("쿠키를 설정합니다: popupYN=N");
        if (window.opener) {
            self.close();
        } else {
            console.warn("이 창은 팝업이 아니므로 self.close()가 작동하지 않을 수 있습니다.");
        }
    } else if (checkPopupElement && !checkPopupElement.checked) {
        if (window.opener) {
            self.close();
        } else {
            console.warn("체크박스가 체크되지 않았습니다. self.close()를 시도합니다.");
            window.close();
        }
    } else {
        if (window.opener) {
            self.close();
        } else {
            console.warn("ID가 'check_popup'인 요소를 찾을 수 없거나 체크박스가 아닙니다. self.close()를 시도합니다.");
            window.close();
        }
    }
}

function pop_up() {
    const cookieCheck = getCookie("popupYN");
    if (cookieCheck !== "N") {
        window.open("../popup/popup.html", "팝업테스트", "width=400, height=300, top=10, left=10");
    }
}

function show_clock() {
    const now = new Date();
    const divClock = document.getElementById('divClock');

    if (divClock) {
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        const timeString = `${year}년 ${month}월 ${day}일 ${hours}시 ${minutes}분 ${seconds}초`;
        divClock.textContent = timeString;

        if (now.getMinutes() > 58) {
            divClock.style.color = "red";
        } else {
            divClock.style.color = "";
        }
    } else {
        console.warn("ID가 'divClock'인 요소를 찾을 수 없습니다. show_clock()이 작동하지 않을 수 있습니다.");
    }
    setTimeout(show_clock, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
    pop_up();
    show_clock();

    const checkPopupButton = document.getElementById('check_popup');
    if (checkPopupButton) {
        checkPopupButton.addEventListener('click', closePopup);
    }
});