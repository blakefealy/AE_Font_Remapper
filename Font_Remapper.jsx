
/**
 * @name Font Remapper
 * @summary Allows user batch-change font families and weights across an entire After Effects project.
 * @author Blake Fealy <www.blakefealy.com>
 * @version 1.0
 * @dependencies Requires the user to have an After Effects project open.
 * @updated 07/02/2025
 * @interface User is provided with a detailed remapping interface for each unique font family and weight within the After Effects project.
 */

{
   function getUsedFonts() {
    var fontSet = {};
    for (var i = 1; i <= app.project.numItems; i++) {
        var item = app.project.item(i);
        if (item instanceof CompItem) {
            for (var j = 1; j <= item.numLayers; j++) {
                var layer = item.layer(j);
                if (layer instanceof TextLayer) {
                    var textProp = layer.property("Source Text");
                    var font = textProp.value.font;
                    fontSet[font] = true;
                }
            }
        }
    }

    var keys = [];
    for (var k in fontSet) {
        if (fontSet.hasOwnProperty(k)) {
            keys.push(k);
        }
    }
    return keys;
}


    function getAvailableFonts() {
        var fontNames = [];
        for (var i = 0; i < app.fonts.length; i++) {
            fontNames.push(app.fonts[i].name);
        }
        return fontNames.sort();
    }


    function showFontMappingUI(usedFonts, availableFonts) {
    var infoButtonIcon = getInfoButtonIcon();
    var win = new Window("palette", "Font Remapper", undefined, { resizeable: true });
    win.orientation = "column";
    win.alignChildren = "fill";
    
    var remapPanel = win.add("panel", undefined, "Remap Fonts");

    var scrollGroup = remapPanel.add("group");
    scrollGroup.orientation = "column";
    scrollGroup.alignChildren = ["left", "top"];

    var remapSpacer = scrollGroup.add("group");
    remapSpacer.size = [10,10];

    var fontMappings = {};

    // Header row
    var headerGroup = scrollGroup.add("group");
    headerGroup.orientation = "row";

    var usedFontHeader = headerGroup.add("statictext", undefined, "Used Font");
    usedFontHeader.preferredSize.width = 250;
    usedFontHeader.graphics.font = ScriptUI.newFont("Courier", ScriptUI.FontStyle.BOLD, 100);

    var replacementFontHeader = headerGroup.add("statictext", undefined, "Replacement Font");
    replacementFontHeader.preferredSize.width = 250;
    replacementFontHeader.graphics.font = ScriptUI.newFont("Arial", "bold", 12);


    for (var i = 0; i < usedFonts.length; i++) {
        var group = scrollGroup.add("group");
        group.orientation = "row";

        var label = group.add("statictext", undefined, usedFonts[i]);
        label.preferredSize.width = 250;

        var input = group.add("edittext", undefined, usedFonts[i]); // default to current font
        input.preferredSize.width = 250;

        fontMappings[usedFonts[i]] = input;
    }


var btnGroup = win.add("group");
btnGroup.orientation = "row";
btnGroup.alignChildren = ["left", "center"];
btnGroup.alignment = "fill";
btnGroup.margins = [10,0,0,0];

// Left-aligned info button
var infoBtn = btnGroup.add("iconbutton", undefined, infoButtonIcon, { style: "toolbutton" });
infoBtn.size = [20, 20];
infoBtn.maximumSize = [20, 20];

infoBtn.onClick = function () {
    infoWindow(win);
};


// Spacer that pushes next buttons to the right
var btnSpacer = btnGroup.add("group");
btnSpacer.alignment = "fill";
btnSpacer.minimumSize.width = 0;

// Right-aligned Replace button
var replaceBtn = btnGroup.add("button", undefined, "Replace Fonts");

//Show info dialog
var showResultDialog = btnGroup.add("checkbox", undefined, "Show Success Dialog");
showResultDialog.value = true;

replaceBtn.onClick = function () {
    win.close();
    applyFontMapping(fontMappings, showResultDialog.value);
};

    win.layout.layout(true);
    win.center();
    win.show();
}

    function applyFontMapping(fontMappings, showResultDialogValue) {
    app.beginUndoGroup("Apply Font Mapping");
    var changedLayerArray = [];
    for (var i = 1; i <= app.project.numItems; i++) {
        var item = app.project.item(i);
        if (item instanceof CompItem) {
            for (var j = 1; j <= item.numLayers; j++) {
                var layer = item.layer(j);
                if (layer instanceof TextLayer) {
                    var textProp = layer.property("Source Text");
                    var textDoc = textProp.value;
                    var currentFont = textDoc.font;

                    if (fontMappings[currentFont]) {
                        var newFont = fontMappings[currentFont].text;
                        if (newFont && newFont !== currentFont) {
                            try {
                                textDoc.font = newFont;
                                textProp.setValue(textDoc);
                                changedLayerArray.push(layer.name);
                            } catch (err) {
                                alert("Failed to set font on layer '" + layer.name + "': " + err.toString());
                            }
                        }
                    }
                }
            }
        }
    }
    numberofLayers = changedLayerArray.length;
    if ((showResultDialogValue === true) && (numberofLayers > 0)) {
        var resultString = " text layers were changed within the project.";
        alert(String(numberofLayers + resultString));
    }
    app.endUndoGroup();
}


    // MAIN EXECUTION
    if (app.project && app.project.numItems > 0) {
        var usedFonts = getUsedFonts();
        var availableFonts = getAvailableFonts();
        showFontMappingUI(usedFonts, availableFonts);
    } else {
        alert("Open a project with comps to use this script.");
    }
}

