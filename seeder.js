const axios = require('axios');

// Configuration
const STORE_HASH = 'fegtjozyzp';
const ACCESS_TOKEN = '4kaj6l1ttlv6vsg4oteb9trdecgnwy5';
const API_URL = `https://api.bigcommerce.com/stores/fegtjozyzp/v3/`;

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'X-Auth-Token': ACCESS_TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

/**
 * RATE LIMIT GUARD
 * This interceptor checks the headers of every response. 
 * If a 429 is hit, it pauses based on the BigCommerce 'X-Retry-After' header.
 */
apiClient.interceptors.response.use(
    response => {
        const left = response.headers['x-rate-limit-requests-left'];
        console.log(`Requests left in window: ${left}`);
        return response;
    },
    async error => {
        if (error.response && error.response.status === 429) {
            const retryAfter = parseInt(error.response.headers['x-retry-after']) || 1;
            console.warn(`Rate limit hit. Sleeping for ${retryAfter} seconds...`);
            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
            return apiClient.request(error.config);
        }
        return Promise.reject(error);
    }
);

const techSpecs = [
    {
        "group": "Power & Battery",
        "attributes": [
            { "label": "Capacity", "value": "5000 mAh", "type": "number" },
            { "label": "Fast Charging", "value": true, "type": "boolean" },
            { "label": "Port Type", "value": "USB-C", "type": "string" }
        ]
    },
    {
        "group": "Physical",
        "attributes": [
            { "label": "Weight", "value": 185, "unit": "grams", "type": "number" },
            { "label": "Water Resistance", "value": "IP68", "type": "string" }
        ]
    }
];

async function seedCatalog() {
    try {
        // 1. Create Category
        const catRes = await apiClient.post('/catalog/categories', {
            name: "Consumer Electronics",
            parent_id: 0,
            is_visible: true
        });
        const categoryId = catRes.data.data.id;
        console.log(`Created Category ID: ${categoryId}`);

        // 2. Create 25 Products
        for (let i = 1; i <= 25; i++) {
            const productRes = await apiClient.post('/catalog/products', {
                name: `Pro-Tech Device Model ${i}`,
                type: 'physical',
                weight: 1,
                price: 299.99,
                categories: [categoryId]
            });

            const productId = productRes.data.data.id;
            console.log(`Product ${i} created (ID: ${productId})`);

            // 3. Attach JSON Metafield
            await apiClient.post(`/catalog/products/${productId}/metafields`, {
                permission_set: 'write_and_sf_access',
                namespace: 'Technical Specifications',
                key: 'technical_specs',
                value: JSON.stringify(techSpecs),
                resource_type: 'product',
                resource_id: productId
            });
            console.log(`Metafield injected into Product ${productId}`);
        }

        console.log("Seeding complete!");
    } catch (err) {
        console.error("Seeding failed:", err.response ? err.response.data : err.message);
    }
}

seedCatalog();