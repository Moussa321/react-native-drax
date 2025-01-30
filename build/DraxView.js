"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReanimatedView = exports.DraxView = void 0;
const react_1 = __importStar(require("react"));
const react_native_reanimated_1 = __importStar(require("react-native-reanimated"));
const PanGestureDetector_1 = require("./PanGestureDetector");
const hooks_1 = require("./hooks");
const useContent_1 = require("./hooks/useContent");
const useMeasurements_1 = require("./hooks/useMeasurements");
const params_1 = require("./params");
exports.DraxView = (0, react_1.memo)((props) => {
    // Coalesce protocol props into capabilities.
    const draggable = props.draggable ??
        (props.dragPayload !== undefined ||
            props.payload !== undefined ||
            !!props.onDrag ||
            !!props.onDragEnd ||
            !!props.onDragEnter ||
            !!props.onDragExit ||
            !!props.onDragOver ||
            !!props.onDragStart ||
            !!props.onDragDrop);
    const receptive = props.receptive ??
        (props.receiverPayload !== undefined ||
            props.payload !== undefined ||
            !!props.onReceiveDragEnter ||
            !!props.onReceiveDragExit ||
            !!props.onReceiveDragOver ||
            !!props.onReceiveDragDrop);
    const monitoring = props.monitoring ??
        (!!props.onMonitorDragStart ||
            !!props.onMonitorDragEnter ||
            !!props.onMonitorDragOver ||
            !!props.onMonitorDragExit ||
            !!props.onMonitorDragEnd ||
            !!props.onMonitorDragDrop);
    // The unique identifier for this view.
    const id = (0, hooks_1.useDraxId)(props.id);
    return (react_1.default.createElement(PanGestureDetector_1.PanGestureDetector, { id: id, draggable: draggable, longPressDelay: props.longPressDelay ?? params_1.defaultLongPressDelay },
        react_1.default.createElement(exports.ReanimatedView, { id: id, ...props, draggable: draggable, receptive: receptive, monitoring: monitoring })));
});
exports.ReanimatedView = (0, react_1.memo)((props) => {
    const hoverPosition = (0, react_native_reanimated_1.useSharedValue)({ x: 0, y: 0 });
    // Connect with Drax.
    const { updateViewProtocol, registerView, unregisterView } = (0, hooks_1.useDraxContext)();
    const { onLayout, viewRef, measureWithHandler } = (0, useMeasurements_1.useMeasurements)(props);
    const { combinedStyle, renderedChildren } = (0, useContent_1.useContent)({
        draxViewProps: { ...props, hoverPosition },
        viewRef,
    });
    (0, react_1.useEffect)(() => {
        /** 🪲BUG:
         * For some reason, the Staging zone from the ColorDragDrop example loses its measurements,
         * and we need to force refresh on them */
        measureWithHandler?.();
    }, [combinedStyle]);
    // Report updates to our protocol callbacks when we have an id and whenever the props change.
    (0, react_1.useEffect)(() => {
        updateViewProtocol({
            id: props.id,
            protocol: {
                ...props,
                hoverPosition,
                dragPayload: props.dragPayload ?? props.payload,
                receiverPayload: props.receiverPayload ?? props.payload,
            },
        });
        /** 🪲BUG:
         * Ugly hack to update hover view in case props change.
         */
        registerView({ id: "bsbsbs" });
        unregisterView({ id: "bsbsbs" });
    }, [
        updateViewProtocol,
        hoverPosition,
        props,
        registerView,
        unregisterView,
    ]);
    return (react_1.default.createElement(react_native_reanimated_1.default.View, { ...props, style: combinedStyle, ref: viewRef, onLayout: onLayout, collapsable: false }, renderedChildren));
});
