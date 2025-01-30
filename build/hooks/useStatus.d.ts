import { SharedValue } from "react-native-reanimated";
import { DraxViewProps, DraxViewDragStatus, DraxViewReceiveStatus, Position } from "../types";
export declare const useStatus: ({ id, otherDraggingStyle, otherDraggingWithReceiverStyle, otherDraggingWithoutReceiverStyle, hoverPosition, }: DraxViewProps & {
    id: string;
    hoverPosition: SharedValue<Position>;
}) => {
    dragStatus: DraxViewDragStatus;
    receiveStatus: DraxViewReceiveStatus;
    anyReceiving: boolean;
    anyDragging: boolean;
};
