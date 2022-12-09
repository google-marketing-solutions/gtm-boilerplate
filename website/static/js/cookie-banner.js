/**
* Copyright 2022 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     https://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

// The name of the cookie used to track consent
const CONSENT_COOKIE_NAME = "consentcookie";
// The id of the form
const COOKIE_CONSENT_FORM = "cookie-consent-form";
// The number of days until the cookie consent expires and a user is asked again
const COOKIE_EXPIRE_DAYS = 365;

/**
 * Get the value for a cookie based from its name.
 * @param {string} cname: the name of the cookie to retrieve.
 * @returns a string with the value of the cookie.
 */
function getCookie(cname) {
  const name = cname + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const chunks = decodedCookie.split(";");
  for (let i = 0; i <chunks.length; i++) {
    let chunk = chunks[i];
    // Trim any whitespace at the start
    while (chunk.charAt(0) === " ") {
      chunk = chunk.substring(1);
    }
    if (chunk.indexOf(name) === 0) {
      return chunk.substring(name.length, chunk.length);
    }
  }
  return "";
}

/**
 * Show the cookie banner.
 */
function showCookieBanner() {
  const overlay = document.getElementById("cookie-banner-overlay");
  overlay.style.display = "block";
}

/**
 * Hide the cookie banner.
 */
function hideCookieBanner() {
  const overlay = document.getElementById("cookie-banner-overlay");
  overlay.style.display = "none";
}

/**
 * Toggle the cookie banner.
 */
function toggleCookieBanner() {
  const overlay = document.getElementById("cookie-banner-overlay");
  if (overlay.style.display === "block") {
    overlay.style.display = "none";
  } else {
    overlay.style.display = "block";
  }
}

/**
 * Select all the inputs on the form and submit it.
 */
function onCookieAcceptAll(){
  const form = document.getElementById(COOKIE_CONSENT_FORM);
  let inputs = form.querySelectorAll("input[type=checkbox]");
  for (let i = 0; i < inputs.length; ++i) {
    inputs[i].checked = true;
  }
  onCookieFormSubmit();
}

/**
 * Unselect all the inputs on the form and submit it.
 */
function onCookieDenyAll(){
  const form = document.getElementById(COOKIE_CONSENT_FORM);
  let inputs = form.querySelectorAll("input[type=checkbox]");
  for (let i = 0; i < inputs.length; ++i) {
    inputs[i].checked = false;
  }
  onCookieFormSubmit();
}

/**
 * Update the cookie preferences in both GTM and the cookie on form submit.
 */
function onCookieFormSubmit() {
  const form = document.getElementById(COOKIE_CONSENT_FORM);
  const adStorageChecked = form.querySelector("#ad_storage").checked;
  const analyticsChecked = form.querySelector("#analytics_storage").checked;

  const newConsent = {
    "ad_storage": (adStorageChecked === true) ? "granted" : "denied",
    "analytics_storage": (analyticsChecked === true) ? "granted" : "denied",
  }

  // update the preferences in the consent cookie
  const cookieValue = encodeURIComponent(JSON.stringify(newConsent));
  const date = new Date();
  date.setTime(date.getTime() + (COOKIE_EXPIRE_DAYS * 24 * 60 * 60 * 1000));
  const expires = "expires=" + date.toUTCString();
  document.cookie = `${CONSENT_COOKIE_NAME}=${cookieValue};${expires}; path=/`;

  // update the datalayer
  updateCookieConsentInDataLayer(newConsent);

  // hide the cookie form
  hideCookieBanner();
}

/**
 * Update cookie consent in the datalayer.
 * @param consent {?Object}: the consent object from the cookie to apply.
 */
function updateCookieConsentInDataLayer(consent) {
  gtag("consent", "update", consent);
}

/**
 * Update form selections based on existing consent.
 * @param consent {?Object}: the consent object from the cookie.
 */
function updateFormFromConsent(consent) {
  const form = document.getElementById(COOKIE_CONSENT_FORM);
  const inputs = form.querySelectorAll("input[type=checkbox]");
  for (let i = 0; i < inputs.length; ++i) {
    if (consent[inputs[i].name] === "granted") {
      inputs[i].checked = true;
    } else {
      inputs[i].checked = false;
    }
  }
}


// Have marketing preferences been set before?
const consentCookie = getCookie(CONSENT_COOKIE_NAME);

// Cookie has not been set
if (consentCookie === "") {
  console.log("Cookie preferences have not been set before");
  showCookieBanner();
} else {
  console.log("You have a cookie set with these preferences:");
  consentObj = JSON.parse(consentCookie);
  console.log(consentObj);
  updateCookieConsentInDataLayer(consentObj);
  updateFormFromConsent(consentObj);
}
