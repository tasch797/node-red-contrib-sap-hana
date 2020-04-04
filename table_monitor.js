module.exports = function(RED) {
    
	"use strict";
    
    var hanaClient = require('@sap/hana-client');
	var async = require('async');
	
	var monitorInteval = null;
	var lastCount = 0;
	
	function monitorNode(n) {
        
		//console.dir(n);
		
        RED.nodes.createNode(this, n);
        
		this.mydbConf = n.mydb;
		this.sql = n.query;
		this.interval = 1; // 1 second
		
		if(n.interval){
			this.interval = parseInt(n.interval);
		}
       
        this.hanaConfig = RED.nodes.getNode(this.mydbConf);
		
		var node = this;

		var fnInterval = function(){
			node.warn("Query for monitoring changes : " + n.query);
			node.warn("lastCount : " + lastCount);
			
			var conn = hanaClient.createConnection();
			
			node.conn_params = {
				host : node.hanaConfig.host,
				port : node.hanaConfig.port,
				user : node.hanaConfig.user,
				password : node.hanaConfig.password
			};	

			conn.connect(node.conn_params, function(err, result) {
				
				if(err) {
									
					node.warn("Connection Params : " + JSON.stringify(node.conn_params));
					node.warn(err);
					
					var errMess = "Connection failed for host " + node.hanaConfig.host + " with user " + node.hanaConfig.user;
					node.warn(errMess);
					
					var errMsg = {
						"topic" : "ERROR",
						"payload" : err
					};
					
					node.send(errMsg);
				}
				else
				{
					conn.exec(n.query, [], function (err2, result2) {
	
						if (err2) {
							node.warn(err2);
							
							var msg = { 
								topic : "ERROR",
								payload : err2
							};
							
							node.send(msg);
						}
						else
						{
							node.warn('Query result : ' + JSON.stringify(result2));
							
							var count = 0;
							
							if(result2[0]){
								for(var p in result2[0]){
									count = parseInt(result2[0][p]);
								}
							}
							
							var msg = {
								topic : "RESPONSE_IN_PAYLOAD",
								payload : {
									lastCount : lastCount,
									newCount : count,
									trigger : false
								}
							};
							
							if(msg.payload.newCount !== lastCount){
								msg.payload.trigger = true;
							}
														
							lastCount = count;
							
							node.send(msg);
						}
				
						conn.disconnect();
					});
				}
			});
			
		};

		if(monitorInteval){
			clearInterval(monitorInteval);
		}

		monitorInteval = setInterval(fnInterval, this.interval * 1000);
    }
	
    RED.nodes.registerType("table_monitor", monitorNode);
}