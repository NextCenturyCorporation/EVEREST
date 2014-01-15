//------------------------------------
// Example of the power of Houston.
// A simple Socket.IO emitter module.
//------------------------------------
module.exports = function(io, logger) {
    return {
        emit: function(event) {
            var eventName = event.eventName;
            var eventData = event.eventData;
            switch (eventName) {
                case 'onAlphaReportCreated':
                    io.sockets.to('EVEREST.data.workflow')
                        .emit('item_saved', {
                            type: 'AlphaReport',
                            eventObject: eventData.alphaReportObject
                        });
                    logger.debug(
                        'Emitted socket with item_saved for AlphaReport'
                    );
                    break;
                default:
                    break;
            }
        }
    };
};
//--------------
// End example.
//--------------
