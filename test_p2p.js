const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration for multiple peers
const peers = [
  { name: 'Peer 1 (Aman)', port: 4001, uploadDir: 'file_peer_peer1/uploads' },
  { name: 'Peer 2 (Bina)', port: 4002, uploadDir: 'file_peer_peer2/uploads' },
  { name: 'Peer 3 (Chirag)', port: 4003, uploadDir: 'file_peer_peer3/uploads' }
];

// Test file data
const testFile = {
  id: 'test123',
  filename: 'test_document.txt',
  content: 'This is a test file for P2P file sharing demonstration.'
};

async function testPeerDiscovery() {
  console.log('🔍 Testing Peer Discovery...\n');
  
  for (const peer of peers) {
    try {
      const response = await axios.get(`http://localhost:${peer.port}/ip`);
      console.log(`✅ ${peer.name}: IP = ${response.data}`);
    } catch (error) {
      console.log(`❌ ${peer.name}: Failed to get IP - ${error.message}`);
    }
  }
  console.log('');
}

async function testFileListing() {
  console.log('📁 Testing File Listing...\n');
  
  for (const peer of peers) {
    try {
      const response = await axios.get(`http://localhost:${peer.port}/files`);
      console.log(`✅ ${peer.name}: Files = ${JSON.stringify(response.data.files)}`);
    } catch (error) {
      console.log(`❌ ${peer.name}: Failed to list files - ${error.message}`);
    }
  }
  console.log('');
}

async function testFileUpload(peer) {
  console.log(`📤 Testing File Upload to ${peer.name}...`);
  
  try {
    // Create test file buffer
    const buffer = Buffer.from(testFile.content);
    
    // Create FormData for file upload
    const FormData = require('form-data');
    const form = new FormData();
    form.append('file_id', testFile.id);
    form.append('file', buffer, testFile.filename);
    
    const response = await axios.post(
      `http://localhost:${peer.port}/copy-file`,
      form,
      {
        headers: {
          ...form.getHeaders()
        }
      }
    );
    
    console.log(`✅ ${peer.name}: Upload successful - ${response.data}`);
    return true;
  } catch (error) {
    console.log(`❌ ${peer.name}: Upload failed - ${error.message}`);
    return false;
  }
}

async function testFileDownload(fromPeer, toPeer) {
  console.log(`📥 Testing File Download from ${fromPeer.name} to ${toPeer.name}...`);
  
  try {
    const response = await axios.post(`http://localhost:${toPeer.port}/request`, {
      id: testFile.id,
      filename: testFile.filename,
      ip: 'localhost',
      port: fromPeer.port
    });
    
    console.log(`✅ ${toPeer.name}: Download successful - ${response.data}`);
    return true;
  } catch (error) {
    console.log(`❌ ${toPeer.name}: Download failed - ${error.message}`);
    return false;
  }
}

async function verifyFileExists(peer) {
  const filePath = path.join(__dirname, '..', peer.uploadDir, `${testFile.id}_${testFile.filename}`);
  const exists = fs.existsSync(filePath);
  console.log(`🔍 ${peer.name}: File exists = ${exists}`);
  return exists;
}

async function runP2PTest() {
  console.log('🚀 Starting P2P File Sharing Test\n');
  console.log('=====================================\n');
  
  // Test 1: Peer Discovery
  await testPeerDiscovery();
  
  // Test 2: File Listing
  await testFileListing();
  
  // Test 3: Upload file to Peer 1
  const uploadSuccess = await testFileUpload(peers[0]);
  if (!uploadSuccess) {
    console.log('❌ Upload failed, stopping test');
    return;
  }
  
  // Test 4: Check if file exists in Peer 1
  await verifyFileExists(peers[0]);
  
  // Test 5: P2P Transfer from Peer 1 to Peer 2
  await testFileDownload(peers[0], peers[1]);
  await verifyFileExists(peers[1]);
  
  // Test 6: P2P Transfer from Peer 1 to Peer 3
  await testFileDownload(peers[0], peers[2]);
  await verifyFileExists(peers[2]);
  
  // Test 7: Final file listing
  console.log('\n📋 Final File Status:');
  await testFileListing();
  
  console.log('\n✅ P2P File Sharing Test Complete!');
  console.log('\nTo test manually:');
  console.log('1. Make sure all 3 peers are running on ports 4001, 4002, 4003');
  console.log('2. Open browser and navigate to each peer to verify');
  console.log('3. Check upload directories for transferred files');
}

// Check if all peers are running before starting test
async function checkPeersRunning() {
  console.log('🔍 Checking if all peers are running...\n');
  
  for (const peer of peers) {
    try {
      await axios.get(`http://localhost:${peer.port}/ip`, { timeout: 2000 });
      console.log(`✅ ${peer.name} is running on port ${peer.port}`);
    } catch (error) {
      console.log(`❌ ${peer.name} is not running on port ${peer.port}`);
      console.log('\nPlease start all peers first:');
      console.log('Peer 1: $env:PORT=4001; $env:UPLOAD_DIR="file_peer_peer1/uploads"; node server.js');
      console.log('Peer 2: $env:PORT=4002; $env:UPLOAD_DIR="file_peer_peer2/uploads"; node server.js');
      console.log('Peer 3: $env:PORT=4003; $env:UPLOAD_DIR="file_peer_peer3/uploads"; node server.js');
      return false;
    }
  }
  console.log('');
  return true;
}

// Run the test
if (require.main === module) {
  checkPeersRunning().then(allRunning => {
    if (allRunning) {
      runP2PTest();
    }
  }).catch(error => {
    console.error('Test failed:', error);
  });
}

module.exports = { runP2PTest, testPeerDiscovery, testFileListing, testFileUpload, testFileDownload };
