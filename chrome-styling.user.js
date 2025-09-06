// ==UserScript==
// @name         Smooth Adjustable Glass Toolbar (Stable Drag + No Accidental Clicks)
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Smooth draggable toolbar (pointer events + RAF), prevents accidental clicks while dragging, improved cursor handling.
// @author       You
// @match        *://*/*
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    'use strict';

    const sites = [
        { name: "YouTube", url: "https://www.youtube.com", icon: "https://www.google.com/s2/favicons?sz=64&domain=youtube.com" },
        { name: "Gmail", url: "https://mail.google.com", icon: "https://www.google.com/s2/favicons?sz=64&domain=google.com" },
        { name: "GitHub", url: "https://github.com", icon: "https://www.google.com/s2/favicons?sz=64&domain=github.com" },
        { name: "Twitter", url: "https://twitter.com", icon: "https://www.google.com/s2/favicons?sz=64&domain=twitter.com" },
        { name: "LinkedIn", url: "https://linkedin.com", icon: "https://www.google.com/s2/favicons?sz=64&domain=linkedin.com" }
    ];

    // Build toolbar
    const toolbar = document.createElement("div");
    toolbar.id = "custom-toolbar";

    // Drag handle (only this initiates dragging)
    const dragHandle = document.createElement("div");
    dragHandle.id = "toolbar-drag";
    dragHandle.title = "Drag to move";
    dragHandle.innerText = "☰";
    toolbar.appendChild(dragHandle);

    // Add buttons
    sites.forEach(site => {
        const link = document.createElement("a");
        link.href = site.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.className = "toolbar-btn";

        const img = document.createElement("img");
        img.src = site.icon;
        img.alt = site.name;

        const tooltip = document.createElement("span");
        tooltip.className = "tooltip";
        tooltip.innerText = site.name;

        link.appendChild(img);
        link.appendChild(tooltip);
        toolbar.appendChild(link);
    });

    document.body.appendChild(toolbar);

    // Styles
    GM_addStyle(`
        #custom-toolbar {
            position: fixed;
            left: 0;
            top: 0;
            transform: translate3d(0,0,0);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            padding: 14px 10px;
            border-radius: 28px;
            background: rgba(255,255,255,0.10);
            backdrop-filter: blur(12px) saturate(160%);
            -webkit-backdrop-filter: blur(12px) saturate(160%);
            box-shadow: 0 8px 30px rgba(0,0,0,0.35);
            z-index: 999999;
            user-select: none;
            touch-action: none;
        }

        #toolbar-drag {
            cursor: grab;
            color: white;
            font-size: 16px;
            width: 36px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            background: rgba(255,255,255,0.04);
            -webkit-user-select: none;
            touch-action: none;
        }

        #custom-toolbar.dragging #toolbar-drag { cursor: grabbing; }

        .toolbar-btn {
            position: relative;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255,255,255,0.09);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            box-shadow: 0 6px 18px rgba(0,0,0,0.28);
            transition: transform .18s cubic-bezier(.2,.9,.2,1), box-shadow .18s;
            touch-action: none;
        }

        .toolbar-btn::before {
            content: "";
            position: absolute;
            width: 120%;
            height: 120%;
            border-radius: 50%;
            border: 2px solid transparent;
            border-top: 2px solid rgba(255,255,255,0.72);
            border-right: 2px solid rgba(255,255,255,0.42);
            transform: rotate(0deg);
            opacity: 0;
            transition: opacity .25s;
            pointer-events: none;
        }

        .toolbar-btn:hover::before {
            opacity: 1;
            animation: spin 1s linear infinite;
        }

        .toolbar-btn:hover { transform: scale(1.12); box-shadow: 0 10px 28px rgba(0,0,0,0.36); }

        .toolbar-btn img { width: 60%; height: 60%; border-radius: 50%; z-index: 2; }

        .tooltip {
            visibility: hidden;
            opacity: 0;
            position: absolute;
            right: 56px;
            background: rgba(0,0,0,0.78);
            color: white;
            padding: 5px 10px;
            border-radius: 8px;
            font-size: 12px;
            white-space: nowrap;
            transition: opacity .18s ease, visibility .18s ease;
            pointer-events: none;
        }

        .toolbar-btn:hover .tooltip { visibility: visible; opacity: 1; }

        @keyframes spin { from{ transform: rotate(0deg);} to{ transform: rotate(360deg);} }
    `);

    // Positioning + smooth animation state
    let toolbarRect = toolbar.getBoundingClientRect();
    let current = { x: 0, y: 0 };
    let target = { x: 0, y: 0 };
    let origin = { x: 0, y: 0 };
    let dragging = false;
    let dragMovedFlag = false; // used to suppress clicks after a drag
    let rafId = null;

    // Initialize position (right middle)
    function initPosition() {
        toolbarRect = toolbar.getBoundingClientRect();
        target.x = Math.max(8, window.innerWidth - toolbarRect.width - 20);
        target.y = Math.max(8, (window.innerHeight - toolbarRect.height) / 2);
        current.x = target.x;
        current.y = target.y;
        updateTransform();
    }

    function clampTarget() {
        toolbarRect = toolbar.getBoundingClientRect();
        target.x = Math.min(Math.max(8, target.x), Math.max(8, window.innerWidth - toolbarRect.width - 8));
        target.y = Math.min(Math.max(8, target.y), Math.max(8, window.innerHeight - toolbarRect.height - 8));
    }

    function updateTransform() {
        toolbar.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
    }

    // Smooth animation loop (lerp)
    function animate() {
        const dx = target.x - current.x;
        const dy = target.y - current.y;
        // small easing factor -> smooth
        current.x += dx * 0.22;
        current.y += dy * 0.22;
        updateTransform();

        if (Math.abs(dx) + Math.abs(dy) > 0.5) {
            rafId = requestAnimationFrame(animate);
        } else {
            // snap final
            current.x = target.x;
            current.y = target.y;
            updateTransform();
            rafId = null;
        }
    }

    // Pointer drag logic (only from dragHandle)
    let pointerId = null;
    let start = { x: 0, y: 0 };
    const DRAG_THRESHOLD = 6; // px

    function startPointerDrag(e) {
        // only left button or touch
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        e.preventDefault();
        pointerId = e.pointerId;
        start.x = e.clientX;
        start.y = e.clientY;
        origin.x = target.x;
        origin.y = target.y;
        dragging = false;
        dragMovedFlag = false;

        // capture to ensure we continue receiving events
        try { dragHandle.setPointerCapture(pointerId); } catch (err) { /* ignore */ }

        window.addEventListener('pointermove', onPointerMove, { passive: false });
        window.addEventListener('pointerup', endPointerDrag);
        window.addEventListener('pointercancel', endPointerDrag);
    }

    function onPointerMove(e) {
        if (e.pointerId !== pointerId) return;
        e.preventDefault(); // avoid text selection etc.
        const dx = e.clientX - start.x;
        const dy = e.clientY - start.y;

        if (!dragging && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
            dragging = true;
            toolbar.classList.add('dragging');
            document.body.style.cursor = 'grabbing';
        }

        if (dragging) {
            target.x = origin.x + dx;
            target.y = origin.y + dy;
            clampTarget();
            if (!rafId) rafId = requestAnimationFrame(animate);
        }
    }

    function endPointerDrag(e) {
        // release capture
        try { dragHandle.releasePointerCapture && dragHandle.releasePointerCapture(pointerId); } catch (err) { }
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', endPointerDrag);
        window.removeEventListener('pointercancel', endPointerDrag);

        if (dragging) {
            dragMovedFlag = true;
            // keep the flag short-lived so a click immediately after won't navigate
            setTimeout(() => { dragMovedFlag = false; }, 120);
        }
        dragging = false;
        toolbar.classList.remove('dragging');
        document.body.style.cursor = '';
    }

    // Prevent accidental navigation after dragging (applies to all links inside toolbar)
    toolbar.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', (ev) => {
            if (dragMovedFlag) {
                ev.preventDefault();
                ev.stopImmediatePropagation();
                // small visual feedback optional:
                a.classList.add('click-suppressed');
                setTimeout(() => a.classList.remove('click-suppressed'), 200);
            }
        }, true);
    });

    // Wire drag handle
    dragHandle.addEventListener('pointerdown', startPointerDrag, { passive: false });

    // Window resize -> clamp position
    window.addEventListener('resize', () => {
        clampTarget();
        if (!rafId) rafId = requestAnimationFrame(animate);
    });

    // Initialize once inserted in DOM
    setTimeout(initPosition, 20);

    // Optional: persist position between reloads (uncomment if you want)
    /*
    function savePos() {
        try { localStorage.setItem('custom-toolbar-pos', JSON.stringify({x: target.x, y: target.y})); } catch {}
    }
    function loadPos() {
        try {
            const v = JSON.parse(localStorage.getItem('custom-toolbar-pos'));
            if (v && typeof v.x === 'number') { target.x = v.x; target.y = v.y; }
        } catch {}
    }
    loadPos();
    window.addEventListener('beforeunload', savePos);
    */

})();