function infoWindow (mainWindow) {
    var panelWidth = 400;
    mainWindow.hide();
    var infoWin = new Window("palette", "Information - Font Remapper", undefined, { resizeable: true });
    infoWin.orientation = "column";
    infoWin.alignChildren = ["fill", "top"];
    infoWin.spacing = 10;
    infoWin.margins = 10;
    infoWin.size = [panelWidth + 40, 600];

    // === About Panel ===
    var about = infoWin.add("panel", undefined, " About ");
    about.orientation = "column";
    about.alignChildren = ["left", "top"];
    about.margins = 10;
    about.preferredSize.width = panelWidth;

    about.add("statictext", undefined, "Font Remapper is a tool created by Blake Fealy that lets you batch-change font families and");
    about.add("statictext", undefined, "weights across your entire After Effects project. It works by finding all unique combinations");
    about.add("statictext", undefined, "of fonts and weights, and gives you a remapping interface to precisely change them.")
    // === How To Use Panel ===
    var howTo = infoWin.add("panel", undefined, " How To Use ");
    howTo.orientation = "column";
    howTo.alignChildren = ["left", "top"];
    howTo.margins = 10;
    howTo.preferredSize.width = panelWidth;

    howTo.add("statictext", undefined, "A Font ID is the exact name After Effects uses for a font. It includes both the font family and style (e.g., Bold, Light)");
    howTo.add("statictext", undefined, "For example, if the font family is 'Arial' and the font weight is 'Bold', the Font ID would be 'Arial-Bold'. Similarly, if the");
    howTo.add("statictext", undefined, "font family is 'Times New Roman' and the font weight is 'Italic', the Font ID would be 'TimesNewRoman-Italic'. If the");
    howTo.add("statictext", undefined, "font weight is 'Bold Italic', the Font ID would be 'TimesNewRoman-Bold-Italic'.");
    howTo.add("statictext", undefined, "Note: Make sure to match capitalization and spacing exactly.");

    // === FAQ Panel ===
    var faq = infoWin.add("panel", undefined, " FAQ ");
    faq.orientation = "column";
    faq.alignChildren = ["left", "top"];
    faq.margins = 10;
    faq.preferredSize.width = panelWidth;

    faq.add("statictext", undefined, "Q: Can I only change specific fonts while not changing all fonts?");
    faq.add("statictext", undefined, "A: Yes. If you leave a font unchanged in the remapper, it will remain as is.");
    faq.add("statictext", undefined, " ");
    faq.add("statictext", undefined, "Q: Can I change the font only in specific compositions or layers?");
    faq.add("statictext", undefined, "A: Currently, Font Remapper only supports batch changes across the entire project.");

    // === Back Button ===
    var backBtn = infoWin.add("button", undefined, "Back");
    backBtn.alignment = "right";
    backBtn.onClick = function () {
        infoWin.close();
    };

    infoWin.onClose = function () {
        mainWindow.show();
    }

    infoWin.layout.layout(true);
    infoWin.center();
    infoWin.show();
}



