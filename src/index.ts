import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { google } from 'googleapis';

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
  console.log('Received request to /temp-humid');

  let data;
  try {
    // Log the raw request body for debugging
    const rawBody = await c.req.text();
    console.log('Raw request body:', rawBody);

    // Try to parse the JSON
    data = JSON.parse(rawBody);
    console.log('Parsed data:', data);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return c.json({ error: 'Invalid JSON in request body' }, 400);
  }

  // Validate the data
  if (!data || typeof data !== 'object') {
    return c.json({ error: 'Invalid data format' }, 400);
  }

  // Use data from the request, or fall back to default values
  const sensorId = data.sensor_id || 'sensor-1';
  const temperature = data.temperature || 20;
  const humidity = data.humidity || 0.01;

  console.log('Writing data to Google Sheets!');

  // Write to Google Sheets
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'temp-humid!A:D', // Changed from A:E to A:D as we're only sending 4 values
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[new Date().toISOString(), sensorId, temperature, humidity]],
      },
    });
    console.log('Data written to Google Sheets');
  } catch (error) {
    console.error('Error writing to Google Sheets:', error);
    return c.json({ error: 'Failed to write data to Google Sheets' }, 500);
  }

  return c.json({
    message: 'Data received and written to Google Sheets successfully',
    data: { sensorId, temperature, humidity },
  });
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
