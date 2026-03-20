// Configuration
const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:8080'
    : 'https://gateway.ambitiousflower-eb157cd0.centralindia.azurecontainerapps.io';

const ORDERS_ENDPOINT = `${API_BASE_URL}/orders`;

// DOM Elements
const orderForm = document.getElementById('orderForm');
const responseContainer = document.getElementById('responseContainer');
const gatewayStatus = document.getElementById('gatewayStatus');
const submitText = document.getElementById('submitText');
const spinner = document.getElementById('spinner');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkGatewayStatus();
    setupFormListener();
});

/**
 * Check gateway health status
 */
async function checkGatewayStatus() {
    try {
        const healthUrl = `${API_BASE_URL}/actuator/health`;
        const response = await fetch(healthUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            updateStatusBadge(gatewayStatus, 'success', `UP (${data.status})`);
        } else {
            updateStatusBadge(gatewayStatus, 'error', 'DOWN');
        }
    } catch (error) {
        console.error('Gateway status check failed:', error);
        updateStatusBadge(gatewayStatus, 'error', 'Unreachable');
    }
}

/**
 * Setup form submission listener
 */
function setupFormListener() {
    orderForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitOrder();
    });
}

/**
 * Submit order to gateway
 */
async function submitOrder() {
    try {
        // Get form values
        const orderId = document.getElementById('orderId').value.trim();
        const item = document.getElementById('item').value.trim();
        const quantity = parseInt(document.getElementById('quantity').value);

        // Validate
        if (!orderId || !item || !quantity) {
            showError('Please fill in all fields');
            return;
        }

        // Disable button and show spinner
        setButtonState(true);

        // Prepare payload
        const payload = {
            orderId: orderId,
            item: item,
            quantity: quantity
        };

        console.log('Submitting order:', payload);
        console.log('API Endpoint:', ORDERS_ENDPOINT);

        // Make API call
        const response = await fetch(ORDERS_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        // Handle response
        if (response.ok) {
            showSuccess(`Order created successfully!`, payload);
            resetForm();
        } else {
            const errorData = await response.text();
            showError(`Failed to create order (HTTP ${response.status})`, errorData);
        }
    } catch (error) {
        console.error('Error submitting order:', error);
        showError(`Error: ${error.message}`);
    } finally {
        setButtonState(false);
    }
}

/**
 * Display success message
 */
function showSuccess(message, data) {
    const responseItem = document.createElement('div');
    responseItem.className = 'response-item success';
    const timestamp = new Date().toLocaleTimeString();
    responseItem.innerHTML = `
        <div class="response-status success">
            ✓ ${message}
        </div>
        <div class="response-data">${JSON.stringify(data, null, 2)}</div>
        <small style="color: #666; margin-top: 8px;">Created at: ${timestamp}</small>
    `;

    insertResponseItem(responseItem);
    console.log('Success:', message, data);
}

/**
 * Display error message
 */
function showError(message, details = '') {
    const responseItem = document.createElement('div');
    responseItem.className = 'response-item error';
    const timestamp = new Date().toLocaleTimeString();
    responseItem.innerHTML = `
        <div class="response-status error">
            ✗ ${message}
        </div>
        ${details ? `<div class="response-data">${escapeHtml(details)}</div>` : ''}
        <small style="color: #666; margin-top: 8px;">Time: ${timestamp}</small>
    `;

    insertResponseItem(responseItem);
    console.error('Error:', message, details);
}

/**
 * Insert response item at the top
 */
function insertResponseItem(item) {
    const placeholder = responseContainer.querySelector('.placeholder-text');
    if (placeholder) {
        placeholder.remove();
    }

    responseContainer.insertBefore(item, responseContainer.firstChild);

    // Keep max 10 responses
    while (responseContainer.children.length > 10) {
        responseContainer.removeChild(responseContainer.lastChild);
    }
}

/**
 * Reset form fields
 */
function resetForm() {
    orderForm.reset();
    document.getElementById('orderId').focus();
}

/**
 * Toggle button state
 */
function setButtonState(isLoading) {
    orderForm.querySelector('[type="submit"]').disabled = isLoading;
    if (isLoading) {
        submitText.style.display = 'none';
        spinner.style.display = 'inline-block';
    } else {
        submitText.style.display = 'inline';
        spinner.style.display = 'none';
    }
}

/**
 * Update status badge
 */
function updateStatusBadge(element, status, text) {
    element.className = `status-badge ${status}`;
    element.textContent = text;
}

/**
 * Escape HTML characters for safe display
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Refresh gateway status every 30 seconds
setInterval(checkGatewayStatus, 30000);
