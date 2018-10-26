import Model from './model';

export default (function(){

    let streamModel = Model.define({

        /**
         * Name of the stream
         */
        name: {
            type: String,
            required: true,
            validators: []
        },

        /**
         * Can anyone write or only the ordered
         */
        anyoneCanWrite: {
            type: Boolean,
            required: true,
            default: false,
            validators: []
        },

        /**
         * creator of the address
         */
        creator: {
            type: String,
            required: false,
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
        key: "name",
        name: {
            singular: "stream",
            plural: "streams"
        }
    });

    return streamModel;


})();