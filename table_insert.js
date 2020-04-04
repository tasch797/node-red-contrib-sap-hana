module.exports = function(RED) {
    
	"use strict";
    
    var hanaClient = require('@sap/hana-client');
	var async = require('async');
	
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