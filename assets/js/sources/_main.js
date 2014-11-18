var elem = document.getElementsByTagName("body")[0];

var f = function(){
  elem.addClass('niceday');
};
(function(f){var t=setInterval(function(){if(document.readyState=="complete"){clearInterval(t);f();}},9);})(f);


// var elem = document.getElementById('foo');

// elem.addClass('bar');
// alert(elem.hasClass('bar'));

// elem.removeClass('bar');
// alert(elem.hasClass('bar'));

// elem.toggleClass('bar');
// alert(elem.hasClass('bar'));

// elem.addClass('bar1')
//     .addClass('bar2')
//     .removeClass('bar1')
//     .toggleClass('bar3');
// alert(elem.classList);