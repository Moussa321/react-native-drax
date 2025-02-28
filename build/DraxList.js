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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DraxList = void 0;
const lodash_throttle_1 = __importDefault(require("lodash.throttle"));
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const react_native_reanimated_1 = __importStar(require("react-native-reanimated"));
const DraxListItem_1 = require("./DraxListItem");
const DraxSubprovider_1 = require("./DraxSubprovider");
const DraxView_1 = require("./DraxView");
const useDraxScrollHandler_1 = require("./hooks/useDraxScrollHandler");
const params_1 = require("./params");
const types_1 = require("./types");
const DraxListUnforwarded = (props, forwardedRef) => {
    const { data, style, itemStyles, renderItemContent, renderItemHoverContent, onItemDragStart, onItemDragPositionChange, onItemDragEnd, onItemReorder, viewPropsExtractor, reorderable: reorderableProp, onScroll: onScrollProp, itemsDraggable = true, lockItemDragsToMainAxis = false, longPressDelay = params_1.defaultListItemLongPressDelay, parentDraxViewProps, monitoringExternalDragStyle, ...flatListProps } = props;
    // Copy the value of the horizontal property for internal use.
    const horizontal = flatListProps.horizontal ?? false;
    // Get the item count for internal use.
    const itemCount = data?.length ?? 0;
    // Set a sensible default for reorderable prop.
    const reorderable = reorderableProp ?? onItemReorder !== undefined;
    // Original index of the currently dragged list item, if any.
    const draggedItem = (0, react_native_reanimated_1.useSharedValue)(undefined);
    // Auto-scrolling state.
    const scrollStateRef = (0, react_1.useRef)(types_1.AutoScrollDirection.None);
    // List item measurements, for determining shift.
    const itemMeasurementsRef = (0, react_1.useRef)([]);
    const prevItemMeasurementsRef = (0, react_1.useRef)([]);
    // Drax view registrations, for remeasuring after reorder.
    const registrationsRef = (0, react_1.useRef)([]);
    // Shift offsets.
    const shiftsRef = (0, react_native_reanimated_1.useSharedValue)([]);
    const previousShiftsRef = (0, react_native_reanimated_1.useSharedValue)([]);
    // Maintain cache of reordered list indexes until data updates.
    const [originalIndexes, setOriginalIndexes] = (0, react_1.useState)([]);
    // Maintain the index the item is currently dragged to.
    const draggedToIndex = (0, react_1.useRef)(undefined);
    // Adjust measurements, registrations, and shift value arrays as item count changes.
    (0, react_1.useEffect)(() => {
        const itemMeasurements = itemMeasurementsRef.current;
        const registrations = registrationsRef.current;
        const shifts = shiftsRef.value;
        if (itemMeasurements.length > itemCount) {
            itemMeasurements.splice(itemCount - itemMeasurements.length);
        }
        else {
            while (itemMeasurements.length < itemCount) {
                itemMeasurements.push(undefined);
            }
        }
        if (registrations.length > itemCount) {
            registrations.splice(itemCount - registrations.length);
        }
        else {
            while (registrations.length < itemCount) {
                registrations.push(undefined);
            }
        }
        if (shifts.length > itemCount) {
            shifts.splice(itemCount - shifts.length);
        }
        else {
            while (shifts.length < itemCount) {
                shifts.push(0);
            }
        }
        shiftsRef.value = shifts;
    }, [itemCount]);
    // Clear reorders when data changes.
    (0, react_1.useLayoutEffect)(() => {
        // console.log('clear reorders');
        setOriginalIndexes(data ? [...Array(data.length).keys()] : []);
    }, [data]);
    // Handle auto-scrolling on interval.
    const doScroll = (0, react_1.useCallback)(() => {
        const containerMeasurements = containerMeasurementsRef.current;
        const contentSize = contentSizeRef.current;
        if (!flatListRef.current || !containerMeasurements || !contentSize) {
            return;
        }
        let containerLength;
        let contentLength;
        let prevOffset;
        if (horizontal) {
            containerLength = containerMeasurements.width;
            contentLength = contentSize.x;
            prevOffset = scrollPosition.value.x;
        }
        else {
            containerLength = containerMeasurements.height;
            contentLength = contentSize.y;
            prevOffset = scrollPosition.value.y;
        }
        const jumpLength = containerLength * 0.2;
        let offset;
        if (scrollStateRef.current === types_1.AutoScrollDirection.Forward) {
            const maxOffset = contentLength - containerLength;
            if (prevOffset < maxOffset) {
                offset = Math.min(prevOffset + jumpLength, maxOffset);
            }
        }
        else if (scrollStateRef.current === types_1.AutoScrollDirection.Back) {
            if (prevOffset > 0) {
                offset = Math.max(prevOffset - jumpLength, 0);
            }
        }
        if (offset !== undefined) {
            flatListRef.current.scrollToOffset({ offset });
            flatListRef.current.flashScrollIndicators();
        }
    }, [horizontal]);
    const { id, containerMeasurementsRef, contentSizeRef, onContentSizeChange, onMeasureContainer, onScroll, scrollRef: flatListRef, scrollPosition, setScrollRefs, startScroll, stopScroll, } = (0, useDraxScrollHandler_1.useDraxScrollHandler)({
        idProp: parentDraxViewProps?.id,
        onContentSizeChangeProp: props.onContentSizeChange,
        onScrollProp,
        forwardedRef,
        doScroll,
    });
    // Apply the reorder cache to the data.
    const reorderedData = (0, react_1.useMemo)(() => {
        // console.log('refresh sorted data');
        if (!id || !data) {
            return null;
        }
        if (data.length !== originalIndexes.length) {
            return data;
        }
        return originalIndexes.map(index => data[index]).filter(Boolean);
    }, [id, data, originalIndexes]);
    // Set the currently dragged list item.
    const setDraggedItem = (0, react_1.useCallback)((originalIndex) => {
        draggedItem.value = originalIndex;
    }, []);
    // Clear the currently dragged list item.
    const resetDraggedItem = (0, react_1.useCallback)(() => {
        draggedItem.value = undefined;
    }, []);
    // Drax view renderItem wrapper.
    const renderItem = (0, react_1.useCallback)((info) => {
        const { index, item } = info;
        const originalIndex = originalIndexes[index];
        return (react_1.default.createElement(DraxListItem_1.RenderItem, { index: index, item: item, originalIndex: originalIndex, itemStyles: itemStyles, horizontal: horizontal, longPressDelay: longPressDelay, lockItemDragsToMainAxis: lockItemDragsToMainAxis, itemsDraggable: itemsDraggable, draggedItem: draggedItem, shiftsRef: shiftsRef, itemMeasurementsRef: itemMeasurementsRef, prevItemMeasurementsRef: prevItemMeasurementsRef, resetDraggedItem: resetDraggedItem, keyExtractor: props?.keyExtractor, previousShiftsRef: previousShiftsRef, registrationsRef: registrationsRef, viewPropsExtractor: viewPropsExtractor, renderItemContent: renderItemContent, renderItemHoverContent: renderItemHoverContent, info: info, data: data }));
    }, [
        originalIndexes,
        itemStyles,
        viewPropsExtractor,
        resetDraggedItem,
        itemsDraggable,
        renderItemContent,
        renderItemHoverContent,
        longPressDelay,
        lockItemDragsToMainAxis,
        horizontal,
        draggedItem,
        shiftsRef,
        itemMeasurementsRef,
        prevItemMeasurementsRef,
        previousShiftsRef,
        registrationsRef,
        props?.keyExtractor,
        data,
    ]);
    // Reset all shift values.
    const resetShifts = (0, react_1.useCallback)(() => {
        previousShiftsRef.value = shiftsRef.value;
        prevItemMeasurementsRef.current = [...itemMeasurementsRef.current];
        shiftsRef.value = shiftsRef.value.map(() => 0);
    }, []);
    // Update shift values in response to a drag.
    const updateShifts = (0, react_1.useCallback)(({ index: fromIndex, originalIndex: fromOriginalIndex }, { index: toIndex }, dragged) => {
        const { width = 50, height = 50 } = itemMeasurementsRef.current[fromOriginalIndex] || dragged.data.hoverMeasurements || {};
        const flattenedStyles = react_native_1.StyleSheet.flatten(flatListProps.contentContainerStyle) || {};
        //@ts-ignore
        const rowGap = flattenedStyles.rowGap ?? flattenedStyles.gap ?? 0;
        const columnGap = 
        //@ts-ignore
        flattenedStyles.columnGap ?? flattenedStyles.gap ?? 0;
        const offset = horizontal ? width + columnGap : height + rowGap;
        shiftsRef.value = originalIndexes.map((originalIndex, index) => {
            const shift = shiftsRef.value[originalIndex];
            let newTargetValue = 0;
            if (index > fromIndex && index <= toIndex) {
                newTargetValue = -offset;
            }
            else if (index < fromIndex && index >= toIndex) {
                newTargetValue = offset;
            }
            if (shift !== newTargetValue) {
                return newTargetValue;
            }
            return shift;
        });
    }, [originalIndexes, horizontal]);
    // Calculate absolute position of list item for snapback.
    const calculateSnapbackTarget = (0, react_1.useCallback)(({ index: fromIndex, originalIndex: fromOriginalIndex }, { index: toIndex, originalIndex: toOriginalIndex }) => {
        const containerMeasurements = containerMeasurementsRef.current;
        const itemMeasurements = itemMeasurementsRef.current;
        if (containerMeasurements) {
            let targetPos;
            if (fromIndex < toIndex) {
                // Target pos(toIndex + 1) - pos(fromIndex)
                const nextIndex = toIndex + 1;
                let nextPos;
                if (nextIndex < itemCount) {
                    // toIndex + 1 is in the list. We can measure the position of the next item.
                    const nextMeasurements = itemMeasurements[originalIndexes[nextIndex]];
                    if (nextMeasurements) {
                        nextPos = {
                            x: nextMeasurements.x,
                            y: nextMeasurements.y,
                        };
                    }
                }
                else {
                    // toIndex is the last item of the list. We can use the list content size.
                    const contentSize = contentSizeRef.current;
                    if (contentSize) {
                        nextPos = horizontal ? { x: contentSize.x, y: 0 } : { x: 0, y: contentSize.y };
                    }
                }
                const fromMeasurements = itemMeasurements[fromOriginalIndex];
                if (nextPos && fromMeasurements) {
                    const flattenedStyles = react_native_1.StyleSheet.flatten(flatListProps.contentContainerStyle) || {};
                    //@ts-ignore
                    const rowGap = flattenedStyles.rowGap ?? flattenedStyles.gap ?? 0;
                    //@ts-ignore
                    const columnGap = flattenedStyles.columnGap ?? flattenedStyles.gap ?? 0;
                    targetPos = horizontal
                        ? {
                            x: nextPos.x - fromMeasurements.width - rowGap,
                            y: nextPos.y,
                        }
                        : {
                            x: nextPos.x,
                            y: nextPos.y - fromMeasurements.height - columnGap,
                        };
                }
            }
            else {
                // Target pos(toIndex)
                const toMeasurements = itemMeasurements[toOriginalIndex];
                if (toMeasurements) {
                    targetPos = {
                        x: toMeasurements.x,
                        y: toMeasurements.y,
                    };
                }
            }
            if (targetPos) {
                return {
                    x: containerMeasurements.x - scrollPosition.value.x + targetPos.x,
                    y: containerMeasurements.y - scrollPosition.value.y + targetPos.y,
                };
            }
        }
        return types_1.DraxSnapbackTargetPreset.None;
    }, [horizontal, itemCount, originalIndexes]);
    // Stop auto-scrolling, and potentially update shifts and reorder data.
    const handleInternalDragEnd = (0, react_1.useCallback)((eventData, totalDragEnd) => {
        // Always stop auto-scroll on drag end.
        scrollStateRef.current = types_1.AutoScrollDirection.None;
        stopScroll();
        const { dragged, receiver } = eventData;
        // Check if we need to handle this drag end.
        if (reorderable) {
            // Determine list indexes of dragged/received items, if any.
            const fromPayload = {
                /**
                 * Indexing should start from zero and stop at `itemCount - 1`, but
                 * we're also handling external drag by adding a fake item index,
                 * resulting to `itemCount`.
                 */
                index: dragged.payload.index ?? itemCount,
                originalIndex: dragged.payload.originalIndex ?? itemCount,
            };
            const isExternalDrag = !dragged.payload.originalIndex;
            const toPayload = receiver?.parentId === id ? receiver.payload : undefined;
            const { index: fromIndex, originalIndex: fromOriginalIndex } = fromPayload;
            const { index: toIndex, originalIndex: toOriginalIndex } = toPayload ?? {};
            const toItem = toOriginalIndex !== undefined ? data?.[toOriginalIndex] : undefined;
            const fromItem = data?.[fromOriginalIndex] || dragged.payload;
            isExternalDrag && resetDraggedItem();
            // Reset all shifts and call callback, regardless of whether toPayload exists.
            resetShifts();
            if (totalDragEnd) {
                onItemDragEnd?.({
                    ...eventData,
                    toIndex,
                    toItem,
                    cancelled: (0, types_1.isWithCancelledFlag)(eventData) ? eventData.cancelled : false,
                    index: fromIndex,
                    item: fromItem,
                    isExternalDrag,
                });
            }
            // Reset currently dragged over position index to undefined.
            if (draggedToIndex.current !== undefined) {
                if (!totalDragEnd) {
                    onItemDragPositionChange?.({
                        ...eventData,
                        index: fromIndex,
                        item: fromItem,
                        toIndex: undefined,
                        previousIndex: draggedToIndex.current,
                        isExternalDrag,
                    });
                }
                draggedToIndex.current = undefined;
            }
            if (toPayload !== undefined) {
                // If dragged item and received item were ours, reorder data.
                // console.log(`moving ${fromPayload.index} -> ${toPayload.index}`);
                const snapbackTarget = calculateSnapbackTarget(fromPayload, toPayload);
                if (data) {
                    const newOriginalIndexes = originalIndexes.slice();
                    newOriginalIndexes.splice(toIndex, 0, newOriginalIndexes.splice(fromIndex, 1)[0]);
                    setOriginalIndexes(newOriginalIndexes);
                    onItemReorder?.({
                        fromIndex,
                        fromItem,
                        toIndex: toIndex,
                        toItem,
                        isExternalDrag,
                    });
                }
                return snapbackTarget;
            }
        }
        return undefined;
    }, [
        id,
        data,
        stopScroll,
        reorderable,
        resetShifts,
        calculateSnapbackTarget,
        originalIndexes,
        onItemDragEnd,
        onItemDragPositionChange,
        onItemReorder,
    ]);
    // Monitor drag starts to handle callbacks.
    const onMonitorDragStart = (0, react_1.useCallback)((eventData) => {
        parentDraxViewProps?.onMonitorDragStart?.(eventData);
        const { dragged } = eventData;
        // First, check if we need to do anything.
        if (reorderable && dragged.parentId === id) {
            // One of our list items is starting to be dragged.
            const { index, originalIndex } = dragged.payload;
            setDraggedItem(originalIndex);
            onItemDragStart?.({
                ...eventData,
                index,
                item: data?.[originalIndex],
                isExternalDrag: false,
            });
        }
    }, [id, reorderable, data, setDraggedItem, onItemDragStart]);
    // Monitor drags to react with item shifts and auto-scrolling.
    const onMonitorDragOver = (0, react_1.useCallback)((eventData) => {
        parentDraxViewProps?.onMonitorDragOver?.(eventData);
        const { dragged, receiver, monitorOffsetRatio } = eventData;
        // First, check if we need to shift items.
        if (reorderable) {
            const fromPayload = {
                /**
                 * Indexing should start from zero and stop at `itemCount - 1`, but
                 * we're also handling for external drag by adding a fake item index,
                 * resulting to `itemCount`.
                 */
                index: dragged.payload.index ?? itemCount,
                originalIndex: dragged.payload.originalIndex ?? itemCount,
            };
            if (typeof draggedItem.value !== 'number')
                /** DraxList is receiving external drag  */
                setDraggedItem(itemCount);
            const fromItem = data?.[fromPayload.originalIndex] || dragged.payload;
            const isExternalDrag = !dragged.payload.originalIndex;
            // Find its current position index in the list, if any.
            const toPayload = receiver?.parentId === id ? receiver.payload : undefined;
            // Check and update currently dragged over position index.
            const toIndex = toPayload?.index;
            if (toIndex !== draggedToIndex.current) {
                onItemDragPositionChange?.({
                    ...eventData,
                    toIndex,
                    index: fromPayload.index,
                    item: fromItem,
                    previousIndex: draggedToIndex.current,
                    isExternalDrag,
                });
                draggedToIndex.current = toIndex;
            }
            // Update shift transforms for items in the list.
            updateShifts(fromPayload, toPayload ?? fromPayload, dragged);
        }
        // Next, see if we need to auto-scroll.
        const ratio = horizontal ? monitorOffsetRatio.x : monitorOffsetRatio.y;
        if (ratio > 0.1 && ratio < 0.9) {
            scrollStateRef.current = types_1.AutoScrollDirection.None;
            stopScroll();
        }
        else {
            if (ratio >= 0.9) {
                scrollStateRef.current = types_1.AutoScrollDirection.Forward;
            }
            else if (ratio <= 0.1) {
                scrollStateRef.current = types_1.AutoScrollDirection.Back;
            }
            startScroll();
        }
    }, [id, reorderable, data, updateShifts, horizontal, stopScroll, startScroll, onItemDragPositionChange]);
    // Monitor drag exits to stop scrolling, update shifts, and update draggedToIndex.
    const onMonitorDragExit = (0, react_1.useCallback)((eventData) => {
        handleInternalDragEnd(eventData, false);
        parentDraxViewProps?.onMonitorDragExit?.(eventData);
    }, [handleInternalDragEnd]);
    /*
     * Monitor drag ends to stop scrolling, update shifts, and possibly reorder.
     * This addresses the Android case where if we drag a list item and auto-scroll
     * too far, the drag gets cancelled.
     */
    const onMonitorDragEnd = (0, react_1.useCallback)((eventData) => {
        const defaultSnapbackTarget = handleInternalDragEnd(eventData, true);
        const providedSnapTarget = parentDraxViewProps?.onMonitorDragEnd?.(eventData);
        return providedSnapTarget ?? defaultSnapbackTarget;
    }, [handleInternalDragEnd]);
    // Monitor drag drops to stop scrolling, update shifts, and possibly reorder.
    const onMonitorDragDrop = (0, react_1.useCallback)((eventData) => {
        const defaultSnapbackTarget = handleInternalDragEnd(eventData, true);
        const providedSnapTarget = parentDraxViewProps?.onMonitorDragDrop?.(eventData);
        return providedSnapTarget ?? defaultSnapbackTarget;
    }, [handleInternalDragEnd]);
    const [isExternalDrag, setIsExternalDrag] = (0, react_1.useState)(false);
    const throttledSetIsExternalDrag = (0, react_1.useMemo)(() => (0, lodash_throttle_1.default)((position) => {
        setIsExternalDrag(position);
    }, 1000), []);
    (0, react_native_reanimated_1.useAnimatedReaction)(() => draggedItem.value, draggedIndex => {
        monitoringExternalDragStyle && (0, react_native_reanimated_1.runOnJS)(throttledSetIsExternalDrag)(draggedIndex === itemCount);
    });
    return (react_1.default.createElement(DraxView_1.DraxView, { ...parentDraxViewProps, style: [parentDraxViewProps?.style, isExternalDrag && monitoringExternalDragStyle], id: id, scrollPosition: scrollPosition, onMeasure: event => {
            parentDraxViewProps?.onMeasure?.(event);
            return onMeasureContainer(event);
        }, onMonitorDragStart: onMonitorDragStart, onMonitorDragOver: onMonitorDragOver, onMonitorDragExit: onMonitorDragExit, onMonitorDragEnd: onMonitorDragEnd, onMonitorDragDrop: onMonitorDragDrop },
        react_1.default.createElement(DraxSubprovider_1.DraxSubprovider, { parent: {
                id,
                viewRef: {
                    current: flatListRef?.current?.getNativeScrollRef?.(),
                },
            } },
            react_1.default.createElement(react_native_reanimated_1.default.FlatList, { ...flatListProps, style: style, ref: setScrollRefs, renderItem: renderItem, onScroll: onScroll, onContentSizeChange: onContentSizeChange, data: reorderedData }))));
};
exports.DraxList = (0, react_1.forwardRef)(DraxListUnforwarded);
