# AQI Prediction System — Software Architecture & Technical Documentation

---

## 1. System Overview

This system is a real-time Air Quality Index (AQI) prediction and monitoring platform built around edge-embedded machine learning. A trained XGBoost model runs directly on a microcontroller — no internet connection is required for the prediction itself. Sensor readings are converted to gas concentrations on the microcontroller, the model predicts AQI, and results are pushed to cloud object storage every 30 seconds. A web interface reads from the cloud and displays live and historical data.

### Three-Layer Architecture

```
[EDGE LAYER]                [GATEWAY LAYER]             [CLOUD LAYER]
STM32F407                   ESP32                        CloudPe S3
─────────────────           ─────────────────            ─────────────────
MQ-7   → ADC              UART receive                  aqi-data/
MQ-135 → ADC       UART   Sign with                       latest.json
BME680 → I2C  ──────────► AWS Sig V4    ──── HTTPS ──►    history/
RTC                         HTTP PUT                        *.json
│
score() → AQI
(XGBoost in C)
```

**No cloud dependency for prediction.** The STM32 computes AQI locally using the embedded model. The ESP32 only handles network transport. Even if internet is unavailable, the prediction runs and can be read over UART.

---

## 2. Machine Learning Pipeline

### 2.1 Problem Statement

Predict the Air Quality Index (AQI, range 0–500) from real-time low-cost sensor readings. AQI in India follows the CPCB (Central Pollution Control Board) standard, which is computed from 8 pollutants: PM2.5, PM10, NO2, SO2, O3, CO, NH3, and Pb. The central challenge is that low-cost sensors (MQ-series, BME680) cannot measure all 8 pollutants. The model must learn to predict AQI from only the subset of pollutants that available sensors can measure.

### 2.2 Dataset

**Primary dataset**: Rohanrao Kaggle India AQI Dataset
- 2.5 million+ rows
- Sourced from CPCB continuous ambient air quality monitoring stations across Indian cities (2015–2020)
- Contains station-measured concentrations of CO, NH3, Benzene, PM2.5, NO, NO2, NOx, SO2, O3, Toluene, Xylene, PM10, along with temperature, humidity, and the official computed AQI
- Units: μg/m³ for pollutants

**Secondary dataset (validation only)**: UCI Air Quality Dataset
- 9,358 rows of data from an electrochemical sensor array in an Italian city
- Used only to validate that sensor-derived concentrations from MQ sensors match lab-grade measurements in scale and distribution
- Not included in training

### 2.3 Feature Engineering and Column Selection

The core engineering decision: which columns from the dataset to keep as model features, and how to handle the mismatch between dataset columns and sensor capabilities.

**Decision framework applied to each column:**

| Scenario | Example Columns | Action |
|---|---|---|
| Dataset has it AND sensor measures it | CO, NH3, Benzene, PM2.5, Temperature, Humidity | Keep directly as feature |
| Sensor measures it BUT dataset lacks it | Pressure | Fill with city elevation formula (nearly constant per city) |
| Dataset has it BUT sensor CANNOT measure it | NO, NO2, NOx, SO2, O3, Toluene, Xylene, PM10, AQI_Bucket | DROP from model features |
| AQI (target) is NaN | — | Drop entire row |
| Feature value is NaN | CO, NH3, Benzene | Median imputation per city |
| PM2.5 NaN | PM2.5 | Time-based interpolation |

**Why dropped columns cannot be used**: NO2, SO2, O3 and others were used by CPCB to compute AQI in the original dataset, but no consumer-grade low-cost sensor measures these at deployment time. If the model depends on them, it cannot run in real-time without laboratory instruments. The model must learn AQI from only what the sensors can provide.

### 2.4 Final 14 Features Fed to the Model

