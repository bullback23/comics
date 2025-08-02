(function ($) {
    $.fn.boxModeling = function (options) {
        const settings = $.extend({
            boxSelector: 'box',
            handlerClass: 'resize-handler',
            minWidth: 40,
            minHeight: 40,
            resize: true,
            rotate: true,
            move: true,
        }, options);

        const boxHandlers =
            '<div class="box-handlers">' +
            '<div class="' + settings.handlerClass + ' resize left-top" style="top: -5px;left: -5px;"></div>' +
            '<div class="' + settings.handlerClass + ' resize left-mid" style="left: -5px;top: calc(50% - 5px);"></div>' +
            '<div class="' + settings.handlerClass + ' resize left-bot" style="bottom: -5px;left: -5px;"></div>' +
            '<div class="' + settings.handlerClass + ' resize center-top" style="top: -5px;left: calc(50% - 5px);"></div>' +
            '<div class="' + settings.handlerClass + ' resize center-bot" style="bottom: -5px;left: calc(50% - 5px);"></div>' +
            '<div class="' + settings.handlerClass + ' resize right-top" style="top: -5px;right: -5px;"></div>' +
            '<div class="' + settings.handlerClass + ' resize right-mid" style="right: -5px;top: calc(50% - 5px);"></div>' +
            '<div class="' + settings.handlerClass + ' resize right-bot" style="bottom: -5px;right: -5px;"></div>' +
            '<div class="' + settings.handlerClass + ' rotate" style="top: -30px;left: calc(50% - 5px);"></div>' +
            '</div>';

        return $(this).each(function () {
            const box = this;
            let initX, initY, mousePressX, mousePressY, initW, initH, initRotate;
            $(box).append(boxHandlers);

            const h = c => $(box).find('.' + settings.handlerClass + '.' + c);
            const hLeftTop = h('left-top'), hLeftMid = h('left-mid'), hLeftBot = h('left-bot');
            const hCenterTop = h('center-top'), hCenterBot = h('center-bot');
            const hRightTop = h('right-top'), hRightMid = h('right-mid'), hRightBot = h('right-bot');
            const hRotate = h('rotate');

            const getClientXY = e => {
                if (e.touches && e.touches.length) e = e.touches[0];
                return { x: e.clientX, y: e.clientY };
            };

            function repositionElement(x, y) {
                $(box).css({ left: x + 'px', top: y + 'px' });
            }

            function resize(w, h) {
                $(box).css({ width: w + 'px', height: h + 'px' });
            }

            function getRotation(el) {
                const tm = getComputedStyle(el).transform;
                if (!tm || tm === 'none') return 0;
                const v = tm.split('(')[1].split(')')[0].split(',');
                return Math.round(Math.atan2(v[1], v[0]) * (180 / Math.PI));
            }

            function rotateBox(deg) {
                $(box).css('transform', 'translate(-50%, -50%) rotate(' + deg + 'deg)');
            }

            function dragSupport(e) {
                if ($(e.target).hasClass(settings.handlerClass)) return;
                e.preventDefault();
                const { x, y } = getClientXY(e);
                initX = box.offsetLeft;
                initY = box.offsetTop;
                mousePressX = x;
                mousePressY = y;

                const moveHandler = ev => {
                    const { x, y } = getClientXY(ev);
                    repositionElement(initX + (x - mousePressX), initY + (y - mousePressY));
                };

                const upHandler = () => {
                    window.removeEventListener('mousemove', moveHandler);
                    window.removeEventListener('mouseup', upHandler);
                    window.removeEventListener('touchmove', moveHandler);
                    window.removeEventListener('touchend', upHandler);
                };

                window.addEventListener('mousemove', moveHandler);
                window.addEventListener('mouseup', upHandler);
                window.addEventListener('touchmove', moveHandler);
                window.addEventListener('touchend', upHandler);
            }

            function resizeHandler(e, left, top, xResize, yResize) {
                e.preventDefault();
                const { x, y } = getClientXY(e);
                initX = box.offsetLeft;
                initY = box.offsetTop;
                initW = box.offsetWidth;
                initH = box.offsetHeight;
                mousePressX = x;
                mousePressY = y;

                const initRotate = getRotation(box);
                const cos = Math.cos(initRotate * Math.PI / 180);
                const sin = Math.sin(initRotate * Math.PI / 180);

                const moveHandler = ev => {
                    const { x, y } = getClientXY(ev);
                    let dx = x - mousePressX;
                    let dy = y - mousePressY;
                    let rotatedX = cos * dx + sin * dy;
                    let rotatedY = cos * dy - sin * dx;

                    let newW = initW, newH = initH, newX = initX, newY = initY;
                    if (xResize) {
                        if (left) newW = initW - rotatedX;
                        else newW = initW + rotatedX;
                        newW = Math.max(settings.minWidth, newW);
                        newX += left ? initW - newW : 0;
                    }
                    if (yResize) {
                        if (top) newH = initH - rotatedY;
                        else newH = initH + rotatedY;
                        newH = Math.max(settings.minHeight, newH);
                        newY += top ? initH - newH : 0;
                    }
                    resize(newW, newH);
                    repositionElement(newX, newY);
                };

                const upHandler = () => {
                    window.removeEventListener('mousemove', moveHandler);
                    window.removeEventListener('mouseup', upHandler);
                    window.removeEventListener('touchmove', moveHandler);
                    window.removeEventListener('touchend', upHandler);
                };

                window.addEventListener('mousemove', moveHandler);
                window.addEventListener('mouseup', upHandler);
                window.addEventListener('touchmove', moveHandler);
                window.addEventListener('touchend', upHandler);
            }

            function rotate(e) {
                e.preventDefault();
                const { x, y } = getClientXY(e);
                const rect = box.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;

                const moveHandler = ev => {
                    const { x: nx, y: ny } = getClientXY(ev);
                    const angle = Math.atan2(ny - cy, nx - cx) + Math.PI / 2;
                    rotateBox(angle * 180 / Math.PI);
                };

                const upHandler = () => {
                    window.removeEventListener('mousemove', moveHandler);
                    window.removeEventListener('mouseup', upHandler);
                    window.removeEventListener('touchmove', moveHandler);
                    window.removeEventListener('touchend', upHandler);
                };

                window.addEventListener('mousemove', moveHandler);
                window.addEventListener('mouseup', upHandler);
                window.addEventListener('touchmove', moveHandler);
                window.addEventListener('touchend', upHandler);
            }

            function editingStyle(event) {
                $('.' + settings.handlerClass).hide();
                $(box).css('z-index', getComputedStyle(document.body).getPropertyValue('--zi-' + $(box).data('id')));

                if ($(event.target).hasClass(settings.boxSelector)) {
                    $(event.target).find('.' + settings.handlerClass).show();
                    $(event.target).css('z-index', '1000');
                } else if ($(event.target).hasClass(settings.handlerClass)) {
                    $(event.target).show();
                    $(event.target).siblings('.' + settings.handlerClass).show();
                    $(event.target).parents('.' + settings.boxSelector).css('z-index', '1000');
                }

                if (!settings.resize) {
                    $('.' + settings.handlerClass + '.resize').hide();
                }
                if (!settings.rotate) {
                    $('.' + settings.handlerClass + '.rotate').hide();
                }
            }

            if (settings.move) {
                box.addEventListener('mousedown', dragSupport);
                box.addEventListener('touchstart', dragSupport, { passive: false });
            }

            if (settings.resize) {
                const bind = (el, l, t, xR, yR) => {
                    el.on('mousedown', e => resizeHandler(e, l, t, xR, yR));
                    el.on('touchstart', e => resizeHandler(e, l, t, xR, yR));
                };
                bind(hLeftTop, true, true, true, true);
                bind(hLeftMid, true, false, true, false);
                bind(hLeftBot, true, false, true, true);
                bind(hCenterTop, false, true, false, true);
                bind(hCenterBot, false, false, false, true);
                bind(hRightTop, false, true, true, true);
                bind(hRightMid, false, false, true, false);
                bind(hRightBot, false, false, true, true);
            }

            if (settings.rotate) {
                hRotate.on('mousedown', rotate);
                hRotate.on('touchstart', rotate);
            }

            $(document).on('mousedown', editingStyle);
            $(document).on('touchstart', editingStyle);
        });
    };
}(jQuery));
