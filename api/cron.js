import axios from 'axios';

const args = (start, end) => `'https://api.partnerize.com/v3/partner/analytics/conversions/count' \
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

const fetchData = async () => {
  const date = new Date();
  const startDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() - 1, 0, 0, 1));
  const endDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() - 1, 23, 59, 59));

  try {
    const response = await axios.post('https://api.partnerize.com/v3/partner/analytics/conversions/count', {
      scope: { partner: "1101l64116" },
      date_time_ranges: [{ start: startDate.toISOString(), end: endDate.toISOString(), field: "date_time" }],
      metrics: ["total_conversion_items", "total_conversions", "total_partner_commission", "average_order_value", "total_order_value"],
      timezone: "CET",
      output_currency: "EUR",
      filter_by: [{ field: "conversion_type_id", operator: "EQUALS", value: ["6"], not: true }]
    }, {
      headers: {
        'Authorization': process.env.AUTH,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Log the response to debug the structure
    console.log('Partnerize API Response:', JSON.stringify(response.data, null, 2));

    // Access the data from the correct path in the response
    const data = response.data.data || response.data;
    const conversions = data.total_conversions || 0;
    const commission = data.total_partner_commission || 0;

    const message = `PARTNERIZE SUMMARY ${date.toDateString()} \n\n ${conversions} Conversions\n\nCommission:\nEUR ${commission}`;

    await axios.post(`https://api.telegram.org/bot${process.env.TG}/sendMessage`, {
      chat_id: process.env.TG_ID,
      text: message
    });

    return { success: true, message: "Data fetched and sent successfully" };
  } catch (error) {
    console.error('Error:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    return { success: false, error: error.message };
  }
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const result = await fetchData();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}