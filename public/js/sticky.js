"use strict";

// Global initialization functions
const navbar = document.getElementById("sidebar");
const navbar1 = document.getElementById("header");

const sticky = navbar ? navbar.offsetTop : 0;
const sticky1 = navbar1 ? navbar1.offsetTop : 0;

function stickyFn() {
  // Logic to make elements sticky
  if (navbar && window.scrollY >= sticky) {
    navbar.classList.add("sticky-pin");
  } else if (navbar) {
    navbar.classList.remove("sticky-pin");
  }

  if (navbar1 && window.scrollY >= sticky1) {
    navbar1.classList.add("sticky-pin");
  } else if (navbar1) {
    navbar1.classList.remove("sticky-pin");
  }
}

// IIFE for specific event binding and initialization
(() => {
  window.addEventListener('scroll', stickyFn);
  window.addEventListener('DOMContentLoaded', stickyFn);
})();
