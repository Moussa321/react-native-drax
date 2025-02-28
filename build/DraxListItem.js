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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderItem = void 0;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const react_native_reanimated_1 = require("react-native-reanimated");
const DraxView_1 = require("./DraxView");
const defaultStyles = react_native_1.StyleSheet.create({
    draggingStyle: { opacity: 0 },
    dragReleasedStyle: { opacity: 0.5 },
});
const RenderItemComponent = ({ index, item, originalIndex, itemStyles, horizontal, longPressDelay, lockItemDragsToMainAxis, itemsDraggable, draggedItem, shiftsRef, itemMeasurementsRef, prevItemMeasurementsRef, resetDraggedItem, keyExtractor, previousShiftsRef, registrationsRef, viewPropsExtractor, renderItemContent, renderItemHoverContent, info, data, }) => {
    const { style: itemStyle, draggingStyle = defaultStyles.draggingStyle, dragReleasedStyle = defaultStyles.dragReleasedStyle, ...otherStyleProps } = itemStyles ?? {};
    const animatedValue = (0, react_native_reanimated_1.useSharedValue)(0);
    const itemKey = (item && keyExtractor?.(item, index)) ?? item?.key ?? item?.id;
    (0, react_native_reanimated_1.useAnimatedReaction)(() => [shiftsRef.value], ([shiftsRef]) => {
        const toValue = shiftsRef[index];
        const isDragging = typeof draggedItem.value === 'number';
        if (isDragging) {
            animatedValue.value = (0, react_native_reanimated_1.withTiming)(toValue, {
                duration: 200,
            });
        }
    });
    (0, react_1.useLayoutEffect)(() => {
        /** Reset the shift when the item moves to a new index. */
        animatedValue.value = 0;
    }, [index]);
    const shiftTransformStyle = (0, react_native_reanimated_1.useAnimatedStyle)(() => {
        const shift = animatedValue.value ?? 0;
        return {
            transform: horizontal ? [{ translateX: shift }] : [{ translateY: shift }],
        };
    });
    (0, react_1.useLayoutEffect)(() => {
        const measurements = itemMeasurementsRef.current[originalIndex];
        const previousMeasurementsIndex = prevItemMeasurementsRef.current.findIndex(item => item?.key === itemKey);
        const previousMeasurements = prevItemMeasurementsRef.current[previousMeasurementsIndex];
        const isLayoutShifted = previousShiftsRef.value.some(Boolean);
        if (previousMeasurements && measurements && !isLayoutShifted) {
            const offset = horizontal
                ? previousMeasurements.x - measurements.x
                : previousMeasurements.y - measurements.y;
            animatedValue.value = offset;
            animatedValue.value = (0, react_native_reanimated_1.withSpring)(0, {
                damping: 20,
                stiffness: 90,
            });
        }
    }, [itemKey, originalIndex, horizontal, itemMeasurementsRef, prevItemMeasurementsRef, previousShiftsRef]);
    return (react_1.default.createElement(DraxView_1.DraxView, { style: [itemStyle, shiftTransformStyle], draggingStyle: draggingStyle, dragReleasedStyle: dragReleasedStyle, ...otherStyleProps, longPressDelay: longPressDelay, lockDragXPosition: lockItemDragsToMainAxis && !horizontal, lockDragYPosition: lockItemDragsToMainAxis && horizontal, draggable: itemsDraggable, payload: { index, originalIndex, item: data?.[index] }, ...(viewPropsExtractor?.(item) ?? {}), onDragEnd: resetDraggedItem, onDragDrop: resetDraggedItem, onMeasure: measurements => {
            if (originalIndex !== undefined && measurements) {
                /**
                 * @todo 🪲 BUG
                 * @platform web
                 * @summary Somehow the measurements for the same item are getting duplicated.
                 */
                // Clear any duplicate measurements
                const duplicateIndex = itemMeasurementsRef.current.findIndex((item, idx) => idx !== originalIndex && item?.key === itemKey);
                if (duplicateIndex !== -1) {
                    itemMeasurementsRef.current[duplicateIndex] = undefined;
                }
                // Store the new measurement
                itemMeasurementsRef.current[originalIndex] = {
                    ...measurements,
                    key: itemKey,
                };
            }
        }, registration: registration => {
            if (registration && originalIndex !== undefined) {
                // console.log(`registering [${index}, ${originalIndex}], ${registration.id}`);
                registrationsRef.current[originalIndex] = registration;
                registration.measure();
            }
        }, renderContent: props => renderItemContent(info, props), renderHoverContent: renderItemHoverContent && (props => renderItemHoverContent(info, props)) }));
};
exports.RenderItem = (0, react_1.memo)(RenderItemComponent);
