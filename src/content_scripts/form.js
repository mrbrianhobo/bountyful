
function newBounty(text, post, answers) {
	var title = text;
	var description = post;
	var amt = answers[1];
	var email = answers[0];
	var time = answers[0];
	document.getElementById('contract_title').value = title;
	document.getElementById('contract_description').value = description;
	document.getElementById('fulfillmentAmount').value = amt;
	document.getElementById('contact_info').value = email
	//"yyyy-MM-ddThh:mm"
	document.getElementById('bounty_deadline').value = time;
	// document.getElementById('deposit_amount').value = amt;
	document.getElementsByTagName('button')[0].click();
}

function fulfillBounty(email, description) {
	document.getElementById('contact').value = email;
	document.getElementById('bug_description').value = description;
}


