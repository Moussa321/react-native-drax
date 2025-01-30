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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReanimatedHoverView = void 0;
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const react_native_reanimated_1 = __importStar(require("react-native-reanimated"));
const hooks_1 = require("./hooks");
const math_1 = require("./math");
const types_1 = require("./types");
const useContent_1 = require("./hooks/useContent");
const ReanimatedHoverView = ({ children, hoverPosition, renderHoverContent, renderContent, scrollPosition, ...props }) => {
    const { parentPosition, getAbsoluteViewData, startPosition, getTrackingDragged, } = (0, hooks_1.useDraxContext)();
    const viewData = getAbsoluteViewData(props.id);
    const draggedId = getTrackingDragged()?.id;
    const id = props.id;
    const absoluteMeasurements = viewData?.absoluteMeasurements;
    (0, react_native_reanimated_1.useAnimatedReaction)(() => parentPosition.value, (position) => {
        id &&
            draggedId === id &&
            (0, math_1.updateHoverPosition)(position, hoverPosition, startPosition, props, scrollPosition, absoluteMeasurements);
    });
    const { combinedStyle, animatedHoverStyle, renderedChildren, dragStatus } = (0, useContent_1.useContent)({
        draxViewProps: {
            children,
            hoverPosition,
            renderHoverContent,
            renderContent,
            scrollPosition,
            ...props,
        },
    });
    if (!(props.draggable && !props.noHover)) {
        return null;
    }
    if (dragStatus === types_1.DraxViewDragStatus.Inactive ||
        typeof dragStatus === "undefined") {
        return null;
    }
    return (react_1.default.createElement(react_native_reanimated_1.default.View, { ...props, style: [react_native_1.StyleSheet.absoluteFill, combinedStyle, animatedHoverStyle], pointerEvents: "none" }, renderedChildren));
};
exports.ReanimatedHoverView = ReanimatedHoverView;
