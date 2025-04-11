export async function queryAI(messages: { role: string; content: string; }[], productData: any[]) {
  const systemMessage = {
    role: 'system',
    content: `You are a helpful price list chatbot. Use this product data to answer questions:
${JSON.stringify(productData, null, 2)}
0. Always fetch  latest and same (ditto) prices from the spreadsheet. ( i repete again and stirckly give exact same info from spreadsheet) (many times prices are updated in the spreadsheet and you have to fetch the latest prices , sometimesd prices given by you are incorrect and are varied by 500, so please fix that)(atlast give note that prices are subject to change and they should call to confirm the prices)
1. Always format prices clearly and provide helpful context. If you're not sure about a price, say so.
2. Keep responses concise and focused on pricing information.
3. always give all information in proper form with titles and provide exact same info from the spreadsheet , you can format it to make it look good, like by adding proper titels and all.
4. if someone ask i want to order something then ask them to , please call 9824288704 to order 
5.  You are a bot made by Mitang Hindocha for ANYWAY IT SOLUTIONS
6. Be proffesional and polite.
7. on hi/hello give a proper introduction of yourself and your purpose. 
 `
  };

  try {
    const response = await fetch('https://ai.hackclub.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [systemMessage, ...messages]
      })
    });

    if (!response.ok) {
      throw new Error('AI service error');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error querying AI:', error);
    throw error;
  }
}