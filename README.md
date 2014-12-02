MyLittlePlayer
==============
Known bugs
- Flash don't save volume on pause
- Player can't play in old browser
- Player can't auto play on mobile chrome

TODO
==============
- Add calback functions to event
- Change addElements function, add to default layer
- Show/hide element by options value
- Change autostop default value to true
- Fix img preload in chrome

Usage
==============
```
var mlp = new Mlp({
            loadCss: true, //Auto load images and set size to elements
            volume: 0.5, // Default volume
            autoStop: true, // Stop on played another player
            isOnline: true, // Play online stream (default is false)
            preload: true // Add preload option to audio tag (defautl is none)
        });
    mlp.Create();

```
