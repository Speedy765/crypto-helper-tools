
var cryptotracky = angular.module('cryptotracky', ['ui.router', "chart.js", "LocalStorageModule"]);
var version = "0.4";

cryptotracky.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider.state({
    name: 'home',
    url: '/',
    templateUrl: "home/home.html",
    data : { pageTitle: 'Home' }
  });

  $stateProvider.state({
    name: 'login',
    url: '/login',
    templateUrl: "login/login-template.html",
    controller: 'LoginCtrl',
    data : { pageTitle: 'Login' }
  });

  $stateProvider.state('signup', {
    url: '/signup',
    title: 'Sign Up',
    templateUrl: 'signup/signup-template.html',
    controller: 'SignupCtrl'
  })

  $stateProvider.state('vip', {
    url: '/vip',
    title: 'VIP',
    templateUrl: 'vip/vip-template.html',
    controller: 'VipCtrl'
  })

  $stateProvider.state({
    name: 'overview',
    url: '/overview',
    templateUrl: "overview/overview-template.html"
  });

  $stateProvider.state({
    name: 'overview-long',
    url: '/overview-long',
    templateUrl: "overview-long/overview-long-template.html"
  });

  $stateProvider.state({
    name: 'overview-long-binance',
    url: '/overview-long-binance',
    templateUrl: "overview-long-binance/overview-long-template.html"
  });

  $stateProvider.state({
    name: 'faq',
    url: '/faq',
    templateUrl: "faq/faq.html"
  });

  $stateProvider.state({
    name: 'help',
    url: '/help',
    templateUrl: 'help/help.html'
  });

  $stateProvider.state({
    name: 'realtime',
    url: '/realtime/{coin}',
    templateUrl: 'realtime/realtime.html'
  });

  $stateProvider.state({
    name: 'realtime-multi',
    url: '/realtime-multi/{coins}',
    templateUrl: 'realtime-multi/realtime-multi.html'
  });

  $stateProvider.state({
    name: 'hitbtc-status',
    url: '/hitbtc-status',
    templateUrl: 'hitbtc/hitbtc-status.html'
  });

  $urlRouterProvider.otherwise('/');
  startAnalytics();
  // login();
});



function startAnalytics() {
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-105407554-2', 'auto');
  ga('send', 'pageview', window.location.hash + "-v=" + version);

  function log() {
    ga('send', 'event', 'keep-alive', 'ping');
    amplitude.getInstance().logEvent('Keep alive', {value: window.location.hash +  "v=" + version});
    ga('send', 'pageview', window.location.hash + "-v=" + version);

  }

  setInterval(log, 1000 * 60);

  (function(e,t){var n=e.amplitude||{_q:[],_iq:{}};var r=t.createElement("script")
  ;r.type="text/javascript";r.async=true
  ;r.src="https://d24n15hnbwhuhn.cloudfront.net/libs/amplitude-3.7.0-min.gz.js"
  ;r.onload=function(){if(e.amplitude.runQueuedFunctions){
  e.amplitude.runQueuedFunctions()}else{
  console.log("[Amplitude] Error: could not load SDK")}}
  ;var i=t.getElementsByTagName("script")[0];i.parentNode.insertBefore(r,i)
  ;function s(e,t){e.prototype[t]=function(){
  this._q.push([t].concat(Array.prototype.slice.call(arguments,0)));return this}}
  var o=function(){this._q=[];return this}
  ;var a=["add","append","clearAll","prepend","set","setOnce","unset"]
  ;for(var u=0;u<a.length;u++){s(o,a[u])}n.Identify=o;var c=function(){this._q=[]
  ;return this}
  ;var l=["setProductId","setQuantity","setPrice","setRevenueType","setEventProperties"]
  ;for(var p=0;p<l.length;p++){s(c,l[p])}n.Revenue=c
  ;var d=["init","logEvent","logRevenue","setUserId","setUserProperties","setOptOut","setVersionName","setDomain","setDeviceId","setGlobalUserProperties","identify","clearUserProperties","setGroup","logRevenueV2","regenerateDeviceId","logEventWithTimestamp","logEventWithGroups","setSessionId"]
  ;function v(e){function t(t){e[t]=function(){
  e._q.push([t].concat(Array.prototype.slice.call(arguments,0)))}}
  for(var n=0;n<d.length;n++){t(d[n])}}v(n);n.getInstance=function(e){
  e=(!e||e.length===0?"$default_instance":e).toLowerCase()
  ;if(!n._iq.hasOwnProperty(e)){n._iq[e]={_q:[]};v(n._iq[e])}return n._iq[e]}
  ;e.amplitude=n})(window,document);

  amplitude.getInstance().init("a0c5167900b0df014795a4d9ac0b60da");
}
