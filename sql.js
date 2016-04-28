
var sqljs = function(){
	// Log to file
	var log = require('./log.js');

	// Ref - https://github.com/felixge/node-mysql
	var mysql  = require('mysql');
	var pool = null;

	var commit = function(connection, callback){
		connection.commit(function(err) {
			if (err) {
				return connection.rollback(function() {
					//console.log('Commit data - error : ' + err);
					log.append('./', 'log.txt', 'Commit data - error : ' + err, true);
					// throw err;
				});
			}  

			//console.log('Insert success!');
			log.append('./', 'log.txt', 'Insert success!', true);
			
			connection.release();

			if(typeof callback === 'function') {
				callback();
			}
		});
	};

	return {
		setPool:function(host, usr, pwd, db, port){
			this.pool = mysql.createPool({
				host     : host,
				user     : usr,
				password : pwd,
				database : db,
				port     : port
			});
		},
		commit:function(connection, callback){
			commit(connection, callback);
		},
		insert:function(data, callback){
			if(this.pool!=null){
				this.pool.getConnection(function(err, connection) {
					if (err) {
						//console.error('Get connect - error : ' + err.stack);
						log.append('./', 'log.txt', 'Get connect - error : ' + err.stack, true);
						return;
					}

					connection.beginTransaction(function(err) {
						if (err) { 
							//console.log('Transaction - error : ' + err);
							log.append('./', 'log.txt', 'Transaction - error : ' + err, true);
							// throw err;
						}

						for(var i=0; i<data.length; i++){
							//console.log(data[i].date);

							var insert = "insert into `hist_stock` values (" + 
											"'" + data[i].date + "'," +
											"'" + data[i].open + "'," +
											"'" + data[i].high + "'," +
											"'" + data[i].low + "'," +
											"'" + data[i].close + "'," +
											"'" + data[i].name + "')";

							//console.log('Insert data - SQL : ' + insert)
							log.append('./', 'log.txt', 'Insert data - SQL : ' + insert, true);

							connection.query(insert, function(err, result) {
								if (err) {
									return connection.rollback(function() {
										//console.log('Insert data - error : ' + err);
										log.append('./', 'log.txt', 'Insert data - error : ' + err, true);
										// throw err;
									});
								}  

								//console.log(result);
							});
						}

						commit(connection, function(){
							if(typeof callback === 'function') {
								callback();
							}
						});		
					});

					//console.log('connected as id ' + connection.threadId);
					
				});
			} else {
				//console.log("Pool doesn't exists!!!");
				log.append('./', 'log.txt', "Pool doesn't exists!!!", true);
			}
		},
		endPool:function(){
			if(this.pool!=null){
				this.pool.end(function (err) {
					if (err) {
						//console.log('Terminate pool - error : ' + err);
						log.append('./', 'log.txt', 'Terminate pool - error : ' + err, true);
						return;
					}  

					//console.log('All connections in pool is terminated now');
					log.append('./', 'log.txt', 'All connections in pool is terminated now', true);
				});
			}
		}
	};
}

module.exports = sqljs();
