module.exports = function(RED) {
    
	"use strict";
    
    var hanaClient = require('@sap/hana-client');
	var async = require('async');
	
	function configNode(n) {
        
		//console.dir(n);
		
		RED.nodes.createNode(this, n);
        
		this.warn("Config reg : " + JSON.stringify(n));
		
		this.host = n.host;
        this.port = parseInt(n.port);
        this.user = n.user;
		this.password = n.password;
		this.dbname = n.db;
    }
	
    RED.nodes.registerType("saphanaconfig", configNode);

    function sqlQueryIn(n) {
		
		//console.dir(n);
		
        RED.nodes.createNode(this, n);
        
		this.mydbConf = n.mydb;
       
        this.hanaConfig = RED.nodes.getNode(this.mydbConf);
		
		var node = this;		
		
		node.on("input", function(msg, send, done) {
			
			node.warn("Topic : " + msg.topic);
			node.warn("Payload : " + JSON.stringify(msg.payload));
			
			if (msg.topic === 'SQL' || msg.topic === 'sql' ){
				
				if(typeof msg.payload === 'string' || msg.payload instanceof String){
					msg.payload = [ msg.payload ];
				}
				
				var conn = hanaClient.createConnection();
			
				node.conn_params = {
					host : node.hanaConfig.host,
					port : node.hanaConfig.port,
					user : node.hanaConfig.user,
					password : node.hanaConfig.password
				};
				
				node.warn("Connection Params : " + JSON.stringify(node.conn_params));
				
				conn.connect(node.conn_params, function(err, result) {
					
					node.connection = conn;
					
					if(err) {
						node.warn(err);
						
						var errMess = "Connection failed for host " + node.hanaConfig.host + " with user " + node.hanaConfig.user;
						node.warn(errMess);
						
						var errMsg = {
							"topic" : "ERROR",
							"payload" : err
						};
						
						send(errMsg);
						done();
					}
					else
					{
						var fnExec = [];
						
						for(var i = 0; i < msg.payload.length; i++){
							
							let sql = msg.payload[i];
							node.warn("SQL loop : " + sql);
							
							var fn = function(callback){
								conn.exec(sql, [], function (err2, result2) {
									
									if (err2) {
										node.warn(err2);
										callback(null, err2);
									}
									else{
										callback(null, result2);
									}
								});
							};
							
							fnExec.push(fn);
						}
						
						async.series(
							fnExec,
							function(err, results) {
								
								node.warn("Async results : " + JSON.stringify(results) );
								
								var msg = {
									"topic" : "RESULTS_IN_PAYLOAD",
									"payload" : results
								}
								
								send(msg);
								done();
								
								conn.disconnect();								
							}
						);
					}
				});
		
			}
			else {
				if (typeof msg.topic !== 'string') { 
					node.error("msg.topic : the query is not defined as a string"); 
				}
			}
		});
    }
	
    RED.nodes.registerType("saphana", sqlQueryIn);
}