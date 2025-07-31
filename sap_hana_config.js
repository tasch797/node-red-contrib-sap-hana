module.exports = function(RED) {
    "use strict";

    function configNode(n) {
        // Register the node with Node-RED
        RED.nodes.createNode(this, n);

        // ⚠️ Removed insecure logging of credentials
        // If needed, you can enable debugging below without exposing sensitive data:
        // this.debug("Initializing SAP HANA config with host=" + n.host + ", port=" + n.port);

        // Assign configuration parameters to the node
        this.host = n.host;
        this.port = parseInt(n.port);
        this.user = n.user;
        this.password = n.password;
    }

    // Register the node type
    RED.nodes.registerType("sap_hana_config", configNode);
}
