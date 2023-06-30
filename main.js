const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const { extractAPIInformation } = require('./extractAPIS');


function createWindow() {
  // Create the browser window
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    }
  });

  // Load the HTML file
  mainWindow.loadFile('index.html');
  // mainWindow.webContents.openDevTools()
  

  // Extract API information
  
  // Send API information to the renderer process
  mainWindow.webContents.on('did-finish-load',async  () => {
    let userSelectedPath=await selectNestJSProject()
    if(userSelectedPath && userSelectedPath.status){
      const apiInformation = extractAPIInformation('/Users/dineshprajapati/Documents/up2/mayamoneybackend');
    mainWindow.webContents.send('sendSettings', apiInformation)
    }
    
    // mainWindow.webContents.send('api-information', apiInformation);
  });
}
function selectNestJSProject() {
  return new Promise((resolve, reject) => {
    dialog.showOpenDialog({ properties: ['openDirectory'] })
      .then(result => {
        if (!result.canceled && result.filePaths.length > 0) {
          resolve({path:result.filePaths[0],status:true});
        } else {
          resolve(null);
        }
      })
      .catch(error => {
        resolve({path:null,status:false});
      });
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