| Index | Feature | Sensor / Source | Unit |
|---|---|---|---|
| 0 | CO | MQ-7 | μg/m³ |
| 1 | NH3 | MQ-135 | μg/m³ |
| 2 | Benzene | MQ-135 | μg/m³ |
| 3 | Smoke (PM2.5 proxy) | MQ-135 | μg/m³ |
| 4 | Temperature | BME680 | °C |
| 5 | Humidity | BME680 | % RH |
| 6 | Pressure | BME680 | hPa |
| 7 | Hour | STM32 RTC | 0–23 |
| 8 | Month | STM32 RTC | 1–12 |
| 9 | DayOfWeek | STM32 RTC | 0=Mon … 6=Sun |
| 10 | Is_Weekend | Derived from DayOfWeek | 0 or 1 |
| 11 | Season | Derived from Month | 0=Winter, 1=Spring, 2=Monsoon, 3=Autumn |
| 12 | Is_RushHour | Derived from Hour | 0 or 1 (7–10, 17–20) |
| 13 | City_Mean_AQI | Hardcoded per deployment city | float |

**Why time features matter**: AQI has strong temporal patterns. Traffic emissions spike during morning and evening rush hours. PM2.5 is higher on winter mornings due to temperature inversion. Monsoon season suppresses dust but increases humidity-linked pollutant absorption. The model captures these patterns through time features rather than requiring a clock-independent snapshot.

**Why City_Mean_AQI matters**: A reading of CO = 500 μg/m³ means something different in Delhi (where AQI averages 235) vs Bengaluru (where AQI averages 91). This constant encodes the baseline pollution level of the deployment city, giving the model location-specific context. Reference values hardcoded in the firmware:

```
Ahmedabad = 322.6    Delhi     = 235.9    Lucknow   = 216.5
Gurugram  = 209.6    Jaipur    = 134.5    Kolkata   = 132.6
Mumbai    = 103.7    Hyderabad = 100.1    Bengaluru = 91.4
```

### 2.5 Model: XGBoost

**Why XGBoost over alternatives:**

| Model | Reason Not Chosen |
|---|---|
| Deep Learning (LSTM, MLP) | Too large for STM32 flash/RAM; requires matrix libraries not available on bare metal |
| Random Forest | Slightly lower accuracy on tabular data; generates larger decision trees per estimator |
| Support Vector Machine | Does not scale to 2.5M training rows; slow inference with kernel tricks |
| Linear Regression | AQI is nonlinear — rush hour spikes, seasonal variation, compound pollutant interactions |
| **XGBoost** | **Best accuracy on tabular data, compact model size, fast inference, C-exportable** |

Training performed in Python using the `xgboost` library with scikit-learn API. Hyperparameters tuned with embedded deployment constraint in mind:
- `max_depth`: 4–6 (shallow trees → smaller generated C code)
- `n_estimators`: 100–200 (enough trees for accuracy, not so many that C code exceeds STM32 flash)
- Objective: `reg:squarederror` (regression, predict numeric AQI)

### 2.6 Model Compression — m2cgen

A trained XGBoost Python model object cannot run on a microcontroller. The tool **m2cgen (Model to Code Generator)** converts the trained model into a pure C function with zero external dependencies:

```python
import m2cgen as m2c
code = m2c.export_to_c(model)
# Outputs: double score(double* input) { ... }
```

The output file `aqi_model_stm32.c` contains a single function:
```c
double score(double* input);
```

This function:
- Takes an array of 14 doubles (the features)
- Returns a double (the predicted AQI)
- Uses only if/else branching and floating-point arithmetic
- Has no external library dependencies
- Requires no heap allocation, no RTOS, no OS
- Compiles with any C compiler including `arm-none-eabi-gcc` for STM32

The file is added directly to the STM32CubeIDE project and called from `aqi_sensors.c` as a regular C function call.

### 2.7 CPCB AQI Categories

| AQI Range | Category | Colour |
|---|---|---|
| 0–50 | Good | Green |
| 51–100 | Satisfactory | Yellow |
| 101–200 | Moderate | Orange |
| 201–300 | Poor | Red |
| 301–400 | Very Poor | Purple |
| 401–500 | Severe | Maroon |

---

## 3. Embedded Inference — STM32F407

### 3.1 Hardware Peripherals Used

