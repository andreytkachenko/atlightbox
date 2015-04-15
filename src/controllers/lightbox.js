/**
 * Created by tkachenko on 14.04.15.
 */

ATF.controller('LightBoxController', ['$scope', 'jQuery'],
    function ($scope, $) {
        $scope.$extend({
            data: [],
            items: [],
            current: {},
            video: {
                playing: false
            },
            displayed: false,
            scrollLeft: 0,
            itemHeight: 0,
            itemWidth: 0,
            itemGap: 100,
            offset: 0,
            currentOffset: 0,
            prevOffset: 0,
            span: 1,
            scrollingEnabled: true,
            transitionScrollingInProgress: false,
            scrollLocked: false,
            itemMaxWidth: null,
            footer: false,

            _width: function () {
                if (this.itemMaxWidth) {
                    return (this.itemGap + this.itemWidth) * 3;
                } else {
                    return (this.itemGap + this.itemWidth) * 3 - this.itemGap;
                }
            },

            formatDate: function (dateString) {
                var _date = new Date(dateString);
                var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                var year = _date.getFullYear();
                var month = months[_date.getMonth()];
                var date = _date.getDate();
                var hour = _date.getHours();
                var min = _date.getMinutes();

                hour = hour < 10 ? '0' + hour : hour;
                min = min < 10 ? '0' + min : min;

                return date + ' ' + month + ' ' + year + ' ' + hour + ':' + min;
            },

            _normalizeIndex: function (_index) {
                var length = this.data.length;
                var index = _index % length;

                if (index < 0) {
                    index = length + index;
                } else if (index >= length) {
                    index = index - length;
                }

                return index;
            },

            setItemHeight: function (value) {
                this.itemHeight = value;
            },

            setItemWidth: function (value) {
                if (this.scrollLeft <= (this.itemWidth + this.itemGap) / 2 ||
                    this.scrollLeft >= this.itemWidth + this.itemGap + (this.itemWidth + this.itemGap) / 2) {
                    this._update();
                }

                if (this.itemMaxWidth && value > this.itemMaxWidth) {
                    this.itemWidth = this.itemMaxWidth;
                    this.itemGap = 100 + (value - this.itemMaxWidth);
                } else {
                    this.itemWidth = value;
                }

                this.scrollLeft = this.itemWidth + this.itemGap;
                this.$digest();
            },

            _updateOffset: function (offset) {
                if (offset < 0 ) {
                    var minIndex = 0, minOffset = null;
                    for (var i = 0; i < 3; i++) {
                        this.items[i].offset--;

                        if (minOffset === null || this.items[i].offset < minOffset) {
                            minOffset = this.items[i].offset;
                            minIndex = i;
                        }
                    }
                    this.items[minIndex].offset = 2;
                    this.items[minIndex].meta = this._normalizeIndex(this.offset + 1);
                } else if (offset > 0 ) {
                    var maxIndex = 0, maxOffset = null;
                    for (var i = 0; i < 3; i++) {
                        this.items[i].offset++;

                        if (maxOffset === null || this.items[i].offset > maxOffset) {
                            maxOffset = this.items[i].offset;
                            maxIndex = i;
                        }
                    }
                    this.items[maxIndex].offset = 0;
                    this.items[maxIndex].meta = this._normalizeIndex(this.offset - 1);
                }
            },

            _update: function () {
                if (this.scrollLeft <= (this.itemWidth + this.itemGap) / 2) {
                    this._updateOffset(1);
                    this.scrollLeft = this.itemWidth + this.itemGap;
                    this.scrollLocked = false;
                    this.$digest();
                    return;
                }

                if (this.scrollLeft >= this.itemWidth + this.itemGap + (this.itemWidth + this.itemGap) / 2) {
                    this._updateOffset(-1);
                    this.scrollLeft = this.itemWidth + this.itemGap;
                    this.scrollLocked = false;
                    this.$digest();
                }
            },

            setScrollLeft: function (value) {
                this.scrollLeft = value;

                if (!this.scrollLocked) {
                    if (this.scrollLeft <= (this.itemWidth + this.itemGap) / 2) {
                        this.offset--;

                        this.video.playing = false;
                        this.scrollLocked = true;
                    }
                    if (this.scrollLeft >= this.itemWidth + this.itemGap + (this.itemWidth + this.itemGap) / 2) {
                        this.offset++;

                        this.video.playing = false;
                        this.scrollLocked = true;
                    }
                }

                if (!this.scrollingEnabled) {
                    return;
                }

                if (this._handler) clearTimeout(this._handler);
                this._handler = setTimeout((function() {
                    var gap = 0;
                    if (this.scrollLeft !== this.itemWidth + this.itemGap) {
                        gap = this.scrollLeft < this.itemWidth + this.itemGap ? 0 - this.scrollLeft : (this.itemWidth + this.itemGap) * 2 - this.scrollLeft;
                        if ((this.itemWidth + this.itemGap) - Math.abs(gap) < this.itemWidth / 6) {
                            var sign = gap > 0 ? -1 : 1;
                            gap = sign * ((this.itemWidth + this.itemGap) - Math.abs(gap));
                        }

                        gap = Math.round(gap);
                    }

                    if (gap) {
                        this.transitionScrolling(gap);
                    }

                    this.$digest();
                    this._handler = null;
                }).bind(this), 200);

                this.$digest();
            },

            transitionScrolling: function (gap, callback) {
                var right = (this.itemWidth + this.itemGap) * 2;
                this.targetScrollPosition = this.scrollLeft + gap;

                if (this.targetScrollPosition < 0) {
                    this.targetScrollPosition = 0;
                }

                if (this.targetScrollPosition > right) {
                    this.targetScrollPosition = right;
                }

                this.transitionScrollingInProgress = true;

                var func = (function () {
                    var gap = this.targetScrollPosition - this.scrollLeft;
                    var absGap = Math.abs(gap);

                    if (absGap < 2) {
                        this.scrollLeft = this.targetScrollPosition;
                        this.timeout = null;
                        setTimeout((function () {
                            this.transitionScrollingInProgress = false;
                            if(callback)callback();
                        }).bind(this), 0);
                    } else if (absGap < 12) {
                        this.scrollLeft += gap >> 1;
                        this.timeout = setTimeout(func, 30);
                    } else {
                        this.scrollLeft += gap >> 1;
                        this.timeout = setTimeout(func, 30);
                    }

                    this.$digest();
                }).bind(this);

                if (!this.timeout) func();

                this.$digest();
            },

            close: function () {
                this.displayed = false;
                this.$emit('light-box.close', this._normalizeIndex(this.offset), this.current);
                this.$apply();
            },

            setItems: function (data) {
                this.data = data;
            },

            next: function () {
                this._update();
                this.transitionScrolling(this.itemWidth + this.itemGap);
            },

            prev: function () {
                this._update();
                this.transitionScrolling(-(this.itemWidth + this.itemGap));
            },

            onMouseWheel: function (wheelDelta) {
                if (wheelDelta > 0) {
                    this.next();
                } else {
                    this.prev();
                }
            },

            onTouchStart: function () {
                if (this.timeout) {
                    clearTimeout(this.timeout);
                    this.timeout = null;
                }
                if (this._handler) {
                    clearTimeout(this._handler);
                    this._handler = null;
                }
                this._update();
                this.scrollingEnabled = false;
            },

            onTouchEnd: function () {
                this.scrollingEnabled = true;
                this.setScrollLeft(this.scrollLeft);
            },

            onImageClick: function () {
                if (this.current.video) {
                    this.video.playing = true;
                    this.$digest();
                } else {
                    this.close();
                }
            },

            goto: function (index) {
                this.prevOffset = 0;
                this.offset = index;
                this.current = this.data[this._normalizeIndex(index)];
                for (var i = 0; i < 3; i++) {
                    this.items[i].offset = i;
                    this.items[i].meta = this._normalizeIndex(this.offset + i - 1);
                }

                this.setScrollLeft(this.itemWidth + this.itemGap);
            },

            open: function (index) {
                this.scrollLeft = 0;
                this.displayed = true;
                this.$digest();
                this.goto(index);

                $(document).on('keydown', (function (e) {
                    if (this.displayed && (e.keyCode === 39 ||  e.keyCode === 37 || e.keyCode === 27)) {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }
                }).bind(this));

                $(document).on('keyup', (function (e) {
                    if (this.displayed && (e.keyCode === 39 ||  e.keyCode === 37 || e.keyCode === 27)) {
                        e.preventDefault();
                        e.stopPropagation();



                        if (e.keyCode === 39) {
                            this.next();
                        } else if (e.keyCode === 37) {
                            this.prev();
                        } else {
                            this.close();
                        }

                        return false;
                    }
                }).bind(this));

                this.$emit('light-box.open', this._normalizeIndex(this.offset), this.current);
            },

            initialize: function () {
                for (var i = 0; i < 3; i++) {
                    this.items.push({
                        offset: 0,
                        meta: 0
                    });
                }

                this.$watch('offset', function (offset) {
                    if (this.displayed) {
                        var index = this._normalizeIndex(offset);
                        this.current = this.data[index];
                        this.$emit('light-box.slide', index, this.current);
                    }
                });
            }
        });
        var handler = null;

        var update = function () {
            handler = null;
        };

        $(window).on('resize orientationchange', function () {
            $scope.$digest();
        });

        $scope.initialize();
    }
);