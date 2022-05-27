<?php

$iconComponent = './node_modules/iconify-icon/dist/iconify-icon.min.js';
$iconComponentExists = @file_exists($iconComponent);

$header = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">';

$icons = [];

function icon($entry) {
    global $header;

    // Get body
    $content = $entry['html'];
    $search1 = '<svg';
    $search2 = '</svg>';
    $pos1 = strpos($content, $search1);
    $pos2 = strpos($content, $search2);
    if ($pos1 === false || $pos2 === false) {
        return $entry;
    }
    $pos1a = strpos($content, '<', $pos1 + 4);
    if ($pos1a === false) {
        return $entry;
    }
    $body = substr($content, $pos1a, $pos2 - $pos1a);
    $entry['body'] = trim($body);

    // Check if header is correctly formatted
    if (strpos($content, $header) === false) {
        $entry['badHeader'] = true;
    }

    return $entry;
}

$productionDir = './svg';
$dirs = [$productionDir, './svg-dev', './temp'];
foreach ($dirs as $dir) {
    if ($handle = opendir($dir)) {
        // Find all files
        while (false !== ($entry = readdir($handle))) {
            if (substr($entry, -4) === '.svg') {
                $filename = $dir . '/' . $entry;
                $item = [
                    'file' => $entry,
                    'filename' => $filename,
                    'time' => filemtime($filename),
                    'html' => trim(file_get_contents($filename)),
                ];
                if ($dir !== $productionDir) {
                    $item['dev'] = true;
                }
                $icons[] = icon($item);
            }
        }
        closedir($handle);
    }
}

?><!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Demo</title>
    <style>
        html, body {
            font-size: 16px;
            line-height: 24px;
            background-color: #fff;
            color: #000;
        }

        p.error {
            color: #e00;
        }

        ul {
            list-style: none;
            margin: 0;
            padding: 0;
        }
        li {
            float: left;
            margin: 4px;
            height: 48px;
            box-shadow: 0 0 1px #ccc;
            position: relative;
            display: block;
            width: 400px;
        }

        li.hidden {
            display: none;
        }
        li.raw {
            color: #888;
        }
        li.bad {
            color: #a00;
        }

        li.always-visible + li {
            clear: left;
        }
        li.always-visible {
            clear: none !important;
        }

        li > span:first-child {
            line-height: 48px;
            padding-left: 64px;
        }

        span.raw-hidden {
            display: none;
        }
        span.raw-visible, iconify-icon {
            position: absolute;
            left: 0;
            top: 0;
            width: 1em;
            height: 1em;
            font-size: 48px;
            line-height: 1em;
            box-shadow: 0 0 2px #ccc;
            background-color: #f8f8f8;
            margin: 0;
        }
        span.raw-visible svg {
            width: 1em;
            height: 1em;
        }
        iconify-icon + iconify-icon {
            left: auto;
            right: 0;
            opacity: 0.3;
        }

        li.zoomed iconify-icon:first-of-type {
            font-size: 192px;
            background: url("data:image/svg+xml,%3Csvg width='8' height='8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23F4F4F4' stroke='%23E0E0E0' d='M.5.5h7v7h-7z'/%3E%3C/svg%3E") 0 0 repeat;
            color: #00e;
            z-index: 2;
        }

        small {
            font: inherit;
            color: #e00;
            padding-left: 4px;
        }
    </style>
    <script src="<?php echo $iconComponent; ?>"></script>
