
    function toggleMobileMenu(open) {
      if (open) {
        document.getElementsByTagName("header")[0].classList.add("mobileMenuOpen");
        document.getElementById("hamburger").classList.add("open");
        document.getElementById("hamburger").removeEventListener("click", function() {toggleMobileMenu(true);}, false);
        document.getElementById("hamburger").addEventListener("click", function() {toggleMobileMenu(false);}, false);
      }
      else {
        document.getElementsByTagName("header")[0].classList.remove("mobileMenuOpen");
        document.getElementById("hamburger").classList.remove("open");
        document.getElementById("hamburger").removeEventListener("click", function() {toggleMobileMenu(false);}, false);
        document.getElementById("hamburger").addEventListener("click", function() {toggleMobileMenu(true);}, false);
      }
    }
    document.getElementById("hamburger").addEventListener("click", function() {toggleMobileMenu(true);}, false);
    document.getElementById("mobileMenuBG").addEventListener("click", function() {toggleMobileMenu(false);}, false);
    document.getElementById("search").addEventListener("click", function() {toggleMobileMenu(false);}, false);


    function searchMenuFn() {
      var Menu = document.getElementById("searchMenu");
      var closeSearchIcon = document.getElementById("closeSearchIcon");
      var searchIcon = document.getElementById("searchIcon");

       if (Menu.classList.contains("scale-in-top")) {
        document.getElementsByTagName("header")[0].classList.toggle("searchMenuOpen");
        Menu.classList.remove("scale-in-top");
        Menu.classList.add("scale-out-top");
        closeSearchIcon.classList.toggle("displayNone");
        searchIcon.classList.toggle("displayNone");
      } else {
        document.getElementsByTagName("header")[0].classList.toggle("searchMenuOpen");
        Menu.classList.remove("scale-out-top");
        Menu.classList.add("scale-in-top");
        closeSearchIcon.classList.toggle("displayNone");
        searchIcon.classList.toggle("displayNone");
      }
      document.getElementById("searchMenuBG").addEventListener("click", function() {searchMenuFn(false);}, false);

    }
 




  var prevScrollpos = window.pageYOffset;
  window.onscroll = function() {
  var currentScrollPos = window.pageYOffset;
    if (prevScrollpos > currentScrollPos) {
      document.getElementById("navbar").style.top = "0";
    } else {
      document.getElementById("navbar").style.top = "-64px";
      document.getElementsByTagName("header")[0].classList.remove("mobileMenuOpen");
      document.getElementById("hamburger").classList.remove("open");
      document.getElementById("hamburger").removeEventListener("click", function() {toggleMobileMenu(false);}, false);
      document.getElementById("hamburger").addEventListener("click", function() {toggleMobileMenu(true);}, false);
    }
    prevScrollpos = currentScrollPos;
  }

  