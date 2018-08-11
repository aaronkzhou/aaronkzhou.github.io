import { extend } from './'
import { getRandomInt } from './'

export class GlitchFx {
    constructor(elems, options) {
        this.elems = [].slice.call(elems);
        this.options = extend({}, {
            // Max and Min values for the time when to start the glitch effect.
            glitchStart: {min: 500, max: 4000},
            // Max and Min values of time that an element keeps each glitch state. 
            // In this case we are alternating classes so this is the time that an element will have one class before it gets replaced.
            glitchState: {min: 50, max: 250},
            // Number of times the class is changed per glitch iteration.
            glitchTotalIterations: 6
        });
        extend(this.options, options);
        this.glitch();
    }

    glitch() {
        this.isInactive = false;
        const self = this;
        clearTimeout(this.glitchTimeout);
        this.glitchTimeout = setTimeout(function() {
            self.iteration = 0;
            self._glitchState(function() {
                if( !self.isInactive ) {
                    self.glitch();
                }
            });
        }, getRandomInt(this.options.glitchStart.min, this.options.glitchStart.max));
    }

    _glitchState(callback) {
        const self = this;

        if( this.iteration < this.options.glitchTotalIterations ) {
            this.glitchStateTimeout = setTimeout(function() {
                self.elems.forEach(function(el) {
                    if( el.classList.contains('mode--code') ) {
                        el.classList.add('mode--design');
                        el.classList.remove('mode--code');
                    }
                    else {
                        el.classList.add('mode--code');
                        el.classList.remove('mode--design');
                    }
                    el.style.transform = self.iteration%2 !== 0 ? 'translate3d(0,0,0)' : 'translate3d(' + getRandomInt(-5,5) + 'px,' + getRandomInt(-5,5) + 'px,0)';
                });

                self.iteration++;
                if( !self.isInactive ) {
                    self._glitchState(callback);
                }
                
            }, getRandomInt(this.options.glitchState.min, this.options.glitchState.max));
        }
        else {
            callback.call();
        }
    }

    stopGlitch() {
        this.isInactive = true;
        clearTimeout(this.glitchTimeout);
        clearTimeout(this.glitchStateTimeout);
        // Reset styles.
        this.elems.forEach(el => {
            if( el.classList.contains('mode--code') ) {
                el.classList.add('mode--design');
                el.classList.remove('mode--code');
                el.style.transform = 'translate3d(0,0,0)';
            }
        });
    };
}