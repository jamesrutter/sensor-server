# Sensor Server 
Simple HTTP Server to run on a raspberry pi and collect environmental sensor data. 
- Hono is being used as a lightweight http server 
- Google Sheets API to store data in a pubic sheet 

## Setup 
```
npm install
npm run dev
```
👉 In order to get this server working, you need to setup Google Sheets API with a service account key. I am not including the one I setup for Labs on this repo. 

## API
**hostname: labs.local**

The API server is running on the local WiFi network setup for Labs 2024. 
You should be able to verify connection get sending a GET request to `labs.local`

### Temperature & Humidity 
#### `POST /temp-humid` 
To submit temperature & humidity data to the server, generate a POST request to the endpoint with a JSON blob (example below):

```
{
  "temperature": 22.6,
  "humidity": 0.41
}
```
