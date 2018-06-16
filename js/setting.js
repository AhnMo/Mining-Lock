(function () {
function toggleContainers(activeIndex) {
    loopEls('tab-cnt', function(e, i) {
        if(i === activeIndex) {
            e.style.display = 'block';
        } else {
            e.style.display = 'none';
        }
    });
}

function toggleTab(elm, elIndex) {
    elm.style.backgroundColor = '#fff';
    elm.style.borderBottom = '1px solid #fff';

    loopEls('tablinks', function(el, index) {
        if(index === elIndex) {
            return;
        }
        el.style.backgroundColor = '#eee';
        el.style.borderBottom = '1px solid #ccc';
        toggleContainers(elIndex);
    });
}
});
