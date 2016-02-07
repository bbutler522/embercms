var jwt = require('jsonwebtoken');
var _ = require('lodash');
var bcrypt = require('bcrypt');

/**
 * AuthController
 *
 * @module      :: Controller
 * @description :: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
  login: function(req, res) {

    if (req.body.grant_type === 'password') {

      User.findByUsername(req.body.username).populate('passports').populate('roles').populate('membership').exec(function(err, user) {
        if (err) {
	  return negotiateError(err, req, res);
        }
        if (typeof user === 'undefined' || !user || user.length < 1) {
	  return negotiateError('No such user', req, res);
        }
	if (typeof user[0].passports === 'undefined' || !user[0].passports || user[0].passports.length < 1) {
	   return negotiateError('Blocked user', req, res);
	}

        bcrypt.compare(req.body.password, user[0].passports[0].password, function(err, result) {
          if (err || !result) {
	    return negotiateError('invalidPassword', req, res);            
          } else {
            issueTokens(user, res);
          }
        });
      });

    } else if (req.body.grant_type === 'refresh_token' && req.body.refresh_token) {

      var token, user;

      if (req.headers && req.headers.authorization) {
        var parts = req.headers.authorization.split(' ');
        if (parts.length == 2) {
          var scheme = parts[0],
              credentials = parts[1];

          if (/^Bearer$/i.test(scheme)) {
            token = credentials;
          }
        } else {
	  return negotiateError('Bad Token',req, res);
        }
      }
      else {
	return negotiateError('Missing Token',req, res);
      }
      var bearerToken, refreshToken;

      bearerToken = jwt.verify(token, sails.config.jwt.secret);
      refreshToken = jwt.verify(req.body.refresh_token, sails.config.jwt.refresh_secret);

      if (_.isEqual(bearerToken, refreshToken)) {
        delete bearerToken.exp;
        delete bearerToken.iat;

        user = bearerToken;
        issueTokens(user, res);
      };
    } else {
	negotiateError('unexpectedError', req, res);
    }
  },

  provider: function (req, res) {
        sails.services.passport.endpoint(req, res);
  },

  logout: function(req, res) {
    req.logout();
    res.send({
      success: true,
      message: 'logoutSuccessful'
    });
  },


  callback: function (req, res) {
    if (typeof req.param.action === 'undefined' || !req.param.action) {
	req.param.action = 'login';
    }
    var action = req.param('action');
    var user = req.param('user');
    
    if (action == "register" && typeof user === 'object' && user && typeof user.email === 'string' && typeof user.password === 'string') {
	if (typeof user.username !== 'string' || !user.username)
		user.username = user.email;
	sails.services.passport.protocols.local.createUser(user, function (error, created) {
		if (!error)
			res.json(200, created);
		else
			negotiateError(error, req, res);
	});
    } else {
	    return this.login(req,res);		
    }
//    sails.services.passport.callback(req, res, function (err, user) {
//      if (err || !user) {
//        sails.log.warn(user, err);
//        return negotiateError(err, req, res);
//      }
//    });
  },


  disconnect: function (req, res) {
    sails.services.passport.disconnect(req, res);
  },

};

function issueTokens(user, res) {
	var expirationTime = sails.config.jwt.expiration_time_in_minutes * 60 //seconds;

	var token = jwt.sign(user, sails.config.jwt.secret, {
		expiresIn: expirationTime //seconds
	});

	var refreshToken = jwt.sign(user, sails.config.jwt.refresh_secret, {
		expiresIn: expirationTime //seconds
	});

	delete user[0].passports;
	res.send({
		user: user[0],
		access_token: token,
		expires_in: expirationTime, // seconds
		refresh_token: refreshToken
	});

};


function negotiateError (err, req, res) {
	var action = req.param('action');
	if (action === 'register') {
		res.json(417, err);
	}
	else if (action === 'login') {
		res.json(417, err);
	}
	else if (action === 'disconnect') {
		res.redirect('/');
	}
	else {
		// make sure the server always returns a response to the client
		// i.e passport-local bad username/email or password
		res.forbidden(err);
	}
}










