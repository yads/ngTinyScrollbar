/*!
Copyright 2014 Vadim Kazakov
Adapted from source by Maarten Baijs

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */

'use strict';

angular.module('ngTinyScrollbar', [])
    .directive('scrollbar', ['$window', '$timeout', '$parse', '$animate', function($window, $timeout, $parse, $animate) {
        return {
            restrict: 'A',
            transclude: true,
            template: '<div class="scroll-bar"><div class="scroll-thumb"></div></div><div class="scroll-viewport"><div class="scroll-overview" ng-transclude></div></div>',
            controller: function($scope, $element, $attrs) {

                var defaults = {
                    axis : 'y', // Vertical or horizontal scrollbar? ( x || y ).
                    wheel : true, // Enable or disable the mousewheel;
                    wheelSpeed : 40, // How many pixels must the mouswheel scroll at a time.
                    wheelLock : true, // Lock default scrolling window when there is no more content.
                    scrollInvert : false, // Enable invert style scrolling
                    trackSize : false, // Set the size of the scrollbar to auto or a fixed number.
                    thumbSize : false, // Set the size of the thumb to auto or a fixed number.
                    alwaysVisible: true // Set to false to hide the scrollbar if not being used
                };
                var options = $attrs.scrollbar;
                if (options) {
                    options = $parse(options)($scope);
                } else {
                    options = {};
                }
                this.options = angular.extend({}, defaults, options);
                this._defaults = defaults;

                var self = this,
                    $body = angular.element(document.querySelectorAll('body')[0]),
                    $document = angular.element(document),
                    $viewport = angular.element($element[0].querySelectorAll('.scroll-viewport')[0]),
                    $overview = angular.element($element[0].querySelectorAll('.scroll-overview')[0]),
                    $scrollbar = angular.element($element[0].querySelectorAll('.scroll-bar')[0]),
                    $thumb = angular.element($element[0].querySelectorAll('.scroll-thumb')[0]),
                    mousePosition = 0,
                    isHorizontal = this.options.axis === 'x',
                    hasTouchEvents = ('ontouchstart' in $window),
                    wheelEvent = ("onwheel" in document ? "wheel" : // Modern browsers support "wheel"
                                  document.onmousewheel !== undefined ? "mousewheel" : // Webkit and IE support at least "mousewheel"
                                  "DOMMouseScroll"), // let's assume that remaining browsers are older Firefox
                    sizeLabel = isHorizontal ? 'width' : 'height',
                    sizeLabelCap = sizeLabel.charAt(0).toUpperCase() + sizeLabel.slice(1).toLowerCase(),
                    posiLabel = isHorizontal ? 'left' : 'top',
                    moveEvent = document.createEvent('HTMLEvents'),
                    restoreVisibilityAfterWheel;

                moveEvent.initEvent('move', true, true);
                this.contentPosition = 0;
                this.viewportSize = 0;
                this.contentSize = 0;
                this.contentRatio = 0;
                this.trackSize = 0;
                this.trackRatio = 0;
                this.thumbSize = 0;
                this.thumbPosition = 0;

                this.initialize = function() {
                    if (!this.options.alwaysVisible) {
                        $scrollbar.css('opacity', 0);
                    }
                    self.update();
                    setEvents();
                    return self;
                };

                this.update = function(scrollTo) {
                    this.viewportSize = $viewport.prop('offset'+ sizeLabelCap);
                    this.contentSize = $overview.prop('scroll'+ sizeLabelCap);
                    this.contentRatio = this.viewportSize / this.contentSize;
                    this.trackSize = this.options.trackSize || this.viewportSize;
                    this.thumbSize = Math.min(this.trackSize, Math.max(0, (this.options.thumbSize || (this.trackSize * this.contentRatio))));
                    this.trackRatio = this.options.thumbSize ? (this.contentSize - this.viewportSize) / (this.trackSize - this.thumbSize) : (this.contentSize / this.trackSize);
                    mousePosition = $scrollbar.prop('offsetTop');

                    $scrollbar.toggleClass('disable', this.contentRatio >= 1 || isNaN(this.contentRatio));

                    if (!this.options.alwaysVisible && this.contentRatio < 1 && this.viewportSize > 0) {
                        //flash the scrollbar when update happens
                        $animate.addClass($scrollbar, 'visible').then(function() {
                            $animate.removeClass($scrollbar, 'visible');
                            $scope.$digest();
                        });
                    }

                    if (scrollTo != null)  {
                        switch (scrollTo) {
                            case 'bottom':
                                this.contentPosition = this.contentSize - this.viewportSize;
                                break;
                            default:
                                this.contentPosition = parseInt(scrollTo, 10) || 0;
                        }
                    }

                    ensureContentPosition();
                    $thumb.css(posiLabel, self.contentPosition / self.trackRatio + 'px');
                    $scrollbar.css(sizeLabel, self.trackSize + 'px');
                    $thumb.css(sizeLabel, self.thumbSize + 'px');
                    $overview.css(posiLabel, -self.contentPosition + 'px');

                    return this;
                };

                function ensureContentPosition() {
                    // if scrollbar is on, ensure the bottom of the content does not go above the bottom of the viewport
                    if (self.contentRatio <= 1 && self.contentPosition > self.contentSize - self.viewportSize) {
                        self.contentPosition = self.contentSize - self.viewportSize;
                    }
                    // if scrollbar is off, ensure the top of the content does not go below the top of the viewport
                    else if (self.contentRatio > 1 && self.contentPosition > 0) {
                        self.contentPosition = 0;
                    }
                }

                function setEvents() {

                    if(hasTouchEvents) {
                        $viewport.on('touchstart', touchstart);
                    }
                    $thumb.on('mousedown', start);
                    $scrollbar.on('mousedown', drag);

                    angular.element($window).on('resize', resize);

                    if(self.options.wheel) {
                        $element.on(wheelEvent, wheel);
                    }
                }

                function resize() {
                    self.update();
                }

                function touchstart(event) {
                    var evntObj = (event && event.originalEvent) || event || $window.event;
                    if (1 === evntObj.touches.length) {
                        event.stopPropagation();
                        start(evntObj.touches[0]);
                    }
                }

                function start(event) {
                    $body.addClass('scroll-no-select');
                    $element.addClass('scroll-no-select');

                    if (!self.options.alwaysVisible) {
                        $scrollbar.addClass('visible');
                    }
                    mousePosition = isHorizontal ? event.pageX : event.pageY;
                    self.thumbPosition = parseInt($thumb.css(posiLabel), 10) || 0;

                    if(hasTouchEvents) {
                        $document.on('touchmove', touchdrag);
                        $document.on('touchend', end);
                    }
                    $document.on('mousemove', drag);
                    $document.on('mouseup', end);
                    $thumb.on('mouseup', end);
                }

                function wheel(event) {

                    if(self.contentRatio >= 1) {
                        return;
                    }

                    if (!self.options.alwaysVisible) {
                        //cancel removing visibility if wheel event is triggered before the timeout
                        if (restoreVisibilityAfterWheel) {
                            $timeout.cancel(restoreVisibilityAfterWheel);
                        }
                        $scrollbar.addClass('visible');

                        restoreVisibilityAfterWheel = $timeout(function() {
                            $scrollbar.removeClass('visible');
                        }, 100);
                    }


                    var evntObj = (event && event.originalEvent) || event || $window.event,
                        deltaDir = self.options.axis.toUpperCase(),
                        delta = {
                          X: evntObj.deltaX,
                          Y: evntObj.deltaY
                        },
                        wheelSpeed = evntObj.deltaMode == 0 ? self.options.wheelSpeed : 1;

                    if (self.options.scrollInvert) {
                      wheelSpeed *= -1;
                    }

                    if (wheelEvent === 'mousewheel') {
                      delta.Y = -1 * evntObj.wheelDelta / 40;
                      evntObj.wheelDeltaX && ( delta.X = -1 * evntObj.wheelDeltaX / 40 );
                    }
                    delta.X *= -1 / wheelSpeed;
                    delta.Y *= -1 / wheelSpeed;

                    var wheelSpeedDelta = delta[deltaDir];

                    self.contentPosition -= wheelSpeedDelta * self.options.wheelSpeed;
                    self.contentPosition = Math.min((self.contentSize - self.viewportSize), Math.max(0, self.contentPosition));

                    $element[0].dispatchEvent(moveEvent);

                    ensureContentPosition();
                    $thumb.css(posiLabel, self.contentPosition / self.trackRatio + 'px');
                    $overview.css(posiLabel, -self.contentPosition + 'px');

                    if(self.options.wheelLock || (self.contentPosition !== (self.contentSize - self.viewportSize) && self.contentPosition !== 0)) {
                        evntObj.preventDefault();
                    }
                }

                function touchdrag(event) {
                    var evntObj = (event && event.originalEvent) || event || $window.event;
                    if (1 === evntObj.touches.length) {
                        event.preventDefault();
                        drag(evntObj.touches[0]);
                    }
                }

                function drag(event) {

                    if(self.contentRatio >= 1) {
                        return;
                    }

                    var mousePositionNew = isHorizontal ? event.pageX : event.pageY,
                        thumbPositionDelta = mousePositionNew - mousePosition;

                    if((self.options.scrollInvert && event.type === 'mousemove') ||
                        (event.type !== 'mousemove' && !self.options.scrollInvert))
                    {
                        thumbPositionDelta = mousePosition - mousePositionNew;
                    }
                    var thumbPositionNew = Math.min((self.trackSize - self.thumbSize), Math.max(0, self.thumbPosition + thumbPositionDelta));
                    self.contentPosition = thumbPositionNew * self.trackRatio;

                    $element[0].dispatchEvent(moveEvent);

                    ensureContentPosition();
                    $thumb.css(posiLabel, thumbPositionNew + 'px');
                    $overview.css(posiLabel, -self.contentPosition + 'px');
                }

                function end() {

                    $body.removeClass('scroll-no-select');
                    $element.removeClass('scroll-no-select');
                    if (!self.options.alwaysVisible) {
                        $scrollbar.removeClass('visible');
                    }

                    $document.off('mousemove', drag);
                    $document.off('mouseup', end);
                    $thumb.off('mouseup', end);
                    $document.off('touchmove', touchdrag);
                    $document.off('ontouchend', end);
                }

                this.cleanup = function() {
                    $viewport.off('touchstart', touchstart);
                    $thumb.off('mousedown', start);
                    $scrollbar.off('mousedown', drag);
                    angular.element($window).off('resize', resize);
                    $element.off(wheelEvent, wheel);
                    //ensure scrollbar isn't activated
                    self.options.alwaysVisible = true;
                    end();
                };

            },
            link: function(scope, iElement, iAttrs, controller) {
                var position = $window.getComputedStyle(iElement[0]).getPropertyValue('position');
                if (position !== 'relative' && position !== 'absolute') {
                    iElement.css('position', 'relative');
                }
                controller.initialize();
                iElement.on('$destroy', function() {
                    controller.cleanup();
                });
            }
        };
    }]);
