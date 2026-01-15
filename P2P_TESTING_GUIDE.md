# P2P File Sharing Testing Guide

## Setup Instructions

### 1. Start All Peers

Open **3 separate terminal windows** and run each peer:

**Terminal 1 - Peer 1 :**
```bash
cd "c:/Users/sgarm/OneDrive/Desktop/Javascript projects/PeerNotes-main/file_peer_peer1"
$env:PORT=4001
$env:UPLOAD_DIR="file_peer_peer1/uploads"
npm run dev
```

**Terminal 2 - Peer 2 :**
```bash
cd "c:/Users/sgarm/OneDrive/Desktop/Javascript projects/PeerNotes-main/file_peer_peer2"
$env:PORT=4002
$env:UPLOAD_DIR="file_peer_peer2/uploads"
npm run dev
```

**Terminal 3 - Peer 3 :**
```bash
cd "c:/Users/sgarm/OneDrive/Desktop/Javascript projects/PeerNotes-main/file_peer_peer3"
$env:PORT=4003
$env:UPLOAD_DIR="file_peer_peer3/uploads"
npm run dev
```

### 2. Testing Methods

#### Method 1: Automated Test Script
```bash
cd "c:/Users/sgarm/OneDrive/Desktop/Javascript projects/PeerNotes-main"
node test_p2p.js
```

#### Method 2: Web Interface
1. Open `p2p_test_interface.html` in your browser
2. The interface will show peer status and allow file operations
3. Upload files and test P2P transfers with visual progress bars

#### Method 3: Manual API Testing
Use curl or Postman to test endpoints:

**Check peer status:**
```bash
curl http://localhost:4001/ip
curl http://localhost:4002/ip
curl http://localhost:4003/ip
```

**List files:**
```bash
curl http://localhost:4001/files
curl http://localhost:4002/files
curl http://localhost:4003/files
```

**Upload file to Peer 1:**
```bash
curl -X POST http://localhost:4001/copy-file \
  -F "file_id=test123" \
  -F "file=@your_file.txt"
```

**Transfer from Peer 1 to Peer 2:**
```bash
curl -X POST http://localhost:4002/request \
  -H "Content-Type: application/json" \
  -d '{"id":"test123","filename":"your_file.txt","ip":"localhost","port":4001}'
```

## Features Added

### 1. Progress Tracking
- **Server-side**: Console logs show download/upload progress
- **Client-side**: Visual progress bars in web interface
- **Stream-based**: Real-time progress for large files

### 2. Dynamic Port Support
- Peers can now run on different ports (4001, 4002, 4003)
- Transfer requests include source port parameter
- Flexible configuration for testing

### 3. Enhanced Error Handling
- Better error messages and logging
- Stream error handling
- Graceful failure recovery

### 4. Testing Tools
- **Automated test script**: `test_p2p.js`
- **Web interface**: `p2p_test_interface.html`
- **Manual API testing**: curl examples

## Verification Steps

1. **Peer Discovery**: All peers should respond to `/ip` endpoint
2. **File Upload**: Upload a file to any peer
3. **P2P Transfer**: Transfer file between peers
4. **Progress Monitoring**: Check console logs and progress bars
5. **File Verification**: Confirm files exist in upload directories

## Expected Output

### Console Logs:
```
Sending test123_file.txt: 25% (1024/4096 bytes)
Sending test123_file.txt: 50% (2048/4096 bytes)
Sending test123_file.txt: 75% (3072/4096 bytes)
Sending test123_file.txt: 100% (4096/4096 bytes)
Completed sending test123_file.txt: 4096 bytes

Requesting file test123_file.txt from localhost:4001
Downloading test123_file.txt: 25% (1024/4096 bytes)
Downloading test123_file.txt: 50% (2048/4096 bytes)
Downloading test123_file.txt: 75% (3072/4096 bytes)
Downloading test123_file.txt: 100% (4096/4096 bytes)
Completed downloading test123_file.txt: 4096 bytes
```

### Test Script Output:
```
🔍 Testing Peer Discovery...
✅ Peer 1 (Aman): IP = 192.168.1.100
✅ Peer 2 (Bina): IP = 192.168.1.100
✅ Peer 3 (Chirag): IP = 192.168.1.100

📤 Testing File Upload to Peer 1 (Aman)...
✅ Peer 1 (Aman): Upload successful - File Moved successfully

📥 Testing File Download from Peer 1 (Aman) to Peer 2 (Bina)...
✅ Peer 2 (Bina): Download successful - File Downloaded to location...

✅ P2P File Sharing Test Complete!
```

## Troubleshooting

- **Port conflicts**: Make sure ports 4001, 4002, 4003 are free
- **Missing dependencies**: Run `npm install` in each peer directory
- **CORS issues**: The server includes CORS middleware
- **File permissions**: Check write permissions for upload directories
