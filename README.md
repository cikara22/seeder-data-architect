# seeder-data-architect
This repository contains a robust Node.js utility designed to programmatically architect and seed a BigCommerce catalog. It focuses on structured data injection and resilient API communication.

Overview
The script automates the creation of a "Consumer Electronics" category and populates it with 25–30 unique products. Each product is injected with a structured JSON Metafield (technical_specs) to handle complex technical attributes that standard product fields cannot accommodate.

🛠️ Tech Stack
Runtime: Node.js

HTTP Client: Axios

API: BigCommerce Catalog API (V3)

🛡️ Key Feature: Rate Limit Guard
To ensure stability during high-volume data seeding, I implemented a Rate Limit Guard using Axios Interceptors.

Mechanism: The script monitors the X-Rate-Limit-Requests-Left header in every response.

429 Handling: If the BigCommerce API returns a 429 Too Many Requests status, the script enters a "Sleep" state.

Dynamic Retry: It extracts the X-Retry-After value from the header to pause execution for the exact duration required before automatically retrying the failed request.

📊 Structured Data
Each product includes a techincal_specs metafield containing:

Power & Battery: Capacity (mAh), Fast Charging (Boolean), Port Type.

Physical Specs: Weight (grams), Water Resistance (IP rating).

Connectivity: Bluetooth version, 5G Capability.
