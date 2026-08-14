import React from "react";
import { Provider } from "react-redux";
import { store } from "./store/appStore";
import { Body } from "./components/layout/Body";

export const App: React.FC = () => {
    return (
        <Provider store={store}>
            <Body />
        </Provider>
    );
};

export default App;
