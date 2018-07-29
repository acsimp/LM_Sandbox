var isOpera = navigator.userAgent.indexOf('OPR') != -1;
var isFirefox = navigator.userAgent.indexOf('Firefox') != -1;
var isIEedge = navigator.userAgent.indexOf("Edge") > -1;
var isIOSChrome = navigator.userAgent.match("CriOS");
var isWindows = navigator.userAgent.indexOf('Windows') != -1;
var isMac = navigator.userAgent.indexOf('Mac') != -1;
var isChromium = window.chrome;
let support;
var noWork = false

if (isFirefox || isOpera || isChromium ){
    noWork = true;
}

if(isIOSChrome){
   console.log('is Google Chrome on IOS');
   alert('is Google Chrome on IOS');
} else if (
  noWork === true &&
  isWindows === true
) {
  console.log('browser may not be supported');
//   alert('is Google Chrome Windows');
support = false;
} else {
  console.log('browser supported');
//   alert('is Google Chrome Mac');
support = true;
}
