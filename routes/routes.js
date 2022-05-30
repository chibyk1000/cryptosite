const express = require("express");
const { UserModel, Transaction } = require("../models/user");
const route = express.Router();
const axios = require("axios");
const jwt = require("jsonwebtoken");
var QRCode = require("qrcode");
const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//     host: 'smtp.gmail.com',
//     port: 587
// })

route.get("/signup", (req, res) => {
	if (req.cookies.token) {
		res.redirect("/");
	}
	res.render("pages/signup");
});

route.post(
	"/auth/signup",
	express.urlencoded({ extended: false }),
	async (req, res) => {
		const { fullname, email, password } = req.body;
		if (!fullname || !email || !password) {
			return res.send("empty inputs");
		}

		const addressDetails = await axios.post(
			"https://api.blockcypher.com/v1/btc/main/addrs"
		);

		console.log(addressDetails);

		const { private, public, address, wif } = addressDetails.data;

		const existing_user = await UserModel.findOne({ email: email });

		if (existing_user) {
			return res.send("user exist");
		}
		const new_user = new UserModel({
			full_name: fullname,
			email: email,
			password: password,
			address: address,
			publicKey: public,
			privateKey: private,
			Wif: wif,
		});

		new_user.save();
	}
);

route.get("/login", (req, res) => {
	if (req.cookies.token) {
		return res.redirect("/");
	}

	return res.render("pages/login.ejs");
});

route.post(
	"/auth/login",
	express.urlencoded({ extended: false }),
	async (req, res) => {
		const { email, password } = req.body;
		if (!email || !password) {
			return res.send("empty inputs");
		}

		const existing_user = await UserModel.findOne({ email: email });
		if (!existing_user) {
			return res.send("user does not exist");
		}

		const token = jwt.sign(
			{
				id: existing_user.email,
			},
			"dkjfshdjksdhjkhskdjhjsdhkjhdfh"
		);

		res.cookie("token", token, {
			httpOnly: true,
		});
		res.redirect("/");
	}
);

route.get("/", async (req, res) => {
	if (req.cookies.token) {
		const loggedInUser = jwt.verify(
			req.cookies.token,
			"dkjfshdjksdhjkhskdjhjsdhkjhdfh"
		).id;
		const user = await UserModel.findOne({ email: loggedInUser });
		const { address } = user;

		
		
		return res.render("pages/index.ejs");
	} else {
		return res.redirect("/login");
	}
});

route.get("/bitcoin/balance", async (req, res) => {
	if (req.cookies.token) {
		const loggedInUser = jwt.verify(
			req.cookies.token,
			"dkjfshdjksdhjkhskdjhjsdhkjhdfh"
		).id;
		const user = await UserModel.findOne({ email: loggedInUser });
		const { address } = user;
		const balance_details = await axios.get(
			`https://api.blockcypher.com/v1/btc/main/addrs/${address}/balance`
		);
		
		
		const coinPrice = await axios.get(
			"https://coinlib.io/api/v1/coin/?key=c582a242f605a4de&pref=USD&symbol=BTC"
		);
		const all_user = await UserModel.find()
		res.json([balance_details.data, coinPrice.data, user,  all_user]);
    } 
	res.redirect("/login");
});

route.post(
	"/api/transaction",
	express.urlencoded({ extended: false }),
	async (req, res) => {
		const { btc_amount, usd_amount, outgoing_address, type } = req.body;
		// console.log(req.body);
		if (req.cookies.token) {
			const email = jwt.verify(
				req.cookies.token,
				"dkjfshdjksdhjkhskdjhjsdhkjhdfh"
			).id;
			const user = await UserModel.findOne({ email: email });
			const { address: myAddress, balance } = user;

			const remaining = balance - btc_amount * 100000000;
			console.log(remaining);
			// console.log(outgoing_address);
			const existing_address = await UserModel.findOne({
				address: outgoing_address,
			});

			// console.log(existing_address);

			const coinPrice = await axios.get(
				"https://coinlib.io/api/v1/coin/?key=c582a242f605a4de&pref=USD&symbol=BTC"
			);
			if (!existing_address) {
				res.json({
					alert: "danger",
					message: "error! invalid or external Wallet address",
				});
			} else {
				const { balance: recievers_balance } = existing_address;
				const transaction = new Transaction({
					sender: myAddress,
					receiver: outgoing_address,
					amount_to_receiver: btc_amount,
					amount_remaining: remaining,
					date: new Date().toISOString(),
					type: type,
					price: coinPrice.data.price,
				});

				transaction.save();

				
				const user_balance = await UserModel.updateOne(
					{ email: email, address: myAddress },
					{ $set: { balance: remaining } }
				);

				const total_recievers_balance =
					btc_amount * 100000000 + recievers_balance;
				const recievers_updated_balance = await UserModel.updateOne(
					{ address: outgoing_address },
					{ $set: { balance: total_recievers_balance } }
				);
				res.json({
					alert: "success",
					message: `you have successfully sent ${btc_amount} BTC to ${outgoing_address}`,
				});
			}
			// console.log(req.body);
		}
	}
);

