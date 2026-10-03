/* ============================================================
   Atlas Interactions — Master JS
   Lenis + GSAP ScrollTrigger + sitewide interactive systems
   ============================================================ */

(function () {
  "use strict";

  // ── Reduced-motion gate ──────────────────────────────────
  var prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── GSAP & ScrollTrigger setup ───────────────────────────
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  // ── Lenis smooth scroll ──────────────────────────────────
  var lenis = null;
  if (typeof Lenis !== "undefined" && !prefersReduced) {
    lenis = new Lenis({
      duration: 1.2,
      easing: function (t) {
        return Math.min(1, 1.001 - Math.pow(2, -10 * t));
      },
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    // Wire Lenis into GSAP ScrollTrigger
    if (typeof ScrollTrigger !== "undefined") {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (time) {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      // Fallback RAF loop if no GSAP
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }

  // ── Branded load-in overlay ──────────────────────────────
  function initBrandOverlay() {
    if (prefersReduced) return;
    if (sessionStorage.getItem("atlas-loaded")) return;
    sessionStorage.setItem("atlas-loaded", "1");

    var overlay = document.createElement("div");
    overlay.id = "brand-overlay";
    overlay.innerHTML =
      '<div class="brand-bars">' +
      '<div class="brand-bar" style="--i:0"></div>' +
      '<div class="brand-bar" style="--i:1"></div>' +
      '<div class="brand-bar" style="--i:2"></div>' +
      "</div>";
    document.body.appendChild(overlay);

    // Force layout
    overlay.offsetHeight;

    if (typeof gsap !== "undefined") {
      var tl = gsap.timeline();
      tl.from(".brand-bar", {
        scaleY: 0,
        transformOrigin: "bottom",
        duration: 0.3,
        stagger: 0.08,
        ease: "power2.out",
      });
      tl.to(
        "#brand-overlay",
        {
          opacity: 0,
          duration: 0.3,
          ease: "power2.inOut",
          onComplete: function () {
            overlay.remove();
          },
        },
        "+=0.15"
      );
    } else {
      // CSS-only fallback
      setTimeout(function () {
        overlay.classList.add("done");
        setTimeout(function () {
          overlay.remove();
        }, 500);
      }, 500);
    }
  }

  // ── Scroll progress indicator ────────────────────────────
  function initScrollProgress() {
    var bar = document.getElementById("scroll-progress");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "scroll-progress";
      document.body.appendChild(bar);
    }
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      gsap.to(bar, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: document.documentElement,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.15,
        },
      });
    }
  }

  // ── Custom cursor (ring + dot) ───────────────────────────
  function initCursor() {
    // Only on devices with fine pointer
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches)
      return;

    var cursor = document.getElementById("custom-cursor");
    if (!cursor) {
      cursor = document.createElement("div");
      cursor.id = "custom-cursor";
      cursor.innerHTML = '<div class="cursor-dot"></div>';
      document.body.appendChild(cursor);
    }

    var cx = 0,
      cy = 0,
      tx = 0,
      ty = 0;

    document.addEventListener("mousemove", function (e) {
      tx = e.clientX;
      ty = e.clientY;
    });

    // Smooth follow
    if (!prefersReduced) {
      (function loop() {
        cx += (tx - cx) * 0.15;
        cy += (ty - cy) * 0.15;
        cursor.style.left = cx + "px";
        cursor.style.top = cy + "px";
        requestAnimationFrame(loop);
      })();
    } else {
      document.addEventListener("mousemove", function (e) {
        cursor.style.left = e.clientX + "px";
        cursor.style.top = e.clientY + "px";
      });
    }

    // Hover scaling
    document.addEventListener(
      "mouseover",
      function (e) {
        if (
          e.target.closest(
            "a, button, input, textarea, select, label, .quiz-opt, .opt-btn, [role='button']"
          )
        ) {
          cursor.classList.add("hover");
        }
      },
      true
    );
    document.addEventListener(
      "mouseout",
      function (e) {
        if (
          e.target.closest(
            "a, button, input, textarea, select, label, .quiz-opt, .opt-btn, [role='button']"
          )
        ) {
          cursor.classList.remove("hover");
        }
      },
      true
    );

    // Click fill
    document.addEventListener("mousedown", function () {
      cursor.classList.add("click");
    });
    document.addEventListener("mouseup", function () {
      cursor.classList.remove("click");
    });
  }

  // ── Magnetic buttons ─────────────────────────────────────
  function initMagneticButtons() {
    if (prefersReduced) return;
    var btns = document.querySelectorAll(".btn-primary, .btn-secondary, .nav-cta");
    btns.forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        if (typeof gsap !== "undefined") {
          gsap.to(btn, {
            x: x * 0.2,
            y: y * 0.2,
            duration: 0.3,
            ease: "power2.out",
          });
        }
      });
      btn.addEventListener("mouseleave", function () {
        if (typeof gsap !== "undefined") {
          gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });
        }
      });
    });
  }

  // ── Text reveal on scroll ────────────────────────────────
  function initTextReveal() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    var headings = document.querySelectorAll(".text-reveal");
    headings.forEach(function (h) {
      // Walk text nodes to preserve inner HTML (e.g. <span class="hl">)
      h.style.visibility = "visible";

      var walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT, null, false);
      var textNodes = [];
      while (walker.nextNode()) textNodes.push(walker.currentNode);

      textNodes.forEach(function (node) {
        var words = node.textContent.split(/\s+/).filter(Boolean);
        if (!words.length) return;
        var frag = document.createDocumentFragment();
        words.forEach(function (word) {
          var span = document.createElement("span");
          span.className = "word-reveal";
          span.textContent = word;
          span.style.display = "inline-block";
          span.style.marginRight = "0.25em";
          frag.appendChild(span);
        });
        node.parentNode.replaceChild(frag, node);
      });

      if (prefersReduced) return;

      gsap.from(h.querySelectorAll(".word-reveal"), {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.04,
        ease: "power2.out",
        scrollTrigger: {
          trigger: h,
          start: "top 85%",
          once: true,
        },
      });
    });
  }

  // ── Icon stroke draw-in ──────────────────────────────────
  function initIconDraw() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    var paths = document.querySelectorAll(".icon-draw");
    paths.forEach(function (path) {
      try {
        var len = path.getTotalLength();
        path.style.strokeDasharray = len;
        path.style.strokeDashoffset = len;

        if (prefersReduced) {
          path.style.strokeDashoffset = 0;
          return;
        }

        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 1,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: path.closest("svg") || path,
            start: "top 85%",
            once: true,
          },
        });
      } catch (e) {
        // Some SVG elements don't support getTotalLength
        path.style.strokeDashoffset = 0;
      }
    });
  }

  // ── Margin Line Curve Animation ──────────────────────────
  function initCurveAnimation() {
    var sparkPath = document.querySelector(".sc-spark path");
    var sparkCircle = document.querySelector(".sc-spark circle");
    if (sparkPath && typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      var pathLen = 420; // Approx length
      try { pathLen = sparkPath.getTotalLength(); } catch(e) {}
      gsap.set(sparkPath, { strokeDasharray: pathLen, strokeDashoffset: pathLen });
      if (sparkCircle) gsap.set(sparkCircle, { scale: 0, transformOrigin: "center" });

      ScrollTrigger.create({
        trigger: ".statement-card",
        start: "top 85%",
        once: true,
        onEnter: function() {
          gsap.to(sparkPath, {
            strokeDashoffset: 0,
            duration: 1.5,
            ease: "power2.out"
          });
          if (sparkCircle) {
            gsap.to(sparkCircle, {
              scale: 1,
              duration: 0.4,
              delay: 1.3,
              ease: "back.out(2)"
            });
          }
        }
      });
    }
  }

  // ── Hero CTA Smooth Scroll ───────────────────────────────
  function initHeroCTA() {
    var mlStartBtn = document.getElementById("ml-start");
    if (mlStartBtn) {
      mlStartBtn.addEventListener("click", function(e) {
        e.preventDefault();
        if (typeof lenis !== "undefined" && lenis) {
          lenis.scrollTo("#ml-end", { duration: 1.5 });
          setTimeout(function() {
            window.location.href = "margin-line.html";
          }, 1500);
        } else if (typeof gsap !== "undefined" && typeof ScrollToPlugin !== "undefined") {
          gsap.to(window, { duration: 1.5, scrollTo: "#ml-end", onComplete: function() {
            window.location.href = "margin-line.html";
          }});
        } else {
          document.querySelector("#ml-end").scrollIntoView({ behavior: "smooth" });
          setTimeout(function() {
            window.location.href = "margin-line.html";
          }, 1000);
        }
      });
    }
  }


  // ── Count-up numbers ─────────────────────────────────────
  function initCountUp() {
    var els = document.querySelectorAll(".count-up");
    if (!els.length) return;

    els.forEach(function (el) {
      if (el.dataset.counted) return;

      var target = parseFloat(el.getAttribute("data-target"));
      var duration = parseInt(el.getAttribute("data-duration") || "1500", 10);
      var prefix = el.getAttribute("data-prefix") || "";
      var suffix = el.getAttribute("data-suffix") || "";
      var isDec = String(target).indexOf(".") !== -1;

      function animate() {
        if (el.dataset.counted) return;
        el.dataset.counted = "1";

        if (prefersReduced) {
          el.textContent = prefix + target + suffix;
          return;
        }

        if (typeof gsap !== "undefined") {
          var obj = { val: 0 };
          gsap.to(obj, {
            val: target,
            duration: duration / 1000,
            ease: "power2.out",
            onUpdate: function () {
              el.textContent =
                prefix +
                (isDec ? obj.val.toFixed(1) : Math.floor(obj.val)) +
                suffix;
            },
            onComplete: function () {
              el.textContent = prefix + target + suffix;
            },
          });
        } else {
          // Fallback rAF
          var start = null;
          function step(timestamp) {
            if (!start) start = timestamp;
            var progress = Math.min((timestamp - start) / duration, 1);
            var ease = 1 - Math.pow(1 - progress, 4);
            var current = ease * target;
            el.textContent =
              prefix + (isDec ? current.toFixed(1) : Math.floor(current)) + suffix;
            if (progress < 1) requestAnimationFrame(step);
            else el.textContent = prefix + target + suffix;
          }
          requestAnimationFrame(step);
        }
      }

      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.create({
          trigger: el,
          start: "top 90%",
          once: true,
          onEnter: animate,
        });
      } else {
        // Fallback IntersectionObserver
        var obs = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                animate();
                obs.unobserve(el);
              }
            });
          },
          { threshold: 0.1 }
        );
        obs.observe(el);
      }
    });
  }

  // ── Scroll reveal (GSAP upgrade of .reveal) ─────────────
  function initScrollReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;

    if (
      typeof gsap !== "undefined" &&
      typeof ScrollTrigger !== "undefined" &&
      !prefersReduced
    ) {
      els.forEach(function (el) {
        gsap.fromTo(el,
          { y: 26, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              once: true,
            },
          }
        );
      });
    } else {
      // Fallback: IntersectionObserver or instant
      if (prefersReduced) {
        els.forEach(function (el) {
          el.classList.add("visible");
        });
        return;
      }
      if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                io.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
        );
        els.forEach(function (el) {
          io.observe(el);
        });
      } else {
        els.forEach(function (el) {
          el.classList.add("visible");
        });
      }
    }
  }

  // ── Marquee pause on hover ───────────────────────────────
  function initMarquee() {
    var marquees = document.querySelectorAll(".trust-marquee");
    marquees.forEach(function (m) {
      var track = m.querySelector(".trust-track");
      if (!track) return;
      if (prefersReduced) {
        track.style.animationPlayState = "paused";
        return;
      }
      m.addEventListener("mouseenter", function () {
        track.style.animationPlayState = "paused";
      });
      m.addEventListener("mouseleave", function () {
        track.style.animationPlayState = "running";
      });
    });
  }

  // ── Draw-path observer (legacy compat) ───────────────────
  function initDrawPaths() {
    var paths = document.querySelectorAll(".draw-path");
    if (!paths.length) return;

    if (prefersReduced) {
      paths.forEach(function (p) {
        p.classList.add("drawn");
      });
      return;
    }

    if (
      typeof gsap !== "undefined" &&
      typeof ScrollTrigger !== "undefined"
    ) {
      paths.forEach(function (path) {
        ScrollTrigger.create({
          trigger: path.closest("svg") || path,
          start: "top 85%",
          once: true,
          onEnter: function () {
            path.classList.add("drawn");
          },
        });
      });
    } else if ("IntersectionObserver" in window) {
      var obs = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("drawn");
            }
          });
        },
        { threshold: 0.2 }
      );
      paths.forEach(function (p) {
        obs.observe(p);
      });
    }
  }

  // ── UTM Tracking ─────────────────────────────────────────
  function initUTMs() {
    var params = new URLSearchParams(window.location.search);
    var trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'];
    
    trackingParams.forEach(function(param) {
      if (params.has(param)) {
        sessionStorage.setItem(param, params.get(param));
      }
    });

    if (!sessionStorage.getItem('landing_page')) {
      sessionStorage.setItem('landing_page', window.location.href.split('?')[0]);
    }
    if (!sessionStorage.getItem('referrer') && document.referrer) {
      sessionStorage.setItem('referrer', document.referrer);
    }
  }

  // ── Global Event Tracking ────────────────────────────────
  function initEventTracking() {
    document.addEventListener('click', function(e) {
      var a = e.target.closest('a');
      if (!a) return;
      var href = a.getAttribute('href') || '';
      
      window.dataLayer = window.dataLayer || [];
      
      if (href.indexOf('tel:') === 0) {
        window.dataLayer.push({ event: 'phone_click' });
      } else if (href.indexOf('mailto:') === 0) {
        window.dataLayer.push({ event: 'email_click' });
      } else if (href.indexOf('/financial-health-review') !== -1 || href.indexOf('calendly.com') !== -1) {
        window.dataLayer.push({ event: 'booking_click' });
      }
    });
  }

  // ── Init everything on DOM ready ─────────────────────────
  function init() {
    initUTMs();
    initEventTracking();
    initBrandOverlay();
    initScrollProgress();
    // initCursor(); // Disabled — using normal browser cursor
    initMagneticButtons();
    initTextReveal();
    initIconDraw();
    initCountUp();
    initCurveAnimation();
    initHeroCTA();
    initScrollReveal();
    initMarquee();
    initDrawPaths();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Expose for page-specific scripts
  window.AtlasInteractions = {
    lenis: lenis,
    prefersReduced: prefersReduced,
    initCountUp: initCountUp,
    initIconDraw: initIconDraw,
    initDrawPaths: initDrawPaths,
    initScrollReveal: initScrollReveal,
  };
})();

// Mobile menu toggle
window.toggleMobileMenu = function() {
  var nav = document.querySelector('.nav-links');
  var overlay = document.querySelector('.mobile-overlay');
  if (!nav || !overlay) return;
  
  var isMenuOpen = nav.classList.contains('active');
  if (isMenuOpen) {
    nav.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  } else {
    nav.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};
