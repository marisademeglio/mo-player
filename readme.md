# mo-playback

**Goal**:  
This is a very easy way to implement playback of EPUB 3 Media Overlays.

**Non-Goals**:  
This is not a reader and does not implement spine parsing or have a reading system interface.

**To try it**:  
See the [live demo](https://marisademeglio.github.io/mo-player), best viewed in Chrome for its [CSS Custom Highlight API](https://caniuse.com/mdn-api_highlight_has) support.  

**About**:  
This is a proof of concept project to explore using the latest browser-based media APIs for supporting playback of EPUB 3 Media Overlays playback, which can be challenging for reading systems.

**Approach**:  
Play EPUB 3 Media overlays by first converting the sync points to TextTrackCues and then using native browser support for timing events to implement synchronization. Use the CSS Custom Highlight API to highlight text segments during playback. 

**Advantages**:  
* Don't have to write a SMIL engine or deal with media timing as it's handled internally by the browser's TextTrack implementation
* CSS Custom Highlight API provides text highlighting in a way that is not intrusive to the DOM (no adding classnames)

**Disadvantages**:  
* Does not cover 100% of the spec
* Works best with contiguous audio clips (e.g. the audio file plays from point A to point B and doesn't skip around)
* There should be 1 SMIL file per HTML file and vice versa
* Requires browser support for [CSS Custom Highlight API](https://caniuse.com/mdn-api_highlight_has)

**What else**:

Given more time to work on this, I would add:

* phrase navigation
* custom audio playback interface
* skip & escape support

These feature are all feasible without a lot of extra coding, and have already been proven in [Accessible Books in Browsers](https://daisy.github.io/accessible-books-in-browsers/demos/moby-dick/chapter_001.html).
