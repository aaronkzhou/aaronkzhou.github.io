import anime from 'animejs'
import charming from 'charming'
import imagesLoaded from 'imagesloaded'
import { extend } from './helper'
import { PieceMaker } from './helper/piece-maker'
import { GlitchFx } from './helper/glitchfx'

(window => {
  const DOM = {};
  let pm, gfx;
  let mode = 'design', disablePageFx, isAnimating;

  window.PieceMaker = PieceMaker;
  window.GlitchFx = GlitchFx;

  DOM.body = document.body;
  DOM.loading = document.querySelector('.loading');
  DOM.switchCtrls = document.querySelector('.switch');
  DOM.switchModeCtrls = {
    'design': DOM.switchCtrls.firstElementChild,
    'code': DOM.switchCtrls.lastElementChild
  };
  DOM.pieces = document.querySelector('.pieces');
  DOM.glitchElems = document.querySelectorAll('[data-glitch]');
  DOM.contact = {
    el: document.querySelector('.contact-link')
  };
  DOM.title = {
    el: document.querySelector('.title > .title__inner')
  };
  DOM.menuCtrl = document.querySelector('.btn--menu');
  DOM.menu = {
    'design': {
      'wrapper': document.querySelector('.menu'),
      'items': document.querySelector('.menu').firstElementChild.querySelectorAll('.menu__inner a')
    },
    'code': {
      'wrapper': document.querySelector('.menu--code'),
      'items': document.querySelectorAll('.menu--code > .menu__inner a')
    }
  };
  DOM.overlay = document.querySelector('.overlay');

  function init() {
    imagesLoaded(DOM.body, { background: true }, function () {
      // Remove page loader.
      DOM.loading.classList.add('loading--hide');
      // Create the image pieces.
      pm = new PieceMaker(DOM.pieces);
      // Start the squares loop effect on the main image.
      pm.loopFx();
      // Glitch effect on some elements (title, contact and coder link) in the page.
      gfx = new GlitchFx(DOM.glitchElems);
      // Split the title, contact and code menu items into spans/letters.
      wordsToLetters();
      // Init/Bind events
      initEvents();
    });
  }

  function wordsToLetters() {
    // Title.
    charming(DOM.title.el);
    DOM.title.letters = [].slice.call(DOM.title.el.querySelectorAll('span'));
    // Contact.
    charming(DOM.contact.el);
    DOM.contact.letters = [].slice.call(DOM.contact.el.querySelectorAll('span'));
    // Menu items (code mode).
    DOM.menuCodeItemLetters = [];
    [].slice.call(DOM.menu.code.items).forEach(function (item) {
      charming(item);
      DOM.menuCodeItemLetters.push([].slice.call(item.querySelectorAll('span')));
    });
  }

  function initEvents() {
    DOM.switchModeCtrls.design.addEventListener('click', switchMode);
    DOM.switchModeCtrls.code.addEventListener('click', switchMode);

    const pauseFxFn = function () {
      pm.stopLoopFx();
      gfx.stopGlitch();
      pm.removeTilt();
    },

      playFxFn = function () {
        pm.loopFx();
        if (gfx.isInactive) {
          gfx.glitch();
        }
        pm.initTilt();
      },

      contactMouseEnterEvFn = function (ev) {
        if (isAnimating) return false;
        if (mode === 'design') {
          pauseFxFn();
        }
        pm.fxCustom(mode === 'design' ? 'left' : 'right');
      },

      contactMouseLeaveEvFn = function (ev) {
        if (isAnimating || !pm.fxCustomTriggered) return false;

        pm.fxCustomReset(mode === 'design' ? 'left' : 'right', function () {
          if (!disablePageFx) {
            playFxFn();
          }
        });
      },

      switchMouseEnterEvFn = function (ev) {
        if (disablePageFx || isAnimating) return;
        pauseFxFn();
      },

      switchMouseLeaveEvFn = function (ev) {
        if (disablePageFx || isAnimating) return;
        playFxFn();
      };

    DOM.contact.el.addEventListener('mouseenter', contactMouseEnterEvFn);
    DOM.contact.el.addEventListener('mouseleave', contactMouseLeaveEvFn);
    DOM.switchCtrls.addEventListener('mouseenter', switchMouseEnterEvFn);
    DOM.switchCtrls.addEventListener('mouseleave', switchMouseLeaveEvFn);
  }

  function switchMode(ev) {
    ev.preventDefault();

    if (isAnimating) {
      return false;
    }
    isAnimating = true;

    // mode: design||code.
    mode = ev.target === DOM.switchModeCtrls.code ? 'code' : 'design';

    switchOverlay();

    if (mode === 'code') {
      disablePageFx = true;
      pm.removeTilt();
      pm.stopLoopFx();
      gfx.stopGlitch();
    }

    // Change current class on the designer/coder links.
    DOM.switchModeCtrls[mode === 'code' ? 'design' : 'code'].classList.remove('switch__item--current');
    DOM.switchModeCtrls[mode].classList.add('switch__item--current');

    // Switch the page content.
    switchContent();

    // Animate the pieces.
    pm.animatePieces(mode === 'code' ? 'out' : 'in', function () {
      isAnimating = false;
      if (mode === 'design') {
        pm.initTilt();
        pm.loopFx();
        gfx.glitch();
        disablePageFx = false;
      }
    });
  }

  function switchOverlay() {
    anime.remove(DOM.overlay);
    anime({
      targets: DOM.overlay,
      duration: 800,
      easing: 'linear',
      opacity: mode === 'code' ? 1 : 0
    });
  }

  function switchContent() {
    // Change switchCtrls mode.
    DOM.switchCtrls.classList.remove('mode--' + (mode === 'code' ? 'design' : 'code'));
    DOM.switchCtrls.classList.add('mode--' + mode);

    if (mode === 'code') {
      switchToCode();
    }
    else {
      switchToDesign();
    }
  }

  function switchToCode() {
    const hideDesign = function (target, callback) {
      let animeOpts = {};

      if (typeof target === 'string') {
        animeOpts.targets = DOM[target].el || DOM[target];
        animeOpts.duration = 400;
        animeOpts.easing = 'easeInQuint';
        animeOpts.scale = 0.3;
      }
      else {
        animeOpts.targets = target;
        animeOpts.duration = 100;
        animeOpts.delay = function (t, i) {
          return i * 100;
        };
        animeOpts.easing = 'easeInQuad';
        animeOpts.translateY = '-75%';
      }

      animeOpts.opacity = { value: 0, easing: 'linear' };
      animeOpts.complete = callback;

      anime.remove(animeOpts.targets);
      anime(animeOpts);
    },
      showCode = function (target) {
        const el = DOM[target].el || DOM[target];

        if (target === 'title' || target === 'contact' || target === 'menuCtrl') {
          el.classList.remove('mode--design');
          el.classList.add('mode--code');
        }
        if (DOM[target].letters) {
          animateLetters(DOM[target].letters, 'in', {
            begin: function () {
              DOM[target].el.style.opacity = 1;
              DOM[target].el.style.transform = 'none';
            }
          });
        }
        else {
          el.style.opacity = 1;
          el.style.transform = 'none';
        }
      };

    // Animate the title, contact, menu ctrl and menu items out and show the code mode version of these elements.
    // Title:
    hideDesign('title', function () {
      showCode('title');
    });
    // Contact:
    hideDesign('contact', function () {
      showCode('contact');
    });
    // Menu ctrl:
    hideDesign('menuCtrl', function () {
      showCode('menuCtrl');
    });
    // Menu links:
    hideDesign(DOM.menu['design'].items, function () {
      DOM.menu['design'].wrapper.style.display = 'none';

      animateLetters(DOM.menuCodeItemLetters, 'in', {
        delay: function (t, i) {
          return i * 30
        },
        begin: function () {
          DOM.menu['code'].wrapper.style.display = 'block';
        }
      });
    });
  }

  function switchToDesign() {
    const showDesign = function (target) {
      let animeOpts = {};

      if (typeof target === 'string') {
        let el = DOM[target].el || DOM[target]

        el.classList.remove('mode--code');
        el.classList.add('mode--design');

        animeOpts.targets = el;
        animeOpts.duration = 400;
        animeOpts.easing = 'easeOutQuint';
        animeOpts.scale = [0.3, 1];

        animeOpts.begin = function () {
          if (DOM[target].letters !== undefined) {
            DOM[target].letters.forEach(function (letter) {
              letter.style.opacity = 1;
            });
          }
        }
      } else {
        animeOpts.targets = target;
        animeOpts.duration = 600;
        animeOpts.delay = function (t, i, c) {
          return (c - i - 1) * 100;
        };
        animeOpts.easing = 'easeOutExpo';
        animeOpts.translateY = ['-75%', '0%']
      }

      animeOpts.opacity = { value: [0, 1], easing: 'linear' };

      anime.remove(animeOpts.targets);
      anime(animeOpts);
    };


    // Animate the title, contact, menu ctrl and menu items out and show the design mode version of these elements.
    // Title:
    animateLetters(DOM.title.letters, 'out', {
      complete: function () {
        showDesign('title');
      }
    });
    // Contact:
    animateLetters(DOM.contact.letters, 'out', {
      complete: function () {
        showDesign('contact');
      }
    });
    // Menu ctrl:
    DOM.menuCtrl.style.opacity = 0;
    showDesign('menuCtrl');
    // Menu links:
    animateLetters(DOM.menuCodeItemLetters, 'out', {
      delay: function (t, i, c) {
        return (c - i - 1) * 10;
      },
      duration: 20,
      complete: function () {
        DOM.menu['code'].wrapper.style.display = 'none';
        DOM.menu['design'].wrapper.style.display = 'block';
        showDesign(DOM.menu['design'].items);
      }
    });
  }

  function animateLetters(letters, dir, extraAnimeOpts) {
    let animeOpts = {};

    animeOpts.targets = letters;
    animeOpts.duration = 50;
    animeOpts.delay = function (t, i, c) {
      return dir === 'in' ? i * 50 : (c - i - 1) * 50;
    };
    animeOpts.easing = dir === 'in' ? 'easeInQuint' : 'easeOutQuint';
    animeOpts.opacity = dir === 'in' ? [0, 1] : [1, 0];
    extend(animeOpts, extraAnimeOpts);

    anime.remove(animeOpts.targets);
    anime(animeOpts);
  }

  init();

})(window);
