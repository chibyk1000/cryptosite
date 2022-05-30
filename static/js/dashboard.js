$(document).ready(function () {

    setInterval(() => {
     
    })
  $.ajax({
		type: "get",
		url: "/bitcoin/balance",
		data: "data",
		dataType: "json",
		success: function (response) {
			console.log(response);
			const { balance, final_balance } = response[0];

			const btc_balance = (balance + response[2].balance) / 100000000;
			$(".balance").html(btc_balance + "BTC");
			$(".convert").html(response[1].price * btc_balance + "USD");
		},
	}); 
    

    $(".send").click(function () {
        if (!$(".trans-body").hasClass("show")) {
            $(".trans-body").addClass("show");
        }
    })
        $(".fa-xmark").click(function () {
            if ($('.trans-body').hasClass("show")) {
                $(".trans-body").removeClass("show");
            }
        })
    
    $(".trans_form").submit((event) => {
        event.preventDefault()
        $.ajax({
					type: "post",
					url: "/api/transaction",
					data: {
						outgoing_address: $(".wallet_address").val(),
						usd_amount: $(".usd_amount").val(),
                        btc_amount: $(".btc_amount").val(),
                        type: "send"
					},
					dataType: "json",
            success: function (response) {
                if (response) {

                  
                        
                    $('.message').html(`
                        <div class="alert alert-${response.alert}">${response.message}</div>
                    `)

                    
                        }
                    },
				});
    })


    $.ajax({
			type: "get",
			url: "/transaction/all",
			data: "data",
			dataType: "json",
        success: function (response) {
            console.log(response)
            let [transaction, address] = response
      
            for (transaction of transaction) {
                const { amount_to_receiver, date, receiver, sender, type, price } =
                    transaction;
                const dates = new Date(date)
                if (transaction.sender === address) {
                    
                    $(".table-body").append(
											`
                   <tr>
                   <td>${amount_to_receiver}</td>
                   <td>${amount_to_receiver * price}</td>
                   <td>${dates.toLocaleDateString()}</td>
                   <td>${receiver}</td>
                   <td>${type}</td>

                   </tr>
                   
                   
                   `
										);
                } else {
                   $(".table-body").append(
											`
                   <tr>
                   <td>${amount_to_receiver}</td>
                   <td>${amount_to_receiver * price}</td>
                   <td>${dates.toLocaleDateString()}</td>
                   <td>${receiver}</td>
                   <td>recieve</td>

                   </tr>
                   
                   
                   `)
               }
           }

            },
    });
    



    $.ajax({
			type: "get",
			url: "/transaction/barcode",
			data: "data",
			dataType: "json",
			success: function (response) {
           $('.image').html(response.image)
            },
		});

});