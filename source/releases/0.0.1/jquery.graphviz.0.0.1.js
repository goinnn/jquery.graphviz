/*
 Copyright (c) 2012 by Pablo Martín <goinnn@gmail.com>

 This software is free software: you can redistribute it and/or modify
 it under the terms of the GNU Lesser General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This software is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Lesser General Public License for more details.

 You should have received a copy of the GNU Lesser General Public License
 along with this software.  If not, see <http://www.gnu.org/licenses/>.
*/
(function ($) {
    $.fn.graphviz = function () {
        var arrow = "->";
        function getTitleOfNode(nodeItem) {
            return $(nodeItem).children("title").text();
        }
        function getNode(nodeTitle) {
            var title = $("g.node title").filter(function (idx) {
                return this.textContent.trim() === nodeTitle;
            });
            return title.parent();
        }
        function getEdges(nodeTitle, io) {
            if (io && io === "input") {
                nodeTitle = nodeTitle + arrow;
            } else if (io && io === "output") {
                nodeTitle = arrow + nodeTitle;
            }
            var titles = $("g.edge title").filter(function (idx) {
                return this.textContent.indexOf(nodeTitle) !== -1;
            });
            return titles.parent();
        }
        function getEdge(nodeTitleSource, nodeTitleDestination) {
            var title = nodeTitleSource + arrow + nodeTitleDestination;
            var titles = $("g.edge title").filter(function (idx) {
                return this.textContent.indexOf(title) !== -1;
            });
            return titles.parent();
        }
        function moveTextNode(textItem, ix, iy) {
            textItem.x.baseVal.getItem(0).value = textItem.x.baseVal.getItem(0).value + ix;
            textItem.y.baseVal.getItem(0).value = textItem.y.baseVal.getItem(0).value + iy;
        }
        function moveNode(nodeTitle, ix, iy) {
            var nodeItem = getNode(nodeTitle);
            var children = $(nodeItem.children());
            var text = children.filter("text")[0];
            if (text) {
                moveTextNode(text, ix, iy);
            }
            var ellipse = children.filter("ellipse")[0];
            ellipse.cx.baseVal.value = ellipse.cx.baseVal.value + ix;
            ellipse.cy.baseVal.value = ellipse.cy.baseVal.value + iy;
        }
        function movePath(pathItem, ix, iy, io) {
            // http://stackoverflow.com/questions/5287559/calculating-control-points-for-a-shorthand-smooth-svg-path-bezier-curve
            var pathSegList = pathItem.pathSegList;
            var pathPointStart = 0;
            var pathPointEnd = pathSegList.numberOfItems - 1;
            var i, point;
            for (i = pathPointStart; i <= pathPointEnd; i = i + 1) {
                point = pathSegList.getItem(i);
                if (!(i === 0 && (io === "output" || io === undefined)) && !(i === pathPointEnd && (io === "input" || io === undefined))) {
                    point.x = point.x + ix;
                    point.y = point.y + iy;
                }
                if (point.pathSegTypeAsLetter === "C") {
                    point.x1 = point.x1 + ix;
                    point.y1 = point.y1 + iy;
                    point.x2 = point.x2 + ix;
                    point.y2 = point.y2 + iy;
                }
            }
            // This is neccesary to works in IE9
            pathItem.setAttribute("d", pathItem.getAttribute("d"));
        }
        function moveEdge(edgeItem, ix, iy, io) {
            var children = $(edgeItem).children();
            var path = children.filter("path")[0];
            var i;
            movePath(path, ix, iy, io);
            if (io === "output") {
                var polygon = children.filter("polygon")[0];
                for (i = 0; i < polygon.points.numberOfItems; i = i + 1) {
                    var point = polygon.points.getItem(i);
                    point.x = point.x + ix;
                    point.y = point.y + iy;
                }
            }
            var text = children.filter("text")[0];
            if (text) {
                moveTextNode(text, ix, iy);
            }
        }
        function moveEdges(nodeTitle, ix, iy) {
            var edgesInput = getEdges(nodeTitle, "input");
            var edgesOutput = getEdges(nodeTitle, "output");
            edgesInput.each(function (i, edge) {
                moveEdge(edge, ix, iy, "input");
            });
            edgesOutput.each(function (i, edge) {
                moveEdge(edge, ix, iy, "output");
            });

        }
        function move(nodeTitle, ix, iy) {
            moveNode(nodeTitle, ix, iy);
            moveEdges(nodeTitle, ix, iy);
        }
        function removeNode(nodeItem) {
            $(nodeItem).remove();
        }
        function removeEdge(edgeItem) {
            $(edgeItem).remove();
        }
        function remove(nodeItem) {
            var nodeTitle = getTitleOfNode(nodeItem);
            var edges = getEdges(nodeTitle);
            edges.each(function () {
                removeEdge(this);
            });
            removeNode(nodeItem);
        }
        this.each(function () {
            $(this).children().children("g").each(function () {
                if (this.className.baseVal === "node") {
                    $(this).draggable({
                        start: function (event, ui) {
                            this.originalX = event.clientX;
                            this.originalY = event.clientY;
                        },
                        stop: function (event, ui) {
                            move($(this.childNodes).filter("title")[0].textContent.trim(), (event.clientX - this.originalX), (event.clientY - this.originalY));
                        },
                        drag: function (event, ui) {
                            move($(this.childNodes).filter("title")[0].textContent.trim(), (event.clientX - this.originalX), (event.clientY - this.originalY));
                            this.originalX = event.clientX;
                            this.originalY = event.clientY;
                        },
                        cursor: "crosshair"
                    });
                    $(this).dblclick(function () {
                        remove(this);
                    });
                } else if (this.className.baseVal === "edge") {
                    $(this).draggable({
                        start: function (event, ui) {
                            this.originalX = event.clientX;
                            this.originalY = event.clientY;
                        },
                        stop: function (event, ui) {
                            moveEdge(this, (event.clientX - this.originalX), (event.clientY - this.originalY));
                        },
                        drag: function (event, ui) {
                            moveEdge(this, (event.clientX - this.originalX), (event.clientY - this.originalY));
                            this.originalX = event.clientX;
                            this.originalY = event.clientY;
                        },
                        cursor: "crosshair"
                    });
                    $(this).children("polygon").draggable({
                        start: function (event, ui) {
                            this.originalX = event.clientX;
                            this.originalY = event.clientY;
                        },
                        stop: function (event, ui) {
                            moveEdge($(this).parent(), (event.clientX - this.originalX), (event.clientY - this.originalY), "output");
                        },
                        drag: function (event, ui) {
                            moveEdge($(this).parent(), (event.clientX - this.originalX), (event.clientY - this.originalY), "output");
                            this.originalX = event.clientX;
                            this.originalY = event.clientY;
                        },
                        cursor: "crosshair"
                    });
                    $(this).dblclick(function () {
                        removeEdge(this);
                    });
                }
            });

        });
    };
})(jQuery);
