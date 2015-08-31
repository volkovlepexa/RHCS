/**
 * jQuery.put / jQuery.delete ajax snippets implementation
 * @author: Stepan Suvorov
 */
jQuery.each(["put","delete"],function(e,t){jQuery[t]=function(e,u,a,n){return jQuery.isFunction(u)&&(n=n||a,a=u,u=void 0),jQuery.ajax({url:e,type:t,dataType:n,data:u,complete:a})}});

/**
 * setCookie() - set cookie
 * @author: Ilya Kantor;
 */
function setCookie(e,o,i){i=i||{};var r=i.expires;if("number"==typeof r&&r){var t=new Date;t.setTime(t.getTime()+1e3*r),r=i.expires=t}r&&r.toUTCString&&(i.expires=r.toUTCString()),o=encodeURIComponent(o);var n=e+"="+o;for(var a in i){n+="; "+a;var m=i[a];m!==!0&&(n+="="+m)}document.cookie=n}


/**
 * getCookie() - get cookie
 * @author: Ilya Kantor;
 */
function getCookie(e){var o=document.cookie.match(new RegExp("(?:^|; )"+e.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g,"\\$1")+"=([^;]*)"));return o?decodeURIComponent(o[1]):void 0}


/**
 * deleteCookie() - delete cookie
 * @author: Ilya Kantor;
 */
function deleteCookie(e){setCookie(e,"",{expires:-1})}