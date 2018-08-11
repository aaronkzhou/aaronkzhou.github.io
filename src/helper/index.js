// Helper vars and functions.
export const extend = (a, b) => {
    for(let key in b) { 
        if( b.hasOwnProperty( key ) ) {
            a[key] = b[key];
        }
    }
    return a;
}

export const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// from http://www.quirksmode.org/js/events_properties.html#position
export const getMousePos = e => {
    let posx = 0;
    let posy = 0;

    if (!e) e = window.event;

    if (e.pageX || e.pageY) {
        posx = e.pageX;
        posy = e.pageY;
    } else if (e.clientX || e.clientY) {
        posx = e.clientX + document.body.scrollLeft
            + document.documentElement.scrollLeft;
        posy = e.clientY + document.body.scrollTop
            + document.documentElement.scrollTop;
    }

    return {
        x : posx,
        y : posy
    }
}

// From https://davidwalsh.name/javascript-debounce-function.
export const debounce = (func, wait, immediate) => {
    let timeout;
    return () => {
        let context = this, args = arguments;
        let later = () => {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };

        let callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    }
};