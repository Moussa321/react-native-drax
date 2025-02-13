import { ForwardedRef } from "react";
import { FlatList, NativeScrollEvent, NativeSyntheticEvent, ScrollView } from "react-native";
import { DraxListProps, DraxViewMeasurements, Position } from "../types";
type DraxScrollHandlerArgs<T> = {
    idProp?: string;
    onContentSizeChangeProp?: DraxListProps<T>["onContentSizeChange"];
    onScrollProp: DraxListProps<any>["onScroll"];
    forwardedRef?: ForwardedRef<any>;
    doScroll: () => void;
};
type ScrollableComponents = FlatList<any> | ScrollView;
export declare const useDraxScrollHandler: <T extends ScrollableComponents>({ idProp, onContentSizeChangeProp, onScrollProp, forwardedRef, doScroll, }: DraxScrollHandlerArgs<T>) => {
    id: string;
    containerMeasurementsRef: import("react").MutableRefObject<DraxViewMeasurements | undefined>;
    contentSizeRef: import("react").MutableRefObject<Position | undefined>;
    onContentSizeChange: (width: number, height: number) => void | undefined;
    onMeasureContainer: (measurements: DraxViewMeasurements | undefined) => void;
    onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    scrollRef: import("react-native-reanimated").AnimatedRef<T>;
    scrollPosition: import("react-native-reanimated").SharedValue<Position>;
    setScrollRefs: (ref: T | null) => void;
    startScroll: () => void;
    stopScroll: () => void;
};
export {};
