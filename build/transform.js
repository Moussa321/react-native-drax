"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCombinedHoverStyle = exports.flattenStylesWithoutLayout = void 0;
const react_native_1 = require("react-native");
const types_1 = require("./types");
const flattenStylesWithoutLayout = (styles) => {
    const { margin, marginHorizontal, marginVertical, marginLeft, marginRight, marginTop, marginBottom, marginStart, marginEnd, left, right, top, bottom, flex, flexBasis, flexDirection, flexGrow, flexShrink, ...flattened } = react_native_1.StyleSheet.flatten(styles);
    return flattened;
};
exports.flattenStylesWithoutLayout = flattenStylesWithoutLayout;
// Combine hover styles for given internal render props.
const getCombinedHoverStyle = ({ dragStatus, anyReceiving, dimensions, }, props) => {
    // Start with base style, calculated dimensions, and hover base style.
    const hoverStyles = [props?.style, dimensions, props?.hoverStyle];
    // Apply style style overrides based on state.
    if (dragStatus === types_1.DraxViewDragStatus.Dragging) {
        hoverStyles.push(props?.hoverDraggingStyle);
        if (anyReceiving) {
            hoverStyles.push(props?.hoverDraggingWithReceiverStyle);
        }
        else {
            hoverStyles.push(props?.hoverDraggingWithoutReceiverStyle);
        }
    }
    else if (dragStatus === types_1.DraxViewDragStatus.Released) {
        hoverStyles.push(props?.hoverDragReleasedStyle);
    }
    // Remove any layout styles.
    const flattenedHoverStyle = (0, exports.flattenStylesWithoutLayout)(hoverStyles);
    return flattenedHoverStyle;
};
exports.getCombinedHoverStyle = getCombinedHoverStyle;
