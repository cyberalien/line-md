<?php

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
$dirs = [$productionDir, './dev-svg'];
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

        li.zoomed iconify-icon {
            font-size: 192px;
            background-color: #f4f4f4;
            color: #00e;
            z-index: 2;
        }

        small {
            font: inherit;
            color: #e00;
            padding-left: 4px;
        }
    </style>
    <script src="./node_modules/iconify-icon/dist/iconify-icon.min.js"></script>
</head>
<body>
    <div id="content">
        <p>Testing animations. Hover icon to restart animation. Click icon or filename to temporarily zoom in and debug shapes.</p>
        <p><input id="search" placeholder="Filter icons..." /> <a id="show-all" href="#">Show all</a></p>
    </div>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const header = <?php echo json_encode($header); ?>;
            const icons = <?php echo json_encode($icons); ?>;

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

            function debugIcon(title, svg) {
                svg.querySelectorAll('path, rect, circle, ellipse').forEach(node => {
                    if (node.getTotalLength) {
                        let length = 'failed';
                        try {
                            length = node.getTotalLength();
                        } catch {
                        }
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

                if (item.body) {
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

                icons.forEach(item => {
                    if (item.alwaysVisible) {
                        return;
                    }

                    const file = item.file;
                    if (file.indexOf(filter) !== -1) {
                        showIcon(item);
                    } else {
                        showPlaceholder(item);
                    }
                })
            });
        });
    </script>
</body>
</html>