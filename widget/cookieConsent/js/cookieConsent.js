/**
 * @fileoverview Cookie Consent Widget.
 * Option.
 * @author ian.davis@oracle.com
 */

define(
  //-------------------------------------------------------------------
  // PACKAGE NAME
  //-------------------------------------------------------------------
  'cookieConsent',

  //-------------------------------------------------------------------
  // DEPENDENCIES
  //-------------------------------------------------------------------
  ['knockout', 'CCi18n', 'ccConstants', 'pubsub', 'js/jquery.divascookies-0.2.min', 'js/jquery.cookie'],

  //-------------------------------------------------------------------
  // MODULE DEFINITION
  //-------------------------------------------------------------------
  function(ko, CCi18n, CCConstants, pubsub) {

    "use strict";

    var LOCALSTORAGE_COOKIE_KEY = "cc.cookies.cookies-accepted";

    return {

      onLoad: function(widgetModel) {

        if(localStorage.getItem(LOCALSTORAGE_COOKIE_KEY) !== 'true'){

          var countryCode = "";

//          $.getJSON( location.protocol + "//freegeoip.net/json/?callback=?", "jsonp" )
          $.getJSON( location.protocol + "//www.telize.com/geoip?callback=?", "jsonp" )
            .done(function( geoIpData ) {
              if (geoIpData.country_code) {
                countryCode = geoIpData.country_code;
              }
              if(widgetModel.consentRequiredCountries().indexOf(countryCode) >= 0 || countryCode === ""){
                widgetModel.invokeCookieChallenge();
              } else {
                localStorage.setItem(LOCALSTORAGE_COOKIE_KEY, 'n/a');
              }
            })
            .fail(function( jqxhr, textStatus, error ) {
                widgetModel.invokeCookieChallenge();
            });
        }
      },


      invokeCookieChallenge: function() {

        localStorage.setItem(LOCALSTORAGE_COOKIE_KEY, 'false');
        var openEffect, closeEffect;

        if(this.effect() === 'fade'){
            openEffect = 'fade';
            closeEffect = 'fade';
        } else {
            if(this.bannerPosition() === "top"){
                openEffect = 'slideDown';
                closeEffect = 'slideUp';
            } else {
                openEffect = 'slideUp';
                closeEffect = 'slideDown';
            }
        }

        $.DivasCookies({
          saveUserPreferences: false,
          bannerText: CCi18n.t('ns.cookieConsent:resources.bannerText'),
          cookiePolicyLink: this.policyLink(),
          cookiePolicyLinkText: CCi18n.t('ns.cookieConsent:resources.policyText'),
          acceptButtonText: CCi18n.t('ns.cookieConsent:resources.buttonText'),
          openEffect: openEffect,
          openEffectDuration: Number(this.effectDuration()),
          closeEffect: closeEffect,
          closeEffectDuration: Number(this.effectDuration()),
        });

        if(this.bannerPosition() === "top"){
            $('.divascookies').addClass( "bannerPositionTop" );
        } else {
            $('.divascookies').addClass( "bannerPositionBottom" );
        }

        $.Topic(pubsub.topicNames.PAGE_READY).subscribe(this.checkCookieStatus);

        $( ".divascookies-accept-button-container" ).click(function() {
          localStorage.setItem(LOCALSTORAGE_COOKIE_KEY, 'true');
          $.Topic(pubsub.topicNames.PAGE_READY).unsubscribe(this.checkCookieStatus);
        });
      },

      checkCookieStatus: function(){

        if(localStorage.getItem(LOCALSTORAGE_COOKIE_KEY) === 'false'){
          //  Deletes all cookies except for those named as Protected.
          var tempCookies = $.cookie();
          var foundIt;
          CCConstants.PROTECTED_COOKIES.push("FILE_OAUTH_TOKEN");
          for (var thisCookie in tempCookies){
            foundIt = false;
            for(var i = 0; i < CCConstants.PROTECTED_COOKIES.length; i++){
              if(thisCookie === CCConstants.PROTECTED_COOKIES[i]){
                foundIt = true;
              }
            }
            if(foundIt === false){
              $.removeCookie(thisCookie);
            }
          }
        }
      }
    };
  }
);