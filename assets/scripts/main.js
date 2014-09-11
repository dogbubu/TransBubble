var ICON_DISABLE = 'assets/images/icon--disable.png';
var ICON_ACTIVE  = 'assets/images/icon.png';

var cssDetails = {file: 'assets/styles/transbubble.css', allFrames: true};
var jsDetails  = {file: 'assets/scripts/transbubble.js', allFrames: true};

var configCache = { tb_active: 0 };
var enableTabs = [];

chrome.storage.sync.get('tb_active', function(items){
    if( !items.tb_active || items.tb_active !== 1) return;
    configCache.tb_active = 1;
    chrome.tabs.query({active: true}, function(tabs){
        if( enableTabs.indexOf( tabs[0].id ) === -1 ) {
            enableTransBubble(tabs[0].id);
            chrome.browserAction.setIcon({ path: ICON_ACTIVE });
        }
    });
});

chrome.browserAction.onClicked.addListener(function(){
    configCache.tb_active = configCache.tb_active === 1 ? 0 : 1;
    chrome.browserAction.setIcon({ path: configCache.tb_active === 1 ? ICON_ACTIVE : ICON_DISABLE });
    chrome.storage.sync.set( {tb_active: configCache.tb_active} );
    chrome.tabs.query({active: true}, function(tabs){
        if( configCache.tb_active && enableTabs.indexOf( tabs[0].id ) === -1 ) {
            enableTransBubble(tabs[0].id );
        }
    });
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
    if( !configCache.tb_active && enableTabs.indexOf( tabId ) !== -1 ) {
        removeEnableTab( tabId );
    }
    if( configCache.tb_active && changeInfo.status === 'complete' ) {
        enableTransBubble( tabId );
    }
});
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo){
    removeEnableTab( tabId );
});

function enableTransBubble( tabId ) {
    chrome.tabs.insertCSS(tabId, cssDetails);
    chrome.tabs.executeScript(tabId, jsDetails);
    if( enableTabs.indexOf( tabId ) === -1 ) enableTabs.push( tabId );
}

function removeEnableTab( tabId ) {
    enableTabs = enableTabs.filter(function(value){
        return value !== tabId;
    });
}