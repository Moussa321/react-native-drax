import { SharedValue } from 'react-native-reanimated';
import { DraxViewDragStatus, DraxViewProps, DraxViewReceiveStatus, Position } from '../types';
export declare const useStatus: ({ id, otherDraggingStyle, otherDraggingWithReceiverStyle, otherDraggingWithoutReceiverStyle, hoverPosition, }: DraxViewProps & {
    id: string;
    hoverPosition: SharedValue<Position>;
}) => {
    dragStatus: DraxViewDragStatus;
    receiveStatus: DraxViewReceiveStatus;
    anyReceiving: boolean;
    anyDragging: boolean;
};
