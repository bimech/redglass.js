/**
 * RedGlass: A jQuery plugin for monitoring browser events. RedGlass allows you to view an automated test from the browser's perspective.
 * Author: Frank O'Hara, bimech.net
 */

(function($) {
    $.fn.redGlass = function(opts) {
        var _opts = opts || {};
        var ignoreXHRErrors = _opts.ignoreXHRErrors || true;
        var testID = _opts.testID || new Date().getTime();
        var port = _opts.port || '4567';

        var interactionEvents;
        if(_opts.interactionEvents) { interactionEvents =  _opts.interactionEvents.join(' '); }
        else { interactionEvents = 'click keydown keyup'; }

        var mutationEvents;
        if(_opts.mutationEvents) { mutationEvents =  _opts.mutationEvents.join(' '); }
        else { mutationEvents = 'DOMNodeInserted DOMNodeRemoved'; }

        var useMemoryLog = _opts.useMemoryLog || true;
        var useServerLog = _opts.useServerLog || false;
        if(useMemoryLog && typeof window.RedGlassLog == 'undefined') { window.RedGlassLog = []; }

        var rg = {
            handleInteractionEvent: function(e){
                var eventData = {};
                eventData.id = '';
                eventData.url = window.location.pathname;
                eventData.testID = testID;
                eventData.time = new Date().getTime();
                var desiredProperties = ['type', 'pageX', 'pageY'];
                $.each(desiredProperties, function(index, property){
                    eventData[property] = e[property];
                })
                eventData.target = $(e.target).ellocate().css;
                rg.sendEvent(eventData);
            },
            handleMutationEvent: function(e){
                var eventData = {};
                eventData.id = '';
                eventData.url = window.location.pathname;
                eventData.testID = testID;
                eventData.time = new Date().getTime();
                eventData.type = e.type;
                eventData.target = e.target.innerHTML == '' ? e.target.parent.innerHTML : e.target.innerHTML;
                rg.sendEvent(eventData);
            },
            handleXHREvent: function(event){
                var eventData = {};
                eventData.id = '';
                eventData.url = window.location.pathname;
                eventData.testID = testID;
                eventData.time = new Date().getTime();
                eventData.type = event.type;
                eventData.target = event.url;
                eventData.method = event.method;
                switch(event.type){
                    case "xhr: Response returned":
                        eventData.response = event.response;
                        break;
                }
                rg.sendEvent(eventData);
            },
            handleErrorEvent: function(event){
                var eventData = {};
                eventData.id = '';
                eventData.url = window.location.pathname;
                eventData.testID = testID;
                eventData.time = new Date().getTime();
                eventData.type = event.type;
                eventData.target = event.errorUrl;
                eventData.errorMessage = event.errorMessage;
                eventData.errorLineNumber = event.errorLineNumber;
                rg.sendEvent(eventData);
            },
            sendEvent: function(eventData){
                if(useMemoryLog) {
                    window.RedGlassLog.push(eventData);
                }
                if(useServerLog) {
                    var request = new XMLHttpRequest();
                    request.open('POST', "http://localhost:" + port, true);
                    if(ignoreXHRErrors) {
                        request.onreadystatechange = function(event) {
                            if(request.readyState == 4 && request.status != 200) {
                                console.log("The RedGlass server returned an error while receiving the event data: " + request.status);
                            }
                        }
                    }
                    request.send(JSON.stringify({event_json: eventData}));
                }
            }
        }

        //Interaction events
        this.bind(interactionEvents, rg.handleInteractionEvent);

        //DOM mutation events
        this.bind(mutationEvents, rg.handleMutationEvent);

        //XHR events
        (function() {
            //Create proxy to the native method
            var nativeOpen = XMLHttpRequest.prototype.open;

            //Overwrite native open method
            XMLHttpRequest.prototype.open = function(method, url, async, user, pass) {
                //Handle readyState changes
                this.addEventListener("readystatechange", function() {
                    if(url != "http://localhost:" + port){
                        var eventData = {};
                        eventData.method = method;
                        var readyStateDesc = '';
                        switch(parseInt(this.readyState)){
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
                        rg.handleXHREvent(eventData);
                    }
                }, false);

                //Call native open method
                nativeOpen.call(this, method, url, async, user, pass);
            };
        })();

        //Error events
        window.onerror = function(message, url, lineNumber) {
            var eventData = {};
            eventData.type = "js-error";
            eventData.errorMessage = message;
            eventData.errorUrl = url;
            eventData.errorLineNumber = lineNumber;
            rg.handleErrorEvent(eventData);
            return false;
        };

        return this;
    };
})(jQuery);
