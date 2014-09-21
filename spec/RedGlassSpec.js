var TestResponses = {
    success: {
        status: 200,
        responseText: ''
    }
};

describe("RedGlass", function() {
    beforeEach(function() {
        $(document).redGlass({ useServerLog: false });
        jasmine.Ajax.useMock();
    });
    afterEach(function() {
        $(document).redGlass({ useServerLog: false});
    });
    describe("http method", function() {
        it('is POST', function() {
            $(document).redGlass({ useServerLog: true });
            $('#ellocate').click();
            var request = mostRecentAjaxRequest();
            expect(request.method).toBe('POST');
        });
    });
    describe("url port", function() {
        it('defaults to 4567', function() {
            $(document).redGlass({ useServerLog: true });
            $('#ellocate').click();
            var request = mostRecentAjaxRequest();
            expect(request.url).toBe('//localhost:4567');
        });
    });
    describe("interaction events", function() {
        describe("click event", function() {
            it('is observed and transmitted', function() {
                $(document).redGlass({ useServerLog: true });
                $('#ellocate').click();
                var request = mostRecentAjaxRequest();
                var eventData = JSON.parse(request.params).event_json;
                expect(eventData.type).toBe('click');
            });
        });
        describe("keydown event", function() {
            it('is observed and transmitted', function() {
                $(document).redGlass({ useServerLog: true });
                $('#ellocate').keydown();
                var request = mostRecentAjaxRequest();
                var eventData = JSON.parse(request.params).event_json;
                expect(eventData.type).toBe('keydown');
            });
        });
        describe("keyup event", function() {
            it('is observed and transmitted', function() {
                $(document).redGlass({ useServerLog: true });
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
                $(document).redGlass({ useServerLog: true });
                $('#ellocate').append("<h2>New node.</h2>");
                var request = mostRecentAjaxRequest();
                var eventData = JSON.parse(request.params).event_json;
                expect(eventData.type).toBe('DOMNodeInserted');
            });
        });
        describe("DOMNodeRemoved event", function() {
            it('is observed and transmitted', function() {
                $(document).redGlass({ useServerLog: true });
                $('#dupe').remove();
                var request = mostRecentAjaxRequest();
                var eventData = JSON.parse(request.params).event_json;
                expect(eventData.type).toBe('DOMNodeRemoved');
            });
        });
    });
});

describe('RedGlass#log', function() {
    beforeEach(function() {
        $(document).redGlass({ useMemoryLog: true });
        jasmine.Ajax.useMock();
    });
    afterEach(function() {
        $(document).redGlass('record', true);
    });
    it('is public', function() {
        expect(typeof $(document).redGlass('log')).toBe('object');
    });
    it('is enabled by default', function() {
        expect($(document).redGlass('useMemoryLog')).toBe(true);
    });
    it('is not logged if record is set to false', function() {
        var count = $(document).redGlass('log').length;
        $(document).redGlass('record', false);
        $('#ellocate').click();
        expect($(document).redGlass('log').length).toBe(count);
    });

    describe("interaction events", function() {
        describe("click event", function() {
            it('is observed and transmitted', function() {
                $('#ellocate').click();
                var eventData = $(document).redGlass('log')[0];
                expect(eventData.type).toBe('click');
            });
        });
    });

});