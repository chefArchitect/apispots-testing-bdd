/*
 * Modules
 */
var expect = require('chai').expect;
var assert = require('chai').assert;

module.exports = function() {
	
	var Given = When = Then = this.defineStep;
	
	/**
	 * ... response type '$mimeType'
	 */
	Given(/^response type "([^"]*)"$/, function (type, callback) {
		
		// set the 'Accepts' header
		var op = this.Api.getCurrentOperation();
		op.request.headers['Accepts'] = type;
	});
	
	/**
	 * response code is '$code'
	 */
	Then(/^response code is "([^"]*)"$/, function (code, callback) {
		
		// get the current operation
		var op = this.Api.getCurrentOperation();
		
		expect(op.response).not.to.be.null;
		
		if ( isNaN( code ) )
			return callback.fail('Response code should be a valid number');
		
		expect(op.response.code).to.eq(Number(code));
		
		callback();
	});
	

	/**
	 * response status is '$status'
	 */
	Then(/^response status is "([^"]*)"$/, function (status, callback) {
		
		// get the current operation
		var op = this.Api.getCurrentOperation();
		expect(op.response).not.to.be.null;
		
		var statuses = ['info', 'ok', 'clientError', 'serverError', 'accepted', 'noContent', 'badRequest', 'unauthorized', 'notAcceptable', 'notFound', 'forbidden', 'error'];
		
		if (! isNaN( status ) )
			return callback.fail('Response status should not be a number, but one of [' + statuses + ']');

		if ( statuses.indexOf( status ) == -1 )
			return callback.fail('Response status should be one of [' + statuses + ']');
		
		try{
			expect(op.response[status]).to.be.true;
		}
		catch (e){
	
			var error = "Server status was different than '" + status + "'\n"; 
			error += "Status: " + op.response.status + "\n" + op.response.body;
			
			return callback.fail(error);
		}
		
		callback();
	});
	
	/**
	 * ... response has time out error
	 */
	Then(/^response has time out error$/, function (callback) {
		var op = this.Api.getCurrentOperation();
		expect(op.response).not.to.be.null;
		
		if (! op.response.error)
			return callback.fail('Response has no error codes');
		
		expect(op.response.error).to.have.deep.property('code', 'ETIMEDOUT');
		
		callback();
	});
	
	/**
	 * ... response body has attributes [table]
	 */
	Then(/^response body has attributes$/, function (table, callback) {
		
		var op = this.Api.getCurrentOperation();
		expect(op.response).not.to.be.null;
		
		// get the response body
		var body = op.response.body;

		/*
		 * go through the attributes / values from the table
		 */
		for (var idx in table.rows())
		{
			var row = table.rows()[idx];
			var attribute = row[0];
			var value = row[1];
			
			/*
			 * resolve type - default is string
			 */
			if ( value.indexOf('"') > -1 )
			{
				// double-quotes
				value = value.replace(/"/g, '');
			}
			else if ( value.indexOf("'") > -1 ) 
			{
				// single-quotes
				value = value.replace(/'/g, '');
			}
			else if ( ! isNaN(value) ) 
			{
				// number
				value = Number(value);
			}
			else if ( (value === 'true') || (value === 'false') ) 
			{
				// boolean
				value = ( value === 'true' ? true : false );
			}
			
			// assert that attribute has the given value
			expect(body).to.have.deep.property(attribute, value);
		}
		
		callback();
	});
	
	
};