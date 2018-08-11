import anime from 'animejs'
import { extend, debounce, getMousePos } from './'

const is3DBuggy = navigator.userAgent.indexOf('Firefox') > 0

export class PieceMaker {
    constructor(el, options) {
        this.el = el;
        this.options = extend({}, {
            // Number of pieces / Layout (rows x cols).
            pieces: {rows: 14, columns: 10},
            // Main image tilt: max and min angles.
            tilt: {maxRotationX: -2, maxRotationY: 3, maxTranslationX: 6, maxTranslationY: -2}
        });
        extend(this.options, options);
        this._init();
    }

    _init() {
        // The source of the main image.
        this.imgsrc = this.el.style.backgroundImage.replace('url(','').replace(')','').replace(/\"/gi, "");
        // Window sizes.
        this.win = {width: window.innerWidth, height: window.innerHeight};
        // Container sizes.
        this.dimensions = {width:this.el.offsetWidth, height:this.el.offsetHeight};
        // Render all the pieces defined in the options.
        this._layout();
        // Init tilt.
        this.initTilt();
        // Init/Bind events
        this._initEvents();
    }

    _layout() {
        this.el.style.backgroundImage = this.el.getAttribute('data-img-code');

        // Create the pieces and add them to the DOM (append it to the main element).
        this.pieces = [];

        for (let r = 0; r < this.options.pieces.rows; ++r) {
            for (let c = 0; c < this.options.pieces.columns; ++c) {
                const piece = this._createPiece(r,c);    
                piece.style.backgroundPosition = -1*c*100 + '% ' + -1*100*r + '%';
                this.pieces.push(piece);
            }
        }
    };

    _createPiece(row, column) {
        const w = Math.round(this.dimensions.width/this.options.pieces.columns),
              h = Math.round(this.dimensions.height/this.options.pieces.rows),
              piece = document.createElement('div');

        piece.style.backgroundImage = 'url(' + this.imgsrc + ')';
        piece.className = 'piece';
        piece.style.width = w + 'px';
        piece.style.height = h + + 'px';
        piece.style.backgroundSize = w * this.options.pieces.columns + 'px auto';
        piece.setAttribute('data-column', column);
        piece.setAttribute('data-delay', anime.random(-25,25));
        this.el.appendChild(piece);
        this.el.style.width = w * this.options.pieces.columns + 'px';
        this.el.style.height = h * this.options.pieces.rows + 'px';

        return piece;
    };

    initTilt() {
        if(is3DBuggy) return;
        this.el.style.transition = 'transform 0.2s ease-out';
        this.tilt = true;
    };

    removeTilt() {
        if(is3DBuggy) return;
        this.tilt = false;
    };

    _initEvents() {
        const self = this,
              // Mousemove event / Tilt functionality.
              onMouseMoveFn = function(ev) {
                requestAnimationFrame(function() {
                    if( !self.tilt ) {
                        if(is3DBuggy) {
                            self.el.style.transform = 'none';
                        }
                        return false;
                    }
                    const mousepos = getMousePos(ev),
                          rotX = 2*self.options.tilt.maxRotationX/self.win.height*mousepos.y - self.options.tilt.maxRotationX,
                          rotY = 2*self.options.tilt.maxRotationY/self.win.width*mousepos.x - self.options.tilt.maxRotationY,
                          transX = 2*self.options.tilt.maxTranslationX/self.win.width*mousepos.x - self.options.tilt.maxTranslationX,
                          transY = 2*self.options.tilt.maxTranslationY/self.win.height*mousepos.y - self.options.tilt.maxTranslationY;

                    self.el.style.transform = 'perspective(1000px) translate3d(' + transX + 'px,' + transY + 'px,0) rotate3d(1,0,0,' + rotX + 'deg) rotate3d(0,1,0,' + rotY + 'deg)';
                });
              },
              // Window resize.
              debounceResizeFn = debounce(function() {
                self.win = {width: window.innerWidth, height: window.innerHeight};
                self.el.style.width = self.el.style.height = '';
                const elBounds = self.el.getBoundingClientRect();
                self.dimensions = {width: elBounds.width, height: elBounds.height};
                for(let i = 0, len = self.pieces.length; i < len; ++i) {
                    const w = Math.round(self.dimensions.width/self.options.pieces.columns),
                          h = Math.round(self.dimensions.height/self.options.pieces.rows),
                          piece = self.pieces[i];
                    
                    piece.style.width = w + 'px';
                    piece.style.height = h + 'px';
                    piece.style.backgroundSize = w * self.options.pieces.columns + 'px auto';
                    self.el.style.width = w * self.options.pieces.columns + 'px';
                    self.el.style.height = h * self.options.pieces.rows + 'px';
                }
              }, 10);

        document.addEventListener('mousemove', onMouseMoveFn);
        window.addEventListener('resize', debounceResizeFn);
    };

    loopFx() {
        this.isLoopFXActive = true;
        // Switch main image's background image:
        this.el.style.backgroundImage = this.el.getAttribute('data-img-alt');

        const self = this;
        anime.remove(this.pieces);
        anime({
            targets: this.pieces,
            duration: 50,
            easing: 'linear',
            opacity: [
                {
                    value: function(t,i) {
                        return !anime.random(0,5) ? 0 : 1;
                    },
                    delay: function(t,i) {
                        return anime.random(0,2000);
                    }
                },
                {
                    value: 1,
                    delay: function(t,i) {
                        return anime.random(200,2000);    
                    }
                }
            ],
            complete: function() {
                if( self.isLoopFXActive ) {
                    self.loopFx();
                }
            }
        });
    };

    stopLoopFx() {
        this.isLoopFXActive = false;
        this.el.style.backgroundImage = this.el.getAttribute('data-img-code');
        anime.remove(this.pieces);
        for(let i = 0, len = this.pieces.length; i < len; ++i) {
            this.pieces[i].style.opacity = 1;
        }
    };

    animatePieces(dir, callback) {
        const self = this;
        anime.remove(this.pieces);
        anime({
            targets: this.pieces.reverse(),
            duration: dir === 'out' ? 600 : 500,
            delay: function(t,i) {
                return Math.max(0,i*6 + parseInt(t.getAttribute('data-delay')));
            },
            easing: dir === 'out' ? [0.2,1,0.3,1] : [0.8,1,0.3,1],
            translateX: dir === 'out' ? function(t,i) { 
                return t.getAttribute('data-column') < self.options.pieces.columns/2 ? anime.random(50,100) : anime.random(-100,-50);
            } : function(t,i) { 
                return t.getAttribute('data-column') < self.options.pieces.columns/2 ? [anime.random(50,100),0] : [anime.random(-100,-50),0];
            },
            translateY: dir === 'out' ? function(t,i) { 
                return [0,anime.random(-1000,-800)]; 
            } : function(t,i) { 
                return [anime.random(-1000,-800), 0]; 
            },
            opacity: {
                value: dir === 'out' ? 0 : 1,
                duration: dir === 'out' ? 600 : 300,
                easing: 'linear'
            },
            complete: callback
        });
    };

    fxCustom(dir) {
        this.fxCustomTriggered = true;
        const self = this;
        anime({
            targets: this.pieces.reverse().filter(function(t) {
                return t.getAttribute('data-column') < self.options.pieces.columns/2
            }),
            duration: dir === 'left' ? 400 : 200,
            easing: dir === 'left' ? [0.2,1,0.3,1] : [0.8,0,0.7,0],
            delay: function(t,i,c) {
                return dir === 'left' ? Math.max(0,i*5 + parseInt(t.getAttribute('data-delay'))) : Math.max(0,(c-1-i)*2 + parseInt(t.getAttribute('data-delay')));
            },
            translateX: function(t,i) { 
                return dir === 'left' ? anime.random(-500,-100) : [anime.random(-500,-100), 0];
            },
            translateY: function(t,i) { 
                return dir === 'left' ? anime.random(0,100) : [anime.random(0,100), 0];
            },
            opacity: {
                duration: dir === 'left' ? 200 : 200,
                value: dir === 'left' ? 0 : [0,1],
                easing: dir === 'left' ? 'linear' : [0.8,0,0.7,0]
            }
        });
    };

    fxCustomReset(dir, callback) {
        this.fxCustomTriggered = false;
        const self = this;
        anime.remove(this.pieces);
        anime({
            targets: this.pieces.reverse().filter(function(t) {
                return t.getAttribute('data-column') < self.options.pieces.columns/2
            }),
            duration: dir === 'left' ? 200 : 400,
            easing: dir === 'left' ? [0.8,0,0.7,0] : [0.2,1,0.3,1],
            delay: function(t,i,c) {
                return dir === 'left' ? Math.max(0,(c-1-i)*2 + parseInt(t.getAttribute('data-delay'))) : Math.max(0,i*5 + parseInt(t.getAttribute('data-delay')));
            },
            translateX: function(t,i) {
                return dir === 'left' ? 0 : anime.random(-500,-100);
            },
            translateY: function(t,i) {
                return dir === 'left' ? 0 : anime.random(0,100);
            },
            opacity: {
                duration: dir === 'left' ? 200 : 200,
                value: dir === 'left' ? 1 : [1,0],
                easing: dir === 'left' ? [0.8,0,0.7,0] : 'linear'
            },
            complete: callback
        });
    };
}