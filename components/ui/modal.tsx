import React from "react";
import { Modalize, ModalizeProps } from "react-native-modalize";

export interface FullScreenModalProps extends ModalizeProps {
    children: React.ReactNode;
}

export function FullScreenModal ({ children, ...props }: FullScreenModalProps) {
    return (
        <Modalize
            {...props}
            rootStyle={{ backgroundColor: "transparent" }}
            modalStyle={{ backgroundColor: "transparent" }}
        >
            {children}
        </Modalize>
    );
}


export function halfScreenModal ({ children, ...props }: FullScreenModalProps) {
    return (
        <Modalize
            {...props}
            snapPoint={0.5}
            rootStyle={{ backgroundColor: "transparent" }}
            modalStyle={{ backgroundColor: "transparent" }}
        >
            {children}
        </Modalize>
    );
}
