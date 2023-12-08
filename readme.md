# mo-playback

The simplest possible EPUB 3 media overlays implementation. Doesn't cover every case, but covers most of them! Very lightweight.

**Goal**: 
Easily play EPUB 3 Media overlays by first converting them to TextTrackCues and using the HTMLMediaElement cue timing to implement synchronization.

**Samples**:  
* Basic: SMIL file is a flat list of cues
* Nesting: SMIL file has some nested sequences

**To try it**:  
Open index.html and load the demo. A chapter file will load inside the page. There will also be an audio element with which to start playback. You should be able to see the text highlighting in the chapter file follow the audio playback.

**About**:  
This is a proof of concept project to explore using the latest browser-based media APIs for EPUB 3 Media Overlays playback, which can be challenging.

**Advantages**:  
* No parsing SMIL files or writing media playback engines
* CSS Custom Highlight API provides text highlighting in a way that is not intrusive to the DOM

**Disadvantages**:  
* Works best with contiguous audio clips
* There should be 1 SMIL file per HTML file and vice versa
* Requires browser support for [CSS Custom Highlight API](https://caniuse.com/mdn-api_highlight_has)
