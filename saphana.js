module.exports = function(RED) {
    
	"use strict";
    
    var hanaClient = require('@sap/hana-client');
	
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
			node.warn("Payload : " + msg.payload);
			
			if (msg.topic === 'SQL' || msg.topic === 'sql' ){
				
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
						
						node.warn("Connection failed for host " + node.hanaConfig.host + " with user " + node.hanaConfig.user);
						
						var outErr = {
							topic : "ERROR",
							payload : JSON.parse(JSON.stringify(err2))
						}
						
						send(outErr);
						done();							
					}
					else
					{
						conn.exec(msg.payload, [], function (err2, result2) {
							
							if (err2) {
								node.warn(err2);
								
								var outErr2 = {
									topic : "ERROR",
									payload : JSON.parse(JSON.stringify(err2))
								}
								
								send(outErr2);
								done();								
							}
							
							node.connected = true;
							
							var out = {
								topic : "RESULT_IN_PAYLOAD",
								payload : JSON.parse(JSON.stringify(result2))
							}
							
							send(out);
							done();
							
							conn.disconnect();								
						});
					}

					send({});
					done();
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