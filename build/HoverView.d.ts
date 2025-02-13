import React, { PropsWithChildren } from "react";
import { SharedValue } from "react-native-reanimated";
import { TReanimatedHoverViewProps, Position } from "./types";
export declare const HoverView: ({ children, hoverPosition, renderHoverContent, renderContent, scrollPosition, ...props }: Omit<PropsWithChildren<TReanimatedHoverViewProps>, "internalProps"> & {
    id: string;
    hoverPosition: SharedValue<Position>;
    scrollPositionOffset?: Position;
}) => React.JSX.Element | null;
