### docs/ToDo.md

# To Do :

- research and document pinterest retrieval method
- update DemoProfiles w/ V2

---

- (NEW) tileType/
    - Clock (other locations)
        - multiple formats ex. Flip Clock, Hands, Fonts, Italics, Bold, etc. 
    - Music Player ? (youtube does this) (Spotify playlist import support)
        - import url to playlist allows ability to shuffle play skip stop rewind (for now future features added later)
        - rough prototype functionality > aesthetics (later)
        
---

- (FIX) 
    - save as file ? (causes unverified download, double pop up within page to ensure)
        - save file output contents like comment & name
    - tileType/
        - NoteTile/
            - remove scrollbar from not fitting and expand to max vert & horz
            - fix weird bug where dragging out of edit model causes exit of note and not saving, update to not exit and save prior if does.
        - Pinterest Board Fix RSS Fetch
        - Image Tile memory compression / smart fetching 
            - never store data of image only url to be fetched upon user request directly i.e. i.pinimg.example...
    - Border Resizing Logic
        - update to introduce smart-safe border resizing logic such that in the instance of an attempt to shrink not permitted if blocking or would cause deletion of existing tiles
            - deeper layer, if possible shift in opposite to create space for border resize operation to permit
--- 

- (UPDATE) docs/
    - ReadMe
    - ToDo
    - other

---

- (BUG/ISSUE) Max Sizing overbounds  ?
    - Expanding the existing default 3x3 Tile Container to its maximum Zx6 or 6xZ , then releasing and rengaging resizing and rapidly expanding causes client mouse registration failure and inability to click on anything on the page and refresh is only force restart, include debug output for these edge cases to catch safety early and prevent. Very weird especially since causes both left click AND right click to inspect pages console output , so have to do prior
- (BUG/ISSUE) Note Tile Edit Color Spectrum Overload ? 
    - opening the Note Tile Edit page and clicking quickly on the color spectrum at different points causes the entire page to freeze and remain stuck and unable to click on anything. causes client mouse registration failure and inability to click on anything on the page and refresh is only force restart, include debug output for these edge cases to catch safety early and prevent. Very weird especially since causes both left click AND right click to inspect pages console output , so have to do prior