| Peripheral | Connected To | Purpose |
|---|---|---|
| ADC1 Channel 0 | MQ-135 output (via voltage divider) | Gas sensor analog reading |
| ADC1 Channel 1 | MQ-7 output (via voltage divider) | CO sensor analog reading |
| I2C1 | BME680 | Temperature, humidity, pressure |
| USART1 (TX) | ESP32 RX | Send CSV results |
| RTC | Internal | Time features for model |

### 3.2 Sensor Voltage-to-Concentration Pipeline

The MQ-7 and MQ-135 sensors output an analog voltage. The model requires gas concentrations in μg/m³. The conversion involves six stages:

**Stage 1 — ADC count to pin voltage**
```
V_pin = (ADC_raw / 4095) × 3.3V
```
The STM32 has a 12-bit ADC (0–4095 range) with 3.3V reference voltage.

**Stage 2 — Undo voltage divider to get actual sensor voltage**
```
V_sensor = V_pin × 1.5
```
MQ sensors output 0–5V but the STM32 ADC maximum is 3.3V. A resistor voltage divider (R1 = 10kΩ top, R2 = 20kΩ bottom) scales 5V down to 3.3V. The factor 1.5 = (R1 + R2) / R2 recovers the original sensor voltage.

**Stage 3 — Sensor voltage to sensor resistance Rs**
```
Rs = RL × ((Vcc / V_sensor) - 1)
```
Where RL = 10kΩ (load resistor on the sensor board) and Vcc = 5V. Rs is the resistance of the metal oxide sensing element inside the sensor. This resistance decreases when target gas molecules are present.

**Stage 4 — Ro calibration at startup (clean air baseline)**

On power-on, the system:
1. Waits 180 seconds for the heating element to stabilise
2. Takes 50 ADC readings 100ms apart in clean air
3. Averages them to compute the mean Rs
4. Divides by the datasheet Rs/Ro ratio in clean air:
   - MQ-135 clean air ratio: 3.6
   - MQ-7 clean air ratio: 27.5

```
Ro_MQ135 = mean_Rs_MQ135 / 3.6
Ro_MQ7   = mean_Rs_MQ7   / 27.5
```

**Stage 5 — Rs/Ro ratio to ppm (power law from datasheets)**
```
ratio = Rs / Ro

CO_ppm      = 99.042  × ratio_MQ7^(-1.504)     [MQ-7]
NH3_ppm     = 102.2   × ratio_MQ135^(-2.473)   [MQ-135]
Benzene_ppm = 33.9    × ratio_MQ135^(-3.375)   [MQ-135]
Smoke_ppm   = 30000.0 × ratio_MQ135^(-8.093)   [MQ-135]
```
Constants A and B in `ppm = A × ratio^B` come from the sensitivity curves published in the MQ-7 and MQ-135 datasheets. Each gas produces a characteristic curve on a log-log plot of Rs/Ro vs concentration.

**Stage 6 — ppm to μg/m³**
```
CO_ugm3      = CO_ppm      × 1145    (molecular weight 28 g/mol)
NH3_ugm3     = NH3_ppm     × 695     (molecular weight 17 g/mol)
Benzene_ugm3 = Benzene_ppm × 3190    (molecular weight 78 g/mol)
Smoke_ugm3   = Smoke_ppm             (PM2.5 proxy, unitless pass-through)
```
Conversion factor = (MW × 1000) / 22.4 at STP. The training dataset uses μg/m³, so the model was trained on and expects this unit.

### 3.3 BME680 (Direct Values — No Conversion Needed)

The BME680 communicates over I2C using the Bosch BME68x driver library. It directly outputs:
- Temperature in °C (floating point)
- Relative Humidity in % (floating point)
- Pressure in hPa (raw sensor value in Pa, divided by 100)

No voltage conversion is required. Values are read and passed directly into the model input array.

### 3.4 Model Invocation

The 14-element input array is assembled and passed to `score()`:

```c
double input[14] = {
    gas.CO,          gas.NH3,          gas.Benzene,  gas.Smoke,
    env.temperature, env.humidity,     env.pressure,
    tf.hour,         tf.month,         tf.day_of_week,
    tf.is_weekend,   tf.season,        tf.is_rush_hour,
    CITY_MEAN_AQI
};
double aqi = score(input);
if (aqi <   0.0) aqi =   0.0;
if (aqi > 500.0) aqi = 500.0;
```

