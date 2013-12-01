/*!
 * Backbone SDK for Sails and Socket.io
 * (override for Backbone.sync and Backbone.Collection)
 *
 * c. 2013 @mikermcneil
 * MIT Licensed
 *
 *
 * Inspired by:
 * backbone.iobind - Backbone.sync replacement
 * Copyright(c) 2011 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */


/**
 * # Backbone.sync
 *
 * Replaces default Backbone.sync function with socket.io transport
 *
 * ### Connecting
 * > i.e. What do I have to do to get started?
 *
 * Currently, this SDK expects active socket to be located at
 * `window.socket`, `Backbone.socket` or the `socket` property on 
 * the instance of the specific model/collection communicating w/
 * the server.  See inline comments if you want to change it.
 *
 *
 *
 * ### Talking to the Server
 * i.e. How does this send messages to the Sails server?
 *
 * This client will emit socket requests to URLs, which will be 
 * interpreted and routed by Sails accordingly, whether they are
 * to custom URLs in your routes.js file or automatic API blueprints.
 * 
 * e.g. if your Backbone collection's URL is '/todo', calling `fetch()`
 * will still contact the Sails backend at `GET /todo`-- but now it will
 * use Socket.io to emit a packet on the connected socket instead of 
 * sending an HTTP request.
 *
 *
 *
 * ### Listening to the Server
 * > i.e. What happens when comet messages arrive?
 *
 * When your Sails publishes a message using `Foo.publish`, the name of
 * the socket event is always 'message'. This SDK examines all incoming
 * messages from Sails, then triggers a `comet` event on the `Backbone` 
 * global.  You can listen for these events like so:
 *
 * Backbone.on('comet', function sailsPublishedSomething ( message ) {
 *		// do different stuff depending on what's in `message`
 *		// (could be a string or an object)
 * })`
 *
 *
 *
 * ### Roadmap
 * > i.e. What's next?
 *
 * I wanted to start small and make sure the first version
 * was simple and clean, and didn't touch more of the Backbone core than 
 * absolutely necessary.
 *
 * +	Built-in auto-sync for collections/models, accomplished by expecting
 *		a standard CRUD-compatible format in the published messages from the
 *		server.
 *
 * +	Ability to pass in a connected socket as an option to fetch/save/etc.
 *		as an alternative to stuffing it in window.socket, Backbone.socket, etc.
 *
 * @name sync
 */


Backbone.sync = function (method, model, options) {

	// Clone options to avoid smashing anything unexpected
	options = _.extend({}, options);



	// Get the actual URL (call `.url()` if it's a function)
	var url;
	if (options.url) {
		url = _.result(options, 'url');
	}
	else if (model.url) {
		url = _.result(model, 'url');
	}
	// Throw an error when a URL is needed, and none is supplied.
	// Copied from backbone.js#1558
	else throw new Error('A "url" property or function must be specified');



	// Build parameters to send to the server
	var params = {};

	if ( !options.data && model ) {
		params = options.attrs || model.toJSON(options) || {};
	}

	if (options.patch === true && options.data.id === null && model) {
		params.id = model.id;
	}



	// If your connected socket exists on a different variable, change here:
	var io = model.socket || Backbone.socket || window.socket;



	// Map Backbone's concept of CRUD methods to HTTP verbs
	var verb;
	switch (method) {
		case 'create':
			verb = 'post';
			break;
		case 'read':
			verb = 'get';
			break;
		case 'update':
			verb = 'put';
			break;
		default:
			verb = method;
	}



	// Send a simulated HTTP request to Sails via Socket.io
	var simulatedXHR = 
		socket.request(url, params, function serverResponded ( response ) {
			if (options.success) options.success(response);
		}, verb);



	return simulatedXHR;



	/*
	var simulatedXHR = $.Deferred();



	// Send a simulated HTTP request to Sails via Socket.io
	io.emit(verb, params, function serverResponded (err, response) {
		if (err) {
			if (options.error) options.error(err);
			simulatedXHR.reject();
			return;
		}

		if (options.success) options.success(response);
		simulatedXHR.resolve();
	});



	var promise = simulatedXHR.promise();



	// Trigger the model's `request` event
	model.trigger('request', model, promise, options);



	// Return a promise to allow chaining of sync methods.
	return promise;
	*/
};