function getInfoButtonIcon() {
  var infoButtonIconBianary = "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x12\x00\x00\x0B\x12\x01\u00D2\u00DD~\u00FC\x00\x00\x01\u00FEIDAT8\u008D\u00B5\u0094\u00BFo\u00D3@\x14\u00C7\u00BF\u00FE\u00A1\u00C65\u00ADr\u00F5)\x12\u00F2\u0082U!%l\b\u00C2\u0092)\u008A\u00BA\x06!$\u0094di\u00C8\u00C4\u00C0@\u00C4\u00DFP1\u0087\u0081\u0099\u0084\u00A5\t\u0095\x10j\u00C6\"\u0094)\x0B\x15b$\x12D\u009E<\u00B4\u00B8\u00B9\u00A8\u00C1MPl3$\u00B606\x16*\u00E1;\u009D\u00F4\u00EE}\u00EE{\u00EF\u00EE=\u00CEu]\u00ACRbLL3'N\u00C5\x05J\u00CCr\b\x00\x10\u0099g\x1C\u00D0\u00A1\x1B\u00FC>\x00=*\u0089\u008BpH\ff\u00BFR\u0089Pl\u00F5-\u00F4\x063\u00E8\u00E6|q\x02\x15\u0091O'P\u00CD\u00C90\u0098\u00DDU\u0089\u00B0\x0B\u0080\u00C5\x01o\u009EO\u00DDw\u00EF?Oi\u00BD=\u00F6A!\u00EBTD\u00A3\u009CD!#\u0099\u009B\x12\u00B7\x03\u00E0S\x14\u0090\u009CO\u00DD/o>^\u00D0\u0087/\u00CF\x02\u0080\u00ED\u00D4\u00A22\u00C3\u00D3\u00E0\x01\u00CD\u009A\u0082\u00FB\u00B7\u00D6\u00CDM\u0089\u00BB\u00EE9\u00F5\u0081\x06\u00B3\x0F?\u00E8?\u008A\u00F7^\u0098!G_\u009F]\u00C5\u00D6\x15\x1E\u00CA\x13#\x14{\u00FB\u0098\u00E2\u008E\u00B6\u00D6U\u0089p\x17\x00x\u00EF\x16*\x11\u008A\u00F5\u00F68\u00F2\u008A#\u00CB\t\u00B9\u00F3To\u008F\u00A1\x12\u00A1\b@\u00F3\u0081\u00E6\u00C4\u00A9\u00B4\u00FA\u00D6\x1Fk\u0096\u00DD;Av\u00EF$2\u00A6\u009Bs\u00B4\u00FA\x16\u00CC\u0089S\u00F1\u0081.P\u00EA\rf\u00A1\u00CD\u00B7\u00AF\u00AD\u00E1\u00E8i\ng\u00CFU<\u00C8\u00AEG\x02\x01\u00A07\u0098\u00C1\x05J>\u0090Y\x0E\u0089r\u00B7\u009D\x120<\u009DcK\u00E6C\u00B1\u00DF]z\x7F5v\u00E7\u00C1\u00F1\x05vn$\u00FC\u00F5\u00DF\u0088\x07\x16\x1D\u00A0\u00D1\u00B8\u00A6\u0089\u0097FE\x10\u0099g>\u0090\x03:\u00F9t\u00E2\u00D2\u00C0|:\x01\x0E\u00E8\u00F8@\u00BA\u00C1\u00EFWs2.\u00E3R\u00A3\"\u00AA9\x19\u00CB\u00FE\u00F6k\u00A8\x1B\u00CC\u00EE6\u00CA\u00C9P\u00C2\u00F0\u009B\r`\u00D1-^\u00C7\u00FC\u00AAF9\t\u0083\u00D9],\u0087\u0085\u00FF(*\x11v\x0B\x19\u00C9l\u00D6\u0094@\u00C2\u00C1\u00B1\u0085\u0091\u00E5\u00E0\u00F5#\x05\u00A3\u00EFN \u00D6\u00AC)(d$s9$\x00\u00FC\u00E7\u00E1\u00E0i\u00A5\u00E3+`dU\x03\u00F6\u009F\u00F4\x13\u00BD\x1A\u00F3\u00B0\u00F7\u00EB`\u00C5\x00\x00\x00\x00IEND\u00AEB`\u0082";
    return infoButtonIconBianary;
}