Output is clamped to [0, 500] to handle edge cases where sensor noise produces out-of-range estimates.

### 3.5 UART Transmission to ESP32

Every 30 seconds, one line is sent over USART1 at 115200 baud:

```
AQI,CO,NH3,Benzene,Smoke,Temperature,Humidity,Pressure\r\n
```

Example:
```
142.3,2801.00,347.50,318.00,88.0,28.5,65.0,1013.0\r\n
```

Eight comma-separated floats, \r\n terminated. The ESP32 parses this, builds JSON, and uploads.

---

## 4. IoT Gateway — ESP32

### 4.1 Role

The ESP32 is a pure network transport layer. It performs no ML computation. Its responsibilities:
- Connect to 2.4GHz Wi-Fi (ESP32 does not support 5GHz bands)
- Sync time via NTP on boot (mandatory for AWS Signature V4)
- Receive CSV from STM32 over UART on GPIO16 (RX) at 115200 baud
- Parse CSV, build JSON
- Compute AWS Signature V4 and HTTP PUT to CloudPe S3
- On boot, send a startup test upload to independently verify S3 connectivity

### 4.2 AWS Signature Version 4 — Implemented from Scratch on Embedded Hardware

CloudPe S3 requires every write request to carry an AWS Signature V4 — a cryptographic proof of identity that also protects the request body from tampering. This is computed entirely on the ESP32 using the mbedTLS cryptographic library (shipped with the ESP32 Arduino framework).

**Four-step HMAC-SHA256 key derivation:**
```
"AWS4" + SecretKey
    → HMAC-SHA256(above, DateString)          = kDate
    → HMAC-SHA256(kDate, Region)              = kRegion
    → HMAC-SHA256(kRegion, "s3")              = kService
    → HMAC-SHA256(kService, "aws4_request")   = kSigning
```

**Canonical Request (input to signing):**
```
PUT
/aqi-data/latest.json
                                         ← empty query string
content-type:application/json
host:s3.in-west3.purestore.io
x-amz-content-sha256:<sha256_of_body>
x-amz-date:20260503T091505Z

content-type;host;x-amz-content-sha256;x-amz-date
<sha256_of_body>
```

**String to Sign:**
```
AWS4-HMAC-SHA256
20260503T091505Z
20260503/in-west3/s3/aws4_request
<sha256_of_canonical_request>
```

**Final Authorization header sent with every request:**
```
AWS4-HMAC-SHA256
  Credential=<KeyID>/20260503/in-west3/s3/aws4_request,
  SignedHeaders=content-type;host;x-amz-content-sha256;x-amz-date,
  Signature=<64-char hex>
```

The body SHA256 is computed before signing and included in the signature, ensuring the server can detect any tampering with the payload in transit.

### 4.3 NTP Time Synchronisation

AWS Signature V4 includes a timestamp. The server rejects requests where the timestamp differs from server time by more than 15 minutes. The ESP32 contacts `pool.ntp.org` and `time.nist.gov` at boot and waits in a polling loop until a valid Unix timestamp (> 1,000,000,000) is received before attempting any upload.

### 4.4 Dual Write Per Reading

Each sensor reading triggers two S3 writes:
1. `latest.json` — overwritten every time (always holds the most recent reading for the live dashboard)
2. `history/2026-05-03T09-11-26Z.json` — timestamped archive, never overwritten (permanent record)

### 4.5 Startup Test Upload

On every boot, before waiting for STM32 UART data, the ESP32 uploads a hardcoded dummy reading:
```json
{"aqi": 99.9, "co": 2801.0, "note": "ESP32 startup test", ...}
```
This verifies S3 connectivity independently of whether the STM32 is running. If the startup test fails, the credentials, endpoint, or network configuration is wrong.

---

## 5. Cloud Storage — CloudPe Object Storage

### 5.1 Platform

