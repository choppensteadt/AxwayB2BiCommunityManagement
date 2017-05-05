var args = $.args;

// Strings for localization
$.lblProductName.text = L('product_name');
$.lblWelcome.text = L('welcome_message');
$.btnLogin.title = L('login');
$.txtUserName.hintText = L('username');
$.txtPassword.hintText = L('password');
$.swcKeepMeSignedIn.title = L('remember');

// Determine whether to remember host IP and username  
var rememberMeFromProperties = Ti.App.Properties.getBool('remember', false);

// Called when remember me switch is changed to update properties
function swcKeepMeSignedInChecked(){
	if ($.swcKeepMeSignedIn.value == true){
		Ti.App.Properties.setBool('remember', true);
	} else {
		Ti.App.Properties.setBool('remember', false);
	}
}
// Saves the arguments hostURL and username as properties
function saveLoginInformationToProperties(username, hostIP){
	Ti.App.Properties.setString('hostIP', hostIP);
	Ti.App.Properties.setString('username', username);
}
// Read whether 'remember me' is checked from properties, if so default host IP address and username then set switch to true
if(rememberMeFromProperties == true){
	var hostFromProperties = Ti.App.Properties.getString('hostIP');
	var usernameFromProperties = Ti.App.Properties.getString('username');
	$.txtHostIP.value = hostFromProperties;
	$.txtUserName.value = usernameFromProperties;
	$.swcKeepMeSignedIn.value = true;
	$.txtPassword.value = null;	
	$.txtPassword.focus();
} else {
	Ti.App.Properties.setBool('remember', false);
	$.txtPassword.value = null;
	$.txtHostIP.focus();
}
// Set arguments and pass them to login() function
function btnLoginClicked() {
	$.activityIndicator.show();
   	var hostIP = $.txtHostIP.value;
   	var username = $.txtUserName.value;
	var password = $.txtPassword.value;

	if($.swcKeepMeSignedIn.value == true){
		saveLoginInformationToProperties(username, hostIP);
	}
	login(hostIP, username, password);
}
function login(hostIP, username, password) {
	
	var creds = Ti.Utils.base64encode(username+":"+password);
	var KeyId = "aa719fec-a2e9-48e7-9a03-2fab2a5be0b1";
	var url = "http://"+hostIP+":6080/rest/v1/login";
	
	var xhr = Ti.Network.createHTTPClient({
	    onload: function(e) {
	    	
			var response = JSON.parse(this.responseText);

			Alloy.Globals.hostIP = hostIP;
			Alloy.Globals.username = username;
			Alloy.Globals.password = password;

			var communities = Alloy.createController('communities', args).getView();
			$.activityIndicator.hide();
			communities.open();
			return true;
	    },
	    onerror: function(e) {
			Alloy.Globals.hostIP = null;
			Alloy.Globals.username = null;
			Alloy.Globals.password = null;
			Alloy.Globals.sessionToken = null;
			$.activityIndicator.hide();
            alert("Login invalid");
            alert(e.error);
	        return false;
	    },
	    timeout:10000  /* in milliseconds */
	});
	
	xhr.open("POST", url);
	xhr.setRequestHeader('KeyId',KeyId);
	xhr.setRequestHeader('Authorization',"Basic "+creds);
	xhr.send();
}
function logout() {
	var KeyId = "aa719fec-a2e9-48e7-9a03-2fab2a5be0b1";
	var url = "http://"+Alloy.Globals.hostIP+":6080/rest/v1/logout";
	var xhr = Ti.Network.createHTTPClient({
	    onload: function(e) {
			var response = JSON.parse(this.responseText);
			return true;
	    },
	    onerror: function(e) {
            alert(e.error);
	        return false;
	    },
	    timeout:10000  /* in milliseconds */
	});
	xhr.open("POST", url);
	xhr.setRequestHeader('KeyId',KeyId);
	xhr.send();
}
// This event is fired when the 'logout' menu item is clicked on other screens.  It resets the login page.
Ti.App.addEventListener('cleanUpAfterLogoutEvent', function()
{
	logout();
	
	if(($.swcKeepMeSignedIn.value == true)){
		Alloy.Globals.password = null;
		$.txtPassword.value = null;
		$.txtPassword.focus();
	} else {
		Alloy.Globals.hostIP = null;
		Alloy.Globals.username = null;
		Alloy.Globals.password = null;
		$.txtUserName.value = null;
		$.txtPassword.value = null;
		$.txtHostIP.focus();
	}
});
// Disable the physical back button on the login screen
function loginBackButtonPressed() {
  // do nothing	
}