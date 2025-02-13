"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMeasurements = void 0;
const react_1 = require("react");
const react_native_1 = require("react-native");
const react_native_reanimated_1 = require("react-native-reanimated");
const useDraxContext_1 = require("./useDraxContext");
const useMeasurements = ({ onMeasure, registration, id, parent: parentProp, scrollPosition, ...props }) => {
    // The underlying View, for measuring and for subprovider nesting if this is a Drax parent view.
    const viewRef = (0, react_native_reanimated_1.useAnimatedRef)();
    // This view's measurements, for reference.
    const measurementsRef = (0, react_1.useRef)(undefined);
    // Connect with Drax.
    const { updateViewMeasurements, parent: contextParent, registerView, unregisterView, rootViewRef, getAbsoluteViewData, } = (0, useDraxContext_1.useDraxContext)();
    // Identify Drax parent view (if any) from context or prop override.
    const parent = parentProp ?? contextParent;
    const parentId = parent?.id;
    // Identify parent view ref.
    const parentViewRef = parent ? parent.viewRef : rootViewRef;
    // Register and unregister with Drax context when necessary.
    (0, react_1.useEffect)(() => {
        registerView({ id, parentId, scrollPosition });
        // Unregister when we unmount or id changes.
        return () => unregisterView({ id });
    }, [id, parentId, scrollPosition, registerView, unregisterView]);
    // Build a callback which will report our measurements to Drax context,
    // onMeasure, and an optional measurement handler.
    const buildMeasureCallback = (0, react_1.useCallback)((measurementHandler) => (x, y, width, height) => {
        const parentData = getAbsoluteViewData(parent?.id);
        /** @todo Remove workaround for the web */
        const webOffset = react_native_1.Platform.select({
            web: {
                x: parentData?.scrollPosition?.value.x || 0,
                y: parentData?.scrollPosition?.value.y || 0,
            },
            default: {
                x: 0,
                y: 0,
            },
        });
        /*
         * In certain cases (on Android), all of these values can be
         * undefined when the view is not on screen; This should not
         * happen with the measurement functions we're using, but just
         * for the sake of paranoia, we'll check and use undefined
         * for the entire measurements object.
         */
        const measurements = height === undefined
            ? undefined
            : {
                height,
                x: x + webOffset.x,
                y: y + webOffset.y,
                width: width,
            };
        measurementsRef.current = measurements;
        updateViewMeasurements({ id, measurements });
        onMeasure?.(measurements);
        measurementHandler?.(measurements);
    }, [updateViewMeasurements, id, onMeasure]);
    // Callback which will report our measurements to Drax context and onMeasure.
    const updateMeasurements = (0, react_1.useMemo)(() => buildMeasureCallback(), [buildMeasureCallback]);
    // Measure and report our measurements to Drax context, onMeasure, and an
    // optional measurement handler on demand.
    const measureWithHandler = (0, react_1.useCallback)((measurementHandler) => {
        const view = viewRef.current;
        if (view) {
            if (parentViewRef.current) {
                const measureCallback = measurementHandler
                    ? buildMeasureCallback(measurementHandler)
                    : updateMeasurements;
                // console.log('definitely measuring in reference to something');
                view.measureLayout(
                // @ts-ignore
                parentViewRef.current, measureCallback, () => {
                    // console.log('Failed to measure Drax view in relation to parent nodeHandle');
                });
            }
            else {
                // console.log('No parent nodeHandle to measure Drax view in relation to');
            }
        }
        else {
            // console.log('No view to measure');
        }
    }, [viewRef, parentViewRef, buildMeasureCallback, updateMeasurements]);
    // Measure and send our measurements to Drax context and onMeasure, used when this view finishes layout.
    const onLayout = (0, react_1.useCallback)(() => {
        // console.log(`onLayout ${id}`);
        measureWithHandler();
    }, [measureWithHandler]);
    // Establish dimensions/orientation change handler when necessary.
    (0, react_1.useEffect)(() => {
        const handler = ( /* { screen: { width, height } }: { screen: ScaledSize } */) => {
            // console.log(`Dimensions changed to ${width}/${height}`);
            setTimeout(measureWithHandler, 100);
        };
        const listener = react_native_1.Dimensions.addEventListener("change", handler);
        return () => listener.remove();
    }, [measureWithHandler]);
    // Register and unregister externally when necessary.
    (0, react_1.useEffect)(() => {
        if (registration) {
            // Register externally when registration is set.
            registration({
                id,
                measure: measureWithHandler,
            });
            return () => registration(undefined); // Unregister when we unmount or registration changes.
        }
        return undefined;
    }, [id, measureWithHandler, registration]);
    return {
        onLayout,
        viewRef,
    };
};
exports.useMeasurements = useMeasurements;
