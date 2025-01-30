"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useStatus = void 0;
const react_1 = require("react");
const react_native_reanimated_1 = require("react-native-reanimated");
const useDraxContext_1 = require("./useDraxContext");
const types_1 = require("../types");
const useStatus = ({ id, otherDraggingStyle, otherDraggingWithReceiverStyle, otherDraggingWithoutReceiverStyle, hoverPosition, }) => {
    const [dragStatus, setDragSatatus] = (0, react_1.useState)(types_1.DraxViewDragStatus.Inactive);
    const [receiveStatus, setReceiveStatus] = (0, react_1.useState)(types_1.DraxViewReceiveStatus.Inactive);
    const [anyReceiving, setAnyReceiving] = (0, react_1.useState)(false);
    const [anyDragging, setAnyDragging] = (0, react_1.useState)(false);
    // Connect with Drax.
    const { getTrackingDragged, parentPosition, getReleaseViews } = (0, useDraxContext_1.useDraxContext)();
    const updateState = (0, react_1.useCallback)((position) => {
        const dragged = getTrackingDragged();
        const releaseViews = getReleaseViews();
        if (position.x === 0 && position.y === 0) {
            setDragSatatus(types_1.DraxViewDragStatus.Inactive);
            setAnyReceiving(false);
        }
        else if (releaseViews?.includes(id)) {
            setDragSatatus(types_1.DraxViewDragStatus.Released);
        }
        else if (dragged) {
            if (dragged?.id === id) {
                setDragSatatus(types_1.DraxViewDragStatus.Dragging);
            }
            else {
                setDragSatatus(types_1.DraxViewDragStatus.Inactive);
            }
            if (otherDraggingStyle ||
                otherDraggingWithReceiverStyle ||
                otherDraggingWithoutReceiverStyle) {
                setAnyDragging(true);
            }
        }
        else {
            setAnyDragging(false);
            setDragSatatus(types_1.DraxViewDragStatus.Inactive);
        }
    }, [
        getReleaseViews,
        getTrackingDragged,
        id,
        otherDraggingStyle,
        otherDraggingWithReceiverStyle,
        otherDraggingWithoutReceiverStyle,
    ]);
    (0, react_native_reanimated_1.useAnimatedReaction)(() => hoverPosition.value, (position) => {
        (0, react_native_reanimated_1.runOnJS)(updateState)(position);
    });
    const updateReceivingState = (0, react_1.useCallback)((position) => {
        const dragged = getTrackingDragged();
        if (position.x === 0 && position.y === 0) {
            setReceiveStatus(types_1.DraxViewReceiveStatus.Inactive);
            setAnyReceiving(false);
        }
        else if (dragged) {
            if (dragged?.tracking.receiver) {
                if (dragged?.tracking.receiver?.receiverId === id) {
                    setReceiveStatus(types_1.DraxViewReceiveStatus.Receiving);
                }
                else {
                    setReceiveStatus(types_1.DraxViewReceiveStatus.Inactive);
                }
                if (otherDraggingWithReceiverStyle) {
                    setAnyReceiving(true);
                }
            }
            else {
                setAnyReceiving(false);
                setReceiveStatus(types_1.DraxViewReceiveStatus.Inactive);
            }
        }
        else {
            setReceiveStatus(types_1.DraxViewReceiveStatus.Inactive);
            setAnyReceiving(false);
        }
    }, [getTrackingDragged, id, otherDraggingWithReceiverStyle]);
    (0, react_native_reanimated_1.useAnimatedReaction)(() => parentPosition.value, (position) => {
        (0, react_native_reanimated_1.runOnJS)(updateReceivingState)(position);
    });
    const status = (0, react_1.useMemo)(() => ({
        dragStatus,
        receiveStatus,
        anyReceiving,
        anyDragging,
    }), [anyDragging, anyReceiving, dragStatus, receiveStatus]);
    return status;
};
exports.useStatus = useStatus;