route.get("/transaction/all", async (req, res) => {
	if (req.cookies.token) {
		const email = jwt.verify(
			req.cookies.token,
			"dkjfshdjksdhjkhskdjhjsdhkjhdfh"
		).id;
		const user = await UserModel.findOne({ email: email });
		const { address: myAddress, balance } = user;

		const all_transaction = await Transaction.find();
		res.json([all_transaction, myAddress]);
	}
});

route.get("/transaction/barcode", async (req, res) => {
	if (req.cookies.token) {
		const email = jwt.verify(
			req.cookies.token,
			"dkjfshdjksdhjkhskdjhjsdhkjhdfh"
		).id;
		const user = await UserModel.findOne({ email: email });
		const { address: myAddress, balance } = user;
		QRCode.toString(myAddress, { type: "svg" }, function (err, url) {
			res.json({ image: url });
		});
	}
});

route.get("/admin", async(req, res) => {

    if (!req.cookies.adminToken) {
        res.send('you are not authenticated to access this page')
    }

    	const email = jwt.verify(
				req.cookies.adminToken,
				"ieuiruewuiuweoiuoieur"
			).id;
    
    const existing_user = await UserModel.findOne({ email:email });
        if (!existing_user) {
             res.send("please login with the right details");
    }
    const all_user = await UserModel.find()


    res.render('pages/admin', {admin:existing_user, all: all_user })
});
route.get("/admin/login", (req, res) => {
    if (req.cookies.adminToken) {
    res.redirect("/admin")
}

    res.render('pages/adminLogin.ejs')
});


route.post(
	"/auth/admin/login",
	express.urlencoded({ extended: false }),
	async (req, res) => {
		const { email, password } = req.body;
		if (!email || !password) {
			return res.send("empty inputs");
		}

		const existing_user = await UserModel.findOne({ email: email });
		if (!existing_user) {
			return res.send("user does not exist");
		}
        const { full_name, email: adminMail } = existing_user;
        if (full_name === "Admin") {
            
            const token = jwt.sign(
                {
                    id: adminMail,
                },
                "ieuiruewuiuweoiuoieur"
            );
    
            res.cookie("adminToken", token, {
                httpOnly: true,
            });
            res.redirect("/admin");
        }
    }
    
    );
    route.get("/admin/bitcoin/balance", async (req, res)=>{
        if (req.cookies.adminToken) {
					const loggedInUser = jwt.verify(
						req.cookies.adminToken,
						"ieuiruewuiuweoiuoieur"
					).id;
					const user = await UserModel.findOne({ email: loggedInUser });
					const { address } = user;
					const balance_details = await axios.get(
						`https://api.blockcypher.com/v1/btc/main/addrs/${address}/balance`
					);

					const coinPrice = await axios.get(
						"https://coinlib.io/api/v1/coin/?key=c582a242f605a4de&pref=USD&symbol=BTC"
					);
const all_user = await UserModel.find();
					res.json([balance_details.data, coinPrice.data, user, all_user]);
				}
    })

route.get('/users', async(req, res) => {
      
    if (!req.cookies.adminToken) {
        res.send('you are not authenticated to access this page')
    }

    	const email = jwt.verify(
				req.cookies.adminToken,
				"ieuiruewuiuweoiuoieur"
			).id;
    
    const existing_user = await UserModel.findOne({ email:email });
        if (!existing_user) {
             res.send("please login with the right details");
    }
    const all_user = await UserModel.find()


    res.render('pages/users', {admin:existing_user})
    })


route.post('/send', express.urlencoded({ extended: false }), async (req, res) => {
	console.log(req.body);
		
		var data =
			`{"inputs": [{"addresses": [16rP72U1MmQqKHkSxkh6pds3JXnHGmT4du] }],  "outputs": [{  "addresses": [${req.body.input_addr}],"value": 1600}}`;

		var config = {
			method: "post",
			url: "https://api.blockcypher.com/v1/btc/main/txs/new?token=7a36066ef65a4ef98e9f4b1da7bf6d6a",
			headers: {
		
			},
			data: data,
		};

		axios(config)
			.then(function (response) {
				console.log(JSON.stringify(response.data));
			})
			.catch(function (error) {
				console.log(error);
			});
	})

module.exports = route;
