'use client'

import { FC } from "react";
import { NextUIProvider } from "@nextui-org/react";
import { Web3Modal } from './Web3Modal';

const Providers: FC<any> = ({ children }) => {
    return (
        <NextUIProvider>
            <Web3Modal>
                {children}
            </Web3Modal>
        </NextUIProvider>
    );
};

export default Providers;

