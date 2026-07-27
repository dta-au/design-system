// phpcs:ignoreFile
/**
 * This file was automatically generated. Please run `npm run dist` to update.
 */
var CivicTheme = (function(exports) {
  var top = "top";
  var bottom = "bottom";
  var right = "right";
  var left = "left";
  var auto = "auto";
  var basePlacements = [top, bottom, right, left];
  var start = "start";
  var end = "end";
  var clippingParents = "clippingParents";
  var viewport = "viewport";
  var popper = "popper";
  var reference = "reference";
  var variationPlacements = /* @__PURE__ */ basePlacements.reduce(function(acc, placement) {
    return acc.concat([placement + "-" + start, placement + "-" + end]);
  }, []);
  var placements = /* @__PURE__ */ [].concat(basePlacements, [auto]).reduce(function(acc, placement) {
    return acc.concat([placement, placement + "-" + start, placement + "-" + end]);
  }, []);
  var beforeRead = "beforeRead";
  var read = "read";
  var afterRead = "afterRead";
  var beforeMain = "beforeMain";
  var main = "main";
  var afterMain = "afterMain";
  var beforeWrite = "beforeWrite";
  var write = "write";
  var afterWrite = "afterWrite";
  var modifierPhases = [beforeRead, read, afterRead, beforeMain, main, afterMain, beforeWrite, write, afterWrite];
  function getNodeName(element) {
    return element ? (element.nodeName || "").toLowerCase() : null;
  }
  function getWindow(node) {
    if (node == null) {
      return window;
    }
    if (node.toString() !== "[object Window]") {
      var ownerDocument = node.ownerDocument;
      return ownerDocument ? ownerDocument.defaultView || window : window;
    }
    return node;
  }
  function isElement(node) {
    var OwnElement = getWindow(node).Element;
    return node instanceof OwnElement || node instanceof Element;
  }
  function isHTMLElement(node) {
    var OwnElement = getWindow(node).HTMLElement;
    return node instanceof OwnElement || node instanceof HTMLElement;
  }
  function isShadowRoot(node) {
    if (typeof ShadowRoot === "undefined") {
      return false;
    }
    var OwnElement = getWindow(node).ShadowRoot;
    return node instanceof OwnElement || node instanceof ShadowRoot;
  }
  function applyStyles(_ref) {
    var state = _ref.state;
    Object.keys(state.elements).forEach(function(name) {
      var style = state.styles[name] || {};
      var attributes = state.attributes[name] || {};
      var element = state.elements[name];
      if (!isHTMLElement(element) || !getNodeName(element)) {
        return;
      }
      Object.assign(element.style, style);
      Object.keys(attributes).forEach(function(name2) {
        var value = attributes[name2];
        if (value === false) {
          element.removeAttribute(name2);
        } else {
          element.setAttribute(name2, value === true ? "" : value);
        }
      });
    });
  }
  function effect$2(_ref2) {
    var state = _ref2.state;
    var initialStyles = {
      popper: {
        position: state.options.strategy,
        left: "0",
        top: "0",
        margin: "0"
      },
      arrow: {
        position: "absolute"
      },
      reference: {}
    };
    Object.assign(state.elements.popper.style, initialStyles.popper);
    state.styles = initialStyles;
    if (state.elements.arrow) {
      Object.assign(state.elements.arrow.style, initialStyles.arrow);
    }
    return function() {
      Object.keys(state.elements).forEach(function(name) {
        var element = state.elements[name];
        var attributes = state.attributes[name] || {};
        var styleProperties = Object.keys(state.styles.hasOwnProperty(name) ? state.styles[name] : initialStyles[name]);
        var style = styleProperties.reduce(function(style2, property) {
          style2[property] = "";
          return style2;
        }, {});
        if (!isHTMLElement(element) || !getNodeName(element)) {
          return;
        }
        Object.assign(element.style, style);
        Object.keys(attributes).forEach(function(attribute) {
          element.removeAttribute(attribute);
        });
      });
    };
  }
  const applyStyles$1 = {
    name: "applyStyles",
    enabled: true,
    phase: "write",
    fn: applyStyles,
    effect: effect$2,
    requires: ["computeStyles"]
  };
  function getBasePlacement(placement) {
    return placement.split("-")[0];
  }
  var max = Math.max;
  var min = Math.min;
  var round = Math.round;
  function getUAString() {
    var uaData = navigator.userAgentData;
    if (uaData != null && uaData.brands && Array.isArray(uaData.brands)) {
      return uaData.brands.map(function(item) {
        return item.brand + "/" + item.version;
      }).join(" ");
    }
    return navigator.userAgent;
  }
  function isLayoutViewport() {
    return !/^((?!chrome|android).)*safari/i.test(getUAString());
  }
  function getBoundingClientRect(element, includeScale, isFixedStrategy) {
    if (includeScale === void 0) {
      includeScale = false;
    }
    if (isFixedStrategy === void 0) {
      isFixedStrategy = false;
    }
    var clientRect = element.getBoundingClientRect();
    var scaleX = 1;
    var scaleY = 1;
    if (includeScale && isHTMLElement(element)) {
      scaleX = element.offsetWidth > 0 ? round(clientRect.width) / element.offsetWidth || 1 : 1;
      scaleY = element.offsetHeight > 0 ? round(clientRect.height) / element.offsetHeight || 1 : 1;
    }
    var _ref = isElement(element) ? getWindow(element) : window, visualViewport = _ref.visualViewport;
    var addVisualOffsets = !isLayoutViewport() && isFixedStrategy;
    var x = (clientRect.left + (addVisualOffsets && visualViewport ? visualViewport.offsetLeft : 0)) / scaleX;
    var y = (clientRect.top + (addVisualOffsets && visualViewport ? visualViewport.offsetTop : 0)) / scaleY;
    var width = clientRect.width / scaleX;
    var height = clientRect.height / scaleY;
    return {
      width,
      height,
      top: y,
      right: x + width,
      bottom: y + height,
      left: x,
      x,
      y
    };
  }
  function getLayoutRect(element) {
    var clientRect = getBoundingClientRect(element);
    var width = element.offsetWidth;
    var height = element.offsetHeight;
    if (Math.abs(clientRect.width - width) <= 1) {
      width = clientRect.width;
    }
    if (Math.abs(clientRect.height - height) <= 1) {
      height = clientRect.height;
    }
    return {
      x: element.offsetLeft,
      y: element.offsetTop,
      width,
      height
    };
  }
  function contains(parent, child) {
    var rootNode = child.getRootNode && child.getRootNode();
    if (parent.contains(child)) {
      return true;
    } else if (rootNode && isShadowRoot(rootNode)) {
      var next = child;
      do {
        if (next && parent.isSameNode(next)) {
          return true;
        }
        next = next.parentNode || next.host;
      } while (next);
    }
    return false;
  }
  function getComputedStyle$1(element) {
    return getWindow(element).getComputedStyle(element);
  }
  function isTableElement(element) {
    return ["table", "td", "th"].indexOf(getNodeName(element)) >= 0;
  }
  function getDocumentElement(element) {
    return ((isElement(element) ? element.ownerDocument : (
      // $FlowFixMe[prop-missing]
      element.document
    )) || window.document).documentElement;
  }
  function getParentNode(element) {
    if (getNodeName(element) === "html") {
      return element;
    }
    return (
      // this is a quicker (but less type safe) way to save quite some bytes from the bundle
      // $FlowFixMe[incompatible-return]
      // $FlowFixMe[prop-missing]
      element.assignedSlot || // step into the shadow DOM of the parent of a slotted node
      element.parentNode || // DOM Element detected
      (isShadowRoot(element) ? element.host : null) || // ShadowRoot detected
      // $FlowFixMe[incompatible-call]: HTMLElement is a Node
      getDocumentElement(element)
    );
  }
  function getTrueOffsetParent(element) {
    if (!isHTMLElement(element) || // https://github.com/popperjs/popper-core/issues/837
    getComputedStyle$1(element).position === "fixed") {
      return null;
    }
    return element.offsetParent;
  }
  function getContainingBlock(element) {
    var isFirefox = /firefox/i.test(getUAString());
    var isIE = /Trident/i.test(getUAString());
    if (isIE && isHTMLElement(element)) {
      var elementCss = getComputedStyle$1(element);
      if (elementCss.position === "fixed") {
        return null;
      }
    }
    var currentNode = getParentNode(element);
    if (isShadowRoot(currentNode)) {
      currentNode = currentNode.host;
    }
    while (isHTMLElement(currentNode) && ["html", "body"].indexOf(getNodeName(currentNode)) < 0) {
      var css = getComputedStyle$1(currentNode);
      if (css.transform !== "none" || css.perspective !== "none" || css.contain === "paint" || ["transform", "perspective"].indexOf(css.willChange) !== -1 || isFirefox && css.willChange === "filter" || isFirefox && css.filter && css.filter !== "none") {
        return currentNode;
      } else {
        currentNode = currentNode.parentNode;
      }
    }
    return null;
  }
  function getOffsetParent(element) {
    var window2 = getWindow(element);
    var offsetParent = getTrueOffsetParent(element);
    while (offsetParent && isTableElement(offsetParent) && getComputedStyle$1(offsetParent).position === "static") {
      offsetParent = getTrueOffsetParent(offsetParent);
    }
    if (offsetParent && (getNodeName(offsetParent) === "html" || getNodeName(offsetParent) === "body" && getComputedStyle$1(offsetParent).position === "static")) {
      return window2;
    }
    return offsetParent || getContainingBlock(element) || window2;
  }
  function getMainAxisFromPlacement(placement) {
    return ["top", "bottom"].indexOf(placement) >= 0 ? "x" : "y";
  }
  function within(min$1, value, max$1) {
    return max(min$1, min(value, max$1));
  }
  function withinMaxClamp(min2, value, max2) {
    var v = within(min2, value, max2);
    return v > max2 ? max2 : v;
  }
  function getFreshSideObject() {
    return {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    };
  }
  function mergePaddingObject(paddingObject) {
    return Object.assign({}, getFreshSideObject(), paddingObject);
  }
  function expandToHashMap(value, keys) {
    return keys.reduce(function(hashMap, key) {
      hashMap[key] = value;
      return hashMap;
    }, {});
  }
  var toPaddingObject = function toPaddingObject2(padding, state) {
    padding = typeof padding === "function" ? padding(Object.assign({}, state.rects, {
      placement: state.placement
    })) : padding;
    return mergePaddingObject(typeof padding !== "number" ? padding : expandToHashMap(padding, basePlacements));
  };
  function arrow(_ref) {
    var _state$modifiersData$;
    var state = _ref.state, name = _ref.name, options = _ref.options;
    var arrowElement = state.elements.arrow;
    var popperOffsets2 = state.modifiersData.popperOffsets;
    var basePlacement = getBasePlacement(state.placement);
    var axis = getMainAxisFromPlacement(basePlacement);
    var isVertical = [left, right].indexOf(basePlacement) >= 0;
    var len = isVertical ? "height" : "width";
    if (!arrowElement || !popperOffsets2) {
      return;
    }
    var paddingObject = toPaddingObject(options.padding, state);
    var arrowRect = getLayoutRect(arrowElement);
    var minProp = axis === "y" ? top : left;
    var maxProp = axis === "y" ? bottom : right;
    var endDiff = state.rects.reference[len] + state.rects.reference[axis] - popperOffsets2[axis] - state.rects.popper[len];
    var startDiff = popperOffsets2[axis] - state.rects.reference[axis];
    var arrowOffsetParent = getOffsetParent(arrowElement);
    var clientSize = arrowOffsetParent ? axis === "y" ? arrowOffsetParent.clientHeight || 0 : arrowOffsetParent.clientWidth || 0 : 0;
    var centerToReference = endDiff / 2 - startDiff / 2;
    var min2 = paddingObject[minProp];
    var max2 = clientSize - arrowRect[len] - paddingObject[maxProp];
    var center = clientSize / 2 - arrowRect[len] / 2 + centerToReference;
    var offset2 = within(min2, center, max2);
    var axisProp = axis;
    state.modifiersData[name] = (_state$modifiersData$ = {}, _state$modifiersData$[axisProp] = offset2, _state$modifiersData$.centerOffset = offset2 - center, _state$modifiersData$);
  }
  function effect$1(_ref2) {
    var state = _ref2.state, options = _ref2.options;
    var _options$element = options.element, arrowElement = _options$element === void 0 ? "[data-popper-arrow]" : _options$element;
    if (arrowElement == null) {
      return;
    }
    if (typeof arrowElement === "string") {
      arrowElement = state.elements.popper.querySelector(arrowElement);
      if (!arrowElement) {
        return;
      }
    }
    if (!contains(state.elements.popper, arrowElement)) {
      return;
    }
    state.elements.arrow = arrowElement;
  }
  const arrow$1 = {
    name: "arrow",
    enabled: true,
    phase: "main",
    fn: arrow,
    effect: effect$1,
    requires: ["popperOffsets"],
    requiresIfExists: ["preventOverflow"]
  };
  function getVariation(placement) {
    return placement.split("-")[1];
  }
  var unsetSides = {
    top: "auto",
    right: "auto",
    bottom: "auto",
    left: "auto"
  };
  function roundOffsetsByDPR(_ref, win) {
    var x = _ref.x, y = _ref.y;
    var dpr = win.devicePixelRatio || 1;
    return {
      x: round(x * dpr) / dpr || 0,
      y: round(y * dpr) / dpr || 0
    };
  }
  function mapToStyles(_ref2) {
    var _Object$assign2;
    var popper2 = _ref2.popper, popperRect = _ref2.popperRect, placement = _ref2.placement, variation = _ref2.variation, offsets = _ref2.offsets, position = _ref2.position, gpuAcceleration = _ref2.gpuAcceleration, adaptive = _ref2.adaptive, roundOffsets = _ref2.roundOffsets, isFixed = _ref2.isFixed;
    var _offsets$x = offsets.x, x = _offsets$x === void 0 ? 0 : _offsets$x, _offsets$y = offsets.y, y = _offsets$y === void 0 ? 0 : _offsets$y;
    var _ref3 = typeof roundOffsets === "function" ? roundOffsets({
      x,
      y
    }) : {
      x,
      y
    };
    x = _ref3.x;
    y = _ref3.y;
    var hasX = offsets.hasOwnProperty("x");
    var hasY = offsets.hasOwnProperty("y");
    var sideX = left;
    var sideY = top;
    var win = window;
    if (adaptive) {
      var offsetParent = getOffsetParent(popper2);
      var heightProp = "clientHeight";
      var widthProp = "clientWidth";
      if (offsetParent === getWindow(popper2)) {
        offsetParent = getDocumentElement(popper2);
        if (getComputedStyle$1(offsetParent).position !== "static" && position === "absolute") {
          heightProp = "scrollHeight";
          widthProp = "scrollWidth";
        }
      }
      offsetParent = offsetParent;
      if (placement === top || (placement === left || placement === right) && variation === end) {
        sideY = bottom;
        var offsetY = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.height : (
          // $FlowFixMe[prop-missing]
          offsetParent[heightProp]
        );
        y -= offsetY - popperRect.height;
        y *= gpuAcceleration ? 1 : -1;
      }
      if (placement === left || (placement === top || placement === bottom) && variation === end) {
        sideX = right;
        var offsetX = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.width : (
          // $FlowFixMe[prop-missing]
          offsetParent[widthProp]
        );
        x -= offsetX - popperRect.width;
        x *= gpuAcceleration ? 1 : -1;
      }
    }
    var commonStyles = Object.assign({
      position
    }, adaptive && unsetSides);
    var _ref4 = roundOffsets === true ? roundOffsetsByDPR({
      x,
      y
    }, getWindow(popper2)) : {
      x,
      y
    };
    x = _ref4.x;
    y = _ref4.y;
    if (gpuAcceleration) {
      var _Object$assign;
      return Object.assign({}, commonStyles, (_Object$assign = {}, _Object$assign[sideY] = hasY ? "0" : "", _Object$assign[sideX] = hasX ? "0" : "", _Object$assign.transform = (win.devicePixelRatio || 1) <= 1 ? "translate(" + x + "px, " + y + "px)" : "translate3d(" + x + "px, " + y + "px, 0)", _Object$assign));
    }
    return Object.assign({}, commonStyles, (_Object$assign2 = {}, _Object$assign2[sideY] = hasY ? y + "px" : "", _Object$assign2[sideX] = hasX ? x + "px" : "", _Object$assign2.transform = "", _Object$assign2));
  }
  function computeStyles(_ref5) {
    var state = _ref5.state, options = _ref5.options;
    var _options$gpuAccelerat = options.gpuAcceleration, gpuAcceleration = _options$gpuAccelerat === void 0 ? true : _options$gpuAccelerat, _options$adaptive = options.adaptive, adaptive = _options$adaptive === void 0 ? true : _options$adaptive, _options$roundOffsets = options.roundOffsets, roundOffsets = _options$roundOffsets === void 0 ? true : _options$roundOffsets;
    var commonStyles = {
      placement: getBasePlacement(state.placement),
      variation: getVariation(state.placement),
      popper: state.elements.popper,
      popperRect: state.rects.popper,
      gpuAcceleration,
      isFixed: state.options.strategy === "fixed"
    };
    if (state.modifiersData.popperOffsets != null) {
      state.styles.popper = Object.assign({}, state.styles.popper, mapToStyles(Object.assign({}, commonStyles, {
        offsets: state.modifiersData.popperOffsets,
        position: state.options.strategy,
        adaptive,
        roundOffsets
      })));
    }
    if (state.modifiersData.arrow != null) {
      state.styles.arrow = Object.assign({}, state.styles.arrow, mapToStyles(Object.assign({}, commonStyles, {
        offsets: state.modifiersData.arrow,
        position: "absolute",
        adaptive: false,
        roundOffsets
      })));
    }
    state.attributes.popper = Object.assign({}, state.attributes.popper, {
      "data-popper-placement": state.placement
    });
  }
  const computeStyles$1 = {
    name: "computeStyles",
    enabled: true,
    phase: "beforeWrite",
    fn: computeStyles,
    data: {}
  };
  var passive = {
    passive: true
  };
  function effect(_ref) {
    var state = _ref.state, instance = _ref.instance, options = _ref.options;
    var _options$scroll = options.scroll, scroll = _options$scroll === void 0 ? true : _options$scroll, _options$resize = options.resize, resize = _options$resize === void 0 ? true : _options$resize;
    var window2 = getWindow(state.elements.popper);
    var scrollParents = [].concat(state.scrollParents.reference, state.scrollParents.popper);
    if (scroll) {
      scrollParents.forEach(function(scrollParent) {
        scrollParent.addEventListener("scroll", instance.update, passive);
      });
    }
    if (resize) {
      window2.addEventListener("resize", instance.update, passive);
    }
    return function() {
      if (scroll) {
        scrollParents.forEach(function(scrollParent) {
          scrollParent.removeEventListener("scroll", instance.update, passive);
        });
      }
      if (resize) {
        window2.removeEventListener("resize", instance.update, passive);
      }
    };
  }
  const eventListeners = {
    name: "eventListeners",
    enabled: true,
    phase: "write",
    fn: function fn() {
    },
    effect,
    data: {}
  };
  var hash$1 = {
    left: "right",
    right: "left",
    bottom: "top",
    top: "bottom"
  };
  function getOppositePlacement(placement) {
    return placement.replace(/left|right|bottom|top/g, function(matched) {
      return hash$1[matched];
    });
  }
  var hash = {
    start: "end",
    end: "start"
  };
  function getOppositeVariationPlacement(placement) {
    return placement.replace(/start|end/g, function(matched) {
      return hash[matched];
    });
  }
  function getWindowScroll(node) {
    var win = getWindow(node);
    var scrollLeft = win.pageXOffset;
    var scrollTop = win.pageYOffset;
    return {
      scrollLeft,
      scrollTop
    };
  }
  function getWindowScrollBarX(element) {
    return getBoundingClientRect(getDocumentElement(element)).left + getWindowScroll(element).scrollLeft;
  }
  function getViewportRect(element, strategy) {
    var win = getWindow(element);
    var html = getDocumentElement(element);
    var visualViewport = win.visualViewport;
    var width = html.clientWidth;
    var height = html.clientHeight;
    var x = 0;
    var y = 0;
    if (visualViewport) {
      width = visualViewport.width;
      height = visualViewport.height;
      var layoutViewport = isLayoutViewport();
      if (layoutViewport || !layoutViewport && strategy === "fixed") {
        x = visualViewport.offsetLeft;
        y = visualViewport.offsetTop;
      }
    }
    return {
      width,
      height,
      x: x + getWindowScrollBarX(element),
      y
    };
  }
  function getDocumentRect(element) {
    var _element$ownerDocumen;
    var html = getDocumentElement(element);
    var winScroll = getWindowScroll(element);
    var body = (_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body;
    var width = max(html.scrollWidth, html.clientWidth, body ? body.scrollWidth : 0, body ? body.clientWidth : 0);
    var height = max(html.scrollHeight, html.clientHeight, body ? body.scrollHeight : 0, body ? body.clientHeight : 0);
    var x = -winScroll.scrollLeft + getWindowScrollBarX(element);
    var y = -winScroll.scrollTop;
    if (getComputedStyle$1(body || html).direction === "rtl") {
      x += max(html.clientWidth, body ? body.clientWidth : 0) - width;
    }
    return {
      width,
      height,
      x,
      y
    };
  }
  function isScrollParent(element) {
    var _getComputedStyle = getComputedStyle$1(element), overflow = _getComputedStyle.overflow, overflowX = _getComputedStyle.overflowX, overflowY = _getComputedStyle.overflowY;
    return /auto|scroll|overlay|hidden/.test(overflow + overflowY + overflowX);
  }
  function getScrollParent(node) {
    if (["html", "body", "#document"].indexOf(getNodeName(node)) >= 0) {
      return node.ownerDocument.body;
    }
    if (isHTMLElement(node) && isScrollParent(node)) {
      return node;
    }
    return getScrollParent(getParentNode(node));
  }
  function listScrollParents(element, list) {
    var _element$ownerDocumen;
    if (list === void 0) {
      list = [];
    }
    var scrollParent = getScrollParent(element);
    var isBody = scrollParent === ((_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body);
    var win = getWindow(scrollParent);
    var target = isBody ? [win].concat(win.visualViewport || [], isScrollParent(scrollParent) ? scrollParent : []) : scrollParent;
    var updatedList = list.concat(target);
    return isBody ? updatedList : (
      // $FlowFixMe[incompatible-call]: isBody tells us target will be an HTMLElement here
      updatedList.concat(listScrollParents(getParentNode(target)))
    );
  }
  function rectToClientRect(rect) {
    return Object.assign({}, rect, {
      left: rect.x,
      top: rect.y,
      right: rect.x + rect.width,
      bottom: rect.y + rect.height
    });
  }
  function getInnerBoundingClientRect(element, strategy) {
    var rect = getBoundingClientRect(element, false, strategy === "fixed");
    rect.top = rect.top + element.clientTop;
    rect.left = rect.left + element.clientLeft;
    rect.bottom = rect.top + element.clientHeight;
    rect.right = rect.left + element.clientWidth;
    rect.width = element.clientWidth;
    rect.height = element.clientHeight;
    rect.x = rect.left;
    rect.y = rect.top;
    return rect;
  }
  function getClientRectFromMixedType(element, clippingParent, strategy) {
    return clippingParent === viewport ? rectToClientRect(getViewportRect(element, strategy)) : isElement(clippingParent) ? getInnerBoundingClientRect(clippingParent, strategy) : rectToClientRect(getDocumentRect(getDocumentElement(element)));
  }
  function getClippingParents(element) {
    var clippingParents2 = listScrollParents(getParentNode(element));
    var canEscapeClipping = ["absolute", "fixed"].indexOf(getComputedStyle$1(element).position) >= 0;
    var clipperElement = canEscapeClipping && isHTMLElement(element) ? getOffsetParent(element) : element;
    if (!isElement(clipperElement)) {
      return [];
    }
    return clippingParents2.filter(function(clippingParent) {
      return isElement(clippingParent) && contains(clippingParent, clipperElement) && getNodeName(clippingParent) !== "body";
    });
  }
  function getClippingRect(element, boundary, rootBoundary, strategy) {
    var mainClippingParents = boundary === "clippingParents" ? getClippingParents(element) : [].concat(boundary);
    var clippingParents2 = [].concat(mainClippingParents, [rootBoundary]);
    var firstClippingParent = clippingParents2[0];
    var clippingRect = clippingParents2.reduce(function(accRect, clippingParent) {
      var rect = getClientRectFromMixedType(element, clippingParent, strategy);
      accRect.top = max(rect.top, accRect.top);
      accRect.right = min(rect.right, accRect.right);
      accRect.bottom = min(rect.bottom, accRect.bottom);
      accRect.left = max(rect.left, accRect.left);
      return accRect;
    }, getClientRectFromMixedType(element, firstClippingParent, strategy));
    clippingRect.width = clippingRect.right - clippingRect.left;
    clippingRect.height = clippingRect.bottom - clippingRect.top;
    clippingRect.x = clippingRect.left;
    clippingRect.y = clippingRect.top;
    return clippingRect;
  }
  function computeOffsets(_ref) {
    var reference2 = _ref.reference, element = _ref.element, placement = _ref.placement;
    var basePlacement = placement ? getBasePlacement(placement) : null;
    var variation = placement ? getVariation(placement) : null;
    var commonX = reference2.x + reference2.width / 2 - element.width / 2;
    var commonY = reference2.y + reference2.height / 2 - element.height / 2;
    var offsets;
    switch (basePlacement) {
      case top:
        offsets = {
          x: commonX,
          y: reference2.y - element.height
        };
        break;
      case bottom:
        offsets = {
          x: commonX,
          y: reference2.y + reference2.height
        };
        break;
      case right:
        offsets = {
          x: reference2.x + reference2.width,
          y: commonY
        };
        break;
      case left:
        offsets = {
          x: reference2.x - element.width,
          y: commonY
        };
        break;
      default:
        offsets = {
          x: reference2.x,
          y: reference2.y
        };
    }
    var mainAxis = basePlacement ? getMainAxisFromPlacement(basePlacement) : null;
    if (mainAxis != null) {
      var len = mainAxis === "y" ? "height" : "width";
      switch (variation) {
        case start:
          offsets[mainAxis] = offsets[mainAxis] - (reference2[len] / 2 - element[len] / 2);
          break;
        case end:
          offsets[mainAxis] = offsets[mainAxis] + (reference2[len] / 2 - element[len] / 2);
          break;
      }
    }
    return offsets;
  }
  function detectOverflow(state, options) {
    if (options === void 0) {
      options = {};
    }
    var _options = options, _options$placement = _options.placement, placement = _options$placement === void 0 ? state.placement : _options$placement, _options$strategy = _options.strategy, strategy = _options$strategy === void 0 ? state.strategy : _options$strategy, _options$boundary = _options.boundary, boundary = _options$boundary === void 0 ? clippingParents : _options$boundary, _options$rootBoundary = _options.rootBoundary, rootBoundary = _options$rootBoundary === void 0 ? viewport : _options$rootBoundary, _options$elementConte = _options.elementContext, elementContext = _options$elementConte === void 0 ? popper : _options$elementConte, _options$altBoundary = _options.altBoundary, altBoundary = _options$altBoundary === void 0 ? false : _options$altBoundary, _options$padding = _options.padding, padding = _options$padding === void 0 ? 0 : _options$padding;
    var paddingObject = mergePaddingObject(typeof padding !== "number" ? padding : expandToHashMap(padding, basePlacements));
    var altContext = elementContext === popper ? reference : popper;
    var popperRect = state.rects.popper;
    var element = state.elements[altBoundary ? altContext : elementContext];
    var clippingClientRect = getClippingRect(isElement(element) ? element : element.contextElement || getDocumentElement(state.elements.popper), boundary, rootBoundary, strategy);
    var referenceClientRect = getBoundingClientRect(state.elements.reference);
    var popperOffsets2 = computeOffsets({
      reference: referenceClientRect,
      element: popperRect,
      placement
    });
    var popperClientRect = rectToClientRect(Object.assign({}, popperRect, popperOffsets2));
    var elementClientRect = elementContext === popper ? popperClientRect : referenceClientRect;
    var overflowOffsets = {
      top: clippingClientRect.top - elementClientRect.top + paddingObject.top,
      bottom: elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom,
      left: clippingClientRect.left - elementClientRect.left + paddingObject.left,
      right: elementClientRect.right - clippingClientRect.right + paddingObject.right
    };
    var offsetData = state.modifiersData.offset;
    if (elementContext === popper && offsetData) {
      var offset2 = offsetData[placement];
      Object.keys(overflowOffsets).forEach(function(key) {
        var multiply = [right, bottom].indexOf(key) >= 0 ? 1 : -1;
        var axis = [top, bottom].indexOf(key) >= 0 ? "y" : "x";
        overflowOffsets[key] += offset2[axis] * multiply;
      });
    }
    return overflowOffsets;
  }
  function computeAutoPlacement(state, options) {
    if (options === void 0) {
      options = {};
    }
    var _options = options, placement = _options.placement, boundary = _options.boundary, rootBoundary = _options.rootBoundary, padding = _options.padding, flipVariations = _options.flipVariations, _options$allowedAutoP = _options.allowedAutoPlacements, allowedAutoPlacements = _options$allowedAutoP === void 0 ? placements : _options$allowedAutoP;
    var variation = getVariation(placement);
    var placements$1 = variation ? flipVariations ? variationPlacements : variationPlacements.filter(function(placement2) {
      return getVariation(placement2) === variation;
    }) : basePlacements;
    var allowedPlacements = placements$1.filter(function(placement2) {
      return allowedAutoPlacements.indexOf(placement2) >= 0;
    });
    if (allowedPlacements.length === 0) {
      allowedPlacements = placements$1;
    }
    var overflows = allowedPlacements.reduce(function(acc, placement2) {
      acc[placement2] = detectOverflow(state, {
        placement: placement2,
        boundary,
        rootBoundary,
        padding
      })[getBasePlacement(placement2)];
      return acc;
    }, {});
    return Object.keys(overflows).sort(function(a, b) {
      return overflows[a] - overflows[b];
    });
  }
  function getExpandedFallbackPlacements(placement) {
    if (getBasePlacement(placement) === auto) {
      return [];
    }
    var oppositePlacement = getOppositePlacement(placement);
    return [getOppositeVariationPlacement(placement), oppositePlacement, getOppositeVariationPlacement(oppositePlacement)];
  }
  function flip(_ref) {
    var state = _ref.state, options = _ref.options, name = _ref.name;
    if (state.modifiersData[name]._skip) {
      return;
    }
    var _options$mainAxis = options.mainAxis, checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis, _options$altAxis = options.altAxis, checkAltAxis = _options$altAxis === void 0 ? true : _options$altAxis, specifiedFallbackPlacements = options.fallbackPlacements, padding = options.padding, boundary = options.boundary, rootBoundary = options.rootBoundary, altBoundary = options.altBoundary, _options$flipVariatio = options.flipVariations, flipVariations = _options$flipVariatio === void 0 ? true : _options$flipVariatio, allowedAutoPlacements = options.allowedAutoPlacements;
    var preferredPlacement = state.options.placement;
    var basePlacement = getBasePlacement(preferredPlacement);
    var isBasePlacement = basePlacement === preferredPlacement;
    var fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipVariations ? [getOppositePlacement(preferredPlacement)] : getExpandedFallbackPlacements(preferredPlacement));
    var placements2 = [preferredPlacement].concat(fallbackPlacements).reduce(function(acc, placement2) {
      return acc.concat(getBasePlacement(placement2) === auto ? computeAutoPlacement(state, {
        placement: placement2,
        boundary,
        rootBoundary,
        padding,
        flipVariations,
        allowedAutoPlacements
      }) : placement2);
    }, []);
    var referenceRect = state.rects.reference;
    var popperRect = state.rects.popper;
    var checksMap = /* @__PURE__ */ new Map();
    var makeFallbackChecks = true;
    var firstFittingPlacement = placements2[0];
    for (var i = 0; i < placements2.length; i++) {
      var placement = placements2[i];
      var _basePlacement = getBasePlacement(placement);
      var isStartVariation = getVariation(placement) === start;
      var isVertical = [top, bottom].indexOf(_basePlacement) >= 0;
      var len = isVertical ? "width" : "height";
      var overflow = detectOverflow(state, {
        placement,
        boundary,
        rootBoundary,
        altBoundary,
        padding
      });
      var mainVariationSide = isVertical ? isStartVariation ? right : left : isStartVariation ? bottom : top;
      if (referenceRect[len] > popperRect[len]) {
        mainVariationSide = getOppositePlacement(mainVariationSide);
      }
      var altVariationSide = getOppositePlacement(mainVariationSide);
      var checks = [];
      if (checkMainAxis) {
        checks.push(overflow[_basePlacement] <= 0);
      }
      if (checkAltAxis) {
        checks.push(overflow[mainVariationSide] <= 0, overflow[altVariationSide] <= 0);
      }
      if (checks.every(function(check) {
        return check;
      })) {
        firstFittingPlacement = placement;
        makeFallbackChecks = false;
        break;
      }
      checksMap.set(placement, checks);
    }
    if (makeFallbackChecks) {
      var numberOfChecks = flipVariations ? 3 : 1;
      var _loop = function _loop2(_i2) {
        var fittingPlacement = placements2.find(function(placement2) {
          var checks2 = checksMap.get(placement2);
          if (checks2) {
            return checks2.slice(0, _i2).every(function(check) {
              return check;
            });
          }
        });
        if (fittingPlacement) {
          firstFittingPlacement = fittingPlacement;
          return "break";
        }
      };
      for (var _i = numberOfChecks; _i > 0; _i--) {
        var _ret = _loop(_i);
        if (_ret === "break") break;
      }
    }
    if (state.placement !== firstFittingPlacement) {
      state.modifiersData[name]._skip = true;
      state.placement = firstFittingPlacement;
      state.reset = true;
    }
  }
  const flip$1 = {
    name: "flip",
    enabled: true,
    phase: "main",
    fn: flip,
    requiresIfExists: ["offset"],
    data: {
      _skip: false
    }
  };
  function getSideOffsets(overflow, rect, preventedOffsets) {
    if (preventedOffsets === void 0) {
      preventedOffsets = {
        x: 0,
        y: 0
      };
    }
    return {
      top: overflow.top - rect.height - preventedOffsets.y,
      right: overflow.right - rect.width + preventedOffsets.x,
      bottom: overflow.bottom - rect.height + preventedOffsets.y,
      left: overflow.left - rect.width - preventedOffsets.x
    };
  }
  function isAnySideFullyClipped(overflow) {
    return [top, right, bottom, left].some(function(side) {
      return overflow[side] >= 0;
    });
  }
  function hide(_ref) {
    var state = _ref.state, name = _ref.name;
    var referenceRect = state.rects.reference;
    var popperRect = state.rects.popper;
    var preventedOffsets = state.modifiersData.preventOverflow;
    var referenceOverflow = detectOverflow(state, {
      elementContext: "reference"
    });
    var popperAltOverflow = detectOverflow(state, {
      altBoundary: true
    });
    var referenceClippingOffsets = getSideOffsets(referenceOverflow, referenceRect);
    var popperEscapeOffsets = getSideOffsets(popperAltOverflow, popperRect, preventedOffsets);
    var isReferenceHidden = isAnySideFullyClipped(referenceClippingOffsets);
    var hasPopperEscaped = isAnySideFullyClipped(popperEscapeOffsets);
    state.modifiersData[name] = {
      referenceClippingOffsets,
      popperEscapeOffsets,
      isReferenceHidden,
      hasPopperEscaped
    };
    state.attributes.popper = Object.assign({}, state.attributes.popper, {
      "data-popper-reference-hidden": isReferenceHidden,
      "data-popper-escaped": hasPopperEscaped
    });
  }
  const hide$1 = {
    name: "hide",
    enabled: true,
    phase: "main",
    requiresIfExists: ["preventOverflow"],
    fn: hide
  };
  function distanceAndSkiddingToXY(placement, rects, offset2) {
    var basePlacement = getBasePlacement(placement);
    var invertDistance = [left, top].indexOf(basePlacement) >= 0 ? -1 : 1;
    var _ref = typeof offset2 === "function" ? offset2(Object.assign({}, rects, {
      placement
    })) : offset2, skidding = _ref[0], distance = _ref[1];
    skidding = skidding || 0;
    distance = (distance || 0) * invertDistance;
    return [left, right].indexOf(basePlacement) >= 0 ? {
      x: distance,
      y: skidding
    } : {
      x: skidding,
      y: distance
    };
  }
  function offset(_ref2) {
    var state = _ref2.state, options = _ref2.options, name = _ref2.name;
    var _options$offset = options.offset, offset2 = _options$offset === void 0 ? [0, 0] : _options$offset;
    var data = placements.reduce(function(acc, placement) {
      acc[placement] = distanceAndSkiddingToXY(placement, state.rects, offset2);
      return acc;
    }, {});
    var _data$state$placement = data[state.placement], x = _data$state$placement.x, y = _data$state$placement.y;
    if (state.modifiersData.popperOffsets != null) {
      state.modifiersData.popperOffsets.x += x;
      state.modifiersData.popperOffsets.y += y;
    }
    state.modifiersData[name] = data;
  }
  const offset$1 = {
    name: "offset",
    enabled: true,
    phase: "main",
    requires: ["popperOffsets"],
    fn: offset
  };
  function popperOffsets(_ref) {
    var state = _ref.state, name = _ref.name;
    state.modifiersData[name] = computeOffsets({
      reference: state.rects.reference,
      element: state.rects.popper,
      placement: state.placement
    });
  }
  const popperOffsets$1 = {
    name: "popperOffsets",
    enabled: true,
    phase: "read",
    fn: popperOffsets,
    data: {}
  };
  function getAltAxis(axis) {
    return axis === "x" ? "y" : "x";
  }
  function preventOverflow(_ref) {
    var state = _ref.state, options = _ref.options, name = _ref.name;
    var _options$mainAxis = options.mainAxis, checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis, _options$altAxis = options.altAxis, checkAltAxis = _options$altAxis === void 0 ? false : _options$altAxis, boundary = options.boundary, rootBoundary = options.rootBoundary, altBoundary = options.altBoundary, padding = options.padding, _options$tether = options.tether, tether = _options$tether === void 0 ? true : _options$tether, _options$tetherOffset = options.tetherOffset, tetherOffset = _options$tetherOffset === void 0 ? 0 : _options$tetherOffset;
    var overflow = detectOverflow(state, {
      boundary,
      rootBoundary,
      padding,
      altBoundary
    });
    var basePlacement = getBasePlacement(state.placement);
    var variation = getVariation(state.placement);
    var isBasePlacement = !variation;
    var mainAxis = getMainAxisFromPlacement(basePlacement);
    var altAxis = getAltAxis(mainAxis);
    var popperOffsets2 = state.modifiersData.popperOffsets;
    var referenceRect = state.rects.reference;
    var popperRect = state.rects.popper;
    var tetherOffsetValue = typeof tetherOffset === "function" ? tetherOffset(Object.assign({}, state.rects, {
      placement: state.placement
    })) : tetherOffset;
    var normalizedTetherOffsetValue = typeof tetherOffsetValue === "number" ? {
      mainAxis: tetherOffsetValue,
      altAxis: tetherOffsetValue
    } : Object.assign({
      mainAxis: 0,
      altAxis: 0
    }, tetherOffsetValue);
    var offsetModifierState = state.modifiersData.offset ? state.modifiersData.offset[state.placement] : null;
    var data = {
      x: 0,
      y: 0
    };
    if (!popperOffsets2) {
      return;
    }
    if (checkMainAxis) {
      var _offsetModifierState$;
      var mainSide = mainAxis === "y" ? top : left;
      var altSide = mainAxis === "y" ? bottom : right;
      var len = mainAxis === "y" ? "height" : "width";
      var offset2 = popperOffsets2[mainAxis];
      var min$1 = offset2 + overflow[mainSide];
      var max$1 = offset2 - overflow[altSide];
      var additive = tether ? -popperRect[len] / 2 : 0;
      var minLen = variation === start ? referenceRect[len] : popperRect[len];
      var maxLen = variation === start ? -popperRect[len] : -referenceRect[len];
      var arrowElement = state.elements.arrow;
      var arrowRect = tether && arrowElement ? getLayoutRect(arrowElement) : {
        width: 0,
        height: 0
      };
      var arrowPaddingObject = state.modifiersData["arrow#persistent"] ? state.modifiersData["arrow#persistent"].padding : getFreshSideObject();
      var arrowPaddingMin = arrowPaddingObject[mainSide];
      var arrowPaddingMax = arrowPaddingObject[altSide];
      var arrowLen = within(0, referenceRect[len], arrowRect[len]);
      var minOffset = isBasePlacement ? referenceRect[len] / 2 - additive - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis : minLen - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis;
      var maxOffset = isBasePlacement ? -referenceRect[len] / 2 + additive + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis : maxLen + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis;
      var arrowOffsetParent = state.elements.arrow && getOffsetParent(state.elements.arrow);
      var clientOffset = arrowOffsetParent ? mainAxis === "y" ? arrowOffsetParent.clientTop || 0 : arrowOffsetParent.clientLeft || 0 : 0;
      var offsetModifierValue = (_offsetModifierState$ = offsetModifierState == null ? void 0 : offsetModifierState[mainAxis]) != null ? _offsetModifierState$ : 0;
      var tetherMin = offset2 + minOffset - offsetModifierValue - clientOffset;
      var tetherMax = offset2 + maxOffset - offsetModifierValue;
      var preventedOffset = within(tether ? min(min$1, tetherMin) : min$1, offset2, tether ? max(max$1, tetherMax) : max$1);
      popperOffsets2[mainAxis] = preventedOffset;
      data[mainAxis] = preventedOffset - offset2;
    }
    if (checkAltAxis) {
      var _offsetModifierState$2;
      var _mainSide = mainAxis === "x" ? top : left;
      var _altSide = mainAxis === "x" ? bottom : right;
      var _offset = popperOffsets2[altAxis];
      var _len = altAxis === "y" ? "height" : "width";
      var _min = _offset + overflow[_mainSide];
      var _max = _offset - overflow[_altSide];
      var isOriginSide = [top, left].indexOf(basePlacement) !== -1;
      var _offsetModifierValue = (_offsetModifierState$2 = offsetModifierState == null ? void 0 : offsetModifierState[altAxis]) != null ? _offsetModifierState$2 : 0;
      var _tetherMin = isOriginSide ? _min : _offset - referenceRect[_len] - popperRect[_len] - _offsetModifierValue + normalizedTetherOffsetValue.altAxis;
      var _tetherMax = isOriginSide ? _offset + referenceRect[_len] + popperRect[_len] - _offsetModifierValue - normalizedTetherOffsetValue.altAxis : _max;
      var _preventedOffset = tether && isOriginSide ? withinMaxClamp(_tetherMin, _offset, _tetherMax) : within(tether ? _tetherMin : _min, _offset, tether ? _tetherMax : _max);
      popperOffsets2[altAxis] = _preventedOffset;
      data[altAxis] = _preventedOffset - _offset;
    }
    state.modifiersData[name] = data;
  }
  const preventOverflow$1 = {
    name: "preventOverflow",
    enabled: true,
    phase: "main",
    fn: preventOverflow,
    requiresIfExists: ["offset"]
  };
  function getHTMLElementScroll(element) {
    return {
      scrollLeft: element.scrollLeft,
      scrollTop: element.scrollTop
    };
  }
  function getNodeScroll(node) {
    if (node === getWindow(node) || !isHTMLElement(node)) {
      return getWindowScroll(node);
    } else {
      return getHTMLElementScroll(node);
    }
  }
  function isElementScaled(element) {
    var rect = element.getBoundingClientRect();
    var scaleX = round(rect.width) / element.offsetWidth || 1;
    var scaleY = round(rect.height) / element.offsetHeight || 1;
    return scaleX !== 1 || scaleY !== 1;
  }
  function getCompositeRect(elementOrVirtualElement, offsetParent, isFixed) {
    if (isFixed === void 0) {
      isFixed = false;
    }
    var isOffsetParentAnElement = isHTMLElement(offsetParent);
    var offsetParentIsScaled = isHTMLElement(offsetParent) && isElementScaled(offsetParent);
    var documentElement = getDocumentElement(offsetParent);
    var rect = getBoundingClientRect(elementOrVirtualElement, offsetParentIsScaled, isFixed);
    var scroll = {
      scrollLeft: 0,
      scrollTop: 0
    };
    var offsets = {
      x: 0,
      y: 0
    };
    if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
      if (getNodeName(offsetParent) !== "body" || // https://github.com/popperjs/popper-core/issues/1078
      isScrollParent(documentElement)) {
        scroll = getNodeScroll(offsetParent);
      }
      if (isHTMLElement(offsetParent)) {
        offsets = getBoundingClientRect(offsetParent, true);
        offsets.x += offsetParent.clientLeft;
        offsets.y += offsetParent.clientTop;
      } else if (documentElement) {
        offsets.x = getWindowScrollBarX(documentElement);
      }
    }
    return {
      x: rect.left + scroll.scrollLeft - offsets.x,
      y: rect.top + scroll.scrollTop - offsets.y,
      width: rect.width,
      height: rect.height
    };
  }
  function order(modifiers) {
    var map = /* @__PURE__ */ new Map();
    var visited = /* @__PURE__ */ new Set();
    var result = [];
    modifiers.forEach(function(modifier) {
      map.set(modifier.name, modifier);
    });
    function sort(modifier) {
      visited.add(modifier.name);
      var requires = [].concat(modifier.requires || [], modifier.requiresIfExists || []);
      requires.forEach(function(dep) {
        if (!visited.has(dep)) {
          var depModifier = map.get(dep);
          if (depModifier) {
            sort(depModifier);
          }
        }
      });
      result.push(modifier);
    }
    modifiers.forEach(function(modifier) {
      if (!visited.has(modifier.name)) {
        sort(modifier);
      }
    });
    return result;
  }
  function orderModifiers(modifiers) {
    var orderedModifiers = order(modifiers);
    return modifierPhases.reduce(function(acc, phase) {
      return acc.concat(orderedModifiers.filter(function(modifier) {
        return modifier.phase === phase;
      }));
    }, []);
  }
  function debounce(fn) {
    var pending;
    return function() {
      if (!pending) {
        pending = new Promise(function(resolve) {
          Promise.resolve().then(function() {
            pending = void 0;
            resolve(fn());
          });
        });
      }
      return pending;
    };
  }
  function mergeByName(modifiers) {
    var merged = modifiers.reduce(function(merged2, current) {
      var existing = merged2[current.name];
      merged2[current.name] = existing ? Object.assign({}, existing, current, {
        options: Object.assign({}, existing.options, current.options),
        data: Object.assign({}, existing.data, current.data)
      }) : current;
      return merged2;
    }, {});
    return Object.keys(merged).map(function(key) {
      return merged[key];
    });
  }
  var DEFAULT_OPTIONS = {
    placement: "bottom",
    modifiers: [],
    strategy: "absolute"
  };
  function areValidElements() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    return !args.some(function(element) {
      return !(element && typeof element.getBoundingClientRect === "function");
    });
  }
  function popperGenerator(generatorOptions) {
    if (generatorOptions === void 0) {
      generatorOptions = {};
    }
    var _generatorOptions = generatorOptions, _generatorOptions$def = _generatorOptions.defaultModifiers, defaultModifiers2 = _generatorOptions$def === void 0 ? [] : _generatorOptions$def, _generatorOptions$def2 = _generatorOptions.defaultOptions, defaultOptions = _generatorOptions$def2 === void 0 ? DEFAULT_OPTIONS : _generatorOptions$def2;
    return function createPopper2(reference2, popper2, options) {
      if (options === void 0) {
        options = defaultOptions;
      }
      var state = {
        placement: "bottom",
        orderedModifiers: [],
        options: Object.assign({}, DEFAULT_OPTIONS, defaultOptions),
        modifiersData: {},
        elements: {
          reference: reference2,
          popper: popper2
        },
        attributes: {},
        styles: {}
      };
      var effectCleanupFns = [];
      var isDestroyed = false;
      var instance = {
        state,
        setOptions: function setOptions(setOptionsAction) {
          var options2 = typeof setOptionsAction === "function" ? setOptionsAction(state.options) : setOptionsAction;
          cleanupModifierEffects();
          state.options = Object.assign({}, defaultOptions, state.options, options2);
          state.scrollParents = {
            reference: isElement(reference2) ? listScrollParents(reference2) : reference2.contextElement ? listScrollParents(reference2.contextElement) : [],
            popper: listScrollParents(popper2)
          };
          var orderedModifiers = orderModifiers(mergeByName([].concat(defaultModifiers2, state.options.modifiers)));
          state.orderedModifiers = orderedModifiers.filter(function(m) {
            return m.enabled;
          });
          runModifierEffects();
          return instance.update();
        },
        // Sync update – it will always be executed, even if not necessary. This
        // is useful for low frequency updates where sync behavior simplifies the
        // logic.
        // For high frequency updates (e.g. `resize` and `scroll` events), always
        // prefer the async Popper#update method
        forceUpdate: function forceUpdate() {
          if (isDestroyed) {
            return;
          }
          var _state$elements = state.elements, reference3 = _state$elements.reference, popper3 = _state$elements.popper;
          if (!areValidElements(reference3, popper3)) {
            return;
          }
          state.rects = {
            reference: getCompositeRect(reference3, getOffsetParent(popper3), state.options.strategy === "fixed"),
            popper: getLayoutRect(popper3)
          };
          state.reset = false;
          state.placement = state.options.placement;
          state.orderedModifiers.forEach(function(modifier) {
            return state.modifiersData[modifier.name] = Object.assign({}, modifier.data);
          });
          for (var index = 0; index < state.orderedModifiers.length; index++) {
            if (state.reset === true) {
              state.reset = false;
              index = -1;
              continue;
            }
            var _state$orderedModifie = state.orderedModifiers[index], fn = _state$orderedModifie.fn, _state$orderedModifie2 = _state$orderedModifie.options, _options = _state$orderedModifie2 === void 0 ? {} : _state$orderedModifie2, name = _state$orderedModifie.name;
            if (typeof fn === "function") {
              state = fn({
                state,
                options: _options,
                name,
                instance
              }) || state;
            }
          }
        },
        // Async and optimistically optimized update – it will not be executed if
        // not necessary (debounced to run at most once-per-tick)
        update: debounce(function() {
          return new Promise(function(resolve) {
            instance.forceUpdate();
            resolve(state);
          });
        }),
        destroy: function destroy() {
          cleanupModifierEffects();
          isDestroyed = true;
        }
      };
      if (!areValidElements(reference2, popper2)) {
        return instance;
      }
      instance.setOptions(options).then(function(state2) {
        if (!isDestroyed && options.onFirstUpdate) {
          options.onFirstUpdate(state2);
        }
      });
      function runModifierEffects() {
        state.orderedModifiers.forEach(function(_ref) {
          var name = _ref.name, _ref$options = _ref.options, options2 = _ref$options === void 0 ? {} : _ref$options, effect2 = _ref.effect;
          if (typeof effect2 === "function") {
            var cleanupFn = effect2({
              state,
              name,
              instance,
              options: options2
            });
            var noopFn = function noopFn2() {
            };
            effectCleanupFns.push(cleanupFn || noopFn);
          }
        });
      }
      function cleanupModifierEffects() {
        effectCleanupFns.forEach(function(fn) {
          return fn();
        });
        effectCleanupFns = [];
      }
      return instance;
    };
  }
  var createPopper$2 = /* @__PURE__ */ popperGenerator();
  var defaultModifiers$1 = [eventListeners, popperOffsets$1, computeStyles$1, applyStyles$1];
  var createPopper$1 = /* @__PURE__ */ popperGenerator({
    defaultModifiers: defaultModifiers$1
  });
  var defaultModifiers = [eventListeners, popperOffsets$1, computeStyles$1, applyStyles$1, offset$1, flip$1, preventOverflow$1, arrow$1, hide$1];
  var createPopper = /* @__PURE__ */ popperGenerator({
    defaultModifiers
  });
  const Popper = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    afterMain,
    afterRead,
    afterWrite,
    applyStyles: applyStyles$1,
    arrow: arrow$1,
    auto,
    basePlacements,
    beforeMain,
    beforeRead,
    beforeWrite,
    bottom,
    clippingParents,
    computeStyles: computeStyles$1,
    createPopper,
    createPopperBase: createPopper$2,
    createPopperLite: createPopper$1,
    detectOverflow,
    end,
    eventListeners,
    flip: flip$1,
    hide: hide$1,
    left,
    main,
    modifierPhases,
    offset: offset$1,
    placements,
    popper,
    popperGenerator,
    popperOffsets: popperOffsets$1,
    preventOverflow: preventOverflow$1,
    read,
    reference,
    right,
    start,
    top,
    variationPlacements,
    viewport,
    write
  }, Symbol.toStringTag, { value: "Module" }));
  function init0() {
    function CivicThemeCollapsible(el) {
      if (el.getAttribute("data-collapsible") === "true" || this.el) {
        return;
      }
      const trigger = this.getTrigger(el);
      const panel = this.getPanel(el);
      if (!trigger || !panel) {
        return;
      }
      this.el = el;
      this.trigger = trigger;
      this.panel = panel;
      this.collapsed = this.isCollapsed(el);
      this.duration = this.el.hasAttribute("data-collapsible-duration") ? this.el.getAttribute("data-collapsible-duration") : 500;
      this.group = this.el.hasAttribute("data-collapsible-group") ? this.el.getAttribute("data-collapsible-group") : null;
      this.icon = '<svg class="ct-icon" width="24" height="24" aria-hidden="true" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.6072 8.38619C18.3583 8.13884 18.0217 8 17.6709 8C17.32 8 16.9834 8.13884 16.7346 8.38619L11.9668 13.0876L7.26542 8.38619C7.01659 8.13884 6.67999 8 6.32913 8C5.97827 8 5.64167 8.13884 5.39284 8.38619C5.26836 8.50965 5.16956 8.65654 5.10214 8.81838C5.03471 8.98022 5 9.1538 5 9.32912C5 9.50445 5.03471 9.67803 5.10214 9.83987C5.16956 10.0017 5.26836 10.1486 5.39284 10.2721L11.0239 15.9031C11.1473 16.0276 11.2942 16.1264 11.4561 16.1938C11.6179 16.2612 11.7915 16.2959 11.9668 16.2959C12.1421 16.2959 12.3157 16.2612 12.4775 16.1938C12.6394 16.1264 12.7863 16.0276 12.9097 15.9031L18.6072 10.2721C18.7316 10.1486 18.8304 10.0017 18.8979 9.83987C18.9653 9.67803 19 9.50445 19 9.32912C19 9.1538 18.9653 8.98022 18.8979 8.81838C18.8304 8.65654 18.7316 8.50965 18.6072 8.38619Z" /></svg>';
      this.iconGroupEnabled = this.el.hasAttribute("data-collapsible-icon-group");
      this.trigger.setAttribute("data-collapsible-trigger", "");
      this.panel.setAttribute("data-collapsible-panel", "");
      if (!this.panel.hasAttribute("data-collapsible-trigger-no-icon") && !this.trigger.querySelector(".ct-collapsible__icon")) {
        const iconEl = this.htmlToElement(this.icon);
        iconEl.classList.add("ct-collapsible__icon");
        if (this.iconGroupEnabled) {
          const wrapText = (text2) => `<span class="ct-text-icon__text">${text2}</span>`;
          const text = this.trigger.innerText.trim();
          const lastWordIndex = text.lastIndexOf(" ");
          const lastWord = lastWordIndex >= 0 ? text.substring(lastWordIndex + 1) : text;
          const firstWords = lastWordIndex >= 0 ? text.substring(0, lastWordIndex + 1) : "";
          const iconGroupEl = this.htmlToElement(`<span class="ct-text-icon__group">${wrapText(lastWord)} </span>`);
          iconGroupEl.append(iconEl);
          this.trigger.innerHTML = wrapText(firstWords);
          this.trigger.append(iconGroupEl);
        } else {
          this.trigger.append(iconEl);
        }
      }
      this.trigger.addEventListener("click", this.clickEvent.bind(this));
      this.trigger.addEventListener("keydown", this.keydownEvent.bind(this.trigger));
      this.trigger.addEventListener("focusout", this.focusoutEvent.bind(this));
      this.panel.addEventListener("click", (e) => e.stopPropagation());
      this.panel.addEventListener("focusout", this.focusoutEvent.bind(this));
      if (this.collapsed) {
        this.setCollapsedState.call(this);
      } else {
        this.setExpandedState.call(this);
      }
      this.el.addEventListener("ct.collapsible.collapse", (evt) => {
        const animate = evt.detail && evt.detail.animate;
        const isCloseAllEvent = evt.detail && evt.detail.closeAll;
        if (isCloseAllEvent && this.isGroupsEnabled || !isCloseAllEvent) {
          this.collapse(animate, evt);
        }
      });
      this.el.addEventListener("ct.collapsible.expand", () => {
        this.expand(true);
      });
      this.el.addEventListener("ct.collapsible.toggle", () => {
        if (this.isCollapsed(this.el)) {
          this.el.dispatchEvent(new CustomEvent("ct.collapsible.expand", { bubbles: true }));
        } else {
          this.el.dispatchEvent(new CustomEvent("ct.collapsible.collapse", { bubbles: true, detail: { animate: true } }));
        }
      });
      document.addEventListener("keydown", CivicThemeCollapsible.prototype.keydownEvent);
      document.addEventListener("click", CivicThemeCollapsible.prototype.collapseAllGroups);
      this.isGroupsEnabled = true;
      this.groupEnabledBreakpoint = this.el.getAttribute("data-collapsible-group-enabled-breakpoint");
      if (this.groupEnabledBreakpoint) {
        window.addEventListener("ct-responsive", (evt) => {
          const evaluationResult = evt.detail.evaluate(this.groupEnabledBreakpoint, () => {
            this.isGroupsEnabled = true;
          });
          if (evaluationResult === false) {
            this.isGroupsEnabled = false;
          }
        }, false);
      }
      this.el.setAttribute("data-collapsible", "true");
    }
    CivicThemeCollapsible.prototype.destroy = function(el) {
      if (el.getAttribute("data-collapsible") !== "true" || !this.el) {
        return;
      }
      const trigger = el.querySelector("[data-collapsible-trigger]") || el.firstElementChild;
      const panel = el.querySelector("[data-collapsible-panel]") || el.firstElementChild.nextElementSibling;
      if (!trigger || !panel) {
        return;
      }
      this.el = el;
      this.trigger = trigger;
      this.panel = panel;
      this.trigger.outerHTML = this.trigger.outerHTML;
      this.panel.style.height = "";
      this.panel.style.overflow = "";
      this.trigger.removeAttribute("aria-expanded");
      this.panel.removeAttribute("aria-hidden");
      this.el.setAttribute("data-collapsible", "");
      delete this.el;
      delete this.trigger;
      delete this.panel;
      delete this.collapsed;
      delete this.duration;
      delete this.group;
    };
    CivicThemeCollapsible.prototype.clickEvent = function(e) {
      e.stopPropagation();
      e.preventDefault();
      e.stopImmediatePropagation();
      if (this.group) {
        this.closeGroup(this.group);
      }
      if (this.collapsed) {
        this.el.dispatchEvent(new CustomEvent("ct.collapsible.expand", { bubbles: true }));
      } else {
        this.el.dispatchEvent(new CustomEvent("ct.collapsible.collapse", { bubbles: true, detail: { animate: true } }));
      }
    };
    CivicThemeCollapsible.prototype.focusoutEvent = function(e) {
      if (e.relatedTarget && !this.panel.contains(e.relatedTarget) && !this.trigger.contains(e.relatedTarget) && this.group && this.isGroupsEnabled) {
        e.target.dispatchEvent(new CustomEvent("ct.collapsible.collapse", { bubbles: true }));
      }
    };
    CivicThemeCollapsible.prototype.keydownEvent = function(e) {
      if (!/(32|27|37|38|39|40)/.test(e.which) || e.altKey || e.ctrlKey || e.metaKey || /input|textarea|select|object/i.test(e.target.tagName)) {
        return;
      }
      e.stopPropagation();
      if (e.which === 27) {
        CivicThemeCollapsible.prototype.collapseAllGroups();
        return;
      }
      if (this !== document) {
        if ((e.which === 38 || e.which === 40 || e.which === 32) && !e.shiftKey) {
          e.preventDefault();
        }
        if ((e.which === 38 || e.which === 37) && !e.shiftKey) {
          this.dispatchEvent(new CustomEvent("ct.collapsible.collapse", { bubbles: true, detail: { animate: true, keydown: true } }));
          return;
        }
        if ((e.which === 40 || e.which === 39) && !e.shiftKey) {
          this.dispatchEvent(new CustomEvent("ct.collapsible.expand", { bubbles: true }));
        }
        if (e.which === 32) {
          e.target.click();
        }
      }
    };
    CivicThemeCollapsible.prototype.closeGroup = function(group) {
      if (this.isGroupsEnabled) {
        const currentEl = this.el;
        document.querySelectorAll("[data-collapsible-group=" + group + "]:not([data-collapsible-collapsed])").forEach((el) => {
          if (el !== currentEl) {
            el.dispatchEvent(new CustomEvent("ct.collapsible.collapse", { bubbles: true, detail: { closeGroup: true } }));
          }
        });
      }
    };
    CivicThemeCollapsible.prototype.collapseAllGroups = function() {
      document.querySelectorAll("[data-collapsible-group]").forEach((el) => {
        el.dispatchEvent(new CustomEvent("ct.collapsible.collapse", { bubbles: true, detail: { closeAll: true } }));
      });
    };
    CivicThemeCollapsible.prototype.setCollapsedState = function() {
      this.panel.style.transition = "";
      this.panel.style.overflow = "hidden";
      this.panel.style.display = "none";
      this.el.setAttribute("data-collapsible-collapsed", "");
      this.trigger.setAttribute("data-collapsible-trigger-collapsed", "");
      this.panel.setAttribute("aria-hidden", true);
      this.trigger.setAttribute("aria-expanded", false);
      this.collapsed = true;
    };
    CivicThemeCollapsible.prototype.collapse = function(animate, evt) {
      const t = this;
      if (this.isCollapsed(t.el)) {
        return;
      }
      if (evt && evt.target) {
        if (evt.detail && evt.detail.keydown && !evt.detail.closeGroup) {
          if (evt.target.closest('[data-collapsible="true"]') !== t.el) {
            return;
          }
        } else if (evt.currentTarget !== t.el || evt.target !== t.el) {
          return;
        }
      }
      const onTransitionEnd = function() {
        t.panel.removeEventListener("transitionend", onTransitionEnd);
        t.el.removeAttribute("data-collapsible-collapsing");
        t.trigger.removeAttribute("data-collapsible-trigger-collapsing");
        t.setCollapsedState.call(t);
      };
      if (animate && t.duration > 0) {
        const transition = t.panel.style.transition || `height ${t.duration}ms ease-out`;
        t.panel.style.transition = "";
        t.panel.style.overflow = "hidden";
        const h = t.panel.scrollHeight;
        requestAnimationFrame(() => {
          t.panel.style.transition = transition;
          t.panel.style.height = `${h}px`;
          t.el.setAttribute("data-collapsible-collapsing", "");
          t.trigger.setAttribute("data-collapsible-trigger-collapsing", "");
          requestAnimationFrame(() => {
            t.panel.addEventListener("transitionend", onTransitionEnd);
            t.panel.style.height = "0px";
          });
        });
      } else {
        const transition = t.panel.style;
        t.setCollapsedState.call(t);
        t.panel.style.transition = transition;
      }
    };
    CivicThemeCollapsible.prototype.setExpandedState = function() {
      this.panel.style.transition = "";
      this.panel.style.overflow = "";
      this.panel.style.height = "";
      this.panel.style.display = "";
      this.panel.setAttribute("aria-hidden", false);
      this.trigger.setAttribute("aria-expanded", true);
      this.el.removeAttribute("data-collapsible-collapsed");
      this.trigger.removeAttribute("data-collapsible-trigger-collapsed");
      this.collapsed = false;
    };
    CivicThemeCollapsible.prototype.expand = function(animate) {
      const t = this;
      if (!this.isCollapsed(t.el)) {
        return;
      }
      const onTransitionEnd = function() {
        t.panel.removeEventListener("transitionend", onTransitionEnd);
        t.setExpandedState.call(t);
        t.el.removeAttribute("data-collapsible-collapsing");
        t.trigger.removeAttribute("data-collapsible-trigger-collapsing");
      };
      if (animate && t.duration > 0) {
        t.panel.style.display = "";
        t.panel.style.height = "";
        const h = t.panel.scrollHeight;
        t.el.setAttribute("data-collapsible-collapsing", "");
        t.trigger.setAttribute("data-collapsible-trigger-collapsing", "");
        t.panel.style.height = "0px";
        requestAnimationFrame(() => {
          t.panel.style.transition = t.panel.style.transition || `height ${t.duration}ms ease-out`;
          requestAnimationFrame(() => {
            t.panel.addEventListener("transitionend", onTransitionEnd);
            t.panel.style.height = `${h}px`;
          });
        });
      } else {
        const transition = t.panel.style;
        t.setExpandedState.call(t);
        t.panel.style.transition = transition;
      }
    };
    CivicThemeCollapsible.prototype.isCollapsed = function(el) {
      return el.hasAttribute("data-collapsible-collapsed");
    };
    CivicThemeCollapsible.prototype.getTrigger = function(el) {
      return el.querySelector("[data-collapsible-trigger]") || el.firstElementChild || null;
    };
    CivicThemeCollapsible.prototype.getPanel = function(el) {
      let panelEl = el.querySelector("[data-collapsible-panel]");
      if (!panelEl) {
        const triggerEl = this.getTrigger(el);
        if (triggerEl) {
          panelEl = triggerEl.nextElementSibling;
        }
      }
      return panelEl;
    };
    CivicThemeCollapsible.prototype.htmlToElement = function(html) {
      const template = document.createElement("template");
      template.innerHTML = html.trim();
      return template.content.firstChild;
    };
    document.querySelectorAll("[data-collapsible]").forEach((el) => {
      const breakpointExpr = el.getAttribute("data-responsive");
      if (breakpointExpr) {
        window.addEventListener("ct-responsive", (evt) => {
          evt.detail.evaluate(breakpointExpr, CivicThemeCollapsible, el);
        }, false);
        return;
      }
      new CivicThemeCollapsible(el);
    });
  }
  function init1() {
    function CivicThemeFlyout(el) {
      if (el.getAttribute("data-flyout") === "true" || this.el) {
        return;
      }
      const openTriggers = document.querySelectorAll("[data-flyout-open-trigger]");
      if (!openTriggers.length) {
        return;
      }
      this.openTrigger = this.findOpenTrigger(openTriggers, el);
      if (!this.openTrigger) {
        return;
      }
      this.el = el;
      this.closeTriggers = Array.from(this.el.querySelectorAll("[data-flyout-close-trigger]"));
      this.closeTriggers = this.closeTriggers.filter((item) => item.closest("[data-flyout]") === this.el);
      this.closeAllTriggers = Array.from(this.el.querySelectorAll("[data-flyout-close-all-trigger]"));
      this.closeAllTriggers = this.closeAllTriggers.filter((item) => item.closest("[data-flyout]") === this.el);
      this.panel = this.el.querySelector("[data-flyout-panel]");
      this.el.expanded = this.el.hasAttribute("data-flyout-expanded");
      this.duration = this.el.hasAttribute("data-flyout-duration") ? parseInt(this.el.getAttribute("data-flyout-duration"), 10) : 500;
      this.focusTargets = this.el.hasAttribute("data-flyout-focus") ? this.el.getAttribute("data-flyout-focus").split(",").filter((i) => i) : [];
      if (this.openTrigger) {
        this.openTrigger.addEventListener("click", this.clickEvent.bind(this));
        this.openTrigger.expand = true;
      }
      if (this.closeTriggers) {
        this.closeTriggers.forEach((trigger) => {
          trigger.addEventListener("click", this.clickEvent.bind(this));
          trigger.expand = false;
        });
      }
      if (this.closeAllTriggers) {
        this.closeAllTriggers.forEach((trigger) => {
          trigger.addEventListener("click", this.closeAllTriggerClickEvent.bind(this));
        });
      }
      document.addEventListener("keydown", (event) => {
        if (event.key === "Tab") {
          const flyoutElements = document.querySelectorAll("[data-flyout]");
          flyoutElements.forEach((flyout) => {
            const focusableElements = flyout.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            const firstFocusable = focusableElements[0];
            const lastFocusable = focusableElements[focusableElements.length - 1];
            if (document.activeElement === lastFocusable && !event.shiftKey) {
              event.preventDefault();
              firstFocusable.focus();
            } else if (document.activeElement === firstFocusable && event.shiftKey) {
              event.preventDefault();
              lastFocusable.focus();
            }
          });
        }
      });
      this.el.setAttribute("data-flyout", "true");
    }
    CivicThemeFlyout.prototype.findOpenTrigger = function(triggers, el) {
      for (const i in triggers) {
        if (Object.prototype.hasOwnProperty.call(triggers, i)) {
          if (triggers[i].hasAttribute("data-flyout-target")) {
            const found = document.querySelector(triggers[i].getAttribute("data-flyout-target"));
            if (found === el) {
              return triggers[i];
            }
          } else if (triggers[i].nextElementSibling && triggers[i].nextElementSibling.hasAttribute("data-flyout")) {
            const found = triggers[i].nextElementSibling;
            if (found === el) {
              return triggers[i];
            }
          }
        }
      }
      return null;
    };
    CivicThemeFlyout.prototype.clickEvent = function(e) {
      e.stopPropagation();
      if (e.target.hasAttribute("data-flyout-trigger-allow-default") !== true) {
        e.preventDefault();
      }
      return e.currentTarget.expand ? this.expand() : this.collapse();
    };
    CivicThemeFlyout.prototype.closeAllTriggerClickEvent = function(e) {
      e.stopPropagation();
      if (e.target.hasAttribute("data-flyout-trigger-allow-default") !== true) {
        e.preventDefault();
      }
      document.querySelectorAll("[data-flyout-expanded]").forEach((flyout) => {
        flyout.removeAttribute("data-flyout-expanded");
      });
      document.querySelectorAll("[data-flyout-panel]").forEach((panel) => {
        panel.setAttribute("aria-hidden", true);
        const duration = panel.parentNode.hasAttribute("data-flyout-duration") ? parseInt(panel.parentNode.getAttribute("data-flyout-duration"), 10) : 500;
        setTimeout(() => {
          panel.style.visibility = null;
          document.body.style.overflow = null;
        }, duration);
      });
      document.querySelectorAll("[data-flyout-open-trigger]").forEach((trigger) => {
        trigger.setAttribute("aria-expanded", false);
      });
      if (this.focusTargets) {
        setTimeout(() => {
          document.querySelector("[data-flyout-open-trigger]").focus();
        }, this.duration);
      }
    };
    CivicThemeFlyout.prototype.expand = function() {
      this.el.expanded = true;
      this.openTrigger.setAttribute("aria-expanded", true);
      this.panel.style.visibility = "visible";
      this.el.setAttribute("data-flyout-expanded", true);
      this.panel.setAttribute("aria-hidden", false);
      document.body.style.overflow = "hidden";
      if (this.focusTargets) {
        const focusTargets = [
          ...this.focusTargets,
          "[data-flyout-close-trigger]",
          "[data-flyout-close-all-trigger]"
        ];
        for (let i = 0; i < focusTargets.length; i++) {
          let focusElements = Array.from(this.panel.querySelectorAll(focusTargets[i]));
          focusElements = focusElements.filter((el) => el.closest("[data-flyout-panel]") === this.panel);
          if (focusElements.length > 0) {
            setTimeout(() => focusElements[0].focus(), this.duration);
            break;
          }
        }
      }
    };
    CivicThemeFlyout.prototype.collapse = function() {
      this.el.expanded = false;
      this.openTrigger.setAttribute("aria-expanded", false);
      this.el.removeAttribute("data-flyout-expanded");
      this.panel.setAttribute("aria-hidden", true);
      setTimeout(() => {
        this.panel.style.visibility = null;
        document.body.style.overflow = null;
        if (this.focusTargets) {
          this.openTrigger.focus();
        }
      }, this.duration);
    };
    document.querySelectorAll("[data-flyout]").forEach((flyout) => {
      new CivicThemeFlyout(flyout);
    });
  }
  function init2() {
    function CivicThemeLayout(el) {
      this.el = el;
      this.grid = el.querySelector(":scope > .ct-layout__inner");
      const gridStyle = getComputedStyle(this.grid);
      if (gridStyle.gridTemplateRows === "masonry" || this.grid.hasAttribute("data-masonry")) {
        return;
      }
      this.grid.setAttribute("data-masonry", true);
      this.stl = this.grid.querySelector(":scope > .ct-layout__sidebar_top_left");
      this.str = this.grid.querySelector(":scope > .ct-layout__sidebar_top_right");
      this.sbl = this.grid.querySelector(":scope > .ct-layout__sidebar_bottom_left");
      this.sbr = this.grid.querySelector(":scope > .ct-layout__sidebar_bottom_right");
      if (this.stl && this.str && this.sbl && this.sbr) {
        this.gap = parseFloat(gridStyle.gridRowGap);
        this.items = Array.from(this.grid.children);
        this.height = 0;
        this.resizeObserver = new ResizeObserver(() => {
          requestAnimationFrame(() => {
            this.masonryRedraw();
          });
        });
        this.items.forEach((item) => {
          Array.from(item.children).forEach((child) => {
            this.resizeObserver.observe(child);
          });
        });
        this.masonryRedraw();
      }
    }
    CivicThemeLayout.prototype.masonryPositionElement = function(el, aboveEl, gap) {
      const aboveChildIdx = aboveEl.children.length - 1;
      const aboveChild = aboveChildIdx >= 0 ? aboveEl.children[aboveChildIdx] : null;
      const aboveBottom = aboveChild ? aboveChild.getBoundingClientRect().bottom : aboveEl.getBoundingClientRect().top;
      const currentTop = el.getBoundingClientRect().top;
      el.style.marginTop = `${aboveBottom + gap - currentTop}px`;
    };
    CivicThemeLayout.prototype.masonryRedraw = function() {
      const newHeight = this.items.reduce((totalHeight, item) => {
        const childrenHeight = Array.from(item.children).reduce((childTotal, child) => childTotal + child.getBoundingClientRect().height, 0);
        return totalHeight + childrenHeight;
      }, 0);
      if (newHeight !== this.height) {
        this.height = newHeight;
        this.sbl.style.removeProperty("margin-top");
        this.sbr.style.removeProperty("margin-top");
        if (getComputedStyle(this.grid).getPropertyValue("--js-masonry-enabled")) {
          this.masonryPositionElement(this.sbl, this.stl, this.gap);
          this.masonryPositionElement(this.sbr, this.str, this.gap);
        }
      }
    };
    document.querySelectorAll(".ct-layout").forEach((layout) => {
      new CivicThemeLayout(layout);
    });
  }
  function init3() {
    function CivicThemePlatform(el) {
      function iOS() {
        return [
          "iPad Simulator",
          "iPhone Simulator",
          "iPod Simulator",
          "iPad",
          "iPhone",
          "iPod"
        ].includes(navigator.platform) || navigator.userAgent.includes("Mac") && "ontouchend" in document;
      }
      if (iOS()) {
        el.dataset.platform = "ios";
      }
    }
    document.querySelectorAll("[data-platform]").forEach((el) => {
      new CivicThemePlatform(el);
    });
  }
  function init4() {
    function CivicThemeResponsive() {
      const queries = this.getMediaQueries();
      for (const breakpoint in queries) {
        const query = queries[breakpoint];
        window.civicthemeResponsive = window.civicthemeResponsive || {};
        if (!(query in window.civicthemeResponsive)) {
          window.civicthemeResponsive[query] = window.matchMedia(query);
          const hasEventListener = window.civicthemeResponsive[query].addEventListener !== void 0;
          if (hasEventListener) {
            window.civicthemeResponsive[query].addEventListener("change", this.mediaQueryChange.bind(this, breakpoint));
          } else {
            window.civicthemeResponsive[query].addListener(this.mediaQueryChange.bind(this, breakpoint));
          }
        }
        this.mediaQueryChange(breakpoint, { matches: window.civicthemeResponsive[query].matches });
      }
    }
    CivicThemeResponsive.prototype.breakpoints = {
      xxs: "0px",
      xs: "368px",
      s: "576px",
      m: "768px",
      l: "992px",
      xl: "1280px",
      xxl: "1440px"
    };
    CivicThemeResponsive.prototype.getMediaQueries = function() {
      const queries = {};
      const firstBp = Object.keys(this.breakpoints)[0];
      let lastBp = firstBp;
      for (const breakpoint in this.breakpoints) {
        if (breakpoint === firstBp) {
          continue;
        }
        const min2 = this.breakpoints[lastBp];
        const max2 = `${Math.max(parseFloat(this.breakpoints[breakpoint]) - 0.02, 0)}px`;
        if (lastBp === firstBp) {
          queries[lastBp] = `screen and (max-width: ${max2})`;
        } else {
          queries[lastBp] = `screen and (min-width: ${min2}) and (max-width: ${max2})`;
        }
        lastBp = breakpoint;
      }
      queries[lastBp] = `screen and (min-width: ${this.breakpoints[lastBp]})`;
      return queries;
    };
    CivicThemeResponsive.prototype.mediaQueryChange = function(breakpoint, evt) {
      if (!evt.matches) {
        return;
      }
      window.dispatchEvent(new CustomEvent("ct-responsive", {
        bubbles: true,
        detail: {
          breakpoint,
          evaluate: CivicThemeResponsive.prototype.evaluate
        }
      }));
    };
    CivicThemeResponsive.prototype.evaluate = function(breakpointExpr, func, el) {
      if (CivicThemeResponsive.prototype.matchExpr(breakpointExpr, this.breakpoint)) {
        return new func(el);
      }
      if (typeof func.prototype.destroy !== "undefined") {
        func.prototype.destroy(el);
        return true;
      }
      return false;
    };
    CivicThemeResponsive.prototype.matchExpr = function(breakpointExpr, breakpoint) {
      const names = Object.keys(CivicThemeResponsive.prototype.breakpoints);
      const regex = `^(<|>|=|>=|<=|<>)?(${names.join("|")})$`;
      const matches = breakpointExpr.match(new RegExp(regex, "i"));
      if (!matches || matches.length < 2 || matches.length > 3) {
        return false;
      }
      const parsedOperator = matches[1] || ">=";
      const parsedBreakpoint = matches[2];
      const compFunctions = {
        ">": (parsed, current) => names.indexOf(current) > names.indexOf(parsed),
        ">=": (parsed, current) => names.indexOf(current) >= names.indexOf(parsed),
        "<": (parsed, current) => names.indexOf(current) < names.indexOf(parsed),
        "<=": (parsed, current) => names.indexOf(current) <= names.indexOf(parsed),
        "<>": (parsed, current) => names.indexOf(current) !== names.indexOf(parsed),
        "=": (parsed, current) => names.indexOf(current) === names.indexOf(parsed)
      };
      return compFunctions[parsedOperator](parsedBreakpoint, breakpoint);
    };
    if (document.querySelectorAll("[data-responsive]").length) {
      setTimeout(() => {
        new CivicThemeResponsive();
      }, 10);
    }
  }
  function init5() {
    function CivicThemeScrollspy(el) {
      if (el.getAttribute("data-scrollspy") === "true" || this.el) {
        return;
      }
      this.el = el;
      this.offset = this.el.hasAttribute("data-scrollspy-offset") ? this.el.getAttribute("data-scrollspy-offset") : null;
      document.addEventListener("scroll", CivicThemeScrollspy.prototype.scrollEvent.bind(this));
      this.el.setAttribute("data-scrollspy", "true");
    }
    CivicThemeScrollspy.prototype.scrollEvent = function() {
      if (window.scrollY > this.offset) {
        this.el.classList.add("ct-scrollspy-scrolled");
      } else {
        this.el.classList.remove("ct-scrollspy-scrolled");
      }
    };
    document.querySelectorAll("[data-scrollspy]").forEach((el) => {
      new CivicThemeScrollspy(el);
    });
  }
  function init6() {
    function CivicThemeSkipToTarget(el) {
      this.el = el;
      this.targetId = this.el.getAttribute("href");
      if (this.targetId) {
        this.targetEl = document.querySelector(this.targetId);
        this.el.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.targetEl.setAttribute("tabindex", "1");
          this.targetEl.focus();
          this.targetEl.scrollIntoView(true);
          this.targetEl.setAttribute("tabindex", "-1");
        });
      }
    }
    document.querySelectorAll("[data-skip-to-target]").forEach((el) => {
      new CivicThemeSkipToTarget(el);
    });
  }
  const behaviours = {
    civictheme_collapsible: init0,
    civictheme_flyout: init1,
    civictheme_layout: init2,
    civictheme_platform: init3,
    civictheme_responsive: init4,
    civictheme_scrollspy: init5,
    civictheme_skip_to_target: init6
  };
  function attach() {
    Object.entries(behaviours).forEach(([name, init]) => {
      try {
        init();
      } catch (error) {
        console.error("CivicTheme behaviour " + name + " failed to attach.", error);
      }
    });
  }
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    if (!window.Popper) {
      window.Popper = Popper;
    }
    if (typeof window.Drupal !== "undefined" && window.Drupal.behaviors) {
      Object.entries(behaviours).forEach(([name, init]) => {
        window.Drupal.behaviors[name] = { attach: init };
      });
    } else {
      document.addEventListener("DOMContentLoaded", attach);
      if (document.readyState !== "loading") {
        attach();
      }
    }
  }
  exports.attach = attach;
  exports.behaviours = behaviours;
  Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
  return exports;
})({});
