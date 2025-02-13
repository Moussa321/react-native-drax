import { SharedValue } from "react-native-reanimated";
import { DraxViewProps, Position } from "../types";
export declare const useDraxProtocol: (props: DraxViewProps & {
    id: string;
}, hoverPosition: SharedValue<Position>) => (scrollPositionValue?: Position) => void;
