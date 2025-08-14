document.addEventListener('DOMContentLoaded', function() {
    const percentageElement = document.getElementById('percentage');
    const levelElement = document.getElementById('level');
    const statusElement = document.getElementById('status');
    const progressFill = document.getElementById('progressFill');
    const refreshBtn = document.getElementById('refreshBtn');

    function extractPharosData() {
        try {
            // শুধুমাত্র লেভেল ৪ এর জন্য নির্দিষ্ট এবং নির্ভরযোগ্য সিলেক্টর
            const level4Selector = 'div[content="Lv.4"].active[width*="%"]';
            let element = document.querySelector(level4Selector);
            let errorMessage = "সক্রিয় লেভেল ৪ (Active Lv.4) খুঁজে পাওয়া যায়নি।";

            // যদি নির্দিষ্ট সিলেক্টরে না পাওয়া যায়, তবে একটি সাধারণ সিলেক্টর দিয়ে চেষ্টা করা হবে
            if (!element) {
                const genericActiveSelector = 'div[content^="Lv."].active[width*="%"]';
                element = document.querySelector(genericActiveSelector);
                errorMessage = "কোনো সক্রিয় প্রগ্রেস বার খুঁজে পাওয়া যায়নি।";
            }

            if (!element) {
                return { error: errorMessage };
            }

            const widthAttr = element.getAttribute('width');
            const contentAttr = element.getAttribute('content');

            if (widthAttr) {
                const percentage = parseFloat(widthAttr.replace('%', ''));
                return {
                    percentage: percentage,
                    level: contentAttr || 'N/A',
                    found: true
                };
            } else {
                 return { error: "প্রগ্রেস বারের 'width' অ্যাট্রিবিউট পাওয়া যায়নি।" };
            }
        } catch (error) {
            return { error: `ডেটা পার্স করার সময় সমস্যা হয়েছে: ${error.message}` };
        }
    }

    async function getPharosData() {
        try {
            statusElement.textContent = 'ডেটা আনা হচ্ছে...';
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab) {
                statusElement.textContent = 'কোনো সক্রিয় ট্যাব পাওয়া যায়নি।';
                statusElement.className = 'status error';
                return;
            }

            const results = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: extractPharosData
            });

            const resultData = results && results[0] ? results[0].result : null;
            
            if (resultData && resultData.found) {
                percentageElement.textContent = resultData.percentage + '%';
                levelElement.textContent = resultData.level;
                progressFill.style.width = resultData.percentage + '%';
                statusElement.textContent = 'ডেটা সফলভাবে আপডেট হয়েছে!';
                statusElement.className = 'status success';
            } else {
                statusElement.textContent = resultData ? resultData.error : 'এই পেজে Pharos ডেটা পাওয়া যায়নি।';
                statusElement.className = 'status error';
                percentageElement.textContent = '--%';
                levelElement.textContent = '--';
                progressFill.style.width = '0%';
            }
        } catch (error) {
            console.error('Error:', error);
            statusElement.textContent = `ত্রুটি: ${error.message}`;
            statusElement.className = 'status error';
        }
    }

    getPharosData();
    refreshBtn.addEventListener('click', getPharosData);
});