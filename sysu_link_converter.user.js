// ==UserScript==
// @name         中山大学链接转换器
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  将中山大学内网链接转换为外网可访问的链接，并在校内网络时保持原链接
// @match        *://*.sysu.edu.cn/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    // 检查URL是否可访问
    function checkUrlAccessibility(url, callback) {
        GM_xmlhttpRequest({
            method: "HEAD",
            url: url,
            timeout: 5000,  // 设置5秒超时
            onload: function(response) {
                callback(response.status < 400);
            },
            onerror: function() {
                callback(false);
            },
            ontimeout: function() {
                callback(false);
            }
        });
    }

    // 转换URL为外网可访问的格式
    function convertToExternalUrl(url) {
        let parsedUrl = new URL(url);
        let hostname = parsedUrl.hostname;
        let externalHostname = `${hostname.split('.')[0]}-443.webvpn.sysu.edu.cn`;
        parsedUrl.hostname = externalHostname;
        return parsedUrl.toString();
    }

    // 主函数
    function main() {
        let currentUrl = window.location.href;
        let isWebVPN = currentUrl.includes('webvpn.sysu.edu.cn');
        
        if (isWebVPN) {
            // 如果当前已经是webvpn地址，不做处理
            return;
        }

        checkUrlAccessibility(currentUrl, function(isAccessible) {
            if (isAccessible) {
                // 如果当前URL可访问，不做处理
                return;
            }

            let externalUrl = convertToExternalUrl(currentUrl);
            
            checkUrlAccessibility(externalUrl, function(isExternalAccessible) {
                if (isExternalAccessible) {
                    // 如果外网地址可访问，则跳转
                    window.location.href = externalUrl;
                } else {
                    // 如果外网地址也不可访问，保持原地址
                    console.log('无法访问内网和外网地址，保持原地址');
                }
            });
        });
    }

    // 执行主函数
    main();
})();