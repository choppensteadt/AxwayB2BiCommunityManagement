var communities = [];

getCommunities();

function getCommunities() {
	$.activityIndicator.show();

	var KeyId = "aa719fec-a2e9-48e7-9a03-2fab2a5be0b1";
	var url = "http://"+Alloy.Globals.hostIP+":6080/rest/v1/communities?limit=50&offset=0&orderBy=partyName";

	var xhr = Ti.Network.createHTTPClient({
	    
	    onload: function(e) {
	    	
	    	try { 
				var response = JSON.parse(this.responseText); 
			} catch (e) { 
  				console.warn('Response parsing failed.', this.responseText, e);
			}

			var communities = [];

			for(var i in response.results){

//				Using the @ symbol in a key value pair key requires a two step process
				var id = "@id";
	
				var communityId = response.results[i][id];
				var communityName = response.results[i].partyName;
				var communitySubscribedPartners = response.results[i].subscribedPartners;
				var primaryContactId = response.results[i].primaryContact[id];
				var primaryContact = response.results[i].primaryContact.name;
				var primaryContactEmail = response.results[i].primaryContact.email;
				var secondLineText = primaryContact+", "+primaryContactEmail;
				var defaultRoutingIdId = response.results[i].defaultRoutingId[id];
				
				communities.push({
						properties: {
							searchableText: communityName,
							backgroundColor: "transparent",
							selectedBackgroundColor: "#CCC",
						},
						leftimage:{image:"/images/community.png"},
						communityName:{text:communityName},
						primaryContact:{text:secondLineText},
						communityId:{text:communityId},
						defaultRoutingIdId:{text:defaultRoutingIdId},
						primaryContactId:{text:primaryContactId},				
						template:'communityDetailTemplate'}
				);
			}
			$.communityListSection.setItems(communities);
			$.activityIndicator.hide();	
		},
	    onerror: function(e) {
			$.activityIndicator.hide();
            alert(e.error);
	        return false;
	    },
	    timeout:5000  /* in milliseconds */
	});
	xhr.open("GET", url);
	xhr.setRequestHeader('KeyId',KeyId);
	xhr.send();
}
function mnuLogoutClicked() {
	var rememberMeFromProperties = Ti.App.Properties.getBool('remember'); 
	Ti.App.fireEvent('cleanUpAfterLogoutEvent');
	Alloy.createController('login').getView().open();
}
function openCommunityDetail(e){
	var community = $.communityListSection.getItemAt(e.itemIndex);
	var communityId = community.communityId.text;
	var defaultRoutingIdId = community.defaultRoutingIdId.text;
	var primaryContactId = community.primaryContactId.text;
	
	Alloy.Globals.defaultRoutingIdId = defaultRoutingIdId;
	Alloy.Globals.primaryContactId = primaryContactId;
	
	var args = {"communityId":communityId,"defaultRoutingIdId":defaultRoutingIdId,"primaryContactId":primaryContactId};
	var communityDetail = Alloy.createController('communityDetail',args).getView();
	communityDetail.open();	
}