const axios = require('axios')
const schedule = require('node-schedule')

var exec = require('child_process').exec;

var args = (start, end) => `'https://api.partnerize.com/v3/partner/analytics/conversions/count' \
-H 'Connection: keep-alive' \
-H 'Accept: application/json, text/plain, */*' \
-H 'Pragma: no-cache' \
-H 'DNT: 1' \
-H 'Authorization: ${process.env.AUTH}' \
-H 'Content-Type: application/json' \
-H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' \
-H 'Sec-GPC: 1' \
-H 'Origin: https://console.partnerize.com' \
-H 'Sec-Fetch-Site: cross-site' \
-H 'Sec-Fetch-Mode: cors' \
-H 'Sec-Fetch-Dest: empty' \
-H 'Referer: https://console.partnerize.com/' \
-H 'Accept-Language: en-US,en;q=0.9' \
--data-raw '{"scope":{"partner":"1101l64116"},"date_time_ranges":[{"start":"${start}","end":"${end}","field":"date_time"}],"metrics":["total_conversion_items","total_conversions","total_partner_commission","average_order_value","total_order_value"],"timezone":"CET","output_currency":"EUR","filter_by":[{"field":"conversion_type_id","operator":"EQUALS","value":["6"],"not":true}]}' \
--compressed`;

const fetchData = () => {
	let date = new Date()
	let startDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() - 1, 0, 0, 1))
	let endDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() - 1, 23, 59, 59))
	exec('curl ' + args(startDate.toISOString(), endDate.toISOString()), function (error, stdout, stderr) {
		console.log('stdout: ' + stdout);
		let response = JSON.parse(stdout);
		console.log(response.data)
		let message = `PARTNERIZE SUMMARY ${date.toDateString()} \n\n ${response.data.total_conversions} Conversions\n\nCommission:\nEUR ${response.data.total_partner_commission}`

		// let obj = response.data.period.current[0].totals
		// let message = `PARTNERIZE SUMMARY ${date.toDateString()} \n\n🖱️ ${obj.clicks} Clicks\n✅ ${obj.conversions_all} Conversions\n\nCommission:\nEUR ${obj.currency.EUR.commissions} \nUSD ${obj.currency.USD.commissions}`
		axios.default.post('https://api.telegram.org/bot' + process.env.TG + '/sendMessage',
			{
				chat_id: process.env.TG_ID,
				text: message
			}).then(response => {
				console.log("Message posted");
			}).catch(error => {
				console.log(error);
			});
		if (error !== null) {
			console.log('exec error: ' + error);
		}
	});
}

fetchData()
schedule.scheduleJob('0 8 * * *', fetchData)