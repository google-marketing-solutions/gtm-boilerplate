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
/**
* Make a POST request and redirect to a URL, on a click event.
*
* @param {string} postUrl: the URL to make the POST request to.
* @param {string} redirectUrl: the URL to redirect to after making the POST
*   request.
* @param {string} btnId: the ID of the btn to bind the click event to.
* @param {?Object} data: the data to POST in the body of the request.
* @param {?function} callback: the callback function to run on success, before
*   redirecting to the next page. This must return a promise, so the redirect
*   will wait for the function to finish.
*/
function postAndRedirect(postUrl, redirectUrl, btnId, data, callback) {
  document.getElementById(btnId).addEventListener('click', function(e){
    e.preventDefault();
    e.stopPropagation();
    e.target.classList.add('clicked');
    fetch(postUrl, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {'Content-Type': 'application/json'}
    }).then(async res => {
      e.target.classList.remove('clicked');
      if (callback != null){
        await callback(e.target);
      }
      window.location.href = redirectUrl;
    });
  });
}
/**
 * Add click events for the buy with one click buttons.
 * @param {string} basketUrl: the URL of the basket.
 * @param {string} buyUrl: the URL of the buy page.
 */
function addBuyWithOneClickEvents(basketUrl, buyUrl) {
  const buyOneClickElements = document.getElementsByClassName("buy-one-click");
  for (let i = 0; i < buyOneClickElements.length; i++) {
    const sku = buyOneClickElements[i].getAttribute("data-sku");
    postAndRedirect(
      basketUrl,
      buyUrl,
      "buy-one-click-" + sku,
      {
        "sku": sku,
        "operation": "+",
        "change_quantity": 1
      },
      null);
  }
}
