// ===== GOOGLE APPS SCRIPT CODE =====
// Deploy this as a Web App with "Execute as: Me" and "Who has access: Anyone"
// Copy the Web App URL and paste it in galaxy-script.js

// ===== CONFIGURATION =====
const SHEET_NAME = 'Memories'; // ชื่อ Sheet ใน Google Sheets
const FOLDER_ID = 'YOUR_GOOGLE_DRIVE_FOLDER_ID'; // ID ของ Folder ใน Google Drive สำหรับเก็บรูป

// ===== doGet: Read Data from Google Sheets =====
function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Sheet not found'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    // Convert to array of objects
    const memories = rows.map(row => {
      let obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: memories
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ===== doPost: Write Data to Google Sheets =====
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      // Create sheet if it doesn't exist
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const newSheet = ss.insertSheet(SHEET_NAME);
      newSheet.appendRow(['Date', 'Title', 'Message', 'Category', 'ImageURL', 'CreatedAt']);
    }
    
    // Parse incoming data
    const data = JSON.parse(e.postData.contents);
    
    let imageUrl = '';
    
    // Handle image upload if base64 provided
    if (data.imageBase64) {
      imageUrl = saveImageToDrive(data.imageBase64, data.title || 'memory');
    }
    
    // Append new row
    sheet.appendRow([
      data.date || new Date().toISOString().split('T')[0],
      data.title || 'Untitled Memory',
      data.message || '',
      data.category || 'General',
      imageUrl,
      new Date().toISOString()
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Memory saved successfully',
      imageUrl: imageUrl
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ===== Helper: Save Base64 Image to Google Drive =====
function saveImageToDrive(base64String, filename) {
  try {
    // Remove data:image/...;base64, prefix
    const base64Data = base64String.split(',')[1] || base64String;
    
    // Decode base64
    const blob = Utilities.newBlob(
      Utilities.base64Decode(base64Data),
      'image/jpeg',
      `${filename}_${Date.now()}.jpg`
    );
    
    // Get folder or use root
    let folder;
    try {
      folder = DriveApp.getFolderById(FOLDER_ID);
    } catch (e) {
      folder = DriveApp.getRootFolder();
    }
    
    // Save file
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return file.getUrl();
    
  } catch (error) {
    Logger.log('Error saving image: ' + error);
    return '';
  }
}

// ===== SETUP INSTRUCTIONS =====
/*
1. Create a new Google Sheets
2. Add columns: Date, Title, Message, Category, ImageURL, CreatedAt
3. Go to Extensions > Apps Script
4. Paste this code
5. Click Deploy > New deployment
6. Choose "Web app"
7. Execute as: Me
8. Who has access: Anyone
9. Click Deploy
10. Copy the Web App URL
11. Create a Google Drive folder for images
12. Get the folder ID from the URL (the part after /folders/)
13. Replace FOLDER_ID above with your folder ID
14. Paste the Web App URL in galaxy-script.js as API_URL
*/
