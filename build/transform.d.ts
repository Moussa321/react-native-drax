import { PropsWithChildren } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { AnimatedStyle, StyleProps } from "react-native-reanimated";
import { AnimatedViewStyleWithoutLayout, DraxViewDragStatus, TReanimatedHoverViewProps, ViewDimensions } from "./types";
export declare const flattenStylesWithoutLayout: (styles: (StyleProps | StyleProp<ViewStyle> | StyleProp<AnimatedStyle<StyleProp<ViewStyle>>> | null)[]) => AnimatedViewStyleWithoutLayout;
export declare const getCombinedHoverStyle: ({ dragStatus, anyReceiving, dimensions, }: {
    dimensions: ViewDimensions;
    dragStatus: DraxViewDragStatus;
    anyReceiving: boolean;
}, props: Partial<PropsWithChildren<TReanimatedHoverViewProps>>) => AnimatedViewStyleWithoutLayout;
