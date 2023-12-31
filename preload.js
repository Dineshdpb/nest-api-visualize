const contextBridge = require('electron').contextBridge;
const ipcRenderer = require('electron').ipcRenderer;

// Exposed protected methods in the render process
contextBridge.exposeInMainWorld(
    // Allowed 'ipcRenderer' methods
    'bridge', {
        // From main to render
        sendSettings: (message) => {
            ipcRenderer.on('sendSettings', message);
        },
        changeDirectory:(data)=>{
            ipcRenderer.send('changeDirectory');
        }
        

    }
);
