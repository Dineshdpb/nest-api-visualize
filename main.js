const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const { extractAPIInformation } = require('./extractAPIS');
const Store = require('electron-store');

  let mainWindow
  const store = new Store();
function createWindow() {
  // Create the browser window
   mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    }
  });

  // Load the HTML file
  mainWindow.loadFile('index.html');
  // mainWindow.webContents.openDevTools()
  

  // Send API information to the renderer process
  mainWindow.webContents.on('did-finish-load',async  () => {
    let folderPath=store.get("folderPath")
    if(!folderPath){
      doHandleFolderSelection()
    }
    else{
      const apiInformation = extractAPIInformation(folderPath);
  mainWindow.webContents.send('sendSettings', apiInformation)

    }

    
    
    // mainWindow.webContents.send('api-information', apiInformation);
  });
}
ipcMain.on("changeDirectory",()=>{
  doHandleFolderSelection()
})
const doHandleFolderSelection=async()=>{
  let userSelectedPath=await selectNestJSProject()
  store.set("folderPath", userSelectedPath?.path||null);
  if(userSelectedPath && userSelectedPath.status){
    const apiInformation = extractAPIInformation(userSelectedPath.path);
  mainWindow.webContents.send('sendSettings', apiInformation)
  }
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
