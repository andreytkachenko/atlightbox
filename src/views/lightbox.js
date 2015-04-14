/**
 * Created by tkachenko on 14.04.15.
 */

RTEApp.view('LightBoxView', ['jQuery', 'utils', '$template'],
    function ($, utils, $template) {
        var ASSETS = {
            USER_WHITE: '/images/user_white.png',
            PREVIOUS: '/images/previous.png',
            NEXT: '/images/next.png'
        };

        var tpl = $template()
            .div({class: 'at-slider'})
                .div({class: "{{ displayed ? 'displayed' : '' }}"})
                    .$Accessor('$(this).outerWidth()', 'setItemWidth($value)', 'resize')
                    .$Accessor('$(this).outerHeight()', 'setItemHeight($value)', 'resize')
                    .$SetProperty('scrollLeft', '{{ scrollLeft }}')
                    .$On('scroll', 'setScrollLeft(this.scrollLeft, $event)')
                    .$On('wheel mousewheel', 'onMouseWheel(($event.originalEvent.wheelDelta||-$event.originalEvent.deltaY));$event.preventDefault();')
                    .$On('touchstart', 'onTouchStart() === false ? $event.preventDefault():null')
                    .$On('touchend', 'onTouchEnd() === false ? $event.preventDefault():null')
                    .$On('click', 'onImageClick()')
                    .div()
                        .ul({style: 'width: {{ _width() }}px; height: {{ itemHeight - 90 }}px;'})
                            .each('item', 'items')
                                .li({class: 'item {{ data[item.meta].video && !video.playing ? "ts-video" : "" }}',
                                     style: 'left: {{item.offset * (itemWidth + itemGap) + (itemMaxWidth?itemGap/2:0)}}px; background-image: url({{ video.playing && data[item.meta].video ? "" : data[item.meta].originalSrc }}); width:{{ itemWidth }}px; height:{{itemHeight - 90}}px'})

                                    .$On('ended', '$self.video.playing = false', true)
                                    .video({src: '{{ video.playing && data[item.meta].video ? data[item.meta].video.url:"" }}', preload:'', controls:'', autoplay:'', style:'display: {{ video.playing ? "block" : "none" }};'}).end()
                                .end()
                            .end()
                        .end()
                    .end()
                .$On('click', 'close()')
                .a().end()
                .div({class:"close"})
                    .div({class:"{{ current.provider }}"}, 'slide')
                        .$Accessor('this.scrollHeight', '$value > $(this).innerHeight() ? $self.footer = 0 : $self.footer = false;$self.$apply()', 'slide', 'footer')
                        .div({style:'height: {{ $self.footer === 1 ? "auto" : "73px" }}; overflow: hidden; text-overflow: ellipsis;'})
                            .div({class: 'full-description'})
                                .div({class: 'username'})
                                    .img({class:'provider', src:'/images/{{ current.provider }}.png'}, 'current').end()
                                    .text('@{{ current.author.name }}')
                                .end()
                                .div({class: 'timestamp'}).text('{{ formatDate(current.createDate) }}', 'current').end()
                            .end()
                            .div({class: 'description'}).text('{{ current.description }}', 'slide').end()
                        .end()
                    .end()
                    .div({class: 'description-left'})
                        .$AltImage(ASSETS.USER_WHITE)
                        .img({class:'profile-picture', src: '{{ current.author.image }}'}, 'current').end()
                    .end()
                    .div()
                    .$On('click', '$self.footer = (footer === 0 ? 1 : 0)', 'footer')
                    .div({class: 'show-footer', style: 'display: {{ footer === false ? "none" : "block" }}'}, 'footer').text('{{ footer === 0 ? "read more" : "read less" }}', 'footer').end()
                    .$On('click', 'next()')
                    .a({href:"#", class:"next", title:"See next image"})
                        .img({src: ASSETS.NEXT, alt:'Next'}).end()
                    .end()
                    .$On('click', 'prev()')
                    .a({href:"#", class:"previous", title:"See previous image"})
                        .img({src: ASSETS.PREVIOUS, alt:'Previous'});


        return function ($scope) {
            return $(tpl.render($scope));
        }
    }
);