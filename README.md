node-red-contrib-sap-hana
=========================
[Node-RED](http://nodered.org) nodes to work with a SAP HANA database

Change Log
-------

v1.2.3 - Split the node in separate files & readme updates

v1.2.2 - Bugfix : removed node type that is not used

v1.2.1 
* Feature added : New node type `table_insert` for inserts receiving an array of objects (from http-in node)
* BIG CHANGE/INCOMPATIBILITY : Node type names have changed/simplified and may be found in different group `sap hana` now.
	   
v1.1.1 - Feature added : New node type `saphanatablemonitor` with configurable interval and query that may be used to monitor when #no-of-records in a table is changing

v1.0.5 & v1.0.6- Readme update : User has to be SCHEMA OWNER or to have HDI ADMIN user priviledges (not the users seen in XSA Environment *_RT, *_DT)

v1.0.4 - Readme fix

v1.0.2 - Feature added : Insert in msg.payload an Array of sql script commands (Example flows updated also)

v1.0.1 - INSERT, UPDATE, DELETE and other SQL script sql commands work


Install
-------

Configure SAP Node.Js repository : `npm set @sap:registry=https://npm.sap.com`

Install from [npm](http://npmjs.org) or install from Manage Pallete in Node-RED
```
cd $HOME/.node-red/
npm install node-red-contrib-sap-hana
```


Do not forget to edit `/etc/hosts` for default hxehost replacing X.Y or whole IP address if you're using hxehost as hostname
```
192.168.X.Y hxehost
```

Usage
-----

This package contains one node to run a sql command, call a procedure or a select statement for SAP HANA database using the office @sap/hana-client Node.JS driver.

Example flows here :
* [sap_hana_config.json](https://github.com/radu103/node-red-contrib-sap-hana/blob/master/examples/sap_hana_config.json)
* [run_query.json](https://github.com/radu103/node-red-contrib-sap-hana/blob/master/examples/run_query.json)
* [table_monitor.json](https://github.com/radu103/node-red-contrib-sap-hana/blob/master/examples/table_monitor.json)
* [table_insert.json](https://github.com/radu103/node-red-contrib-sap-hana/blob/master/examples/table_insert.json)


## 1. `sap_hana_config` node

Create a new SAP HANA user from SAP Hana Studio and you'll get a schema with the same name created by the system.

Use this new user and all the content will be saved in his schema as he's the owner.

Node config parameters :
* Database host name
* Database host port
* User name to access the database
* Password for the user name above


## 2. `run_query` node

To run a command  or a query input to saphana node the folowing message :

```
msg.topic = "SQL"; // or lower case 'sql'
msg.payload = "SELECT * FROM DUMMY";
return msg;
```

Also it works with an array of queries

```
msg.topic = "SQL"; // or lower case 'sql'
msg.payload = [
	'SELECT * FROM DUMMY', 
	'INDERT INTO "table_name" ("col1", "col2") VALUES (\'val1\', \'val2\')'
];
return msg;
```

The returned data will be stored in msg.payload and it will contain the @sap/hana-client response.  

As an OK response you'll receive on the `run_query` response:
```
{
	topic : "RESULT_IN_PAYLOAD",
	payload : [{"DUMMY":"X"}];
}
```

Error response example :
```
{
	topic : "ERROR",
	payload : {
	
	};
}
```

## 3. `table_monitor` node

Node config parameters :
* query to run at each iteration with setInterval function
* interval delay time (in seconds)

At each interval Error response example :
```
{
	"topic":"RESPONSE_IN_PAYLOAD",
	"payload":{
		"lastCount":1,
		"newCount":1,
		"trigger":false
	}
}
```

## 4. `table_insert` node


For input : forward from an `http-in` node or from another node type an array of objects

Node config parameters :
* Table Name
* Columns (property names from the js objects found in array) to be used in the SQL INSERt query


Other Informations
-------

Currently, only SAP HANA Express has been tested.

Please let me know if you have any issue.


Authors
-------

* Radu Simen - [radu103@hotmail.com](mailto:radu103@hotmail.com)
