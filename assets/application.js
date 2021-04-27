const swiper = new Swiper('.swiper-container', {
  pagination: {
    el: '.swiper-pagination',
  },
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
});

const nav = document.querySelector('#nav')
const menu = document.querySelector('#menu')
const pageIndex = document.querySelector('#page-index')

let toggle = false
menu.addEventListener('click', function() {
  if (toggle) {
    pageIndex.classList.remove('nav-open')
    nav.classList.remove('open')
    toggle = false
  } else {
    pageIndex.classList.add('nav-open')
    nav.classList.add('open')
    toggle = true
  }
})

const observer = lozad(); // lazy loads elements with default selector as '.lozad'
observer.observe();
