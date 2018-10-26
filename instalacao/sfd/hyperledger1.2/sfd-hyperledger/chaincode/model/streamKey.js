import Model from './model';

export default (function(){

    let streamKeyModel = Model.define({

        /**
         * Union of Stream name + '.' +  key
         */
        keyName: {
            type: String,
            required: true,
            validators: []
        },

        /**
         * Key of the stream
         */
        key: {
            type: String,
            required: true,
            validators: []
        },

        /**
         * Name of the stream
         */
        stream: {
            type: Object,
            required: true,
            validators: []
        }
    }, {
        key: "keyName",
        name: {
            singular: "streamKey",
            plural: "streamsKey"
        }
    });

    return streamKeyModel;


})();