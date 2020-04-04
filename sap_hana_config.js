module.exports = function(RED) {
    
	"use strict";
	
	function configNode(n) {
        
		//console.dir(n);
		
		RED.nodes.createNode(this, n);
        
		this.warn("Config reg : " + JSON.stringify(n));
		
		this.host = n.host;
        this.port = parseInt(n.port);
        this.user = n.user;
		this.password = n.password;
    }
	
    RED.nodes.registerType("sap_hana_config", configNode);
}