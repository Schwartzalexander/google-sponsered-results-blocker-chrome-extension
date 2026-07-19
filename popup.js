const blockSponsoredProductsInput = document.getElementById('blockSponsoredProducts');
const blockSponsoredResultsInput = document.getElementById('blockSponsoredResults');
const featureInputIds = [
  'blockAiOverview',
  'blockDiscussions',
  'blockImages',
  'blockVideos',
  'blockShortVideos',
  'blockPeopleAlsoAsk',
  'blockRelatedSearches',
  'blockTopStories',
  'blockShoppingSites'
];
const featureInputs = Object.fromEntries(
  featureInputIds.map((id) => [id, document.getElementById(id)])
);
const reloadPageButton = document.getElementById('reloadPage');

chrome.storage.sync.get({
  enabled: true,
  blockSponsoredResults: null,
  blockSponsoredProducts: true,
  blockAiOverview: false,
  blockDiscussions: false,
  blockImages: false,
  blockVideos: false,
  blockShortVideos: false,
  blockPeopleAlsoAsk: false,
  blockRelatedSearches: false,
  blockTopStories: false,
  blockShoppingSites: false
}, (settings) => {
  blockSponsoredProductsInput.checked = Boolean(settings.blockSponsoredProducts);
  blockSponsoredResultsInput.checked = settings.blockSponsoredResults ?? Boolean(settings.enabled);
  featureInputIds.forEach((id) => {
    featureInputs[id].checked = Boolean(settings[id]);
  });
});

async function saveSettings() {
  const settings = {
    blockSponsoredProducts: blockSponsoredProductsInput.checked,
    blockSponsoredResults: blockSponsoredResultsInput.checked,
    ...Object.fromEntries(featureInputIds.map((id) => [id, featureInputs[id].checked]))
  };

  await chrome.storage.sync.set(settings);

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    chrome.tabs.sendMessage(tab.id, { type: 'set-settings', ...settings }).catch(() => {});
  }
}

blockSponsoredProductsInput.addEventListener('change', saveSettings);
blockSponsoredResultsInput.addEventListener('change', saveSettings);
featureInputIds.forEach((id) => {
  featureInputs[id].addEventListener('change', saveSettings);
});

reloadPageButton.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    await chrome.tabs.reload(tab.id);
    window.close();
  }
});
