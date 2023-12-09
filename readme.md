# mo-playback

The simplest possible code for rendering EPUB 3 media overlays. 

**Goal**:  
Play EPUB 3 Media overlays by first converting them to TextTrackCues and using native browser support for timing events to implement synchronization. Use the CSS Custom Highlight API to highlight text segments during playback. 

**Non-Goals**:  
This is not a reader and does not implement spine parsing or have a reading system interface.

**To try it**:  
See the [live demo](https://marisademeglio.github.io/mo-player), best viewed in Chrome for its [CSS Custom Highlight API](https://caniuse.com/mdn-api_highlight_has) support.  

**About**:  
This is a proof of concept project to explore using the latest browser-based media APIs for supporting playback of EPUB 3 Media Overlays playback, which can be challenging for reading systems.

**Advantages**:  
* Don't have to write a SMIL engine or deal with media timing
* CSS Custom Highlight API provides text highlighting in a way that is not intrusive to the DOM (no adding classnames)

**Disadvantages**:  

Not a 1:1 match with what's allowed in EPUB MO but works for most of it  
* Works best with contiguous audio clips
* There should be 1 SMIL file per HTML file and vice versa
* Requires browser support for [CSS Custom Highlight API](https://caniuse.com/mdn-api_highlight_has)

**What else**:

Given more time to work on this, I would add:

* phrase navigation
* custom audio playback interface
* skip & escape support

These feature are all feasible without a lot of extra coding, and have already been proven in [Accessible Books in Browsers](https://daisy.github.io/accessible-books-in-browsers/demos/moby-dick/chapter_001.html).
