/*! responsive-nav.js 1.0.32
 * https://github.com/viljamis/responsive-nav.js
 * http://responsive-nav.com
 *
 * Copyright (c) 2014 @viljamis
 * Available under the MIT license
 */

(function (document, window, index) {

  "use strict";

  var responsiveNav = function (el, options) {

    var computed = !!window.getComputedStyle;
    
    // getComputedStyle polyfill
    if (!computed) {
      window.getComputedStyle = function(el) {
        this.el = el;
        this.getPropertyValue = function(prop) {
          var re = /(\-([a-z]){1})/g;
          if (prop === "float") {
            prop = "styleFloat";
          }
          if (re.test(prop)) {
            prop = prop.replace(re, function () {
              return arguments[2].toUpperCase();
            });
          }
          return el.currentStyle[prop] ? el.currentStyle[prop] : null;
        };
        return this;
      };
    }
    /* exported addEvent, removeEvent, getChildren, setAttributes, addClass, removeClass, forEach */
    // fn arg can be an object or a function, thanks to handleEvent
    // read more at: http://www.thecssninja.com/javascript/handleevent
    var addEvent = function (el, evt, fn, bubble) {
        if ("addEventListener" in el) {
          // BBOS6 doesn't support handleEvent, catch and polyfill
          try {
            el.addEventListener(evt, fn, bubble);
          } catch (e) {
            if (typeof fn === "object" && fn.handleEvent) {
              el.addEventListener(evt, function (e) {
                // Bind fn as this and set first arg as event object
                fn.handleEvent.call(fn, e);
              }, bubble);
            } else {
              throw e;
            }
          }
        } else if ("attachEvent" in el) {
          // check if the callback is an object and contains handleEvent
          if (typeof fn === "object" && fn.handleEvent) {
            el.attachEvent("on" + evt, function () {
              // Bind fn as this
              fn.handleEvent.call(fn);
            });
          } else {
            el.attachEvent("on" + evt, fn);
          }
        }
      },
    
      removeEvent = function (el, evt, fn, bubble) {
        if ("removeEventListener" in el) {
          try {
            el.removeEventListener(evt, fn, bubble);
          } catch (e) {
            if (typeof fn === "object" && fn.handleEvent) {
              el.removeEventListener(evt, function (e) {
                fn.handleEvent.call(fn, e);
              }, bubble);
            } else {
              throw e;
            }
          }
        } else if ("detachEvent" in el) {
          if (typeof fn === "object" && fn.handleEvent) {
            el.detachEvent("on" + evt, function () {
              fn.handleEvent.call(fn);
            });
          } else {
            el.detachEvent("on" + evt, fn);
          }
        }
      },
    
      getChildren = function (e) {
        if (e.children.length < 1) {
          throw new Error("The Nav container has no containing elements");
        }
        // Store all children in array
        var children = [];
        // Loop through children and store in array if child != TextNode
        for (var i = 0; i < e.children.length; i++) {
          if (e.children[i].nodeType === 1) {
            children.push(e.children[i]);
          }
        }
        return children;
      },
    
      setAttributes = function (el, attrs) {
        for (var key in attrs) {
          el.setAttribute(key, attrs[key]);
        }
      },
    
      addClass = function (el, cls) {
        if (el.className.indexOf(cls) !== 0) {
          el.className += " " + cls;
          el.className = el.className.replace(/(^\s*)|(\s*$)/g,"");
        }
      },
    
      removeClass = function (el, cls) {
        var reg = new RegExp("(\\s|^)" + cls + "(\\s|$)");
        el.className = el.className.replace(reg, " ").replace(/(^\s*)|(\s*$)/g,"");
      },
    
      // forEach method that passes back the stuff we need
      forEach = function (array, callback, scope) {
        for (var i = 0; i < array.length; i++) {
          callback.call(scope, i, array[i]);
        }
      };

    var nav,
      opts,
      navToggle,
      styleElement = document.createElement("style"),
      htmlEl = document.documentElement,
      hasAnimFinished,
      isMobile,
      navOpen;

    var ResponsiveNav = function (el, options) {
        var i;

        // Default options
        this.options = {
          animate: true,                    // Boolean: Use CSS3 transitions, true or false
          transition: 284,                  // Integer: Speed of the transition, in milliseconds
          label: "Menu",                    // String: Label for the navigation toggle
          insert: "before",                 // String: Insert the toggle before or after the navigation
          customToggle: "",                 // Selector: Specify the ID of a custom toggle
          closeOnNavClick: false,           // Boolean: Close the navigation when one of the links are clicked
          openPos: "relative",              // String: Position of the opened nav, relative or static
          navClass: "nav-collapse",         // String: Default CSS class. If changed, you need to edit the CSS too!
          navActiveClass: "js-nav-active",  // String: Class that is added to <html> element when nav is active
          jsClass: "js",                    // String: 'JS enabled' class which is added to <html> element
          init: function(){},               // Function: Init callback
          open: function(){},               // Function: Open callback
          close: function(){}               // Function: Close callback
        };

        // User defined options
        for (i in options) {
          this.options[i] = options[i];
        }

        // Adds "js" class for <html>
        addClass(htmlEl, this.options.jsClass);

        // Wrapper
        this.wrapperEl = el.replace("#", "");

        // Try selecting ID first
        if (document.getElementById(this.wrapperEl)) {
          this.wrapper = document.getElementById(this.wrapperEl);

        // If element with an ID doesn't exist, use querySelector
        } else if (document.querySelector(this.wrapperEl)) {
          this.wrapper = document.querySelector(this.wrapperEl);

        // If element doesn't exists, stop here.
        } else {
          throw new Error("The nav element you are trying to select doesn't exist");
        }

        // Inner wrapper
        this.wrapper.inner = getChildren(this.wrapper);

        // For minification
        opts = this.options;
        nav = this.wrapper;

        // Init
        this._init(this);
      };

    ResponsiveNav.prototype = {

      // Public methods
      destroy: function () {
        this._removeStyles();
        removeClass(nav, "closed");
        removeClass(nav, "opened");
        removeClass(nav, opts.navClass);
        removeClass(nav, opts.navClass + "-" + this.index);
        removeClass(htmlEl, opts.navActiveClass);
        nav.removeAttribute("style");
        nav.removeAttribute("aria-hidden");

        removeEvent(window, "resize", this, false);
        removeEvent(document.body, "touchmove", this, false);
        removeEvent(navToggle, "touchstart", this, false);
        removeEvent(navToggle, "touchend", this, false);
        removeEvent(navToggle, "mouseup", this, false);
        removeEvent(navToggle, "keyup", this, false);
        removeEvent(navToggle, "click", this, false);

        if (!opts.customToggle) {
          navToggle.parentNode.removeChild(navToggle);
        } else {
          navToggle.removeAttribute("aria-hidden");
        }
      },

      toggle: function () {
        if (hasAnimFinished === true) {
          if (!navOpen) {
            this.open();
          } else {
            this.close();
          }
        }
      },

      open: function () {
        if (!navOpen) {
          removeClass(nav, "closed");
          addClass(nav, "opened");
          addClass(htmlEl, opts.navActiveClass);
          addClass(navToggle, "active");
          nav.style.position = opts.openPos;
          setAttributes(nav, {"aria-hidden": "false"});
          navOpen = true;
          opts.open();
        }
      },

      close: function () {
        if (navOpen) {
          addClass(nav, "closed");
          removeClass(nav, "opened");
          removeClass(htmlEl, opts.navActiveClass);
          removeClass(navToggle, "active");
          setAttributes(nav, {"aria-hidden": "true"});

          if (opts.animate) {
            hasAnimFinished = false;
            setTimeout(function () {
              nav.style.position = "absolute";
              hasAnimFinished = true;
            }, opts.transition + 10);
          } else {
            nav.style.position = "absolute";
          }

          navOpen = false;
          opts.close();
        }
      },

      resize: function () {
        if (window.getComputedStyle(navToggle, null).getPropertyValue("display") !== "none") {

          isMobile = true;
          setAttributes(navToggle, {"aria-hidden": "false"});

          // If the navigation is hidden
          if (nav.className.match(/(^|\s)closed(\s|$)/)) {
            setAttributes(nav, {"aria-hidden": "true"});
            nav.style.position = "absolute";
          }

          this._createStyles();
          this._calcHeight();
        } else {

          isMobile = false;
          setAttributes(navToggle, {"aria-hidden": "true"});
          setAttributes(nav, {"aria-hidden": "false"});
          nav.style.position = opts.openPos;
          this._removeStyles();
        }
      },

      handleEvent: function (e) {
        var evt = e || window.event;

        switch (evt.type) {
        case "touchstart":
          this._onTouchStart(evt);
          break;
        case "touchmove":
          this._onTouchMove(evt);
          break;
        case "touchend":
        case "mouseup":
          this._onTouchEnd(evt);
          break;
        case "click":
          this._preventDefault(evt);
          break;
        case "keyup":
          this._onKeyUp(evt);
          break;
        case "resize":
          this.resize(evt);
          break;
        }
      },

      // Private methods
      _init: function () {
        this.index = index++;

        addClass(nav, opts.navClass);
        addClass(nav, opts.navClass + "-" + this.index);
        addClass(nav, "closed");
        hasAnimFinished = true;
        navOpen = false;

        this._closeOnNavClick();
        this._createToggle();
        this._transitions();
        this.resize();

        // IE8 hack
        var self = this;
        setTimeout(function () {
          self.resize();
        }, 20);

        addEvent(window, "resize", this, false);
        addEvent(document.body, "touchmove", this, false);
        addEvent(navToggle, "touchstart", this, false);
        addEvent(navToggle, "touchend", this, false);
        addEvent(navToggle, "mouseup", this, false);
        addEvent(navToggle, "keyup", this, false);
        addEvent(navToggle, "click", this, false);

        // Init callback
        opts.init();
      },

      _createStyles: function () {
        if (!styleElement.parentNode) {
          styleElement.type = "text/css";
          document.getElementsByTagName("head")[0].appendChild(styleElement);
        }
      },

      _removeStyles: function () {
        if (styleElement.parentNode) {
          styleElement.parentNode.removeChild(styleElement);
        }
      },

      _createToggle: function () {
        if (!opts.customToggle) {
          var toggle = document.createElement("a");
          toggle.innerHTML = opts.label;
          setAttributes(toggle, {
            "href": "#",
            "class": "nav-toggle"
          });

          if (opts.insert === "after") {
            nav.parentNode.insertBefore(toggle, nav.nextSibling);
          } else {
            nav.parentNode.insertBefore(toggle, nav);
          }

          navToggle = toggle;
        } else {
          var toggleEl = opts.customToggle.replace("#", "");

          if (document.getElementById(toggleEl)) {
            navToggle = document.getElementById(toggleEl);
          } else if (document.querySelector(toggleEl)) {
            navToggle = document.querySelector(toggleEl);
          } else {
            throw new Error("The custom nav toggle you are trying to select doesn't exist");
          }
        }
      },

      _closeOnNavClick: function () {
        if (opts.closeOnNavClick && "querySelectorAll" in document) {
          var links = nav.querySelectorAll("a"),
            self = this;
          forEach(links, function (i, el) {
            addEvent(links[i], "click", function () {
              if (isMobile) {
                self.toggle();
              }
            }, false);
          });
        }
      },

      _preventDefault: function(e) {
        if (e.preventDefault) {
          e.preventDefault();
          e.stopPropagation();
        } else {
          e.returnValue = false;
        }
      },

      _onTouchStart: function (e) {
        e.stopPropagation();
        if (opts.insert === "after") {
          addClass(document.body, "disable-pointer-events");
        }
        this.startX = e.touches[0].clientX;
        this.startY = e.touches[0].clientY;
        this.touchHasMoved = false;
        removeEvent(navToggle, "mouseup", this, false);
      },

      _onTouchMove: function (e) {
        if (Math.abs(e.touches[0].clientX - this.startX) > 10 ||
        Math.abs(e.touches[0].clientY - this.startY) > 10) {
          this.touchHasMoved = true;
        }
      },

      _onTouchEnd: function (e) {
        this._preventDefault(e);
        if (!this.touchHasMoved) {
          if (e.type === "touchend") {
            this.toggle();
            if (opts.insert === "after") {
              setTimeout(function () {
                removeClass(document.body, "disable-pointer-events");
              }, opts.transition + 300);
            }
            return;
          } else {
            var evt = e || window.event;
            // If it isn't a right click
            if (!(evt.which === 3 || evt.button === 2)) {
              this.toggle();
            }
          }
        }
      },

      _onKeyUp: function (e) {
        var evt = e || window.event;
        if (evt.keyCode === 13) {
          this.toggle();
        }
      },

      _transitions: function () {
        if (opts.animate) {
          var objStyle = nav.style,
            transition = "max-height " + opts.transition + "ms";

          objStyle.WebkitTransition = transition;
          objStyle.MozTransition = transition;
          objStyle.OTransition = transition;
          objStyle.transition = transition;
        }
      },

      _calcHeight: function () {
        var savedHeight = 0;
        for (var i = 0; i < nav.inner.length; i++) {
          savedHeight += nav.inner[i].offsetHeight;
        }
        var innerStyles = "." + opts.jsClass + " ." + opts.navClass + "-" + this.index + ".opened{max-height:" + savedHeight + "px !important}";

        if (styleElement.styleSheet) {
          styleElement.styleSheet.cssText = innerStyles;
        } else {
          styleElement.innerHTML = innerStyles;
        }

        innerStyles = "";
      }

    };

    return new ResponsiveNav(el, options);

  };

  window.responsiveNav = responsiveNav;

}(document, window, 0));
/* http://prismjs.com/download.html?themes=prism&languages=markup+css+clike+javascript+php+git&plugins=line-highlight+line-numbers */
self="undefined"!=typeof window?window:"undefined"!=typeof WorkerGlobalScope&&self instanceof WorkerGlobalScope?self:{};var Prism=function(){var e=/\blang(?:uage)?-(?!\*)(\w+)\b/i,t=self.Prism={util:{encode:function(e){return e instanceof n?new n(e.type,t.util.encode(e.content),e.alias):"Array"===t.util.type(e)?e.map(t.util.encode):e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/\u00a0/g," ")},type:function(e){return Object.prototype.toString.call(e).match(/\[object (\w+)\]/)[1]},clone:function(e){var n=t.util.type(e);switch(n){case"Object":var a={};for(var r in e)e.hasOwnProperty(r)&&(a[r]=t.util.clone(e[r]));return a;case"Array":return e.slice()}return e}},languages:{extend:function(e,n){var a=t.util.clone(t.languages[e]);for(var r in n)a[r]=n[r];return a},insertBefore:function(e,n,a,r){r=r||t.languages;var i=r[e],l={};for(var o in i)if(i.hasOwnProperty(o)){if(o==n)for(var s in a)a.hasOwnProperty(s)&&(l[s]=a[s]);l[o]=i[o]}return r[e]=l},DFS:function(e,n,a){for(var r in e)e.hasOwnProperty(r)&&(n.call(e,r,e[r],a||r),"Object"===t.util.type(e[r])?t.languages.DFS(e[r],n):"Array"===t.util.type(e[r])&&t.languages.DFS(e[r],n,r))}},highlightAll:function(e,n){for(var a,r=document.querySelectorAll('code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'),i=0;a=r[i++];)t.highlightElement(a,e===!0,n)},highlightElement:function(a,r,i){for(var l,o,s=a;s&&!e.test(s.className);)s=s.parentNode;if(s&&(l=(s.className.match(e)||[,""])[1],o=t.languages[l]),o){a.className=a.className.replace(e,"").replace(/\s+/g," ")+" language-"+l,s=a.parentNode,/pre/i.test(s.nodeName)&&(s.className=s.className.replace(e,"").replace(/\s+/g," ")+" language-"+l);var c=a.textContent;if(c){var g={element:a,language:l,grammar:o,code:c};if(t.hooks.run("before-highlight",g),r&&self.Worker){var u=new Worker(t.filename);u.onmessage=function(e){g.highlightedCode=n.stringify(JSON.parse(e.data),l),t.hooks.run("before-insert",g),g.element.innerHTML=g.highlightedCode,i&&i.call(g.element),t.hooks.run("after-highlight",g)},u.postMessage(JSON.stringify({language:g.language,code:g.code}))}else g.highlightedCode=t.highlight(g.code,g.grammar,g.language),t.hooks.run("before-insert",g),g.element.innerHTML=g.highlightedCode,i&&i.call(a),t.hooks.run("after-highlight",g)}}},highlight:function(e,a,r){var i=t.tokenize(e,a);return n.stringify(t.util.encode(i),r)},tokenize:function(e,n){var a=t.Token,r=[e],i=n.rest;if(i){for(var l in i)n[l]=i[l];delete n.rest}e:for(var l in n)if(n.hasOwnProperty(l)&&n[l]){var o=n[l];o="Array"===t.util.type(o)?o:[o];for(var s=0;s<o.length;++s){var c=o[s],g=c.inside,u=!!c.lookbehind,f=0,h=c.alias;c=c.pattern||c;for(var p=0;p<r.length;p++){var d=r[p];if(r.length>e.length)break e;if(!(d instanceof a)){c.lastIndex=0;var m=c.exec(d);if(m){u&&(f=m[1].length);var y=m.index-1+f,m=m[0].slice(f),v=m.length,k=y+v,b=d.slice(0,y+1),w=d.slice(k+1),N=[p,1];b&&N.push(b);var O=new a(l,g?t.tokenize(m,g):m,h);N.push(O),w&&N.push(w),Array.prototype.splice.apply(r,N)}}}}}return r},hooks:{all:{},add:function(e,n){var a=t.hooks.all;a[e]=a[e]||[],a[e].push(n)},run:function(e,n){var a=t.hooks.all[e];if(a&&a.length)for(var r,i=0;r=a[i++];)r(n)}}},n=t.Token=function(e,t,n){this.type=e,this.content=t,this.alias=n};if(n.stringify=function(e,a,r){if("string"==typeof e)return e;if("[object Array]"==Object.prototype.toString.call(e))return e.map(function(t){return n.stringify(t,a,e)}).join("");var i={type:e.type,content:n.stringify(e.content,a,r),tag:"span",classes:["token",e.type],attributes:{},language:a,parent:r};if("comment"==i.type&&(i.attributes.spellcheck="true"),e.alias){var l="Array"===t.util.type(e.alias)?e.alias:[e.alias];Array.prototype.push.apply(i.classes,l)}t.hooks.run("wrap",i);var o="";for(var s in i.attributes)o+=s+'="'+(i.attributes[s]||"")+'"';return"<"+i.tag+' class="'+i.classes.join(" ")+'" '+o+">"+i.content+"</"+i.tag+">"},!self.document)return self.addEventListener?(self.addEventListener("message",function(e){var n=JSON.parse(e.data),a=n.language,r=n.code;self.postMessage(JSON.stringify(t.util.encode(t.tokenize(r,t.languages[a])))),self.close()},!1),self.Prism):self.Prism;var a=document.getElementsByTagName("script");return a=a[a.length-1],a&&(t.filename=a.src,document.addEventListener&&!a.hasAttribute("data-manual")&&document.addEventListener("DOMContentLoaded",t.highlightAll)),self.Prism}();"undefined"!=typeof module&&module.exports&&(module.exports=Prism);;
Prism.languages.markup={comment:/<!--[\w\W]*?-->/g,prolog:/<\?.+?\?>/,doctype:/<!DOCTYPE.+?>/,cdata:/<!\[CDATA\[[\w\W]*?]]>/i,tag:{pattern:/<\/?[\w:-]+\s*(?:\s+[\w:-]+(?:=(?:("|')(\\?[\w\W])*?\1|[^\s'">=]+))?\s*)*\/?>/gi,inside:{tag:{pattern:/^<\/?[\w:-]+/i,inside:{punctuation:/^<\/?/,namespace:/^[\w-]+?:/}},"attr-value":{pattern:/=(?:('|")[\w\W]*?(\1)|[^\s>]+)/gi,inside:{punctuation:/=|>|"/g}},punctuation:/\/?>/g,"attr-name":{pattern:/[\w:-]+/g,inside:{namespace:/^[\w-]+?:/}}}},entity:/\&#?[\da-z]{1,8};/gi},Prism.hooks.add("wrap",function(t){"entity"===t.type&&(t.attributes.title=t.content.replace(/&amp;/,"&"))});;
Prism.languages.css={comment:/\/\*[\w\W]*?\*\//g,atrule:{pattern:/@[\w-]+?.*?(;|(?=\s*{))/gi,inside:{punctuation:/[;:]/g}},url:/url\((["']?).*?\1\)/gi,selector:/[^\{\}\s][^\{\};]*(?=\s*\{)/g,property:/(\b|\B)[\w-]+(?=\s*:)/gi,string:/("|')(\\?.)*?\1/g,important:/\B!important\b/gi,punctuation:/[\{\};:]/g,"function":/[-a-z0-9]+(?=\()/gi},Prism.languages.markup&&Prism.languages.insertBefore("markup","tag",{style:{pattern:/<style[\w\W]*?>[\w\W]*?<\/style>/gi,inside:{tag:{pattern:/<style[\w\W]*?>|<\/style>/gi,inside:Prism.languages.markup.tag.inside},rest:Prism.languages.css}}});;
Prism.languages.clike={comment:[{pattern:/(^|[^\\])\/\*[\w\W]*?\*\//g,lookbehind:!0},{pattern:/(^|[^\\:])\/\/.*?(\r?\n|$)/g,lookbehind:!0}],string:/("|')(\\?.)*?\1/g,"class-name":{pattern:/((?:(?:class|interface|extends|implements|trait|instanceof|new)\s+)|(?:catch\s+\())[a-z0-9_\.\\]+/gi,lookbehind:!0,inside:{punctuation:/(\.|\\)/}},keyword:/\b(if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/g,"boolean":/\b(true|false)\b/g,"function":{pattern:/[a-z0-9_]+\(/gi,inside:{punctuation:/\(/}},number:/\b-?(0x[\dA-Fa-f]+|\d*\.?\d+([Ee]-?\d+)?)\b/g,operator:/[-+]{1,2}|!|<=?|>=?|={1,3}|&{1,2}|\|?\||\?|\*|\/|\~|\^|\%/g,ignore:/&(lt|gt|amp);/gi,punctuation:/[{}[\];(),.:]/g};;
Prism.languages.javascript=Prism.languages.extend("clike",{keyword:/\b(break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|false|finally|for|function|get|if|implements|import|in|instanceof|interface|let|new|null|package|private|protected|public|return|set|static|super|switch|this|throw|true|try|typeof|var|void|while|with|yield)\b/g,number:/\b-?(0x[\dA-Fa-f]+|\d*\.?\d+([Ee]-?\d+)?|NaN|-?Infinity)\b/g}),Prism.languages.insertBefore("javascript","keyword",{regex:{pattern:/(^|[^/])\/(?!\/)(\[.+?]|\\.|[^/\r\n])+\/[gim]{0,3}(?=\s*($|[\r\n,.;})]))/g,lookbehind:!0}}),Prism.languages.markup&&Prism.languages.insertBefore("markup","tag",{script:{pattern:/<script[\w\W]*?>[\w\W]*?<\/script>/gi,inside:{tag:{pattern:/<script[\w\W]*?>|<\/script>/gi,inside:Prism.languages.markup.tag.inside},rest:Prism.languages.javascript}}});;
Prism.languages.php=Prism.languages.extend("clike",{keyword:/\b(and|or|xor|array|as|break|case|cfunction|class|const|continue|declare|default|die|do|else|elseif|enddeclare|endfor|endforeach|endif|endswitch|endwhile|extends|for|foreach|function|include|include_once|global|if|new|return|static|switch|use|require|require_once|var|while|abstract|interface|public|implements|private|protected|parent|throw|null|echo|print|trait|namespace|final|yield|goto|instanceof|finally|try|catch)\b/gi,constant:/\b[A-Z0-9_]{2,}\b/g,comment:{pattern:/(^|[^\\])(\/\*[\w\W]*?\*\/|(^|[^:])(\/\/|#).*?(\r?\n|$))/g,lookbehind:!0}}),Prism.languages.insertBefore("php","keyword",{delimiter:/(\?>|<\?php|<\?)/gi,variable:/(\$\w+)\b/gi,"package":{pattern:/(\\|namespace\s+|use\s+)[\w\\]+/g,lookbehind:!0,inside:{punctuation:/\\/}}}),Prism.languages.insertBefore("php","operator",{property:{pattern:/(->)[\w]+/g,lookbehind:!0}}),Prism.languages.markup&&(Prism.hooks.add("before-highlight",function(e){"php"===e.language&&(e.tokenStack=[],e.backupCode=e.code,e.code=e.code.replace(/(?:<\?php|<\?)[\w\W]*?(?:\?>)/gi,function(n){return e.tokenStack.push(n),"{{{PHP"+e.tokenStack.length+"}}}"}))}),Prism.hooks.add("before-insert",function(e){"php"===e.language&&(e.code=e.backupCode,delete e.backupCode)}),Prism.hooks.add("after-highlight",function(e){if("php"===e.language){for(var n,a=0;n=e.tokenStack[a];a++)e.highlightedCode=e.highlightedCode.replace("{{{PHP"+(a+1)+"}}}",Prism.highlight(n,e.grammar,"php"));e.element.innerHTML=e.highlightedCode}}),Prism.hooks.add("wrap",function(e){"php"===e.language&&"markup"===e.type&&(e.content=e.content.replace(/(\{\{\{PHP[0-9]+\}\}\})/g,'<span class="token php">$1</span>'))}),Prism.languages.insertBefore("php","comment",{markup:{pattern:/<[^?]\/?(.*?)>/g,inside:Prism.languages.markup},php:/\{\{\{PHP[0-9]+\}\}\}/g}));;
Prism.languages.git={comment:/^#.*$/m,string:/("|')(\\?.)*?\1/gm,command:{pattern:/^.*\$ git .*$/m,inside:{parameter:/\s(--|-)\w+/m}},coord:/^@@.*@@$/m,deleted:/^-(?!-).+$/m,inserted:/^\+(?!\+).+$/m,commit_sha1:/^commit \w{40}$/m}
;
!function(){function e(e,t){return Array.prototype.slice.call((t||document).querySelectorAll(e))}function t(e,t){return t=" "+t+" ",(" "+e.className+" ").replace(/[\n\t]/g," ").indexOf(t)>-1}function n(e,n,r){for(var i,a=n.replace(/\s+/g,"").split(","),l=+e.getAttribute("data-line-offset")||0,o=parseFloat(getComputedStyle(e).lineHeight),d=0;i=a[d++];){i=i.split("-");var c=+i[0],h=+i[1]||c,s=document.createElement("div");s.textContent=Array(h-c+2).join(" \r\n"),s.className=(r||"")+" line-highlight",t(e,"line-numbers")||(s.setAttribute("data-start",c),h>c&&s.setAttribute("data-end",h)),s.style.top=(c-l-1)*o+"px",t(e,"line-numbers")?e.appendChild(s):(e.querySelector("code")||e).appendChild(s)}}function r(){var t=location.hash.slice(1);e(".temporary.line-highlight").forEach(function(e){e.parentNode.removeChild(e)});var r=(t.match(/\.([\d,-]+)$/)||[,""])[1];if(r&&!document.getElementById(t)){var i=t.slice(0,t.lastIndexOf(".")),a=document.getElementById(i);a&&(a.hasAttribute("data-line")||a.setAttribute("data-line",""),n(a,r,"temporary "),document.querySelector(".temporary.line-highlight").scrollIntoView())}}if(window.Prism){var i=(crlf=/\r?\n|\r/g,0);Prism.hooks.add("after-highlight",function(t){var a=t.element.parentNode,l=a&&a.getAttribute("data-line");a&&l&&/pre/i.test(a.nodeName)&&(clearTimeout(i),e(".line-highlight",a).forEach(function(e){e.parentNode.removeChild(e)}),n(a,l),i=setTimeout(r,1))}),addEventListener("hashchange",r)}}();;
Prism.hooks.add("after-highlight",function(e){var n=e.element.parentNode;if(n&&/pre/i.test(n.nodeName)&&-1!==n.className.indexOf("line-numbers")){var t,a=1+e.code.split("\n").length;lines=new Array(a),lines=lines.join("<span></span>"),t=document.createElement("span"),t.className="line-numbers-rows",t.innerHTML=lines,n.hasAttribute("data-start")&&(n.style.counterReset="linenumber "+(parseInt(n.getAttribute("data-start"),10)-1)),e.element.appendChild(t)}});;

var coverVid=function(a,b,c){function d(a,b){var c=null;return function(){var d=this,e=arguments;window.clearTimeout(c),c=window.setTimeout(function(){a.apply(d,e)},b)}}function e(){var d=a.parentNode.offsetHeight,e=a.parentNode.offsetWidth,f=b,g=c,h=d/g,i=e/f;i>h?(a.style.height="auto",a.style.width=e+"px"):(a.style.height=d+"px",a.style.width="auto")}document.addEventListener("DOMContentLoaded",e),window.onresize=function(){d(e(),50)},a.style.position="absolute",a.style.top="50%",a.style.left="50%",a.style["-webkit-transform"]="translate(-50%, -50%)",a.style["-ms-transform"]="translate(-50%, -50%)",a.style.transform="translate(-50%, -50%)",a.parentNode.style.overflow="hidden"};window.jQuery&&jQuery.fn.extend({coverVid:function(){return coverVid(this[0],arguments[0],arguments[1]),this}});
Element.prototype.hasClass = function(className) {
    return new RegExp(' ' + className + ' ').test(' ' + this.className + ' ');
};

Element.prototype.addClass = function(className) {
    if (!this.hasClass(className)) {
        this.className += ' ' + className;
    }
    return this;
};

Element.prototype.removeClass = function(className) {
    var newClass = ' ' + this.className.replace(/[\t\r\n]/g, ' ') + ' ';
    if (this.hasClass(className)) {
        while (newClass.indexOf(' ' + className + ' ') >= 0) {
            newClass = newClass.replace(' ' + className + ' ', ' ');
        }
        this.className = newClass.replace(/^\s+|\s+$/g, ' ');
    }
    return this;
};

Element.prototype.toggleClass = function(className) {
    var newClass = ' ' + this.className.replace(/[\t\r\n]/g, " ") + ' ';
    if (this.hasClass(className)) {
        while (newClass.indexOf(" " + className + " ") >= 0) {
            newClass = newClass.replace(" " + className + " ", " ");
        }
        this.className = newClass.replace(/^\s+|\s+$/g, ' ');
    } else {
        this.className += ' ' + className;
    }
    return this;
};
/*!
 * jsModal - A pure JavaScript modal dialog engine v1.0d
 * http://jsmodal.com/
 *
 * Author: Henry Rune Tang Kai <henry@henrys.se>
 *
 * (c) Copyright 2013 Henry Tang Kai.
 *
 * License: http://www.opensource.org/licenses/mit-license.php
 *
 * Date: 2013-7-11
 */
var Modal=function(){var c={},a={},d=document.createElement("div"),b=document.createElement("div"),f=document.createElement("div"),h=document.createElement("div"),k=document.createElement("div"),l,p;c.open=function(e){a.width=e.width||"auto";a.height=e.height||"auto";a.lock=e.lock||!1;a.hideClose=e.hideClose||!1;a.draggable=e.draggable||!1;a.closeAfter=e.closeAfter||0;a.closeCallback=e.closeCallback||!1;a.openCallback=e.openCallback||!1;a.hideOverlay=e.hideOverlay||!1;l=function(){c.center({})};e.content&& !e.ajaxContent?h.innerHTML=e.content:e.ajaxContent&&!e.content?(b.className="modal-loading",c.ajax(e.ajaxContent,function(a){h.innerHTML=a})):h.innerHTML="";b.style.width=a.width;b.style.height=a.height;c.center({});if(a.lock||a.hideClose)k.style.visibility="hidden";a.hideOverlay||(d.style.visibility="visible");b.style.visibility="visible";document.onkeypress=function(b){27===b.keyCode&&!0!==a.lock&&c.close()};k.onclick=function(){if(a.hideClose)return!1;c.close()};d.onclick=function(){if(a.lock)return!1; c.close()};window.addEventListener?window.addEventListener("resize",l,!1):window.attachEvent&&window.attachEvent("onresize",l);a.draggable?(f.style.cursor="move",f.onmousedown=function(a){c.drag(a);return!1}):f.onmousedown=function(){return!1};0<a.closeAfter&&(p=window.setTimeout(function(){c.close()},1E3*a.closeAfter));a.openCallback&&a.openCallback()};c.drag=function(a){var c=void 0!==window.event?window.event.clientX:a.clientX,m=void 0!==window.event?window.event.clientY:a.clientY,g=c-b.offsetLeft, d=m-b.offsetTop;document.onmousemove=function(a){c=void 0!==window.event?window.event.clientX:a.clientX;m=void 0!==window.event?window.event.clientY:a.clientY;b.style.left=0<c-g?c-g+"px":0;b.style.top=0<m-d?m-d+"px":0;document.onmouseup=function(){window.document.onmousemove=null}}};c.ajax=function(a,c){var d,g=!1,f=[function(){return new window.XMLHttpRequest},function(){return new window.ActiveXObject("Msxml2.XMLHTTP.6.0")},function(){return new window.ActiveXObject("Msxml2.XMLHTTP.3.0")},function(){return new window.ActiveXObject("Msxml2.XMLHTTP")}]; for(d=0;d<f.length;d+=1){try{g=f[d]()}catch(h){}if(!1!==g)break}g.open("GET",a,!0);g.onreadystatechange=function(){4===g.readyState&&(c(g.responseText),b.removeAttribute("class"))};g.send(null)};c.close=function(){h.innerHTML="";d.setAttribute("style","");d.style.cssText="";d.style.visibility="hidden";b.setAttribute("style","");b.style.cssText="";b.style.visibility="hidden";f.style.cursor="default";k.setAttribute("style","");k.style.cssText="";p&&window.clearTimeout(p);a.closeCallback&&a.closeCallback(); window.removeEventListener?window.removeEventListener("resize",l,!1):window.detachEvent&&window.detachEvent("onresize",l)};c.center=function(a){var c=Math.max(document.body.scrollHeight,document.documentElement.scrollHeight),f=Math.max(b.clientWidth,b.offsetWidth),g=Math.max(b.clientHeight,b.offsetHeight),h=0,k=0,l=0,n=0;"number"===typeof window.innerWidth?(h=window.innerWidth,k=window.innerHeight):document.documentElement&&document.documentElement.clientWidth&&(h=document.documentElement.clientWidth, k=document.documentElement.clientHeight);"number"===typeof window.pageYOffset?(n=window.pageYOffset,l=window.pageXOffset):document.body&&document.body.scrollLeft?(n=document.body.scrollTop,l=document.body.scrollLeft):document.documentElement&&document.documentElement.scrollLeft&&(n=document.documentElement.scrollTop,l=document.documentElement.scrollLeft);a.horizontalOnly||(b.style.top=n+k/2-g/2+"px");b.style.left=l+h/2-f/2+"px";d.style.height=c+"px";d.style.width="100%"};d.setAttribute("id","modal-overlay"); b.setAttribute("id","modal-container");f.setAttribute("id","modal-header");h.setAttribute("id","modal-content");k.setAttribute("id","modal-close");f.appendChild(k);b.appendChild(f);b.appendChild(h);d.style.visibility="hidden";b.style.visibility="hidden";window.addEventListener?window.addEventListener("load",function(){document.body.appendChild(d);document.body.appendChild(b)},!1):window.attachEvent&&window.attachEvent("onload",function(){document.body.appendChild(d);document.body.appendChild(b)}); return c}();
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