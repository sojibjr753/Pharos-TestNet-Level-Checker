(function() {
    'use strict';
    
    function findAndStorePharosData() {
        try {
            // লেভেল ৪ এর জন্য নির্দিষ্ট সিলেক্টর
            const level4Selector = 'div[content="Lv.4"].active[width*="%"]';
            const element = document.querySelector(level4Selector);

            if (element) {
                const widthAttr = element.getAttribute('width');
                const contentAttr = element.getAttribute('content');
                
                if (widthAttr && widthAttr.includes('%')) {
                    const percentage = parseFloat(widthAttr.replace('%', ''));
                    const data = {
                        percentage: percentage,
                        level: contentAttr,
                        timestamp: Date.now()
                    };
                    
                    localStorage.setItem('pharosTestnetData', JSON.stringify(data));
                }
            }
        } catch (error) {
            console.error('Pharos Tracker Error:', error);
        }
    }

    findAndStorePharosData();

    const observer = new MutationObserver(findAndStorePharosData);

    observer.observe(document.body, {
        attributes: true,
        childList: true,
        subtree: true,
        attributeFilter: ['class', 'width', 'content']
    });
})();