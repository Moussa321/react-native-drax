"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDraxProtocol = void 0;
const react_1 = require("react");
const react_native_reanimated_1 = require("react-native-reanimated");
const useDraxContext_1 = require("./useDraxContext");
const useDraxProtocol = (props, hoverPosition) => {
    // Connect with Drax.
    const { updateViewProtocol } = (0, useDraxContext_1.useDraxContext)();
    const _scrollPosition = (0, react_native_reanimated_1.useSharedValue)({ x: 0, y: 0 });
    const scrollPosition = props.scrollPosition || _scrollPosition;
    const updateViewProtocolCallback = (0, react_1.useCallback)((scrollPositionValue) => {
        const dragPayload = props.dragPayload ?? props.payload;
        const receiverPayload = props.receiverPayload ?? props.payload;
        // Pass the event up to the Drax context.
        updateViewProtocol({
            id: props.id,
            protocol: {
                ...props,
                hoverPosition,
                dragPayload,
                receiverPayload,
                scrollPositionValue,
            },
        });
    }, [updateViewProtocol, props, hoverPosition]);
    (0, react_native_reanimated_1.useAnimatedReaction)(() => scrollPosition?.value, (scrollPositionValue) => {
        (0, react_native_reanimated_1.runOnJS)(updateViewProtocolCallback)(scrollPositionValue);
    });
    return updateViewProtocolCallback;
};
exports.useDraxProtocol = useDraxProtocol;
