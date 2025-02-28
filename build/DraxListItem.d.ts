import React, { MutableRefObject } from 'react';
import { ListRenderItemInfo } from 'react-native';
import { SharedValue } from 'react-native-reanimated';
import { DraxListProps, DraxListRenderItemContent, DraxListRenderItemHoverContent, DraxViewMeasurements, DraxViewProps, DraxViewRegistration, DraxViewStyleProps } from './types';
interface RenderItemProps<T extends unknown> {
    index: number;
    item: T;
    originalIndex: number;
    itemStyles?: DraxViewStyleProps;
    horizontal: boolean;
    longPressDelay: number;
    lockItemDragsToMainAxis: boolean;
    itemsDraggable: boolean;
    draggedItem: SharedValue<number | undefined>;
    shiftsRef: SharedValue<number[]>;
    itemMeasurementsRef: MutableRefObject<((DraxViewMeasurements & {
        key?: string;
    }) | undefined)[]>;
    prevItemMeasurementsRef: MutableRefObject<((DraxViewMeasurements & {
        key?: string;
    }) | undefined)[]>;
    resetDraggedItem: () => void;
    keyExtractor?: (item: T, index: number) => string;
    previousShiftsRef: SharedValue<number[]>;
    registrationsRef: MutableRefObject<(DraxViewRegistration | undefined)[]>;
    viewPropsExtractor?: (item: T) => Partial<DraxViewProps>;
    renderItemContent: DraxListRenderItemContent<T>;
    renderItemHoverContent?: DraxListRenderItemHoverContent<T>;
    info: ListRenderItemInfo<T>;
    data: DraxListProps<T>['data'];
}
declare const RenderItemComponent: <T extends unknown>({ index, item, originalIndex, itemStyles, horizontal, longPressDelay, lockItemDragsToMainAxis, itemsDraggable, draggedItem, shiftsRef, itemMeasurementsRef, prevItemMeasurementsRef, resetDraggedItem, keyExtractor, previousShiftsRef, registrationsRef, viewPropsExtractor, renderItemContent, renderItemHoverContent, info, data, }: RenderItemProps<T>) => React.JSX.Element;
export declare const RenderItem: typeof RenderItemComponent;
export {};
