import Reanimated from "react-native-reanimated";
import { DraxViewProps, DraxViewMeasurements, DraxViewMeasurementHandler } from "../types";
export declare const useMeasurements: ({ onMeasure, registration, id, parent: parentProp, scrollPosition, ...props }: DraxViewProps & {
    id: string;
}) => {
    onLayout: () => void;
    viewRef: import("react-native-reanimated").AnimatedRef<Reanimated.View>;
    parentViewRef: import("react").RefObject<import("react-native").View | import("react-native").FlatList<any> | import("react-native").ScrollView | null>;
    measurementsRef: import("react").MutableRefObject<DraxViewMeasurements | undefined>;
    measureWithHandler: (measurementHandler?: DraxViewMeasurementHandler) => void;
};
