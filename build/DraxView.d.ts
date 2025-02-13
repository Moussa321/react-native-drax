import React, { ReactNode } from "react";
import { DraxViewProps } from "./types";
export declare const DraxView: React.MemoExoticComponent<(props: DraxViewProps) => ReactNode>;
type IReanimatedView = DraxViewProps & {
    id: string;
};
export declare const DraxReanimatedView: React.MemoExoticComponent<(props: IReanimatedView) => ReactNode>;
export {};
