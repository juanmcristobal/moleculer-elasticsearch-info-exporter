"use strict";
const { Client } = require("@elastic/elasticsearch");

module.exports = {
    /**
     * Service settings
     */
    settings: {
        tickInterval: 1000
    },

    /**
     * Service dependencies
     */
    dependencies: [],

    /**
     * Actions
     */
    actions: {

    },

    /**
     * Events
     */
    events: {},

    /**
     * Methods
     */
    methods: {
   
    },

    /**
     * Service created lifecycle event handler
     */
    created() {},

    /**
     * Service started lifecycle event handler
     */
    started() {
        this.client = new Client({
            node: process.env.ELASTICSEARCH_URL || "http://localhost:9200",
            log: process.env.LOGGER_LEVEL || "info",
            auth: {
                username: process.env.ELASTICSEARCH_USER || "elastic",
                password: process.env.ELASTICSEARCH_PASSWORD || "changeme"
            }
        });

        setInterval(
            (function(self) {
                //Self-executing func which takes 'this' as self
                return function() {
                    //Return a function in the context of 'self'
                    self.broker
                        .call("$node.health", null)
                        .then(res => {
                            res.nodeID = self.broker.nodeID;  
                            return self.client.bulk({
                                refresh: true,
                                body: [
                                    { index: { _index: "info-metrics" } },
                                    res
                                ]
                            })

                        }  
                        )

                        .catch(err =>
                            console.error(`Error occured! ${err.message}`)
                        ); 

                };
            })(this),
            this.settings.tickInterval
        );
    },

    /**
     * Service stopped lifecycle event handler
     */
    stopped() {}
};
