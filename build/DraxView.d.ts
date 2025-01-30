import React, { ReactNode } from "react";
import { DraxViewProps } from "./types";
export declare const DraxView: React.MemoExoticComponent<(props: DraxViewProps) => ReactNode>;
interface IReanimatedView extends DraxViewProps {
    id: string;
}
export declare const ReanimatedView: React.MemoExoticComponent<(props: IReanimatedView) => JSX.Element>;
export {};
