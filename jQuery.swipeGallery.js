//$.fn.swipeGallery
(function ($) {
    var methods = {
            init: function (opt) {
                $(this).each(function () {
                    var $that = $(this),
                        $imgs = $that.children('img'),
                        data = $.extend({
                            reveal: 10,
                            spacing: 10,
                            '$imgs': $imgs,
                            '$current': $imgs.first(),
                            width: 0,
                            speed: 300,
                            threshold: 30
                        }, opt);
                    data.width = $that.width() - data.reveal * 2 - data.spacing * 2;
                    $that.data('vars', data);
                    //Need to ad an onload statement.
                    styleBoilerPlate.apply($imgs);
                    if (!$that.css('position')) {
                        $that.css({position: 'relative'});
                    }
                    $that.on('mousedown', mousedown).on('mouseup', mouseup);
                });
                return this;
            },
            refresh: function (opt) {
                $(this).each(function () {
                    var $that = $(this),
                        d = $that.data('vars'),
                        $imgs = $that.find('img');
                    if (d) {
                        d.width = $that.width() - d.reveal * 2 - d.spacing * 2;
                        styleBoilerPlate.apply($imgs);
                    }
                });
                return this;
            }
        },
        isMobile = {
            Android: function() {
                return navigator.userAgent.match(/Android/i) ? true : false;
            },
            BlackBerry: function() {
                return navigator.userAgent.match(/BlackBerry/i) ? true : false;
            },
            iOS: function() {
                return navigator.userAgent.match(/iPhone|iPad|iPod/i) ? true : false;
            },
            Windows: function() {
                return navigator.userAgent.match(/IEMobile/i) ? true : false;
            },
            any: function() {
                return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Windows());
            }
        },
        getHeight = function ($imgs) {
            var height = 0;
            $imgs.each(function () {
                var h = $imgs.height();
                if (h > height) {
                    height = h;
                }
            });
            return height;
        },
        normalizeIndexes = function (index, length) {
            if (index > length) {
                return index - length;
            } else if (index < 0) {
                return index + length;
            } else {
                return index;
            }
        },
        styleBoilerPlate = function () {
            var $imgs = $(this),
                d = $imgs.parent().data('vars'),
                i = d.$current.index(),
                l = $imgs.length,
                next = normalizeIndexes(i + 1, l),
                nextNext = normalizeIndexes(i + 2, l),
                prev = normalizeIndexes(i - 1, l),
                prevPrev = normalizeIndexes(i - 2, l),
                results = l;
            $imgs.each(function (index) {
                var $this = $(this),
                    image = new Image();
                image.onload = function () {
                    var styleType = '';
                    $this.css({position: 'absolute', width: d.width});
                    if (index === i) {
                        styleType = 'current';
                    } else if (index === next) {
                        styleType = 'next';
                    } else if (index === nextNext) {
                        styleType = 'nextNext';
                    } else if (index === prev) {
                        styleType = 'prev';
                    } else if (index === prevPrev) {
                        styleType = 'prevPrev';
                    }
                    style.call($this, styleType);
                    results -= 1;
                    if (results <= 0) {
                        $this.parent().css({height: getHeight($imgs) + parseInt($this.css('paddingTop'), 10) + parseInt($this.css('paddingBottom'), 10)});
                    }
                };
                image.error = function () {
                    results -= 1;
                    if (results <= 0) {
                        $this.parent().css({height: getHeight($imgs) + parseInt($this.css('paddingTop'), 10) + parseInt($this.css('paddingBottom'), 10)});
                    }
                    $this.remove();
                };
                image.src = $this.attr('src');
            });
            style.call($imgs.eq(0), 'current');
        },
        style = function (position) {
            var $this = $(this),
                $gallery = $this.parent(),
                d = $gallery.data('vars'),
                left = getPosition.apply(this, arguments);
            $this.css({left:  left, top: parseInt($gallery.css('paddingTop'), 10)});
            return $this;
        },
        getPosition = function (position) {
            var $this = $(this),
                d = $this.parent().data('vars'),
                $prev,
                $next,
                left = 0;
            switch (position) {
                case 'next':
                    left = d.spacing * 2 + $this.width();
                    break;
                case 'nextNext':
                    $prev = $this.prev().length ? $this.prev() : d.$imgs.eq(-1);
                    left = d.spacing * 3 + $this.width() + $prev.width();
                    break;
                case 'prev':
                    left = 0 - $this.width();
                    break;
                case 'prevPrev':
                    $next = $this.next().length ? $this.next() : d.$imgs.eq(0);
                    left = 0 - d.spacing - $this.width() - $next.width();
                    break;
                case 'current':
                    left = d.spacing;
                    break;
                default:
                    return -999999;
                    break;
            }
            left += d.reveal;
            return left;
        },
        swipe = function (direction) {
            var $this = $(this),
                d = $this.data('vars'),
                $current = d.$current,
                $next = $current.next().length !== 0 ? $current.next() : d.$imgs.eq(0),
                $prev = $current.prev().length !== 0 ? $current.prev() : d.$imgs.eq(-1);

            if (direction === 'left') {
                $prev = $current;
                $current = $next;
                $next = $current.next().length !== 0 ? $current.next() : d.$imgs.eq(0);
            } else {
                $next = $current;
                $current = $prev;
                $prev = $current.prev().length !== 0 ? $current.prev() : d.$imgs.eq(-1);
            }
            $nextNext = $next.next().length !== 0 ? $next.next() : d.$imgs.eq(0);
            $prevPrev = $prev.prev().length !== 0 ? $prev.prev() : d.$imgs.eq(-1);

            $current.animate({left: getPosition.call($current, 'current')}, d.speed);
            $next.animate({left: getPosition.call($next, 'next')}, d.speed);
            $prev.animate({left: getPosition.call($prev, 'prev')}, d.speed);
            if (direction === 'left') {
                $prevPrev.animate({left: getPosition.call($prevPrev, 'prevPrev')}, d.speed);
            } else {
                $nextNext.animate({left: getPosition.call($nextNext, 'nextNext')}, d.speed);
            }

            style.call($nextNext, 'nextNext');
            style.call($prevPrev, 'prevPrev');

            d.$current = $current;
        },
        mousedown = function (e) {
            if (!isMobile.any()) {
                e.preventDefault();
            }
            var $this = $(this),
                d = $this.data('vars');
            d.mousedown = [e.pageX, e.pageY];
            $this.on('mousemove', mousemove);
            $this.on('mouseout', mouseup);
        },
        mousemove = function (e) {
            var $this = $(this),
                d = $this.data('vars'),
                $current = d.$current,
                $prev = $current.prev().length !== 0 ? $current.prev() : d.$imgs.eq(-1),
                $next = $current.next().length !== 0 ? $current.next() : d.$imgs.eq(0),
                offset = (d.mousedown[0] - e.pageX),
                threshold = checkThreshold(d.threshold, d.mousedown[0], e.pageX);
            if (threshold) {
                e.preventDefault();
            }
            $current.css({left: getPosition.call($current, 'current') - offset});
            $next.css({left: getPosition.call($next, 'next') - offset});
            $prev.css({left: getPosition.call($prev, 'prev') - offset});
        },
        mouseup = function (e) {
            var $this = $(this),
                d = $this.data('vars'),
                threshold = checkThreshold(d.threshold, d.mousedown[0], e.pageX);
            if (threshold && e.pageX <= d.mousedown[0]) {
                swipe.call(this, 'left');
            } else if (threshold) {
                swipe.call(this, 'right');
            } else {
                styleBoilerPlate.apply(d.$imgs);
            }
            $this.off('mousemove', mousemove);
            $this.off('mouseout', mouseup);
        },
        checkThreshold = function (threshold, start, end) {
            var result = start - end;
            if (result < 0) {
                result = result * -1.0;
            }
            return (result > threshold);
        };
    $.fn.swipeGallery = function (method) {
        var arg = arguments;
        $(this).each(function () {
            if (methods[method]) {
                var value = methods[method].apply( this, Array.prototype.slice.call(arg, 1));
                return value;
            } else if (typeof method === 'object' || ! method) {
                return methods.init.apply(this, arg);
            } else {
                $.error('Method ' +  method + ' does not exist on jQuery.usmFavorite');
                return false;
            }
        });
    };
}(jQuery));
$('.gallery').swipeGallery();
