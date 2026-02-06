(function () {
  "use strict";

  /* page loader */
  function hideLoader() {
    const loader = document.getElementById("loader");
    if(loader) {
      loader.classList.add("d-none")
    }
  }

  window.addEventListener("load", hideLoader);
  /* page loader */

  /* tooltip */
  const tooltipTriggerList = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]'
  );
  [...tooltipTriggerList].map(
    (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
  );

  /* popover  */
  const popoverTriggerList = document.querySelectorAll(
    '[data-bs-toggle="popover"]'
  );
  [...popoverTriggerList].map(
    (popoverTriggerEl) => new bootstrap.Popover(popoverTriggerEl)
  );

  /* breadcrumb date range picker */
  // Get today's date
  const today = new Date();

  // Calculate the start date (today) and end date (30 days from today)
  const startDate = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + 30); // Add 30 days
  const endDateFormatted = endDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD

  if (document.querySelector("#daterange")) {
      flatpickr("#daterange", {
        mode: "range",
        dateFormat: "Y-m-d",
        defaultDate: [startDate, endDateFormatted],
        onReady: function (selectedDates, dateStr, instance) {
          updateInputDisplay([startDate, endDateFormatted], instance);
        },
        onChange: function (selectedDates, dateStr, instance) {
          updateInputDisplay(selectedDates, instance);
        }
      });
  }

  // Function to update the input display with formatted date range
  function updateInputDisplay(dates, instance) {
    if (dates.length === 2) {
      const startDateFormatted = formatDate(dates[0]);
      const endDateFormatted = formatDate(dates[1]);
      instance.input.value = `${startDateFormatted} to ${endDateFormatted}`;
    } else {
      instance.input.value = ''; // Clear value if less than 2 dates
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0'); // Get day and pad with leading zero if necessary
    const month = date.toLocaleString('default', { month: 'short' }); // Get the short month name
    const year = date.getFullYear(); // Get the year
    return `${day}, ${month} ${year}`; // Return formatted date
  }
  /* breadcrumb date range picker */

  //switcher color pickers
  const pickrContainerPrimary = document.querySelector(
    ".pickr-container-primary"
  );
  const themeContainerPrimary = document.querySelector(
    ".theme-container-primary"
  );
  const pickrContainerBackground = document.querySelector(
    ".pickr-container-background"
  );
  const themeContainerBackground = document.querySelector(
    ".theme-container-background"
  );

  /* for theme primary */
  const nanoThemes = [
    [
      "nano",
      {
        defaultRepresentation: "RGB",
        components: {
          preview: true,
          opacity: false,
          hue: true,

          interaction: {
            hex: false,
            rgba: true,
            hsva: false,
            input: true,
            clear: false,
            save: false,
          },
        },
      },
    ],
  ];
  const nanoButtons = [];
  let nanoPickr = null;
  if (pickrContainerPrimary && themeContainerPrimary) {
      for (const [theme, config] of nanoThemes) {
        const button = document.createElement("button");
        button.innerHTML = theme;
        nanoButtons.push(button);

        button.addEventListener("click", () => {
          const el = document.createElement("p");
          pickrContainerPrimary.appendChild(el);

          /* Delete previous instance */
          if (nanoPickr) {
            nanoPickr.destroyAndRemove();
          }

          /* Apply active class */
          for (const btn of nanoButtons) {
            btn.classList[btn === button ? "add" : "remove"]("active");
          }

          /* Create fresh instance */
          nanoPickr = new Pickr(
            Object.assign(
              {
                el,
                theme,
                default: "#3ab047",
              },
              config
            )
          );

          /* Set events */
          nanoPickr.on("changestop", (source, instance) => {
            let color = instance.getColor().toRGBA();
            let html = document.querySelector("html");
            html.style.setProperty(
              "--primary-rgb",
              `${Math.floor(color[0])}, ${Math.floor(color[1])}, ${Math.floor(
                color[2]
              )}`
            );
            /* theme color picker */
            localStorage.setItem(
              "primaryRGB",
              `${Math.floor(color[0])}, ${Math.floor(color[1])}, ${Math.floor(
                color[2]
              )}`
            );
          });
        });

        themeContainerPrimary.appendChild(button);
      }
      if (nanoButtons[0]) nanoButtons[0].click();
  }
  /* for theme primary */

  /* for theme background */
  const nanoButtons1 = [];
  let nanoPickr1 = null;
  if (pickrContainerBackground && themeContainerBackground) {
      for (const [theme, config] of nanoThemes) {
        const button = document.createElement("button");
        button.innerHTML = theme;
        nanoButtons1.push(button);

        button.addEventListener("click", () => {
          const el = document.createElement("p");
          pickrContainerBackground.appendChild(el);

          /* Delete previous instance */
          if (nanoPickr1) {
            nanoPickr1.destroyAndRemove();
          }

          /* Apply active class */
          for (const btn of nanoButtons) {
            btn.classList[btn === button ? "add" : "remove"]("active");
          }

          /* Create fresh instance */
          nanoPickr1 = new Pickr(
            Object.assign(
              {
                el,
                theme,
                default: "#3ab047",
              },
              config
            )
          );

          /* Set events */
          nanoPickr1.on("changestop", (source, instance) => {
            let color = instance.getColor().toRGBA();
            let html = document.querySelector("html");
            html.style.setProperty(
              "--body-bg-rgb",
              `${color[0]}, ${color[1]}, ${color[2]}`
            );
            html.style.setProperty(
                "--body-bg-rgb2",
                `${color[0] + 14}, ${color[1] + 14}, ${color[2] + 14}`
            );
            html.style.setProperty(
                "--light-rgb",
                `${color[0] + 14}, ${color[1] + 14}, ${color[2] + 14}`
            );
            html.style.setProperty(
                "--form-control-bg",
                `rgb(${color[0] + 14}, ${color[1] + 14}, ${color[2] + 14})`
            );
            html.style.setProperty(
                "--gray-3",
                `rgb(${color[0] + 14}, ${color[1] + 14}, ${color[2] + 14})`
            );
            localStorage.removeItem("bgtheme");
            html.setAttribute("data-theme-mode", "dark");
            html.setAttribute("data-menu-styles", "dark");
            html.setAttribute("data-header-styles", "dark");
            if (document.querySelector('#switcher-menu-dark')) document.querySelector('#switcher-menu-dark').checked = true;
            if (document.querySelector('#switcher-header-dark')) document.querySelector('#switcher-header-dark').checked = true;
            if (document.querySelector("#switcher-dark-theme")) document.querySelector("#switcher-dark-theme").checked = true;
            localStorage.setItem(
              "bodyBgRGB",
              `${color[0]}, ${color[1]}, ${color[2]}`
            );
            localStorage.setItem(
              "bodylightRGB",
              `${color[0] + 14}, ${color[1] + 14}, ${color[2] + 14}`
            );
          });
        });
        themeContainerBackground.appendChild(button);
      }
      if (nanoButtons1[0]) nanoButtons1[0].click();
  }
  /* for theme background */

  /* header theme toggle */
  function toggleTheme() {
    let html = document.querySelector("html");
    if (html.getAttribute("data-theme-mode") === "dark") {
      html.setAttribute("data-theme-mode", "light");
      html.setAttribute("data-header-styles", "transparent");
      html.setAttribute("data-menu-styles", "transparent");
      if (!localStorage.getItem("primaryRGB")) {
        html.setAttribute("style", "");
      }
      html.removeAttribute("data-bg-theme");
      if (document.querySelector("#switcher-light-theme")) document.querySelector("#switcher-light-theme").checked = true;
      if (document.querySelector("#switcher-menu-transparent")) document.querySelector("#switcher-menu-transparent").checked = true;
      html.style.removeProperty("--body-bg-rgb");
      if (typeof checkOptions === 'function') checkOptions();
      html.style.removeProperty("--body-bg-rgb2");
      html.style.removeProperty("--light-rgb");
      html.style.removeProperty("--form-control-bg");
      html.style.removeProperty("--input-border");
      if (document.querySelector("#switcher-header-transparent")) document.querySelector("#switcher-header-transparent").checked = true;
      if (document.querySelector("#switcher-background4")) document.querySelector("#switcher-background4").checked = false;
      if (document.querySelector("#switcher-background3")) document.querySelector("#switcher-background3").checked = false;
      if (document.querySelector("#switcher-background2")) document.querySelector("#switcher-background2").checked = false;
      if (document.querySelector("#switcher-background1")) document.querySelector("#switcher-background1").checked = false;
      if (document.querySelector("#switcher-background")) document.querySelector("#switcher-background").checked = false;
      localStorage.removeItem("vyzordarktheme");
      localStorage.removeItem("vyzorMenu");
      localStorage.removeItem("vyzorHeader");
      localStorage.removeItem("bodylightRGB");
      localStorage.removeItem("bodyBgRGB");
      html.setAttribute("data-header-styles", "transparent");
    } else {
      html.setAttribute("data-theme-mode", "dark");
      html.setAttribute("data-header-styles", "transparent");
      if (!localStorage.getItem("primaryRGB")) {
        html.setAttribute("style", "");
      }
      html.setAttribute("data-menu-styles", "transparent");
      if (document.querySelector("#switcher-dark-theme")) document.querySelector("#switcher-dark-theme").checked = true;
      if (document.querySelector("#switcher-menu-transparent")) document.querySelector("#switcher-menu-transparent").checked = true;
      if (document.querySelector("#switcher-header-transparent")) document.querySelector("#switcher-header-transparent").checked = true;
      if (typeof checkOptions === 'function') checkOptions();
      if (document.querySelector("#switcher-background4")) document.querySelector("#switcher-background4").checked = false;
      if (document.querySelector("#switcher-background3")) document.querySelector("#switcher-background3").checked = false;
      if (document.querySelector("#switcher-background2")) document.querySelector("#switcher-background2").checked = false;
      if (document.querySelector("#switcher-background1")) document.querySelector("#switcher-background1").checked = false;
      if (document.querySelector("#switcher-background")) document.querySelector("#switcher-background").checked = false;
      localStorage.setItem("vyzordarktheme", "true");
      localStorage.setItem("vyzorMenu", "transparent");
      localStorage.setItem("vyzorHeader", "transparent");
      localStorage.removeItem("bodylightRGB");
      localStorage.removeItem("bodyBgRGB");
    }
  }

  function toggleTheme1() {
    let html = document.querySelector("html");
    if (html.getAttribute("data-theme-mode") === "dark") {
      html.setAttribute("data-theme-mode", "light");
      html.setAttribute("data-header-styles", "transparent");
      html.setAttribute("data-menu-styles", "transparent");
      if (!localStorage.getItem("primaryRGB")) {
        html.setAttribute("style", "");
      }
      html.removeAttribute("data-bg-theme");
      if (document.querySelector("#switcher-light-theme")) document.querySelector("#switcher-light-theme").checked = true;
      if (document.querySelector("#switcher-menu-transparent")) document.querySelector("#switcher-menu-transparent").checked = true;
      html.style.removeProperty("--body-bg-rgb");
      if (typeof checkOptions === 'function') checkOptions();
      html.style.removeProperty("--body-bg-rgb2");
      html.style.removeProperty("--light-rgb");
      html.style.removeProperty("--form-control-bg");
      html.style.removeProperty("--input-border");
      if (document.querySelector("#switcher-header-transparent")) document.querySelector("#switcher-header-transparent").checked = true;
      if (document.querySelector("#switcher-background4")) document.querySelector("#switcher-background4").checked = false;
      if (document.querySelector("#switcher-background3")) document.querySelector("#switcher-background3").checked = false;
      if (document.querySelector("#switcher-background2")) document.querySelector("#switcher-background2").checked = false;
      if (document.querySelector("#switcher-background1")) document.querySelector("#switcher-background1").checked = false;
      if (document.querySelector("#switcher-background")) document.querySelector("#switcher-background").checked = false;
      localStorage.removeItem("vyzordarktheme");
      localStorage.removeItem("vyzorMenu");
      localStorage.removeItem("vyzorHeader");
      localStorage.removeItem("bodylightRGB");
      localStorage.removeItem("bodyBgRGB");
      html.setAttribute("data-header-styles", "transparent");
    } else {
      html.setAttribute("data-theme-mode", "dark");
      html.setAttribute("data-header-styles", "transparent");
      if (!localStorage.getItem("primaryRGB")) {
        html.setAttribute("style", "");
      }
      html.setAttribute("data-menu-styles", "transparent");
      if (document.querySelector("#switcher-dark-theme")) document.querySelector("#switcher-dark-theme").checked = true;
      if (document.querySelector("#switcher-menu-transparent")) document.querySelector("#switcher-menu-transparent").checked = true;
      if (document.querySelector("#switcher-header-transparent")) document.querySelector("#switcher-header-transparent").checked = true;
      if (typeof checkOptions === 'function') checkOptions();
      if (document.querySelector("#switcher-background4")) document.querySelector("#switcher-background4").checked = false;
      if (document.querySelector("#switcher-background3")) document.querySelector("#switcher-background3").checked = false;
      if (document.querySelector("#switcher-background2")) document.querySelector("#switcher-background2").checked = false;
      if (document.querySelector("#switcher-background1")) document.querySelector("#switcher-background1").checked = false;
      if (document.querySelector("#switcher-background")) document.querySelector("#switcher-background").checked = false;
      localStorage.setItem("vyzordarktheme", "true");
      localStorage.setItem("vyzorMenu", "transparent");
      localStorage.setItem("vyzorHeader", "transparent");
      localStorage.removeItem("bodylightRGB");
      localStorage.removeItem("bodyBgRGB");
    }
  }
  /* header theme toggle */

  /* Choices JS */
  document.addEventListener("DOMContentLoaded", function () {
    var genericExamples = document.querySelectorAll("[data-trigger]");
    for (let i = 0; i < genericExamples.length; ++i) {
      var element = genericExamples[i];
      new Choices(element, {
        allowHTML: true,
        placeholderValue: "Search",
        searchPlaceholderValue: "Search",
      });
    }
  });
  /* Choices JS */

  /* footer year */
  const yearElement = document.getElementById("year");
  if (yearElement) {
    yearElement.innerHTML = new Date().getFullYear();
  }
  /* footer year */

  /* node waves */
  if (typeof Waves !== 'undefined') {
      Waves.attach(".btn-wave", ["waves-light"]);
      Waves.init();
  }
  /* node waves */

  /* card with close button */
  let DIV_CARD = ".card";
  document.addEventListener("click", function (e) {
    const cardRemoveBtn = e.target.closest('[data-bs-toggle="card-remove"]');
    if (cardRemoveBtn) {
        e.preventDefault();
        let card = cardRemoveBtn.closest(DIV_CARD);
        if (card) card.remove();
    }
  });
  /* card with close button */

  /* card with fullscreen */
  document.addEventListener("click", function (e) {
    const cardFullscreenBtn = e.target.closest('[data-bs-toggle="card-fullscreen"]');
    if (cardFullscreenBtn) {
        let card = cardFullscreenBtn.closest(DIV_CARD);
        if (card) {
            card.classList.toggle("card-fullscreen");
            card.classList.remove("card-collapsed");
        }
        e.preventDefault();
    }
  });
  /* card with fullscreen */

  /* count-up */
  var i = 1;
  setInterval(() => {
    document.querySelectorAll(".count-up").forEach((ele) => {
      if (ele.getAttribute("data-count") >= i) {
        i = i + 1;
        ele.innerText = i;
      }
    });
  }, 10);
  /* count-up */

  /* Progressbar Top */
  window.addEventListener('scroll', () => {
    var widnowScroll = document.body.scrollTop || document.documentElement.scrollTop,
      height = document.documentElement.scrollHeight - document.documentElement.clientHeight,
      scrollAmount = (widnowScroll / height) * 100;
    const progressBar = document.querySelector(".progress-top-bar");
    if (progressBar) {
      progressBar.style.width = scrollAmount + "%";
    }
  })
  /* Progressbar Top */

  /* back to top */
  const scrollToTop = document.querySelector(".scrollToTop");
  if (scrollToTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 100) {
        scrollToTop.style.display = "flex";
      } else {
        scrollToTop.style.display = "none";
      }
    });
    scrollToTop.onclick = () => {
      window.scrollTo(0, 0);
    };
  }
  /* back to top */

  /* header dropdowns scroll */
  var myHeadernotification = document.getElementById("header-notification-scroll");
  if(myHeadernotification && typeof SimpleBar !== 'undefined') {
    new SimpleBar(myHeadernotification, { autoHide: true });
  }

  var myHeaderCart = document.getElementById("header-cart-items-scroll");
  if(myHeaderCart && typeof SimpleBar !== 'undefined') {
    new SimpleBar(myHeaderCart, { autoHide: true });
  }
  /* header dropdowns scroll */

  /* Cart quantity settings */
  document.addEventListener("click", (e) => {
    const buttonPlus = e.target.closest(".product-quantity-plus");
    const buttonMinus = e.target.closest(".product-quantity-minus");
    if (buttonPlus) {
        const input = buttonPlus.parentElement.querySelector("input");
        let value = Number(input.value);
        if (value < 30) {
            input.value = value + 1;
        }
    }
    if (buttonMinus) {
        const input = buttonMinus.parentElement.querySelector("input");
        let value = Number(input.value);
        if (value > 0) {
            input.value = value - 1;
        }
    }
  });

  /* Theme Toggle Event Delegation */
  document.addEventListener("click", (e) => {
    const target = e.target.closest(".layout-setting");
    if (target) {
      e.preventDefault();
      toggleTheme();
    }
    const targetDouble = e.target.closest(".layout-setting-doublemenu");
    if (targetDouble) {
      e.preventDefault();
      toggleTheme1();
    }
    const targetFullscreen = e.target.closest('[data-bs-toggle="fullscreen"]');
    if (targetFullscreen) {
      e.preventDefault();
      openFullscreen();
    }
  });

  /* full screen */
  function openFullscreen() {
    let elem = document.documentElement;
    let open = document.querySelector(".full-screen-open");
    let close = document.querySelector(".full-screen-close");

    if (
      !document.fullscreenElement &&
      !document.webkitFullscreenElement &&
      !document.msFullscreenElement
    ) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
      if (close) {
        close.classList.add("d-block");
        close.classList.remove("d-none");
      }
      if (open) open.classList.add("d-none");
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      if (open) {
        open.classList.remove("d-none");
        open.classList.add("d-block");
      }
      if (close) {
        close.classList.remove("d-block");
        close.classList.add("d-none");
      }
    }
  }

})();
