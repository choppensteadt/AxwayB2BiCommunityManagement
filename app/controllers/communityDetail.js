var args = $.args;
var communityID = args.communityID;
Alloy.Globals.communityID = communityID;

$.activityIndicator.hide();

// Start off with all 'tabs' hidden
hideAllTabs();

// Setup the default page
getCommunity(communityID);
getCommunityPartners();
getCommunityContacts();

function mnuLogoutClicked() {
   	var rememberMeFromProperties = Ti.App.Properties.getBool('remember'); 
	Ti.App.fireEvent('cleanUpAfterLogoutEvent');
	Alloy.createController('login').getView().open();
}
function getCommunityPartners(){
	var url = "http://"+Alloy.Globals.hostIP+":6080/rest/v1/communities/"+Alloy.Globals.communityID+"/subscriptions?limit=50&offset=0";
	var xhr = Ti.Network.createHTTPClient({

	    onload: function(e) {
			var response = JSON.parse(this.responseText);
			var count = response.count;

			// Set the Trading Partner Count on the main Community Detail Page
			$.lblNumberOfTradingPartners.text = count;
			return true;
		},
	    onerror: function(e) {
			$.activityIndicator.hide();
            alert(e.error);
	        return false;
	    },
	    timeout:10000  /* in milliseconds */
	});
	xhr.open("GET", url);
	xhr.send();	
}
function getCommunityContacts(){

	hideAllTabs();

	$.lvwContacts.show();
	$.lblTabTitle.text = L("community_detail_contacts_tab_label");
	
	$.activityIndicator.show();	
	
	var url = "http://"+Alloy.Globals.hostIP+":6080/rest/v1/communities/"+Alloy.Globals.communityID+"/contacts";
	var xhr = Ti.Network.createHTTPClient({
	    
	    onload: function(e) {
	    	
			var response = JSON.parse(this.responseText);
			var table = [];
						
			for(var i in response.results){
				
				var name = response.results[i].name;
				var phone = response.results[i].phone;
				var email = response.results[i].email;

				table.push({
					contactLeftImage:{image:"/images/contact.png"},
					contactName:{text:name},
					contactPhone:{text:phone},
					contactEmail:{text:email},
					template:'contactDetailTemplate'}
				);
			}
			$.contactListSection.setItems(table);
			$.activityIndicator.hide();
			return true;
		},
	    onerror: function(e) {
			$.activityIndicator.hide();
            alert(e.error);
	        return false;
	    },
	    timeout:10000  /* in milliseconds */
	});
	xhr.open("GET", url);
	xhr.send();	
}
function getCommunityCertificates(){

	hideAllTabs();
	
	$.lvwCertificates.show();
	$.lblTabTitle.text = L("community_detail_cert_tab_label");
	
	$.activityIndicator.show();	
	
	var url = "http://"+Alloy.Globals.hostIP+":6080/rest/v1/communities/security/"+Alloy.Globals.communityID+"/certificate/private";
	var xhr = Ti.Network.createHTTPClient({
	    
	    onload: function(e) {
			var response = JSON.parse(this.responseText);
			var table = [];
						
			for(var i in response.results){
				
				var name = response.results[i].friendlyName;
				var state = response.results[i].certificateState;
				var usage = response.results[i].certificateUsage;
				var expirationDate = response.results[i].validTo;
				var formattedExpirationDate = new Date(expirationDate).toLocaleDateString();

				var ed = new Date(expirationDate).getTime();
				var dte = getNumberOfDaysUntilExpiration(ed);
				
				// If certificate will expire within 31 days, but has not already expired then show an alert icon.
				if (dte < 31 && dte >= 0) {
					var expire = "/images/alert.png";
				}
				else {
					var expire = "";					
				}
				table.push({
					certificateLeftImage:{image:"/images/certificate.png"},
					certName:{text:name},
					certState:{text:state},
					certUsage:{text:usage},
					certExpirationDate:{text:formattedExpirationDate},
					certificateRightImage:{image:expire},
					template:'certDetailTemplate'}
				);	
			}
			$.certListSection.setItems(table);
			$.activityIndicator.hide();			
			return true;
		},
	    onerror: function(e) {
			$.activityIndicator.hide();
            alert(e.error);
	        return false;
	    },
	    timeout:10000  /* in milliseconds */
	});
	xhr.open("GET", url);
	xhr.send();	
}
function getCommunityRoutingIds(){

	hideAllTabs();
	
	$.lvwRoutingIds.show();
	$.lblTabTitle.text = L("community_detail_routingIds_tab_label");
	
	$.activityIndicator.show();	
	
	var url = "http://"+Alloy.Globals.hostIP+":6080/rest/v1/communities/"+Alloy.Globals.communityID+"/routingIds";
	var xhr = Ti.Network.createHTTPClient({
	    
	    onload: function(e) {
	    	
			var response = JSON.parse(this.responseText);
			var table = [];
						
			for(var i in response.results){
				
				var routingId = response.results[i].routingId;

				table.push({
					routingIdLeftImage:{image:"/images/routing.png"},
					routingId:{text:routingId},
					template:'routingIdDetailTemplate'}
				);
			}
			$.routingIdListSection.setItems(table);
			$.activityIndicator.hide();
			return true;
		},
	    onerror: function(e) {
			$.activityIndicator.hide();
            alert(e.error);
	        return false;
	    },
	    timeout:10000  /* in milliseconds */
	});
	xhr.open("GET", url);
	xhr.send();
}
function getApplicationDeliveries(){

	hideAllTabs();

	$.lvwAppDeliveries.show();
	$.lblTabTitle.text = L("community_detail_app_deliveries_tab_label");

	var url = "http://"+Alloy.Globals.hostIP+":6080/rest/v1/application/exchange/delivery?limit=100&offset=0&orderBy=name";
	var xhr = Ti.Network.createHTTPClient({
		onload: function(e) {
			var response = JSON.parse(this.responseText);
			var appDeliveries = [];
						
			for(var i in response.results){
				
				// These variables are used to get around the @ character in parsing the response
				var id = "@id";
				var tp = "@class";
				
				// Parse the JSON object to get desired values
				var appDeliveryId = response.results[i][id];
				var name = response.results[i].friendlyName;
				var protocol = response.results[i].businessProtocol;
				var transport = response.results[i][tp];
				var url = response.results[i].url;

				// Push the values to the array
				appDeliveries.push({
					appDeliveryLeftImage:{image:"/images/pickup.png"},
					appDeliveryId:{text:appDeliveryId},
					appDeliveryName:{text:name},
					appDeliveryProtocol:{text:protocol},
					appDeliveryTransport:{text:transport},
					appDeliveryUrl:{text:url},
					template:'appDeliveryTemplate'}
				);
			}
			
			// Write the array to the listview
			$.appDeliveryListSection.setItems(appDeliveries);
			
			$.activityIndicator.hide();
			return true;
		},
	    onerror: function(e) {
			$.activityIndicator.hide();
            alert(e.error);
	        return false;
	    },
	    timeout:10000  /* in milliseconds */
	});
	xhr.open("GET", url);
	xhr.send();
}
function getApplicationPickups(){

	hideAllTabs();

	$.lvwAppPickups.show();
	$.lblTabTitle.text = L("community_detail_app_pickups_tab_label");
	
	var url = "http://"+Alloy.Globals.hostIP+":6080/rest/v1/application/exchange/pickup?limit=100&offset=0&orderBy=name";
	var xhr = Ti.Network.createHTTPClient({
		onload: function(e) {
			var response = JSON.parse(this.responseText);
			var appPickups = [];
						
			for(var i in response.results){
				
				// These variables are used to get around the @ character in parsing the response
				var id = "@id";
				var tp = "@class";
				
				// Parse the JSON object to get desired values
				var appPickupId = response.results[i][id];
				var name = response.results[i].friendlyName;
				var protocol = response.results[i].businessProtocol;
				var transport = response.results[i][tp];
				var url = response.results[i].url;

				// Push the values to the array
				appPickups.push({
					appPickupLeftImage:{image:"/images/pickup.png"},
					appPickupId:{text:appPickupId},
					appPickupName:{text:name},
					appPickupProtocol:{text:protocol},
					appPickupTransport:{text:transport},
					appPickupUrl:{text:url},
					template:'appPickupTemplate'}
				);
			}
			
			// Write the array to the listview
			$.appPickupListSection.setItems(appPickups);
			
			$.activityIndicator.hide();
			return true;
		},
	    onerror: function(e) {
			$.activityIndicator.hide();
            alert(e.error);
	        return false;
	    },
	    timeout:10000  /* in milliseconds */
	});
	xhr.open("GET", url);
	xhr.send();
}
function getCommunityTradingPickups(){

	hideAllTabs();
	
	$.lvwTradingPickups.show();
	$.lblTabTitle.text = L("community_detail_trading_pickups_tab_label");
	
	var url = "http://"+Alloy.Globals.hostIP+":6080/rest/v1/communities/exchange/"+Alloy.Globals.communityID+"/trading/pickup";
	var xhr = Ti.Network.createHTTPClient({
		onload: function(e) {
			var response = JSON.parse(this.responseText);
			var pickups = [];
						
			for(var i in response.results){
				
				var id = "@id";
				var pickupId = response.results[i][id];
				var name = response.results[i].friendlyName;
				var protocol = response.results[i].businessProtocol;
				var url = response.results[i].url;
				
				pickups.push({
					tradingPickupLeftImage:{image:"/images/pickup.png"},
					tradingPickupId:{text:pickupId},
					tradingPickupName:{text:name},
					tradingPickupProtocol:{text:protocol},
					tradingPickupUrl:{text:url},
					template:'tradingPickupTemplate'}
				);
			}
			$.tradingPickupListSection.setItems(pickups);
			$.activityIndicator.hide();
			return true;
		},
	    onerror: function(e) {
			$.activityIndicator.hide();
            alert(e.error);
	        return false;
	    },
	    timeout:10000  /* in milliseconds */
	});
	xhr.open("GET", url);
	xhr.send();	
}
function getCommunityTradingPartners(){

	hideAllTabs();
	
	$.lvwTradingPartners.show();
	$.lblTabTitle.text = L("community_detail_trading_partners_tab_label");
	
	$.activityIndicator.show();	
	
	var url = "http://"+Alloy.Globals.hostIP+":6080/rest/v1/communities/"+Alloy.Globals.communityID+"/subscriptions?limit=50&offset=0";
	var xhr = Ti.Network.createHTTPClient({

	    onload: function(e) {
			var response = JSON.parse(this.responseText);
			var tradingPartners = [];
			
			for (var i=0; i < response.results.length; i++){

				var tradingPartnerIdString = response.results[i];
				var tradingPartnerId = tradingPartnerIdString.slice(20);

				var url2 = "http://"+Alloy.Globals.hostIP+":6080/rest/v1/tradingPartners/"+tradingPartnerId;
				var xhr2 = Ti.Network.createHTTPClient({
			
				    onload: function(e) {
				    					    	
						var tradingPartnerDetailResponse = JSON.parse(this.responseText);
						var tradingPartnerName = tradingPartnerDetailResponse.partyName;
						var primaryContactName = tradingPartnerDetailResponse.primaryContact.name;
						var primaryContactEmail = tradingPartnerDetailResponse.primaryContact.email;
						var tradingPartnerDefaultRoutingId = tradingPartnerDetailResponse.defaultRoutingId.routingId;

						tradingPartners.push({
							tradingPartnerLeftImage:{image:"/images/partner.png"},
							tradingPartnerId:{text:tradingPartnerId},
							tradingPartnerName:{text:tradingPartnerName},
							tradingPartnerPrimaryContactName:{text:primaryContactName},
							tradingPartnerPrimaryContactEmail:{text:primaryContactEmail},
							tradingPartnerDefaultRoutingId:{text:tradingPartnerDefaultRoutingId},
							template:'tradingPartnerDetailTemplate'}
						);
						$.tradingPartnerListSection.setItems(tradingPartners);
						$.activityIndicator.hide();
					},
				    onerror: function(e) {
						$.activityIndicator.hide();
			            alert(e.error);
				        return false;
				    },
				    timeout:10000  /* in milliseconds */
				});
				xhr2.open("GET", url2);
				xhr2.send();
			}
		},
	    onerror: function(e) {
			$.activityIndicator.hide();
            alert(e.error);
	        return false;
	    },
	    timeout:10000  /* in milliseconds */
	});
	xhr.open("GET", url);
	xhr.send();
}
function getCommunity(communityID) {
	$.activityIndicator.show();
	var url = "http://"+Alloy.Globals.hostIP+":6080/rest/v1/communities/"+communityID;
	var xhr = Ti.Network.createHTTPClient({

		onload: function(e) {

			var response = JSON.parse(this.responseText);
			var communityName = response.partyName;
			var communitySubscribedPartners = response.subscribedPartners;
			var primaryContact = response.primaryContact.name;
			var primaryContactEmail = response.primaryContact.email;
			var defaultRoutingId = response.defaultRoutingId.routingId;
			
			var communityNameAndDefaultRoutingId = communityName;
			var communityInformation = primaryContact+", "+primaryContactEmail+", "+defaultRoutingId;

			$.lblAppDescription.text = communityNameAndDefaultRoutingId;
			$.lblCommunityInformation.text = communityInformation;
			$.activityIndicator.hide();
			return true;
		},
	    onerror: function(e) {
			$.activityIndicator.hide();
            alert(e.error);
	        return false;
	    },
	    timeout:10000  /* in milliseconds */
	});
	xhr.open("GET", url);
	xhr.send();
}
function hideAllTabs(){
	$.lvwAppDeliveries.hide();
	$.lvwAppPickups.hide();
	$.lvwTradingPickups.hide();
	$.lvwTradingPartners.hide();
	$.lvwContacts.hide();
	$.lvwRoutingIds.hide();
	$.lvwCertificates.hide();
	return true;	
}
function showHelp(){
	alert("Help");
}
function getNumberOfDaysUntilExpiration(expirationDate){
	var d = new Date();
	var n = d.getTime();
	var e = expirationDate;
	var mte = e - n;
	var dte = (mte/86400000);
	return dte;
}