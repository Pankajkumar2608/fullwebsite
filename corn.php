<?php
// URLs to fetch data from
$urls = [
    "https://collegepredictorapi.onrender.com"
];

// Initialize cURL multi handle
$multiCurl = curl_multi_init();

// Array to store individual cURL handles
$curlHandles = [];

// Initialize and add each handle to the multi handle
foreach ($urls as $key => $url) {
    $curlHandles[$key] = curl_init();

    curl_setopt($curlHandles[$key], CURLOPT_URL, $url);
    curl_setopt($curlHandles[$key], CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curlHandles[$key], CURLOPT_TIMEOUT, 10);

    curl_multi_add_handle($multiCurl, $curlHandles[$key]);
}

// Execute the multi handle
do {
    $status = curl_multi_exec($multiCurl, $active);
    curl_multi_select($multiCurl);
} while ($active && $status == CURLM_OK);

// Retrieve and process responses
foreach ($curlHandles as $key => $ch) {
    $response = curl_multi_getcontent($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    echo "URL: {$urls[$key]}\n";
    echo "HTTP Code: $httpCode\n";
    echo "Response: $response\n\n";

    // Close the individual handle
    curl_multi_remove_handle($multiCurl, $ch);
    curl_close($ch);
}

// Close the multi handle
curl_multi_close($multiCurl);
?>
