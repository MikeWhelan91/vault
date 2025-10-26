const fetch = require('node-fetch');

async function testCheckIn() {
  const bundleId = 'cmgu4ao6p000ouzmcue1wvvkt'; // Your heartbeat bundle

  console.log('=== Testing Bundle Check-In ===\n');
  console.log(`Bundle ID: ${bundleId}\n`);

  try {
    const response = await fetch(`https://forebearer.app/api/bundles/${bundleId}/checkin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    console.log(`Status: ${response.status}\n`);
    console.log('Response:');
    console.log(JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('\n✓ Check-in successful!');
      console.log(`Next deadline: ${data.bundle.nextHeartbeat}`);
    } else {
      console.log('\n✗ Check-in failed');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testCheckIn();
