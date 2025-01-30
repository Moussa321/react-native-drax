import { PropsWithChildren, Ref, ReactNode } from "react";
import { FlatList } from "react-native";
import { DraxListProps } from "./types";
type DraxListType = <T extends unknown>(props: PropsWithChildren<DraxListProps<T>> & {
    ref?: Ref<FlatList>;
}) => ReactNode;
export declare const DraxList: DraxListType;
export {};
