dojo.provide("paypal.paypalwidget");
dojo.require("paypal.WebspireLicenseChecker");
mendix.widget.declare("paypal.paypalwidget", {
	/*
	 * WS PayPal Widget v1.0 
	 * Developed by WebSpire, www.webspire.nl.
	 */	

	addons       : [mendix.addon._Contextable],
	mxObjectRef:null,
	
	inputargs: {
		caption:"",
		captiond:"",
		price:"",
		priced:"",
		currency:"",
		currencyd:"",
		business:"",
		businessd:"",
		itemname:"",
		itemnamed:"",
		url:"",
		urld:"",
		license:"",
		tabindex:0,
		target:"",
		reference:"",
		afterclickaction:"",
		licensekey:""
	},
	
	// references to DOM elements
	priceInput:null,
	currencyInput:null,
	businessInput:null,
	urlInput:null,
	itemNameInput:null,
	referenceInput:null,
	form:null,
	button:null,
	

	validateLicenseCallback : function(output) {
		processedOutput = dojo.fromJson(output.xhr.responseText);
		license = processedOutput['actionResult'];
		
		/*
		 * Removing or changing the license statement below is illegal determined by the Terms of Use as available on
		 * http://www.webspire.nl/products/paypal.php
		 */	
		if(!validLicense(license, "WSPayPalWidget")){
			mx.ui.warn("This is the trial version of the WS PayPal widget. This message is not showed in the payed version. "
			+ "See http://www.webspire.nl/products/paypal.php for more information.", {modal:true});
		};
	},
	
	validateLicense : function(){
		mx.processor.xasAction(
			{
				error       : function() {
					logger.error(this.id + "error: XAS error executing microflow");
				},
				actionname  : this.licensekey,
				guids       : [],
				callback	: dojo.hitch(this, this.validateLicenseCallback)
			}
		);
	},
	
	postCreate : function(){
		
		this.validateLicense();	
		
		this.form = mxui.dom.form(
			{
				"method":"post",
				"action":"https://www.paypal.com/cgi-bin/webscr",
				"target":this.target
			}
		);
		this.addFieldToPost("cmd", "_xclick");
		this.currencyInput = this.addFieldToPost( "currency_code", "");
		this.businessInput = this.addFieldToPost("business", "");
		this.urlInput = this.addFieldToPost("return", "");
		this.itemNameInput = this.addFieldToPost("item_name", "");
		this.referenceInput = this.addFieldToPost("custom", "");
		this.priceInput = this.addFieldToPost("amount", "");
		
		dojo.place(this.form, this.domNode);
		
		this.actRendered();
		
	},
	makeButton : function () {
		if(this.button==null){
			this.button = new mxui.widget._Button({
			    caption     : this.getCaption(),
			    action      : dojo.hitch(this, this.onButtonClick),
			    tabIndex	: this.tabindex
			});
		};
		dojo.connect(this.button.domNode, "onclick", dojo.hitch(this, this.onButtonClick));
   	},
	
	onButtonClick : function () {
		if(this.afterclickaction != ""){
			mx.processor.xasAction({
        		error       : function() {
        			logger.error(this.id + "error: XAS error executing microflow");
        		},
        		actionname  : this.afterclickaction,
        		guids       : [this.mxObjectRef.getGUID()],
        		applyto		: "selection",
        		callback	: function(){}
        	});
		}
		this.form.submit(); 
	},
	
	// Function to generate input fields
	addFieldToPost : function(field, value, isAmount){
		var element = mxui.dom.input({
			"name": field,
			"type": "hidden",
			"value": value
		});
		dojo.place(element, this.form);
		return element;
	},
	
	// Function that handles object receiving. Set the hidden fields
	update : function(object, callback){
		// Waarom krijg ik 2 updates met lege objecten?
		if(object == null) return;
		
		var firstUpdate = this.mxObjectRef == null;
		this.mxObjectRef = object;
		
		if(firstUpdate){
			this.makeButton();
			dojo.place(this.button.domNode, this.form);
		}
		
		dojo.attr(this.currencyInput,"value", this.getCurrency());
		dojo.attr(this.businessInput, "value", this.getBusiness());
		dojo.attr(this.referenceInput, "value", "mxwidget_" + this.getReference());
		dojo.attr(this.itemNameInput, "value", this.getItemName());
		dojo.attr(this.urlInput, "value", this.getURL());
		dojo.attr(this.priceInput, "value", this.getPrice());

		callback && callback();
	},  
	
	// Get fixed or dynamic values
	getCurrency:function(){
		if(this.currencyd != ""){
			return this.mxObjectRef.get(this.currencyd);
		}
		else {
			return this.currency;
		}
	},
	getPrice:function(){
		if(this.priced != ""){
			return this.mxObjectRef.get(this.priced);
		}
		else return this.price;
	},
	getReference:function(){
		return this.mxObjectRef.get(this.reference);
	},
	getBusiness:function(){
		if(this.businessd != ""){
			return this.mxObjectRef.get(this.businessd);
		}
		else return this.business;
	},
	getCaption:function(){
		if(this.captiond != ""){
			return this.mxObjectRef.get(this.captiond);
		}
		else return this.caption;
	},
	getItemName:function(){
		if(this.itemnamed != ""){
			return this.mxObjectRef.get(this.itemnamed);
		}
		else return this.itemname;
	},
	getURL:function(){
		if(this.urld != ""){
			return this.mxObjectRef.get(this.urld);
		}
		else return this.url;
	}
});;