**Provider**: CloudPe (cloudpe.io) — Indian cloud infrastructure provider  
**Storage backend**: PureStorage FlashBlade (enterprise-grade object storage hardware)  
**API**: S3-compatible (AWS S3 API subset)  
**Endpoint**: `https://s3.in-west3.purestore.io`  
**Region**: `in-west3`  
**Bucket name**: `aqi-data`

The system uses **path-style URLs** (bucket name in the URL path, not the hostname):
```
https://s3.in-west3.purestore.io/aqi-data/latest.json
```
as opposed to virtual-hosted style (`https://aqi-data.s3.in-west3.purestore.io/latest.json`) because the virtual-hosted hostname does not resolve in DNS for CloudPe.

### 5.2 Bucket Structure

```
aqi-data/
├── latest.json                          ← current reading (overwritten every 30s)
└── history/
    ├── 2026-05-03T09-11-26Z.json        ← permanent timestamped archive
    ├── 2026-05-03T09-11-56Z.json
    ├── 2026-05-03T09-12-26Z.json
    └── ...
```

### 5.3 JSON Data Schema

```json
{
  "timestamp":   "2026-05-03T09:15:05Z",
  "aqi":         142.3,
  "co":          2801.0,
  "nh3":         347.5,
  "benzene":     318.0,
  "smoke":       88.0,
  "temperature": 28.5,
  "humidity":    65.0,
  "pressure":    1013.0
}
```

All numeric fields are rounded to 1–2 decimal places. Fields with a -1 value (sensor not connected or data unavailable) are omitted from the JSON rather than included as -1.

### 5.4 Access Model

| Operation | Authentication Required | Who Does It |
|---|---|---|
| Read `latest.json` | No (public bucket) | Website frontend, anyone |
| Read `history/*.json` | No (public bucket) | Website frontend |
| Write (PUT) | Yes — Service User credentials + AWS Sig V4 | ESP32, Python scripts |
| List objects | Yes — any valid credentials | Python monitoring script |

Public read access is intentionally enabled so the website can fetch data directly without a backend server. Write access always requires authentication.

### 5.5 Credentials

Two accounts exist on CloudPe:

| Account | Type | Purpose |
|---|---|---|
| Service User | Root / owner account (cannot be deleted) | Write access — used by ESP32 and Python |
| aqi-data-access | Sub-account | Created initially; read-only in practice |

All write operations use the Service User key pair.

### 5.6 Key Technical Challenge Resolved — boto3 CRC32 Chunked Encoding

During development, all `PutObject` calls from Python's `boto3` library returned `AccessDenied` despite valid credentials and correct bucket permissions. The root cause was identified through HTTP-level debug logging.

**What boto3 1.27+ does by default for PUT requests:**
```
Transfer-Encoding: chunked
Content-Encoding: aws-chunked
X-Amz-Trailer: x-amz-checksum-crc32
X-Amz-Content-SHA256: STREAMING-UNSIGNED-PAYLOAD-TRAILER
```
boto3 automatically wraps the request body in **aws-chunked** format and appends a CRC32 checksum trailer after the body. This is a newer AWS feature for data integrity checking on large uploads.

**Why CloudPe rejected it:**
PureStorage FlashBlade's S3-compatible API does not implement the aws-chunked trailer extension. When it received `X-Amz-Content-SHA256: STREAMING-UNSIGNED-PAYLOAD-TRAILER`, it could not process the request and returned `AccessDenied` — a misleading error code instead of the correct `501 Not Implemented`.

**Proof of diagnosis:** A presigned URL PUT (which bypasses the aws-chunked mechanism and sends a standard request) to the same bucket with the same credentials returned `HTTP 200` successfully.

**Fix:**
```python
Config(
    signature_version            = "s3v4",
    request_checksum_calculation = "when_required",   # disables CRC32 trailer
    s3 = {"addressing_style": "path"}
)
```

The ESP32 was never affected by this issue because it builds raw HTTP PUT requests manually — no chunked encoding, standard `Content-Length` header, body SHA256 computed upfront. This is the correct format that PureStorage accepts.

This is a known compatibility gap affecting all S3-compatible storage that has not implemented the aws-chunked trailer extension (also affects older MinIO versions, some Ceph configurations, and other third-party S3-compatible implementations).

