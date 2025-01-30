"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DraxScrollView = void 0;
const react_1 = __importStar(require("react"));
const react_native_reanimated_1 = __importStar(require("react-native-reanimated"));
const DraxSubprovider_1 = require("./DraxSubprovider");
const DraxView_1 = require("./DraxView");
const hooks_1 = require("./hooks");
const params_1 = require("./params");
const types_1 = require("./types");
const DraxScrollViewUnforwarded = (props, forwardedRef) => {
    const { children, style, onContentSizeChange: onContentSizeChangeProp, scrollEventThrottle = params_1.defaultScrollEventThrottle, autoScrollIntervalLength = params_1.defaultAutoScrollIntervalLength, autoScrollJumpRatio = params_1.defaultAutoScrollJumpRatio, autoScrollBackThreshold = params_1.defaultAutoScrollBackThreshold, autoScrollForwardThreshold = params_1.defaultAutoScrollForwardThreshold, horizontal, id: idProp, ...scrollViewProps } = props;
    // Scrollable view, used for scrolling.
    const scrollRef = (0, react_native_reanimated_1.useAnimatedRef)();
    // Updates tracked scroll position when list is scrolled.
    const scrollHandler = (0, react_native_reanimated_1.useScrollViewOffset)(scrollRef);
    // Scroll position, for Drax bounds checking and auto-scrolling.
    const scrollPosition = (0, react_native_reanimated_1.useDerivedValue)(() => ({
        x: horizontal ? scrollHandler.value : 0,
        y: horizontal ? 0 : scrollHandler.value,
    }));
    // The unique identifer for this view.
    const id = (0, hooks_1.useDraxId)(idProp);
    // Container view measurements, for scrolling by percentage.
    const containerMeasurementsRef = (0, react_1.useRef)(undefined);
    // Content size, for scrolling by percentage.
    const contentSizeRef = (0, react_1.useRef)(undefined);
    // Auto-scroll state.
    const autoScrollStateRef = (0, react_1.useRef)({
        x: types_1.AutoScrollDirection.None,
        y: types_1.AutoScrollDirection.None,
    });
    // Auto-scroll interval.
    const autoScrollIntervalRef = (0, react_1.useRef)(undefined);
    // Handle auto-scrolling on interval.
    const doScroll = (0, react_1.useCallback)(() => {
        const scroll = scrollRef.current;
        const containerMeasurements = containerMeasurementsRef.current;
        const contentSize = contentSizeRef.current;
        if (!scroll || !containerMeasurements || !contentSize) {
            return;
        }
        const autoScrollState = autoScrollStateRef.current;
        const jump = {
            x: containerMeasurements.width * autoScrollJumpRatio,
            y: containerMeasurements.height * autoScrollJumpRatio,
        };
        let xNew;
        let yNew;
        if (autoScrollState.x === types_1.AutoScrollDirection.Forward) {
            const xMax = contentSize.x - containerMeasurements.width;
            if (scrollPosition.value.x < xMax) {
                xNew = Math.min(scrollPosition.value.x + jump.x, xMax);
            }
        }
        else if (autoScrollState.x === types_1.AutoScrollDirection.Back) {
            if (scrollPosition.value.x > 0) {
                xNew = Math.max(scrollPosition.value.x - jump.x, 0);
            }
        }
        if (autoScrollState.y === types_1.AutoScrollDirection.Forward) {
            const yMax = contentSize.y - containerMeasurements.height;
            if (scrollPosition.value.y < yMax) {
                yNew = Math.min(scrollPosition.value.y + jump.y, yMax);
            }
        }
        else if (autoScrollState.y === types_1.AutoScrollDirection.Back) {
            if (scrollPosition.value.y > 0) {
                yNew = Math.max(scrollPosition.value.y - jump.y, 0);
            }
        }
        if (xNew !== undefined || yNew !== undefined) {
            scroll.scrollTo({
                x: xNew ?? scrollPosition.value.x,
                y: yNew ?? scrollPosition.value.y,
            });
            scroll.flashScrollIndicators(); // ScrollView typing is missing this method
        }
    }, [
        autoScrollJumpRatio,
        scrollPosition.value.x,
        scrollPosition.value.y,
        scrollRef,
    ]);
    // Start the auto-scrolling interval.
    const startScroll = (0, react_1.useCallback)(() => {
        if (autoScrollIntervalRef.current) {
            return;
        }
        doScroll();
        autoScrollIntervalRef.current = setInterval(doScroll, autoScrollIntervalLength);
    }, [doScroll, autoScrollIntervalLength]);
    // Stop the auto-scrolling interval.
    const stopScroll = (0, react_1.useCallback)(() => {
        if (autoScrollIntervalRef.current) {
            clearInterval(autoScrollIntervalRef.current);
            autoScrollIntervalRef.current = undefined;
        }
    }, []);
    // If startScroll changes, refresh our interval.
    (0, react_1.useEffect)(() => {
        if (autoScrollIntervalRef.current) {
            stopScroll();
            startScroll();
        }
    }, [stopScroll, startScroll]);
    // Clear auto-scroll direction and stop the auto-scrolling interval.
    const resetScroll = (0, react_1.useCallback)(() => {
        const autoScrollState = autoScrollStateRef.current;
        autoScrollState.x = types_1.AutoScrollDirection.None;
        autoScrollState.y = types_1.AutoScrollDirection.None;
        stopScroll();
    }, [stopScroll]);
    // Track the size of the container view.
    const onMeasureContainer = (0, react_1.useCallback)((measurements) => {
        containerMeasurementsRef.current = measurements;
    }, []);
    // Monitor drag-over events to react with auto-scrolling.
    const onMonitorDragOver = (0, react_1.useCallback)((event) => {
        const { monitorOffsetRatio } = event;
        const autoScrollState = autoScrollStateRef.current;
        if (monitorOffsetRatio.x >= autoScrollForwardThreshold) {
            autoScrollState.x = types_1.AutoScrollDirection.Forward;
        }
        else if (monitorOffsetRatio.x <= autoScrollBackThreshold) {
            autoScrollState.x = types_1.AutoScrollDirection.Back;
        }
        else {
            autoScrollState.x = types_1.AutoScrollDirection.None;
        }
        if (monitorOffsetRatio.y >= autoScrollForwardThreshold) {
            autoScrollState.y = types_1.AutoScrollDirection.Forward;
        }
        else if (monitorOffsetRatio.y <= autoScrollBackThreshold) {
            autoScrollState.y = types_1.AutoScrollDirection.Back;
        }
        else {
            autoScrollState.y = types_1.AutoScrollDirection.None;
        }
        if (autoScrollState.x === types_1.AutoScrollDirection.None &&
            autoScrollState.y === types_1.AutoScrollDirection.None) {
            stopScroll();
        }
        else {
            startScroll();
        }
    }, [
        stopScroll,
        startScroll,
        autoScrollBackThreshold,
        autoScrollForwardThreshold,
    ]);
    // Set the ScrollView and node handle refs.
    const setScrollViewRefs = (0, react_1.useCallback)((ref) => {
        scrollRef(ref);
        if (forwardedRef) {
            if (typeof forwardedRef === "function") {
                forwardedRef(ref);
            }
            else {
                forwardedRef.current = ref;
            }
        }
    }, [forwardedRef, scrollRef]);
    // Track content size.
    const onContentSizeChange = (0, react_1.useCallback)((width, height) => {
        contentSizeRef.current = { x: width, y: height };
        return onContentSizeChangeProp?.(width, height);
    }, [onContentSizeChangeProp]);
    return id ? (react_1.default.createElement(DraxView_1.DraxView, { id: id, style: style, scrollPosition: scrollPosition, onMeasure: onMeasureContainer, onMonitorDragOver: onMonitorDragOver, onMonitorDragExit: resetScroll, onMonitorDragEnd: resetScroll, onMonitorDragDrop: resetScroll },
        react_1.default.createElement(DraxSubprovider_1.DraxSubprovider, { parent: { id, viewRef: scrollRef } },
            react_1.default.createElement(react_native_reanimated_1.default.ScrollView, { ...scrollViewProps, horizontal: horizontal, ref: setScrollViewRefs, onContentSizeChange: onContentSizeChange, scrollEventThrottle: scrollEventThrottle }, children)))) : null;
};
exports.DraxScrollView = (0, react_1.forwardRef)(DraxScrollViewUnforwarded);
