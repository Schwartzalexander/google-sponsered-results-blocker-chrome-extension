const GOOGLE_HOST_PATTERN = /(^|\.)google\.[a-z.]+$/i;
const SPONSORED_RESULTS_SELECTOR = '[jscontroller="tY2w9d"].vbIt3d';
const SPONSORED_PRODUCTS_CONTAINER_SELECTOR = '.commercial-unit-mobile-top, .commercial-unit-desktop-top, .commercial-unit, .mnr-c';
const TOGGLE_TEXT_PATTERN = /\b(show|hide)\s+sponsored\s+results\b/i;
const RESULTS_HEADING_TEXT_PATTERN = /^sponsored\s+results$/i;
const PRODUCTS_HEADING_TEXT_PATTERN = /^sponsored\s+products$/i;
const SERP_FEATURES = {
  blockAiOverview: {
    defaultValue: false,
    headingPattern: /^ai\s+overview$/i,
    selector: '.XTvndd, .hICk5e, .MjjYud'
  },
  blockDiscussions: {
    defaultValue: false,
    headingPattern: /^discussions\s+and\s+forums$/i,
    selector: '.A6K0A, .MjjYud'
  },
  blockImages: {
    defaultValue: false,
    headingPattern: /^images$/i,
    selector: '.Lv2Cle, .A6K0A, .MjjYud'
  },
  blockVideos: {
    defaultValue: false,
    headingPattern: /^videos$/i,
    selector: '.vtSz8d, .Ww4FFb, .A6K0A, .MjjYud'
  },
  blockShortVideos: {
    defaultValue: false,
    headingPattern: /^short\s+videos$/i,
    selector: '.Ww4FFb, .A6K0A, .MjjYud'
  },
  blockPeopleAlsoAsk: {
    defaultValue: false,
    headingPattern: /^people\s+also\s+ask$/i,
    selector: '.cUnQKe, .A6K0A, .MjjYud'
  },
  blockRelatedSearches: {
    defaultValue: false,
    headingPattern: /^(people\s+also\s+search\s+for|related\s+searches|related\s+searches\s+based\s+on\s+your\s+browsing)$/i,
    selector: '#bres, [id^="aob_"], .A6K0A, .MjjYud'
  },
  blockTopStories: {
    defaultValue: false,
    headingPattern: /^top\s+stories$/i,
    selector: '.A6K0A, .MjjYud'
  },
  blockShoppingSites: {
    defaultValue: false,
    headingPattern: /^(popular\s+products|shopping\s+sites|product\s+sites|places|places\s+sites)$/i,
    selector: '.A6K0A, .MjjYud'
  }
};

let blockSponsoredResults = true;
let blockSponsoredProducts = true;
let featureSettings = Object.fromEntries(
  Object.entries(SERP_FEATURES).map(([key, feature]) => [key, feature.defaultValue])
);
let observer;

function isGoogleSearchPage() {
  return GOOGLE_HOST_PATTERN.test(window.location.hostname) && window.location.pathname === '/search';
}

function getSettings(callback) {
  const defaults = Object.fromEntries(
    Object.entries(SERP_FEATURES).map(([key, feature]) => [key, feature.defaultValue])
  );

  if (!chrome?.storage?.sync) {
    callback({ blockSponsoredResults: true, blockSponsoredProducts: true, ...defaults });
    return;
  }

  chrome.storage.sync.get({
    enabled: true,
    blockSponsoredResults: null,
    blockSponsoredProducts: true,
    ...defaults
  }, (settings) => {
    callback({
      blockSponsoredResults: settings.blockSponsoredResults ?? Boolean(settings.enabled),
      blockSponsoredProducts: Boolean(settings.blockSponsoredProducts),
      ...Object.fromEntries(Object.keys(SERP_FEATURES).map((key) => [key, Boolean(settings[key])]))
    });
  });
}

