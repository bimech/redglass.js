var TestResponses = {
    success: {
        status: 200,
        responseText: ''
    }
};

describe("RedGlass", function() {
    beforeEach(function() {
        $(document).redGlass({ useServerLog: true });
        jasmine.Ajax.useMock();
    });
    describe("http method", function() {
        it('is POST', function() {
            $('#ellocate').click();
            var request = mostRecentAjaxRequest();
            expect(request.method).toBe('POST');
        });
    });
    describe("url port", function() {
        it('defaults to 4567', function() {
            $('#ellocate').click();
            var request = mostRecentAjaxRequest();
            expect(request.url).toBe('http://localhost:4567');
        });
    });
    describe("interaction events", function() {
        describe("click event", function() {
            it('is observed and transmitted', function() {
                $('#ellocate').click();
                var request = mostRecentAjaxRequest();
                var eventData = JSON.parse(request.params).event_json;
                expect(eventData.type).toBe('click');
            });
        });
        describe("keydown event", function() {
            it('is observed and transmitted', function() {
                $('#ellocate').keydown();
                var request = mostRecentAjaxRequest();
                var eventData = JSON.parse(request.params).event_json;
                expect(eventData.type).toBe('keydown');
            });
        });
        describe("keyup event", function() {
            it('is observed and transmitted', function() {
                $('#ellocate').keyup();
                var request = mostRecentAjaxRequest();
                var eventData = JSON.parse(request.params).event_json;
                expect(eventData.type).toBe('keyup');
            });
        });
    });
    describe("mutation events", function() {
        describe("DOMNodeInserted event", function() {
            it('is observed and transmitted', function() {
                $('#ellocate').append("<h2>New node.</h2>");
                var request = mostRecentAjaxRequest();
                var eventData = JSON.parse(request.params).event_json;
                expect(eventData.type).toBe('DOMNodeInserted');
            });
        });
        describe("DOMNodeRemoved event", function() {
            it('is observed and transmitted', function() {
                $('#dupe').remove();
                var request = mostRecentAjaxRequest();
                var eventData = JSON.parse(request.params).event_json;
                expect(eventData.type).toBe('DOMNodeRemoved');
            });
        });
    });
});

describe('RedGlassLog', function() {
    beforeEach(function() {
        $(document).redGlass({ useMemoryLog: true });
        jasmine.Ajax.useMock();
    });
    describe("scope", function() {
        it('is global', function() {
            expect(typeof RedGlassLog).toBe('object');
        });
    });

    describe("interaction events", function() {
        describe("click event", function() {
            it('is observed and transmitted', function() {
                $('#ellocate').click();
                var eventData = RedGlassLog[0];
                expect(eventData.type).toBe('click');
            });
        });
    });

});