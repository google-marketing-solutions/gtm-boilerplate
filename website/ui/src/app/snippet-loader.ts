import { environment } from '../environments/environment';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

function isGoogleTagManagerHost(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr, window.location.origin);
    return parsed.hostname === 'www.googletagmanager.com' || parsed.hostname === 'googletagmanager.com';
  } catch {
    return false;
  }
}

function isSafeHttpUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr, window.location.origin);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function cloneParsedNode(node: Node): Node | null {
  if (node.nodeType === Node.COMMENT_NODE) {
    return document.createComment(node.nodeValue || '');
  }
  if (node.nodeType === Node.TEXT_NODE) {
    return document.createTextNode(node.nodeValue || '');
  }
  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as Element;
    const tagName = el.tagName.toLowerCase();
    const newEl = document.createElement(tagName);
    for (const attr of Array.from(el.attributes)) {
      const attrName = attr.name.toLowerCase();
      if (attrName.startsWith('on')) {
        continue;
      }
      if ((attrName === 'src' || attrName === 'href') && !isSafeHttpUrl(attr.value)) {
        continue;
      }
      newEl.setAttribute(attr.name, attr.value);
    }
    if (tagName === 'script') {
      newEl.textContent = el.textContent;
    } else {
      for (const child of Array.from(el.childNodes)) {
        const clonedChild = cloneParsedNode(child);
        if (clonedChild) {
          newEl.appendChild(clonedChild);
        }
      }
    }
    return newEl;
  }
  return null;
}

function injectSnippetAtTop(rawSnippet: string, container: HTMLElement, defaultToScriptIfPlainText: boolean): void {
  const trimmed = rawSnippet.trim();
  if (!trimmed) {
    return;
  }

  const firstChild = container.firstChild;

  if (defaultToScriptIfPlainText && !trimmed.includes('<')) {
    const scriptEl = document.createElement('script');
    scriptEl.textContent = trimmed;
    container.insertBefore(scriptEl, firstChild);
    return;
  }

  const parsedDoc = new DOMParser().parseFromString(
    `<!DOCTYPE html><html><body>${trimmed}</body></html>`,
    'text/html'
  );
  const parsedNodes = [
    ...Array.from(parsedDoc.head.childNodes),
    ...Array.from(parsedDoc.body.childNodes)
  ];

  for (const node of parsedNodes) {
    const cloned = cloneParsedNode(node);
    if (cloned) {
      container.insertBefore(cloned, firstChild);
    }
  }
}