---

## 6. Python Monitoring Tool

`monitor_bucket.py` — a terminal-based live monitoring script that polls the bucket every 30 seconds:

- Reads `latest.json` and displays current AQI with CPCB category and all 8 sensor values
- Lists the 5 most recent `history/` files with timestamps and AQI values
- Shows total reading count stored in the bucket
- Uses the same `boto3` client with `request_checksum_calculation = "when_required"` fix

Used during development and testing to verify that ESP32 uploads are landing correctly without opening the CloudPe web console.

---

## 7. Planned Website

The website is a static frontend — HTML, CSS, and JavaScript only. No backend server required.

**Data fetching:**
```javascript
fetch("https://s3.in-west3.purestore.io/aqi-data/latest.json")
  .then(r => r.json())
  .then(data => displayAQI(data));
```
Since the bucket has public read access, the browser fetches JSON directly from CloudPe. No server-side proxy or authentication is needed.

**Planned features:**
- Live AQI gauge with CPCB colour-coded background (green/yellow/orange/red/purple/maroon)
- Numeric readout of all 8 pollutants and environmental parameters
- Historical trend line chart (pulls all `history/` files and plots over time)
- AQI category label and health advisory text
- Auto-refresh every 30 seconds
- Responsive layout for mobile

**Hosting:**
Static sites can be hosted free on GitHub Pages, Netlify, or Vercel. Since there is no backend, no server costs are incurred.

---

## 8. End-to-End Data Flow Summary

```
Sensors output voltage
        ↓
STM32 ADC reads raw counts every 30s
        ↓
Voltage divider undone → actual sensor voltage
        ↓
Rs computed from voltage
        ↓
Rs / Ro → gas ratio (Ro calibrated at startup in clean air)
        ↓
Power law → CO, NH3, Benzene, Smoke in ppm
        ↓
ppm → μg/m³ (molecular weight conversion)
        ↓
BME680 → Temperature (°C), Humidity (%), Pressure (hPa)  ─────┐
RTC → Hour, Month, DayOfWeek, Is_Weekend, Season, Is_RushHour ─┤
City_Mean_AQI (hardcoded constant) ───────────────────────────┘
        ↓
14-element array → score() → AQI (0–500)
        ↓
UART CSV line to ESP32 (115200 baud)
        ↓
ESP32 parses 8 fields → builds JSON
        ↓
NTP timestamp attached to JSON
        ↓
AWS Signature V4 computed (HMAC-SHA256 chain)
        ↓
HTTPS PUT to s3.in-west3.purestore.io/aqi-data/latest.json
HTTPS PUT to s3.in-west3.purestore.io/aqi-data/history/<ts>.json
        ↓
CloudPe stores object → public read available
        ↓
Website fetches latest.json → displays AQI dashboard
```

---

## 9. Future Prospects

### 9.1 Multi-Node, Multi-City Deployment
The current system is a single node. The cloud architecture scales directly to a network of nodes with no changes to the storage design:
- Multiple ESP32+STM32 units in different locations
- Each node writes to a different prefix: `city1/latest.json`, `city2/latest.json`
- The website aggregates all nodes onto a map
- The only per-unit configuration change in firmware is `CITY_MEAN_AQI`

### 9.2 AQI Forecasting (Time-Series Prediction)
The current system predicts AQI from instantaneous sensor readings. As the `history/` folder accumulates weeks of readings, a separate time-series model (LSTM, Temporal Fusion Transformer, or Facebook Prophet) can be trained to forecast AQI 1–6 hours ahead. This would run server-side (too heavy for STM32) as a scheduled function that reads the history bucket and writes a `forecast.json` file.

### 9.3 Threshold Alerting
Automatic alerts when AQI crosses category boundaries:
- Server-side function triggered when `latest.json` is updated
- Email/SMS via serverless functions (AWS Lambda, Cloudflare Workers)
- Push notifications to a mobile companion app
- Webhook integration with Telegram or WhatsApp for instant alerts

### 9.4 Extended Sensor Suite
The current sensor array measures 4 pollutants. A production-grade deployment could add:

