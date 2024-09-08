import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { google } from 'googleapis';

interface TemperatureHumiditySensor {
  temperature: number;
  humidity: number;
}

const app = new Hono();

// Google Sheets setup
const auth = new google.auth.GoogleAuth({
  keyFile: 'labs-service-key.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const spreadsheetId = '1elj5O80Stgt2oTbNQj6u9asEpvN1u28-IJImmRiJ9-s';

app.get('/', (c) => {
  return c.text('Labs 2024');
});

app.post('/temp-humid', async (c) => {
  const data: TemperatureHumiditySensor = await c.req.json();

  // Use data from the request, or fall back to default values
  const temperature = data.temperature || 0;
  const humidity = data.humidity || 0;

  // Write to Google Sheets
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'temp-humid!A:D', // table_name!range
      valueInputOption: 'USER_ENTERED', // use user-entered data
      requestBody: {
        values: [[new Date().toISOString(), temperature, humidity]],
      },
    });
    console.log('Data written to Google Sheets');
  } catch (error) {
    console.error('Error writing to Google Sheets:', error);
    return c.json({ error: 'Failed to write data to Google Sheets' }, 500);
  }

  return c.json({
    message: 'Data received and written to Google Sheets successfully',
    data: { temperature, humidity },
  });
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