export function loadGtmScripts(): void {
  let tagType: string | null = null;
  let gtmContainerId = environment.gtmContainerId;
  let googleTagId = environment.googleTagId;
  let sgtmTagServingUrl = environment.sgtmTagServingUrl;
  let cdnTagServingUrl = 'https://www.googletagmanager.com';
  let stapeTagServingUrl = environment.stapeTagServingUrl;
  let stapeUseCustomLoader = false;
  let stapeHeadSnippet = '';
  let stapeBodySnippet = '';
  let sgtmEndpointUrl = environment.sgtmEndpointUrl;

  try {
    tagType = localStorage.getItem('tag-type');
    gtmContainerId = localStorage.getItem('gtm-container-id') || environment.gtmContainerId;
    googleTagId = localStorage.getItem('google-tag-id') || environment.googleTagId;

    if (tagType?.startsWith('gtag')) {
      sgtmTagServingUrl = localStorage.getItem('gtag-sgtm-tag-serving-url')
        || localStorage.getItem('sgtm-tag-serving-url')
        || environment.sgtmTagServingUrl;
      cdnTagServingUrl = localStorage.getItem('gtag-cdn-tag-serving-url')
        || localStorage.getItem('cdn-tag-serving-url')
        || 'https://www.googletagmanager.com';
      sgtmEndpointUrl = localStorage.getItem('gtag-sgtm-endpoint-url')
        || localStorage.getItem('sgtm-endpoint-url')
        || environment.sgtmEndpointUrl;
    } else {
      sgtmTagServingUrl = localStorage.getItem('gtm-sgtm-tag-serving-url')
        || localStorage.getItem('sgtm-tag-serving-url')
        || environment.sgtmTagServingUrl;
      cdnTagServingUrl = localStorage.getItem('gtm-cdn-tag-serving-url')
        || localStorage.getItem('cdn-tag-serving-url')
        || 'https://www.googletagmanager.com';
      stapeTagServingUrl = localStorage.getItem('gtm-stape-tag-serving-url')
        || environment.stapeTagServingUrl;
      stapeUseCustomLoader = localStorage.getItem('gtm-stape-use-custom-loader') === 'true'
        || tagType === 'gtm-gtg-via-stape-custom-loader';
      stapeHeadSnippet = localStorage.getItem('gtm-stape-head-snippet') || '';
      stapeBodySnippet = localStorage.getItem('gtm-stape-body-snippet') || '';
    }
  } catch (e) {
    console.warn('⚠️ Google Tag / GTM tracking is running on default configuration because localStorage is disabled/inaccessible in this browser.', e);
  }

  if ((tagType === 'gtm-gtg-via-stape-custom-loader' || (tagType === 'gtm-gtg-via-stape' && stapeUseCustomLoader))) {
    if (stapeHeadSnippet.trim()) {
      injectSnippetAtTop(stapeHeadSnippet, document.head, true);
    }
    if (stapeBodySnippet.trim()) {
      if (document.body) {
        injectSnippetAtTop(stapeBodySnippet, document.body, false);
      } else {
        window.addEventListener('DOMContentLoaded', () => {
          if (document.body) {
            injectSnippetAtTop(stapeBodySnippet, document.body, false);
          }
        });
      }
    }
    return;
  }

  let loadGtag = false;
  let scriptDomain = 'https://www.googletagmanager.com';
  let enableSgtmTransport = false;

  switch (tagType) {
    case 'gtm-gtg-via-sgtm':
      loadGtag = false;
      scriptDomain = sgtmTagServingUrl;
      break;

    case 'gtm-gtg-via-cdn':
      loadGtag = false;
      scriptDomain = cdnTagServingUrl;
      break;

    case 'gtm-gtg-via-stape':
      loadGtag = false;
      scriptDomain = stapeTagServingUrl;
      break;

    case 'gtag-gtg-via-sgtm':
      loadGtag = true;
      scriptDomain = sgtmTagServingUrl;
      enableSgtmTransport = true;
      break;

    case 'gtag-gtg-via-cdn':
      loadGtag = true;
      scriptDomain = cdnTagServingUrl;
      enableSgtmTransport = true;
      break;

    case 'gtag-default':
      loadGtag = true;
      scriptDomain = 'https://www.googletagmanager.com';
      break;

    case 'gtm-default':
    default:
      loadGtag = false;
      scriptDomain = 'https://www.googletagmanager.com';
      break;
  }

  if (!isSafeHttpUrl(scriptDomain)) {
    scriptDomain = 'https://www.googletagmanager.com';
  }

  // TODO(security): Subresource Integrity (SRI) cannot be statically pinned for GTM/Gtag/Stape containers because container scripts are dynamically published and updated independently of application builds.
  if (loadGtag) {
    const libScript = document.createElement('script');
    libScript.async = true;
    if (isGoogleTagManagerHost(scriptDomain)) {
      libScript.src = `${scriptDomain}/gtag/js?id=${googleTagId}`;
    } else {
      libScript.src = `${scriptDomain}`;
    }
    document.head.insertBefore(libScript, document.head.firstChild);

    const configScript = document.createElement('script');

    const configParams: any = {};
    if (enableSgtmTransport && isSafeHttpUrl(sgtmEndpointUrl)) {
      configParams.server_container_url = sgtmEndpointUrl;
    }

    const scriptContent = [
      `window.dataLayer = window.dataLayer || [];`,
      `function gtag(){dataLayer.push(arguments);}`,
      `gtag('js', new Date());`,
      `gtag('config', ${JSON.stringify(googleTagId)}, ${JSON.stringify(configParams)});`
    ].join('\n');

    configScript.textContent = scriptContent;

    if (libScript.parentNode) {
      libScript.parentNode.insertBefore(configScript, libScript.nextSibling);
    }

  } else {
    (function (w: any, d: Document, s: string, l: string, i: string) {
      w[l] = w[l] || [];
      w[l].push({
        'gtm.start': new Date().getTime(),
        event: 'gtm.js'
      });
      const f = d.getElementsByTagName(s)[0];
      const j = d.createElement(s) as HTMLScriptElement;
      const dl = l !== 'dataLayer' ? '&l=' + l : '';
      j.async = true;
      if (isGoogleTagManagerHost(scriptDomain)) {
        j.src = `${scriptDomain}/gtm.js?id=${i}${dl}`;
      } else if (scriptDomain.includes('?') || scriptDomain.endsWith('.js') || scriptDomain.endsWith('/')) {
        j.src = `${scriptDomain}${dl}`;
      } else {
        j.src = `${scriptDomain}/${dl}`;
      }
      if (f && f.parentNode) {
        f.parentNode.insertBefore(j, f);
      }
    })(window, document, 'script', 'dataLayer', gtmContainerId);
  }
}
