({
    _querySelector: 'li.stream-item div.js-actions',
    _uniqueClass: '.metamask-widget-tweet',
    _buttonHtmlString: `<div class="metamask-widget-tweet ProfileTweet-action">
            <button class="ProfileTweet-actionButton" type="button">
            <div class="IconContainer">
                <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAATCAYAAAByUDbMAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAjhJREFUeNrUVM9rE1EQ/t7Lbn6UqAlFscYNYrfVKoXSi0ehLcSDknjwpFC8i5fiMbUHqQriPyD17B+QoqDQg1QoKB5Ec9GaNP4IVtq6bXa72d23zm6aEDcm4K0ODDv7DfPtNzPvLfDf2dyFdIJ87F9q2N/AfEZJhhhbojBFPjT3bG2rPf/ttnrcBSZfV2w1+7iUb+JSkOjWRGqAM7ZCoeK998lYqd45+caLhcMO2DYGiWjkVcnBu6q4317bQRaV+RW2R+SZbmG4vIHh0WMclg1sWMDToo3vmoAtxKP2Wh4ko/ZmgtjyqgOX5EghoPDB8onI3s4///KpK9lsRjlLj3Q7FiaCqSHJV8VI8gTFHkbkavCjf5DRrL6SgPetGVD24hkZ/X0Mu1YDGzjEfCwi4VdPMm9rR+KsqCQZ0kmOSVLhEXnmOLQA0WjVw66NhxeCZB0LmD4nJ/jegTF2gZrhtnJmHYhFGW3VhSsgeirTH6gniGiq+R6L0sxkoLITxnwxjfWdkI//MGW4nEs9lZGGm8FTfDDOMBqz8FCpwKZWTZrdqcM26pbbWxnN5bpX0HSdWlz/6WBzS0DTG5g3M4doohGWpU4SXcm0Gl5uU1HTDZqRadLZk7m/AINizZCgx1V8rKfGbhTsJc5Y1zYXKHXJvzouqoyxRSmZfFE7ncvYR8dzkiy3lKytlmH2L2rCLXW/6OX84F3dEoWRe5+XO25C4cnlSDic4yGe1nVj2xFi+nz26ub+/wf+FmAAmiLTFxlZBnAAAAAASUVORK5CYII=">
            </div>
            </button>
        </div>`,

    _onMutate: function (mutationsList) {
        var me = this;

        for (var j = 0; j < mutationsList.length; j++) {
            var targetContainers = mutationsList[j].target.querySelectorAll(me._querySelector);
            for (var k = 0; k < targetContainers.length; k++) {
                var actionsDiv = targetContainers[k];
                if (actionsDiv != null) {
                    var widget = actionsDiv.querySelector(me._uniqueClass);
                    if (widget == null) {
                        me._injectWidget(actionsDiv, me._buttonHtmlString);
                    }
                }
            }
        }
    },

    _injectWidget: function (node, html) {
        var me = this,
            widget = me._createElementFromHTML(html);

        widget.addEventListener("click", function (event) {
            me._onWidgetButtonClick.call(me, event);
        });

        node.appendChild(widget);
    },

    _createElementFromHTML: function (htmlString) {
        var div = document.createElement('div');
        div.innerHTML = htmlString.trim();
        return div.firstChild;
    },

    _onWidgetButtonClick: async function (event) {
        var tweetNode = event.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;

        var metadata = {
            id: tweetNode.getAttribute('data-tweet-id'),
            text: tweetNode.querySelector('div.js-tweet-text-container').innerText,
            authorFullname: tweetNode.querySelector('strong.fullname').innerText,
            authorUsername: tweetNode.querySelector('span.username').innerText,
            authorImg: tweetNode.querySelector('img.avatar').getAttribute('src')
        };

        console.log('!!!! metadata', metadata);

        var result = await this._loadDappletCallback('1', metadata);

        console.log('!!!! result', result);
    },

    init: function (doc, loadDappletCallback) {
        var me = this;

        me._loadDappletCallback = loadDappletCallback;
        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
        me.observer = new MutationObserver(function (mutationsList) {
            me._onMutate.call(me, mutationsList);
        });
        me.observer.observe(doc.body, {
            childList: true,
            //attributes: true,
            //characterData: true,
            subtree: true,
            //attributeOldValue: true,
            //characterDataOldValue: true
        });
    }
})
