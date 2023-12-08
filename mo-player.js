/* 
process SMIL into TextTrackCues and play directly in the browser

assumptions:

- Audio playback starts from the first clipBegin and ends at the last clipEnd, and all the audio in between those points gets played
- There is one audio file

*/
// entry point to load content
async function load(html, smil) {
    let smilData = await processSmil(smil);

    // easy way: load the text document in an iframe
    let iframe = document.querySelector('iframe');
    iframe.setAttribute('src', html);  
    iframe.onload = () => {  
        // refer to the highlights css file
        let iframeStyle = iframe.contentDocument.createElement('link');
        iframeStyle.setAttribute('rel', 'stylesheet');
        iframeStyle.setAttribute('href', '../highlights.css');
        let iframeHead = iframe.contentDocument.querySelector('head');
        iframeHead.appendChild(iframeStyle);
    };

    let oldAudioElm = document.querySelector('#narration');
    if (oldAudioElm) {
        oldAudioElm.parentElement.removeChild(oldAudioElm);
    }
    // and load the audio into an audio element with default controls
    let audio = document.createElement('audio');
    audio.src = smilData.audioUrl;
    audio.controls = true;
    audio.id = 'narration';
    
    let textTrack = audio.addTextTrack("metadata");
    smilData.cues.map(cue => textTrack.addCue(cue));
    let main = document.querySelector('main');
    main.insertBefore(audio, iframe);

    Array.from(textTrack.cues).map(cue => {
        cue.addEventListener('enter', e => {
            let cueMeta = JSON.parse(cue.text);
            let range = createRange(cueMeta.selector);
            let newHighlight = new Highlight(range);
            iframe.contentWindow.CSS.highlights.set("sync", newHighlight);
            let node = range.startContainer;
            if (!isInViewport(node)) {
                node.scrollIntoView();
            }
        });
    })
}
function isInViewport(elm) {
    let bounding = elm.getBoundingClientRect();
    let doc = elm.ownerDocument;
    return (
        bounding.top >= 0 &&
        bounding.left >= 0 &&
        bounding.bottom <= (doc.defaultView.innerHeight || doc.documentElement.clientHeight) &&
        bounding.right <= (doc.defaultView.innerWidth || doc.documentElement.clientWidth)
    );
}

function createRange(cssSelector) {
    let iframe = document.querySelector('iframe');
    let node = iframe.contentDocument.querySelector(cssSelector);
    let range = iframe.contentDocument.createRange();
    range.setStart(node, 0);
    range.setEnd(node.nextSibling, 0);
    return range;
}
// process SMIL to prepare the sync points to become a list of TextTrackCues
async function processSmil(smil) {
    let smilDoc = await fetchFile(smil);
    let smilModel = parse(smilDoc);
    let smilPars = visit(smilModel.body, accumulatePars, []);   
    smilPars = smilPars.filter(item => item != null);
    let audioUrl = '';
    let startOffset = 0;
    let endOffset = 0;
    if (smilPars.length > 0) {
        let firstAudio = smilPars[0].media.find(item => item.type == 'audio');
        if (firstAudio) {
            audioUrl = new URL(firstAudio.src, smil).href;
            startOffset = firstAudio.clipBegin;
        }
        let lastAudio = smilPars.reverse()[0].media.find(item => item.type == 'audio');
        if (lastAudio) {
            endOffset = lastAudio.clipEnd;
        }
        else {
            console.error("Could not process SMIL");
            return null;
        }
    }
    else {
        console.error("Could not process SMIL");
        return null;
    }

    let cues = smilPars.map(item => {
        let audio = item.media.find(media => media.type == 'audio');
        let text = item.media.find(media => media.type == 'text');
        return new VTTCue(parseFloat(audio.clipBegin), parseFloat(audio.clipEnd), JSON.stringify({selector: makeSelector(text.src)}));
    });

    return {
        audioUrl: `${audioUrl}#t=${startOffset},${endOffset}`,
        cues
    };

}
function accumulatePars(node) {
    if (node.type == 'par') {
        return node;
    }
    else {
        return null;
    }
}
// Visit a tree of objects with media children
function visit(node, fn, collectedData) {
    let retval = fn(node);
    if (node?.media) {
        return [retval, ...node.media.map(n => visit(n, fn, collectedData)).flat()];
    }
   else {
    return retval;
   }
}

let isMedia = name => name == "text" || name == "audio" 
    || name == "ref" || name == "video" 
    || name == "img";


async function fetchFile(url) {
    let res = await fetch(url);
    if (res && res.ok) {
        let textData = await res.text();
        return textData;
    }
    else {
        throw new Error(`Error fetching ${url}`);
    }
}

function parse(xml) {
    let model = {};
    let domparser = new DOMParser();
    let doc = domparser.parseFromString(xml, "application/xml");
    let bodyElm = doc.documentElement.getElementsByTagName("body");
    if (bodyElm.length > 0) {
        model.body = parseNode(bodyElm[0]);
    }
    return model;
}

function parseNode(node) {
    if (node.nodeName == "body" || node.nodeName == "seq" || node.nodeName == "par") {
        // body has type "seq"
        let type = node.nodeName == "body" || node.nodeName == "seq" ? "seq" : "par";
        let obj = {
            type
        };
        if (node.id) {
            obj.id = node.getAttribute("id");
        }
        if (node.hasAttribute('epub:type')) {
            obj.epubType = node.getAttribute('epub:type').split(' ');
        }
        obj.media = Array.from(node.children).map(n => parseNode(n));
        return obj;
    }
    else if (isMedia(node.nodeName)) {
        let obj = {
            type: node.nodeName,
            src: node.getAttribute("src"),
        };
        if (node.id) {
            obj.id = node.getAttribute("id");
        }
        if (node.nodeName == "audio") {
            obj.clipBegin = parseClockValue(node.getAttribute("clipBegin"));
            obj.clipEnd = parseClockValue(node.getAttribute("clipEnd"));
        }
        return obj;
    }
}

// parse the timestamp and return the value in seconds
// supports this syntax: https://www.w3.org/publishing/epub/epub-mediaoverlays.html#app-clock-examples
function parseClockValue(value) { 
    if (!value) {
        return null;
    }
    let hours = 0;
    let mins = 0;
    let secs = 0;
    
    if (value.indexOf("min") != -1) {
        mins = parseFloat(value.substr(0, value.indexOf("min")));
    }
    else if (value.indexOf("ms") != -1) {
        var ms = parseFloat(value.substr(0, value.indexOf("ms")));
        secs = ms/1000;
    }
    else if (value.indexOf("s") != -1) {
        secs = parseFloat(value.substr(0, value.indexOf("s")));                
    }
    else if (value.indexOf("h") != -1) {
        hours = parseFloat(value.substr(0, value.indexOf("h")));                
    }
    else {
        // parse as hh:mm:ss.fraction
        // this also works for seconds-only, e.g. 12.345
        let arr = value.split(":");
        secs = parseFloat(arr.pop());
        if (arr.length > 0) {
            mins = parseFloat(arr.pop());
            if (arr.length > 0) {
                hours = parseFloat(arr.pop());
            }
        }
    }
    let total = hours * 3600 + mins * 60 + secs;
    return total;
}
// turn file.html#abc into #abc
function makeSelector(textref) {
    let idx = textref.indexOf('#');
    if (idx != -1) {
        return textref.slice(idx);
    }
    else {
        return '';
    }
}

export { load }
