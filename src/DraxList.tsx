import React, {
	PropsWithChildren,
	useState,
	useRef,
	useEffect,
	useCallback,
	useMemo,
	useLayoutEffect,
	ForwardedRef,
	forwardRef,
	Ref,
	ReactNode,
} from "react";
import { ListRenderItemInfo, FlatList, StyleSheet } from "react-native";
import Reanimated, {
	useAnimatedReaction,
	useAnimatedRef,
	useAnimatedScrollHandler,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";

import { DraxSubprovider } from "./DraxSubprovider";
import { DraxView } from "./DraxView";
import { useDraxId } from "./hooks";
import {
	defaultListItemLongPressDelay,
	INITIAL_REANIMATED_POSITION,
} from "./params";
import {
	DraxListProps,
	DraxMonitorEventData,
	AutoScrollDirection,
	Position,
	DraxViewMeasurements,
	DraxMonitorDragDropEventData,
	DraxMonitorEndEventData,
	DraxViewRegistration,
	DraxProtocolDragEndResponse,
	DraxSnapbackTargetPreset,
	isWithCancelledFlag,
} from "./types";

interface ListItemPayload {
	index: number;
	originalIndex: number;
}

const defaultStyles = StyleSheet.create({
	draggingStyle: { opacity: 0 },
	dragReleasedStyle: { opacity: 0.5 },
});

const DraxListUnforwarded = <T extends unknown>(
	props: PropsWithChildren<DraxListProps<T>>,
	forwardedRef: ForwardedRef<Reanimated.FlatList<T>>,
): ReactNode => {
	const {
		data: _data,
		style,
		flatListStyle,
		itemStyles,
		renderItemContent,
		renderItemHoverContent,
		onItemDragStart,
		onItemDragPositionChange,
		onItemDragEnd,
		onItemReorder,
		viewPropsExtractor,
		id: idProp,
		reorderable: reorderableProp,
		onScroll: onScrollProp,
		itemsDraggable = true,
		lockItemDragsToMainAxis = false,
		longPressDelay = defaultListItemLongPressDelay,
		...flatListProps
	} = props;

	const data = (() => {
		if (_data) {
			if ("length" in _data) {
				return _data;
			}

			return _data.value;
		}
	})();

	// Copy the value of the horizontal property for internal use.
	const horizontal = (() => {
		if (flatListProps.horizontal) {
			if (
				typeof flatListProps.horizontal !== "boolean" &&
				"value" in flatListProps.horizontal
			) {
				return flatListProps.horizontal.value ?? false;
			}
		}

		return flatListProps.horizontal ?? false;
	})();

	// Get the item count for internal use.
	const itemCount = data?.length ?? 0;

	// Set a sensible default for reorderable prop.
	const reorderable = reorderableProp ?? onItemReorder !== undefined;

	// The unique identifer for this list's Drax view.
	const id = useDraxId(idProp);

	// FlatList, used for scrolling and measuring children.
	const flatListRef = useAnimatedRef<FlatList>();

	// Container view measurements, for scrolling by percentage.
	const containerMeasurementsRef = useRef<DraxViewMeasurements | undefined>(
		undefined,
	);

	// Content size, for scrolling by percentage.
	const contentSizeRef = useRef<Position | undefined>(undefined);
	// Scroll position, for Drax bounds checking and auto-scrolling.

	const scrollPosition = useSharedValue<Position>(
		INITIAL_REANIMATED_POSITION.value,
	);

	const scrollHandler = useAnimatedScrollHandler({
		onScroll: (event) => {
			scrollPosition.value = {
				x: event.contentOffset.x,
				y: event.contentOffset.y,
			};
		},
	});

	// Original index of the currently dragged list item, if any.
	const draggedItem = useSharedValue<number | undefined>(undefined);

	// Auto-scrolling state.
	const scrollStateRef = useRef(AutoScrollDirection.None);

	// Auto-scrolling interval.
	const scrollIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

	// List item measurements, for determining shift.
	const itemMeasurementsRef = useRef<(DraxViewMeasurements | undefined)[]>(
		[],
	);

	// Drax view registrations, for remeasuring after reorder.
	const registrationsRef = useRef<(DraxViewRegistration | undefined)[]>([]);

	// Shift offsets.
	const shiftsRef = useSharedValue<number[]>([]);

	// Maintain cache of reordered list indexes until data updates.
	const [originalIndexes, setOriginalIndexes] = useState<number[]>([]);

	// Maintain the index the item is currently dragged to.
	const draggedToIndex = useRef<number | undefined>(undefined);

	// Adjust measurements, registrations, and shift value arrays as item count changes.
	useEffect(() => {
		const itemMeasurements = itemMeasurementsRef.current;
		const registrations = registrationsRef.current;
		const shifts = shiftsRef.value;
		if (itemMeasurements.length > itemCount) {
			itemMeasurements.splice(itemCount - itemMeasurements.length);
		} else {
			while (itemMeasurements.length < itemCount) {
				itemMeasurements.push(undefined);
			}
		}
		if (registrations.length > itemCount) {
			registrations.splice(itemCount - registrations.length);
		} else {
			while (registrations.length < itemCount) {
				registrations.push(undefined);
			}
		}
		if (shifts.length > itemCount) {
			shifts.splice(itemCount - shifts.length);
		} else {
			while (shifts.length < itemCount) {
				shifts.push(0);
			}
		}

		shiftsRef.value = shifts;
	}, [itemCount]);

	// Clear reorders when data changes.
	useLayoutEffect(() => {
		// console.log('clear reorders');
		setOriginalIndexes(data ? [...Array(data.length).keys()] : []);
	}, [data]);

	// Apply the reorder cache to the data.
	const reorderedData = useMemo(() => {
		// console.log('refresh sorted data');
		if (!id || !data) {
			return null;
		}
		if (data.length !== originalIndexes.length) {
			return data;
		}
		return originalIndexes.map((index) => data[index]);
	}, [id, data, originalIndexes]);

	// Set the currently dragged list item.
	const setDraggedItem = useCallback((originalIndex: number) => {
		draggedItem.value = originalIndex;
	}, []);

	// Clear the currently dragged list item.
	const resetDraggedItem = useCallback(() => {
		draggedItem.value = undefined;
	}, []);

	// Drax view renderItem wrapper.
	const renderItem = useCallback(
		(info: ListRenderItemInfo<T>) => {
			const { index, item } = info;
			const originalIndex = originalIndexes[index];
			const {
				style: itemStyle,
				draggingStyle = defaultStyles.draggingStyle,
				dragReleasedStyle = defaultStyles.dragReleasedStyle,
				...otherStyleProps
			} = itemStyles ?? {};

			const RenderItem = () => {
				const animatedValue = useSharedValue(0);

				useAnimatedReaction(
					() => shiftsRef.value,
					() => {
						const toValue = shiftsRef.value[index];

						if (typeof draggedItem.value === "number")
							animatedValue.value = withTiming(toValue, {
								duration: 200,
							});
					},
				);

				// Get shift transform for list item at index.
				const shiftTransformStyle = useAnimatedStyle(() => {
					const shift = animatedValue.value ?? 0;
					return {
						transform: horizontal
							? [{ translateX: shift }]
							: [{ translateY: shift }],
					};
				});

				return (
					<DraxView
						style={[itemStyle, shiftTransformStyle]}
						draggingStyle={draggingStyle}
						dragReleasedStyle={dragReleasedStyle}
						{...otherStyleProps}
						longPressDelay={longPressDelay}
						lockDragXPosition={
							lockItemDragsToMainAxis && !horizontal
						}
						lockDragYPosition={
							lockItemDragsToMainAxis && horizontal
						}
						draggable={itemsDraggable}
						payload={{ index, originalIndex, item: data?.[index] }}
						{...(viewPropsExtractor?.(item) ?? {})}
						onDragEnd={resetDraggedItem}
						onDragDrop={resetDraggedItem}
						onMeasure={(measurements) => {
							if (originalIndex !== undefined) {
								// console.log(`measuring [${index}, ${originalIndex}]: (${measurements?.x}, ${measurements?.y})`);
								itemMeasurementsRef.current[originalIndex] =
									measurements;
							}
						}}
						registration={(registration) => {
							if (registration && originalIndex !== undefined) {
								// console.log(`registering [${index}, ${originalIndex}], ${registration.id}`);
								registrationsRef.current[originalIndex] =
									registration;
								registration.measure();
							}
						}}
						renderContent={(contentProps) =>
							renderItemContent(info, contentProps)
						}
						renderHoverContent={
							renderItemHoverContent &&
							((hoverContentProps) =>
								renderItemHoverContent(info, hoverContentProps))
						}
					/>
				);
			};

			return <RenderItem />;
		},
		[
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
		],
	);

	// Track the size of the container view.
	const onMeasureContainer = useCallback(
		(measurements: DraxViewMeasurements | undefined) => {
			containerMeasurementsRef.current = measurements;
		},
		[],
	);

	// Track the size of the content.
	const onContentSizeChange = useCallback((width: number, height: number) => {
		contentSizeRef.current = { x: width, y: height };
	}, []);

	// Set FlatList and node handle refs.
	const setFlatListRefs = useCallback(
		(ref: any) => {
			flatListRef.current = ref;
			if (forwardedRef) {
				if (typeof forwardedRef === "function") {
					forwardedRef(ref);
				} else {
					// eslint-disable-next-line no-param-reassign
					forwardedRef.current = ref;
				}
			}
		},
		[forwardedRef],
	);

	// Handle auto-scrolling on interval.
	const doScroll = useCallback(() => {
		const containerMeasurements = containerMeasurementsRef.current;
		const contentSize = contentSizeRef.current;
		if (!flatListRef.current || !containerMeasurements || !contentSize) {
			return;
		}
		let containerLength: number;
		let contentLength: number;
		let prevOffset: number;
		if (horizontal) {
			containerLength = containerMeasurements.width;
			contentLength = contentSize.x;
			prevOffset = scrollPosition.value.x;
		} else {
			containerLength = containerMeasurements.height;
			contentLength = contentSize.y;
			prevOffset = scrollPosition.value.y;
		}
		const jumpLength = containerLength * 0.2;
		let offset: number | undefined;
		if (scrollStateRef.current === AutoScrollDirection.Forward) {
			const maxOffset = contentLength - containerLength;
			if (prevOffset < maxOffset) {
				offset = Math.min(prevOffset + jumpLength, maxOffset);
			}
		} else if (scrollStateRef.current === AutoScrollDirection.Back) {
			if (prevOffset > 0) {
				offset = Math.max(prevOffset - jumpLength, 0);
			}
		}
		if (offset !== undefined) {
			flatListRef.current.scrollToOffset({ offset });
			flatListRef.current.flashScrollIndicators();
		}
	}, [horizontal]);

	// Start the auto-scrolling interval.
	const startScroll = useCallback(() => {
		if (scrollIntervalRef.current) {
			return;
		}
		doScroll();
		scrollIntervalRef.current = setInterval(doScroll, 250);
	}, [doScroll]);

	// Stop the auto-scrolling interval.
	const stopScroll = useCallback(() => {
		if (scrollIntervalRef.current) {
			clearInterval(scrollIntervalRef.current);
			scrollIntervalRef.current = undefined;
		}
	}, []);

	// If startScroll changes, refresh our interval.
	useEffect(() => {
		if (scrollIntervalRef.current) {
			stopScroll();
			startScroll();
		}
	}, [stopScroll, startScroll]);

	// Reset all shift values.
	const resetShifts = useCallback(() => {
		shiftsRef.value = shiftsRef.value.map(() => 0);
	}, []);

	// Update shift values in response to a drag.
	const updateShifts = useCallback(
		(
			{
				index: fromIndex,
				originalIndex: fromOriginalIndex,
			}: ListItemPayload,
			{ index: toIndex }: ListItemPayload,
		) => {
			const { width = 50, height = 50 } =
				itemMeasurementsRef.current[fromOriginalIndex] ?? {};

			const offset = horizontal ? width : height;

			shiftsRef.value = originalIndexes.map((originalIndex, index) => {
				const shift = shiftsRef.value[originalIndex];
				let newTargetValue = 0;
				if (index > fromIndex && index <= toIndex) {
					newTargetValue = -offset;
				} else if (index < fromIndex && index >= toIndex) {
					newTargetValue = offset;
				}
				if (shift !== newTargetValue) {
					return newTargetValue;
					// Animated.timing(shift.animatedValue, {
					// 	duration: 200,
					// 	toValue: newTargetValue,
					// 	useNativeDriver: true,
					// }).start();
				}
				return shift;
			});
		},
		[originalIndexes, horizontal],
	);

	// Calculate absolute position of list item for snapback.
	const calculateSnapbackTarget = useCallback(
		(
			{
				index: fromIndex,
				originalIndex: fromOriginalIndex,
			}: ListItemPayload,
			{ index: toIndex, originalIndex: toOriginalIndex }: ListItemPayload,
		) => {
			const containerMeasurements = containerMeasurementsRef.current;
			const itemMeasurements = itemMeasurementsRef.current;
			if (containerMeasurements) {
				let targetPos: Position | undefined;
				if (fromIndex < toIndex) {
					// Target pos(toIndex + 1) - pos(fromIndex)
					const nextIndex = toIndex + 1;
					let nextPos: Position | undefined;
					if (nextIndex < itemCount) {
						// toIndex + 1 is in the list. We can measure the position of the next item.
						const nextMeasurements =
							itemMeasurements[originalIndexes[nextIndex]];
						if (nextMeasurements) {
							nextPos = {
								x: nextMeasurements.x,
								y: nextMeasurements.y,
							};
						}
					} else {
						// toIndex is the last item of the list. We can use the list content size.
						const contentSize = contentSizeRef.current;
						if (contentSize) {
							nextPos = horizontal
								? { x: contentSize.x, y: 0 }
								: { x: 0, y: contentSize.y };
						}
					}
					const fromMeasurements =
						itemMeasurements[fromOriginalIndex];
					if (nextPos && fromMeasurements) {
						targetPos = horizontal
							? {
									x: nextPos.x - fromMeasurements.width,
									y: nextPos.y,
								}
							: {
									x: nextPos.x,
									y: nextPos.y - fromMeasurements.height,
								};
					}
				} else {
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
						x:
							containerMeasurements.x -
							scrollPosition.value.x +
							targetPos.x,
						y:
							containerMeasurements.y -
							scrollPosition.value.y +
							targetPos.y,
					};
				}
			}
			return DraxSnapbackTargetPreset.None;
		},
		[horizontal, itemCount, originalIndexes],
	);

	// Stop auto-scrolling, and potentially update shifts and reorder data.
	const handleInternalDragEnd = useCallback(
		(
			eventData:
				| DraxMonitorEventData
				| DraxMonitorEndEventData
				| DraxMonitorDragDropEventData,
			totalDragEnd: boolean,
		): DraxProtocolDragEndResponse => {
			// Always stop auto-scroll on drag end.
			scrollStateRef.current = AutoScrollDirection.None;
			stopScroll();

			const { dragged, receiver } = eventData;

			// Check if we need to handle this drag end.
			if (reorderable && dragged.parentId === id) {
				// Determine list indexes of dragged/received items, if any.
				const fromPayload = dragged.payload as ListItemPayload;
				const toPayload =
					receiver?.parentId === id
						? (receiver.payload as ListItemPayload)
						: undefined;

				const { index: fromIndex, originalIndex: fromOriginalIndex } =
					fromPayload;
				const { index: toIndex, originalIndex: toOriginalIndex } =
					toPayload ?? {};
				const toItem =
					toOriginalIndex !== undefined
						? data?.[toOriginalIndex]
						: undefined;

				// Reset all shifts and call callback, regardless of whether toPayload exists.
				resetShifts();
				if (totalDragEnd) {
					onItemDragEnd?.({
						...eventData,
						toIndex,
						toItem,
						cancelled: isWithCancelledFlag(eventData)
							? eventData.cancelled
							: false,
						index: fromIndex,
						item: data?.[fromOriginalIndex],
					});
				}

				// Reset currently dragged over position index to undefined.
				if (draggedToIndex.current !== undefined) {
					if (!totalDragEnd) {
						onItemDragPositionChange?.({
							...eventData,
							index: fromIndex,
							item: data?.[fromOriginalIndex],
							toIndex: undefined,
							previousIndex: draggedToIndex.current,
						});
					}
					draggedToIndex.current = undefined;
				}

				if (toPayload !== undefined) {
					// If dragged item and received item were ours, reorder data.
					// console.log(`moving ${fromPayload.index} -> ${toPayload.index}`);
					const snapbackTarget = calculateSnapbackTarget(
						fromPayload,
						toPayload,
					);
					if (data) {
						const newOriginalIndexes = originalIndexes.slice();
						newOriginalIndexes.splice(
							toIndex!,
							0,
							newOriginalIndexes.splice(fromIndex, 1)[0],
						);
						setOriginalIndexes(newOriginalIndexes);
						onItemReorder?.({
							fromIndex,
							fromItem: data[fromOriginalIndex],
							toIndex: toIndex!,
							toItem: data[toOriginalIndex!],
						});
					}
					return snapbackTarget;
				}
			}

			return undefined;
		},
		[
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
		],
	);

	// Monitor drag starts to handle callbacks.
	const onMonitorDragStart = useCallback(
		(eventData: DraxMonitorEventData) => {
			const { dragged } = eventData;
			// First, check if we need to do anything.
			if (reorderable && dragged.parentId === id) {
				// One of our list items is starting to be dragged.
				const { index, originalIndex }: ListItemPayload =
					dragged.payload;
				setDraggedItem(originalIndex);
				onItemDragStart?.({
					...eventData,
					index,
					item: data?.[originalIndex],
				});
			}
		},
		[id, reorderable, data, setDraggedItem, onItemDragStart],
	);

	// Monitor drags to react with item shifts and auto-scrolling.
	const onMonitorDragOver = useCallback(
		(eventData: DraxMonitorEventData) => {
			const { dragged, receiver, monitorOffsetRatio } = eventData;
			// First, check if we need to shift items.
			if (reorderable && dragged.parentId === id) {
				// One of our list items is being dragged.
				const fromPayload: ListItemPayload = dragged.payload;

				// Find its current position index in the list, if any.
				const toPayload: ListItemPayload | undefined =
					receiver?.parentId === id ? receiver.payload : undefined;

				// Check and update currently dragged over position index.
				const toIndex = toPayload?.index;
				if (toIndex !== draggedToIndex.current) {
					onItemDragPositionChange?.({
						...eventData,
						toIndex,
						index: fromPayload.index,
						item: data?.[fromPayload.originalIndex],
						previousIndex: draggedToIndex.current,
					});
					draggedToIndex.current = toIndex;
				}

				// Update shift transforms for items in the list.
				updateShifts(fromPayload, toPayload ?? fromPayload);
			}

			// Next, see if we need to auto-scroll.
			const ratio = horizontal
				? monitorOffsetRatio.x
				: monitorOffsetRatio.y;
			if (ratio > 0.1 && ratio < 0.9) {
				scrollStateRef.current = AutoScrollDirection.None;
				stopScroll();
			} else {
				if (ratio >= 0.9) {
					scrollStateRef.current = AutoScrollDirection.Forward;
				} else if (ratio <= 0.1) {
					scrollStateRef.current = AutoScrollDirection.Back;
				}
				startScroll();
			}
		},
		[
			id,
			reorderable,
			data,
			updateShifts,
			horizontal,
			stopScroll,
			startScroll,
			onItemDragPositionChange,
		],
	);

	// Monitor drag exits to stop scrolling, update shifts, and update draggedToIndex.
	const onMonitorDragExit = useCallback(
		(eventData: DraxMonitorEventData) =>
			handleInternalDragEnd(eventData, false),
		[handleInternalDragEnd],
	);

	/*
	 * Monitor drag ends to stop scrolling, update shifts, and possibly reorder.
	 * This addresses the Android case where if we drag a list item and auto-scroll
	 * too far, the drag gets cancelled.
	 */
	const onMonitorDragEnd = useCallback(
		(eventData: DraxMonitorEndEventData) =>
			handleInternalDragEnd(eventData, true),
		[handleInternalDragEnd],
	);

	// Monitor drag drops to stop scrolling, update shifts, and possibly reorder.
	const onMonitorDragDrop = useCallback(
		(eventData: DraxMonitorDragDropEventData) =>
			handleInternalDragEnd(eventData, true),
		[handleInternalDragEnd],
	);

	return (
		<DraxView
			id={id}
			style={style}
			scrollPosition={scrollPosition}
			onMeasure={onMeasureContainer}
			onMonitorDragStart={onMonitorDragStart}
			onMonitorDragOver={onMonitorDragOver}
			onMonitorDragExit={onMonitorDragExit}
			onMonitorDragEnd={onMonitorDragEnd}
			onMonitorDragDrop={onMonitorDragDrop}
		>
			<DraxSubprovider
				parent={{
					id,
					viewRef: {
						//@ts-ignore
						current: flatListRef?.current?.getNativeScrollRef?.(),
					},
				}}
			>
				<Reanimated.FlatList
					{...flatListProps}
					style={flatListStyle}
					ref={setFlatListRefs}
					renderItem={renderItem}
					onScroll={scrollHandler}
					// onScroll={(ev) => {
					// 	scrollHandler(ev);
					// 	if (onScrollProp) {
					// 		if ("value" in onScrollProp) {
					// 			onScrollProp?.value?.(ev);
					// 		} else {
					// 			onScrollProp(ev);
					// 		}
					// 	}
					// }}
					onContentSizeChange={onContentSizeChange}
					data={reorderedData}
				/>
			</DraxSubprovider>
		</DraxView>
	);
};

/*
 * We are using a type assertion to work around the loss of our generic
 * typing when forwarding the ref. See option 1 in this article:
 * https://fettblog.eu/typescript-react-generic-forward-refs/
 */
type DraxListType = <T extends unknown>(
	props: PropsWithChildren<DraxListProps<T>> & { ref?: Ref<FlatList> },
) => ReactNode;

export const DraxList = forwardRef(DraxListUnforwarded) as DraxListType;
