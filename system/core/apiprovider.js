var userModule = require('./userprovider.js')


/**
 * apiProvider.getTimeWidgetData - Validate session and give widget data
 * @param {Object} req HTTP flow request object
 * @param {Object} res HTTP flow response object
 */

module.exports.getTimeWidgetData = function (req, res) {

	// Session check
  if(typeof(req.query.session) == 'undefined') {

		// Log
	 	logger.warn("API Error - Session undefined from [ " + req.connection.remoteAddress + " ]");

		// Return error code
	 	res.status(422);
		res.json({ code: 422, error: "Session not defined" });

		// Exit
	 	return;

  }

  // Validate session
  userModule.validateSessionAction(req.query.session, function (data) {

		// Check errors
		if(data.code != 200) {

			// Return error code
			res.status(data.code);
			res.json(data);

			// Exit
			return;

		}

		// If code equals to 200 - session are valid
		global['indigoRedis'].hgetall("rhcs:timeWidget", function (err, replies) {

			// Catch error
			if(err) {

				// Return API error
				res.status(500);
				res.json({ code: 500 });

				// Log
				logger.warn("API " + err + " from [ " + req.connection.remoteAddress + " ]");

				// Exit
				return;

			}

			// Reply API data
			res.json({

				weatherConditions: JSON.parse(replies.weatherConditions),
				currencyRates: JSON.parse(replies.currencyRates)

			});

			// Exit
			return;

		});

	});

}