import Reanimated from "react-native-reanimated";
import { DraxViewProps } from "../types";
export declare const useMeasurements: ({ onMeasure, registration, id, parent: parentProp, scrollPosition, ...props }: DraxViewProps & {
    id: string;
}) => {
    onLayout: () => void;
    viewRef: import("react-native-reanimated").AnimatedRef<Reanimated.View>;
};
