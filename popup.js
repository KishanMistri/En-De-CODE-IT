var ScriptVarMsg;
var PT;
function SavePT(Str){
	PT=Str;
}
function getDecipherPT(Str){
	return PT;
}


$(function(){

	
	$('#en').click(function(){
				var PTmsg = $('#MsgInput').val();
				chrome.storage.sync.set({'PTmsg': PTmsg});
				console.log('message saved');
				SavePT(PTmsg);
				console.log(PTmsg);
				var KeyPass=$('#Key').val();
				chrome.storage.sync.set({'KeyPass': KeyPass});
				console.log('Key saved');
				if (PTmsg){
					window.ScriptVarMsg=CryptoJS.AES.encrypt(PTmsg,KeyPass);
				}
				else{
					window.ScriptVarMsg="Enter valid input";
				}
				var encryptedtext=ScriptVarMsg;
				$('#output').text(encryptedtext);
//				document.getElementById(output).innerHTML=encryptedtext;
	});
	
	$('#de').click(function(){
				var CTmsg = $('#EncInput').val();
				var KeyPass=$('#Key').val();
				var decryptedtext;
				    chrome.storage.sync.get('PTmsg', function(result){
						decryptedtext= result.PTmsg;
						console.log(decryptedtext);
						console.log('message decrypted successfully');
					});
				
				if (CTmsg){
					ScriptVarMsg=CryptoJS.AES.decrypt(CTmsg, KeyPass);
				}
				else{
					ScriptVarMsg="Enter valid input";
				}
				decryptedtext=getDecipherPT(CTmsg);
				$('#output').text(decryptedtext);
	});
});	

