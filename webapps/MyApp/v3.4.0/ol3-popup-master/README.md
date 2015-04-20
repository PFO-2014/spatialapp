# OpenLayers 3 Popup

Basic popup for an OL3 map. By default the map is centered so that the popup is
entirely visible.

## Demo

Clone or download the repository and open
[examples/popup.html](examples/popup.html) in a browser or [view the example on
RawGit](http://rawgit.com/walkermatt/ol3-popup/master/examples/popup.html).
Click on the map to display a popup, click close to the edge of the map to see
it pan into view.

## Credit

Based on an example by [Tim Schaub](https://github.com/tschaub) posted on the
[OL3-Dev list](https://groups.google.com/forum/#!forum/ol3-dev).

## API

### `new ol.Overlay.Popup(opt_options)`

OpenLayers 3 Popup Overlay.
See [the examples](./examples) for usage. Styling can be done via CSS.

#### Parameters:

|Name|Type|Description|
|:---|:---|:----------|
|`opt_options`|`Object`| Overlay options, extends olx.OverlayOptions adding: **`panMapIfOutOfView`** `Boolean` - Should the map be panned so that the popup is entirely within view. |

#### Extends

`ol.Overlay`

#### Methods

##### `show(coord,html)`

Show the popup.

###### Parameters:

|Name|Type|Description|
|:---|:---|:----------|
|`coord`|`ol.Coordinate`| Where to anchor the popup. |
|`html`|`String`| String of HTML to display within the popup. |


##### `hide()`

Hide the popup.

## License

MIT (c) Matt Walker.

## Also see

If you find the popup useful you might also like the
[ol3-layerswitcher](https://github.com/walkermatt/ol3-layerswitcher).