function normalizeText(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function removeElement(element) {
  if (element?.isConnected) {
    element.remove();
  }
}

function findSponsoredResultsBlockFromNode(node) {
  if (!(node instanceof Element)) {
    return null;
  }

  return node.closest(SPONSORED_RESULTS_SELECTOR);
}

function findSponsoredProductsBlockFromNode(node) {
  if (!(node instanceof Element)) {
    return null;
  }

  const commercialUnit = node.closest(SPONSORED_PRODUCTS_CONTAINER_SELECTOR);
  if (commercialUnit) {
    return commercialUnit;
  }

  const plaUnit = node.closest('[data-pla="1"]');
  if (plaUnit) {
    return plaUnit.parentElement || plaUnit;
  }

  return null;
}

function findSerpFeatureBlockFromHeading(heading, feature) {
  const block = heading.closest(feature.selector);
  if (!block) {
    return null;
  }

  const resultBlock = block.closest('.MjjYud');
  if (resultBlock && !block.matches('.XTvndd, .hICk5e, .Lv2Cle, .cUnQKe, .vtSz8d')) {
    return resultBlock;
  }

  return block;
}

function removeSponsoredResultsBlocks() {
  document.querySelectorAll(SPONSORED_RESULTS_SELECTOR).forEach((block) => {
    if (block.querySelector('[data-text-ad="1"], a[href*="/aclk?"], a[data-rw*="/aclk?"]')) {
      removeElement(block);
    }
  });

  document.querySelectorAll('[role="heading"], h1, h2, h3, h4').forEach((heading) => {
    if (RESULTS_HEADING_TEXT_PATTERN.test(normalizeText(heading.textContent || ''))) {
      removeElement(findSponsoredResultsBlockFromNode(heading));
    }
  });

  document.querySelectorAll('[role="button"], .MmMIvd').forEach((button) => {
    if (TOGGLE_TEXT_PATTERN.test(normalizeText(button.textContent || ''))) {
      removeElement(findSponsoredResultsBlockFromNode(button));
    }
  });
}

function removeSponsoredProductsBlocks() {
  document.querySelectorAll('[data-pla="1"]').forEach((plaUnit) => {
    removeElement(findSponsoredProductsBlockFromNode(plaUnit));
  });

  document.querySelectorAll('[role="heading"], h1, h2, h3, h4').forEach((heading) => {
    if (PRODUCTS_HEADING_TEXT_PATTERN.test(normalizeText(heading.textContent || ''))) {
      removeElement(findSponsoredProductsBlockFromNode(heading));
    }
  });
}

function removeSerpFeatureBlocks() {
  const enabledFeatures = Object.entries(SERP_FEATURES).filter(([key]) => featureSettings[key]);
  if (!enabledFeatures.length) {
    return;
  }

  document.querySelectorAll('[role="heading"], h1, h2, h3, h4').forEach((heading) => {
    const text = normalizeText(heading.textContent || '');
    const matchedFeature = enabledFeatures.find(([, feature]) => feature.headingPattern.test(text));
    if (matchedFeature) {
      removeElement(findSerpFeatureBlockFromHeading(heading, matchedFeature[1]));
    }
  });
}

function removeSponsoredBlocks() {
  if (!isGoogleSearchPage()) {
    return;
  }

  if (blockSponsoredProducts) {
    removeSponsoredProductsBlocks();
  }

  if (blockSponsoredResults) {
    removeSponsoredResultsBlocks();
  }

  removeSerpFeatureBlocks();
}

function startObserver() {
  if (observer || !isGoogleSearchPage()) {
    return;
  }

  observer = new MutationObserver(removeSponsoredBlocks);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
}

function stopObserver() {
  observer?.disconnect();
  observer = undefined;
}

function applyState() {
  if (blockSponsoredResults || blockSponsoredProducts || Object.values(featureSettings).some(Boolean)) {
    removeSponsoredBlocks();
    startObserver();
  } else {
    stopObserver();
  }
}

if (isGoogleSearchPage()) {
  getSettings((settings) => {
    blockSponsoredResults = settings.blockSponsoredResults;
    blockSponsoredProducts = settings.blockSponsoredProducts;
    featureSettings = Object.fromEntries(Object.keys(SERP_FEATURES).map((key) => [key, Boolean(settings[key])]));
    applyState();
  });

  chrome.runtime?.onMessage?.addListener((message) => {
    if (message?.type === 'set-settings') {
      blockSponsoredResults = Boolean(message.blockSponsoredResults);
      blockSponsoredProducts = Boolean(message.blockSponsoredProducts);
      featureSettings = Object.fromEntries(Object.keys(SERP_FEATURES).map((key) => [key, Boolean(message[key])]));
      applyState();
    }
  });
}
