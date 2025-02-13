"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDraxScrollHandler = void 0;
const react_1 = require("react");
const react_native_reanimated_1 = require("react-native-reanimated");
const params_1 = require("../params");
const useDraxId_1 = require("./useDraxId");
const useDraxScrollHandler = ({ idProp, onContentSizeChangeProp, onScrollProp, forwardedRef, doScroll, }) => {
    // Scrollable view, used for scrolling.
    const scrollRef = (0, react_native_reanimated_1.useAnimatedRef)();
    // The unique identifer for this view.
    const id = (0, useDraxId_1.useDraxId)(idProp);
    // Container view measurements, for scrolling by percentage.
    const containerMeasurementsRef = (0, react_1.useRef)(undefined);
    // Auto-scrolling interval.
    const scrollIntervalRef = (0, react_1.useRef)(undefined);
    // Content size, for scrolling by percentage.
    const contentSizeRef = (0, react_1.useRef)(undefined);
    const scrollPosition = (0, react_native_reanimated_1.useSharedValue)(params_1.INITIAL_REANIMATED_POSITION.value);
    // Track the size of the container view.
    const onMeasureContainer = (0, react_1.useCallback)((measurements) => {
        containerMeasurementsRef.current = measurements;
    }, []);
    // Track content size.
    const onContentSizeChange = (0, react_1.useCallback)((width, height) => {
        contentSizeRef.current = { x: width, y: height };
        return onContentSizeChangeProp?.(width, height);
    }, [onContentSizeChangeProp]);
    // Update tracked scroll position when list is scrolled.
    const onScroll = (0, react_1.useCallback)((event) => {
        onScrollProp?.(event);
        (0, react_native_reanimated_1.runOnUI)((_event) => {
            scrollPosition.value = {
                x: _event.contentOffset.x,
                y: _event.contentOffset.y,
            };
        })(event.nativeEvent);
    }, [onScrollProp]);
    // Set the ScrollView/FlatList refs.
    const setScrollRefs = (0, react_1.useCallback)((ref) => {
        if (ref) {
            scrollRef(ref);
            if (forwardedRef) {
                if (typeof forwardedRef === "function") {
                    forwardedRef(ref);
                }
                else {
                    forwardedRef.current = ref;
                }
            }
        }
    }, [forwardedRef, scrollRef]);
    // Start the auto-scrolling interval.
    const startScroll = (0, react_1.useCallback)(() => {
        if (scrollIntervalRef.current) {
            return;
        }
        doScroll();
        scrollIntervalRef.current = setInterval(doScroll, 250);
    }, [doScroll]);
    // Stop the auto-scrolling interval.
    const stopScroll = (0, react_1.useCallback)(() => {
        if (scrollIntervalRef.current) {
            clearInterval(scrollIntervalRef.current);
            scrollIntervalRef.current = undefined;
        }
    }, []);
    // If startScroll changes, refresh our interval.
    (0, react_1.useEffect)(() => {
        if (scrollIntervalRef.current) {
            stopScroll();
            startScroll();
        }
    }, [stopScroll, startScroll]);
    return {
        id,
        containerMeasurementsRef,
        contentSizeRef,
        onContentSizeChange,
        onMeasureContainer,
        onScroll,
        scrollRef,
        scrollPosition,
        setScrollRefs,
        startScroll,
        stopScroll,
    };
};
exports.useDraxScrollHandler = useDraxScrollHandler;
