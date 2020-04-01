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
    }
	
    RED.nodes.registerType("sap_hana_config", configNode);

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
	
    RED.nodes.registerType("run_query", sqlQueryIn);
	
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
	
	function isInt(n){
		return Number(n) === n && n % 1 === 0;
	}

	function isFloat(n){
		return Number(n) === n && n % 1 !== 0;
	}
	
	function insertNode(n){
		//console.dir(n);
		
        RED.nodes.createNode(this, n);
        
		this.mydbConf = n.mydb;	
		this.table = n.table;	
		this.columns = n.columns.split(',');	
								
		var columns = [];
		for(var c = 0; c < this.columns.length; c++){
			columns.push('"' + this.columns[c] + '"');
		}
		var columnsForSql = columns.join(',');		

        this.hanaConfig = RED.nodes.getNode(this.mydbConf);
		
		var node = this;	

		node.on("input", function(msg, send, done) {
			
			node.warn("Payload : " + JSON.stringify(msg.payload));
			
			if(typeof msg.payload[0] !== 'object'){
				msg.payload = [ msg.payload ];
			}
			
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
						
						msg.statusCode = 500;
						msg.payload = err;
						
						send(msg);
						done();
					}
					else
					{
						var fnExec = [];
						
						for(var i = 0; i < msg.payload.length; i++){
							
							let values = [];
							
							for(var c = 0; c < node.columns.length; c++){
								
								let col = node.columns[c];
								let val = msg.payload[i][col];
								
								if(isInt(val) || isFloat(val)){
									values.push(val);
								}
								else{
									values.push("'" + val + "'");
								}
							}
							
							let valuesForSql = values.join(',');
							
							let sql = 'INSERT INTO "' + node.table + '" (' + columnsForSql + ') VALUES (' + valuesForSql + ');';
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
								
								node.warn("Async insert results : " + JSON.stringify(results) );
								
								var total = 0;
								for(var r = 0; r < results.length; r++){
									total += results[r];
								}
								
								msg.statusCode = 200;
								msg.payload = total;
								
								send(msg);
								done();
								
								conn.disconnect();								
							}
						);
					}
				});	
		});
	}
	
	RED.nodes.registerType("table_insert", insertNode);	
}