</head>
<body>
    <div id="content">
        <?php
            if (!$iconComponentExists) {
                echo '<p class="error">NPM dependencies are not installed, this demo will not work properly. Run `npm install`!</p>';
            } else {
                echo '<p>Testing animations. Hover icon to restart animation. Click icon or filename to temporarily zoom in and debug shapes.</p>';
            }
        ?>
        <p><input id="search" placeholder="Filter icons..." /> <a id="show-all" href="#">Show all</a></p>
    </div>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const useIconComponent = <?php echo json_encode($iconComponentExists); ?>;
            const header = <?php echo json_encode($header); ?>;
            const icons = <?php echo json_encode($icons); ?>;
            const debugRemoveAnimation = true;

            icons.sort((a, b) => {
                // Icons with bad header first
                if (a.badHeader !== b.badHeader) {
                    return a.badHeader ? -1 : 1;
                }

                // Newest icons first
                return a.time === b.time ? a.file.localeCompare(b.file) : b.time - a.time;
            });
            icons.forEach((item, index) => {
                item.index = index;
            })

            // Create list
            const list = document.createElement('ul');
            document.getElementById('content').appendChild(list);

            function copyToClipboard(code) {
                const parentNode = document.body;
                const textarea = document.createElement('textarea');
                textarea.value = code;
                textarea.style.height = 0;
                parentNode.appendChild(textarea);

                textarea.focus();
                textarea.select();

                let copied = false;
                try {
                    // Modern way
                    if (!document.execCommand || !document.execCommand('copy')) {
                        // Ancient way
                        if (window.clipboardData) {
                            window.clipboardData.setData('Text', rawCode);
                            copied = true;
                        }
                    } else {
                        copied = true;
                    }
                } catch { }

                // Remove textarea on next tick
                setTimeout(() => {
                    parentNode.removeChild(textarea);
                });
            }

            function debugIcon(title, svg) {
                svg.querySelectorAll('path, rect, circle, ellipse').forEach(node => {
                    if (node.getTotalLength) {
                        let length = 'failed';
                        try {
                            length = node.getTotalLength();
                        } catch { }
                        console.log(title, node.tagName, length, node.outerHTML);
                    }
                });
            }

            function createNode(item) {
                const node = document.createElement('li');
                node.setAttribute('data-index', item.index);
                node.setAttribute('data-file', item.file);
                node.addEventListener('click', event => {
                    event.preventDefault();
                    const className = 'zoomed';
                    if (!node.classList.contains(className)) {
                        // Zoom in
                        node.classList.add(className);
                        setTimeout(() => {
                            node.classList.remove(className);
                        }, 5000);

                        // Debug element
                        const icon = node.querySelector('span.raw svg');
                        if (icon) {
                            debugIcon(item.file, icon);
                        }
                    } else {
                        node.classList.remove(className);
                    }
                })
                return node;
            }

            function showPlaceholder(item) {
                let node = list.querySelector('li[data-index="' + item.index + '"]')
                if (!node) {
                    node = createNode(item);
                    node.classList.add('hidden');
                    list.appendChild(node);
                    return;
                }
                
                if (!node.classList.contains('hidden')) {
                    node.innerHTML = '';
                    node.classList.add('hidden');
                }
            }

            function removeAnimations(body) {
                const node = document.createElement('span');
                const shadow = node.attachShadow({
                    mode: 'open'
                });
                shadow.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' + body + '</svg>';

                const svg = shadow.querySelector('svg');
                const removeAttributes = ['stroke-dasharray', 'stroke-dashoffset'];
                
                function testChildren(node) {
                    Array.from(node.childNodes).forEach(test);
                }
                function test(node) {
                    const parent = node.parentElement;

                    function changeValue(attr, lastValue) {
                        if (removeAttributes.indexOf(attr) !== -1) {
                            // Attribute was removed
                            return;
                        }

                        const oldValue = parent.getAttribute(attr);

                        // Convert to numbers
                        const oldNum = parseFloat(oldValue);
                        const lastNum = parseFloat(lastValue);

                        // Get to maximum value
                        let newValue;
                        switch (attr) {
                            case 'stroke-dashoffset': {
                                // Set offset to 0
                                newValue = '0';
                                break;
                            }

                            case 'fill-opacity': {
                                // Set opacity to non-null value
                                newValue = lastNum ? lastValue : oldValue;
                                break;
                            }

                            // Set to non-null or final value
                            default: {
                                newValue = !lastNum && oldNum ? oldValue : lastValue;
                            }
                        }

                        // console.log('Animation debug:', attr, oldValue, lastValue, newValue);
                        parent.setAttribute(attr, newValue);
                    }

                    // Remove stroke attributes that confuse Figma
                    removeAttributes.forEach(attr => {
                        try {
                            node.removeAttribute(attr);
                        } catch { }
                    });

                    // Check tag
                    switch (node.tagName) {
                        case 'discard': 
                        case 'animateMotion': 
                        case 'animateTransform': {
                            // Not supported and should be removed
                            parent.removeChild(node);
                            return;
                        }

                        case 'set': {
                            const attr = node.getAttribute('attributeName');
                            const value = node.getAttribute('to');

                            changeValue(attr, value);
                            parent.removeChild(node);
                            return;
                        }

                        case 'animate': {
                            const attr = node.getAttribute('attributeName');
                            const valuesList = node.getAttribute('values').split(';');
                            let lastValue = valuesList.pop();
                            if (valuesList.length > 1 && valuesList[0] === lastValue) {
                                // First and last values are identical, more than 1 value.
                                // Probably repeating animation. Use second to last value
                                lastValue = valuesList.pop();
                            }
                            changeValue(attr, lastValue);
                            parent.removeChild(node);
                            return;
                        }

                        case 'path': {
                            // Fix Figma bug
                            const path = node.getAttribute('d').split('M').map(chunk => 'M' + chunk);
                            path.shift();

                            if (path.length > 1) {
                                // Split by chunks
                                if (node.hasAttribute('id')) {
                                    // Unique ID... do nothing
                                    return;
                                }

                                node.setAttribute('d', path.shift());
                                const nextNode = node.nextSibling;

                                while (path.length) {
                                    const clone = node.cloneNode(true);
                                    clone.setAttribute('d', path.shift());
                                    if (nextNode) {
                                        parent.insertBefore(clone, nextNode);
                                    } else {
                                        parent.appendChild(clone);
                                    }

                                    test(clone);
                                }
                            }
                        }
                    }

                    testChildren(node);
                }
                
                testChildren(svg);
                
                return svg.innerHTML;
            }

            function showIcon(item) {
                let node = list.querySelector('li[data-index="' + item.index + '"]')
                if (!node) {
                    node = createNode(item);
                } else if (!node.classList.contains('hidden')) {
                    // Already visible
                    return node;
                }

                node.classList.remove('hidden');
                node.innerHTML = '<span>' + item.filename + '</span>';

                if (item.body && useIconComponent) {
                    const icon = document.createElement('iconify-icon');
                    icon.setAttribute('icon', JSON.stringify({
                        body: item.body,
                        width: 24,
                        height: 24
                    }));
                    node.setAttribute('title', item.filename)
                    node.appendChild(icon);

                    icon.addEventListener('mouseover', () => {
                        icon.restartAnimation();
                    })

                    // Add copy without animation to test removeAnimations()
                    if (debugRemoveAnimation || item.dev) {
                        const body = removeAnimations(item.body);
                        const icon2 = document.createElement('iconify-icon');
                        icon2.className = 'without-animation';
                        icon2.setAttribute('icon', JSON.stringify({
                            body,
                            width: 24,
                            height: 24
                        }));
                        node.appendChild(icon2);

                        icon2.addEventListener('click', () => {
                            copyToClipboard(header + body + '</svg>')
                        });
                    }

                    // Add raw code
                    const rawIcon = document.createElement('span');
                    rawIcon.className = 'raw raw-hidden';
                    rawIcon.innerHTML = item.html;
                    node.appendChild(rawIcon);
                } else {
                    node.classList.add('raw');
                    const icon = document.createElement('span');
                    icon.className = 'raw raw-visible';
                    icon.innerHTML = item.html;
                    node.appendChild(icon);
                }

                function addComment(text) {
                    const span = node.querySelector('span');
                    const comment = document.createElement('small');
                    comment.innerText = text;
                    span.appendChild(comment);
                }

                if (item.badHeader) {
                    node.classList.add('bad');
                    addComment('(bad header)');
                }

                if (item.dev) {
                    node.classList.add('dev');
                    addComment('(dev)');
                }

                list.appendChild(node);
                return node;
            }

            // Add icons, icons in development first
            let visible = 0;
            [true, false].forEach(dev => {
                icons.forEach(item => {
                    const alwaysShow = !!(item.badHeader || item.dev);
                    if (alwaysShow !== dev) {
                        return;
                    }

                    let show = alwaysShow;
                    if (!show && visible < 10) {
                        visible ++;
                        show = true;
                    }
                    
                    if (show) {
                        // Show node
                        const node = showIcon(item);
                        if (alwaysShow) {
                            item.alwaysVisible = true;
                            node.classList.add('always-visible');
                        }
                    } else {
                        showPlaceholder(item.index);
                    }
                });
            });

            // Show all icons
            document.getElementById('show-all').addEventListener('click', event => {
                event.preventDefault();
                icons.forEach(showIcon)
            });

            // Filter icons
            let lastSearch = '';
            document.getElementById('search').addEventListener('keyup', event => {
                const filter = event.target.value.trim();
                if (lastSearch === filter || !filter.length) {
                    return;
                }
                lastSearch = filter;

                const filters = filter.split(',').map(item => item.trim()).filter(item => item.length > 0);
                if (filters.length) {
                    icons.forEach(item => {
                        if (item.alwaysVisible) {
                            return;
                        }
                        
                        const file = item.file;
                        for (let i = 0; i < filters.length; i++) {
                            if (file.indexOf(filters[i]) !== -1) {
                                showIcon(item);
                                return;
                            }
                        }

                        showPlaceholder(item);
                    });
                }
            });
        });
    </script>
</body>
</html>