| Sensor | Measures | Relevance |
|---|---|---|
| Plantower PMS5003 | PM2.5, PM10 (optical, accurate) | Replaces MQ-135 PM proxy with calibrated values |
| MQ-131 | Ozone (O3) | Photochemical smog, industrial areas |
| MQ-136 | SO2 | Diesel emissions, industrial zones |
| Electrochemical NO2 sensor | NO2 | Traffic pollution, highly correlated with AQI |
| MQ-4 | Methane, LPG | Landfills, agricultural areas |

With NO2, SO2, and accurate PM2.5 added, the model could be retrained to match the full CPCB 8-pollutant AQI computation formula more precisely, reducing reliance on proxy measurements.

### 9.5 On-Device Model Retraining Pipeline
As the deployed device accumulates real-world readings, those readings can be used to fine-tune the model for local conditions:
1. Fetch all `history/*.json` files from the S3 bucket
2. Combine with original Kaggle training dataset
3. Retrain XGBoost with recent readings weighted higher (sample weighting)
4. Re-export with m2cgen
5. Flash updated `aqi_model_stm32.c` to the STM32

This closes the self-improvement loop: the device's predictions improve as it operates longer in its deployment location.

### 9.6 Battery-Powered Portable Unit
Current design requires continuous mains power. Adaptation for battery operation:
- STM32 and ESP32 support deep sleep modes (< 1mA vs ~200mA active)
- Deep sleep between readings (30-second interval) extends battery life significantly
- Main constraint: MQ sensors require continuous heater power (~150mW each) — addressing this requires either replacing MQ sensors with electrochemical sensors (lower power) or accepting reduced accuracy with shorter warmup periods
- Suitable for short-term event monitoring (construction sites, traffic surveys)

### 9.7 LoRa / LoRaWAN for Rural and Agricultural Deployment
In areas without Wi-Fi infrastructure, replace ESP32 with a LoRa radio:
- LoRa range: 2–15 km line of sight, 500m–2km urban
- One LoRa gateway covers a wide rural area
- Multiple sensor nodes transmit to one gateway, which handles internet upload
- Relevant for monitoring agricultural field burning smoke, rural industrial zones, or remote monitoring stations
- LoRaWAN (The Things Network) provides ready-made cloud infrastructure for LoRa gateways

### 9.8 Integration with Open Data Platforms
Data from deployed nodes can be contributed to:
- **OpenAQ** (openaq.org) — open-source global air quality database used by researchers worldwide
- **CPCB Open Data** — national monitoring network
- **AirVisual / IQAir** community sensor program

Contributing to these platforms adds academic credibility and makes the dataset available for wider research use.

### 9.9 Dashboard Enhancements
Future website features beyond the initial version:
- Health risk calculator based on current AQI and user-specified activity level
- Comparison with nearest CPCB official monitoring station data (via OpenAQ API)
- Downloadable CSV export of historical data
- Animated 24-hour AQI heatmap
- Air quality alerts via browser push notifications (Web Push API)

---

## 10. Technology Stack Summary

| Layer | Technology | Purpose |
|---|---|---|
| ML Training | Python, XGBoost, pandas, scikit-learn | Model development |
| Model Export | m2cgen | Convert XGBoost → C function |
| Microcontroller | STM32F407, STM32CubeIDE, C | Sensor reading + inference |
| Cryptography (ESP32) | mbedTLS (built into ESP32 Arduino) | AWS Sig V4, SHA256, HMAC |
| IoT Gateway | ESP32, Arduino framework, C++ | Wi-Fi, S3 upload |
| Cloud Storage | CloudPe Object Storage (PureStorage FlashBlade S3) | Data persistence |
| Monitoring Script | Python, boto3 | Terminal live monitor |
| Website | HTML, CSS, JavaScript (planned) | User-facing dashboard |
| Hosting (planned) | GitHub Pages / Netlify / Vercel | Free static site hosting |

---

*Document covers: machine learning pipeline, embedded inference architecture, sensor voltage conversion chain, AWS Signature V4 implementation on embedded hardware, cloud storage design, key technical challenges resolved during development, planned website, and future directions.*
