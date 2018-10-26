import Model from './model';

export default (function(){

    let streamKeyValueModel = Model.define({

        /**
         * Unique ID
         */
        id: {
            type: String,
            required: true,
            unique: true,
            validators: []
        },

        /**
         * Name of the stream
         */
        stream: {
            type: Object,
            required: true,
            validators: []
        },

        /**
         * Stream Key Object
         */
        streamKey: {
            type: Object,
            required: true,
            validators: []
        },

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
         * Value of the key pair of stream
         */
        value: {
            type: Object,
            required: true,
            validators: []
        },

        /**
         * Transaction generated for this transfer
         */
        transaction: {
            type: Object,
            required: true
        }
    }, {
        key: "id",
        name: {
            singular: "streamKeyValue",
            plural: "streamsKeyValue"
        }
    });

    return streamKeyValueModel;


})();