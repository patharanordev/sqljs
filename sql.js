
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
					log.append('./log/', 'dblog.txt', 'Commit data - error : ' + err, true);
					// throw err;
				});
			}  

			//console.log('Insert success!');
			log.append('./log/', 'dblog.txt', 'Insert success!', true);
			
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
		isTableExists:function(dbname, tbname, stockData, callback){
			if(this.pool!=null){
				this.pool.getConnection(function(err, connection) {
					if (err) {
						//console.error('Get connect - error : ' + err.stack);
						log.append('./log/', 'dblog.txt', 'Get connect - error : ' + err.stack, true);
						return;
					}

					var checkTbStr = 
						"SELECT COUNT(*) as count " + 
						"FROM information_schema.tables " +
						"WHERE table_schema = '" + dbname + "' " +
						"AND table_name = '" + tbname + "'";

					connection.query(checkTbStr, function(err, result) {
						if (err) {
							return connection.rollback(function() {
								//console.log('Insert data - error : ' + err);
								log.append('./log/', 'dblog.txt', 'Check table exists - error : ' + err, true);
								// throw err;
							});
						}  

						var isExists = false;
						if(result[0].count<=0) {
							isExists = false;
							log.append('./log/', 'dblog.txt', 'Table ' + tbname + ' doesn\'t exists', true);
						} else {
							isExists = true;
							log.append('./log/', 'dblog.txt', 'Table ' + tbname + ' exists', true);
						}

						//console.log(result);

						if(typeof callback === 'function') {
							callback(isExists, stockData);
						}
					});
				});
			} else {
				//console.log("Pool doesn't exists!!!");
				log.append('./log/', 'dblog.txt', "Pool doesn't exists!!!", true);
			}
		},
		createTable:function(dbname, tbname, stockData, callback){
			if(this.pool!=null){
				this.pool.getConnection(function(err, connection) {
					if (err) {
						//console.error('Get connect - error : ' + err.stack);
						log.append('./log/', 'dblog.txt', 'Get connect - error : ' + err.stack, true);
						return;
					}

					var createTbStr = 
						"CREATE TABLE IF NOT EXISTS `" + dbname + "`.`" + tbname + "` (" +
							"`date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, " +
  							"`open` double DEFAULT 0.00, " +
							"`high` double DEFAULT 0.00, " +
							"`low` double DEFAULT 0.00, " +
							"`close` double DEFAULT 0.00, " +
							"`volume` int  DEFAULT 0, " +
							"`avg` double DEFAULT 0.00, " +
							"PRIMARY KEY (`date`) " +
						") ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='historical stock data'";

					connection.query(createTbStr, function(err, result) {
						if (err) {
							return connection.rollback(function() {
								//console.log('Insert data - error : ' + err);
								log.append('./log/', 'dblog.txt', 'Create table - error : ' + err, true);
								// throw err;
							});
						}  

						console.log(result);
						log.append('./log/', 'dblog.txt', 'Table ' + tbname + ' created', true);

						if(typeof callback === 'function') {
							callback(stockData);
						}
					});
				});
			} else {
				//console.log("Pool doesn't exists!!!");
				log.append('./log/', 'dblog.txt', "Pool doesn't exists!!!", true);
			}
		},
		insert:function(data, table, callback){
			if(this.pool!=null){
				this.pool.getConnection(function(err, connection) {
					if (err) {
						//console.error('Get connect - error : ' + err.stack);
						log.append('./log/', 'dblog.txt', 'Get connect - error : ' + err.stack, true);
						return;
					}

					connection.beginTransaction(function(err) {
						if (err) { 
							//console.log('Transaction - error : ' + err);
							log.append('./log/', 'dblog.txt', 'Transaction - error : ' + err, true);
							// throw err;
						}

						for(var i=0; i<data.length; i++){
							//console.log(data[i].date);

							var insert = "insert ignore into `" + table + "`" +
								"(`date`,`open`,`high`,`low`,`close`,`volume`,`avg`) select " +
											"'" + data[i].date + "'," +
											"'" + data[i].open + "'," +
											"'" + data[i].high + "'," +
											"'" + data[i].low + "'," +
											"'" + data[i].close + "'," +
											"'" + data[i].volume + "'," +
											"'" + data[i].avg + "'";

							console.log('Insert data - SQL : ' + insert)
							log.append('./log/', 'dblog.txt', 'Insert data - SQL : ' + insert, true);

							connection.query(insert, function(err, result) {
								if (err) {
									return connection.rollback(function() {
										//console.log('Insert data - error : ' + err);
										log.append('./log/', 'dblog.txt', 'Insert data - error : ' + err, true);
										// throw err;
									});
								}  

								console.log(result);
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
				log.append('./log/', 'dblog.txt', "Pool doesn't exists!!!", true);
			}
		},
		endPool:function(){
			if(this.pool!=null){
				this.pool.end(function (err) {
					if (err) {
						//console.log('Terminate pool - error : ' + err);
						log.append('./log/', 'dblog.txt', 'Terminate pool - error : ' + err, true);
						return;
					}  

					//console.log('All connections in pool is terminated now');
					log.append('./log/', 'dblog.txt', 'All connections in pool is terminated now', true);
				});
			}
		}
	};
}

module.exports = sqljs();
