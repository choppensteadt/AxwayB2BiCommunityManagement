var args = $.args;

var mode = args.mode;
var contactId = args.contactId;
var communityId = args.communityId;

Alloy.Globals.mode = mode;
Alloy.Globals.contactId = contactId;
Alloy.Globals.communityId = communityId;

$.ivEmail.hide();
$.ivPrimaryContact.hide();

// Strings for localization
$.swcPrimaryContactYN.title = L('contact_make_primary_contact');
$.btnDelete.title = L('contact_delete_button');
$.btnSave.title = L('contact_save_button');
$.btnEdit.title = L('contact_edit_button');

switch (mode) {
	case 'new':
		enterNewMode();
		break;		
	case 'edit':
		enterEditMode();
		break;
	case 'view':
		enterViewMode(contactId);
		break;
	default:
		enterViewMode();
		break;
}
function enterViewMode(contactId){
	hideAllTextFields();
	showAllLabels();

	Alloy.Globals.mode = "view";
	
	$.btnCancel.title = L('contact_close_button');
	
	$.btnSave.hide();
	$.btnEdit.show();
	$.btnCancel.show();
	
	$.activityIndicator.show();
	
	var url = "http://"+Alloy.Globals.hostIP+":6080/rest/v1/communities/contacts/"+contactId;
	var xhr = Ti.Network.createHTTPClient({

		onload: function(e) {

	    	try { 
				var response = JSON.parse(this.responseText); 
			} catch (e) { 
  				console.warn('Response parsing failed.', this.responseText, e);
			}

			var contactName = response.name;
			var contactTitle = response.title;
			var contactPhone = response.phone;
			var contactEmail = response.email;
			var contactNotes = response.notes;
			var contactPrimary = response.primary;
			
			$.lblContactName.text = contactName;
			$.lblContactTitle.text = contactTitle;
			$.lblContactEmail.text = contactEmail;
			$.lblContactPhone.text = contactPhone;
			$.lblContactNotes.text = contactNotes;
			$.swcPrimaryContactYN.value = response.primary;
			
			if ($.lblContactEmail.text != ""){
				$.ivEmail.show();
			} else {
				$.ivEmail.hide();
			}
			
			if ($.swcPrimaryContactYN.value == true){
				$.ivPrimaryContact.show();
				Alloy.Globals.primaryContactYN = true;
				$.btnDelete.hide();
			} else {
				$.ivPrimaryContact.hide();
				Alloy.Globals.primaryContactYN = false;
				$.btnDelete.show();
			}
			
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
function enterNewMode(){
	hideAllLabels();
	showAllTextFields();

	Alloy.Globals.mode = "new";
	
	// Going to have to handle the situation where we're adding the first contact to a community
	$.swcPrimaryContactYN.value = false;
	
	if ($.swcPrimaryContactYN.value == true){
		$.ivPrimaryContact.show();
		Alloy.Globals.primaryContactYN = true;
		$.btnDelete.hide();
	} else {
		$.ivPrimaryContact.hide();
		Alloy.Globals.primaryContactYN = false;
	}

	$.btnCancel.title = L('contact_cancel_button');
	$.btnDelete.hide();
	$.btnSave.show();
	$.btnEdit.hide();
	$.btnCancel.show();
}
function enterEditMode(){
	hideAllLabels();
	showAllTextFields();
	
	Alloy.Globals.mode = "edit";
	
	$.btnDelete.hide();
	$.btnSave.show();
	$.btnEdit.hide();
	$.btnCancel.show();
	
	$.btnCancel.title = L('contact_cancel_button');
	
	$.tfContactName.value = $.lblContactName.text;
	$.tfContactTitle.value = $.lblContactTitle.text;
	$.tfContactEmail.value = $.lblContactEmail.text;
	$.tfContactPhone.value = $.lblContactPhone.text;
	$.taContactNotes.value = $.lblContactNotes.text;
	$.swcPrimaryContactYN.value = $.swcPrimaryContactYN.value;
}
function saveContact(){

	$.activityIndicator.show();

	if (Alloy.Globals.mode == "edit") {
		var primary = $.swcPrimaryContactYN.value;
		var name = $.tfContactName.value;
		var	email = $.tfContactEmail.value;
		var phone = $.tfContactPhone.value;
		var notes = $.taContactNotes.value;
		var	title = $.tfContactTitle.value;
		
		var id = "@id";
		
		var body = {
			'primary': primary,
			'name': name,
			'email': email,
			'phone': phone,
			'notes': notes,
			'title': title,
			'@id': Alloy.Globals.contactId};
		
		var url = "http://"+Alloy.Globals.hostIP+":6080/rest/v1/communities/contacts";
		var xhr = Ti.Network.createHTTPClient({
	
			onload: function(e) {
	
		    	try { 
					var response = JSON.parse(this.responseText); 
				} catch (e) { 
	  				console.warn('Response parsing failed.', this.responseText, e);
				}
				
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
		xhr.open("PUT", url);
		xhr.send(body);	
		$.contact.close();
	} else if (Alloy.Globals.mode == "new") {

		var primary = $.swcPrimaryContactYN.value;
		var name = $.tfContactName.value;
		var	email = $.tfContactEmail.value;
		var phone = $.tfContactPhone.value;
		var notes = $.taContactNotes.value;
		var	title = $.tfContactTitle.value;
		
		var bodyString = '{"primary":true,"name":"Contact","email":"contact@axway.com","phone":"123456789","notes":"Notes","title":"Title"}';

		// remove non-printable and other non-valid JSON chars
		bodyString = bodyString.replace(/[\u0000-\u0019]+/g,""); 

		var body = JSON.parse(bodyString);

		var url = "http://"+Alloy.Globals.hostIP+":6080/rest/v1/communities/"+communityId+"/contacts";
		var xhr = Ti.Network.createHTTPClient({
	
			onload: function(e) {
	
		    	try { 
					var response = JSON.parse(this.responseText); 
				} catch (e) { 
	  				console.warn('Response parsing failed.', this.responseText, e);
				}

				$.activityIndicator.hide();
				return true;
			},
		    onerror: function(e) {
				$.activityIndicator.hide();
	            alert(e.error);
		        return false;
		    },
		    timeout:10000
		});
		xhr.setRequestHeader('Content-Type','application/json');
		xhr.open("POST", url);
		xhr.send(body);	
		contactModifiedRefreshCommunity();
	}
}
function updateContact(){
	enterEditMode();
}
function deleteContact(){
	var dialog = Ti.UI.createAlertDialog({
		title: L('delete_contact_dialog_title'),
		message: L('delete_contact_dialog_message'),
		buttonNames: [L('delete_contact_dialog_yes'), L('delete_contact_dialog_cancel')],
		send: 1,
	    cancel: 2,
	});
	dialog.addEventListener('click', function(e){
		if (e.index === 1){
	    	// The cancel button was clicked
		} 
		else if (e.index === 0){
			// The delete button was clicked
			var url = "http://"+Alloy.Globals.hostIP+":6080/rest/v1/communities/contacts/"+Alloy.Globals.contactId;
			var xhr = Ti.Network.createHTTPClient({
		
				onload: function(e) {
		
			    	try { 
						var response = JSON.parse(this.responseText); 
					} catch (e) { 
		  				console.warn('Response parsing failed.', this.responseText, e);
					}
					
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
			xhr.open("DELETE", url);
			xhr.send();
			contactModifiedRefreshCommunity();
		}
	});
	dialog.show();
}
function cancelContact(){
	if (Alloy.Globals.mode == "view") {
		$.contact.close();
	} else if (Alloy.Globals.mode == "new") {
		$.contact.close();
	} else if (Alloy.Globals.mode == "edit") {
		enterViewMode(Alloy.Globals.contactId);
	}
}
function hideAllTextFields(){
	$.contactEditMode.hide();
//	$.tfContactName.hide();
//	$.tfContactTitle.hide();
//	$.tfContactEmail.hide();
//	$.tfContactPhone.hide();
//	$.taContactNotes.hide();	
}
function showAllTextFields(){
	$.contactEditMode.show();
//	$.tfContactName.show();
//	$.tfContactTitle.show();
//	$.tfContactEmail.show();
//	$.tfContactPhone.show();
//	$.taContactNotes.show();	
}
function hideAllLabels(){
	$.contactTopSectionViewMode.hide();
	$.contactBottomSectionViewMode.hide();
//	$.lblContactName.hide();
//	$.lblContactTitle.hide();
//	$.lblContactEmail.hide();
//	$.lblContactPhone.hide();
//	$.lblContactNotes.hide();	
}
function showAllLabels(){
	$.contactTopSectionViewMode.show();
	$.contactBottomSectionViewMode.show();
//	$.lblContactName.show();
//	$.lblContactTitle.show();
//	$.lblContactEmail.show();
//	$.lblContactPhone.show();
//	$.lblContactNotes.show();
}
function mnuLogoutClicked() {
	var rememberMeFromProperties = Ti.App.Properties.getBool('remember'); 
	Ti.App.fireEvent('cleanUpAfterLogoutEvent');
	Alloy.createController('login').getView().open();
}
function contactModifiedRefreshCommunity() {
	var communityId = Alloy.Globals.communityId;
	var defaultRoutingIdId = Alloy.Globals.defaultRoutingIdId;
	var primaryContactId = Alloy.Globals.primaryContactId;
	var args = {"communityId":communityId,"defaultRoutingIdId":defaultRoutingIdId,"primaryContactId":primaryContactId};
	var communityDetail = Alloy.createController('communityDetail',args).getView();
	$.contact.close();
	communityDetail.open();
}
function sendEmailToContact(){
	var emailDialog = Ti.UI.createEmailDialog();
	emailDialog.toRecipients = [$.lblContactEmail.text];
	emailDialog.subject = L('notification_email_dialog_subject');
	emailDialog.messageBody = L('notification_email_dialog_body');
	emailDialog.open();
}
