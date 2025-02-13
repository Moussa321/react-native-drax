import React from "react";
import Reanimated, { AnimatedRef, SharedValue } from "react-native-reanimated";
import { DraxViewDragStatus, DraxViewProps, Position } from "../types";
export declare const useContent: ({ draxViewProps: { id, style, dragInactiveStyle, draggingStyle, draggingWithReceiverStyle, draggingWithoutReceiverStyle, dragReleasedStyle, otherDraggingStyle, otherDraggingWithReceiverStyle, otherDraggingWithoutReceiverStyle, receiverInactiveStyle, receivingStyle, children, renderContent, renderHoverContent, isParent, scrollPositionOffset, ...props }, viewRef, }: {
    draxViewProps: DraxViewProps & {
        id: string;
        hoverPosition: SharedValue<Position>;
        scrollPositionOffset?: Position;
    };
    viewRef?: AnimatedRef<Reanimated.View>;
}) => {
    renderedChildren: React.ReactNode;
    combinedStyle: any;
    animatedHoverStyle: {
        opacity?: undefined;
        transform?: undefined;
    } | {
        opacity: number;
        transform: any[];
    };
    dragStatus: DraxViewDragStatus;
};
