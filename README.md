node-red-contrib-sap-hana
=========================
[Node-RED](http://nodered.org) nodes to work with a SAP HANA database

Change Log
-------

v1.0.5 - Readme update : User has to be SCHEMA OWNER or to have HDI ADMIN user priviledges (not the users seen in XSA Environment *_RT, *_DT)

v1.0.4 - Readme fix

v1.0.2 - Feature added : Insert in msg.payload an Array of sql script commands (Example flows updated also)

v1.0.1 - INSERT, UPDATE, DELETE and other SQL script sql commands work

Install
-------
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

Create a new SAP HANA user from SAP Hana Studio and you'll get a schema with the same name created by the system.

Use this new user and all the content will be saved in his schema as he's the owner.

This package contains one node to run a sql command, call a procedure or a select statement for SAP HANA database using the office @sap/hana-client Node.JS driver.

Example flow here [flows.json](https://github.com/radu103/node-red-contrib-sap-hana/blob/master/flows.json)

Query node usage:
-----------------

You will need to fill in the following fields:

-- Database host name and port.

-- User name to access the database.

-- Password for the user name above.

-- Schema name.

Node usage:
------------------

The returned data will be stored in msg.payload and it will contains the @sap/hana-client response.  

To run a command  or a query input to saphana node the folowing message :
```
msg.topic = "SQL"; // or lower case 'sql'
msg.payload = "SELECT * FROM DUMMY";
return msg;
```

As an OK response you'll receive on the `saphana` node (or error):
```
{
	topic : "RESULT_IN_PAYLOAD",
	payload : [{"DUMMY":"X"}];
}
```

Currently, only SAP HANA Express has been tested.

Please let me know if you have any issue.

Authors
-------
* Radu Simen - [radu103@hotmail.com](mailto:radu103@hotmail.com)
