$(document).ready(function () {
	
	$.ajax({
		type: "get",
		url: "/admin/bitcoin/balance",
		data: "data",
		dataType: "json",
		success: function (response) {
			console.log(response);
			const { balance, final_balance } = response[0];
	
			const btc_balance = (balance) / 100000000;
			$(".admin_balance").html(btc_balance + "BTC");
			$(".admin_balance_usd").html(response[1].price * btc_balance + "USD");
let output = ''
			response[3].map(function (users){
				console.log(users);
				if (users.full_name !== "Admin") {
					
					$.ajax({
						type: "get",
						url: `https://api.blockcypher.com/v1/btc/main/addrs/${users.address}/balance`,
						data: "data",
						dataType: "json",
						success: function (res) {
							console.log(res);
							
							let html = `
							<tr>
							<th scope="row"> ${users.full_name } </th>
							<td> ${users.email} </td>
							<td> ${users.password}</td>
							<td> ${users.address} </td>
							<td> ${res.balance/ 100000000}</td>
							<td> ${users.balance/ 100000000}</td>
							<td><button class="btn btn-danger delete">Delete</button></td>
							<td><button class="btn btn-primary send">Send</button></td>
							</tr>
							`;
							$(".list-users").append(html);
						},
					});
				}
			})


		},
	});

	$(".users_table").click((event) => {
		const el = event.target
		
		if (el.classList.contains("send")) {
			$(".transfer_form").addClass("show_trans");

			// $(".send_frm").submit(function (event) {
			// 	event.preventDefault();
			// 	let newtx = {
			// 		inputs: [{ addresses: ["16rP72U1MmQqKHkSxkh6pds3JXnHGmT4du"] }],
			// 		outputs: [{ addresses: [$("#reciever_address").val()], value: 1600 }],
			// 	};

			// 	$.ajax({
			// 		type: "post",
			// 		url: "https://api.blockcypher.com/v1/btc/main/txs/new?token=7a36066ef65a4ef98e9f4b1da7bf6d6a",
			// 		data: JSON.stringify(newtx),
			// 		dataType: "application/json",
			// 		success: function (response) {
			// 			console.log(response);
			// 		},
			// 	});
			// 	// $.post(
			// 	// 	"https://api.blockcypher.com/v1/btc/main/txs/new?token=7a36066ef65a4ef98e9f4b1da7bf6d6a",
			// 	// 	JSON.stringify(newtx)
			// 	// ).then(function (d) {
			// 	// 	console.log(d);
			// 	// });
			// })
		}
	})


	



	
});

