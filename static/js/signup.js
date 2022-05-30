$(document).ready(function () {
    
    $('.signup-form').submit(function (e) { 
        e.preventDefault();
        let fullname = $('#full_name').val()
        let email = $('#email').val()
        let password = $('#password').val()
       
       
$.ajax({
	type: "POST",
	url: "/auth/signup",
	data: {
		fullname: fullname,
		email: email,
		password: password,
	
	},
	dataType: "application/json",
	success: function (response) {
		console.log(response);
		console.log(response);
	},
});

        
    });

});