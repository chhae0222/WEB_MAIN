// 검색 버튼을 누르면 알림을 띄움 
const search_message = () => {
    const c = '검색을 수행합니다';
    alert(c);
  };
  
  // 구글 검색
  function googleSearch() {
    const searchTerm = document.getElementById("search_input").value; // 검색어 가져오기
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`; // URL에 검색어 붙이기
  
    window.open(googleSearchUrl, "_blank"); // 새 창에서 구글 검색
    return false;
  }