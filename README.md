======================
jQuery Graphviz plugin
======================

With this plugin you can move (click and drag and drop) and remove (double click on a node or on a edge) the nodes and the edges of a graph created with <a href="http://www.graphviz.org">graphviz</a>

Dependences
===========

* <a href="http://jquery.com">jquery</a>
* <a href="http://jqueryui.com">jqueryui</a>:
 * jquery.ui.core.js
 * jquery.ui.widget.js
 * jquery.ui.mouse.js
 * jquery.ui.draggable.js

Usage
=====

* Add CSS

    <link rel="stylesheet" href="jquery.graphviz.css" />

* Add JS

    <script type="text/javascript" src="jquery.graphviz.js"></script>

* Initialize

```js
    <script type="text/javascript">
        (function($){
            $(document).ready(function () {
                $("svg").graphviz();
            });
        })(jQuery);
    </script>
```

Testing
=======

This jquery plugin has been tested on the browsers: Firefox and Google Chrome:

<iframe style="width: 100%; height: 300px" src="http://jsfiddle.net/Goin/eexfS/embedded/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>