(function () {
    "use strict";
    
    const myElement = document.getElementById('sidebar-scroll');
    if(myElement && typeof SimpleBar !== 'undefined') {
        new SimpleBar(myElement, { autoHide: true });
    }
    
})();