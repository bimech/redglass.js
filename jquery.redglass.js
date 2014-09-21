/**
 * RedGlass: A jQuery plugin for monitoring browser events. RedGlass allows you to view an automated test from the browser's perspective.
 * Author: Frank O'Hara, bimech.net
 */

(function($) {
    var self;
    var nativeXHROpen = XMLHttpRequest.prototype.open;
    var nativeOnError = window.onerror;

    $.widget('bimech.redGlass', {
        options: {
            testId: new Date().getTime(),
            port: '4567',
            recordInteractionEvents: true,
            recordMutationEvents: true,
            recordXHREvents: true,
            recordErrorEvents: true,
            interactionEvents: 'click keydown keyup',
            mutationEvents: 'DOMNodeInserted DOMNodeRemoved',
            record: true,
            useMemoryLog: true,
            useServerLog: false,
            ignoreServerLogErrors: false,
            log: []
        },

        _create: function() {
            self = this;
            this.useMemoryLog(this.options.useMemoryLog);
            this.useServerLog(this.options.useServerLog);
            this.recordInteractionEvents(this.options.recordInteractionEvents);
            this.recordMutationEvents(this.options.recordMutationEvents);
            this.recordXHREvents(this.options.recordXHREvents);
            this.recordErrorEvents(this.options.recordErrorEvents);
        },

        _allElements: function() {
            return $('*');
        },

        log: function(setting) {
            if(typeof setting == 'undefined') {
                return this.options.log;
            }
        },

        record: function(setting) {
            if(typeof setting == 'undefined') {
                return this.options.record;
            }
            else if(setting === true || setting === false) {
                this.options.record = setting;
            }
        },

        useServerLog: function(setting) {
            if(typeof setting == 'undefined') {
                return this.options.useServerLog;
            }
            else if(setting === true || setting === false) {
                this.options.useServerLog = setting;
            }
        },

        useMemoryLog: function(setting) {
            if(typeof setting == 'undefined') {
                return this.options.useMemoryLog;
            }
            else if(setting === true || setting === false) {
                this.options.useMemoryLog = setting;
            }
        },

        recordInteractionEvents: function(setting) {
            if(typeof setting == 'undefined') {
                return this.options.recordInteractionEvents;
            }
            else if(setting === true) {
                this._allElements().bind(this.options.interactionEvents, this._interactionEventHandler);
            }
            else if(setting === false) {
                this._allElements().unbind(this.options.interactionEvents, this._interactionEventHandler);
            }
        },

        recordMutationEvents: function(setting) {
            if(typeof setting == 'undefined') {
                return this.options.recordMutationEvents;
            }
            else if(setting === true) {
                this._allElements().bind(this.options.mutationEvents, this._mutationEventHandler);
            }
            else if(setting === false) {
                this._allElements().unbind(this.options.mutationEvents, this._mutationEventHandler);
            }
        },

        recordErrorEvents: function(setting) {
            if(typeof setting == 'undefined') {
                return this.options.recordErrorEvents;
            }
            else if(setting === true) {
                window.onerror = function(message, url, lineNumber) {
                    var eventData = {};
                    eventData.type = "js-error";
                    eventData.errorMessage = message;
                    eventData.errorUrl = url;
                    eventData.errorLineNumber = lineNumber;
                    self._errorEventHandler(eventData);
                    return false;
                };
            }
            else if(setting === false) {
                window.onerror = nativeOnError;
            }
        },

        recordXHREvents: function(setting) {
            if(typeof setting == 'undefined') {
                return this.options.recordXHREvents;
            }
            else if(setting === true) {
                //Overwrite native open method
                XMLHttpRequest.prototype.open = function(method, url, async, user, pass) {
                    //Handle readyState changes
                    this.addEventListener("readystatechange", function() {
                        if(url != "//localhost:" + self.options.port) {
                            var eventData = {};
                            eventData.method = method;
                            var readyStateDesc = '';
                            switch(parseInt(this.readyState)) {
                                case 0:
                                    readyStateDesc = 'Initializing';
                                    break;
                                case 1:
                                    readyStateDesc = 'Connected';
                                    break;
                                case 2:
                                    readyStateDesc = 'Request received';
                                    break;
                                case 3:
                                    readyStateDesc = 'Processing request';
                                    break;
                                case 4:
                                    readyStateDesc = 'Response returned';
                                    eventData.response = this.responseText;
                                    break;
                            }
                            eventData.type = 'xhr: ' + readyStateDesc;
                            eventData.url = url;
                            self._XHREventHandler(eventData);
                        }
                    }, false);

                    //Call native open method
                    nativeXHROpen.call(this, method, url, async, user, pass);
                };
            }
            else if(setting === false) {
                XMLHttpRequest.prototype.open = nativeXHROpen;
            }
        },

        serializeDOM: function() {
            var els = [];
            var uniqueIds = [];
            var width = $(document).width();
            var height = $(document).height();
            this._allElements().each(function() {
                try {
                    var el = {};
                    el.tagName = $(this).get(0).tagName;
                    el.id = $(this).attr('id');
                    el.top = self._toInt($(this).offset().top);
                    el.left = self._toInt($(this).offset().left);
                    el.xpath = $(this).ellocate(uniqueIds).xpath;
                    el.width = self._toInt($(this).width());
                    el.height = self._toInt($(this).height());
                    el.isVisible = self._isVisible($(this));
                    el.hasText = self._hasText($(this));
                    els.push(el);
                }
                catch(e) {
                    console.log("serializeElements failed for a node with the error:\n" + e);
                }
            });
            return {
                width: width,
                height: height,
                elements: els
            };
        },

        destroy: function() {
            this.record(false);
            this.options.log = [];
            this.recordInteractionEvents(false);
            this.recordMutationEvents(false);
            this.recordXHREvents(false);
            this.recordErrorEvents(false);
            $.Widget.prototype.destroy.call(this);
        },

        _baseEventHandler: function(e) {
            var eventData = {};
            eventData.id = '';
            eventData.url = window.location.pathname;
            eventData.testID = this.options.testId;
            eventData.time = new Date().getTime();
            eventData.type = e.type;
            return eventData;
        },

        _interactionEventHandler: function(e) {
            if(self.options.record) {
                var eventData = self._baseEventHandler(e);
                var desiredProperties = ['pageX', 'pageY'];
                $.each(desiredProperties, function(index, property){
                    eventData[property] = e[property];
                });
                eventData.target = $(e.target).ellocate().css;
                self._sendEvent(eventData);
            }
        },

        _errorEventHandler: function(e){
            if(self.options.record) {
                var eventData = self._baseEventHandler(e);
                eventData.target = e.errorUrl;
                eventData.errorMessage = e.errorMessage;
                eventData.errorLineNumber = e.errorLineNumber;
                self._sendEvent(eventData);
            }
        },

        _XHREventHandler: function(e) {
            if(self.options.record) {
                var eventData = self._baseEventHandler(e);
                eventData.target = e.url;
                eventData.method = e.method;
                switch(e.type){
                    case "xhr: Response returned":
                        eventData.response = e.response;
                        break;
                }
                self._sendEvent(eventData);
            }
        },

        _mutationEventHandler: function(e) {
            if(self.options.record) {
                var eventData = self._baseEventHandler(e);
                if(e.target && e.target.innerHTML) {
                    eventData.target = e.target.innerHTML == '' ? e.target.parent.innerHTML : e.target.innerHTML;
                }
                self._sendEvent(eventData);
            }
        },

        _sendEvent: function(eventData) {
            if(this.options.useMemoryLog) {
                this.options.log.push(eventData);
            }
            if(this.options.useServerLog) {
                var request = new XMLHttpRequest();
                request.open('POST', "//localhost:" + this.options.port, true);
                if(this.options.ignoreServerLogErrors) {
                    request.onreadystatechange = function(event) {
                        if(request.readyState === 4 && request.status !== 200) {
                            console.log("The RedGlass server returned an error while receiving the event data: " + request.status);
                        }
                    }
                }
                request.send(JSON.stringify({event_json: eventData}));
            }
        },

        _toInt: function(num) {
            return Math.round(Number(num));
        },

        _hasText: function($el) {
            return $el.text() != "";
        },

        _isVisible: function($el) {
            return $el.is(':visible');
        }
    });
})(jQuery);
