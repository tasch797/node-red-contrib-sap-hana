node-red-contrib-sap-hana
=========================
[Node-RED](http://nodered.org) nodes to work with a SAP HANA database

Install
-------
Install from [npm](http://npmjs.org) or install from Magane Pallet in Node-RED
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
	topic : "RESULT_IN_LAYLOAD",
	payload : [{"DUMMY":"X"}];
}
```

Currently, only SAP HANA Express has been tested.

Please let me know if you have any issue.

Authors
-------
* Radu Simen - [radu103@hotmail.com](mailto:radu103@hotmail.com)