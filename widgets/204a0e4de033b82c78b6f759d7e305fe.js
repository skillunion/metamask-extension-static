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
        var tweetId = tweetNode.getAttribute('data-tweet-id');
        var tweetText = tweetNode.querySelector('div.js-tweet-text-container').innerText;

        const twitterResponse = await fetch(`https://publish.twitter.com/oembed?url=https://twitter.com/0/status/${tweetId}`)
        const twitterParsed = await twitterResponse.json()
        
        const style = `blockquote.twitter-tweet {
              display: inline-block;
              font-family: "Helvetica Neue", Roboto, "Segoe UI", Calibri, sans-serif;
              font-size: 12px;
              font-weight: bold;
              line-height: 16px;
              border-color: #eee #ddd #bbb;
              border-radius: 5px;
              border-style: solid;
              border-width: 1px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
              padding: 16px;
              max-width: 468px;
            }

            blockquote.twitter-tweet p {
              font-size: 14px;
              font-weight: normal;
              line-height: 20px;
              margin-bottom: 14px;
            }

            blockquote.twitter-tweet a {
              color: inherit;
              font-weight: normal;
              text-decoration: none;
              outline: 0 none;
            }

            blockquote.twitter-tweet a:hover,
            blockquote.twitter-tweet a:focus {
              text-decoration: underline;
            }`;

        this._pushTransactionCallback({
            data: "0x000000000000000000000000000000000000000000000000000000000000000000000000",
            to: "0x0000000000000000000000000000000000000000"
        }, {
            data: {
                html: twitterParsed.html,
                style: style
            },
            jsx: `<div style={{ padding: '8px 16px' }}>
                  <style dangerouslySetInnerHTML={{ __html: data.style }} />
                  <div dangerouslySetInnerHTML={{ __html: data.html }} />
                  <label>
                    <input name="ipfs" checked={params.ipfs} type="checkbox" onChange={handleChange} />
                    <span>Store into IPFS</span>
                  </label>
                </div>`,
            params: {
                ipfs: false
            }
        });
    },

    init: function (doc, pushTransactionCallback) {
        var me = this;

        me._pushTransactionCallback = pushTransactionCallback;
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
