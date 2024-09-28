// 需要重定向的子域名白名单
const redirectDomains = ['cwxt', 'jwxt', 'uems'];  // 添加需要重定向的子域名

// 转换URL为外网可访问的格式
function convertToExternalUrl(url) {
  const parsedUrl = new URL(url);
  const hostname = parsedUrl.hostname;
  const externalHostname = `${hostname.split('.')[0]}-443.webvpn.sysu.edu.cn`;
  parsedUrl.hostname = externalHostname;
  return parsedUrl.toString();
}

chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    const url = new URL(details.url);
    const subdomain = url.hostname.split('.')[0];

    if (url.hostname.endsWith('.sysu.edu.cn') && 
        !url.hostname.includes('webvpn') && 
        redirectDomains.includes(subdomain)) {
      
      const externalUrl = convertToExternalUrl(details.url);
      
      // 使用 chrome.tabs.update 来重定向
      chrome.tabs.update(details.tabId, {url: externalUrl});
      
      // 取消原始请求
      return {cancel: true};
    }
  },
  { urls: ["*://*.sysu.edu.cn/*"] },
  ["blocking"]
);

// 添加一个错误处理函数
chrome.webRequest.onErrorOccurred.addListener(
  function(details) {
    if (details.error === "net::ERR_CONNECTION_REFUSED" || details.error === "net::ERR_CONNECTION_TIMED_OUT") {
      const url = new URL(details.url);
      if (url.hostname.endsWith('.sysu.edu.cn') && !url.hostname.includes('webvpn')) {
        const externalUrl = convertToExternalUrl(details.url);
        chrome.tabs.update(details.tabId, {url: externalUrl});
      }
    }
  },
  {urls: ["*://*.sysu.edu.cn/*"]}
);