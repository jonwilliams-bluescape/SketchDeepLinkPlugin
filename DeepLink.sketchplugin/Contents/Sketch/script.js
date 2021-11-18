var onRun = function(context) {
  console.log('hello world')

  var sketch = require('sketch')
  var sketchDom = require('sketch/dom')
  const document = sketchDom.getSelectedDocument()
  const Settings = require('sketch/settings')
  var Document = sketchDom.Document

  var UI = require('sketch/ui')

  console.log(document.path);

  if (document.path == undefined) {
    UI.alert("Error", "Save the doc first 😊");
  } else {
    var pathArray = document.path.split('/')
    var pathId = pathArray[pathArray.length-2];
    console.log(pathId);
  
    let docPath = 'sketch://plugin/com.bluescape.sketch.openDocToPage/com.bluescape.sketch.runscriptidentifier?';
  
    let pageId = '';
    let layerName = '';
  
    document.pages.forEach(page => {
      if (page.selected) {
        pageId = page.id;
        page.layers.forEach(layer => {
          if (layer.selected) {
            layerName = layer.name;
          }
        })  
      }
  
    })
  
    var link = String(docPath) + '&doc=' + String(pathId) + '&page=' + String(pageId) + '&layer=' + String(layerName);

    copy_text(link);

    UI.alert("(Copied to Clipboard)", link);
  
  }
};

var copy_text = function (txt){
  var pasteBoard = [NSPasteboard generalPasteboard]
  [pasteBoard declareTypes:[NSArray arrayWithObject:NSPasteboardTypeString] owner:nil]
  [pasteBoard setString:txt forType:NSPasteboardTypeString]
}

var goToPageAndLayer = function(context, pageId, layerName) {

  var UI = require('sketch/ui')
  var sketch = require('sketch')
  var sketchDom = require('sketch/dom')
  var document = sketchDom.getSelectedDocument()
  var Document = sketchDom.Document

  // UI.alert("Path of this document", String(document.path))

  console.log('page id:', pageId, 'layer:', layerName)



  const openDocs = sketchDom.getDocuments();
  // console.log(openDocs[0].id);
  console.log(document.name, document.id, document.path);

      
      let targetPage, targetLayer;

      document.pages.forEach(page => {
        // console.log('--')
        // console.log(page.name, page.id, page.path)
      
        if (page.id == pageId ) {
          targetPage = page;

          page.layers.forEach(layer => {
            if (layer.name == layerName) {
              targetLayer = layer;
            }
          })  
        }


      })
      
      if (targetLayer) {
        if (targetPage) {
          targetPage.selected = true;
        }

        var selection = document.selectedLayers
        // console.log('before', selection.layers.length)
        // console.log('a', targetLayer.id, targetLayer.name)
        selection.layers = [targetLayer]

        var rect = targetLayer.frame;
        // console.log('rect', rect);
        document.sketchObject.eventHandlerManager().currentHandler().zoomToArtboard();


      }



}



var onOpenDocument = function(context) {

  console.log('ON OPEN DOC');

  setTimeout(function () {
    var Settings = require('sketch/settings')
    let query = Settings.settingForKey('storedQuery');
    if (query) {
      console.log('query', query.doc, query.page, query.layer)
      var pageId = query.page; 
      var layerName = query.layer;
        goToPageAndLayer(context, pageId, layerName);
  
    } else {
      console.log('noQuery')
    }

    Settings.setSettingForKey('storedQuery', null);
      
    }, 20);
}

var handleURL = function(context) {
  var Settings = require('sketch/settings');
  var sketchDom = require('sketch/dom');

  console.log(context);
  let query = context.actionContext.query; 
  var sketch = require('sketch');
  // sketch.UI.message(query.msg || '👋')

  console.log('query', query.doc, query.page, query.layer)

  if (query.doc) {
    let openDoc;
    var alreadyOpen = false;
    var queryDocPathString = query.doc.split('/')[0];

    const openDocs = sketchDom.getDocuments();
    for (var i in openDocs) {
      // console.log(i)
      openDoc = openDocs[i];
      if (openDoc.path) {
        var docPathArray = openDoc.path.split('/')
        var docPathString = docPathArray[docPathArray.length-2];
  
        // console.log('?', docPathString, queryDocPathString)
  
        if (queryDocPathString == docPathString) {
          // console.log('match', i);
          alreadyOpen = i;
          break;
          // openDoc.selected = true;
        }
      }

      // console.log('openDoc', openDoc.id, openDoc.path);
    }

    Settings.setSettingForKey('storedQuery', context.actionContext.query);
    let docPath = 'sketch://sketch.com/s/' + query.doc; 
    
    if (alreadyOpen !== false) {
      console.log('already open @', alreadyOpen);
      openDocs[alreadyOpen].sketchObject.window().makeKeyAndOrderFront(nil)

      onOpenDocument(context);
    } else {
      let url = NSURL.URLWithString(docPath)
      NSWorkspace.sharedWorkspace().openURL(url);  
    }


  }
}
