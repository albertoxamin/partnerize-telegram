const axios = require('axios')
const schedule = require('node-schedule')

const fetchData = () => {
	let date = new Date()
	let startDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() - 1, 0, 0, 1))
	let endDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() - 1, 23, 59, 59))
	axios.default.request({
		url: `https://console.partnerize.com/reporting/report_publisher/publisher/1101l64116/overview/primary/multidate?multidate%5B0%5D%5Bstart_date%5D=${startDate.toISOString()}&multidate%5B0%5D%5Bend_date%5D=${endDate.toISOString()}&multidate%5B0%5D%5Binterval%5D=P1D`,
		method: 'GET',
		headers: {
			'Authorization': process.env.AUTH
		}
	}).then(response => {
		let obj = response.data.period.current[0].totals
		let message = `PARTNERIZE SUMMARY ${date.toDateString()} \n\n🖱️ ${obj.clicks} Clicks\n✅ ${obj.conversions_all} Conversions\n\nCommission:\nEUR ${obj.currency.EUR.commissions} \nUSD ${obj.currency.USD.commissions}`
		axios.default.post('https://api.telegram.org/bot' + process.env.TG + '/sendMessage',
			{
				chat_id: process.env.TG_ID,
				text: message
			}).then(response => {
				console.log("Message posted");
			}).catch(error => {
				console.log(error);
			});
	})
}

fetchData()
schedule.scheduleJob('0 8 * * *', fetchData)