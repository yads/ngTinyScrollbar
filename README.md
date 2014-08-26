ngTinyScrollbar
===============

An angular directive port of the [TinyScrollbar](https://github.com/wieringen/tinyscrollbar)
See simple [demo](http://ng-tiny-scrollbar.azurewebsites.net/test.html) 

How to use
==========

Install using bower

    bower install ng-tiny-scrollbar --save

Add css and javascript to your site

```html
<link rel="stylesheet" href="bower_components/ng-tiny-scrollbar/dist/ng-tiny-scrollbar.css" type="text/css"/>
<script src="bower_components/ng-tiny-scrollbar/dist/ng-tiny-scrollbar.js"></script>
```

Add the `ngTinyScrollbar` module as a dependency of your application

Mark any item you want custom scrollbars on with the scrollbar attribute.

```html
<div id="myCustomScrollbarContainer" scrollbar>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus vel metus sed
    ipsum facilisis ornare. Vestibulum mattis rutrum sem. Phasellus ullamcorper nisi
    vel enim lobortis lacinia. Vestibulum eu dui ligula. Sed nibh velit, faucibus sed
    feugiat ac, fermentum sed sem. Vestibulum porttitor neque nec urna tincidunt, vel
    lobortis nibh tempor. Aliquam ac ex ante. Aenean quis dolor id nunc maximus venenatis.
</div>
```

Add a width and a height in your css for the .scroll-viewport underneath your item. Ensure your
container has a width that's slightly larger than the viewport otherwise the scrollbar will be
overtop of your content

```css
#idCustomScrollbarContainer {
  width: 120px;
}

#idCustomScrollbarContainer .scroll-viewport {
    height: 200px;
    width: 100px;
}
```

Specify options via the attribute value. You can use scope properties for any of the values

```html
<div scrollbar="{axis: 'y', wheel: false}"></div>
```

Here's the list of all the options and the default values

```javascript
{
    axis : 'y',             // Vertical or horizontal scrollbar? ( x || y ).
    wheel : true,           // Enable or disable the mousewheel;
    wheelSpeed : 40,        // How many pixels must the mouswheel scroll at a time.
    wheelLock : true,       // Lock default scrolling window when there is no more content.
    scrollInvert : false,   // Enable invert style scrolling
    trackSize : false,      // Set the size of the scrollbar to auto or a fixed number.
    thumbSize : false,      // Set the size of the thumb to auto or a fixed number.
    alwaysVisible: true     // Set to false to hide the scrollbar if not being used
}
```

Customizing appearance
======================

Build using the less file and specify the following variables:

```less
@scrollbar-width: 15px;         // width of the scrollbar;
@scrollbar-color: lightgray;    // color of the scrollbar
@scroll-thumb-color: gray;      // color of the thumb
@scroll-border-radius: 5px;     // border radius, set to 0 for square scrollbar and thumb
```

License
=======
The MIT License (MIT)

Copyright (c) 2014 Vadim Kazakov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
